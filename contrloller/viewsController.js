const Tour = require('../model/tourModel');
const catchAsync = require('../utils/catchAsync');
const Booking = require('../model/bookingModel');

const AppError = require('../utils/AppError');

exports.getOverview = catchAsync(async function (req, res, next) {
  const tours = await Tour.find();
  if (!tours) return next(new AppError('No tour found in the database', 404));

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getMe = function (req, res, next) {
  res.status(200).render('account', {
    title: 'Profile',
    user: req.user,
  });
};

exports.getMyBookings = catchAsync(async function (req, res, next) {
  // get the tour-id using the user id
  const booking = await Booking.find({ user: req.user._id });
  const tourids = booking.map((item) => item.tour._id);
  // get all tours using tour-id array
  const tours = await Tour.find({ _id: { $in: tourids } });

  res.render('overview', {
    title: 'My tour',
    tours,
  });
});

exports.getTour = catchAsync(async function (req, res, next) {
  const { slug } = req.params;
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) return next(new AppError('No tour found with that name', 404));

  res.status(200).render('tours', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLogin = function (req, res) {
  res.status(200).render('login');
};
