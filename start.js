// This file is a wrapper to ensure we load the HTTP version of the app
// and explicitly disable Socket Mode
console.log('Starting app in HTTP mode (not Socket Mode)');
require('./dist/app-http.js'); 