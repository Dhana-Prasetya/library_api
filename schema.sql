CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- for native uuid


CREATE TYPE role_enum AS ENUM ('user', 'admin');
CREATE TYPE genre_enum AS ENUM ('fiction', 'non-fiction');


CREATE TABLE users (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	fullname varchar(255) not NULL unique,
	email VARCHAR(255) NOT NULL unique,
	password VARCHAR(255) NOT NULL,
	role role_enum NOT null, -- contain 'user' and 'admin' role
	register_date timestamp with time zone default now()
);

CREATE TABLE books (
	id serial PRIMARY KEY,
	title varchar(500) not NULL unique,
	author varchar(255) not NULL,
	genre genre_enum NOT NULL,
	description text,
	quantity int NOT NULL check(quantity >= 0),
	borrowable boolean default true
)

CREATE TABLE books_borrowment (
	id serial PRIMARY KEY,
	book_id int NOT NULL REFERENCES books(id) ON DELETE cascade, -- not ideal, only for the requirenment
	user_id uuid NOT NULL REFERENCES users(id) ON DELETE cascade, -- not ideal, only for the requirenment
	borrowment_date timestamp with time zone default now(),
	returned_status boolean DEFAULT FALSE
)

-- function to prevent status change from true to false

CREATE OR REPLACE FUNCTION protect_boolean_state()
RETURNS TRIGGER AS $$
BEGIN
    -- Only run the check if updating
    IF (TG_OP = 'UPDATE') THEN
        IF OLD.returned_status = TRUE AND NEW.returned_status = FALSE THEN
            RAISE EXCEPTION 'CANNOT_REVERT_RETURNED_STATUS';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lock_state
BEFORE UPDATE ON books_borrowment
FOR EACH ROW
EXECUTE FUNCTION protect_boolean_state();




-- function to check the status
CREATE OR REPLACE FUNCTION check_book_return_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if there are records for this book where returned_status is false
    IF EXISTS (
        SELECT 1 FROM books_borrowment 
        WHERE book_id = OLD.id AND returned_status = FALSE
    ) THEN
        RAISE EXCEPTION 'Cannot delete book ID %: There are still unreturned copies.', OLD.id;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- attach the trigger to books table
CREATE TRIGGER trg_prevent_delete_unreturned_books
BEFORE DELETE ON books
FOR EACH ROW
EXECUTE FUNCTION check_book_return_status();
