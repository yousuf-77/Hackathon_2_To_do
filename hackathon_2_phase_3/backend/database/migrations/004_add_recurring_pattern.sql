-- Migration 004: Add recurring_pattern column to task table
-- Phase 3 Enhancement: Add recurring task support

-- Add recurring_pattern column as JSONB (nullable for backward compatibility)
ALTER TABLE task
ADD COLUMN IF NOT EXISTS recurring_pattern JSONB;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'task' AND column_name = 'recurring_pattern';
