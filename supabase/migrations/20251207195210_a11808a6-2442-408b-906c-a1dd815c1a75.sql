-- Drop the existing check constraint and add new one with dispatched status
ALTER TABLE public.loan_applications DROP CONSTRAINT IF EXISTS loan_applications_status_check;

ALTER TABLE public.loan_applications 
ADD CONSTRAINT loan_applications_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'dispatched'));