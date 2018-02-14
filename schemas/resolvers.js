// @flow
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import _ from 'lodash';
import casual from 'casual';
import rp from 'request-promise';
import { GraphQLError } from 'graphql/error';
import mockServices from './MockServices';
import mockServiceRequests from './MockServiceRequests';
import mockCategories from './MockCategories';
import elasticsearch from 'elasticsearch';

var client = new elasticsearch.Client({
  host: '10.1.70.47:9200',
  log: 'trace'
});

const MOCK_TIMEOUT = 1000;

class EsbAPI {

  static getCategory(categoryId: number) : Promise {

    return new Promise( (resolve, reject) => {

        setTimeout( () => {

          let category = mockCategories.find(category => category.CategoryId == categoryId);
          resolve(category);

        }, MOCK_TIMEOUT);
    })

  }

  static getAllCategories(): Promise {

    return new Promise( (resolve, reject) => {

      setTimeout( () => {

        resolve(_.assign([], mockCategories));

      }, MOCK_TIMEOUT);
    })
  }

  static getAllServices() : Promise {

    return new Promise( (resolve, reject) => {

      setTimeout( () => {

        resolve(_.assign([], mockServices));

      }, MOCK_TIMEOUT);
    });

  }

  static getService(objectId: number) : Service {
    return new Service(casual.uuid,
                      casual.integer(300, 400),
                      casual.title,
                      casual.url);
  }

  static getServicesByCategoryId(categoryId: number) : Promise {

    return new Promise( (resolve, reject) => {

        setTimeout( () => {

           let categorizedServices = mockServices.filter( (service) => {
             return service.CategoryId == categoryId;
           });

           resolve(_.assign([], categorizedServices));

        }, MOCK_TIMEOUT);
    })
  }

  static getServiceRequests() : Promise {
    return new Promise( (resolve, reject) => {

      setTimeout( () => {

        resolve(_.assign([], mockServiceRequests));

      }, MOCK_TIMEOUT);
    });
  }
}

function isMockMode(): boolean {

  let mockToken = process.argv.find( (arg: string) => {
    return arg == "--mock"
  });

  return mockToken;
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
    this.categories = this.categories.bind(this);
  }

  services({categoryId, page, pageSize}) {

    //const categoryId = param.categoryId;
    if( isMockMode() ) {

      if( !categoryId ) {

        let promise = EsbAPI.getAllServices();
        return promise.then( res => (

          res.map( service => (

            {
              id: casual.uuid,
              objectId: service.ServiceId,
              categoryId: service.CategoryId,
              name: service.ServiceName,
              address: service.ServiceUrl,
              sla: service.ServiceSLA
            }

          ))

        ));

      } else {

        let promise = EsbAPI.getServicesByCategoryId(categoryId);
        return promise.then( res => (

           res.map( service => (

            {
              id: casual.uuid,
              objectId: service.ServiceId,
              categoryId: service.CategoryId,
              name: service.ServiceName,
              address: service.ServiceUrl,
              sla: service.ServiceSLA
            }

          ))

        ));

      }

    } else{

      const url = ( !categoryId ) ?
               //'http://esb01node01/ESBUddiApplication/api/Services'
               'http://m2055895-w7/ESBUddiApplication/api/Services'
               : //'http://esb01node01/ESBUddiApplication/api/Services?categoryId=' + categoryId;
                  'http://m2055895-w7/ESBUddiApplication/api/Services?categoryId=' + categoryId;

      return rp({
        uri: url,
        headers: {
          'User-Agent': 'GraphQL'
        },
        json: true
      }).then( res => {

        return res.map( (service) => (

          {
            id: casual.uuid,
            objectId: service.ServiceId,
            name: service.ServiceName,
            categoryId: service.ServiceCategoryId,
            description: service.ServiceDescription,
            address: service.ServiceUri,
            sla: service.ExpectedSla
          }

        ));

      }).catch( (data) => {
        return Promise.reject(data.error.message);
      })

    }
  }

  categories() {

    if( isMockMode() ) {

        let promise = EsbAPI.getAllCategories();
        return promise.then( res => {

            return res.map( (category) => {

              return {
                id: casual.uuid,
                objectId: category.CategoryId,
                name: category.CategoryName
              }
            });

        });

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

    if( isMockMode() ) {
      let promise = EsbAPI.getServiceRequests();
      return promise.then( res => {

        return res.map( (request) => {

          return {
            id:  request.id,
            address: request.Url,
            operationName: request.OperationName,
            name: request.ServiceName,
            objectId: request.RequestId,
            categoryId: request.CategoryId,
            environment: 'DOM',
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
            id:  casual.uuid,
            objectId: request.RequestId,
            address: request.Url,
            operationName: request.OperationName,
            name: request.ServiceName,
            categoryId: request.CategoryId,
            domain: 'DOM',
            created: request.PublishRequestDate
          }
        });

      }).catch( (data) => {
        return Promise.reject(data.error.message);
      })

    }
  }

}

