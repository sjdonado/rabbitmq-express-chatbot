## How to run?

```bash
docker-compose up
```

# Setup
- Docker setup
Run `docker-compose up --build`

- RabbitMQ setup
Wait to rabbitmq be ready and run `sh rabbitmq-setup.sh`

- Create two users
```bash
curl --header "Content-Type: application/json" --request POST --data '{"username":"sjdonado","password":"12345"}' http://localhost:3000/users
curl --header "Content-Type: application/json" --request POST --data '{"username":"test","password":"12345"}' http://localhost:3000/users
```