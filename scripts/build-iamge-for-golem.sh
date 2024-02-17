#!/bin/bash

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <docker_image> [dockerfile_name]"
    exit 1
fi

DOCKERFILE_NAME=${2:-Dockerfile}
DOCKER_IMAGE=$1

docker build ./tmp/ -t $DOCKER_IMAGE -f $DOCKERFILE_NAME

gvmkit-build $DOCKER_IMAGE
gvmkit-build $DOCKER_IMAGE --push --nologin

echo "Image $DOCKER_IMAGE build for Golem."
