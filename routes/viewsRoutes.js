const express = require('express');
const viewsController = require('../contrloller/viewsController');
const authController = require('../contrloller/authController');
const bookingController = require('../contrloller/bookingController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.get(
  '/',
  bookingController.createBookingCheckout,
  viewsController.getOverview,
);
router.get('/tour/:slug', viewsController.getTour);

router.get('/me', authController.protect, viewsController.getMe);
router.get('/my-tours', authController.protect, viewsController.getMyBookings);

// LOGIN AND SIGN UP ROUTE

router.get('/login', viewsController.getLogin);
router.get('/logout', authController.logout);

module.exports = router;
