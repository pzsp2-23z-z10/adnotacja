pipeline {
    agent any
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
