// Define types
import {
  Event,
  fetchEvents,
  fetchEventsWithLocation,
  getEventByIdFromDB,
} from "../lib/supabase";

export interface EventAttendee {
  id: string;
  name: string;
  image: string;
}

export interface EventComment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

export interface EventDetails {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  description: string;
  organizer: string;
  attendees: EventAttendee[];
  photos: string[];
  comments: EventComment[];
  attendeeCount: number;
  isAttending?: boolean;
  genre?: string;
}

export interface EventCluster {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description: string;
  events: {
    id: string;
    title: string;
    date: string;
    location: string;
    imageUrl: string;
    attendees: number;
    isAttending?: boolean;
  }[];
}

export interface EventMapCluster {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  count: number;
  isHot: boolean;
}

// Music genres for filtering
export const musicGenres = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "weekend", label: "Weekend" },
  { id: "rock", label: "Rock" },
  { id: "electronic", label: "Electronic" },
  { id: "jazz", label: "Jazz" },
  { id: "hiphop", label: "Hip-Hop" },
];

// Cache for dynamically generated clusters to avoid repeated calculations
let cachedClusters: Record<string, EventCluster> = {};
let cachedMapClusters: EventMapCluster[] = [];
let clusterCacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to calculate distance between two coordinates using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Function to cluster events from database
export async function generateClustersFromDatabase(
  clusterRadius: number = 200, // meters
  forceRefresh: boolean = false
): Promise<{
  eventClusters: Record<string, EventCluster>;
  mapClusters: EventMapCluster[];
}> {
  const now = Date.now();

  // Return cached data if still valid and not forcing refresh
  if (
    !forceRefresh &&
    cachedClusters &&
    now - clusterCacheTimestamp < CACHE_DURATION &&
    Object.keys(cachedClusters).length > 0
  ) {
    console.log("🎯 Using cached clusters");
    return {
      eventClusters: cachedClusters,
      mapClusters: cachedMapClusters,
    };
  }

  try {
    console.log("🔄 Generating fresh clusters from database...");

    // Fetch all events with location data from database
    const events = await fetchEventsWithLocation();

    if (!events || events.length === 0) {
      console.log("⚠️ No events found in database");
      return {
        eventClusters: {},
        mapClusters: [],
      };
    }

    // Filter events with valid coordinates
    const validEvents = events.filter(
      (event) =>
        event.latitude != null &&
        event.longitude != null &&
        !isNaN(event.latitude) &&
        !isNaN(event.longitude)
    );

    console.log(`📍 Clustering ${validEvents.length} valid events...`);

    // Cluster the events
    const clusters = clusterEventsAlgorithm(validEvents, clusterRadius);

    // Convert clusters to the expected format
    const eventClusters: Record<string, EventCluster> = {};
    const mapClusters: EventMapCluster[] = [];

    clusters.forEach((cluster, index) => {
      const clusterId = `cluster_${index + 1}`;

      // Generate cluster name based on location or most common genre
      const clusterName = generateClusterName(
        cluster.events,
        cluster.centerLatitude,
        cluster.centerLongitude
      );
      const clusterDescription = generateClusterDescription(cluster.events);

      // Convert database events to EventCluster format
      const clusterEvents = cluster.events.map((event) => ({
        id: event.id,
        title: event.title,
        date: event.date || "Date TBD",
        location: event.location || "Location TBD",
        imageUrl:
          event.imageUrl ||
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
        attendees: event.event_count || 1,
        isAttending: false, // This would need to be determined based on user data
      }));

      // Create EventCluster
      eventClusters[clusterId] = {
        id: clusterId,
        name: clusterName,
        coordinates: {
          latitude: cluster.centerLatitude,
          longitude: cluster.centerLongitude,
        },
        description: clusterDescription,
        events: clusterEvents,
      };

      // Create MapCluster
      mapClusters.push({
        id: clusterId,
        coordinate: {
          latitude: cluster.centerLatitude,
          longitude: cluster.centerLongitude,
        },
        count: cluster.events.length,
        isHot: cluster.isHot,
      });
    });

    // Cache the results
    cachedClusters = eventClusters;
    cachedMapClusters = mapClusters;
    clusterCacheTimestamp = now;

    console.log(
      `✅ Generated ${Object.keys(eventClusters).length} clusters from database`
    );

    return {
      eventClusters,
      mapClusters,
    };
  } catch (error) {
    console.error("❌ Error generating clusters from database:", error);
    return {
      eventClusters: {},
      mapClusters: [],
    };
  }
}

