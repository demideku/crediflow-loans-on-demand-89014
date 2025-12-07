import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, TrendingUp, Send, User, Banknote, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LoanApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  bvn: string;
  bank_name: string | null;
  account_number: string | null;
  loan_amount: number;
  loan_type: string;
  loan_purpose: string;
  employment_status: string;
  monthly_income: number;
  payment_type: string | null;
  status: string;
  created_at: string;
}

const AdminLoanDispatch = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: applications, isLoading } = useQuery({
    queryKey: ["admin-approved-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loan_applications")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LoanApplication[];
    },
  });

  const dispatchMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from("loan_applications")
        .update({ status: "dispatched" })
        .eq("id", applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Loan dispatched successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-approved-applications"] });
      setDetailsOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to dispatch loan: " + error.message);
    },
  });

  const viewDetails = (application: LoanApplication) => {
    setSelectedApplication(application);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return <div className="p-8">Loading applications...</div>;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Loan Dispatch</h1>
          <p className="text-muted-foreground">View user account details and dispatch approved loans</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Approved Loans Ready for Dispatch
            </CardTitle>
            <CardDescription>
              Review user banking details and dispatch funds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Bank Details</TableHead>
                  <TableHead>Loan Amount</TableHead>
                  <TableHead>Loan Type</TableHead>
                  <TableHead>Date Approved</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications && applications.length > 0 ? (
                  applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{application.full_name}</p>
                            <p className="text-sm text-muted-foreground">{application.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{application.bank_name || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">{application.account_number || "N/A"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        ₦{Number(application.loan_amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{application.loan_type}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(application.created_at), "PP")}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewDetails(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => dispatchMutation.mutate(application.id)}
                            disabled={dispatchMutation.isPending}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Dispatch
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No approved loans pending dispatch
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Account Details</DialogTitle>
            <DialogDescription>
              Complete information for loan dispatch
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedApplication.full_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedApplication.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedApplication.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{format(new Date(selectedApplication.date_of_birth), "PP")}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedApplication.address}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Banking Information</h4>
                <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Bank Name</p>
                    <p className="font-medium text-lg">{selectedApplication.bank_name || "Not provided"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Account Number</p>
                    <p className="font-medium text-lg">{selectedApplication.account_number || "Not provided"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">BVN</p>
                    <p className="font-medium">{selectedApplication.bvn}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Loan Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Loan Amount</p>
                    <p className="font-medium text-xl text-primary">₦{Number(selectedApplication.loan_amount).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Loan Type</p>
                    <p className="font-medium">{selectedApplication.loan_type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Loan Purpose</p>
                    <p className="font-medium">{selectedApplication.loan_purpose}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Payment Type</p>
                    <p className="font-medium capitalize">{selectedApplication.payment_type || "Installment"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Employment Status</p>
                    <p className="font-medium">{selectedApplication.employment_status}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Monthly Income</p>
                    <p className="font-medium">₦{Number(selectedApplication.monthly_income).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => dispatchMutation.mutate(selectedApplication.id)}
                  disabled={dispatchMutation.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Dispatch Loan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLoanDispatch;
