import client from '../connection';
import elsb from 'elastic-builder';
import moment from 'moment';
import casual from 'casual';

let today = moment().format('DD/MM/YYYY');

//console.log(moment().add(-1, 'days').format('DD/MM/YYYY'));

class Summary {
  constructor(date, value) {
    this.id = casual.uuid;
    this.date = date;
    this.value = value;
  }

}

const before = 7;
let labels = [];

let from = `now-${before}d/d`;

const requestBody = elsb.requestBodySearch()
  .query(
    elsb.boolQuery()
      .must(elsb.rangeQuery('trace_Date')
                  .gte(from)
                  .lte('now+1d/d')
      )
      .filter(elsb.termsQuery('service_id', [1,3]))
  )
  .agg(
    elsb.dateHistogramAggregation('distribution', 'trace_Date', 'day')
    .order('_key', "desc") // !!! missing 'format'
    .agg(elsb.filterAggregation('first', elsb.termQuery('service_id', 1)))
    .agg(elsb.filterAggregation('second', elsb.termQuery('service_id', 2)))
  );

elsb.prettyPrint(requestBody); //requestBody.toJSON()

client.search({
  index: 'esb_ppr',
  type: 'correlate_msg',
  body: {

    "query": {
      "bool": {
        "must" : {
          "range" : {
            "trace_Date": {
              "gte": from,
              "lt": "now+1d/d"
            }
          }
        },
        "filter": {
          "terms" : { "service_id" : [1,3]}
        }
      }
    },

    "aggs" : {
        "distribution": {
          "date_histogram": {
            "field": "trace_Date",
            "interval" : "day",
            "format" :  "yyyy-MM-dd",
            "order" : { "_key": "desc" }
          },
          "aggs": {
            "first": {
              "filter": {
                "term": { "service_id": 1 }
              }
            },
            "second": {
              "filter": {
                "term": { "service_id": 3 }
              }
            }
          }
      }
  }

  }
}).then( response => {
  response.aggregations.distribution.buckets.forEach( bucket => {
    let date = moment(bucket.key_as_string).format('DD/MM/YYYY');
    labels.push(date);
  })
}).catch( error => {
  console.error(error);
})

console.log('Labels: ' + labels + '...');

// client.search({
//   index: 'esb',
//   type: 'runtime',
//   body: {
//     query: {
//       match: { "ref_date": today }
//     },
//   }
// }).then( response => {
//   console.log("--- Response ---");
//   console.log(response);
//
//   console.log("--- Hits ---");
//   response.hits.hits.forEach((hit) => {
//     console.log(hit);
//   })
//
// }).catch( error => {
//   console.log("search error: " + error)
// });
