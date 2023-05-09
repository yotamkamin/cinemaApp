const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel');
const Movie = require('../models/movieModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked movie
  const movie = await Movie.findById(req.params.movieId);
  //   console.log(movie);
  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/?movie=${
    //   req.params.movieId
    // }&user=${req.user.id}&price=${movie.price}`,
    success_url: `${req.protocol}://${req.get('host')}/?movie=${
      req.params.movieId
    }&user=${req.user.id}&price=${movie.ticketPrice}`,
    cancel_url: `${req.protocol}://${req.get('host')}/movie/${movie.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.movieId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: `${movie.ticketPrice}` * 100,
          product_data: {
            name: `${movie.name} Movie`,
            description: movie.plot,
            images: [
              // `${req.protocol}://${req.get('host')}/api/v1/movies/${movie.poster}`,
              `https://templates.designwizard.com/591423b0-adb5-11eb-bfe7-5d1ec617370d.jpg`,
            ],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });
  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //! TEMPORARY / UNSECURE
  const { movie, user, price } = req.query;
  if (!movie && !user && !price) return next();
  await Booking.create({ movie, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
