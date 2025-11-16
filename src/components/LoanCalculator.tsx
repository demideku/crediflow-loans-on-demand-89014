import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator } from "lucide-react";

const LoanCalculator = () => {
  const [amount, setAmount] = useState(500000);
  const [term, setTerm] = useState(12);
  const [rate] = useState(15); // Fixed rate for demo (Nigerian rate)

  const calculateQuarterlyPayment = () => {
    // Calculate interest per 3 months (quarterly)
    const quarterlyRate = rate / 100 / 4; // Divide by 4 for quarterly periods
    const numQuarters = Math.ceil(term / 3); // Convert months to quarters
    const payment = (amount * quarterlyRate * Math.pow(1 + quarterlyRate, numQuarters)) / 
                   (Math.pow(1 + quarterlyRate, numQuarters) - 1);
    return payment.toFixed(2);
  };

  const totalPayment = (parseFloat(calculateQuarterlyPayment()) * Math.ceil(term / 3)).toFixed(2);
  const totalInterest = (parseFloat(totalPayment) - amount).toFixed(2);

  return (
    <section id="calculator" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Calculator className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Loan Calculator</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Calculate Your Quarterly Payment
            </h2>
            <p className="text-xl text-muted-foreground">
              Adjust the sliders to see your payment every 3 months
            </p>
          </div>

          <Card className="shadow-strong border-2">
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
              <CardDescription>Customize your loan parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Loan Amount */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="amount" className="text-base font-semibold">Loan Amount</Label>
                  <span className="text-2xl font-bold text-primary">₦{amount.toLocaleString()}</span>
                </div>
                <Slider
                  id="amount"
                  min={50000}
                  max={5000000}
                  step={50000}
                  value={[amount]}
                  onValueChange={(value) => setAmount(value[0])}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₦50,000</span>
                  <span>₦5,000,000</span>
                </div>
              </div>

              {/* Loan Term */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="term" className="text-base font-semibold">Loan Term</Label>
                  <span className="text-2xl font-bold text-primary">{term} months</span>
                </div>
                <Slider
                  id="term"
                  min={6}
                  max={60}
                  step={6}
                  value={[term]}
                  onValueChange={(value) => setTerm(value[0])}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>6 months</span>
                  <span>60 months</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Interest Rate</Label>
                  <span className="text-xl font-semibold text-muted-foreground">{rate}% APR</span>
                </div>
              </div>

              {/* Results */}
              <div className="pt-6 border-t space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl">
                  <span className="text-lg font-semibold">Payment Every 3 Months</span>
                  <span className="text-3xl font-bold text-primary">₦{calculateQuarterlyPayment()}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Payment</p>
                    <p className="text-xl font-bold">₦{totalPayment}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
                    <p className="text-xl font-bold">₦{totalInterest}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LoanCalculator;
