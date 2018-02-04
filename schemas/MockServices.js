import casual from 'casual';

const mockServices = [{
    id: 111,
    ServiceId: () => casual.integer(200, 2000),
    CategoryId: 1,
    ServiceName: 'Service Name A',
    ServiceUrl: casual.url,
    ServiceSLA: 200
  }, {
    id: 112,
    ServiceId: () => casual.integer(200, 2000),
    CategoryId: 2,
    ServiceName: 'Service Name B',
    ServiceUrl: casual.url,
    ServiceSLA: 150
}, {
  id: 113,
  ServiceId: () => casual.integer(200, 2000),
  CategoryId: 2,
  ServiceName: 'Service Name C',
  ServiceUrl: casual.url,
  ServiceSLA: 140
}];

module.exports = mockServices;
