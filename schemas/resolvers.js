import rp from 'request-promise';
import { GraphQLError } from 'graphql/error';

const categories = [{
  id: 1,
  name: "משרד התחבורה"
}, {
  id: 2,
  name: "שירותי מיקום"
}, {
  id: 3,
  name: "דיגיתל"
}, {
  id: 4,
  name: "מחו\"ג"
}, {
  id: 5,
  name: "עירייה זמינה"
}, {
  id: 6,
  name: "עמ\"ל"
}, {
  id: 10,
  name: "טלאול"
}, {
  id: 12,
  name: "תשתיות אינטגרציה"
}];

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

export const resolvers = {

  Query: {

    categories: (root, args, context) => {
      return categories;
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

      return services.filter( (service) => {
        return service.categoryId == categoryId;
      })
    },
    service: (root, {name}) => {
        const serice = services.find(service => service.name == name);
        return serice;
    }
  }

}
