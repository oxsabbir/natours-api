const multer = require('multer');

const sharp = require('sharp');

const Tour = require('../model/tourModel');
const AppError = require('../utils/AppError');
// const APIFeature = require('../utils/apiFeatures');
// const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const factory = require('./factoryHandler');

// setting storage for multer
const multerStorage = multer.memoryStorage();

const fileFilter = function (req, file, cb) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload images.', 400));
  }
};

// 2 ROUTE HANDLER

// uploading image to update tours image

exports.uploadTourImage = multer({
  storage: multerStorage,
  fileFilter,
}).fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);

// Now proccessing and uploading to the filesystem

exports.resizeTourImage = catchAsync(async function (req, res, next) {
  // uploading the cover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // uploading tour image
  const filePath = [];

  Promise.all(
    req.files.images.map(async (files, i) => {
      let fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      filePath.push(fileName);
      await sharp(files.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);
      // return this;
    }),
  );

  req.body.images = filePath;

  next();
});

exports.getAllTour = factory.getAll(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.updateTour = factory.updateOne(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.addTour = factory.createNew(Tour);

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: '$difficulty',
        totalTour: { $sum: 1 },
        totalCostOfAllTrip: { $sum: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        totalRating: { $sum: '$ratingQuantiy' },
      },
    },
    {
      $sort: { maxPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      tour: stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;

  const monthlyStats = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numOfTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numOfTours: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      results: monthlyStats.length,
      tour: monthlyStats,
    },
  });
});

exports.getTourWithin = catchAsync(async function (req, res, next) {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(new AppError('Please provive location coordinates', 404));
  }

  const tour = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tour.length,
    data: {
      tours: tour,
    },
  });
});

exports.getDistance = catchAsync(async function (req, res, next) {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(new AppError('Please provive location coordinates', 404));
  }

  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distance,
    },
  });
});
