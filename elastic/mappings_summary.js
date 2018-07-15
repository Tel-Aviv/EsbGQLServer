// @flow
var myArgs = require('optimist').argv,
    help1 = 'No environment is specified. Add -e prod or -e ppr to CLI',
    help2 = ' is unknown environment. Use \'prod\' or \'ppr\'!';
import client from './connection.js';

if( !myArgs.e ) {
  console.log(help1);
  process.exit(0);
}

let esSummaryIndexName = 'esb_ppr_summary';

switch( myArgs.e ) {
  case "prod": {
    esSummaryIndexName = 'esb_summary';
  }
  break;

  case "ppr": break;

  default: {
    console.log('\'' + myArgs.e +'\'' + help2);
    process.exit(0);
  }
}

client.indices.putMapping({
  index: esSummaryIndexName,
  type: 'summary',
  timeout: '10m',
  body: {
    "properties": {
      "client_host": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      },
      "client_ip": {
        "type": "ip"
      },
      "client_user": {
        "type": "text",
        "analyzer": "partial_words_analyzer"
      },
      "environment": {
        "type": "short"
      },
      "esb_Latency": {
        "type": "integer"
      },
      "message_guid": {
        "type": "keyword"
      },
      "query": {
        "properties": {
          "match": {
            "properties": {
              "message_guid": {
                "type": "text",
                "fields": {
                  "keyword": {
                    "type": "keyword",
                    "ignore_above": 256
                  }
                }
              }
            }
          },
          "match_all": {
            "type": "object"
          },
          "range": {
            "properties": {
              "trace_Date": {
                "properties": {
                  "gte": {
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
          }
        }
      },
      "service_Latency": {
        "type": "integer"
      },
      "service_id": {
        "type": "short"
      },
      "service_name": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        },
        "analyzer": "partial_words_analyzer"
      },
      "service_url": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
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
      "sort": {
        "properties": {
          "start_date": {
            "properties": {
              "order": {
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
      "status": {
        "type": "keyword",
        "normalizer": "lowercase_normalizer"
      },
      "trace_Date": {
        "type": "date"
      },
      "transport_Latency": {
        "type": "integer"
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
},

function(err,resp,status){
    if (err) {
      console.log(err);
    }
    else {
      console.log(resp);
    }
});
