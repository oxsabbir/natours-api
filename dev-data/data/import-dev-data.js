const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('../../model/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

mongoose.connect(DB).then(() => console.log('database established'));

const deleteData = async function () {
  await Tour.deleteMany();
  console.log('Data Remove success');
  return true;
};

const importData = async function () {
  const data = fs.readFileSync('./dev-data/data/tours.json', 'utf-8');
  await Tour.create(JSON.parse(data));
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
