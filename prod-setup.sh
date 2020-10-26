#! /bin/bash

docker-compose -f docker-compose.prod.yml build

docker-compose -f docker-compose.prod.yml up -d rabbitmq
echo 'Waiting for rabbitmq...'
sleep 20
docker-compose -f docker-compose.prod.yml exec rabbitmq rabbitmqctl add_user bot f8faf60a6676005066c721926b4d7da7 
docker-compose -f docker-compose.prod.yml exec rabbitmq rabbitmqctl set_permissions -p 'chatbot' 'bot' '.*' '.*' '.*' 
docker-compose -f docker-compose.prod.yml stop rabbitmq

docker-compose -f docker-compose.prod.yml up
