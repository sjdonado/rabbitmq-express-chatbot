#! /bin/bash

docker-compose -f docker-compose.prod.yml build

docker-compose -f docker-compose.prod.yml up -d rabbitmq_prod
echo 'Waiting for rabbitmq...'
sleep 20
docker-compose -f docker-compose.prod.yml exec rabbitmq_prod rabbitmqctl add_user bot f8faf60a6676005066c721926b4d7da7 
docker-compose -f docker-compose.prod.yml exec rabbitmq_prod rabbitmqctl set_permissions -p 'chatbot' 'bot' '.*' '.*' '.*' 
docker-compose -f docker-compose.prod.yml stop rabbitmq_prod

docker-compose -f docker-compose.prod.yml up
