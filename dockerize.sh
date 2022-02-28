#!/usr/bin/env bash

echo "${DOCKER_LOCAL_IMAGE}">".env"

# Compile image to work locally
printf "\n==> Compile app image for locally purposes with name '%s', using Dockerfile\n" ${DOCKER_LOCAL_IMAGE}
docker build -t ${DOCKER_LOCAL_IMAGE} .

# Start locally created container
printf "\n==> Start locally container and its dependencies using docker-compose\n"
docker-compose up

exit 0