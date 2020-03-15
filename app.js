/*
This app.js file is usually mainly used for middleware declarations.
So we have all the middleware that we want to apply to all the routes
and then for the specific routes, we want to apply the tourRouter middleware or the userRouter middleware.
*/
/*
We have everything that is basically the application configuration in one stand-alone file
*/

const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

// calling express will add a bunch of methods to our app variable.
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES

// Serving static files
// simple built in middleware to serve static files.
// how we can serve static files from a folder and not from a route.
// not go into any route but simply serve that file that we specified from the folder that we specified in this middleware
// when we open up a url that we cant find in any of our routes it will then look in that public folder that we defined and it kind of sets that folder to the root.
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
// 3rd-party middleware from npm
// a http request logger.
// we used the environment variable NODE_ENV in order to run this middleware when we are in development
// we have access to the environment variable process.env.NODE_ENV even though it was defined in server.js because, the reading of the variables from the file(config.env) to the node process only needs to happen once.
// it's then in the process and the process if of course the same no matter in what file we are.
//console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
// this limiter that we created is basically a middleware function.
const limiter = rateLimit({
  // allow 100 requests from the same IP in 1 hour.
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
// we can use it using app.use, and also specify the route that needs limited accessing.
app.use('/api', limiter);

// Body parser, reading data from body into req.body
// app.use to USE middleware.
// express.json() is a middleware. express.json() returns a function. middleware is basically just a function that can modify the incoming request data, a step that the request goes through while it's being processed.
// express does not put that body data on the req. so in order to have that data available we use this middleware.
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    // whitelist is simply an array of properties for which we actually allow duplicates in the queryString.
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

/*
// defining our own custom middleware.
// this middleware here applys to each and every single request.because we didnt specify any route.
// in express the ORDER of the middleware in the code matters. the request-response cycle is LINEAR.
// middleware stack을 따라서 순서대로 시행 되기에, 초반부에 이렇게 넣으면 모든 request에 대해 적용되는 셈.
app.use((req, res, next) => {
  console.log('Hello from the middleware ^__^)/');
  // we need to call the next function, because otherwise the request-response cycle will get stuck at this point.
  next();
});
*/

// Test middleware
// another custom middleware
// to manipulate the request object. to add the current time to the request.
app.use((req, res, next) => {
  // Let's pretend we have some route handler that really needs the info about when exactly the request happens.
  // then we can define a property on the request object called requestTime and set it to a value representing the time that the request happened.
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
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

app.use('/', viewRouter);

// how to connect the new router with our application? we will use it as middleware.because the tourRouter, userRouter is actually a real middleware.
// we want to use the tourRouter/userRouter(middleware) on a specific route.
// we basically created a sub-application.
// the route here means the root of our mini application.
// this is called MOUNTING the router. So mounting a new router on a route basically.
// MOUNTING OUR ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// so...the tourRouter middleware only runs on '/api/v1/tours' this route here, so once we are in the router then we already are at that route.
// when we create a router system like this, we actually say that we kind of create a small sub-app for each of theses resources.
/*
For example, if we have an incoming request for /api/v1/tours/:id. So the request goes into the middleware stack,
and when it hits app.use('/api/v1/tours', tourRouter); this line of code here, it will match '/api/v1/tours' this route and therefore our tourRouter middleware function will run
so our tourRouter is the sub-application that we created, which in turn has its own routes. and if the request was for /:id, then it will inside our mini-app hit .route('/:id') this route here.
and finally it will run one of these handlers depending on the method.
*/

// handling unhandled routes
// if we are able to reach this point here, then it means that the request response cycle was not yet finished at this point in our code.
// so this should be basically the last part after all our other routes.
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`
  // });

  // we create an error
  // we are creating an error and then we then define these status statuscode properties on it so that our error handling middleware can then use them in a next step.
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  // if the next function receives an argument no matter what it is, express will automatically know that there was an error.
  // so it wil assume that whatever we pass in to next, is gonna be an error. that applies to every next function in every single middleware anywhere in our application
  // so again whenever we pass anything into next it will assume it's an error, and it will then skip all the other middlewares in the middle stack and send the error that we passed in to our global error handling middleware.
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

// 4) START SERVER

module.exports = app;

/*
STUDY

studied 47-51
studied 52-56
studied 57-62
studied 63-68
studied 69-75
studied 76-85
studied 86-91
studied 92-95
studied 96-99
studied 100-102
studied 103-108
studied 109-114
studied 115-120
studied 121-125
studied 126-128
studied 129-130
studied 131
studied 132-134
studied 135-136
studied 137-138
studied 139
studied 140-145
studied 146-148
studied 149-152
studied 153-155
studied 156-159
studied 160-162
studied 163-164
studied 165
studied 166
studied 167-168
studied 169
studied 170
studied 171
studied 172
studied 173
studied 174
studied 175
studied 176
studied 188
watched 190
watched 191
watched 191
studied 123-125
watched 123
studied 126-127
studied 127
watched 128
watched 128
watched 128
watched 129
studied 130
studied 131
watched 132
studied 133
watched 133
watched 134
watched 135
watched 135
watched 135
studied 136
watched 136
studied 137
watched 138
studied 139
studied 140
studied 141
studied 142
studied 143
studied 144
studied 145
studied 145
studied auth
studied auth
studied auth
studied auth
studied auth
studied auth
studied auth
new start
new start
new start
new start
new start
new start
new start
new start
new start
new start
lets do it now bro
lets do it now bro
lets do it now bro
lets do it now bro
lets do it now bro
lets do it now bro
i can do it
i can do it
i can do it
i can do it
i can do it
i can do it
i can do it
i can do it
i can do it
i can do it
i can do it
i can do it
i can do it
i can do it
i can do it
i can do it
i can do it
i can do it
lol why am i doing this xD but just for fun
lol why am i doing this xD but just for fun
getting ready
getting ready
getting ready

*/
