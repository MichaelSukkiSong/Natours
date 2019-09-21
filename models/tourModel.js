const mongoose = require('mongoose');

// tour schema
const tourSchema = new mongoose.Schema({
  name: {
    // schema type options
    type: String,
    // validator
    required: [true, 'A tour must have a name'],
    unique: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  }
});
// tour model created by the schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
