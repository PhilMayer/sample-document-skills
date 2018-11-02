
const BoxSDK = require('box-node-sdk');

require('dotenv').config()
const fs = require('fs')

const Box = require('./Helpers/box.js')
const Rossum = require('./Helpers/rossum.js');

let triggeredEvent;
let finalCallback;

/**
 * This is the main function that the Lamba will call when invoked.
 */
exports.handler = async (event, context, callback) => {
  console.log('Event received. Huzzah!');
  triggeredEvent = event;
  finalCallback = callback
  
  if (isValidEvent()) {
    await processEvent();
  } else {
    console.log('Invalid event');
    callback(null, { statusCode: 200, body: 'Event received but invalid' });
  }
};

/**
 * This is the main function that the Lambda will call when invoked.
 */
function isValidEvent() {
  return triggeredEvent.body
};

async function processEvent() {

  const { body } = triggeredEvent;
  const { source, token } = JSON.parse(body);
  const box = new Box(token.read.access_token, token.write.access_token, source.id, body);

  try {
      // check if the file in question already has skills metadata attached
      const containsMetadata = await box.containsSkillsMetadata()

      if (containsMetadata) {
        console.log('Deleting existing Skills card.');
        await box.deleteExistingMetadata();
      } 
        
      const tempFilePath = await box.downloadFileFromBox();
      const rossumMetadata = await sendToRossum(tempFilePath)
      console.log(rossumMetadata)

      // process Rossum json obj and attach Box Skills card as metadata
      await box.attachMetadataCard(rossumMetadata);
      console.log("Successfully attached skill metadata to Box file");

      finalCallback(null, { statusCode: 200, body: "Custom Skill Success" });
      
    } catch(error) {
      console.log(error);
      finalCallback(null, { statusCode: 200, body: "Error" });
    }
}

async function sendToRossum(filePath) {
  const rossum = new Rossum();

  const uploadedFile = await rossum.uploadFiletoRossum(filePath);
  const invoiceId = uploadedFile.id;
  console.log("Invoice ID:" + invoiceId);

  await rossum.waitForDocumentExtraction(invoiceId);
  console.log('Rossum data Extraction complete');

  const fields = await rossum.getDocumentFields(invoiceId);
  console.log('Data retrieved');

  return rossum.processJSON(fields);
}