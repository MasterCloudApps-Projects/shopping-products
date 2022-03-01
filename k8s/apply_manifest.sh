#!/usr/bin/env bash

# Create namespace
printf "\n==> Creating DEV namespace\n"
kubectl create namespace tfm-dev-amartinm82

# create secrets
printf "\n==> Creating secrets\n"
kubectl apply -f secrets.yml

# start dynamodb container
printf "\n==> Starting DynamoDB deployment, service and persistent volume claim\n"
kubectl apply -f dynamodb.yml

# start products container
printf "\n==> Starting Products API deployment and service\n"
kubectl apply -f products-api.yml