// @flow
import client from './connection.js';

client.indices.create({
  index: 'esb_ppr',
  timeout: '10m'
}).then( resp => {
  console.log("create: ",resp);
}). catch( err => {
  console.log(err);
})
