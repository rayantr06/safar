"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateBookingStatus } from "@/lib/actions/partner-bookings";
import { Check, X, Loader2 } from "lucide-react";

export function BookingActions({ bookingId, currentStatus }: { bookingId: string, currentStatus: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (status: string) => {
    setIsLoading(true);
    await updateBookingStatus(bookingId, status);
    setIsLoading(false);
  };

  if (currentStatus === "new" || currentStatus === "pending") {
    return (
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-success border-success hover:bg-success hover:text-white"
          onClick={() => handleUpdate("confirmed")}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
          Accepter
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-danger border-danger hover:bg-danger hover:text-white"
          onClick={() => handleUpdate("cancelled")}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
          Refuser
        </Button>
      </div>
    );
  }

  if (currentStatus === "confirmed") {
    return (
      <div className="flex justify-end gap-2">
         <Button 
          variant="default" 
          size="sm" 
          className="bg-primary text-white"
          onClick={() => handleUpdate("completed")}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
          Marquer Terminé
        </Button>
      </div>
    );
  }

  return (
    <Button variant="ghost" size="sm" disabled>
      Finalisé
    </Button>
  );
}
