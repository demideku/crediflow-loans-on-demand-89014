import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const loanApplicationSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(11, "Phone must be at least 11 digits").max(15),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().trim().min(1, "Address is required").max(500),
  loanType: z.string().min(1, "Loan type is required"),
  loanAmount: z.number().min(50000, "Minimum ₦50,000").max(5000000, "Maximum ₦5,000,000"),
  loanPurpose: z.string().min(1, "Purpose is required").max(200),
  employmentStatus: z.string().min(1, "Employment status is required"),
  monthlyIncome: z.number().min(0, "Income is required"),
  bvn: z.string().trim().length(11, "BVN must be 11 digits"),
  accountNumber: z.string().trim().length(10, "Account number must be 10 digits"),
  bankName: z.string().min(1, "Bank is required"),
  paymentType: z.string().min(1, "Payment type is required"),
});

interface LoanApplicationFormProps {
  initialBvn?: string;
}

const LoanApplicationForm = ({ initialBvn = "" }: LoanApplicationFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    loanType: "",
    loanAmount: "",
    loanPurpose: "",
    employmentStatus: "",
    monthlyIncome: "",
    bvn: initialBvn,
    accountNumber: "",
    bankName: "",
    paymentType: "installment",
  });
  const [proofOfIdentity, setProofOfIdentity] = useState<File | null>(null);
  const [proofOfSalary, setProofOfSalary] = useState<File | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setFormData(prev => ({
          ...prev,
          email: session.user.email || "",
        }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a loan application.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!proofOfIdentity || !proofOfSalary) {
        toast({
          title: "Missing Documents",
          description: "Please upload both proof of identity and proof of salary.",
          variant: "destructive",
        });
        return;
      }

      const validatedData = loanApplicationSchema.parse({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        loanType: formData.loanType,
        loanAmount: parseFloat(formData.loanAmount),
        loanPurpose: formData.loanPurpose,
        employmentStatus: formData.employmentStatus,
        monthlyIncome: parseFloat(formData.monthlyIncome),
        bvn: formData.bvn,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        paymentType: formData.paymentType,
      });

      // Upload proof of identity
      const identityFileName = `${user.id}/identity-${Date.now()}-${proofOfIdentity.name}`;
      const { error: identityUploadError } = await supabase.storage
        .from('loan-documents')
        .upload(identityFileName, proofOfIdentity);

      if (identityUploadError) throw identityUploadError;

      // Upload proof of salary
      const salaryFileName = `${user.id}/salary-${Date.now()}-${proofOfSalary.name}`;
      const { error: salaryUploadError } = await supabase.storage
        .from('loan-documents')
        .upload(salaryFileName, proofOfSalary);

      if (salaryUploadError) throw salaryUploadError;

      // Get public URLs for the uploaded files
      const { data: identityUrl } = supabase.storage
        .from('loan-documents')
        .getPublicUrl(identityFileName);

      const { data: salaryUrl } = supabase.storage
        .from('loan-documents')
        .getPublicUrl(salaryFileName);

      const { data: newApplication, error } = await supabase.from('loan_applications').insert({
        user_id: user.id,
        full_name: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        date_of_birth: validatedData.dateOfBirth,
        address: validatedData.address,
        loan_type: validatedData.loanType,
        loan_amount: validatedData.loanAmount,
        loan_purpose: validatedData.loanPurpose,
        employment_status: validatedData.employmentStatus,
        monthly_income: validatedData.monthlyIncome,
        bvn: validatedData.bvn,
        account_number: validatedData.accountNumber,
        bank_name: validatedData.bankName,
        payment_type: validatedData.paymentType,
        proof_of_identity_url: identityUrl.publicUrl,
        proof_of_salary_url: salaryUrl.publicUrl,
        status: 'pending',
      }).select().single();

      if (error) throw error;

      // Send confirmation email
      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-loan-notification', {
          body: {
            type: 'submission',
            applicationId: newApplication.id,
            userEmail: validatedData.email,
            userName: validatedData.fullName,
            loanAmount: validatedData.loanAmount,
            loanType: validatedData.loanType,
          },
        });
        
        if (emailError) {
          console.error('Email notification error:', emailError);
        } else {
          console.log('Email notification sent successfully:', emailData);
        }
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the application if email fails
      }

      toast({
        title: "Application Submitted Successfully! 🎉",
        description: "We'll review your application and get back to you within 24 hours.",
        duration: 5000,
      });
      
      setFormData({
        fullName: "",
        email: user.email || "",
        phone: "",
        dateOfBirth: "",
        address: "",
        loanType: "",
        loanAmount: "",
        loanPurpose: "",
        employmentStatus: "",
        monthlyIncome: "",
        bvn: "",
        accountNumber: "",
        bankName: "",
        paymentType: "installment",
      });
      setProofOfIdentity(null);
      setProofOfSalary(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="loan-application" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-4">
              <FileText className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Quick Application</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Apply for Your Loan
            </h2>
            <p className="text-xl text-muted-foreground">
              Complete this simple form and get a decision in minutes
            </p>
          </div>

          <Card className="shadow-strong border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Loan Application Form</CardTitle>
              <CardDescription className="text-base">
                All fields are required. Your information is encrypted and secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Personal Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="Adebayo Ogunlesi"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="adebayo@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="08012345678"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="Lagos, Nigeria"
                        value={formData.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>

                {/* Loan Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Loan Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="loanType">Loan Type</Label>
                      <Select 
                        value={formData.loanType} 
                        onValueChange={(value) => handleChange("loanType", value)}
                        required
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select loan type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal">Personal Loan</SelectItem>
                          <SelectItem value="business">Business Loan</SelectItem>
                          <SelectItem value="salary">Salary Advance</SelectItem>
                          <SelectItem value="sme">SME Loan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loanAmount">Requested Amount (₦)</Label>
                      <Input
                        id="loanAmount"
                        type="number"
                        placeholder="500000"
                        value={formData.loanAmount}
                        onChange={(e) => handleChange("loanAmount", e.target.value)}
                        required
                        min="50000"
                        max="5000000"
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loanPurpose">Loan Purpose</Label>
                    <Input
                      id="loanPurpose"
                      placeholder="E.g., Business expansion, Education, Medical bills"
                      value={formData.loanPurpose}
                      onChange={(e) => handleChange("loanPurpose", e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentType">Payment Option</Label>
                    <Select 
                      value={formData.paymentType} 
                      onValueChange={(value) => handleChange("paymentType", value)}
                      required
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select payment option" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="installment">Quarterly Installments (Every 3 months)</SelectItem>
                        <SelectItem value="full">Full Payment (Lump Sum)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Financial Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employmentStatus">Employment Status</Label>
                      <Select 
                        value={formData.employmentStatus} 
                        onValueChange={(value) => handleChange("employmentStatus", value)}
                        required
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employed">Employed Full-time</SelectItem>
                          <SelectItem value="self-employed">Self-employed</SelectItem>
                          <SelectItem value="civil-servant">Civil Servant</SelectItem>
                          <SelectItem value="contract">Contract Worker</SelectItem>
                          <SelectItem value="business-owner">Business Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="monthlyIncome">Monthly Income (₦)</Label>
                      <Input
                        id="monthlyIncome"
                        type="number"
                        placeholder="150000"
                        value={formData.monthlyIncome}
                        onChange={(e) => handleChange("monthlyIncome", e.target.value)}
                        required
                        min="0"
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>

                {/* Banking Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Banking Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bvn">BVN</Label>
                      <Input
                        id="bvn"
                        type="text"
                        placeholder="12345678901"
                        value={formData.bvn}
                        onChange={(e) => handleChange("bvn", e.target.value)}
                        required
                        maxLength={11}
                        className="h-12"
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">✓ Verified</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        type="text"
                        placeholder="0123456789"
                        value={formData.accountNumber}
                        onChange={(e) => handleChange("accountNumber", e.target.value)}
                        required
                        maxLength={10}
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank</Label>
                      <Select 
                        value={formData.bankName} 
                        onValueChange={(value) => handleChange("bankName", value)}
                        required
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Access Bank">Access Bank</SelectItem>
                          <SelectItem value="GTBank">Guaranty Trust Bank (GTBank)</SelectItem>
                          <SelectItem value="First Bank">First Bank of Nigeria</SelectItem>
                          <SelectItem value="UBA">United Bank for Africa (UBA)</SelectItem>
                          <SelectItem value="Zenith Bank">Zenith Bank</SelectItem>
                          <SelectItem value="Fidelity Bank">Fidelity Bank</SelectItem>
                          <SelectItem value="Union Bank">Union Bank</SelectItem>
                          <SelectItem value="Sterling Bank">Sterling Bank</SelectItem>
                          <SelectItem value="Stanbic IBTC">Stanbic IBTC Bank</SelectItem>
                          <SelectItem value="Ecobank">Ecobank Nigeria</SelectItem>
                          <SelectItem value="FCMB">First City Monument Bank (FCMB)</SelectItem>
                          <SelectItem value="Wema Bank">Wema Bank</SelectItem>
                          <SelectItem value="Unity Bank">Unity Bank</SelectItem>
                          <SelectItem value="Heritage Bank">Heritage Bank</SelectItem>
                          <SelectItem value="Keystone Bank">Keystone Bank</SelectItem>
                          <SelectItem value="Polaris Bank">Polaris Bank</SelectItem>
                          <SelectItem value="Providus Bank">Providus Bank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Documents Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Required Documents
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="proofOfIdentity">Proof of Identity</Label>
                      <Input
                        id="proofOfIdentity"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setProofOfIdentity(e.target.files?.[0] || null)}
                        required
                        className="h-12 cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload NIN, Driver's License, or Int'l Passport (PDF, JPG, PNG - Max 10MB)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proofOfSalary">Proof of Salary</Label>
                      <Input
                        id="proofOfSalary"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setProofOfSalary(e.target.files?.[0] || null)}
                        required
                        className="h-12 cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload payslip or bank statement (PDF, JPG, PNG - Max 10MB)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-lg bg-gradient-to-r from-primary to-primary/90 hover:shadow-strong transition-all"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting Application..." : "Submit Application"}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    By submitting, you agree to our terms and privacy policy
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LoanApplicationForm;