// @flow
let client = require('../connection');
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
    esCategoriesIndexName = 'esb_categories';
  }
  break;

  case "ppr": break;

  default: {
    console.log('\'' + myArgs.e +'\'' + help2);
    process.exit(0);
  }
}

client.indices.putMapping({
  index: esServicesIndexName,
  type: 'services',
  timeout: '10s',
  body: {
    "properties": {
      "name": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      },
      "sla": {
        "type": "short"
      },
       "id": {
        "type": "integer"
      },
      "categoryId": {
        "type": "short"
      },
      "soap_action": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      },
      "url": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      },
      "verb": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      }
    }
  }
}).then( res => {
  console.log(`Index ${esServicesIndexName} was mapped`);

  client.indices.putMapping({
    index: esCategoriesIndexName,
    type: 'services',
    timeout: '10s',
    body: {
      "properties": {
           "id": {
             "type": "short"
           },
           "name": {
             "type": "keyword"
           }
      }
    }
  }).then( result => {
    console.log(`Index ${esCategoriesIndexName} was mapped`);
  })
});
