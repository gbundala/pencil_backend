/**
 *
 * QUESTION CONTROLLER
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
const Question = require("../models/question.model");

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

// CONTROLLERS

/* 
    1. Adding a new User to the users collection.
    ------------------------------------------------------------
*/

// Creating a new User in the database
exports.createQuestion = function (req, res) {
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
    2. GET QUESTIONS 
    ------------------------------------------------------------
*/
// FIXME: BE SURE to explain why you have used a certain approach or schema. and also in the comments explain what the alternative would have been. Do this here or above in the architecture explanation. While explaining ensure you explain in terms of the impact on performance. for instance whether you use annotations: [ ] as an array or have each annotation as a field (e.g annotation1, annotation2 etc ) and and check the performance using .explain("executeStats") and compare the stats for both approaches -- this way you appear to be more methodical and scientific in your coding approach.

// Retrieving all the information for all todos in the database
exports.getQuestions = function (req, res) {
  // TODO: Revisit on the id part for the user auth
  // Grab the id of the User
  const id = req.params.id;

  //   Grab the 'name of topic' from the params
  const queryTopic = req.params.q;

  // TODO: update on this part
  // Grab the auth from the header and get the token
  const authHeader = req.headers["authorization"];
  const authToken = authHeader.split(" ")[1];

  // Calling the jwt.verify method to verify the Identity of
  // Authenticated user by verifying the authToken
  jwt.verify(authToken, JWT_SECRET_KEY, async function (err, user) {
    if (err) {
      console.log(err);
      res.status(401).send({
        error: true,
        message:
          "You don't have permission to perform this action. Login with the correct username & password",
      });
    } else {
      // TODO: I have just flipped the logic on its head
      // just review and confirm [it hasnt work -- revert back]

      // Get the array of topics and sub-topics that fall
      // under the 'queryTopic'
      const queriedTopics = await Topic.find().exec();

      //   FIXME: delete this is depends on the flipping on head approach
      //  Get the array of Annotations to map through them
      // const annotations

      // map through the queriedTopics retrieved from the topics
      // collection and for each of the topics and sub-topics
      // retrieved, find the question object that has this topic
      // or sub-topic as part of its annotations

      queriedTopics.forEach((topic) => {
        // Call the findById mongoose/MongoDB method

        // TODO: Now see on how to incorporate index on the below

        // FIXME: Note; I have two options here

        // 1. I use object properties (annotation1, annotation2, .
        // ..etc) instead of an array and then follow the approach below
        // { <field1>: <value>, <field2>: <value> ... }
        // Reference: https://docs.mongodb.com/manual/reference/method/db.collection.find/

        // 2a. I keep the array of annotations in the Questions document and use  "arrayField.$" : 1" . Refer to the ame link above for details

        // 2b. Or actually use the $elementMatch keyword
        // https://docs.mongodb.com/manual/reference/operator/query/elemMatch/

        // #3. This goes along with #2b above: Ooh we actually
        // we could just spread the queriedTopics after $elemMatch
        // see this :{ annotations: {$elemMatch: {...queriedTopics}} } . Just revisit

        // RERENCE ON INDEXES: https://www.digitalocean.com/community/tutorials/how-to-use-indexes-in-mongodb

        Question.find(
          { annotations: { $elemMatch: { topic } } },
          function (err, userDoc) {
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
          }
        );
      });
    }
  });
};
