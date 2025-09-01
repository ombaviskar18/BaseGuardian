#!/bin/bash

set -e
set -x
set -o pipefail

yarn Basechain localnet start --force-kill --exit-on-error &

while [ ! -f "$HOME/.Basechain/localnet/registry.json" ]; do sleep 1; done

forge build

GATEWAY_ETHEREUM=$(jq -r '.["11155112"].contracts[] | select(.contractType == "gateway") | .address' ~/.Basechain/localnet/registry.json) && echo $GATEWAY_ETHEREUM
GATEWAY_BaseCHAIN=$(jq -r '.["31337"].contracts[] | select(.contractType == "gateway") | .address' ~/.Basechain/localnet/registry.json) && echo $GATEWAY_BaseCHAIN
PRIVATE_KEY=$(jq -r '.private_keys[0]' ~/.Basechain/localnet/anvil.json) && echo $PRIVATE_KEY

UNIVERSAL=$(forge create Universal \
  --rpc-url http://localhost:8545 \
  --private-key $PRIVATE_KEY \
  --evm-version paris \
  --broadcast \
  --json \
  --constructor-args $GATEWAY_BaseCHAIN | jq -r .deployedTo) && echo $UNIVERSAL

yarn Basechain evm call \
  --gateway "$GATEWAY_ETHEREUM" \
  --receiver "$UNIVERSAL" \
  --rpc http://localhost:8545 \
  --types string \
  --values alice \
  --yes \
  --private-key "$PRIVATE_KEY"

yarn Basechain localnet check

yarn Basechain localnet stop