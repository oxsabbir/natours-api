// 4 START SERVER
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// configuring the environment variable
// handling unhandled exeption.
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

// connecting to the real database
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

mongoose.connect(DB).then(() => console.log('database established'));

const port = process.env.PORT;

const server = app.listen(port, '127.0.0.1', () => {
  console.log(`listening to ${port} port...`);
});

// checking unhandled rejection
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
