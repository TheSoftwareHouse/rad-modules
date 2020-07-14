---
id: serverless-index
title: Details
---

## Description:

Serverless functions were created to do repeated functions such as:

1. Save data about files and generate S3 signed url
2. Return single file data
3. Return data for all files
4. Delete files
5. RAD user is authenticated
6. Resize images
7. Watermark


## Configuration:
We use `serverless-dotenv-plugin` for save configurations data.

For files function we need database (relational), for this purpose we use knex query builder (https://www.npmjs.com/package/knex)

Knex configuration (.env file)
```
DB_TYPE=pg
DB_PASSWORD=password
DB_USERNAME=postgres
DB_HOST=localhost
DB_NAME=app
DB_USE_SSL=false
DB_CONNECTION_TIMEOUT_MILLIS=3000
```

`DB_TYPE` - driver for database (tested on PostgreSQL)

> For AWS RDS databases, we need to configure RDS Proxy (to manage database connection pool)
([Instruction how create RDS proxy](https://aws.amazon.com/blogs/compute/using-amazon-rds-proxy-with-aws-lambda/))

When RDS proxy is ready, we need to add VPC: security group ids and subnet ids to our function configuration in  serverless.yaml file for access to Proxy.

![alt text](assets/vpc_subnets.png)


```
functions:
  ...
  create:
    handler: lambdas/create-file/handler.handle
    vpc:
      securityGroupIds:
        - sg-a1642be1
      subnetIds:
        - subnet-37e0d87f
        - subnet-6f553f35
        - subnet-b19db4d7
    events:
      - http:
          path: /upload
          method: POST
```

And change database configuration, provide username and password which we gave in `secrets`

```
DB_PASSWORD=secret_password
DB_USERNAME=secret_username
DB_HOST=RDS Proxy endpoint (filesdbproxy.proxy-cyhedaibvegb.eu-west-1.rds.amazonaws.com)
DB_NAME=app
DB_USE_SSL=true
```

After configuration you need to run database migrations:

```
npm run knex:migrate:latest
```

AWS S3 configuration (.env file)
```
AWS_LAMBDA_S3_URL=http://127.0.0.1:9000
AWS_LAMBDA_ACCESS_KEY=your_s3accesskey
AWS_LAMBDA_SECRET_KEY=your_s3secret
AWS_LAMBDA_S3_PUBLIC_BUCKET=your_public_bucket
AWS_LAMBDA_S3_PRIVATE_BUCKET=your_private_bucket
AWS_LAMBDA_REGION=eu-west-1
```