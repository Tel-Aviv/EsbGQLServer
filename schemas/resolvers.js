// @flow
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import _ from 'lodash';
import casual from 'casual';
import moment from 'moment';
import rp from 'request-promise';
import { GraphQLError } from 'graphql/error';

import esb from 'elastic-builder';

import { PubSub } from 'graphql-subscriptions';
//import { KafkaPubSub } from 'graphql-kafka-subscriptions'

import EsbAPI from './EsbAPI';
import config from '../config';

if( ! EsbAPI.isMockMode() )
   var Kafka = require('no-kafka')

import elasticsearch from 'elasticsearch';

if( !EsbAPI.isMockMode() ) {

    var consumer = new Kafka.SimpleConsumer({
      //connectionString: "10.1.70.101:9092, 10.1.70.117:9092",
      connectionString: "10.1.70.101:9092",
      asyncCompression: true
    })

    var dataHandler = function(messageSet, topic, partition){

      messageSet.forEach(function (m){

        const message = m.message.value.toString('utf-8');
        var trace = JSON.parse(message);

        // Map serviceId to metadata
        const esbService = esbRepository.getServiceById(trace.service_id);
        console.log(`Service with id ${trace.service_id} found: ${esbService}. Name: ${esbService.name}`);

        const serviceName = ( esbService ) ? esbService.name : '<unknown>';
        let newTrace = new Trace(casual.uuid,
                                 trace.message_guid,
                                 trace.status,
                                 serviceName,
                                 trace.service_id);

        pubsub.publish(TRACE_ADDED_TOPIC, {
                                            traceAdded: newTrace
                                         });

      })

    }

    consumer.init().then( function() {
      return consumer.subscribe(config.kafka_topic_name, // 'esbmsgs_ppr',
                                0,
                                dataHandler);
    })
}

const pubsub = new PubSub();
const TRACE_ADDED_TOPIC = 'newTrace';
const SERVICE_REQUEST_DELETED_TOPIC = 'deletedSReq';

const esHost = EsbAPI.isMockMode() ? 'localhost' : '10.1.70.47';
var elasticClient = new elasticsearch.Client({
  host: `${esHost}:9200`
  //log: 'trace'
  // selector: function (hosts) {
  // }
});

elasticClient.cluster.health({}, function(err, resp, status) {
  console.log("Elastic Health: ", resp);
})


const esbRepository = new EsbAPI.Repository(elasticClient);


class Category {
  constructor(id: String,
              objectId: String,
              name: String) {
    this.id = id;
    this.objectId = objectId;
    this.name = name;
  }

  get services() {
    return null;
  }
}

class SetInfo {

  constructor(total, list) {
    this.id = casual.uuid;
    this.totalItems = total;
    this.list = list;
  }

}

class Service {

  constructor(id: string,
              objectId: number,
              name: string,
              address: string,
              description: string,
              sla: number,
              categoryId: number,
              verb: string) {
    this.id = id;
    this.objectId = objectId;
    this.name = name;
    this.address = address;
    this.description = description;
    this.sla = sla;
    this.categoryId = categoryId;
    this.verb = verb;
  }

}

const repositoryId : string = casual.uuid;

class Repository {

  constructor() {

    this.id = repositoryId;

    this.services = this.services.bind(this);
    this.service = this.service.bind(this);
    this.categories = this.categories.bind(this);
  }

  service({Id}) {
    if( EsbAPI.isMockMode() ) {

      return EsbAPI.getService(Id);

    }
  }

  services({filter, page, pageSize}) : SetInfo {

    let _services = esbRepository.services;

    if( filter ) {

      let filterNames = Object.keys(filter);
      // Remove null filters
      filterNames = filterNames.filter( e => filter[e] );

      _services = _services.filter( service => {

        for(let i = 0; i < filterNames.length; i++) {
          const _filter = filterNames[i];
          if( filter[_filter] != service[_filter] ) {
            return false;
          }
        }
        return true;
      });
    }

    return new SetInfo(_services.length,
                       _services);
  }

  categories() {
    return esbRepository.categories;
  }
}

class Trace {

