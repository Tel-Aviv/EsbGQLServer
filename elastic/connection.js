var elasticsearch=require('elasticsearch');

var client = new elasticsearch.Client( {
  hosts: ['localhost:9200', '10.1.70.47:9200'],
  //log: 'trace'
});


module.exports = client;
