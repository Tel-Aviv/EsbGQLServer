import casual from 'casual';

const mockServiceRequests = [{
  id: 400,
  RequestId: casual.integer(200, 2000),
  ServiceUri: casual.url,
  ServiceName: casual.title,
  OperationName: casual.title,
  ServiceSdl: casual.url,
  ServiceCategoryId: casual.integer(1, 50),
  ServiceSoapAction: casual.url,
  PublishRequestDate: new Date(),
  ServiceUri: casual.url
}, {
  id: 401,
  RequestId: casual.integer(200, 2000),
  ServiceUri: casual.url,
  ServiceName: casual.title,
  OperationName: casual.title,
  ServiceSdl: casual.url,
  ServiceCategoryId: casual.integer(1, 50),
  ServiceSoapAction: casual.url,
  PublishRequestDate: new Date(),
  ServiceUri: casual.url
}];

module.exports = mockServiceRequests;
