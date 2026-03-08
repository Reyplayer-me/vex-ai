ALTER TABLE public.validation_sessions 
ADD COLUMN build_plan_result jsonb DEFAULT NULL,
ADD COLUMN launch_strategy_result jsonb DEFAULT NULL;