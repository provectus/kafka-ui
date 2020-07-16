pipeline {

    agent any

    // using the Timestamper plugin we can add timestamps to the console log
    options {
        timestamps()
    }

    environment {
        //Use Pipeline Utility Steps plugin to read information from pom.xml into env variables
        IMAGE = readMavenPom().getArtifactId()
        VERSION = readMavenPom().getVersion()
        EMAIL_RECIPIENTS = 'byusupov@provectus.com'
    }

    stages {
        stage('Test') {
            steps {
                echo 'Test...'
            }
        }
    }

    post {
        // Always runs. And it runs before any of the other post conditions.
        always {
            // Let's wipe out the workspace before we finish!
            deleteDir()
        }
        success {
            sendEmail("Successful");
        }
        unstable {
            sendEmail("Unstable");
        }
        failure {
            sendEmail("Failed");
        }
    }
}

def sendEmail(status) {
    mail(
        to: "$EMAIL_RECIPIENTS",
        subject: "Build $BUILD_NUMBER - " + status + " (${currentBuild.fullDisplayName})",
        body: "Changes:\n " + getChangeString() + "\n\n Check console output at: $BUILD_URL/console" + "\n")
}