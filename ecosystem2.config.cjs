module.exports = {
  apps: [
    {
      name: "vlab-app-with-redis",
      script: "server-with-redis.js",
      instances: "max",
      exec_mode: "cluster",
      node_args: "--experimental-modules",
      env: {
        NODE_ENV: "production"
      },
      max_memory_restart: "1G"
    },
    {
      name: "vlab-proxy-with-redis",
      script: "rproxy-with-redis.js",
      node_args: "--experimental-modules",
      env: {
        NODE_ENV: "production"
      },
      max_memory_restart: "500M"
    }
  ]
} 