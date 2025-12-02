import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>
            
            <p className="text-muted-foreground mb-8">Last updated: December 2024</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <p className="text-muted-foreground">
                We collect personal information you provide during the loan application process, including your name, contact details, BVN, employment information, and financial data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground">
                Your information is used to process loan applications, verify your identity, assess creditworthiness, communicate with you about your account, and comply with legal requirements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p className="text-muted-foreground">
                We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or disclosure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
              <p className="text-muted-foreground">
                We do not sell your personal information. We may share data with credit bureaus, regulatory bodies, and service providers as necessary to provide our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <p className="text-muted-foreground">
                You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                For privacy-related inquiries, contact us at privacy@nexatech.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Privacy;
