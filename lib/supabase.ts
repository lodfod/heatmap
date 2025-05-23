import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to fetch events with optional genre filter
export async function fetchEvents(genre?: string) {
  let query = supabase
    .from('events')
    .select('*');

  if (genre && genre !== 'all') {
    query = query.eq('genre', genre);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }

  return data;
}

// Helper function to create a new event
export async function createEvent(event: any) {
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }

  return data;
}

// Helper function to update an event
export async function updateEvent(id: string, updates: any) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    throw error;
  }

  return data;
}

// Helper function to delete an event
export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
} 