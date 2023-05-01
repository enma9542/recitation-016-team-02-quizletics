CREATE TABLE if NOT EXISTS users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL,
    email char(60) NOT NULL,
<<<<<<< HEAD
    date_joined DATE,
    avatar_picture char(60)
);
=======
    avatar_picture VARCHAR(255) NOT NULL,
    date_joined DATE
>>>>>>> 8532ff71bb478a145ee2c671a73f6882dc7efc92
);

CREATE TABLE if NOT EXISTS user_to_game(
    username VARCHAR(50) NOT NULL,
    game_id SMALLINT NOT NULL
);

CREATE TABLE IF NOT EXISTS games(
    game_id SERIAL PRIMARY KEY,
    score FLOAT,
    time_taken SMALLINT,
    num_correct SMALLINT,
    difficulty SMALLINT,
    category VARCHAR(50)
);
