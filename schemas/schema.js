import {
  makeExecutableSchema,
} from 'graphql-tools';

import { resolvers } from './resolvers.js';

const typeDefs = `

type Category {
  id: ID!
  name: String
}

type Service {
    id: ID!
    name: String
    address: String!
    description: String
    sla: Int
    when_published: String #Date
    affiliation: [String]
    available: Boolean
}

# This type specifies the entry points into our API.
type Query {
    categories: [Category]
    services: [Service]
    service(name: String): Service
}
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });
export { schema };
