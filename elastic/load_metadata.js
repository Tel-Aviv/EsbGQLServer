 let client = require('./connection');
 let sql = require('mssql');
//﻿import client from './connection';
//import sql from 'mssql';

let bulk = [];

console.log('script started');

const config = {
  user: 'db653_t',
  password: 'h#606653',
  server: 'sql07\\preprodop',
  database: 'db653'
};

sql.connect(config, err => {
    // first get all categories
    const request = new sql.Request()
    request.stream = true
    request.query('select category_id, category_name from [db653].[dbo].t_esb_dt_category');
    let currentIndex = 0;
    let services = [];
    let count = 0;

    request.on('row', row => {
        const servicesRequest = new sql.Request()
        servicesRequest.stream = true // foreach category get its services
        servicesRequest.query('SELECT s.service_id, replace(contract_key_name, \'ESB.CONTRACT.\', \'\') as [service_name], [service_uri], [soap_action], s.[expected_sla] ' +
            'FROM [db653].[dbo].[t_esb_core_service] s inner join [db653].[dbo].[t_esb_gov_service_approval_stage] sap on s.service_id = sap.service_id ' +
            'inner join [db653].[dbo].[t_esb_core_msg_contract] c on sap.contract_key_id = c.contract_key_id ' +
            'WHERE sap.contract_category_id = ' + row.category_id);

        // add service to services array
        servicesRequest.on('row', serviceRow => {
            let service = {
                service_id: serviceRow.service_id,
                name: serviceRow.service_name,
                sla: serviceRow.expected_sla,
                soapAction: serviceRow.soap_action,
                url: serviceRow.service_uri
            }

            services.push(service);
        });

        servicesRequest.on('error', err => {
            console.error('Error in add service: ' + err);
        });

        // add new record of category with all its services
        servicesRequest.on('done', result => {
            let record = {
                id: row.category_id,
                name: row.category_name,
                services: services
            }

            bulk.push(
                { index: { _index: 'esb_ppr_repository', _id: currentIndex++, _type: 'categories' } },
                record);
            console.log(record.services.length);

            if (currentIndex == count)
            {
              console.log("go to db with " + count + " categories");
              indexall(bulk);
            }

            services = [];
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
      index: 'esb_ppr_repository',
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
}
