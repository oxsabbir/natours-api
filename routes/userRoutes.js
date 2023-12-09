const express = require('express');

const usersController = require('../contrloller/usersController');

const router = express.Router();

router
  .route('/')
  .get(usersController.getAllUser)
  .post(usersController.createUser);
router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
