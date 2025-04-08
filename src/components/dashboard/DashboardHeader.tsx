
import React, { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, Menu, X, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardHeaderProps {
  handleLogout: () => Promise<void>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  handleLogout
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="py-4 px-4 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container max-w-6xl mx-auto flex justify-between items-center">
        <Logo />
        
        {isMobile ? (
          <>
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="md:hidden">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            {isMenuOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border-b shadow-md py-2 px-4 flex flex-col gap-2 animate-fade-in">
                <Button variant="ghost" size="sm" onClick={() => { navigate("/profile"); setIsMenuOpen(false); }} className="w-full justify-start">
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { navigate("/suggestions"); setIsMenuOpen(false); }} className="w-full justify-start">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Suggestions
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { navigate("/settings"); setIsMenuOpen(false); }} className="w-full justify-start">
                  <Settings className="h-5 w-5 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm" onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full justify-start">
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </>
        ) : (
          <nav className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
              <User className="h-5 w-5 mr-1" />
              Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/suggestions")}>
              <MessageSquare className="h-5 w-5 mr-1" />
              Suggestions
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
        )}
      </div>
    </header>
  );
};
