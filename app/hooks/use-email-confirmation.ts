'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { EmailConfirmationData } from '@/app/components/dialogs/email-confirmation-dialog';

interface UseEmailConfirmationOptions {
  onSuccess?: (messageId: string) => void;
  onError?: (error: string) => void;
}

export function useEmailConfirmation(options?: UseEmailConfirmationOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailData, setEmailData] = useState<EmailConfirmationData | null>(null);
  const { toast } = useToast();

  /**
   * Request email confirmation dialog
   */
  const requestConfirmation = useCallback(
    (data: EmailConfirmationData) => {
      setEmailData(data);
      setIsOpen(true);
    },
    []
  );

  /**
   * Send email after confirmation
   */
  const sendEmail = useCallback(
    async (data: EmailConfirmationData) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/emails/send-with-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send email');
        }

        const result = await response.json();

        // Show success toast
        toast({
          title: 'Email Sent',
          description: `Email sent to ${data.recipientEmail}`,
          variant: 'default',
        });

        // Call success callback
        options?.onSuccess?.(result.messageId);

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send email';

        // Show error toast
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });

        // Call error callback
        options?.onError?.(errorMessage);

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [toast, options]
  );

  /**
   * Cancel email sending
   */
  const cancel = useCallback(() => {
    setIsOpen(false);
    setEmailData(null);
  }, []);

  return {
    isOpen,
    setIsOpen,
    isLoading,
    emailData,
    requestConfirmation,
    sendEmail,
    cancel,
  };
}
