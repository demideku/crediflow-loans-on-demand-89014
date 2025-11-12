import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useLoanNotifications = () => {
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Listen for loan status changes
      const loanChannel = supabase
        .channel('loan-status-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'loan_applications',
            filter: `user_id=eq.${user.id}`
          },
          (payload: any) => {
            const status = payload.new.status;
            const loanType = payload.new.loan_type;
            
            let title = "Loan Application Updated";
            let description = `Your ${loanType} loan application has been ${status}.`;
            
            if (status === 'approved') {
              title = "🎉 Loan Approved!";
              description = `Congratulations! Your ${loanType} loan has been approved.`;
            } else if (status === 'rejected') {
              title = "Loan Application Update";
              description = `Your ${loanType} loan application requires review.`;
            }
            
            toast({
              title,
              description,
            });
          }
        )
        .subscribe();

      // Listen for admin notifications
      const notificationChannel = supabase
        .channel('user-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload: any) => {
            const { title, message, type } = payload.new;
            
            toast({
              title,
              description: message,
              variant: type === 'error' ? 'destructive' : undefined,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(loanChannel);
        supabase.removeChannel(notificationChannel);
      };
    };

    checkUser();
  }, [toast]);
};
