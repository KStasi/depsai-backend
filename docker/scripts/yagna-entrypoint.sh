#!/bin/bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
export PATH="$HOME/.local/bin:$PATH"

# Start the Yagna service in the background
yagna service run &

# Wait for Yagna service to start up (adjust the sleep time as necessary)
sleep 10

# Fund and init payment on the Goerli network
yagna payment fund --network goerli
yagna payment init --network goerli

# Keep the container running or execute the main process (adjust as necessary)
exec "$@"
