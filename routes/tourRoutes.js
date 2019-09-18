const express = require('express');
const tourController = require('./../controllers/tourController');

// If we want to separate the resources for routes and route handlers, we have to have one separate router for each of our resources.
const router = express.Router();

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
