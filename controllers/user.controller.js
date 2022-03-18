/**
 *
 * USER CONTROLLER
 *
 * Here we define all the CRUD operations operations in the
 * callback functions that will be called when the route
 * end-points are hit by a request.
 *
 * These functions are stored in variables and exported to
 * be used in the routes directory (we have put them together
 * in one index.js file for simplicity and maintanability of code)
 *
 * These methods defined here as controllers ultimately call
 * the various mongoose methods for constructing and querying
 * the data in the MongoDB database through the documents which
 * are instances of models.
 *
 * Design & Architecture of the Database:
 *
 * The database is designed such that there is one collection
 * that will store User documents that contain all the user
 * information as well as the array of todos items.
 *
 * Quering the database is therefore done through finding
 * documents that relate to the authenticated user and only
 * returning that single document, or where the client has
 * made a request to edit or update that document.
 *
 * Using Bcrypt to hash passwords saved in the Database:
 *
 * We make use of the bcrypt library whic is a popular password
 * hashing library to hash the passwords before we store them
 * in the database. This is a key security feature since it
 * ensures that the user data is safe and sound even in the
 * unfortunate event of the database being hacked.
 *
 * When the user signs in, the bcrypt.compare() method is
 * used to compare the password entered by the user in the
 * frontend and hashed password in the database. Only after
 * the user this process is successful that the authToken
 * is generated and the user is allowed to sign in the
 * application
 *
 * UTILS
 *
 * The utils necessary for the application and being used in
 * the route methods are defined at the top of this file under
 * the 'UTILS' title below. The createNewID() method and the
 * createUserAuthToken() are defined to be used in the methods
 * that follow below
 *
 *
 *
 */

// IMPORTS

// Import the Todos model from the model file
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
  // relevant to identifiy the user and that is helpful to other
  // parts of the application or the MongoDB database
  // We use the spread syntax to pull in the properties and values
  // into our new object below

  let userPayload = {
    ...user._doc,
  };

  // Delete the internal properties that are sensitive in the
  // case of 'password' and that are not relevant user defining
  // information, in the case of todoList; which may also be very
  // long and negatively affect performance
  delete userPayload.password;
  delete userPayload.todoList;

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
      // properties such as the password
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
  // Plug out the username and password from the body of the request
  // to be used below in accessing the user doc

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
      // the database and only perform the following actions
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
    3. Updating User document when user adds adds a new Todo Item
    ------------------------------------------------------------
*/

// Here while adding/ updating todos we ensure that we have the
// ID generator function being called here to have each element
// of the array as an objet with todoId and data

// SENDING BACK THE DOC TO THE FRONTEND:
// After each of the actions relating to updating the user doc
// we make the changes (whether it is adding todo, deleting or
// editing todos) and then return the updated user doc to the
// frontend. The frontend then takes the updated todoList and
// set the state using the React setState update methods to
// update the UI.

// This approach ensures that the frontend is consistent with
// the database, hence provides as good UX to the user and
// maintains integrity of the data and the database.

// In the future, if the app grows bigger and we find that
// users store significant data in the user doc or we decide
// to collect more data in the user doc, then the entire
// backend and database may be redesigned such that we may
// have collections inside the document and therefore we may
// need to filter what we need to send to the frontend to avoid
// latency issues with sending too much data. However that comes
// with maintenance and depending on the growth of the app or
// the usage and hence is a pre-mature optimisation for now and
// therefore unnecessary. However the current structure and design
// of both the controllers here in the backend API and the
// database design are designed fully for scalability and
// flexibility.

