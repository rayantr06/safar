import * as fs from "fs";
import * as path from "path";

const MOCK_DB_FILE = path.join(process.cwd(), ".safar-mock-db.json");

export interface BoatAvailabilitySettings {
  workingHours: { start: string; end: string };
  breakTime: { start: string; end: string };
  unavailableDays: string[];
  maintenanceDates: string[];
}

export function getMockDb() {
  if (!fs.existsSync(MOCK_DB_FILE)) {
    const seed = {
      bookings: [
        {
          id: "b1",
          booking_ref: "#SF-9042",
          client_name: "Kader B.",
          client_phone: "0550123456",
          booking_date: new Date().toISOString().split("T")[0], // Today
          booking_time: "09:00",
          duration_minutes: 120,
          guest_count: 4,
          booking_type: "private",
          total_amount: 1250000,
          commission_amount: 187500,
          provider_amount: 1062500,
          commission_rate: 15,
          status: "completed",
          booking_source: "SAFAR_DZ",
          created_by: "CUSTOMER",
          experience_id: "1",
          boat_id: "1",
          created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: "b2",
          booking_ref: "#SF-9045",
          client_name: "Zahra L.",
          client_phone: "0660987654",
          booking_date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split("T")[0], // Tomorrow
          booking_time: "12:00",
          duration_minutes: 240,
          guest_count: 6,
          booking_type: "private",
          total_amount: 4500000,
          commission_amount: 675000,
          provider_amount: 3825000,
          commission_rate: 15,
          status: "confirmed",
          booking_source: "SAFAR_DZ",
          created_by: "CUSTOMER",
          experience_id: "1",
          boat_id: "1",
          created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
        },
        {
          id: "b3",
          booking_ref: "#SF-M1001",
          client_name: "Mourad S.",
          client_phone: "0771223344",
          booking_date: new Date().toISOString().split("T")[0], // Today
          booking_time: "15:00",
          duration_minutes: 180,
          guest_count: 5,
          booking_type: "private",
          total_amount: 1500000,
          commission_amount: 0,
          provider_amount: 1500000,
          commission_rate: 0,
          status: "pending",
          booking_source: "PARTNER_DIRECT",
          created_by: "PARTNER",
          experience_id: "1",
          boat_id: "1",
          created_at: new Date().toISOString()
        }
      ],
      boat_availability: {
        "1": {
          workingHours: { start: "08:00", end: "20:00" },
          breakTime: { start: "13:00", end: "14:00" },
          unavailableDays: ["Monday"],
          maintenanceDates: []
        },
        "2": {
          workingHours: { start: "09:00", end: "19:00" },
          breakTime: { start: "12:00", end: "13:00" },
          unavailableDays: ["Tuesday"],
          maintenanceDates: []
        },
        "3": {
          workingHours: { start: "08:00", end: "20:00" },
          breakTime: { start: "12:00", end: "13:00" },
          unavailableDays: [],
          maintenanceDates: []
        },
        "4": {
          workingHours: { start: "09:00", end: "18:00" },
          breakTime: { start: "12:00", end: "13:00" },
          unavailableDays: [],
          maintenanceDates: []
        },
        "5": {
          workingHours: { start: "08:00", end: "19:00" },
          breakTime: { start: "13:00", end: "14:00" },
          unavailableDays: [],
          maintenanceDates: []
        },
        "6": {
          workingHours: { start: "08:00", end: "20:00" },
          breakTime: { start: "13:00", end: "14:00" },
          unavailableDays: [],
          maintenanceDates: []
        }
      },
      boats: {
        "1": { id: "1", provider_id: "mock-partner-id", name: "Salim Boat", type: "private", capacity: 6 },
        "2": { id: "2", provider_id: "p2", name: "Evasion Boat", type: "private", capacity: 8 },
        "3": { id: "3", provider_id: "p3", name: "Azul Cruiser", type: "private", capacity: 10 },
        "4": { id: "4", provider_id: "p3", name: "Jet Ski Yamaha", type: "jetski", capacity: 2 },
        "5": { id: "5", provider_id: "p2", name: "Kayak Dag", type: "kayak", capacity: 2 },
        "6": { id: "6", provider_id: "mock-partner-id", name: "Paddle Board", type: "paddle", capacity: 1 }
      },
      commission_rate: 15,
      experiences: {},
      destinations: {},
      partners: {
        "mock-partner-id": {
          id: "mock-partner-id",
          name: "Capitaine Salim",
          phone: "0550123456",
          email: "salim@example.com",
          boats: 2,
          total_revenue: 1250000,
          joined: "Mai 2026",
          status: "active",
          commission_rate: 15,
          commission_effective_date: "2026-06-18",
          commission_status: "active",
          commission_last_modified: new Date().toISOString()
        },
        "p2": {
          id: "p2",
          name: "Evasion Marine",
          phone: "0660987654",
          email: "contact@evasion.dz",
          boats: 5,
          total_revenue: 4500000,
          joined: "Avril 2026",
          status: "active",
          commission_rate: 15,
          commission_effective_date: "2026-06-18",
          commission_status: "active",
          commission_last_modified: new Date().toISOString()
        },
        "p3": {
          id: "p3",
          name: "Azul Sea Voyager",
          phone: "0770112233",
          email: "azul@safar.dz",
          boats: 3,
          total_revenue: 3000000,
          joined: "Mai 2026",
          status: "active",
          commission_rate: 15,
          commission_effective_date: "2026-06-18",
          commission_status: "active",
          commission_last_modified: new Date().toISOString()
        }
      }
    };
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(seed, null, 2), "utf-8");
    return seed;
  }
  try {
    const data = JSON.parse(fs.readFileSync(MOCK_DB_FILE, "utf-8"));
    let migrated = false;
    if (data.bookings) {
      data.bookings.forEach((b: any) => {
        if (b.booking_source === "PARTNER_MANUAL") {
          b.booking_source = "PARTNER_DIRECT";
          migrated = true;
        }
        if (b.commission_rate === undefined) {
          b.commission_rate = b.booking_source === "PARTNER_DIRECT" ? 0 : 15;
          migrated = true;
        }
      });
    }
    if (!data.boats) {
      data.boats = {
        "1": { id: "1", provider_id: "mock-partner-id", name: "Salim Boat", type: "private", capacity: 6 },
        "2": { id: "2", provider_id: "p2", name: "Evasion Boat", type: "private", capacity: 8 },
        "3": { id: "3", provider_id: "p3", name: "Azul Cruiser", type: "private", capacity: 10 },
        "4": { id: "4", provider_id: "p3", name: "Jet Ski Yamaha", type: "jetski", capacity: 2 },
        "5": { id: "5", provider_id: "p2", name: "Kayak Dag", type: "kayak", capacity: 2 },
        "6": { id: "6", provider_id: "mock-partner-id", name: "Paddle Board", type: "paddle", capacity: 1 }
      };
      migrated = true;
    }
    if (!data.boat_availability) {
      data.boat_availability = {};
      migrated = true;
    }
    if (!data.boat_availability["3"]) {
      data.boat_availability["3"] = {
        workingHours: { start: "08:00", end: "20:00" },
        breakTime: { start: "12:00", end: "13:00" },
        unavailableDays: [],
        maintenanceDates: []
      };
      data.boat_availability["4"] = {
        workingHours: { start: "09:00", end: "18:00" },
        breakTime: { start: "12:00", end: "13:00" },
        unavailableDays: [],
        maintenanceDates: []
      };
      data.boat_availability["5"] = {
        workingHours: { start: "08:00", end: "19:00" },
        breakTime: { start: "13:00", end: "14:00" },
        unavailableDays: [],
        maintenanceDates: []
      };
      data.boat_availability["6"] = {
        workingHours: { start: "08:00", end: "20:00" },
        breakTime: { start: "13:00", end: "14:00" },
        unavailableDays: [],
        maintenanceDates: []
      };
      migrated = true;
    }
    if (!data.partners) {
      data.partners = {};
      migrated = true;
    }
    if (!data.partners["p3"]) {
      data.partners["p3"] = {
        id: "p3",
        name: "Azul Sea Voyager",
        phone: "0770112233",
        email: "azul@safar.dz",
        boats: 3,
        total_revenue: 3000000,
        joined: "Mai 2026",
        status: "active",
        commission_rate: 15,
        commission_effective_date: "2026-06-18",
        commission_status: "active",
        commission_last_modified: new Date().toISOString()
      };
      migrated = true;
    }
    if (!data.partners["mock-partner-id"]) {
      data.partners["mock-partner-id"] = {
        id: "mock-partner-id",
        name: "Capitaine Salim",
        phone: "0550123456",
        email: "salim@example.com",
        boats: 2,
        total_revenue: 1250000,
        joined: "Mai 2026",
        status: "active",
        commission_rate: 15,
        commission_effective_date: "2026-06-18",
        commission_status: "active",
        commission_last_modified: new Date().toISOString()
      };
      migrated = true;
    }
    if (!data.partners["p2"]) {
      data.partners["p2"] = {
        id: "p2",
        name: "Evasion Marine",
        phone: "0660987654",
        email: "contact@evasion.dz",
        boats: 5,
        total_revenue: 4500000,
        joined: "Avril 2026",
        status: "active",
        commission_rate: 15,
        commission_effective_date: "2026-06-18",
        commission_status: "active",
        commission_last_modified: new Date().toISOString()
      };
      migrated = true;
    }
    if (migrated) {
      fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    }
    return data;
  } catch {
    return {};
  }
}

export function saveMockDb(data: any) {
  try {
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write mock db", err);
  }
}
