import User from "../models/User.js";

const DEFAULT_ADMIN_EMAIL = "admin@manaradesign.ai";
const DEFAULT_ADMIN_PASSWORD = "testing123";
const DEFAULT_ADMIN_NAME = "Manara Admin";

const isSeedingEnabled = () =>
  process.env.SEED_ADMIN_ON_STARTUP !== "false";

export const ensureBootstrapAdmin = async () => {
  if (!isSeedingEnabled()) return;

  const email = (
    process.env.DEFAULT_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL
  ).toLowerCase();
  const password = process.env.DEFAULT_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  const name = process.env.DEFAULT_ADMIN_NAME || DEFAULT_ADMIN_NAME;
  const forcePasswordReset =
    process.env.RESET_BOOTSTRAP_ADMIN_PASSWORD === "true";

  let admin = await User.findOne({ email }).select("+password");

  if (!admin) {
    admin = new User({
      name,
      email,
      password,
      role: "admin",
      authProvider: "local",
      isActive: true,
      isDeleted: false,
    });
  } else {
    admin.name = name;
    if (!admin.password || forcePasswordReset) {
      admin.password = password;
    }
    admin.role = "admin";
    admin.authProvider = "local";
    admin.isActive = true;
    admin.isDeleted = false;
    admin.deletedAt = undefined;
  }

  await admin.save();

  console.log(`✅ Admin account ready: ${email}`);
};
