const path = require('path')
const os = require('os')

/** Logs fuera del repo ($HOME/logs/eva-pulse) */
const pm2LogDir = path.join(os.homedir(), 'logs', 'eva-pulse')

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
    error_file: path.join(pm2LogDir, 'pm2-error.log'),
    out_file: path.join(pm2LogDir, 'pm2-out.log'),
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    watch: false
  }]
}

