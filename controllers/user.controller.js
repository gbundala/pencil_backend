/**
 *
 *
 *
 * USER CONTROLLER
 *
 * Here we define all the CRUD operations in the callback
 * functions that will be called when the route end-points
 * are hit by a request.
 *
 * These functions are stored in variables and exported to
 * be used in the routes directory (we have put them together
 * in one index.js file for simplicity and maintanability of code)
 *
 * These methods defined here as controllers ultimately call
 * the various mongoose methods for constructing and querying
 * data in the MongoDB database through the documents which
 * are instances of models.
 *
 * Design & Architecture of the Database:
 *
 * The database is designed such that there is one collection
 * that will store User documents that contain all the user
 * information and the level of access designation (e.g isAdmin).
 *
 * Quering the database is therefore done through finding
 * documents that relate to the authenticated user and only
 * returning that single document, or where the client has
 * made a request to edit or update that document.
 *
 * This architecture provides a clear demarcation between the
 * Authentication endpoints and the Resources endpoints. The user
 * model and controller here provides the auth endpoints to
 * authenticate and signin the user while the other endpoints
 * and collections (questions and topics collections) provide
 * the resources endpoints
 *
 * Using Bcrypt to hash passwords saved in the Database:
 *
 * We make use of the bcrypt library which is a popular password
 * hashing library to hash the passwords before we store them
 * in the database. This is a key security feature since it
 * ensures that the user data is safe and sound even in the
 * unfortunate event of the database being hacked.
 *
 * When the user signs in, the bcrypt.compare() method is
 * used to compare the password entered by the user in the
 * frontend and hashed password in the database. Only after
 * this process is successful that the authToken is generated
 * and the user is allowed to sign in the application.
 *
 * The auth token is then being used to provide access to other
 * protected routes by attaching it to the header on each request
 * being made.
 *
 *
 *
 */

// IMPORTS

// Import the User model from the model file
const User = require("../models/user.model");

// Import the jsonwebtoken library
const jwt = require("jsonwebtoken");

// Import bcrypt to be used to hash passwords
const bcrypt = require("bcrypt");

// The 'dotenv' library has already been required/imported
// in server.js and hence accessible here as well.
// We grab the jwt secret key from the custom environment
// variable to be used in the jwt signing method below
const { JWT_SECRET_KEY } = process.env;

// UTILS

// We create a function to generate unique number IDs
// Below is a reference to MDN on random number generation
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function createNewID() {
  const newID = Math.floor(Math.random() * Date.now());
  return newID;
}

// We define the function that will be used to create the
function createUserAuthToken(user) {
  // We defined the payload that will be included in the signature
  // algorithm as input. No passwords or sensitive information
  // information is included here. Just information that is
  // relevant to identify the user and that is helpful to other
  // parts of the application or the MongoDB database
  // We use the spread syntax to pull in the properties and values
  // into our new object below

  let userPayload = {
    ...user._doc,
  };

  // Delete the internal properties that are sensitive in the
  // case of 'password' and that are not relevant user defining
  // information.
  delete userPayload.password;

  // RESOURCE: This resource, provides valuable discussion on
  // plucking out only a select few of props using the 'spread'
  // syntax and the 'delete' keyword:
  // https://stackoverflow.com/questions/56151661/omit-property-variable-when-using-object-destructuring

  // We define the authToken variable that will carry the token
  // generated from the signing method.
  // We explicitly define the options to expire the token in 12
  // hours to enhance security as well as define the algorithm to
  // be used to be the 'HS256' hashing algorithm.
  const authToken = jwt.sign(userPayload, JWT_SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: "12h",
  });

  return authToken;
}

// CONTROLLERS

/* 
    1. Adding a new User to the users collection.
    ------------------------------------------------------------
*/

