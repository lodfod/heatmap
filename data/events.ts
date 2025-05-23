// Define types
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

// Event data
export const eventDetails: Record<string, EventDetails> = {
  "1": {
    id: "1",
    title: "Quantum Feedback Live",
    date: "Friday, Jun 7, 2023 • 8:00 PM",
    location: "Kappa Sigma",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
    description:
      "Indie rock sensation Quantum Feedback is bringing their energetic set to Kappa Sigma. Known for their innovative sound blending electronic beats with classic rock influences, this is a show you won't want to miss. Open to all students with Stanford ID.",
    organizer: "Kappa Sigma",
    attendeeCount: 42,
    isAttending: true,
    genre: "rock",
    attendees: [
      {
        id: "1",
        name: "Alex Johnson",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      },
      {
        id: "2",
        name: "Emma Wilson",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
      },
      {
        id: "3",
        name: "Michael Brown",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      },
      {
        id: "4",
        name: "Sophia Chen",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
      },
      {
        id: "5",
        name: "David Kim",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      },
    ],
    photos: [
      "https://images.unsplash.com/photo-1496024840928-4c417adf211d",
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
    ],
    comments: [
      {
        id: "1",
        user: "Emma Wilson",
        text: "I've been waiting for them to come to campus!",
        timestamp: "2 days ago",
      },
      {
        id: "2",
        user: "Michael Brown",
        text: "Will they play their new single?",
        timestamp: "1 day ago",
      },
      {
        id: "3",
        user: "Alex Johnson",
        text: "Yes, and they're bringing special effects for the show!",
        timestamp: "1 day ago",
      },
    ],
  },
  "2": {
    id: "2",
    title: "Algorithm & Blues Jazz Quartet",
    date: "Tuesday, Jun 4, 2023 • 3:00 PM",
    location: "Bing Concert Hall",
    imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952",
    description:
      "The Algorithm & Blues Jazz Quartet brings their technical mastery and smooth sounds to Bing Concert Hall. Featuring students from the CS and Music departments, this unique ensemble combines computational concepts with classic jazz progressions for a one-of-a-kind musical experience.",
    organizer: "Music Department",
    attendeeCount: 24,
    isAttending: true,
    genre: "jazz",
    attendees: [
      {
        id: "1",
        name: "Alex Johnson",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      },
      {
        id: "2",
        name: "Emma Wilson",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
      },
      {
        id: "3",
        name: "Michael Brown",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      },
    ],
    photos: [
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998",
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f",
    ],
    comments: [
      {
        id: "1",
        user: "Alex Johnson",
        text: "Will the performance be recorded?",
        timestamp: "3 days ago",
      },
      {
        id: "2",
        user: "Music Department",
        text: "Yes, recordings will be available on our website after the event.",
        timestamp: "2 days ago",
      },
    ],
  },
  "3": {
    id: "3",
    title: "Recursive Beats: Electronic Showcase",
    date: "Monday, Jun 3, 2023 • 5:30 PM",
    location: "Narnia (Row House)",
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
    description:
      "Narnia presents an evening of cutting-edge electronic music featuring Stanford's best DJs and producers. From ambient soundscapes to dance floor bangers, experience a diverse range of electronic music genres in this intimate row house venue.",
    organizer: "Narnia House",
    attendeeCount: 18,
    genre: "electronic",
    attendees: [
      {
        id: "2",
        name: "Emma Wilson",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
      },
      {
        id: "4",
        name: "Sophia Chen",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
      },
      {
        id: "9",
        name: "Taylor Rodriguez",
        image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef",
      },
    ],
    photos: [
      "https://images.unsplash.com/photo-1544928147-79a2dbc1f389",
      "https://images.unsplash.com/photo-1535016120720-40c646be5580",
      "https://images.unsplash.com/photo-1553028826-f4804a6dba3b",
    ],
    comments: [
      {
        id: "1",
        user: "Taylor Rodriguez",
        text: "Who's the headlining DJ?",
        timestamp: "3 days ago",
      },
      {
        id: "2",
        user: "Narnia House",
        text: "DJ Algo will be closing the night with a 90-minute set!",
        timestamp: "2 days ago",
      },
    ],
  },
  "4": {
    id: "4",
    title: "Battle of the Bands: Finals",
    date: "Saturday, Jun 8, 2023 • 2:00 PM",
    location: "White Plaza",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018",
    description:
      "The final showdown of Stanford's annual Battle of the Bands competition! The top three campus bands will compete for the championship title, campus-wide recognition, and a recording session at the Stanford Music Studio. Come support live music and vote for your favorite performance!",
    organizer: "Stanford Arts",
    attendeeCount: 56,
    genre: "rock",
    attendees: [
      {
        id: "1",
        name: "Alex Johnson",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      },
      {
        id: "3",
        name: "Michael Brown",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      },
      {
        id: "7",
        name: "Ryan Park",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
      },
      {
        id: "8",
        name: "Sarah Miller",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      },
    ],
    photos: [
      "https://images.unsplash.com/photo-1560272564-c83b66b1ad12",
      "https://images.unsplash.com/photo-1550881111-7cfde14b8073",
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d",
    ],
    comments: [
      {
        id: "1",
        user: "Ryan Park",
        text: "Which bands made it to the finals?",
        timestamp: "2 days ago",
      },
      {
        id: "2",
        user: "Stanford Arts",
        text: "The Binary Beats, Recursive Function, and Neural Noise!",
        timestamp: "1 day ago",
      },
      {
        id: "3",
        user: "Sarah Miller",
        text: "Go Binary Beats!",
        timestamp: "1 day ago",
      },
    ],
  },
  "5": {
    id: "5",
    title: "Acoustic Sunset Series",
    date: "Thursday, Jun 13, 2023 • 6:00 PM",
    location: "Toussaint House (Row)",
    imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
    description:
      "Join us for an intimate evening of acoustic performances on the Toussaint House patio. Stanford singer-songwriters will share original compositions and creative covers in this relaxed, sunset setting. Light refreshments provided.",
    organizer: "Toussaint House",
    attendeeCount: 31,
    isAttending: true,
    genre: "rock",
    attendees: [
      {
        id: "1",
        name: "Alex Johnson",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      },
      {
        id: "5",
        name: "David Kim",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      },
      {
        id: "10",
        name: "Olivia Martinez",
        image: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43",
      },
      {
        id: "11",
        name: "James Wilson",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      },
    ],
    photos: [
      "https://images.unsplash.com/photo-1556761175-b413da4baf72",
      "https://images.unsplash.com/photo-1556125574-d7f27ec36a06",
      "https://images.unsplash.com/photo-1540317580384-e5d43867caa6",
    ],
    comments: [
      {
        id: "1",
        user: "Olivia Martinez",
        text: "These sunset sessions are always so peaceful!",
        timestamp: "2 days ago",
      },
      {
        id: "2",
        user: "Toussaint House",
        text: "We have a special guest performer from the Music Department faculty this week!",
        timestamp: "1 day ago",
      },
    ],
  },
  "103": {
    id: "103",
    title: "Neural Networks: Live Hip-Hop Showcase",
    date: "Sunday, Jun 9, 2023 • 3:00 PM",
    location: "Sigma Nu",
    imageUrl: "https://images.unsplash.com/photo-1518407613690-d9fc990e795f",
    description:
      "Sigma Nu presents Neural Networks, a live hip-hop showcase featuring Stanford's best rappers, producers, and beatmakers. This event will blend freestyle battles, curated performances, and audience participation for an unforgettable hip-hop experience.",
    organizer: "Sigma Nu",
    attendeeCount: 34,
    isAttending: true,
    genre: "hiphop",
    attendees: [
      {
        id: "1",
        name: "Alex Johnson",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      },
      {
        id: "5",
        name: "David Kim",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      },
      {
        id: "6",
        name: "Jessica Liu",
        image: "https://images.unsplash.com/photo-1554151228-14d9def656e4",
      },
    ],
    photos: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc",
      "https://images.unsplash.com/photo-1504450758481-7338eba7524a",
      "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2",
    ],
    comments: [
      {
        id: "1",
        user: "David Kim",
        text: "Can't wait to see the freestyle battles!",
        timestamp: "1 day ago",
      },
      {
        id: "2",
        user: "Jessica Liu",
        text: "Will there be merchandise for sale?",
        timestamp: "12 hours ago",
      },
      {
        id: "3",
        user: "Sigma Nu",
        text: "Yes, limited edition Neural Networks t-shirts and hoodies will be available!",
        timestamp: "10 hours ago",
      },
    ],
  },
  "104": {
    id: "104",
    title: "AI-Generated Music Symposium",
    date: "Tuesday, Jun 11, 2023 • 4:00 PM",
    location: "CCRMA (Center for Computer Research in Music and Acoustics)",
    imageUrl: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f",
    description:
      "Experience the cutting edge of music technology at this AI-Generated Music Symposium. Stanford researchers will demonstrate systems that compose original music, improvise with human musicians, and create entirely new sounds. Live performances will showcase collaborations between humans and AI.",
    organizer: "CCRMA",
    attendeeCount: 18,
    genre: "electronic",
    attendees: [
      {
        id: "3",
        name: "Michael Brown",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      },
      {
        id: "4",
        name: "Sophia Chen",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
      },
      {
        id: "12",
        name: "Professor Williams",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      },
    ],
    photos: [
      "https://images.unsplash.com/photo-1573166364524-d9dbfd8bbf83",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678",
    ],
    comments: [
      {
        id: "1",
        user: "Professor Williams",
        text: "We'll be premiering a new AI-human collaborative composition.",
        timestamp: "3 days ago",
      },
      {
        id: "2",
        user: "Michael Brown",
        text: "Will there be a hands-on demo of the systems?",
        timestamp: "2 days ago",
      },
      {
        id: "3",
        user: "CCRMA",
        text: "Yes, attendees can experiment with our interfaces during the reception!",
        timestamp: "1 day ago",
      },
    ],
  },
  "105": {
    id: "105",
    title: "World Music Festival",
    date: "Thursday, Jun 13, 2023 • 11:00 AM",
    location: "Meyer Green",
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033",
    description:
      "Celebrate global musical traditions at Stanford's World Music Festival. Cultural student groups will present performances spanning continents and centuries, from traditional Chinese orchestras to African drumming ensembles. Food vendors will offer international cuisine to complement the musical journey.",
    organizer: "Stanford Global Studies",
    attendeeCount: 27,
    genre: "world",
    attendees: [
      {
        id: "2",
        name: "Emma Wilson",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
      },
      {
        id: "8",
        name: "Sarah Miller",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      },
      {
        id: "13",
        name: "Lisa Thompson",
        image: "https://images.unsplash.com/photo-1532910404247-7ee9488d7292",
      },
    ],
    photos: [
      "https://images.unsplash.com/photo-1466551773139-90579850c221",
      "https://images.unsplash.com/photo-1543257580-7269da773bf5",
      "https://images.unsplash.com/photo-1454944338482-a69bb95894af",
    ],
    comments: [
      {
        id: "1",
        user: "Lisa Thompson",
        text: "Which cultural groups will be performing?",
        timestamp: "3 days ago",
      },
      {
        id: "2",
        user: "Stanford Global Studies",
        text: "We'll have 15+ groups including Taiko, Mariachi, Bhangra, and many more!",
        timestamp: "2 days ago",
      },
      {
        id: "3",
        user: "Emma Wilson",
        text: "Can't wait to experience all the different musical traditions!",
        timestamp: "1 day ago",
      },
    ],
  },
};

