const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

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

// aliasing
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

// aggregation pipeline: mathcing and grouping
router.route('/tour-stats').get(tourController.getTourStats);
// aggregation pipeline: unwinding and projecting
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(/*tourController.checkBody, */ tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
// GET /tour/234fad4/reviews/94887fda

router
  .route('/:tourid/reviews')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
