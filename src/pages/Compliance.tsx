import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileCheck, Scale, Building } from "lucide-react";

const Compliance = () => {
  const complianceItems = [
    {
      icon: Building,
      title: "Regulatory Compliance",
      description: "We operate in full compliance with the Central Bank of Nigeria (CBN) regulations and guidelines for lending institutions.",
    },
    {
      icon: Shield,
      title: "Data Protection",
      description: "We adhere to the Nigeria Data Protection Regulation (NDPR) to ensure your personal information is handled securely and responsibly.",
    },
    {
      icon: FileCheck,
      title: "Anti-Money Laundering",
      description: "We maintain robust AML policies and procedures in accordance with Nigerian financial regulations.",
    },
    {
      icon: Scale,
      title: "Fair Lending Practices",
      description: "We are committed to transparent and fair lending practices, providing clear terms and conditions for all loan products.",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Compliance</h1>
              <p className="text-lg text-muted-foreground">
                Our commitment to regulatory compliance and ethical business practices
              </p>
            </div>

            <div className="grid gap-6">
              {complianceItems.map((item, index) => (
                <Card key={index} className="border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 p-6 bg-muted/30 rounded-lg border border-border">
              <h2 className="text-xl font-semibold mb-4">Our Commitment</h2>
              <p className="text-muted-foreground">
                At Nexatech, we believe that compliance is not just about following rules—it's about building trust with our customers. We continuously review and update our policies to meet evolving regulatory requirements and industry best practices.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Compliance;
