---
id: serverless-files
title: Get files
---

## Get all files (file-list function)

Serverless framework:
```
functions:
  list:
    handler: lambdas/file-list/handler.handle
    events:
      - http:
          path: /files
          method: GET
```

`GET /files` - Returns all files in database

Response

```
{
  "data": [
    {
        "id": 1,
        "fileName": "file1",
        "description": "description",
        "bucket": "my_public",
        "status": 1,
        "fileType": "jpg",
        "permission": "public",
        "key": "0da0e498-e7bc-466e-be87-58ab9db2b4b1-original",
        "createdAt": "2020-06-10T13:02:28.302Z"
    },
    {
        "id": 2,
        "fileName": "file2",
        "description": "description",
        "bucket": "my_private",
        "status": 1,
        "fileType": "jpg",
        "permission": "private",
        "key": "7707e904-d910-4b3e-b3ba-8525e29245e6-original",
        "createdAt": "2020-06-10T13:12:30.036Z"
    },
  ]
  "meta": {
      "total": "14",
      "page": 1,
      "limit": 25
  }
}
```

In `GET /files?filterName=value` - We can use filters:

`permission` - bucket permission (private/public)\
`fileName` - filter by file name\
`page` - current page\
`limit` - limit per page (default 25)\

## Get single file (get-file function)

Serverless framework:
```
functions:
  get:
    handler: lambdas/get-file/handler.handle
    events:
      - http:
          path: /file
          method: GET
```

`GET /file?key=<id>`
Returns information about single file and its private access signed url


Response

```
{
    "id": 1,
    "fileName": "some-file.png",
    "description": "some-descriptiuon",
    "bucket": "test",
    "status": 1,
    "fileType": "image/png",
    "permission": "public",
    "key": "98964817-22bd-4537-99ed-99931828b063",
    "createdAt": "2020-05-14T12:13:06.200Z",
    "signedUrl": "http://127.0.0.1:9000/test/98964817-22bd-4537-99ed-99931828b063?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=s3accesskey%2F20200514%2Feu-west-3%2Fs3%2Faws4_request&X-Amz-Date=20200514T121421Z&X-Amz-Expires=900&X-Amz-Signature=5b7238b3b07cc8a134585dc9ba4070b2c01d371e54b590c8422fbba45c66ff98&X-Amz-SignedHeaders=host"
}
```