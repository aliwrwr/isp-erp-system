/**
 * PM2 Ecosystem Config
 * 
 * الاستخدام:
 *   pm2 start ecosystem.config.js     ← تشغيل كل شيء
 *   pm2 stop all                       ← إيقاف كل شيء
 *   pm2 restart all                    ← إعادة تشغيل
 *   pm2 logs                           ← عرض السجلات
 *   pm2 save && pm2 startup            ← تشغيل تلقائي مع Windows
 */

module.exports = {
  apps: [
    // ─── Backend (NestJS) ───────────────────────────────────────────
    {
      name: 'isp-backend',
      script: 'dist/main.js',
      cwd: './',
      watch: false,
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,        JWT_SECRET: 'isp-erp-secret-2026',      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },

    // ─── Frontend (Vue 3 - Static via serve) ─────────────────────────
    {
      name: 'isp-frontend',
      script: 'node_modules/.bin/serve',
      args: 'dist -s -l 5173',
      cwd: __dirname + '/frontend',
      watch: false,
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
