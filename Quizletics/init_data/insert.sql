--for testing purposes--
 insert into users (username, password, email, avatar_picture, date_joined) values ('test','a','test@gmail.com', '../resources/icons-i--mg/logo.svg', '2023-05-01T00:00:00.000Z');
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
VALUES ('TheChosenOne', 23000),
       ('DeathBlade', 12000),
       ('anpf3183', 40500),
       ('madelynpolly', 42000),
       ('SonicSpeed', 27000),
       ('SoulReaper', 15000),
       ('Auden', 39000),
       ('EagleEye', 17000),
       ('ShadowRunner', 21000),
       ('FlameThrower', 29000),
       ('Temmarin', 44000),
       ('enma9542', 39000),
       ('DragonMaster', 24000),
       ('ThePunisher', 18000),
       ('Thunderbolt', 32000),
       ('IronFist', 27000),
       ('BlazeFire', 20000),
       ('Wian6999', 42000),
       ('NightFury', 36000),
       ('StarGazer', 28000),
       ('StormBringer', 23000),
       ('VenomStrike', 25000),
       ('TheGuardian', 29000),
       ('WarriorPrincess', 33000),
       ('NinjaAssassin', 19000),
       ('ShadowAssault', 15000);
