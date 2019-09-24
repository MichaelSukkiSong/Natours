const mongoose = require('mongoose');

// tour schema
const tourSchema = new mongoose.Schema(
  // the object with the schema definition.
  {
    name: {
      // schema type options
      type: String,
      // validator
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must hae a difficulty']
    },
    ratingsAverage: {
      type: Number,
      default: 4.5
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: Number,
    summary: {
      type: String,
      // string schema type which will remove all the white space in the beginning and the end of a string.
      trim: true,
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // excluding this field right from the schema. used when it's sensitive data.
      select: false
    },
    startDates: [Date]
  },
  // the object for the schema options
  // we have to explicitly define in our schema that we want the virtual properties in our output.
  {
    // each time that the data is outputed as JSON, we want virtuals to be part of the output.
    toJSON: { virtuals: true },
    // each time that the data is outputed as an object, we want virtuals to be part of the output.
    toObject: { virtuals: true }
  }
);

// Virtual properties: fields that we can define on our schema but that will be not persistent(they will not be saved into the database).
// It is not going to be persistent in the database but it's only going to be there as soon as we GET the data.
// virtual properties make alot of sense for fields that can be derived from one another. For example, a conversion miles to kilometer. It doesn't make sense to store these two fields in a database if we can easily convert one to the other.
// Let's noe define a virtual property that contains the tour duration in weeks.
tourSchema.virtual('durationWeeks').get(function() {
  // used a regular function here because an arrow function does not get its own this keyword.
  // the this keyword in this case, is going to be pointing to the current document.
  return this.duration / 7;
});
/*
one thing about virtual properties,, is that we cannot use virtual properties in a query, because they are technically not part of the database.
Of course we could also have done this conversion each time after we query the data for example like in the controller, but that would not be the best practice simply because we want to keep business logic and application logic as much separated as possible.
knowing the duration in weeks is a business logic because it has to do with the business itself not with stuff like requests or responses and so we do the calculation right in the model where it belongs and not in the controller.
*/

// tour model created by the schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