// Clustering algorithm (similar to the one in map.tsx but adapted for our data structure)
interface DatabaseEventCluster {
  id: string;
  events: Event[];
  centerLatitude: number;
  centerLongitude: number;
  isHot: boolean;
}

function clusterEventsAlgorithm(
  events: Event[],
  clusterRadius: number = 200
): DatabaseEventCluster[] {
  const clusters: DatabaseEventCluster[] = [];
  const processedEvents = new Set<string>();

  events.forEach((event) => {
    if (processedEvents.has(event.id)) return;

    const cluster: DatabaseEventCluster = {
      id: `cluster_${event.id}`,
      events: [event],
      centerLatitude: event.latitude,
      centerLongitude: event.longitude,
      isHot: event.is_hot || false,
    };

    // Find nearby events to cluster together
    events.forEach((otherEvent) => {
      if (otherEvent.id !== event.id && !processedEvents.has(otherEvent.id)) {
        const distance = calculateDistance(
          event.latitude,
          event.longitude,
          otherEvent.latitude,
          otherEvent.longitude
        );

        if (distance <= clusterRadius) {
          cluster.events.push(otherEvent);
          processedEvents.add(otherEvent.id);
        }
      }
    });

    // Calculate cluster center (average of all event coordinates)
    if (cluster.events.length > 1) {
      const totalLat = cluster.events.reduce((sum, e) => sum + e.latitude, 0);
      const totalLng = cluster.events.reduce((sum, e) => sum + e.longitude, 0);
      cluster.centerLatitude = totalLat / cluster.events.length;
      cluster.centerLongitude = totalLng / cluster.events.length;
    }

    // Mark as hot if any event in cluster is hot or if cluster has many events
    cluster.isHot =
      cluster.events.some((e) => e.is_hot) || cluster.events.length >= 3;

    clusters.push(cluster);
    processedEvents.add(event.id);
  });

  return clusters;
}

// Generate a meaningful name for the cluster based on events and location
function generateClusterName(
  events: Event[],
  latitude: number,
  longitude: number
): string {
  // You could integrate with a reverse geocoding service here
  // For now, we'll use simple logic based on the events

  const genreCounts: Record<string, number> = {};
  events.forEach((event) => {
    if (event.genre) {
      genreCounts[event.genre] = (genreCounts[event.genre] || 0) + 1;
    }
  });

  const mostCommonGenre = Object.entries(genreCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0];

  if (mostCommonGenre) {
    const genreNames: Record<string, string> = {
      rock: "Rock Music",
      electronic: "Electronic Music",
      jazz: "Jazz",
      hiphop: "Hip-Hop",
      world: "World Music",
    };
    return `${genreNames[mostCommonGenre] || mostCommonGenre} Hub`;
  }

  // Default names based on cluster size
  if (events.length >= 5) {
    return "Major Event Hub";
  } else if (events.length >= 3) {
    return "Event Cluster";
  } else {
    return `${events[0]?.location || "Event"} Area`;
  }
}

// Generate a description for the cluster
function generateClusterDescription(events: Event[]): string {
  const eventCount = events.length;
  const totalAttendees = events.reduce(
    (sum, event) => sum + (event.event_count || 1),
    0
  );

  if (eventCount === 1) {
    return `A single event location with ${totalAttendees} expected attendees.`;
  }

  return `A cluster of ${eventCount} events with ${totalAttendees} total expected attendees.`;
}

// Updated function to get clusters (now dynamic)
export async function getEventClusters(
  forceRefresh: boolean = false
): Promise<Record<string, EventCluster>> {
  const { eventClusters } = await generateClustersFromDatabase(
    200,
    forceRefresh
  );
  return eventClusters;
}

// Updated function to get map clusters (now dynamic)
export async function getMapClusters(
  forceRefresh: boolean = false
): Promise<EventMapCluster[]> {
  const { mapClusters } = await generateClustersFromDatabase(200, forceRefresh);
  return mapClusters;
}

// Updated findNearestCluster function to work with dynamic clusters
export async function findNearestCluster(
  latitude: number,
  longitude: number
): Promise<string | undefined> {
  const eventClusters = await getEventClusters();

  let nearestClusterId: string | undefined;
  let shortestDistance = Infinity;

  // Compare with all clusters to find the nearest one
  Object.entries(eventClusters).forEach(([clusterId, cluster]) => {
    const distance = calculateDistance(
      latitude,
      longitude,
      cluster.coordinates.latitude,
      cluster.coordinates.longitude
    );

    // If this cluster is closer than the current nearest one, update
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestClusterId = clusterId;
    }
  });

  // Only consider as "nearby" if within 500 meters
  if (shortestDistance <= 500) {
    return nearestClusterId;
  }

  return undefined;
}

