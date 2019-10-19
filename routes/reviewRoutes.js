const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// In order to get access to that parameter(:tourId) in this other router we basically need to merge the parameters.
const router = express.Router({ mergeParams: true });

// POST /tour/234fad4/reviews
// POST /reviews

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
