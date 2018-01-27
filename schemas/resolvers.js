import _ from 'lodash';
import rp from 'request-promise';
import { GraphQLError } from 'graphql/error';
import mockServices from './MockServices';
import mockCategories from './MockCategories';

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

        resolve(_.assign([],services));

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
};

function isMockMode() {

  let mockToken = process.argv.find( (arg) => {
    return arg == "--mock"
  })

  return mockToken;
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

        const url = 'http://esb01/ESBUddiApplication/api/Categories';

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

          return {
            id: res.CategoryId,
            name: res.CategoryName,
            description: res.Description
          }

        });
      } else {
        const url = 'http://esb01/ESBUddiApplication/api/Categories/' + id;

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

        if( !args.categoryId ) {

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
                 'http://m2055895-w7/ESBUddiApplication/api/Services'
                 : 'http://m2055895-w7/ESBUddiApplication/api/Services?categoryId=' + categoryId;

        return rp({
          uri: url,
          headers: {
            'User-Agent': 'GraphQL'
          },
          json: true
        }).then( res => {

          return res;

        }).catch( (data) => {
          return Promise.reject(data.error.message);
        })

      }

    },

    service: (root, {name}) => {
        const service = services.find(service => service.name == name);
        return service;
    }
  }

}
