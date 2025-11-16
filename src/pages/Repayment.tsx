import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, DollarSign } from "lucide-react";

interface LoanApplication {
  id: string;
  full_name: string;
  loan_amount: number;
  loan_type: string;
  loan_purpose: string;
  status: string;
  created_at: string;
  monthly_income: number;
  payment_type: string;
}

interface PaymentSchedule {
  period: number;
  dueDate: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

const Repayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<PaymentSchedule[]>([]);

  const INTEREST_RATE = 15; // 15% annual interest rate

  useEffect(() => {
    checkAuthAndFetchApplication();
  }, [id]);

  const checkAuthAndFetchApplication = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    fetchApplication(session.user.id);
  };

  const fetchApplication = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      setApplication(data);
      if (data) {
        generateRepaymentSchedule(data);
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      toast({
        title: "Error",
        description: "Failed to load repayment details",
        variant: "destructive",
      });
      navigate('/my-applications');
    } finally {
      setLoading(false);
    }
  };

  const generateRepaymentSchedule = (app: LoanApplication) => {
    const loanAmount = app.loan_amount;
    const quarterlyRate = INTEREST_RATE / 100 / 4; // Quarterly interest rate
    
    // For full payment, show single payment with total interest
    if (app.payment_type === 'full') {
      // Calculate total interest for full repayment
      // Determine number of months based on loan type
      let numMonths = 12;
      if (app.loan_type === 'salary') numMonths = 12;
      else if (app.loan_type === 'business') numMonths = 24;
      else if (app.loan_type === 'mortgage') numMonths = 60;
      
      const totalInterest = loanAmount * (INTEREST_RATE / 100) * (numMonths / 12);
      const totalPayment = loanAmount + totalInterest;
      
      // Due date is 1 month after application
      const dueDate = new Date(app.created_at);
      dueDate.setMonth(dueDate.getMonth() + 1);
      
      setSchedule([{
        period: 1,
        dueDate: dueDate.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }),
        payment: totalPayment,
        principal: loanAmount,
        interest: totalInterest,
        balance: 0
      }]);
      return;
    }
    
    // For installment payment, calculate quarterly schedule
    // Determine number of quarters based on loan type
    let numMonths = 12; // Default
    if (app.loan_type === 'salary') numMonths = 12;
    else if (app.loan_type === 'business') numMonths = 24;
    else if (app.loan_type === 'mortgage') numMonths = 60;
    
    const numQuarters = Math.ceil(numMonths / 3);
    
    // Calculate quarterly payment using amortization formula
    const quarterlyPayment = (loanAmount * quarterlyRate * Math.pow(1 + quarterlyRate, numQuarters)) / 
                            (Math.pow(1 + quarterlyRate, numQuarters) - 1);

    let balance = loanAmount;
    const scheduleData: PaymentSchedule[] = [];
    const startDate = new Date(app.created_at);

    for (let i = 1; i <= numQuarters; i++) {
      const interestPayment = balance * quarterlyRate;
      const principalPayment = quarterlyPayment - interestPayment;
      balance -= principalPayment;

      // Calculate due date (add 3 months for each quarter)
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + (i * 3));

      scheduleData.push({
        period: i,
        dueDate: dueDate.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }),
        payment: quarterlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });
    }

    setSchedule(scheduleData);
  };

  const getTotalRepayment = () => {
    return schedule.reduce((sum, item) => sum + item.payment, 0);
  };

  const getTotalInterest = () => {
    return schedule.reduce((sum, item) => sum + item.interest, 0);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16">
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Repayment Schedule
              </h1>
              <p className="text-lg text-muted-foreground">
                Your loan repayment details and schedule
              </p>
            </div>

            {/* Loan Summary */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardDescription>Loan Amount</CardDescription>
                  <CardTitle className="text-3xl">
                    ₦{application.loan_amount.toLocaleString()}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>Total Repayment</CardDescription>
                  <CardTitle className="text-3xl text-primary">
                    ₦{getTotalRepayment().toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>Total Interest</CardDescription>
                  <CardTitle className="text-3xl text-accent">
                    ₦{getTotalInterest().toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Loan Details */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Loan Type</p>
                    <p className="font-semibold capitalize">{application.loan_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Purpose</p>
                    <p className="font-semibold capitalize">{application.loan_purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge className="capitalize">{application.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Interest Rate</p>
                    <p className="font-semibold">{INTEREST_RATE}% per year</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Payment Type</p>
                    <Badge className="capitalize">
                      {application.payment_type === 'full' ? 'Full Payment (Lump Sum)' : 'Quarterly Installments'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Payment Frequency</p>
                    <p className="font-semibold">
                      {application.payment_type === 'full' ? 'One-time Payment' : 'Every 3 Months (Quarterly)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Number of Payments</p>
                    <p className="font-semibold">{schedule.length} payments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Payment Schedule
                </CardTitle>
                <CardDescription>
                  {application.payment_type === 'full' 
                    ? 'Your one-time payment details' 
                    : 'Your quarterly payment breakdown'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment #</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Payment</TableHead>
                        <TableHead className="text-right">Principal</TableHead>
                        <TableHead className="text-right">Interest</TableHead>
                        <TableHead className="text-right">Remaining Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedule.map((payment) => (
                        <TableRow key={payment.period}>
                          <TableCell className="font-medium">{payment.period}</TableCell>
                          <TableCell>{payment.dueDate}</TableCell>
                          <TableCell className="text-right font-semibold">
                            ₦{payment.payment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right">
                            ₦{payment.principal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right">
                            ₦{payment.interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right">
                            ₦{payment.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Payment Information</p>
                      <p className="text-muted-foreground">
                        {application.payment_type === 'full' 
                          ? 'This is a one-time lump sum payment that includes the principal amount plus accrued interest. Payment is due within one month of application approval.'
                          : 'Payments are due every 3 months. Each payment includes both principal and interest. Your remaining balance decreases with each payment until the loan is fully paid off.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Repayment;
