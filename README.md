## How to run?

```bash
docker-compose up
```

## Create an user
```bash
curl --header "Content-Type: application/json" --request POST --data '{"username":"sjdonado","password":"12345"}' http://localhost:3000/users
```