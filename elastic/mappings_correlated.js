// @flow
import client from './connection.js';

client.indices.putMapping({
  index: 'esb_ppr_summary',
  type: 'summary',
  timeout: '10m',
  body: {
      "properties": {
      "trace_Date": {
        "type": "date"      
      },
      "message_guid": {
        "type": "keyword"
      },
      "esb_Latency": {
        "type": "integer"
      },
      "transport_Latency": {
        "type": "integer"
      },
      "service_Latency": {
          "type": "integer"
      },
      "status": {
        "type": "keyword",
        "normalizer": "lowercase_normalizer"
      },
      "service_id": {
        "type": "short"
      },
      "service_name": {
        "type": "text",
        "analyzer": "partial_words_analyzer"
      },
      "environment": {
        "type": "short"
      },
      "client_ip": {
        "type": "ip"
      },
      "client_user": {
        "type": "text",
        "analyzer": "partial_words_analyzer"
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
