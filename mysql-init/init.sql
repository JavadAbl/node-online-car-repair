-- Create the additional databases
CREATE DATABASE IF NOT EXISTS vehicle_db;
CREATE DATABASE IF NOT EXISTS factor_db;
CREATE DATABASE IF NOT EXISTS customers_db;
CREATE DATABASE IF NOT EXISTS notifications_db;
CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS service_db;

-- (Optional) Create a user and grant access to all specific databases
CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'app_password';
GRANT ALL PRIVILEGES ON vehicle_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON factor_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON customers_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON notifications_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON auth_db.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON service_db.* TO 'admin'@'%';

-- Apply changes
FLUSH PRIVILEGES;
