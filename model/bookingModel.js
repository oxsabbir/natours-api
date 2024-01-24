const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    require: [true, 'A booking must have a Tour'],
    ref: 'Tour',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    require: [true, 'A booking must have a User'],
    ref: 'User',
  },
  price: {
    type: Number,
    require: [true, 'A booking must a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });

  next();
});

const bookingModel = mongoose.model('Booking', bookingSchema);

module.exports = bookingModel;
