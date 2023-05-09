const mongoose = require('mongoose');
const Movie = require('./movieModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    movie: {
      type: mongoose.Schema.ObjectId,
      ref: 'Movie',
      required: [true, 'Review must belong to a movie.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ movie: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'movie',
  //   select: 'title',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (id) {
  const stats = await this.aggregate([
    {
      $match: { movie: id },
    },
    {
      $group: {
        _id: '$movie',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Movie.findByIdAndUpdate(id, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Movie.findByIdAndUpdate(id, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.movie);
});

reviewSchema.pre(/^findOnedAnd/, async function (next) {
  const r = await this.findOne();
  // console.log(r);
  next();
});

reviewSchema.post(/^findOnedAnd/, async function () {
  await this.r.calcAverageRatings(this.r.movie);
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
