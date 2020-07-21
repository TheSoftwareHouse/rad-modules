---
id: mailer-getting-started
title: Getting started
---

## Mailer step by step

To start playing with the mailer service you need:

1. The internet connection (only to pull docker images from [dockerhub](https://hub.docker.com/r/tshio/mailer))
2. Installed docker and docker-compose (optional but it will save you a lot of time)

After that please follow steps:
1. Create a catalog where we will be playing with the mailer service:

```text
mkdir mailer-service-playground
```

2. Go to the catalog:

```text
cd mailer-service-playground
```

3. Create the catalog for email templates. 
```text
mkdir mail-templates
```

4. Go to the mail-templates catalog:

```text
cd mail-templates
```

5. Create the catalog for your first sample email template. Let's call it hello-word
```text
mkdir hello-word
```

6. Go to the hello-word catalog:

```text
cd hello-word
```

7. Create two (.pug) files one for email subject second for email content
```text
touch subject.pug
touch content.pug
```
Note: Every template is stored in `/app/services/mailer/mail-templates` directory.

The structure of that directory should be as follow:

```text
mail-templates:
  you-template-name:
    subject.pug - template for subject
    content.pug - template for content  
```

8. Open subject.pug
```text
 open -e subject.pug
```

9. Write a subject for your email template e.g
```pug
 |Hello World
```

10. Open content.pug
```text
 open -e content.pug
```

11. Add email content by using [PUG](https://pugjs.org/api/getting-started.html) syntax
```pug
h1 Hello #{username}
p How are you?
```

12. Back to mailer-service-playground catalog

```text
cd ../..
```

13. Create docker-compose.yml:

```text
touch docker-compose.yml
```

14. Open docker-compose.yml:

```text
 open -e docker-compose.yml
```

15. Copy and paste the example service configuration and save the file
```dockerfile
version: "3.7"

services:
  mailer:
    image: tshio/mailer:latest
    command: "api"
    environment:
      TRANSPORT_SMTP_HOST: mailhog
      TRANSPORT_SMTP_PORT: 1025
      TRANSPORT_SMTP_SECURE: "false"
    ports:
      - 50080:50050
    volumes:
      - ./mail-templates:/app/services/mailer/mail-templates
    hostname: mailer
    depends_on:
      - mailhog
    networks:
      - app

  mailhog:
    image: mailhog/mailhog
    restart: always
    networks:
      - app
    ports:
      - 1025:1025
      - 8025:8025
networks:
  app:
```

16. Run docker-compose:

```text
 docker-compose up
```

Now you can go to http://localhost:50080/api-docs/#/ and check if everything works fine.

We can send our first email from mailer service:

1. Click green bar, then "Try it out" button

2. Past sample request body with required data
```javascript
[
  {
   "sender": {
    "name": "Administrator",
    "email": "admin@example.com"
   },
   "recipient": {
    "to": [
     "example@example.com"
    ]
   },
   "template": {
    "id": "hello-word",
    "parameters": {
     "username": "example@example.com",
     "password": "******"
    }
   },
   "attachments": [
    {
     "fileName": "some-empty-file.txt",
     "content": "IA=="
    }
   ]
  }  
]
```

3.  Click "Execute" button

4. Open your browser and go to [http://localhost:8025/](http://localhost:8025/) where you will find [MailHog](https://www.npmjs.com/package/mailhog). There you can check the email with was sent through the mailer service.

![alt text](assets/mailhog-email.png)

>Note: In this example, we mock the SMPT server with MailHog, so we don't need to have any SMPT server. When we want to use the mailer service on production, we need to provide valid TRANSPORT_SMTP_HOST,
TRANSPORT_SMTP_PORT, TRANSPORT_SMTP_AUTH_USER, TRANSPORT_SMTP_AUTH_PASSWORD (you can find more in Advanced configuration section)


## How to send one email?

```javascript
const body = {
  emails: [
    {
      sender: {
        name: "Administrator",
        email: "admin@example.com"
      },
      recipient: {
        to: [
          "example@example.com"
        ]
      },
      template: {
        id: "registration",
        parameters: {
          username: "example@example.com",
          password: "******"
        }
      }
    }
  ]
}

fetch("http://mailer:50050/api/mailer/send", {
  method: "post",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});
```

## How to send same email to more than one user?

```javascript
const body = {
  emails: [
    {
      sender: {
        name: "Administrator",
        email: "admin@example.com"
      },
       recipient: {
        to: ["no-reply@example.com"],
        bcc: [
          "example1@example.com",
          "example2@example.com",
          "example3@example.com"
        ]
      },
      template: {
        id: "important-information",
        parameters: {
          message: "Very important information."
        }
      }
    }
  ]
}

fetch("http://mailer:50050/api/mailer/send", {
  method: "post",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});
```

## How to send meany differ emails at once?
```javascript
const body = {
  emails: [
    {
      sender: {
        name: "Administrator",
        email: "admin@example.com"
      },
      recipient: {
        to: [
          "example@example.com"
        ]
      },
      template: {
        id: "registration",
        parameters: {
          username: "example@example.com",
          password: "******"
        }
      }
    },
    {
      sender: {
        name: "Administrator",
        email: "admin@example.com"
      },
       recipient: {
        to: ["no-reply@example.com"],
        bcc: [
          "example1@example.com",
          "example2@example.com",
          "example3@example.com"
        ]
      },
      template: {
        id: "important-information",
        parameters: {
          message: "Very important information."
        }
      }
    }
  ]
}

fetch("http://mailer:50050/api/mailer/send", {
  method: "post",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});
```

## How to send email with an attachment?

```javascript
const data = await fs.readFile("test-attachment.json", { encoding: "base64" });    

const body = {
  emails: [
    {
      sender: {
        name: "Administrator",
        email: "admin@rad.com",
      },
      recipient: {
        to: ["example1@rad.com"],
      },
      template: {
        id: "information",
        parameters: {
          informationMessage: "Some information text",
        },
      },
      attachments: [
        {
          fileName: "test-attachment.json",
          content: data,
        },
      ]
    }
  ]
}

fetch("http://mailer:50050/api/mailer/send", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
});
```

## How to prioritize or postpone emails sending?

Sometimes an app needs to send many emails, and what if we want to send a new email immediately? The Mailer service allows prioritizing email send by optional property `priority`. The property as default is equal to `0`, and if you want to postpone an email send, you should set it to `1` after that emails with `priority` property sets to 1 will be put on the queue and send in batches in the specific period. In the Advanced configuration section, you can find configuration properties (`BATCH_SIZE` and `BATCH_PERIOD`) with are responsible for postponing email send.

```javascript
const immediatelyEmails = {
  emails: [
    {
      sender: {
        name: "Administrator",
        email: "admin@example.com"
      },
      recipient: {
        to: [
          "example@example.com"
        ]
      },
      template: {
        id: "registration",
        parameters: {
          username: "example@example.com",
          password: "******"
        }
      }
    }
  ]
}

const delayedEmails = {
  emails: [
    {
      sender: {
        name: "Administrator",
        email: "admin@example.com"
      },
      recipient: {
        to: [
          "example@example.com"
        ]
      },
      template: {
        id: "registration",
        parameters: {
          username: "example@example.com",
          password: "******"
        }
      }
    }
  ],
  priority: 1
}

fetch("http://mailer:50050/api/mailer/send", {
  method: "post",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(delayedEmails)
});

fetch("http://mailer:50050/api/mailer/send", {
  method: "post",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(immediatelyEmails)
});
```

>Note: Even if we call the function to send delayed emails first, and immediate emails later. The immediate emails will be sent first.

## How to create custom email template?

We use [PUG](https://pugjs.org/api/getting-started.html) syntax in our templates.
All email templates are in the mail-templates catalog. The catalog structure should look like:

```text
mail-templates:
  you-template-name:
    subject.pug - template for subject
    content.pug - template for content
```

Remember to map `Volumes` in the `docker-compose.yml`
```text
volumes:
      - ./mail-templates:/app/services/mailer/mail-templates
```

To create a new template, you need to add a new catalog into `mail-templates` with two files: `subject.pug`, `content.pug`. So if we want do add new `hello-world` template it should look like:

```text
mail-templates:
  hello-world:
    subject.pug
    content.pug
```

Inside `subject.pug` put the email template subject:
```pug
|Hello World Subject
```

Inside `content.pug` put the email template subject:
```pug
h1 Hello #{username}
p How are you?
```

```javascript
const body = {
  emails: [
    {
      sender: {
        name: "Administrator",
        email: "admin@example.com"
      },
      recipient: {
        to: [
          "example@example.com"
        ]
      },
      template: {
        id: "hello-world",
        parameters: {
          username: "John Doe"
        }
      }
    }
  ]
}

fetch("http://mailer:50050/api/mailer/send", {
  method: "post",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});
```