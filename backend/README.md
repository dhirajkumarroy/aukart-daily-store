# Store Backend API - Setup & Integration

This is the Node.js + Express backend API for the affiliate product directory and admin panel. It handles products curation, redirects tracking, JWT authentication for a single admin user, image upload, rate limiting, and PostgreSQL integration via Prisma ORM.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express
- **Database ORM**: Prisma (PostgreSQL database)
- **Validation**: Zod
- **Image Storage**: Cloudinary (CDN file streams)
- **Security**: JWT & BCrypt

---

## Environment Variables (.env)
Create a `.env` file in the root of the `backend` folder (a default `.env` template has already been created for you):

```env
PORT=5000
DATABASE_URL="postgresql://username:password@hostname:port/database_name?schema=public"
JWT_SECRET="your_secure_jwt_secret"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD_HASH="your_bcrypt_password_hash"
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
FRONTEND_URL="http://localhost:5173"
```

### Hashing the Admin Password
To generate a BCrypt hash for your `ADMIN_PASSWORD_HASH`, run the utility script provided:
```bash
node scripts/hashPassword.js "your_plain_text_password"
```
Copy the output hash and set it as `ADMIN_PASSWORD_HASH` in `.env`.

---

## Database Migrations & Seeding

1. **Prisma Client Generation** (automatically runs during install or build):
   ```bash
   npm run prisma:generate
   ```

2. **Run Migrations** (creates tables on PostgreSQL instance):
   ```bash
   npm run prisma:migrate
   ```

3. **Seed Database** (adds 5 premium sample products to test immediately):
   ```bash
   npm run prisma:seed
   ```

---

## Running the API locally

### Development Mode (with hot-reloading)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The API will be available at **`http://localhost:5000`**.

---

## API Endpoints List

### Public Endpoints (No Auth, Rate Limited)
- **`GET /api/products`**: Fetch all products. Supports filters: `?category=xxx`, `?search=xxx`, `?featured=true`.
- **`GET /api/products/:slug`**: Fetch a single product details by slug.
- **`GET /api/categories`**: List all distinct product categories.
- **`POST /api/click/:slug`**: Records an outbound click, increments click count, and returns the target affiliate link:
  - **Body response**: `{ "affiliateLink": "https://amzn.to..." }`

### Admin Endpoints (JWT Auth Needed)
- **`POST /api/auth/login`**: Send email and password. Returns JWT token: `{ "token": "jwt_token_here" }`.
- **`POST /api/products`**: Add a new product (validates fields, auto-generates slug).
- **`PUT /api/products/:id`**: Update product specifications by id.
- **`DELETE /api/products/:id`**: Delete a product.
- **`POST /api/upload`**: Uploads image form-data (`image` key) to Cloudinary and returns CDN URL.
- **`GET /api/analytics`**: List click counts per product, 7-day volume, and 30-day volume.
