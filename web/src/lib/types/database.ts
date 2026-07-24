// Safar DZ — Database Types
// Regenerated from migrations 001–007 (authoritative source of truth)

// ============ Enums ============

export type UserRole = "admin" | "provider" | "client";

export type BoatType = "private" | "shared" | "jetski" | "kayak" | "paddle" | "quads" | "other";

export type ExperienceType = "private" | "shared" | "jetski" | "kayak" | "paddle" | "quads" | "other";

export type BookingStatus =
  | "new"
  | "pending"
  | "confirmed"
  | "assigned"
  | "completed"
  | "cancelled";

export type PayoutStatus = "pending" | "processing" | "paid";

export type AccommodationType = "villa" | "appartement" | "maison_hotes" | "hotel" | "studio";

export type BookingType = "whatsapp" | "platform" | "both";

export type ContentStatus = "draft" | "published" | "hidden" | "archived";

// ============ Database Row Types ============

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Provider = {
  id: string;
  company_name: string;
  port_location: string;
  bio: string | null;
  is_active: boolean;
  rating: number;
  total_trips: number;
  total_revenue: number;
  commission_rate: number;
  commission_effective_date: string;
  commission_status: "active" | "inactive";
  commission_last_modified: string;
  created_at: string;
  // added by migration 003
  whatsapp: string | null;
  address: string | null;
  notes: string | null;
  commission_type: "percentage" | "fixed";
  is_disabled: boolean;
};

export type Boat = {
  id: string;
  provider_id: string;
  name: string;
  type: BoatType;
  capacity: number;
  description: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type Destination = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  photo_url: string | null;
  hero_image_url: string | null;
  gallery: unknown;
  location: string | null;
  is_active: boolean;
  is_featured: boolean;
  lat: number | null;
  lng: number | null;
  status: ContentStatus;
};

export type Experience = {
  id: string;
  boat_id: string;
  destination_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  type: ExperienceType;
  category: string | null;
  price_total: number | null;
  price_per_seat: number | null;
  duration_minutes: number;
  max_guests: number;
  is_published: boolean;
  badge: string | null;
  main_image_url: string | null;
  rating: number;
  included_services: string | null;
  requirements: string | null;
  departure_location: string | null;
  route_description: string | null;
  created_at: string;
  updated_at: string;
  status: ContentStatus;
};

export type ExperienceImage = {
  id: string;
  experience_id: string;
  image_url: string;
  display_order: number;
  alt_text: string | null;
};

export type TimeSlot = {
  id: string;
  experience_id: string;
  date: string;
  start_time: string;
  end_time: string;
  total_seats: number;
  booked_seats: number;
  is_blocked: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  booking_ref: string;
  experience_id: string | null;
  time_slot_id: string | null;
  provider_id: string | null;
  client_id: string | null;
  client_name: string;
  client_phone: string;
  client_notes: string | null;
  guest_count: number;
  booking_type: "private" | "shared";
  total_amount: number;
  commission_amount: number;
  provider_amount: number;
  commission_rate: number;
  status: BookingStatus;
  booking_date: string;
  booking_time: string;
  booking_source: "SAFAR_DZ" | "PARTNER_DIRECT";
  duration_minutes: number;
  start_time: string;
  end_time: string;
  created_by: "CUSTOMER" | "PARTNER" | "ADMIN";
  boat_id: string | null;
  accommodation_id: string | null;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  assigned_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
};

export type BookingStatusHistory = {
  id: string;
  booking_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  note: string | null;
  created_at: string;
};

export type ProviderPayout = {
  id: string;
  provider_id: string;
  amount: number;
  period_start: string;
  period_end: string;
  status: PayoutStatus;
  paid_at: string | null;
  created_at: string;
};

export type SiteContent = {
  id: string;
  section: string;
  content_fr: string;
  updated_by: string | null;
  updated_at: string;
};

export type Accommodation = {
  id: string;
  title: string;
  slug: string;
  type: AccommodationType;
  wilaya: string;
  city: string | null;
  address: string | null;
  description: string | null;
  short_description: string | null;
  location: string | null;
  price: number;
  promo_price: number | null;
  currency: string;
  pricing_type: string;
  image_url: string | null;
  images: unknown;
  is_active: boolean;
  contact_phone: string | null;
  whatsapp_phone: string | null;
  max_guests: number;
  rooms_count: number;
  beds_count: number;
  bathrooms_count: number;
  amenities: unknown;
  custom_amenities: unknown;
  booking_type: BookingType;
  min_stay_nights: number;
  blocked_dates: unknown;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
  // added by migration 004
  destination_id: string | null;
  status: ContentStatus;
};

