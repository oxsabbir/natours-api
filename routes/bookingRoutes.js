const express = require('express');
const bookingController = require('../contrloller/bookingController');
const authController = require('../contrloller/authController');

const router = express.Router();

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession,
);

module.exports = router;
