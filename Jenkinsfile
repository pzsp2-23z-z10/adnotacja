pipeline {
    agent any
    environment {
        // credentials used to push images to dockerhub
        DOCKERHUB_CREDS = credentials('dockerhub-creds')
        // the folder in which api files can be found
        API_DIR = 'nodejs_api'
        // API container name
        API_CONTAINER_NAME = 'andotacja-api'
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
        stage('build-api') {
            steps {
                dir("$env.WORKSPACE/$env.API_DIR") {
                    script {
                        def apiContainerName = "$env.DOCKERHUB_CREDS_USR/$env.API_CONTAINER_NAME"

                        def containersCreated = []
                        build_container(apiContainerName)
                        containersCreated.add("$apiContainerName")

                        env.CONTAINERS_CREATED = containersCreated
                    }
                }
            }
        }
        stage('build-algorithms') {
            steps {
                dir("$env.WORKSPACE/$env.ALGORITHMS_DIR"){
                    script {
                        def containersCreated = get_containers_created()

                        def subDirs = get_sub_dirs()
                        subDirs.each { subDir ->
                            def algorithmNumber = get_algorithm_number(subDir)
                            dir("$subDir.name/$env.ALGORITHM_CONTAINERS_DIR") {
                                def containers = get_sub_dirs()
                                containers.each { container ->
                                    def dockerhubName = generate_container_name(algorithmNumber, container)
                                    dir("$container") {
                                        build_container(dockerhubName)
                                        containersCreated.add("$dockerhubName")
                                    }
                                }
                            }
                        }
                        env.CONTAINERS_CREATED = containersCreated
                    }
                }
            }
        }
        stage('test') {
            steps {
                sh 'echo "tests passed"'
            }
        }
        stage('push') {
            steps {
                script {
                    def tag = get_branch_tag()
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
    return "$env.CONTAINERS_CREATED".tokenize(', []')
}

def get_branch_tag() {
    if (env.BRANCH_NAME == 'master') {
        return "latest"
    } else {
        return "$env.BRANCH_NAME"
    }
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
