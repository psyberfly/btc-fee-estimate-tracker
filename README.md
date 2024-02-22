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
Dev:
Charter:
1. Make the toggling of time unit of a Chart also update the range of data displayed on timeline. Currently only the unit changes, not range.
2. Calculate the max y value in dataset and set yMax to that for different chart types.
3. Figure out 30, 365 day charts
4. Responsive

Watcher:
1. Auth
2. SSL for deployment
3. DB seeding via Watcher (.csv?) Can this be API based instead of file?
4. If needed: In compose make user the service admin to access volume/ for backup/restore?
