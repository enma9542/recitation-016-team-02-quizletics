DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_to_game CASCADE;
DROP TABLE IF EXISTS games CASCADE;

CREATE TABLE users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL,
    email char(60) NOT NULL
);

CREATE TABLE user_to_game(
    username VARCHAR(50) PRIMARY KEY,
    game_id SMALLINT NOT NULL
);

CREATE TABLE games(
    game_id SERIAL PRIMARY KEY,
    score FLOAT,
    total_time FLOAT
);
