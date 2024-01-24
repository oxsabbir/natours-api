const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('../model/tourModel');
const Booking = require('../model/bookingModel');

const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async function (req, res, next) {
  const tour = await Tour.findById(req.params.tourId);

  // creating the session
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${tour.id}&user=${
      req.user._id
    }&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,

    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name}`,
            description: `${tour.summary}`,
            images: [
              'https://blog.daraz.com.bd/wp-content/uploads/2019/12/Tours-and-Travel.jpg',
            ],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  // sending the session to client
  res.status(200).json({
    status: 'success',
    session: checkoutSession,
  });

  // work with booking in db
});

exports.createBookingCheckout = catchAsync(async function (req, res, next) {
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});
