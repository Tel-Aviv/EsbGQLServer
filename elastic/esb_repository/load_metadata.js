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
let esIndexName = 'esb_ppr_repository';
const dbName = 'db653';

switch( myArgs.e ) {
  case "prod": {
    serverName = 'SYSTEM01SQL2008\\SQL2008';
    userName = 'db653_p';
    password = 'h#653760';
    esIndexName = 'esb_repository';
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
console.log('ES Index: ' + esIndexName);

const config = {
 user: userName,
 password: password,
 server: serverName,
 database: dbName
};

let bulk = [];
let serviceNumber = 0;
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

  let count = 0;
  let services = {};

  request.on('row', row => {

    services[row.category_id] = [];
    console.log('CategoryId: ' + row.category_id);

    const servicesRequest = new sql.Request();
    servicesRequest.stream = true // foreach category get its services
    servicesRequest.query('SELECT s.service_id, replace(contract_key_name, \'ESB.CONTRACT.\', \'\') as [service_name], ' +
        '[service_uri], [soap_action], s.[expected_sla], s.pattern_id ' +
        'FROM [db653].[dbo].[t_esb_core_service] s inner join [db653].[dbo].[t_esb_gov_service_approval_stage] sap on s.service_id = sap.service_id ' +
        'inner join [db653].[dbo].[t_esb_core_msg_contract] c on sap.contract_key_id = c.contract_key_id ' +
        'WHERE sap.contract_category_id = ' + row.category_id);

      // add service to services array
      servicesRequest.on('row', serviceRow => {

          let service = {

              service_id: serviceRow.service_id,
              name: serviceRow.service_name,
              sla: serviceRow.expected_sla,
              soap_action: serviceRow.soap_action,
              url: serviceRow.service_uri,
              verb: ( serviceRow.pattern_id == 3 ) ? "GET" : "POST"
          }

          services[row.category_id].push(service);
      });

      servicesRequest.on('error', err => {
          console.error('Error in add service: ' + err);
      });

      // add new record of category with all its services
      servicesRequest.on('done', result => {

          let record = {
              id: row.category_id,
              name: row.category_name,
              service: services[row.category_id]
          }

          bulk.push(
              { index: { _index: esIndexName, _id: currentIndex++, _type: 'categories' } },
              record);
          console.log('Services count: ' + record.service.length + " Catetory: " + currentIndex);
          serviceNumber +=  record.service.length ;

          if (currentIndex == count)
          {
            console.log("go to db with " + count + " categories");
            console.log("total services: " + serviceNumber);
            indexall(bulk);
          }

          // services = [];

      });
  });

  request.on('error', err => {
      console.error('Error: ' + err);
  });

  request.on('done', result => {
    count = result.rowsAffected;
  });

});

const indexall = (madebulk, callback) => {
  console.log('Bulk prepared: ' + madebulk.length);

  client.bulk({
      index: esIndexName,
      timeout: '10s',
      body: madebulk
  }, (err, resp, status) => {
      if (err) {
        console.error('Error: ' + err);
      } else {

           console.log('Indexed: ' + resp.items.length);
          // console.log('Status: ' + status);

      }
  });
};
