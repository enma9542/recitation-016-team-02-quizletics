--for testing purposes--
insert into users (username, password, email) values ('mapo7968','a','a');

insert into games (game_id, score, time_taken, num_correct, difficulty, category) values (1, 152, 20, 7, 1, 'sports');
insert into games (game_id, score, time_taken, num_correct, difficulty, category) values (2, 300, 12, 9, 2, 'sports');
insert into games (game_id, score, time_taken, num_correct, difficulty, category) values (3, 103, 29, 5, 0, 'sports');
insert into games (game_id, score, time_taken, num_correct, difficulty, category) values (4, 400, 11, 10, 2, 'sports');

insert into user_to_game (username, game_id) values ('mapo7968', 1);
insert into user_to_game (username, game_id) values ('mapo7968', 2);
insert into user_to_game (username, game_id) values ('mapo7968', 3);
insert into user_to_game (username, game_id) values ('mapo7968', 4);


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
