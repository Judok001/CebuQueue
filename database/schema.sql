-- CebuQueue schema (MySQL 8+). Run: mysql -u root -p < database/schema.sql
CREATE DATABASE IF NOT EXISTS cebuqueue CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cebuqueue;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  role ENUM('admin','staff','patient') NOT NULL DEFAULT 'patient',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL UNIQUE,                       -- NULL for walk-ins registered by staff
  full_name VARCHAR(120) NOT NULL,
  birthdate DATE NULL,
  phone VARCHAR(20) NULL,
  address VARCHAR(255) NULL,
  priority_type ENUM('none','senior','pwd','pregnant','urgent') NOT NULL DEFAULT 'none',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (full_name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  code VARCHAR(4) NOT NULL UNIQUE,               -- ticket prefix, e.g. CHK -> CHK001
  avg_minutes INT NOT NULL DEFAULT 10,           -- used for estimated wait time
  active TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE queue_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  service_id INT NOT NULL,
  queue_date DATE NOT NULL,
  ticket_no INT NOT NULL,
  type ENUM('walk-in','appointment') NOT NULL,
  priority ENUM('normal','priority','urgent') NOT NULL DEFAULT 'normal',
  status ENUM('waiting','serving','done','no_show','cancelled') NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  called_at DATETIME NULL,
  finished_at DATETIME NULL,
  UNIQUE KEY uq_ticket (queue_date, service_id, ticket_no),
  INDEX idx_board (queue_date, service_id, status),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE sms_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  queue_entry_id INT NULL,
  phone VARCHAR(20) NOT NULL,
  message VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO services (name, code, avg_minutes) VALUES
  ('General Check-up', 'CHK', 10),
  ('Immunization', 'IMM', 5),
  ('Prenatal Care', 'PRE', 15);
