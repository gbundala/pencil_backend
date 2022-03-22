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

// Url for the questions tab
const questionsQueryUrl = `${baseUrl}&sheet=${tab1}&tq=${query}`;

// Initiate the questionsArray to store the questions objects
const questionsArray = [];

async function questionsArrayFromGoogleSheet() {
  try {
    // Call the fetch method to connect to the 'Questions'
    // tab inside the Task google sheet
    const res = await fetch(questionsQueryUrl);

    // We the convert the response into text
    const textRes = await res.text();

    // Then we convert the data into JSON format after we slice
    // the initial 47 character and last 2 characters that are
    // not in the body of the object returned
    const jsonData = await JSON.parse(textRes.slice(47, -2));

    // Define the headings of the sheet and initiate as
    // an array that will hold the strings of the headings
    // to be iterated over
    const headings = [];

    // We then access the columns and iterate over them and push
    // the title labels to the headings array defined above
    // We also remove any spaces between the characters in the
    // heading title strings to maintain consistency of the data
    jsonData.table.cols.forEach((col) => {
      if (col.label) {
        headings.push(col.label.toLowerCase().replace(/\s/g, ""));
      }
    });

    // Now iterate over the rows
    jsonData.table.rows.forEach((row) => {
      // Define each question object
      const questionObj = {};

      // Now for each of the headings we assign the value of it
      // respective row
      headings.forEach((headingTitle, idx) => {
        questionObj[headingTitle] = row.c[idx] !== null && row.c[idx].v;
      });

      //   we then push objects to the questions array
      questionsArray.push(questionObj);
    });

    // We now map over the questions array in order to re-define
    // the objects to align with our schema for the database
    const qnArray = questionsArray.map((questionDoc) => {
      const annotations = Object.values(questionDoc);

      // We filter through the annotation to only have those
      // with string values. Hence filter out any null values
      // from the array of annotations
      filteredAnnotations = annotations.filter(
        (annot) => typeof annot === "string"
      );

      // Return the objects that are in line with the
      // schema for the Question documents in MongoDB
      return {
        questionNumber: questionDoc.questionnumber,
        annotations: [...filteredAnnotations],
      };
    });

    return qnArray;
  } catch (err) {
    console.error(err);
  }
}

module.exports = questionsArrayFromGoogleSheet;
