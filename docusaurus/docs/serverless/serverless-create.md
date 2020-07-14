---
id: serverless-create
title: Create file
---

## Upload new image to S3 (create-file function)

Serverless framework:
```
functions:
  create:
    handler: your-lambdas/create-file/handler.handle
    events:
      - http:
          path: /upload
          method: POST
```

Creates an entity and returns its upload url
In order to upload a file use PUT request on a specific url.

**Mino**: Remember to set proper content-type for a file! For example an PNG image should be sent with headers: Content-Type: image/png.\
**S3**: Remember to set content-type: octet-streams

Request

```
{
  "fileName": "some-file.png",
  "description": "some-descriptiuon",
  "fileType": "image/png",
  "permission": "public"
}
```

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
    "signedUrl": "http://127.0.0.1:9000/test/98964817-22bd-4537-99ed-99931828b063?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=s3accesskey%2F20200514%2Feu-west-3%2Fs3%2Faws4_request&X-Amz-Date=20200514T121306Z&X-Amz-Expires=900&X-Amz-Signature=b313fcf1e641b8620e249bbc62f3e0088b54195e80a0dafd1d7f285a1afe5c52&X-Amz-SignedHeaders=host"
}
```

Example upload

```
curl "http://127.0.0.1:9000/test/98964817-22bd-4537-99ed-99931828b063?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=s3accesskey%2F20200514%2Feu-west-3%2Fs3%2Faws4_request&X-Amz-Date=20200514T121306Z&X-Amz-Expires=900&X-Amz-Signature=b313fcf1e641b8620e249bbc62f3e0088b54195e80a0dafd1d7f285a1afe5c52&X-Amz-SignedHeaders=host" --upload-file ./some-file.png -H "Content-Type:image/png"
```