class Summary {
  constructor(date: Date, value: number) {
    this.date = date;
    this.value = value;
  }
}

class Serie {
  constructor(name: string) {
    this.id = casual.uuid;
    this.label = name
    this.data = [1,2,3];
  }
}

class Series {
  constructor(servicesIds: number[]) {
    this.id = casual.uuid;

    this.labels = ['03/02/2018', '04/02/2018', '05/02/2018'];

    this.series = [];
    for(let i = 0; i < servicesIds.length; i++) {
      let service = EsbAPI.getService(servicesIds[i]);
      this.series.push(new Serie(service.name));
    }
  }
}

class EsbRuntime {

  distribution(param) {
    let servicesIds: ?number[] = param.servicesIds;
    let when: number = param.daysBefore;

    return new Series(servicesIds);
  }

  totalCalls(param) {

    let summaries = [];
    //if( isMockMode() ) {

      for(let i = 0; i <= param.when; i++) {
        let date = new Date();
        date.setDate(date.getDate() - i);
        summaries.push(new Summary(date, casual.integer(10000,30000)));
      }
    // } else {
    //
    // }

    return summaries;
  }

  latency(param) {

    let summaries = [];

    //if( isMockMode() ) {
      for(let i = 0; i <= param.when; i++) {
        let date = new Date();
        date.setDate(date.getDate() - i);
        summaries.push(new Summary(new Date(), casual.integer(10, 30)));
      }
    // } else {
    //
    // }

    return summaries;
  }

  errors(param) {

    let summaries = [];

    //if( isMockMode() ) {
      for(let i = 0; i <= param.when; i++) {
        let date = new Date();
        date.setDate(date.getDate() - i);
        summaries.push(new Summary(new Date(), casual.integer(0, 10)));
      }
    // } else {
    //
    // }

    return summaries;
  }
}

class ServiceRequest {
  constructor(id: string,
              objectId: number,
              categoryId: number,
              operationName: string,
              uri: string,
              soapAction: string,
              unc: number = 1 | 2,
              created: Date) {
    this.id = id;
    this.objectId = objectId;
    this.categoryId = categoryId;
    this.operationName = operationName;
    this.address = uri;
    this.soapAction = soapAction;
    this.domain = (unc == 1) ? 'AZURE' : 'DOMAIN';
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
    }
  },

  Mutation: {

    addService: function(_, {input}, context) {

      if( isMockMode() ) {

        let serviceId = casual.uuid;
        return new ServiceRequest(serviceId,
                           casual.integer(2000, 3000),
                           input.categoryId,
                           casual.title,
                           casual.url,
                           input.soapAction,
                           1,
                           new Date());
      }
      else {

        //const url = 'http://esb01node01/ESBUddiApplication/api/Services';
        const url = 'http://m2055895-w7/ESBUddiApplication/api/Services';

        return rp({
          method: 'POST',
          uri: url,
          body: {

              "AuthenticationGroupId": 1,
              "CreateTimestamp": "2015-03-10T00:00:00",
              "ExpectedSla": input.sla,
              "Exposed": false,
              "Impersonate": false,
              "OwnerLogonname": "x6166614",
              "PatternId": "Soap",
              "CategoryId": input.categoryId,
              "Description": "",
              "ServiceDocumentation": null,
              "Name": input.name,
              "Url": input.address,
              "WsdlUrl": "http://esb01/xx/ESBRestRoutingService.svc?wsdl",
              "SoapAction": input.soapAction,
              "Enviroment": input.environment
          },
          headers: {
            'User-Agent': 'GraphQL'
          },
          json: true
        }).then( res => {
          console.log(res);

          return new ServiceRequest(casual.uuid,
                                    res.RequestId,
                                    res.CategoryID,
                                    res.ServiceName,
                                    res.ServiceUri,
                                    res.ServiceSoapAction,
                                    res.Unc,
                                    res.PublishRequestDate);

        }).catch( (error) => {
          console.log(error.message);
          return new GraphQLError(error.message);
        });

      }
    },

    publishServiceRequest: function(_, {input}, context): Service {

        let requestId: number = input;

        if( isMockMode() ) {
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

    disableService(_, {input}, context) {

      //if( isMockMode() ) {

        let serviceId = casual.uuid;
        return new ServiceRequest(serviceId,
                           casual.integer(2000, 3000),
                           input.categoryId,
                           casual.title,
                           casual.url,
                           input.soapAction,
                           1,
                           new Date());
      //}
    },

    deleteService(_, {input}, context) {
      //if( isMockMode() ) {

        let serviceId = casual.uuid;
        return new ServiceRequest(serviceId,
                           casual.integer(2000, 3000),
                           input.categoryId,
                           casual.title,
                           casual.url,
                           input.soapAction,
                           1,
                           new Date());
      //}

    }
  }

}
