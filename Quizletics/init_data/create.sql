CREATE TABLE if NOT EXISTS users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL,
    email char(60) NOT NULL,
    date_joined DATE
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

CREATE TABLE IF NOT EXISTS leaderboard AS
SELECT u.username, SUM(g.score) AS total_points
FROM users u
JOIN user_to_game utg ON u.username = utg.username
JOIN games g ON utg.game_id = g.game_id
GROUP BY u.username;
