-- Fix: status check constraint doesn't include 'Live' which all seed rows use
-- Run this FIRST, then re-run the V2 migration

ALTER TABLE vista_service_catalog DROP CONSTRAINT IF EXISTS vista_service_catalog_status_check;
ALTER TABLE vista_service_catalog ADD CHECK (status IN ('Active', 'Live', 'Coming Soon', 'In Development', 'Retired', 'Internal'));

-- If the table already partially loaded, update any existing rows
UPDATE vista_service_catalog SET status = 'Live' WHERE status = 'Active' AND build_phase = 'Phase 1A';
