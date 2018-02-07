import casual from 'casual';

const mockServiceRequests = [{
  id: 400,
  RequestId: casual.integer(200, 2000),
  Url: casual.url,
  ServiceName: casual.title,
  OperationName: casual.title,
  Wsdl: casual.url,
  CategoryId: casual.integer(1, 50),
  SoapAction: casual.url,
  PublishRequestDate: new Date(),
}, {
  id: 401,
  RequestId: casual.integer(200, 2000),
  Url: casual.url,
  ServiceName: casual.title,
  OperationName: casual.title,
  Wsdl: casual.url,
  CategoryId: casual.integer(1, 50),
  SoapAction: casual.url,
  PublishRequestDate: new Date(),
}];

module.exports = mockServiceRequests;
