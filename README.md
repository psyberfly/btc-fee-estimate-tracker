# BTC Fee Estimate Tracker

This service consists of the componenets:
1. [BTC Fee Estimate Watcher](btc-fee-watcher/README.md) Back End
2. [BTC Fee Estimate Charter](btc-fee-charter/README.md) Front End
3. Postgres Database for Watcher

## Prerequisites
Linux host with docker

## Usage

**Firstly**:

Download current last 1 year history of api specific fee estimates (1-2 block/fastest) for mempool.space as CSV from [txstats](https://txstats.com/d/000000011/fee-estimation?orgId=1&viewPanel=2&var-source=mempool.space) and rename file as per Watcher ENV var CSV_FILE_PATH (default: fee_estimate_history.csv). Rename csv headers to "time", "satsPerByte" (ensure using CSV UTF-8 format to edit file or else expected and actual headers will give mismatch error even if they visually appear same), and place in ./btc-fee-watcher/assets/ 

**Then:**

### Prod
1. cd ./deployment/config/
2. cp config.sample.prod env.prod and update env.prod
3. cd ./deployment/scripts
2. ./build.prod.sh
3. ./start.prod.sh

### Dev / Local
1. cd ./deployment/scripts/
2. cp config.sample.local env.local and update env.local
3. cd ./deployment/scripts
4. ./build.local.sh
5. ./start.local.sh

Update code in ./btc-fee-watcer/src and ./btc-fee-charter/ to get hot reload. 

More info on service components:
1. [BTC Fee Estimate Watcher](btc-fee-watcher/README.md) Back End
2. [BTC Fee Estimate Charter](btc-fee-charter/README.md) Front End





