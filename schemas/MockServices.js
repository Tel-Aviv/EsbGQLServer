import casual from 'casual';

const mockServices = [{
    id: casual.uuid,
    objectId: 915,
    categoryId: 34,
    name: 'HR.GetEmployeeDataFromHR',
    address: 'http://iispprlb/TlvBusinessLogic/Applications/Integration/EmployeeDataFromHR/EmployeeDataFromHR.asmx',
    sla: 200,
    verb: 'POST'
  }, {
    id: casual.uuid,
    objectId: 947,
    categoryId: 28,
    name: 'Digitel.Crm.ActivateCustomer',
    address: 'http://dgtcrmbppr01/WS/DigitalMuniWCF/CRMDigitalMuniService.svc',
    sla: 150,
    verb: 'POST'
}, {
  id: casual.uuid,
  objectId: 957,
  categoryId: 28,
  name: 'Digitel.Crm.RemoveCustomerFromDistributionList',
  address: 'http://dgtcrmbppr01/WS/DigitalMuniWCF/CRMDigitalMuniService.svc',
  sla: 140,
  verb: 'POST'
}];

module.exports = mockServices;
