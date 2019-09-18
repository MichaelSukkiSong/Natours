const fs = require('fs');
const express = require('express');

// calling express will add a bunch of methods to our app variable.
const app = express();

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

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// our route handlers here are actually kind of middleware themselves. They are simply middleware functions that only apply for a certain URL so a certain route.
app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

const port = 3000;

// start a server
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
