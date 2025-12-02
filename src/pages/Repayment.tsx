import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, DollarSign, Upload, CreditCard } from "lucide-react";
import { format } from "date-fns";

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

interface Payment {
  id: string;
  amount_paid: number;
  payment_date: string;
  status: string;
  payment_proof_url: string | null;
}

const Repayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<PaymentSchedule[]>([]);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);

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
    fetchPayments();
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

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("loan_application_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleSubmitPayment = async () => {
    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let proofFilePath = null;
      if (paymentProof) {
        const fileExt = paymentProof.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('loan-documents')
          .upload(filePath, paymentProof);

        if (uploadError) throw uploadError;

        // Store file path (not public URL) - signed URLs will be generated on-demand for viewing
        proofFilePath = filePath;
      }

      const { error } = await supabase.from("payments").insert({
        loan_application_id: id,
        user_id: user.id,
        amount_paid: parseFloat(amountPaid),
        payment_proof_url: proofFilePath,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment submitted successfully! Awaiting admin verification.",
      });

      setAmountPaid("");
      setPaymentProof(null);
      fetchPayments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to submit payment: " + error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const generateRepaymentSchedule = (app: LoanApplication) => {
    const loanAmount = app.loan_amount;
    const quarterlyRate = INTEREST_RATE / 100 / 4; // Quarterly interest rate
    
    // For full payment, show single payment with total interest
    if (app.payment_type === 'full') {
      let numMonths = 12;
      if (app.loan_type === 'salary') numMonths = 12;
      else if (app.loan_type === 'business') numMonths = 24;
      else if (app.loan_type === 'mortgage') numMonths = 60;
      
      const totalInterest = loanAmount * (INTEREST_RATE / 100) * (numMonths / 12);
      const totalPayment = loanAmount + totalInterest;
      
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
    let numMonths = 12;
    if (app.loan_type === 'salary') numMonths = 12;
    else if (app.loan_type === 'business') numMonths = 24;
    else if (app.loan_type === 'mortgage') numMonths = 60;
    
    const numQuarters = Math.ceil(numMonths / 3);
    const quarterlyPayment = (loanAmount * quarterlyRate * Math.pow(1 + quarterlyRate, numQuarters)) / 
                             (Math.pow(1 + quarterlyRate, numQuarters) - 1);
    
    const tempSchedule: PaymentSchedule[] = [];
    let remainingBalance = loanAmount;
    const startDate = new Date(app.created_at);
    
    for (let i = 1; i <= numQuarters; i++) {
      const interestPayment = remainingBalance * quarterlyRate;
      const principalPayment = quarterlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + (i * 3));
      
      tempSchedule.push({
        period: i,
        dueDate: dueDate.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }),
        payment: quarterlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, remainingBalance)
      });
    }
    
    setSchedule(tempSchedule);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const totalPayment = schedule.reduce((sum, item) => sum + item.payment, 0);
  const totalInterest = schedule.reduce((sum, item) => sum + item.interest, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Repayment Schedule</h1>
          <p className="text-muted-foreground">View your loan repayment details and schedule</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Loan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan Amount:</span>
                <span className="font-semibold">₦{application.loan_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan Type:</span>
                <Badge variant="outline">{application.loan_type}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Type:</span>
                <Badge variant="outline">
                  {application.payment_type === 'full' ? 'Full Payment' : 'Installments'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate:</span>
                <span className="font-semibold">{INTEREST_RATE}% per annum</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Repayment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Principal:</span>
                <span className="font-semibold">₦{application.loan_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Interest:</span>
                <span className="font-semibold text-yellow-600">₦{totalInterest.toLocaleString('en-NG', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-lg font-bold text-primary">₦{totalPayment.toLocaleString('en-NG', { maximumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payment Schedule
            </CardTitle>
            <CardDescription>
              {application.payment_type === 'full' 
                ? 'Single payment due in 1 month'
                : `Quarterly payments over ${schedule.length} quarters`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.map((item) => (
                  <TableRow key={item.period}>
                    <TableCell>{item.period}</TableCell>
                    <TableCell>{item.dueDate}</TableCell>
                    <TableCell className="font-semibold">₦{item.payment.toLocaleString('en-NG', { maximumFractionDigits: 2 })}</TableCell>
                    <TableCell>₦{item.principal.toLocaleString('en-NG', { maximumFractionDigits: 2 })}</TableCell>
                    <TableCell>₦{item.interest.toLocaleString('en-NG', { maximumFractionDigits: 2 })}</TableCell>
                    <TableCell>₦{item.balance.toLocaleString('en-NG', { maximumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Bank Details & Payment Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Make Payment
            </CardTitle>
            <CardDescription>
              Transfer to the account below and upload proof of payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bank Details */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h3 className="font-semibold text-sm">Bank Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Bank Name:</span>
                  <p className="font-medium">FCMB</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Account Number:</span>
                  <p className="font-medium">1006748865</p>
                </div>
              </div>
            </div>

            {/* Payment Upload Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount Paid (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount paid"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="proof">Payment Proof (Optional)</Label>
                <Input
                  id="proof"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                />
              </div>
              <Button
                onClick={handleSubmitPayment}
                disabled={uploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Submitting..." : "Submit Payment"}
              </Button>
            </div>

            {/* Payment History */}
            {payments && payments.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Payment History</h3>
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">₦{Number(payment.amount_paid).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.payment_date), "PPP")}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            payment.status === "verified"
                              ? "bg-green-100 text-green-700"
                              : payment.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                      {payment.payment_proof_url && (
                        <a
                          href={payment.payment_proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mt-2 inline-block"
                        >
                          View Proof
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Repayment;
