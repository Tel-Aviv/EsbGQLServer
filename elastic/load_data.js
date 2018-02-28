import client from './connection';
import sql from 'mssql';
import moment from 'moment';
import casual from 'casual';

let bulk = [];

const config = {
  user: 'db653_t',
  password: 'h#606653',
  server: 'sql07\\preprodop',
  database: 'db653'
};

sql.connect(config, err => {
    const request = new sql.Request()
    request.stream = true
    request.query('select top 200000 * from v_traces order by trace_time desc');

    let currentIndex = 0;

    request.on('row', row => {

        let record = {
          trace_Date: moment(row.trace_time).format('YYYYMMDDTHHmmssZ'),
          message_guid: row.trace_id,
          service_id: row.service_id,
          service_name: row.service_name,
          esb_Latency: !row.esb_Latency ? 0 : row.esb_Latency,
          transport_Latency: 0,
          service_Latency: !row.service_latency ? 0 : row.service_latency,
          status: row.status_id,
          environment: row.unc,
          client_ip: !row.client_ip ? '0.0.0.0' : row.client_ip,
          client_user: row.client_user
        }

        //console.log(record);

        bulk.push(
          { index: {_index: 'esb_ppr', _type: 'correlate_msg', _id: currentIndex++} },
          record);

    })

    request.on('error', err => {
      console.error('Error: ' + err);
    })

    request.on('done', result => {
        indexall(bulk);
    })

});

const indexall = (madebulk, callback) => {
  console.log('Bulk prepared: ' + madebulk.length);

  client.bulk({
    index: 'esb_ppr',
    type: 'correlate_msg',
    timeout: '10m',
    body: madebulk
  }, (err, resp, status) => {
    if( err ) {
      console.error('Error: ' + err);
    } else {

      console.log('Indexed: ' + resp.items.length);
      console.log('Status: ' + status);

    }
  })
}
