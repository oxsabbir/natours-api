const crypto = require('crypto');

const mongoose = require('mongoose');

const validator = require('validator');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'Please tell us your name!'],
    max: [25, 'User name have to below 25 char'],
  },
  email: {
    type: String,
    require: [true, 'Please provide us your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['admin', 'lead', 'lead-guide', 'user'],
    default: 'user',
  },
  password: {
    type: String,
    require: [true, 'A Password is require'],
    minlength: 8,
    select: false,
  },

  passwordChangedAt: Date,

  ConfirmPassword: {
    type: String,
    require: true,
    validate: {
      validator: function (el) {
        return this.password === el;
      },
      message: `Password didn't match`,
    },
  },
  passwordResetToken: String,

  passwordExpiresIn: Date,

  active: {
    type: Boolean,
    select: false,
  },
});

// making an instance method for checking our password

userSchema.methods.correctPassword = async function (
  candidatePassword,
  password,
) {
  return await bcrypt.compare(candidatePassword, password);
};

// checking if user changed password after token has issued
userSchema.methods.changedPasswordCheck = function (jwtTimeStamp) {
  // checking if password changed of not.
  if (this.passwordChangedAt) {
    const changedTimeStamp = Number.parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return changedTimeStamp > jwtTimeStamp;
  }
  // returning false as assuming user didn't changed password.
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // creating random string for verify token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // creating encrypted token for storing into database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordExpiresIn = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// query middleware for filter out the inactive user from any find query
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// hashing the password before saving into the database by using document middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // now entrypting our raw text password into a hash that can't be crack easily.
  this.password = await bcrypt.hash(this.password, 12);

  // removing the confirm password field before saving the data
  this.ConfirmPassword = undefined;

  next();
});

// changing the password changedAt property when password changed

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
