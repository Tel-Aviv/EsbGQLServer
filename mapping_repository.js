// @flow
let client = require('./connection');

client.indices.putMapping({
  index: 'esb_ppr_repository',
  type: 'categories',
  timeout: '10m',
  body: {
    "properties": {
         "id": {
           "type": "integer"
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
             "sla": {
               "type": "integer"
             },
              "service_id": {
               "type": "integer"
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
