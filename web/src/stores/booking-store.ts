import { create } from 'zustand';

export type BookingStep = 'DATE_TIME' | 'GUESTS' | 'CLIENT_INFO' | 'SUMMARY';

interface BookingState {
  // Navigation
  currentStep: BookingStep;
  
  // Data
  experienceId: string | null;
  experienceType: 'private' | 'shared' | null;
  selectedDate: string | null;
  selectedTimeSlotId: string | null;
  selectedTime: string | null;
  guestCount: number;
  
  // Client Info
  clientName: string;
  clientPhone: string;
  clientNotes: string;

  // Actions
  setExperience: (id: string, type: 'private' | 'shared') => void;
  setDate: (date: string) => void;
  setTimeSlot: (id: string, time: string) => void;
  setGuestCount: (count: number) => void;
  setClientInfo: (info: { name?: string; phone?: string; notes?: string }) => void;
  setStep: (step: BookingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const STEP_ORDER: BookingStep[] = ['DATE_TIME', 'GUESTS', 'CLIENT_INFO', 'SUMMARY'];

export const useBookingStore = create<BookingState>((set, get) => ({
  // Navigation
  currentStep: 'DATE_TIME',
  
  // Data
  experienceId: null,
  experienceType: null,
  selectedDate: null,
  selectedTimeSlotId: null,
  selectedTime: null,
  guestCount: 1,
  
  // Client Info
  clientName: '',
  clientPhone: '',
  clientNotes: '',

  // Actions
  setExperience: (id, type) => set({ experienceId: id, experienceType: type }),
  
  setDate: (date) => set({ selectedDate: date, selectedTimeSlotId: null, selectedTime: null }),
  
  setTimeSlot: (id, time) => set({ selectedTimeSlotId: id, selectedTime: time }),
  
  setGuestCount: (count) => set({ guestCount: Math.max(1, count) }),
  
  setClientInfo: (info) => set((state) => ({
    clientName: info.name !== undefined ? info.name : state.clientName,
    clientPhone: info.phone !== undefined ? info.phone : state.clientPhone,
    clientNotes: info.notes !== undefined ? info.notes : state.clientNotes,
  })),

  setStep: (step) => set({ currentStep: step }),
  
  nextStep: () => {
    const { currentStep } = get();
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      set({ currentStep: STEP_ORDER[currentIndex + 1] });
    }
  },
  
  prevStep: () => {
    const { currentStep } = get();
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      set({ currentStep: STEP_ORDER[currentIndex - 1] });
    }
  },
  
  reset: () => set({
    currentStep: 'DATE_TIME',
    selectedDate: null,
    selectedTimeSlotId: null,
    selectedTime: null,
    guestCount: 1,
    clientName: '',
    clientPhone: '',
    clientNotes: '',
  }),
}));
