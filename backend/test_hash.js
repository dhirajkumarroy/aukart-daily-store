import bcryptjs from 'bcryptjs';

const hash = "$2a$10$ByFdBBCfvAY7IVB6SXUdZuU9RVIDDWTbYii01n9S9perZXX4jaqJa";

const candidates = [
  "admin",
  "admin123",
  "admin@123",
  "admin1234",
  "admin@1234",
  "admin12345",
  "admin@12345",
  "password",
  "password123",
  "123456",
  "12345678",
  "123456789",
  "DKumar@2026$",
  "DKumar@2026",
  "DKumar2026",
  "aukart",
  "aukart123",
  "aukart@123",
  "bestdeals",
  "bestdeals123",
  "bestdeals@123",
  "admin2026",
  "admin@2026"
];

let found = false;
for (const cand of candidates) {
  if (bcryptjs.compareSync(cand, hash)) {
    console.log("MATCH FOUND:", cand);
    found = true;
    break;
  }
}

if (!found) {
  console.log("No match found in candidates list.");
}
