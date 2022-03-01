#!/usr/bin/env bash

# delete products container
printf "\n==> Deleting Products API deployment and service\n"
kubectl delete -f products-api.yml

# delete mysql container
printf "\n==> Deleting DynamoDB deployment, service and persistent volume claim\n"
kubectl delete -f dynamodb.yml

# delete secrets
printf "\n==> Deleting secrets\n"
kubectl delete -f secrets.yml

# delete namespace
printf "\n==> Deleting DEV namespace\n"
kubectl delete namespace tfm-dev-amartinm82