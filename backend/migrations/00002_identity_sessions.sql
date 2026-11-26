-- +goose Up
CREATE TABLE public."EMSSession" (
    digest text PRIMARY KEY,
    "userId" text NOT NULL REFERENCES public."User"(id) ON DELETE CASCADE,
    "expiresAt" timestamp(3) NOT NULL
);
CREATE INDEX "EMSSession_userId_idx" ON public."EMSSession" ("userId");
CREATE INDEX "EMSSession_expiresAt_idx" ON public."EMSSession" ("expiresAt");

CREATE TABLE public."EMSRateLimit" (
    key text PRIMARY KEY,
    attempts integer NOT NULL,
    "expiresAt" timestamp(3) NOT NULL
);
CREATE INDEX "EMSRateLimit_expiresAt_idx" ON public."EMSRateLimit" ("expiresAt");

-- +goose Down
-- +goose StatementBegin
DO $$ BEGIN RAISE EXCEPTION 'Rollback the application with the additive identity tables in place'; END $$;
-- +goose StatementEnd
