const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const Movie = require('./../../models/movieModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful'));

//* READ JSON FILE

const movies = JSON.parse(
  fs.readFileSync(`${__dirname}/newMovies.json`, `utf-8`)
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, `utf-8`));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, `utf-8`)
);

//* IMPORT DATA INTO DB

const importData = async () => {
  try {
    await Movie.create(movies);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log(`data successfully loaded!`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//* DELETE ALL DATA FROM COLECTION

const deleteData = async () => {
  try {
    await Movie.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log(`data successfully deleted!`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// console.log(process.argv);
