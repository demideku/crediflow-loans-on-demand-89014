import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, CreditCard, Clock } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: FileText,
      title: "1. Apply Online",
      description: "Fill out our simple online application form with your personal and financial details. The process takes just a few minutes.",
    },
    {
      icon: Clock,
      title: "2. Quick Review",
      description: "Our team reviews your application promptly. We assess your eligibility based on the information provided.",
    },
    {
      icon: CheckCircle,
      title: "3. Get Approved",
      description: "Once approved, you'll receive a notification with your loan terms and repayment schedule.",
    },
    {
      icon: CreditCard,
      title: "4. Receive Funds",
      description: "After accepting the terms, funds are disbursed directly to your bank account within 24-48 hours.",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h1>
              <p className="text-lg text-muted-foreground">
                Getting a loan with Crediflow is simple and straightforward
              </p>
            </div>

            <div className="grid gap-8">
              {steps.map((step, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default HowItWorks;
