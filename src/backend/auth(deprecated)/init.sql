DROP TABLE IF EXISTS registered_users CASCADE;
DROP TABLE IF EXISTS admins CASCADE;


CREATE TABLE registered_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE admins (
    id SERIAL PRIMARY 
    email VARCHAR(50) NOT NULL
);


INSERT INTO admins (email) VALUES (
    'admin.test@gmail.com'
);
