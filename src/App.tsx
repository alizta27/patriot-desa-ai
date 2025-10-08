import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Chat from "./pages/Chat";
import Subscription from "./pages/Subscription";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import About from "./pages/About";
import CookiesPolicy from "./pages/CookiesPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import { ReactQueryProvider } from "./providers";

const App = () => (
  <ReactQueryProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/about" element={<About />} />
          <Route path="/cookies-policy" element={<CookiesPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </ReactQueryProvider>
);

export default App;
