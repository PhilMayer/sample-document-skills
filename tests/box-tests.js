const BoxSDK = require('box-node-sdk');
const expect = require('expect');
require('dotenv').config()

const Box = require('../Helpers/box');

const SAMPLE_JSON = { UDMAssignment: null,
  UDMAssignmentGenerally: "whatever this is....",
  UDMSublease: "sublease...",
  SubleaseGenerally: null,
  UDMBaseRentAmount: 108,
  UDMBaseRentMonthlyAmount: null,
  UDMBaseRentAnnualAmount: null,
  UDMBaseRentFrequency: "monthly",
  UDMBaseRentEffectiveFrom: null,
  UDMBaseRentEffectiveUntil: null,
  UDMPaymentSchedule: null,
  UDMPaymentScheduleUS: null,
  UDMLatePaymentFee: null,
  UDMInterestOnLatePaymentFixed: null,
  ContractStart: '20100503',
  ContractDurationDate: '20250502',
  ContractDurationMain: 180,
  RenewalBeneficiary: null,
  RenewalDuration: "8 months",
  RenewalTimes: null,
  RenterName: 'Leverton GmblH EXECUTED',
  RenteeName: null,
  RentalStreet: 'Constitution Hill',
  RentalStreetNumber: null,
  RentalZip: 'SW1A',
  RentalCity: 'London',
  UDMPurposeUsageUS: null }

describe('Box', () => {

  let box = new Box('Ctx0BtJuWED6X42bBqnMO04xgZzXOM6P', 'Ctx0BtJuWED6X42bBqnMO04xgZzXOM6P', '295984468107')

  it('should exist', () => {
    expect(box).toExist();
  });
  
  it('should attach metadata', async () => {
    await box.attachMetadataCard(SAMPLE_JSON)
  });

});
