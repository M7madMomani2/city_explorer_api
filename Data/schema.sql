DROP TABLE IF EXISTS location ;

CREATE TABLE location (
    ID_LOCATION SERIAL PRIMARY KEY,
    search_query  varchar(2500),
    formatted_query  varchar(2500),
    latitude varchar(255),
    longitude varchar(255)
);