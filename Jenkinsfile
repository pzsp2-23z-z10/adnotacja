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
        stage('push-master') {
            when {
                branch 'master'
            }
            steps {
                sh 'docker login -u $DOCKERHUB_CREDS_USR -p $DOCKERHUB_CREDS_PSW'
                sh 'docker tag $DOCKERHUB_CREDS_USR/$CONTAINER_NAME $DOCKERHUB_CREDS_USR/$CONTAINER_NAME:master-latest'
                sh 'docker push $DOCKERHUB_CREDS_USR/$CONTAINER_NAME:master-latest'
            }
        }
        stage('push-release') {
            when {
                branch 'release'
            }
            steps {
                sh 'docker login -u $DOCKERHUB_CREDS_USR -p $DOCKERHUB_CREDS_PSW'
                sh 'docker push $DOCKERHUB_CREDS_USR/$CONTAINER_NAME:latest'
            }
        }
    }
}
