
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { Logo } from "@/components/ui/logo";
import { Home, ArrowLeft, Frown } from "lucide-react";

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
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-gray-200 max-w-lg w-full animate-fade-in">
          <Logo size="lg" className="mb-4 inline-block" />
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
              <Frown className="h-10 w-10 text-red-500" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-red-500">404</h1>
          <p className="text-xl font-medium mb-2">
            Page Not Found
          </p>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button 
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 px-6 py-6 text-base shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <Home className="h-5 w-5" />
              Go to Homepage
            </Button>
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex items-center justify-center gap-2 px-6 py-6 text-base"
              size="lg"
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotFound;
