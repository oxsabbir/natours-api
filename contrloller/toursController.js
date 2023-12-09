const Tour = require('../model/tourModel');

const APIFeature = require('../utils/apiFeatures');

const AppError = require('../utils/AppError');

const catchAsync = require('../utils/catchAsync');
// 2 ROUTE HANDLER

exports.getAllTour = catchAsync(async (req, res, next) => {
  // const quryObject = { ...req.query };
  // const excludedItem = ['limit', 'page', 'sort', 'fields'];
  // excludedItem.forEach((el) => delete quryObject[el]);

  // // Filtering in advance for less then greater then
  // let queryStr = JSON.stringify(quryObject);
  // queryStr = queryStr.replace(
  //   /\b(gte|gt|lte|lt)\b/g,
  //   (matchValue) => `$${matchValue}`,
  // );

  // // BUILDING QUERY
  // let query = Tour.find(JSON.parse(queryStr));

  // // SORTING METHOD
  // if (req.query.sort) {
  //   const dataOfSort = req.query.sort.split(',').join(' ');
  //   query = query.sort(dataOfSort);
  // }
  // // With some of the field
  // if (req.query.fields) {
  //   let dataOfField = req.query.fields.split(',').join(' ');
  //   query = query.select(dataOfField);
  // } else {
  //   query = query.select('-__v');
  // }

  // // with some pagination
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 100;
  // const skipper = (page - 1) * limit;

  // if (req.query.page) {
  //   query = query.skip(skipper).limit(limit);
  // }

  // EXECUTING QUERY
  const features = new APIFeature(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const allTours = await features.query;

  // SENDING RESPONSE
  res.status(200).json({
    status: 'success',
    results: allTours.length,
    data: {
      tours: allTours,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('There is not tour found with provied ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('There is not tour found with provied ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  // const singleTour = await Tour.findOne({ _id: `${id}` });
  const singleTour = await Tour.findById(id);

  if (!singleTour) {
    return next(new AppError('There is not tour found with provied ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: singleTour,
    },
  });
});

exports.addTour = catchAsync(async (req, res) => {
  // const createTours = await Tour.create(req.body);
  const tourData = await Tour.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      tour: tourData,
    },
  });
});

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    { $match: { ratingAverage: { $gte: 4.5 } } },
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
      $unwind: '$startsDate',
    },
    {
      $match: {
        startsDate: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startsDate' },
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
