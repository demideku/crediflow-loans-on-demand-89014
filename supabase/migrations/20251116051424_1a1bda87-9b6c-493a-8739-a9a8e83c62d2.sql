-- Add payment_type column to loan_applications table
ALTER TABLE loan_applications 
ADD COLUMN payment_type TEXT DEFAULT 'installment' CHECK (payment_type IN ('installment', 'full'));

COMMENT ON COLUMN loan_applications.payment_type IS 'Type of payment: installment (quarterly) or full (lump sum)';
