export interface Team {
  id: string;
  name: string;
  flag: string;
  group: string;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  date: string; // ISO string
  venue: string;
  stage: 'Group' | 'Round of 32' | 'Round of 16' | 'Quarter-finals' | 'Semi-finals' | 'Third place' | 'Final';
  group?: string;
  homeScore?: number;
  awayScore?: number;
  status: 'Scheduled' | 'Live' | 'Finished';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'user';
}
