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
    id: 'player-2',
    name: 'Mitch Marner',
    number: 16,
    position: 'RW',
    team: 'TOR',
    shoots: 'R',
    height: "6'0\"",
    weight: '195 lbs',
    birthDate: '1997-05-08',
    birthplace: 'London, Ontario',
    mentions: 128,
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
];

// Trending players
export const getTrendingPlayers = (): Player[] => {
  return LEAFS_ROSTER.sort((a, b) => (b.mentions || 0) - (a.mentions || 0));
};
