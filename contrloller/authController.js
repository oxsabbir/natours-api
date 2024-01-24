const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');

const Email = require('../utils/sendEmail');

const signUpToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendToken = function (res, token, user) {
  const option = {
    status: 'success',
    token,
  };

  if (user) {
    option.data = {
      user: user,
    };
  }
  // sending cookie over http

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    HttpOnly: true,
  });

  res.status(201).json(option);
};

exports.signup = catchAsync(async function (req, res, next) {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    ConfirmPassword: req.body.ConfirmPassword,
    photo: req.body.photo || undefined,
    passwordChangedAt: req.body.passwordChangedAt || undefined,
    // role: req.body.role || undefined,
  });

  // implementing jwt for user creation
  const token = signUpToken(newUser._id);
  console.log(newUser);

  await new Email(
    req.body,
    `${req.protocol}://${req.hostname}:3000/me`,
  ).sendWelcome();

  sendToken(res, token, newUser);

  // sending a welcome email
});

exports.isLoggedIn = async function (req, res, next) {
  let token;
  // 1 get the token if it's in request or not
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  /// getting token from cookies
  else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // 2 validate token

  if (!token) return next();

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3 check if  that user  exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }
    // 4 check if user changed password after token being issued
    const isPassChangedAfter = currentUser.changedPasswordCheck(decoded.iat);
    if (isPassChangedAfter) {
      return next();
    }
    // GRANTING THE PERMISSION TO ACCESS PROTECTED ROUTE. if everything goes well
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (er) {
    return next();
  }
};

exports.logout = function (req, res, next) {
  res.cookie('jwt', 'logout-token', {
    expires: new Date(Date.now() + 2 * 1000),
    HttpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

exports.login = catchAsync(async function (req, res, next) {
  const { email, password } = req.body;

  // check if email and password exist
  if (!email || !password) {
    return next(
      new AppError('Please provide email and password to login.', 400),
    );
  }
  // check user exist in the databse and check the password
  const userInfo = await User.findOne({ email: email }).select('+password');

  if (
    !userInfo ||
    !(await userInfo.correctPassword(password, userInfo.password))
  ) {
    return next(new AppError('Incorrect email or password.'));
  }

  // if all goes well genarate and and send the token back to the client
  const token = signUpToken(userInfo._id);

  sendToken(res, token);
});

exports.protect = catchAsync(async function (req, res, next) {
  let token;
  // 1 get the token if it's in request or not
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) token = req.cookies.jwt;

  if (!token) {
    return next(new AppError('Please login first to get access.', 401));
  }
  // 2 validate token
  console.log(await jwt.verify(token, process.env.JWT_SECRET));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3 check if  that user  exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('There is no user belongs to this token.', 401));
  }
  // 4 check if user changed password after token being issued
  const isPassChangedAfter = currentUser.changedPasswordCheck(decoded.iat);
  if (isPassChangedAfter) {
    return next(
      new AppError('Password has changed recently. Please login again.', 401),
    );
  }
  // GRANTING THE PERMISSION TO ACCESS PROTECTED ROUTE. if everything goes well
  req.user = currentUser;
  next();
});

exports.ristrictTo = function (...role) {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new AppError(
          `You don't have to permission to perform this action`,
          403,
        ),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async function (req, res, next) {
  // get and check user email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user found using this email', 404));
  }

  try {
    // genarate resetToken
    const resetToken = user.createPasswordResetToken();
    user.save({ validateBeforeSave: false });
    // sending the email with that token
    const url = `${req.protocol}://${req.hostname}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, url).sendForgotPassword();
  } catch (err) {
    user.passwordExpiresIn = undefined;
    user.passwordResetToken = undefined;

    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending email. try again later.'),
    );
  }

  // sending a success resposne if everything okay
  res.status(200).json({
    status: 'success',
    message: 'Token sent!',
  });
});

exports.resetPassword = catchAsync(async function (req, res, next) {
  // get the token and find the user
  const recoveredToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: recoveredToken,
    passwordExpiresIn: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid reset token or time expires.', 400));
  }
  // change the password
  user.password = req.body.password;
  user.ConfirmPassword = req.body.ConfirmPassword;
  // change passwordChangedAt property

  user.passwordResetToken = undefined;
  user.passwordExpiresIn = undefined;

  await user.save();

  // send jwt for login
  const loginToken = signUpToken(user._id);

  sendToken(res, loginToken);
});

exports.updatePassword = catchAsync(async function (req, res, next) {
  // checking if all the password is given of not
  if (
    !req.body.oldPassword ||
    !req.body.newPassword ||
    !req.body.confirmPassword
  )
    return next(
      new AppError(
        'You must provide old password and a new password to update password',
      ),
    );

  // get user from request if authenticated
  const user = await User.findById(req.user._id).select('+password');

  const isPasswordCorrect = await user.correctPassword(
    req.body.oldPassword,
    user.password,
  );
  // getting old password and checking it for verifiaction

  if (!isPasswordCorrect)
    return next(new AppError('Old password is not correct', 400));

  // setting new password
  user.password = req.body.newPassword;
  user.ConfirmPassword = req.body.confirmPassword;

  await user.save();

  /// login in if everything correct
  const token = signUpToken(user._id);

  sendToken(res, token);
});
