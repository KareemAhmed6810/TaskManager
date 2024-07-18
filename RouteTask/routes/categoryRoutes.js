const express = require('express');
const authController = require('./../controller/authentication');
const categoryController = require('./../controller/categoryController');
const router = express.Router();

router
  .route('/')
  .get(authController.protection, categoryController.getAllCategories)
  .post(authController.protection, categoryController.createCategory);
router
  .route('/:id')
  .get(authController.protection, categoryController.getCategory)
  .patch(authController.protection, categoryController.updateCategory)
  .delete(authController.protection, categoryController.deleteCategory);
module.exports = router;
