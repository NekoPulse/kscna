// Simple test file to verify ES modules are working
import { CommandHandler } from './lib/handler.js';
import { resolveCommand } from './lib/utils.js';

console.log('Testing ES modules...');
console.log('CommandHandler:', typeof CommandHandler);
console.log('resolveCommand:', typeof resolveCommand);

// If we get here without errors, basic imports are working
console.log('✅ ES modules are working correctly!');
