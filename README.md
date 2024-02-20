# BTC Fee Estimate Tracker
**Status: alpha**  

A docker compose service to run:
1. [BTC Fee Estimate Watcher](btc-fee-watcher/README.md)
2. [BTC Fee Estimate Charter](btc-fee-charter/README.md)
3. A Postgres DB for Fee Watcher

## Usage
1. cd ./scripts/
2. sudo sh bft 
3. use the CLI to setup, start the service.

## To Do:
1. Auth
2. SSL for deployment
3. DB seeding via Watcher (.csv?) Can this be API based instead of file?
4. If needed: In compose make user the service admin to access volume/ for backup/restore?
