-- +goose Up
CREATE TABLE public."EMSNotificationOutbox" (
    id text PRIMARY KEY,
    kind text NOT NULL,
    payload jsonb NOT NULL,
    attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    "availableAt" timestamp(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
    "leaseUntil" timestamp(3),
    "leaseToken" text,
    "deliveredAt" timestamp(3),
    "failedAt" timestamp(3)
);
CREATE INDEX "EMSNotificationOutbox_pending_idx"
    ON public."EMSNotificationOutbox" ("availableAt", id)
    WHERE "deliveredAt" IS NULL AND "failedAt" IS NULL;

-- +goose Down
-- +goose StatementBegin
DO $$ BEGIN RAISE EXCEPTION 'Rollback the application with the additive notification outbox in place'; END $$;
-- +goose StatementEnd
