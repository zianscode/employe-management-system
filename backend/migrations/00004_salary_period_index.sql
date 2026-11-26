-- +goose Up
CREATE INDEX "Salary_period_idx" ON public."Salary" ("periodYear", "periodMonth");

-- +goose Down
-- +goose StatementBegin
DO $$ BEGIN RAISE EXCEPTION 'Rollback the application with the additive payroll index in place'; END $$;
-- +goose StatementEnd
