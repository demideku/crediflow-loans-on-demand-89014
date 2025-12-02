import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What documents do I need to apply for a loan?",
      answer: "You'll need a valid government-issued ID, proof of income (such as pay slips or bank statements), and your BVN for verification.",
    },
    {
      question: "How long does the approval process take?",
      answer: "Most applications are reviewed within 24-48 hours. Once approved, funds are typically disbursed within 1-2 business days.",
    },
    {
      question: "What are the interest rates?",
      answer: "Our interest rates are competitive and calculated quarterly. Use our loan calculator to see exact rates based on your loan amount and term.",
    },
    {
      question: "Can I repay my loan early?",
      answer: "Yes, you can repay your loan early without any prepayment penalties. Early repayment may reduce your total interest paid.",
    },
    {
      question: "What happens if I miss a payment?",
      answer: "We understand that circumstances can change. Contact us immediately if you're having difficulty making payments to discuss available options.",
    },
    {
      question: "How do I check my application status?",
      answer: "You can track your application status by logging into your account and visiting the 'My Applications' section.",
    },
    {
      question: "What loan amounts are available?",
      answer: "We offer loans ranging from ₦50,000 to ₦5,000,000, depending on your eligibility and income verification.",
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we use industry-standard encryption and security measures to protect your personal and financial information.",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
              <p className="text-lg text-muted-foreground">
                Find answers to common questions about our loan services
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default FAQ;
