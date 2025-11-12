#!/usr/bin/env tsx

// This script initializes the database with default data
// Run with: npm run db:init

import { initializeApp } from '../lib/db-init.js';

async function main() {
  try {
    console.log('Initializing database...');
    await initializeApp();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

main();