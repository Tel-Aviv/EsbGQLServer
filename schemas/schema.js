import {
  makeExecutableSchema,
} from 'graphql-tools';

import { resolvers } from './resolvers.js';

const typeDefs = `

scalar Date

interface Node {
  # The id of the object.
  id: ID!
}

type User implements Node {
    id: ID!
}

type Category implements Node {
  """
  This is globally unique ID for the object in entire system. Used for 'Node interface'.
  """
  id: ID!

  """
  This is unique ID of the Category between other Categories
  """
  objectId: Int!

  name: String
  description: String
  services: [Service]
}

type Service implements Node {
    """
    This is globally unique ID for the object in entire system. Used for 'Node interface'.
    """
    id: ID!

    """
    This is unique ID of the Service between other Services
    """
    objectId: Int!
    
    categoryId: Int
    name: String
    address: String!
    description: String
    sla: Int
    when_published: String #Date
    affiliations: [String]
    available: Boolean
}

type Repository implements Node {
  id: ID!
  services(categoryId: Int): [Service]
  categories: [Category]
}

# This type specifies the entry points into our API.
type Query {

    viewer: User
    # Fetches an object given its ID
    node(
      # The ID of an object
      id: ID!
    ): Node

    repository: Repository
}

input ServiceInput {
  name: String!
  categoryId: Int!
  address: String!
  description: String
  sla: Int
  affiliations: [String]
}

type Mutation {
  publishService(input: ServiceInput): Service
}

type Subscription {
  traceAdded(serviceId: ID!): String
}
`;

const logger = { log: (e) => console.log(e) }

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  logger
});
export { schema };
