import express from "express";
import { setUpRoutes } from "./api/router/router.js";
import { db, pingDB } from "./db/db.js";

// Load environment variables
const app = express();
import dotenv from 'dotenv';
dotenv.config();

function main() {
  
  // Ping database to see if is up and running
  if (!pingDB()) {
    console.error('Database connection failed. Exiting...');
    process.exit(1); // Exit the process if database connection fails
  }

  setUpRoutes(app);

  // Start the server on port 3000
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
}

// Set up routes
main();
