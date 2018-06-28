# EsbGQLServer
[![Build Status](https://travis-ci.org/Tel-Aviv/EsbGQLServer.svg?branch=master)](https://travis-ci.org/Tel-Aviv/EsbGQLServer) 

## How to build/debug

### If you intending to work against Elasticsearch ( Mock mode may be simpler :blush: )
a). Prepare 'esb_repository' index ( supply -e <env> parameter according to the desired environment)
  1. Run <code>yarn <b>create_repository_index</b> -e ppr (-e prod)</code> to (re-)create elastic index. This script will also delete existing mapping of the index.
  2. Run <code>yarn <b>create_repository_mapping</b> -e ppr (-e prod)</code> to map this index
  3. Load SQL data to this index by executing <code>yarn <b>load_repository_data</b> -e ppr (-e prod)</code> 
  4. Check you're done: <code>GET esb_repository(esb_ppr_repository)/_search { "query": { "match_all": {} }}</code>
  
b). Prepare runtime indexes
  1. Start with ensure you have <i>'esb_ppr_summary'</i> and <i>'esb_summary'</i> index. If you don't have a such, run: <code>yarn create-index</code>, elsewhere you may want to delete the existing one: issue <code>DELETE /esb_ppr</code> to Elasticsearch host
  2. Put mappings to this index: <code>yarn put-mappings</code>
  3. Load sample data: <code>yarn load-sample-data</code> 
or if you have access to MS SQLServer with real data: <code>yarn load-data</code>


### Then start GraphQL server
<code>$ yarn debug --e prod (--e ppr)</code> to start debugging with Chrome NIM (Note double dash(--) before environment name. This is because this parameter is passed to nodemon)

<code>$ yarn debug-mock -e prod (--e ppr)</code> to debug with Chrome NIM using mocked services

Production is configured to run on <code>babel-node</code>, so before running <code>start</code>, ensure you get <code>babel-node</code> by installing [babel-cli](https://babeljs.io/docs/usage/cli/).

<code>$ yarn start</code> to run without debugger with real backend services

