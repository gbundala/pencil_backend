# Pencil Spaces Backend Task

## Table of Contents

1. Installing, testing and using the application
2. Frontend part of the application
3. Backend part of the application
4. App security, Key & Credentials

## Installation, testing and using the application

This application includes both the frontend created with ReactJS and the backend part created with ExpressJS.

If you need to see this application in action in development mode you can download the source files in your local environment then using your preferred terminal navigate to the root of the repository type and run **`npm install`** to install all the dependencies for the server. Then you can start the server with **`npm start`**. This command will run the nodemon script that will be restarting the server on each change you make in the code. Then `cd` into the `frontend` directory and do the same by running **`npm install`** to install the ReactJS dependencies in the frontend then run **`npm start`** as well to start the frontend part of the application. Then navigate to http://localhost:3000/. This will open a page in your default browser that will show the user interface of the application.

You may also clone the repo from https://github.com/gbundala/todo-appV2 in your local environment or download the zip file from Github and follow the steps above.

## Frontend part of the application

The frontend is created with ReactJS. The main component TodoList handles most of the data fetching logic which is making the GET requests to the ExpressJS API which is our custom API which then handles the logic to store and retrieve data from our MongoDB database. The "fetch" browser API is used to make these data fetching requests in the frontend.

The fetch API is also used to make PUT requests to update the user documents when the user makes certain changes such as adding a new todo item, deleting or editing a todo item.

The other component which communicate to the server are the signup and signin components that make the POST requests to create a new user and to sign the user into the application through the user of `JWT` tokens as a security feature.

We make use of `React-Router` library to enable easy and proper navigation in the frontend (client) application due to its powerful API.

Children to the main component mentioned above handle the presentation of the individual added todo list items as well as the overall presentation but also allow for the user to trigger actions from the child component to call event handler functions that are defined in the parent.

## Backend part of the application

This RESTful API is created with Express.js, a popular Node.js library that simplifies the development of api with JavaScript.

The routes for the API have been developed in the `routes` directory (inside the `index.js` file).

Included in the backend code is the controller file and models file. The model file is used to define the `Schema` which provides the structure and design of how the data is store in the MongoDB database through the `mongoose` library.

The controller file defines all the business logic for handling the routes when an action triggered in the frontend hits one of the routes. All the actions in the database are handled in the controller file including creating and signing in the user and all the updates made to the user documents regarding the todo lists.

## App Security, Keys and Credentials

To ensure the security of this application, the Helmet library has been used to secure the application.

The MongoDB credentials and JWT keys are stores in **`.env`** file which is included in the `.gitignore` file hence not commited in Git to ensure security of the keys and credentials.

Scripts, libraries and dependencies used in the application as stored in the `package.json` file in the root directory, such as `npm test` and `npm start` scripts.

> Enjoy Coding!
