#!/bin/bash

docker compose stop 

sudo rm -rf volume

mkdir volume

docker compose start postgres 