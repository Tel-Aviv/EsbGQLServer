import {
  makeExecutableSchema,
} from 'graphql-tools';

import { resolvers } from './resolvers.js';

const typeDefs = `

scalar Date

interface Node {
  id: ID!
}

type User implements Node {
    id: ID!
}

type Category implements Node {
  id: ID!

  objectId: Int!

  name: String
  description: String
  services: [Service]
}

type Service implements Node {
    id: ID!

    objectId: Int!
    categoryId: Int
    name: String
    address: String!
    description: String
    sla: Int
    when_published: String #Date
    pattern: String!,
    environment: String!,
    available: Boolean
}

type ServiceRequest implements Node {
  id: ID!
  objectId: Int
  name: String
  categoryId: Int
  operationName: String
  address: String
  soapAction: String
  sla: Int!
  environment: String!
  created: Date
}

type SetInfo implements Node {
  id: ID!
  totalItems: Int
  list:  [Service]
}

type Repository implements Node {
  id: ID!
  services(categoryId: Int,
           page: Int,
           pageSize: Int): SetInfo
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
  serviceId: Int!
}

type Series implements Node {
  id: ID!

  labels: [String!]!
  series: [Serie!]!
}

type Runtime implements Node {
  id: ID!
  totalCalls(before: Date): [Summary]
  latency(before: Date): [Summary] #in milliseconds
  errors(before: Date): [Summary]

  distribution(daysBefore: Int, servicesIds: [Int]!) : Series
}

type Query {

    viewer: User

    node(
      id: ID!
    ): Node

    repository: Repository
    runtime: Runtime
}

input ServiceInput {
  name: String!
  categoryId: Int!
  address: String!
  pattern: String!
  soapAction: String
  sla: Int
  environment: String!
}

type Message {
  id: Int
  text: String
}

type Mutation {
  addService(input: ServiceInput): ServiceRequest

  publishServiceRequest(input: Int): Service
  deleteServiceRequest(requestId: Int): ServiceRequest

  disableService(input: Int): Service
  deleteService(input: Int): Service
}

type Trace {
  id: ID!

  storyId: ID!
  time: Date!
  serviceName: String!
  serviceId: Int!
  message: String
  eventId: Int
  status: String
}

type Subscription {
    traceAdded(serviceId: Int): Trace
    serviceRequestDeleted: ServiceRequest
}
`;

const logger = { log: (e) => console.log(e) }

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  logger
});
export { schema };
