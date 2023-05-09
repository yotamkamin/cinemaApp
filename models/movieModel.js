const mongoose = require('mongoose');
const slugify = require('slugify');

// const User = require('./userModel');
// const validator = require('validator');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A movie must have a title'],
      unique: true,
      trim: true,
      maxlength: [60, 'A movie title must have less or equal 60 characters'],
      minlength: [2, 'A movie title must have more or equal 2 characters'],
      // validate: [
      //   validator.isAlphanumeric,
      //   'Movie title must only contain letters and numbers (a-zA-Z0-9)',
      // ],
    },
    slug: String,
    rated: {
      type: String,
      required: [true, 'A movie must be rated'],
      enum: {
        values: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
        message: 'Rated options are: G, PG, PG-13, R, NC-17',
      },
    },
    released: {
      type: String,
      required: [true, 'A movie must have releas date'],
    },
    // createdAt: {
    //   type: Date,
    //   default: Date.now(),
    //   select: false,
    // },
    runtime: {
      type: Number,
      required: [true, 'A movie must have run time'],
    },
    genre: {
      type: String,
      required: [true, 'A movie must have genre'],
    },
    director: {
      type: String,
      required: [true, 'A movie must have director'],
    },
    starring: {
      type: String,
      required: [true, 'A movie must have starring actors'],
    },
    plot: {
      type: String,
      required: [true, 'A movie must have a plot'],
      trim: true,
    },
    language: {
      type: String,
      required: [true, 'A movie must have a language'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    ticketPrice: {
      type: Number,
      required: [true, 'A movie must have a ticket price'],
    },
    ticketDiscount: Number,

    poster: {
      type: String,
      required: [true, 'A movie must have poster'],
    },
    trailer: String,
    imageCover: String,
    images: [String],
    vipMovie: {
      type: Boolean,
      default: false,
    },
    showDates: [Date],
    critics: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    // cinemaLocations: [
    //   {
    //     type: {
    //       type: String,
    //       default: 'Point',
    //       enum: ['Point'],
    //     },
    //     coordinates: [Number],
    //     address: String,
    //     description: String,
    //   },
    // ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// movieSchema.index({ ticketPrice: 1 });
movieSchema.index({ ticketPrice: 1, ratingsAverage: -1 });
movieSchema.index({ slug: 1 });

movieSchema.virtual('runtimeHours').get(function () {
  const hours = Math.floor(this.runtime / 60);
  const minutes = this.runtime % 60;
  return `${hours}h.${minutes}m`;
});

// Virtual populate
movieSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'movie',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs bofore .save() and .create()
movieSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// movieSchema.pre('save', async function (next) {
//   const criticsPromises = this.critics.map(async id => await User.findById(id));
//   this.critics = await Promise.all(criticsPromises);
//   next();
// });

// movieSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
movieSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'critics',
    select: '-__v -passwordChangedAt',
  });
  next();
});

movieSchema.pre(/^find/, function (next) {
  this.find({ vipMovie: { $ne: true } });
  next();
});

// AGGREGATION MIDDLEWARE
movieSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { vipMovie: { $ne: true } } });
  next();
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
