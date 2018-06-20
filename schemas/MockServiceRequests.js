import casual from 'casual';

const mockServiceRequests = [{
  id: 'sreq1',
  RequestId: 1,
  Url: casual.url,
  ServiceName: casual.title,
  OperationName: casual.title,
  Wsdl: casual.url,
  CategoryId: casual.integer(1, 50),
  SoapAction: casual.url,
  ExpectedSla: 250,
  Environment: 'DOM',
  PublishRequestDate: new Date(),
}, {
  id: 'sreq2',
  RequestId: 2,
  Url: casual.url,
  ServiceName: casual.title,
  OperationName: casual.title,
  Wsdl: casual.url,
  CategoryId: casual.integer(1, 50),
  SoapAction: casual.url,
  ExpectedSla: 250,
  Environment: 'DOM',
  PublishRequestDate: new Date(),
}];

module.exports = mockServiceRequests;
