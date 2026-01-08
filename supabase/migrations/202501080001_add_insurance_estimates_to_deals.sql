alter table public.deals
  add column if not exists replacement_cost_override numeric,
  add column if not exists insurance_estimate_annual numeric,
  add column if not exists insurance_estimate_monthly numeric,
  add column if not exists insurance_estimate_inputs jsonb,
  add column if not exists insurance_estimate_updated_at timestamptz;
