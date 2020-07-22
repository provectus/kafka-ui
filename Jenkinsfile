def TAG

pipeline {
    options {
        disableConcurrentBuilds()
    }

    tools {
        maven 'mvn_3.6.3'
    }

    environment {
        registry = "provectuslabs/kafka-ui-api"
        registryCredential = 'docker-hub-credentials'
    }

    agent {
        kubernetes {
            label 'kafka-ui'
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: docker-client
    image: docker:19.03.1
    command:
    - sleep
    args:
    - 99d
    env:
      - name: DOCKER_HOST
        value: tcp://localhost:2375
    volumeMounts:
      - name: cache
        mountPath: /tmp/repository
  - name: docker-daemon
    image: docker:19.03.1-dind
    securityContext:
      privileged: true
    env:
      - name: DOCKER_TLS_CERTDIR
        value: ""
    volumeMounts:
      - name: cache
        mountPath: /var/lib/docker
  volumes:
    - name: cache
      hostPath:
        path: /tmp
        type: Directory
'''
        }
    }
    stages {
        stage('Create release branch') {
            steps {
                git 'https://github.com/provectus/kafka-ui.git'
                sh 'git checkout -b release'
                sh 'git merge master'
            }
        }
        stage('Build artifact') {
            steps {
                container('docker-client') {
                    sh "docker run -v ${WORKSPACE}:/usr/src/mymaven -v /tmp/repository:/root/.m2/repository -w /usr/src/mymaven maven:3.6.3-jdk-13 /bin/sh -c 'mvn versions:set -DremoveSnapshot && mvn clean install'"
                }
            }
            post {
                success {
                    archiveArtifacts(artifacts: '**/target/*.jar', allowEmptyArchive: true)
                }
            }
        }
        stage('Tag release branch') {
            steps {
                script {
                    pom = readMavenPom file: 'pom.xml'
                    TAG = pom.version
//                     sh 'git log $(git describe --tags --abbrev=0)..HEAD --oneline'
                    sh "git tag -f ${TAG}"
                }
            }
        }
        stage('Build docker image') {
            steps {
                container('docker-client') {
                    dir(path: './kafka-ui-api') {
                        script {
                            dockerImage = docker.build( registry + ":$TAG", "--build-arg JAR_FILE=*.jar -f Dockerfile ." )
                        }
                    }
                }
            }
        }
        stage('Publish docker image') {
            steps {
                container('docker-client') {
                    script {
                        docker.withRegistry( '', registryCredential ) {
                            dockerImage.push()
                            dockerImage.push('latest')
                        }
                    }
                }
            }
        }
        stage('Remove unused docker image') {
            steps{
                container('docker-client') {
                    sh "docker rmi $registry:$TAG"
                }
            }
        }
        stage('Tag release') {
            steps {
                script {
                    sh "git push -f --tags"
                }
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}