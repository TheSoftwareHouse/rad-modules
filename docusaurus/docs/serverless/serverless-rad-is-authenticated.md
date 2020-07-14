---
id: serverless-rad-is-authenticated
title: RAD is authenticated
---

## Check  (rad-is-authenticated function)

The function checks if the user is logged in.

```
functions:
  rad-is-authenticated:
    handler: lambdas/rad-is-authenticated/handler.handle
    events:
      - http:
          path: /is-authenticated
          method: GET

```

Request with Authorization header:
```
curl -H "Authorization: Bearer <TOKEN>" http://localhsot:1337/dev/is-authenticated
```
Return response:
```
{
  "isAuthenticated": true
}
```