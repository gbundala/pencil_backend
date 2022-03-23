/**
 *
 * TOPIC MODEL
 *
 *
 * Here we define the schema to work with Mongoose for the
 * documents inside the 'topics' collection in the database.
 *
 * We defined all the fields that will go into the documents
 * that will be created and retrieved from the MongoDB
 * database in accordance with the requirements for the API
 * specifications.
 *
 * In the schema definition below, we include the type that
 * each field is expected to carry but also define whether
 * it is required or not and where it is not required we define
 * the default value of the document field.
 *
 * SCHEMA & ARCHITECTURE
 *
 * Structure of the Documents and Topics Collection Architecture:
 *
 * The schema optimises for the retrival of the topic documents
 * and it also optimises for the quick access and efficiency in
 * the retrival of the sub-topics.
 *
 * Each topic has a document with fields that link to the parent
 * topic, level of the topic and a field with array of the
 * sub-topics to that topic. Obviously the level 3 topics will
 * not have sub-topics and the level 1 topics with not have a
 * parent topic hence both the 'parentTopic' and 'subTopics'
 * fields are not required and hence have default values of 'N/A'
 * and empty array '[]' respectively.
 *
 * Nonetheless, this kind of schema has trade-offs. There is
 * duplication of data in the collection as a topic with its
 * own document may also be included as part of the elements of
 * the 'subTopics' array or as a value of the 'parentTopic' in
 * another document. This nature of denormalized data in the
 * database would result to increased storage costs as the
 * number of topics increase (when the company expands) since
 * we should expect more document than a structure where we
 * normalize the data in the database. Recording of data is also
 * a cost though at a very small scale because due to the nature
 * of the business we expect significantly less 'data creation'
 * operations compared to 'data retrieval' operations hence the
 * justification for optimising for 'data retrival' than 'data
 * creation' and 'data storage' costs.
 *
 * However, this architecture is very efficient and optimises for
 * the retrieval of data which is advantageous in many ways as
 * it ensures efficiency in the quering of data at any level of
 * the topics. This will provide a much better user experience
 * and less cost and latency in the retrival of data.
 *
 * Additionally, with the use of indexes in MongoDB the efficiency
 * of searching a large collection of documents is significantly
 * increased and hence adds to the argument of optimising for
 * efficiency and allowing there to be more documents in the
 * collection (than for another schema architecture) as the
 * documents can easily be queried through the powerful support
 * of indexes.
 *
 * Therefore, it is deemed that this is the approapriate structure
 * and schema as we aim for efficient queries and the retrival of
 * data. We would need to find ways to enhance the database for
 * scalability such as allowing for horizontal scalability but
 * also ensure that the frontend is properly coded to collect
 * sufficient data necessary according to the schema.
 *
 * TODO: Add details below and include this in the question model
 * as well
 * TODO: Speak of the index prop added to topicName below
 *
 * INDEXES
 * Added index to the topicName to enhance the efficiency of the
 * search for the topics documents
 *
 * https://mongoosejs.com/docs/guide.html#indexes
 *
 * When the application starts up, Mongoose automatically calls
 * createIndex() for each defined index in the schema
 *
 * https://docs.mongodb.com/manual/indexes/
 * Indexes support the efficient execution of queries in MongoDB
 *
 */

// Import the mongoose library
const mongoose = require("mongoose");

// Define the TopicSchema to be used to specify the compilation
// of the Topic Model below inline with the documetation above
// relating to the structure and architecture of the 'topics'
// collection in the database

let TopicSchema = mongoose.Schema({
  topicName: {
    type: String,
    required: true,
    index: true,
  },
  topicLevel: {
    type: Number,
    required: true,
  },
  parentTopic: {
    type: String,
    required: false,
    default: "N/A",
  },
  subTopics: {
    type: [String],
    required: false,
    default: [],
  },
});

// We create the Topic Model by calling the model()
// method from the mongoose library and specify the name
// of the model "Topic" as well as the Schema Object
// "TopicSchema" as defined above.

// Documents created in the MongoDB database 'topics' collection
// would represent instances of this model and any action to the
// documents are handled by this model.

// In essence the model created below is a special constructor
// that is compiled based on the above defined schema
module.exports = mongoose.model("Topic", TopicSchema);
