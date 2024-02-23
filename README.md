# BTC Fee Estimate Tracker
**Status: alpha**  

A docker compose service to run:
1. [BTC Fee Estimate Watcher](btc-fee-watcher/README.md)
2. [BTC Fee Estimate Charter](btc-fee-charter/README.md)
3. A Postgres DB for Fee Watcher

## Usage
1. download current last 1 year history of api specific fee estimates (1-2 block/fastest) for mempool.space as CSV from [txstats](https://txstats.com/d/000000011/fee-estimation?orgId=1&viewPanel=2&var-source=mempool.space), name file as per ENV var CSV_FILE_PATH, rename csv headers to "time", "satsPerByte", and place in ./assets/ 
2. cd ./scripts/
3. sudo sh bft 
4. use the CLI to setup, start the service.


Watcher:
1. Auth
2. SSL for deployment
3. DB seeding via Watcher (.csv?) Can this be API based instead of file?
4. If needed: In compose make user the service admin to access volume/ for backup/restore?
