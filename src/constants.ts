import { HostCity } from './types';

export const HOST_CITIES: HostCity[] = [
  {
    id: 'ny-nj',
    name: 'New York/New Jersey',
    country: 'USA',
    stadium: 'MetLife Stadium',
    capacity: 82500,
    description: 'Bientôt le théâtre de la grande finale, ce stade emblématique offre une vue imprenable sur la skyline de Manhattan.',
    image: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=1000',
    timezone: 'America/New_York',
    coordinates: { lat: 40.8128, lng: -74.0742 }
  },
  {
    id: 'la',
    name: 'Los Angeles',
    country: 'USA',
    stadium: 'SoFi Stadium',
    capacity: 70000,
    description: 'Le stade le plus moderne du monde, avec son toit transparent et son écran géant révolutionnaire.',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=1000',
    timezone: 'America/Los_Angeles',
    coordinates: { lat: 33.9535, lng: -118.3392 }
  },
  {
    id: 'mx-city',
    name: 'Mexico City',
    country: 'Mexico',
    stadium: 'Estadio Azteca',
    capacity: 87523,
    description: 'Le temple du football mondial, premier stade à accueillir trois matchs d\'ouverture de Coupe du Monde.',
    image: 'https://images.unsplash.com/photo-1518105779042-763533945e41?q=80&w=1000',
    timezone: 'America/Mexico_City',
    coordinates: { lat: 19.3029, lng: -99.1505 }
  },
  {
    id: 'vancouver',
    name: 'Vancouver',
    country: 'Canada',
    stadium: 'BC Place',
    capacity: 54500,
    description: 'Situé au bord de l\'eau, ce stade au toit rétractable est le joyau du sport canadien.',
    image: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?q=80&w=1000',
    timezone: 'America/Vancouver',
    coordinates: { lat: 49.2768, lng: -123.1120 }
  },
  {
    id: 'toronto',
    name: 'Toronto',
    country: 'Canada',
    stadium: 'BMO Field',
    capacity: 45000,
    description: 'Le cœur du football au Canada, offrant une atmosphère intime et passionnée.',
    image: 'https://images.unsplash.com/photo-1502675135487-e971002a6adb?q=80&w=1000',
    timezone: 'America/Toronto',
    coordinates: { lat: 43.6332, lng: -79.4186 }
  }
  // Simplified for demo, can add more
];

export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export const STAGES = [
  'Group',
  'Round of 32',
  'Round of 16',
  'Quarter-finals',
  'Semi-finals',
  'Third place',
  'Final'
];

export const VENUES = [
  'MetLife Stadium, New York/New Jersey',
  'AT&T Stadium, Dallas',
  'Arrowhead Stadium, Kansas City',
  'NRG Stadium, Houston',
  'Mercedes-Benz Stadium, Atlanta',
  'SoFi Stadium, Los Angeles',
  'Lincoln Financial Field, Philadelphia',
  'Lumen Field, Seattle',
  'Levi\'s Stadium, San Francisco Bay Area',
  'Gillette Stadium, Boston',
  'Hard Rock Stadium, Miami',
  'BC Place, Vancouver',
  'BMO Field, Toronto',
  'Estadio Azteca, Mexico City',
  'Estadio BBVA, Monterrey',
  'Estadio Akron, Guadalajara'
];
