# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Heatmap is a location-based event discovery and creation mobile app built with React Native and Expo. The app allows users to:

- View events on an interactive map with clustering functionality
- Create and manage music events
- Filter events by genre
- Search for locations using Google Places API
- Upload event images
- View event details

## Development Commands

### Setup and Installation

```bash
# Install dependencies
npm install

# Start the development server
npx expo start

# Start for specific platforms
npm run android
npm run ios
npm run web
```

### Development Tools

```bash
# Run ESLint to check code quality
npm run lint
```

## Architecture

### Tech Stack

- **Frontend**: React Native with Expo
- **Routing**: Expo Router (file-based routing)
- **Backend/Database**: Supabase
- **Maps**: React Native Maps, Google Maps API
- **Location Search**: Google Places Autocomplete

### Key Files and Directories

- `/app/` - Contains all screens and routes using Expo Router's file-based routing
  - `(tabs)/` - Main app tabs (map, create, discover, profile)
  - `event/[id].tsx` - Event detail screen
  - `cluster/[id].tsx` - Cluster detail screen
  
- `/components/` - Reusable UI components
  - `EventCard.tsx` - Card component for displaying event information
  - `EventForm.tsx` - Form for creating/editing events
  - `MapMarker.tsx` - Custom map marker implementation
  - `LocationSearch.tsx` - Google Places autocomplete component
  
- `/lib/supabase.ts` - Supabase client configuration and helper functions
- `/constants/` - Theme, colors, and typography definitions
- `/data/` - Sample data and data structures

### Data Flow

1. Events are stored in Supabase database
2. Event data is fetched and displayed on the map
3. Users can filter events by genre
4. Nearby events are clustered on the map at lower zoom levels
5. Events can be created using the EventForm component
6. Images are uploaded to Supabase storage

### Authentication Flow

The app uses Supabase for authentication. Users can sign up, log in, and manage their profile information.

## Working with Maps and Location

- The app uses React Native Maps for the map implementation
- Google Places API is used for location search and autocomplete
- Events are displayed as markers on the map
- Clustering logic groups nearby events when zoomed out

## Supabase Integration

- Supabase is used as the backend database and storage solution
- `lib/supabase.ts` contains the client configuration
- Events are stored in a Supabase table with fields for title, description, location, coordinates, genre, etc.
- Images are stored in Supabase storage