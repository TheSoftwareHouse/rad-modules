---
id: notifications-getting-started
title: Getting started
---

## Notifications step by step

To start playing with the notifications service you need:

1. The internet connection (only to pull docker images from [dockerhub](https://hub.docker.com/r/tshio/notifications))
2. Installed docker and docker-compose (optional but it will save you a lot of time)

After that please follow steps:
1. Create a directory where we will be playing with the notifications service:

```text
mkdir notifications-service-playground
```

2. Go to the directory:

```text
cd notifications-service-playground
```

3. Create docker-compose.yml:

```text
touch docker-compose.yml
```

4. Open docker-compose.yml:

```text
 open -e docker-compose.yml
```

5. Copy and paste the example service configuration and save the file
```dockerfile
version: "3.7"

services:
  api:
    container_name: api
    build:
      context: ./api
      dockerfile: Dockerfile
    volumes:
      - "./api:/app"
      - "/app/node_modules"
    ports:
      - "30003:30003"
    depends_on:
      - notifications
    networks:
      - app

  notifications:
    image: tshio/notifications:latest
    command: "api"
    ports:
      - 50090:50050
      - 30090:30050
    hostname: notifications
    networks:
      - app

networks:
  app:
```

6. Let's add simple web app to our workspace so we will be able to connect to notifications service
  * Create API directory
```text
 mkdir api && cd api
```

  * Add `package.json` file
```text
 touch package.json
```

  * Add `package.json` information
```javascript
 {
  "name": "api",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "watch": "node-dev server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.17.1",
    "socket.io-client": "^2.3.0"    
  },
  "devDependencies": {
    "node-dev": "^4.0.0"
  }
}
```

  * Install `package.json` dependencies
```text
npm install
```

  * Add `server.js` file
```text
touch server.js
```

* Add code to `server.js`
```javascript
const express = require("express");
const cors = require("cors");
const io = require("socket.io-client");

const app = express();
app.use(cors());
app.use(express.json());

const port = 30003;
const options = {
  transports: ["websocket"],
  "force new connection": true,
  reconnection: true,
};

const notifyClient = io.connect(`http://notifications:30050`, options);

notifyClient.on("connect", () => {
  console.log("connect");
});

notifyClient.on("message", (message) => {
  console.log(message);
});

notifyClient.on("disconnect", () => {
  console.log("disconnect");
  notifyClient.disconnect();
});

app.listen(port, () => console.log(`App listening on ${port}`));
```

7. In `api` directory add `Dockerfile`
```dockerfile
FROM node:12.2.0-alpine

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json /app/package.json
RUN npm install --silent

CMD ["npm", "run", "watch"]
```

8. Run docker-compose:

```text
 docker-compose up
```

9. Now, if everything is running, you should see `connect` message from the api container in the terminal.

10. If we want to send a notification to socket client connected to the notification service we need to make POST request with the body (Or you can use swagger to achieve that: http://localhost:50090/api-docs/#):
```text
 POST: http://localhost:50090/api/notifications/send
 Body:
 {
  "channels": ["default-all"],
  "message": "test-message"
}
```

You should see api container displaying test-message in the terminal.

> Note: the notification service has 3 builds in notifications channels:
>* default-all
>* default-authorized // if ALLOW_ANONYMOUS env set to `true`
>* default-unauthorized

## How to connect to notifications service socket?
```javascript
const notifyUrl = 'http://notifications:30050';
const options = {
    transports: ['websocket'],
    'force new connection': true,
    reconnection: true,
};

const notifyClient = io.connect(`${notifyUrl}`, options);

notifyClient.on('connect', () => {
    console.log('connect');
});

notifyClient.on('message', message => {
    updateNotification(message);
});

notifyClient.on('disconnect', () => {
    console.log('disconnect');
    notifyClient.disconnect();
});
```

## How to send notification to specific user?
To send a notification to the specific user, first of all, you need to get a valid JWT token with user id and use it when connecting into the socket.
```javascript
const notifyUrl = process.env.REACT_APP_NOTIFICATIONS_SOCKET_URL;
const token = "valid-jwt-token-with-userId-in-payload";
const options = {
    transports: ['websocket'],
    'force new connection': true,
    reconnection: true,
};

const notifyClient = io.connect(`${notifyUrl}?token=${token}`, options);

notifyClient.on('connect', () => {
    console.log('connect');
});

notifyClient.on('message', message => {
    updateNotification(message);
});

notifyClient.on('disconnect', () => {
    console.log('disconnect');
    notifyClient.disconnect();
});
```

Then you should POST the message to channel with the user id:
```text
POST: http://notifications:30050/api/notifications/send
Body:
{
 "channels": ["231c6854-c4f8-11ea-87d0-0242ac130003"],
 "message": "test-message-to-logged-user"
} 
```

## How to send notification to connected clients?
```text
POST: http://notifications:30050/api/notifications/send
Body:
{
 "channels": ["default-all"],
 "message": "test-message"
}
```

## How to send notification to all authorized users?
```text
POST: http://notifications:30050/api/notifications/send
Body:
{
 "channels": ["default-authorized"],
 "message": "test-message-to-all-authorized"
}
```