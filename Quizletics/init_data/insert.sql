--for testing purposes--
-- insert into users (username, password, email, avatar_picture, date_joined) values ('test','a','test@gmail.com', '../resources/icons-img/logo.svg', '2023-05-01T00:00:00.000Z');

-- insert into games (game_id, score, time_taken, num_correct, difficulty, category) values (5, 152, 20, 7, 1, 'sports');
-- insert into games (game_id, score, time_taken, num_correct, difficulty, category) values (6, 300, 12, 9, 2, 'sports');
-- insert into games (game_id, score, time_taken, num_correct, difficulty, category) values (7, 103, 29, 5, 0, 'sports');
-- insert into games (game_id, score, time_taken, num_correct, difficulty, category) values (8, 400, 11, 10, 2, 'sports');
-- insert into games (game_id, score, time_taken, num_correct, difficulty, category) values (9, 600, 11, 10, 2, 'sports');

-- insert into user_to_game (username, game_id) values ('test', 5);
-- insert into user_to_game (username, game_id) values ('test', 6);
-- insert into user_to_game (username, game_id) values ('test', 7);
-- insert into user_to_game (username, game_id) values ('test', 8);
-- insert into user_to_game (username, game_id) values ('test', 9);


--leaderboard dummy data--
INSERT INTO leaderboard (username, total_points)
VALUES ('Auden', 23000),
       ('Temmarin', 12000),
       ('anpf3183', 34000),
       ('madelynpolly', 42000),
       ('enma9542', 27000),
       ('Wian6999', 15000),
       ('TheChosenOne', 39000),
       ('EagleEye', 17000),
       ('ShadowRunner', 21000),
       ('FlameThrower', 29000),
       ('DeathBlade', 44000),
       ('SonicSpeed', 38000),
       ('DragonMaster', 24000),
       ('ThePunisher', 18000),
       ('Thunderbolt', 32000),
       ('IronFist', 27000),
       ('BlazeFire', 20000),
       ('SoulReaper', 42000),
       ('NightFury', 36000),
       ('StarGazer', 28000),
       ('StormBringer', 23000),
       ('VenomStrike', 25000),
       ('TheGuardian', 29000),
       ('WarriorPrincess', 33000),
       ('NinjaAssassin', 19000),
       ('ShadowAssault', 15000);
