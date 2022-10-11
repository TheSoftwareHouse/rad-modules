SERVICE_NAME=$1
DOCKERFILE_PATH=$2
PACKAGEJSON_PATH=$3
VERSION=`node -p "require('$PACKAGEJSON_PATH').version"`

check_arguments() {
    if [ -z $SERVICE_NAME ] && [ -z $DOCKERFILE_PATH ] && [ -z $PACKAGEJSON_PATH ]
    then
        echo "ERROR: Service name or docker file path or package.js path is missing"
        exit 1
    fi
}

check_dockerhub_credentials() {
    if [ -z $DOCKERHUB_PASSWORD ] && [ -z $DOCKERHUB_USERNAME ] && [ -z $DOCKERHUB_REPOSITORY ]
    then
        echo "ERROR: dockerhub login, password or repository is missing."
        exit 1
    fi
}

dockerhub_push() {
    echo ${DOCKERHUB_PASSWORD} | docker login --username "$DOCKERHUB_USERNAME" --password-stdin
    IMAGE="$DOCKERHUB_REPOSITORY/$SERVICE_NAME"
    docker build -t ${IMAGE}:${VERSION} -t ${IMAGE}:latest -f $DOCKERFILE_PATH .
    docker push -a ${IMAGE}
}

check_arguments
check_dockerhub_credentials
dockerhub_push