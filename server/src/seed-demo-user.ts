import { auth } from "./auth.js";
import { db } from "./db.js";

const email = "demo@lab.local";
const password = "Demo12345";
const name = "Cuenta Demo";

async function seed() {
  const existingUser = db
    .prepare("select id from user where email = ? limit 1")
    .get(email) as { id: string } | undefined;

  if (existingUser) {
    console.log(`Demo user already available: ${email} / ${password}`);
    return;
  }

  await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  console.log(`Demo user created: ${email} / ${password}`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
