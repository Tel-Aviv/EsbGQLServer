import casual from 'casual';

const mockServices = [{
    id: 1,
    CategoryId: 1,
    name: 'מיקי',
    Url: casual.url,
    ExpectedSla: 200
  }, {
    id: 2,
    CategoryId: 2,
    name: 'שירות אולג',
    Url: casual.url,
    ExpectedSla: 150
}, {
  id: 3,
  CategoryId: 2,
  name: 'מייק SAP',
  Url: casual.url,
  ExpectedSla: 140
},{
  id: 4,
  CategoryId: 2,
  name: 'Mock Service 1',
  Url: casual.url,
  ExpectedSla: 140
}, {
  id: 5,
  CategoryId: 2,
  name: 'Mock Service 2',
  Url: casual.url,
  ExpectedSla: 140
}];

module.exports = mockServices;
