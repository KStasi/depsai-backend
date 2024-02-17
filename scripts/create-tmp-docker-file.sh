#!/bin/bash

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <docker_image> [dockerfile_name]"
    exit 1
fi

DOCKER_IMAGE=$1
DOCKERFILE_NAME=${2:-Dockerfile}


# Create a Dockerfile
cat > ./tmp/$DOCKERFILE_NAME.tmp <<EOF
FROM $DOCKER_IMAGE
VOLUME /golem/input /golem/output /golem/work
# WORKDIR /golem/work

EOF

echo "Dockerfile created with base image $DOCKER_IMAGE"
