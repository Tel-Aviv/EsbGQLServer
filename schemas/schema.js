import {
  makeExecutableSchema,
} from 'graphql-tools';

import { resolvers } from './resolvers.js';

const typeDefs = `

type Category {
  id: ID!
  name: String
  description: String
}

type Service {
    id: ID!
    categoryId: Int
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
    category(id: ID!) : Category
    services(categoryId: Int): [Service]
    service(name: String): Service
}

type Mutation {
  publishService(name: String, address: String): Service
}

type Subscription {
  traceAdded(serviceId: ID!): String
}
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });
export { schema };
