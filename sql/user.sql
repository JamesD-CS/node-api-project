USE node_project_db;
DROP TABLE IF EXISTS users;
CREATE TABLE users (
	user_id INT NOT NULL AUTO_INCREMENT,
	first_name VARCHAR(20) NOT NULL,
	last_name VARCHAR(20) NOT NULL,
	email VARCHAR(20) NOT NULL,
	phone VARCHAR(20) NOT NULL,
	user_pass VARCHAR(100) NOT NULL,
	PRIMARY KEY (user_id),
	UNIQUE (email),
	UNIQUE (phone)

);