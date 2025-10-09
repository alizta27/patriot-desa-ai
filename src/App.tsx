import { BrowserRouter, Route,Routes } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import AdminLayout from "./components/admin/AdminLayout";
import About from "./pages/About";
import AdminActivity from "./pages/admin/Activity";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSettings from "./pages/admin/Settings";
import AdminUsers from "./pages/admin/Users";
import Chat from "./pages/Chat";
import ChatNew from "./pages/ChatNew";
import CookiesPolicy from "./pages/CookiesPolicy";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Subscription from "./pages/Subscription";
import TermsOfUse from "./pages/TermsOfUse";
import { ReactQueryProvider, ThemeProvider } from "./providers";

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <ReactQueryProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/chat" element={<ChatNew />} />
          <Route path="/chat-old" element={<Chat />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/about" element={<About />} />
            <Route path="/cookies-policy" element={<CookiesPolicy />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="activity" element={<AdminActivity />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ReactQueryProvider>
  </ThemeProvider>
);

export default App;
