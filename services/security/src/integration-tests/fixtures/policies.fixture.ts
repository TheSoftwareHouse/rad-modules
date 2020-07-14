const TEST_ATTRIBUTE_NAME = "TEST_ATTRIBUTE";
const TEST_RESOURCE_VALUE = "test/resource/test-test";

const policiesFixture = Object.freeze([
  {
    attribute: "ADMIN_PANEL",
    resource: "user-operation/add-user",
  },
  {
    attribute: "ADMIN_PANEL",
    resource: "user-operation/edit-user",
  },
  {
    attribute: "ADMIN_PANEL",
    resource: "user-operation/deactivate-user",
  },
  {
    attribute: "ADMIN_PANEL",
    resource: "user-operation/delete-user",
  },
  {
    attribute: "ADMIN_PANEL",
    resource: "user-operation/reset-password",
  },
  {
    attribute: "ADMIN_PANEL",
    resource: "user-operation/add-policies",
  },
  {
    attribute: "ADMIN_PANEL",
    resource: "user-operation/get-policies",
  },
  {
    attribute: "ADMIN_PANEL",
    resource: "user-operation/remove-policies",
  },
  {
    attribute: "ADMIN_PANEL",
    resource: "user-operation/add-attribute-to-user",
  },
  {
    attribute: "ADMIN_PANEL",
    resource: "user-operation/remove-attribute-to-user",
  },
  {
    attribute: "ADMIN_PANEL",
    resource: "user-operation/get-user-id",
  },
  {
    attribute: "ADMIN_PANEL",
    resource: "api/tokens/create-access-key",
  },
  {
    attribute: "ADMIN_PANEL",
    resource: "api/tokens/remove-access-key",
  },
  {
    attribute: "ADMIN_PANEL",
    resource: "api/tokens/get-access-keys",
  },
  {
    attribute: "ADMIN_PANEL",
    resource: "api/users",
  },
  {
    attribute: "ADMIN_PANEL",
    resource: "api/users/get-user",
  },
  {
    attribute: "ADMIN_PANEL",
    resource: "api/users/get-users-by-resource",
  },
  {
    attribute: "ADMIN_PANEL",
    resource: "api/attributes/get-attributes",
  },
  {
    attribute: TEST_ATTRIBUTE_NAME,
    resource: TEST_RESOURCE_VALUE,
  },
]);

export { policiesFixture, TEST_ATTRIBUTE_NAME, TEST_RESOURCE_VALUE };
