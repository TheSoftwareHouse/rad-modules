---
id: security-index
title: Introduction
---

## Quick Answers to Important Questions
- For help and support, open a [GitHub issue](https://github.com/TheSoftwareHouse/rad-modules/issues).

## Helpful Resources for Getting Started with Security service
- [Introduction to JSON Web Tokens](https://jwt.io/introduction/)
- [Best Practices in Enterprise Authorization](https://blog.empowerid.com/hs-fs/hub/174819/file-18506087-pdf/docs/empowrid-whitepaper-rbac-abac-hybrid-model.pdf)  https://blog.empowerid.com/hs-fs/hub/174819/file-18506087-pdf/docs/empowrid-whitepaper-rbac-abac-hybrid-model.pdf
- [Keycloak access control mechanisms](https://www.keycloak.org/docs/latest/authorization_services/)

## Description

Security service provides authentication, attribute-based access control (ABAC) authorization, and user management for any app: deploy anywhere, integrate with anything, in minutes.

With the power of service features you can:

1. Add users
2. Remove a user
3. Active/Deactive user
4. Handle user login
5. Reset the user's password with email confirmation (using built-in standalone SMTP server or external service)
6. Add policy
7. Add attributes for the policy
8. Add attributes for users
9. Remove policy
10. Check if the user has access to resources under some policy
11. Check if a user is authenticated

# 

Security service provides easy integration with [Keycloak](https://www.keycloak.org/). The goal of Keycloak is to make security simple so that it is easy for application developers to secure the apps and services they have deployed in their organization.

## Tools

You don't need to implement registration flow in your app. You can simply use our security service to handle that.

Look at https://hub.docker.com/r/tshio/rad-admin

The Rad-Admin Service dashboard provides quick access to manage security service (user accounts, policies and API keys)

Read more on how to download and set up our security service on your environment.