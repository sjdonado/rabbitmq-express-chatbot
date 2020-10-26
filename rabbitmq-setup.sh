#! /bin/bash

docker-compose up -d rabbitmq
echo 'Waiting for rabbitmq...'
sleep 20
docker-compose exec rabbitmq rabbitmqctl add_user bot f8faf60a6676005066c721926b4d7da7 
docker-compose exec rabbitmq rabbitmqctl set_permissions -p 'chatbot' 'bot' '.*' '.*' '.*' 
docker-compose stop rabbitmq