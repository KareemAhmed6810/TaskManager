const express = require('express');
const authController = require('./../controller/authentication');
const taskController  = require('./../controller/taskController');
const router = express.Router();
router
  .route('/')
  .get(authController.protection, taskController.getAllTasks)
  .post(authController.protection, taskController.createTask);
router.get('/shared', taskController.getAllShared);
router
  .route('/:id')
    .get(authController.protection, taskController.getTask)
  .patch(authController.protection, taskController.updateTask)
  .delete(authController.protection, taskController.deleteTask);

module.exports = router;
