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

if( ! EsbAPI.isMockMode() )
   var Kafka = require('no-kafka')

import elasticsearch from 'elasticsearch';

if( !EsbAPI.isMockMode() ) {

    var consumer = new Kafka.SimpleConsumer({
      connectionString: "10.1.70.101:9092",
      asyncCompression: true
    })

    var dataHandler = function(messageSet, topic, partition){

      messageSet.forEach(function (m){

        const message = m.message.value.toString('utf-8');
        var trace = JSON.parse(message);

        // Map serviceId to metadata
        // GET esb_ppr_repository/category/_search
        // {
        //   "query": {
        //     "nested": {
        //       "path": "service",
        //       "query": {
        //             "match": {
        //               "service.id": 1393
        //           }
        //
        //       },
        //       "inner_hits": {}
        //     }
        //   },
        //   "_source": false
        // }
        //
        let newTrace = new Trace(casual.uuid,
                                 trace.message_guid,
                                 "ERROR",
                                 trace.service_name,
                                 trace.service_id
                               );

        pubsub.publish(TRACE_ADDED_TOPIC, {
                                            traceAdded: newTrace
                                         });

      })

    }

    consumer.init().then( function() {
      return consumer.subscribe('esbmsgs_ppr', 0,
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
              when_published: Date) {
    this.id = id;
    this.objectId = objectId;
    this.name = name;
    this.address = address;
    this.description = description;
    this.sla = sla;
    this.categoryId = categoryId;
    this.when_published = when_published;
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

  services({categoryId, page, pageSize}) {

    //const categoryId = param.categoryId;
    if( EsbAPI.isMockMode() ) {

      if( !categoryId ) {

        return new SetInfo(esbRepository.services.length,
                           esbRepository.services);

      //   let promise = EsbAPI.Repository.getAllServices();
      //
      //   return new SetInfo(EsbAPI.Repository.getServicesCount(),
      //     promise.then( res => (
      //
      //       res.map( service => (
      //
      //         {
      //           id: 'svc' +  service.Id,
      //           objectId: service.Id,
      //           categoryId: service.CategoryId,
      //           name: service.Name,
      //           address: service.Url,
      //           sla: service.ExpectedSla
      //         }
      //
      //       ))
      //
      //   ))
      //
      // )

      } else {

        const services = esbRepository.services.filter( service => {
          return service.categoryId === categoryId
        })

        return new SetInfo(services.length,
                           services);

      //   let promise = EsbAPI.getServicesByCategoryId(categoryId);
      //
      //   return new SetInfo(EsbAPI.getServicesCount(),
      //     promise.then( res => (
      //
      //      res.map( service => (
      //
      //       {
      //         id: 'svc' + service.Id,
      //         objectId: service.Id,
      //         categoryId: service.CategoryId,
      //         name: service.Name,
      //         address: service.Url,
      //         environment: service.environment,
      //         sla: service.ServiceSLA
      //       }
      //
      //     ))
      //
      //   ))
      // );

      }

    } else{

      let url = ( !categoryId ) ?
               //'http://esb01node01/ESBUddiApplication/api/Services'
               'http://m2055895-w7/ESBUddiApplication/api/Services'
               : //'http://esb01node01/ESBUddiApplication/api/Services?categoryId=' + categoryId;
               'http://m2055895-w7/ESBUddiApplication/api/Services?categoryId=' + categoryId;

      if( page )
          // 'http://esb01node01/ESBUddiApplication/api/Services'
          url = `http://m2055895-w7/ESBUddiApplication/api/Services?pageNum=${page}&pageSize=${pageSize}`;

      return rp({
        uri: url,
        headers: {
          'User-Agent': 'GraphQL'
        },
        json: true
      }).then( ({list, totalRows}) => {

        let services = list.map( (service) => (
          {
            id: 'svc' + service.ServiceId,
            objectId: service.ServiceId,
            name: service.Name,
            categoryId: service.CategoryId,
            description: service.Description,
            address: service.Url,
            pattern: ( service.PatternId == 1 ) ? "Soap" : "Rest",
            environment: ( service.Environment == 1 ) ? "Internal" : "External",
            sla: service.ExpectedSla
          }
        ));

        return new SetInfo(totalRows, services);

      }).catch( (data) => {
        return Promise.reject(data.error.message);
      })

    }
  }

  categories() {

    if( EsbAPI.isMockMode() ) {

      return esbRepository.getCategories();

      // Use https://elastic-builder.js.org/
      // to interactively translate JS to JSON query body

      // const requestBody = esb.requestBodySearch()
      //   .query(
      //       esb.matchAllQuery()
      //   )
      //   .agg(esb.termsAggregation('unique_categories', 'name')
      //   .agg(esb.minAggregation('id', 'id')));
      //
      //
      // return elasticClient.search({
      //   index: 'esb_ppr_repository',
      //   type: 'category',
      //   "size": 0,
      //   body: requestBody.toJSON()
      // }).then( response => {
      //
      //     return response.aggregations.unique_categories.buckets.map( bucket => {
      //       return new Category(casual.uuid,
      //                           bucket.id.value,
      //                           bucket.key);
      //     });
      //
      // });

        //
        // let promise = EsbAPI.getAllCategories();
        // return promise.then( res => {
        //
        //     return res.map( (category) => {
        //
        //       return {
        //         id: casual.uuid,
        //         objectId: category.CategoryId,
        //         name: category.CategoryName
        //       }
        //     });
        //
        // });

    } else {

        //const url = 'http://esb01node01/ESBUddiApplication/api/Categories';
        const url = 'http://m2055895-w7/EsbUddiApplication/api/Categories';

        return rp({
          uri: url,
          headers: {
            'User-Agent': 'GraphQL'
          },
          json: true
        }).then( res => {

          return res.map( (category) => {
            return {
              id: casual.uuid,
              objectId: category.CategoryId,
              name: category.CategoryName
            }
          });

        }).catch( (data) => {
          return Promise.reject(data.error.message);
        })

    }
  }

  serviceRequests() {

    if( EsbAPI.isMockMode() ) {
      let promise = EsbAPI.Repository.getServiceRequests();
      return promise.then( res => {

        return res.map( (request) => {

          return {
            id:  request.id,
            address: request.Url,
            operationName: request.OperationName,
            name: request.ServiceName,
            objectId: request.RequestId,
            categoryId: request.CategoryId,
            sla: request.ExpectedSla,
            environment: request.Environment,
            created: request.PublishRequestDate,
          }

        });

      });
    } else {

      //const url = 'http://esb01/ESBUddiApplication/api/PublishRequest';
      const url = 'http://m2055895-w7/ESBUddiApplication/api/PublishRequest'

      return rp({
        uri: url,
        headers: {
          'User-Agent': 'GraphQL'
        },
        json: true
      }).then( res => {

        return res.map( (request) => {
          return {
            id:  'sreq' + request.RequestId, //casual.uuid,
            objectId: request.RequestId,
            address: request.Url,
            operationName: request.OperationName,
            name: request.ServiceName,
            categoryId: request.CategoryId,
            environment: request.Environment,
            sla: request.ExpectedSla,
            created: request.PublishRequestDate
          }
        });

      }).catch( (data) => {
        return Promise.reject(data.error.message);
      })

    }
  }

}

class Trace {

  constructor(id: string,
              storyId: string,
              status: string,
              serviceName: string,
              serviceId: number) {
    this.id = id
    this.storyId = storyId;
    this.time = new Date();
    this.message = 'Request received';
    this.eventId = casual.integer(1, 1000);
    this.status = status;

    this.serviceName = serviceName;
    this.serviceId = serviceId;
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
         let service = EsbAPI.getService(servicesIds[i]);
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
                esb.termsAggregation('serviceName', "service_name")
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

    console.time('Distribution query');
    return elasticClient.search({
      index: 'esb_ppr',
      type: 'correlate_msg',
      "size": 0, // omit hits from putput
      body: requestBody.toJSON()
    }).then( response => {

      console.timeEnd('Distribution query');

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

      for(let i = before == 0 ? 0 : 1;
          i <= before; i++) {
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
        index: 'esb_ppr',
        type: 'correlate_msg',
        _source: ["trace_Date", "message_guid"],
        "size": 0, // omit hits from putput
        body: requestBody.toJSON()
    }).then( response => {

        response.aggregations.histogram.buckets.forEach( bucket => {
          let date = moment(bucket.key_as_string).format('DD-MM-YYYY');
          summaries.push(new Summary(date,
                                     bucket.doc_count));
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
      index: 'esb_ppr',
      type: 'correlate_msg',
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

      for(let i = before == 0 ? 0 : 1;
          i <= before; i++) {
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
          index: 'esb_ppr',
          type: 'correlate_msg',
          "size": 0, // omit hits from putput
           "_source": ["trace_Date", "status"],
          body: requestBody.toJSON()
      }).then( response => {

        response.aggregations.histogram.buckets.forEach( bucket => {
          let date = moment(bucket.key_as_string).format('DD-MM-YYYY');;
          summaries.push(new Summary(date, bucket.doc_count));
        });

        return summaries;
    })

  }

}

class ServiceRequest {

  constructor(id: string,
              name: string,
              objectId: number,
              categoryId: number,
              operationName: string,
              uri: string,
              soapAction: string,
              environment: number = 1 | 2,
              sla: number,
              created: Date) {
    this.id = id;
    this.name = name;
    this.objectId = objectId;
    this.categoryId = categoryId;
    this.operationName = operationName;
    this.address = uri;
    this.soapAction = soapAction;
    this.environment = (environment == 1) ? 'External' : 'Internal';
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
              "Environment": input.environment,
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

    publishServiceRequest: function(_, {input}, context): Service {

        let requestId: number = input;

        if( EsbAPI.isMockMode() ) {
            return new Service(casual.uuid,
                               casual.integer(300, 400),
                               casual.title,
                               casual.url,
                               casual.description,
                               casual.integer(100, 200),
                               casual.integer(1,2),
                               new Date());
        } else {
            const url = 'http://m2055895-w7/ESBUddiApplication/api/PublishRequest?requestId=' + requestId;

            return rp({
              method: 'POST',
              uri: url,
              headers: {
                'User-Agent': 'GraphQL',
                'Accept': 'application/json'
              },
              json: true
            }).then( res => {
              console.log(res);
            }).catch( err => {
              console.log(err);
              return new GraphQLError(err.error.Message);
            });
        }
    },

    deleteServiceRequest: function(_, {requestId} : { requestId: number}) {

      const _id = 'sreq' + requestId;

      if( EsbAPI.isMockMode() ) {

        const serviceRequest = new ServiceRequest(_id);
        pubsub.publish(SERVICE_REQUEST_DELETED_TOPIC, {
            serviceRequestDeleted: serviceRequest
        });
        return serviceRequest;

      } else {
        const url = 'http://m2055895-w7/ESBUddiApplication/api/PublishRequest?requestId=' + requestId;
        return rp({
          method: 'DELETE',
          uri: url,
          headers: {
            'User-Agent': 'GraphQL',
            'Accept': 'application/json'
          },
          json: true
        }).then( res => {

          let serviceRequest = new ServiceRequest(_id);
          pubsub.publish(SERVICE_REQUEST_DELETED_TOPIC, {
              serviceRequestDeleted: serviceRequest
          });
          return serviceRequest;

        }).catch( err => {
          console.log(err);
          return new GraphQLError(err.error.Message);
        })
      }

    },

    disableService(_, {input}, context) {

      //if( isMockMode() ) {

        let serviceId = casual.uuid;
        return new Service(serviceId,
                           casual.title,
                           casual.integer(2000, 3000),
                           input.categoryId,
                           casual.title,
                           casual.url,
                           input.soapAction,
                           1,
                           casual.integer(200, 1000),
                           new Date());
      //}
    },

    deleteService(_, {input}, context) {
      //if( isMockMode() ) {

        let serviceId = casual.uuid;
        return new Service(serviceId,
                           casual.title,
                           casual.integer(2000, 3000),
                           input.categoryId,
                           casual.title,
                           casual.url,
                           input.soapAction,
                           1,
                           casual.integer(200, 1000),
                           new Date());
      //}

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

              let service = casual.random_element(mockServices);
              var statuses = ['INFO', 'WARNING', 'ERROR'];
              let status = casual.random_element(statuses);

              const newTrace = new Trace(casual.uuid, //id
                                         casual.uuid, // storyId
                                         status,
                                         service.Name,
                                         service.Id
                                       );
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
