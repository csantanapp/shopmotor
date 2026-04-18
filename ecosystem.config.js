module.exports = {
  apps: [
    {
      name: "shopmotor",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/shopmotor",
      instances: 1,
      exec_mode: "fork",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/var/log/shopmotor/error.log",
      out_file: "/var/log/shopmotor/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
