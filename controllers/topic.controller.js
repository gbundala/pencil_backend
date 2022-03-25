/**
 *
 *
 *
 * TOPIC CONTROLLER
 *
 * Refer to the questions.controller for the overral architecture
 * for the project. Essencially it is an MVC architecture.
 *
 * Here we define all the CRUD operations in the
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
 * In terms of the overral structure of the 'topics' collection
 * each topic has a separate document which provides advantage
 * in terms of efficiency in the query as we optimise for data
 * retrieval than storage and insertion as we expect there to
 * be more data retrieval operations that insertion hence a
 * fair evaluation. Hence despite there being increased cost
 * in terms of storage space with this kind of architecture
 * the benefit more than compensates for the cost.
 *
 * Further details on the structure of each of the documents
 * and the schema in the topic.model.js file
 *
 *
 *
 *
 */

// IMPORTS

// Import the Topic model from the model file
const Topic = require("../models/topic.model");

// Import the jsonwebtoken library
const jwt = require("jsonwebtoken");

// Import the topicsArray utility method that is used to
// pull the data from Google Sheet and convert it into JSON
// in MongoDB friendly format ready to be inserted into the
// database collection.

// However note that this method has only been invoked once
// and then the code below for the invocation has been
// commented out as the normal approach is to have the data
// flow through the body of the request from the frontend
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
    }

    // We only allow an authenticated user with the right
    // priviledges in this case 'isAdmin' priviledge to
    // be able to add a new question or topic to the database
    else if (!user.isAdmin) {
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
    2. Adding Multiple New Topics to the topics collection.
    ------------------------------------------------------------
*/

// Creating Multiple Questions in the database at once
exports.createMultipleTopics = async function (req, res) {
  // We use the try-catch block here to ensure that any
  // error that occurs at any stage in the code execution
  // is being gracefully handled to prevent the server
  // from crashing.
  try {
    // Grab the topics Array from the body of the request
    const newTopicsArray = req.body;

    /**
     * IMPORTANT NOTE:
     */
    // The below method has only been invoked once
    // to pull the values from the Google Sheet and push to
    // the database. It can be used for any future request that
    // needs to pull data from a Google Sheet however in
    // normal instances we expect data to come from the
    // body of the request from the frontend as we grab
    // it above in the 'newTopicsArray' variable from the
    // body of the request

    // The code below is therefore commented out to avoid
    // duplicating the process of adding the 179 topics
    // again into MongoDB database

    // Call the method to retrieve the topics from the
    // google sheet

    // CODE:
    // const newTopicsArray = await topicsArray();

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
      }

      // We only allow an authenticated user with the right
      // priviledges in this case 'isAdmin' priviledge to
      // be able to add a new question or topic to the database
      else if (!user.isAdmin) {
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

        Topic.insertMany(newTopicsArray, function (err, topicsDocs) {
          if (err) {
            console.log(err);
            res.status(500).send({
              message:
                "Oops! There is an error in adding multiple Topics to the database",
            });
          } else {
            console.log(
              "Yay! Array of New Topics added to database!",
              topicsDocs
            );
            // Send back the Topics documents inserted
            res.send(topicsDocs);
          }
        });
      }
    });
  } catch (err) {
    console.error("Error in adding documents to the database");
    res.status(500).send({
      message: "Oops! There is an error in adding documents to the database",
    });
  }
};
