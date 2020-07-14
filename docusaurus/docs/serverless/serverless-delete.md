---
id: serverless-delete
title: Delete file
---

## Delete file from database and S3 (delete-file function)

Serverless framework:
```
functions:
  delete:
    handler: lambdas/delete-file/handler.handle
    events:
      - http:
          path: /files
          method: DELETE
```

Request:
`DELETE /files?key=<file_key>`

Returns `204` status code when the file has been deleted.
