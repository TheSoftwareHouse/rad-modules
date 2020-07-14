---
id: communication-between-services
title: Communication between services
---

## How to communicate between services:

Our building blocks can communicate with others, e.g. scheduler service needs to run some async action that will have an impact on security service, but to do that service need to have access to secured endpoint to do some business logic otherwise it will receive an unauthorized response.

To receive access to secured action we need to send a request with 'x-api-key' in headers to the service. To do that at firstly system administrator needs to create the API key so we will know what/who created the API key.

To receive valid "x-api-key" a user needs to ask the admin for it or need to have the right access to "create-access-key" endpoint. If the user has access user can make the request:

An example request:

```text
 curl -X POST "http://security:50050/api/tokens/create-access-key
```

An example response:
```javascript
{
  "apiKey": "cb0fe0ce-afd2-62fb-703d-629d4ff3b26d",
  "type": "custom",
  "createdBy": "superadmin"
}
```

Then the user can put apiKey value to 'x-api-key' header and make the request to any secured action.

## How can I initiate some api keys on the application start?:
In the security service, there is INITIAL_API_KEYS env you can set there many api keys strings (uuid v4 format) separated by comma.
```text
Example value:
INITIAL_API_KEYS=661528a6-4cb5-4f27-bcf3-646552af7168,5f8a92e2-a314-45fd-9bcb-5ce1080a2149,d3bbe937-b8ed-4c5c-a06e-d7182c73ed0e
```