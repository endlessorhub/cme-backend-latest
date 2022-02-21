#!/bin/bash

echo "Deleting api"
docker container rm api

echo "Deleting battle-manager"
docker container rm bm

echo "Deleting ups"
docker container rm ups

echo "Deleting uprod"
docker container rm uprod

echo "Deleting resources-ms"
docker container rm rms
