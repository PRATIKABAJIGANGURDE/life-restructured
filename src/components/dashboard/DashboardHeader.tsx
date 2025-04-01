
import React from "react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardHeaderProps {
  handleLogout: () => Promise<void>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  handleLogout
}) => {
  const navigate = useNavigate();
  
  return (
    <header className="py-4 px-4 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container max-w-6xl mx-auto flex justify-between items-center">
        <Logo />
        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
            <User className="h-5 w-5 mr-1" />
            Profile
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
            <Settings className="h-5 w-5 mr-1" />
            Settings
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-1" />
            Logout
          </Button>
        </nav>
      </div>
    </header>
  );
};
