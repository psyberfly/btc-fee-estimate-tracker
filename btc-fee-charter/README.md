# BTC Fee Estimate Charter
A nodejs-React web app to get historic data of btc fee estimate index from [BTC Fee Estimate Watcher](../btc-fee-watcher/README.md) and chart graphs based on it at a webpage.  

## Usage:

### Docker:
   Use with [BTC Fee Estimate Tracker](./..)  

### Standalone:
  1. cp ./example.env .env
  2. Update .env
  3. npm start

## Dev: 
### Known Issues:
1. TS Compiler gives Type errors in App.tsx and chart_view.tsx with respect to React component types. These can be ignored since react package lacks up to date type support. Or, the react files format can be changed to .jsx (at the cost of losing types for non-React code also). React-types have been omitted from project (package.json) because latest version of react-types is out of date with the react version used.  
