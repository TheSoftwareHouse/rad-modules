---
id: serverless-pipeline
title:  Bitbucket pipelines
---

## Configure Bitbucket Pipeline to deploy function

## Environment variables
For each environment, we must define environment variables in deployment configuration.

`Bitbucket -> Repository settings -> Deployments`

And add new variables for AWS and STAGE:
- AWS_LAMBDA_KEY
- AWS_LAMBDA_SECRET
- AWS_STAGE
- your environments

![environment variables](assets/deployment_environments.png)

# Pipeline YAML

You need add additional `branches` and `custom` configuration to `bitbucket-pipelines.yml` file

```
image: node:alpine
definitions:
  steps:
    - step: &compile
        name: Compile
        caches:
          - node
        script:
          - npm install
          - npm run lint
          - npm run tests
    - step: &deploy
        name: Deploy
        trigger: manual
        caches:
          - node
        script:
          - npm install
          - ./node_modules/.bin/serverless config credentials --stage ${AWS_STAGE} --provider aws --key ${AWS_LAMBDA_KEY} --secret ${AWS_LAMBDA_SECRET}
          - ./node_modules/.bin/serverless deploy --stage ${AWS_STAGE}

pipelines:
  default:
    - step: *compile
  custom:
    deploy-to-dev:
      - step: *compile
      - step:
          <<: *deploy
          deployment: dev
          name: Deploy to DEV

  branches:
    master:
      - step: *compile
      - step:
          <<: *deploy
          deployment: production
    develop:
      - step: *compile
      - step:
          <<: *deploy
          deployment: dev
```

For branches we defined two steps:
- first step for build you app (*compile definition)
- second step for deploy your app to AWS (*deploy definition, manually, start only if first step will be ok and also you must run it).

![run manually](assets/bitbucket_run.png)

When you click `run` you see confirmation of deployment with changes that will be deployed.

![run manually](assets/bitbucket_deploy.png)

Also you can run `custom` deploy for every branch in your repository:

![environment variables](assets/run_for_branch.png)

And select custom deployment to dev:

![environment variables](assets/custom.png)
