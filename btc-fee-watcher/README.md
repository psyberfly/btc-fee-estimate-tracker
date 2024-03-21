# BTC Fee Estimate Watcher &emsp;&emsp; )))<!>.<!>(((

## About:
A NodeJs app serving:

1. an API & websocket for: a statistical index indicating if current btc fee estimate is relatively low or not compared to last year and last month. This index is useful to alert transactors to avail low fee rates for txs, utxo consolidation, etc.  
The index provides 2 ratios: 
   1. Current fee estimate / last 365 days moving average of fee estimates    
   2. Current fee estimate / last 30 days moving average of fee estimates
           
If index (ratios) < 1, current fee is low, else high.  
The index is updated every 10 mins (~block) and moving averages every day.  
Fee estimates from [mempool_recommended_fee_api](https://mempool.space/docs/api/rest#get-recommended-fees)  
Fee estimate history from [txsats api_specific_fee_estimate](https://txstats.com/d/000000011/fee-estimation?orgId=1&viewPanel=2&var-source=mempool.space)  

2. An API for: historic index data to [btc-fee-charter](../btc-fee-charter) which charts it for public viewing.   

## More Info: 

For more info on the exact math used and the index cacluation schedule, refer: [Watcher Notes](../watcher-notes.md) 


## Stack:
NodeJs (Typescript), Postgres, Docker(optional)

## Usage:

### Docker (recommended):
1. Refer [btc-fee-estimate-tracker](../README.md)

### Standalone/Dev:
1. cp .example.env .env
2. Update .env
3. download current last 1 year history of api specific fee estimates (1-2 block/fastest) for mempool.space as CSV from txstats and rename file as per Watcher ENV var CSV_FILE_PATH (default: fee_estimate_history.csv). Rename csv headers to "time", "satsPerByte" (ensure using CSV UTF-8 format to edit file or else expected and actual headers will give mismatch error even if same), and place in ./assets/
4. Ensure your Postgres is running.
5. npm install && npx prisma migrate deploy && npx prisma generate && npx tsc && npm start 

## Testing:
### API: 
    curl -H "x-api-key: my-api-key" http://localhost:3561/api/v1/index
### WS: 
   websocat -H="Accept: application/json" -H="Content-Type: application/json" "ws://localhost:3572/api/v1?apiKey=my-api-key&service=index"

## Dev:
### Known Issues:
1. Signing key for lib/http/handler.ts not generated:
   'No response signing key found!. Run $ ditto crpf sats_sig'
   Sample signature used for dev. Resolve issue for prod...
2. 500 error response is wrong: {"error":"Internal Error. Contact support@satsbank.io"}

### To Do:
1. Upgrade: Seeding of moving averages & fee index: use bulkUpsert instead of upsert/create.
