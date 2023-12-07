pipeline {
    agent { docker { image 'python:3.12.0-alpine3.18' } }
    stages {
        stage('build') {
            steps {
                sh 'echo "build completed"'
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
