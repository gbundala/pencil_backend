// Importing fetch from the 'node-fetch' library
const fetch = require("node-fetch");

// Grab the ids of the sheets to be included in the URL
const googleSheetId = "1Ti55VxyW5MAWG8B9zNf6kynVdMXTY_W9ZyHzTB5VqmE";
const baseUrl = `https://docs.google.com/spreadsheets/d/${googleSheetId}/gviz/tq?`;
const tab1 = "Questions";
const tab2 = "Topics";

// Define the query variable that holds the result of calling
// the encodeURIComponent to ensure that the query is encoded
// appropriately before concatenated to the URL string
const query = encodeURIComponent("Select *");

// Url for the questions tab
const questionsQueryUrl = `${baseUrl}&sheet=${tab1}&tq=${query}`;

// Url for the topics tab
const topicsQueryUrl = `${baseUrl}&sheet=${tab2}&tq=${query}`;

// The data
const questionsArray = [];

async function topicsArray() {
  try {
    // Call the fetch method to connect to 'Topics' tab in the
    // google sheet
    const response = await fetch(topicsQueryUrl);

    // Conver the response to text
    const textResponse = await response.text();

    // Then we convert the data into JSON format after we slice
    // the initial 47 character and last 2 characters that are
    // not in the body of the object returned
    const jsonData = await JSON.parse(textResponse.slice(47, -2));

    // Define the headings of the sheet and initiate as
    //  an array that will hold the strings of the headings
    // to be iterated over
    // Also define the arrays to store the topics for each
    // of the levels
    const headings = [];
    const topicsLevel1 = [];
    const topicsLevel2 = [];
    const topicsLevel3 = [];

    //
    console.log(jsonData.table.rows[0].c[0]);

    //
    const allRows = jsonData.table.rows;

    //
    console.log("ALL", allRows);

    //
    for (let i = 0; i < allRows.length; i++) {
      topicsLevel1.push(allRows[i].c[0] && allRows[i].c[0].v);
      topicsLevel2.push(allRows[i].c[1] && allRows[i].c[1].v);
      topicsLevel3.push(allRows[i].c[2] && allRows[i].c[2].v);
    }

    // We use the Set() method to create new sets and spread them
    // in the array literal [] in order to create arrays of unique
    // values
    const uniqueTopicsLevel1 = [...new Set(topicsLevel1)];
    const uniqueTopicsLevel2 = [...new Set(topicsLevel2)];
    const uniqueTopicsLevel3 = [...new Set(topicsLevel3)];

    console.log(uniqueTopicsLevel3);

    // TODO: A
    // =====================

    const uniqueTopicsLevel2A = uniqueTopicsLevel2.filter(
      (ele, idx) => idx < 200
    );

    // Now lets iterate through each of the topics at each of the
    // levels and query for the string topic values in the
    // adjacent columns on the right hand side in order to
    // get the Array of 'subTopics'

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

            // console.log("DATA ROWS", dataRows);

            // KEY: We iterate over the dataRows up to two levels and
            // pluck out the values

            for (let i = 0; i < dataRows.length; i++) {
              let subArrayInRows = dataRows[i] && dataRows[i].c;
              //   console.log(subArrayInRows);

              //
              for (let j = 0; j < subArrayInRows.length; j++) {
                // console.log(subArrayInRows[j].v);
                if (subArrayInRows[j].v) {
                  // TODO: You may just remove the && -- just test and check first before removing
                  leve1SubTopics.push(
                    subArrayInRows[j].v && subArrayInRows[j].v
                  );
                }
              }
            }

            // console.log("ARRAY", leve1SubTopics);
          } catch (err) {
            console.error(err);
          }

          // Return the object that will be pushed to MongoDB as a
          // topic document

          // NOTE: We invoke the Set method and spread the
          // results into the the array literal [] in order
          // to only have unique values
          return {
            topicName: topic,
            topicLevel: 1,
            subTopics: [...new Set(leve1SubTopics)],
          };
        })
    );

    // console.log("HURRAY1!", topicsAndSubTopicsLevel1);

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

          //   TODO: Use promise.all() to make two fetch calls
          // in order to have separate values for the subTopics and
          // parentTopic
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

            // TODO: Remember to do the conditional if check if the parent is array is not emptly && its length does not exceed 1 element
            console.log("DATA ROWS", dataRowsParent);

            // KEY: We iterate over the dataRows up to two levels and
            // pluck out the values

            for (let i = 0; i < dataRows.length; i++) {
              let subArrayInRows = dataRows[i] && dataRows[i].c;
              //   console.log(subArrayInRows);

              //
              for (let j = 0; j < subArrayInRows.length; j++) {
                // console.log(subArrayInRows[j].v);
                if (subArrayInRows[j].v) {
                  // TODO: You may just remove the && -- just test and check first before removing
                  level2SubTopics.push(
                    subArrayInRows[j].v && subArrayInRows[j].v
                  );
                }
              }
            }

            // ITERATING TO GET THE PARENT TOPIC
            // KEY: We iterate over the dataRowsParent up to two levels and
            // pluck out the values

            for (let i = 0; i < dataRowsParent.length; i++) {
              let subArrayInRowsParent =
                dataRowsParent[i] && dataRowsParent[i].c;
              //   console.log(subArrayInRows);

              //
              for (let j = 0; j < subArrayInRowsParent.length; j++) {
                // console.log(subArrayInRows[j].v);
                if (subArrayInRowsParent[j].v) {
                  // TODO: You may just remove the && -- just test and check first before removing
                  level2ParentTopics.push(
                    subArrayInRowsParent[j].v && subArrayInRowsParent[j].v
                  );
                }
              }
            }

            console.log("ARRAY", level2SubTopics);
          } catch (err) {
            console.error(err);
          }

          // Ensure that the values of the array are unique for the
          // parent topics array
          const uniqueLevel2ParentTopics = [...new Set(level2ParentTopics)];

          // Define the parentTopic variable
          let parentTopic;

          // We check for the condition that the length of the array
          // is only one since we only expect there to be only one
          // parent element in the parent topics array
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
          return {
            topicName: topic,
            topicLevel: 1,
            parentTopic: parentTopic,
            subTopics: [...new Set(level2SubTopics)],
          };
        })
    );

    // console.log("HURRAY2!", topicsAndSubTopicsLevel2);

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

          // Cast to topic into a string to defensively ensure that
          // we are working with a string in the url query
          topicString = topic.toString();

          // Initialize the level3SubTopics array where the subtopics
          // will be pushed into it as a result of the query to get
          // the adjacent sub-topics to the right of the topic cells
          // of interest
          // Also initialize the level2ParentTopics array
          let level3SubTopics = [];
          let level3ParentTopics = [];

          // Lets query now

          // Query for the topicsAndTopicsLevel2
          // At column B the only subTopics would be found on column C
          // Hence we only select the values at column C

          //   This one is to get to know the parentTopic
          let queryLevel3Parent = encodeURIComponent(
            `Select B WHERE C="${topicString}"`
          );

          //   Url to get the parentTopic
          const topicsQueryUrlLevel3Parent = `${baseUrl}&sheet=${tab2}&tq=${queryLevel3Parent}`;

          // Make the fetch call

          //   TODO: Use promise.all() to make two fetch calls
          // in order to have separate values for the subTopics and
          // parentTopic
          // REF: https://stackoverflow.com/questions/46241827/fetch-api-requesting-multiple-get-requests
          try {
            const resParent = await fetch(topicsQueryUrlLevel3Parent);

            const textResParent = await resParent.text();

            const jsonDataParent = await JSON.parse(
              textResParent.slice(47, -2)
            );

            const dataRowsParent = jsonDataParent.table.rows;

            // TODO: Remember to do the conditional if check if the parent is array is not emptly && its length does not exceed 1 element
            console.log("DATA ROWS", dataRowsParent);

            // ITERATING TO GET THE PARENT TOPIC
            // KEY: We iterate over the dataRowsParent up to two levels and
            // pluck out the values

            for (let i = 0; i < dataRowsParent.length; i++) {
              let subArrayInRowsParent =
                dataRowsParent[i] && dataRowsParent[i].c;
              //   console.log(subArrayInRows);

              //
              for (let j = 0; j < subArrayInRowsParent.length; j++) {
                // console.log(subArrayInRows[j].v);
                if (subArrayInRowsParent[j].v) {
                  // TODO: You may just remove the && -- just test and check first before removing
                  level3ParentTopics.push(
                    subArrayInRowsParent[j].v && subArrayInRowsParent[j].v
                  );
                }
              }
            }

            console.log("ARRAY", level3SubTopics);
          } catch (err) {
            console.error(err);
          }

          // Ensure that the values of the array are unique for the
          // parent topics array
          const uniqueLevel3ParentTopics = [...new Set(level3ParentTopics)];

          // Define the parentTopic variable
          let parentTopic;

          // We check for the condition that the length of the array
          // is only one since we only expect there to be only one
          // parent element in the parent topics array
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
          return {
            topicName: topic,
            topicLevel: 1,
            parentTopic: parentTopic,
          };
        })
    );

    const allTopicsPencilSpaces = topicsAndSubTopicsLevel1.concat(
      topicsAndSubTopicsLevel2,
      topicsAndSubTopicsLevel3
    );

    // console.log("ALL TOPICS PENCIL SPACES!", allTopicsPencilSpaces);

    return allTopicsPencilSpaces;

    // ------------------------------------------------------------
  } catch (err) {
    console.error(err);
  }
}

module.exports = topicsArray;
