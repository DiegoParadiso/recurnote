-- Enable RLS on tables
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "items" ENABLE ROW LEVEL SECURITY;

-- Create RLS role if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'app_rls_user') THEN

      CREATE ROLE app_rls_user NOLOGIN;
   END IF;
END
$do$;

-- Grant app_rls_user to the current user so we can SET ROLE
DO
$do$
BEGIN
   EXECUTE format('GRANT app_rls_user TO %I', current_user);
END
$do$;

-- Grant permissions to the RLS role
GRANT ALL ON "Users" TO app_rls_user;
GRANT ALL ON "items" TO app_rls_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_rls_user;

-- Create policies for Users table
DROP POLICY IF EXISTS "Users can view their own data" ON "Users";
CREATE POLICY "Users can view their own data" ON "Users"
    FOR SELECT
    TO app_rls_user
    USING (id = current_setting('app.current_user_id', true)::integer);

DROP POLICY IF EXISTS "Users can update their own data" ON "Users";
CREATE POLICY "Users can update their own data" ON "Users"
    FOR UPDATE
    TO app_rls_user
    USING (id = current_setting('app.current_user_id', true)::integer);

-- Create policies for Items table
DROP POLICY IF EXISTS "Users can view their own items" ON "items";
CREATE POLICY "Users can view their own items" ON "items"
    FOR SELECT
    TO app_rls_user
    USING (user_id = current_setting('app.current_user_id', true)::integer);

DROP POLICY IF EXISTS "Users can insert their own items" ON "items";
CREATE POLICY "Users can insert their own items" ON "items"
    FOR INSERT
    TO app_rls_user
    WITH CHECK (user_id = current_setting('app.current_user_id', true)::integer);

DROP POLICY IF EXISTS "Users can update their own items" ON "items";
CREATE POLICY "Users can update their own items" ON "items"
    FOR UPDATE
    TO app_rls_user
    USING (user_id = current_setting('app.current_user_id', true)::integer);

DROP POLICY IF EXISTS "Users can delete their own items" ON "items";
CREATE POLICY "Users can delete their own items" ON "items"
    FOR DELETE
    TO app_rls_user
    USING (user_id = current_setting('app.current_user_id', true)::integer);
