const User = require('../model/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const filterBody = function (body, ...allowedProps) {
  const newBody = {};
  Object.keys(body).forEach((item) => {
    if (allowedProps.includes(item)) newBody[item] = body[item];
  });
  return newBody;
};

// user handler
exports.getAllUser = catchAsync(async (req, res) => {
  const userData = await User.find();
  res.status(200).json({
    status: 'success',
    results: userData.length,
    data: {
      users: userData,
    },
  });
});

exports.updateMe = catchAsync(async function (req, res, next) {
  // check if user want to change the password
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'You can not update password here! please visit here /updatePassword',
      ),
    );
  }

  const filteredData = filterBody(req.body, 'name', 'email');

  // find the user and update filtered data
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredData, {
    new: true,
    runValidators: true,
  });

  // send user data as response
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async function (req, res, next) {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    stauts: 'success',
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This is not defined yet',
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This is not defined yet',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This is not defined yet',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This is not defined yet',
  });
};
