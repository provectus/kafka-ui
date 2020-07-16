#!/usr/bin/env groovy

pipeline {

    agent any

    stages {
        stage('Test') {
            steps {
                echo 'Test...'
                sh 'ls -la'
            }
        }

        stage('Merge master') {
            steps {
                script {
                    git 'https://github.com/provectus/kafka-ui.git'
                    sh 'git checkout release'
                    sh 'git merge master'
                    pom = readMavenPom file: 'pom.xml'
                    tag = pom.version.replace("-SNAPSHOT", "")
                    echo "Building version ${tag}"
//                    sh "git tag -f v${tag}"
//                    sh "git push -f --tags"
                }
            }
        }
        stage('Build') {
            tools {
                maven 'mvn_3.6.3'
            }
            steps {
                sh 'cd ./kafka-ui-api && ./mvnw clean install -Pprod'
            }
        }
    }
}