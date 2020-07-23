def VERSION

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
        stage('Checkout release branch') {
            steps {
                sh 'git checkout -b release'
            }
        }
        stage('Merge to release branch') {
            steps {
                sh 'git merge origin/master'
            }
        }
        stage('Remove SNAPSHOT from version') {
            steps {
                container('docker-client') {
                    sh "docker run -v $WORKSPACE:/usr/src/mymaven -v /tmp/repository:/root/.m2/repository -w /usr/src/mymaven maven:3.6.3-jdk-13 bash -c 'mvn versions:set -DremoveSnapshot'"
                }
            }
        }
        stage('Tag release branch') {
            steps {
                script {
                    pom = readMavenPom file: 'pom.xml'
                    VERSION = pom.version
                    sh "git tag -f v$VERSION"
                }
            }
        }
        stage('Build artifact') {
            steps {
                container('docker-client') {
                    sh "docker run -v $WORKSPACE:/usr/src/mymaven -v /tmp/repository:/root/.m2/repository -w /usr/src/mymaven maven:3.6.3-jdk-13 bash -c 'mvn clean install'"
                }
            }
        }
        stage('Build docker image') {
            steps {
                container('docker-client') {
                    dir(path: './kafka-ui-api') {
                        script {
                            dockerImage = docker.build( registry + ":VERSION", "--build-arg JAR_FILE=*.jar -f Dockerfile ." )
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
                    sh "docker rmi $registry:VERSION"
                }
            }
        }
        stage('Create github release with text from commits') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'github-jenkins-internal-provectus', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USER')]) {
                        sh "git push -f --tags https://$GIT_USER:$GIT_PASSWORD@github.com/provectus/kafka-ui.git"
                        sh "bash release_json.sh v$VERSION"
                        sh "curl -XPOST -u $GIT_USER:$GIT_PASSWORD --data @/tmp/release.json https://api.github.com/repos/provectus/kafka-ui/releases"
                    }
                }
            }
        }
        stage('Checkout master') {
            steps {
                sh 'git checkout origin/master'
            }
        }
        stage('Increase version in master') {
            steps {
                container('docker-client') {
                    sh "docker run -v $WORKSPACE:/usr/src/mymaven -v /tmp/repository:/root/.m2/repository -w /usr/src/mymaven maven:3.6.3-jdk-13 bash -c 'mvn build-helper:parse-version versions:set -DnewVersion=\\\${parsedVersion.majorVersion}.\\\${parsedVersion.minorVersion}.\\\${parsedVersion.nextIncrementalVersion}-SNAPSHOT versions:commit'"
                }
            }
        }
        stage('Push to master') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'github-jenkins-internal-provectus', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USER')]) {
                        sh "git add ."
                        sh "git -c user.name=\"$GIT_USER\" -c user.email=\"\" commit -m \"Increased version in pom.xml\""
                        sh "git push https://$GIT_USER:$GIT_PASSWORD@github.com/provectus/kafka-ui.git HEAD:master"
                    }
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