const express = require('express');
const tourController = require('./../controllers/tourController');

// If we want to separate the resources for routes and route handlers, we have to have one separate router for each of our resources.
// Each router is kind of a mini sub application one for each resource.
const router = express.Router();

// param middleware : middleware that only runs for certain parameters. so when we have a certain parameter in our url.
// since this middleware is only specified on this router, well then of course it is only part of the middleware stack if we are actually inside of this sub application.
// using the concept of param middleware, we are going to perform this check here in a outside middleware that is going to run before the request even hits the handler functions.
// router.param('id', tourController.checkID);

// Create a checkbody middleware
// Check if body contains the name and price property
// If not, send back 400 (bad request)
// Add it to the post handler stack

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
