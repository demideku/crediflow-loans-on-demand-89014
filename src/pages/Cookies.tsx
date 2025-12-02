import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Cookies = () => {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
            <h1 className="text-4xl md:text-5xl font-bold mb-8">Cookie Policy</h1>
            
            <p className="text-muted-foreground mb-8">Last updated: December 2024</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">What Are Cookies</h2>
              <p className="text-muted-foreground">
                Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience and understand how our site is used.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly.</li>
                <li><strong>Authentication Cookies:</strong> Keep you logged in during your session.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site.</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
              <p className="text-muted-foreground">
                You can control cookies through your browser settings. Note that disabling certain cookies may affect your experience on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
              <p className="text-muted-foreground">
                Some cookies may be set by third-party services we use, such as analytics providers. These are governed by their respective privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                For questions about our cookie policy, contact us at support@nexatech.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Cookies;
