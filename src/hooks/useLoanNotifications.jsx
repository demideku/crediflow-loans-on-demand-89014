import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useLoanNotifications = () => {
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('loan-applications-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'loan_applications',
        },
        (payload) => {
          const newStatus = payload.new.status;
          const oldStatus = payload.old.status;
          
          if (newStatus !== oldStatus) {
            let title = "Application Update";
            let description = `Your loan application status has been updated to: ${newStatus}`;
            let variant = "default";

            if (newStatus === "approved") {
              title = "Application Approved!";
              description = "Congratulations! Your loan application has been approved.";
              variant = "default";
            } else if (newStatus === "rejected") {
              title = "Application Update";
              description = "Your loan application status has been updated. Please check your applications page.";
              variant = "destructive";
            }

            toast({
              title,
              description,
              variant,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
};
