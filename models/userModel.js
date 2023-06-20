const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A user must have a name."],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email"],
      trim: true
    },
    photo: String,
    role: {
      type: String,
      enum: {
        values: ["user", "guide", "lead-guide", "admin"],
        message: "Role can only be user, guide, lead-guide, or admin"
      },
      default: "user"
    },
    password: {
      type: String,
      required: [true, "A user must have a password"],
      minlength: [8, "The password cannot be less than 8 characters"],
      select: false
    },
    passwordConfirm: {
      type: String,
      required: true,
      validate: {
        // THIS ONLY WORKS ON CREATE AND SAVE!!! (I.E., NOT UPDATE)
        validator: function (val) {
          return val === this.password;
        },
        message: "The passwordConfirm must match the password"
      }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.pre("save", async function (next) {
  /**
   * Only run if password was modified.
   */
  if (!this.isModified("password") || !this.isNew) {
    return next();
  }

  /**
   * Hash password with cost of 12
   */
  this.password = await bcrypt.hash(this.password, 12);
  // ditch the passworConfirm
  this.passwordConfirm = undefined;
  /**
   * set passwordChangedAt - subtract 1 second to ensure the
   * JWT is newer than this timestamp.
   */
  
  this.passwordChangedAt = new Date(Date.now() - 1000);

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return jwtTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Add 10 minutes to current time
  this.passwordResetExpires = Date.now() + (10 * 60 * 1000);

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
