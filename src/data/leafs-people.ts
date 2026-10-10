import { LEAFS_ROSTER } from './teams';

export type LeafsPersonRole = 'player' | 'management';

export interface LeafsPerson {
  name: string;
  role: LeafsPersonRole;
  aliases?: string[];
}

const CURRENT_AND_RECENT_PLAYERS = [
  'Kirill Marchenko', 'Jack Roslovic', 'Easton Cowan', 'Nick Paul', 'Gavin McKenna',
  'Colton Sissons', 'Bo Groulx', 'Zack MacEwen', 'Teddy Blueger', 'Brandon Duhaime',
  'Jake McCabe', 'Darren Raddysh', 'Chris Tanev', 'Oliver Ekman-Larsson', 'Troy Stecher',
  'Anthony Stolarz', 'Sergei Bobrovsky', 'Elvis Merzlikins', 'Dakota Joshua', 'Joseph Woll',
  'Bobby McMann', 'David Kampf', 'Pontus Holmberg', 'Calle Jarnkrok', 'Simon Benoit',
  'Conor Timmins', 'Nick Robertson', 'Timothy Liljegren', 'Mitch Marner',
  'Tyler Bertuzzi', 'Ilya Samsonov', 'Mark Giordano', 'TJ Brodie', 'Noah Gregor',
  'Ryan Reaves', 'Fraser Minten', 'Topi Niemela', 'Dennis Hildeby',
];

const FORMER_PLAYERS = [
  'Phil Kessel', 'Viktor Stalberg', 'Mats Sundin', 'Doug Gilmour', 'Wendel Clark',
  'Darryl Sittler', 'Borje Salming', 'Dave Keon', 'Johnny Bower', 'Frank Mahovlich',
  'Tim Horton', 'George Armstrong', 'Red Kelly', 'Rick Vaive', 'Lanny McDonald',
  'Felix Potvin', 'Curtis Joseph', 'Ed Belfour', 'Tie Domi', 'Tomas Kaberle',
  'Bryan McCabe', 'Dion Phaneuf', 'James van Riemsdyk', 'Tyler Bozak', 'Nazem Kadri',
  'Zach Hyman', 'Frederik Andersen', 'Jake Gardiner', 'Joffrey Lupul', 'Jason Spezza',
  'Wayne Simmonds', 'Alexander Kerfoot', 'Michael Bunting', 'Rasmus Sandin', 'Pierre Engvall',
  'Kasperi Kapanen', 'Andreas Johnsson', 'Connor Brown', 'Trevor Moore', 'Patrick Marleau',
  'Ron Hainsey', 'Jake Muzzin', 'Zach Bogosian', 'Alex Galchenyuk', 'Joe Thornton',
  'Ondrej Kase', 'Petr Mrazek', 'Jack Campbell', 'Kyle Clifford', 'Nik Antropov',
  'Alexei Ponikarovsky', 'Matt Stajan', 'Darcy Tucker', 'Gary Roberts', 'Alexander Mogilny',
  'Steve Thomas', 'Gary Leeman', 'Al Iafrate', 'Mike Palmateer', 'Allan Bester',
  'Syl Apps', 'Bob Pulford', 'Ron Ellis', 'Norm Ullman', 'Dave Andreychuk',
  'Glenn Anderson', 'Mike Gartner', 'Larry Murphy', 'Todd Gill', 'Aki Berg',
  'Pavel Kubina', 'Mikhail Grabovski', 'Nikolai Kulemin', 'Clarke MacArthur', 'Cody Franson',
  'Jonathan Bernier', 'James Reimer', 'Leo Komarov', 'Peter Holland', 'PA Parenteau',
  'Matt Martin', 'Roman Polak', 'Nikita Zaitsev', 'Andreas Borgman', 'Garret Sparks',
];

const MANAGEMENT_AND_COACHES = [
  'John Chayka', 'Craig Berube', 'Lane Lambert', 'Marc Savard', 'Mike Van Ryn',
  'Curtis Sanford', 'Brandon Pridham', 'Brad Treliving', 'Brendan Shanahan', 'Kyle Dubas',
  'Lou Lamoriello', 'Sheldon Keefe', 'Mike Babcock', 'Dave Nonis', 'Brian Burke',
  'Cliff Fletcher', 'Pat Quinn', 'Pat Burns', 'Ron Wilson', 'Randy Carlyle',
  'Mike Sullivan', 'Peter Horachek', 'Paul Maurice', 'Ken Dryden', 'Gord Stellick',
  'John Ferguson Jr', 'Hayley Wickenheiser', 'Shane Doan', 'Darryl Metcalf', 'Dave Morrison',
  'Wes Clark', 'Ryan Hardy', 'Laurence Gilman', 'Derek Clancey', 'Jim Hiller',
];

const SPECIAL_ALIASES: Record<string, string[]> = {
  'Viktor Stalberg': ['Viktor Stålberg'],
  'Borje Salming': ['Börje Salming'],
  'James van Riemsdyk': ['James Van Riemsdyk', 'JVR'],
  'Curtis Joseph': ['CuJo'],
  'Oliver Ekman-Larsson': ['OEL'],
  'Nick Robertson': ['Nicholas Robertson'],
  'TJ Brodie': ['T.J. Brodie'],
  'PA Parenteau': ['P.A. Parenteau'],
  'John Ferguson Jr': ['John Ferguson Jr.', 'John Ferguson Junior'],
};

const playerNames = [...new Set([...LEAFS_ROSTER.map((player) => player.name), ...CURRENT_AND_RECENT_PLAYERS, ...FORMER_PLAYERS])];

export const LEAFS_PEOPLE: LeafsPerson[] = [
  ...playerNames.map((name) => ({ name, role: 'player' as const, aliases: SPECIAL_ALIASES[name] })),
  ...MANAGEMENT_AND_COACHES.map((name) => ({ name, role: 'management' as const, aliases: SPECIAL_ALIASES[name] })),
];

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function detectLeafsPeople(value: string) {
  const haystack = ` ${normalize(value)} `;
  const players: string[] = [];
  const management: string[] = [];

  for (const person of LEAFS_PEOPLE) {
    const names = [person.name, ...(person.aliases ?? [])];
    if (!names.some((name) => haystack.includes(` ${normalize(name)} `))) continue;
    (person.role === 'player' ? players : management).push(person.name);
  }

  return {
    players: [...new Set(players)],
    management: [...new Set(management)],
  };
}

export function mergeDetectedPeople(value: string, players: string[] = [], management: string[] = []) {
  const detected = detectLeafsPeople(value);
  return {
    players: [...new Set([...players, ...detected.players])],
    management: [...new Set([...management, ...detected.management])],
  };
}
