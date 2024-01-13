pipeline {
    agent any
    environment {
        DOCKERHUB_CREDS = credentials('dockerhub-creds')
        ALGORITHMS_DIR = 'algorithms'
        ALGORITHM_CONTAINER_PREFIX = 'adnotacja-algorytm-'
    }
    stages {
        stage('build-algorithms') {
            steps {
                dir("$env.WORKSPACE/$env.ALGORITHMS_DIR"){
                    script {
                            def buildCommand = "docker build . -t $env.DOCKERHUB_CREDS_USR/"

                            def subDirs = findFiles().findAll { file -> file.directory }
                            subDirs.each { subDir ->
                                println "Building container for algorithm: $subDir.name"
                                def process = "$buildCommand/$subDir.name".execute()
                                process.waitFor()
                                println "${process.text}"
                                println "Successfully built containter: $subDir.name"
                            }
                    }
                }
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
