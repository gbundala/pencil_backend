/**
 *
 * TODO: REVIEW THIS ENTIRE FILE (NOT YET REVIEWED)
 *
 * USER MODEL
 *
 *
 *
 * Here we define the schema to work with Mongoose.
 * We defined all the fields that will go into the documents
 * that will be created, updated and pulled from the MongoDB
 * database.
 *
 * In the schema definition below, we include the type that
 * each field is expected to carry but also define whether
 * it is required or not and where is not required we define
 * the default value of the field
 *
 * USE OF BCRYPT FOR PASSWORDS:
 * For passwords we have used the bcrpt library to hash the
 * passwords stored in the database to enhance security.
 * More details on this and the implementation details in
 * the user.controller.js file
 *
 */

// Import the mongoose library
const mongoose = require("mongoose");

// Define the UserSchema to be used to specify the compilation
// of the User model below

// The isAdmin user designation is used to define whether a user
// has admin priviledges which in our case in the current simple
// nature of the application, the only the admin has the right
// to create new questions and topics into the database.

// Also included other designations in the schema: isTutor,
// isSchoolTeacher, isStudent in order to provide for different
// roles and access depending on the designation. This is however
// not so much relevant in the current task, however it is
// appreciated that this sort of designition for the user objects
// would be really useful to the fully fledged
// production application
let UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: false,
    default: false,
  },
  isTutor: {
    type: Boolean,
    required: false,
    default: false,
  },
  isSchoolTeacher: {
    type: Boolean,
    required: false,
    default: false,
  },
  isStudent: {
    type: Boolean,
    required: false,
    default: false,
  },
});

// We create the User model by calling the model()
// method from the
// mongoose library and specify the name of the model "User" as
// well as the Schema Object "UserSchema" defined above
// Documents created in the MongoDB database would represent
// instances of this model and any action to the documents
// are handled by this model
// In essence the model created below is a special constructor
// that is compiled based on the above defined schema
module.exports = mongoose.model("User", UserSchema);
