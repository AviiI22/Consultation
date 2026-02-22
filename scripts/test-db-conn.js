const { Client } = require('pg');

const connectionString = "postgresql://postgres.yiiqtxrrsikxsknfhexe:vwFBAfy8H8jmLQKn@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require";

const client = new Client({
    connectionString: connectionString,
});

console.log('Connecting to database...');
client.connect()
    .then(() => {
        console.log('Connected successfully!');
        return client.query('SELECT NOW()');
    })
    .then(res => {
        console.log('Query result:', res.rows[0]);
        return client.end();
    })
    .catch(err => {
        console.error('Connection error:', err.stack);
        process.exit(1);
    });
