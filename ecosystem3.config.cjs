module.exports = {
  apps: [
    {
      name: "vlab-app-redis",
      script: "server-with-redis.js",
      instances: "max",
      exec_mode: "cluster",
      node_args: "--experimental-modules",
      env: {
        NODE_ENV: "production"
      },
      max_memory_restart: "1G"
    }
  ]
}