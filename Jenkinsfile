// pipeline {
//     agent any

//     stages {
//         stage('Build Docker Image') {
//             steps {
//                 dir('i-computer-backend') {
//                     bat 'docker build -t lakkanadulshan/mern-backend:%BUILD_NUMBER% .'
//                 }
//             }
//         }

//         stage('Login to Docker Hub') {
//             steps {
//                 withCredentials([string(credentialsId: 'test-dockerhubpassword', variable: 'docker_pass')]) {
//                     bat '''
//                     echo %docker_pass% | docker login -u lakkanadulshan --password-stdin
//                     '''
//                 }
//             }
//         }

//         stage('Push Image') {
//             steps {
//                 bat 'docker push lakkanadulshan/mern-backend:%BUILD_NUMBER%'
//             }
//         }
//     }

//     post {
//         always {
//             bat 'docker logout'
//         }
//     }
// }

pipeline {
    agent any

    environment {
        IMAGE_NAME = "lakkanadulshan/mern-backend"
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

        stage('Build Docker Image') {
            steps {
                dir('i-computer-backend') {
                    bat "docker build -t %IMAGE_NAME%:%IMAGE_TAG% ."
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

        stage('Push Image') {
            steps {
                bat "docker push %IMAGE_NAME%:%IMAGE_TAG%"
            }
        }

        stage('Deploy Backend Container') {
            steps {
                withCredentials([
                    string(credentialsId: 'mongo-uri', variable: 'MONGO_URI'),
                    string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET')
                ]) {
                    bat '''
                    docker stop mern-backend || exit /b 0
                    docker rm mern-backend || exit /b 0
                    docker run -d --name mern-backend -p 5000:3000 ^
                      -e mongoURL="%MONGO_URI%" ^
                      -e JWT_SECRET="%JWT_SECRET%" ^
                      %IMAGE_NAME%:%IMAGE_TAG%
                    '''
                }
            }
        }
    }

    post {
        always {
            bat 'docker logout'
        }
    }
}