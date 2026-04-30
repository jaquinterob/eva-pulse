const path = require('path')

module.exports = {
  apps: [{
    name: 'eva-pulse',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -H 127.0.0.1 -p 3222',
    cwd: path.join(__dirname),
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: '3222',
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    watch: false
  }]
}

