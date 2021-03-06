---
id: changelog
title: Details
---

All notable changes to this project will be documented in this file.

## security

### 2020-07-07 v0.0.58
Added
- Keycloak authentication strategy

### 2020-06-25 v0.0.57
Changed
- Add TOKEN_PAYLOAD_DISABLE_ATTRIBUTES and TOKEN_PAYLOAD_DISABLE_RESOURCES environment variables config.

### 2020-05-19 v0.0.56
Changed
- Super access with x-access-key header (it will be equal to request done by superadmin)
- Add login with google id_token (/api/public/auth/login/google-id-token endpoint)

### 2020-05-12 v0.0.55
Changed
- Fixed missing responses for services

### 2020-05-11 v0.0.54
Changed
- Add login with keycloak
- Add a new optional parameter (attributes) to add a user endpoint. Now user can be created with attributes
- If newPassword won't match regexp, the error won't display the password in the message. Endpoint: '/api/users/reset-password/{resetPasswordToken}'

### 2020-04-28 v0.0.53
Added
- Missing swagger responses, update libs: swagger-jsdoc (4.0.0) swagger-ui-express (4.1.4)
- Built-in reset password flow and public namespace for public urls
- Microsoft auth provider
- More descriptive errors from Google Auth Provider

Changed
- Set to WORKDIR "/app/build/services/security" (before "WORKDIR /app")

### 2020-04-24 v0.0.53
Changed
- More descriptive errors from Google Auth Provider

### 2020-04-23 v0.0.52
Changed
- New password is not returned anymore for a /reset-password endpoint with a user type password
- /reset-password endpoint will return 201 instead of 200
- All delete methods with body are deprecated. You should use query string instead.
- Fix query filter
- Update typeorm (0.2.22 -> 0.2.24)

### 2020-04-22 v0.0.51
Added
- Add initial access keys (INITIAL_API_KEYS env)

### 2020-04-22 v0.0.50
Changed
- Fix hasAccessCustom method

### 2020-04-21 v0.0.46
Added
- Insensitive filter for searching (include or includeOr operator)

### 2020-04-10 v0.0.46
Changed
- Login via Facebook API

### 2020-04-09 v0.0.45
Changed
- Update npm dependencies

## scheduler

### 2020-07-09 v0.0.8
Changed
- Change schedule job endpoint request body: add job options and required job namespace
- Save job in scheduler database
- Allow to add many jobs with same cron
- Fix canceling jobs endpoint

### 2020-05-12 v0.0.7
Changed
- Fixed missing responses for services

### 2020-04-28 v0.0.6
Changed
- Set WORKDIR to "/app/build/services/scheduler" (before "WORKDIR /app")

### 2020-04-09 v0.0.5
Changed
- Update npm dependencies

## notifications

### 2020-05-12 v0.0.9
Changed
- Fixed missing responses for services

### 2020-04-28 v0.0.8
Changed
- Set WORKDIR to "/app/build/services/notifications" (before "WORKDIR /app")

### 2020-04-09 v0.0.7
Changed
- Update npm dependencies

## mailer

### 2020-07-01 v0.0.8
Added
- Batch processing

### 2020-05-12 v0.0.7
Changed
- Fixed missing responses for services

### 2020-04-28 v0.0.6
Changed
- Set WORKDIR to "/app/build/services/mailer" (before "WORKDIR /app")

### 2020-04-09 v0.0.5
Changed
- Update npm dependencies

## gateway

### 2020-04-28 v0.0.4
Changed
- Bugfix. Possible race condition when check permissions
- Set WORKDIR to "/app/build/services/gateway" (before "WORKDIR /app")

Bugfix
- Possible race condition when check permissions

### 2020-04-09 v0.0.2
Changed
- Update npm dependencies

## pdf

### 2020-05-29 v0.0.1
Added
- Pdf service provides a ready-to-use rendering HTML content from URL or HTML string, which can be used to convert HTML to PDF.

## Main project

### 2020-04-09
Changed
- Update Dockerfile - node:12.16.1-alpine