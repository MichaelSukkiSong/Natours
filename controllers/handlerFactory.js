const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    // https://mongoosejs.com/docs/queries.html
    // find(),findByIdAndUpdate(),findById() returns query objects, and later on can be used to immplement sorting/filtering.
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      // new: bool - true to return the modified document rather than the original. defaults to false
      new: true,
      // runValidators: if true, runs update validators on this command. Update validators validate the update operation against the model's schema.
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    // we can do it like this to create documents. we create the tour from the model, and then use the save method on that tour. this save method returns a promise.
    // https://mongoosejs.com/docs/api/model.html#model_Model-save
    // const newTour = new Tour({});
    // newTour.save();

    // but.. we can also do it like this to create a document.
    // we call the create method right on the model itself. this create method also returns a promise. but we are going to use async/await this time.
    const doc = await Model.create(req.body);

    // we have to use middleware for the req to have the body property.
    // console.log(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
    // console.log(req.params);
    // const id = req.params.id * 1;

    // const tour = tours.find(el => el.id === id);
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    //console.log(req.query);

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
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
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
      results: doc.length,
      data: {
        data: doc
      }
    });
  });
