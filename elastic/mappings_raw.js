// @flow
 import client from './connection.js';

 client.indices.putMapping({

   index: 'esb_ppr_raw',
   type: 'track',
   timeout: '10m',
   body: {
          "properties": {
               "client_ip" : {
                 "type": "ip"
               },
               "client_user": {
                 "type": "text",
                 "analyzer": "partial_words_analyzer"
               },
               "message": {
                 "type": "text",
                 "analyzer": "partial_words_analyzer"
               },
               "message_guid": {
                 "type": "keyword"
               },
               "payload": {
                 "type": "text",
                 "analyzer": "partial_words_analyzer"
               },
               "phase_name": {
                 "type": "keyword"
               },
               "service_id" : {
                 "type": "short"
               },
               "service_name": {
                 "type": "text",
                 "analyzer": "partial_words_analyzer"
               },
               "environment": {
                 "type": "short"
               },
               "start_date": {
                 "type": "date"
               },
               "end_date": {
                 "type": "date",
               },
               "status": {
                 "type": "keyword",
                 "normalizer": "lowercase_normalizer"
               }
             }
        }
   },
   function (err, resp, status) {
     if (err) {
       console.log(err);
     }
     else {
       console.log(resp);
     }
   }
 );
