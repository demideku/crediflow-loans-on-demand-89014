import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle, XCircle, ExternalLink, ArrowLeft, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminPayments = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          loan_applications (
            full_name,
            loan_amount
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ paymentId, status }: { paymentId: string; status: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("payments")
        .update({
          status,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(`Payment ${variables.status === "verified" ? "verified" : "rejected"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
    },
    onError: (error) => {
      toast.error("Failed to update payment: " + error.message);
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading payments...</div>;
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
      <Card>
        <CardHeader>
          <CardTitle>Payment Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments && payments.length > 0 ? (
                payments.map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.loan_applications?.full_name}</TableCell>
                    <TableCell>₦{Number(payment.loan_applications?.loan_amount).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">₦{Number(payment.amount_paid).toLocaleString()}</TableCell>
                    <TableCell>{format(new Date(payment.payment_date), "PP")}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === "verified"
                            ? "default"
                            : payment.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.payment_proof_url ? (
                        <a
                          href={payment.payment_proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">No proof</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {payment.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() =>
                              updatePaymentMutation.mutate({
                                paymentId: payment.id,
                                status: "verified",
                              })
                            }
                            disabled={updatePaymentMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              updatePaymentMutation.mutate({
                                paymentId: payment.id,
                                status: "rejected",
                              })
                            }
                            disabled={updatePaymentMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default AdminPayments;
