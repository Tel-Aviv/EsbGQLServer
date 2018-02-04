import _ from 'lodash';
import casual from 'casual';
import rp from 'request-promise';
//import { GraphQLError } from 'graphql/error';
import mockServices from './MockServices';
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
}

export const resolvers = {

  Query: {

    repository: (_, args, context) => {
      return new Repository();
    }

  },

  Mutation: {
    publishService: function(_, {input}, context) {
      if( isMockMode() ) {
        let serviceId = casual.uuid;
        return new Service(serviceId,
                           input.name,
                           input.address,
                           input.description,
                           input.sla,
                           Date(),
                           input.affiliations);
      }
      else { // TBD with after 'npm install mssql' or with a call to ESP API endpoint

        //const url = 'http://esb01node01/ESBUddiApplication/api/Services';
        const url = 'http://m2055895-w7/ESBUddiApplication/api/Services';

        return rp({
          method: 'POST',
          uri: url,
          body: {

              "AuthenticationGroupId": 1,
              "CreateTimestamp": "2015-03-10T00:00:00",
              "ExpectedSla": 5000,
              "Exposed": false,
              "Impersonate": false,
              "OwnerLogonname": "x6166614",
              "PatternId": 1,
              "ServiceCategoryId": 12,
              "ServiceDescription": "infra",
              "ServiceDocumentation": null,
              "ServiceName": "rest routing service",
              "ServiceUri": "ESBRestRoutingService/ESBRestRoutingService.svc",
              "SoapAction": "Rest",
              "Unc": 1

          },
          headers: {
            'User-Agent': 'GraphQL'
          },
          json: true
        }).then( res => {
          console.log(res);
        }).catch( (error) => {
          console.log(error);
        });

      }
    }
  }

}
