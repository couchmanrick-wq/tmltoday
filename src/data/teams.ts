import { Team, Player } from '@/types';

export const TORONTO_MAPLE_LEAFS: Team = {
  id: 'tor',
  name: 'Toronto Maple Leafs',
  abbreviation: 'TOR',
  city: 'Toronto',
  logo: '/images/leafs-logo.svg',
  founded: 1926,
  description:
    'The Toronto Maple Leafs are a professional ice hockey team based in Toronto, Ontario. They compete in the National Hockey League (NHL) as a member of the Atlantic Division of the Eastern Conference.',
};

// Mock team roster - replace with actual current roster
export const LEAFS_ROSTER: Player[] = [
  {
    id: 'player-1',
    name: 'Auston Matthews',
    number: 34,
    position: 'C',
    team: 'TOR',
    shoots: 'L',
    height: "6'4\"",
    weight: '221 lbs',
    birthDate: '1997-09-17',
    birthplace: 'Phoenix, Arizona',
    mentions: 145,
  },
  {
    id: 'player-3',
    name: 'William Nylander',
    number: 88,
    position: 'RW',
    team: 'TOR',
    shoots: 'R',
    height: "6'0\"",
    weight: '200 lbs',
    birthDate: '1996-05-29',
    birthplace: 'Calgary, Alberta',
    mentions: 98,
  },
  {
    id: 'player-4',
    name: 'John Tavares',
    number: 91,
    position: 'C',
    team: 'TOR',
    shoots: 'L',
    height: "6'1\"",
    weight: '220 lbs',
    birthDate: '1990-09-20',
    birthplace: 'Mississauga, Ontario',
    mentions: 87,
  },
  {
    id: 'player-5',
    name: 'Matthew Knies',
    number: 23,
    position: 'LW',
    team: 'TOR',
    shoots: 'L',
    height: "6'3\"",
    weight: '227 lbs',
    birthDate: '2002-10-17',
    birthplace: 'Phoenix, Arizona',
    mentions: 76,
  },
  {
    id: 'player-6',
    name: 'Morgan Rielly',
    number: 44,
    position: 'D',
    team: 'TOR',
    shoots: 'L',
    height: "6'1\"",
    weight: '221 lbs',
    birthDate: '1994-03-09',
    birthplace: 'Vancouver, British Columbia',
    mentions: 69,
  },
  {
    id: 'player-7',
    name: 'Max Domi',
    number: 11,
    position: 'C',
    team: 'TOR',
    shoots: 'L',
    height: "5'10\"",
    weight: '192 lbs',
    birthDate: '1995-03-02',
    birthplace: 'Winnipeg, Manitoba',
    mentions: 61,
  },
];

// Trending players
export const getTrendingPlayers = (): Player[] => {
  return LEAFS_ROSTER.sort((a, b) => (b.mentions || 0) - (a.mentions || 0));
};

// Player profile URL slug: Lastname + first initial, e.g. "John Tavares" -> "TavaresJ".
export function playerSlug(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? '';
  const last = parts[parts.length - 1] ?? '';
  return `${last}${first.charAt(0)}`.replace(/[^A-Za-z0-9]/g, '');
}

export function findLeafBySlug(slug: string): Player | undefined {
  const target = slug.toLowerCase();
  return LEAFS_ROSTER.find((player) => playerSlug(player.name).toLowerCase() === target);
}
