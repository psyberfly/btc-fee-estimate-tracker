# BTC Fee Estimate Charter
A nodejs-React web app to get historic data from [BTC Fee Estimate Watcher](../btc-fee-watcher/README.md) and chart its graphs on a webpage.  

## Usage:
Use with [BTC Fee Estimate Tracker](./..)  
Or, run as standalone docker container.  
Or, run as standalone on host with npm.

## Dev:
TS Compiler gives Type errors in App.tsx and chart_view.tsx with respect to React component types. These can be ignored. Or file format can be changed to .jsx (at the cost of losing types for non-React code too.). React-types have been omitted from project (package.json) because latest version of react-types is out of date with the react version used.  