import casual from 'casual';

const mockServiceRequests = [{
  id: 400,
  ServiceRequestId: casual.integer(200, 2000),
  operationName: casual.title,
  created: new Date(),
  ServiceUri: casual.url
}, {
  id: 401,
  ServiceRequestId: casual.integer(200, 2000),
  operationName: casual.title,
  created: new Date(),
  ServiceUri: casual.url
}];

module.exports = mockServiceRequests;
