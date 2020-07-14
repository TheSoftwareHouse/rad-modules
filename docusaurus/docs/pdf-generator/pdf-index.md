---
id: pdf-index
title: Introduction
---

## Description:

Pdf service provides a ready-to-use rendering HTML content from URL or HTML string, which can be used to convert HTML to PDF.

To convert a pdf document use the HTTP POST method:

`/api/pdf/create-pdf`

Example:

create PDF from remote URL

```
curl -X POST "http://localhost:50050/api/pdf/create-pdf" -H  "accept: application/json" -H  "Content-Type: application/json" -d \
'
  {
    "from":"http://www.example.com",
    "type":"uri"
  }
'
```
or, from HTML string

```
curl -X POST "http://localhost:50050/api/pdf/create-pdf" -H  "accept: application/json" -H  "Content-Type: application/json" -d \
'
  {
    "from":"<p>HTML string</p>",
    "type":"html"
  }
'
```
Response:
```
{
  "url":"http://localhost:50050/api/download-pdf/5409e654-9bac-4869-844c-5715e49159e0",
  "expiryAt":"2020-05-29T10:16:06.086Z"
}
```

`url`: link for download pdf file

`expiryAt`: Link expiration time. By default, download links are valid for 3600 seconds (1 hour). The expiration time can be adjusted by setting `PDF_DOWNLOAD_LINK_EXPIRATION` environment variable

For customize PDF rendering, you can send optional `pdfOptions` to `create-pdf` endpoint.

Example:
```
curl -X POST "http://localhost:50050/api/pdf/create-pdf" -H  "accept: application/json" -H  "Content-Type: application/json" -d \
'
  {
    "from": "https://www.example.com",
    "type": "uri",
    "pdfOptions": {
      "format": "Letter"
    }
  }
'
```
For more info, go to next section