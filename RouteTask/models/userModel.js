const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User must provide a name']
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, 'User must provide an email'],
      validate: {
        validator: function(v) {
          return validator.isEmail(v);
        },
        message: mail => `${mail.value} is not a valid email address!`
      }
    },
    password: {
      type: String,
      select: false,
      minlength: [8, 'password be more than 8 letters']
    },
    passwordConfirm: {
      type: String,
      validate: {
        validator: function(val) {
          return val === this.password;
        },
        message: 'password and password confirm are not the same'
      }
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    passwordChangedAt: {
      type: Date
    },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    active: {
      type: Boolean,
      default: true,
      select: false
    },
    categories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Category'
      }
    ]
  },
  { timestamps: true }
);

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  this.passwordConfirm = undefined;
  next();
});
userSchema.methods.comparePasswords = async function(pass1, pass2) {
  return await bcrypt.compare(pass1, pass2);
};
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
userSchema.methods.createPasswordToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //h3mlo save f el dbb 3alshana a3ml compare ll user hyb3to
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  //bb3t el YNencrypted l2n law ba3t elly encrypted f el email eh el faydaa
  //3aml return 3alshan ytb3t email
  return resetToken;
};
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  //sa3at creating el jwt byb2aa fe delay
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function(next) {
  this.find({ active: true });

  next();
});
const User = mongoose.model('User', userSchema);
module.exports = { User };
