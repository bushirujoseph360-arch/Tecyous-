export interface Team {
  id: string;
  name: string;
  flag: string;
  group: string;
}

export interface MatchEvent {
  id: string;
  minute: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution';
  player: string;
  teamId: string;
  assist?: string;
  playerOut?: string;
}

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
}

export interface Player {
  name: string;
  number: number;
  position: 'GK' | 'DF' | 'MF' | 'FW';
}

export interface Lineups {
  home: {
    starting: Player[];
    bench: Player[];
  };
  away: {
    starting: Player[];
    bench: Player[];
  };
}

export interface HostCity {
  id: string;
  name: string;
  country: 'USA' | 'Canada' | 'Mexico';
  stadium: string;
  capacity: number;
  description: string;
  image: string;
  timezone: string;
  coordinates: { lat: number; lng: number };
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  date: string; // ISO string in UTC
  venue: string;
  cityId: string;
  stage: 'Group' | 'Round of 32' | 'Round of 16' | 'Quarter-finals' | 'Semi-finals' | 'Third place' | 'Final';
  group?: string;
  homeScore?: number;
  awayScore?: number;
  status: 'Scheduled' | 'Live' | 'Finished';
  events?: MatchEvent[];
  stats?: MatchStats;
  lineups?: Lineups;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'user';
}
