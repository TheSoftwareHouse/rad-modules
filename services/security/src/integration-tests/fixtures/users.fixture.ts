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

export { usersFixture, adminPanelAttributeName };
