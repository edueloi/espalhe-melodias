/**
 * PM2 ecosystem config — Espalhe Melodias API
 * Na VPS: pm2 start ecosystem.config.js --env production
 */
module.exports = {
  apps: [
    {
      name: 'espalhe-melodias-api',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      // Reinicia se usar mais de 500MB de RAM
      max_memory_restart: '500M',
      // Log files
      out_file: './logs/app-out.log',
      error_file: './logs/app-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      // Reinicia automaticamente em caso de crash
      autorestart: true,
      watch: false,
      // Aguarda 3s antes de considerar o app iniciado
      wait_ready: false,
      listen_timeout: 3000,
    },
  ],
};
