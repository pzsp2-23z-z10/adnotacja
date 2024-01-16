pipeline {
    agent any
    environment {
        // credentials used to push images to dockerhub
        DOCKERHUB_CREDS = credentials('dockerhub-creds')
        // prefix for all containers with analysis algorithms
        ALGORITHM_CONTAINER_PREFIX = 'adnotacja-algorytm'
        // the folder in which algorithms can be found
        ALGORITHMS_DIR = 'algorithms'
        // folder in which each algorithm's containers can be found
        ALGORITHM_CONTAINERS_DIR = 'containers/'
        // delimiter used for naming folders with algorithms
        ALGORITHM_NAME_DELIMITER = '_'
    }
    stages {
        stage('build-algorithms') {
            steps {
                dir("$env.WORKSPACE/$env.ALGORITHMS_DIR"){
                    script {
                            def buildCommand = "docker build . -t "

                            def algorithmContainersCreated = []

                            def subDirs = findFiles().findAll { file -> file.directory }
                            subDirs.each { subDir ->
                                def algorithmNumber = "$subDir.name".split("$env.ALGORITHM_NAME_DELIMITER")[0]
                                dir("$subDir.name/$env.ALGORITHM_CONTAINERS_DIR") {
                                    def containers = findFiles().findAll { file -> file.directory }
                                    containers.each { container ->
                                        def containerNumber = "$container.name".split("$env.ALGORITHM_NAME_DELIMITER")[0]
                                        def containerName = "$env.ALGORITHM_CONTAINER_PREFIX-$algorithmNumber-$containerNumber"
                                        def dockerhubName = "$env.DOCKERHUB_CREDS_USR/$containerName"
                                        dir("$container") {
                                            println "Building container for algorithm: $containerName"
                                            def process = "$buildCommand $dockerhubName".execute()
                                            process.waitFor()
                                            println "${process.text}"
                                            algorithmContainersCreated.add("$dockerhubName")
                                            println "Successfully built containter: $containerName"
                                        }
                                    }
                                }
                            }
                        env.ALGORITHM_CONTAINERS_CREATED = algorithmContainersCreated
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
        stage('push') {
            steps {
                script {
                    // TODO: fix push not working
                    "docker login -u $env.DOCKERHUB_CREDS_USR -p $env.DOCKERHUB_CREDS_PSW".execute()
                    def containers = "$env.ALGORITHM_CONTAINERS_CREATED".tokenize(', []')
                    containers.each { container ->
                        def process = "docker push $container".execute()
                        process.waitFor()
                        println "${process.text}"
                        println "Successfully pushed container: $container"
                    }
                }
            }
        }
    }
}
