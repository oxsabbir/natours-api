const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('../../model/tourModel');
const User = require('../../model/userModel');
const Review = require('../../model/reviewModel');

dotenv.config({ path: '../../config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

mongoose.connect(DB).then(() => console.log('database established'));

const deleteData = async function () {
  await Tour.deleteMany();
  await User.deleteMany();
  await Review.deleteMany();
  console.log('Data Remove success');
  return true;
};

const importData = async function () {
  const tourdata = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'));
  const userdata = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));
  const reviewdata = JSON.parse(fs.readFileSync('./reviews.json', 'utf-8'));

  await Tour.create(tourdata);
  await User.create(userdata, { validateBeforeSave: false });
  await Review.create(reviewdata);
  console.log('Data import success');
  return true;
};

if (process.argv[2] === '--delete') {
  deleteData().then(() => {
    process.exit(1);
  });
} else if (process.argv[2] === '--import') {
  importData().then(() => {
    process.exit(1);
  });
}