  id: String;
  storyId: String;
  status: String;
  serviceName: String;
  serviceId: Number;
  received: Date;

  constructor(id: String,
              storyId: String,
              status: String,
              serviceName: String,
              serviceId: Number) {
    this.id = id
    this.storyId = storyId;
    this.status = status;
    this.serviceName = serviceName;
    this.serviceId = serviceId;
    this.received = new Date();
  }

}

class Summary {
  constructor(date: Date, value: number) {
    this.id = casual.uuid;
    this.date = date;
    this.value = value;
  }

}

class Serie {
  constructor(name: string,
              data: number[],
              serviceId: number) {
    this.id = casual.uuid;
    this.label = name;
    this.data = data;
    this.serviceId = serviceId;
  }

}

class Series {

  constructor(labels: string[],
              series: Serie[]) {

    this.id = casual.uuid; //'ug4@ds6rt'; ;
    this.labels = labels;
    this.series = series;

  }

}

class EsbRuntime {

  constructor() {
    this.id = 'wq2@5t6' // casual.uuid;
  }

  distribution({daysBefore, servicesIds}: {daysBefore: number, servicesIds: number[]}) {

    if( EsbAPI.isMockMode() ) {

      let labels = [];
      for(let i = daysBefore == 0 ? 0 : 1;
          i <= daysBefore; i++) {
        labels.push(moment().add(-i, 'days').format('DD/MM/YYYY'))
      }

      let series = [];
      for(let i = 0; i < servicesIds.length; i++) {
         //let service = EsbAPI.getService(servicesIds[i]);
         let service = esbRepository.services[i];
         let data = [];
         for(let j = daysBefore == 0 ? 0 : 1;
             j <= daysBefore; j++ ) {
           data.push(casual.integer(10000,30000))
         }
         series.push(new Serie(service.name, data, service.objectId));
      }

      return new Series(labels, series);
    }

    let _servicesIds: number[] = servicesIds;
    let _daysBefore: number = daysBefore;

    let from = `now-${_daysBefore}d/d`;
    let labels = [];

    // Use https://elastic-builder.js.org/
    // to interactively translate JS to JSON query body
    let histogramAgg = esb.dateHistogramAggregation('distribution', 'trace_Date', 'day')
                            .order('_key', "desc");
    servicesIds.map( serviceId => {
        histogramAgg.agg(
            esb.filterAggregation(serviceId.toString(), esb.termQuery('service_id', serviceId) )
            .agg(
                esb.termsAggregation('serviceName', "service_name.keyword")
            )
        )
    });

    let requestBody = esb.requestBodySearch()
    .query(
        esb.boolQuery()
        .must(esb.rangeQuery('trace_Date')
                    .gte(from)
                    .lte('now+1d/d')
        )
        .filter(esb.termsQuery('service_id', servicesIds))
    )
    .agg(
        histogramAgg
    );

    return elasticClient.search({
      index: config.summary_index_name,
      type: 'correlate_msg',
      "size": 0, // omit hits from putput
      body: requestBody.toJSON()
    }).then( response => {

      response.aggregations.distribution.buckets.forEach( (bucket,index) => {

        let date = moment(bucket.key_as_string).format('DD/MM/YYYY');
        labels.push(date);
      });

      let series: Serie[] = [];

      for(let i = 0; i < servicesIds.length; i++) {

        let data: number[] = [];

        console.group('service ' + servicesIds[i]);

        let serviceName = '';
        response.aggregations.distribution.buckets.forEach( (bucket, index) => {
          data.push(bucket[servicesIds[i]].doc_count);
          console.log(bucket[servicesIds[i]].doc_count);
          if( index == 0 ) {
            if( bucket[servicesIds[i]].serviceName.buckets.length > 0 ) {
              serviceName = bucket[servicesIds[i]].serviceName.buckets[0].key;
            }
          }
        });

        console.groupEnd();

        series.push(new Serie(serviceName,
                              data,
                              servicesIds[i]));
      }

      return new Series(labels, series);

    });

  }

