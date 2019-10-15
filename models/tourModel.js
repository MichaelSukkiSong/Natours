const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// A library of string validators and sanitizers.
//const validator = require('validator');

// tour schema
const tourSchema = new mongoose.Schema(
  // the object with the schema definition.
  {
    name: {
      // schema type options
      type: String,
      // validator
      required: [true, 'A tour must have a name'],
      // technically not a validator
      unique: true,
      trim: true,
      // validators only available on strings
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters']
      // to specfy our validator we use the validate property.
      // we just specify the function here.(we dont call it)
      // not going to use it cuz you have to get rid of the spaces as well..but later we are going to use the library when checking user email.
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
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
      required: [true, 'A tour must hae a difficulty'],
      // validators only available on strings
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      // validators for numbers / dates
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      // custom validator
      // to specfy our validator we use the validate property.
      validate: {
        // a callback function ( a real function because we are going to have access to the this variable which will point to the current document)
        // the callback function has access to the value that was input it. in this case the priceDiscount that the user specified.
        validator: function(val) {
          // we need to return either true or false from this validator
          // inside a validator function the this keyword is only going to point to the current document when we are creating a new document. so this function here is not going to work on update.
          // 'this' only points to current doc on NEW document creation.
          return val < this.price; // 100 < 200
        },
        // a nice trick. the message also has access to the value.(internal to mongoose, nothing to do with JS)
        message: 'Discount price ({VALUE}) should be below the regular price'
      }
    },
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
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        // how we establish references between different datasets in mongoose.
        ref: 'User'
      }
    ]
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

// VIRTUAL PROPERTIES
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

// Just like express mongoose also has the concept of middleware. which can be used to make something happen between two events.
// for example, each time a new document is saved to the database we can run a function between the save command is issued and the actual saving of the document.or also after the actual saving
// There are 4 types of middleware in mongoose: document, query, aggregate, and model middleware.(model middleware not that important)

// document middleware: middleware that can act on the currently processed document.
// DOCUMENT MIDDLEWARE: only runs before .save() and .create() mongoose methods, (NOT ON .insertMany(),findOne(), findByIdAndUpdate()..etc. !! )
// the callback function is going to be called before an actual document is saved to the database
// pre document middleware
tourSchema.pre('save', function(next) {
  // in a 'save' middleware, the this keyword points to the currently processed document.that is why it's called document middleware.
  //console.log(this);

  // define a new propery(slug) at the currently processed document(this) which will be the slug of the this.name in lowercase.
  this.slug = slugify(this.name, { lower: true });
  // just like express mongoose middleware has next function.
  next();
});

/*
// embedding users into tour document
tourSchema.pre('save', async function(next) {
  // guidesPromises is an array full of promises
  const guidesPromises = this.guides.map(async id => await User.findById(id));
  // await all the promises all at once using Promise.all
  this.guides = await Promise.all(guidesPromises);
  next();
});
*/

/*
tourSchema.pre('save', function(next) {
  console.log('Will save document...');
  next();
});

// post document middleware
tourSchema.post('save', function(doc, next) {
  console.log(doc);
  next();
});
*/

// QUERY MIDDLEWARE
// so when we hit, 127.0.0.1:3000/api/v1/tours using the get method, we create a query using Tour.find().
// and then we chain all those methods to it and then by the end we execute that query using await.
// but before it actually is executed then our pre find middleware here is executed.
// it is executed because it is 'find' just like we used in Tour.find()
// So we are creating a find query, and therefore'find' hook is then executed.
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
  // the this keyword will now point at the current query
  // we filter out the secretTour
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

// all of the queries will automatically populate the guides field with the reference user.
// a nice way in case you always want to populate all your documents.
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

// post query middleware
tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  // print documents that matched the query
  //console.log(docs);
  next();
});

// AGGREGATION MIDDLEWARE
// aggregation middleware allows us to add hooks before or after an aggregation happens.
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // the this keyword points to the current aggregation object.
  console.log(this.pipeline());
  next();
});

// tour model created by the schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
