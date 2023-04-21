
CREATE TABLE if NOT EXISTS users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL,
    email char(60) NOT NULL
);

CREATE TABLE if NOT EXISTS user_to_game(
    username VARCHAR(50) PRIMARY KEY,
    game_id SMALLINT NOT NULL
);

CREATE TABLE IF NOT EXISTS games(
    game_id SERIAL PRIMARY KEY,
    score FLOAT,
    total_time FLOAT,
    num_correct INT
);
