export const vcenter = {
  baseURL: process.env.VCENTER_BASE_URL,
  username: process.env.VCENTER_USERNAME,
  password: process.env.VCENTER_PASSWORD
}

export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
}

export const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
}

export const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,                       // Tell express-session to trust the proxy
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,     // 24 hours
    secure: false,                   // For proxy environment, set to false in express
    httpOnly: true                   // Prevent client JavaScript from accessing cookies
  }
}

export const userSettings = {
  saltRounds: 10,                     // The salt value for password encryption
  adminRoleId: 1,                     // The ID of the admin role
  advantageRoleId: 2,                 // The ID of the advantage role
  userRoleId: 3,                      // The ID of the user role
  manualLabId: 0,                     // The labID of the manually cloned machine, all labID are 0
  defaultAdminPassword: '123',        // The default password of the admin
  defaultAdminUsername: 'admin',      // The default username of the admin
  defaultAdminEmail: 'admin@vlab.com', // The default email of the admin
}

export const vmFolder = {
  source: 'group-v81',
  target: 'group-v82'
};

export const cis = {
  category_id: 'urn:vmomi:InventoryServiceCategory:8b9bab4b-9e22-44cf-8f5c-4f2d88c8fb87:GLOBAL'
}

export const adminNavItems = [
  {
    title: 'User Management',
    children: [
      {
        title: 'Users',
        url: '/admin/users'
      },
      {
        title: 'Groups',
        url: '/admin/groups'
      },
      {
        title: 'New User and Group',
        url: '/admin/users/newuser'
      },
      {
        title: 'Advanced User Management',
        url: '/admin/users/advantage'
      }
    ]
  },
  {
    title: 'Lab Management',
    children: [
      {
        title: 'Labs',
        url: '/admin/labs'
      },
      {
        title: 'New Lab',
        url: '/admin/labs/newlab'
      }
    ]
  },
  {
    title: 'VM Management',
    children: [
      {
        title: 'Lab-Group Assignment',
        url: '/admin/labs/assign'
      },
      {
        title: 'Manual Assignment',
        url: '/admin/vms/manualclone'
      },
      {
        title: 'VM Management-By User',
        url: '/admin/vms/clonedvms'
      },
      {
        title: 'VM Management-By Group',
        url: '/admin/vms/clonedvms-group'
      }
    ]
  },
  {
    title: 'System Information',
    children: [
      {
        title: 'Host',
        url: '/vc/host'
      },
      {
        title: 'Datastore',
        url: '/vc/datastore'
      },
      {
        title: 'Folder',
        url: '/vc/folder'
      },
      {
        title: 'CIS',
        url: '/cis/categories'
      }
    ]
  },
  {
    title: 'Plan and Task',
    children: [
      {
        title: 'Plan and Task',
        url: '/cron/tasks'
      }
    ]
  }
];