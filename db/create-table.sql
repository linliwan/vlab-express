-- Create role table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- Create group table
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    vmware_tag_id VARCHAR(255)
);

-- Create user table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    group_id INTEGER REFERENCES groups(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create category table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Create lab table
CREATE TABLE labs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    link VARCHAR(255),
    category_id INTEGER REFERENCES categories(id),
    vm_ids VARCHAR(100)[] DEFAULT '{}'
);

-- Create cloned VM table
CREATE TABLE cloned_vms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lab_id INTEGER REFERENCES labs(id),
    user_id INTEGER REFERENCES users(id),
    group_id INTEGER REFERENCES groups(id),
    vm_id VARCHAR(100) UNIQUE NOT NULL,
    source_vm_id VARCHAR(100) NOT NULL
);

-- Create lab and group association table
CREATE TABLE lab_groups (
    id SERIAL PRIMARY KEY,
    lab_id INTEGER REFERENCES labs(id),
    group_id INTEGER REFERENCES groups(id),
    UNIQUE (lab_id, group_id)
);