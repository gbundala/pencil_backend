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
// from the body of the request
// More details below.

const questionsArrayFromGoogleSheet = require("./utils/questionsArray");

// The 'dotenv' library has already been required/imported
// in server.js and hence accessible here as well.
// We grab the jwt secret key from the custom environment
// variable to be used in the jwt signing method below
const { JWT_SECRET_KEY } = process.env;

// UTILS

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
      // TODO: REVIEW THE NEED FOR THIS STEP, SEE THE INSERTMANY BELOW THIS - IT IS RELEVANT AS THERE IS NO SAVE METHOD DIRECTLY ON THE MODEL. BUT IT SEEMS THERE IS THE INSERTMANY METHOD THERE DIRECTLY -- JUST RECONFIRM THIS IN THE DOCS

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
    2. Adding a Multiple New Question to the questions collection.
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
    console.log("From the Body of Request", newQuestionsArray);

    // IMPORTANT NOTE:
    // The below method has only been invoked once
    // to push the values from the Google Sheet into the
    // database. It can be used for any future request that
    // needs to pull data from the database however in
    // normal instances we expect data to come from the
    // body of the request from the fronend as we grab
    // it above in the 'newQuestionsArray' variable

    // Grab the questionsArray from the utils function
    // that returns the array of questions from the Task
    // Google Sheet
    const gsheetQuestionsArray = await questionsArrayFromGoogleSheet();

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
        // Create and Save a new Questions using the QuestionModel
        // constructor imported and passing in the Array of Objects
        // received from the body of the request.

        // Call the insertMany() method from the contructor

        Question.insertMany(gsheetQuestionsArray, function (err, questionDocs) {
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
    3. GET QUESTIONS 
    ------------------------------------------------------------
*/
// FIXME: BE SURE to explain why you have used a certain approach or schema. and also in the comments explain what the alternative would have been. Do this here or above in the architecture explanation. While explaining ensure you explain in terms of the impact on performance. for instance whether you use annotations: [ ] as an array or have each annotation as a field (e.g annotation1, annotation2 etc ) and and check the performance using .explain("executeStats") and compare the stats for both approaches -- this way you appear to be more methodical and scientific in your coding approach.

// Retrieving all the information for all todos in the database
exports.getQuestions = function (req, res) {
  //   Grab the 'name of topic' from the query string
  // FIXME: Trim and toString the queryTopic before invoking the search below

  const queryTopic = req.query.q.toString().trim();
  // FIXME: DELETE AND SEE IF TO ADD A TRIM OR TOSTRING() ON THE ABOVE QUERY TOPIC GRABBED FROM THE URL QUERY STRING
  console.log("QUERY TOPIC", queryTopic);

  // Grab the auth from the header and get the token
  const authHeader = req.headers["authorization"];
  const authToken = authHeader.split(" ")[1];

  // Calling the jwt.verify method to verify the Identity of
  // Authenticated user by verifying the authToken

  // Hint: We define the callback function to an async function
  // in order to be able to user the 'await' keyword inside it
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
        // TODO: I have just flipped the logic on its head
        // just review and confirm [it hasnt work -- revert back]

        // Get the array of topics and sub-topics that fall
        // under the 'queryTopic'

        // TODO: SEE HOW and WHERE to handle the situation whether the queryTopic entered by the user is not in our database or is incorrect

        const querySubTopicsDoc = await Topic.findOne({
          topicName: queryTopic,
        }).exec();

        // Grab the array in the doc from the 'subTopics' field
        const querySubTopics = querySubTopicsDoc.subTopics;

        // FIXME: DELETE LOGS
        console.log("QUERY SUBTOPICS DOCUMENT", querySubTopicsDoc);
        console.log("QUERY SUBTOPICS ARRAY", querySubTopics);

        //   FIXME: delete this is depends on the flipping on head approach
        //  Get the array of Annotations to map through them
        // const annotations

        // map through the queriedTopics retrieved from the topics
        // collection and for each of the topics and sub-topics
        // retrieved, find the question object that has this topic
        // or sub-topic as part of its annotations

        // The query filter below is inline with the documentation
        // regarding any element of the array field 'annotations'
        // satisfies any elements of the 'queriedTopics':
        // https://docs.mongodb.com/manual/tutorial/query-arrays/#query-an-array-with-compound-filter-conditions-on-the-array-elements

        // The `$in` operator has been useful here to check whether
        // any of the elements in the annotations array field
        // equals to any of the elements in the querySubTopics array
        // along with the 'queryTopic' itself.
        // So we check if any elements in one array is equal to any
        // element in the other array, then we retrieve that
        // document (Quite interesting!)
        // https://docs.mongodb.com/manual/reference/operator/query/in/#use-the--in-operator-to-match-values-in-an-array
        Question.find(
          { annotations: { $in: [queryTopic, ...querySubTopics] } },
          function (err, questionDocs) {
            if (err) {
              console.log(err);
              res.status(500).send({
                message:
                  "Oops! There is an error in retrieving the Question document from the database",
              });
            } else {
              // Response: Send back the just the question number
              // as per the task requirement
              const questionNumbers = questionDocs.map((doc) => {
                return doc.questionNumber;
              });
              console.log("RETURNED BACK ARRAY", questionNumbers);
              console.log("RETURNED BACK NUMBERS", questionDocs);
              // FIXME: See how you can just send back an array of the 'question' fields only!! DONE ABOVE!!
              // Requirement: The response to this query, should be
              // an array of question numbers, that match the
              // following requirement.
              // TODO: Update what we send to be the filteredDoc (change its name though)
              res.send(questionNumbers);
            }
          }
        );

        // TODO: The below is key for documentation in README screenshot the terminal after running it with all the data and put in readme. Then delete the below (or leave it - depends - jsut see the relevance of leaving it or if it affects anything)
        // .explain("executionStats")
        // .then((res) => {
        //   console.log("RESPONSE INSIDE EXPLAIN CHAIN", res);
        //   return res[0];
        // });

        // FIXME: VISIT THE BELOW AND DELETE
        // queriedTopics.forEach((topic) => {
        //   // Call the findById mongoose/MongoDB method
        //   // TODO: Now see on how to incorporate index on the below
        //   // FIXME: Note; I have two options here
        //   // 1. I use object properties (annotation1, annotation2, .
        //   // ..etc) instead of an array and then follow the approach below
        //   // { <field1>: <value>, <field2>: <value> ... }
        //   // Reference: https://docs.mongodb.com/manual/reference/method/db.collection.find/
        //   // 2a. I keep the array of annotations in the Questions document and use  "arrayField.$" : 1" . Refer to the ame link above for details
        //   // 2b. Or actually use the $elementMatch keyword
        //   // https://docs.mongodb.com/manual/reference/operator/query/elemMatch/
        //   // #3. This goes along with #2b above: Ooh we actually
        //   // we could just spread the queriedTopics after $elemMatch
        //   // see this :{ annotations: {$elemMatch: {...queriedTopics}} } . Just revisit
        //   // RERENCE ON INDEXES: https://www.digitalocean.com/community/tutorials/how-to-use-indexes-in-mongodb
        // });
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
