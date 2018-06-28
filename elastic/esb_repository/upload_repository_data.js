let client = require('../connection');
let sql = require('mssql');
var myArgs = require('optimist').argv,
    help1 = 'No environment is specified. Add -e prod or -e ppr to CLI',
    help2 = ' is unknown environment. Use \'prod\' or \'ppr\'!'

if( !myArgs.e ) {
  console.log(help1);
  process.exit(0);
}

// Assume 'ppr' as default settings
let serverName = 'sql07\\preprodop';
let userName = 'db653_t';
let password = 'h#606653';
let esCategoriesIndexName = 'esb_ppr_categories';
let esServicesIndexName = 'esb_ppr_services';
const dbName = 'db653';

switch( myArgs.e ) {
  case "prod": {
    serverName = 'SYSTEM01SQL2008\\SQL2008';
    userName = 'db653_p';
    password = 'h#653760';
    esCategoriesIndexName = 'esb_categories';
    esServicesIndexName = 'esb_services'
  }
  break;

  case "ppr": break;

  default: {
    console.log('\'' + myArgs.e +'\'' + help2);
    process.exit(0);
  }
}

console.log('Server Name: ' + serverName);
console.log('DB Name: ' + dbName);
console.log('User Name: ' + userName);
console.log('Password: ' + password);
console.log('ES Services Index: ' + esServicesIndexName);
console.log('ES Categories Index: ' + esCategoriesIndexName);

const config = {
 user: userName,
 password: password,
 server: serverName,
 database: dbName
};

let bulk = [];
let servicesBulk = [];

sql.connect(config, err => {
  if( err ) {
    console.log(err);
    process.exit(0);
  }
  console.log('Connected');

  // first get all categories
  const request = new sql.Request();
  request.stream = true
  request.query('select category_id, category_name from [db653].[dbo].t_esb_dt_category');
  let currentIndex = 0;
  //let services = [];
  //let count = 0;

  request.on('row', row => {

       let record = {
           id: row.category_id,
           name: row.category_name,
       }

      bulk.push(
         { index: { _index: esCategoriesIndexName, _id: currentIndex++, _type: 'categories' } },
         record);
  });

  request.on('error', err => {
      console.error('Error: ' + err);
  });

  request.on('done', result => {
    indexall(esCategoriesIndexName, bulk, uploadServices);
  });

});

const uploadServices = () => {

  currentIndex = 0;
  const servicesRequest = new sql.Request();
  servicesRequest.stream = true;
  servicesRequest.query('SELECT s.service_id, replace(contract_key_name, \'ESB.CONTRACT.\', \'\') as [service_name], ' +
        '[service_uri], [soap_action], s.[expected_sla], s.pattern_id , s.service_category_id ' +
        'FROM [db653].[dbo].[t_esb_core_service] s inner join [db653].[dbo].[t_esb_gov_service_approval_stage] sap on s.service_id = sap.service_id ' +
        'inner join [db653].[dbo].[t_esb_core_msg_contract] c on sap.contract_key_id = c.contract_key_id');
  servicesRequest.on('row', serviceRow => {

    let record = {
                 service_id: serviceRow.service_id,
                 name: serviceRow.service_name,
                 sla: serviceRow.expected_sla,
                 soap_action: serviceRow.soap_action,
                 url: serviceRow.service_uri,
                 categoryId: serviceRow.service_category_id,
                 verb: ( serviceRow.pattern_id == 3 ) ? "GET" : "POST"
    }

    servicesBulk.push(
       { index: { _index: esServicesIndexName, _id: currentIndex++, _type: 'services' } },
       record);
  });

  servicesRequest.on('done', result => {
    indexall(esServicesIndexName, servicesBulk);
  });

}

const indexall = (esIndexName, madebulk, callback) => {
  console.log('Bulk prepared: ' + madebulk.length);

    client.bulk({
        index: esIndexName,
        timeout: '10m',
        body: madebulk
    }, (err, resp, status) => {
        if (err) {
          console.error('Error: ' + err);
        } else {

             console.log('Indexed: ' + resp.items.length);
            // console.log('Status: ' + status);

        }
    });

    if( callback ) {
      callback();
    }

  };
