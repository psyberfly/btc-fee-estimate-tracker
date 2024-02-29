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

## Dev: 
### Known Issues:
1. TS Compiler gives Type errors in App.tsx and chart_view.tsx with respect to React component types. These can be ignored since react package lacks up to date type support. Or, the react files format can be changed to .jsx (at the cost of losing types for non-React code also). React-types have been omitted from project (package.json) because latest version of react-types is out of date with the react version used.  

### To Do:
#### Data Caching:

At app onset:
1. Fetch history of selected chartType chart.
2. Store in DB

Then, every 10 mins:
1. Read the latest createdAt/time of selected chartType chart data from DB.
2. Request watcher for that chart type data BEYOND that latest createdAt upto most recent available.
3. Upsert received data to existent history for that chart type in DB.
      
#### Lazy Loading:

Currently selectedTimeRange is within ChartView component and outside of main App where data fetching occurs. The selectedTimeRange should be used in the data fetching mechanism to fetch data from watcher according to selectedTimeRange. That is, at onset of app fetch only upto 1 month history (as this is always quite quick). Beyond that range, only fetch and store history for increasing ranges, i.e., fetch 1Y only when user selects 1Y or 5Y when user selects 5Y, and so on. 