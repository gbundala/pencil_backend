// EXPRESS SETUPS, ROUTES & MIDDLEWARE

// IMPORTS

// Import the express library
const express = require("express");

// Import environment variables for use in the MongoDB URL to
// connect to the database. Where we need to enter the username
// and password. npm: https://www.npmjs.com/package/dotenv

// The .env file is also included in the .gitignore file to
// avoid the unauthorized access to the credentials
require("dotenv").config();

// Import Helmet library for security
const helmet = require("helmet");

// Import bodyParse from the body-parser library
const bodyParser = require("body-parser");

// Load the routes file to be able to use it
const apiRoutes = require("./routes");

// Import mongoose to be used to connect to the MongoDB database
// Mongoose is an abstraction over the MongoDB Drivers and the
// boilerplate code to connect to MongoDB, hence a better DX.
const mongoose = require("mongoose");

// EXPRESS APP INITIALIZATION

// Create the app object from the top-level express function call
// to initialize the express app
const app = express();

// MIDDLEWARES

// Calling helmet middleware which helps secure the App
// by setting various HTTP headers

// Included the unsafe-inline directive as part of the CSP policy to rectify
// the error as per the message below.
// The useDefaults is set to 'true' hence all the defaults
// remain the same except for directives option which
// only overrides the "script-src" option

/**
 * ERROR MESSAGE:
 * Refused to execute inline script because it violates the
 *  following Content Security Policy directive: "script-src
 * 'self'". Either the 'unsafe-inline' keyword, a hash
 * ('sha256-1kri9uKG6Gd9VbixGzyFE/kaQIHihYFdxFKKhgz3b80='), or a
 * nonce ('nonce-...') is required to enable inline execution.
 *
 *
 * SOURCES:
 * https://help.fullstory.com/hc/en-us/articles/360020622854-Can-I-use-Content-Security-Policy-CSP-with-FullStory-
 * https://codeutility.org/helmet-content-security-policy-blocking-react-js/amp/
 * https://github.com/helmetjs/helmet
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 *
 */
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "script-src": ["'self'", "'unsafe-inline'"],
    },
  })
);

// Express middleware
// To enable the server to accept requests from the Body of
// a request in a json format.
app.use(express.json());

// The bodyParser middleware is used to parse the body
// of the request to read it and expose it to req.body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ROUTES

/**
 *
 * Use the apiRoutes
 *
 * We have imported the api routes from the routes
 * directory above and call app.use() method and pass
 * the routes in the second argument. The first argument
 * defines the root route.
 *
 * This approach of using a single file is much lean and
 * scalable as it is easier to just add the routes in the
 * index.js file inside the routes directory (rather than
 * creating a separate file for each route)
 * The response here in stackoverflow provides a much better
 * response on this approaching of using the routes directory:
 * https://stackoverflow.com/questions/6059246/how-to-include-route-handlers-in-multiple-files-in-express/37309212#37309212
 *
 */
app.use("/api", apiRoutes);

// ERROR HANDLING

// For general error handling inline with the gist below
// We use the "*" wildcard to capture any errors
// https://gist.github.com/zcaceres/2854ef613751563a3b506fabce4501fd#generalized-error-handling
// Then we respond with the message if the use enters
// a different route not specified here
app.get("*", function (req, res, next) {
  let err = new Error();

  // we set the status code to 404
  err.statusCode = 404;

  // In order to enable our middleware to redirect
  // we set the shouldRedirect property on the err
  // object to true
  err.shouldRedirect = true;
  next(err);
});

// Our error handling middleware
// We place our error handling middleware at the end after all
// routes and middleware in order to be able to catch any
// errors occuring the processes above
app.use(function (err, req, res, next) {
  console.log(err.stack);
  res.status(500).send("Oops something is wrong!?!?");
});

// DYNAMIC PORT
const PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
  console.log(`App server is listening on PORT ${PORT}`);
});

/**
 *
 * MONGOOSE SETUP AND CONNECTION
 *
 * The code below uses the uri string to connect to the MongoDB
 * database and provide the feeback to the console when the
 * connection is successful or not
 *
 * The uri for connecting is available in from the Atlas, Connect
 * option in the MongoDB app. The mongoose.connect() instruction
 * is used to connect to the database
 *
 *
 */

// Plug out the custom variables from the .env file
// These are being used below in order to hide my
// credential from access to any other person who
// may have access to this code reposity. Hence for security
const { MONGODB_USERNAME } = process.env;
const { MONGODB_PASSWORD } = process.env;

// MONGOOSE CONNECTION
const uri = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@hyperion-dev-l3.0qthg.mongodb.net/TodoList?retryWrites=true&w=majority`;
mongoose.Promise = global.Promise;

// NOTE: useMongoClient option is no longer necessary (and it
// causes an error) since mongoose 5.x, hence ommited here
// Resource: https://stackoverflow.com/questions/48031029/the-options-usemongoclient-is-not-supported
mongoose.connect(uri);

mongoose.connection.on("error", function (err) {
  console.log("Hurray!! Connection to Mongo established.");
  console.log(
    "Something went wrong!! Could not connect to the database. Exiting now..."
  );
  console.log(err);
  process.exit();
});
mongoose.connection.once("open", function () {
  console.log("Successfully connected to MongoDB database");
});
