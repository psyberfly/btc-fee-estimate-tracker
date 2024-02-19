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
1. sudo chmod +x setup.sh start.sh
2. sh setup.sh
3. ensure that the db from the setup is running 
3. sh start.sh    

## Test:
Start service then test from terminal:  
### API: 
   curl http://localhost:3561/service/index
### WS: 
   websocat -H="Accept: application/json" -H="Content-Type: application/json" ws://localhost:3572/stream?service=index

## WIP:

## To Do:
1. render basic charts to visualize the index.
2. currently last year's fee estimate history is loaded locally from csv file. CSV File is loaded by host via psql. Write an init procedure in server to load it. 
3. Change nodejs host runtime to docker container runtime
4. Write setup scripts
5. Change intervals of IndexWatcher to prod internvals before deploying. 

## Known Issues:
1. Signing key for lib/http/handler.ts not generated:
   'No response signing key found!. Run $ ditto crpf sats_sig'
   Sample signature used for dev. Resolve issue for prod...

