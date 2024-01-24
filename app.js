const express = require('express');

const path = require('path');

const cookieParser = require('cookie-parser');

const tourRouter = require(`./routes/tourRoutes`);
const userRouter = require(`./routes/userRoutes`);
const reviewRouter = require('./routes/reviewRoutes');
const viewsRouter = require('./routes/viewsRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

const AppError = require('./utils/AppError');

const errorController = require('./contrloller/errorController');

// 1 MIDDILEWARE
// body parser
app.use(express.json());

app.use((req, res, next) => {
  req.when = new Date().toISOString();
  next();
});

app.use(express.static(`public`));

// cookie parser
app.use(cookieParser());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use('/', viewsRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// creating a global route for error

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// it's an global error handling middleware called when anything passed on next() function on other middleware

app.use(errorController);

module.exports = app;
