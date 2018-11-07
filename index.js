
const Box = require('./Helpers/box.js')
const Rossum = require('./Helpers/rossum.js');

/**
 * This is the main function that the Lambda will call when invoked.
 */
exports.handler = async (triggeredEvent, context, callback) => {
  console.log('Event received. Huzzah!');
  
  if (isValidEvent(triggeredEvent)) {
    await processEvent(triggeredEvent, callback);
  } else {
    console.log('Invalid event');
    callback(null, { statusCode: 200, body: 'Event received but invalid' });
  }
};

function isValidEvent(triggeredEvent) {
  return triggeredEvent.body
};

async function processEvent(triggeredEvent, finalCallback) {
  const { body } = triggeredEvent;
  const box = new Box(body);

  try {
      const containsMetadata = await box.containsSkillsMetadata() // Check if the file already has a Skills card

      if (containsMetadata) {
        console.log('Deleting existing Skills card.');
        await box.deleteExistingMetadata();
      } 
        
      const tempFilePath = await box.downloadFileFromBox();
      const rossumMetadata = await sendToRossum(tempFilePath)

      await box.attachMetadataCard(rossumMetadata); // process Rossum json object and attach Box Skills card as metadata
      console.log('Successfully attached skill metadata to Box file');

      finalCallback(null, { statusCode: 200, body: 'Custom Skill Success' });
      
    } catch (error) {
        console.log(error);
        finalCallback(null, { statusCode: 200, body: 'Error' });
    }
}

async function sendToRossum(filePath) {
  const rossum = new Rossum();

  const uploadedFile = await rossum.uploadFiletoRossum(filePath);
  const invoiceId = uploadedFile.id;
  console.log('Successfully uploaded to Rossum');

  await rossum.waitForDocumentExtraction(invoiceId);
  console.log('Rossum data extraction complete');

  const fields = await rossum.getDocumentFields(invoiceId);
  console.log('Fetched Rossum data');

  return rossum.processJSON(fields);
}