// Simplified event clusters for the map view
export const mapClusters: EventMapCluster[] = [
  {
    id: "cluster1",
    coordinate: { latitude: 37.427619, longitude: -122.170732 }, // Campus Music Venues
    count: 3, // 3 events in this cluster
    isHot: true,
  },
  {
    id: "cluster2",
    coordinate: { latitude: 37.429913, longitude: -122.173648 }, // Academic Music Events
    count: 3, // 2 events in this cluster
    isHot: false,
  },
  {
    id: "cluster3",
    coordinate: { latitude: 37.424125, longitude: -122.166427 }, // Alternative Music Scene
    count: 3, // 3 events in this cluster
    isHot: true,
  },
];

// Event clusters for detail views
export const eventClusters: Record<string, EventCluster> = {
  cluster1: {
    id: "cluster1",
    name: "Campus Music Venues",
    coordinates: { latitude: 37.427619, longitude: -122.170732 },
    description: "Music events happening at Stanford's main campus venues.",
    events: [
      {
        id: "1",
        title: "Quantum Feedback Live",
        date: "Friday, Jun 7, 2023 • 8:00 PM",
        location: "Kappa Sigma",
        imageUrl:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
        attendees: 42,
        isAttending: true,
      },
      {
        id: "4",
        title: "Battle of the Bands: Finals",
        date: "Saturday, Jun 8, 2023 • 2:00 PM",
        location: "White Plaza",
        imageUrl:
          "https://images.unsplash.com/photo-1574629810360-7efbbe195018",
        attendees: 56,
      },
      {
        id: "103",
        title: "Neural Networks: Live Hip-Hop Showcase",
        date: "Sunday, Jun 9, 2023 • 3:00 PM",
        location: "Sigma Nu",
        imageUrl:
          "https://images.unsplash.com/photo-1518407613690-d9fc990e795f",
        attendees: 34,
        isAttending: true,
      },
    ],
  },
  cluster2: {
    id: "cluster2",
    name: "Academic Music Events",
    coordinates: { latitude: 37.429913, longitude: -122.173648 },
    description: "Music performances and discussions in academic settings.",
    events: [
      {
        id: "2",
        title: "Algorithm & Blues Jazz Quartet",
        date: "Tuesday, Jun 4, 2023 • 3:00 PM",
        location: "Bing Concert Hall",
        imageUrl:
          "https://images.unsplash.com/photo-1517048676732-d65bc937f952",
        attendees: 24,
        isAttending: true,
      },
      {
        id: "104",
        title: "AI-Generated Music Symposium",
        date: "Tuesday, Jun 11, 2023 • 4:00 PM",
        location: "CCRMA (Center for Computer Research in Music and Acoustics)",
        imageUrl: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f",
        attendees: 18,
      },
      {
        id: "105",
        title: "Thingy",
        date: "Tuesday, July 27, 2025 • 12:44 PM",
        location: "Gates Computer Science Building",
        imageUrl: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f",
        attendees: 18,
        isAttending: true,
      },
    ],
  },
  cluster3: {
    id: "cluster3",
    name: "Alternative Music Scene",
    coordinates: { latitude: 37.424125, longitude: -122.166427 },
    description: "Underground and alternative music events around campus.",
    events: [
      {
        id: "3",
        title: "Recursive Beats: Electronic Showcase",
        date: "Monday, Jun 3, 2023 • 5:30 PM",
        location: "Narnia (Row House)",
        imageUrl:
          "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
        attendees: 18,
      },
      {
        id: "5",
        title: "Acoustic Sunset Series",
        date: "Thursday, Jun 13, 2023 • 6:00 PM",
        location: "Toussaint House (Row)",
        imageUrl:
          "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
        attendees: 31,
        isAttending: true,
      },
      {
        id: "105",
        title: "World Music Festival",
        date: "Thursday, Jun 13, 2023 • 11:00 AM",
        location: "Meyer Green",
        imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033",
        attendees: 27,
      },
    ],
  },
};

