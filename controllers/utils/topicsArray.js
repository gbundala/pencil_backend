// Importing fetch from the 'node-fetch' library
const fetch = require("node-fetch");

// Grab the ids of the sheets to be included in the URL
// We grab the id of the google sheets for the task to
// convert the values of the cells in the rows and columns
// into JSON array and objects that will be added to the
// MongoDB database in form of database documents
const googleSheetId = "1Ti55VxyW5MAWG8B9zNf6kynVdMXTY_W9ZyHzTB5VqmE";
const baseUrl = `https://docs.google.com/spreadsheets/d/${googleSheetId}/gviz/tq?`;
const tab1 = "Questions";
const tab2 = "Topics";

// Define the query variable that holds the result of calling
// the encodeURIComponent to ensure that the query is encoded
// appropriately before concatenated to the URL string
const query = encodeURIComponent("Select *");

// Url for the topics tab
const topicsQueryUrl = `${baseUrl}&sheet=${tab2}&tq=${query}`;

async function topicsArray() {
  try {
    // Call the fetch method to connect to 'Topics' tab in the
    // google sheet
    const response = await fetch(topicsQueryUrl);

    // Convert the response to text
    const textResponse = await response.text();

    // Then we convert the data into JSON format after we slice
    // the initial 47 character and last 2 characters that are
    // not in the body of the object returned
    const jsonData = await JSON.parse(textResponse.slice(47, -2));

    // Define the arrays to store the topics for each
    // of the levels
    const topicsLevel1 = [];
    const topicsLevel2 = [];
    const topicsLevel3 = [];

    // We navigate to table.rows to grab the array of all the
    // rows in the google sheet
    const allRows = jsonData.table.rows;

    // We then iterate over the rows and push to the respective
    // arrays, the topics for each the rows
    for (let i = 0; i < allRows.length; i++) {
      topicsLevel1.push(allRows[i].c[0] && allRows[i].c[0].v);
      topicsLevel2.push(allRows[i].c[1] && allRows[i].c[1].v);
      topicsLevel3.push(allRows[i].c[2] && allRows[i].c[2].v);
    }

    // We use the Set() method to create new sets and spread them
    // in the array literal [] in order to create arrays of unique
    // values for each of the levels. This is necessary due to
    // there being repeat values for certain topics. Mostly
    // in level1 and level2, however we also do that for level3
    // to ensure we only store unique questions as well and for
    // consistency.
    // Hence defensibility in our coding style.

    const uniqueTopicsLevel1 = [...new Set(topicsLevel1)];
    const uniqueTopicsLevel2 = [...new Set(topicsLevel2)];
    const uniqueTopicsLevel3 = [...new Set(topicsLevel3)];

    // CREATING THE TOPICS OBJECTS FOR EACH OF THE LEVELS
    // SEPARATELY DUE TO THE SUBTLE DIFFERENCES IN EACH

    // ITERATING THROUGH THE TOPICS TO CREATE THE OBJECTS

    // Now lets iterate through each of the topics at each of the
    // levels and query for the string topic values in the
    // adjacent columns on the right hand side in order to
    // get the Array of 'subTopics'

    // We use the Promise.all() method to ensure that all the
    // promise calls (especially those that query the values)
    // in the google sheet are complete before we return from the
    // async function. We also have defined the array to be an
    // async function as we are using the async - await pattern
    // along with the try catch block instead of the .then()
    // promise chaining

    // 1. Starting with uniqueTopicsLevel1
    // ------------------------------------------------------------

    const topicsAndSubTopicsLevel1 = await Promise.all(
      uniqueTopicsLevel1
        .filter((el, idx) => idx !== 0)
        .map(async (topic) => {
          // HINT: We have filtered first before mapping through
          // In order to Ignore the first row at the top as it is
          // for title/headings

          // Cast to topic into a string to defensively ensure that
          // we are working with a string in the url query
          topicString = topic.toString();

          // Initialize the leve1SubTopics array where the subtopics
          // will be pushed into it as a result of the query to get
          // the adjacent sub-topics to the right of the topic cells
          // of interest
          let leve1SubTopics = [];

          // Lets query now

          // Query for the topicsAndTopicsLevel1
          let queryLevel1 = encodeURIComponent(
            `Select B,C WHERE A="${topicString}"`
          );

          // Url for the topicsAndTopicsLevel1 Query
          const topicsQueryUrlLevel1 = `${baseUrl}&sheet=${tab2}&tq=${queryLevel1}`;

          // Make the fetch call
          try {
            const res = await fetch(topicsQueryUrlLevel1);

            const textRes = await res.text();

            const jsonData = await JSON.parse(textRes.slice(47, -2));

            const dataRows = jsonData.table.rows;

            // KEY: We iterate over the dataRows up to two levels and
            // pluck out the values

            for (let i = 0; i < dataRows.length; i++) {
              let subArrayInRows = dataRows[i] && dataRows[i].c;

              //
              for (let j = 0; j < subArrayInRows.length; j++) {
                if (subArrayInRows[j].v) {
                  leve1SubTopics.push(
                    subArrayInRows[j].v && subArrayInRows[j].v
                  );
                }
              }
            }
          } catch (err) {
            console.error(err);
          }

          // Return the object that will be pushed to MongoDB as a
          // topic document

          // NOTE: We invoke the Set method and spread the
          // results into the the array literal [] in order
          // to only have unique values

          // We do not return the parent topic here and allow
          // it to fall back to the mongoose schema default
          // value of "N/A" as all the level1 topics don't
          // have any parent topic, just sub topics
          return {
            topicName: topic,
            topicLevel: 1,
            subTopics: [...new Set(leve1SubTopics)],
          };
        })
    );

    // 2. Starting with uniqueTopicsLevel2
    // ------------------------------------------------------------

    const topicsAndSubTopicsLevel2 = await Promise.all(
      uniqueTopicsLevel2
        .filter((el, idx) => idx !== 0)
        .map(async (topic) => {
          // HINT: We have filtered first before mapping through
          // In order to Ignore the first row at the top as it is
          // for title/headings

          // Cast to topic into a string to defensively ensure that
          // we are working with a string in the url query
          topicString = topic.toString();

          // Initialize the level2SubTopics array where the subtopics
          // will be pushed into it as a result of the query to get
          // the adjacent sub-topics to the right of the topic cells
          // of interest
          // Also initialize the level2ParentTopics array
          let level2SubTopics = [];
          let level2ParentTopics = [];

          // Lets query now

          // Query for the topicsAndTopicsLevel2
          // At column B the only subTopics would be found on column C
          // Hence we only select the values at column C

          let queryLevel2 = encodeURIComponent(
            `Select C WHERE B="${topicString}"`
          );

          //   This one is to get to know the parentTopic
          let queryLevel2Parent = encodeURIComponent(
            `Select A WHERE B="${topicString}"`
          );

          // Url for the topicsAndTopicsLevel1 Query
          const topicsQueryUrlLevel2 = `${baseUrl}&sheet=${tab2}&tq=${queryLevel2}`;

          //   Url to get the parentTopic
          const topicsQueryUrlLevel2Parent = `${baseUrl}&sheet=${tab2}&tq=${queryLevel2Parent}`;

          // Make the fetch call

          //  Use promise.all() to make two fetch calls
          // in order to have separate values for the subTopics
          // and parentTopic
          // REF: https://stackoverflow.com/questions/46241827/fetch-api-requesting-multiple-get-requests
          try {
            const [res, resParent] = await Promise.all([
              fetch(topicsQueryUrlLevel2),
              fetch(topicsQueryUrlLevel2Parent),
            ]);

            const textRes = await res.text();
            const textResParent = await resParent.text();

            const jsonData = await JSON.parse(textRes.slice(47, -2));
            const jsonDataParent = await JSON.parse(
              textResParent.slice(47, -2)
            );

            const dataRows = jsonData.table.rows;
            const dataRowsParent = jsonDataParent.table.rows;

            // KEY: We iterate over the dataRows up to two levels
            // and pluck out the values

            for (let i = 0; i < dataRows.length; i++) {
              let subArrayInRows = dataRows[i] && dataRows[i].c;

              // We then iterate in the subarray and grab the
              // string values in the 'v' property
              for (let j = 0; j < subArrayInRows.length; j++) {
                if (subArrayInRows[j].v) {
                  level2SubTopics.push(
                    subArrayInRows[j].v && subArrayInRows[j].v
                  );
                }
              }
            }

            // ITERATING TO GET THE PARENT TOPIC
            // KEY: We iterate over the dataRowsParent up to two
            // levels and pluck out the values

            for (let i = 0; i < dataRowsParent.length; i++) {
              let subArrayInRowsParent =
                dataRowsParent[i] && dataRowsParent[i].c;

              // We then iterate in the subarray and grab the
              // string values in the 'v' property
              for (let j = 0; j < subArrayInRowsParent.length; j++) {
                if (subArrayInRowsParent[j].v) {
                  level2ParentTopics.push(
                    subArrayInRowsParent[j].v && subArrayInRowsParent[j].v
                  );
                }
              }
            }
          } catch (err) {
            console.error(err);
          }

          // Ensure that the values of the array are
          // unique for the parent topics array
          const uniqueLevel2ParentTopics = [...new Set(level2ParentTopics)];

          // Define the parentTopic variable
          let parentTopic;

          // We check for the condition that the length of the
          // array is only one since we only expect there to be
          // only one parent element in the parent topics array
          if (
            uniqueLevel2ParentTopics.length < 2 &&
            uniqueLevel2ParentTopics.length > 0
          ) {
            parentTopic = level2ParentTopics[0];
          }

          // Return the object that will be pushed to MongoDB as a
          // topic document

          // NOTE: We invoke the Set method and spread the
          // results into the the array literal [] in order
          // to only have unique values

          // He we return all the objects since most level2
          // topics have both parent topic and sub topics
          return {
            topicName: topic,
            topicLevel: 2,
            parentTopic: parentTopic,
            subTopics: [...new Set(level2SubTopics)],
          };
        })
    );

    // 3. Starting with uniqueTopicsLevel3
    // ------------------------------------------------------------

    const topicsAndSubTopicsLevel3 = await Promise.all(
      uniqueTopicsLevel3
        .filter((el, idx) => idx !== 0 && el !== null)
        .map(async (topic) => {
          console.log(topic);
          // HINT: We have filtered first before mapping through
          // In order to Ignore the first row at the top as it is
          // for title/headings

          // Cast to topic into a string to defensively ensure
          // that we are working with a string in the url query
          topicString = topic.toString();

          // Initialize the level3SubTopics array where the
          // subtopicswill be pushed into it as a result of the
          // query to get the adjacent sub-topics to the right of
          // the topic cells of interest
          // Also initialize the level3ParentTopics array
          let level3SubTopics = [];
          let level3ParentTopics = [];

          // Lets query now

          // Query for the topicsAndTopicsLevel2
          // At column B the only subTopics would be found on
          // column C Hence we only select the values at column C

          //   This variable defined to query the parentTopics
          let queryLevel3Parent = encodeURIComponent(
            `Select B WHERE C="${topicString}"`
          );

          //   Url to get the parentTopic
          const topicsQueryUrlLevel3Parent = `${baseUrl}&sheet=${tab2}&tq=${queryLevel3Parent}`;

          // Make the fetch call

          //  Use promise.all() to make two fetch calls
          // in order to have separate values for the subTopics
          // and parentTopic
          // REF: https://stackoverflow.com/questions/46241827/fetch-api-requesting-multiple-get-requests
          try {
            const resParent = await fetch(topicsQueryUrlLevel3Parent);

            const textResParent = await resParent.text();

            const jsonDataParent = await JSON.parse(
              textResParent.slice(47, -2)
            );

            const dataRowsParent = jsonDataParent.table.rows;

            // ITERATING TO GET THE PARENT TOPIC
            // KEY: We iterate over the dataRowsParent up to two levels and
            // pluck out the values

            for (let i = 0; i < dataRowsParent.length; i++) {
              let subArrayInRowsParent =
                dataRowsParent[i] && dataRowsParent[i].c;

              // Iterating over the subarray to grab the values
              for (let j = 0; j < subArrayInRowsParent.length; j++) {
                if (subArrayInRowsParent[j].v) {
                  level3ParentTopics.push(
                    subArrayInRowsParent[j].v && subArrayInRowsParent[j].v
                  );
                }
              }
            }
          } catch (err) {
            console.error(err);
          }

          // Ensure that the values of the array are unique for
          // the parent topics array
          const uniqueLevel3ParentTopics = [...new Set(level3ParentTopics)];

          // Define the parentTopic variable
          let parentTopic;

          // We check for the condition that the length of the
          // array is only one since we only expect there to be
          // only one parent element in the parent topics array
          if (
            uniqueLevel3ParentTopics.length < 2 &&
            uniqueLevel3ParentTopics.length > 0
          ) {
            parentTopic = level3ParentTopics[0];
          }

          // Return the object that will be pushed to MongoDB as a
          // topic document

          // NOTE: We invoke the Set method and spread the
          // results into the the array literal [] in order
          // to only have unique values

          // We do not return the subTopics array here and allow
          // it to fall back to the mongoose schema default
          // value of empty array as all the level3 topics don't
          // have any sub topics, just parent topics.
          return {
            topicName: topic,
            topicLevel: 3,
            parentTopic: parentTopic,
          };
        })
    );

    // CONCATENATING THE THREE ARRAYS

    // We then run the concat() array method to combine all the
    // Objects for all the 3 levels into one array
    const allTopicsPencilSpaces = topicsAndSubTopicsLevel1.concat(
      topicsAndSubTopicsLevel2,
      topicsAndSubTopicsLevel3
    );

    return allTopicsPencilSpaces;

    // ------------------------------------------------------------
  } catch (err) {
    console.error(err);
  }
}

module.exports = topicsArray;
