import { useBookingStore } from "../stores/booking-store";

describe("Booking Zustand Store", () => {
  beforeEach(() => {
    // Reset state before each test
    useBookingStore.getState().reset();
  });

  it("should initialize with default values", () => {
    const state = useBookingStore.getState();
    expect(state.currentStep).toBe("DATE_TIME");
    expect(state.guestCount).toBe(1);
    expect(state.clientName).toBe("");
    expect(state.clientPhone).toBe("");
  });

  it("should handle navigation steps correctly", () => {
    const store = useBookingStore.getState();
    
    // Test nextStep
    store.nextStep();
    expect(useBookingStore.getState().currentStep).toBe("GUESTS");
    
    useBookingStore.getState().nextStep();
    expect(useBookingStore.getState().currentStep).toBe("CLIENT_INFO");
    
    // Test prevStep
    useBookingStore.getState().prevStep();
    expect(useBookingStore.getState().currentStep).toBe("GUESTS");
  });

  it("should set experience, date, timeslot, and guest counts correctly", () => {
    const store = useBookingStore.getState();
    
    store.setExperience("exp-1", "private");
    expect(useBookingStore.getState().experienceId).toBe("exp-1");
    expect(useBookingStore.getState().experienceType).toBe("private");
    
    store.setDate("2026-07-20");
    expect(useBookingStore.getState().selectedDate).toBe("2026-07-20");
    
    store.setTimeSlot("slot-1", "09:00");
    expect(useBookingStore.getState().selectedTimeSlotId).toBe("slot-1");
    expect(useBookingStore.getState().selectedTime).toBe("09:00");
    
    store.setGuestCount(5);
    expect(useBookingStore.getState().guestCount).toBe(5);

    // Negative guest counts should be clamped to 1
    store.setGuestCount(-2);
    expect(useBookingStore.getState().guestCount).toBe(1);
  });

  it("should handle client info settings correctly", () => {
    const store = useBookingStore.getState();
    
    store.setClientInfo({ name: "Mounir", phone: "0555112233", notes: "No onions" });
    
    const state = useBookingStore.getState();
    expect(state.clientName).toBe("Mounir");
    expect(state.clientPhone).toBe("0555112233");
    expect(state.clientNotes).toBe("No onions");
  });
});
