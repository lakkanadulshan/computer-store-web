pipeline {
    agent any

    environment {
        BACKEND_IMAGE_NAME = "lakkanadulshan/mern-backend"
        FRONTEND_IMAGE_NAME = "lakkanadulshan/mern-frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Install Backend Dependencies') {
            steps {
                dir('i-computer-backend') {
                    bat 'npm ci'
                }
            }
        }

        stage('Lint Backend') {
            steps {
                dir('i-computer-backend') {
                    bat 'npm run lint'
                }
            }
        }

        stage('Test Backend') {
            steps {
                dir('i-computer-backend') {
                    bat 'npm test'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('i-computer-frontend') {
                    bat 'npm ci'
                }
            }
        }

        stage('Lint Frontend') {
            steps {
                dir('i-computer-frontend') {
                    bat 'npm run lint'
                }
            }
        }

        stage('Test Frontend') {
            steps {
                dir('i-computer-frontend') {
                    bat 'npm test'
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                dir('i-computer-backend') {
                    bat "docker build -t %BACKEND_IMAGE_NAME%:%IMAGE_TAG% ."
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                dir('i-computer-frontend') {
                    bat "docker build -t %FRONTEND_IMAGE_NAME%:%IMAGE_TAG% ."
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([string(credentialsId: 'test-dockerhubpassword', variable: 'DOCKER_PASS')]) {
                    bat '''
                    echo %DOCKER_PASS% | docker login -u lakkanadulshan --password-stdin
                    '''
                }
            }
        }

        stage('Push Backend Image') {
            steps {
                bat "docker push %BACKEND_IMAGE_NAME%:%IMAGE_TAG%"
            }
        }

        stage('Push Frontend Image') {
            steps {
                bat "docker push %FRONTEND_IMAGE_NAME%:%IMAGE_TAG%"
            }
        }

        stage('Deploy Backend Container') {
            steps {
                withCredentials([
                    string(credentialsId: 'mongo-uri', variable: 'MONGO_URI'),
                    string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET')
                ]) {
                    bat '''
                    docker stop mern-backend || echo "No container to stop"
                    docker rm mern-backend || echo "No container to remove"
                    docker run -d --name mern-backend -p 5000:5000 ^
                      -e MONGO_URI="%MONGO_URI%" ^
                      -e JWT_SECRET="%JWT_SECRET%" ^
                      -e PORT=5000 ^
                      %BACKEND_IMAGE_NAME%:%IMAGE_TAG%
                    '''
                }
            }
        }

        stage('Deploy Frontend Container') {
            steps {
                bat '''
                docker stop mern-frontend || echo "No container to stop"
                docker rm mern-frontend || echo "No container to remove"
                docker run -d --name mern-frontend -p 3001:3000 ^
                  %FRONTEND_IMAGE_NAME%:%IMAGE_TAG%
                '''
            }
        }
    }

    post {
        always {
            bat 'docker logout'
        }
    }
}