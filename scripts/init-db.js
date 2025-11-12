// This script initializes the database with default data
// Run with: npm run db:init

const path = require('path');
const { execSync } = require('child_process');

try {
  console.log('Initializing database...');
  
  // Use Next.js build to compile TypeScript, then run the init
  execSync('next build', { stdio: 'inherit' });
  
  // Import and run the initialization
  require('../lib/db-init.js');
  
  console.log('Database initialized successfully');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}