import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentIntegrationProps {
  appointmentId: string;
  amount: number;
  doctorName: string;
  onPaymentSuccess?: () => void;
}

export const PaymentIntegration: React.FC<PaymentIntegrationProps> = ({
  appointmentId,
  amount,
  doctorName,
  onPaymentSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          appointmentId,
          amount,
          doctorName,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Payment initiated",
          description: "Complete your payment in the new tab to confirm your appointment.",
        });
        
        onPaymentSuccess?.();
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-br from-background to-muted/20">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Consultation Payment</h3>
          <p className="text-sm text-muted-foreground">
            Secure payment for your appointment with {doctorName}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">${amount}</p>
          <p className="text-xs text-muted-foreground">One-time payment</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>Secured by Stripe • 256-bit SSL encryption</span>
      </div>
      
      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full gap-2"
        size="lg"
      >
        <CreditCard className="h-4 w-4" />
        {loading ? "Processing..." : "Pay Securely"}
      </Button>
      
      <p className="text-xs text-muted-foreground text-center">
        You will be redirected to Stripe's secure payment page
      </p>
    </div>
  );
};