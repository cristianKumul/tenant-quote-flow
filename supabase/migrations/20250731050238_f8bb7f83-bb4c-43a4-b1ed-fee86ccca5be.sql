-- Add total_paid field to quotes table to track cumulative payments
ALTER TABLE public.quotes 
ADD COLUMN total_paid NUMERIC NOT NULL DEFAULT 0;