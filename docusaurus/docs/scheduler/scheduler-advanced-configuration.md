---
id: scheduler-advanced-configuration
title: Advanced configuration
---

## Production usage

It is recommended to create a project specific image of scheduler that will be based on `tshio/scheduler` and (if you need) contain [Initial jobs](./scheduler-getting-started#how-to-add-startup-jobs). The easiest way to do so is to create your own `Dockerfile`:

```
FROM tshio/scheduler:latest as scheduler

COPY jobs.json /app/services/scheduler/init-data-volume/
```

## Supported environment variables

LOG_LEVEL

- **_Description_**: The variable specifies the level of logging logs by the logger available options: `"error"`, `"warn"`, `"help"`, `"info"`, `"debug"`, `"verbose"`, `"silly"`
- **_Default_**: `"debug"`

REQUEST_LOGGER_FORMAT:

- **_Description_**: All requests are logged so the DevOps can check if the request comes from a user or other service (we use morgan library to log information). We created our format to display information but fill free to use one of build-in morgan library available options: `"combined"`, `"common"`, `"dev"`, `"short"`, `"tiny"`
- **_Default_**: `":remote-addr :method :url :status :response-time ms - req-body :body - api-key :apiKey - authorization :authorization"`

REQUEST_BODY_KEYS_TO_HIDE

- **_Description_**: We don't want to look at our users' private data so by default we hide some common properties. If you want to cheng that please provide your string with words you want to hide separated witch coma `,`
- **_Default_**: `"password,token,accessToken,accessKey,authorization"`

REDIS_URL:

- **_Description_**: The variable specifies URL to Redis.
- **_Default_**: `"redis://redis:6379"`

CONNECTION_STRING:

- **_Description_**: The variable specifies URL to PostgreSQL.
- **_Default_**: `"postgres://postgres:password@postgres:5432/scheduler"`

QUEUE_NAME:
- **_Description_**: The variable specifies Redis queue name.
- **_Default_**: `"scheduler-queue"`

JOB_ATTEMPTS_NUMBER:
- **_Description_**: The total number of attempts to try the job until it completes.
- **_Default_**: `3`

TIME_BETWEEN_ATTEMPTS_IN_MS:
- **_Description_**: Setting for automatic retries if the job fails.
- **_Default_**: `5000`

INITIAL_JOBS_JSON_PATH:

- **_Description_**: The variable specifies the path to file with initial scheduler jobs
- **_Default_**: `"/app/services/scheduler/init-data-volume/jobs.json"`
  - Example jobs.json file:
    ```
    [
      {
        "name": "Initial Job 1",
        "type": "http",
        "payload": {
          "method": "POST",
          "url": "http://example.com?foo=bar",
          "headers": {
            "Content-Type": "application/json"
          },
          "body": "{}",
          "options": {
            "compress": true,
            "follow": 0,
            "size": 0,
            "timeout": 0
          }
        },
        "jobOptions": {
          "cron": "0 22 * * 1"
        },
        "startImmediately": true
      }
    ]
    ```
