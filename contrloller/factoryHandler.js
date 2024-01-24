const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const APIFeature = require('../utils/apiFeatures');

exports.deleteOne = function (Model) {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No doucment found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};

exports.updateOne = function (Model) {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No doucment found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};

exports.getAll = function (Model, popOption) {
  return catchAsync(async (req, res, next) => {
    // EXECUTING QUERY
    let filter = {};
    if (req.params.tourId) filter.tour = req.params.tourId;

    const features = new APIFeature(
      popOption ? Model.find().populate(popOption) : Model.find(filter),
      req.query,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.query;
    // SENDING RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
};

exports.getOne = function (Model, popOption) {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOption) {
      query.populate(popOption);
    }
    const doc = await query;

    if (!doc) {
      return next(new AppError('No doucment found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};

exports.createNew = function (Model) {
  return catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};
