'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, AlertCircle, Copy, Check } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export interface EmailConfirmationData {
  recipientEmail: string;
  recipientName?: string;
  senderEmail: string;
  senderName?: string;
  subject: string;
  htmlContent: string;
  ccEmails?: string[];
  bccEmails?: string[];
  attachments?: { name: string; size: string }[];
}

interface EmailConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailData: EmailConfirmationData;
  onConfirm: (data: EmailConfirmationData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function EmailConfirmationDialog({
  open,
  onOpenChange,
  emailData,
  onConfirm,
  onCancel,
  loading = false,
}: EmailConfirmationDialogProps) {
  const [copied, setCopied] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(emailData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Confirm Email</DialogTitle>
              <DialogDescription>
                Review the email details before sending
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 py-4">
          <div className="space-y-6">
            {/* Sender Information */}
            <div className="border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                From
              </h3>
              <div className="space-y-2 ml-4">
                <div>
                  <p className="text-xs text-muted-foreground">Email Address</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm font-medium text-foreground break-all">
                      {emailData.senderEmail}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(emailData.senderEmail)}
                      className="h-8"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {emailData.senderName && (
                  <div>
                    <p className="text-xs text-muted-foreground">Display Name</p>
                    <p className="text-sm text-foreground mt-1">
                      {emailData.senderName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recipient Information */}
            <div className="border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                To
              </h3>
              <div className="space-y-3 ml-4">
                <div>
                  <p className="text-xs text-muted-foreground">Primary Recipient</p>
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      <p className="text-sm font-medium text-foreground break-all">
                        {emailData.recipientEmail}
                      </p>
                      {emailData.recipientName && (
                        <p className="text-xs text-muted-foreground">
                          ({emailData.recipientName})
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(emailData.recipientEmail)}
                      className="h-8"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {emailData.ccEmails && emailData.ccEmails.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">CC</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {emailData.ccEmails.map((email) => (
                        <span
                          key={email}
                          className="px-2 py-1 bg-muted rounded-md text-xs text-foreground break-all"
                        >
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {emailData.bccEmails && emailData.bccEmails.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">BCC</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {emailData.bccEmails.map((email) => (
                        <span
                          key={email}
                          className="px-2 py-1 bg-muted rounded-md text-xs text-foreground break-all"
                        >
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Subject Line */}
            <div className="border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Subject</h3>
              <div className="bg-muted rounded p-3">
                <p className="text-sm text-foreground break-words">
                  {emailData.subject}
                </p>
              </div>
            </div>

            {/* Email Content */}
            <div className="border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Content</h3>
              <div className="bg-muted rounded p-4 max-h-64 overflow-y-auto">
                <div
                  className="text-sm text-foreground prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: emailData.htmlContent }}
                />
              </div>
            </div>

            {/* Attachments */}
            {emailData.attachments && emailData.attachments.length > 0 && (
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Attachments ({emailData.attachments.length})
                </h3>
                <div className="space-y-2">
                  {emailData.attachments.map((attachment) => (
                    <div
                      key={attachment.name}
                      className="flex items-center justify-between bg-muted rounded p-2"
                    >
                      <span className="text-sm text-foreground truncate">
                        {attachment.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {attachment.size}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="flex gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm text-warning">
                <p className="font-medium mb-1">Before you send</p>
                <p className="text-xs">
                  Make sure all recipient email addresses are correct. You cannot undo
                  this action once the email is sent.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isConfirming || loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirming || loading}
            className="bg-primary hover:bg-primary/90"
          >
            {isConfirming || loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              'Send Email'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
