// const fs = require('fs');

// import tour model
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

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

// aliasing
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);

    // BUILD QUERY
    /*
    // 1A) Filtering
    // we have to exclude special field names from our query string before we actually do the filtering.(ex. &page=2, )
    // we need a hard copy here. because if we delete something from queryObj, it will also delete it from the req.query if we do a shallow copy.(In JS when we set a variable to an another object, the new variable will be a reference to that original object)
    // In JS there's really no built in way of doing a hard copy, so we destructure it first and then create a new object out of that.
    const queryObj = { ...req.query };
    // an array of all the field that we want to exclude.
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // remove all of the excludedfields from the queryObj.
    excludedFields.forEach(el => delete queryObj[el]);

    // shows an object containing the query string data ( eg. ?duration=5&difficulty=easy)
    // express parses the string in to an easy to use object.
    //console.log(req.query, queryObj);

    // we can use the info from the middleware in this route handler for example.
    //console.log(req.requestTime);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    //console.log(JSON.parse(queryStr));

    // { difficulty: 'easy', duration: { $gte: 5 } }
    // { difficulty: 'easy', duration: { gte: '5' } }
    // gte, gt, lte, lt

    // find(),findByIdAndUpdate(),findById() returns query objects, and later on can be used to immplement sorting/filtering.
    // the first way of writing database queries in mongoose.(Using a filter object)
    // 모델에 쿼리를 던져서 query object를 받고, 거기다가 Query.protype에 있는 method들을 적용하는 개념. 적용된 메쏘드는 또 쿼리를 받기에 chain을 할 수 있음.
    let query = Tour.find(JSON.parse(queryStr));
    */

    /*
    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      //console.log(sortBy);
      query = query.sort(sortBy);
      // sort('price ratingsAverage') --> price가 동일할 때 ratingsAverage로 정렬
    } else {
      query = query.sort('-createdAt');
    }
    */

    /*
    // 3) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      // the minus excludes the field. so we have everything except the __v
      query = query.select('-__v');
    }
    */

    /*
    // 4) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // page3&limit=10, 1-10, page 1, 11-20, page 2, 21-30, page 3
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }
    */

    // EXECUTE QUERY
    /* 
    we are creating a new object of the APIFeatures class.
    In there we are passing a query object, and the queryString that is coming from express
    And then in each of the 4 methods that we call one after another, we manipulate the query, we keep adding more methods to it
    And then by the end we await the result of that query so that it can comeback with all the documents that were selected. the query now lives at features.
    */
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    // query.sort().select().skip().limit()

    // find(),findByIdAndUpdate(),findById() returns query objects, and later on can be used to immplement sorting/filtering.
    // another way of writing database queries in mongoose.(Using special mongoose methods)
    // const query = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    // SEND RESPONSE
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
      message: err
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

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

// aggregation pipeline: mathcing and grouping
exports.getTourStats = async (req, res) => {
  try {
    // .find returns a query .aggregate returns an aggregate object.
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

// aggregation pipeline: unwinding and projecting
exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; // 2021

    const plan = await Tour.aggregate([
      {
        // unwind is going to deconstruct an array field from the input documents, and then output one document for each element of the array
        // basically we want to have one tour for each of these dates in the array
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};
