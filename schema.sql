-- We'll add "drop table" commands up here if necessary down the road

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255), -- VARCHAR allows us to limit no. of chars in each field in row
  formatted_query VARCHAR(255),
  latitude NUMERIC (8,6), -- 8 is total no. of digits, 6 is no. of digits that come after the decimal point. The numbers you set here will accept less than the limit you set but not more
  longitude NUMERIC (9,8)
);

CREATE TABLE weathers ( -- By convention, tables are named in plural (their content is the singular version of the same word) and always lowercase or snake_case; no caps or kebab-case.
  id SERIAL PRIMARY KEY,
  forecast VARCHAR(255),
  time VARCHAR(255),
  location_id INTEGER NOT NULL,
  FOREIGN KEY (location_id) REFERENCES locations (id)
);