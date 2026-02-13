-- Migration 003: Add priority column to task table
-- Phase 3 Enhancement: Add priority level support (low/medium/high)

-- Add priority column with default 'medium' (for backward compatibility)
ALTER TABLE task
ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'medium';

-- Update existing rows to have 'medium' priority if NULL
UPDATE task
SET priority = 'medium'
WHERE priority IS NULL;

-- Set NOT NULL constraint after updating existing rows
ALTER TABLE task
ALTER COLUMN priority SET NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'task' AND column_name = 'priority';
