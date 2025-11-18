import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLoanNotifications } from "@/hooks/useLoanNotifications.jsx";
import Index from "./pages/Index.jsx";
import Auth from "./pages/Auth.jsx";
import Admin from "./pages/Admin.jsx";
import AdminApplications from "./pages/AdminApplications.jsx";
import AdminReports from "./pages/AdminReports.jsx";
import AdminNotifications from "./pages/AdminNotifications.jsx";
import AdminPayments from "./pages/AdminPayments.jsx";
import Calculator from "./pages/Calculator.jsx";
import Apply from "./pages/Apply.jsx";
import About from "./pages/About.jsx";
import MyApplications from "./pages/MyApplications.jsx";
import Repayment from "./pages/Repayment.jsx";
import Notifications from "./pages/Notifications.jsx";
import NotFound from "./pages/NotFound.jsx";

const queryClient = new QueryClient();

const AppContent = () => {
  useLoanNotifications();
  
  return (
    <>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/about" element={<About />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/repayment/:id" element={<Repayment />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
