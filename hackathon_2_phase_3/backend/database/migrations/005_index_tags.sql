-- Migration 005: Create GIN index on tags column
-- Phase 3 Enhancement: Fast tag queries

-- Create GIN index for efficient tag array queries
CREATE INDEX IF NOT EXISTS ix_task_tags_gin
ON task USING GIN (tags);

-- Verify the index was created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'task' AND indexname = 'ix_task_tags_gin';
