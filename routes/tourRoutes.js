const express = require('express');
const toursController = require('../contrloller/toursController');
const authController = require('../contrloller/authController');

const router = express.Router();
// router.param('id', toursController.checkId);

router
  .route('/')
  .get(authController.protect, toursController.getAllTour)
  .post(toursController.addTour);

router.route('/tour-stats').get(toursController.getTourStats);
router.route('/monthly-plan/:year').get(toursController.getMonthlyPlan);

router
  .route('/:id')
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(
    authController.protect,
    authController.ristrictTo('admin', 'lead'),
    toursController.deleteTour,
  );

module.exports = router;
