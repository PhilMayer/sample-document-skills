const expect = require('expect');
const fs = require('fs')
const axios = require('axios');

require('dotenv').config()

const Rossum = require('../Helpers/rossum');
const Box = require('../Helpers/box');

// const SAMPLE_JSON = require('./invoice.json').fields
const WAIT_PERIOD = 180000;

const SAMPLE_METADATA = { amount_total: '4,801.25',
                            amount_due: '4,801.25',
                            terms: 'Net 30 Days',
                            sender_name: 'Canary LLC600 San Ramon Valley Blvd00 San Ramon Valley Blvd.',
                            sender_addrline: 'Danville, CA 94526Suite 200600 San Ramon Valley Blvd.',
                            recipient_name: 'Box - Ryan Guaderrama2900 Jefferson',
                            recipient_addrline: 'Redwood City, CA 94063900 Jefferson' 
                        }

let id;
let fields;

describe('Rossum Class', () => {
    let rossum = new Rossum();

    it('should exist', () => {
        expect(rossum).toExist();
    })

    it('should upload a new document', async function() {

        let box = new Box('oD5dB3mPg61Kyj4hQGYarmlPpbxF9NXi', 'oD5dB3mPg61Kyj4hQGYarmlPpbxF9NXi', '295984344910')
        let tmpFilePath = await box.downloadFileFromBox()
        
        return rossum.uploadFiletoRossum(tmpFilePath).then((file) => {
            console.log(file);
            id = file.id;
            expect(id).toExist();
        });
    }).timeout(WAIT_PERIOD);

    it('should process the document', async function() {
        const status = await waitForDocumentExtraction(id);
        console.log("Final status:" + status)
        expect(status).toBe('ready');
    }).timeout(WAIT_PERIOD);

    it('should contain extracted fields', async function() {
        const content = await getDocumentFields(id);
        console.log(content);
        fields = content;
        expect(content).toExist();
    }).timeout(WAIT_PERIOD);

    // it('should extract the relevant content', () => {
    //     const metadata = rossum.processJSON(SAMPLE_JSON);
    //     console.log(metadata);
    //     expect(metadata).toIncludeKey("recipient_name");
    // });

    // it('should attach the metadata as a skills card', async function() {
    //     let box = new Box('ZhoAAdx94noI1oJL4xg1a42N9GbxZUAa', 'ZhoAAdx94noI1oJL4xg1a42N9GbxZUAa', '295984344910')
    //     const result = await box.attachMetadataCard(SAMPLE_METADATA)
    //     console.log(result);
    // })
});


const timeout = (ms) => new Promise(res => setTimeout(res, ms))

async function waitForDocumentExtraction(id) {
    let retryCount = 0;
    let status;
    while(status !== 'ready' && retryCount <= 20) {
        retryCount++;
        await timeout(3000);
        status = await getDocumentStatus(id);
        console.log(status)
    }

    return status;
}

async function getDocumentStatus(id) {
    const doc = await axios.get(`https://all.rir.rossum.ai/document/${id}`, {headers: {'Authorization': `secret_key Vytbz3XWQnEhmO34NU9xt6x4uAl2FnmmpgNfx8flMpiFY3ZfKGbMMZB7omLvygXi`}});
    return doc.data.status;
}

async function getDocumentFields(id) {
    const doc = await axios.get(`https://all.rir.rossum.ai/document/${id}`, {headers: {'Authorization': `secret_key Vytbz3XWQnEhmO34NU9xt6x4uAl2FnmmpgNfx8flMpiFY3ZfKGbMMZB7omLvygXi`}});
    return doc.data.fields;
}