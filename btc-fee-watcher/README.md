# BTC Fee Estimate Watcher &emsp;&emsp; )))<!>.<!>(((

## About:
A service to provide an index indicating if current btc fee estimate is low or not (compared to last year and last month). This index is useful to alert customers to avail low fee rates for txs, utxo consolidation, etc.  
The index is available via API & Websocket and provides 2 ratios: 
   1. Current fee estimate / last 365 days moving average of fee estimates    
   2. Current fee estimate / last 30 days moving average of fee estimates
           
If index (ratios) < 1, current fee is low, else high.  
The index is updated every 10 mins (~block) and moving averages every day.  
Fee estimates from [mempool_recommended_fee_api](https://mempool.space/docs/api/rest#get-recommended-fees)  
Fee estimate history from [txsats api_specific_fee_estimate](https://txstats.com/d/000000011/fee-estimation?orgId=1&viewPanel=2&var-source=mempool.space)  

## Stack:
NodeJs (Typescript) + Postgres

## Prerequisites:
nodejs, npm, postgres server

## Usage:

1. Use with btc-fee-tracker.  
or as standalone by:  
2. npx prisma migrate deploy && npx prisma generate && npx tsc && npm start 


## Test:
Start service then test from terminal:  
### API: 
    curl -H "x-api-key: my-api-key" http://localhost:3561/api/v1/index
### WS: 
Using websocat:
   websocat -H="Accept: application/json" -H="Content-Type: application/json" "ws://localhost:3572/api/v1?apiKey=my-api-key&service=index"

## WIP:

## To Do:
1. currently last year's fee estimate history is loaded locally from csv file. CSV File is loaded by host via psql. Write an init procedure in server to load it.
2. Maybe historic data like fee estimates and moving averages should be stored by index of time/createdAt (with some mechanism like 1 for each day, or 1 for each 10 mins?) instead of serial id, so older data can be inserted? 

## Known Issues:
1. Signing key for lib/http/handler.ts not generated:
   'No response signing key found!. Run $ ditto crpf sats_sig'
   Sample signature used for dev. Resolve issue for prod...

