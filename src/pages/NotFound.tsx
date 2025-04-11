
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { Logo } from "@/components/ui/logo";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";

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
        <div className="text-center bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full animate-in fade-in duration-500">
          <Logo size="lg" className="mb-6 inline-block" />
          
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-blue-50 flex items-center justify-center border-4 border-blue-100">
              <AlertCircle className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">404</h1>
          
          <p className="text-2xl font-medium mb-3">
            Page Not Found
          </p>
          
          <p className="text-gray-500 mb-10 max-w-sm mx-auto">
            We couldn't find the page you're looking for. It might have been removed or doesn't exist.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 px-8 py-7 text-base shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600"
              size="lg"
            >
              <Home className="h-5 w-5" />
              Return Home
            </Button>
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex items-center justify-center gap-2 px-8 py-7 text-base border-2 hover:bg-gray-50"
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
