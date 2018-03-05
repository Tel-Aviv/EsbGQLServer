// @flow
import client from './connection.js';

client.indices.create({
  index: 'esb_ppr',
  timeout: '10m',
  body: {
    "settings": {
      "analysis": {
        "normalizer": {
          "lowercase_normalizer":{
            "type": "custom",
            "filter": ["lowercase"]
          }
        }
      }
    },
  }
}).then( resp => {
  console.log("create: ",resp);
}). catch( err => {
  console.log(err);
})
