---
id: security-abac
title: Attribute-based access control
---

## Security service and ABAC:

In our security service **Attribute-based access control (ABAC)**, also known as **policy-based access control**, defines an access control paradigm whereby access rights are granted to users through the use of policies which combine attributes together. The policies can use any type of attributes (user attributes, resource attributes, object, environment attributes etc.). This model supports Boolean logic, in which rules contain "IF, THEN" statements about who is making the request, the resource, and the action. For example: IF the requestor is a manager, THEN allow read/write access to sensitive data.

## Default attributes:

You can overwrite default attributes (by providing valid env variables please check the Security service details page) that are related to managing users and policies. By default, all provided attributes in the security service have an attribute named: `ADMIN_PANEL` you can change the name for each attribute. Below is a list of all default attributes and resources. Remember you can change attribute name but you are not able to change resource value for default attributes.

## Default attributes list:

```
[
  {
    "attribute": "ADMIN_PANEL",
    "resource": "user-operation/add-user"
  },
  {
    "attribute": "ADMIN_PANEL",
    "resource": "user-operation/edit-user"
  },
  {
    "attribute": "ADMIN_PANEL",
    "resource": "user-operation/deactivate-user"
  },
  {
    "attribute": "ADMIN_PANEL",
    "resource": "user-operation/delete-user"
  },
  {
    "attribute": "ADMIN_PANEL",
    "resource": "user-operation/reset-password"
  },
  {
    "attribute": "ADMIN_PANEL",
    "resource": "user-operation/add-policies"
  },
  {
    "attribute": "ADMIN_PANEL",
    "resource": "user-operation/get-policies"
  },
  {
    "attribute": "ADMIN_PANEL",
    "resource": "user-operation/remove-policies"
  },
  {
    "attribute": "ADMIN_PANEL",
    "resource": "user-operation/add-attribute-to-user"
  },
  {
    "attribute": "ADMIN_PANEL",
    "resource": "user-operation/remove-attribute-to-user"
  },
  {
    "attribute": "ADMIN_PANEL",
    "resource": "user-operation/get-user-id"
  },
  {
    "attribute": "ADMIN_PANEL",
    "resource": "api/tokens/create-access-key"
  },
  {
    "attribute": "ADMIN_PANEL",
    "resource": "api/tokens/remove-access-key"
  },
  {
    "attribute": "ADMIN_PANEL",
    "resource": "api/tokens/get-access-keys"
  },
  {
    "attribute": "ADMIN_PANEL",
    "resource": "api/users"
  },
  {
    "attribute": "ADMIN_PANEL",
    "resource": "api/users/get-user"
  },
  {
    "attribute": "ADMIN_PANEL",
    "resource": "api/users/get-users-by-resource"
  },
  {
    "attribute": "ADMIN_PANEL",
    "resource": "api/attributes/get-attributes"
  }
]
```

## Add new attribute:

As you can see in the list above all default attributes have the name "ADMIN_PANEL" (if you won't change it by changing configuration of course). And maybe you are good with that, but you would like to give the ability for one user to check the list of all users from the security service. If you will assign for the user "ADMIN_PANEL" attribute the user will have access to all other resources that are assigned to the "ADMIN_PANEL" attribute. In that case, the best way to handle that is to create a new attribute with access to fetch the list of all users.

If you want to add a new attribute e.g. allowing to fetch a list of all users "api/users" you need three things:

1. User with access to adding new attributes
2. RAD Modules admin panel or HTTP client
3. Name for the new attribute

## Add new attribute by HTTP client:

If you will be using HTTP client you need to post new attribute and resource to `api/policy/add-policy` with:

```
body:{
 attribute: "GET_USERS"
 resource: "api/users/get-user"
}
```

Then if you want to assign a new attribute to the user you need post
the body to the endpoint: `api/users/add-attribute`

```
body: {
    userId: "11111111-1111-1111-1111-111111111",
    attributes: ["GET_USERS"]
}
```

## Add new attribute by the admin panel:

1. Go to Policies view
2. Click "Add Policy" button
3. Insert attribute and resource e.g. ( GET_USERS and api/users/get-user)
4. Click "OK" button
5. Go to Users view
6. Choose the user that should have the new policy by clicking the user edit icon (last column in the table). You will be redirected to the user details view
7. Click "Add new attribute" button
8. Search the attribute you want to add to the user, in our case: GET_USERS
9. Select the attribute from the drop-down list
10. Click "OK" button
