const mongoose = require('mongoose');

const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minlength: [10, 'A title must have a lenght of 10'],
      maxlength: [40, 'A title can have a lenght of 40'],
    },
    slug: String,
    duration: {
      type: Number,
      require: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      require: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'A leve can only define by : easy, medium or difficult',
      },
      require: [true, 'A tour must have a difficulty'],
    },
    isSecret: Boolean,
    ratingsAverage: {
      type: Number,
      min: [1, 'A rating should be above 1'],
      max: [5, 'A rating should be below 5'],
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      require: [true, 'A tour must need a price'],
    },
    priceDiscount: Number,

    summery: {
      type: String,
      trim: true,
      require: [true, 'A tour must a have a summery'],
    },
    imageCover: {
      type: String,
      require: [true, 'A tour must have a cove image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    startsDate: [Date],

    // GEOJSON

    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],

    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },

  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// Virtual Properties / a virtual is only a property not a middleware so we don't need the next function

tourSchema.virtual('durationInWeeks').get(function () {
  return this.duration / 7;
});

// using virtual populate for populating reviews inside of tour

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Document middleware / now we want to add slug to our document when we save a document
tourSchema.pre('save', function (next) {
  // here "this" mean the document that going to be saved on our database and we modified it
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post('save', function (doc, next) {
//   console.log(doc), next();
// });

// Query middleware / trying to filter out our super secret tour
tourSchema.pre(/^find/, function (next) {
  // here "this mean the query that we are using so far that's why our find query work's "
  this.find({ isSecret: { $ne: true } });
  next();
});

/// using populate for getting user data into tour guides

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// Aggregate middleware / trying to hide the secret from the stats page to

tourSchema.pre('aggregate', function (next) {
  // in aggregation "this" mean the aggregation object
  // then we can accesss the pipeline method from there and modify that as we want and add some more stages
  // by executing that pipeline method we got our pipeline array and there we are adding our aggregate "match" stage.
  this.pipeline().unshift({ $match: { isSecret: { $ne: true } } });
  next();
});

// all the middlewore seeem  working now
// now working on datavalidation

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
