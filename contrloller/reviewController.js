const Review = require('../model/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const factory = require('./factoryHandler');

exports.createNewReview = catchAsync(async function (req, res, next) {
  // get data from body
  const bodyData = req.body;

  if (!bodyData) return next(new AppError('Review can not be empty', 400));
  if (!req.body.tour) bodyData.tour = req.params.tourId;
  if (!req.body.user) bodyData.user = req.user._id;

  // save data to db
  const newReview = await Review.create(bodyData);
  // return data as res
  res.status(200).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

exports.getAllReview = catchAsync(async function (req, res, next) {
  let filter = {};
  if (req.params.tourId) filter.tour = req.params.tourId;

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      review: reviews,
    },
  });
});

exports.deleteReview = factory.deleteOne(Review);
