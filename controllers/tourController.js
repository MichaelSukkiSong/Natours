// const fs = require('fs');

// import tour model
const Tour = require('./../models/tourModel');

/*
//////////TESTING////////////
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);
*/

/*
////////////NO LONGER NEEDED, BECAUSE MONGO WILL GIVE US AN INVALID IR ERROR ITSELF////////////////
// using the concept of param middleware, we are going to perform this check here in a outside middleware that is going to run before the request even hits the handler functions. so this middleware is part of our pipline.
// you might argue that we might simply create a simple function which could also check for the id and call that function inside each of the tourfunction..
// but that goes against the philosophy of express, where we should always work withthe middleware stack, so with this pipeline as much as we can.
exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  if (req.params.id * 1 > tours.length) {
    // we have to return it. because we want to make sure after sending this response the function will return. so that it'll finish and will never call the next();
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }
  next();
};
*/

/*
////////////NO LONGER NEEDED, BECAUSE MONGOOSE WILL GOING TO TAKE CARE OF IT////////////////
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price'
    });
  }
  next();
};
*/

exports.getAllTours = async (req, res) => {
  try {
    // we can use the info from the middleware in this route handler for example.
    //console.log(req.requestTime);

    // find(),findByIdAndUpdate(),findById() returns query objects, and later on can be used to immplement sorting/filtering.
    const tours = await Tour.find();

    res.status(200).json({
      status: 'success',
      // requestedAt: req.requestTime
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    // exactly the same as Tour.findOne({ _id: req.params.id }). findById is a shorthand of writing { _id: req.params.id }
    // find(),findByIdAndUpdate(),findById() returns query objects, and later on can be used to immplement sorting/filtering.
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
  // console.log(req.params);
  // const id = req.params.id * 1;

  // const tour = tours.find(el => el.id === id);
};

exports.createTour = async (req, res) => {
  try {
    // we can do it like this to create documents. we create the tour from the model, and then use the save method on that tour. this save method returns a promise.
    // https://mongoosejs.com/docs/api/model.html#model_Model-save
    // const newTour = new Tour({});
    // newTour.save();

    // but.. we can also do it like this to create a document.
    // we call the create method right on the model itself. this create method also returns a promise. but we are going to use async/await this time.
    const newTour = await Tour.create(req.body);

    // we have to use middleware for the req to have the body property.
    // console.log(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });

    // const newId = tours[tours.length - 1].id + 1;
    // const newTour = Object.assign({ id: newId }, req.body);

    // tours.push(newTour);

    // fs.writeFile(
    //   `${__dirname}/dev-data/data/tours-simple.json`,
    //   JSON.stringify(tours),
    //   err => {
    //     res.status(201).json({
    //       status: 'success',
    //       data: {
    //         tour: newTour
    //       }
    //     });
    //   }
    // );
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!'
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    // https://mongoosejs.com/docs/queries.html
    // find(),findByIdAndUpdate(),findById() returns query objects, and later on can be used to immplement sorting/filtering.
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      // new: bool - true to return the modified document rather than the original. defaults to false
      new: true,
      // runValidators: if true, runs update validators on this command. Update validators validate the update operation against the model's schema.
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null
  });
};
