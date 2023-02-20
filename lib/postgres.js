//import postgres from 'postgres'
const pg = require('pg');
const process = require('process');

const pool = new pg.Pool({
  host: process.env.PG_HOST || '127.0.0.1',
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DB || 'teslamate',
  user: process.env.PG_USER || 'teslamate',
  password: process.env.PG_PASS || 'secret'
})

pool.on('error', console.error)

module.exports = pool;
