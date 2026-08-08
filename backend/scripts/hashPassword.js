import bcryptjs from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.log('Usage: node scripts/hashPassword.js <plain_text_password>');
  process.exit(1);
}

const salt = bcryptjs.genSaltSync(10);
const hash = bcryptjs.hashSync(password, salt);

console.log('\n--- Admin Password Hash Generator ---');
console.log('Plain Text Password :', password);
console.log('Generated BCrypt Hash:', hash);
console.log('-------------------------------------\n');
console.log('Copy this BCrypt Hash and paste it as ADMIN_PASSWORD_HASH in your backend .env file.');