export type Notification = {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type NotificationSettings = {
  id: string;
  event_type: string;
  dashboard_enabled: boolean;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  updated_at: string;
};

export type BoatAvailability = {
  boat_id: string;
  settings: unknown;
  created_at: string;
  updated_at: string;
};

// ============ RPC Function Types ============

export type AtomicCreateBookingInput = {
  p_boat_id: string;
  p_booking_date: string;
  p_booking_time: string;
  p_duration_minutes: number;
  p_experience_id: string;
  p_client_name: string;
  p_client_phone: string;
  p_client_notes?: string;
  p_guest_count?: number;
  p_booking_type?: string;
  p_total_amount?: number;
  p_commission_amount?: number;
  p_provider_amount?: number;
  p_commission_rate?: number;
  p_provider_id?: string | null;
  p_client_id?: string | null;
  p_time_slot_id?: string | null;
  p_booking_source?: string;
  p_created_by?: string;
};

export type AtomicCreatePartnerBookingInput = {
  p_boat_id: string;
  p_booking_date: string;
  p_booking_time: string;
  p_duration_minutes: number;
  p_client_name: string;
  p_client_phone: string;
  p_client_notes?: string;
  p_guest_count?: number;
  p_total_amount?: number;
  p_provider_id?: string | null;
  p_experience_id?: string | null;
};

export type AtomicBookingResult = {
  success: boolean;
  error?: string;
  booking_ref?: string;
  booking_id?: string;
};

// ============ Database Interface ============

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; full_name: string };
        Update: Partial<Profile>;
      };
      providers: {
        Row: Provider;
        Insert: Partial<Provider> & { id: string; company_name: string };
        Update: Partial<Provider>;
      };
      boats: {
        Row: Boat;
        Insert: Partial<Boat> & { name: string; type: BoatType; capacity: number; provider_id: string };
        Update: Partial<Boat>;
      };
      destinations: {
        Row: Destination;
        Insert: Partial<Destination> & { name: string; slug: string };
        Update: Partial<Destination>;
      };
      experiences: {
        Row: Experience;
        Insert: Partial<Experience> & { title: string; slug: string; type: ExperienceType; boat_id: string };
        Update: Partial<Experience>;
      };
      experience_images: {
        Row: ExperienceImage;
        Insert: Partial<ExperienceImage> & { experience_id: string; image_url: string };
        Update: Partial<ExperienceImage>;
      };
      time_slots: {
        Row: TimeSlot;
        Insert: Partial<TimeSlot> & { experience_id: string; date: string; start_time: string; end_time: string; total_seats: number };
        Update: Partial<TimeSlot>;
      };
      bookings: {
        Row: Booking;
        Insert: Partial<Booking> & { booking_ref: string };
        Update: Partial<Booking>;
      };
      booking_status_history: {
        Row: BookingStatusHistory;
        Insert: Partial<BookingStatusHistory> & { booking_id: string; new_status: string };
        Update: Partial<BookingStatusHistory>;
      };
      provider_payouts: {
        Row: ProviderPayout;
        Insert: Partial<ProviderPayout> & { provider_id: string; amount: number; period_start: string; period_end: string };
        Update: Partial<ProviderPayout>;
      };
      site_content: {
        Row: SiteContent;
        Insert: Partial<SiteContent> & { section: string; content_fr: string };
        Update: Partial<SiteContent>;
      };
      accommodations: {
        Row: Accommodation;
        Insert: Partial<Accommodation> & { title: string; slug: string; type: AccommodationType };
        Update: Partial<Accommodation>;
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification> & { type: string; title: string };
        Update: Partial<Notification>;
      };
      notification_settings: {
        Row: NotificationSettings;
        Insert: Partial<NotificationSettings> & { event_type: string };
        Update: Partial<NotificationSettings>;
      };
      boat_availability: {
        Row: BoatAvailability;
        Insert: Partial<BoatAvailability> & { boat_id: string; settings: unknown };
        Update: Partial<BoatAvailability>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      atomic_create_booking: {
        Args: AtomicCreateBookingInput;
        Returns: AtomicBookingResult;
      };
      atomic_create_partner_booking: {
        Args: AtomicCreatePartnerBookingInput;
        Returns: AtomicBookingResult;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
