INSERT INTO "users" ("id", "email", "username", "password", "eth_wallet_addresses", "role", "new", "created_at", "updated_at") VALUES
(1,	NULL,	'toshsan',	'$2b$10$WVciWWFJH5XukNjKBXgNvuuyrjxi8KJRo/GySSAcBIPX5mGH8iNQe',	NULL,	NULL,	'0',	NOW(),	NOW()),
(2, NULL,   'testuser', '$2b$10$WVciWWFJH5XukNjKBXgNvuuyrjxi8KJRo/GySSAcBIPX5mGH8iNQf', NULL,   NULL,   '0',    NOW(),  NOW());


INSERT INTO "villages" ("id", "name", "population", "x", "y", "ethWalletAddress", "created_at", "updated_at", "user_id") VALUES
(1, 'test',     0,  0,  0,  NULL,   NOW(),  NOW(),  1),
(2, 'village',  0,  1,  1,  NULL,   NOW(),  NOW(),  2);

INSERT INTO "villages_resource_types" ("id", "village_id", "resource_type_id", "count", "created_at", "updated_at") VALUES
(1,	1,	1,	100,	NOW(),	NOW()),
(2,	1,	2,	100,	NOW(),	NOW()),
(3,	1,	3,	100,	NOW(),	NOW()),
(4,	2,	1,	100,	NOW(),	NOW()),
(5,	2,	2,	100,	NOW(),	NOW()),
(6,	2,	3,	100,	NOW(),	NOW());