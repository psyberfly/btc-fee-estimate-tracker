# BTC Fee Estimate Charter
A nodejs-React web app to get historic data of btc fee estimate index from [BTC Fee Estimate Watcher](../btc-fee-watcher/README.md) and chart graphs based on it at a webpage.  

## Stack:
nodejs, docker (optional)

## Usage:
### Docker:
   Use with [BTC Fee Estimate Tracker](./..)  
### Standalone:
  1. cp ./example.env .env
  2. Update .env
  3. npm start

### To Do:
version of dexie store is set to 3 else browsers give error of lower database version than available.