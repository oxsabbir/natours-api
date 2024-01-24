const Review = require('../model/reviewModel');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/AppError');

const factory = require('./factoryHandler');

exports.addUserAndTour = function (req, res, next) {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;

  next();
};

exports.getAllReview = factory.getAll(Review);
exports.createNewReview = factory.createNew(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
