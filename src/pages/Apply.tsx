import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoanApplicationForm from "@/components/LoanApplicationForm";
import BVNVerification from "@/components/BVNVerification";

const Apply = () => {
  const [verifiedBvn, setVerifiedBvn] = useState<string | null>(null);

  const handleBvnVerified = (bvn: string) => {
    setVerifiedBvn(bvn);
  };

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {!verifiedBvn ? (
              <>
                <div className="text-center mb-12">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Apply for a Loan
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    First, let's verify your identity
                  </p>
                </div>
                <BVNVerification onVerified={handleBvnVerified} />
              </>
            ) : (
              <>
                <div className="text-center mb-12">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Apply for a Loan
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Complete the form below to start your loan application process
                  </p>
                </div>
                <LoanApplicationForm initialBvn={verifiedBvn} />
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Apply;