// Function to refresh cluster cache (useful for when new events are added via external means)
export function refreshClusterCache(): void {
  clusterCacheTimestamp = 0;
  cachedClusters = {};
  cachedMapClusters = [];
}

// For map usage - get raw Event objects with location only
export async function getEventsWithLocation(
  filter: string = "all"
): Promise<Event[]> {
  try {
    const events = await fetchEvents(filter === "all" ? undefined : filter);

    if (!events) return [];

    // Filter for events with valid location data
    const eventsWithLocation = events.filter(
      (event) =>
        event.latitude != null &&
        event.longitude != null &&
        !isNaN(event.latitude) &&
        !isNaN(event.longitude)
    );

    // Apply additional filtering for special cases
    const filteredEvents = eventsWithLocation.filter((event) => {
      if (filter === "today") {
        const today = new Date().toDateString();
        const eventDate = new Date(event.date || "").toDateString();
        return eventDate === today;
      }
      if (filter === "weekend") {
        const eventDate = new Date(event.date || "");
        const dayOfWeek = eventDate.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6;
      }
      return true;
    });

    return filteredEvents; // Return raw Event objects for map usage
  } catch (error) {
    console.error("Error fetching events with location:", error);
    return [];
  }
}

// Updated function to get events by filter for UI components
export async function getFilteredEvents(filter: string) {
  try {
    const events = await fetchEvents(filter === "all" ? undefined : filter);

    if (!events) return [];

    // Apply additional filtering for special cases
    const filteredEvents = events.filter((event) => {
      if (filter === "today") {
        const today = new Date().toDateString();
        const eventDate = new Date(event.date || "").toDateString();
        return eventDate === today;
      }
      if (filter === "weekend") {
        const eventDate = new Date(event.date || "");
        const dayOfWeek = eventDate.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6;
      }
      return true;
    });

    // Convert to UI format
    return filteredEvents.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date || "Date TBD",
      location: event.location || "Location TBD",
      imageUrl:
        event.imageUrl ||
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
      attendees: event.event_count || 1,
    }));
  } catch (error) {
    console.error("Error fetching filtered events:", error);
    return [];
  }
}

// Simplified function for all events (UI format)
export async function getAllEvents() {
  const events = await fetchEvents();
  console.log("📱 Fetched events from database:");
  events.forEach((event, index) => {
    console.log(
      `📷 Event ${index + 1}: "${event.title}" - Image: ${event.imageUrl}`
    );
  });
  return events;
}

// Helper function to get event by id (now from database)
export async function getEventById(id: string): Promise<Event | null> {
  try {
    console.log("🔍 Looking for event with ID:", id);

    // Try to get the event directly from the database
    const event = await getEventByIdFromDB(id);

    if (event) {
      console.log("✅ Found event in database:", event);
      return event;
    }

    console.log("⚠️ Event not found in database with ID:", id);
    return null;
  } catch (error) {
    console.error("❌ Error fetching event by id:", error);
    return null;
  }
}

// Generate a new event ID (now UUID-based since database uses UUIDs)
export function generateEventId(): string {
  // Since the database uses UUIDs, we'll let the database generate the ID
  // This function is mainly for compatibility, but in practice the database will generate the ID
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `temp-${Date.now()}-${Math.random()}`;
}

// Interface for new event data
export interface NewEventData {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  created_by: string; // Should be UUID
  genre: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  latitude: number;
  longitude: number;
  imageUrl: string;
  event_visibility: string; // Add this field
}

// Updated addNewEvent function to work entirely with database
export async function addNewEvent(eventData: NewEventData): string {
  // The database will generate the ID automatically, so we don't need to generate one
  // We'll return the ID from the database response

  // Invalidate cluster cache since we're adding a new event
  refreshClusterCache();

  // The actual database insertion should be handled by the calling code
  // This function now mainly serves to invalidate cache and format data

  console.log("Adding new event, cluster cache invalidated");

  // Return a temporary ID - the actual ID will come from the database
  return generateEventId();
}

// Legacy compatibility exports (now empty arrays since we removed dummy data)
export const mapClusters: EventMapCluster[] = [];
export const eventClusters: Record<string, EventCluster> = {};
