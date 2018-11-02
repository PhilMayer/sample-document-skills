
const BoxSDK = require('box-node-sdk');
const { FilesReader, SkillsWriter } = require('../skills-kit-lib/skills-kit-2.0');

const fs = require('fs')

const SKILLS_CARDS_TEMPLATE = 'boxSkillsCards';
const BOX_SKILL_NAME = 'CustomBoxInvoiceSkill';
const TEMP_PATH = '/tmp/temp.pdf'

class Box {

  constructor(readToken, writeToken, fileId, body) {
    this.filesReader = new FilesReader(body);
    const fileContext = this.filesReader.getFileContext();
    this.skillsWriter = new SkillsWriter(fileContext);

    this.readToken = readToken;
    this.writeToken = writeToken;
    this.fileId = fileId
    this.boxSdk = new BoxSDK({ clientID: 'u9ycy4t2d2u0yq078zn0vaemprqqwcn3', clientSecret: 'k5nbP2WzwothXXtrmZJPYY9RtxyTKLzm' });
  }

  /**
   * Check if file already has skills metadata attached
   * @return {boolean} - file metadata status, true or false
   */
  async containsSkillsMetadata() {
    const client = this.boxSdk.getBasicClient(this.readToken);
    let hasMetadata = false;

    try {
      const metadata = await client.files.getMetadata(this.fileId,
        client.metadata.scopes.GLOBAL,
        SKILLS_CARDS_TEMPLATE)

      if(metadata.cards) {
        hasMetadata = true;
      }
      console.log(hasMetadata);
    } catch(error) {
      console.log("Skills metadata does not yet exist");
    }

    return hasMetadata;
  }
  
  async deleteExistingMetadata() {
    const client = this.boxSdk.getBasicClient(this.writeToken);
    const result = await client.files.deleteMetadata(this.fileId, client.metadata.scopes.GLOBAL, SKILLS_CARDS_TEMPLATE);
  }
  /**
   * Create a new Rossum 'document'
   * @return {Object} - new document object
   */
  async downloadFileFromBox() {
    const readClient = this.boxSdk.getBasicClient(this.readToken);

    // get box file read stream and write to local temp file
    const readStream = await readClient.files.getReadStream(this.fileId, null);
    const writeStream = fs.createWriteStream(TEMP_PATH);
    const stream = readStream.pipe(writeStream);

    // wait for stream write to 'finish'
    await new Promise((resolve, reject) => {
      stream.on('finish', function () {
          resolve()
        });
    });

    return TEMP_PATH;
  }

  /**
   * Attach skills metadata to file
   */
  async attachMetadataCard(rossumJson) {
    // const client = this.boxSdk.getBasicClient(this.writeToken);
    
    // let boxSkillsCard = { "cards": [] };

    // Invoice information card
    const invoiceDetails = returnCard("Invoice Details", rossumJson,
      {
        "invoice_id": "Invoice Number",
        "customer_id": "Customer Number",
        "date_issue": "Issue Date",
        "date_due": "Due Date",
        "terms": "Terms",
        "amount_total": "Total Amount",
        "amount_paid": "Amount Paid",
        "amount_due": "Amount Due",
        "sender_name": "Sender Name",
        "recipient_name": "Recipient Name",
        "tax_detail_total": "Tax Total",
        "order_id": "Order Number"
      }
    );

    const transcriptJSON = this.skillsWriter.createTranscriptsCard(invoiceDetails);
    this.skillsWriter.saveDataCards([transcriptJSON]);
    
  //   boxSkillsCard.cards.push(invoiceDetails);

  //   // add skills metadata cards to box file
  //   return await client.files.addMetadata(this.fileId, client.metadata.scopes.GLOBAL, SKILLS_CARDS_TEMPLATE, boxSkillsCard);
  }
}

/**
 * Helper function to format individual skills metadata cards
 * @param {Object} keywordTitle - title of box skill metadata card
 * @param {Object} rossumJson - all Rossum metadata
 * @param {Object} properties - target keywords
 * @return {Object} - new document object
 */
function returnCard(keywordTitle, rossumJson, properties) {
  // let cardTemplate = {
  //   type: "skill_card",
  //   skill_card_type: "transcript",
  //   skill_card_title: {message: keywordTitle},
  //   skill: {
  //     type: "service", "id": BOX_SKILL_NAME
  //   },
  //   invocation: {
  //     type: "skill_invocation", id: "b6d9c9f05a"
  //   },
  //   duration: 945,
  //   entries: []
  // }
  const entries = [];

  // push metadata to cardTemplate entries
  Object.keys(properties).forEach((key) => {
    if(rossumJson[key]) {
      entries.push({
        // type: "text",
        text: `${properties[key]}: ${rossumJson[key]}`
      });
    }
  });

  // return cardTemplate
  return entries;
}

module.exports = Box;
