pipeline {
    agent any
    environment {
        DOCKERHUB_CREDS = credentials('dockerhub-creds')
        DOCKERFILE_PATH = './dummy_docker/docker'
        CONTAINER_NAME = 'dummy_docker'
    }
    stages {
        stage('build') {
            steps {
                sh 'docker build -t $DOCKERHUB_CREDS_USR/$CONTAINER_NAME $DOCKERFILE_PATH'
            }
        }
        stage('test') {
            steps {
                sh 'echo "tests passed"'
            }
        }
        stage('push') {
            steps {
                sh 'echo "pushed to dockerhub"'
            }
        }
    }
}
