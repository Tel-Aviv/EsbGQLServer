import _ from 'lodash';
import rp from 'request-promise';
import { GraphQLError } from 'graphql/error';

const categories = [{
  CategoryId: 1,
  CategoryName: "משרד התחבורה"
}, {
  CategoryId: 2,
  CategoryName: "שירותי מיקום"
}, {
  CategoryId: 3,
  CategoryName: "דיגיתל"
}, {
  CategoryId: 4,
  CategoryName: "מחו\"ג"
}, {
  CategoryId: 5,
  CategoryName: "עירייה זמינה"
}, {
  CategoryId: 6,
  CategoryName: "עמ\"ל"
}, {
  CategoryId: 10,
  CategoryName: "טלאול"
}, {
  CategoryId: 12,
  CategoryName: "תשתיות אינטגרציה"
}];

class EsbAPI {
  static getAllCategories() {
    return new Promise( (resolve, reject) => {
      setTimeout( () => {
        resolve(_.assign([], categories))
      }, 1000);
    })
  }

  static getServicesByCategoryId(categoryId: number) {
    return new Promise( (resolve, reject) => {
        setTimeout( () => {

           let categorizedServices = services.filter( (service) => {
             return service.categoryId == categoryId;
           });

            resolve(_.assign([], categorizedServices))
        }, 1000);
    });
  }
};

const services = [{
    id: 1,
    categoryId: 1,
    name: 'Service Name A',
    address: 'http://iis07/apps/s1.svc',
    sla: 200
  }, {
    id: 2,
    categoryId: 2,
    name: 'Service Name B',
    address: 'http://iis08/apps/s2.svc',
    sla: 150
}];

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
                name: category.CategoryName
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
              name: category.CategoryName
            }
          });

        }).catch( (data) => {
          return Promise.reject(data.error.message);
        })

        return categories;
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

      if( !args.categoryId )
        return services;

      const categoryId = args.categoryId;

      if( isMockMode() ) {
        let promise = EsbAPI.getServicesByCategoryId(categoryId);
        return promise.then( _services => {
          return _services;
        });
      } else {

        const url = 'http://esb01/ESBUddiApplication/api/Services?categoryId=' + categoryId;

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
        const serice = services.find(service => service.name == name);
        return serice;
    }
  }

}
