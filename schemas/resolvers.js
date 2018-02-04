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

  static getCategory(categoryId: number) {

    return new Promise( (resolve, reject) => {

        setTimeout( () => {

          let category = mockCategories.find(category => category.CategoryId == categoryId);
          resolve(category);

        }, MOCK_TIMEOUT);
    })

  }

  static getAllCategories() {

    return new Promise( (resolve, reject) => {

      setTimeout( () => {

        resolve(_.assign([], mockCategories));

      }, MOCK_TIMEOUT);
    })
  }

  static getAllServices() {

    return new Promise( (resolve, reject) => {

      setTimeout( () => {

        resolve(_.assign([], mockServices));

      }, MOCK_TIMEOUT);
    });

  }

  static getServicesByCategoryId(categoryId: number) {

    return new Promise( (resolve, reject) => {

        setTimeout( () => {

           let categorizedServices = mockServices.filter( (service) => {
             return service.CategoryId == categoryId;
           });

           resolve(_.assign([], categorizedServices));

        }, MOCK_TIMEOUT);
    })
  }

  static getServiceRequests() {
    return new Promise( (resolve, reject) => {

      setTimeout( () => {

        resolve(_.assign([], mockServiceRequests));

      }, MOCK_TIMEOUT);
    });
  }
}

function isMockMode() {

  let mockToken = process.argv.find( (arg) => {
    return arg == "--mock"
  })

  return mockToken;
}

class Service {
  constructor(id, name, address, description, sla, when_published, affiliations) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.description = description;
    this.sla = sla;
    this.when_published = when_published;
    this.affiliations = affiliations;
  }
}

const repositoryId = casual.uuid;

class Repository {

  constructor() {

    this.id = repositoryId;

    this.services = this.services.bind(this);
    this.categories = this.categories.bind(this);
  }

  services(param) {

    const categoryId = param.categoryId;
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

        return categories;

    }
  }

  serviceRequests() {

    //if( isMockMode() ) {
      let promise = EsbAPI.getServiceRequests();
      return promise.then( res => {

        return res.map( (request) => {

          return {
            id:  request.id,
            objectId: request.ServiceRequestId,
            domain: 'DOM',
            created: request.created,
            address: request.ServiceUri
          }

        });

      });
    //} else {
    //
    //}
  }
}

class ServiceRequest {
  constructor(id,
              objectId: integer,
              operationName: string,
              uri: string,
              soapAction: string,
              unc: integer,
              created: Date) {
    this.id = id;
    this.objectId = objectId;
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
    }

  },

  Mutation: {

    addService: function(_, {input}, context) {
      if( isMockMode() ) {
        let serviceId = casual.uuid;
        return new ServiceRequest(casual.uuid,
                           casual.integer(2000, 3000),
                           casual.title,
                           casual.url,
                           casual.url,
                           1,
                           new Date());
      }
      else {

        //const url = 'http://esb01node01/ESBUddiApplication/api/Services';
        const url = 'http://m2055895-w7/ESBUddiApplication/api/Services';

        let unc = ( input.domain == 'AZURE') ? 1 : 0;

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
              "PatternId": 1,
              "ServiceCategoryId": input.categoryId,
              "ServiceDescription": "infra",
              "ServiceDocumentation": null,
              "ServiceName": input.name,
              "ServiceUri": input.address,
              "ServiceWsdl": "http://esb01/xx/ESBRestRoutingService.svc?wsdl",
              "SoapAction": input.soapAction,
              "Unc": unc

          },
          headers: {
            'User-Agent': 'GraphQL'
          },
          json: true
        }).then( res => {
          console.log(res);

          return new ServiceRequest(casual.uuid,
                                    res.RequestId,
                                    res.OperationName,
                                    res.ServiceUri,
                                    res.ServiceSoapAction,
                                    res.Unc,
                                    res.PublishRequestDate);

        }).catch( (error) => {
          console.log(error);
          return new GraphQLError(error);
        });

      }
    },

    publishServiceRequest: function(_, {input}, context) {
        if( isMockMode() ) {

        } else {
            //const url = 'http://m2055895-w7/ESBUddiApplication/api/Services';
        }
    },
  }

}
