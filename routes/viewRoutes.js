const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/movie/:slug', authController.isLoggedIn, viewsController.getMovie);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', viewsController.getSignupForm);
// router.get('/forgotPassword', viewsController.getResetPasswordForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-movies', authController.protect, viewsController.getMyMovies);
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

// router.post(
//   '/submit-user-data',
//   authController.protect,
//   viewsController.updateUserData
// );
// router.get(
//   '/',
//   bookingController.createBookingCheckout,
//   authController.isLoggedIn,
//   viewsController.getOverview
// );
// router.get('/movie/:slug', authController.isLoggedIn, viewsController.getMovie);
// router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);

// router.get('/me', authController.protect, viewsController.getAccount);
// router.get('/my-movies', authController.protect, viewsController.getMyMovies);

// router.post(
//   '/submit-user-data',
//   authController.protect,
//   viewsController.updateUserData
// );

// router.get('/signup', viewsController.getSignupForm);

module.exports = router;
