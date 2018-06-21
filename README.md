# EsbGQLServer
[![Build Status](https://travis-ci.org/Tel-Aviv/EsbGQLServer.svg?branch=master)](https://travis-ci.org/Tel-Aviv/EsbGQLServer) 

## How to build/debug

### If you intending to work against Elasticsearch (Mock mode may be simpler :blush: )
a). Prepare 'esb_repository' index
  1. Ensure you have 'esb_repository' index: <code>HEAD esb_repository</code>
  2. If this index does not exist, execute <code>PUT esb_repository { "settings": { "number_of_shards": 1 }}</code>
  3. Put mapping on this index by executing <code><code>yarn mapping_repository <b>-e prod</b></code> (node ./elastic/mapping_repository.js <b>-e prod</b>)
  4. Load SQL data to this index by executing <code>node ./elastic/load_metadata.js <b>-e prod</b></code>(<code>yarn load_metadata</code>)
  5. Check you're done: <code>GET esb_repository/_search { "query": { "match_all": {} }}</code>
  
b). Prepare runtime indexes
  1. Start with ensure you have <i>'esb_ppr_summary'</i> and <i>'esb_summary'</i> index. If you don't have a such, run: <code>yarn create-index</code>, elsewhere you may want to delete the existing one: issue <code>DELETE /esb_ppr</code> to Elasticsearch host
  2. Put mappings to this index: <code>yarn put-mappings</code>
  3. Load sample data: <code>yarn load-sample-data</code> 
or if you have access to MS SQLServer with real data: <code>yarn load-data</code>


### Then start GraphQL server
<code>$ yarn debug</code> to start debugging with Chrome NIM

<code>$ yarn debug-mock</code> to debug with Chrome NIM using mocked services

Production is configured to run on <code>babel-node</code>, so before running <code>start</code>, ensure you get <code>babel-node</code> by installing [babel-cli](https://babeljs.io/docs/usage/cli/).

<code>$ yarn start</code> to run without debugger with real backend services

