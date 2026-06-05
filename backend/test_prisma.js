const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

try {
  const prisma = new PrismaClient({});
  console.log("Success with empty object");
} catch (e) {
  console.error("Failed with empty object", e.message);
}
