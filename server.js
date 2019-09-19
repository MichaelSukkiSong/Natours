/*
Later on we will actually have other stuff in this file that is not related to express but still related to our application.
Stuff like, database configuration, error handling, environment variables, etc.
*/

// to connect the .env file with our node application.
// to read the variables from the .env file and then saving them as environment variables.
// we use the dotenv npm package.
const dotenv = require('dotenv');

// we use dotenv variable and call config on it, and then in there we pass an object to specify the path where our configuration is located.
// it will read the variables from the file and save them into nodejs environment variables.
dotenv.config({ path: './config.env' });

const app = require('./app');

// app.get('env') will get us the 'env' environment variable.
// environment variables are global variables that are used to define the environment in which a node app is running.
// this 'env' variable here is actually set by express, but nodejs itself actually also sets alot of environment variables.
//console.log(app.get('env'));

// nodejs itself actually also sets alot of environment variables which is located at process.env.
//console.log(process.env);

/*
Now in many packages on npm that we use for express development depend on a special variable called NODE_ENV.
It's a variable that's kind of a convention which should define weather we are in development or in production mode.
However express does not really define this variable. So we have to do that manually.and there are multiple ways in which we can do it
but let's use the terminal.
we use nodemon server.js to start the process.
but if we want to set an environment variable for this process, we need to prepend that variable to this command.
So we say NODE_ENV=development nodemon server.js
if we say NODE_ENV=development nodemon x=23 server.js, we can see the environment variable that we specified in the console.
Now in many packages on npm that we use for express development depend on this environment variable(NODE_ENV).
and so when our project is ready and we are going to deploy it, we then should change the NODE_ENV variable to production.
we will do that of course once we deploy the project by the end of the course.

We usually use environment variables like configuration settings for our application.
so whenever our app needs some configuration, for stuff that might change based on the environment that the app is running in, we use environment variables.
For example, we might use different databases for development and for testing and so we can define one variable for each, and then activate the right database according to the environment.
Also we could set sensitive data like passwords and username using environment variables.

Now it's not really practical to always define all of these variables in the command where we start the application.
And so instead what we do is to create a configuration file.
config.env ^_^
*/

const port = process.env.PORT || 3000;
// start a server
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
