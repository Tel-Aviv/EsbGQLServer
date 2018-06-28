// @flow
var client = require('../connection.js');
var myArgs = require('optimist').argv,
    help1 = 'No environment is specified. Add -e prod or -e ppr to CLI',
    help2 = ' is unknown environment. Use \'prod\' or \'ppr\'!';

if( !myArgs.e ) {
  console.log(help1);
  process.exit(0);
}

let esServicesIndexName = 'esb_ppr_services';
let esCategoriesIndexName = 'esb_ppr_categories';
switch( myArgs.e ) {
  case "prod": {
    esServicesIndexName = 'esb_services';
    esCategoriesIndexName = 'esb_categories'
  }
  break;

  case "ppr": break;

  default: {
    console.log('\'' + myArgs.e +'\'' + help2);
    process.exit(0);
  }
}

function createIndex(esIndexName) {
  return client.indices.create({
    index: esIndexName,
    timeout: '10s',
    body: { }
  }).then( resp => {
    console.log(resp);
    return new Promise( (resolve, reject) => {
        resolve(true);
    })
  }).catch( err => {
    console.error(err);
  });
}

client.indices.exists({
   index: esCategoriesIndexName
 }).then( exists => {

    if( exists === true) {
     client.indices.delete({
        index: esCategoriesIndexName
     })
    }

    createIndex(esCategoriesIndexName)
    .then( created => {
      if( created == true ) {

        console.log(`\x1b[32m Index ${esCategoriesIndexName} created. \x1b[0m`);

        client.indices.exists({
          index: esServicesIndexName
        }).then( servicesIndexExists => {
          if( servicesIndexExists === true) {
            client.indices.delete({
               index: esServicesIndexName
            })
          }
        });

        createIndex(esServicesIndexName)
        .then( created => {
            console.log(`\x1b[32m Index ${esServicesIndexName} created. \x1b[0m`);

        })

      }
    });

 }).catch( err => {
   console.error('\x1b[31m' + err + '\x1b[0m');
 });
