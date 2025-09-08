import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Here you could verify the payment with your backend
      setLoading(false);
      toast({
        title: "Payment Successful!",
        description: "Your appointment has been confirmed.",
      });
    } else {
      navigate('/');
    }
  }, [sessionId, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              Your consultation has been booked
            </p>
            <p className="text-muted-foreground">
              You will receive a confirmation email with your appointment details shortly.
            </p>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Session ID: {sessionId?.slice(-12)}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>
            
            <Button 
              onClick={() => navigate('/profile')} 
              variant="outline"
              className="w-full"
            >
              View My Appointments
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Need help? Contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};