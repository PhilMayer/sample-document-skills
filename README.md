# What are Box Skills?
According to the official [Box Skills developer documentation](https://developer.box.com/docs/box-skills), a Box Skill is "a type of application that performs custom processing for files uploaded to Box." I couldn't have said it better myself. In this case, when an invoice or invoice-like document is uploaded to Box, we will send it to an ML service called Rossum.ai, which extracts certain key information from the invoice.

# What is Rossum?
Rossum is an invoice data capture tool that specializes in extracting fields common to your typical invoice. The data returned from Rossum could include fields like amount, tax details, invoice ID, or sender and receiver name. The smart scientists at Rossum have trained a model such that these fields will be identified with consistently high degrees of accuracy.

# Who would use this skill?
If you have ever manually entered any data from an invoice, then this skill might be for you. And particularly if your invoices participate in any sort of workflow, with data in the invoice indicating where in your enterprise the document should end up and who should see it. All of this can now be automated.

# What types of files does the skill handle?
You'll be able to upload either PDFs or images of invoices. With regard to images, Rossum requests that the quality be at least 150 dots per inch. 

# What metadata is written back to my Box file?
You'll be able to specify exactly which fields you care about writing as metadata to your file in Box. A complete list of fields returned by Rossum can be found at https://rossum.ai/developers/api/field_types.

Importantly, Rossum returns multiple results per field, each with a confidence score. In our skill we take only the highest score, so that we only end up with one sender name, one amount due, etc. that is most likely to be the field we actually care about.

The metadata is then posted as a Box Skills Transcript card. Some more info on Skills cards: https://developer.box.com/docs/box-skills.

# What far-reaching implications does this have for my business?
Using Box with Rossum has the potential to eliminate enormous ammounts of manual data entry using automated data capture that matches human levels of accuracy. But this is only half of story! The Box API then allows you to kick off all manner of tailored workflows based on the returned metadata. Copying and moving files, flagging unpaid invoices, adding retention policies based on dates: we can now bring heightened levels of automation to bear on all of these tasks.



Copyright 2018 Phillip Mayer

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.