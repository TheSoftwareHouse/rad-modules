---
id: index
title: Getting started
---

## About RAD modules

There are many digital systems worldwide. Each system was developed to solve some business requirements, despite each system is different they all have common (modules) to achieve their requirements e.g

1. Module to handle users and users policy,
2. Module for sending emails,
3. Module for running scheduled jobs,
4. Module for pushing notifications,
5. Module for converting HTML to PDF,
6. Module with GUI admin panel to manage other modules (optional),
7. A set of serverless functions

RAD modules were developed to simplify the development process so developers can focus only on business requirements.

For example, your app needs to send an email after some operation but you don't have implemented the mailing module jet. No worries you can pull our service and use it in your app. Things you need to do are only a few steps:

1. Pull our docker image of mailing service
2. Add service to yours docker-compose file
3. Set necessary env variables
4. Call methods from your app to new mailing service via HTTP methods

Our modules are fully configurable so you can change things you want or things you don't need.

If you want to read more about our RAD modules please check the description of each module.

In case of issues feel free to add a new issue on our github.


## Related Projects

[RAD Modules Tools](https://github.com/TheSoftwareHouse/rad-modules-tools)

A TypeScript mono-repo that provides a set of libraries for developing Rad Modules clients and services more simple.

Ready to use Node.js clients:


* [RAD Security Client](https://www.npmjs.com/package/@tshio/security-client)

* [RAD Scheduler Client](https://www.npmjs.com/package/@tshio/scheduler-client)

* [RAD PDF Client](https://www.npmjs.com/package/@tshio/pdf-client)

* [RAD Notifications Client](https://www.npmjs.com/package/@tshio/notifications-client)
  
* [RAD Mailer Client](https://www.npmjs.com/package/@tshio/mailer-client)
