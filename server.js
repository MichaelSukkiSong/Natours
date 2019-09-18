/*
Later on we will actually have other stuff in this file that is not related to express but still related to our application.
Stuff like, database configuration, error handling, environment variables, etc.
*/

const app = require('./app');

const port = 3000;
// start a server
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
