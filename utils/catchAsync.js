// In order to get rid of our try/catch blocks, we simply wrapped our async functions inside of the catchAsync function that we created.
// This function will then return a new anonymous function which will then be assigned to createTour.
// the return function will call the fn that we passed in initially, and it will then execute all the code that is in there.
// since it's an async function, it will return a promise. and therefore in case there is an error we can then catch the error that happened using the catch method that is available on all promises.
// in the end it is the catch method which will pass the error in to the next function, which will then make it so that our error ends up in our global error handling middleware.
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
