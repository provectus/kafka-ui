CREATE DATABASE test WITH OWNER = dev_user;
\connect test

CREATE TABLE activities
(
    id        INTEGER PRIMARY KEY,
    msg       varchar(24),
    action    varchar(128),
    browser   varchar(24),
    device    json,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

insert into activities(id, action, msg, browser, device)
values (1, 'LOGIN', 'Success', 'Chrome', '{
  "name": "Chrome",
  "major": "67",
  "version": "67.0.3396.99"
}'),
       (2, 'LOGIN', 'Failed', 'Apple WebKit', '{
         "name": "WebKit",
         "major": "605",
         "version": "605.1.15"
       }');