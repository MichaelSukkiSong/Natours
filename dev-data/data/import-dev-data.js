/*
a nice little script that will load the data from the json file into the database.
this script is completely independent of the rest of our express application.
we will run this completely separately from the command line just to import everything once.
*/
const fs = require('fs');
const mongoose = require('mongoose');
// we need the dotenv package because we need our environment variables in order to be able to connect to the database.
const dotenv = require('dotenv');
// we also need access to the tour model. because the tour model is where we want to write the tours to.
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

dotenv.config({ path: './config.env' });

// we need to connect to the database. because it runs completely independent from the express application.it's only going to run once in the beginning.
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// IMPORT DATA INTO DATABASE
const importData = async () => {
  try {
    // the create method can also accept an array of objects.it will then create a new document for each of the objects in the array
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  // kind of a agressive way of stopping applications.
  process.exit();
};

// DELETE ALL DATA FROM DATABASE
const deleteData = async () => {
  try {
    // delete all of the documents in a certain collection(which is what it does in the native mongodb, mongoose also has the same thing)
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  // kind of a agressive way of stopping applications.
  process.exit();
};

/*
a simple console application logic,
where if we write,
node dev-data/data/import-dev-data.js --delete, to the console it will call deleteData
and if we write,
node dev-data/data/import-dev-data.js --import, to the console it will call importData
process.argv is like an array of inputs that is passed into the console.
process.argv[0] is the node directory
process.argv[1] is the directory where import-dev-data.js is..etc. 
*/
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
