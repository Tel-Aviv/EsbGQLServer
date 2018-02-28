// @flow
 import client from './connection.js';

client.indices.putMapping({
  index: 'esb_ppr',
  type: 'correlate_msg',
  timeout: '10m',
  body: {
    "properties": {
      'trace_Date': {
        'type': 'date',
        //'format': 'basic_date_time'
        'format': 'basic_date_time_no_millis'
      },
      'message_guid': {
        'type': 'keyword'
      },
      'esb_Latency': {
        'type': 'integer',
      },
      'transport_Latency': {
        'type': 'integer',
      },
      'service_Latency': {
          'type': 'integer'
      },
      'status': {
        'type': 'keyword'
      },
      'service_id': {
        'type': 'short'
      },
      'service_name': {
        'type': 'keyword'
      },
      'environment': {
        'type': 'short'
      },
      'client_ip': {
        'type': 'ip'
      },
      'client_user': {
        'type': 'keyword'
      }

    }
  }
},function(err,resp,status){
    if (err) {
      console.log(err);
    }
    else {
      console.log(resp);
    }
});
