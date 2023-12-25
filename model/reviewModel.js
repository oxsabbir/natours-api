const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review can not be empty'],
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'A review must need a tour'],
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A review must need a User'],
  },
});

// populating user and tours when we query some data using query middleware

reviewSchema.pre(
  /^find/,
  function (next) {
    this.populate({
      path: 'user',
      select: '-__v -passwordChangedAt',
    });
    next();
  },

  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const reviewModel = mongoose.model('Review', reviewSchema);

module.exports = reviewModel;
