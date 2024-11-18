Create Table USERS (
	user_id VARCHAR(100) Primary key,
	username VARCHAR(100),
	password VARCHAR(100),
	user_email VARCHAR(100),
	user_age INT
);

Create table PARTS (
	part_id VARCHAR(100),
	part_color  VARCHAR(100),
	part_name VARCHAR(100),
	part_png VARCHAR(255),
	part_dimensions VARCHAR(255),
	PRIMARY KEY(part_id, part_color)
	);

Create Table BUILDS (
	build_id VARCHAR(100) Primary Key,
	build_name VARCHAR(100),
	build_png VARCHAR(100), 
	build_link VARCHAR(255),
	build_age_rating INTEGER,
	build_rating DECIMAL(4, 2),
	build_release_year VARCHAR(10)
	);

Create Table THEMES (
	theme_id VARCHAR(100) Primary Key,
	theme_name VARCHAR(100),
	theme_description VARCHAR(1000),
	popular_build_id_1 VARCHAR(100),
	popular_build_id_2 VARCHAR(100),
	popular_build_id_3 VARCHAR(100),
	FOREIGN KEY (popular_build_id_1) REFERENCES BUILDS(build_id),
	FOREIGN KEY (popular_build_id_2) REFERENCES BUILDS(build_id),
	FOREIGN KEY (popular_build_id_3) REFERENCES BUILDS(build_id)
);

Create Table SUPPLIERS (
	supplier_id VARCHAR(100) Primary Key,
	supplier_name VARCHAR(100),
	supplier_region VARCHAR(100)
);

Create Table INVENTORY (
	user_id VARCHAR(100),
	part_id VARCHAR(100),
	part_color VARCHAR(100),
	part_quantity INTEGER,
	PRIMARY KEY(user_id, part_id, part_color),
	FOREIGN KEY (user_id) REFERENCES USERS(user_id),
	FOREIGN KEY (part_id, part_color) REFERENCES PARTS(part_id, part_color)
);

Create Table BUILD_DETAILS (
	build_id VARCHAR(100),
	part_id VARCHAR(100),
	part_color VARCHAR(100),
	part_quantity INTEGER,
	PRIMARY KEY(build_id, part_id, part_color),
	FOREIGN KEY (build_id) REFERENCES BUILDS(build_id),
	FOREIGN KEY (part_id, part_color) REFERENCES PARTS(part_id, part_color)
);

Create Table FAVORITES(
	user_id VARCHAR(100),
	part_id VARCHAR(100),
	part_color VARCHAR(100),
	PRIMARY KEY(user_id, part_id, part_color),
	FOREIGN KEY (user_id) REFERENCES USERS(user_id),
	FOREIGN KEY (part_id, part_color) REFERENCES PARTS(part_id, part_color)
);

Create Table REVIEWS(
	user_id VARCHAR(100),
	build_id VARCHAR(100),
	review_text VARCHAR(1000),
	PRIMARY KEY(user_id),
	FOREIGN KEY (user_id) REFERENCES USERS(user_id),
	FOREIGN KEY (build_id) REFERENCES BUILDS(build_id)
);

Create Table BUILD_PRICING (
	supplier_id VARCHAR(100),
	build_id VARCHAR(100),
	PRIMARY KEY(supplier_id, build_id),
	FOREIGN KEY (build_id) REFERENCES BUILDS(build_id),
	FOREIGN KEY (supplier_id) REFERENCES SUPPLIERS(supplier_id),
	build_price DECIMAL(6, 2)
);

Create Table PART_PRICING (
	supplier_id VARCHAR(100),
	part_id VARCHAR(100),
	part_color VARCHAR(100),
	PRIMARY KEY(supplier_id, part_id, part_color),
	FOREIGN KEY (part_id, part_color) REFERENCES PARTS(part_id, part_color),
	FOREIGN KEY (supplier_id) REFERENCES SUPPLIERS(supplier_id),
	part_price DECIMAL(6, 2)
);

Create Table BUILD_HAS_THEME (
	theme_id VARCHAR(100),
	build_id VARCHAR(100),
	PRIMARY KEY(theme_id, build_id),
	FOREIGN KEY (theme_id) REFERENCES THEMES(theme_id),
	FOREIGN KEY (build_id) REFERENCES BUILDS(build_id)
);

select * from parts WHERE (part_dimensions LIKE "(%") ;

describe build_has_theme;

select * from themes;

INSERT INTO build_has_theme VALUES("756", "001-1");

SET FOREIGN_KEY_CHECKS = 1; 

TRUNCATE TABLE parts;

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/build_has_theme.csv' IGNORE 
INTO TABLE build_has_theme
FIELDS TERMINATED BY ',' 
LINES TERMINATED BY '\n'
IGNORE 1 LINES;

SHOW VARIABLES LIKE "secure_file_priv";





