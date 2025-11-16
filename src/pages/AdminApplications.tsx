import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, ArrowLeft, CheckCircle, XCircle, Clock, FileText, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LoanApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  loan_type: string;
  loan_amount: number;
  employment_status: string;
  monthly_income: number;
  status: string;
  created_at: string;
  proof_of_identity_url: string | null;
  proof_of_salary_url: string | null;
}

const AdminApplications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    setIsAdmin(true);
    fetchApplications();
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
    } else {
      setApplications(data || []);
    }
    setIsLoading(false);
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('loan_applications')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Application ${status}`,
      });
      fetchApplications();
    }
  };

  const viewDocument = async (url: string | null) => {
    if (!url) {
      toast({
        title: "No Document",
        description: "This document has not been uploaded yet",
        variant: "destructive",
      });
      return;
    }

    // Extract the file path from the full URL
    // URL format: https://.../storage/v1/object/public/loan-documents/{path}
    const bucketPath = url.split('/loan-documents/')[1];
    
    if (!bucketPath) {
      toast({
        title: "Error",
        description: "Invalid document URL",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase.storage
      .from('loan-documents')
      .createSignedUrl(bucketPath, 3600); // 1 hour expiry

    if (error || !data) {
      toast({
        title: "Error",
        description: "Failed to load document",
        variant: "destructive",
      });
      return;
    }

    window.open(data.signedUrl, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <nav className="bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CrediFlow Admin
              </span>
            </div>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="text-3xl">Loan Applications</CardTitle>
            <CardDescription>
              Manage and review all loan applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No applications yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Loan Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Income</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.full_name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{app.email}</div>
                            <div className="text-muted-foreground">{app.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{app.loan_type}</TableCell>
                        <TableCell className="font-semibold">₦{app.loan_amount.toLocaleString()}</TableCell>
                        <TableCell>₦{app.monthly_income.toLocaleString()}/mo</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewDocument(app.proof_of_identity_url)}
                              className="gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              ID
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewDocument(app.proof_of_salary_url)}
                              className="gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Income
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(app.created_at).toLocaleDateString('en-NG')}</TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>
                          <Select
                            value={app.status}
                            onValueChange={(value) => updateApplicationStatus(app.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approve</SelectItem>
                              <SelectItem value="rejected">Reject</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminApplications;
