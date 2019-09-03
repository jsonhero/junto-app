FROM library/postgres:11.5

COPY docker/init-sql.sql .

RUN cp init-sql.sql /docker-entrypoint-initdb.d/init-sql.sql