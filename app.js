const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

// calling express will add a bunch of methods to our app variable.
const app = express();

// 1) MIDDLEWARES

// 3rd-party middleware from npm
// a http request logger.
app.use(morgan('dev'));

// app.use to use middleware.
// express.json() is a middleware. express.json() returns a function. middleware is basically just a function that can modify the incoming request data, a step that the request goes through while it's being processed.
app.use(express.json());

// defining our own custom middleware.
// this middleware here applys to each and every single request.because we didnt specify any route.
// in express the ORDER of the middleware in the code matters. the request-response cycle is LINEAR.
// middleware stack을 따라서 순서대로 시행 되기에, 초반부에 이렇게 넣으면 모든 request에 대해 적용되는 셈.
app.use((req, res, next) => {
  console.log('Hello from the middleware ^__^)/');
  // we need to call the next function, because otherwise the request-response cycle will get stuck at this point.
  next();
});

// another custom middleware
// to manipulate the request object. to add the current time to the request.
app.use((req, res, next) => {
  // Let's pretend we have some route handler that really needs the info about when exactly the request happens.
  // then we can define a property on the request object called requestTime and set it to a value representing the time that the request happened.
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// 2) ROUTE HANDLERS
// our route handlers here are actually kind of middleware themselves. They are simply middleware functions that only apply for a certain URL so a certain route.

const getAllTours = (req, res) => {
  // we can use the info from the middleware in this route handler for example.
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours
    }
  });
};

const getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;

  const tour = tours.find(el => el.id === id);

  //   if (id > tours.length) {
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
};

const createTour = (req, res) => {
  // we have to use middleware for the req to have the body property.
  // console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// 3) ROUTES

// If we want to separate the resources for routes and route handlers, we have to have one separate router for each of our resources.
const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter
  .route('/')
  .get(getAllTours)
  .post(createTour);

tourRouter
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

userRouter
  .route('/')
  .get(getAllUsers)
  .post(createUser);

userRouter
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

// how to connect the new router with our application? we will use it as middleware.because the tourRouter, userRouter is actually a real middleware.
// we want to use the tourRouter/userRouter(middleware) on a specific route.
// we basically created a sub-application.
// the route here means the root of our mini application.
// this is called mounting the router. So mounting a new router on a route basically.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// so...the tourRouter middleware only runs on '/api/v1/tours' this route here, so once we are in the router then we already are at that route.
// when we create a router system like this, we actually say that we kind of create a small sub-app for each of theses resources.
/*
For example, if we have an incoming request for /api/v1/tours/:id. So the request goes into the middleware stack,
and when it hits app.use('/api/v1/tours', tourRouter); this line of code here, it will match '/api/v1/tours' this route and therefore our tourRouter middleware function will run
so our tourRouter is the sub-application that we created, which in turn has its own routes. and if the request was for /:id, then it will inside our mini-app hit .route('/:id') this route here.
and finally it will run one of these handlers depending on the method.
*/

// 4) START SERVER
const port = 3000;
// start a server
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
