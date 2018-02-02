# EsbGQLServer
[![Build Status](https://travis-ci.org/Tel-Aviv/EsbGQLServer.svg?branch=master)](https://travis-ci.org/Tel-Aviv/EsbGQLServer) 

## How to build/debug

<code>$ yarn debug</code> to start debugging with Chrome NIM

<code>$ yarn debug-mock</code> to debug with Chrome NIM using mocked services

Production is configured to run on <code>babel-node</code>, so before running <code>start</code>, ensure you get <code>babel-node</code> by installing <a href='https://babeljs.io/docs/usage/cli/' target='_blank'>babel-cli</a>.

<code>$ yarn start</code> to run without debugger with real backend services

