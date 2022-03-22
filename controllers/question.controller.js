/**
 * TODO: REVISIT THIS
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

// Import the questionsArray method from the utils
// folder to be used to pull the data from the
// Google Sheet into an JSON format ready to
// sent to MongoDB database
// Hint: The usecase is here is only one-time
// in a normal use cases for a production
// application we would be getting the data
// from the body of the request, hence the respective
// code for pulling the google sheet data has been
// commented out after invoking it once.

// More details below.

const questionsArrayFromGoogleSheet = require("./utils/questionsArray");

// The 'dotenv' library has already been required/imported
// in server.js and hence accessible here as well.
// We grab the jwt secret key from the custom environment
// variable to be used in the jwt signing method below
const { JWT_SECRET_KEY } = process.env;

// CONTROLLERS

/* 
    1. Adding a new Question to the questions collection.
    ------------------------------------------------------------
*/

// Creating a new Question in the database
exports.createQuestion = function (req, res) {
  // Grab the question object from the body of the request
  const newQuestion = req.body;

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
      // Create and Save a new Question using the QuestionModel
      // constructor and passing in the Object received from the
      // body of the request.
      let questionModel = new Question({
        ...newQuestion,
      });

      // Call the save method to create a new question
      questionModel.save(function (err, questionDoc) {
        if (err) {
          console.log(err);
          res.status(500).send({
            message:
              "Oops! There is an error in adding the Question to the database",
          });
        } else {
          console.log(
            "Yay! New Question has been added to database!",
            questionDoc
          );
          // Send back the Question document
          res.send(questionDoc);
        }
      });
    }
  });
};

/* 
    2. Adding Multiple New Question to the questions collection.
    ------------------------------------------------------------
*/

