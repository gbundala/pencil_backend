// Import the express library
const express = require("express");

// Create an apiRouter object by calling the Router() method
// on the express library
const apiRouter = express.Router();

// Import the user controller
const user = require("../controllers/user.controller.js");

// Import the question controller
const question = require("../controllers/question.controller");

// Import the topic controller
const topic = require("../controllers/topic.controller");

// ROUTERS

// QUESTION ROUTERS

// 1. POST Request to create a new Question in the database
// Only authenticated users with the isAdmin flag can add a
// question to the database
apiRouter.post("/addQuestion", question.createQuestion);

// 2. POST Request to add Multiple new Questions in the database
// Only authenticated users with the isAdmin flag can add
// questions to the database
apiRouter.post("/addManyQuestions", question.createMultipleQuestions);

// 3. GET Request to access the list of Questions for an
// Authenticated user that match the query filter
apiRouter.get("/search", question.getQuestions);

// TOPIC ROUTERS

// 1. POST Request to create a new Topic in the database
// Only authorized user with the same level of access to
// create a question can create a topic in the database
apiRouter.post("/addTopic", topic.createTopic);

// 2. POST Request to add Multiple new Topics in the database
// Only authenticated users with the isAdmin flag can add
// questions to the database
apiRouter.post("/addManyTopics", topic.createMultipleTopics);

// USER ROUTERS

// 1. POST Request to add a new User to the Users collection
apiRouter.post("/signup", user.createUser);

// 2. POST Request to signin a User
apiRouter.post("/signin", user.userSignIn);

// 3. GET Request to verify the authToken and refresh it
// when the Browser/client is refreshed
apiRouter.post("/refresh", user.refreshToken);

// Exporting the module
module.exports = apiRouter;