exports.addNewTodoItem = function (req, res) {
  // Call the method above to create a unique id for each
  // todoItem that is added to the array to store in the
  // User document for each element of the Todos List
  // We then set the value of the newTodoItem to be an object
  // that contains the newly created unique ID and the contents
  // of the todoItem object that is received from the client
  // through the body of the request
  const newTodoItemId = createNewID();
  const newTodoItem = { todoId: newTodoItemId, todoItem: req.body.todoItem };

  // Grab the id of the User
  const id = req.body._id;

  // Grab the auth from the header and get the token
  const authHeader = req.headers["authorization"];
  const authToken = authHeader.split(" ")[1];

  // We use the id field in the query filter to update the docs
  // The ids are uniquely generated by MongoDB upon doc creation
  // Hence we ensure that we update the correct doc
  // We set the 'new: true' option to return the updated doc
  // Also included the '$set' update operator to ensure we don't
  // overwrite any field that has not been updated
  // Hint: We define the callback function to an async function
  // in order to be able to user the 'await' keyword inside it
  jwt.verify(authToken, JWT_SECRET_KEY, async function (err, user) {
    if (err) {
      console.log(err);
      res.status(401).send({
        error: true,
        message:
          "You don't have permission to perform this action. Login with the correct username & password",
      });
    } else {
      // Find the document that includes the todoList. The aim
      // here is to ensure we grab the latest copy of the todoList
      // to be able to use it in the method below
      // The 'await' keyword is userful here as it ensures that
      // we get back the user before executing the next line of
      // code to avoid "race conditions" and the resulting bugs
      const userDoc = await User.findById(id).exec();

      // Call the method method to be able to update the User doc
      // with the new todoItem inside the todoList
      User.findByIdAndUpdate(
        id,
        { $set: { todoList: [...userDoc.todoList, newTodoItem] } },
        { new: true },
        function (err, doc) {
          if (err) {
            console.log("Oops! Something went wrong when updating data!");
            res.send("ERROR: TodoList has Not been Updated. " + err);
          }
          console.log("Yay! New Todo Item has been Added!!", doc);

          // We send back to the frontend the document/object that
          // has been updated in order to replace it out from the
          // array/state in UI and re-render.
          // Before sending back the entire document we clean it
          // by removing internal sensitive props such as the
          // password

          // Clone the doc
          let cleanDoc = { ...doc._doc };

          // Delete the password prop
          delete cleanDoc.password;

          // Send the clean doc to the client
          res.send(cleanDoc);
        }
      );
    }
  });
};

/* 
    4. Updating User document when the user Deletes a Todo item
    ------------------------------------------------------------
*/

exports.deleteTodoItem = function (req, res) {
  // Grab the id of the User and the todoId
  const id = req.body._id;
  const { todoId } = req.body;

  // Grab the auth from the header and get the token
  const authHeader = req.headers["authorization"];
  const authToken = authHeader.split(" ")[1];

  // We use the id field in the query filter to update the docs
  // The ids are uniquely generated by MongoDB upon doc creation
  // Hence we ensure that we update the correct doc
  // We set the 'new: true' option to return the updated doc
  // Also included the '$set' update operator to ensure we don't
  // overwrite any field that has not been updated
  // Hint: We define the callback function to an async function
  // in order to be able to user the 'await' keyword inside it
  jwt.verify(authToken, JWT_SECRET_KEY, async function (err, user) {
    if (err) {
      console.log(err);
      res.status(401).send({
        error: true,
        message:
          "You don't have permission to perform this action. Login with the correct username & password",
      });
    } else {
      // Find the document that includes the todoList. The aim
      // here is to ensure we grab the latest copy of the todoList
      // to be able to use it in the method below
      const { todoList } = await User.findById(id).exec();

      // Using the Array.filter() method to loop through the array
      // and return a new array that Excludes the deleted todoItem
      const updatedTodoList = todoList.filter((todo) => todo.todoId !== todoId);

      // Call the method method to be able to update the User doc
      // with the new todoItem inside the todoList
      User.findByIdAndUpdate(
        id,
        { $set: { todoList: updatedTodoList } },
        { new: true },
        function (err, doc) {
          if (err) {
            console.log("Oops! Something went wrong when updating data!");
            res.send("ERROR: TodoList has Not been Updated. " + err);
          }
          console.log("Yay! The deleted Todo Item has been Removed!!", doc);

          // We send back to the frontend the document/object that
          // has been updated in order to replace it out from the
          // array/state in UI and re-render.
          // Before sending back the entire document we clean it
          // by removing internal sensitive props such as the
          // password

          // Clone the doc
          let cleanDoc = { ...doc._doc };

          // Delete the password prop
          delete cleanDoc.password;

          // Send the clean doc to the client
          res.send(cleanDoc);
        }
      );
    }
  });
};