// Creating Multiple Questions in the database at once
exports.createMultipleQuestions = async function (req, res) {
  // We use the try-catch block here to ensure that any
  // error that occurs at any stage in the code execution
  // is being gracefully handled to prevent the server
  // from crashing.
  try {
    // Grab the questions Array from the body of the request
    const newQuestionsArray = req.body;

    /**
     *
     * IMPORTANT NOTE:
     *
     **/

    // The below method has only been invoked once
    // to pull the values from the Google Sheet and push to
    // thedatabase. It can be used for any future request that
    // needs to pull data from a Google Sheet however in
    // normal instances we expect data to come from the
    // body of the request from the frontend as we grab
    // it above in the 'newQuestionsArray' variable from the
    // body of the request

    // The code below is therefore commented out to avoid
    // duplicating the process of adding the 199 questions
    // again into MongoDB database

    // Grab the questionsArray from the utils function
    // that returns the array of questions from the Task
    // Google Sheet

    // CODE:
    // const gsheetQuestionsArray = await questionsArrayFromGoogleSheet();

    // Grab the auth from the header and get the token
    const authHeader = req.headers["authorization"];
    const authToken = authHeader.split(" ")[1];

    // Calling the jwt.verify method to verify the Identity of
    // Authenticated user by verifying the authToken

    // We then check whether the user is an Admin and only
    // honor the request if the user is an admin, otherwise
    // we send back the 'Unauthorized Error 401'

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
        // Create and Save new Questions using the QuestionModel
        // constructor imported and passing in the Array of
        // Objects received from the body of the request.

        // Call the insertMany() method from the contructor

        Question.insertMany(newQuestionsArray, function (err, questionDocs) {
          if (err) {
            console.log(err);
            res.status(500).send({
              message:
                "Oops! There is an error in adding multiple Questions to the database",
            });
          } else {
            console.log(
              "Yay! Array of New Questions added to database!",
              questionDocs
            );
            // Send back the Question documents inserted
            res.send(questionDocs);
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

/* 
    3. GET Request to access the list/array of question numbers
    // that match search requirement 
    ------------------------------------------------------------
*/

// Retrieving all the information for all todos in the database
exports.getQuestions = function (req, res) {
  // Grab the 'name of topic' from the query string
  // Trim and toString the queryTopic before invoking the search
  // below. We ensure that the filter works even if there are
  // leading and trailing spaces in the query string

  const queryTopic = req.query.q.toString().trim();

  // Grab the auth from the header and get the token
  // We only want authenticated user to successfully make
  // the query and get the list of questions
  const authHeader = req.headers["authorization"];
  const authToken = authHeader.split(" ")[1];

  // Calling the jwt.verify method to verify the Identity of
  // Authenticated user by verifying the authToken

  // Hint: We define the callback function to an async function
  // in order to be able to use the 'await' keyword inside it
  // We want to ensure that the query in the 'topics' collection
  // finishes running before the next line of code is executed
  // because it relies on the results from the query in the
  // 'topics' collection.
  // If we don't await then we may get bugs as a result of
  // a race condition or execution of code without the respective
  // data or array for this instance (e.g. error: "when you
  // call an array method on a variable that does not yet
  // contain an array").
  // e.g. TypeError: querySubTopics is not iterable
  jwt.verify(authToken, JWT_SECRET_KEY, async function (err, user) {
    // We use the try-catch block here to ensure that any
    // error that occurs at any stage in the code execution
    // is being gracefully handled to prevent the server
    // from crashing.
    try {
      if (err) {
        console.log(err);
        res.status(401).send({
          error: true,
          message:
            "You don't have permission to perform this action. Login with the correct username & password",
        });
      } else {
        // Get the array of topics and sub-topics that fall
        // under the 'queryTopic'

        // KEY: The following  point below is IMPORTANT to the
        // REQUIREMENT 4 of the task:

        // Due to the design of the database and schema,
        // all topics are stored in documents, hence this
        // makes any query to any topic regardless of where
        // it is in the topics tree to be very efficient.
        // Further the 'topicName' field is indexed to enhance
        // the efficieny and speed of the query.
        // Therefore whether the topic is at the root or at the
        // end of the topics tree the query would use the same
        // amount of time (other factors being constant) and it
        // would make the same number of searches to get to the
        // document.

        // Once the topicName document is found in the database,
        // it returns the document and grab the array of sub
        // topics by accessing the subTopics field

        const querySubTopicsDoc = await Topic.findOne({
          topicName: queryTopic,
        }).exec();

        // If the 'name of topic' is not found or the user has
        // erroneously entered a wrong topic that is not in the
        // database we respond by sending a 404 error response to
        // the user to notify them to recheck the query string
        // and try again.
        // This will enhance the user experience as the user
        // is directed to know what is problem while maintaining
        // the security of our application and server.
        // Also sending a 404 error provide better/ more accurate
        // information to the user rather than a generic 500 error
        // code response. Hence the better UX

        if (!querySubTopicsDoc) {
          console.log("Error 404: The topic name is not found in the database");

          res.status(404).send({
            error: true,
            message:
              "The name of topic you have searched is not found, please check if it is correct and try again!",
          });
        } else {
          // Grab the array in the doc from the 'subTopics' field
          const querySubTopics = querySubTopicsDoc.subTopics;

          //  Query Filter

          // We include both the queryTopic and the spread the
          // elements of the querySubTopics array in the filter.
          // This way MongoDB searches through the for the
          // annotations field and returns the 'question' document
          // if any element in the annotations array matches any
          // element in the query.
          // We have indexed the 'annotations' field which
          // enhances further the query process.

          // The query filter below is inline with the
          // documentation regarding any element of the array
          // field 'annotations' satisfies any elements of the
          // 'queriedTopics':

          // https://docs.mongodb.com/manual/tutorial/query-arrays/#query-an-array-with-compound-filter-conditions-on-the-array-elements

          // The `$in` operator has been useful here to check
          // whether any of the elements in the annotations array
          // field equals to any of the elements in the
          // querySubTopics array along with the 'queryTopic'
          // itself.

          // So we check if any elements in one array is equal to
          // any element in the other array, then we retrieve that
          // document (Quite interesting!)

          // https://docs.mongodb.com/manual/reference/operator/query/in/#use-the--in-operator-to-match-values-in-an-array
          Question.find(
            { annotations: { $in: [queryTopic, ...querySubTopics] } },
            function (err, questionDocs) {
              if (err) {
                console.log(err);
                res.status(500).send({
                  error: true,
                  message:
                    "Oops! There is an error in retrieving the Question document from the database",
                });
              } else {
                // Response: Send back the just the question
                // number as per the task requirement
                // We map through the array of docs and return
                // a new array 'questionNumbers' that only
                // contains the numbers
                const questionNumbers = questionDocs.map((doc) => {
                  return doc.questionNumber;
                });

                //  KEY: As per REQUIREMENT 3 of the task, we send
                // back the array of question numbers
                res.send(questionNumbers);
              }
            }
          );

          // TESTING FOR SPEED OF EXECUTION WITH INDEXES

          // The code below is commented out but kept here
          // as it is useful in testing for the impact of
          // indexes in the questions and topics collection
          // to the speed of the search and efficiency of the
          // queries to the database.

          // Further details on this in the README documentation
          // however a key highlight is that it was noted that
          // only 5 documents were examined when we introduced
          // indexes to the question objects as oppossed to
          // a collection scan of the entire set of 199 questions
          // when searching without the use of indexes

          // TESTING CODE:
          // .explain("executionStats")
          // .then((res) => {
          //   console.log("RESPONSE INSIDE EXPLAIN CHAIN", res);
          //   return res[0];
          // });
        }
      }
    } catch (err) {
      console.error("Error in Retrieving Data: ", err);

      res.status(500).send({
        message:
          "Oops! There is an error in retrieving Question Numbers from the database",
      });
    }
  });
};
