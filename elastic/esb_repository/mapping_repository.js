// @flow
let client = require('../connection');
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

client.indices.putMapping({
  index: esIndexName,
  type: 'categories',
  timeout: '10m',
  body: {
    "properties": {
      "id": {
        "type": "short"
      },
      "name": {
        "type": "keyword"
      },
      "service": {
              "type": "nested",
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
                "service_id": {
                  "type": "integer"
                },
                "sla": {
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
    }
},
function(err,resp,status){
    if (err) {
      console.log(err);
    }
    else {
      console.log(resp);
    }
});
