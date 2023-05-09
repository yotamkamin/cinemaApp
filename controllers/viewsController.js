const Movie = require('../models/movieModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const movies = await Movie.find();

  //   // 2) Build template
  //   // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Movies',
    movies,
  });
});

exports.getMovie = catchAsync(async (req, res, next) => {
  const movie = await Movie.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!movie) {
    return next(new AppError('There is no movie with that name', 404));
  }
  res.status(200).render('movie', {
    title: 'The Forest Hiker Movie',
    movie,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Log into your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyMovies = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const movieIds = bookings.map(el => el.movie);
  const movies = await Movie.find({ _id: { $in: movieIds } });

  res.status(200).render('overview', {
    title: 'My Movies',
    movies,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updateUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updateUser,
  });
});
