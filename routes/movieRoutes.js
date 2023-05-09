const express = require('express');
const movieController = require('./../controllers/movieController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
const router = express.Router();

// router.param('id', movieController.checkID);

router.use('/:movieId/reviews', reviewRouter);

router
  .route('/top-3')
  .get(movieController.aliasTopMovies, movieController.getAllMovies);

router
  .route('/top-3-cheap')
  .get(movieController.aliasTopCheapMovies, movieController.getAllMovies);

router.route('/movie-stats').get(movieController.getMovieStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    movieController.getMonthlyPlan
  );

router
  .route('/')
  .get(movieController.getAllMovies)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    movieController.createMovie
  );
router
  .route('/:id')
  .get(movieController.getMovie)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    movieController.uploadMovieMedia,
    movieController.resizeMovieMedia,
    movieController.updateMovie
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    movieController.deleteMovie
  );

// router
//   .route('/:movieId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

module.exports = router;
