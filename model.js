const fs = require('fs');
const prompt = require('prompt');
const csvWriter = require('csv-write-stream')
const axios = require('axios');

const KEY = process.env.MYAPIKEY;
const months=['January','February','March','April','May','June','July','August','September','October','November','December'];

const schema = {
    properties: {
      address: {
        description: 'Building Address',
        required: true,
      },
      systemSize: {
        description: 'DC System Size (kW)',
        pattern: /[+-]?([0-9]*[.])?[0-9]+/,
        message: 'Must be a number',
        required: true,
      },
      azimuth: {
        description:'Azimuth (deg)',
        pattern: /[+-]?([0-9]*[.])?[0-9]+/,
        message: 'Must be a number',
        required: true,
      },
      tilt: {
        description: 'Tilt (deg)',
        pattern: /[+-]?([0-9]*[.])?[0-9]+/,
        message: 'Must be a number',
        required: true,
      },
      losses: {
        description: 'System Losses (%)',
        pattern: /[+-]?([0-9]*[.])?[0-9]+/,
        message: 'Must be a number',
        required: true,
      },
      moduleType: {
        description: 'Module Type \nEnter 0 for standard \nEnter 1 for premium \nEnter 2 for thin film \n',
        type: 'integer',
        message: 'Must be an integer',
        required: true,
      },
      arrayType: {
        description: 'Array Type \nEnter 0 for Fixed - Open Rack \n Enter 1 for Fixed - roof mount \n',
        type: 'integer',
        message: 'Must be an integer',
        required: true,
      },
      rateType: {
        description: 'Rate Type \nEnter 0 for Residential \n Enter 1 for Commercial\n',
        type: 'integer',
        message: 'Must be an integer',
        required: true,
      }
    }
  };

prompt.start();
prompt.get(schema, function(err,inputs) {
  const solarLink = `https://developer.nrel.gov/api/pvwatts/v6.json?api_key=${KEY}&address=${inputs.address}&system_capacity=${inputs.systemSize}&azimuth=${inputs.azimuth}&tilt=${inputs.tilt}&module_type=${inputs.moduleType}&losses=${inputs.losses}&array_type=${inputs.arrayType}`
  const utilityLink = `https://developer.nrel.gov/api/utility_rates/v3.json?api_key=${KEY}&address=${inputs.address}`
  axios.all([
    axios.get(solarLink),
    axios.get(utilityLink)
]).then(axios.spread((solarResp, utilityResp) => {
    const solarRadiationMonthly = solarResp.data.outputs.solrad_monthly
    const solarRadiationAnnual = solarResp.data.outputs.solrad_annual
    const AcEnergyMonthly = solarResp.data.outputs.ac_monthly
    const AcEnergyAnnual = solarResp.data.outputs.ac_annual

    let utilityRate = 0
    if (inputs.rateType===0) {
      utilityRate = utilityResp.data.outputs.residential
    } else {
      utilityRate = utilityResp.data.outputs.commercial
    }

    const writer = csvWriter({ headers: ["Month", "Solar Radiation (Avg. kWh/m2/day)", "AC energy (kWh)","Value ($)"]})
      writer.pipe(fs.createWriteStream('output.csv', {flags: 'a'}))
      months.forEach((month,idx) => {
        writer.write([month, solarRadiationMonthly[idx].toFixed(2), Math.round(AcEnergyMonthly[idx]),(utilityRate*AcEnergyMonthly[idx]).toFixed(2)])
      })
      writer.write(['','','',''])
      writer.write(["Annual Totals", `${solarRadiationAnnual.toFixed(2)} (avg)`,Math.round(AcEnergyAnnual),(utilityRate*AcEnergyAnnual).toFixed(2)])
      writer.write(['','','',''])
      writer.end()
      console.log('DONE')
  })).catch(error => {
    console.log('Error -',error.response.statusText);
  });
})
