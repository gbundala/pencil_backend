/**
 *
 * QUESTION MODEL
 *
 *
 * Here we define the schema to work with Mongoose for the
 * documents inside the questions collection in the database.
 *
 * We defined all the fields that will go into the documents
 * that will be created and retrieved from the MongoDB
 * database in accordance with the requirements for the API
 * specifications.
 *
 * In the schema definition below, we include the type that
 * each field is expected to carry but also define whether
 * it is required or not and where is not required we define
 * the default value of the field
 *
 */

// Import the mongoose library
const mongoose = require("mongoose");

// Define the QuestionSchema to be used to specify the compilation
// of the Question Model below

// Since 'each question will be annotated by one or more
// annotations' then we set that the 'annotations' property
// is required, same for the 'question' property as well

let QuestionSchema = mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  annotations: {
    type: mongoose.Schema.Types.Array,
    required: true,
  },
});

// We create the Question Model by calling the model()
// method from the mongoose library and specify the name
// of the model "Question" as well as the Schema Object
// "QuestionSchema" as defined above.

// Documents created in the MongoDB database would
// represent instances of this model and any action to the
// documents are handled by this model.

// In essence the model created below is a special constructor
// that is compiled based on the above defined schema
module.exports = mongoose.model("Question", QuestionSchema);
