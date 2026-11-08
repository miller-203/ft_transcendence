-- PostgreSQL runs files in this directory once, when it creates a new data volume.
-- Enable gen_random_uuid() for database-generated UUIDs in future models.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
