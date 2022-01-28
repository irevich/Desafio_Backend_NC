--Drop tables if exist

DROP TABLE IF EXISTS transaction;
DROP TABLE IF EXISTS payable;
DROP TABLE IF EXISTS status;
DROP TABLE IF EXISTS pay_method;

--Create tables

CREATE TABLE status(
  status_id serial PRIMARY KEY ,
  status_name text
);

CREATE TABLE pay_method(
  pay_method_id serial PRIMARY KEY ,
  pay_method_name text
);

CREATE TABLE payable(
  barcode text PRIMARY KEY,
  description text,
  due_date date,
  payment float,
  service text,
  status integer,
  FOREIGN KEY (status) REFERENCES status(status_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE transaction(
  barcode text PRIMARY KEY,
  card_number integer,
  payment float,
  creation_date date,
  pay_method integer,
  FOREIGN KEY (barcode) REFERENCES payable(barcode) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (pay_method) REFERENCES pay_method(pay_method_id) ON DELETE CASCADE ON UPDATE CASCADE
);

--Insert basic status and pay methods

INSERT INTO status (status_name) VALUES ('pending');
INSERT INTO status (status_name) VALUES ('paid');

INSERT INTO pay_method (pay_method_name) VALUES ('debit_card');
INSERT INTO pay_method (pay_method_name) VALUES ('credit_card');
INSERT INTO pay_method (pay_method_name) VALUES ('cash');

