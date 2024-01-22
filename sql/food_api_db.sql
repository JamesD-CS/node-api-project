USE node_project_db;
DROP TABLE IF EXISTS items;
CREATE TABLE items (
	item_id INT NOT NULL AUTO_INCREMENT,
	item_name VARCHAR(100) NOT NULL,
	item_description VARCHAR(255) NOT NULL,
	price DECIMAL(15,2) NOT NULL,
	PRIMARY KEY (item_id)
	
);

INSERT INTO items(item_name, item_description, price) 
VALUES ("Burger", "A delicious juicy burger", 8.75);

INSERT INTO items(item_name, item_description, price) 
VALUES("Fries", "Golden crispy french fries", 3.75);

INSERT INTO items(item_name, item_description, price) 
VALUES("Pizza", "Cheese Pizza", 4.75);

DROP TABLE IF EXISTS users;
CREATE TABLE users (
	user_id INT NOT NULL AUTO_INCREMENT,
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
	email VARCHAR(100) NOT NULL,
	phone VARCHAR(100) NOT NULL,
	user_pass VARCHAR(100) NOT NULL,
	PRIMARY KEY (user_id),
	UNIQUE (email),
	UNIQUE (phone)

);


DROP TABLE IF EXISTS orders;
CREATE TABLE orders(
	order_id INT NOT NULL AUTO_INCREMENT,
	email VARCHAR(100) NOT NULL,
	order_date DATETIME,
	order_status VARCHAR(100),
	order_total DECIMAL(15,2),
	PRIMARY KEY (order_id)
	);

DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items
	(
	order_item_id INT NOT NULL AUTO_INCREMENT,
    order_id INT,
    item_id INT,
	quantity INT,
	PRIMARY KEY (order_item_id)
	);


ALTER TABLE orders ADD FOREIGN KEY (email) REFERENCES users (email) ON DELETE CASCADE;
ALTER TABLE order_items ADD FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE;
ALTER TABLE order_items ADD FOREIGN KEY (item_id) REFERENCES items (item_id) ON DELETE CASCADE;



	