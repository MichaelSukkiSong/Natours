/*
This app.js file is usually mainly used for middleware declarations.
So we have all the middleware that we want to apply to all the routes
and then for the specific routes, we want to apply the tourRouter middleware or the userRouter middleware.
*/
/*
We have everything that is basically the application configuration in one stand-alone file
*/

const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// calling express will add a bunch of methods to our app variable.
const app = express();

// 1) MIDDLEWARES

// 3rd-party middleware from npm
// a http request logger.
// we used the environment variable NODE_ENV in order to run this middleware when we are in development
// we have access to the environment variable process.env.NODE_ENV even though it was defined in server.js because, the reading of the variables from the file(config.env) to the node process only needs to happen once.
// it's then in the process and the process if of course the same no matter in what file we are.
//console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// app.use to USE middleware.
// express.json() is a middleware. express.json() returns a function. middleware is basically just a function that can modify the incoming request data, a step that the request goes through while it's being processed.
// express does not put that body data on the req. so in order to have that data available we use this middleware.
app.use(express.json());

// simple built in middleware to serve static files.
// how we can serve static files from a folder and not from a route.
// not go into any route but simply serve that file that we specified from the folder that we specified in this middleware
// when we open up a url that we cant find in any of our routes it will then look in that public folder that we defined and it kind of sets that folder to the root.
app.use(express.static(`${__dirname}/public`));

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

// 2) ROUTE HANDLERS
// our route handlers here are actually kind of middleware themselves. They are simply middleware functions that only apply for a certain URL so a certain route.

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// 3) ROUTES

// how to connect the new router with our application? we will use it as middleware.because the tourRouter, userRouter is actually a real middleware.
// we want to use the tourRouter/userRouter(middleware) on a specific route.
// we basically created a sub-application.
// the route here means the root of our mini application.
// this is called MOUNTING the router. So mounting a new router on a route basically.
// MOUNTING OUR ROUTERS
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

module.exports = app;
