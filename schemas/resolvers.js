import _ from 'lodash';
import rp from 'request-promise';
import { GraphQLError } from 'graphql/error';

const categories = [{
  CategoryId: 1,
  CategoryName: "משרד התחבורה",
  Description: "Description 1"
}, {
  CategoryId: 2,
  CategoryName: "שירותי מיקום",
  Description: "Description 2"
}, {
  CategoryId: 3,
  CategoryName: "דיגיתל",
  Description: "Description 3"
}, {
  CategoryId: 4,
  CategoryName: "מחו\"ג",
  Description: "Description 4"
}, {
  CategoryId: 5,
  CategoryName: "עירייה זמינה",
  Description: "Description 5"
}, {
  CategoryId: 6,
  CategoryName: "עמ\"ל",
  Description: "Description 6"
}, {
  CategoryId: 10,
  CategoryName: "טלאול",
  Description: "Description 10"
}, {
  CategoryId: 12,
  CategoryName: "תשתיות אינטגרציה",
  Description: "Description 12"
}];

const services = [{
    id: 111,
    categoryId: 1,
    name: 'Service Name A',
    address: 'http://iis07/apps/s1.svc',
    sla: 200
  }, {
    id: 112,
    categoryId: 2,
    name: 'Service Name B',
    address: 'http://iis08/apps/s2.svc',
    sla: 150
}];

class EsbAPI {
  static getAllCategories() {
    return new Promise( (resolve, reject) => {
      setTimeout( () => {
        resolve(_.assign([], categories))
      }, 1000);
    })
  }

  static getAllServices() {
    return new Promise( (resolve, reject) => {
      setTimeout( () => {

        resolve(_.assign([],services));

      }, 1000);
    });
 }

  static getServicesByCategoryId(categoryId: number) {
    return new Promise( (resolve, reject) => {
        setTimeout( () => {

           let categorizedServices = services.filter( (service) => {
             return service.categoryId == categoryId;
           });

            resolve(_.assign([], categorizedServices));

        }, 1000);
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
        const category = categories.find(category => category.CategoryId == id);
        return {
          id: category.CategoryId,
          name: category.CategoryName,
          description: category.Description
        }
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
