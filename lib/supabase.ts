import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client with environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Updated type definition for event with all required fields
export interface Event {
  id: string;
  title: string;
  description?: string;
  genre?: string;
  latitude: number;
  longitude: number;
  event_count?: number;
  is_hot?: boolean;
  created_at?: string;

  // Additional fields that might be in the database
  date?: string;
  location?: string;
  imageUrl?: string;
  created_by?: string;
  event_visibility?: boolean;
}

// Helper function to fetch events with optional genre filter
export async function fetchEvents(genre?: string) {
  let query = supabase.from("events").select("*");

  if (genre && genre !== "all") {
    query = query.eq("genre", genre);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching events:", error);
    throw error;
  }

  console.log("🔍 Fetched events:", data);
  return data as Event[];
}

// Helper function to fetch events with location data
export async function fetchEventsWithLocation(genre?: string) {
  let query = supabase
    .from("events")
    .select("*")
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  if (genre && genre !== "all") {
    query = query.eq("genre", genre);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching events with location:", error);
    throw error;
  }

  console.log("🔍 Events with location:", data);

  return data as Event[];
}

// Helper function to get a single event by ID
export async function getEventByIdFromDB(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching event by ID:", error);
    return null;
  }

  console.log("🔍 Event by ID:", data);
  return data as Event;
}

// Helper function to create a new event
export async function createEvent(event: any) {
  const { data, error } = await supabase
    .from("events")
    .insert([event])
    .select()
    .single();

  if (error) {
    console.error("Error creating event:", error);
    throw error;
  }

  return data;
}

// Helper function to update an event
export async function updateEvent(id: string, updates: any) {
  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating event:", error);
    throw error;
  }

  return data;
}

// Helper function to delete an event
export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
}
