CREATE TABLE user_groups (
  user_id INTEGER REFERENCES users (id) NOT NULL,
  group_id INTEGER REFERENCES groups (id) NOT NULL,
  PRIMARY KEY (user_id, group_id)
);
