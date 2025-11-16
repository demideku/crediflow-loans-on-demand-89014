-- Create RLS policy for admins to access loan documents
CREATE POLICY "Admins can view all loan documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'loan-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can download all loan documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'loan-documents'
  AND has_role(auth.uid(), 'admin'::app_role)
);