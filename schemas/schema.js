import {
  makeExecutableSchema,
} from 'graphql-tools';

import { resolvers } from './resolvers.js';

const typeDefs = `

interface Node {
  # The id of the object.
  id: ID!
}

type User implements Node {
    id: ID!
}

type Category implements Node {
  id: ID!
  name: String
  description: String
  services: [Service]
}

type Service implements Node {
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

    viewer: User
    # Fetches an object given its ID
    node(
      # The ID of an object
      id: ID!
    ): Node

    categories: [Category]
    category(id: ID!) : Category
    services(categoryId: Int): [Service]
    service(name: String): Service
}

input ServiceInput {
  name: String!
  categoryId: Int!
  address: String!
  description: String
  sla: Int
  affiliation: String
}

type Mutation {
  publishService(input: ServiceInput): Service
}

type Subscription {
  traceAdded(serviceId: ID!): String
}
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });
export { schema };
