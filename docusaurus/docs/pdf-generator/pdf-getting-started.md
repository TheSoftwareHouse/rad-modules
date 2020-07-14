---
id: pdf-getting-started
title: Getting started
---

## PDF generator step by step

To start playing with the pdf generator service you need:

1. The internet connection (only to pull docker images from [dockerhub](https://hub.docker.com/r/tshio/pdf))
2. Installed docker and docker-compose (optional but it will save you a lot of time)

After that please follow steps:
1. Create a catalog where we will be playing with the mailer service:

```text
mkdir pdf-service-playground
```

2. Go to the catalog:

```text
cd pdf-service-playground
```

3. Create docker-compose.yml:

```text
touch docker-compose.yml
```

4. Open docker-compose.yml:

```text
 open -e docker-compose.yml
```

5. Copy and paste the example service configuration and save the file
```dockerfile
version: "3.7"

services:    
  pdf:
    image: tshio/pdf:latest
    command: "api"
    ports:
      - 50080:50050    
```

6. Run docker-compose:

```text
 docker-compose up
```

Now you can go to http://localhost:50080/api-docs/#/ and check if everything works fine.

We can generate our first pdf from the pdf service:

1. Click green bar, then "Try it out" button

2. Past sample request body with required data
```javascript
 {
  "from": "https://tc39.es/",
  "type": "uri",
  "pdfOptions": {
    "format": "A4"
  }
}
```

3.  Click "Execute" button

4. Below you should receive a 201 (Created) response with should look like:
```javascript
 {
  "url": "http://pdf:50050/api/download-pdf/75af8ef2-ec64-4a2a-b1f9-e503574a2ac5",
  "expiryAt": "2020-07-02T09:07:18.613Z"
}
```
If we want to check quickly how our pdf looks like, we need to open a postman and make a GET request to the URL from the request. 

> Note: Now we are working locally so the URL where we want to make request need to be changed from "pdf" to "localhost" and from "50050" to "50080". The URL should look like http://localhost:50080/api/download-pdf/75af8ef2-ec64-4a2a-b1f9-e503574a2ac5

After receiving response save it as PDF file (add .pdf at the end of the file name)

![alt text](assets/pdf-generator/pdf-response.png)

That was a manual way to download a PDF file from the URL. You can also put some HTML into requests and download the PDF. All steps are similar but the request should look like:
```javascript
 {
  "from":"<p>Hello word from HTML</p>",
  "type":"html",
  "pdfOptions": {
    "format": "A4"
  }
}
```

## Are there more properties in `pdfOptions` that I can edit?
As you can see above you can provide some PDF options to change the PDF file. Below you can check all available options:
```javascript
 pdfOptions: {
        scale: number,
        displayHeaderFooter: boolean,
        headerTemplate: string, // valid parameters: ["date", "title", "url", "pageNumber", "totalPages"]
        footerTemplate: string, // valid parameters: ["date", "title", "url", "pageNumber", "totalPages"]
        printBackground: boolean,
        landscape: boolean,
        pageRanges: string,
        format: string, // valid parameters: ["Letter", "Legal", "Tabloid", "Ledger", "A0", "A1", "A2", "A3", "A4", "A5", "A6"]
        width: number,
        height: number,
        margin:{
          top: number,
          right: number,
          bottom: number,
          left: number,
        },
        preferCSSPageSize: boolean,
      },
}
```

## How to generate PDF from website uri?

```javascript
const body = {
      from: "https://tc39.es/",
      type: "uri",
      pdfOptions: {
        format: "A4"
      }
    }

const fileDownloadResponse = await fetch("http://pdf:50050/api/pdf/create-pdf", {
  method: "post",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
```

## How to generate PDF from custom HTML?

```javascript
const body = {
      from: "<p>Hello World</p>",
      type: "html",
    };

const fileDownloadResponse = await fetch("http://pdf:50050/api/pdf/create-pdf", {
  method: "post",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
```

## I have a URL from PDF service what to do next?
Now when we received the URL from the PDF service, we need to fetch file content from the service and pipe it to response object in our app

```javascript
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const port = 30002;

app.post("/api/generate-pdf", async (req, res) => {  
  try {
    const { url } = req.body;

    fetch(url)
      .then((fileContentResponse) => {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment: filename=test.pdf`
        );
        fileContentResponse.body.pipe(res);
        res.on("end", () => {
          res.send();
        });
      })
      .then((x) => console.log(x));

  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(port, () => console.log(`App listening on ${port}`));
```

## How to use pdf generator in code?

Below is a simple express app with one endpoint to generate a PDF file from provided HTML. If you send a request to "localhost:30002/api/generate-pdf" you will be able to save response as a file. If you would call the endpoint from the client app you would receive the PDF file.

```javascript
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const port = 30002;

app.post("/api/generate-pdf", async (req, res) => {  
  try {
    const body = {
      from: "<p>Hello World</p>",
      type: "html",
    };

    const fileDownloadResponse = await fetch("http://pdf:50050/api/pdf/create-pdf", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await fileDownloadResponse.json();
    const { url } = json;

    fetch(url)
      .then((fileContentResponse) => {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment: filename=test.pdf`
        );
        fileContentResponse.body.pipe(res);
        res.on("end", () => {
          res.send();
        });
      })
      .then((x) => console.log(x));

  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(port, () => console.log(`App listening on ${port}`));
```