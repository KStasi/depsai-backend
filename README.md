# smth-backend

docker build -t dockerized-yagna . -f ./docker/Dockerfile.yagna
docker run -d --name yagna-container dockerized-yagna
docker build -t depsai-app . -f ./docker/Dockerfile.app
docker run -d --name depsai-container depsai-app
