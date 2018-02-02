import express from 'express';
import bodyParser from 'body-parser';
import graphqlHTTP from 'express-graphql';
import { graphiqlExpress } from 'graphql-server';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import path from 'path';
import cors from 'cors';
import pubsub from './PubSub';

import { schema } from './schemas/schema';

const TRACE_TOPIC = 'trace';

setInterval(() => {
  //console.log('timer');
  pubsub.publish(TRACE_TOPIC, { addTrace: {
    serviceId: 1
  } });
}, 1000);

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
        graphqlHTTP({
                      schema: schema,
                      graphiql: process.env.NODE_ENV === 'development'
                  })
);

graphQLServer.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: 'ws://localhost:3001/graphql'
}));

const websocketServer = createServer(graphQLServer);

const PORT = process.env.port || 3001;

// graphQLServer.listen(PORT, () => {
//     console.log(`GraphQL Server is listening on: ${PORT}`);
// });
websocketServer.listen(PORT, () => {
    console.log(`Websocket Server is listening on: ${PORT}`);
});

// Set up the WebSocket for handling GraphQL subscriptions
new SubscriptionServer({
  execute,
  subscribe,
  schema
}, {
  server: websocketServer,
  path: '/graphql',
});
