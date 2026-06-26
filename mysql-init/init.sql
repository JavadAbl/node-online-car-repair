-- Create the additional databases
CREATE DATABASE IF NOT EXISTS vehicle_db;
CREATE DATABASE IF NOT EXISTS factor_db;
CREATE DATABASE IF NOT EXISTS customers_db;
CREATE DATABASE IF NOT EXISTS notifications_db;
CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS product_db;

-- (Optional) Create a user and grant access to all specific databases
CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'app_password';
GRANT ALL PRIVILEGES ON vehicle_db.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON factor_db.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON customers_db.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON notifications_db.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON auth_db.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON product_db.* TO 'app_user'@'%';

-- Apply changes
FLUSH PRIVILEGES;
