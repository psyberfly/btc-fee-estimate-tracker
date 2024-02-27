# BTC Fee Estimate Tracker
**Status: alpha**  

A docker compose service to run:
1. [BTC Fee Estimate Watcher](btc-fee-watcher/README.md)
2. [BTC Fee Estimate Charter](btc-fee-charter/README.md)
3. A Postgres DB for Watcher

## Prerequisite
Linux, docker

## Usage
1. download current last 1 year history of api specific fee estimates (1-2 block/fastest) for mempool.space as CSV from [txstats](https://txstats.com/d/000000011/fee-estimation?orgId=1&viewPanel=2&var-source=mempool.space) and rename file as per Watcher ENV var CSV_FILE_PATH (default: fee_estimate_history.csv). Rename csv headers to "time", "satsPerByte" (ensure using CSV UTF-8 format to edit file or else expected and actual headers will give mismatch error even if same), and place in ./btc-fee-watcher/assets/ 
2. cd ./scripts/
3. sudo bash bft <command>
4. Use the bft CLI to setup, start or stop the service. Add ./scripts/ to path to invoke bft cli directly


## Dev:
1. Infra: docker compose
2. For more details, refer service components.
