const adminPanelAttributeName = "ADMIN_PANEL";
const usersFixture = Object.freeze([
  {
    username: "user1",
    password: "passw0rd",
    attributes: [adminPanelAttributeName],
  },
  {
    username: "user2",
    password: "passw0rd2",
    attributes: [],
  },
  {
    username: "superadmin",
    password: "superadmin",
    attributes: ["ROLE_SUPERADMIN"],
  },
]);

const hashedPasswords: { [key: string]: string } = {
  passw0rd:
    "da9ff31f04e38f75c66f21b2817eba2780eb1688cb89f69f1733f2a6aae8ddd4a83fa79201a473d35d9c9da8a4b706a020ae711b5f1ef6e7a0f09e921d86b4ec",
  passw0rd2:
    "b1b223533adbb75caa8e3296064729d8e7fa4892f0d9db7d92272fe9a5d02f46787a3b1a0149b7fd14bd93263401169c404a22e738517fc48187ddd67eaa7425",
  superadmin:
    "98a89016039cc8d06701225e074d711b5d053c47bcac3067d053a35efbb3a781b2c09801f70e59caf3d83ed06d165775ac4b5bffa9e030f455ad754d49455cbb",
};

const testPasswordsSalt = "salt";

export { usersFixture, adminPanelAttributeName, hashedPasswords, testPasswordsSalt };
