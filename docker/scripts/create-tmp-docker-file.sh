#!/bin/bash

# Check if exactly one argument is given
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <docker_image>"
    exit 1
fi

# Get arguments
DOCKER_IMAGE=$1

# Create a Dockerfile
cat > Dockerfile.tmp <<EOF
FROM $DOCKER_IMAGE
VOLUME /golem/input /golem/output /golem/work
# WORKDIR /golem/work

EOF

echo "Dockerfile created with base image $DOCKER_IMAGE"
