
INSERT INTO notes (id, name, folderId, content)
VALUES
  (1, 'Dogs', '1', 'lorem ipsum'),
  (2, 'Cats', '2', 'lorem ipsum'),
  (3, 'Pigs', '2', 'lorem ipsum'),
  (4, 'Birds', '1', 'lorem ipsum'),
  (5, 'Bears', '1', 'lorem ipsum'),
  (6, 'Horses', '2','lorem ipsum'),
  (7, 'Tigers', '3', 'lorem ipsum'),
  (8, 'Wolves', '3', 'lorem ipsum'),
  (9, 'Elephants', '2', 'lorem ipsum'),
  (10, 'Lions', '1','lorem ipsum'); 

  ALTER SEQUENCE notes RESTART WITH 11; 