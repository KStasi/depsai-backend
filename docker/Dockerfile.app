# Use Ubuntu as the base image
FROM ubuntu:latest

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
    curl \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    lsb-release

# Install Docker
RUN curl -fsSL https://get.docker.com -o get-docker.sh && \
    sh get-docker.sh || true

# Install Node.js and npm
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs

# Install TypeScript globally
RUN npm install -g typescript

# Install Python3 and pip3
RUN apt-get install -y python3 python3-pip

# Install Yagna
ENV GOLEM_ACCEPT_TOS=yes
ENV PATH="$HOME/.local/bin:$PATH"
RUN echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
RUN curl -sSf https://join.golem.network/as-requestor | bash -


# Install gvkit
RUN npm install -g @golem-sdk/gvmkit-build

# Copy the entire current directory contents into the container at /app
COPY . /app

# Make the entrypoint script executable
RUN chmod +x /app/src/scripts/entrypoint.sh

# Set the working directory
WORKDIR /app

# Set the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]

# Default command
CMD ["tail", "-f", "/dev/null"]
