-- Migration 002: Add due_date column to task table
-- Phase 3 Enhancement: Add due date support with browser notifications

-- Add due_date column as TIMESTAMPTZ (nullable for backward compatibility)
ALTER TABLE task
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'task' AND column_name = 'due_date';
