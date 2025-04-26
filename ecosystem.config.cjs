module.exports = {
  apps: [
    {
      name: "vlab-app",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production"
      },
      max_memory_restart: "1G"
    },
    {
      name: "vlab-proxy",
      script: "rproxy.js",
      env: {
        NODE_ENV: "production"
      },
      max_memory_restart: "500M"
    }
  ]
} 