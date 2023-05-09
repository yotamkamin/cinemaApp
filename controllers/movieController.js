const multer = require('multer');
const sharp = require('sharp');
const Movie = require('./../models/movieModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  //test if file is an image
  if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadMovieMedia = upload.fields([
  { name: 'poster', maxCount: 1 },
  // { name: 'trailer', maxCount: 1 },
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeMovieMedia = catchAsync(async (req, res, next) => {
  console.log(req.files);
  if (!req.files.poster || !req.files.imageCover || !req.files.images)
    return next();
  // 1) Cover image
  req.body.imageCover = `movie-${req.params.id}-${Date.now()}-cover.png`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(1500, 800)
    .toFormat('png')
    .png({ quality: 90 })
    .toFile(`public/img/movies/${req.body.imageCover}`);

  // 2) Poster
  req.body.poster = `movie-${req.params.id}-${Date.now()}-poster.png`;
  await sharp(req.files.poster[0].buffer)
    .resize(300, 500)
    .toFormat('png')
    .png({ quality: 90 })
    .toFile(`public/img/movies/${req.body.poster}`);
  //- 3) Trailer ???
  // req.body.trailer = `movie-${req.params.id}-${Date.now()}-trailer.mp4`;
  // await sharp(req.files.trailer[0].buffer).toFile(
  //   `public/img/movies/${req.body.trailer}`
  // );
  // 4) Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `movie-${req.params.id}-${Date.now()}-${i + 1}.png`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('png')
        .png({ quality: 90 })
        .toFile(`public/img/movies/${filename}`);

      req.body.images.push(filename);
    })
  );
  // console.log(req.body[images]);
  next();
});

exports.aliasTopMovies = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = '-ratingsAverage';
  req.query.fields = 'title, genre, ratingsAverage, plot';
  next();
};

exports.aliasTopCheapMovies = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = 'ticketPrice';
  req.query.fields = 'title, genre, plot, ticketPrice';
  next();
};

exports.getAllMovies = factory.getAll(Movie);
exports.getMovie = factory.getOne(Movie, { path: 'reviews' });
exports.createMovie = factory.createOne(Movie);
exports.updateMovie = factory.updateOne(Movie);
exports.deleteMovie = factory.deleteOne(Movie);

exports.getMovieStats = catchAsync(async (req, res, next) => {
  const stats = await Movie.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.0 } },
    },
    {
      $group: {
        _id: '$rated',
        numMovies: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        minRating: { $min: '$ratingsAverage' },
        maxRating: { $max: '$ratingsAverage' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Movie.aggregate([
    {
      $unwind: '$showDates',
    },
    {
      $match: {
        showDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$showDates' },
        numMoviesShows: { $sum: 1 },
        movies: { $push: '$title' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numMoviesShows: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});
