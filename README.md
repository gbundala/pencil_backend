# Pencil Spaces Backend Task

## Table of Contents

1. Installing, testing and using the application
2. Backend part of the application
3. App security, Key & Credentials
4. Hosted on Heroku and Testing with Postman
5. Requirements of the Task

## Installation, testing and using the application

This application only includes the backend part created with ExpressJS a NodeJS library and MongoDB as the database layer.

If you need to see this application in action in development mode you can download the source files in your local environment then using your preferred terminal navigate to the root of the repository type and run **`npm install`** to install all the dependencies for the server. Then you can start the server with **`npm start`**. This command will run the nodemon script that will be restarting the server on each change you make in the code.

You may also clone the repo from https://github.com/gbundala/pencil_backend in your local environment or download the zip file from Github and follow the steps above.

## Backend part of the application

This RESTful API is created with Express.js, a popular Node.js library that simplifies the development of api with JavaScript.

The routes for the API have been developed in the `routes` directory (inside the `index.js` file).

Included in the backend code is the controller file and models file. The model file is used to define the `Schema` which provides the structure and design of how the data is store in the MongoDB database through the `mongoose` library.

The controller file defines all the business logic for handling the routes when an action triggered in the frontend hits one of the routes. All the actions in the database are handled in the controller file including creating and signing in the user and all the updates made to the user documents regarding the todo lists.

## App Security, Keys and Credentials

To ensure the security of this application, the Helmet library has been used to secure the application.

The MongoDB credentials and JWT keys are stores in **`.env`** file which is included in the `.gitignore` file hence not commited in Git to ensure security of the keys and credentials.

User passwords are hashed using the `bcrypt` library before
being stored in the database.

Scripts, libraries and dependencies used in the application as stored in the `package.json` file in the root directory, such as `npm test` and `npm start` scripts.

## Hosted on Heroku and Testing with Postman

## Requirements of the Task

> Thank you!
