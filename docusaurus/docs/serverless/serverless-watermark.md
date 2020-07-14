---
id: serverless-watermark
title: Watermark
---

## Add watermark to images when image is upload to S3 (watermark function)

Watermark function works as lambda events
```
functions:
  watermark:
    handler: lambdas/watermark/handler.handle
    events:
      - s3:
          bucket: ${env:AWS_LAMBDA_S3_PUBLIC_BUCKET}
          event: s3:ObjectCreated:*
          existing: true
```

Configuration (.env file)
```
WATERMARK_OPTIONS=right:bottom:0.1
WATERMARK_FILENAME=watermark.png
WATERMARK_BUCKET=watermarkBucket
```

Available options:

- WATERMARK_OPTIONS (position X:position Y: opacity):
  * Position X: left/center/right
  * Position Y: top/middle/bottom
  * watermark opacity: number from 0.1 to 1

Watermark image is downloaded from S3 so we need to define where it should be downloaded:
- WATERMARK_FILENAME: file name key
- WATERMARK_BUCKET: bucket name

> This function adds watermark only to files that have "-original" (file-original.ext) postfix defined in name, and generated new file with watermark and name file-watermark.ext