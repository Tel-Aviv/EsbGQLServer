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

enum esbDomain {
  AZURE
  DOM
}

type ServiceRequest implements Node {
  id: ID!
  objectId: Int
  name: String
  categoryId: Int
  operationName: String,
  address: String,
  soapAction: String,
  sla: Int!
  domain: esbDomain
  created: Date
}

type Repository implements Node {
  id: ID!
  services(categoryId: Int): [Service]
  categories: [Category]
  serviceRequests: [ServiceRequest]
}

type Summary implements Node {
  id: ID!
  date: Date
  value: Int
}

type Serie implements Node {
  id: ID!

  label: String!
  data: [Int!]!
}

type Series implements Node {
  id: ID!

  labels: [String!]!
  series: [Serie!]!
}

type Runtime implements Node {
  id: ID!
  totalCalls(when: Date): [Summary]
  latency(when: Date): [Summary] #in milliseconds
  errors(when: Date): [Summary]

  distribution(daysBefore: Int, servicesIds: [Int]) : Series
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
    runtime: Runtime
}

input ServiceInput {
  name: String!
  categoryId: Int!
  address: String!
  soapAction: String
  description: String
  sla: Int
  domain: esbDomain
  affiliations: [String]
}

type Mutation {
  addService(input: ServiceInput): ServiceRequest
  publishServiceRequest(input: Int): Service
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
