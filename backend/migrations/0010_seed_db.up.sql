INSERT INTO
  users (name, rfid)
VALUES
  ('Devesh Sharma', 'c3af7330'),
  ('Mayank', '83489034'),
  ('Amrinderdeep Singh Bhatt', '7264d730'),
  ('Sanya Srivastava', '49c3a79f'),
  ('Navkiran Kaur', 'f294118f'),
  ('Harjot Kaur', '34b9cb25'),
  ('Sahil Arora', '31bb494e');

INSERT INTO
  admins (username, password, rfid)
VALUES
  ('admin1', 'adminadmin', '23dc53f7'),
  ('admin2', 'adminadmin', '538950fa');

INSERT INTO
  groups (name, description)
VALUES
  ('D3 IT A', 'D3 IT A'),
  ('D3 CSE A', 'D3 CSE A');

INSERT INTO
  user_groups (user_id, group_id)
VALUES
  (1, 1),
  (2, 1),
  (3, 1),
  (4, 1),
  (5, 2),
  (6, 2),
  (7, 2);
