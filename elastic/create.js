// @flow
import client from './connection.js';

client.indices.create({
  index: 'esb_ppr',
  timeout: '10m',
  body: {
    "settings": {
      "analysis": {
        "analyzer" : {
          "partial_words_analyzer" : {
            "tokenizer" : "partial_words_tokenizer"
          }
        },
        "tokenizer" : {
          "partial_words_tokenizer" : {
            "type": "edge_ngram",
            "min_gram": 2,
            "max_gram": 10,
            "token_chars": ["letter", "digit"]
          }
        },
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
