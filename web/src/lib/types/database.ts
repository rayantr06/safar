// Safar DZ — Database Types
// These types map directly to Supabase/PostgreSQL tables

// ============ Enums ============

export type UserRole = "admin" | "provider";

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
  created_at: string;
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
  gallery: string[];
  location: string | null;
  is_active: boolean;
  is_featured: boolean;
  lat: number | null;
  lng: number | null;
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
  experience_id: string;
  time_slot_id: string | null;
  provider_id: string | null;
  client_name: string;
  client_phone: string;
  client_notes: string | null;
  guest_count: number;
  booking_type: "private" | "shared";
  total_amount: number;
  commission_amount: number;
  provider_amount: number;
  commission_rate?: number;
  status: BookingStatus;
  booking_date: string;
  booking_time: string;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  assigned_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  booking_source?: "SAFAR_DZ" | "PARTNER_DIRECT";
  duration_minutes?: number;
  start_time?: string;
  end_time?: string;
  created_by?: "CUSTOMER" | "PARTNER" | "ADMIN";
  boat_id?: string;
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
  images: string[];
  is_active: boolean;
  contact_phone: string | null;
  whatsapp_phone: string | null;
  max_guests: number;
  rooms_count: number;
  beds_count: number;
  bathrooms_count: number;
  amenities: string[];
  custom_amenities: string[];
  booking_type: BookingType;
  min_stay_nights: number;
  blocked_dates: string[];
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  metadata: Record<string, any>;
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

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
      };
      providers: {
        Row: Provider;
        Insert: Partial<Provider>;
        Update: Partial<Provider>;
      };
      boats: {
        Row: Boat;
        Insert: Partial<Boat>;
        Update: Partial<Boat>;
      };
      destinations: {
        Row: Destination;
        Insert: Partial<Destination>;
        Update: Partial<Destination>;
      };
      experiences: {
        Row: Experience;
        Insert: Partial<Experience>;
        Update: Partial<Experience>;
      };
      experience_images: {
        Row: ExperienceImage;
        Insert: Partial<ExperienceImage>;
        Update: Partial<ExperienceImage>;
      };
      time_slots: {
        Row: TimeSlot;
        Insert: Partial<TimeSlot>;
        Update: Partial<TimeSlot>;
      };
      bookings: {
        Row: Booking;
        Insert: Partial<Booking>;
        Update: Partial<Booking>;
      };
      booking_status_history: {
        Row: BookingStatusHistory;
        Insert: Partial<BookingStatusHistory>;
        Update: Partial<BookingStatusHistory>;
      };
      provider_payouts: {
        Row: ProviderPayout;
        Insert: Partial<ProviderPayout>;
        Update: Partial<ProviderPayout>;
      };
      site_content: {
        Row: SiteContent;
        Insert: Partial<SiteContent>;
        Update: Partial<SiteContent>;
      };
      accommodations: {
        Row: Accommodation;
        Insert: Partial<Accommodation>;
        Update: Partial<Accommodation>;
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification>;
        Update: Partial<Notification>;
      };
      notification_settings: {
        Row: NotificationSettings;
        Insert: Partial<NotificationSettings>;
        Update: Partial<NotificationSettings>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
