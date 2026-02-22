const { authOptions } = require('./src/lib/auth');

try {
    console.log('Testing authOptions...');
    console.log('Secret present:', !!authOptions.secret);
    console.log('Providers:', authOptions.providers.map(p => p.name));
    console.log('Success!');
} catch (e) {
    console.error('Failed to initialize authOptions:', e);
    process.exit(1);
}
