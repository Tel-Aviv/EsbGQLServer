import casual from 'casual';

const mockServices = [{
    Id: () => casual.integer(200, 2000),
    CategoryId: 1,
    Name: 'Service Name A',
    Url: casual.url,
    ExpectedSla: 200
  }, {
    Id: () => casual.integer(200, 2000),
    CategoryId: 2,
    Name: 'Service Name B',
    Url: casual.url,
    ExpectedSla: 150
}, {
  Id: () => casual.integer(200, 2000),
  CategoryId: 2,
  Name: 'Service Name C',
  Url: casual.url,
  ExpectedSla: 140
}];

module.exports = mockServices;
