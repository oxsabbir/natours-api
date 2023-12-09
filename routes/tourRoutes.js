const express = require('express');
const toursController = require('../contrloller/toursController');

const router = express.Router();

// router.param('id', toursController.checkId);

router.route('/').get(toursController.getAllTour).post(toursController.addTour);

router.route('/tour-stats').get(toursController.getTourStats);
router.route('/monthly-plan/:year').get(toursController.getMonthlyPlan);

router
  .route('/:id')
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(toursController.deleteTour);

module.exports = router;
