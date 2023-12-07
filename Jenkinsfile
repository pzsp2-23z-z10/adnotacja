pipeline {
    agent any
    environment {
        DOCKERHUB_CREDS = credentials('dockerhub-creds')
    }
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
