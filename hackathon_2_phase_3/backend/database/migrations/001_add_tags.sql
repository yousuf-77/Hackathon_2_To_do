-- Migration 001: Add tags column to task table
-- Phase 3 Enhancement: Add task tagging support

-- Add tags column as TEXT array (nullable for backward compatibility)
ALTER TABLE task
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'task' AND column_name = 'tags';
