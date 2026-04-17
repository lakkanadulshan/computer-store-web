pipeline {
    agent any

    stages {
        stage('Build Docker Image') {
            steps {
                dir('i-computer-backend') {
                    bat 'docker build -t lakkanadulshan/mern-backend:%BUILD_NUMBER% .'
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([string(credentialsId: 'test-dockerhubpassword', variable: 'docker_pass')]) {
                    bat '''
                    echo %docker_pass% | docker login -u lakkanadulshan --password-stdin
                    '''
                }
            }
        }

        stage('Push Image') {
            steps {
                bat 'docker push lakkanadulshan/mern-backend:%BUILD_NUMBER%'
            }
        }
    }

    post {
        always {
            bat 'docker logout'
        }
    }
}