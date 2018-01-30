import _ from 'lodash';
import rp from 'request-promise';
import { GraphQLError } from 'graphql/error';
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
             return service.categoryId == categoryId;
           });

           resolve(_.assign([], categorizedServices));

        }, MOCK_TIMEOUT);
    });
  }

  static generateServiceId() {
    let min = Math.ceil(1);
    let max = Math.floor(1000);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

};

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

export const resolvers = {

  Query: {

    categories: (root, args, context) => {

      if( isMockMode() ) {

        let promise = EsbAPI.getAllCategories();
        return promise.then( res => {

            return res.map( (category) => {

              return {
                id: category.CategoryId,
                name: category.CategoryName,
                description: category.Description
              }
            });

        });

      } else {

        const url = 'http://esb01node01/ESBUddiApplication/api/Categories';

        return rp({
          uri: url,
          headers: {
            'User-Agent': 'GraphQL'
          },
          json: true
        }).then( res => {

          return res.map( (category) => {
            return {
              id: category.CategoryId,
              name: category.CategoryName,
              description: category.Description
            }
          });

        }).catch( (data) => {
          return Promise.reject(data.error.message);
        })

        return categories;
      }
    },

    category: (root, {id}) => {

      if( isMockMode() ) {

        let promise = EsbAPI.getCategory(id);
        return promise.then ( res => {

          let services = mockServices.filter( s => s.categoryId == id );

          return {
            id: res.CategoryId,
            name: res.CategoryName,
            description: res.Description,
            services: services
          }

        });
      } else {
        const url = 'http://esb01node01/ESBUddiApplication/api/Categories/' + id;

        return rp({
          uri: url,
          headers: {
            'User-Agent': 'GraphQL'
          },
          json: true
        }).then( category => {
          return {
            id: category.CategoryId,
            name: category.CategoryName,
            description: category.Description
          }
        })
      }
    },

    services: (root, args, context) => {

      // client.search({
      //   index: 'esb',
      //   type: 'msg',
      //   body: {
      //     query: {
      //       match: {
      //         service_name: 'test_3'
      //       },
      //       filter: {
      //         range: {
      //           "start_date": { "gte": "2018-01-22"}
      //         }
      //       }
      //     }
      //   }
      // }).then(function (resp) {
      //     var hits = resp.hits.hits;
      // }, function (err) {
      //     console.trace(err.message);
      // });

      // 'context' is optional parameter passed to graphqlHTTP middleware.
      // According to express-graphql GitHub repository documentation (https://github.com/graphql/express-graphql#options)
      // this parameter is arbitrary value passed to resolvers.
      // The most important part of this invokation is following statement:
      // "If <i>context<i> is nor provided, the <i>request</i> object is passed as the context.
      //
      // So because we din't touched 'context' object on Express, we get it here as the request
      // parameter - named context

      const categoryId = args.categoryId;

      if( isMockMode() ) {

        if( !categoryId ) {

          let promise = EsbAPI.getAllServices();
          return promise.then( _services => {
            return _services;
          });

        } else {

          let promise = EsbAPI.getServicesByCategoryId(categoryId);
          return promise.then( _services => {
            return _services;
          });

        }
      } else {

        const url = ( !args.categoryId ) ?
                 'http://esb01node01/ESBUddiApplication/api/Services'
                 : 'http://esb01node01/ESBUddiApplication/api/Services?categoryId=' + categoryId;

        return rp({
          uri: url,
          headers: {
            'User-Agent': 'GraphQL'
          },
          json: true
        }).then( res => {

          return res.map( (service) => {

            return {
              id: service.ServiceID,
              name: service.ServiceName,
              categoryId: service.Category,
              description: service.ServiceDescription,
              address: service.ServiceURI,
              sla: 150
            }

          });

        }).catch( (data) => {
          return Promise.reject(data.error.message);
        })

      }

    },

    service: (root, {name}) => {
        const service = services.find(service => service.name == name);
        return service;
    }
  },

  Mutation: {
    publishService: function(_, {input}, context) {
      if( isMockMode() ) {
        let serviceId = EsbAPI.generateServiceId();
        return new Service(serviceId,
                           input.name,
                           input.address,
                           input.description,
                           input.sla,
                           Date(),
                           input.affiliations);
      }
      else { // TBD with after 'npm install mssql' or with a call to ESP API endpoint

        const url = 'http://esb01node01/ESBUddiApplication/api/Services';

        return rp({
          method: 'POST',
          uri: url,
          body: {

            // {
            //     "AuthenticationGroupId": 1,
            //     "CreateTimestamp": "2015-03-10T00:00:00",
            //     "ExpectedSla": 5000,
            //     "Exposed": false,
            //     "Impersonate": false,
            //     "OwnerLogonname": "x6166614",
            //     "PatternId": 1,
            //     "ServiceCategoryId": 12,
            //     "ServiceDescription": "infra",
            //     "ServiceDocumentation": null,
            //     "ServiceName": "rest routing service",
            //     "ServiceUri": "ESBRestRoutingService/ESBRestRoutingService.svc",
            //     "SoapAction": "Rest",
            //     "Unc": 1
            // }

          },
          headers: {
            'User-Agent': 'GraphQL'
          },
          json: true
        }).then( res => {
        }).catch( (error) => {
          console.log(error);
        });

        // let serviceId = 888;
        // return new Service(serviceId,
        //                      input.name,
        //                      input.address,
        //                      input.description,
        //                      input.sla,
        //                      Date(),
        //                      input.affiliations);
      }
    }
  }

}
