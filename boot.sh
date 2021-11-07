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

sudo docker-compose -f /home/gitlab-ci/cme-backend/docker-compose.yml up -d db adminer redis

sudo docker-compose -f /home/gitlab-ci/cme-backend/docker-compose.yml up --build -d api ups uprod battles-manager

