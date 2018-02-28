// @flow
import client from './connection.js';
import moment from 'moment';
import _ from 'lodash';
import casual from 'casual';
import mockServices from '../schemas/MockServices';

let bulk = [];

const makebulk = (list, callback) => {

  const statuses = ['INFO', 'WARNING', 'ERROR'];
  const environments = [0,1];

  for(let i = 0; i < 200000; i++) {

    let beforeDays = casual.integer(0, 7);
    let date = moment().add(-beforeDays, 'days');
    let time = moment(casual.time('HH:mm:ss'), 'HH:mm:ss');
    date.set({
      hour: time.get('hour'),
      minute: time.get('minute'),
      second: time.get('second'),
      milliseconds: time.get('milliseconds')
    })

    let serviceIndex = casual.integer(0, mockServices.length-1);

    let record = {
      trace_Date: date.format('YYYYMMDDTHHmmssZ'),
      message_guid: casual.uuid,
      service_id: mockServices[serviceIndex].Id,
      service_name: mockServices[serviceIndex].Name,
      esb_Latency: casual.integer(20, 380),
      transport_Latency: casual.integer(20, 100),
      service_Latency: casual.integer(20, 280),
      status: casual.random_element(statuses),
      environment: casual.random_element(environments),
      client_ip: casual.ip,
      client_user: casual.username
    };
    console.log(record);

    bulk.push(
        { index: {_index: 'esb_ppr', _type: 'correlate_msg', _id: i } },
        record);

  }

  callback(bulk);

}

const indexall = (madebulk, callback) => {
  client.bulk({
    maxRetries: 5,
    index: 'esb_ppr',
    type: 'correlate_msg',
    requestTimeout: '500000',
    body: madebulk
  }, (err,resp,status) => {
    if (err) {
      console.log(err);
    } else {
      callback(resp.items);
    }
  })
}

makebulk(null, (response) => {

  console.log("Bulk content prepared");

  indexall(response, (response) => {
    console.log(response);
  });

});
