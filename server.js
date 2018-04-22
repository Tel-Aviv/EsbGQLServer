import express from 'express';
import bodyParser from 'body-parser';
//import graphqlHTTP from 'express-graphql';
//import { graphiqlExpress } from 'graphql-server';

import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { ApolloEngine } from 'apollo-engine';

import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { expressPlayground } from 'graphql-playground-middleware';
import path from 'path';
import cors from 'cors';

import { schema } from './schemas/schema';

const graphQLServer = express();

graphQLServer.use('*', cors({
                    credentials: true,
                    origin: '*'
                  })
       );

// 'context' is optional parameter passed to graphqlHTTP middleware.
// According to express-graphql GitHub repository documentation (https://github.com/graphql/express-graphql#options)
// this parameter is arbitrary value passed to resolvers.
// The most important part of this invokation is following statement:
// "If <i>context<i> is nor provided, the <i>request</i> object is passed as the context.
//
// So because we don't touch 'context' object here, inside resolvers we get the request as third
// parameter - named context
graphQLServer.use('/graphql',
        bodyParser.json(),
        graphqlExpress({
                      schema: schema,
                      tracing: true,
                      cacheControl: true,
                      graphiql: process.env.NODE_ENV === 'development'
                  })
);

const PORT = process.env.port || 3001;

graphQLServer.use('/playground',
                  expressPlayground({
                                      endpoint: '/graphql',
                                      subscriptionEndpoint: `ws://localhost:${PORT}/subscriptions`
                                    })
                );
graphQLServer.use('/graphiql',
      graphiqlExpress({
          endpointURL: '/graphql',
          subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`
      })
);

const engine = new ApolloEngine({
  apiKey: 'service:esb-gql:V40YMFJ2kg_lyUViH6NDuw',
  logging: {
    level: 'DEBUG'
  }
});

engine.on('error', err => {
  console.log('There was an error starting the Apollo server or Engine');
  console.error(err);

  process.exit(1);
});

const websocketServer = createServer(graphQLServer);

engine.listen({
      port: PORT,
      //expressApp: graphQLServer,
      httpServer: websocketServer,
    }, () => {
    console.log(`Websocket Server is listening on: ${PORT}`);

    // Set up the WebSocket for handling GraphQL subscriptions
    new SubscriptionServer({
      execute,
      subscribe,
      schema
    }, {
      server: websocketServer,
      path: '/subscriptions',
    });

});
