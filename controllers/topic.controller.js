/**
 *
 * TODO: REVISIT THIS
 *
 * TOPIC CONTROLLER
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
 * Refer to the documentation and details in the topic.model.js
 * file for details on the design of the database and schema
 * architecture.
 *
 *
 *
 *
 */

// IMPORTS

// Import the Question model from the model file
const Question = require("../models/question.model");

// Import the Topic model from the model file
// The Topic model (constructor) is useful to call the findOne()
// method that retrieves the Topic document that meets the
// filter query for the value of the queryTopic from the
// 'query string'
const Topic = require("../models/topic.model");

// Import the jsonwebtoken library
const jwt = require("jsonwebtoken");
const topicsArray = require("./utils/topicsArray");

// The 'dotenv' library has already been required/imported
// in server.js and hence accessible here as well.
// We grab the jwt secret key from the custom environment
// variable to be used in the jwt signing method below
const { JWT_SECRET_KEY } = process.env;

// UTILS

// CONTROLLERS

/* 
    1. Adding a new Topic to the topics collection.
    ------------------------------------------------------------
*/

// Creating a new Topic in the database
exports.createTopic = function (req, res) {
  // Grab the topic object from the body of the request
  const newTopic = req.body;

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
    } else if (!user.isAdmin) {
      res.status(401).send({
        error: true,
        message:
          "You don't have the right priviledges to add questions or topics. Login with the correct username & password",
      });
    } else {
      // Create and Save a new Topic using the TopicModel
      // constructor and passing in the Object received from the
      // body of the request.
      let topicModel = new Topic({
        ...newTopic,
      });

      // Call the save method to create a new topic
      topicModel.save(function (err, topicDoc) {
        if (err) {
          console.log(err);
          res.status(500).send({
            message:
              "Oops! There is an error in adding the Topic to the database",
          });
        } else {
          console.log("Yay! New Topic has been added to database!", topicDoc);
          // Send back the Topic document
          res.send(topicDoc);
        }
      });
    }
  });
};

/* 
    2. Adding a Multiple New Topics to the topics collection.
    ------------------------------------------------------------
*/

// Creating Multiple Questions in the database at once
exports.createMultipleTopics = async function (req, res) {
  // FIXME: REVISIT BELOW
  // JUST RETURN THIS AND COMMENT OUT THE CODE FOR THE GOOGLE SHEET CALL AS THAT WON'T BE NEEDED CONTINUOSLY ITS A ONE TIME BUT KEEP THE UTIL CODE AS IT SHOWS WHAT I HAVE DONE
  // Grab the questions Array from the body of the request
  // const newQuestionsArray = req.body;

  // Call the method to retrieve the topics from the
  // google sheet
  const newTopicsArray = await topicsArray();

  console.log("NEW TOPICS ARRAY", newTopicsArray);

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
    } else if (!user.isAdmin) {
      res.status(401).send({
        error: true,
        message:
          "You don't have the right priviledges to add questions or topics. Login with the correct username & password",
      });
    } else {
      // Create and Save a new Topics using the TopicModel
      // constructor imported and passing in the Array of Objects
      // received from the body of the request.

      // Call the insertMany() method from the contructor

      console.log("WERE IN!!!!!!!");

      Topic.insertMany(newTopicsArray, function (err, topicDocs) {
        if (err) {
          console.log(err);
          res.status(500).send({
            message:
              "Oops! There is an error in adding multiple Topics to the database",
          });
        } else {
          console.log("Yay! Array of New Topics added to database!", topicDocs);
          // Send back the Question documents inserted
          res.send(topicDocs);
        }
      });
    }
  });
};
