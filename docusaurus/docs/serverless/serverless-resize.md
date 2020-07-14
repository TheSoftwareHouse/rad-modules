---
id: serverless-resize
title: Resize images
---

## Generate thumbnails when image is upload to S3 (resize function)

Resize function works as lambda events
```
functions:
  resize:
    handler: lambdas/resize/handler.handle
    events:
      - s3:
          bucket: ${env:AWS_LAMBDA_S3_PUBLIC_BUCKET}
          event: s3:ObjectCreated:*
          existing: true
```
Add webpack definition for build `sharp` package for AWS:
```
custom:
  webpack:
    packagerOptions:
      scripts:
        - rm -rf node_modules/sharp && npm install --arch=x64 --platform=linux sharp
```

Configuration (.env file)
```
THUMB_IMAGES_SIZES=150x150:cover,140x140:fill
```

Sizes (width x height) and fit. Separated by commas for each image

Fit available options:
- `contain`
- `cover`
- `fill`
- `inside`
- `outside`