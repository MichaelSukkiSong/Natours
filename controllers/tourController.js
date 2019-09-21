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
////////////NO LONGER NEEDED, BECAUSE MONGOOSE WILL GOING TO TAKE CARE OF IR////////////////
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

exports.getAllTours = (req, res) => {
  // we can use the info from the middleware in this route handler for example.
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime
    // results: tours.length,
    // data: {
    //   tours
    // }
  });
};

exports.getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;

  // const tour = tours.find(el => el.id === id);

  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour
  //   }
  // });
};

exports.createTour = async (req, res) => {
  try {
    // we can do it like this to create documents.
    // we create the tour from the model, and then use the save method on that tour. this save method returns a promise.
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

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null
  });
};
