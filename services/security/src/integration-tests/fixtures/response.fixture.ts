const AclResponses = Object.freeze({
  hasAccess: { hasAccess: true },
  hasNotAccess: { hasAccess: false },
});

const UsersResponses = Object.freeze({
  hasAttributeResponseFactory: () => ({ hasAllAttributes: true }),
  hasNotAnyAttribute: { hasAllAttributes: false },
  passwordChanged: { passwordChanged: true },
  hasAccess: { hasAccess: true },
  isAuthenticated: {
    isAuthenticated: true,
  },
  isNotAuthenticated: {
    isAuthenticated: false,
  },
});

const BadRequestResponses = Object.freeze({
  adminDelete: { error: "Cannot delete the system administrator account." },
  userIdNotValidGuid: { error: 'child "userId" fails because ["userId" must be a valid GUID]' }, // eslint-disable-line
  userNotFound: { error: "User not found" },
  userHasNoAccess: { error: "User has no access" },
  passwordCantSetNew: { error: "Can't set new password" },
  wrongUsernameOrPassword: { error: "Wrong username or password" },
  wrongUsername: { error: "Wrong username." },
  refreshTokenFailed: { error: "Failed to refresh a token" },
  tokenMissingOrInvalid: { error: "Token missing or invalid token format" },
  tokenFailedToVerify: { error: "Failed to verify a token." },
  tokenExpired: { error: "Token expired." },
  policyAlreadyExists: { error: "Policy already exists." },
  policyCannotDelete: { error: "Cannot delete base policy" },
  accessKeyWrong: { error: "Wrong access key" },
  queryParametersLimitPageWrong: {
    error:
      'child "page" fails because ["page" must be a number]. child "limit" fails because ["limit" must be a number]', // eslint-disable-line
  },
  queryParametersPageNotInteger: {
    error: 'child "page" fails because ["page" must be an integer]', // eslint-disable-line
  },
  attributesIsEmptyArray: {
    error: 'child "attributes" fails because ["attributes" does not contain 1 required value(s)]', // eslint-disable-line
  },
  attributesIsNotAnArray: {
    error: 'child "attributes" fails because ["attributes" must be an array]', // eslint-disable-line
  },

  userNameAlreadyExistsErrorFactory: (username: string) => ({
    error: `User with username ${username} already exists.`,
  }),

  userHasNotAttributesErrorFactory: (attributesThatUserNotHaveAdded: string[]) => ({
    error: `User has not attributes: ${attributesThatUserNotHaveAdded.join(", ")}`,
  }),

  userHasAttributesConflictErrorFactory: (attributesToAdd: string[]) => ({
    error: `User already has attributes: ${attributesToAdd.join(", ")}`,
  }),

  passwordNotMatchRegexpErrorFactory: (fieldName: string) => ({
    error: `${fieldName} does not meet criteria: password must be at least 8 characters`,
  }),

  attributesNotMatchPatternErrorFactory: (joinedAttributes: string) => ({
    error: `child "attributes" fails because ["attributes" with value "${joinedAttributes}" fails to match the required pattern: /^([^,;]+,?\\s*)+$/]`,
  }),

  fieldRequiredErrorFactory: (fieldName: string) => ({
    error: `child "${fieldName}" fails because ["${fieldName}" is required]`,
  }),

  fieldMustBeValidGuidFactory: (fieldName: string) => ({
    error: `child "${fieldName}" fails because ["${fieldName}" must be a valid GUID]`,
  }),

  userWithIdNotExistFactory: (id: string) => ({
    error: `User with id ${id} doesn't exist.`,
  }),

  arrayPropIsEmptyErrorFactory: (arrayName: string) => ({
    error: `child "${arrayName}" fails because ["${arrayName}" does not contain 1 required value(s)]`,
  }),
});

export { AclResponses, BadRequestResponses, UsersResponses };