// Creating a new User in the database
exports.createUser = function (req, res) {
  // Grab the new User object from the body
  const newUser = req.body;

  // Encrypt the password before storing it in the database
  // using bcrypt hashing algo.
  // We also define the salt rounds to be used in the hashSync
  // bcrypt method below inline with the library documentation.
  // The salt is basically the number of rounds to secure the hash
  // which in essence is meant to enhance the unpredictability of
  // the hash by including some random data that is used as input
  // to the hashing method.
  // Resource on bcrypt: https://sebhastian.com/bcrypt-node/
  const saltRounds = 10;
  const encryptedPassword = bcrypt.hashSync(newUser.password, saltRounds);

  // Create and Save a new User using the UserModel constructor
  // and passing in the Object received from the body of the
  // request. Also specifying the password value to the encrypted
  // version instead of the plain text one.
  let userModel = new User({
    ...newUser,
    password: encryptedPassword,
  });

  // Calling the save method to create the new User
  userModel.save(function (err, doc) {
    if (err) {
      console.log(err);
      res.status(500).send({
        message: "Oops! There is an error in adding the User to the database.",
      });
    } else {
      console.log("Yay! New User has been added to database!!", doc);

      // Generate the auth token using the method defined above
      // by passing in the user doc into the method and calling it
      const authToken = createUserAuthToken(doc);

      // Clone the doc
      let cleanDoc = { ...doc._doc };

      // Delete the password prop
      delete cleanDoc.password;

      // Send the json object to include both the user and the jwt
      // token.
      // We only send the clean doc which excludes internal
      // properties such as the password but includes all the
      // necessary information that can be useful in the frontend
      // development of the user interfaces and logic
      res.send({
        user: cleanDoc,
        token: authToken,
      });
    }
  });
};

/* 
    2. Signing in a User.
    ------------------------------------------------------------
*/

exports.userSignIn = function (req, res) {
  // Plug out the username and password from the body of the
  // request to be used below in accessing the user doc

  const { username } = req.body;
  const { password } = req.body;

  // Calling the findOne() method with the arguments
  User.findOne({ username }, function (err, doc) {
    if (err) {
      console.log(err);
      res.status(500).send({
        error: true,
        message: "Oops! There is an error in signing in",
      });
    } else if (!doc) {
      console.log(err);
      res.status(404).send({
        error: true,
        message: "Oops! The username or password entered is not correct!",
      });
    } else {
      // If the doc is found in the database we then use bcrypt
      // to compare the entered username and the encrypted one in
      // the database and only sign in the user into the app
      // if the comparison succeeds
      bcrypt.compare(password, doc.password, function (err, same) {
        if (err) throw err;

        if (!same) {
          // We respond with error 404: 'Not Found' as we don't
          // to provide a clue to the client on what exactly is
          // the authentication issue, hence for better security
          // since we don't place any trust to the client as
          // hackers can easily mask themselves and try to gain
          // priviledged access
          res.status(404).send({
            error: true,
            message: "Oops! The username or password entered is not correct!",
          });
        } else {
          // Generate the auth token using the method defined above
          // by passing in the user doc into the method and calling it
          const authToken = createUserAuthToken(doc);

          // Send the json object to include both the user and the jwt token.

          // We ensure that we don't send the password to the
          // frontend even if it is hashed already. We therefore
          // 'clean' the doc by deleting the password prop and
          // sending to the frontend a clean user doc

          // Clone the doc
          let cleanDoc = { ...doc._doc };

          // Delete the password prop
          // Resource: https://stackoverflow.com/questions/56151661/omit-property-variable-when-using-object-destructuring
          delete cleanDoc.password;

          // We only send the clean doc which excludes internal
          // properties such as the password
          res.send({
            user: cleanDoc,
            token: authToken,
          });
        }
      });
    }
  });
};

/* 
    3. Getting a refreshed token after the user refreshes the page
     ------------------------------------------------------------
*/

exports.refreshToken = function (req, res) {
  // Grab the token from the body
  const { token } = req.body;
  const id = req.body.user._id;

  //
  jwt.verify(token, JWT_SECRET_KEY, function (err, user) {
    if (err) {
      console.log(err);
      res.status(401).send({
        error: true,
        message:
          "You don't have permission to perform this action. Login with the correct username & password",
      });
    } else {
      // Calling the findById() method with the arguments
      User.findById(id, function (err, doc) {
        if (err) {
          console.log(err);
          res.status(500).send({
            message: "Oops! There is an error in retrieving token for the user",
          });
        } else {
          console.log(
            "Yay! We have successfully refreshed the auth token!!",
            doc
          );

          // Generate the auth token using the method defined above
          // by passing in the user doc into the method and calling it
          const authToken = createUserAuthToken(doc);

          // Clone the doc
          let cleanDoc = { ...doc._doc };

          // Delete the password prop
          delete cleanDoc.password;

          // Send the json object to include both the user and
          // the jwt token.
          // We only send the clean doc which excludes internal
          // properties such as the password
          res.send({
            user: cleanDoc,
            token: authToken,
          });
        }
      });
    }
  });
};
