import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ArrowLeft, TrendingUp, DollarSign, User, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoanWithPayments {
  id: string;
  full_name: string;
  email: string;
  loan_amount: number;
  loan_type: string;
  status: string;
  created_at: string;
  payments: {
    id: string;
    amount_paid: number;
    payment_date: string;
    status: string;
  }[];
}

const AdminRepaymentTracking = () => {
  const navigate = useNavigate();

  const { data: loansWithPayments, isLoading } = useQuery({
    queryKey: ["admin-repayment-tracking"],
    queryFn: async () => {
      // Get all dispatched loans
      const { data: loans, error: loansError } = await supabase
        .from("loan_applications")
        .select("*")
        .eq("status", "dispatched")
        .order("created_at", { ascending: false });

      if (loansError) throw loansError;

      // Get all payments
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("status", "verified");

      if (paymentsError) throw paymentsError;

      // Combine loans with their payments
      const loansWithPaymentsData = loans?.map(loan => ({
        ...loan,
        payments: payments?.filter(p => p.loan_application_id === loan.id) || []
      })) || [];

      return loansWithPaymentsData as LoanWithPayments[];
    },
  });

  const calculateRepaymentStats = (loan: LoanWithPayments) => {
    const totalPaid = loan.payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
    const loanAmount = Number(loan.loan_amount);
    // Assuming 10% interest for calculation (adjust as needed)
    const totalDue = loanAmount * 1.1;
    const percentage = Math.min((totalPaid / totalDue) * 100, 100);
    const remaining = Math.max(totalDue - totalPaid, 0);
    
    return { totalPaid, totalDue, percentage, remaining };
  };

  const getRepaymentStatus = (percentage: number) => {
    if (percentage >= 100) return { label: "Completed", variant: "default" as const, icon: CheckCircle };
    if (percentage >= 50) return { label: "On Track", variant: "secondary" as const, icon: Clock };
    return { label: "In Progress", variant: "outline" as const, icon: AlertCircle };
  };

  if (isLoading) {
    return <div className="p-8">Loading repayment data...</div>;
  }

  // Calculate summary stats
  const totalLoans = loansWithPayments?.length || 0;
  const totalDisbursed = loansWithPayments?.reduce((sum, l) => sum + Number(l.loan_amount), 0) || 0;
  const totalCollected = loansWithPayments?.reduce((sum, l) => {
    return sum + l.payments.reduce((pSum, p) => pSum + Number(p.amount_paid), 0);
  }, 0) || 0;
  const fullyRepaid = loansWithPayments?.filter(l => {
    const stats = calculateRepaymentStats(l);
    return stats.percentage >= 100;
  }).length || 0;

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
          <h1 className="text-3xl font-bold mb-2">Repayment Tracking</h1>
          <p className="text-muted-foreground">Monitor loan repayments and collection progress</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Loans</CardDescription>
              <CardTitle className="text-3xl">{totalLoans}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Disbursed</CardDescription>
              <CardTitle className="text-3xl text-primary">₦{totalDisbursed.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Collected</CardDescription>
              <CardTitle className="text-3xl text-green-600">₦{totalCollected.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Fully Repaid</CardDescription>
              <CardTitle className="text-3xl">{fullyRepaid}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Loan Repayment Status
            </CardTitle>
            <CardDescription>
              Track repayment progress for all dispatched loans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Loan Amount</TableHead>
                  <TableHead>Total Due</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loansWithPayments && loansWithPayments.length > 0 ? (
                  loansWithPayments.map((loan) => {
                    const stats = calculateRepaymentStats(loan);
                    const repaymentStatus = getRepaymentStatus(stats.percentage);
                    const StatusIcon = repaymentStatus.icon;
                    
                    return (
                      <TableRow key={loan.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{loan.full_name}</p>
                              <p className="text-sm text-muted-foreground">{loan.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₦{Number(loan.loan_amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          ₦{stats.totalDue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          ₦{stats.totalPaid.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-orange-600 font-medium">
                          ₦{stats.remaining.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="w-32 space-y-1">
                            <Progress value={stats.percentage} className="h-2" />
                            <p className="text-xs text-muted-foreground text-center">
                              {stats.percentage.toFixed(1)}%
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={repaymentStatus.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {repaymentStatus.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No dispatched loans to track
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

export default AdminRepaymentTracking;
