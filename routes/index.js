// Import the express library
const express = require("express");

// Create an apiRouter object by calling the Router() method
// on the express library
const apiRouter = express.Router();

// Import the user controller
const user = require("../controllers/user.controller.js");

// ROUTERS

// 1. POST Request to add a new User to the Users collection
apiRouter.post("/signup", user.createUser);

// 2. POST Request to signin a User
apiRouter.post("/signin", user.userSignIn);

// 3. PUT Request to Update a User document with the
// updated todoList array after adding new todoItem
apiRouter.put("/addTodoItem", user.addNewTodoItem);

// 4. PUT Request to Update a User document with the updated
// todoList array after deleting a todoItem
apiRouter.put("/deleteTodoItem", user.deleteTodoItem);

// 5. PUT Request to Update a User document with the updated
// todoList array after editing a todoItem
apiRouter.put("/editTodoItem", user.editTodoItem);

// 6. GET Request to access the list of Todos for an
// Authenticated user
apiRouter.get("/getTodos/:id", user.getTodos);

// 7. GET Request to verify the authToken and refresh it
// when the Browser/client is refreshed
apiRouter.post("/refresh", user.refreshToken);

// Exporting the module
module.exports = apiRouter;
