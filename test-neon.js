const { Pool } = require('pg');

console.log('Intentando conectar con DIRECT_URL...');
const pool = new Pool({ 
  connectionString: process.env.DIRECT_URL,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT 1 as test', (err, res) => {
  if (err) {
    console.error('❌ Error de conexión:');
    console.error('   Código:', err.code);
    console.error('   Mensaje:', err.message);
    console.error('   Stack:', err.stack);
  } else {
    console.log('✅ Conectado exitosamente:', res.rows[0]);
  }
  pool.end();
  process.exit(err ? 1 : 0);
});
