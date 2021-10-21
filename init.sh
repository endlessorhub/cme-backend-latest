#!/bin/bash

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


docker run -d -p 5000:5000 --restart=always --name registry registry:2
docker build - < ./dockerfile.base -t cme/app-base
docker tag cme/app-base:latest localhost:5000/cme/app-base
docker push localhost:5000/cme/app-base

docker-compose up -d db adminer redis

docker-compose up --build -d api ups uprod battles-manager