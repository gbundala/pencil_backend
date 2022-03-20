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
 * Structure of the Documents:
 *
 * The question field accepts a string and is required.
 *
 * The annotations field accepts an array of string elements
 * which are the topics and sub-topics that relate to the
 * respective question. An array has been chosen here to be
 * a better data structure for this situation since it is allows
 * for flexibility and there are ways to query array in MongoDB
 * https://docs.mongodb.com/manual/tutorial/query-arrays/
 *
 * The flexibility availed by arrays here includes the fact that
 * some questions may have fewer than 5 annotations or in another
 * case (which is obviously not depicted in the task) could
 * contain more than 5 annotations.
 * In this case having embedded fields (in form of Object
 * properties) or having fields with names 'annotation1',
 * 'annotation2', etc... would be limiting and hence could require
 * frequent revision of this Model and revisiting to ensure that
 * we incorporate all the situations that may arise. Constantly
 * changing our Model is not a very efficient approach.
 * Additionally, if we set each annotation to be a field in our
 * document, we may need to have the query check for each field
 * and compare to the same thing; which first of all is a
 * repetition and second could be problematic as we would in some
 * Documents compare and empty field to a value (this is because
 * some questions don't have all the five annotations)
 *
 */

// Import the mongoose library
const mongoose = require("mongoose");

// Define the QuestionSchema to be used to specify the compilation
// of the Question Model below

// Since 'each question will be annotated by one or more
// annotations' then we set that the 'annotations' property
// is required, same for the 'question' property as well

// FIXME: TEST THE TYPE OF [STRING] BELOW AND REPLICATE TO THE OTHER MODELS AS WELL
// REF:https://mongoosejs.com/docs/schematypes.html
// FIXME: also check if the below trim and lowercase methods that are mainly for strings can also apply here where the string is in the array

let QuestionSchema = mongoose.Schema({
  questionNumber: {
    type: Number,
    required: true,
  },
  annotations: {
    type: [String],
    required: true,
    index: true,
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