  totalCalls({before} : {before : number}) {

    let summaries = [];

    if( EsbAPI.isMockMode() ) {

      for(let i = 0; i <= before; i++) {
        summaries.push(new Summary(moment().add(-i, 'days'),
                                   casual.integer(10000,30000)));
      }

      return summaries;

    }

    let from = `now-${before}d/d`;

    // Use https://elastic-builder.js.org/
    // to interactively translate JS to JSON query body
    const requestBody = esb.requestBodySearch()
    .query(
      esb.rangeQuery('trace_Date')
            .gte(from)
            .lte('now+1d/d')
    )
    .agg(
        esb.dateHistogramAggregation('histogram', 'trace_Date', 'day')
        .order('_key', "desc")
    );

    return elasticClient.search({
        index: config.summary_index_name,
        type: 'summary',
        _source: ["trace_Date", "message_guid"],
        "size": 0, // omit hits from putput
        body: requestBody.toJSON()
    }).then( response => {

        // Prepare dates array initialized with 0 to use in case where no calls
        // were detected for specific date
        for(let i = 0; i <= before; i++) {
          summaries.push(new Summary(moment().add(-i, 'days'), 0));
        }

        // Change values in this array if item
        // is found in elastic's hits
        summaries.map( _s => {

          const found = response.aggregations.histogram.buckets.find( bucket => {
            const m = moment(bucket.key_as_string);
            return _s.date.isSame(m, 'day');
          });

          if( found ) {
            _.assign( _s, {
              value: found.doc_count
            })
          }

        });

        return summaries;
    })
  }

  latency({before}: {before : number}) {

    let summaries = [];

    if( EsbAPI.isMockMode() ) {
      for(let i = before == 0 ? 0 : 1;
          i <= before; i++) {
        summaries.push(new Summary(moment().add(-i, 'days'),
                                   casual.integer(10, 30)));
      }

      return summaries;

    }

    let from = `now-${before}h/h`;

    // Use https://elastic-builder.js.org/
    // to interactively translate JS to JSON query body
    const requestBody = esb.requestBodySearch()
    .query(
      esb.rangeQuery('trace_Date')
            .gte(from)
            .lte('now/h')
    )
    .agg(
        esb.dateHistogramAggregation('latency', 'trace_Date', '1h')
        .order('_key', "desc")
    );

    return elasticClient.search({
      index: config.summary_index_name,
      type: 'summary',
      _source: ["started", "storyId"],
      "size": 0, // omit hits from output
      body: requestBody.toJSON()
    }).then( response => {

      response.aggregations.latency.buckets.forEach( bucket => {
        let date = moment(bucket.key_as_string);
        summaries.push(new Summary(date, bucket.doc_count));
      });

      return summaries;
    })

  }

  errors({before}: {before: number}) {

    let summaries = [];

    if( EsbAPI.isMockMode() ) {

      for(let i = 0; i <= before; i++) {
        summaries.push(new Summary(moment().add(-i, 'days'),
                                   casual.integer(0, 10)));
      }

      return summaries;
    }

    let from = `now-${before}d/d`;

    // Use https://elastic-builder.js.org/
    // to interactively translate JS to JSON query body
    const requestBody = esb.requestBodySearch()
      .query(
        esb.boolQuery()
          .must(esb.rangeQuery('trace_Date')
                      .gte(from)
                      .lte('now+1d/d')
          )
          .filter(esb.termsQuery('status', 'ERROR'))
      )
      .agg(
        esb.dateHistogramAggregation('histogram', 'trace_Date', 'day')
      );

      return elasticClient.search({
          index: config.summary_index_name,
          type: 'summary',
          "size": 0, // omit hits from putput
           "_source": ["trace_Date", "status"],
          body: requestBody.toJSON()
      }).then( response => {

        // Prepare dates array initialized with 0 to use in case where no errors
        // were detected for specific date
        for(let i = 0; i <= before; i++) {
          summaries.push(new Summary(moment().add(-i, 'days'), 0));
        }

        summaries.map( _s => {
          const found = response.aggregations.histogram.buckets.find( bucket => {
            const m = moment(bucket.key_as_string);
            return _s.date.isSame(m, 'day');
          });

          if( found ) {
            _.assign( _s, {
              value: found.doc_count
            })
          }

        })

        return summaries;
    })

  }

}

