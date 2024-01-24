const express = require('express');

const reviewController = require('../contrloller/reviewController');
const authController = require('../contrloller/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    authController.protect,
    authController.ristrictTo('user'),
    reviewController.addUserAndTour,
    reviewController.createNewReview,
  )
  .get(authController.protect, reviewController.getAllReview);

router.route('/:id').delete(reviewController.deleteReview);
router.route('/:id').patch(reviewController.updateReview);

module.exports = router;
