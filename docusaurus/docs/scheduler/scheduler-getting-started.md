---
id: scheduler-getting-started
title: Getting started
---

## Scheduler step by step

To start playing with the scheduler service you need:

1. The internet connection (only to pull docker images from [dockerhub](https://hub.docker.com/r/tshio/scheduler))
2. Installed docker and docker-compose (optional but it will save you a lot of time)

After that please follow steps:
1. Create a catalog where we will be playing with the scheduler service:

```text
mkdir scheduler-service-playground
```

2. Go to the catalog:

```text
cd scheduler-service-playground
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
      - scheduler
    networks:
      - app

  scheduler:
    image: tshio/scheduler:latest
    working_dir: /app/build/services/scheduler
    command: "api"
    hostname: scheduler
    ports:
      - 50070:50050
    depends_on:
      - postgres
      - redis
    networks:
      - app

  postgres:
    image: postgres:10-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_USERNAME: postgres
      POSTGRES_DB: scheduler
    networks:
      - app

  redis:
    image: redis:4-alpine
    hostname: redis
    networks:
      - app

networks:
  app:
```

6. Let's add simple web API to our workspace so we will be able to call some API methods from the scheduler
  * Create API catalog
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
    "node-fetch": "^2.6.0"
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
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const port = 30003;

app.post("/api/schedule-job", async (req, res) => {
  try {
    const { body } = req;
    fetch("http://scheduler:50050/api/scheduling/schedule-job", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }

  res.sendStatus(200);
});

app.post("/api/test-scheduler", async (req, res) => {
  try {
    console.log("TEST-SCHEDULER");
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }

  res.sendStatus(200);
});

app.listen(port, () => console.log(`App listening on ${port}`));
```

7. In `api` catalog add `Dockerfile`
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

9. Now, if everything is running, we can schedule a job. In our app, I created an endpoint with will display TEST-SCHEDULER in the console. So if we want the scheduler will call that endpoint every minute we need to create job by requesting scheduler API (we can use swagger endpoint or use our endpoint in the app I will use our endpoint). Request the endpoint with tool you like.

```text
 POST: http://localhost:30003/api/schedule-job
 Body:
 {
     "name": "test-job-name",
     "type": "http",
     "payload": {
        "url":"http://example.com",
     },
     "jobOptions":{
         "cron": "*/1 * * * *"
     }
 }
```
After that you should see TEST-SCHEDULER every minute in your console.

>Note: `jobOptions` object allow configuring more complex behavior of our job all options are below (options object is optional)

```text
 {
    priority: // type: number,Optional priority value. ranges from 1 (highest priority) to MAX_INT  (lowest priority). Note that using priorities has a slight impact on performance, so do not use it if not required.
    delay: // type: number, An amount of milliseconds to wait until this job can be processed. Note that for accurate delays, both server and clients should have their synchronized.
    attempts: // type: number, The total number of attempts to try the job until it completes.
    cron: // type: string, Repeat job according to a cron specification.
    cronStartDate: // type: datetime string, Start date when the repeat job should start repeating.
    cronEndDate: // type: datetime string, End date when the repeat job should stop repeating.
    cronTimeZone: // type: string, Cron Timezone.
    cronLimit: // type: number, Number of times the job should repeat at max.
    backoff: // type: number, Setting for automatic retries if the job fails.
    lifo: // type: boolean, If true, adds the job to the right of the queue instead of the left.
    timeout: // type: number, The number of milliseconds after which the job should be fail with a timeout error.
    removeOnComplete: // type: boolean, If true, removes the job when it successfully completes.
    removeOnFail: // type: boolean, If true, removes the job when it fails after all attempts..
    stackTraceLimit: // type: number, Limits the amount of stack trace lines that will be recorded in the stacktrace.
 }
```
>Important! Ensure time on the Redis server and, the scheduler host is the same. If the Redis current DateTime is 2020-07-10 11:00:00 and the current time in the scheduler is 2020-07-10 13:00:00 and, you will schedule the  "cron" job to start at 2020-07-10 14:30:00. You could think the job will start in 1,5 hour time but it will start in 3,5 hour time because Redis server time is set back by two hours.

## How to cancel scheduled job?

If you create a repeatable job, you can cancel it by sending a DELETE request to  the URL with jobId query parameter:
```text
http://scheduler/api/scheduling/cancel-job?jobId=66cbd118-0382-447d-ab6f-54067eca0e2a
```

## How to create disposable job?

If you create job and don't set the 'cron' property in the 'jobOptions' object the job will be called once.

## How to create a repeatable job which will start in the future?

If you want to create repeatable job which will start in the future, you need to use `cronStartDate` property in `jobOptions` object example request should look like:
```text
 POST: http://scheduler/api/scheduling/schedule-job
 Body:
 {
     "name": "test-job-name",
     "type": "http",
     "payload": {
        "url":"http://example.com",
     },
     "jobOptions":{
         "cron": "*/1 * * * *",
         "cronStartDate": "2020-07-10 13:17:00"
     }
 }
```
>Note: Ensure scheduler host time is the same as Redis server time. 

## How to create a repeatable job which will start in the future and will finish in some time?

If you want to create repeatable job which will start in the future and will finish in some time, you need to use `cronStartDate` and `cronEndDate` property in `jobOptions` object example request should look like:
```text
 POST: http://scheduler/api/scheduling/schedule-job
 Body:
 {
     "name": "test-job-name",
     "type": "http",
     "payload": {
         "url":"http://example.com",
     },
     "jobOptions":{
         "cron": "*/1 * * * *",
         "cronStartDate": "2020-07-10 13:17:00",
         "cronEndDate": "2020-08-01 10:10:00"
     }
 }
```
>Note: Ensure scheduler host time is the same as Redis server time. 

## How to create a repeatable job which will repeat `X` times?

If you want to create a repeatable job which will, for example, repeat 5 times, you need to use `cronLimit` property in `jobOptions` object example request should look like:
```text
 POST: http://scheduler/api/scheduling/schedule-job
 Body:
 {
     "name": "test-job-name",
     "type": "http",
     "payload": {
         "url":"http://example.com",
     },
     "jobOptions":{
         "cron": "*/1 * * * *",
         "cronLimit": 5      
     }
 }
```

## How to create a disposable job which will start in the future?

If you want to create a disposable job which will start in 2 hours (120000 - Milliseconds), you need to use `delay` property in `jobOptions` object example request should look like:
```text
 POST: http://scheduler/api/scheduling/schedule-job
 Body:
 {
     "name": "test-job-name",
     "type": "http",
     "payload": {
         "url":"http://example.com",
     },
     "jobOptions":{      
         "delay": 120000
     }
 }
```