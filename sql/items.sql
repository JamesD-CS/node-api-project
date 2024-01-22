USE node_project_db;
CREATE TABLE items (
	item_id INT NOT NULL AUTO_INCREMENT,
	item_name VARCHAR(50) NOT NULL,
	item_description VARCHAR(255) NOT NULL,
	price DECIMAL(15,2) NOT NULL,
	PRIMARY KEY (item_id)
	
);

INSERT INTO items(item_name, item_description, price) 
VALUES ("Burger", "A delicious juicy burger", 8.75);

INSERT INTO items(item_name, item_description, price) 
VALUES("Fries", "Golden crispy french fries", 3.75);