class ServiceRequest {

  id: string;

  constructor(id: string,
              name: string,
              objectId: number,
              categoryId: number,
              operationName: string,
              uri: string,
              soapAction: string,
              sla: number,
              created: Date) {
    this.id = id;
    this.name = name;
    this.objectId = objectId;
    this.categoryId = categoryId;
    this.operationName = operationName;
    this.address = uri;
    this.soapAction = soapAction;
    this.sla = sla,
    this.created = new Date(created);
  }

}

export const resolvers = {

  Query: {

    repository: (_, args, context) => {
      return new Repository();
    },

    runtime: (_, args, context) => {
      return new EsbRuntime()
    },

    traces: (_,args, context) => {

      let traces = [];

      traces.push(new Trace(casual.uuid,
                       casual.uuid,
                       'INFO',
                       mockServices[0].Name,
                       mockServices[0].Id));

      return traces;
    }
  },
  Category: {
    name: ({name}) => {
      return name.toUpperCase();
    }
  },

  Mutation: {

    addService: function(_, {input}, context) {

      if( EsbAPI.isMockMode() ) {

        let serviceId = casual.uuid;
        return new ServiceRequest(serviceId,
                           casual.title,
                           casual.integer(2000, 3000),
                           input.categoryId,
                           casual.title,
                           casual.url,
                           input.soapAction,
                           1,
                           casual.integer(200, 1000),
                           new Date());
      }
      else {

        //const url = 'http://esb01node01/ESBUddiApplication/api/Services';
        const url = 'http://m2055895-w7/ESBUddiApplication/api/Services';

        return rp({
          method: 'POST',
          uri: url,
          body: {

              "Name": input.name,
              "Description": null,
              "Url": input.address,
              "SoapAction": input.soapAction,
              "WsdlUrl": input.wsdlUrl,
              "ExpectedSla": input.sla,
              "Pattern": input.pattern,
              "Documentation": null,
              "CategoryId": input.categoryId,
              "OperationName" : null,
              "TargetNameSpace": null
          },
          headers: {
            'User-Agent': 'GraphQL'
          },
          json: true
        }).then( res => {
          console.log(res);

          return new ServiceRequest(casual.uuid,
                                    res.ServiceName,
                                    res.RequestId,
                                    res.CategoryId,
                                    res.ServiceName,
                                    res.Url,
                                    res.ServiceSoapAction,
                                    res.Environment,
                                    res.ExpectedSla,
                                    res.PublishRequestDate);

        }).catch( (error) => {
          console.log(error.message);
          return new GraphQLError(error.message);
        });

      }
    },

    deleteService(_, {serviceId}, context) {

        return esbRepository.deleteService(serviceId);

    },

  },


  Subscription: {

      // Subscriptions resolvers are not a functions,
      // but an objects with subscribe method, than returns AsyncIterable.
      serviceRequestDeleted: {
        subscribe: () => {
          console.log('Subscribed to serviceRequestDeleted');

          return pubsub.asyncIterator(SERVICE_REQUEST_DELETED_TOPIC);
        }
      },

      traceAdded: {
        subscribe: () => {
          console.log('Subscribed to traceAdded');

          if( EsbAPI.isMockMode() && mockTraceTimerId == null ) {
            mockTraceTimerId = setInterval( () => {

              let service = casual.random_element(esbRepository.services);
              var statuses = ['INFO', 'WARNING', 'ERROR'];
              let status = casual.random_element(statuses);

              const newTrace = new Trace(casual.uuid, //id
                                         casual.uuid, // storyId
                                         status,
                                         service.name,
                                         service.objectId);

              return pubsub.publish(TRACE_ADDED_TOPIC, {
                                                          traceAdded: newTrace
                                                         });

            }, 2000);
          } else {
              return pubsub.asyncIterator(TRACE_ADDED_TOPIC);
          }
        }
      }

    }
}

let mockTraceTimerId = null;
