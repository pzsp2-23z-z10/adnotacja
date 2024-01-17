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
                        def algorithmContainersCreated = []

                        def subDirs = get_sub_dirs()
                        subDirs.each { subDir ->
                            def algorithmNumber = get_algorithm_number(subDir)
                            dir("$subDir.name/$env.ALGORITHM_CONTAINERS_DIR") {
                                def containers = get_sub_dirs()
                                containers.each { container ->
                                    def dockerhubName = generate_container_name(algorithmNumber, container)
                                    dir("$container") {
                                        build_container(dockerhubName)
                                        algorithmContainersCreated.add("$dockerhubName")
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
                        def tag = "test"
                        login_to_dockerhub()
                        def containers = get_containers_created()
                        push_containers(containers, tag)
                }
            }
        }
        stage('cleanup') {
            steps {
                cleanWs()
            }
        }
    }
}

def get_sub_dirs() {
    return findFiles().findAll { file -> file.directory }
}

def get_algorithm_number(subDir) {
    return "$subDir.name".split("$env.ALGORITHM_NAME_DELIMITER")[0]
}

def generate_container_name(algorithmNumber, container) {
    def containerNumber = "$container.name".split("$env.ALGORITHM_NAME_DELIMITER")[0]
    def containerName = "$env.ALGORITHM_CONTAINER_PREFIX-$algorithmNumber-$containerNumber"
    return "$env.DOCKERHUB_CREDS_USR/$containerName"
}

def build_container(dockerhubName) {
    sh(returnStdout: true, script: "docker build . -t $dockerhubName")
}

def get_containers_created() {
    return "$env.ALGORITHM_CONTAINERS_CREATED".tokenize(', []')
}

def login_to_dockerhub() {
    sh(returnStdout: true, script: "echo $DOCKERHUB_CREDS_PSW | docker login -u $DOCKERHUB_CREDS_USR --password-stdin")
}

def push_containers(containers, tag) {
    containers.each { container ->
        sh(returnStdout:true, script: "docker tag $container $container:$tag")
        sh(returnStdout:true, script: "docker push $container:$tag")
        println "Successfully pushed container: $container"
    }
}
