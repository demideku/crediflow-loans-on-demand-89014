import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const bvnSchema = z.string().trim().length(11, "BVN must be exactly 11 digits").regex(/^\d+$/, "BVN must contain only numbers");

interface BVNVerificationProps {
  onVerified: (bvn: string) => void;
}

const BVNVerification = ({ onVerified }: BVNVerificationProps) => {
  const { toast } = useToast();
  const [bvn, setBvn] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const validatedBvn = bvnSchema.parse(bvn);
      
      // Simulate BVN verification (in production, you'd verify with a BVN service)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "BVN Verified ✓",
        description: "You can now proceed with your loan application.",
      });
      
      onVerified(validatedBvn);
    } catch (error: any) {
      toast({
        title: "Invalid BVN",
        description: error.message || "Please enter a valid 11-digit BVN.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md shadow-strong border-2">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify Your Identity</CardTitle>
          <CardDescription className="text-base">
            Enter your Bank Verification Number (BVN) to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bvn">Bank Verification Number (BVN)</Label>
              <Input
                id="bvn"
                type="text"
                placeholder="12345678901"
                value={bvn}
                onChange={(e) => setBvn(e.target.value)}
                maxLength={11}
                required
                className="h-12 text-center text-lg tracking-wider"
              />
              <p className="text-sm text-muted-foreground">
                Your BVN is required to verify your identity and process your loan application.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base"
              disabled={isVerifying || bvn.length !== 11}
            >
              {isVerifying ? "Verifying..." : "Verify & Continue"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>🔒 Your information is encrypted and secure</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BVNVerification;
