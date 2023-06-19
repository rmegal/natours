const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name."],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name cannot be more than 40 characters"],
      minlength: [10, "A tour name cannot be less than 10 characters"]
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a maxGroupSize"]
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty can only be easy, medium, or difficult"
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating cannot be lower than 1.0"],
      max: [5, "Rating cannot be higher than 5"]
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, "A tour must have a price"] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: "The priceDiscount ({VALUE}) must be lower than the price"
      }
    },
    summary: {
      type: String,
      required: [true, "A tour must hav a summary"],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"]
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
      // select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

/**
 * Document middleware that runs before save and create, but
 * not on insertMany.
 */
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre("save", function(next) {
//   console.log("Will save document!");
//   next();
// })

// tourSchema.post("save", (doc, next) => {
//   console.log(doc);
//   next();
// });

/**
 * Query Middleware
 */
// tourSchema.pre(/^find/, function (next) {
//   this.find({ secretTour: { $ne: true } });
//   this.start = Date.now();
//   next();
// });

// tourSchema.post(/^find/, function (_docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds!`);
//   next();
// });

/**
 * Aggregation middleware
 */
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
