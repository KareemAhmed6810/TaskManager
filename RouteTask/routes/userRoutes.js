const authController = require('./../controller/authentication');
const userController = require('./../controller/userController');
const express = require('express');
const router = express.Router();
router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updatePassword',
  authController.protection,
  authController.updatePassword
);
router.patch('/updateME', authController.protection,userController.updateMe);
router.delete('/deleteMe', authController.protection,userController.deleteMe);

module.exports = router;
