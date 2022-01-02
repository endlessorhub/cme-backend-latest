#!/bin/bash

#Dev by default
if [ -z "${1}" ]; then 
    ENV='dev'
else 
    ENV=${1}
fi

echo "Booting $ENV environment"

if [ "$(uname)" == "Darwin" ]; then
    # For macos users
    DOCKER_STATUS=$(echo $(launchctl status docker | grep Active) | cut -d' ' -f2)
    if [ "$DOCKER_STATUS" = "inactive" ]; then
        launchctl start docker
    fi
else
    # For linux users
    DOCKER_STATUS=$(echo $(systemctl status docker | grep Active) | cut -d' ' -f2)
    if [ "$DOCKER_STATUS" = "inactive" ]; then
        systemctl start docker
    fi
fi


docker run -d -p 5001:5001 --restart=always --name registry registry:2
docker build - < ./dockerfile.base -t cme/app-base
docker tag cme/app-base:latest localhost:5001/cme/app-base
docker push localhost:5001/cme/app-base

ENV=$1 docker-compose up --build -d db adminer redis