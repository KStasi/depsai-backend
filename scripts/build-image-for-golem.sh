#!/bin/bash

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <docker_image> [dockerfile_name]"
    exit 1
fi

DOCKER_IMAGE=$1
DOCKERFILE_NAME=${2:-Dockerfile}

docker build ./tmp/ -t $DOCKER_IMAGE -f $DOCKERFILE_NAME

gvmkit-build $DOCKER_IMAGE --push --nologin

echo "Image $DOCKER_IMAGE build for Golem."
