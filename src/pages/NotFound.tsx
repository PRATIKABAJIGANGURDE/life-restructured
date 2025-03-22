
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { Logo } from "@/components/ui/logo";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <AppLayout className="bg-gradient-to-b from-blue-50 to-white">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <Logo size="lg" className="mb-8 inline-block" />
          <h1 className="text-6xl font-bold mb-6">404</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Oops! We couldn't find the page you're looking for.
          </p>
          <Button 
            onClick={() => navigate("/")}
            className="px-6 py-6 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Return to Home
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotFound;
