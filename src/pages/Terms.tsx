import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>
            
            <p className="text-muted-foreground mb-8">Last updated: December 2024</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using Crediflow's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
              <p className="text-muted-foreground">
                You must be at least 18 years old and a Nigerian resident to use our loan services. You must provide accurate and complete information during the application process.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Loan Terms</h2>
              <p className="text-muted-foreground">
                Loan approval is subject to our assessment criteria. Interest rates, repayment terms, and loan amounts are determined based on your application and creditworthiness.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Repayment Obligations</h2>
              <p className="text-muted-foreground">
                You are obligated to repay the loan according to the agreed schedule. Late payments may incur additional fees and affect your credit standing.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Nexatech shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Contact</h2>
              <p className="text-muted-foreground">
                For questions about these Terms, please contact us at support@nexatech.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Terms;
