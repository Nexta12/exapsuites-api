module.exports = {
  UserRole: {
    admin: process.env.ADMIN,
    manager: process.env.MANAGER,
    superAdmin: process.env.SUPERADMINROLE,
    guest: process.env.GUEST,
  },

  Gender: {
    male: "male",
    female: "female",
    undisclosed: "undisclosed",
  },
};
