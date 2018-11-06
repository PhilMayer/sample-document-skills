
const fs = require('fs')
const BoxSDK = require('box-node-sdk');
const { FilesReader, SkillsWriter } = require('../skills-kit-lib/skills-kit-2.0');
const SKILLS_CARDS_TEMPLATE = 'boxSkillsCards';
const BOX_SKILL_NAME = 'CustomBoxInvoiceSkill';
const TEMP_PATH = '/tmp/temp.pdf'

class Box {

  constructor(fileInfo) {
    const {source, token} = JSON.parse(fileInfo);
    
    this.token = token;
    this.fileId = source.id;
    this.filesReader = new FilesReader(fileInfo);
    this.skillsWriter = new SkillsWriter(this.filesReader.getFileContext());
    this.boxSdk = new BoxSDK({ clientID: 'u9ycy4t2d2u0yq078zn0vaemprqqwcn3', clientSecret: 'k5nbP2WzwothXXtrmZJPYY9RtxyTKLzm' });
  }

  /**
   * Check if file already has skills metadata attached.
   * @return {boolean} - file metadata status, true or false
   */
  async containsSkillsMetadata() {
    const client = this.boxSdk.getBasicClient(this.token.read.access_token);
    let hasMetadata = false;

    try {
      const metadata = await client.files.getMetadata(this.fileId,
        client.metadata.scopes.GLOBAL,
        SKILLS_CARDS_TEMPLATE)

      if(metadata.cards) {
        hasMetadata = true;
      }
    } catch(error) {
      console.log("Skills metadata does not yet exist");
    }

    return hasMetadata;
  }
  
  async deleteExistingMetadata() {
    const client = this.boxSdk.getBasicClient(this.token.write.access_token);
    const result = await client.files.deleteMetadata(this.fileId, client.metadata.scopes.GLOBAL, SKILLS_CARDS_TEMPLATE);
  }
  /**
   * Download Document from Box using the Skills Kit FilesReader class.
   */
  async downloadFileFromBox() {
    // get box file read stream and write to local temp file
    const readStream = await this.filesReader.getContentStream();
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
   * Attach skills metadata to file using the Skills Kit skillsWriter class.
   */
  async attachMetadataCard(rossumJson) {
 
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
  }
}

/**
 * Helper function to format Skills metadata card.
 * 
 * @param {Object} keywordTitle - title of box skill metadata card
 * @param {Object} rossumJson - all Rossum metadata
 * @param {Object} properties - target keywords
 */
function returnCard(keywordTitle, rossumJson, properties) {
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

  return entries;
}

module.exports = Box;
