# EsbGQLServer
[![Build Status](https://travis-ci.org/Tel-Aviv/EsbGQLServer.svg?branch=master)](https://travis-ci.org/Tel-Aviv/EsbGQLServer) 

## How to build/debug

### If you intending to work against Elasticsearch
1. Start with creating 'esb_ppr' index: <code>yarn create-index</code>
2. Put mappings to this index: <code>yarn put-mappings</code>
3. Load sample data: <code>yarn load-sample-data</code> 
or if you have access to MS SQLServer with real data: <code>yarn load-data</code>

### Then start GraphQL server
<code>$ yarn debug</code> to start debugging with Chrome NIM

<code>$ yarn debug-mock</code> to debug with Chrome NIM using mocked services

Production is configured to run on <code>babel-node</code>, so before running <code>start</code>, ensure you get <code>babel-node</code> by installing [babel-cli](https://babeljs.io/docs/usage/cli/).

<code>$ yarn start</code> to run without debugger with real backend services

