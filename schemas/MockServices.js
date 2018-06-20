import casual from 'casual';

const mockServices = [{
    Id: 1,
    CategoryId: 1,
    Name: 'מיקי',
    Url: casual.url,
    ExpectedSla: 200
  }, {
    Id: 2,
    CategoryId: 2,
    Name: 'שירות אולג',
    Url: casual.url,
    ExpectedSla: 150
}, {
  Id: 3,
  CategoryId: 2,
  Name: 'מייק SAP',
  Url: casual.url,
  ExpectedSla: 140
},{
  Id: 4,
  CategoryId: 2,
  Name: 'Mock Service 1',
  Url: casual.url,
  ExpectedSla: 140
}, {
  Id: 5,
  CategoryId: 2,
  Name: 'Mock Service 2',
  Url: casual.url,
  ExpectedSla: 140
}];

module.exports = mockServices;
