WITH app_tables AS (
    SELECT c.oid, c.relname, c.relkind, c.relrowsecurity, c.relforcerowsecurity
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm', 'f', 'S')
        AND c.relname NOT IN ('_prisma_migrations', 'goose_db_version', 'goose_db_version_id_seq')
), definitions AS (
    SELECT jsonb_build_array('relation', relname, relkind, relrowsecurity, relforcerowsecurity)::text AS line
    FROM app_tables
    UNION ALL
    SELECT jsonb_build_array('column', t.relname, a.attname,
        pg_catalog.format_type(a.atttypid, a.atttypmod), a.attnotnull,
        pg_catalog.pg_get_expr(d.adbin, d.adrelid), a.attidentity, a.attgenerated)::text
    FROM app_tables t
    JOIN pg_catalog.pg_attribute a ON a.attrelid = t.oid
    LEFT JOIN pg_catalog.pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
    WHERE a.attnum > 0 AND NOT a.attisdropped
    UNION ALL
    SELECT jsonb_build_array('constraint', t.relname, c.conname,
        pg_catalog.pg_get_constraintdef(c.oid), c.convalidated)::text
    FROM app_tables t JOIN pg_catalog.pg_constraint c ON c.conrelid = t.oid
    UNION ALL
    SELECT jsonb_build_array('index', t.relname,
        pg_catalog.pg_get_indexdef(i.indexrelid), i.indisvalid)::text
    FROM app_tables t JOIN pg_catalog.pg_index i ON i.indrelid = t.oid
    UNION ALL
    SELECT jsonb_build_array('enum', t.typname, jsonb_agg(e.enumlabel ORDER BY e.enumsortorder))::text
    FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    JOIN pg_catalog.pg_enum e ON e.enumtypid = t.oid
    WHERE n.nspname = 'public'
    GROUP BY t.typname
)
SELECT encode(sha256(convert_to(COALESCE(string_agg(line, E'\n' ORDER BY line COLLATE "C"), ''), 'UTF8')), 'hex')
FROM definitions;
