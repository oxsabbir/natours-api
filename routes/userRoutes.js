const express = require('express');

const usersController = require('../contrloller/usersController');

const authController = require('../contrloller/authController');

const router = express.Router();

// for creating new user
router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);

router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updateMe', authController.protect, usersController.updateMe);

router.delete('/deleteMe', authController.protect, usersController.deleteMe);

router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword,
);

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