// Helper function to get all events for the home screen
export function getAllEvents() {
  return Object.values(eventDetails).map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    location: event.location,
    imageUrl: event.imageUrl,
    attendees: event.attendeeCount,
  }));
}

// Helper function to get event by id
export function getEventById(id: string) {
  return eventDetails[id];
}

// Helper function to get events by filter
export function getFilteredEvents(filter: string) {
  if (filter === "all") return getAllEvents();

  return Object.values(eventDetails)
    .filter((event) => {
      if (filter === "today") {
        // Just a simple filter for today's date - in a real app, you'd use proper date filtering
        return event.date.includes("Jun 3");
      }
      if (filter === "weekend") {
        return event.date.includes("Saturday") || event.date.includes("Sunday");
      }
      return event.genre === filter;
    })
    .map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      location: event.location,
      imageUrl: event.imageUrl,
      attendees: event.attendeeCount,
    }));
}

// Generate a new event ID (higher than existing IDs)
export function generateEventId(): string {
  const existingIds = Object.keys(eventDetails).map((id) => parseInt(id));
  const maxId = Math.max(...existingIds, 105); // 105 is our current highest ID
  return (maxId + 1).toString();
}

// Find the nearest cluster to a given coordinate
function findNearestCluster(
  latitude: number,
  longitude: number
): string | undefined {
  // Calculate distance between two coordinates using Haversine formula
  function getDistance(
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

  let nearestClusterId: string | undefined;
  let shortestDistance = Infinity;

  // Compare with all clusters to find the nearest one
  Object.entries(eventClusters).forEach(([clusterId, cluster]) => {
    const distance = getDistance(
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

// Create a new event
export interface NewEventData {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  imageUrl: string;
  genre?: string;
}

export function addNewEvent(eventData: NewEventData): string {
  // Generate a new ID for the event
  const newId = generateEventId();

  // Format date string for consistency
  const dateTime = `${eventData.date} • ${eventData.time}`;

  // Create the new event object
  const newEvent: EventDetails = {
    id: newId,
    title: eventData.title,
    date: dateTime,
    location: eventData.location,
    imageUrl:
      eventData.imageUrl ||
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30", // Default image if none provided
    description: eventData.description,
    organizer: "User Created Event", // Default organizer
    attendeeCount: 1, // Start with 1 attendee (the creator)
    isAttending: true, // The creator is automatically attending
    genre: eventData.genre || "rock", // Default genre if none specified
    attendees: [
      {
        id: "1", // Default user
        name: "Alex Johnson",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      },
    ],
    photos: [], // No photos initially
    comments: [], // No comments initially
  };

  // Add the event to our event details collection
  eventDetails[newId] = newEvent;

  // Find nearest cluster based on coordinates
  const nearestClusterId = findNearestCluster(
    eventData.coordinates.latitude,
    eventData.coordinates.longitude
  );

  if (nearestClusterId) {
    // Add the event to the nearest cluster
    const clusterEvent = {
      id: newId,
      title: eventData.title,
      date: dateTime,
      location: eventData.location,
      imageUrl:
        eventData.imageUrl ||
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
      attendees: 1,
      isAttending: true,
    };

    eventClusters[nearestClusterId].events.push(clusterEvent);

    // Update the map marker count for this cluster
    const clusterIndex = mapClusters.findIndex(
      (cluster) => cluster.id === nearestClusterId
    );
    if (clusterIndex !== -1) {
      mapClusters[clusterIndex].count += 1;
    }
  } else {
    // If no nearby cluster, we could create a new one in a real app
    // For now, just add it to the first cluster
    const defaultCluster = "cluster1";
    const clusterEvent = {
      id: newId,
      title: eventData.title,
      date: dateTime,
      location: eventData.location,
      imageUrl:
        eventData.imageUrl ||
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
      attendees: 1,
      isAttending: true,
    };

    eventClusters[defaultCluster].events.push(clusterEvent);

    // Update the map marker count for the default cluster
    const clusterIndex = mapClusters.findIndex(
      (cluster) => cluster.id === defaultCluster
    );
    if (clusterIndex !== -1) {
      mapClusters[clusterIndex].count += 1;
    }
  }

  return newId;
}
