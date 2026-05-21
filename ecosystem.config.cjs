module.exports = {
  apps: [{
    name: 'luisgranero-com',
    script: 'node_modules/.bin/next',
    args: 'start -H 127.0.0.1 -p 3001',
    cwd: '/home/ubuntu/luisgranero-com',
    env: {
      NODE_ENV: 'production'
    },
    instances: 2,  // Usar 2 instancias para mejor rendimiento
    exec_mode: 'cluster',
    max_memory_restart: '2G',
    autorestart: true,
    watch: false,
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }]
}