/* 
    5. Updating User document when the user Edits a Todo item
    ------------------------------------------------------------
*/

exports.editTodoItem = function (req, res) {
  // Grab the id of the User and the todoId
  const id = req.body._id;
  const { todoId, updatedTodoItem } = req.body;

  // Grab the auth from the header and get the token
  const authHeader = req.headers["authorization"];
  const authToken = authHeader.split(" ")[1];

  // We use the id field in the query filter to update the docs
  // The ids are uniquely generated by MongoDB upon doc creation
  // Hence we ensure that we update the correct doc
  // We set the 'new: true' option to return the updated doc
  // Also included the '$set' update operator to ensure we don't
  // overwrite any field that has not been updated
  // Hint: We define the callback function to an async function
  // in order to be able to user the 'await' keyword inside it
  jwt.verify(authToken, JWT_SECRET_KEY, async function (err, user) {
    if (err) {
      console.log(err);
      res.status(401).send({
        error: true,
        message:
          "You don't have permission to perform this action. Login with the correct username & password",
      });
    } else {
      // Find the document that includes the todoList. The aim
      // here is to ensure we grab the latest copy of the todoList
      // to be able to use it in the method below
      const { todoList } = await User.findById(id).exec();

      // Using the Array.map() method to loop through the array
      // and return a new array that has the updated value of the
      // edited/ updated todoItem
      const updatedTodoList = todoList.map((todo) => {
        if (todo.todoId === todoId) {
          todo.todoItem = updatedTodoItem;
        }

        return todo;
      });

      // Call the method method to be able to update the User doc
      // with the new todoItem inside the todoList
      User.findByIdAndUpdate(
        id,
        { $set: { todoList: updatedTodoList } },
        { new: true },
        function (err, doc) {
          if (err) {
            console.log("Oops! Something went wrong when updating data!");
            res.send("ERROR: TodoList has Not been Updated. " + err);
          }
          console.log("Yay! The Edited Todo Item has been Updated!!", doc);

          // We send back to the frontend the document/object that
          // has been updated in order to replace it out from the
          // array/state in UI and re-render.
          // Before sending back the entire document we clean it
          // by removing internal sensitive props such as the
          // password

          // Clone the doc
          let cleanDoc = { ...doc._doc };

          // Delete the password prop
          delete cleanDoc.password;

          // Send the clean doc to the client
          res.send(cleanDoc);
        }
      );
    }
  });
};

/* 
    6. Listing information for the Todos for the specific 
    authenticated User
    ------------------------------------------------------------
*/

// Retrieving all the information for all todos in the database
exports.getTodos = function (req, res) {
  // Grab the id of the User
  const id = req.params.id;

  // Grab the auth from the header and get the token
  const authHeader = req.headers["authorization"];
  const authToken = authHeader.split(" ")[1];

  // Calling the jwt.verify method to verify the Identity of
  // Authenticated user by verifying the authToken
  jwt.verify(authToken, JWT_SECRET_KEY, function (err, user) {
    if (err) {
      console.log(err);
      res.status(401).send({
        error: true,
        message:
          "You don't have permission to perform this action. Login with the correct username & password",
      });
    } else {
      // Call the findById mongoose/MongoDB method
      User.findById(id, function (err, userDoc) {
        if (err) {
          console.log(err);
          res.status(500).send({
            message:
              "Oops! There is an error in retrieving the User todos from the database",
          });
        } else {
          // Send back the just the todoList
          res.send(userDoc.todoList);
        }
      });
    }
  });
};

/* 
    7. Getting a refreshed token after the user refreshes the page
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
