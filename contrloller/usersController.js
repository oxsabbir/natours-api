const sharp = require('sharp');
const multer = require('multer');

const User = require('../model/userModel');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const factory = require('./factoryHandler');

const filterBody = function (body, ...allowedProps) {
  const newBody = {};
  Object.keys(body).forEach((item) => {
    if (allowedProps.includes(item)) newBody[item] = body[item];
  });
  return newBody;
};

// IN this way we can directly save our file in filesystem

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// IN this we are saving our data in memory and process it before saving to filesystem
// when we use memory buffer we get our file in req.file.buffer
const multerStorage = multer.memoryStorage();

const fileFilter = function (req, file, cb) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload images.', 400));
  }
};

const uplaod = multer({
  storage: multerStorage,
  fileFilter,
});

// process image before savign
exports.resizeUserPhoto = catchAsync(async function (req, res, next) {
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

// upload image
exports.uploadUserPhoto = uplaod.single('photo');

// user handler
exports.getAllUser = factory.getAll(User);

exports.updateMe = catchAsync(async function (req, res, next) {
  // check if user want to change the password
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'You can not update password here! please visit here /updatePassword',
      ),
    );
  }

  if (req.file) {
    req.body.photo = req.file.filename;
  }
  const filteredData = filterBody(req.body, 'name', 'email', 'photo');

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
exports.getMe = function (req, res, next) {
  req.params.id = req.user._id;
  next();
};

exports.getUser = factory.getOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'For creating new account please visit: /signup',
  });
};

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
