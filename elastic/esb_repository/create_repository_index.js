// @flow
var client = require('../connection.js');
var myArgs = require('optimist').argv,
    help1 = 'No environment is specified. Add -e prod or -e ppr to CLI',
    help2 = ' is unknown environment. Use \'prod\' or \'ppr\'!';

if( !myArgs.e ) {
  console.log(help1);
  process.exit(0);
}

let esIndexName = 'esb_ppr_repository';
switch( myArgs.e ) {
  case "prod": {
    esIndexName = 'esb_repository'
  }
  break;

  case "ppr": break;

  default: {
    console.log('\'' + myArgs.e +'\'' + help2);
    process.exit(0);
  }
}

function createIndex() {
  client.indices.create({
    index: esIndexName,
    timeout: '10s',
    body: { }
  }).then( resp => {
    console.log(`Index ${esIndexName} created: `, resp);
  }).catch( err => {
    console.error(err);
  });
}

client.indices.exists({
   index: esIndexName,
 }, (err, exists) => {
   if( err ) {
     console.error(err);
     process.exit(0);
   } else {
     if( exists === true) {
       client.indices.delete({
         index: esIndexName
       }, (err, res) => {

         if( err ) {
           console.error(err);
           process.exit(0);
         }
         console.log(`Index ${esIndexName} was deleted`);
       });
     }

    createIndex()
   }
 });
