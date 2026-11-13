(() => {
  'use strict';

  const el = (tag, cls, html) => { const e = document.createElement(tag); e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const ICON = inner => `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const LA_RAW = `
Mud: Water+Earth
Steam: Water+Fire
Dust: Air+Earth
Energy: Air+Fire
Mist: Air+Water
Lava: Fire+Earth
Pressure: Air+Air
Sea: Water+Water
Stone: Lava+Air, Earth+Pressure
Cloud: Steam+Air, Mist+Pressure
Rain: Cloud+Water
Sky: Air+Cloud
Wind: Air+Energy
Storm: Rain+Wind
Lightning: Cloud+Energy
Thunder: Lightning+Air, Lightning+Sky
Sun: Fire+Sky
Rainbow: Rain+Sun
Day: Sun+Sky
Moon: Sky+Stone
Night: Moon+Sky
Star: Night+Fire
Sand: Stone+Wind, Stone+Dust
Glass: Sand+Fire
Ocean: Sea+Sea
Wave: Sea+Wind
Earthquake: Earth+Energy
Tsunami: Wave+Earthquake
Hill: Earth+Earth
Mountain: Hill+Hill, Hill+Stone
Volcano: Mountain+Lava
Island: Sea+Hill, Ocean+Earth
Cold: Mist+Wind
Ice: Water+Cold, Sea+Cold
Snow: Cloud+Cold, Rain+Cold
Glacier: Ice+Mountain
Iceberg: Ice+Ocean, Glacier+Sea
Hail: Storm+Ice
Frost: Ice+Air
Blizzard: Snow+Storm
Desert: Sand+Sun
Dune: Desert+Wind
Oasis: Desert+Water
Sandstorm: Sand+Storm
Quicksand: Sand+Swamp
Beach: Sand+Sea
Salt: Sea+Sun
Clay: Mud+Sand
Brick: Clay+Fire
Kiln: Brick+Fire
Pottery: Clay+Kiln
Cave: Mountain+Water
River: Water+Hill, Rain+Mountain
Canyon: River+Desert
Lake: River+Water
Cliff: Mountain+Wave
Waterfall: River+Cliff
Geyser: Steam+Pressure
Hot Spring: Water+Geyser
Valley: Hill+River
Pond: Water+Grass
Swamp: Mud+Water, Lake+Mud
Life: Swamp+Energy
Fog: Mist+Cloud
Dew: Mist+Grass
Tornado: Wind+Wind
Hurricane: Storm+Ocean
Flood: Rain+River
Spark: Energy+Metal
Smoke: Fire+Cloud
Explosion: Fire+Pressure
Eclipse: Sun+Moon
Aurora: Light+Night
Light: Energy+Sun
Time: Day+Night
Plant: Earth+Rain
Moss: Plant+Stone
Algae: Plant+Water
Seaweed: Algae+Sea
Grass: Plant+Earth
Seed: Plant+Air
Tree: Seed+Earth, Plant+Plant
Flower: Plant+Sun
Forest: Tree+Tree
Jungle: Forest+Rain
Bush: Plant+Tree
Vine: Jungle+Plant
Cactus: Desert+Plant
Fern: Plant+Forest
Mushroom: Mud+Forest
Leaf: Tree+Wind
Stick: Tree+Stone
Rose: Flower+Bush
Sunflower: Flower+Field
Bamboo: Grass+Tree
Palm Tree: Tree+Beach
Coconut: Palm Tree+Fruit
Pine: Tree+Mountain
Hay: Grass+Wheat
Garden: Flower+House
Fruit: Tree+Flower
Apple: Fruit+Tree
Orchard: Apple+Forest
Berry: Bush+Sun
Banana: Fruit+Jungle
Watermelon: Fruit+Water
Grapes: Vine+Fruit
Ore: Mountain+Pressure
Metal: Ore+Fire
Gold: Metal+Sun
Silver: Metal+Moon
Iron: Metal+Earth
Copper: Metal+Lava
Alloy: Metal+Metal
Bronze: Copper+Alloy
Coal: Wood+Pressure
Steel: Iron+Coal
Diamond: Coal+Pressure
Crystal: Stone+Energy
Gem: Crystal+Light
Ruby: Gem+Fire
Sapphire: Gem+Water
Emerald: Gem+Plant
Jewelry: Gold+Gem
Ring: Gold+Diamond
Necklace: Silver+Pearl
Crown: Gold+King
Chest: Wood+Metal
Treasure: Chest+Gold
Magnet: Iron+Energy
Needle: Metal+Thread
Compass: Magnet+Needle
Electricity: Lightning+Metal
Wire: Copper+Electricity
Battery: Electricity+Metal
Light Bulb: Glass+Electricity
Lamp: Glass+Fire
Candle: Wax+Fire
Beehive: Bee+Tree
Wax: Beehive+Fire
Torch: Stick+Fire
Campfire: Wood+Fire
Ash: Campfire+Air
Gunpowder: Coal+Explosion
Bomb: Gunpowder+Metal
Firework: Gunpowder+Sky
Rocket: Firework+Metal
Space: Star+Star
Satellite: Space+Metal
Planet: Earth+Space
Meteor: Stone+Space
Comet: Ice+Space
Galaxy: Space+Star
Black Hole: Star+Pressure
Telescope: Glass+Star
Alien: Life+Space
UFO: Alien+Metal
Astronaut: Human+Space
Spaceship: Rocket+Space
Human: Life+Clay
Baby: Love+Life
Love: Human+Human
Family: Baby+Human
Heart: Love+Energy
Idea: Human+Light Bulb
Brain: Human+Idea
Sleep: Human+Night
Dream: Sleep+Cloud
Bone: Animal+Stone
Skeleton: Bone+Human
Fossil: Bone+Stone
Dinosaur: Fossil+Life
Ghost: Skeleton+Mist
Tool: Human+Stone
Wood: Tree+Tool
Log: Tree+Axe
Plank: Wood+Axe
Axe: Tool+Metal
Hammer: Wood+Iron
Nail: Metal+Hammer
Saw: Plank+Knife
Knife: Metal+Stone
Scissors: Knife+Knife
Sword: Knife+Steel
Shield: Plank+Steel
Spear: Stick+Metal
Pickaxe: Axe+Ore
Shovel: Tool+Plank
Plow: Metal+Field
Gear: Metal+Wheel
Machine: Gear+Engine
Factory: Machine+House
Engine: Steel+Energy
Steam Engine: Steel+Steam
Chain: Metal+Rope
Rope: Thread+Plant
Thread: Wool+Wheel
Wheel: Wood+Tool
Cart: Wheel+Wood
Car: Engine+Wheel
Bus: Car+Human
Truck: Car+Cart
Ambulance: Car+Doctor
Fire Truck: Car+Water
Bicycle: Wheel+Steel
Motorcycle: Engine+Bicycle
Skateboard: Plank+Wheel
Rail: Steel+Wood
Train: Steam Engine+Rail
Airplane: Bird+Engine
Helicopter: Airplane+Windmill
Windmill: Wheel+Wind
Balloon: Air+Cloth
Hot Air Balloon: Balloon+Fire
Parachute: Cloth+Sky
Boat: Wood+Water
Ship: Boat+Metal
Sail: Cloth+Wind
Sailboat: Boat+Sail
Submarine: Ship+Ocean
Raft: Log+River
Anchor: Chain+Ship
Lighthouse: Tower+Lamp
Wall: Brick+Brick
Tower: Wall+Wall
Castle: Tower+Wall
Palace: Castle+Gold
Pyramid: Desert+Brick
Statue: Stone+Hammer
House: Wood+Brick
Hut: Wood+Grass
Village: House+Hut
City: House+House
Skyscraper: Tower+Glass
Bridge: River+Plank
Road: Stone+Field
Well: Brick+Water
Bucket: Well+Wood
Barn: Plank+Farm
Fence: Stick+Field
Field: Grass+Tool
Farm: Field+Animal
Farmer: Human+Farm
Window: Glass+House
Door: Plank+House
Key: Metal+Door
Lock: Key+Chest
Ladder: Stick+Plank
Stairs: Brick+Ladder
Table: Plank+Plank
Chair: Plank+Human
Bed: Plank+Wool
School: Book+House
Library: Book+Book
Hospital: House+Doctor
Shop: Money+House
Bank: Money+Safe
Safe: Steel+Chest
Money: Coin+Paper
Coin: Gold+Tool
Wallet: Money+Leather
Paper: Plank+Water
Book: Paper+Paper
Letter: Paper+Pen
Pen: Feather+Ink
Ink: Coal+Water
Pencil: Stick+Coal
Painting: Paint+Paper
Paint: Rainbow+Water
Artist: Human+Paint
Map: Paper+Island
Globe: Planet+Map
Calendar: Time+Paper
Clock: Time+Metal
Hourglass: Sand+Time
Kite: Paper+Wind
Mirror: Glass+Silver
Glasses: Glass+Human
Camera: Glass+Light
Photo: Camera+Human
Microscope: Glass+Science
Science: Book+Light
Scientist: Human+Science
Medicine: Plant+Science
Doctor: Human+Medicine
Teacher: Human+Book
Student: Human+School
Computer: Science+Electricity
Internet: Computer+Computer
Robot: Metal+Computer
Phone: Wire+Sound
Smartphone: Phone+Computer
Radio: Electricity+Music
TV: Radio+Glass
Sound: Air+Pressure
Music: Sound+Human
Song: Music+Human
Singer: Human+Song
Bell: Metal+Sound
Guitar: Music+Wood
Violin: Guitar+Bow
Piano: Guitar+Hammer
Drum: Leather+Wood
Flute: Stick+Music
Trumpet: Metal+Music
Orchestra: Violin+Piano
Bow: Wood+Thread
Arrow: Stick+Feather
Archer: Human+Bow
Feather: Bird+Wind
Leather: Cow+Tool
Wool: Sheep+Human
Cloth: Thread+Thread
Shirt: Cloth+Human
Hat: Cloth+Sun
Shoe: Leather+Human
Boot: Shoe+Mud
Glove: Cloth+Cold
Scarf: Wool+Cold
Coat: Cloth+Snow
Dress: Cloth+Flower
Umbrella: Cloth+Rain
Backpack: Leather+Cloth
Tent: Cloth+Stick
Flag: Cloth+Mountain
Armor: Steel+Cloth
Knight: Human+Armor
Helmet: Armor+Sky
King: Human+Castle
Queen: King+Love
Army: Knight+Knight
Pirate: Human+Ship
Wizard: Human+Magic
Magic: Rainbow+Energy
Magic Wand: Stick+Magic
Genie: Lamp+Magic
Elf: Human+Forest
Fairy: Butterfly+Human
Unicorn: Horse+Rainbow
Dragon: Lizard+Fire
Phoenix: Bird+Fire
Mermaid: Human+Fish
Centaur: Human+Horse
Pegasus: Horse+Bird
Snowman: Snow+Human
Ball: Leather+Air
Soccer: Ball+Field
Golf: Ball+Grass
Racket: Stick+Thread
Tennis: Ball+Racket
Ski: Snow+Plank
Sled: Snow+Wood
Trophy: Gold+Ball
Chess: Plank+Knight
Cards: Paper+Heart
Party: Music+Cake
Birthday: Cake+Candle
Spring: Flower+Time
Summer: Sun+Time
Autumn: Leaf+Time
Winter: Snow+Time
Animal: Life+Grass
Fish: Animal+Water
Shark: Fish+Ocean
Whale: Shark+Ocean
Dolphin: Fish+Wave
Seal: Animal+Ice
Shell: Animal+Beach
Oyster: Shell+Water
Pearl: Oyster+Sand
Crab: Fish+Shell
Lobster: Crab+Fire
Starfish: Star+Sea
Jellyfish: Fish+Cloud
Octopus: Fish+Ink
Coral: Life+Ocean
Reef: Coral+Sea
Bird: Animal+Sky
Eagle: Bird+Mountain
Owl: Bird+Night
Chicken: Bird+Farm
Nest: Bird+Tree
Egg: Nest+Life
Duck: Bird+Pond
Penguin: Bird+Ice
Parrot: Bird+Jungle
Dove: Bird+Cloud
Flamingo: Bird+Lake
Peacock: Bird+Rainbow
Seagull: Bird+Beach
Crow: Bird+Field
Bat: Mouse+Bird
Cow: Animal+Grass
Sheep: Animal+Hill
Pig: Animal+Mud
Horse: Animal+Wind
Dog: Animal+Human
Cat: Animal+Milk
Mouse: Animal+Cheese
Rabbit: Animal+Carrot
Bear: Animal+Forest
Wolf: Dog+Forest
Fox: Dog+Autumn
Lion: Cat+Desert
Tiger: Cat+Jungle
Elephant: Animal+Jungle
Giraffe: Horse+Tree
Monkey: Animal+Fruit
Gorilla: Monkey+Mountain
Zebra: Horse+Night
Deer: Animal+Leaf
Camel: Animal+Desert
Kangaroo: Rabbit+Hill
Koala: Bear+Leaf
Panda: Bear+Bamboo
Polar Bear: Bear+Ice
Squirrel: Mouse+Tree
Hedgehog: Mouse+Cactus
Snail: Animal+Shell
Worm: Insect+Mud
Insect: Animal+Plant
Bee: Insect+Flower
Caterpillar: Insect+Leaf
Butterfly: Caterpillar+Sky
Ant: Insect+Earth
Spider: Insect+Thread
Web: Spider+Wind
Ladybug: Insect+Ruby
Mosquito: Insect+Swamp
Fly: Insect+Air
Dragonfly: Insect+Pond
Firefly: Insect+Light
Scorpion: Insect+Desert
Reptile: Animal+Sand
Lizard: Reptile+Stone
Snake: Reptile+Grass
Turtle: Reptile+Shell
Crocodile: Reptile+River
Frog: Animal+Pond
Chameleon: Lizard+Rainbow
Honey: Bee+Flower
Milk: Cow+Human
Cheese: Milk+Salt
Butter: Milk+Pressure
Ice Cream: Milk+Ice
Sugarcane: Grass+Sun
Sugar: Sugarcane+Stone
Cocoa: Jungle+Seed
Chocolate: Cocoa+Sugar
Cake: Dough+Sugar
Cookie: Dough+Chocolate
Candy: Sugar+Fire
Jam: Berry+Sugar
Juice: Fruit+Pressure
Wheat: Grass+Seed
Flour: Wheat+Stone
Dough: Flour+Water
Bread: Dough+Fire
Sandwich: Bread+Cheese
Pizza: Dough+Cheese
Burger: Bread+Meat
Pancake: Dough+Egg
Pasta: Flour+Egg
Meat: Animal+Tool
Steak: Cow+Fire
Sausage: Meat+Salt
Bacon: Pig+Fire
Vegetable: Field+Sun
Potato: Field+Mud
Carrot: Vegetable+Sun
Tomato: Fruit+Vegetable
Corn: Field+Wind
Popcorn: Corn+Fire
Salad: Vegetable+Vegetable
Soup: Vegetable+Water
Fries: Potato+Fire
Rice: Field+Water
Sushi: Rice+Fish
Pumpkin: Field+Fruit
Jack-o-Lantern: Pumpkin+Candle
Tea: Leaf+Steam
Coffee: Seed+Steam
Chef: Human+Soup
Baker: Human+Bread
Fisherman: Boat+Fish
Miner: Human+Cave
Firefighter: Human+Fire
Wildfire: Forest+Fire
Reef Fish: Fish+Coral
`;
  const IPAL = {
    k: '#34293a', w: '#ffffff', r: '#e8473f', R: '#a82d2d', o: '#f58a2d', y: '#f9cf3a', Y: '#fbeaa4', l: '#9bd13f', g: '#4cad48', G: '#2d7a3e',
    c: '#4cc9e8', b: '#3b82e6', B: '#24428f', v: '#8a5ad6', p: '#f48fb1', m: '#d2479c', n: '#9a6a3a', N: '#5e3d21', u: '#e6c795', a: '#a9b0b8',
    A: '#5c6570', s: '#f1c7a0', S: '#b9835a', t: '#2bb3a3', i: '#d6f1fb', f: '#d9a566', h: '#f6ecd6', e: '#cfd6de', d: '#f2b632', D: '#b8801b',
    q: '#9fd8f4', z: '#ecd28f', C: '#c97b4a', x: '#e7d6c0', j: '#7a4a8c', J: '#40305a', P: '#ffd0e0', O: '#ff7a4f', V: '#b9a0f0', L: '#c8f09a'
  };
  const ihash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const irng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  function ihex(c) { if (c[0] === '#') return c.length === 4 ? '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c; return IPAL[c] || '#888888'; }
  function ishade(hex, f) {
    const n = parseInt(hex.slice(1, 7), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const m = (v, t) => Math.round(v + (t - v) * f);
    return '#' + [m(r, 40), m(g, 28), m(b, 36)].map(v => v.toString(16).padStart(2, '0')).join('');
  }
  function ifill(k) {
    const m = /^(.+?)\/(\d+)$/.exec(k);
    if (m) { const h = ihex(m[1]), n = parseInt(h.slice(1, 7), 16); return { f: `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${m[2] / 100})`, o: null }; }
    if (k === 'W') return { f: 'rgba(255,255,255,.55)', o: null };
    if (k === 'K') return { f: 'rgba(30,20,40,.16)', o: null };
    const h = ihex(k);
    return { f: h, o: ishade(h, .42) };
  }
  const iF = n => Math.round(n * 10) / 10;
  function iblob(cx, cy, rx, ry, rnd) {
    const N = 12, pts = [];
    for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, j = 1 + (rnd() - .5) * .07; pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]); }
    let d = `M${iF((pts[0][0] + pts[N - 1][0]) / 2)} ${iF((pts[0][1] + pts[N - 1][1]) / 2)}`;
    for (let i = 0; i < N; i++) { const p = pts[i], q = pts[(i + 1) % N]; d += `Q${iF(p[0])} ${iF(p[1])} ${iF((p[0] + q[0]) / 2)} ${iF((p[1] + q[1]) / 2)}`; }
    return d + 'Z';
  }
  function ijit(d, rnd, amp) { return d.replace(/-?\d*\.?\d+/g, v => iF(+v + (rnd() - .5) * 2 * amp)); }
  function irect(x, y, w, h, r, rnd) {
    r = Math.min(r, w / 2, h / 2); const j = () => (rnd() - .5) * 1.2;
    const X = x + j(), Y = y + j(), W = w + j(), H = h + j();
    return `M${iF(X + r)} ${iF(Y)}L${iF(X + W - r)} ${iF(Y)}Q${iF(X + W)} ${iF(Y)} ${iF(X + W)} ${iF(Y + r)}L${iF(X + W)} ${iF(Y + H - r)}Q${iF(X + W)} ${iF(Y + H)} ${iF(X + W - r)} ${iF(Y + H)}L${iF(X + r)} ${iF(Y + H)}Q${iF(X)} ${iF(Y + H)} ${iF(X)} ${iF(Y + H - r)}L${iF(X)} ${iF(Y + r)}Q${iF(X)} ${iF(Y)} ${iF(X + r)} ${iF(Y)}Z`;
  }
  const IMAC = {
    eye: (x, y, s = 1) => `c ${x} ${y} ${2.8 * s} w;c ${x + .4} ${y + .3} ${1.5 * s} k`,
    eyes: (x, y, dx, s = 1) => `c ${x} ${y} ${2.8 * s} w;c ${x + .4} ${y + .3} ${1.5 * s} k;c ${x + dx} ${y} ${2.8 * s} w;c ${x + dx + .4} ${y + .3} ${1.5 * s} k`,
    sph: c => `c 32 32 20 ${c};n W M20 26 Q23 17 33 15 Q26 20 24 30Z`,
    shadow: (y = 58, w = 20) => `e 32 ${y} ${w} 3.2 K`,
    gem: (f, g) => `p ${f} M20 8 L44 8 L58 22 L58 42 L44 56 L20 56 L6 42 L6 22Z;p ${g} M23 14 L41 14 L51 24 L51 40 L41 50 L23 50 L13 40 L13 24Z;n W M18 14 L30 14 L16 28Z;l W 2 M44 44 L50 38`,
    ingot: (f, g) => `p ${g} M13 24 L21 15 L45 15 L53 24Z;p ${f} M7 46 L13 24 L53 24 L57 46Z;n W M16 28 L26 28 L22 42 L14 42Z;l W 2 M44 32 L48 32`,
    heart: (cx, cy, k, f) => `p ${f} M${cx} ${cy + 11 * k} L${cx - 11 * k} ${cy - k} Q${cx - 15 * k} ${cy - 8 * k} ${cx - 8 * k} ${cy - 11 * k} Q${cx - 2 * k} ${cy - 12 * k} ${cx} ${cy - 5 * k} Q${cx + 2 * k} ${cy - 12 * k} ${cx + 8 * k} ${cy - 11 * k} Q${cx + 15 * k} ${cy - 8 * k} ${cx + 11 * k} ${cy - k}Z`,
    gear: (cx, cy, r, f, n = 8) => {
      let d = '';
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2, w = Math.PI / n * .5, r0 = r * .78;
        [[a - w * 1.1, r0], [a - w * .6, r], [a + w * .6, r], [a + w * 1.1, r0]].forEach(([t, q], j) => { d += `${i + j ? 'L' : 'M'}${iF(cx + Math.cos(t) * q)} ${iF(cy + Math.sin(t) * q)}`; });
      }
      return `p ${f} ${d}Z;c ${cx} ${cy} ${iF(r * .36)} w`;
    },
    wheel: (cx, cy, r) => `c ${cx} ${cy} ${r} k;c ${cx} ${cy} ${iF(r * .62)} e;c ${cx} ${cy} ${iF(r * .22)} A`,
    bust: (shirt, skin, hair, st = 'sh', cx = 32, cy = 32, k = 1) => {
      const T = (x, y) => `${iF(cx + (x - 32) * k)} ${iF(cy + (y - 32) * k)}`;
      const mk = (f, d) => `p ${f} ` + d.replace(/([MLQ])([^MLQZ]*)/g, (m, c, nums) => { const v = nums.trim().split(/[ ,]+/).map(Number), o = []; for (let i = 0; i < v.length; i += 2) o.push(T(v[i], v[i + 1])); return c + o.join(' '); }) ;
      const circ = (x, y, rr, f) => `c ${T(x, y)} ${iF(rr * k)} ${f}`;
      let o = [];
      if (st === 'lg') o.push(mk(hair, 'M15 54 Q9 30 14 20 Q18 6 32 8 Q46 6 50 20 Q55 30 49 54Z'));
      o.push(mk(shirt, 'M8 66 Q8 44 32 42 Q56 44 56 66Z'));
      o.push(mk(skin, 'M27 34 L37 34 L38 46 Q32 49 26 46Z'));
      o.push(circ(32, 24, 14, skin));
      if (st === 'sh') o.push(mk(hair, 'M17 25 Q14 6 32 7 Q50 6 47 25 Q44 14 32 15 Q20 14 17 25Z'));
      if (st === 'lg') o.push(mk(hair, 'M18 24 Q20 11 32 11 Q44 11 46 24 Q40 16 32 17 Q24 16 18 24Z'));
      o.push(circ(26, 25, 1.7, 'k'), circ(38, 25, 1.7, 'k'));
      o.push(`l k ${iF(1.6 * k)} M${T(28, 31)} Q${T(32, 34)} ${T(36, 31)}`);
      return o.join(';');
    },
    face: (x, y, dx) => `c ${x} ${y} 1.8 k;c ${x + dx} ${y} 1.8 k;l k 1.6 M${x + 1} ${y + 5} Q${x + dx / 2} ${y + 8} ${x + dx - 1} ${y + 5}`
  };
  function ishapes(spec) {
    const out = [];
    for (const piece of spec.split(';')) {
      const s = piece.trim();
      if (!s) continue;
      if (s[0] === '@') {
        const [name, ...a] = s.slice(1).split(' ');
        const r = IMAC[name](...a.map(v => (isNaN(+v) ? v : +v)));
        out.push(...ishapes(r));
      } else out.push(s);
    }
    return out;
  }
  const icache = new Map();
  function iconSvg(name, spec) {
    if (icache.has(name)) return icache.get(name);
    const rnd = irng(ihash(name));
    let body = '';
    for (const s of ishapes(spec)) {
      const k = s[0], rest = s.slice(2);
      if (k === 'c' || k === 'e') {
        const a = rest.split(' '), f = ifill(a[k === 'c' ? 3 : 4]);
        const x = +a[0], y = +a[1], rx = +a[2], ry = k === 'c' ? rx : +a[3];
        body += `<path d="${iblob(x, y, rx, ry, rnd)}" fill="${f.f}"${f.o ? ` stroke="${f.o}" stroke-width="2.2" stroke-linejoin="round"` : ''}/>`;
      } else if (k === 'r') {
        const a = rest.split(' '), f = ifill(a[4]);
        body += `<path d="${irect(+a[0], +a[1], +a[2], +a[3], a[5] === undefined ? 3 : +a[5], rnd)}" fill="${f.f}"${f.o ? ` stroke="${f.o}" stroke-width="2.2" stroke-linejoin="round"` : ''}/>`;
      } else if (k === 'p' || k === 'n') {
        const i = rest.indexOf(' '), f = ifill(rest.slice(0, i)), d = ijit(rest.slice(i + 1), rnd, .7);
        body += `<path d="${d}" fill="${f.f}"${f.o && k === 'p' ? ` stroke="${f.o}" stroke-width="2.2" stroke-linejoin="round"` : ''}/>`;
      } else if (k === 'L') {
        const a = rest.split(' '), f = ifill(a[0]), d = ijit(a.slice(2).join(' '), rnd, .6);
        body += `<path d="${d}" fill="none" stroke="${f.o}" stroke-width="${+a[1] + 2.6}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${f.f}" stroke-width="${a[1]}" stroke-linecap="round" stroke-linejoin="round"/>`;
      } else if (k === 'l') {
        const a = rest.split(' '), f = ifill(a[0]), d = ijit(a.slice(2).join(' '), rnd, .6);
        body += `<path d="${d}" fill="none" stroke="${f.o && !/\//.test(a[0]) ? f.f : f.f}" stroke-width="${a[1]}" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
    }
    const svg = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
    icache.set(name, svg);
    return svg;
  }
  const LA_ICONS = {};
  Object.assign(LA_ICONS, {
    'Air': 'l c 4.5 M10 24 Q30 12 44 22 Q52 29 44 35 Q40 38 36 32;l c 4.5 M8 40 Q28 33 40 39 Q50 45 42 51 Q38 53 35 49;l q 3.5 M14 54 Q22 52 28 54;l W 2 M16 21 Q26 16 36 18',
    'Earth': 'p n M6 36 Q8 22 24 18 Q34 14 44 18 Q58 24 58 38 Q58 52 42 56 Q22 60 12 52 Q4 46 6 36Z;p g M6 36 Q8 22 24 18 Q34 14 44 18 Q58 24 58 36 Q50 30 42 35 Q34 28 24 34 Q14 30 6 36Z;c 22 46 3 N;c 40 48 3.6 N;c 31 42 2.2 N;n W M14 28 Q18 22 26 21 Q20 24 18 30Z',
    'Fire': 'p o M32 4 Q36 18 48 28 Q60 42 50 53 Q42 60 32 60 Q20 60 13 52 Q6 42 17 29 Q20 36 26 38 Q22 22 32 4Z;p y M32 30 Q36 38 43 44 Q47 53 38 57 Q32 59 26 57 Q17 53 24 44 Q30 40 32 30Z;p Y M32 44 Q35 48 36 53 Q32 56 29 53 Q29 48 32 44Z',
    'Water': 'p b M32 4 Q34 16 46 30 Q56 43 46 53 Q40 59 32 59 Q24 59 18 53 Q8 43 18 30 Q30 16 32 4Z;n W M23 38 Q21 47 28 52 Q24 46 25 40Z;n q M36 18 Q38 24 42 30 Q38 26 36 18Z',
    'Mud': 'p N M6 46 Q8 32 22 30 Q28 20 40 26 Q54 26 57 42 Q58 55 42 56 L20 56 Q6 55 6 46Z;c 22 44 3.5 n;c 38 40 4.5 n;c 47 48 2.6 n;c 30 50 2.2 n;n W M14 42 Q16 36 22 34',
    'Steam': 'l e 4.5 M18 54 Q8 46 18 38 Q28 30 18 20 Q16 16 20 10;l e 4.5 M32 54 Q22 46 32 38 Q42 30 32 20 Q30 16 34 10;l e 4.5 M46 54 Q36 46 46 38 Q56 30 46 22;l W 2 M19 50 Q12 46 19 40',
    'Dust': 'p z M8 40 Q10 29 21 28 Q25 19 36 21 Q47 21 49 32 Q59 34 57 45 Q55 53 45 53 L19 53 Q7 51 8 40Z;c 20 45 2.2 u;c 34 41 2.6 u;c 44 47 2.2 u;c 28 34 1.8 u;l u 3 M10 59 Q22 57 34 59;n W M14 38 Q17 31 24 31',
    'Energy': 'p y M32 3 L39 23 L59 32 L39 41 L32 61 L25 41 L5 32 L25 23Z;p Y M32 16 L36 28 L47 32 L36 36 L32 48 L28 36 L17 32 L28 28Z;c 32 32 4 w',
    'Mist': 'l q 5 M6 20 Q18 13 31 20 Q44 27 58 20;l c 5 M4 33 Q17 26 30 33 Q43 40 60 33;l q 5 M8 46 Q21 39 34 46 Q47 53 56 46;l W 2 M12 18 Q20 15 28 18',
    'Lava': 'p r M5 47 Q5 33 19 29 Q25 18 38 22 Q53 24 57 39 Q60 53 44 57 L18 57 Q5 55 5 47Z;p o M13 45 Q15 37 25 37 Q33 30 44 36 Q53 40 50 49 Q46 53 34 53 L22 53 Q11 51 13 45Z;c 27 45 4 y;c 40 42 3 y;c 33 38 2 Y;c 19 22 2.5 o;c 46 14 2 o',
    'Pressure': 'c 32 34 24 e;c 32 34 19 w;p r M32 34 L44 20 L36 37Z;c 32 34 4.5 A;l k 2 M14 34 L19 34 M45 34 L50 34 M32 16 L32 21 M19 21 L22 24 M45 21 L42 24;r 24 54 16 7 A 3',
    'Sea': 'p b M3 22 Q16 14 29 22 Q42 30 54 22 Q59 20 61 22 L61 54 Q61 59 55 59 L9 59 Q3 59 3 54Z;l W 3 M9 38 Q17 32 25 38 Q33 44 41 38;l W 3 M19 50 Q27 45 35 50 Q43 55 51 50;l q 2.5 M10 27 Q16 24 22 27',
    'Stone': 'p a M6 47 Q4 34 15 26 Q22 17 35 17 Q50 18 56 31 Q62 42 55 51 Q50 57 38 57 L20 57 Q9 55 6 47Z;n W M15 34 Q19 25 30 23 Q23 28 21 37Z;l A 2 M36 29 L40 38 L35 47;l A 2 M22 47 L30 51',
    'Cloud': 'p w M11 47 Q3 47 3 38 Q3 29 14 29 Q16 18 29 19 Q40 16 44 27 Q57 26 60 37 Q62 47 50 47Z;n q M12 44 Q7 43 7 38;l q 2.5 M16 41 Q22 38 28 41',
    'Rain': 'p a M12 36 Q5 36 5 29 Q5 21 15 21 Q17 11 29 11 Q39 9 43 19 Q53 18 57 27 Q59 36 51 36Z;l b 3.5 M20 44 L16 55;l b 3.5 M32 44 L28 55;l b 3.5 M44 44 L40 55;n W M12 30 Q13 24 20 23',
    'Sky': 'r 3 5 58 54 q 8;p w M10 44 Q5 44 5 38 Q5 32 13 32 Q15 25 23 25 Q31 24 33 31 Q41 31 43 38 Q43 44 38 44Z;p w M34 22 Q31 22 31 18 Q31 14 37 14 Q39 9 45 10 Q51 10 52 15 Q57 16 56 20 Q55 22 52 22Z',
    'Wind': 'l c 4.5 M5 21 L36 21 Q48 21 48 13 Q48 7 42 7;l c 4.5 M5 33 L48 33 Q59 33 59 42 Q59 50 51 50;l q 4 M10 45 L28 45 Q36 45 36 52 Q36 57 30 57',
    'Storm': 'p A M11 33 Q5 33 5 26 Q5 19 14 19 Q16 9 28 9 Q38 7 42 16 Q52 15 56 24 Q58 33 50 33Z;p y M35 28 L24 46 L32 46 L28 61 L43 40 L35 40 L39 28Z;l b 3 M12 42 L9 50;l b 3 M52 42 L49 50',
    'Lightning': 'p y M40 3 L15 37 L30 37 L23 61 L51 25 L35 25 L45 3Z;n Y M38 9 L25 29 L34 29',
    'Thunder': 'p y M30 6 L13 36 L26 36 L19 59 L45 27 L32 27 L41 6Z;l a 3.5 M47 20 Q53 26 47 32;l a 3.5 M53 13 Q63 26 53 39;l a 3.5 M7 18 Q2 24 7 30',
    'Sun': 'l d 4 M32 4 L32 12 M32 52 L32 60 M4 32 L12 32 M52 32 L60 32 M12 12 L18 18 M46 46 L52 52 M52 12 L46 18 M12 52 L18 46;c 32 32 15 y;n W M23 26 Q26 20 33 19 Q27 22 25 30Z;l o 2 M26 40 Q32 44 38 40',
    'Rainbow': 'l r 5.5 M4 54 Q4 13 32 13 Q60 13 60 54;l o 5.5 M10 54 Q10 19 32 19 Q54 19 54 54;l y 5.5 M16 54 Q16 25 32 25 Q48 25 48 54;l g 5.5 M22 54 Q22 31 32 31 Q42 31 42 54;l b 5.5 M28 54 Q28 37 32 37 Q36 37 36 54;p w M0 58 Q-1 53 5 52 Q8 47 14 49 Q19 48 21 53 Q24 55 22 58Z;p w M42 58 Q41 53 46 52 Q49 47 55 49 Q60 48 62 53 Q65 55 63 58Z',
    'Day': 'r 3 5 58 54 b 8;r 3 5 58 54 q 8;l y 3.5 M32 12 L32 17 M32 47 L32 52 M12 32 L17 32 M47 32 L52 32 M18 18 L22 22 M42 42 L46 46 M46 18 L42 22 M18 46 L22 42;c 32 32 11 y;n W M26 27 Q28 23 33 22 Q29 25 28 30Z',
    'Moon': 'p Y M38 5 Q9 11 9 34 Q11 57 41 59 Q22 53 22 32 Q22 15 38 5Z;n W M17 28 Q18 20 24 14 Q19 24 19 33Z;c 48 18 2.5 Y;c 52 34 1.8 Y;c 46 48 2.2 Y',
    'Night': 'r 3 5 58 54 B 8;p Y M34 14 Q18 17 18 32 Q19 46 36 48 Q26 44 26 32 Q26 21 34 14Z;p Y M48 12 L50 17 L55 18 L51 21 L52 26 L48 23 L44 26 L45 21 L41 18 L46 17Z;c 46 44 1.8 Y;c 14 14 1.6 Y;c 52 36 1.5 Y',
    'Star': 'p y M32 4 L39 23 L59 24 L43 37 L49 58 L32 46 L15 58 L21 37 L5 24 L25 23Z;n Y M32 12 L36 24 L32 28 L28 24Z;n W M22 28 Q24 24 28 24 Q24 27 24 32Z',
    'Sand': 'p z M3 54 Q14 30 31 24 Q41 20 49 30 Q59 42 61 54Z;l u 2.5 M12 47 Q24 40 38 45;l u 2.5 M26 37 Q35 32 45 39;n W M20 36 Q25 29 32 27 Q26 31 24 38Z',
    'Glass': 'r 9 7 46 50 i 5;n W M15 13 L31 13 L15 35Z;n W M36 13 L42 13 L15 52 L9 52Z;l q 2 M50 50 L56 44',
    'Ocean': 'r 3 7 58 52 q 6;p b M3 31 Q16 25 29 31 Q42 37 54 31 Q59 29 61 31 L61 54 Q61 59 55 59 L9 59 Q3 59 3 54Z;l W 2.5 M10 44 Q18 40 26 44;l W 2.5 M34 51 Q42 47 50 51;c 46 18 6 y',
    'Wave': 'p b M4 57 L4 41 Q8 18 32 12 Q53 8 59 23 Q51 19 45 25 Q51 31 46 40 Q41 35 37 41 Q41 51 37 57Z;n W M13 46 Q15 28 30 22 Q21 33 21 46Z;c 49 22 2.2 w;c 54 27 1.6 w;c 42 18 1.8 w',
    'Earthquake': 'p n M2 34 L26 34 L31 41 L24 47 L31 53 L26 60 L2 60Z;p n M62 34 L38 34 L33 41 L40 47 L33 53 L38 60 L62 60Z;p g M2 34 L26 34 L28 37 L2 38Z;p g M62 34 L38 34 L36 37 L62 38Z;l A 3 M9 20 Q3 26 9 32;l A 3 M55 20 Q61 26 55 32;l A 3 M17 12 Q9 22 17 30',
    'Tsunami': 'p b M2 58 L2 38 Q6 14 32 8 Q56 4 62 20 Q52 16 46 22 Q54 30 50 40 Q44 36 40 42 Q44 52 40 58Z;n W M10 46 Q12 26 30 18 Q20 30 19 46Z;p r M44 58 L44 49 L50 44 L56 49 L56 58Z;p y M47 58 L47 52 L53 52 L53 58Z',
    'Hill': 'p g M2 57 Q8 28 30 24 Q54 20 62 57Z;p G M2 57 Q7 42 20 35 Q13 46 17 57Z;n W M18 34 Q24 28 32 27 Q25 31 22 37Z;c 44 40 2 y;c 38 46 2 p;c 50 48 2 y',
    'Mountain': 'p a M2 57 L24 13 L40 41 L47 29 L62 57Z;p w M24 13 L33 29 L28 26 L24 33 L19 25Z;p w M47 29 L53 40 L49 38 L46 43 L42 37Z;n A M24 13 L40 41 L34 44 L28 33Z',
    'Volcano': 'p n M6 58 L23 28 L41 28 L58 58Z;p r M23 28 L27 24 L32 30 L36 23 L41 28 Q32 35 23 28Z;p o M29 24 Q27 12 34 7 Q35 15 40 18 Q42 24 38 26Z;c 48 14 5 a;c 53 8 4 e;l N 2 M20 42 L30 50',
    'Island': 'p b M2 45 Q16 39 32 45 Q48 51 62 45 L62 58 L2 58Z;p z M10 50 Q15 38 32 38 Q49 38 56 50Z;l n 3 M32 40 Q30 28 35 17;p g M35 17 Q25 10 17 17 Q27 14 35 17;p g M35 17 Q44 9 52 15 Q43 13 35 17;p g M35 17 Q39 8 33 4 Q35 11 35 17',
    'Cold': 'r 26 5 12 41 w 6;c 32 48 10.5 w;c 32 48 7.5 b;r 29 22 6 26 b 3;l k 2 M41 12 L46 12 M41 20 L46 20 M41 28 L46 28 M41 36 L46 36;l c 2.5 M15 18 L21 18 M18 15 L18 21',
    'Ice': 'r 8 10 48 44 q 9;n W M15 16 L31 16 L15 34Z;n W M36 44 L50 28 L52 31 L40 47Z;l W 2.5 M44 18 L49 18;r 8 10 48 44 i/45 9',
    'Snow': 'l c 3.5 M32 5 L32 59 M9 18 L55 46 M9 46 L55 18;l c 2.5 M25 10 L32 17 L39 10 M25 54 L32 47 L39 54 M12 28 L22 28 L18 21 M52 36 L42 36 L46 43 M52 28 L42 28 L46 21 M12 36 L22 36 L18 43;c 32 32 5 w',
    'Glacier': 'p q M2 57 L20 17 L37 43 L45 29 L62 57Z;p w M20 17 L27 30 L22 28 L20 34 L16 27Z;p i M37 43 L45 29 L52 42Z;n W M24 38 L30 46 L26 52Z',
    'Iceberg': 'p b M2 38 L62 38 L62 58 L2 58Z;p c/60 M18 38 L48 38 L43 54 L24 54Z;p i M18 38 L26 20 L32 27 L39 10 L49 38Z;n W M31 22 L38 14 L40 28Z',
    'Hail': 'p A M11 32 Q5 32 5 25 Q5 18 14 18 Q16 9 28 9 Q37 7 41 16 Q51 15 55 24 Q57 32 50 32Z;c 17 44 4.5 i;c 31 51 4.5 i;c 45 43 4.5 i;c 38 58 3 i',
    'Frost': 'r 4 4 56 56 q 8;l w 3 M32 10 L32 54 M13 21 L51 43 M13 43 L51 21;l w 2.5 M26 15 L32 21 L38 15 M26 49 L32 43 L38 49;c 32 32 4 i',
    'Blizzard': 'p e M10 30 Q4 30 4 23 Q4 16 13 16 Q15 7 27 7 Q36 5 40 14 Q50 13 54 22 Q56 30 49 30Z;l c 3.5 M6 42 L40 42 Q50 42 50 36;l c 3.5 M14 52 L52 52 Q60 52 58 58;c 20 36 2.2 w;c 48 46 2.2 w;c 30 58 2 w',
    'Desert': 'c 47 15 8 y;l d 2.5 M47 2 L47 5 M59 15 L56 15 M55 7 L53 9;p z M0 48 Q16 28 32 42 Q46 28 64 46 L64 58 L0 58Z;p u M0 55 Q18 47 34 53 Q50 45 64 55 L64 60 L0 60Z',
    'Dune': 'p z M2 56 Q18 22 62 56Z;l u 2.5 M14 50 Q24 40 38 46;l c 3 M4 16 L26 16 Q32 16 32 11;l c 3 M38 24 L58 24 Q62 24 62 19',
    'Oasis': 'e 32 51 24 7 b;p z M4 51 Q10 44 20 46 L44 46 Q54 44 60 51 Q50 58 32 58 Q14 58 4 51Z;e 32 50 14 3.5 q;l n 3.5 M36 46 Q34 30 38 16;p g M38 16 Q26 8 17 17 Q29 13 38 16;p g M38 16 Q50 8 58 16 Q48 13 38 16;p g M38 16 Q44 22 52 24 Q44 20 38 16;p g M38 16 Q30 22 24 25 Q32 20 38 16',
    'Sandstorm': 'p z M8 34 Q8 24 18 22 Q22 12 34 14 Q46 14 48 24 Q58 26 57 36 Q55 44 45 44 L18 44 Q7 43 8 34Z;l u 3.5 M4 52 L40 52 Q50 52 50 46;l u 3.5 M14 60 L54 60;c 54 50 2 u;c 26 56 1.6 u',
    'Quicksand': 'p z M5 54 Q6 42 18 40 L46 40 Q58 42 59 54Z;e 32 42 17 7 u;l N 2.5 M32 42 Q41 41 40 45 Q33 50 26 44 Q24 37 35 36;c 14 34 2 z;c 52 32 2 z;p s M30 40 L30 22 Q31 18 34 22 L34 40Z',
    'Beach': 'p b M2 40 Q16 34 32 40 Q48 46 62 40 L62 50 L2 50Z;p z M2 48 Q32 38 62 48 L62 60 L2 60Z;l n 3 M36 24 L28 52;p r M17 26 Q32 6 49 26Z;p w M27 26 Q32 10 38 26Z;c 54 14 5 y',
    'Salt': 'p e M19 22 L45 22 L50 56 Q50 59 46 59 L18 59 Q14 59 14 56Z;p w M22 12 Q32 5 42 12 L45 22 L19 22Z;c 28 15 1.6 k;c 35 14 1.6 k;c 32 18 1.6 k;n W M20 28 L26 28 L24 54 L19 54Z;c 54 54 2 w;c 8 52 2 w',
    'Clay': 'p C M6 47 Q4 34 17 30 Q21 19 34 19 Q47 19 51 30 Q62 34 59 47 Q57 57 44 57 L20 57 Q9 55 6 47Z;n W M14 41 Q16 32 25 29 Q20 34 20 42Z;l R 2 M28 44 Q34 40 40 44;c 26 50 2 N;c 42 50 2 N',
    'Brick': 'p r M6 24 L50 24 L58 16 L14 16Z;r 6 24 44 26 R 3;p R M50 24 L58 16 L58 42 L50 50Z;l w 2 M6 37 L50 37 M22 24 L22 37 M38 37 L38 50;n W M10 28 L18 28',
    'Kiln': 'p C M7 57 L7 34 Q7 10 32 10 Q57 10 57 34 L57 57Z;p k M21 57 L21 43 Q21 34 32 34 Q43 34 43 43 L43 57Z;p o M26 57 Q26 47 32 40 Q38 47 38 57Z;p y M29 57 Q29 51 32 47 Q35 51 35 57Z;l R 2 M10 26 L54 26 M10 41 L20 41 M44 41 L54 41',
    'Pottery': 'p C M23 6 L41 6 L39 17 Q58 27 54 44 Q50 59 32 59 Q14 59 10 44 Q6 27 25 17Z;l d 3 M12 36 Q32 43 52 36;l y 2.5 M16 28 Q32 33 48 28;n W M14 38 Q15 30 22 25 Q18 32 18 40Z',
    'Cave': 'p a M2 59 L12 26 Q32 4 52 26 L62 59Z;p k M19 59 Q17 38 32 33 Q47 38 45 59Z;p A M19 59 Q20 46 28 40 Q22 48 24 59Z;p g M12 26 Q32 4 52 26 Q42 18 32 18 Q22 18 12 26Z',
    'River': 'r 3 3 58 58 l 9;l b 11 M28 3 Q9 22 32 34 Q52 46 35 61;l q 4 M28 3 Q9 22 32 34 Q52 46 35 61;c 12 50 4 g;c 52 14 4 g',
    'Canyon': 'p C M0 10 L22 10 L26 28 L22 40 L26 58 L0 58Z;p C M64 10 L42 10 L38 28 L42 40 L38 58 L64 58Z;p o M0 20 L24 20 L25 26 L0 28Z;p o M64 22 L40 22 L39 28 L64 30Z;l b 6 M32 36 Q30 46 32 60',
    'Lake': 'p a M0 34 L14 16 L24 30 L34 14 L48 32 L56 24 L64 34Z;e 32 46 29 13 b;e 32 44 22 8 q;p g M2 42 Q8 36 14 40 Q12 46 4 48Z;l W 2 M20 46 Q28 43 36 46',
    'Cliff': 'p a M2 6 L36 6 L40 38 L34 59 L2 59Z;p g M2 6 L36 6 L36 13 L28 16 L2 15Z;p b M34 59 Q46 45 62 54 L62 59Z;l A 2 M12 24 L20 28 M22 40 L30 44;c 52 48 2 w',
    'Waterfall': 'p a M2 5 L22 5 L22 59 L2 59Z;p a M42 5 L62 5 L62 59 L42 59Z;p q M22 7 L42 7 L42 50 L22 50Z;l w 3 M28 10 L28 46 M36 12 L36 44;p w M16 52 Q32 42 48 52 Q32 62 16 52Z',
    'Geyser': 'p n M2 48 Q20 40 32 46 Q46 40 62 48 L62 59 L2 59Z;p q M27 46 L25 22 Q32 6 39 22 L37 46Z;c 22 18 7 w;c 42 14 8 w;c 32 8 6 w;l W 2.5 M30 40 L30 24',
    'Hot Spring': 'e 32 46 27 11 a;e 32 44 22 8 b;e 32 43 16 5 q;l e 4 M22 34 Q15 27 22 20 Q28 14 22 8;l e 4 M36 34 Q29 27 36 20 Q42 14 36 8;l e 4 M48 34 Q42 28 48 22',
    'Valley': 'p g M0 58 L19 20 L32 38 L45 20 L64 58Z;p G M0 58 L19 20 L24 28 L10 58Z;p b M25 58 L32 40 L39 58Z;p w M19 20 L23 27 L19 25 L16 28Z',
    'Pond': 'e 32 41 28 14 b;e 32 40 22 9 q;e 22 41 7 3.4 g;e 40 38 5 2.6 g;l G 2.5 M52 28 L53 42;l G 2.5 M56 30 L55 42;e 52 26 2.2 3.4 n;e 56 28 2 3 n',
    'Swamp': 'e 32 47 28 11 G;e 32 46 22 7 t;l N 3.5 M48 40 L56 20;l N 3.5 M54 40 L60 24;c 20 44 3 l;c 30 48 2.5 l;c 40 44 2 l;p g M12 40 Q10 30 18 24 Q16 34 20 40Z',
    'Life': 'l G 4 M32 57 L32 28;p g M32 30 Q16 32 11 15 Q29 13 32 30Z;p g M32 40 Q49 42 54 24 Q36 22 32 40Z;p n M18 57 Q20 49 32 49 Q44 49 46 57Z;n W M18 18 Q22 17 26 22;c 50 12 2 y;c 14 38 2 y;c 54 44 1.6 y',
    'Fog': 'p e M12 34 Q5 34 5 27 Q5 20 14 20 Q16 11 28 11 Q38 9 42 18 Q52 17 56 26 Q58 34 50 34Z;l a 4.5 M6 44 Q20 38 34 44 Q48 50 58 44;l e 4.5 M10 54 Q22 49 34 54 Q44 58 54 54',
    'Dew': 'p g M6 52 Q8 18 54 10 Q54 48 6 52Z;l G 2.5 M10 50 Q28 34 50 14;p b M36 42 Q37 48 41 52 Q44 58 38 59 Q32 59 32 53 Q32 48 36 42Z;n W M34 52 Q34 55 36 57',
    'Tornado': 'l A 4.5 M6 11 Q32 19 58 11;l A 4.5 M13 23 Q32 29 51 23;l a 4.5 M20 35 Q32 40 44 35;l A 4.5 M26 47 Q32 50 38 47;l A 4.5 M31 58 L33 58;c 52 50 2 u;c 12 50 2 u',
    'Hurricane': 'l c 5 M32 32 Q41 30 43 37 Q43 48 32 50 Q17 50 13 37 Q11 20 28 13 Q48 8 56 26 Q60 46 44 57;c 32 32 5 w;l q 2.5 M8 14 Q18 8 24 12',
    'Flood': 'p r M10 36 L10 24 L22 14 L34 24 L34 36Z;r 17 26 10 10 y 2;p b M2 38 Q10 33 18 38 Q26 43 34 38 Q42 33 50 38 Q56 41 62 38 L62 58 L2 58Z;l W 2.5 M8 48 Q14 44 20 48;l W 2.5 M34 52 Q42 48 50 52;p e M44 34 L54 34 L58 40 L40 40Z',
    'Spark': 'l y 3.5 M32 38 L32 12 M32 38 L11 24 M32 38 L53 24 M32 38 L18 56 M32 38 L47 58;c 32 38 7 o;c 32 38 3.5 Y;c 14 12 2 y;c 52 10 2 y',
    'Smoke': 'c 22 47 11 a;c 38 42 12 A;c 30 25 10 a;c 46 24 6 e;c 20 20 5 e;n W M16 42 Q18 36 24 35',
    'Explosion': 'p y M32 2 L38 17 L52 7 L47 23 L62 28 L47 36 L57 52 L40 46 L36 62 L30 46 L14 58 L18 40 L2 34 L18 26 L8 10 L24 19Z;p o M32 14 L36 25 L46 22 L42 32 L50 38 L40 40 L38 50 L31 42 L22 48 L24 38 L14 34 L24 28 L20 19 L29 24Z;p y M32 26 L35 31 L40 32 L35 36 L32 42 L29 36 L24 32 L29 31Z',
    'Eclipse': 'l d 3 M32 3 L32 9 M32 55 L32 61 M3 32 L9 32 M55 32 L61 32 M12 12 L16 16 M48 48 L52 52 M52 12 L48 16 M12 52 L16 48;c 32 32 23 d/50;c 32 32 18 d;c 32 32 15 k;l W 2 M20 22 Q24 16 32 15',
    'Aurora': 'r 3 5 58 54 J 8;n g/75 M3 36 Q12 14 24 22 Q34 30 44 12 Q54 4 61 14 L61 30 Q52 22 44 34 Q34 48 22 38 Q12 30 3 46Z;n v/65 M3 46 Q14 28 26 36 Q38 44 46 28 Q54 20 61 30 L61 42 Q54 36 46 44 Q36 56 24 50 Q12 44 3 58Z;c 12 12 1.4 w;c 50 9 1.6 w;c 34 10 1.2 w',
    'Light': 'l d 3.5 M32 3 L32 12 M32 52 L32 61 M3 32 L12 32 M52 32 L61 32 M11 11 L17 17 M47 47 L53 53 M53 11 L47 17 M11 53 L17 47;c 32 32 14 Y;c 32 32 8 w',
    'Time': 'c 32 32 25 w;c 32 32 25 a/20;l k 2.5 M32 11 L32 14 M32 50 L32 53 M11 32 L14 32 M50 32 L53 32;l k 3.5 M32 32 L32 17;l r 3 M32 32 L43 38;c 32 32 3 k'
  });
  Object.assign(LA_ICONS, {
    'Plant': 'p C M20 44 L44 44 L40 60 L24 60Z;r 18 40 28 6 n 3;l G 3 M32 40 L32 22;p g M32 36 Q16 38 10 22 Q26 20 32 36Z;p l M32 28 Q48 30 54 14 Q38 12 32 28Z;p g M32 22 Q26 12 32 4 Q38 12 32 22Z',
    'Moss': 'p a M6 52 Q6 36 20 32 L44 32 Q58 36 58 52 L58 58 L6 58Z;p l M6 40 Q9 27 18 31 Q21 22 30 26 Q37 20 44 28 Q53 26 58 40 Q50 35 44 40 Q36 34 30 40 Q22 35 16 40 Q10 36 6 40Z;c 18 36 2 g;c 36 33 2 g;c 48 36 2 g',
    'Algae': 'c 32 32 28 q;l G 4 M20 58 Q8 44 20 34 Q30 24 18 10;l g 4 M34 58 Q24 46 36 36 Q46 26 36 12;l G 3.5 M48 56 Q40 46 50 38 Q54 32 48 24;c 12 26 2 w;c 50 14 2.4 w',
    'Seaweed': 'r 3 3 58 58 b 8;l G 4.5 M16 60 Q4 46 18 36 Q30 26 16 12;l g 4.5 M32 60 Q20 48 34 38 Q46 28 34 14;l G 4 M48 60 Q38 50 50 42 Q56 34 48 26;c 24 12 2 q;c 44 8 2.6 q;c 52 48 2 q',
    'Grass': 'p g M8 58 Q9 38 15 18 Q21 38 25 58Z;p l M22 58 Q24 32 31 10 Q38 32 42 58Z;p g M38 58 Q42 38 52 22 Q54 40 56 58Z;l G 2 M15 54 L15 30 M31 54 L31 24',
    'Seed': 'p n M32 58 Q13 53 13 35 Q13 23 32 14 Q51 23 51 35 Q51 53 32 58Z;l N 2.5 M32 24 L32 52;n W M20 34 Q22 27 28 24 Q24 31 24 38Z;p g M32 14 Q27 5 18 7 Q22 15 32 14Z',
    'Tree': 'p n M27 61 L29 36 L35 36 L37 61Z;c 19 30 13 g;c 45 30 13 g;c 32 19 15 l;c 32 34 12 g;n W M22 14 Q27 9 33 10 Q26 13 24 19Z;c 24 36 2 G;c 42 33 2 G',
    'Flower': 'l G 3.5 M32 62 L32 32;p g M32 52 Q20 54 14 44 Q26 42 32 52Z;c 32 11 8 p;c 44 19 8 p;c 40 32 8 p;c 24 32 8 p;c 20 19 8 p;c 32 23 8 y;c 30 21 2.4 Y',
    'Forest': 'p n M14 60 L15 48 L19 48 L20 60Z;p G M17 12 L30 36 L22 36 L33 52 L1 52 L12 36 L4 36Z;p n M46 60 L47 46 L51 46 L52 60Z;p g M49 6 L62 32 L54 32 L63 50 L35 50 L44 32 L36 32Z;p n M31 61 L32 52 L35 52 L36 61Z;p l M33 22 L42 40 L37 40 L45 56 L22 56 L29 40 L24 40Z',
    'Jungle': 'p G M32 60 Q8 48 4 12 Q30 18 32 60Z;p g M32 60 Q56 48 60 12 Q34 18 32 60Z;p l M32 60 Q20 34 32 3 Q44 34 32 60Z;l G 2 M32 56 L32 12;c 46 48 3.6 r;c 52 52 2.6 y;c 14 46 3 o',
    'Bush': 'e 32 56 26 4 K;c 17 42 13 g;c 47 42 13 g;c 32 30 17 l;c 32 44 15 g;n W M22 22 Q27 17 33 18 Q27 21 25 28Z;c 40 38 2 G;c 22 46 2 G',
    'Vine': 'l G 3.5 M10 58 Q2 40 22 34 Q44 28 38 14 Q34 6 44 6;p g M14 46 Q4 46 3 36 Q13 34 14 46Z;p g M30 32 Q34 22 44 24 Q40 34 30 32Z;p l M24 50 Q32 52 36 44 Q28 42 24 50Z;p g M38 18 Q42 8 52 10 Q50 20 38 18Z;p l M44 6 Q52 2 58 8 Q52 12 44 6Z',
    'Cactus': 'p g M25 60 L25 18 Q25 6 32 6 Q39 6 39 18 L39 60Z;p g M25 42 Q12 42 12 30 L12 24 Q12 19 17 21 L17 32 Q17 37 25 36Z;p g M39 36 Q52 36 52 24 L52 18 Q52 14 47 16 L47 26 Q47 31 39 30Z;l G 2 M32 14 L32 54 M28 18 L28 52 M36 18 L36 52;c 32 7 4 p;l k 1.6 M20 28 L18 26 M44 22 L46 20',
    'Fern': 'l G 3 M14 60 Q10 24 48 6;l g 3.5 M17 50 L5 44 M16 44 L28 38 M16 36 L3 28 M18 30 L31 25 M24 22 L12 12 M27 18 L40 20 M34 12 L26 3 M38 10 L50 14;l g 3.5 M20 52 L32 48 M24 38 L12 36',
    'Mushroom': 'p x M22 38 L42 38 L39 59 Q32 62 25 59Z;p r M5 40 Q6 11 32 9 Q58 11 59 40 Q32 46 5 40Z;c 20 26 5 w;c 38 20 6 w;c 47 33 4 w;c 28 36 2.4 w;n W M12 28 Q14 18 22 14',
    'Leaf': 'p g M8 56 Q6 12 56 6 Q58 52 8 56Z;l G 2.5 M8 56 L46 18;l G 2 M22 42 L20 26 M30 34 L30 20 M36 28 L46 30 M20 48 L34 48;n W M16 40 Q20 24 34 16',
    'Stick': 'p n M8 52 L44 12 L50 18 L14 58Z;p N M30 30 L26 16 L30 14 L36 26Z;p N M24 38 L10 34 L10 30 L28 32Z;n W M12 52 L42 18 L44 21 L15 55Z',
    'Rose': 'l G 3.5 M32 62 L32 40;p g M32 54 Q44 56 50 46 Q38 44 32 54Z;p g M32 48 Q22 50 16 42 Q26 40 32 48Z;c 32 24 19 r;p R M32 24 Q40 16 46 24 Q44 34 32 34 Q20 34 18 24 Q20 12 32 12 Q44 12 46 22;l R 2.5 M32 24 Q38 22 38 27 Q36 31 31 29;n W M20 18 Q24 11 32 9',
    'Sunflower': 'l G 4 M32 62 L32 44;p g M32 56 Q46 58 52 48 Q38 46 32 56Z;c 32 11 7 y;c 46 16 7 y;c 52 30 7 y;c 46 44 7 y;c 18 44 7 y;c 12 30 7 y;c 18 16 7 y;c 32 45 7 y;c 32 29 15 N;c 32 29 10 n;c 28 26 2 N;c 36 28 2 N;c 31 34 2 N',
    'Bamboo': 'r 18 3 11 58 g 4;r 36 7 10 52 l 4;r 18 3 11 6 G 2;r 18 30 11 6 G 2;r 36 7 10 6 g 2;r 36 33 10 6 g 2;p g M29 22 Q42 14 54 20 Q42 24 29 22Z;p l M18 38 Q8 34 4 40 Q12 44 18 38Z;p g M46 46 Q56 42 60 48 Q52 52 46 46Z',
    'Palm Tree': 'p n M30 60 Q34 40 31 20 L37 20 Q40 40 38 60Z;l N 2 M31 30 L37 30 M32 40 L38 40 M33 50 L38 50;p g M34 18 Q18 8 6 20 Q22 14 34 18Z;p G M34 18 Q50 8 60 22 Q46 14 34 18Z;p l M34 18 Q40 4 54 2 Q44 8 34 18Z;p g M34 18 Q28 4 14 2 Q24 8 34 18Z;c 32 22 3 N;c 38 23 3 N',
    'Coconut': 'c 32 36 22 N;c 32 36 17.5 n;c 24 30 3.4 N;c 38 29 3.4 N;c 31 42 3.4 N;n W M18 28 Q22 20 31 17 Q23 22 21 31Z;p g M34 14 Q40 6 48 8 Q44 14 34 14Z',
    'Pine': 'p n M29 61 L30 50 L34 50 L35 61Z;p G M32 3 L47 26 L38 26 L52 46 L12 46 L26 26 L17 26Z;p g M32 3 L40 17 L32 20 L24 17Z;p g M32 28 L42 40 L32 43 L22 40Z;c 38 33 2.2 r;c 24 40 2.2 y',
    'Hay': 'r 5 18 54 34 d 7;r 5 18 54 10 y 6;l D 2.5 M5 34 L59 34;l D 2.5 M18 18 L18 52 M46 18 L46 52;l D 2 M10 24 L16 30 M24 24 L30 30 M52 24 L56 30;l y 2.5 M8 14 L12 20 M56 12 L52 20 M30 10 L34 18',
    'Garden': 'p g M2 60 L2 44 Q32 36 62 44 L62 60Z;l G 3 M14 52 L14 34 M32 50 L32 28 M50 52 L50 32;c 14 28 7 r;c 32 22 7 y;c 50 26 7 p;c 14 28 3 y;c 32 22 3 o;c 50 26 3 y;p g M14 46 Q22 44 24 38 Q14 38 14 46Z',
    'Fruit': 'p o M32 16 Q14 10 8 30 Q6 52 26 58 Q32 60 38 58 Q58 52 56 30 Q50 10 32 16Z;l N 3 M32 16 L33 7;p g M33 10 Q44 2 52 8 Q44 16 33 10Z;n W M16 30 Q18 22 26 20 Q20 26 20 36Z;l O 2 M32 20 Q28 38 32 56',
    'Apple': 'p r M32 18 Q18 8 9 26 Q3 44 18 56 Q26 62 32 57 Q38 62 46 56 Q61 44 55 26 Q46 8 32 18Z;l N 3 M32 18 L35 6;p g M35 11 Q46 3 54 10 Q44 17 35 11Z;n W M14 28 Q17 20 25 18 Q20 24 19 34Z',
    'Orchard': 'p n M28 61 L30 38 L35 38 L37 61Z;c 19 29 12 g;c 45 29 12 g;c 32 19 14 l;c 32 34 11 g;c 22 30 3.2 r;c 42 24 3.2 r;c 30 40 3.2 r;c 46 38 3.2 r;c 33 20 3.2 r;e 32 61 26 3 K',
    'Berry': 'l G 2.5 M32 6 L22 28 M32 6 L44 28;p g M32 6 Q44 0 50 8 Q40 12 32 6Z;c 21 37 10 R;c 43 35 10 r;c 32 51 9.5 R;c 21 37 3 r;c 18 34 2 w;c 40 32 2 w;c 29 48 2 w;c 36 52 3 r',
    'Banana': 'p y M8 20 Q14 52 46 54 Q58 54 58 46 Q42 48 28 32 Q22 22 24 12 Q12 8 8 20Z;p D M52 52 L58 46 L60 52 Q56 56 52 52Z;p n M22 12 L26 6 L30 12 Q26 14 22 12Z;l D 2 M14 22 Q20 44 44 50;n W M14 24 Q18 36 26 42',
    'Watermelon': 'p g M3 22 L61 22 Q57 56 32 59 Q7 56 3 22Z;p w M7 22 L57 22 Q54 51 32 54 Q10 51 7 22Z;p r M10 22 L54 22 Q51 47 32 50 Q13 47 10 22Z;e 22 32 2.2 3.4 k;e 32 38 2.2 3.4 k;e 42 32 2.2 3.4 k;e 27 43 2.2 3.4 k;e 38 44 2.2 3.4 k',
    'Grapes': 'l N 3 M32 6 L32 14;p g M32 10 Q44 2 54 8 Q44 16 32 10Z;c 20 20 8 v;c 32 18 8 V;c 44 20 8 v;c 26 32 8 V;c 38 32 8 v;c 20 28 0.1 v;c 32 44 8 v;c 14 30 8 v;c 50 30 8 V;c 32 56 7 V;c 29 15 2 w;c 17 17 2 w;c 41 17 2 w',
    'Ore': 'p A M5 48 Q4 34 14 28 Q18 18 32 18 Q46 18 52 30 Q62 40 54 50 Q48 57 36 57 L18 57 Q8 55 5 48Z;p d M18 34 L26 30 L30 38 L22 42Z;p d M38 38 L46 36 L48 44 L40 46Z;p Y M28 26 L33 24 L35 30 L30 31Z;n W M12 34 Q16 26 24 24 Q18 28 17 36Z;c 30 48 3 o',
    'Metal': '@ingot e a',
    'Gold': '@ingot d Y',
    'Silver': '@ingot e w',
    'Iron': '@ingot A a',
    'Copper': '@ingot C O',
    'Alloy': 'p a M4 34 L8 24 L36 24 L40 34Z;p e M2 56 L6 34 L42 34 L46 56Z;p A M20 22 L26 14 L52 14 L58 22Z;p o M18 38 L24 22 L58 22 L62 42Z;n W M8 38 L18 38 L16 52 L6 52Z',
    'Bronze': '@ingot #c0793a #e6a560',
    'Coal': 'p k M8 46 L14 28 L28 22 L40 30 L38 48 L22 54Z;p A M32 42 L42 32 L56 38 L54 52 L38 55Z;p k M20 20 L28 10 L40 14 L38 24 L28 26Z;n W M16 32 L22 28 L20 38Z;n W M44 38 L50 38 L48 44Z',
    'Steel': 'p A M8 10 L56 10 L56 20 L38 20 L38 44 L56 44 L56 54 L8 54 L8 44 L26 44 L26 20 L8 20Z;n W M10 12 L54 12 L54 14 L10 14Z;n W M28 22 L30 22 L30 42 L28 42Z',
    'Diamond': 'p c M14 10 L50 10 L62 26 L32 58 L2 26Z;p i M14 10 L32 26 L2 26Z;p w M50 10 L62 26 L32 26Z;p q M2 26 L32 26 L32 58Z;l w 2 M14 10 L24 26 L32 58 M50 10 L40 26 L32 58 M24 10 L32 26 L40 10;n W M8 26 L14 16 L20 26Z',
    'Crystal': 'p V M32 3 L42 13 L42 55 L32 61 L22 55 L22 13Z;p v M42 13 L42 55 L32 61 L32 3Z;p V M22 26 L22 56 L8 48 L6 34Z;p v M42 30 L42 56 L56 50 L58 36Z;n W M26 16 L29 14 L29 50 L26 48Z;c 14 20 2 w;c 52 22 2 w',
    'Gem': '@gem v V',
    'Ruby': '@gem r R',
    'Sapphire': '@gem b c',
    'Emerald': '@gem g L',
    'Jewelry': 'l D 3 M9 8 Q9 40 32 44 Q55 40 55 8;l d 2 M9 8 Q9 40 32 44 Q55 40 55 8;p r M32 60 L24 52 Q20 46 26 44 Q30 44 32 48 Q34 44 38 44 Q44 46 40 52Z;l d 4 M26 44 L32 40 L38 44;c 32 50 0.1 r',
    'Ring': 'l D 9 M32 26 Q49 26 49 43 Q49 59 32 59 Q15 59 15 43 Q15 26 32 26Z;l d 5 M32 26 Q49 26 49 43 Q49 59 32 59 Q15 59 15 43 Q15 26 32 26Z;p c M22 6 L42 6 L48 15 L32 30 L16 15Z;p i M22 6 L32 15 L16 15Z;l w 1.6 M22 6 L26 15 L32 30 M42 6 L38 15 L32 30',
    'Necklace': 'c 8 16 5.2 w;c 11 28 5.2 w;c 18 38 5.2 w;c 27 44 5.2 w;c 37 44 5.2 w;c 46 38 5.2 w;c 53 28 5.2 w;c 56 16 5.2 w;c 32 54 7 b;l d 3 M32 44 L32 47;n q M30 51 Q31 49 34 49',
    'Crown': 'p d M7 52 L7 18 L21 33 L32 11 L43 33 L57 18 L57 52Z;r 7 46 50 9 D 3;c 32 8 3.4 r;c 7 17 3 r;c 57 17 3 r;c 20 50 2.6 b;c 32 50 2.6 r;c 44 50 2.6 g;n W M12 28 L14 40 L12 40Z',
    'Chest': 'r 6 28 52 30 n 4;p N M6 28 Q6 8 32 8 Q58 8 58 28Z;l D 3.5 M16 10 L16 58 M48 10 L48 58;r 27 26 10 14 d 3;c 32 32 2.2 k;l N 2 M6 42 L58 42;n W M10 24 Q12 14 24 12',
    'Treasure': 'r 6 36 52 22 n 4;p N M6 36 L6 24 Q8 12 22 8 L12 36Z;p d M12 36 Q14 18 24 16 Q36 14 40 20 Q50 22 52 36Z;c 20 30 5 y;c 32 26 5 d;c 44 30 5 y;p r M28 30 L36 30 L40 24 L32 20 L24 24Z;c 36 40 3 c;l D 3 M6 46 L58 46;r 27 40 10 12 d 3',
    'Magnet': 'l r 12 M16 56 L16 28 Q16 8 32 8 Q48 8 48 28 L48 56;p e M10 44 L22 44 L22 58 L10 58Z;p e M42 44 L54 44 L54 58 L42 58Z;l W 2.5 M20 50 L20 28 Q20 14 32 14;l k 1.6 M10 50 L22 50 M42 50 L54 50',
    'Needle': 'l e 3 M10 58 L50 8;p e M48 6 L54 4 L52 12 L46 14Z;c 51 9 2 w;l r 2.5 M51 9 Q60 22 40 30 Q26 38 38 50 Q46 56 56 54;l W 1.4 M12 56 L48 10',
    'Compass': 'c 32 32 27 d;c 32 32 22 w;p r M32 8 L40 32 L24 32Z;p b M32 56 L24 32 L40 32Z;l k 1.8 M32 10 L32 13 M32 51 L32 54 M10 32 L13 32 M51 32 L54 32;c 32 32 4 d;r 28 1 8 6 d 2',
    'Electricity': 'r 4 46 18 14 A 3;r 42 4 18 14 A 3;l y 5 M13 46 L26 30 L34 36 L50 18;l Y 2 M13 46 L26 30 L34 36 L50 18;c 8 40 2.4 o;c 56 24 2.4 o;l o 2.5 M30 20 L26 12 M44 40 L52 46',
    'Wire': 'l C 5 M10 54 Q8 38 22 36 Q36 34 36 24 Q36 12 50 12;l O 2 M10 54 Q8 38 22 36 Q36 34 36 24 Q36 12 50 12;l r 4 M44 12 L58 12;l b 4 M6 58 L12 58;l O 4.5 M20 46 L30 44 M24 52 L34 50',
    'Battery': 'r 24 6 16 8 a 2;r 14 12 36 48 y 6;r 14 12 36 18 A 5;p k M34 32 L26 44 L32 44 L30 54 L40 40 L34 40Z;l w 2.5 M24 20 L40 20 M32 15 L32 25',
    'Light Bulb': 'p Y M32 5 Q12 5 12 26 Q12 37 21 43 L21 49 L43 49 L43 43 Q52 37 52 26 Q52 5 32 5Z;r 21 49 22 11 a 3;l A 2 M22 54 L42 54;l o 2.4 M26 40 L26 30 L32 24 L38 30 L38 40;n W M18 16 Q22 10 30 9 Q22 14 20 22Z',
    'Lamp': 'p y M16 8 L48 8 L58 34 L6 34Z;r 28 34 8 16 a 2;e 32 54 15 5 A;p Y M20 12 L30 12 L24 32 L12 32Z;l d 2 M32 42 L32 52;n W M18 14 L28 14 L22 28',
    'Candle': 'r 21 24 22 34 h 4;r 21 24 22 8 Y 4;l a 2 M32 24 L32 18;p o M32 4 Q40 12 38 18 Q35 22 32 22 Q29 22 26 18 Q24 12 32 4Z;p y M32 12 Q36 15 35 19 Q32 21 29 19 Q29 15 32 12Z;p Y M27 32 Q27 40 29 42 Q31 38 31 32Z;e 32 59 19 3.4 d',
    'Beehive': 'p y M10 58 Q7 38 15 28 Q20 8 32 4 Q44 8 49 28 Q57 38 54 58Z;l D 3 M14 42 Q32 48 50 42;l D 3 M17 28 Q32 34 47 28;l D 3 M24 14 Q32 18 40 14;p k M27 58 Q26 46 32 43 Q38 46 37 58Z;c 52 14 3.4 y;c 56 20 2 k',
    'Wax': 'p Y M8 30 L22 18 L52 18 L58 30Z;p y M8 30 L58 30 L58 52 L8 52Z;p d M8 30 L58 30 L58 36 L8 36Z;p y M14 52 Q14 60 18 60 Q22 60 22 52Z;n W M12 40 L20 40 L20 48 L12 48Z;c 44 42 3 Y',
    'Torch': 'p n M26 30 L38 30 L36 60 L28 60Z;r 24 28 16 6 N 3;p o M32 2 Q44 14 40 26 Q36 31 32 31 Q28 31 24 26 Q20 14 32 2Z;p y M32 12 Q38 18 36 26 Q32 29 28 26 Q26 18 32 12Z;l N 2 M28 40 L36 42 M28 50 L36 52',
    'Campfire': 'l N 8 M8 58 L54 48;l n 7 M10 48 L56 58;p o M32 6 Q36 20 46 28 Q54 40 44 50 Q38 54 32 54 Q22 54 18 48 Q12 38 22 28 Q26 34 28 36 Q24 20 32 6Z;p y M32 28 Q36 36 40 42 Q42 49 36 51 Q30 51 26 48 Q24 40 32 28Z',
    'Ash': 'p A M4 58 Q8 36 32 30 Q56 36 60 58Z;p e M12 56 Q16 42 32 38 Q46 42 52 56Z;c 22 46 2.4 r;c 40 44 2.4 o;c 31 50 2 y;c 46 52 1.8 r;l a 2.5 M26 26 Q22 18 30 12;l a 2.5 M40 26 Q44 16 36 8',
    'Gunpowder': 'p n M18 12 Q8 32 18 54 L46 54 Q56 32 46 12Z;e 32 12 14 4 N;e 32 54 14 4 N;l N 3 M10 24 L54 24 M10 42 L54 42;l o 2 M32 8 L38 -2;c 38 -2 3 y;c 32 32 5 k;c 28 32 1.5 A;c 36 36 1.5 A',
    'Bomb': 'c 28 40 21 k;n W M14 34 Q17 25 26 22 Q20 28 19 38Z;r 38 14 10 8 A 2;l n 3 M46 14 Q50 8 56 10;p y M58 4 L56 10 L62 8 L57 12 L60 17 L55 13 L52 17 L53 11 L48 8 L54 9Z',
    'Firework': 'l r 3.5 M32 32 L32 8;l y 3.5 M32 32 L52 14;l c 3.5 M32 32 L56 34;l m 3.5 M32 32 L48 54;l o 3.5 M32 32 L16 54;l g 3.5 M32 32 L8 32;l b 3.5 M32 32 L12 14;c 32 6 3 r;c 54 12 3 y;c 59 35 3 c;c 49 58 3 m;c 14 58 3 o;c 5 32 3 g;c 9 11 3 b;c 32 32 5 w',
    'Rocket': 'p r M20 40 L8 54 L20 50Z;p r M44 40 L56 54 L44 50Z;p w M32 3 Q47 16 45 44 L19 44 Q17 16 32 3Z;p r M32 3 Q40 9 43 18 L21 18 Q24 9 32 3Z;c 32 29 6.5 q;p o M24 46 L32 63 L40 46Z;p y M28 46 L32 56 L36 46Z;n W M23 22 Q24 14 28 10 Q26 20 26 36Z',
    'Space': 'r 3 3 58 58 J 8;c 18 18 1.6 w;c 46 12 1.4 w;c 52 30 1.8 w;c 12 40 1.4 w;c 40 52 1.6 w;c 26 8 1.2 w;c 30 30 11 o;n W M23 25 Q26 20 31 19 Q26 22 25 28Z;l y 3 M10 56 Q32 60 56 40;p Y M48 46 L50 50 L54 51 L50 53 L48 57 L46 53 L42 51 L46 50Z',
    'Satellite': 'r 24 22 16 18 e 3;r 3 25 18 12 b 2;r 43 25 18 12 b 2;l W 2 M9 25 L9 37 M15 25 L15 37 M49 25 L49 37 M55 25 L55 37;l a 3 M21 31 L24 31 M40 31 L43 31;l A 3 M32 22 L32 14;c 32 12 3 r;p a M28 40 L36 40 L40 50 Q32 56 24 50Z;l y 2 M44 14 Q52 14 54 8 M44 8 Q47 8 48 4',
    'Planet': 'l d 5 M4 42 Q32 60 60 22;c 32 32 18 b;p g M22 22 Q30 20 34 26 Q28 30 26 36 Q18 32 22 22Z;p g M38 38 Q46 36 48 42 Q42 48 38 38Z;n W M20 24 Q24 17 32 15 Q25 19 24 28Z;l d 5 M10 34 Q40 56 60 22;c 8 16 2 w',
    'Meteor': 'p O M44 22 Q30 22 20 34 Q10 44 2 62 Q22 54 34 46 Q46 36 50 26Z;p y M42 28 Q32 30 24 38 Q16 46 12 54 Q24 48 32 42 Q40 36 44 30Z;c 46 20 14 A;c 40 16 3 a;c 52 26 3.4 a;c 46 12 2 a;n W M38 12 Q42 8 48 7 Q43 11 42 18Z',
    'Comet': 'p q M46 20 Q30 16 18 28 Q8 38 2 60 Q22 52 34 44 Q48 34 54 24Z;p i M44 26 Q34 26 26 34 Q18 42 12 54 Q26 48 34 42 Q42 36 48 28Z;c 46 20 12 w;c 46 20 12 i/60;n W M40 14 Q44 10 50 9 Q45 13 44 20Z;c 12 12 1.6 y;c 56 52 1.6 y;',
    'Galaxy': 'r 3 3 58 58 J 8;l V 4 M32 32 Q42 22 52 30 Q58 40 46 50;l v 4 M32 32 Q22 42 12 34 Q6 24 18 14;l c/70 3 M32 32 Q40 32 40 26;c 32 32 7 Y;c 32 32 3 w;c 14 50 1.4 w;c 50 12 1.4 w;c 10 14 1.2 w;c 54 52 1.4 w',
    'Black Hole': 'r 3 3 58 58 J 8;l o 4 M6 36 Q32 22 58 36 Q32 50 6 36Z;l y 2 M10 36 Q32 26 54 36;c 32 32 12 k;c 32 32 12 J/0;l W 2 M23 30 Q32 23 41 30;c 12 12 1.4 w;c 52 14 1.4 w;c 14 54 1.4 w',
    'Telescope': 'l N 3.5 M32 38 L20 60;l N 3.5 M32 38 L44 60;l N 3.5 M32 38 L32 60;p b M6 34 L40 14 L46 26 L12 46Z;p A M6 34 L12 46 L6 50 L2 40Z;p d M38 12 L46 8 L52 20 L44 26Z;l W 2.5 M12 36 L38 20;c 42 17 0.1 y'
  });
  Object.assign(LA_ICONS, {
    'Alien': 'p l M32 5 Q7 8 7 32 Q9 50 32 61 Q55 50 57 32 Q57 8 32 5Z;p k M11 27 Q21 22 29 37 Q17 40 11 27Z;p k M53 27 Q43 22 35 37 Q47 40 53 27Z;c 18 31 2.2 w;c 46 31 2.2 w;l G 2 M27 49 Q32 52 37 49;n W M16 14 Q22 9 30 8 Q22 12 18 20Z;l G 2.5 M32 5 L32 0',
    'UFO': 'p y/60 M24 40 L40 40 L52 62 L12 62Z;p q M16 34 Q16 10 32 10 Q48 10 48 34Z;p l M26 28 Q26 18 32 18 Q38 18 38 28Z;e 32 36 28 9 a;e 32 34 24 5 e;c 14 36 2.4 y;c 32 40 2.4 y;c 50 36 2.4 y',
    'Astronaut': 'p w M12 64 Q12 42 32 40 Q52 42 52 64Z;r 24 50 16 8 b 2;c 32 24 18 w;p J M18 24 Q18 12 32 12 Q46 12 46 24 Q46 36 32 36 Q18 36 18 24Z;n W M22 18 Q26 14 32 14 Q26 17 24 26Z;c 32 24 18 w/0;r 8 46 8 6 r 2;r 48 46 8 6 d 2',
    'Spaceship': 'p r M8 62 L14 44 L26 52Z;p r M12 40 L24 52 L12 56Z;p w M10 56 Q8 24 54 8 Q56 52 10 56Z;p b M40 12 Q56 10 54 28Q44 22 40 12Z;c 38 30 7 q;c 38 30 4 b;p o M8 62 L0 66 L8 54Z;n W M18 44 Q20 30 36 18 Q24 32 22 46Z',
    'Human': '@bust b s N sh',
    'Baby': 'p P M18 62 Q18 44 32 44 Q46 44 46 62Z;c 32 29 17 s;c 15 30 4 s;c 49 30 4 s;l N 2.5 M32 12 Q37 8 34 3;c 25 29 1.8 k;c 39 29 1.8 k;c 22 36 3 p/70;c 42 36 3 p/70;c 32 37 3 r;n W M22 20 Q26 14 32 14 Q26 17 24 24Z',
    'Love': '@heart 24 34 1.7 r;@heart 42 26 1.4 p;n W M12 24 Q15 18 20 18 Q16 22 16 28Z',
    'Family': '@bust b s N sh 16 36 .62;@bust r s #6b3a1f lg 48 36 .62;@bust y s N sh 32 46 .46',
    'Heart': '@heart 32 30 2.3 r;n W M12 26 Q14 16 22 14 Q16 20 16 30Z',
    'Idea': 'l y 3.5 M32 2 L32 8 M10 12 L14 16 M54 12 L50 16 M4 28 L10 28 M60 28 L54 28;p Y M32 10 Q14 10 14 28 Q14 38 22 44 L22 50 L42 50 L42 44 Q50 38 50 28 Q50 10 32 10Z;r 22 50 20 9 a 3;l A 2 M23 55 L41 55;l o 2.4 M26 40 L26 30 L32 24 L38 30 L38 40;p y M54 48 L56 52 L60 53 L56 55 L54 59 L52 55 L48 53 L52 52Z',
    'Brain': 'p P M32 10 Q16 5 9 19 Q3 30 11 38 Q7 50 22 54 Q28 59 32 54 Q36 59 42 54 Q57 50 53 38 Q61 30 55 19 Q48 5 32 10Z;l m 2.5 M32 12 Q30 30 34 54;l m 2.2 M14 22 Q22 20 27 28 Q20 34 14 32;l m 2.2 M50 22 Q42 20 37 28 Q44 34 50 32;l m 2.2 M16 44 Q24 42 28 46;l m 2.2 M48 44 Q40 42 36 46',
    'Sleep': 'c 24 42 19 s;l k 2.6 M15 40 Q19 44 23 40;l k 2.6 M27 40 Q31 44 35 40;c 25 49 2.4 r;p N M6 40 Q4 22 24 22 Q40 22 42 34 Q30 28 18 32 Q10 34 6 40Z;l b 3.5 M40 8 L52 8 L40 22 L52 22;l b 3 M48 26 L56 26 L48 36 L56 36',
    'Dream': 'p w M12 40 Q4 40 4 30 Q4 20 16 20 Q18 8 32 8 Q46 6 50 18 Q62 18 62 30 Q62 40 52 40Z;c 18 50 3.6 w;c 12 58 2.4 w;p Y M36 14 Q24 14 24 26 Q24 36 36 36 Q30 32 30 25 Q30 18 36 14Z;p y M46 24 L48 28 L52 29 L48 31 L46 35 L44 31 L40 29 L44 28Z;c 44 14 1.8 y',
    'Bone': 'p x M18 40 L40 18 L48 26 L26 48Z;c 14 46 6.5 x;c 20 54 6.5 x;c 44 12 6.5 x;c 52 20 6.5 x;n W M24 40 L40 24 L42 27 L27 42Z',
    'Skeleton': 'L x 3.5 M32 22 L32 44;L x 3 M20 26 Q32 31 44 26;L x 3 M21 32 Q32 37 43 32;L x 3 M22 38 Q32 42 42 38;L x 3.5 M22 24 L12 40;L x 3.5 M42 24 L52 40;p x M23 44 Q32 52 41 44 L39 54 L25 54Z;L x 3.5 M27 54 L23 62;L x 3.5 M37 54 L41 62;c 32 12 9 x;c 28 12 2.4 k;c 36 12 2.4 k;l k 1.6 M29 17 L35 17',
    'Fossil': 'c 32 32 28 a;c 32 32 24 e;l A 3.5 M32 34 Q40 32 40 40 Q38 50 28 50 Q15 48 15 34 Q17 19 33 17 Q50 19 52 36;l W 2 M20 30 Q22 22 32 21;c 32 34 2.2 A;l A 2 M44 24 L50 20 M48 36 L54 36',
    'Dinosaur': 'p g M14 34 L1 52 L20 46Z;e 28 38 20 13 g;p g M38 32 Q48 22 46 12 L60 12 Q62 24 52 38Z;e 53 15 10 7 g;c 56 13 2 k;p G M22 46 L20 59 L31 59 L33 46Z;p G M36 44 L37 59 L47 59 L45 44Z;p G M44 34 L51 38 L46 41Z;p l M20 28 L24 20 L29 28Z;p l M30 26 L35 18 L40 27Z;l G 2 M50 21 L58 21',
    'Ghost': 'p w M13 59 L13 28 Q13 5 32 5 Q51 5 51 28 L51 59 L43 52 L37 59 L32 52 L27 59 L21 52Z;c 24 26 4 k;c 40 26 4 k;e 32 38 4 5 k;c 25 25 1.2 w;c 41 25 1.2 w;n W M18 20 Q20 12 28 10 Q22 14 20 24Z;c 8 14 2 q;c 56 18 1.6 q',
    'Tool': 'l n 6 M14 58 L42 20;p a M32 10 L56 18 L50 34 L28 26Z;l y 3 M36 22 L44 30;l y 3 M32 28 L40 36;n W M34 14 L50 20',
    'Wood': 'c 19 44 14 n;c 19 44 10 f;c 19 44 5 n;c 45 44 14 n;c 45 44 10 f;c 45 44 5 n;c 32 20 14 n;c 32 20 10 f;c 32 20 5 n;l N 1.6 M13 44 L25 44',
    'Log': 'p n M6 20 L46 20 L46 52 L6 52Z;e 46 36 12 16 f;e 46 36 8 11 n;e 46 36 3 5 f;l N 2 M12 28 L36 28 M10 40 L38 44;l N 2 M16 20 L16 24',
    'Plank': 'r 4 10 56 14 f 3;r 4 26 56 14 n 3;r 4 42 56 14 f 3;l N 1.8 M12 17 L50 17 M10 33 L56 33 M16 49 L48 49;c 9 17 1.6 A;c 55 33 1.6 A;c 9 49 1.6 A;c 55 49 1.6 A',
    'Axe': 'l n 6 M14 59 L42 13;p a M34 8 L56 6 Q60 22 46 30 L38 24Z;n W M40 10 L54 9 Q54 16 50 20Z;l A 2 M44 14 Q52 14 54 22',
    'Hammer': 'r 28 18 9 42 n 3;r 12 6 40 16 A 4;r 12 6 9 16 a 3;n W M18 10 L44 10;l N 1.8 M30 36 L35 36 M30 44 L35 44',
    'Nail': 'r 20 6 24 7 a 2;p a M29 13 L35 13 L33 60 L31 60Z;n W M30 14 L31.5 14 L31 56Z;l A 1.6 M30 24 L34 26 M30 32 L34 34 M30 40 L34 42',
    'Saw': 'p e M2 22 L58 24 L58 40 L54 44 L50 40 L46 44 L42 40 L38 44 L34 40 L30 44 L26 40 L22 44 L18 40 L14 44 L10 40 L6 44 L2 40Z;p n M56 18 L63 20 L63 44 L56 44Z;r 54 18 6 28 N 2;c 58 30 2 d;n W M6 26 L50 28',
    'Knife': 'p e M30 3 Q46 20 40 39 L28 39Z;r 28 39 12 21 n 4;r 24 37 20 5 A 2;n W M31 8 Q38 20 34 34;l N 1.8 M32 46 L36 46 M32 52 L36 52',
    'Scissors': 'l a 4.5 M18 6 L44 38;l a 4.5 M46 6 L20 38;l W 2 M19 8 L43 36;e 16 50 8 9 r;e 48 50 8 9 r;e 16 50 4 5 w;e 48 50 4 5 w;c 32 22 3 A',
    'Sword': 'p e M50 4 L60 6 L58 16 L26 44 L20 38Z;l W 2 M52 8 L28 38;p d M10 36 L30 52 L25 57 L8 42Z;L N 6 M18 46 L8 56;c 6 58 4.4 d',
    'Shield': 'p B M9 7 L55 7 L55 32 Q55 53 32 61 Q9 53 9 32Z;p b M13 11 L51 11 L51 32 Q51 49 32 56 Q13 49 13 32Z;L d 4 M32 11 L32 56;L d 4 M13 28 L51 28;c 32 28 4 r',
    'Spear': 'l n 4.5 M8 60 L44 22;p e M38 26 L58 2 L56 30Z;p A M38 26 L56 30 L52 34 L36 30Z;n W M44 20 L56 6',
    'Pickaxe': 'l n 5.5 M18 60 L40 16;p A M10 20 Q34 -2 60 22 Q46 12 34 16 Q22 20 14 30Z;n W M16 22 Q32 8 52 18;c 38 20 0.1 A',
    'Shovel': 'l n 5 M44 4 L36 36;r 36 2 14 6 n 3;p e M24 36 L48 36 L46 56 Q36 63 26 56Z;l W 2.5 M30 40 L30 52;l A 2 M24 36 L48 36',
    'Plow': 'l n 5 M6 22 L50 38;l n 4.5 M48 36 L58 14;r 54 10 8 6 n 3;p A M22 32 L46 42 L42 58 Q28 54 22 32Z;n W M28 38 L40 44;c 8 22 3 A',
    'Gear': '@gear 32 32 27 a 10;c 32 32 8 A;c 32 32 5 w',
    'Machine': '@gear 24 38 21 a 8;@gear 48 20 13 e 6;r 42 40 18 20 A 3;l k 2 M46 46 L56 46 M46 52 L56 52;c 8 56 0.1 a',
    'Factory': 'r 6 30 52 28 R 3;p A M6 30 L6 20 L18 28 L18 20 L30 28 L30 20 L42 28 L42 30Z;r 44 10 10 22 A 2;c 49 6 5 e;c 55 2 4 a;r 12 38 8 8 y 1;r 24 38 8 8 y 1;r 36 38 8 8 y 1;r 26 48 12 10 k 2',
    'Engine': 'r 8 30 48 24 A 4;r 12 16 10 16 a 2;r 27 16 10 16 a 2;r 42 16 10 16 a 2;r 10 12 14 5 e 2;r 25 12 14 5 e 2;r 40 12 14 5 e 2;@gear 46 42 9 y 6;l W 2 M12 36 L40 36',
    'Steam Engine': 'r 4 24 40 24 A 10;r 12 10 9 16 k 2;r 8 6 17 6 A 2;r 40 14 20 34 r 3;r 44 18 12 12 q 2;r 4 44 56 6 k 2;@wheel 16 54 8;@wheel 46 54 8;c 18 4 4 w;c 24 -2 3 w;l W 2 M8 34 L38 34',
    'Chain': 'L a 4 M4 16 Q4 8 12 8 L20 8 Q28 8 28 16 Q28 24 20 24 L12 24 Q4 24 4 16Z;L e 4 M24 16 Q24 10 30 10 Q36 10 36 16 L36 28 Q36 34 30 34 Q24 34 24 28Z;L a 4 M32 40 Q32 32 40 32 L48 32 Q56 32 56 40 Q56 48 48 48 L40 48 Q32 48 32 40Z;L e 4 M10 36 Q10 30 16 30 Q22 30 22 36 L22 52 Q22 58 16 58 Q10 58 10 52Z',
    'Rope': 'L u 6 M10 36 Q10 18 32 18 Q54 18 54 36 Q54 52 32 52 Q10 52 10 36Z;L x 5 M20 36 Q20 28 32 28 Q44 28 44 36 Q44 44 32 44 Q20 44 20 36Z;L u 5 M52 40 Q58 50 54 60;l N 1.6 M16 22 L18 28 M30 18 L30 24 M46 22 L44 28 M52 38 L48 36 M46 50 L44 44',
    'Thread': 'r 12 6 40 9 n 3;r 12 49 40 9 n 3;r 16 15 32 34 r 2;l R 2 M16 22 L48 20 M16 30 L48 28 M16 38 L48 36 M16 46 L48 44;l r 2.5 M48 24 Q58 22 58 32 Q58 42 50 50;n W M20 17 L24 17 L24 47 L20 47Z',
    'Wheel': 'c 32 32 27 N;c 32 32 22 f;c 32 32 15 N;c 32 32 11 f;l N 3.5 M32 10 L32 54 M10 32 L54 32 M16 16 L48 48 M48 16 L16 48;c 32 32 6 N;c 32 32 2.4 d',
    'Cart': 'p n M4 12 L58 12 L52 40 L10 40Z;l N 2.5 M16 12 L18 40 M30 12 L30 40 M44 12 L42 40;@wheel 30 48 11;l N 4 M54 14 L62 8 M54 30 L62 30',
    'Car': 'p r M2 44 L2 34 Q2 30 8 30 L16 28 L24 16 Q26 14 30 14 L42 14 Q46 14 48 18 L54 28 L60 30 Q62 32 62 36 L62 44Z;p q M24 18 L28 28 L40 28 L40 18Z;p q M44 18 L44 28 L52 28 L47 20Z;@wheel 17 46 9;@wheel 48 46 9;c 58 36 2.6 y;l R 1.6 M32 28 L32 40',
    'Bus': 'r 2 8 60 40 y 6;r 6 14 12 14 q 2;r 20 14 12 14 q 2;r 34 14 12 14 q 2;r 48 14 12 14 q 2;l D 2 M2 34 L62 34;@wheel 16 50 8;@wheel 48 50 8;c 58 40 2.6 r;c 6 40 2.6 r',
    'Truck': 'r 2 12 38 36 e 3;p r M40 22 L52 22 L62 34 L62 48 L40 48Z;p q M44 26 L51 26 L58 34 L44 34Z;r 4 14 34 4 w;@wheel 14 50 8;@wheel 34 50 8;@wheel 52 50 8;l a 2 M8 24 L34 24 M8 32 L34 32',
    'Ambulance': 'p w M2 46 L2 18 Q2 14 6 14 L38 14 L38 22 L52 22 L62 34 L62 46Z;p q M42 26 L50 26 L57 34 L42 34Z;p r M16 20 L22 20 L22 26 L28 26 L28 32 L22 32 L22 38 L16 38 L16 32 L10 32 L10 26 L16 26Z;l r 3 M2 42 L62 42;@wheel 16 48 8;@wheel 48 48 8;c 32 12 3 r;c 32 12 0.1 b',
    'Fire Truck': 'r 2 20 46 24 r 3;p r M48 24 L58 24 L62 36 L62 44 L48 44Z;p q M50 28 L56 28 L59 36 L50 36Z;L e 3.5 M4 18 L46 12;L e 2.4 M10 16 L10 20 M18 15 L18 19 M26 14 L26 18 M34 13 L34 17 M42 12 L42 16;l d 2.5 M6 36 L44 36;@wheel 14 48 8;@wheel 52 48 8;c 56 21 2 o',
    'Bicycle': '@wheel 14 44 13;@wheel 50 44 13;L R 3.2 M14 44 L28 24 L42 24 L50 44;L R 3.2 M28 24 L36 44 L14 44;L k 3.5 M26 18 L34 18;L k 3.2 M42 24 L44 14 L52 14;c 36 44 3 d',
    'Motorcycle': '@wheel 14 46 11;@wheel 52 46 11;p r M18 36 Q22 22 36 22 L46 28 L40 38 L22 40Z;p k M16 32 L30 28 L30 22 Q22 22 16 32Z;L A 3.5 M46 28 L52 22;L e 3.5 M50 18 L58 18;p e M30 42 L42 42 L40 50 L32 50Z;c 50 28 3 y;l A 3 M12 36 L24 42',
    'Skateboard': 'p r M4 32 Q4 26 12 26 L52 26 Q60 26 60 32 L60 36 L4 36Z;n W M10 28 L50 28;@wheel 16 46 6.5;@wheel 48 46 6.5;l A 3 M12 40 L16 40 M48 40 L52 40',
    'Rail': 'p n M2 56 L18 8 L26 8 L14 56Z;p n M50 56 L38 8 L46 8 L62 56Z;L a 3 M20 8 L8 56;L a 3 M44 8 L56 56;L N 4.5 M14 48 L58 48;L N 4.5 M17 38 L50 38;L N 4.5 M20 28 L45 28;L N 4.5 M22 18 L42 18'
  });
  Object.assign(LA_ICONS, {
    'Train': 'r 2 22 22 26 b 3;r 6 26 6 8 q 1;r 14 26 6 8 q 1;p A M24 34 L24 24 Q24 20 30 20 L52 20 Q60 20 60 28 L60 48 L24 48Z;r 28 12 9 10 k 2;r 40 28 14 12 r 3;p r M56 40 L62 50 L56 50Z;@wheel 12 52 7;@wheel 36 52 7;@wheel 52 52 7;c 32 8 4 w',
    'Airplane': 'p w M32 2 Q38 8 38 24 L61 39 L61 46 L38 40 L38 52 L46 58 L46 62 L32 59 L18 62 L18 58 L26 52 L26 40 L3 46 L3 39 L26 24 Q26 8 32 2Z;p b M32 2 Q35 5 36 10 L28 10 Q29 5 32 2Z;l b 3 M26 30 L8 41 M38 30 L56 41;c 32 14 2 b;n W M29 14 L29 38',
    'Helicopter': 'e 26 38 20 13 r;p r M42 34 L62 30 L62 38 L42 42Z;p r M58 24 L64 24 L64 38 L58 38Z;L a 3 M6 18 L54 18;L A 3 M26 18 L26 28;p q M14 30 L28 28 L30 38 L12 40Z;L A 3 M10 56 L44 56;L A 2.4 M16 50 L16 56 M34 50 L34 56;L a 2 M62 24 L60 22',
    'Windmill': 'p x M23 61 L28 28 L36 28 L41 61Z;p r M26 28 L32 18 L38 28Z;r 28 46 8 15 n 2;p w M30 22 L27 2 L37 2 L34 22Z;p w M36 24 L58 21 L58 31 L36 28Z;p w M34 30 L37 50 L27 50 L30 30Z;p w M28 28 L6 31 L6 21 L28 24Z;l n 2 M32 6 L32 20 M40 26 L56 26 M32 32 L32 46 M24 26 L8 26;c 32 26 4 N',
    'Balloon': 'p r M32 3 Q54 7 52 27 Q50 40 36 49 L28 49 Q14 40 12 27 Q10 7 32 3Z;p R M28 49 L36 49 L38 54 L26 54Z;l a 2 M32 54 Q27 58 32 62;n W M18 24 Q20 12 30 8 Q22 14 22 28Z',
    'Hot Air Balloon': 'p r M32 2 Q58 4 56 26 Q54 38 42 46 L22 46 Q10 38 8 26 Q6 4 32 2Z;p y M32 2 Q42 12 40 46 L24 46 Q22 12 32 2Z;p b M12 12 Q18 32 24 46 L16 42 Q8 32 8 22Z;p b M52 12 Q46 32 40 46 L48 42 Q56 32 56 22Z;l N 2 M24 46 L26 53 M40 46 L38 53;r 25 52 14 9 n 2',
    'Parachute': 'p r M3 28 Q3 6 32 6 Q61 6 61 28 Q53 22 47 28 Q39 22 32 28 Q25 22 17 28 Q9 22 3 28Z;p y M32 6 Q40 14 39 26 Q36 22 32 28 Q28 22 25 26 Q24 14 32 6Z;l A 1.8 M5 28 L30 50 M19 26 L30 50 M32 28 L32 50 M45 26 L34 50 M59 28 L34 50;c 32 52 4 s;r 28 55 8 8 b 2',
    'Boat': 'p n M3 34 L61 34 Q58 52 44 56 L20 56 Q6 52 3 34Z;l N 2.4 M8 42 L56 42;p f M3 34 L61 34 L60 38 L4 38Z;L n 3 M30 34 L30 12;p w M32 12 L50 30 L32 30Z;p b M2 58 Q10 54 18 58 Q26 62 34 58 Q42 54 50 58 Q58 62 64 58 L64 62 L2 62Z',
    'Ship': 'p A M2 38 L62 38 L53 56 L11 56Z;r 14 24 36 14 w 2;r 18 28 6 6 q 1;r 28 28 6 6 q 1;r 38 28 6 6 q 1;r 26 8 12 16 r 2;r 26 12 12 4 k 1;c 34 4 4 e;c 41 0 3 e;l R 3 M5 44 L59 44;p b M0 58 Q8 54 16 58 Q24 62 32 58 Q40 54 48 58 Q56 62 64 58 L64 62 L0 62Z',
    'Sail': 'L N 3.5 M30 2 L30 60;p w M32 6 L32 50 L58 50Z;p w M28 10 L28 50 L8 50Z;p r M32 22 L32 34 L44 34Z;L n 3.5 M8 54 L56 54;n W M12 44 L26 14',
    'Sailboat': 'p n M6 42 L58 42 Q54 56 42 58 L22 58 Q10 56 6 42Z;L N 3 M30 42 L30 6;p w M33 10 L33 38 L54 38Z;p r M27 14 L27 38 L12 38Z;p b M0 58 Q8 54 16 58 Q24 62 32 58 Q40 54 48 58 Q56 62 64 58 L64 64 L0 64Z;p d M30 4 L38 6 L30 9Z',
    'Submarine': 'e 32 38 29 13 y;p y M22 26 L24 14 L38 14 L40 26Z;L A 3 M30 14 L30 6 L38 6;c 20 38 4.4 q;c 32 38 4.4 q;c 44 38 4.4 q;p A M2 38 L-2 30 L6 32Z;p A M58 32 L66 24 L66 52 L58 44Z;l o 2.5 M10 46 Q32 52 56 46;c 10 20 2.4 q;c 6 12 1.8 q;c 52 14 2 q',
    'Raft': 'r 2 14 52 12 n 6;r 2 28 52 12 f 6;r 2 42 52 12 n 6;e 54 20 6 6 f;e 54 34 6 6 n;e 54 48 6 6 f;l y 3 M14 12 L14 56;l y 3 M40 12 L40 56;l N 1.8 M8 20 L26 20 M10 34 L32 34 M8 48 L28 48',
    'Anchor': 'L A 5 M32 16 L32 56;L A 5 M10 40 Q14 58 32 58 Q50 58 54 40;L A 5 M22 26 L42 26;c 32 10 6 A;c 32 10 2.6 w;p A M4 38 L16 44 L10 52Z;p A M60 38 L48 44 L54 52Z;n W M30 20 L31 20 L31 52 L30 52Z',
    'Lighthouse': 'p w M22 58 L26 22 L38 22 L42 58Z;p r M23 46 L41 46 L42 58 L22 58Z;p r M25 30 L39 30 L40 38 L24 38Z;r 22 12 20 10 y 2;p r M20 12 L32 2 L44 12Z;l y 3 M44 17 L62 11 M44 19 L62 26 M20 17 L2 11 M20 19 L2 26;r 28 50 8 8 n 1',
    'Wall': 'r 2 8 60 48 R 3;l x 3 M2 22 L62 22 M2 36 L62 36 M2 50 L62 50;l x 3 M18 8 L18 22 M42 8 L42 22 M30 22 L30 36 M54 22 L54 36 M12 36 L12 50 M36 36 L36 50;n W M5 10 L14 10',
    'Tower': 'r 14 6 8 14 a 1;r 28 6 8 14 a 1;r 42 6 8 14 a 1;r 12 18 40 8 e 2;r 16 26 32 36 a 2;l A 2 M16 38 L48 38 M16 50 L48 50 M32 26 L32 38 M24 38 L24 50 M40 38 L40 50;p k M28 30 Q28 26 32 26 Q36 26 36 30 L36 34 L28 34Z;p n M26 62 L26 54 Q32 48 38 54 L38 62Z',
    'Castle': 'r 4 20 14 40 a 2;r 46 20 14 40 a 2;r 18 32 28 28 e 2;r 4 14 4 6 a;r 10 14 4 6 a;r 14 14 4 6 a;r 46 14 4 6 a;r 52 14 4 6 a;r 56 14 4 6 a;r 22 24 4 8 e;r 30 24 4 8 e;r 38 24 4 8 e;p n M26 60 L26 46 Q32 38 38 46 L38 60Z;l A 1.6 M32 40 L32 60;p r M32 24 L32 8 L44 12 L32 16Z;p k M8 28 L12 28 L12 34 L8 34Z;p k M50 28 L54 28 L54 34 L50 34Z',
    'Palace': 'p d M20 30 Q20 10 32 4 Q44 10 44 30Z;l D 2 M32 4 L32 -2;c 32 2 2.4 d;r 4 36 56 22 u 2;r 4 30 56 8 x 2;p d M4 30 Q4 22 12 22 Q20 22 20 30Z;p d M44 30 Q44 22 52 22 Q60 22 60 30Z;r 10 40 6 18 w 1;r 22 40 6 18 w 1;r 36 40 6 18 w 1;r 48 40 6 18 w 1;p n M26 58 L26 48 Q32 42 38 48 L38 58Z;c 32 18 3 y',
    'Pyramid': 'p z M2 56 L32 6 L62 56Z;p d M32 6 L62 56 L32 56Z;l D 2 M12 42 L52 42 M20 28 L44 28 M8 50 L56 50;l D 2 M32 42 L32 56 M22 28 L22 42 M42 28 L42 42;p k M28 56 L32 46 L36 56Z;c 50 14 5 y',
    'Statue': 'r 10 54 44 7 a 2;r 16 46 32 9 e 2;p e M22 46 L22 26 Q22 20 32 20 Q42 20 42 26 L42 46Z;c 32 12 8.5 e;p e M42 28 L52 12 L56 16 L46 34Z;p e M22 28 L14 38 L18 42 L24 34Z;n W M26 28 L28 28 L28 44 L26 44Z;l A 1.8 M29 12 Q32 14 35 12',
    'House': 'p r M2 32 L32 6 L62 32Z;r 8 31 48 29 x 2;r 26 40 12 20 n 2;c 35 51 1.4 d;r 11 36 10 10 q 1;r 43 36 10 10 q 1;l w 1.6 M16 36 L16 46 M11 41 L21 41 M48 36 L48 46 M43 41 L53 41;r 44 8 7 14 R 1',
    'Hut': 'p d M2 38 L32 4 L62 38Z;l D 2 M12 30 L52 30 M20 20 L44 20 M6 36 L58 36;r 11 36 42 22 n 2;l N 2 M20 36 L20 58 M32 36 L32 58 M44 36 L44 58;p k M26 58 L26 46 Q32 40 38 46 L38 58Z',
    'Village': 'p r M0 38 L12 26 L24 38Z;r 3 38 18 20 x 1;r 10 46 5 12 n 1;p b M22 34 L36 20 L50 34Z;r 25 34 22 24 u 1;r 32 46 8 12 n 1;r 27 38 6 6 q 1;p o M42 42 L53 32 L64 42Z;r 44 42 18 16 x 1;r 50 48 5 10 n 1;p g M0 58 L64 58 L64 62 L0 62Z',
    'City': 'r 4 28 14 34 a 1;r 20 12 14 50 e 1;r 36 22 12 40 A 1;r 50 32 12 30 a 1;l y 2.4 M8 34 L14 34 M8 42 L14 42 M8 50 L14 50 M24 18 L30 18 M24 26 L30 26 M24 34 L30 34 M24 42 L30 42 M24 50 L30 50 M40 28 L44 28 M40 36 L44 36 M40 44 L44 44 M40 52 L44 52 M54 38 L58 38 M54 46 L58 46;L A 2 M27 12 L27 4;c 27 3 2 r',
    'Skyscraper': 'r 18 8 28 54 b 2;p B M18 8 L24 2 L40 2 L46 8Z;l c 2.4 M22 16 L42 16 M22 24 L42 24 M22 32 L42 32 M22 40 L42 40 M22 48 L42 48 M30 10 L30 60 M38 10 L38 60;n W M20 12 L26 12 L26 56 L20 56Z;L A 2 M32 2 L32 -4;r 8 36 10 26 a 1;r 48 30 10 32 a 1',
    'Bridge': 'p b M0 46 L64 46 L64 62 L0 62Z;p a M0 34 L64 34 L64 44 Q54 44 54 54 L54 62 L48 62 L48 54 Q48 44 32 44 Q16 44 16 54 L16 62 L10 62 L10 54 Q10 44 0 44Z;L A 2 M2 28 L2 34 M14 28 L14 34 M26 28 L26 34 M38 28 L38 34 M50 28 L50 34 M62 28 L62 34;L A 2.4 M0 28 L64 28;l W 2 M14 56 Q20 52 26 56',
    'Road': 'p g M0 8 L64 8 L64 62 L0 62Z;p A M26 8 L38 8 L62 62 L2 62Z;l w 2.6 M32 12 L32 17 M32 24 L32 31 M32 38 L32 47 M32 54 L32 62;l y 1.6 M27 8 L6 62 M37 8 L58 62;p q M0 0 L64 0 L64 8 L0 8Z;c 54 12 0.1 y',
    'Well': 'p r M6 22 L32 6 L58 22Z;L n 3.5 M12 22 L12 40 M52 22 L52 40;p a M8 38 Q8 34 14 34 L50 34 Q56 34 56 38 L56 58 L8 58Z;l A 1.8 M8 46 L56 46 M20 34 L20 46 M34 34 L34 46 M46 46 L46 58 M26 46 L26 58;l N 2 M32 22 L32 34;r 28 34 8 8 n 2',
    'Bucket': 'p n M10 22 L54 22 L48 58 L16 58Z;p f M10 22 L54 22 L53 28 L11 28Z;l A 3 M10 30 L52 30;l A 3 M13 48 L51 48;l a 2.6 M10 22 Q32 -4 54 22;n W M16 30 L22 30 L24 56 L20 56Z',
    'Barn': 'p r M2 28 L12 10 L52 10 L62 28 L62 60 L2 60Z;p w M2 28 L12 10 L52 10 L62 28Z;r 20 32 24 28 w 2;l r 3 M20 32 L44 60 M44 32 L20 60;l w 2 M2 28 L62 28;p R M2 28 L12 10 L16 10 L6 28Z',
    'Fence': 'p n M4 14 L12 6 L20 14 L20 58 L4 58Z;p n M24 14 L32 6 L40 14 L40 58 L24 58Z;p n M44 14 L52 6 L60 14 L60 58 L44 58Z;r 0 22 64 8 f 2;r 0 40 64 8 f 2;c 12 26 1.2 A;c 32 26 1.2 A;c 52 26 1.2 A',
    'Field': 'r 2 4 60 28 q 4;c 48 14 7 y;p w M8 24 Q6 24 6 20 Q6 16 12 16 Q14 10 20 10 Q26 10 28 16 Q34 16 34 22 Q34 24 30 24Z;p g M2 30 L62 30 L62 58 Q62 62 56 62 L8 62 Q2 62 2 58Z;L G 3 M32 30 L6 60 M32 30 L20 62 M32 30 L32 62 M32 30 L44 62 M32 30 L58 60;L l 2 M32 30 L13 62 M32 30 L26 62 M32 30 L38 62 M32 30 L51 62',
    'Farm': 'p r M4 36 L14 22 L38 22 L48 36 L48 60 L4 60Z;r 14 40 20 20 w 2;l r 2.4 M14 40 L34 60 M34 40 L14 60;r 50 16 10 44 e 2;p a M50 16 Q55 6 60 16Z;l A 1.6 M50 28 L60 28 M50 40 L60 40;p g M0 60 L64 60 L64 64 L0 64Z;l n 2.5 M0 56 L2 56',
    'Farmer': '@bust #3a6fd6 s #5a3b1c sh;p d M8 18 Q32 12 56 18 Q56 24 32 24 Q8 24 8 18Z;p y M18 18 Q18 2 32 2 Q46 2 46 18Z;l r 2.5 M18 14 L46 14;r 22 40 6 8 d 1;r 36 40 6 8 d 1',
    'Window': 'r 6 4 52 56 n 4;r 12 10 18 20 q 2;r 34 10 18 20 q 2;r 12 34 18 20 q 2;r 34 34 18 20 q 2;n W M15 13 L22 13 L15 24Z;n W M37 13 L44 13 L37 24Z;r 2 58 60 6 f 2',
    'Door': 'r 12 2 40 60 n 4;p N M12 18 Q32 -4 52 18 L52 2 L12 2Z;r 18 14 12 18 f 2;r 34 14 12 18 f 2;r 18 38 12 18 f 2;r 34 38 12 18 f 2;c 46 38 3 d;l N 2 M32 14 L32 56',
    'Key': 'c 18 18 13 d;c 18 18 5.6 w;L d 6 M28 28 L54 54;L d 4.4 M44 44 L52 38;L d 4.4 M36 52 L44 58;n W M10 10 Q14 6 20 6;c 18 18 5.6 w',
    'Lock': 'L a 6.5 M19 30 L19 18 Q19 5 32 5 Q45 5 45 18 L45 30;r 10 28 44 32 d 6;r 10 28 44 8 y 5;c 32 42 5 k;p k M29 44 L35 44 L36 54 L28 54Z;n W M14 38 L18 38 L18 56 L14 56Z',
    'Ladder': 'r 12 2 7 60 n 2;r 45 2 7 60 n 2;r 19 10 26 5 f 1;r 19 22 26 5 f 1;r 19 34 26 5 f 1;r 19 46 26 5 f 1;c 15 12 1.2 A;c 48 12 1.2 A',
    'Stairs': 'p u M2 60 L2 46 L16 46 L16 33 L30 33 L30 20 L44 20 L44 7 L62 7 L62 60Z;l x 2 M2 46 L16 46 M16 33 L30 33 M30 20 L44 20 M44 7 L62 7;n W M5 49 L14 49 M19 36 L28 36 M33 23 L42 23 M47 10 L60 10',
    'Table': 'r 3 20 58 9 n 3;r 9 29 7 31 f 2;r 48 29 7 31 f 2;r 14 29 36 4 f 1;c 20 14 6 w;c 20 14 6 w/0;p r M38 14 Q38 8 44 8 Q50 8 50 14 L50 20 L38 20Z;n W M20 9 L24 9',
    'Chair': 'r 14 4 8 54 n 3;r 42 30 8 28 n 3;r 14 30 36 8 f 3;r 14 6 36 5 f 2;r 14 16 36 5 f 2;r 18 38 6 20 n 2;n W M16 32 L46 32',
    'Bed': 'r 4 28 8 32 n 3;r 52 36 8 24 n 3;r 4 38 56 14 b 3;r 10 30 18 10 w 4;p B M30 38 L58 38 L58 50 L30 50Z;l w 2 M36 38 L36 50 M44 38 L44 50 M52 38 L52 50',
    'School': 'p r M2 30 L32 12 L62 30Z;r 6 30 52 28 x 2;r 26 44 12 14 n 2;r 10 36 10 8 q 1;r 44 36 10 8 q 1;r 28 4 8 8 e 1;L A 2 M32 4 L32 -2;p r M32 -2 L42 1 L32 4Z;c 32 22 4 w',
    'Library': 'r 2 4 60 56 n 3;r 6 8 52 20 N 2;r 6 34 52 20 N 2;r 8 10 6 16 r 1;r 15 10 5 16 b 1;r 21 12 7 14 g 1;r 29 10 5 16 y 1;r 35 10 8 16 v 1;r 44 12 6 14 r 1;r 51 10 5 16 b 1;r 8 36 7 16 g 1;r 16 38 6 14 o 1;r 23 36 5 16 b 1;r 29 36 8 16 r 1;r 38 38 5 14 y 1;r 44 36 7 16 v 1;r 52 38 4 14 g 1',
    'Hospital': 'r 8 14 48 46 w 3;p a M4 16 L32 4 L60 16Z;r 24 22 16 16 r 2;l w 4 M32 25 L32 35 M27 30 L37 30;r 12 44 10 10 q 1;r 42 44 10 10 q 1;r 26 46 12 14 q 1',
    'Shop': 'r 6 24 52 36 u 2;p r M2 14 L62 14 L58 28 L6 28Z;p w M12 14 L22 14 L22 28 L14 28Z;p w M32 14 L42 14 L42 28 L34 28Z;p w M52 14 L62 14 L58 28 L52 28Z;r 28 38 14 22 n 2;r 10 34 14 14 q 2;r 46 34 10 10 y 2',
    'Bank': 'p a M2 20 L32 4 L62 20Z;r 4 20 56 6 e 2;r 10 26 7 28 w 1;r 21 26 7 28 w 1;r 36 26 7 28 w 1;r 47 26 7 28 w 1;r 2 54 60 8 e 2;L d 2.8 M32 8 L32 16;L d 2.4 M35 10 Q28 8 30 12 Q33 14 35 16 Q36 20 29 18',
    'Safe': 'r 4 6 56 52 A 5;r 10 12 44 40 a 3;c 38 32 11 e;c 38 32 6 A;L r 2.6 M38 32 L43 27;r 14 20 5 8 A 1;r 14 38 5 8 A 1;r 8 58 8 5 k 1;r 48 58 8 5 k 1',
    'Money': 'r 3 14 58 36 g 4;r 8 19 48 26 l 3;c 32 32 10 g;L G 2.6 M36 25 Q27 23 29 29 Q32 32 36 35 Q38 41 28 39 M32 21 L32 43;c 10 22 3 g;c 54 42 3 g',
    'Coin': 'c 32 32 27 d;c 32 32 21 y;p d M32 14 L37 26 L50 26 L40 34 L44 48 L32 40 L20 48 L24 34 L14 26 L27 26Z;n W M16 22 Q20 12 30 9 Q22 14 20 24Z',
    'Wallet': 'r 4 14 56 40 n 6;r 4 14 56 14 N 6;p N M4 28 L36 28 L36 40 L4 40Z;r 36 26 26 20 f 5;c 48 36 3.4 d;p g M12 14 L20 6 L48 6 L52 14Z;c 30 10 3 l;n W M8 18 L26 18',
    'Paper': 'p w M10 4 L42 4 L56 18 L56 60 L10 60Z;p e M42 4 L42 18 L56 18Z;l a 2.2 M17 26 L49 26 M17 34 L49 34 M17 42 L49 42 M17 50 L38 50',
    'Book': 'r 8 6 44 52 b 4;r 8 6 10 52 B 3;r 18 10 30 6 w 1;l y 2.4 M24 24 L46 24 M24 32 L46 32;c 36 46 5 y;r 52 8 4 48 w 1;l a 1.6 M54 12 L54 52',
    'Letter': 'r 3 12 58 40 w 4;p e M3 14 L32 38 L61 14Z;l a 2.4 M3 50 L24 32 M61 50 L40 32;c 32 40 5 r;n W M30 38 L32 36',
    'Pen': 'p w M52 3 Q64 20 40 38 Q28 48 14 56 Q24 36 30 24 Q38 10 52 3Z;L n 2.4 M14 58 L42 30;p A M10 52 L18 54 L16 62 L8 60Z;l a 1.6 M34 20 L44 28 M30 28 L40 36;n W M46 8 Q52 14 50 24',
    'Ink': 'p k M22 24 L14 58 L50 58 L42 24Z;r 24 14 16 11 n 2;r 20 26 24 18 w 2;c 32 35 5 k;p J M16 52 L48 52 L50 58 L14 58Z;p k M54 52 Q52 58 56 58 Q60 58 58 52Q56 50 54 52Z;l J 3 M42 14 L52 4',
    'Pencil': 'p y M6 48 L44 10 L54 20 L16 58Z;p s M6 48 L16 58 L4 62Z;p k M4 62 L8 56 L12 60Z;p r M44 10 L48 6 L58 16 L54 20Z;p e M42 12 L52 22 L50 24 L40 14Z;l D 2 M12 50 L48 14;n W M10 48 L40 18',
    'Painting': 'r 3 6 58 52 d 3;r 9 12 46 40 q 2;p g M9 40 Q20 28 30 36 Q40 26 55 38 L55 52 L9 52Z;c 44 22 6 y;p w M14 24 Q12 24 12 21 Q12 18 17 18 Q19 14 24 15 Q27 15 28 19 Q31 19 31 22 Q31 24 28 24Z;r 3 6 58 52 d/0 3',
    'Paint': 'p u M5 34 Q5 8 34 8 Q62 8 58 32 Q54 44 42 40 Q34 38 38 50 Q34 58 20 54 Q5 48 5 34Z;c 18 28 5 r;c 28 18 5 y;c 42 18 5 b;c 50 30 4.4 g;c 20 42 4.4 m;c 36 36 2.6 N;n W M12 36 Q14 24 24 18',
    'Artist': '@bust #e8e8f0 s #3a2a1a sh;p r M12 14 Q32 -2 52 14 Q52 18 32 18 Q12 18 12 14Z;c 32 3 2.6 r;p u M40 46 Q52 42 60 50 Q60 60 50 60 Q42 58 44 54 Q38 52 40 46Z;c 48 49 2 r;c 54 53 2 y;c 50 57 2 b',
    'Map': 'p x M4 8 L22 12 L42 6 L60 10 L60 54 L42 60 L22 54 L4 58Z;l n 1.6 M22 12 L22 54 M42 6 L42 60;l r 2.4 M10 44 Q16 30 26 38 Q34 46 40 30 Q44 22 52 24;L r 3.4 M44 14 L54 26 M54 14 L44 26;p b M6 48 Q12 44 16 50 L16 56 L6 56Z',
    'Globe': 'L A 3.5 M10 22 Q4 44 24 56;c 32 28 22 b;p g M18 18 Q26 12 34 16 Q30 24 36 30 Q28 34 24 30 Q16 26 18 18Z;p g M40 28 Q50 24 52 32 Q48 42 42 38Z;l w 1.6 M10 28 Q32 36 54 28;n W M18 16 Q24 10 32 8 Q24 14 22 24Z;r 22 54 20 6 A 2;L A 3 M32 50 L32 54',
    'Calendar': 'r 6 10 52 48 w 4;r 6 10 52 14 r 4;L a 3.5 M18 6 L18 14;L a 3.5 M46 6 L46 14;r 12 30 8 7 e 1;r 24 30 8 7 e 1;r 36 30 8 7 e 1;r 48 30 6 7 e 1;r 12 42 8 7 e 1;r 24 42 8 7 r 1;r 36 42 8 7 e 1',
    'Clock': 'c 14 14 8 d;c 50 14 8 d;l D 2 M6 22 L14 14;L A 4 M20 56 L16 62;L A 4 M44 56 L48 62;c 32 36 23 r;c 32 36 18 w;l k 2.4 M32 21 L32 24 M32 48 L32 51 M17 36 L20 36 M44 36 L47 36;L k 3 M32 36 L32 24;L r 2.6 M32 36 L42 40;c 32 36 3 k;r 30 6 4 8 A 1',
    'Hourglass': 'r 8 2 48 8 n 3;r 8 54 48 8 n 3;p i M14 10 L50 10 Q50 28 34 32 Q50 36 50 54 L14 54 Q14 36 30 32 Q14 28 14 10Z;p z M18 12 L46 12 Q42 22 36 26 L28 26 Q22 22 18 12Z;p z M18 52 Q22 42 32 38 Q42 42 46 52Z;l z 2 M32 28 L32 40;L N 3 M12 10 L12 54;L N 3 M52 10 L52 54',
    'Kite': 'p r M32 2 L54 24 L32 52 L10 24Z;p y M32 2 L54 24 L32 24Z;p b M10 24 L32 24 L32 52Z;l A 2 M32 2 L32 52 M10 24 L54 24;l A 1.8 M32 52 Q26 58 34 60 Q42 62 36 66;p r M28 56 L36 54 L30 58Z;p y M36 61 L42 60 L38 65Z',
    'Mirror': 'e 32 26 21 24 d;e 32 26 16 19 q;n W M20 18 Q24 12 32 10 Q24 16 22 26Z;n W M36 40 L42 32 L44 34 L38 42Z;r 28 48 8 14 d 3;e 32 62 10 2 D;c 32 12 3 d',
    'Glasses': 'c 17 34 13 q;c 47 34 13 q;L k 3.5 M4 34 Q4 21 17 21 Q30 21 30 34 Q30 47 17 47 Q4 47 4 34Z;L k 3.5 M34 34 Q34 21 47 21 Q60 21 60 34 Q60 47 47 47 Q34 47 34 34Z;L k 3.4 M30 31 Q32 28 34 31;n W M10 28 Q12 24 18 24 Q12 28 12 34Z;n W M40 28 Q42 24 48 24 Q42 28 42 34Z;L k 3 M4 30 L0 24;L k 3 M60 30 L64 24',
    'Camera': 'r 4 18 56 36 A 6;r 18 10 14 10 a 3;r 40 12 12 8 y 2;c 32 36 15 k;c 32 36 11 b;c 32 36 6 B;c 28 32 3 w;r 8 24 8 5 r 1;l a 1.8 M4 46 L60 46',
    'Photo': 'r 8 4 48 56 w 3;r 13 9 38 34 q 2;p g M13 36 Q22 26 30 32 Q38 24 51 34 L51 43 L13 43Z;c 40 18 5 y;l a 2.4 M16 50 L38 50;l a 2.4 M16 55 L30 55',
    'Microscope': 'p A M10 58 L54 58 L54 62 L10 62Z;L A 5 M22 58 Q4 54 8 34 Q12 20 26 24;p A M34 14 L42 10 L54 38 L46 42Z;r 30 4 8 10 k 2;L e 3.6 M28 24 L44 40;r 22 44 24 5 e 2;l w 2 M30 44 L34 44;r 38 22 10 8 e 2',
    'Science': 'p i M26 4 L38 4 L38 24 L58 54 Q60 60 54 60 L10 60 Q4 60 6 54 L26 24Z;p g M14 42 L50 42 L58 54 Q60 60 54 60 L10 60 Q4 60 6 54Z;r 24 2 16 6 n 2;c 24 50 3 l;c 38 46 2.4 l;c 32 54 2 L;c 30 14 2.4 q;c 34 8 2 q',
    'Scientist': '@bust w s #bfc4cc sh;c 26 25 6 q;c 38 25 6 q;L A 2.4 M32 25 L32 25;L A 2.2 M20 24 L16 22;L A 2.2 M44 24 L48 22;l b 2.4 M22 24 L26 20;p g M48 48 L60 48 L60 56 Q60 62 54 62 Q48 62 48 56Z',
    'Medicine': 'r 14 20 30 40 o 5;r 12 10 34 12 w 4;r 18 30 22 22 w 2;l r 4 M29 34 L29 48;l r 4 M22 41 L36 41;p r M44 40 L58 30 Q64 36 58 42 L50 48Z;p w M44 40 L51 35 L58 46 L50 48Z',
    'Doctor': '@bust w s #3a2a1a sh;c 32 8 4.6 e;c 32 8 2 w;L A 2.2 M32 12 L32 14;L a 2.4 M22 46 Q22 58 32 58 Q42 58 42 46;c 32 56 4 e;r 28 56 8 3 a 1;p r M30 50 L34 50 L34 54 L38 54 L38 58 L34 58 L34 62 L30 62 L30 58 L26 58 L26 54 L30 54Z',
    'Teacher': '@bust #8a5ad6 s #7a5a3a sh;L k 2 M18 25 Q18 20 24 20 Q30 20 30 25 Q30 30 24 30 Q18 30 18 25Z;L k 2 M34 25 Q34 20 40 20 Q46 20 46 25 Q46 30 40 30 Q34 30 34 25Z;r 38 44 22 16 g 2;l w 2 M42 50 L56 50 M42 55 L52 55',
    'Student': '@bust #e8473f s #1e1e1e sh;p k M8 12 L32 3 L56 12 L32 21Z;p k M20 16 L20 26 Q32 31 44 26 L44 16;L d 2.4 M55 13 L55 26;c 55 28 2.4 d;r 40 46 20 14 b 2',
    'Computer': 'r 6 6 52 36 A 5;r 11 11 42 26 b 3;l q 2.4 M16 18 L38 18 M16 25 L30 25;r 26 42 12 8 a 1;r 16 50 32 6 a 3;r 10 56 44 6 e 2;l A 1.6 M14 59 L50 59;n W M14 13 L30 13 L14 30Z',
    'Internet': 'c 32 32 26 b;L w 2.6 M6 32 L58 32;L w 2.6 M32 6 Q16 32 32 58 Q48 32 32 6Z;L w 2.4 M10 17 Q32 26 54 17;L w 2.4 M10 47 Q32 38 54 47;n W M14 20 Q18 12 26 9 Q20 15 18 26Z',
    'Robot': 'L A 3 M32 14 L32 6;c 32 5 4 r;r 12 14 40 28 a 6;r 18 20 28 16 k 4;c 26 28 4.4 c;c 38 28 4.4 c;r 6 22 6 12 A 2;r 52 22 6 12 A 2;r 20 44 24 14 e 3;r 24 48 6 6 r 1;r 34 48 6 6 y 1;r 12 46 8 12 a 2;r 44 46 8 12 a 2;l A 1.8 M24 40 L40 40',
    'Phone': 'p r M6 28 Q4 14 18 14 L46 14 Q60 14 58 28 L50 28 L50 22 L14 22 L14 28Z;r 6 30 52 28 k 6;c 32 44 12 w;c 32 44 9 A;c 32 44 3 w;c 32 36 0.1 w;l w 2.4 M32 34 L32 36 M25 40 L27 41 M39 40 L37 41 M25 48 L27 47 M39 48 L37 47 M32 52 L32 54',
    'Smartphone': 'r 16 3 32 58 k 6;r 20 9 24 40 b 2;c 32 54 3 A;r 25 14 6 6 y 2;r 33 14 6 6 g 2;r 25 24 6 6 r 2;r 33 24 6 6 c 2;r 25 34 6 6 o 2;r 33 34 6 6 v 2;r 26 5 12 2 A 1',
    'Radio': 'r 4 20 56 38 n 6;L A 2.6 M46 20 L58 4;c 22 40 12 N;c 22 40 8 f;l N 2 M16 34 L28 34 M16 40 L28 40 M16 46 L28 46;c 46 32 5 y;c 46 46 4 r;l k 2 M38 38 L54 38;r 4 20 56 8 f/70 6',
    'TV': 'L A 2.4 M22 14 L12 2;L A 2.4 M36 14 L46 2;r 4 14 56 40 n 6;r 9 19 36 30 q 5;n W M13 23 L28 23 L13 40Z;c 52 26 3.4 y;c 52 36 3.4 r;l N 1.6 M48 44 L56 44;r 10 54 6 6 N 2;r 48 54 6 6 N 2'
  });
  Object.assign(LA_ICONS, {
    'Sound': 'p A M6 24 L18 24 L34 10 L34 54 L18 40 L6 40Z;l c 3.4 M42 24 Q48 32 42 40;l c 3.4 M48 16 Q60 32 48 48;n W M9 27 L17 27',
    'Music': 'L k 4 M24 46 L24 10 L50 6 L50 40;p k M24 10 L50 6 L50 16 L24 20Z;c 16 48 8.4 k;c 42 42 8.4 k;n W M12 44 L16 42',
    'Song': 'r 6 6 52 52 w 5;l a 1.8 M12 16 L52 16 M12 24 L52 24 M12 32 L52 32 M12 40 L52 40 M12 48 L52 48;c 20 36 4.4 k;L k 2.2 M24 36 L24 20;c 36 28 4.4 k;L k 2.2 M40 28 L40 12;l k 2.6 M24 20 L40 12',
    'Singer': '@bust #e8473f s #3a2a1a sh;r 24 38 6 6 e 3;L A 2.4 M27 44 L27 50 L34 56;c 21 40 6.4 A;c 46 14 0.1 y',
    'Bell': 'p d M32 6 Q14 8 14 32 L14 40 L8 48 L56 48 L50 40 L50 32 Q50 8 32 6Z;c 32 5 4 d;p y M32 6 Q22 10 20 30 L20 42 L18 46 L26 46 L26 30 Q27 12 32 6Z;c 32 54 6 D;n W M20 16 Q23 10 28 8 Q24 16 22 26Z',
    'Guitar': 'L n 5 M32 34 L58 8;r 52 2 10 10 N 2;c 22 44 14 n;c 14 38 11 n;c 22 44 4 k;L N 1.8 M16 40 L52 10;c 24 38 1.6 w;l w 1 M30 32 L56 8;n W M8 32 Q10 28 16 28',
    'Violin': 'p n M32 2 Q40 4 38 12 L38 22 Q50 24 48 34 Q46 38 42 38 Q50 48 44 58 Q38 62 32 62 Q26 62 20 58 Q14 48 22 38 Q18 38 16 34 Q14 24 26 22 L26 12 Q24 4 32 2Z;r 29 6 6 38 N 2;c 25 40 2 k;c 39 40 2 k;l k 1.4 M32 6 L32 56;L A 2 M44 8 L18 54;n W M22 28 Q22 24 26 24',
    'Piano': 'r 3 12 58 40 k 4;r 6 24 52 26 w 2;l k 1.6 M14 24 L14 50 M22 24 L22 50 M30 24 L30 50 M38 24 L38 50 M46 24 L46 50 M54 24 L54 50;r 11 24 6 16 k 1;r 27 24 6 16 k 1;r 35 24 6 16 k 1;r 43 24 6 16 k 1;r 10 54 6 8 A 1;r 48 54 6 8 A 1',
    'Drum': 'e 32 18 24 9 w;p r M8 18 L8 44 Q32 58 56 44 L56 18 Q32 30 8 18Z;e 32 18 24 9 w;l w 2 M10 22 L24 50 M24 30 L40 52 M40 30 L54 22 M54 40 L40 52;L n 3 M12 4 L30 16;L n 3 M52 4 L34 16;c 12 4 3 n;c 52 4 3 n',
    'Flute': 'L a 6 M4 52 L60 12;L A 1.6 M4 52 L60 12;c 14 46 1.8 k;c 22 40 1.8 k;c 30 34 1.8 k;c 38 28 1.8 k;c 46 22 1.8 k;c 8 50 2 k;n W M6 48 L56 12',
    'Trumpet': 'p d M4 28 L36 28 L36 22 L40 22 L40 28 L42 28 Q62 12 62 32 Q62 52 42 36 L40 36 L40 42 L36 42 L36 36 L4 36Z;p D M44 30 Q56 20 58 32 Q56 44 44 34Z;r 18 18 4 10 d 1;r 24 18 4 10 d 1;r 30 18 4 10 d 1;n W M6 29 L34 29',
    'Orchestra': 'r 2 38 60 22 n 3;p k M6 38 Q14 14 24 24 L24 38Z;p A M38 38 L38 22 L56 22 L56 38Z;c 46 14 5 s;c 14 30 4.6 s;c 30 28 4.6 s;L d 2.4 M48 26 L58 16;c 59 14 3 d;c 30 20 0.1 k;L k 2 M33 20 L33 8;c 31 8 3 k',
    'Bow': 'L n 4 M12 4 Q54 32 12 60;l w 1.6 M12 4 L12 60;L r 3 M24 32 L56 32;p a M56 28 L64 32 L56 36Z;p w M20 28 L26 32 L20 36Z',
    'Arrow': 'L n 3 M6 58 L50 14;p a M46 6 L58 6 L58 18 L52 20 L46 14Z;p r M6 58 L6 46 L12 52Z;p r M6 58 L18 58 L12 52Z;p r M12 52 L18 46 L22 50Z',
    'Archer': '@bust #3a8a46 s #8a5a2b sh;p g M10 12 Q32 -2 54 12 L54 20 Q32 14 10 20Z;L n 3 M52 20 Q64 34 52 56;l w 1.2 M52 20 L52 56;L r 2 M30 38 L56 38;p a M56 35 L62 38 L56 41Z',
    'Feather': 'p w M10 58 Q4 20 36 6 Q58 2 60 8 Q58 14 52 34 Q36 54 10 58Z;l a 2.2 M10 58 L46 14;l a 1.6 M24 46 L36 40 M30 36 L40 30 M18 52 L28 48 M36 26 L46 22;n W M16 46 Q14 28 30 14;L N 2.4 M10 58 L4 63',
    'Leather': 'p n M6 12 L20 6 L30 14 L44 6 L58 14 L54 34 L58 50 L40 58 L28 52 L12 56 L8 38Z;l N 2 M12 16 L20 12 M44 12 L52 18 M12 48 L20 46 M46 50 L52 46;l d 1.6 M14 26 L50 26;n W M10 14 L22 10 L18 24Z',
    'Wool': 'c 20 22 12 w;c 36 20 12 w;c 46 34 12 w;c 18 38 12 w;c 32 44 13 w;c 32 32 10 w;c 28 28 3.4 e;c 40 40 3 e;c 22 40 3 e',
    'Cloth': 'p b M4 14 Q16 6 28 14 Q44 22 60 12 L60 52 Q44 62 28 54 Q16 46 4 54Z;l B 1.6 M4 24 Q16 16 28 24 Q44 32 60 22 M4 34 Q16 26 28 34 Q44 42 60 32 M4 44 Q16 36 28 44 Q44 52 60 42;n W M8 16 Q14 14 20 18 L10 28Z',
    'Shirt': 'p b M20 6 Q32 14 44 6 L62 18 L54 32 L48 28 L48 60 L16 60 L16 28 L10 32 L2 18Z;p B M20 6 Q32 14 44 6 L40 4 Q32 10 24 4Z;n W M20 16 L26 16 L26 54 L20 54Z;l B 1.6 M16 56 L48 56',
    'Hat': 'p r M12 36 Q10 8 32 8 Q54 8 52 36Z;e 32 38 29 7 R;p R M12 34 L52 34 L52 40 L12 40Z;n W M18 30 Q18 16 28 12 Q22 18 22 30Z;c 32 8 3 y',
    'Shoe': 'p n M4 30 L24 30 Q26 40 40 42 Q52 42 58 48 L60 58 L4 58Z;r 2 52 58 8 k 2;p w M4 30 L24 30 L22 24 L4 24Z;l w 2 M24 36 L34 38 M20 42 L30 44;l N 1.6 M8 36 L14 36;n W M8 44 L20 44',
    'Boot': 'p N M16 4 L40 4 L40 36 Q44 42 58 46 L60 58 L12 58 L14 36Z;r 10 54 52 8 k 2;l u 2.4 M16 14 L40 14;l w 2 M16 24 L40 24;n W M20 8 L24 8 L22 40Z',
    'Glove': 'p b M14 30 Q8 12 14 6 Q18 4 20 10 L22 22 L24 6 Q28 2 30 8 L32 22 L36 8 Q40 6 42 12 L42 26 L48 18 Q54 16 52 24 Q46 44 42 50 L18 56Z;r 16 52 28 10 w 3;n W M18 14 L22 14 L24 30',
    'Scarf': 'p r M6 12 Q32 2 58 12 L58 26 Q32 18 6 26Z;p r M40 24 L56 24 L52 60 L36 60Z;l w 3 M38 36 L54 36 M37 46 L52 46;l w 3 M10 14 L10 24 M22 12 L22 22 M34 12 L34 22 M46 12 L46 22;l y 2 M38 56 L38 60 M44 56 L44 60 M50 56 L50 60',
    'Coat': 'p o M20 4 Q32 12 44 4 L62 18 L58 56 L46 58 L44 30 L44 62 L20 62 L20 30 L18 58 L6 56 L2 18Z;p r M20 4 Q32 14 44 4 L38 2 Q32 8 26 2Z;l N 1.6 M32 12 L32 62;c 28 30 1.8 d;c 28 42 1.8 d;c 36 30 1.8 d;c 36 42 1.8 d',
    'Dress': 'p P M24 4 L28 4 L32 12 L36 4 L40 4 L42 24 L58 60 Q32 66 6 60 L22 24Z;l m 2 M22 24 L42 24;p m M24 4 L28 4 L32 12 L36 4 L40 4 L36 16 Q32 20 28 16Z;n W M26 28 L30 28 L22 58Z',
    'Umbrella': 'p r M4 32 Q4 6 32 6 Q60 6 60 32 Q52 26 46 32 Q38 26 32 32 Q26 26 18 32 Q10 26 4 32Z;p y M32 6 Q42 12 40 30 Q36 26 32 32Z;p y M32 6 Q22 12 24 30 Q28 26 32 32Z;L n 3 M32 32 L32 54 Q32 62 24 60;n W M10 22 Q14 12 24 9 Q16 16 14 26Z',
    'Backpack': 'r 12 8 40 52 g 10;r 18 38 28 18 G 4;r 22 44 20 4 d 1;r 20 6 24 8 G 4;L G 3 M8 28 L8 50;r 22 22 20 10 G 3;n W M16 14 L20 14 L18 34Z',
    'Tent': 'p r M2 56 L32 6 L62 56Z;p R M32 6 L62 56 L32 56Z;p k M26 56 L32 30 L38 56Z;l n 2.4 M32 6 L32 2;l y 2 M8 50 L26 50;l y 2 M38 50 L56 50',
    'Flag': 'L N 4 M12 4 L12 62;p r M14 6 Q30 0 40 8 Q52 14 60 8 L60 34 Q52 40 40 34 Q30 28 14 34Z;n W M16 10 Q28 6 36 12 L16 24Z;c 12 4 3.4 d',
    'Armor': 'p a M20 4 L44 4 L58 14 L52 30 L44 26 L44 60 L20 60 L20 26 L12 30 L6 14Z;p e M32 4 L32 60 L20 60 L20 26 L12 30 L6 14 L20 4Z;l A 2 M20 36 L44 36 M32 4 L32 60;c 32 20 4 d;n W M14 12 L18 8 L18 22Z',
    'Knight': 'p a M14 62 L14 26 Q14 6 32 6 Q50 6 50 26 L50 62Z;p e M14 26 Q14 6 32 6 L32 62 L14 62Z;r 18 22 28 6 k 2;l A 2.4 M32 30 L32 54;l A 1.8 M22 38 L42 38;p r M32 6 Q38 -2 46 2 Q40 4 38 10Z;n W M18 14 L22 10 L20 22Z',
    'Helmet': 'p a M8 46 Q4 14 32 8 Q60 14 56 46 L46 56 L18 56Z;p e M8 46 Q4 14 32 8 L32 56 L18 56Z;r 14 26 36 8 k 3;r 28 36 8 18 A 2;l A 1.8 M14 40 L22 40 M42 40 L50 40;p r M32 8 Q36 -2 44 2 Q38 4 36 10Z;n W M12 22 Q16 14 24 12',
    'King': '@bust #8a1e8a s #9a9a9a sh;p d M16 14 L18 2 L25 9 L32 0 L39 9 L46 2 L48 14Z;c 32 5 2 r;c 18 3 1.6 b;c 46 3 1.6 b;p w M20 34 Q32 42 44 34 L44 44 Q32 52 20 44Z',
    'Queen': '@bust #d2479c s #b8801b lg;p d M18 14 L20 6 L26 10 L32 2 L38 10 L44 6 L46 14Z;c 32 5 2 b;c 20 6 1.6 r;c 44 6 1.6 r;c 32 38 2 y',
    'Army': '@bust #4a6a3a s #3a2a1a sh;p G M16 14 Q16 -2 32 -2 Q48 -2 48 14Z;l G 2 M16 12 L48 12;c 24 36 0.1 k;r 38 44 22 6 A 2;r 52 40 8 14 A 2;c 8 52 6 G;c 14 56 5 g',
    'Pirate': '@bust #e8e8f0 s #3a2a1a sh;p k M12 16 Q32 -6 52 16 Q32 12 12 16Z;p k M18 12 L46 12 L40 4 L24 4Z;c 38 25 6 k;l k 2 M30 18 L50 14;p w M31 6 Q28 8 28 10 L30 12 M33 6 L35 12;c 28 22 0.1 k;c 22 38 0.1 k;l k 2 M38 30 L44 24;c 54 36 2 d;L k 2 M10 28 Q14 36 10 44',
    'Wizard': '@bust #3a3ab0 s #cfcfd8 lg;p v M12 24 Q20 22 32 24 Q44 22 52 24 L36 24 L32 -2 L28 24Z;p B M16 20 L48 20 L48 25 L16 25Z;c 32 8 2 y;c 24 14 1.6 y;c 40 16 1.6 y;p w M22 32 Q32 52 42 32 L38 52 Q32 62 26 52Z',
    'Magic': 'p y M32 2 L38 24 L60 32 L38 40 L32 62 L26 40 L4 32 L26 24Z;p Y M32 12 L35 26 L50 32 L35 38 L32 52 L29 38 L14 32 L29 26Z;p v M52 4 L54 10 L60 12 L54 14 L52 20 L50 14 L44 12 L50 10Z;p c M10 44 L12 50 L18 52 L12 54 L10 60 L8 54 L2 52 L8 50Z',
    'Magic Wand': 'L k 5 M8 56 L46 18;L w 2 M8 56 L20 44;L k 3 M20 44 L34 30;p y M48 2 L52 10 L60 12 L52 16 L48 24 L44 16 L36 12 L44 10Z;c 12 12 2.4 y;c 54 40 2.6 v;c 20 6 2 c;p y M8 30 L10 34 L14 36 L10 38 L8 42 L6 38 L2 36 L6 34Z',
    'Genie': 'p b M6 56 Q4 36 20 30 L30 28 Q40 30 48 38 Q60 46 54 58 L44 62 Q36 56 28 62Z;c 30 18 10 b;p c M20 12 Q30 6 40 12 L40 16 Q30 10 20 16Z;p c M18 10 Q28 -2 40 4 L42 12 Q30 8 18 14Z;c 26 18 2 k;c 34 18 2 k;l k 1.8 M26 24 Q30 27 34 24;p d M10 52 L14 46 L32 46 L36 52 L38 58 L6 58Z',
    'Elf': '@bust #3a8a46 s #d9a566 lg;p s M14 24 L4 14 L16 20Z;p s M50 24 L60 14 L48 20Z;p g M18 14 L32 6 L46 14 L32 16Z;l y 2 M30 6 L26 -2',
    'Fairy': 'p V M30 32 Q6 12 10 4 Q16 2 30 20Z;p V M34 32 Q58 12 54 4 Q48 2 34 20Z;p P M30 34 Q6 40 14 58 Q24 56 30 40Z;p P M34 34 Q58 40 50 58 Q40 56 34 40Z;p m M26 30 L38 30 L42 50 L22 50Z;c 32 22 8 s;p y M24 18 Q32 8 40 18 L36 14 L28 14Z;L d 2 M44 36 L56 26;c 57 24 2.6 y;c 8 24 1.4 y;c 54 8 1.4 y',
    'Unicorn': 'p w M10 62 L12 40 Q8 34 14 28 Q16 14 30 14 Q44 8 52 18 Q60 32 52 42 L50 62 L42 62 L40 46 L22 46 L18 62Z;p y M30 14 L34 -2 L38 14Z;p p M14 28 Q8 16 18 12 Q20 22 22 28Z;p v M22 22 Q8 24 12 42 Q16 34 22 32Z;p m M20 36 Q4 40 8 54 Q14 46 20 42Z;c 38 26 1.8 k;c 54 28 2 P',
    'Dragon': 'p G M34 2 L42 16 L50 8 L54 24 L58 20 L56 36 L48 46 Q56 52 50 62 L22 62 Q8 60 10 46 Q12 32 22 28 Q22 16 28 8Z;p g M20 34 Q16 46 26 56 L46 56 Q50 46 44 40 L34 34Z;p l M14 50 Q18 58 28 60 L42 60 L42 56 L24 54Z;p o M30 6 L34 -2 L38 8Z;c 36 20 2.4 y;c 36 20 1 k;p r M44 26 Q52 30 48 36 Q56 34 52 40 L44 36Z;p w M22 6 L24 12 L26 6Z',
    'Phoenix': 'p r M32 8 Q38 8 38 16 L36 26 Q54 12 62 14 Q56 24 46 34 Q56 36 60 46 Q48 44 40 40 L42 52 Q36 60 32 62 Q28 60 22 52 L24 40 Q16 44 4 46 Q8 36 18 34 Q8 24 2 14 Q10 12 28 26 L26 16 Q26 8 32 8Z;p o M32 16 Q36 30 38 40 Q34 54 32 58 Q30 54 26 40 Q28 30 32 16Z;p y M32 28 Q35 40 32 52 Q29 40 32 28Z;p d M32 8 L38 12 L32 14Z;c 30 14 1.2 k',
    'Mermaid': 'p t M24 38 Q34 34 40 42 Q50 44 58 36 L62 40 Q58 52 46 58 Q56 62 62 66 L40 66 Q22 64 22 50Z;l t 0.1 M22 50 L22 50;c 24 18 9 s;p O M14 22 Q10 6 24 6 Q38 6 34 24 Q30 14 24 14 Q16 14 14 22Z;p O M12 24 Q6 36 14 44 L18 28Z;p m M16 36 L32 36 L30 44 L18 44Z;p s M18 36 L30 36 L28 42 L20 42Z;c 21 18 1.2 k;c 28 18 1.2 k',
    'Centaur': 'p n M6 62 L8 42 Q6 30 16 28 L50 28 Q60 30 60 42 L58 62 L52 62 L50 46 L24 46 L20 62Z;p N M54 28 Q64 36 58 50 Q56 40 52 34Z;c 24 14 7 s;p N M17 12 Q19 3 26 5 Q32 6 31 14 Q26 10 22 14Z;p s M20 20 L28 20 L30 32 L18 32Z;L N 2 M32 22 L42 16;L A 1.6 M42 8 L42 24',
    'Pegasus': 'p w M10 62 L12 44 Q6 34 14 28 Q16 16 28 16 L40 16 Q52 20 52 32 L52 62 L44 62 L42 46 L22 46 L18 62Z;p V M30 28 Q16 8 2 10 Q6 28 22 34Z;p V M34 26 Q42 4 58 4 Q58 22 42 34Z;p e M22 14 L18 2 L26 12Z;p v M18 22 Q4 28 8 44 Q14 36 18 34Z;c 24 24 1.8 k;c 12 30 1.6 P',
    'Snowman': 'c 32 46 17 w;c 32 22 12 w;L N 2.4 M16 36 L4 28 M48 36 L60 28;p k M20 14 L44 14 L40 2 L24 2Z;r 18 12 28 4 k 1;c 27 20 1.8 k;c 37 20 1.8 k;p o M32 24 L44 26 L32 28Z;p r M20 34 Q32 40 44 34 L44 38 Q32 44 20 38Z;c 32 46 1.8 k;c 32 54 1.8 k;c 28 22 0.1 k',
    'Ball': 'c 32 32 26 r;p w M6 32 Q32 22 58 32 Q32 42 6 32Z;p r M26 6 Q32 30 26 58 L22 56 Q28 30 22 8Z;l k 1.8 M6 32 Q32 24 58 32 M6 32 Q32 40 58 32;n W M16 18 Q20 12 30 8 Q22 14 20 24Z',
    'Soccer': 'c 32 32 27 w;p k M32 18 L44 26 L40 40 L24 40 L20 26Z;p k M32 5 L40 8 L36 15 L28 15 L24 8Z;p k M56 24 L58 34 L50 34 L48 26Z;p k M8 24 L16 26 L14 34 L6 34Z;p k M18 56 L24 46 L40 46 L46 56 L38 60 L26 60Z;l a 1.8 M32 18 L32 15 M44 26 L50 26 M40 40 L46 46 M24 40 L18 46 M20 26 L14 26;n W M14 14 Q20 8 28 6',
    'Golf': 'c 32 52 9 w;e 32 62 28 5 g;c 29 50 1 e;c 35 54 1 e;c 33 48 1 e;p w M32 61 L32 61Z;L a 3 M32 4 L32 44;p r M34 4 L52 10 L34 18Z;c 32 62 2 k;n W M26 46 Q28 44 30 44',
    'Racket': 'e 26 24 20 24 a;e 26 24 15 19 w;l e 1.4 M12 14 L40 34 M10 24 L42 24 M12 34 L40 14 M18 7 L34 41 M34 7 L18 41;L n 5 M38 42 L58 62;n W M12 18 Q14 10 22 6',
    'Tennis': 'c 32 32 26 y;p w M10 12 Q22 32 10 52 L14 54 Q28 32 14 10Z;l w 3 M8 16 Q24 32 8 48 M56 16 Q40 32 56 48;n W M18 14 Q24 8 34 6',
    'Ski': 'p r M8 60 L44 4 Q48 0 52 4 L52 8 L14 62Z;p b M22 62 L56 10 Q60 6 63 10 L62 14 L28 64Z;L A 2.4 M4 14 L22 52;c 4 12 4 A;L A 2.4 M14 8 L36 50;c 14 6 4 A',
    'Sled': 'L A 3 M6 44 Q2 52 12 54 L52 54 Q62 54 58 44;r 8 38 48 10 r 3;l w 2 M12 43 L50 43;r 14 28 4 10 n 1;r 44 28 4 10 n 1;L n 2 M16 28 Q32 14 52 18',
    'Trophy': 'p d M16 6 L48 6 L46 28 Q40 40 32 40 Q24 40 18 28Z;L d 3.6 M16 12 Q4 12 6 22 Q8 30 18 30;L d 3.6 M48 12 Q60 12 58 22 Q56 30 46 30;r 28 40 8 10 D 1;r 18 50 28 10 n 3;r 22 52 20 5 d 1;n W M20 10 L26 10 L24 28Z;p y M32 12 L34 18 L40 18 L35 22 L37 28 L32 24 L27 28 L29 22 L24 18 L30 18Z',
    'Chess': 'p w M26 4 L38 4 L38 12 L44 12 L40 20 L36 22 L40 46 L48 52 L48 60 L16 60 L16 52 L24 46 L28 22 L24 20 L20 12 L26 12Z;l a 1.8 M24 46 L40 46 M28 22 L36 22;n W M26 24 L28 24 L26 46 L24 46Z',
    'Cards': 'r 6 10 32 44 w 4;r 22 12 32 44 w 4;p r M38 24 Q38 20 41 20 Q45 20 45 24 Q45 28 38 34 Q31 28 31 24 Q31 20 35 20 Q38 20 38 24Z;l a 2 M28 20 L28 22 M48 46 L48 48;l r 2 M27 18 L27 26;r 22 12 32 44 w/0 4',
    'Party': 'p y M6 58 L24 12 L52 40Z;p r M12 52 L20 30 L36 46Z;p b M24 12 L28 8 L56 36 L52 40Z;l w 3 M18 28 L38 48;l w 2.6 M24 14 L42 40;c 30 6 3 r;c 52 20 2.4 c;c 60 30 2.4 y;c 44 8 2.4 m;p g M48 6 L50 12 L56 14 L50 16 L48 22 L46 16 L40 14 L46 12Z;l v 2.4 M54 46 Q60 42 62 50',
    'Birthday': 'r 6 34 52 24 P 4;r 6 34 52 8 m 3;p w M6 42 Q14 52 22 42 Q30 52 38 42 Q46 52 58 42 L58 34 L6 34Z;l b 3 M16 22 L16 34 M32 22 L32 34 M48 22 L48 34;p y M16 12 Q12 18 16 22 Q20 18 16 12Z;p y M32 12 Q28 18 32 22 Q36 18 32 12Z;p y M48 12 Q44 18 48 22 Q52 18 48 12Z;c 16 19 1.4 o;c 32 19 1.4 o;c 48 19 1.4 o',
    'Spring': 'e 32 54 26 5 g;L G 2.6 M32 54 L32 24;p P M32 24 Q20 22 18 12 Q26 8 32 18Z;p P M32 24 Q44 22 46 12 Q38 8 32 18Z;p P M32 24 Q22 34 14 28 Q18 18 32 24Z;p P M32 24 Q42 34 50 28 Q46 18 32 24Z;c 32 22 6 y;p g M32 44 Q18 40 14 48 Q26 52 32 48Z;p g M32 40 Q46 38 50 44 Q42 48 32 44Z;c 10 14 2 p;c 56 12 2 p',
    'Summer': 'c 32 32 14 y;l y 4 M32 4 L32 12 M32 52 L32 60 M4 32 L12 32 M52 32 L60 32 M12 12 L18 18 M46 46 L52 52 M12 52 L18 46 M46 18 L52 12;c 28 28 3 Y;c 28 32 0.1 k;l o 2 M26 38 Q32 42 38 38;c 27 29 1.6 k;c 37 29 1.6 k',
    'Autumn': 'p o M32 2 L38 14 L50 8 L46 22 L60 22 L50 32 L56 44 L42 42 L40 54 L32 46 L24 54 L22 42 L8 44 L14 32 L4 22 L18 22 L14 8 L26 14Z;p r M32 8 L36 20 L46 16 L42 28 L52 30 L42 36 L46 46 L36 42 L32 52 L28 42 L18 46 L22 36 L12 30 L22 28 L18 16 L28 20Z;L N 2.4 M32 52 L32 62;l N 1.8 M32 12 L32 44 M32 28 L22 20 M32 28 L42 20',
    'Winter': 'l c 4 M32 6 L32 58 M9 19 L55 45 M9 45 L55 19;l c 4 M24 8 L32 16 L40 8 M24 56 L32 48 L40 56 M6 28 L14 32 L6 36 M58 28 L50 32 L58 36;l i 2 M32 6 L32 58 M9 19 L55 45 M9 45 L55 19;c 32 32 5 w;c 32 32 2.4 c',
    'Animal': 'e 20 36 8 10 s;c 22 14 5 n;c 12 22 5 n;c 32 22 5 n;c 40 14 5 n;e 44 42 15 18 n;c 44 38 6 f;c 44 50 4 f;c 14 34 4 f;c 8 26 4 f;c 32 36 4 f'
  });
  Object.assign(LA_ICONS, {
    'Fish': 'p b M4 32 Q18 10 40 14 Q52 18 58 32 Q52 46 40 50 Q18 54 4 32Z;p B M52 32 L64 18 L64 46Z;p c M20 24 Q30 20 34 26 Q28 30 20 28Z;c 14 30 3 w;c 14.5 30 1.5 k;p B M28 44 L36 56 L40 46Z;n W M12 24 Q20 18 32 18',
    'Shark': 'p A M2 40 Q12 18 36 22 Q52 24 62 40 Q52 44 44 44 L38 54 L32 44 Q14 48 2 40Z;p A M30 22 L36 4 L44 24Z;p A M54 38 L64 26 L62 44Z;p w M8 42 Q20 38 36 42 L34 46 Q20 44 10 46Z;c 14 34 2.4 k;l k 1.6 M16 40 L18 36 M22 40 L24 36 M28 41 L30 37;l a 1.6 M20 26 L22 32',
    'Whale': 'p b M2 44 Q2 20 24 18 Q44 16 50 36 L58 24 L64 30 L58 42 L64 54 L56 54 L48 46 Q40 56 24 54 Q4 54 2 44Z;p i M6 46 Q24 54 44 46 Q38 54 24 54 Q10 54 6 46Z;c 14 32 2.4 k;p c M28 16 L26 8 M30 16 L32 6 M34 16 L38 8;l c 2.6 M30 16 L28 6 M30 16 L36 6;n W M10 28 Q14 22 22 20',
    'Dolphin': 'p q M4 48 Q4 22 28 16 Q44 12 52 26 L62 16 L62 38 L52 36 Q50 52 32 52 L20 58 L22 48 Q10 54 4 48Z;p i M14 40 Q28 46 42 38 Q40 48 30 48 Q18 48 14 40Z;p b M26 16 L34 4 L40 18Z;c 18 28 2.4 k;l k 1.6 M6 40 L12 42;p q M22 52 L14 62 L28 56Z',
    'Seal': 'p a M4 56 Q2 34 22 26 Q26 12 36 14 Q44 16 42 28 Q54 36 58 52 L64 58 L50 62 L40 58 L18 62Z;c 38 22 1.8 k;c 42 28 2.4 k;l w 1.4 M42 30 L50 32 M42 31 L48 36;l w 1.6 M28 26 L30 30;n W M12 40 Q18 32 24 30;c 36 34 0.1 k',
    'Shell': 'p P M4 48 Q4 14 32 8 Q60 14 60 48 L50 58 L14 58Z;p p M32 8 L32 58 M32 8 L18 58 M32 8 L46 58;l O 2.2 M32 8 L32 58 M32 8 L18 58 M32 8 L46 58;l O 2.2 M32 8 L8 50 M32 8 L56 50;r 14 56 36 6 O 2;n W M12 36 Q14 22 24 14',
    'Oyster': 'p a M2 36 Q2 12 32 10 Q62 12 62 36 Q62 54 32 56 Q2 54 2 36Z;p e M8 36 Q8 20 32 18 Q56 20 56 36 Q56 48 32 50 Q8 48 8 36Z;e 32 36 14 9 h;c 32 36 6 w;n W M16 26 Q22 20 30 20;l A 1.4 M10 24 L16 20 M50 24 L44 20',
    'Pearl': 'p P M4 36 Q4 12 32 10 Q60 12 60 36 Q60 54 32 56 Q4 54 4 36Z;p p M12 40 Q12 24 32 22 Q52 24 52 40 Q52 52 32 52 Q12 52 12 40Z;c 32 38 9 w;n W M26 32 Q28 28 32 28 Q28 31 27 35Z;l a 1.8 M26 22 L26 16',
    'Crab': 'p r M10 36 Q10 20 32 20 Q54 20 54 36 Q54 52 32 52 Q10 52 10 36Z;p r M6 24 Q2 12 12 10 Q16 18 12 24Z;p r M58 24 Q62 12 52 10 Q48 18 52 24Z;p R M12 10 Q16 6 16 14Z;p R M52 10 Q48 6 48 14Z;l R 3 M12 44 L4 52 M14 50 L8 60 M52 44 L60 52 M50 50 L56 60;L R 2 M26 20 L26 12;L R 2 M38 20 L38 12;c 26 11 3.4 w;c 38 11 3.4 w;c 26 11 1.4 k;c 38 11 1.4 k;l R 2 M26 38 Q32 42 38 38',
    'Lobster': 'p r M18 26 Q18 14 32 14 Q46 14 46 26 L50 54 Q32 62 14 54Z;l R 2 M18 36 L46 36 M18 44 L46 44;p r M8 8 Q4 0 14 -2 L18 14 Q10 14 8 8Z;p r M56 8 Q60 0 50 -2 L46 14 Q54 14 56 8Z;L r 3 M20 18 L10 12;L r 3 M44 18 L54 12;p R M22 54 L14 62 L32 58 L50 62 L42 54Z;c 26 22 2 k;c 38 22 2 k;l w 1.2 M26 4 L28 12 M38 4 L36 12',
    'Starfish': 'p o M32 2 L40 22 L62 24 L46 38 L52 60 L32 48 L12 60 L18 38 L2 24 L24 22Z;c 32 30 3 y;c 22 30 1.6 Y;c 42 30 1.6 Y;c 32 14 1.6 Y;c 18 24 1.2 Y;c 46 24 1.2 Y;c 28 44 1.2 Y;c 36 44 1.2 Y;n W M28 8 L32 4 L33 14Z',
    'Jellyfish': 'p V M6 32 Q6 6 32 6 Q58 6 58 32 Q50 38 44 32 Q38 38 32 32 Q26 38 20 32 Q14 38 6 32Z;L V 3 M18 36 Q14 46 20 52 Q24 58 18 62;L V 3 M30 38 Q34 48 28 54 Q26 60 30 64;L V 3 M42 36 Q38 46 44 52 Q48 58 42 62;L V 3 M50 34 Q54 44 50 50;c 22 24 2.2 k;c 42 24 2.2 k;l k 1.4 M28 28 Q32 31 36 28;n W M14 20 Q18 10 30 10 Q20 14 18 24Z',
    'Octopus': 'p m M10 30 Q10 6 32 6 Q54 6 54 30 Q54 38 50 42 L58 56 Q60 62 54 60 L46 50 L46 60 Q42 66 38 60 L36 50 L28 50 L26 60 Q22 66 18 60 L18 50 L10 60 Q4 62 6 56 L14 42 Q10 38 10 30Z;c 24 26 5 w;c 40 26 5 w;c 25 27 2.4 k;c 41 27 2.4 k;l R 1.8 M26 38 Q32 42 38 38;n W M14 14 Q18 8 26 7 Q20 12 18 20Z',
    'Coral': 'L r 4 M32 62 L32 36 Q32 22 20 10;L r 4 M32 44 Q42 40 46 28 Q48 22 54 18;L r 4 M32 52 Q22 50 14 40 Q10 34 6 30;L r 4 M20 10 L12 6 M20 10 L26 4 M46 28 L40 22;c 20 10 3.4 O;c 12 6 2.6 O;c 26 4 2.6 O;c 54 18 3.4 O;c 6 30 3.4 O;c 40 22 2.6 O;e 32 62 18 3 n',
    'Reef': 'e 32 60 30 5 z;L r 3.6 M16 60 L16 40 Q16 30 8 22;L r 3.6 M16 48 Q26 46 28 34;c 8 22 3.6 O;c 28 34 3.6 O;L m 3.6 M44 60 L44 36 L52 26;L m 3.6 M44 48 L36 38;c 52 26 3.6 p;c 36 38 3.6 p;p o M28 20 Q36 14 44 18 L52 14 L50 24 Q42 30 28 26Z;c 33 20 1.4 k;c 24 56 3 y;c 32 54 2.4 c',
    'Bird': 'p b M8 36 Q8 14 30 14 Q46 14 50 28 L62 32 L50 36 Q50 52 32 54 Q10 54 8 36Z;p B M10 38 Q4 46 2 58 Q16 54 22 44Z;p c M24 36 Q32 28 42 36 Q36 48 24 44Z;p y M50 28 L62 32 L50 36Z;c 40 24 2.8 w;c 40.6 24.2 1.5 k;l N 2 M30 54 L30 62 M38 54 L38 62',
    'Eagle': 'p N M6 34 Q6 12 28 12 Q44 12 48 26 L58 32 L48 38 Q48 54 30 56 Q8 54 6 34Z;p w M18 12 Q30 4 42 12 Q44 22 36 24 Q24 24 18 12Z;p y M48 26 L60 32 L48 36Z;p n M10 36 Q6 48 4 58 Q18 54 24 44Z;c 38 20 2.6 y;c 38.6 20.4 1.2 k;l y 2.4 M26 56 L24 62 M36 56 L38 62;l y 1.8 M24 62 L20 62 M38 62 L42 62',
    'Owl': 'p n M12 56 Q6 36 10 16 Q14 6 24 10 L32 14 L40 10 Q50 6 54 16 Q58 36 52 56Z;p h M16 50 Q14 38 32 36 Q50 38 48 50 Q32 58 16 50Z;c 22 24 9 w;c 42 24 9 w;c 22 24 4.4 o;c 42 24 4.4 o;c 22 24 2 k;c 42 24 2 k;p y M28 30 L36 30 L32 38Z;l N 1.8 M20 44 L24 48 M28 42 L32 46 M36 42 L40 46',
    'Chicken': 'p w M6 40 Q6 18 28 18 Q42 16 44 28 L52 32 Q58 36 54 46 Q50 58 32 58 Q8 58 6 40Z;p r M38 18 Q36 8 42 8 Q44 14 46 10 Q50 10 48 18Z;p y M50 28 L60 32 L50 34Z;p r M46 34 Q52 36 48 42Z;c 44 26 2.4 k;l o 2.4 M24 58 L24 63 M34 58 L34 63;n W M12 34 Q16 26 24 24;p a M8 40 Q16 52 30 50 Q20 40 8 40Z',
    'Nest': 'e 32 44 29 14 N;p n M4 42 Q16 56 32 56 Q48 56 60 42 Q56 52 32 60 Q8 52 4 42Z;e 32 38 22 8 n;l f 2.2 M8 40 Q20 50 36 46 M14 34 Q26 44 46 34 M40 52 Q52 46 58 38;l N 1.6 M10 44 L20 50 M44 50 L54 46;n W M14 32 L22 30',
    'Egg': 'p h M32 4 Q52 4 52 36 Q52 60 32 60 Q12 60 12 36 Q12 4 32 4Z;n W M20 28 Q22 14 32 10 Q26 20 24 34Z;p u/40 M12 44 Q12 58 32 60 Q52 58 52 44 Q32 52 12 44Z',
    'Duck': 'p y M6 42 Q6 24 24 24 Q28 8 42 10 Q54 12 50 26 L62 32 L48 34 Q54 56 32 58 Q8 58 6 42Z;p o M50 24 L62 30 L50 34Z;c 42 18 2.4 k;p O M14 40 Q22 52 38 46 Q28 38 14 40Z;n W M12 34 Q16 28 22 28;l o 2.4 M24 58 L24 63 M36 58 L36 63',
    'Penguin': 'p k M12 56 Q6 34 14 16 Q20 4 32 4 Q44 4 50 16 Q58 34 52 56Z;p w M18 52 Q16 34 22 22 Q32 14 42 22 Q48 34 46 52Z;c 26 18 3.6 w;c 38 18 3.6 w;c 26 18 1.6 k;c 38 18 1.6 k;p o M28 24 L36 24 L32 30Z;p k M10 30 L4 46 L12 44Z;p k M54 30 L60 46 L52 44Z;p o M16 58 L28 58 L24 62 L14 62Z;p o M36 58 L48 58 L50 62 L40 62Z',
    'Parrot': 'p r M10 30 Q10 6 30 6 Q50 6 50 30 Q50 42 44 50 L38 62 L28 62 L26 48 Q10 44 10 30Z;p b M26 48 Q30 56 38 62 L42 52 L34 46Z;p y M6 16 Q10 10 18 14 L26 8 Q22 20 14 24 Q6 26 6 16Z;p w M20 14 Q24 8 32 10 Q38 16 30 22 Q22 22 20 14Z;c 28 15 3 k;p a M12 16 Q8 22 14 24Z;p b M44 30 Q52 26 58 38 L48 44Z;n W M16 30 Q18 22 24 20',
    'Dove': 'p w M6 40 Q6 20 26 20 Q32 8 44 8 Q52 10 50 20 L58 24 L50 28 Q54 52 30 54 Q8 54 6 40Z;p w M14 36 Q4 22 8 8 Q22 12 30 24Z;p e M16 34 Q10 24 12 14 Q22 18 26 26Z;p o M50 20 L58 24 L50 26Z;c 44 16 2.2 k;l a 1.6 M22 54 L28 62 M30 54 L34 62;L g 2.6 M52 40 Q58 46 62 40;p g M52 40 Q56 34 62 40Z',
    'Flamingo': 'p P M10 22 Q10 6 24 6 Q34 6 34 16 Q34 24 24 28 Q30 38 24 44 Q40 46 44 34 L50 20 L56 22 Q58 40 46 54 Q32 62 20 52 Q8 44 14 32 Q18 28 10 22Z;L O 2.4 M26 52 L26 63 L20 63;p k M2 10 Q8 4 14 8 L12 14 Q6 14 2 10Z;c 24 12 2 k;L O 2 M38 54 L40 63 L46 63',
    'Peacock': 'p t M32 6 L36 12 Q56 14 62 34 Q58 44 50 50 L50 56 L38 56 L36 40 Q30 40 28 34Z;p b M6 38 Q10 14 32 12 Q52 14 58 38 Q40 30 32 30 Q24 30 6 38Z;c 14 28 5 g;c 14 28 2.4 b;c 26 20 5 g;c 26 20 2.4 b;c 38 20 5 g;c 38 20 2.4 b;c 50 28 5 g;c 50 28 2.4 b;c 32 42 7 t;c 32 36 5 b;p b M32 20 L30 12 L34 12Z;c 32 12 1.8 k',
    'Seagull': 'p w M4 44 Q4 24 26 22 Q34 10 46 14 Q56 16 52 28 L62 34 L50 36 Q54 54 32 56 Q6 56 4 44Z;p a M4 40 Q14 28 30 36 Q18 44 4 44Z;p y M52 28 L64 34 L52 36Z;c 46 22 2.2 k;l o 2 M22 56 L22 62 M32 56 L32 62;n W M14 30 Q20 24 28 24',
    'Crow': 'p k M6 40 Q6 18 28 18 Q36 8 46 12 Q54 14 52 26 L62 32 L50 36 Q54 56 30 58 Q6 58 6 40Z;p A M50 26 L62 32 L50 34Z;p J M10 42 Q4 52 2 62 Q16 58 24 46Z;c 44 22 2.6 y;c 44.5 22.5 1.2 k;l k 2.4 M24 58 L24 63 M34 58 L34 63;n W M14 32 Q18 26 24 26',
    'Bat': 'p J M32 14 L38 22 L56 4 L62 28 Q54 24 50 36 Q44 30 40 40 Q36 34 32 44 Q28 34 24 40 Q20 30 14 36 Q10 24 2 28 L8 4 L26 22Z;c 32 30 9 j;p j M24 20 L22 8 L30 16Z;p j M40 20 L42 8 L34 16Z;c 28 28 2 y;c 36 28 2 y;l w 1.4 M30 35 L30 37 M34 35 L34 37',
    'Cow': 'p w M8 38 Q8 24 20 22 L50 22 Q60 22 60 36 L60 52 L52 52 L52 46 L16 46 L16 52 L8 52Z;p w M4 30 Q2 14 12 10 L24 14 Q30 22 24 38 Q14 44 6 40Z;p k M12 22 Q22 20 24 28 Q16 32 12 22Z;p k M38 24 Q50 22 52 34 Q42 36 38 24Z;c 12 22 0.1 k;p P M4 34 Q6 42 16 40 L18 32Z;c 8 36 1 k;c 14 36 1 k;l a 2.4 M10 10 L6 4 M20 12 L24 6;p k M60 34 Q64 36 62 44Z',
    'Sheep': 'c 18 28 11 w;c 30 22 12 w;c 42 24 11 w;c 48 36 10 w;c 36 40 12 w;c 20 40 11 w;p k M2 28 Q2 18 10 20 L18 34 Q8 40 2 28Z;c 8 28 2 w;c 8 28 1 k;L k 2.6 M22 50 L22 62;L k 2.6 M42 50 L42 62;p k M4 22 L0 18 L8 20Z',
    'Pig': 'p p M6 40 Q6 18 30 18 Q54 18 58 38 Q58 54 48 54 L48 62 L40 62 L40 54 L22 54 L22 62 L14 62 L14 54 Q6 52 6 40Z;p P M14 14 L22 8 L24 18Z;e 10 38 8 8 P;c 8 38 1.4 R;c 12 38 1.4 R;c 18 28 2.2 k;l P 3 M58 36 Q64 34 62 42;n W M16 28 Q22 22 30 22',
    'Horse': 'p n M10 62 L12 44 Q8 30 18 20 L16 4 L26 10 Q34 8 40 14 Q58 16 60 38 L54 62 L46 62 L46 46 L26 46 L22 62Z;p N M26 10 Q14 12 8 28 Q18 22 24 28 Q22 18 30 14Z;p N M54 40 Q64 44 62 62 Q56 56 52 50Z;c 18 22 1.8 k;c 12 36 1.4 N;n W M30 18 Q40 18 50 26',
    'Dog': 'p u M8 40 Q6 18 28 18 Q40 18 46 24 L58 22 L56 36 L48 40 L48 62 L36 62 L36 50 L22 50 L22 62 L10 62Z;p n M14 14 Q6 14 6 28 L10 36Z;p n M30 16 Q38 8 44 18Z;c 46 28 2 k;c 56 28 2.4 k;l k 1.6 M48 34 Q52 38 56 34;p r M42 40 L50 40 L50 46 Q46 52 42 46Z;l u 3 M8 44 Q-2 48 2 58;n W M16 26 Q22 22 30 22',
    'Cat': 'p o M10 62 L10 44 Q8 30 18 24 L12 4 L26 14 L38 14 L52 4 L48 26 Q56 36 54 62Z;p P M16 12 L22 18 L18 22Z;p P M48 12 L42 18 L46 22Z;c 24 32 3.6 w;c 40 32 3.6 w;c 24 33 1.8 k;c 40 33 1.8 k;p p M30 38 L34 38 L32 42Z;l k 1.4 M32 42 Q28 46 24 44 M32 42 Q36 46 40 44;l w 1.4 M12 40 L2 38 M12 44 L2 46 M52 40 L62 38 M52 44 L62 46;l y 2 M24 24 L28 20 M40 24 L36 20',
    'Mouse': 'p a M6 50 Q6 24 28 24 Q46 22 52 38 L60 40 L52 46 Q50 58 30 58 Q8 58 6 50Z;c 40 20 10 a;c 40 20 6 P;c 18 18 10 a;c 18 18 6 P;c 46 34 2 k;c 56 41 2 p;l P 1.8 M60 40 L64 36 M58 44 L64 46;L P 2 M6 52 Q-2 56 4 62;n W M12 40 Q18 32 28 32',
    'Rabbit': 'p w M10 62 L10 46 Q6 36 18 32 L14 4 Q16 -2 22 2 L28 28 L36 28 L42 2 Q48 -2 50 4 L46 32 Q58 38 54 62Z;p P M18 6 L22 24 L20 28 L16 8Z;p P M44 6 L40 24 L42 28 L46 8Z;c 26 42 2.4 k;c 40 42 2.4 k;p p M30 48 L36 48 L33 52Z;l k 1.4 M33 52 L33 56 M33 54 Q28 58 26 56 M33 54 Q38 58 40 56',
    'Bear': 'c 14 14 9 n;c 50 14 9 n;c 14 14 4.4 f;c 50 14 4.4 f;c 32 36 25 n;e 32 44 12 10 f;c 22 30 2.6 k;c 42 30 2.6 k;p k M28 40 L36 40 L32 46Z;l k 1.6 M32 46 L32 50 M32 50 Q27 54 24 50 M32 50 Q37 54 40 50;n W M14 28 Q18 18 28 14',
    'Wolf': 'p a M8 62 L6 30 Q4 14 12 2 L24 16 L32 14 L40 16 L52 2 Q60 14 58 30 L56 62Z;p e M20 62 L18 42 Q32 34 46 42 L44 62Z;p A M13 8 L21 17 L14 22Z;p A M51 8 L43 17 L50 22Z;c 24 28 2.4 y;c 40 28 2.4 y;c 24 28 1 k;c 40 28 1 k;p k M28 42 L36 42 L32 48Z;l k 1.6 M32 48 L32 52 M32 52 Q28 56 24 54 M32 52 Q36 56 40 54',
    'Fox': 'p o M6 62 L8 28 Q4 14 10 2 L24 16 L32 14 L40 16 L54 2 Q60 14 56 28 L58 62Z;p w M18 62 L16 40 Q32 30 48 40 L46 62Z;p k M10 4 L20 16 L12 22Z;p k M54 4 L44 16 L52 22Z;c 24 28 2.2 k;c 40 28 2.2 k;p k M28 42 L36 42 L32 48Z;l k 1.5 M32 48 L32 52 M32 52 Q28 56 24 54 M32 52 Q36 56 40 54;l R 1.6 M12 36 L18 38 M52 36 L46 38',
    'Lion': 'c 32 34 28 N;c 32 34 22 o;c 12 12 7 N;c 52 12 7 N;c 32 36 16 y;e 32 46 9 7 Y;c 25 30 2.6 k;c 39 30 2.6 k;p k M29 40 L35 40 L32 44Z;l k 1.5 M32 44 L32 48 M32 48 Q27 52 24 48 M32 48 Q37 52 40 48;l N 1.6 M8 34 L14 36 M56 34 L50 36 M12 50 L18 46 M52 50 L46 46',
    'Tiger': 'p o M6 56 L6 26 Q4 12 12 4 L24 14 L32 12 L40 14 L52 4 Q60 12 58 26 L58 56 Q32 66 6 56Z;p w M16 56 Q16 40 32 38 Q48 40 48 56 Q32 62 16 56Z;l k 3 M14 22 L22 26 M12 32 L20 34 M50 22 L42 26 M52 32 L44 34 M32 14 L32 22 M26 16 L28 22 M38 16 L36 22;c 24 32 2.4 k;c 40 32 2.4 k;p k M28 42 L36 42 L32 47Z;l k 1.5 M32 47 L32 52 M32 52 Q27 56 24 52 M32 52 Q37 56 40 52;c 10 10 4 o;c 54 10 4 o;c 10 10 2 w;c 54 10 2 w',
    'Elephant': 'p a M4 30 Q4 8 28 8 Q50 8 54 24 Q58 32 56 46 L52 62 L40 62 L40 46 L24 46 L22 62 L12 62 Q10 46 4 38Z;p A M10 14 Q-2 18 2 38 Q8 40 14 30Z;p w M40 36 L48 52 Q50 56 46 54 Q40 46 36 40Z;p a M30 22 Q22 22 20 30 Q18 46 22 52 Q28 56 30 50Q26 40 30 30Z;c 34 20 2 k;n W M14 18 Q20 12 28 12',
    'Giraffe': 'p y M22 62 L22 40 L32 40 L32 62Z;p y M36 62 L36 40 L46 40 L46 62Z;p y M16 46 Q14 34 28 34 L50 34 Q58 40 54 52 L18 52Z;p y M20 36 L26 10 L36 10 L32 36Z;p y M22 12 Q18 2 28 2 L44 4 Q52 8 46 16 L36 14Z;p n M26 2 L26 -2 M38 2 L38 -2;c 36 8 2 k;c 22 22 4 o;c 28 30 3.4 o;c 40 44 4 o;c 50 46 3.4 o;c 28 44 3.4 o;l o 2 M40 -4 L40 2;c 25 0 2 o;c 41 0 2 o',
    'Monkey': 'c 8 28 8 n;c 56 28 8 n;c 8 28 4 s;c 56 28 4 s;c 32 28 22 n;p s M14 28 Q14 18 24 18 Q32 22 40 18 Q50 18 50 28 Q50 46 32 48 Q14 46 14 28Z;c 24 28 2.6 k;c 40 28 2.6 k;e 32 40 8 5 S;c 29 38 1 k;c 35 38 1 k;l k 1.6 M27 43 Q32 46 37 43;L n 4 M52 60 Q62 56 62 44;p n M16 56 Q16 48 32 48 Q48 48 48 56 L48 62 L16 62Z',
    'Gorilla': 'p A M6 62 L6 32 Q6 16 20 12 Q32 8 44 12 Q58 16 58 32 L58 62Z;p k M14 22 Q14 10 32 10 Q50 10 50 22 L50 28 Q32 22 14 28Z;p a M16 30 Q16 24 32 24 Q48 24 48 30 L48 46 Q32 54 16 46Z;c 24 32 2.4 k;c 40 32 2.4 k;e 32 42 8 5 A;c 29 40 1.2 k;c 35 40 1.2 k;l k 1.6 M28 47 Q32 50 36 47;p k M2 40 Q0 62 8 62 L10 40Z;p k M62 40 Q64 62 56 62 L54 40Z',
    'Zebra': 'p w M8 38 Q8 22 22 22 L36 22 L40 8 L44 22 L54 24 Q60 30 56 38 L56 62 L48 62 L48 46 L20 46 L20 62 L10 62Z;l k 3.4 M22 24 L22 44 M30 22 L30 46 M38 22 L38 46 M46 24 L46 44 M52 28 L52 40;p k M36 8 Q30 4 34 0 Q40 2 44 8Z;p k M8 38 Q0 40 0 58 Q6 52 10 46Z;c 48 28 1.6 k;p k M54 24 Q60 28 58 40 L52 38Z',
    'Deer': 'p n M16 62 L16 42 Q12 28 24 22 L30 10 L38 10 L36 24 L52 24 Q60 30 56 44 L56 62 L48 62 L46 46 L26 46 L24 62Z;p N M38 8 L32 -2 M38 8 L46 -2 M40 4 L52 4 M34 4 L26 6;L N 2.4 M38 8 L34 -2 L30 -4;L N 2.4 M38 8 L46 -2 L50 -4;L N 2.2 M36 4 L28 4;L N 2.2 M40 4 L48 6;c 36 18 1.8 k;p k M32 22 L38 22 L35 26Z;c 28 28 2 w;c 36 34 2 w;c 44 30 2 w;c 36 28 2 w',
    'Camel': 'p u M6 62 L8 34 Q4 26 12 22 L10 8 L22 12 Q26 16 24 24 L28 28 Q34 8 42 22 Q52 14 56 34 L56 62 L48 62 L48 46 L18 46 L16 62Z;p f M28 28 Q34 10 42 24 Q36 28 28 28Z;c 20 20 1.8 k;c 16 34 0.1 k;p N M4 62 L4 58 L10 58 L10 62Z;n W M20 36 Q30 32 42 36',
    'Kangaroo': 'p n M4 62 L10 40 Q8 24 20 20 L18 4 L30 10 L34 22 Q50 20 56 38 L62 46 L50 62 L36 62 L36 56 L26 52 Q22 58 24 62Z;p u M14 2 L18 10 L12 14Z;p u M30 8 L34 4 L36 14Z;c 24 14 1.8 k;p k M18 24 L24 24 L21 28Z;p u M32 34 Q42 36 40 50 Q32 48 32 34Z;p f M50 38 Q62 30 64 42 Q60 52 52 54Z',
    'Koala': 'c 8 20 11 a;c 56 20 11 a;c 8 20 6 P;c 56 20 6 P;c 32 34 24 a;e 32 46 18 14 e;c 24 32 2.4 k;c 40 32 2.4 k;e 32 40 6 8 k;n W M32 36 L33 36;l a 2 M20 58 L12 62 M44 58 L52 62',
    'Panda': 'c 10 14 9 k;c 54 14 9 k;c 32 34 24 w;e 20 32 7 9 k;e 44 32 7 9 k;c 20 32 2.4 w;c 44 32 2.4 w;c 20 32 1 k;c 44 32 1 k;e 32 42 5 3.4 k;l k 1.6 M32 46 L32 50 M32 50 Q27 54 24 50 M32 50 Q37 54 40 50;n W M14 20 Q18 12 26 10',
    'Polar Bear': 'c 12 14 9 w;c 52 14 9 w;c 12 14 4.4 P;c 52 14 4.4 P;c 32 36 24 w;e 32 46 12 9 Y;c 24 30 2.2 k;c 40 30 2.2 k;p k M28 40 L36 40 L32 46Z;l k 1.6 M32 46 L32 50 M32 50 Q27 54 24 50 M32 50 Q37 54 40 50;p i/70 M6 46 Q2 56 8 62 Q16 54 12 44Z;n W M16 22 Q20 16 28 14',
    'Squirrel': 'p n M22 62 Q8 56 10 38 Q6 22 18 12 Q22 24 30 18 Q22 6 34 4 Q44 6 40 20 L50 26 Q60 34 52 50 Q44 62 32 62Z;p f M2 30 Q2 6 16 6 Q10 18 14 34 L12 48 Q0 44 2 30Z;c 32 24 2 k;c 38 34 1.8 k;e 30 30 3 2 P;p N M26 6 L24 -2 L32 4Z',
    'Hedgehog': 'p N M4 50 Q2 24 24 12 Q44 4 56 22 Q62 36 56 52 Z;p n M6 50 L2 44 M10 36 L4 30 M16 24 L12 16 M26 16 L24 8 M38 12 L40 4 M48 18 L54 10 M54 28 L62 24;l N 2 M8 40 L16 36 M14 30 L22 28 M24 22 L30 24 M38 22 L44 24 M46 30 L52 32;p s M44 36 Q60 36 62 50 L56 56 L36 56 Q38 40 44 36Z;c 52 42 2 k;c 61 49 2.4 k;L s 3 M42 56 L42 62;L s 3 M30 56 L30 62;n W M12 38 Q16 30 24 26',
    'Snail': 'p y M2 58 Q4 44 12 42 L12 36 Q10 28 16 28 L18 42 L58 52 Q64 58 58 60 L8 62Z;L y 2 M14 36 L12 26;L y 2 M18 36 L22 28;c 12 25 2.4 k;c 22 27 2.4 k;c 38 32 20 n;c 38 32 14 f;c 38 32 8 n;c 38 32 3 f;n W M26 20 Q32 12 40 12',
    'Worm': 'L p 9 M8 54 Q8 38 24 44 Q34 48 38 36 Q42 24 54 28;c 56 28 7 p;c 56 25 2 k;c 60 28 1.4 k;l P 2 M12 54 L12 48 M24 44 L24 38 M36 42 L38 34;l R 1.6 M54 34 Q58 36 60 32;n W M10 50 Q10 42 20 44',
    'Insect': 'c 32 36 13 g;c 32 16 8 g;L G 2.6 M24 8 L18 -2;L G 2.6 M40 8 L46 -2;c 29 14 2 w;c 35 14 2 w;L G 2.4 M20 34 L6 26 L2 36;L G 2.4 M20 40 L4 44 L6 56;L G 2.4 M44 34 L58 26 L62 36;L G 2.4 M44 40 L60 44 L58 56;l G 2 M32 24 L32 49;n W M26 28 Q28 24 32 24',
    'Bee': 'p V/70 M16 22 Q4 6 20 4 Q32 6 30 24Z;p V/70 M48 22 Q60 6 44 4 Q32 6 34 24Z;e 32 38 18 15 y;l k 4 M24 26 L22 52 M34 24 L34 54 M44 28 L46 50;e 32 38 18 15 y/0;p k M50 36 L58 38 L50 42Z;c 24 34 2.4 k;c 24 34 0.8 w;L k 2 M18 24 L14 16;L k 2 M28 24 L26 16;c 14 14 2 k;c 26 14 2 k;n W M20 32 Q26 26 36 28',
    'Caterpillar': 'c 12 40 8 g;c 24 38 8.6 l;c 36 40 8.6 g;c 48 38 8.6 l;c 56 30 9 g;c 54 29 2.4 w;c 54.4 29.4 1.2 k;c 59 29 2.4 w;L G 2 M52 22 L48 14 M58 22 L62 14;l G 2.4 M12 48 L12 56 M24 46 L24 56 M36 48 L36 56 M48 46 L48 56;l r 2 M54 36 Q57 38 60 36',
    'Butterfly': 'p m M32 30 Q6 2 4 18 Q2 34 30 36Z;p o M32 34 Q8 40 14 56 Q26 58 32 40Z;p m M32 30 Q58 2 60 18 Q62 34 34 36Z;p o M32 34 Q56 40 50 56 Q38 58 32 40Z;c 16 18 5 P;c 48 18 5 P;c 20 48 4 y;c 44 48 4 y;e 32 34 3 14 k;L k 1.8 M30 20 L24 8;L k 1.8 M34 20 L40 8;c 24 7 1.6 k;c 40 7 1.6 k',
    'Ant': 'c 12 38 9 N;c 28 38 8 n;c 46 38 11 N;L N 2 M18 28 L10 16 L2 18;L N 2 M26 30 L24 18;L N 2 M34 30 L38 18;L N 2 M30 44 L28 58;L N 2 M38 46 L40 60;L N 2 M20 44 L14 58;L N 2 M50 30 L58 24 L60 16;c 6 34 1.8 w;c 5.6 34.4 0.8 k;L N 2 M4 32 L0 26',
    'Spider': 'L k 2.4 M26 30 L8 12 L2 20;L k 2.4 M26 34 L4 32 L2 42;L k 2.4 M26 38 L6 50 L10 60;L k 2.4 M30 42 L20 56 L24 64;L k 2.4 M38 30 L56 12 L62 20;L k 2.4 M38 34 L60 32 L62 42;L k 2.4 M38 38 L58 50 L54 60;L k 2.4 M34 42 L44 56 L40 64;c 32 40 12 k;c 32 24 8 A;c 29 22 2 r;c 35 22 2 r;c 32 38 3.4 r;n W M26 36 Q26 30 32 30',
    'Web': 'l a 2 M32 4 L32 60 M6 18 L58 46 M6 46 L58 18;L w 1.8 M32 14 L48 24 L48 40 L32 50 L16 40 L16 24Z;L w 1.8 M32 22 L40 28 L40 36 L32 42 L24 36 L24 28Z;L w 1.8 M32 6 L56 20 L56 44 L32 58 L8 44 L8 20Z;c 50 52 4.4 k;L k 1.6 M50 52 L44 40;c 50 54 1.6 r;l a 1.6 M46 36 L44 40',
    'Ladybug': 'p k M20 18 Q20 6 32 6 Q44 6 44 18Z;c 28 12 2 w;c 36 12 2 w;c 32 38 26 r;l k 2.4 M32 12 L32 62;c 20 30 4.6 k;c 44 30 4.6 k;c 18 46 4 k;c 46 46 4 k;c 26 52 3 k;c 38 52 3 k;n W M14 28 Q18 16 28 12 Q20 20 20 30Z',
    'Mosquito': 'p V/70 M26 26 Q10 4 4 14 Q10 26 28 32Z;p V/70 M34 26 Q50 4 60 14 Q52 26 34 32Z;e 32 38 10 14 A;l w 2 M22 38 L42 38 M24 44 L40 44;c 32 20 7 A;L k 2 M32 14 L32 4;c 29 18 2 r;c 35 18 2 r;L k 1.6 M26 52 L18 62 M30 52 L28 62 M34 52 L36 62 M38 52 L46 62;L k 1.6 M28 30 L16 24 M36 30 L48 24;L k 1.6 M32 26 L32 14;p r M30 52 L34 52 L32 58Z',
    'Fly': 'p V/70 M24 28 Q8 8 6 22 Q10 34 28 34Z;p V/70 M40 28 Q56 8 58 22 Q54 34 36 34Z;e 32 42 11 15 A;c 32 22 11 k;c 26 20 5 r;c 38 20 5 r;c 26 20 2 R;c 38 20 2 R;l k 1.6 M24 44 L8 54 M26 50 L16 62 M40 44 L56 54 M38 50 L48 62;n W M26 36 L28 36 L26 50 L24 50Z;p k M30 28 L34 28 L32 34Z',
    'Dragonfly': 'p c/70 M32 22 Q10 6 4 18 Q10 28 30 28Z;p c/70 M32 24 Q8 24 6 36 Q14 40 30 30Z;p c/70 M32 22 Q54 6 60 18 Q54 28 34 28Z;p c/70 M32 24 Q56 24 58 36 Q50 40 34 30Z;L t 4 M32 28 L32 58;l b 2.4 M32 34 L32 36 M32 42 L32 44 M32 50 L32 52;c 32 20 6 t;c 29 18 2.2 r;c 35 18 2.2 r;c 29 17 0.8 w;L t 1.6 M30 44 L30 44',
    'Firefly': 'c 32 46 18 y/30;e 32 44 11 13 k;p y M24 44 Q32 62 40 44 Q32 52 24 44Z;e 32 52 8 8 y;c 32 24 8 k;c 29 22 2 w;c 35 22 2 w;L k 2 M28 18 L24 8;L k 2 M36 18 L40 8;p V/70 M22 36 Q8 24 6 36 Q14 44 24 42Z;p V/70 M42 36 Q56 24 58 36 Q50 44 40 42Z;n W M28 54 Q32 50 36 54',
    'Scorpion': 'p N M14 54 Q10 44 18 36 L46 36 Q54 44 50 54 Q32 60 14 54Z;p R M16 36 Q4 36 4 20 Q8 14 14 18 Q10 26 18 30Z;p R M48 36 Q60 36 60 20 Q56 14 50 18 Q54 26 46 30Z;L n 4 M32 54 Q32 62 48 60 Q62 54 56 40 Q56 28 48 18;p r M48 18 L58 10 L54 24Z;c 26 42 2.2 y;c 38 42 2.2 y;l N 2 M16 52 L8 60 M24 56 L20 64 M44 56 L48 64 M50 52 L58 60;c 4 18 5 R;c 60 18 5 R',
    'Reptile': 'p G M4 36 Q8 20 28 22 L52 22 Q60 24 62 34 Q60 44 50 44 L10 48 Q2 50 4 36Z;p g M10 38 L54 38 L58 44 L12 46Z;p G M16 20 L20 12 L24 22 M28 20 L32 10 L36 22 M40 20 L44 12 L48 22;c 52 28 2.6 y;c 52 28 1 k;l k 1.4 M56 36 L62 38;l G 2.4 M16 46 L12 58 M40 46 L44 58;L G 3 M6 40 Q-2 48 2 58',
    'Lizard': 'p g M4 34 Q4 24 12 24 L14 12 L22 24 L46 24 Q58 24 60 32 L60 38 Q54 40 46 40 L22 40 L20 48 L26 56 L18 58 L14 44 Q6 44 4 34Z;p G M12 12 L14 24 L8 22Z;L G 4 M46 28 Q60 28 62 40 Q62 52 52 54;c 10 28 2.2 y;c 10 28 0.9 k;l l 2 M20 28 L44 28 M20 34 L44 34;p g M42 40 L50 52 L58 56 L48 42Z;l G 1.6 M8 34 L12 36;n W M18 26 L28 26',
    'Snake': 'p g M4 54 Q2 40 20 40 L42 40 Q52 38 46 28 Q40 18 28 18 Q14 18 18 8 Q22 2 36 4 Q48 4 56 14 Q64 28 54 40 Q48 48 40 50 L18 52 Q6 58 4 54Z;l l 2.4 M10 48 L10 52 M20 44 L20 48 M30 44 L30 48 M42 40 L44 44 M52 30 L54 34 M42 14 L40 10;c 22 11 1.4 k;l r 1.8 M6 20 L-2 22 M6 20 L-2 18',
    'Turtle': 'p t M6 46 Q10 18 32 16 Q54 18 58 46Z;p g M12 44 Q14 24 32 22 Q50 24 52 44Z;l G 2 M32 22 L32 44 M20 28 L22 44 M44 28 L42 44 M14 36 L50 36;p t M54 28 Q60 22 64 28 Q64 36 56 38Z;c 60 28 1.8 k;L t 5 M12 50 L8 60;L t 5 M24 52 L22 62;L t 5 M40 52 L42 62;L t 5 M52 50 L56 60;p t M4 46 L0 50 L8 48Z;n W M14 30 Q18 26 24 26',
    'Crocodile': 'p g M2 38 Q2 28 12 28 L50 28 L62 32 L62 44 L50 42 L12 46 Q2 48 2 38Z;p G M14 28 L16 22 L20 28 M26 28 L28 22 L32 28 M38 28 L40 22 L44 28;p w M50 42 L52 36 L54 42 M56 42 L58 38 L60 43;p g M2 42 Q-4 46 0 54 Q8 52 10 46Z;c 20 24 5 g;c 20 24 2.4 y;c 20 24 1 k;p G M16 46 L12 58 L22 56 L24 46Z;p G M38 44 L42 56 L50 54 L48 44Z;l G 1.6 M30 32 L30 40 M38 32 L38 40;l k 1.6 M52 34 L58 34',
    'Frog': 'p g M4 52 Q4 30 20 28 L44 28 Q60 30 60 52 Q60 62 40 62 L24 62 Q4 62 4 52Z;c 18 24 9 g;c 46 24 9 g;c 18 24 5 w;c 46 24 5 w;c 18 24 2.4 k;c 46 24 2.4 k;l G 2 M18 44 Q32 54 46 44;p l M16 56 L6 62 L22 62Z;p l M48 56 L58 62 L42 62Z;c 14 38 2.4 l;c 50 38 2.4 l;n W M10 34 Q14 30 22 30',
    'Chameleon': 'p g M2 34 Q4 16 22 14 L46 14 Q58 16 56 32 Q60 44 50 48 L30 52 L26 60 L20 52 Q8 50 2 34Z;L g 4 M54 20 Q64 22 62 34 Q60 42 50 40;c 14 24 8 g;c 14 24 5 y;c 14 24 2 k;c 38 30 6 y;c 28 22 3.4 o;c 46 24 3.4 c;c 22 40 3.4 m;l G 2 M10 38 L24 44;L G 2.6 M30 50 L30 60 L36 62;L G 2.6 M44 46 L48 58;l G 1.6 M36 16 L36 12 M44 16 L44 12'
  });
  Object.assign(LA_ICONS, {
    'Honey': 'p d M14 14 L50 14 Q58 22 56 40 Q54 58 32 60 Q10 58 8 40 Q6 22 14 14Z;p y M12 36 Q16 28 22 34 Q28 42 32 34 Q38 26 44 34 Q50 40 52 34 L54 40 Q52 56 32 58 Q12 56 10 40Z;r 12 8 40 8 n 3;L y 3 M32 8 Q32 2 40 2;p y M38 -2 Q46 -2 46 6 Q38 8 38 -2Z;n W M14 22 L18 22 L16 44 L12 44Z',
    'Milk': 'p w M16 20 L48 20 L48 58 Q48 62 44 62 L20 62 Q16 62 16 58Z;p b M16 36 L48 36 L48 58 Q48 62 44 62 L20 62 Q16 62 16 58Z;p w M16 20 L32 6 L48 20Z;c 32 48 6 w;c 32 48 3 b;n W M20 24 L24 24 L24 58 L20 58Z',
    'Cheese': 'p y M2 36 L34 10 L62 22 L62 50 L2 50Z;c 40 42 5 D;c 20 42 4 D;c 50 28 3.6 D;c 30 26 3 D;c 52 44 2.4 D;p d M34 10 L62 22 L62 28 L34 16Z;n W M8 38 L30 16 L32 18 L10 40Z',
    'Butter': 'p y M6 30 L22 16 L58 16 L58 44 L42 58 L6 58Z;p Y M6 30 L42 30 L42 58 L6 58Z;p d M42 30 L58 16 L58 44 L42 58Z;p Y M6 30 L22 16 L58 16 L42 30Z;n W M10 34 L14 34 L14 54 L10 54Z',
    'Ice Cream': 'p u M16 30 L48 30 L32 62Z;l f 1.6 M20 34 L38 52 M44 34 L26 52 M28 32 L36 32;c 22 26 11 P;c 42 26 11 u;c 32 16 13 w;c 32 3 3.4 r;n W M24 12 Q28 8 34 8',
    'Sugarcane': 'L g 5 M12 62 L30 6;L G 5 M30 62 L44 8;L g 5 M46 62 L56 14;l G 2 M17 44 L24 44 M22 28 L28 28 M33 48 L40 48 M38 30 L44 30;p g M30 6 Q20 0 14 10 Q24 12 30 6Z;p g M30 6 Q40 -2 48 6 Q38 12 30 6Z',
    'Sugar': 'r 8 14 48 46 w 3;r 12 30 40 22 q 2;p w M8 14 L32 4 L56 14Z;c 24 40 2 w;c 32 44 2 w;c 40 38 2 w;c 20 46 2 w;c 44 46 2 w;l r 2.4 M16 24 L48 24;n W M12 18 L16 18 L16 56 L12 56Z',
    'Cocoa': 'p N M8 32 Q8 8 32 8 Q56 8 56 32 Q56 56 32 58 Q8 56 8 32Z;p n M14 32 Q14 14 32 14 Q50 14 50 32 Q50 50 32 52 Q14 50 14 32Z;l N 2 M32 8 L32 58 M20 10 Q16 32 22 56 M44 10 Q48 32 42 56;l n 1.6 M14 32 L50 32;n W M16 20 Q20 14 28 12',
    'Chocolate': 'r 8 8 48 48 N 4;r 12 12 18 18 n 2;r 34 12 18 18 n 2;r 12 34 18 18 n 2;r 34 34 18 18 n 2;n W M14 14 L20 14 L14 22Z;n W M36 14 L42 14 L36 22Z;l w 3 M52 6 L58 12',
    'Cake': 'r 8 30 48 28 P 4;r 8 30 48 10 m 3;p w M8 34 Q14 46 20 34 Q26 46 32 34 Q38 46 44 34 Q50 46 56 34 L56 30 L8 30Z;r 29 14 6 16 b 2;p y M32 4 Q28 10 32 14 Q36 10 32 4Z;c 14 52 2 r;c 26 52 2 r;c 38 52 2 r;c 50 52 2 r;n W M12 34 L16 34 L16 54 L12 54Z',
    'Cookie': 'c 32 32 26 f;c 32 32 26 u/0;c 22 24 5 N;c 40 22 4 N;c 30 40 5 N;c 46 40 4 N;c 16 40 3.4 N;c 36 32 3 N;n W M12 24 Q16 14 26 10 Q18 18 16 28Z',
    'Candy': 'p r M2 24 L20 30 L20 38 L2 44 Q-2 34 2 24Z;p r M62 24 L44 30 L44 38 L62 44 Q66 34 62 24Z;c 32 34 15 p;l w 3 M24 24 L38 44 M32 20 L44 36;n W M22 26 Q26 20 32 20 Q26 26 24 32Z',
    'Jam': 'p r M12 20 L52 20 L56 56 Q56 62 50 62 L14 62 Q8 62 8 56Z;r 14 28 36 24 w 3;r 10 12 44 10 r 3;r 14 6 36 8 n 2;c 28 40 2.4 R;n W M16 22 L20 22 L18 58 L14 58Z;l w 2 M24 48 Q32 54 40 48',
    'Juice': 'p o M14 8 L50 8 L44 60 Q44 62 40 62 L24 62 Q20 62 20 60Z;p y M16 24 L48 24 L44 60 Q44 62 40 62 L24 62 Q20 62 20 60Z;L g 3 M42 8 L50 0;c 24 8 0.1 k;c 44 38 8 o;c 44 38 5 y;l o 1.4 M44 32 L44 44 M38 38 L50 38;n W M20 26 L24 26 L26 56 L22 56Z',
    'Wheat': 'L y 3 M32 62 L32 18;p d M32 2 Q26 8 28 16 Q32 20 36 16 Q38 8 32 2Z;p d M32 18 Q18 12 16 22 Q26 30 32 24Z;p d M32 18 Q46 12 48 22 Q38 30 32 24Z;p d M32 30 Q18 24 16 34 Q26 42 32 36Z;p d M32 30 Q46 24 48 34 Q38 42 32 36Z;p d M32 42 Q20 38 18 48 Q26 54 32 48Z;p d M32 42 Q44 38 46 48 Q38 54 32 48Z;l D 1.4 M32 2 L32 22',
    'Flour': 'p h M14 14 L50 14 L54 58 Q54 62 50 62 L14 62 Q10 62 10 58Z;p w M14 14 L50 14 L52 22 L12 22Z;r 18 30 28 22 w 3;L y 2 M32 32 L32 48;p d M26 36 Q26 32 32 34 Q38 32 38 36Q38 44 32 48 Q26 44 26 36Z;l u 2 M20 22 Q32 28 44 22;n W M14 26 L18 26 L16 58 L12 58Z',
    'Dough': 'p h M4 40 Q2 20 22 16 Q34 6 46 18 Q64 22 60 42 Q58 58 32 58 Q6 58 4 40Z;p u/50 M6 46 Q10 56 32 56 Q54 56 58 46Q50 52 32 52 Q14 52 6 46Z;l u 2 M20 34 Q24 30 28 34 M38 32 Q42 28 46 32;n W M10 34 Q14 24 24 20 Q16 28 16 38Z;l w 2.4 M8 14 L16 8',
    'Bread': 'p u M6 38 Q2 18 18 14 Q32 6 46 14 Q62 18 58 38 L56 58 L8 58Z;p f/60 M8 58 L8 40 Q8 34 14 34 L50 34 Q56 34 56 40 L56 58Z;p w M16 24 L26 30 M30 20 L40 28 M42 26 L50 32;l n 2.2 M18 22 L24 30 M32 18 L38 28 M44 24 L50 32;n W M10 24 Q14 18 22 16',
    'Sandwich': 'p u M4 28 Q6 12 32 12 Q58 12 60 28Z;r 4 28 56 6 g 3;r 6 34 54 6 r 3;r 4 40 56 6 y 3;p u M4 46 L60 46 L58 56 Q32 62 6 56Z;c 22 20 1.4 w;c 32 18 1.4 w;c 42 20 1.4 w;n W M10 22 Q16 14 26 14',
    'Pizza': 'p d M32 62 L4 14 Q32 -2 60 14Z;p y M32 56 L9 17 Q32 6 55 17Z;p u M4 14 Q32 -2 60 14 L58 18 Q32 6 6 18Z;c 24 24 4.6 r;c 40 24 4.6 r;c 32 38 4.6 r;c 32 18 2 g;c 20 18 1.6 g;c 44 18 1.6 g;l w 1.6 M26 30 L30 30 M34 30 L38 30',
    'Burger': 'p u M6 28 Q6 6 32 6 Q58 6 58 28Z;r 6 28 52 7 g 3;r 6 34 52 10 N 4;p y M6 42 L58 42 L56 46 L8 46Z;r 6 46 52 5 r 2;p u M8 52 L56 52 Q56 62 32 62 Q8 62 8 52Z;c 20 14 1.2 w;c 32 12 1.2 w;c 44 14 1.2 w;n W M12 18 Q18 10 28 8',
    'Pancake': 'e 32 46 26 10 f;e 32 38 26 10 u;e 32 30 26 10 f;e 32 22 26 10 u;e 32 14 22 8 d;p y M20 14 Q20 24 24 26 Q26 20 32 20 Q38 20 40 28 Q44 22 44 14Z;e 32 12 8 4 y;n W M12 24 Q16 20 24 20',
    'Pasta': 'e 32 44 28 14 w;e 32 40 26 12 Y;l d 3 M12 38 Q20 28 28 38 Q36 48 44 36 Q50 30 54 38;l d 3 M14 44 Q24 34 32 44 Q40 52 52 44;l d 3 M16 34 Q24 26 32 32 Q40 38 50 30;c 22 36 5 r;c 40 40 4 r;c 32 30 3.6 g',
    'Meat': 'p O M8 24 Q4 8 22 6 Q44 4 56 18 Q64 34 54 48 Q44 58 26 56 Q10 54 10 40Z;p r M14 24 Q12 14 24 12 Q42 12 50 22 Q56 34 48 44 Q40 50 26 48 Q16 46 16 36Z;l w 2.4 M24 22 Q34 22 40 30 M26 34 Q34 36 40 42;p x M2 40 Q-2 36 4 32 L10 38Z;c 8 36 4 x;n W M20 18 Q26 14 34 14',
    'Steak': 'p R M6 34 Q2 14 24 8 Q46 4 58 22 Q62 40 46 54 Q30 62 14 52 Q8 44 6 34Z;p r M12 34 Q10 18 26 14 Q44 12 52 24 Q54 38 42 48 Q30 54 18 48 Q12 42 12 34Z;p w M22 20 Q30 18 36 24 Q30 26 22 20Z;l R 2.4 M16 36 L40 42 M20 26 L44 32;c 34 36 5 x;n W M14 28 Q18 20 26 16',
    'Sausage': 'p O M4 40 Q2 20 20 18 L48 28 Q62 34 60 46 Q56 60 40 56 L14 54 Q6 52 4 40Z;l R 2.4 M10 30 L14 52 M24 24 L28 56 M38 28 L42 58;l y 2 M10 42 L52 50;n W M8 34 Q12 26 22 24;c 54 42 3.6 R',
    'Bacon': 'p r M2 20 Q16 8 30 18 Q44 28 62 14 L62 30 Q44 44 30 34 Q16 24 2 36Z;p p M6 22 Q16 14 30 22 Q44 30 58 20 L58 26 Q44 36 30 28 Q16 20 6 30Z;p w M10 24 Q18 20 26 26 L24 28 Q16 24 10 28Z;p r M2 44 Q16 32 30 42 Q44 52 62 38 L62 54 Q44 68 30 58 Q16 48 2 60Z;p p M6 48 Q16 40 30 48 Q44 56 58 46 L58 50 Q44 60 30 52 Q16 44 6 54Z;n W M6 22 Q12 18 18 20',
    'Vegetable': 'p g M32 30 Q16 20 16 4 Q32 6 32 24Z;p G M32 30 Q48 20 48 4 Q32 6 32 24Z;p g M32 30 Q30 12 32 2 Q34 12 32 30Z;c 32 44 18 l;c 32 44 18 g/0;p l M32 26 Q20 30 16 44 Q22 58 32 62 Q44 58 48 44 Q44 30 32 26Z;l g 1.8 M32 28 L32 62 M32 38 L22 32 M32 38 L42 32 M32 50 L20 46 M32 50 L44 46',
    'Potato': 'p n M6 36 Q4 16 24 12 Q48 6 58 22 Q62 40 46 52 Q28 60 14 52 Q8 46 6 36Z;p f M10 36 Q10 20 26 16 Q46 12 54 24 Q56 38 44 48 Q28 54 16 48 Q10 44 10 36Z;c 22 30 1.6 N;c 38 24 1.6 N;c 44 40 1.6 N;c 28 42 1.6 N;n W M14 28 Q18 20 28 18',
    'Carrot': 'p o M6 40 Q4 28 14 24 Q30 20 48 38 Q62 54 58 58 Q52 62 40 58 Q10 56 6 40Z;l O 1.8 M20 30 L26 38 M28 44 L36 48 M38 36 L44 42;p g M16 26 Q6 12 10 6 Q18 8 22 22Z;p G M22 24 Q22 8 30 4 Q34 12 28 26Z;p g M26 26 Q38 12 46 14 Q44 24 32 30Z;n W M12 32 Q16 28 24 28',
    'Tomato': 'c 32 36 24 r;p g M32 12 L38 18 L46 12 L42 22 L52 24 L42 28 L40 34 L32 28 L24 34 L22 28 L12 24 L22 22 L18 12 L26 18Z;L G 3 M32 14 L32 6;n W M16 32 Q18 22 28 18 Q22 26 22 38Z;c 44 46 2 R',
    'Corn': 'p y M32 2 Q46 6 46 30 Q46 52 32 58 Q18 52 18 30 Q18 6 32 2Z;l d 1.8 M32 4 L32 56 M25 12 L25 50 M39 12 L39 50;l d 1.8 M20 20 L44 20 M19 30 L45 30 M20 40 L44 40;p g M32 62 Q14 52 12 32 Q16 28 22 36 Q24 50 32 56Z;p G M32 62 Q50 52 52 32 Q48 28 42 36 Q40 50 32 56Z;n W M24 8 Q28 6 30 8 L26 40 L22 40Z',
    'Popcorn': 'c 18 20 9 w;c 32 14 10 w;c 46 20 9 w;c 24 28 8 Y;c 40 28 8 w;c 32 24 8 Y;c 14 28 5 y;c 50 28 5 y;p r M10 30 L54 30 L48 62 L16 62Z;p w M20 30 L28 30 L26 62 L22 62Z;p w M36 30 L44 30 L42 62 L38 62Z;n W M12 32 L16 32 L18 58 L14 58Z',
    'Salad': 'p w M6 30 L58 30 Q58 54 32 58 Q6 54 6 30Z;p l M10 30 Q6 16 18 14 Q24 10 28 16 Q34 6 44 14 Q56 14 54 30Z;p g M18 30 Q14 22 24 20 Q28 28 22 30Z;c 26 24 3.6 r;c 40 22 3.6 r;c 34 28 2.6 y;c 46 28 2 o;p L M30 20 Q36 16 44 22 Q38 26 30 20Z;n W M10 38 L14 38 L18 52 L14 48Z;r 22 58 20 5 n 2',
    'Soup': 'e 32 30 28 8 N;p n M4 30 Q6 58 32 60 Q58 58 60 30Z;e 32 30 24 6 o;c 22 30 3 y;c 36 29 3 g;c 44 31 2.6 r;l w 1.6 M18 14 Q14 8 20 4 M30 14 Q26 8 32 2 M42 14 Q38 8 44 4;n W M8 36 L12 36 L16 52 L12 48Z;l N 2 M26 60 L24 63 M38 60 L40 63',
    'Fries': 'p y M12 6 L18 6 L18 36 L12 36Z;p y M20 2 L26 2 L26 36 L20 36Z;p d M28 4 L34 4 L34 36 L28 36Z;p y M36 0 L42 0 L42 36 L36 36Z;p y M44 6 L50 6 L50 36 L44 36Z;p r M8 30 L56 30 L50 62 L14 62Z;p w M8 30 L56 30 L55 36 L9 36Z;l y 3 M28 46 Q32 42 36 46 Q40 50 44 46;n W M12 36 L16 36 L18 58 L14 58Z',
    'Rice': 'p w M6 30 L58 30 Q58 54 32 58 Q6 54 6 30Z;p w M10 30 Q12 12 32 10 Q52 12 54 30Z;p h M14 28 Q18 16 32 14 Q46 16 50 28Z;l a 1.4 M22 18 L26 24 M32 16 L34 24 M40 20 L44 26 M18 24 L22 28;r 22 56 20 5 r 2;c 28 20 0.1 k;n W M10 38 L14 38 L18 50 L14 46Z',
    'Sushi': 'e 32 38 24 16 k;p w M10 34 Q10 24 32 24 Q54 24 54 34 L54 44 Q54 54 32 54 Q10 54 10 44Z;e 32 34 20 10 w;p o M12 30 Q32 14 52 30 Q52 38 32 38 Q12 38 12 30Z;l w 2 M20 28 L24 36 M30 24 L34 34 M40 26 L44 34;n W M16 24 Q22 20 30 20;e 32 34 20 10 w/0',
    'Pumpkin': 'e 32 38 28 22 o;e 18 38 14 22 O;e 46 38 14 22 O;e 32 38 12 22 o;L G 3.6 M32 18 Q32 10 38 6;p g M38 6 Q50 4 52 14 Q44 14 38 6Z;l R 1.6 M18 22 Q10 38 18 54 M46 22 Q54 38 46 54 M32 18 L32 58;n W M10 32 Q12 24 20 20',
    'Jack-o-Lantern': 'e 32 38 28 22 o;e 18 38 14 22 O;e 46 38 14 22 O;e 32 38 12 22 o;L G 3.6 M32 18 Q32 10 38 6;p y M20 30 L28 38 L14 38Z;p y M44 30 L50 38 L36 38Z;p y M16 46 L22 50 L28 46 L34 52 L40 46 L46 50 L50 46 L48 54 Q32 62 18 54Z;n W M10 32 Q12 24 20 20',
    'Tea': 'e 32 28 26 7 w;p w M8 28 Q8 56 32 58 Q56 56 56 28Z;e 32 28 22 5 N;L w 4 M56 32 Q66 34 62 46 Q58 50 52 48;e 32 28 22 5 f;l w 1.8 M20 12 Q16 6 22 2 M34 12 Q30 6 36 0;n W M10 32 L14 32 L18 50 L14 48Z;e 32 62 24 3 K',
    'Coffee': 'e 32 28 26 7 N;p w M8 28 Q8 56 32 58 Q56 56 56 28Z;e 32 28 22 5 N;e 32 28 18 3.4 n;L w 4 M56 32 Q66 34 62 46 Q58 50 52 48;l w 1.8 M22 14 Q18 8 24 2 M36 14 Q32 8 38 2;n W M10 32 L14 32 L18 50 L14 48Z;e 32 62 24 3 K',
    'Chef': '@bust w s #3a2a1a sh;c 20 10 8 w;c 32 6 9 w;c 44 10 8 w;r 18 12 28 8 w 2;l a 1.6 M24 14 L24 19 M32 14 L32 19 M40 14 L40 19;L r 2 M28 44 L32 48 L36 44',
    'Baker': '@bust #f5e6c8 s #7a5a3a sh;p w M18 12 Q18 -2 32 -2 Q46 -2 46 12Z;p u M44 40 Q54 34 62 40 L60 52 Q50 56 42 50Z;l f 1.6 M46 42 L58 46;c 14 52 6 w;c 10 50 2 y;l u 2 M6 54 L16 56',
    'Fisherman': '@bust #3b82e6 s #d9d9d9 sh;p y M8 18 Q32 -4 56 18 L56 22 Q32 14 8 22Z;L n 3 M54 28 L62 6;l w 1 M62 6 L62 40;p b M58 46 Q62 40 66 46 Q62 52 58 46Z;p q M44 50 Q50 44 56 50 Q50 56 44 50Z',
    'Miner': '@bust #d98a2d s #3a2a1a sh;p y M12 20 Q12 -2 32 -2 Q52 -2 52 20Z;r 8 16 48 6 d 3;c 32 8 5 w;c 32 8 2.4 Y;p k M34 40 Q46 36 56 42 L58 56 L50 62 L44 50Z;p a M40 38 L62 46 L58 50 L38 42Z',
    'Firefighter': '@bust #e8473f s #3a2a1a sh;p r M10 20 Q10 -2 32 -2 Q54 -2 54 20 L58 28 L6 28Z;r 24 6 16 10 d 2;l y 2 M10 22 L54 22;p o M44 38 Q56 34 62 44 Q56 52 44 52Z;p c/70 M50 40 Q62 40 62 48Z',
    'Wildfire': 'p O M2 62 Q-2 40 14 28 Q10 44 20 46 Q18 28 32 14 Q36 26 46 28 Q60 36 62 62Z;p r M10 62 Q8 48 18 40 Q18 52 24 52 Q22 38 32 28 Q36 38 44 40 Q54 46 54 62Z;p y M20 62 Q20 54 28 48 Q32 54 38 52 Q44 56 44 62Z;L G 3.6 M6 62 L6 40 M2 40 L10 40;L G 2.4 M58 62 L58 46',
    'Reef Fish': 'p o M6 32 Q18 10 40 16 Q50 20 54 32 Q50 44 40 48 Q18 54 6 32Z;p w M16 20 Q20 32 16 44 L24 44 Q28 32 24 18Z;p w M32 16 Q36 32 32 48 L38 46 Q42 32 38 16Z;p k M16 20 L24 18 M32 16 L38 16;p y M50 32 L64 16 L64 48Z;p y M26 12 Q32 6 40 14Z;c 14 30 3 w;c 14.5 30 1.5 k;l O 1.8 M4 32 L12 34;n W M12 24 Q20 18 30 18'
  });
  const LA_BASE = ['Air', 'Earth', 'Fire', 'Water'];
  const LA_KEY = (a, b) => a < b ? a * 1024 + b : b * 1024 + a;
  const LA = (() => {
    const names = [...LA_BASE], id = {}, rec = [[], [], [], []], pair = new Map(), used = new Set();
    const rows = LA_RAW.trim().split('\n').map(l => { const c = l.indexOf(':'); return [l.slice(0, c).trim(), l.slice(c + 1).split(',').map(s => s.split('+').map(x => x.trim()))]; });
    names.forEach((n, i) => { id[n] = i; });
    rows.forEach(([n]) => { id[n] = names.push(n) - 1; });
    rows.forEach(([n, rs]) => {
      const r = id[n];
      rec[r] = rs.map(p => p.map(x => id[x]));
      rec[r].forEach(([a, b]) => { pair.set(LA_KEY(a, b), r); used.add(a); used.add(b); });
    });
    const finals = names.map((_, i) => i).filter(i => !used.has(i));
    return { names, id, rec, pair, used, finals, n: names.length };
  })();
  const laIco = n => LA_ICONS[n] ? iconSvg(n, LA_ICONS[n]) : `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#cfd6de"/><text x="32" y="40" text-anchor="middle" font-size="24" font-weight="800" fill="#5c6570">${n[0]}</text></svg>`;
  const laSvg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const LA_I = {
    hint: laSvg('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'),
    book: laSvg('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 7h6"/>'),
    clear: laSvg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    sort: laSvg('<path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4"/>'),
    x: laSvg('<path d="M6 6l12 12M18 6L6 18"/>')
  };

  const LA_CSS = `
.gm-element-lab{--ink:#3b3447;--mut:#8a8499;--ac:#2f9e8f;--acd:#237d71;--line:#e4dfd2;--paper:#fffdf8;--ws:#f7f4ec;--iw:76px;--ih:90px;position:relative;align-items:stretch;justify-content:flex-start;gap:0;padding:0;overflow:hidden;border-radius:14px;background:var(--paper);color:var(--ink);font-family:var(--sans);height:clamp(500px,calc(100dvh - var(--goff,250px)),780px);min-height:0;touch-action:manipulation}
.gm-element-lab [hidden]{display:none!important}
.gm-element-lab button{font-family:inherit;color:inherit}
.gm-element-lab .la-top{flex:none;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:1px solid var(--line);background:var(--paper)}
.gm-element-lab .la-prog{display:flex;align-items:center;gap:10px;min-width:0;flex:1}
.gm-element-lab .la-cnt{font:800 16px/1 var(--sans);white-space:nowrap;font-variant-numeric:tabular-nums}
.gm-element-lab .la-bar{position:relative;flex:1;max-width:240px;height:9px;border-radius:99px;background:#ece7d9;overflow:hidden}
.gm-element-lab .la-bar i{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:99px;background:linear-gradient(90deg,#46c2b1,var(--ac));transition:width .5s}
.gm-element-lab .la-btns{display:flex;gap:6px}
.gm-element-lab .la-b{position:relative;display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 13px;border:1.5px solid var(--line);border-radius:999px;background:#fff;font:800 13px/1 var(--sans);cursor:pointer;transition:background .15s,border-color .15s,transform .15s;white-space:nowrap}
.gm-element-lab .la-b:hover{border-color:var(--ac);background:#f1fbf9}
.gm-element-lab .la-b:active{transform:scale(.95)}
.gm-element-lab .la-b svg{width:18px;height:18px;flex:none}
.gm-element-lab .la-b em{font-style:normal;min-width:19px;height:19px;padding:0 5px;border-radius:99px;background:var(--ac);color:#fff;font:800 11px/19px var(--sans);text-align:center}
.gm-element-lab .la-b.off{opacity:.55}
.gm-element-lab .la-main{flex:1;min-height:0;display:flex;position:relative}
.gm-element-lab .la-ws{position:relative;flex:1;min-width:0;background:radial-gradient(#d8d1bf 1.2px,transparent 1.6px) 0 0/24px 24px,var(--ws)}
.gm-element-lab .la-tip{position:absolute;inset:0;display:grid;place-items:center;margin:0;padding:24px;text-align:center;font:700 15px/1.4 var(--sans);color:#b3ac9a;pointer-events:none;transition:opacity .4s}
.gm-element-lab .la-tip.gone{opacity:0}
.gm-element-lab .la-lib{flex:none;width:276px;display:flex;flex-direction:column;border-left:1px solid var(--line);background:var(--paper);transition:background .2s}
.gm-element-lab .la-lib.over{background:#ffe9e6}
.gm-element-lab .la-lib.over::after{content:"Drop to remove";position:absolute;inset:0;display:grid;place-items:center;font:800 15px var(--sans);color:#c4473a;pointer-events:none}
.gm-element-lab .la-lh{flex:none;display:flex;align-items:center;justify-content:space-between;padding:9px 12px;font:800 13px/1 var(--sans);color:var(--mut);text-transform:uppercase;letter-spacing:.06em}
.gm-element-lab .la-lh button{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px;border:1.5px solid var(--line);border-radius:99px;background:#fff;font:800 11px/1 var(--sans);cursor:pointer;letter-spacing:0;text-transform:none}
.gm-element-lab .la-lh button svg{width:14px;height:14px}
.gm-element-lab .la-grid{flex:1;min-height:0;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));grid-auto-rows:88px;gap:2px;padding:4px 8px 12px;align-content:start;touch-action:pan-y;overscroll-behavior:contain;scrollbar-width:thin}
.gm-element-lab .lt{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:2px;padding:6px 2px 2px;border:0;border-radius:12px;background:none;cursor:grab;touch-action:pan-y;min-width:0;-webkit-user-drag:none}
.gm-element-lab .lt:hover{background:#f1ede1}
.gm-element-lab .lt:focus-visible,.gm-element-lab .bt:focus-visible,.gm-element-lab .la-b:focus-visible{outline:3px solid var(--ac);outline-offset:1px}
.gm-element-lab .lt .ic{width:50px;height:50px;pointer-events:none}
.gm-element-lab .lt .nm{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:700 11.5px/1.2 var(--sans);color:#4a4358;pointer-events:none}
.gm-element-lab .lt.fresh{animation:la-fresh 1.6s ease 2}
.gm-element-lab .lt.hint{background:#fff3c4;box-shadow:0 0 0 2.5px #f5c542;animation:la-hint 1s ease-in-out infinite}
@keyframes la-fresh{0%,100%{background:none}50%{background:#d9f5ef}}
@keyframes la-hint{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
.gm-element-lab .ic svg{display:block;width:100%;height:100%;overflow:visible;pointer-events:none}
.gm-element-lab .la-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:5}
.gm-element-lab .it{position:absolute;left:0;top:0;width:var(--iw);height:var(--ih);display:flex;flex-direction:column;align-items:center;pointer-events:auto;cursor:grab;touch-action:none;will-change:translate}
.gm-element-lab .it .ic{width:calc(var(--iw) - 14px);height:calc(var(--iw) - 14px);filter:drop-shadow(0 3px 3px rgba(60,50,70,.22));transition:transform .15s}
.gm-element-lab .it .nm{margin-top:1px;max-width:130%;padding:1px 6px;border-radius:99px;background:rgba(255,253,248,.82);font:800 11.5px/1.25 var(--sans);color:#4a4358;white-space:nowrap;pointer-events:none}
.gm-element-lab .it.drag{cursor:grabbing}
.gm-element-lab .it.drag .ic{transform:scale(1.14) rotate(-3deg);filter:drop-shadow(0 8px 8px rgba(60,50,70,.3))}
.gm-element-lab .it.target .ic{transform:scale(1.18);filter:drop-shadow(0 0 7px #46c2b1) drop-shadow(0 0 2px #46c2b1)}
.gm-element-lab .it.slide{transition:translate .24s cubic-bezier(.2,.8,.3,1)}
.gm-element-lab .it.pop{animation:la-pop .5s cubic-bezier(.2,1.4,.4,1)}
.gm-element-lab .it.out{animation:la-out .22s ease forwards;pointer-events:none}
.gm-element-lab .it.shake .ic{animation:la-shake .3s}
@keyframes la-pop{0%{scale:.2;opacity:0}60%{scale:1.25;opacity:1}100%{scale:1}}
@keyframes la-out{to{scale:.1;opacity:0}}
@keyframes la-shake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.gm-element-lab .ring{position:absolute;left:0;top:0;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;border:3px solid #46c2b1;pointer-events:none;animation:la-ring .55s ease-out forwards}
@keyframes la-ring{to{transform:scale(6);opacity:0}}
.gm-element-lab .la-new{position:absolute;left:50%;top:62px;z-index:8;display:flex;align-items:center;gap:10px;padding:8px 18px 8px 10px;border-radius:99px;background:#fff;border:2px solid var(--ac);box-shadow:0 12px 28px -10px rgba(35,125,113,.55);animation:la-ban 2.4s ease forwards;pointer-events:none;translate:-50% 0}
.gm-element-lab .la-new .ic{width:42px;height:42px}
.gm-element-lab .la-new small{display:block;font:800 10.5px/1 var(--sans);text-transform:uppercase;letter-spacing:.08em;color:var(--ac)}
.gm-element-lab .la-new b{display:block;font:800 17px/1.2 var(--sans)}
@keyframes la-ban{0%{opacity:0;margin-top:-16px}12%{opacity:1;margin-top:0}85%{opacity:1}100%{opacity:0}}
.gm-element-lab .la-book{position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;background:var(--paper);animation:la-in .22s ease}
@keyframes la-in{from{opacity:0;transform:translateY(12px)}}
.gm-element-lab .bk-h{flex:none;display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid var(--line)}
.gm-element-lab .bk-h h3{margin:0;font:800 19px/1 var(--sans)}
.gm-element-lab .bk-h .sp{flex:1}
.gm-element-lab .bk-st{font:700 12.5px/1.3 var(--sans);color:var(--mut);text-align:right}
.gm-element-lab .bk-st b{color:var(--ink)}
.gm-element-lab .bk-x{width:38px;height:38px;display:grid;place-items:center;border:1.5px solid var(--line);border-radius:50%;background:#fff;cursor:pointer;flex:none}
.gm-element-lab .bk-x svg{width:18px;height:18px}
.gm-element-lab .bk-c{flex:none;display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:10px 14px}
.gm-element-lab .bk-tabs{display:inline-flex;padding:3px;border-radius:99px;background:#efeadc}
.gm-element-lab .bk-tabs button{border:0;background:none;padding:7px 13px;border-radius:99px;font:800 12.5px/1 var(--sans);color:var(--mut);cursor:pointer;white-space:nowrap}
.gm-element-lab .bk-tabs button[aria-pressed="true"]{background:#fff;color:var(--ac);box-shadow:0 1px 3px rgba(60,50,70,.2)}
.gm-element-lab .la-q{flex:1;min-width:130px;height:36px;padding:0 14px;border:1.5px solid var(--line);border-radius:99px;font:700 14px var(--sans);color:var(--ink);background:#fff;outline:0}
.gm-element-lab .la-q:focus{border-color:var(--ac)}
.gm-element-lab .bk-b{flex:1;min-height:0;display:flex;position:relative}
.gm-element-lab .bk-g{flex:1;min-width:0;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));grid-auto-rows:90px;gap:2px;padding:4px 10px 16px;align-content:start;scrollbar-width:thin}
.gm-element-lab .bt{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px 2px;border:0;border-radius:12px;background:none;cursor:pointer;min-width:0}
.gm-element-lab .bt:hover,.gm-element-lab .bt.sel{background:#f1ede1}
.gm-element-lab .bt .ic{width:50px;height:50px}
.gm-element-lab .bt .nm{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:700 11.5px/1.2 var(--sans)}
.gm-element-lab .bt.sil .ic{filter:brightness(0);opacity:.16}
.gm-element-lab .bt.sil .nm{color:#c0b9a8}
.gm-element-lab .bt.fin::after,.gm-element-lab .tag.fin::before{content:"";position:absolute;right:10px;top:6px;width:11px;height:11px;border-radius:50%;background:#f5c542;border:2px solid #fff;box-shadow:0 0 0 1px #d9a21f}
.gm-element-lab .bk-e{grid-column:1/-1;padding:40px 12px;text-align:center;font:700 14px/1.5 var(--sans);color:var(--mut)}
.gm-element-lab .bk-d{flex:none;width:286px;overflow:auto;padding:16px;border-left:1px solid var(--line);background:#fcfaf3}
.gm-element-lab .bk-d .bd-ic{width:96px;height:96px;margin:4px auto 6px}
.gm-element-lab .bk-d .bd-ic.sil{filter:brightness(0);opacity:.16}
.gm-element-lab .bk-d h4{margin:0 0 6px;text-align:center;font:800 21px/1.2 var(--sans)}
.gm-element-lab .bk-d h5{margin:14px 0 6px;font:800 11px/1 var(--sans);text-transform:uppercase;letter-spacing:.08em;color:var(--mut)}
.gm-element-lab .bk-d .mut{margin:10px 0;text-align:center;font:700 13px/1.45 var(--sans);color:var(--mut)}
.gm-element-lab .bk-d .tags{display:flex;justify-content:center;gap:6px;flex-wrap:wrap}
.gm-element-lab .tag{position:relative;padding:4px 10px;border-radius:99px;background:#efeadc;font:800 11px/1.2 var(--sans)}
.gm-element-lab .tag.fin{padding-left:24px;background:#fff3c4}
.gm-element-lab .tag.fin::before{left:7px;top:5px;right:auto}
.gm-element-lab .rc{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px}
.gm-element-lab .rc>b{color:var(--mut)}
.gm-element-lab .ch{display:inline-flex;align-items:center;gap:5px;padding:3px 10px 3px 4px;border:1.5px solid var(--line);border-radius:99px;background:#fff;font:700 12px/1 var(--sans);cursor:pointer}
.gm-element-lab .ch .ic{width:26px;height:26px}
.gm-element-lab .ch.sil{cursor:default;color:#b9b2a1}
.gm-element-lab .ch.sil .ic{filter:brightness(0);opacity:.16}
.gm-element-lab .mk{display:flex;flex-wrap:wrap;gap:4px}
.gm-element-lab .mk .ch{padding-right:4px}
.gm-element-lab .mk .ch .ic{width:30px;height:30px}
.gm-element-lab .bk-d .bk-x{display:none}
@media (max-width:720px){
.gm-element-lab{--iw:62px;--ih:78px}
.gm-element-lab .la-top{padding:8px 10px;gap:6px}
.gm-element-lab .la-b span{display:none}
.gm-element-lab .la-b{padding:0 10px}
.gm-element-lab .la-b em{display:inline-block}
.gm-element-lab .la-main{flex-direction:column}
.gm-element-lab .la-lib{width:auto;height:196px;border-left:0;border-top:1px solid var(--line)}
.gm-element-lab .la-lh{padding:6px 12px}
.gm-element-lab .la-grid{display:grid;grid-template-columns:none;grid-template-rows:repeat(2,84px);grid-auto-flow:column;grid-auto-columns:68px;overflow-x:auto;overflow-y:hidden;touch-action:pan-x;padding:2px 8px 6px}
.gm-element-lab .lt{touch-action:pan-x}
.gm-element-lab .la-new{top:52px}
.gm-element-lab .bk-b{flex-direction:column}
.gm-element-lab .bk-d{position:absolute;left:0;right:0;bottom:0;width:auto;max-height:62%;border-left:0;border-top:1px solid var(--line);box-shadow:0 -14px 30px -14px rgba(60,50,70,.45);z-index:2}
.gm-element-lab .bk-d .bk-x{display:grid;position:absolute;right:10px;top:10px}
.gm-element-lab .bk-st{display:none}
}
`;
  const LA_ICON = ICON('<path d="M26 6h12M29 6v16L15 48a6 6 0 0 0 5.4 9h23.2A6 6 0 0 0 49 48L35 22V6"/><path d="M20 40h24" opacity=".6"/><circle cx="29" cy="48" r="2.4" fill="currentColor"/><circle cx="38" cy="44" r="1.8" fill="currentColor"/>');

  function mountAlchemy(root, api) {
    const { names, rec, pair, used, finals, n: N } = LA;
    const sv = api.load() || {};
    const found = new Set([0, 1, 2, 3]);
    if (Array.isArray(sv.found)) sv.found.forEach(i => { if (Number.isInteger(i) && i >= 0 && i < N) found.add(i); });
    const order = [...found];
    let sort = sv.sort === 'az' ? 'az' : 'new';
    const H = { c: Math.min(5, Math.max(0, Number.isFinite(sv.hc) ? sv.hc : 3)), t: Number.isFinite(sv.ht) ? sv.ht : Date.now(), g: Array.isArray(sv.hg) && sv.hg.length === 4 && sv.hg.every(Number.isInteger) ? sv.hg : null };
    let done = !!sv.done;

    root.innerHTML = `
<div class="la-top"><div class="la-prog"><b class="la-cnt"></b><span class="la-bar"><i></i></span></div><div class="la-btns"><button type="button" class="la-b" data-hint title="Hint (H)">${LA_I.hint}<span>Hint</span><em></em></button><button type="button" class="la-b" data-book title="Encyclopedia (B)">${LA_I.book}<span>Book</span></button><button type="button" class="la-b" data-clear title="Clear board (C)">${LA_I.clear}<span>Clear</span></button></div></div>
<div class="la-main"><div class="la-ws"><p class="la-tip">Drag elements onto the board.<br>Drop one on another to combine them.</p></div><aside class="la-lib"><div class="la-lh"><span>Elements</span><button type="button" data-sort>${LA_I.sort}<span></span></button></div><div class="la-grid"></div></aside></div>
<div class="la-layer"></div>
<div class="la-book" hidden><div class="bk-h"><h3>Encyclopedia</h3><span class="sp"></span><div class="bk-st"></div><button type="button" class="bk-x" data-close aria-label="Close">${LA_I.x}</button></div><div class="bk-c"><div class="bk-tabs"><button type="button" data-tab="all" aria-pressed="true">All</button><button type="button" data-tab="found" aria-pressed="false">Found</button><button type="button" data-tab="missing" aria-pressed="false">Not found</button><button type="button" data-tab="final" aria-pressed="false">Final</button></div><input class="la-q" type="search" placeholder="Search discovered elements" aria-label="Search elements" autocomplete="off"></div><div class="bk-b"><div class="bk-g"></div><div class="bk-d" hidden></div></div></div>`;
    const $ = s => root.querySelector(s);
    const ws = $('.la-ws'), lib = $('.la-lib'), grid = $('.la-grid'), layer = $('.la-layer'), tip = $('.la-tip');
    const cnt = $('.la-cnt'), bar = $('.la-bar i'), hintB = $('[data-hint]'), hintE = hintB.querySelector('em'), sortB = $('[data-sort]');
    const book = $('.la-book'), bkG = $('.bk-g'), bkD = $('.bk-d'), bkQ = $('.la-q'), bkSt = $('.bk-st');
    const items = new Set(), tiles = new Map();
    let IW = 76, IH = 90, z = 1, D = null, saveT = 0, tab = 'all', selBook = -1, lastTap = { it: null, t: 0 };

    const kf = () => root.offsetWidth ? root.getBoundingClientRect().width / root.offsetWidth : 1;
    const lc = (cx, cy) => { const r = root.getBoundingClientRect(), k = kf(); return [(cx - r.left) / k, (cy - r.top) / k]; };
    const box = e => { const r = e.getBoundingClientRect(), R = root.getBoundingClientRect(), k = kf(); return { x: (r.left - R.left) / k, y: (r.top - R.top) / k, w: r.width / k, h: r.height / k }; };
    const place = it => { it.e.style.translate = `${(it.x - IW / 2).toFixed(1)}px ${(it.y - IH / 2).toFixed(1)}px`; };
    const clampPt = (x, y) => {
      const b = box(ws), mx = Math.min(IW / 2 + 2, b.w / 2), my = Math.min(IH / 2 + 2, b.h / 2);
      return [Math.min(b.x + b.w - mx, Math.max(b.x + mx, x)), Math.min(b.y + b.h - my, Math.max(b.y + my, y))];
    };
    const snap = () => {
      const b = box(ws);
      if (b.w) api.save({ found: [...order], sort, hc: H.c, ht: H.t, hg: H.g, done, it: [...items].map(i => [i.id, +((i.x - b.x) / b.w).toFixed(4), +((i.y - b.y) / b.h).toFixed(4)]) });
    };
    const persist = () => { clearTimeout(saveT); saveT = setTimeout(snap, 220); };
    api.on(window, 'pagehide', () => { snap(); api.submit(found.size); });

    function mk(id, x, y, anim) {
      const e = el('div', 'it' + (anim ? ' ' + anim : ''), `<span class="ic">${laIco(names[id])}</span><span class="nm">${names[id]}</span>`);
      const it = { id, x, y, e };
      e._it = it; e.style.zIndex = ++z;
      place(it); layer.append(e); items.add(it);
      tip.classList.add('gone');
      if (anim === 'pop') e.addEventListener('animationend', () => e.classList.remove('pop'), { once: true });
      return it;
    }
    function del(it, soft) {
      items.delete(it);
      if (!soft) { it.e.remove(); return; }
      it.e.classList.add('out');
      setTimeout(() => it.e.remove(), 240);
    }
    function freeSpot() {
      const b = box(ws);
      let x = 0, y = 0;
      for (let i = 0; i < 50; i++) {
        x = b.x + IW / 2 + 6 + Math.random() * Math.max(1, b.w - IW - 12); y = b.y + IH / 2 + 6 + Math.random() * Math.max(1, b.h - IH - 12);
        if (![...items].some(o => Math.hypot(o.x - x, o.y - y) < IW * 1.05)) break;
      }
      return [x, y];
    }
    function ring(x, y) {
      const r = el('i', 'ring');
      r.style.translate = `${x}px ${y}px`;
      layer.append(r);
      setTimeout(() => r.remove(), 600);
    }

    function addTile(id, fresh) {
      const t = el('button', 'lt' + (fresh ? ' fresh' : ''), `<span class="ic">${laIco(names[id])}</span><span class="nm">${names[id]}</span>`);
      t.type = 'button'; t.dataset.i = id; t.title = names[id]; t.draggable = false;
      tiles.set(id, t); grid.append(t);
      if (fresh) setTimeout(() => t.classList.remove('fresh'), 3400);
    }
    function sortLib() {
      const list = sort === 'az' ? [...order].sort((a, b) => names[a].localeCompare(names[b])) : order;
      list.forEach(i => grid.append(tiles.get(i)));
      sortB.lastChild.textContent = sort === 'az' ? 'A to Z' : 'Discovery';
    }

    function refill() {
      const now = Date.now();
      if (H.c >= 5 || H.t > now) { H.t = now; return; }
      const k = Math.floor((now - H.t) / 90000);
      if (k > 0) { H.c = Math.min(5, H.c + k); H.t = H.c >= 5 ? now : H.t + k * 90000; }
    }
    function hud() {
      cnt.textContent = `${found.size} / ${N}`;
      bar.style.width = (found.size / N * 100).toFixed(2) + '%';
      refill();
      hintE.textContent = H.c;
      hintB.classList.toggle('off', H.c < 1 && !(H.g && H.g[3] < 2));
      hintB.title = H.c >= 5 ? 'Hint (H)' : `Hint (H) · next charge in ${Math.max(1, Math.ceil((H.t + 90000 - Date.now()) / 1000))}s`;
    }
    function applyHint() {
      tiles.forEach(t => t.classList.remove('hint'));
      if (!H.g) return;
      const [tg, a, b, s] = H.g;
      if (found.has(tg)) { H.g = null; return; }
      const show = [a, ...(s >= 2 ? [b] : [])];
      show.forEach(i => { const t = tiles.get(i); if (t) t.classList.add('hint'); });
      const first = tiles.get(a);
      if (first) first.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    function hint() {
      refill();
      if (H.g && found.has(H.g[0])) H.g = null;
      if (H.g && H.g[3] < 2) H.g[3] = 2;
      else {
        if (H.c < 1) { api.toast(`No hints left. Next one in ${Math.max(1, Math.ceil((H.t + 90000 - Date.now()) / 1000))}s`); hud(); return; }
        const cand = [];
        for (let r = 4; r < N; r++) {
          if (found.has(r)) continue;
          const ok = rec[r].filter(([a, b]) => found.has(a) && found.has(b));
          if (ok.length) cand.push([r, ok[Math.floor(Math.random() * ok.length)]]);
        }
        if (!cand.length) { api.toast(found.size >= N ? 'You found everything!' : 'No hint available right now'); return; }
        const [r, [a, b]] = cand[Math.floor(Math.random() * cand.length)];
        if (H.c >= 5) H.t = Date.now();
        H.c--;
        H.g = [r, a, b, 1];
      }
      const [, a, b, s] = H.g;
      api.toast(s >= 2 ? `Hint: combine ${names[a]} with ${names[b]}` : `Hint: one ingredient is ${names[a]}. Press hint again for the other.`);
      api.sfx('tap');
      applyHint(); hud(); persist();
    }

    function banner(id) {
      const o = $('.la-new');
      if (o) o.remove();
      const b = el('div', 'la-new', `<span class="ic">${laIco(names[id])}</span><div><small>New element</small><b>${names[id]}</b></div>`);
      root.append(b);
      setTimeout(() => b.remove(), 2450);
    }
    function discover(r) {
      found.add(r); order.push(r);
      addTile(r, true);
      if (sort === 'az') sortLib();
      tiles.get(r).scrollIntoView({ block: 'nearest', inline: 'nearest' });
      api.score(found.size);
      if (found.size % 10 === 0 || found.size >= N) api.submit(found.size);
      banner(r);
      api.sfx('good');
      if (H.g && H.g[0] === r) H.g = null;
      applyHint(); hud();
      if (!book.hidden) renderBook();
      if (found.size >= N && !done) {
        done = true;
        api.timeout(() => api.overlay({ kicker: 'Complete', title: 'Master Alchemist', text: `You discovered all ${N} elements. Every recipe is in your book.`, button: 'Keep playing' }), 1400);
      }
    }
    function combine(a, b) {
      const r = pair.get(LA_KEY(a.id, b.id));
      if (r === undefined) {
        const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy) || 1;
        [a.x, a.y] = clampPt(a.x + dx / d * IW * .95, a.y + dy / d * IH * .95);
        a.e.classList.add('slide', 'shake'); place(a);
        setTimeout(() => a.e && a.e.classList.remove('slide', 'shake'), 320);
        api.sfx('hit');
        return;
      }
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      del(a); del(b);
      const [cx, cy] = clampPt(mx, my);
      mk(r, cx, cy, 'pop'); ring(cx, cy);
      if (!found.has(r)) discover(r); else api.sfx('pop');
    }
    function target(it) {
      let best = null, bd = IW * .72;
      items.forEach(o => { if (o === it) return; const d = Math.hypot(o.x - it.x, o.y - it.y); if (d < bd) { bd = d; best = o; } });
      return best;
    }

    const inRect = (r, x, y) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    let tgtMark = null;
    function mark(o) {
      if (tgtMark === o) return;
      if (tgtMark) tgtMark.e.classList.remove('target');
      tgtMark = o;
      if (o) o.e.classList.add('target');
    }
    function startLibDrag(e) {
      const [px, py] = lc(e.clientX, e.clientY);
      D.it = mk(D.id, px, py);
      D.it.e.classList.add('drag'); D.dx = 0; D.dy = 0;
      api.sfx('tap');
    }
    function onDown(e) {
      if (D || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const t = e.target.closest('.it');
      if (!t) return;
      const it = t._it, [px, py] = lc(e.clientX, e.clientY);
      D = { it, pid: e.pointerId, dx: it.x - px, dy: it.y - py, sx: e.clientX, sy: e.clientY, moved: false };
      it.e.style.zIndex = ++z; it.e.classList.add('drag');
      e.preventDefault();
    }
    function onLibDown(e) {
      if (D || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const t = e.target.closest('.lt');
      if (!t) return;
      D = { it: null, id: +t.dataset.i, lib: true, pid: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false };
      if (e.pointerType === 'mouse') e.preventDefault();
    }
    function onMove(e) {
      if (!D || e.pointerId !== D.pid) return;
      if (!D.moved && Math.hypot(e.clientX - D.sx, e.clientY - D.sy) < 6) return;
      D.moved = true;
      if (!D.it) startLibDrag(e);
      const [px, py] = lc(e.clientX, e.clientY);
      D.it.x = px + D.dx; D.it.y = py + D.dy;
      place(D.it);
      lib.classList.toggle('over', inRect(lib.getBoundingClientRect(), e.clientX, e.clientY));
      mark(target(D.it));
      e.preventDefault();
    }
    function onUp(e) {
      if (!D || e.pointerId !== D.pid) return;
      const d = D; D = null;
      mark(null); lib.classList.remove('over');
      if (!d.it) {
        if (d.moved || e.type === 'pointercancel') return;
        const [x, y] = freeSpot();
        mk(d.id, x, y, 'pop'); api.sfx('tap'); persist();
        return;
      }
      const it = d.it;
      it.e.classList.remove('drag');
      if (e.type !== 'pointercancel' && inRect(lib.getBoundingClientRect(), e.clientX, e.clientY)) { del(it, true); persist(); return; }
      if (!d.lib && !d.moved) {
        const now = performance.now();
        if (lastTap.it === it && now - lastTap.t < 340) {
          lastTap = { it: null, t: 0 };
          const [x, y] = clampPt(it.x + IW * .45, it.y + IH * .3);
          mk(it.id, x, y, 'pop'); api.sfx('pop'); persist();
          return;
        }
        lastTap = { it, t: now };
        return;
      }
      const tg = e.type === 'pointercancel' ? null : target(it);
      if (tg) { combine(it, tg); persist(); return; }
      [it.x, it.y] = clampPt(it.x, it.y); place(it); persist();
    }
    api.on(layer, 'pointerdown', onDown);
    api.on(grid, 'pointerdown', onLibDown);
    api.on(window, 'pointermove', onMove, { passive: false });
    api.on(window, 'pointerup', onUp);
    api.on(window, 'pointercancel', onUp);
    api.on(grid, 'dragstart', e => e.preventDefault());
    api.on(grid, 'keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const t = e.target.closest('.lt');
      if (!t) return;
      e.preventDefault();
      const [x, y] = freeSpot();
      mk(+t.dataset.i, x, y, 'pop'); api.sfx('tap'); persist();
    });

    function clearAll() {
      if (!items.size) return;
      [...items].forEach(i => del(i, true));
      tip.classList.remove('gone');
      persist();
    }

    function layout() {
      IW = root.offsetWidth < 720 ? 62 : 76; IH = IW + 14;
      items.forEach(it => { [it.x, it.y] = clampPt(it.x, it.y); place(it); });
    }
    let wb = null;
    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(() => {
        if (!api.alive) return ro.disconnect();
        const n = box(ws);
        if (!n.w) return;
        if (wb && wb.w && wb.h) items.forEach(it => { it.x = n.x + (it.x - wb.x) / wb.w * n.w; it.y = n.y + (it.y - wb.y) / wb.h * n.h; });
        wb = n;
        layout();
      });
      ro.observe(ws);
    }

    function chip(a) {
      return found.has(a) ? `<button type="button" class="ch" data-i="${a}"><span class="ic">${laIco(names[a])}</span>${names[a]}</button>` : `<span class="ch sil"><span class="ic">${laIco(names[a])}</span>???</span>`;
    }
    function detail(i) {
      selBook = i;
      const f = found.has(i);
      let h = `<button type="button" class="bk-x" data-dx aria-label="Close">${LA_I.x}</button><div class="bd-ic ${f ? '' : 'sil'}">${laIco(names[i])}</div><h4>${f ? names[i] : '???'}</h4>`;
      const tags = [i < 4 ? '<span class="tag">Base element</span>' : '', f && !used.has(i) ? '<span class="tag fin">Final element</span>' : ''].join('');
      if (tags) h += `<div class="tags">${tags}</div>`;
      if (i < 4) h += '<p class="mut">One of the four elements everything starts from.</p>';
      else if (!f) h += '<p class="mut">Not discovered yet. Keep combining elements to find it.</p>';
      else h += '<h5>Made from</h5>' + rec[i].map(([a, b]) => `<div class="rc">${chip(a)}<b>+</b>${chip(b)}</div>`).join('');
      if (f) {
        const made = order.filter(j => rec[j].some(p => p.includes(i)));
        if (made.length) h += '<h5>Used to make</h5><div class="mk">' + made.slice(0, 48).map(j => `<button type="button" class="ch" data-i="${j}" title="${names[j]}"><span class="ic">${laIco(names[j])}</span></button>`).join('') + (made.length > 48 ? `<span class="mut">+${made.length - 48}</span>` : '') + '</div>';
      }
      bkD.innerHTML = h; bkD.hidden = false; bkD.scrollTop = 0;
      bkG.querySelectorAll('.bt.sel').forEach(x => x.classList.remove('sel'));
      const t = bkG.querySelector(`.bt[data-i="${i}"]`);
      if (t) t.classList.add('sel');
    }
    function renderBook() {
      const q = bkQ.value.trim().toLowerCase();
      let ids = [];
      for (let i = 0; i < N; i++) {
        const f = found.has(i);
        if (tab === 'found' && !f) continue;
        if (tab === 'missing' && f) continue;
        if (tab === 'final' && used.has(i)) continue;
        if (q && !(f && names[i].toLowerCase().includes(q))) continue;
        ids.push(i);
      }
      if (q || tab === 'found' || tab === 'final') ids.sort((a, b) => (found.has(b) - found.has(a)) || names[a].localeCompare(names[b]));
      bkG.innerHTML = ids.length ? ids.map(i => { const f = found.has(i); return `<button type="button" class="bt${f ? '' : ' sil'}${f && !used.has(i) ? ' fin' : ''}${i === selBook ? ' sel' : ''}" data-i="${i}"><span class="ic">${laIco(names[i])}</span><span class="nm">${f ? names[i] : '???'}</span></button>`; }).join('') : `<p class="bk-e">${q ? 'No discovered element matches. Search only looks at elements you have found.' : 'Nothing here yet.'}</p>`;
      const ff = finals.filter(i => found.has(i)).length;
      bkSt.innerHTML = `<b>${found.size}</b> of ${N} found (${Math.floor(found.size / N * 100)}%)<br>Final elements <b>${ff}</b> of ${finals.length}`;
    }
    function openBook() {
      if (!book.hidden) return;
      book.hidden = false; bkD.hidden = true; selBook = -1;
      renderBook(); api.sfx('tap');
    }
    function closeBook() { book.hidden = true; }
    api.on(book, 'click', e => {
      const c = e.target.closest('button');
      if (!c) return;
      if (c.dataset.close !== undefined) return closeBook();
      if (c.dataset.dx !== undefined) { bkD.hidden = true; selBook = -1; bkG.querySelectorAll('.bt.sel').forEach(x => x.classList.remove('sel')); return; }
      if (c.dataset.tab) {
        tab = c.dataset.tab;
        book.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-pressed', String(b === c)));
        renderBook();
        return;
      }
      if (c.dataset.i !== undefined) detail(+c.dataset.i);
    });
    api.on(bkQ, 'input', renderBook);
    api.on(hintB, 'click', hint);
    api.on($('[data-book]'), 'click', () => (book.hidden ? openBook() : closeBook()));
    api.on($('[data-clear]'), 'click', clearAll);
    api.on(sortB, 'click', () => { sort = sort === 'az' ? 'new' : 'az'; sortLib(); persist(); });
    api.on(window, 'keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || api.paused || isFieldEl(e.target)) return;
      const k = e.key.toLowerCase();
      if (k === 'h') hint();
      else if (k === 'b') (book.hidden ? openBook() : closeBook());
      else if (k === 'c' && book.hidden) clearAll();
    });

    order.forEach(i => addTile(i));
    sortLib();
    api.timeout(() => {
      layout();
      const b = box(ws);
      if (Array.isArray(sv.it)) sv.it.slice(0, 120).forEach(r => {
        if (!Array.isArray(r) || !Number.isInteger(r[0]) || r[0] < 0 || r[0] >= N || !found.has(r[0])) return;
        const [x, y] = clampPt(b.x + (+r[1] || 0) * b.w, b.y + (+r[2] || 0) * b.h);
        mk(r[0], x, y);
      });
      applyHint();
    }, 0);
    api.interval(hud, 1000);
    api.score(found.size);
    hud();
  }
  const isFieldEl = t => t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);

  Ameplay.register({
    id: 'element-lab',
    title: 'Element Lab',
    category: 'Puzzle',
    better: 'high',
    width: 1000,
    blurb: 'Combine air, earth, fire and water into 493 elements, from mud and steam to dragons and pizza.',
    help: 'Drag elements onto the board and drop one on another to combine · double-click to copy · drop on the list to remove · <kbd>H</kbd> hint · <kbd>B</kbd> book · <kbd>C</kbd> clear',
    icon: LA_ICON,
    css: LA_CSS,
    mount: mountAlchemy
  });
})();
(() => {
  'use strict';

  const OL_NM = {
    m: ['Liam', 'Noah', 'Lucas', 'Hugo', 'Gabriel', 'Louis', 'Léo', 'Adam', 'Ethan', 'Nathan', 'Mateo', 'Arthur', 'Jules', 'Raphaël', 'Samuel', 'Omar', 'Yusuf', 'Kenji', 'Marco', 'Luca', 'Diego', 'Felix', 'Oscar', 'Théo', 'Max', 'Elias', 'Malik', 'Ravi', 'Tom', 'Daniel', 'Victor', 'Paul', 'Sacha', 'Enzo', 'Isaac', 'Kofi', 'Karim', 'Ben', 'Jonas', 'Antoine', 'Rayan', 'Milo', 'Aaron', 'Nils', 'Tiago', 'Hiro', 'Idris', 'Simon'],
    f: ['Emma', 'Léa', 'Chloé', 'Mia', 'Jade', 'Louise', 'Alice', 'Inès', 'Lina', 'Zoé', 'Sofia', 'Olivia', 'Ava', 'Rose', 'Anna', 'Clara', 'Nora', 'Maya', 'Amira', 'Yasmin', 'Aiko', 'Giulia', 'Lucia', 'Elena', 'Hannah', 'Lena', 'Sara', 'Camille', 'Manon', 'Julia', 'Isla', 'Grace', 'Priya', 'Amara', 'Nina', 'Eva', 'Margot', 'Ella', 'Charlotte', 'Laura', 'Mila', 'Aya', 'Lou', 'Iris', 'Salomé', 'Naomi', 'Leila', 'Ambre'],
    l: ['Martin', 'Bernard', 'Dubois', 'Moreau', 'Laurent', 'Garcia', 'Rossi', 'Silva', 'Müller', 'Smith', 'Johnson', 'Brown', 'Wilson', 'Taylor', 'Lopez', 'Fernandez', 'Costa', 'Ferrari', 'Bianchi', 'Schmidt', 'Weber', 'Novak', 'Kowalski', 'Haddad', 'Benali', 'Diallo', 'Mensah', 'Okafor', 'Nakamura', 'Tanaka', 'Kim', 'Chen', 'Patel', 'Singh', 'Murphy', 'O’Brien', 'Jensen', 'Larsen', 'Lambert', 'Fontaine', 'Girard', 'Romero', 'Santos', 'Pereira', 'Meyer', 'Fischer', 'Petit', 'Roux', 'Blanc', 'Morel', 'Nguyen', 'Rahman']
  };
  const OL_CITY = [['Lyon', 'Lyon', 'France', 'en France'], ['Marseille', 'Marseille', 'France', 'en France'], ['Paris', 'Paris', 'France', 'en France'], ['Nice', 'Nice', 'France', 'en France'], ['Monaco', 'Monaco', 'Monaco', 'à Monaco'], ['Brussels', 'Bruxelles', 'Belgium', 'en Belgique'], ['Geneva', 'Genève', 'Switzerland', 'en Suisse'], ['Montreal', 'Montréal', 'Canada', 'au Canada'], ['London', 'Londres', 'the United Kingdom', 'au Royaume-Uni'], ['Dublin', 'Dublin', 'Ireland', 'en Irlande'], ['Madrid', 'Madrid', 'Spain', 'en Espagne'], ['Barcelona', 'Barcelone', 'Spain', 'en Espagne'], ['Lisbon', 'Lisbonne', 'Portugal', 'au Portugal'], ['Rome', 'Rome', 'Italy', 'en Italie'], ['Milan', 'Milan', 'Italy', 'en Italie'], ['Berlin', 'Berlin', 'Germany', 'en Allemagne'], ['Munich', 'Munich', 'Germany', 'en Allemagne'], ['Amsterdam', 'Amsterdam', 'the Netherlands', 'aux Pays-Bas'], ['New York', 'New York', 'the United States', 'aux États-Unis'], ['Toronto', 'Toronto', 'Canada', 'au Canada'], ['Sydney', 'Sydney', 'Australia', 'en Australie'], ['Dakar', 'Dakar', 'Senegal', 'au Sénégal'], ['Casablanca', 'Casablanca', 'Morocco', 'au Maroc'], ['Tokyo', 'Tokyo', 'Japan', 'au Japon']];
  const OL_SPORT = [['football', 'football'], ['basketball', 'basket'], ['tennis', 'tennis'], ['swimming', 'natation'], ['athletics', 'athlétisme'], ['volleyball', 'volley'], ['rugby', 'rugby'], ['handball', 'handball'], ['gymnastics', 'gymnastique'], ['judo', 'judo']];
  const OL_SUBJ = [['maths', 'les maths'], ['history', 'l’histoire'], ['biology', 'la biologie'], ['chemistry', 'la chimie'], ['physics', 'la physique'], ['art', 'les arts plastiques'], ['music', 'la musique'], ['literature', 'la littérature'], ['geography', 'la géographie'], ['computer science', 'l’informatique'], ['languages', 'les langues'], ['PE', 'le sport']];
  const OL_TOPIC = [['dinosaurs', 'les dinosaures'], ['space', 'l’espace'], ['our favourite films', 'nos films préférés'], ['the meaning of life', 'le sens de la vie'], ['old family stories', 'de vieilles histoires de famille'], ['football', 'le football'], ['music', 'la musique'], ['the weather', 'la météo'], ['our plans for the future', 'nos projets d’avenir'], ['the best pizza toppings', 'les meilleures garnitures de pizza'], ['books', 'des livres'], ['animals', 'les animaux']];
  const OL_CAUSE = {
    age: ['old age', 'de vieillesse'], sleep: ['peacefully in my sleep', 'paisiblement dans mon sommeil'], heart: ['heart failure', 'd’une insuffisance cardiaque'], stroke: ['a stroke', 'd’un AVC'], ill: ['a long illness', 'd’une longue maladie'], pneu: ['pneumonia', 'd’une pneumonie'], acc: ['an accident', 'dans un accident'], sudden: ['a sudden illness', 'd’une maladie soudaine']
  };

  const OL_MAJ = [
    ['med', 'Medicine', 'Médecine', 85, 3, 's'],
    ['law', 'Law', 'Droit', 78, 3, 's'],
    ['cs', 'Computer science', 'Informatique', 68, 3, 'cod'],
    ['eng', 'Engineering', 'Ingénierie', 70, 3, 's'],
    ['phy', 'Physics', 'Physique', 76, 3, 's'],
    ['bus', 'Business', 'Commerce', 58, 3, 's'],
    ['edu', 'Education', 'Sciences de l’éducation', 50, 3, 's'],
    ['nur', 'Nursing', 'Soins infirmiers', 55, 3, 's'],
    ['bio', 'Biology', 'Biologie', 64, 3, 's'],
    ['psy', 'Psychology', 'Psychologie', 60, 3, 's'],
    ['arc', 'Architecture', 'Architecture', 70, 4, 'art'],
    ['art', 'Art and design', 'Arts et design', 45, 3, 'art'],
    ['mus', 'Music', 'Musique', 45, 3, 'mus'],
    ['jou', 'Journalism', 'Journalisme', 55, 3, 'wri'],
    ['spo', 'Sports science', 'Sciences du sport', 45, 3, 'a'],
    ['lan', 'Languages', 'Langues', 52, 3, 'lan']
  ];
  const OL_GRAD = [
    ['mds', 'Medical school', 'École de médecine', 4, ['med'], 0],
    ['lws', 'Law school', 'École d’avocats', 2, ['law'], 0],
    ['vet', 'Veterinary school', 'École vétérinaire', 4, ['bio', 'med'], 70],
    ['den', 'Dental school', 'École dentaire', 4, ['bio', 'med'], 72],
    ['phd', 'Doctorate (PhD)', 'Doctorat', 4, null, 82],
    ['msc', 'Master’s degree', 'Master', 2, null, 60]
  ];

  const OL_JOB = [
    ['babysit', 'p', 14, 0, 0, null, [['Babysitter', 'Baby-sitter', 2400]]],
    ['dogwalk', 'p', 13, 0, 0, null, [['Dog walker', 'Promeneur de chiens', 2000]]],
    ['paper', 'p', 13, 0, 0, null, [['Newspaper delivery', 'Livreur de journaux', 1800]]],
    ['cashp', 'p', 16, 0, 0, null, [['Part-time cashier', 'Caissier à temps partiel', 6200]]],
    ['lifeg', 'p', 16, 0, 0, { H: 60, a: 40 }, [['Lifeguard', 'Maître-nageur sauveteur', 5600]]],
    ['tutor', 'p', 16, 0, 0, { s: 72 }, [['Tutor', 'Professeur particulier', 4800]]],
    ['cafep', 'p', 16, 0, 0, null, [['Café server', 'Serveur en café', 5200]]],
    ['libp', 'p', 15, 0, 0, null, [['Library assistant', 'Aide-bibliothécaire', 4200]]],
    ['retail', 'f', 18, 0, 0, null, [['Shop assistant', 'Vendeur', 21500], ['Senior shop assistant', 'Vendeur senior', 25500], ['Store manager', 'Directeur de magasin', 38000], ['Regional manager', 'Directeur régional', 56000]]],
    ['cook', 'f', 18, 0, 0, null, [['Kitchen porter', 'Plongeur', 19500], ['Line cook', 'Commis de cuisine', 25500], ['Sous-chef', 'Second de cuisine', 35000], ['Head chef', 'Chef de cuisine', 58000]], 'coo'],
    ['wareh', 'f', 18, 0, 0, null, [['Warehouse worker', 'Préparateur de commandes', 23500], ['Team leader', 'Chef d’équipe', 30500], ['Logistics manager', 'Responsable logistique', 46000]]],
    ['driver', 'f', 18, 0, 0, { lic: 1 }, [['Delivery driver', 'Chauffeur-livreur', 24500], ['Bus driver', 'Conducteur de bus', 29000], ['Fleet manager', 'Responsable de flotte', 42000]]],
    ['build', 'f', 18, 0, 0, { H: 50 }, [['Construction worker', 'Ouvrier du bâtiment', 27000], ['Site foreman', 'Chef de chantier', 38500], ['Construction manager', 'Conducteur de travaux', 61000]]],
    ['hair', 'f', 17, 0, 0, null, [['Trainee hairdresser', 'Apprenti coiffeur', 16500], ['Hairdresser', 'Coiffeur', 24500], ['Salon owner', 'Propriétaire de salon', 46000]], 'art'],
    ['farm', 'f', 17, 0, 0, { H: 45 }, [['Farmhand', 'Ouvrier agricole', 20500], ['Farmer', 'Agriculteur', 28000], ['Farm manager', 'Exploitant agricole', 41000]]],
    ['police', 'f', 18, 1, 0, { H: 60, s: 45 }, [['Police officer', 'Agent de police', 31500], ['Sergeant', 'Brigadier', 41000], ['Inspector', 'Inspecteur', 55000], ['Chief inspector', 'Commissaire', 76000]]],
    ['fire', 'f', 18, 1, 0, { H: 65, a: 45 }, [['Firefighter', 'Pompier', 30500], ['Crew commander', 'Chef d’agrès', 40500], ['Station commander', 'Chef de centre', 58000]]],
    ['mech', 'f', 17, 0, 0, null, [['Apprentice mechanic', 'Apprenti mécanicien', 17500], ['Mechanic', 'Mécanicien', 30000], ['Garage owner', 'Propriétaire de garage', 52000]]],
    ['elec', 'f', 17, 1, 0, null, [['Apprentice electrician', 'Apprenti électricien', 18500], ['Electrician', 'Électricien', 36000], ['Master electrician', 'Maître électricien', 55000]]],
    ['post', 'f', 18, 0, 0, null, [['Postal worker', 'Facteur', 25000], ['Postal supervisor', 'Chef d’équipe postale', 33500]]],
    ['care', 'f', 18, 0, 0, null, [['Care assistant', 'Aide-soignant', 22000], ['Senior carer', 'Aide-soignant principal', 27500]]],
    ['clean', 'f', 18, 0, 0, null, [['Cleaner', 'Agent d’entretien', 19000], ['Cleaning supervisor', 'Chef d’équipe propreté', 25500]]],
    ['secur', 'f', 18, 0, 0, { H: 45 }, [['Security guard', 'Agent de sécurité', 23000], ['Security supervisor', 'Responsable sécurité', 31000]]],
    ['call', 'f', 18, 0, 0, null, [['Call centre agent', 'Téléconseiller', 21000], ['Call centre team leader', 'Superviseur de centre d’appels', 28500]]],
    ['barista', 'f', 18, 0, 0, null, [['Barista', 'Barista', 19500], ['Café manager', 'Gérant de café', 29500]]],
    ['teach', 'f', 22, 2, ['edu', 'lan', 'mus', 'art', 'spo', 'bio', 'phy'], null, [['Teacher', 'Professeur', 34000], ['Senior teacher', 'Professeur principal', 42000], ['Deputy head teacher', 'Directeur adjoint', 55000], ['Head teacher', 'Chef d’établissement', 70000]]],
    ['nurse', 'f', 21, 2, ['nur'], null, [['Nurse', 'Infirmier', 33000], ['Senior nurse', 'Infirmier principal', 41000], ['Head nurse', 'Cadre de santé', 52000]]],
    ['dev', 'f', 21, 2, ['cs'], null, [['Junior developer', 'Développeur junior', 42000], ['Software developer', 'Développeur', 58000], ['Senior developer', 'Développeur senior', 80000], ['Lead engineer', 'Ingénieur principal', 105000], ['Chief technology officer', 'Directeur technique', 160000]]],
    ['engin', 'f', 21, 2, ['eng', 'phy'], null, [['Graduate engineer', 'Ingénieur débutant', 40000], ['Engineer', 'Ingénieur', 55000], ['Senior engineer', 'Ingénieur senior', 76000], ['Chief engineer', 'Ingénieur en chef', 110000]]],
    ['acct', 'f', 21, 2, ['bus'], null, [['Junior accountant', 'Comptable junior', 36000], ['Accountant', 'Comptable', 48000], ['Finance manager', 'Responsable financier', 70000], ['Finance director', 'Directeur financier', 120000]]],
    ['mkt', 'f', 21, 2, true, null, [['Marketing assistant', 'Assistant marketing', 30000], ['Marketing manager', 'Responsable marketing', 52000], ['Marketing director', 'Directeur marketing', 95000]]],
    ['journ', 'f', 21, 2, ['jou', 'lan'], null, [['Junior reporter', 'Journaliste stagiaire', 28000], ['Journalist', 'Journaliste', 38000], ['Editor', 'Rédacteur en chef adjoint', 55000], ['Editor-in-chief', 'Rédacteur en chef', 90000]], 'wri'],
    ['archi', 'f', 22, 2, ['arc'], null, [['Junior architect', 'Architecte junior', 35000], ['Architect', 'Architecte', 55000], ['Senior partner architect', 'Architecte associé', 110000]]],
    ['psych', 'f', 21, 2, ['psy'], null, [['Assistant psychologist', 'Psychologue assistant', 30000], ['Psychologist', 'Psychologue', 50000], ['Clinical lead', 'Psychologue responsable', 72000]]],
    ['lab', 'f', 21, 2, ['bio', 'phy', 'med'], null, [['Lab technician', 'Technicien de laboratoire', 29000], ['Research scientist', 'Chercheur', 45000], ['Lead scientist', 'Directeur de recherche', 78000]]],
    ['design', 'f', 21, 2, ['art', 'arc'], null, [['Junior designer', 'Graphiste junior', 26000], ['Graphic designer', 'Graphiste', 38000], ['Art director', 'Directeur artistique', 72000]], 'art'],
    ['physio', 'f', 21, 2, ['spo', 'nur'], null, [['Physiotherapist', 'Kinésithérapeute', 34000], ['Senior physiotherapist', 'Kinésithérapeute senior', 50000]]],
    ['coach', 'f', 21, 2, ['spo'], { a: 55 }, [['Assistant coach', 'Entraîneur adjoint', 25000], ['Head coach', 'Entraîneur principal', 60000]]],
    ['civil', 'f', 21, 2, true, null, [['Civil servant', 'Fonctionnaire', 28000], ['Senior civil servant', 'Haut fonctionnaire', 42000], ['Head of department', 'Directeur de service', 75000]]],
    ['bank', 'f', 21, 2, ['bus', 'phy', 'eng', 'cs'], { s: 70 }, [['Bank analyst', 'Analyste bancaire', 45000], ['Investment banker', 'Banquier d’affaires', 95000], ['Bank director', 'Directeur de banque', 200000]]],
    ['interp', 'f', 21, 2, ['lan'], { lan: 60 }, [['Translator', 'Traducteur', 31000], ['Conference interpreter', 'Interprète de conférence', 52000]], 'lan'],
    ['pilot', 'f', 21, 1, 0, { H: 70, s: 70 }, [['Trainee pilot', 'Élève pilote', 32000], ['First officer', 'Copilote', 70000], ['Airline captain', 'Commandant de bord', 140000]]],
    ['doctor', 'f', 25, 3, ['mds'], null, [['Junior doctor', 'Interne', 45000], ['Doctor', 'Médecin', 80000], ['Consultant surgeon', 'Chirurgien', 150000], ['Chief of medicine', 'Chef de service', 220000]]],
    ['lawyer', 'f', 23, 3, ['lws'], null, [['Trainee lawyer', 'Avocat stagiaire', 40000], ['Lawyer', 'Avocat', 75000], ['Senior partner', 'Associé principal', 160000], ['Judge', 'Juge', 180000]]],
    ['vetj', 'f', 25, 3, ['vet'], null, [['Vet', 'Vétérinaire', 40000], ['Senior vet', 'Vétérinaire senior', 60000], ['Clinic owner', 'Propriétaire de clinique', 95000]]],
    ['dent', 'f', 25, 3, ['den'], null, [['Dentist', 'Dentiste', 55000], ['Senior dentist', 'Dentiste senior', 85000], ['Practice owner', 'Propriétaire de cabinet', 140000]]],
    ['prof', 'f', 25, 3, ['phd'], null, [['Lecturer', 'Maître de conférences', 40000], ['Senior lecturer', 'Maître de conférences HDR', 55000], ['Professor', 'Professeur d’université', 85000]]],
    ['astro', 'f', 27, 3, ['phd'], { H: 80, s: 88 }, [['Astronaut candidate', 'Candidat astronaute', 70000], ['Astronaut', 'Astronaute', 120000]]],
    ['music', 't', 16, 0, 0, { mus: 65 }, [['Street musician', 'Musicien de rue', 6000], ['Session musician', 'Musicien de studio', 25000], ['Recording artist', 'Artiste signé', 70000], ['Music star', 'Star de la musique', 420000]], 'mus'],
    ['actor', 't', 16, 0, 0, { act: 60, l: 45 }, [['Film extra', 'Figurant', 8000], ['Stage actor', 'Comédien de théâtre', 24000], ['TV actor', 'Acteur de télévision', 80000], ['Film star', 'Star de cinéma', 600000]], 'act'],
    ['athl', 't', 17, 0, 0, { a: 78, H: 70 }, [['Semi-professional athlete', 'Athlète semi-professionnel', 15000], ['Professional athlete', 'Athlète professionnel', 90000], ['National team star', 'Star de l’équipe nationale', 500000]], 'a'],
    ['writer', 't', 18, 0, 0, { wri: 60 }, [['Freelance writer', 'Rédacteur indépendant', 12000], ['Published author', 'Auteur publié', 35000], ['Bestselling author', 'Auteur à succès', 250000]], 'wri'],
    ['creator', 't', 16, 0, 0, { art: 45, l: 40 }, [['Video creator', 'Créateur de vidéos', 3000], ['Popular creator', 'Créateur populaire', 40000], ['Online star', 'Star du web', 300000]], 'art'],
    ['artist', 't', 18, 0, 0, { art: 70 }, [['Painter', 'Peintre', 9000], ['Exhibited artist', 'Artiste exposé', 32000], ['Famous artist', 'Artiste célèbre', 210000]], 'art']
  ];
  const OL_FAME_JOBS = ['music', 'actor', 'athl', 'writer', 'creator', 'artist'];

  const OL_ACT = [
    ['play', 3, 11, 0, 'play', ['Play outside', 'Jouer dehors']],
    ['read', 5, 120, 0, 'book', ['Read a book', 'Lire un livre']],
    ['games', 7, 120, 0, 'pad', ['Play video games', 'Jouer aux jeux vidéo']],
    ['library', 8, 120, 0, 'lib', ['Go to the library', 'Aller à la bibliothèque']],
    ['run', 9, 90, 0, 'run', ['Go for a run', 'Aller courir']],
    ['gym', 14, 100, 350, 'gym', ['Go to the gym', 'Aller à la salle de sport']],
    ['meditate', 10, 120, 0, 'lotus', ['Meditate', 'Méditer']],
    ['doctor', 0, 120, 60, 'doc', ['See a doctor', 'Voir un médecin']],
    ['music', 6, 100, 400, 'note', ['Music lessons', 'Cours de musique']],
    ['art', 5, 110, 250, 'brush', ['Art class', 'Cours de dessin']],
    ['code', 9, 90, 200, 'code', ['Coding club', 'Club de programmation']],
    ['lang', 9, 100, 300, 'globe', ['Learn a language', 'Apprendre une langue']],
    ['cook', 11, 110, 200, 'chef', ['Cooking class', 'Cours de cuisine']],
    ['drama', 7, 90, 200, 'mask', ['Drama class', 'Cours de théâtre']],
    ['write', 10, 120, 0, 'pen', ['Write stories', 'Écrire des histoires']],
    ['sport', 6, 50, 250, 'ball', ['Sports club', 'Club de sport']],
    ['volunteer', 12, 110, 0, 'hands', ['Volunteer', 'Faire du bénévolat']],
    ['hair', 10, 120, 45, 'scissors', ['Get a new haircut', 'Changer de coiffure']],
    ['holiday', 18, 110, 1500, 'plane', ['Go on holiday', 'Partir en vacances']],
    ['spa', 18, 120, 150, 'spa', ['Spa day', 'Journée au spa']],
    ['drive', 17, 90, 600, 'car', ['Take the driving test', 'Passer le permis de conduire']],
    ['talent', 9, 60, 0, 'mic', ['Enter a talent show', 'Participer à un concours de talents']],
    ['garden', 30, 120, 0, 'leaf', ['Do some gardening', 'Jardiner']],
    ['shelter', 18, 100, 150, 'paw', ['Adopt a pet', 'Adopter un animal']]
  ];

  const OL_ILL = [
    ['cold', ['a cold', 'un rhume'], 0, 200, 0.1, 2, 0, 1, 1, 0],
    ['flu', ['the flu', 'la grippe'], 0, 200, 0.05, 5, 2, 0.85, 0.95, 0],
    ['pox', ['chickenpox', 'la varicelle'], 2, 10, 0.06, 3, 2, 1, 1, 0],
    ['ear', ['an ear infection', 'une otite'], 0, 9, 0.05, 2, 1, 0.7, 0.98, 0],
    ['allergy', ['hay fever', 'le rhume des foins'], 4, 60, 0.008, 0, 1, 0.05, 0, 1],
    ['asthma', ['asthma', 'de l’asthme'], 2, 40, 0.005, 1, 1, 0.08, 0, 1],
    ['migraine', ['migraines', 'des migraines'], 14, 70, 0.015, 1, 3, 0.25, 0.6, 0],
    ['back', ['back pain', 'des douleurs au dos'], 28, 200, 0.03, 2, 2, 0.3, 0.7, 0],
    ['bp', ['high blood pressure', 'de l’hypertension'], 40, 200, 0.02, 1.5, 0, 0.02, 0, 1],
    ['diab', ['diabetes', 'du diabète'], 45, 200, 0.01, 2, 1, 0, 0, 1],
    ['arth', ['arthritis', 'de l’arthrose'], 55, 200, 0.025, 1, 2, 0, 0, 1],
    ['heart', ['heart disease', 'une maladie cardiaque'], 55, 200, 0.012, 3, 2, 0, 0, 1],
    ['cat', ['cataracts', 'la cataracte'], 60, 200, 0.03, 1, 1, 0, 0.95, 0],
    ['hear', ['hearing loss', 'une perte d’audition'], 65, 200, 0.04, 0, 2, 0, 0, 1],
    ['memory', ['memory problems', 'des troubles de la mémoire'], 75, 200, 0.02, 1, 2, 0, 0, 1],
    ['pneu', ['pneumonia', 'une pneumonie'], 65, 200, 0.03, 10, 3, 0.5, 0.9, 0],
    ['serious', ['a serious illness', 'une maladie grave'], 35, 200, 0.004, 14, 5, 0.05, 0.6, 0],
    ['arm', ['a broken arm', 'un bras cassé'], 0, 0, 0, 5, 2, 0.6, 1, 0],
    ['ankle', ['a sprained ankle', 'une entorse à la cheville'], 0, 0, 0, 3, 1, 0.8, 1, 0],
    ['hip', ['a broken hip', 'une fracture de la hanche'], 0, 0, 0, 9, 3, 0.4, 0.9, 0]
  ];

  const OL_HOUSE = [
    ['studio', ['Studio flat', 'Studio'], 85000, 'flat'],
    ['flat2', ['Two-bedroom flat', 'Appartement deux chambres'], 165000, 'flat'],
    ['terrace', ['Terraced house', 'Maison mitoyenne'], 230000, 'house'],
    ['cottage', ['Country cottage', 'Maison de campagne'], 260000, 'cottage'],
    ['family', ['Family house with a garden', 'Maison familiale avec jardin'], 340000, 'house'],
    ['loft', ['City loft', 'Loft en centre-ville'], 480000, 'flat'],
    ['seaside', ['Seaside villa', 'Villa en bord de mer'], 950000, 'villa'],
    ['pent', ['Penthouse with a view', 'Penthouse avec vue'], 1700000, 'flat']
  ];
  const OL_CAR = [
    ['bike', ['Bicycle', 'Vélo'], 450, 'bike', 0],
    ['scooter', ['Electric scooter', 'Scooter électrique'], 1900, 'scooter', 0],
    ['used', ['Used hatchback', 'Citadine d’occasion'], 4500, 'car', 1],
    ['city', ['New city car', 'Petite voiture neuve'], 17000, 'car', 1],
    ['estate', ['Family estate car', 'Break familial'], 29000, 'car', 1],
    ['ev', ['Electric saloon', 'Berline électrique'], 42000, 'car', 1],
    ['van', ['Camper van', 'Van aménagé'], 48000, 'van', 1],
    ['classic', ['Restored classic car', 'Voiture de collection'], 65000, 'car', 1],
    ['sport', ['Sports car', 'Voiture de sport'], 98000, 'car', 1]
  ];
  const OL_PET = [
    ['dog', ['dog', 'chien'], 11, 16, 300],
    ['cat', ['cat', 'chat'], 13, 19, 150],
    ['rabbit', ['rabbit', 'lapin'], 7, 11, 80],
    ['hamster', ['hamster', 'hamster'], 2, 3, 30],
    ['parrot', ['parrot', 'perroquet'], 30, 55, 600],
    ['fish', ['goldfish', 'poisson rouge'], 5, 12, 20],
    ['tortoise', ['tortoise', 'tortue'], 50, 90, 200],
    ['guinea', ['guinea pig', 'cochon d’Inde'], 5, 8, 50]
  ];
  const OL_PETN = ['Biscuit', 'Pepper', 'Luna', 'Milo', 'Coco', 'Noisette', 'Oreo', 'Ziggy', 'Pixel', 'Caramel', 'Nugget', 'Mochi', 'Rocket', 'Pistache', 'Bubbles', 'Tofu', 'Sushi', 'Waffles', 'Gizmo', 'Clémentine', 'Kiwi', 'Bandit', 'Olive', 'Tiger'];

  const OL_AW = [
    ['century', ['Centenarian', 'Centenaire'], ['Lived to 100 or more.', 'A vécu jusqu’à 100 ans ou plus.'], '#c9a227'],
    ['tycoon', ['Tycoon', 'Magnat'], ['Left a fortune of 10 million or more.', 'A laissé une fortune de 10 millions ou plus.'], '#2e9e5b'],
    ['genius', ['Genius', 'Génie'], ['Earned a doctorate-level degree with brilliant smarts.', 'A obtenu un diplôme de haut niveau avec une intelligence brillante.'], '#3d6fd8'],
    ['star', ['Superstar', 'Superstar'], ['Became truly famous.', 'Est devenu vraiment célèbre.'], '#e0469a'],
    ['healer', ['Healer', 'Soignant'], ['Cared for patients for 15 years or more.', 'A soigné des patients pendant 15 ans ou plus.'], '#e5533d'],
    ['mentor', ['Mentor', 'Mentor'], ['Taught for 15 years or more.', 'A enseigné pendant 15 ans ou plus.'], '#8a5ad6'],
    ['clan', ['Big family', 'Grande famille'], ['Raised four children or more.', 'A élevé quatre enfants ou plus.'], '#f08a24'],
    ['kind', ['Kind heart', 'Cœur d’or'], ['Was kind to everyone, all life long.', 'A été gentil avec tout le monde, toute sa vie.'], '#ef6f8e'],
    ['athlete', ['Athlete', 'Athlète'], ['Reached the top in sport.', 'A atteint le sommet dans le sport.'], '#1aa3a3'],
    ['artist', ['Virtuoso', 'Virtuose'], ['Mastered an art.', 'A maîtrisé un art.'], '#b04fd0'],
    ['globe', ['Globetrotter', 'Globe-trotteur'], ['Went on 12 holidays or more.', 'Est parti en vacances 12 fois ou plus.'], '#2b8fd6'],
    ['rich', ['Wealthy', 'Fortuné'], ['Left a fortune of 2 million or more.', 'A laissé une fortune de 2 millions ou plus.'], '#4caf50'],
    ['scholar', ['Scholar', 'Érudit'], ['Graduated from university with high smarts.', 'Diplômé de l’université avec une grande intelligence.'], '#4f7bd9'],
    ['boss', ['Top of the ladder', 'Au sommet'], ['Reached the highest rank of a career.', 'A atteint le plus haut poste d’une carrière.'], '#6d5bd0'],
    ['love', ['Soulmates', 'Âmes sœurs'], ['Stayed married for 40 years or more.', 'Est resté marié 40 ans ou plus.'], '#e4405f'],
    ['happy', ['Sunny', 'Rayonnant'], ['Stayed happy for most of life.', 'Est resté heureux presque toute sa vie.'], '#f2b531'],
    ['healthy', ['Fit for life', 'En pleine forme'], ['Lived past 85 in great health.', 'A dépassé 85 ans en excellente santé.'], '#33b679'],
    ['book', ['Bookworm', 'Rat de bibliothèque'], ['Read and studied in libraries 40 times or more.', 'A lu et étudié en bibliothèque 40 fois ou plus.'], '#a0703c'],
    ['social', ['Social butterfly', 'Papillon social'], ['Had six or more close friends.', 'A eu six amis proches ou plus.'], '#f06fb0'],
    ['jack', ['Jack of all trades', 'Touche-à-tout'], ['Worked in six or more different jobs.', 'A travaillé dans six métiers différents ou plus.'], '#8c8c3a'],
    ['animal', ['Animal friend', 'Ami des bêtes'], ['Cared for four or more pets.', 'S’est occupé de quatre animaux ou plus.'], '#c98a3a'],
    ['brief', ['Gone too soon', 'Parti trop tôt'], ['Life ended before 30.', 'Une vie terminée avant 30 ans.'], '#7f8aa3'],
    ['ordinary', ['A quiet life', 'Une vie paisible'], ['An ordinary, honest life.', 'Une vie ordinaire et honnête.'], '#9aa3b2']
  ];

  const OL_EV = [
    ['firstword', 1, 2, 9, null, null, ['You are about to say your very first word. Which one will it be?', 'Tu vas dire ton tout premier mot. Lequel sera-ce ?'], [
      [['“Mama”', '« Maman »'], [[1, 'h+2 B+3', ['My first word was “mama”. My mother cried with joy.', 'Mon premier mot a été « maman ». Ma mère en a pleuré de joie.']]]],
      [['“Papa”', '« Papa »'], [[1, 'h+2 B+3', ['My first word was “papa”. My father told the whole street.', 'Mon premier mot a été « papa ». Mon père l’a raconté à toute la rue.']]]],
      [['“Biscuit”', '« Gâteau »'], [[1, 'h+4', ['My first word was “biscuit”. I was rewarded with a biscuit.', 'Mon premier mot a été « gâteau ». On m’a récompensé{e} avec un gâteau.']]]],
      [['“Dinosaur”', '« Dinosaure »'], [[1, 's+3 h+2', ['My first word was “dinosaur”. Nobody knows where I learned it.', 'Mon premier mot a été « dinosaure ». Personne ne sait où je l’ai appris.']]]]
    ]],
    ['crayon', 2, 4, 8, null, null, ['You found a box of crayons next to a very clean, very white wall.', 'Tu as trouvé une boîte de crayons à côté d’un mur très propre et très blanc.'], [
      [['Draw a masterpiece on the wall', 'Dessiner un chef-d’œuvre sur le mur'], [[3, 'xart+3 B-3', ['I drew a giant purple cat on the living room wall. My parents were not impressed.', 'J’ai dessiné un énorme chat violet sur le mur du salon. Mes parents n’ont pas apprécié.']], [2, 'xart+3 h+4', ['I drew a sunset on the wall. My parents laughed and took a photo before scrubbing it off.', 'J’ai dessiné un coucher de soleil sur le mur. Mes parents ont ri et l’ont pris en photo avant de l’effacer.']]]],
      [['Find some paper first', 'Chercher d’abord du papier'], [[1, 'xart+2 k+2 B+2', ['I drew on paper like a very sensible toddler. The drawing went on the fridge.', 'J’ai dessiné sur du papier, comme un enfant très sage. Le dessin a fini sur le frigo.']]]],
      [['Taste a crayon', 'Goûter un crayon'], [[1, 'h+1', ['I ate a blue crayon. It tasted exactly like blue.', 'J’ai mangé un crayon bleu. Il avait exactement le goût du bleu.']]]]
    ]],
    ['bath', 1, 4, 6, 'par', null, ['It’s bath time, and you have strong opinions about it.', 'C’est l’heure du bain, et tu as un avis très tranché sur la question.'], [
      [['Splash everything', 'Éclabousser partout'], [[1, 'h+4 b-2', ['I turned bath time into a water park. The bathroom floor never recovered.', 'J’ai transformé le bain en parc aquatique. Le sol de la salle de bains ne s’en est jamais remis.']]]],
      [['Sit nicely with the rubber duck', 'Rester sage avec le canard en plastique'], [[1, 'b+4 H+1', ['I had a calm bath with my rubber duck. {Myrel} {p} could not believe it.', 'J’ai pris un bain calme avec mon canard. {Myrel} {p} n’en revenait pas.']]]],
      [['Hide under the bed', 'Se cacher sous le lit'], [[1, 'h+2 b-1', ['I hid under the bed for twenty minutes. They found me because I was giggling.', 'Je me suis caché{e} sous le lit pendant vingt minutes. On m’a trouvé{e} parce que je riais.']]]]
    ]],
    ['broccoli', 2, 6, 7, 'par', null, ['Broccoli is on your plate again.', 'Il y a encore du brocoli dans ton assiette.'], [
      [['Eat it all', 'Tout manger'], [[1, 'H+3 b+3', ['I ate all my broccoli and announced that I was now a tree.', 'J’ai mangé tout mon brocoli et j’ai annoncé que j’étais devenu{e} un arbre.']]]],
      [['Hide it under the plate', 'Le cacher sous l’assiette'], [[1, 'h+2 b-2', ['I hid my broccoli under the plate. It was found the next morning.', 'J’ai caché mon brocoli sous l’assiette. Il a été retrouvé le lendemain matin.']]]],
      [['Throw a tantrum', 'Piquer une colère'], [[1, 'h-2 b-4', ['I screamed at the broccoli for ten minutes. The broccoli won.', 'J’ai crié sur le brocoli pendant dix minutes. Le brocoli a gagné.']]]]
    ]],
    ['zoo', 3, 7, 6, 'par', null, ['{Yrel} {p} takes you to the zoo. Which animals do you visit first?', '{Yrel} {p} t’emmène au zoo. Quels animaux vas-tu voir en premier ?'], [
      [['The lions', 'Les lions'], [[1, 'h+4 b+3', ['We watched the lions nap in the sun. I roared at them all the way home.', 'On a regardé les lions faire la sieste au soleil. J’ai rugi tout le long du retour.']]]],
      [['The penguins', 'Les manchots'], [[1, 'h+4 b+3', ['I watched the penguins waddle and copied them for a week.', 'J’ai regardé les manchots se dandiner et je les ai imités pendant une semaine.']]]],
      [['The reptile house', 'Le vivarium'], [[1, 's+3 b+2', ['I learned that some lizards can run on water. I told everyone.', 'J’ai appris que certains lézards peuvent courir sur l’eau. Je l’ai raconté à tout le monde.']]]]
    ]],
    ['share', 3, 6, 6, 'X', null, ['At nursery, {p} wants to play with your favourite toy.', 'À la crèche, {p} veut jouer avec ton jouet préféré.'], [
      [['Share it', 'Le prêter'], [[2, 'k+3 h+2 F', ['I shared my toy with {p}. We became friends on the spot.', 'J’ai prêté mon jouet à {p}. On est devenus amis sur-le-champ.']], [1, 'k+3', ['I shared my toy with {p}, who broke it a little. I forgave {him}.', 'J’ai prêté mon jouet à {p}, qui l’a un peu cassé. Je l’ai pardonné{pe}.']]]],
      [['Keep it', 'Le garder'], [[1, 'k-2 h+1', ['I kept my toy and hugged it very tightly.', 'J’ai gardé mon jouet en le serrant très fort.']]]],
      [['Swap toys', 'Échanger les jouets'], [[1, 's+2 k+1 F', ['I offered {p} a swap. It was my first business deal.', 'J’ai proposé un échange à {p}. C’était ma première négociation.']]]]
    ]],
    ['tooth', 5, 8, 8, null, null, ['Your first baby tooth just fell out!', 'Ta première dent de lait vient de tomber !'], [
      [['Put it under the pillow', 'La mettre sous l’oreiller'], [[1, 'h+4 m+2', ['I put my tooth under my pillow and woke up with a shiny coin.', 'J’ai mis ma dent sous l’oreiller et je me suis réveillé{e} avec une pièce toute brillante.']]]],
      [['Show it to the whole class', 'La montrer à toute la classe'], [[1, 'h+3 f+1', ['I showed my tooth to the whole class. I was famous until lunchtime.', 'J’ai montré ma dent à toute la classe. J’ai été célèbre jusqu’à midi.']]]],
      [['Keep it in a tiny box', 'La garder dans une petite boîte'], [[1, 'h+1', ['I keep my tooth in a tiny box. Nobody else finds it as interesting as I do.', 'Je garde ma dent dans une petite boîte. Personne ne la trouve aussi intéressante que moi.']]]]
    ]],
    ['homework', 8, 17, 6, 'X', 'school', ['{p}, a classmate, asks to copy your homework.', '{p}, {un} camarade de classe, veut copier tes devoirs.'], [
      [['Let {him} copy it', '{Lp} laisser copier'], [[2, 'k-2 F', ['I let {p} copy my homework. We are sort of friends now.', 'J’ai laissé {p} copier mes devoirs. On est un peu amis maintenant.']], [1, 'k-3 p-8 h-3', ['I let {p} copy my homework. The teacher noticed the identical mistakes.', 'J’ai laissé {p} copier mes devoirs. Le professeur a remarqué les mêmes fautes.']]]],
      [['Say no', 'Refuser'], [[1, 'k+1', ['I told {p} to do {his} own homework.', 'J’ai dit à {p} de faire ses devoirs tout{pe} seul{pe}.']]]],
      [['Offer to explain it', 'Proposer de lui expliquer'], [[2, 'k+4 s+2 F', ['I explained the homework to {p}. {He} finally understood fractions.', 'J’ai expliqué les devoirs à {p}. {Il} a enfin compris les fractions.']], [1, 'k+3 s+1', ['I tried to explain the homework to {p}, who fell asleep.', 'J’ai essayé d’expliquer les devoirs à {p}, qui s’est endormi{pe}.']]]]
    ]],
    ['bully', 6, 15, 6, 'X', 'school', ['{p} keeps making fun of you at school.', '{p} n’arrête pas de se moquer de toi à l’école.'], [
      [['Tell a teacher', 'Le dire à un professeur'], [[3, 'h+3', ['I told a teacher about {p}. The teasing stopped.', 'J’ai parlé de {p} à un professeur. Les moqueries ont cessé.']], [1, 'h-3', ['I told a teacher, but {p} carried on when nobody was looking.', 'Je l’ai dit à un professeur, mais {p} a continué quand personne ne regardait.']]]],
      [['Stand up for yourself calmly', 'Lui tenir tête calmement'], [[s => 30 + s.me.st.s / 2, 'h+5 k+1', ['I calmly told {p} to stop. {He} looked surprised and left me alone.', 'J’ai dit calmement à {p} d’arrêter. {Il} a eu l’air surpris{pe} et m’a laissé{e} tranquille.']], [40, 'h-2', ['I stood up to {p}, but {he} just laughed. It still felt good to try.', 'J’ai tenu tête à {p}, mais {il} a juste ri. C’était quand même bien d’essayer.']]]],
      [['Ignore it', 'Ignorer'], [[1, 'h-3', ['I ignored {p}. It still hurt.', 'J’ai ignoré {p}. Ça m’a quand même fait de la peine.']]]],
      [['Make a joke back', 'Répondre par une blague'], [[1, 'h+5 f+1', ['I made a joke back and the whole class laughed with me, not at me.', 'J’ai répondu par une blague et toute la classe a ri avec moi, pas de moi.']], [1, 'h-3', ['My joke fell flat. {p} enjoyed that a lot.', 'Ma blague est tombée à plat. {p} a adoré.']]]]
    ]],
    ['newkid', 6, 16, 6, 'X', 'school', ['A new student, {p}, is sitting alone at lunch.', '{p}, qui vient d’arriver dans ta classe, mange seul{pe} à la cantine.'], [
      [['Sit with {him}', 'S’asseoir avec {lui}'], [[3, 'k+4 h+2 F', ['I sat with {p} at lunch. We have the same weird taste in music.', 'Je me suis assis{e} avec {p} à la cantine. On a les mêmes goûts bizarres en musique.']], [1, 'k+3', ['I sat with {p}, who barely spoke. At least {he} wasn’t alone.', 'Je me suis assis{e} avec {p}, qui a à peine parlé. Au moins, {il} n’était pas seul{pe}.']]]],
      [['Invite {him} to your group', 'L’inviter dans ton groupe'], [[1, 'k+4 h+3 F', ['I brought {p} over to my friends. {He} fitted right in.', 'J’ai présenté {p} à mes amis. {Il} s’est tout de suite intégré{pe}.']]]],
      [['Stay with your friends', 'Rester avec tes amis'], [[1, 'k-1', ['I stayed with my friends. I kept thinking about the new kid.', 'Je suis resté{e} avec mes amis. J’ai pensé au nouveau toute la journée.']]]]
    ]],
    ['play', 6, 12, 5, null, 'school', ['Your class is putting on a play.', 'Ta classe monte une pièce de théâtre.'], [
      [['Ask for the main role', 'Demander le rôle principal'], [[s => 20 + s.me.sk.act + s.me.st.l / 3, 'xact+6 h+5 f+1', ['I got the main role in the class play and remembered every line.', 'J’ai eu le rôle principal de la pièce et je n’ai oublié aucune réplique.']], [50, 'xact+2 h-1', ['I asked for the main role and was cast as Tree Number Three.', 'J’ai demandé le rôle principal et j’ai joué l’Arbre numéro trois.']]]],
      [['Paint the scenery', 'Peindre les décors'], [[1, 'xart+4 h+2', ['I painted a castle for the play. Parents kept asking who made it.', 'J’ai peint un château pour la pièce. Les parents demandaient tous qui l’avait fait.']]]],
      [['Take a small part', 'Prendre un petit rôle'], [[1, 'xact+2 h+2', ['I had one line in the play and delivered it beautifully.', 'J’avais une seule réplique et je l’ai dite à la perfection.']]]]
    ]],
    ['spelling', 7, 12, 5, null, 'school', ['You’ve been entered into the school spelling contest.', 'Tu participes au concours d’orthographe de l’école.'], [
      [['Practise every evening', 'S’entraîner tous les soirs'], [[s => s.me.st.s, 's+3 h+5 f+1 xwri+2', ['I won the school spelling contest. The winning word was “rhythm”.', 'J’ai gagné le concours d’orthographe. Le mot décisif était « rythme ».']], [40, 's+3 h+1', ['I practised hard and came third in the spelling contest.', 'Je me suis bien entraîné{e} et je suis arrivé{e} troisième au concours d’orthographe.']]]],
      [['Just turn up on the day', 'Y aller sans préparation'], [[1, 'h+1', ['I went to the spelling contest unprepared and was out in round two.', 'Je suis allé{e} au concours sans préparation et j’ai été éliminé{e} au deuxième tour.']], [s => s.me.st.s / 4, 'h+4', ['I didn’t prepare at all and still reached the final.', 'Je ne me suis pas préparé{e} du tout et je suis quand même arrivé{e} en finale.']]]],
      [['Pretend to be ill', 'Faire semblant d’être malade'], [[1, 'k-2 h-1', ['I pretended to be ill on the day of the contest. Nobody believed me.', 'J’ai fait semblant d’être malade le jour du concours. Personne ne m’a cru{e}.']]]]
    ]],
    ['sciencefair', 9, 15, 5, null, 'school', ['The school science fair is next week. What will you build?', 'L’expo-sciences de l’école a lieu la semaine prochaine. Que vas-tu présenter ?'], [
      [['An erupting volcano', 'Un volcan en éruption'], [[1, 's+2 h+3', ['My baking-soda volcano erupted all over the judges. They still gave me a ribbon.', 'Mon volcan au bicarbonate a éclaboussé le jury. J’ai quand même eu un ruban.']]]],
      [['A little robot', 'Un petit robot'], [[s => 10 + s.me.sk.cod, 's+4 xcod+5 h+5 f+1', ['My little robot drew a smiley face on its own. I won first prize!', 'Mon petit robot a dessiné un smiley tout seul. J’ai gagné le premier prix !']], [40, 's+2 xcod+3', ['My robot spun in circles and fell off the table. I learned a lot.', 'Mon robot a tourné en rond puis il est tombé de la table. J’ai beaucoup appris.']]]],
      [['How music affects plants', 'L’effet de la musique sur les plantes'], [[1, 's+4 h+2', ['I proved that my bean plants grew best with classical music. Probably.', 'J’ai prouvé que mes haricots poussaient mieux avec de la musique classique. Probablement.']]]]
    ]],
    ['chores', 6, 13, 6, 'par', null, ['{Yrel} {p} offers you pocket money for doing chores.', '{Yrel} {p} te propose de l’argent de poche contre des corvées.'], [
      [['Do the chores', 'Faire les corvées'], [[1, 'm+25 b+3 k+1', ['I washed the dishes all month and earned my first pocket money.', 'J’ai fait la vaisselle tout le mois et j’ai gagné mon premier argent de poche.']]]],
      [['Negotiate a better deal', 'Négocier un meilleur tarif'], [[s => s.me.st.s, 'm+45 s+2', ['I negotiated like a professional and doubled my pay.', 'J’ai négocié comme un pro et j’ai doublé ma paie.']], [50, 'b-2', ['I tried to negotiate. {Myrel} said the price had just gone down.', 'J’ai essayé de négocier. {Myrel} a dit que le prix venait de baisser.']]]],
      [['Refuse', 'Refuser'], [[1, 'b-3', ['I refused to do chores. My room stayed a disaster zone.', 'J’ai refusé de faire les corvées. Ma chambre est restée une zone sinistrée.']]]]
    ]],
    ['wallet', 9, 90, 5, null, null, ['You found a wallet on the pavement with {amt} inside.', 'Tu as trouvé un portefeuille sur le trottoir avec {amt} dedans.'], [
      [['Find the owner', 'Retrouver le propriétaire'], [[2, 'k+6 h+3', ['I found the owner of the wallet. She hugged me and told her whole family.', 'J’ai retrouvé la propriétaire du portefeuille. Elle m’a serré{e} dans ses bras et l’a raconté à toute sa famille.']], [1, 'k+6 h+3 m+amt', ['I returned the wallet and the owner insisted I keep the cash as a reward.', 'J’ai rendu le portefeuille et le propriétaire a tenu à me laisser l’argent en récompense.']]]],
      [['Take it to the police station', 'L’apporter au commissariat'], [[1, 'k+5 h+1', ['I handed the wallet in at the police station. The officer said thank you.', 'J’ai déposé le portefeuille au commissariat. L’agent m’a remercié{e}.']]]],
      [['Keep the money', 'Garder l’argent'], [[1, 'k-8 m+amt h-1', ['I kept the money from the wallet. It didn’t feel as good as I expected.', 'J’ai gardé l’argent du portefeuille. Ce n’était pas aussi agréable que prévu.']]]]
    ], { amt: [20, 120] }],
    ['sleepover', 8, 14, 6, 'friend', null, ['Your friend {p} invites you to a sleepover.', 'Ton ami{pe} {p} t’invite à une soirée pyjama.'], [
      [['Go', 'Y aller'], [[1, 'h+5 b+7', ['I went to {p}’s sleepover. We stayed up until 2 a.m. telling ghost stories.', 'Je suis allé{e} à la soirée pyjama de {p}. On a raconté des histoires de fantômes jusqu’à 2 h du matin.']]]],
      [['Invite {him} to yours instead', 'L’inviter chez toi plutôt'], [[1, 'h+4 b+6 B+1', ['{p} came to my house instead. We built a blanket fort in the living room.', '{p} est venu{pe} chez moi. On a construit une cabane en couvertures dans le salon.']]]],
      [['Stay home', 'Rester à la maison'], [[1, 'b-3', ['I stayed home. {p} told me all about it on Monday.', 'Je suis resté{e} à la maison. {p} m’a tout raconté lundi.']]]]
    ]],
    ['snowday', 6, 17, 4, null, 'school', ['School is closed because of snow!', 'L’école est fermée à cause de la neige !'], [
      [['Build a snowman', 'Faire un bonhomme de neige'], [[1, 'h+4 xart+1', ['I built a snowman with a carrot nose and my father’s hat.', 'J’ai fait un bonhomme de neige avec un nez en carotte et le chapeau de mon père.']]]],
      [['Snowball fight', 'Bataille de boules de neige'], [[5, 'h+6 a+1', ['I won the great snowball war of the neighbourhood.', 'J’ai gagné la grande bataille de boules de neige du quartier.']], [1, 'h+2 i:cold', ['I had a huge snowball fight and caught a cold.', 'J’ai fait une énorme bataille de boules de neige et j’ai attrapé un rhume.']]]],
      [['Stay in and read', 'Rester lire au chaud'], [[1, 's+3 h+2', ['I spent the snow day reading by the window with hot chocolate.', 'J’ai passé la journée à lire près de la fenêtre avec un chocolat chaud.']]]]
    ], { r: 3 }],
    ['petbeg', 6, 13, 6, 'par', s => !olHasPet(s), ['You really want a pet. Which one will you beg for?', 'Tu veux vraiment un animal. Lequel vas-tu réclamer ?'], [
      [['A dog', 'Un chien'], [[s => 20 + s.pw * 15, 'h+8 pet:dog', ['After weeks of begging, my parents brought home a puppy!', 'Après des semaines de supplications, mes parents ont ramené un chiot !']], [50, 'h-3', ['My parents said a dog was too much work. I sulked for a week.', 'Mes parents ont dit qu’un chien, c’était trop de travail. J’ai boudé une semaine.']]]],
      [['A cat', 'Un chat'], [[s => 30 + s.pw * 15, 'h+7 pet:cat', ['My parents agreed to adopt a kitten from the shelter!', 'Mes parents ont accepté d’adopter un chaton au refuge !']], [40, 'h-2', ['My parents said no to a cat. Maybe next year.', 'Mes parents ont refusé le chat. Peut-être l’année prochaine.']]]],
      [['A hamster', 'Un hamster'], [[3, 'h+5 pet:hamster', ['I got a hamster! It runs on its wheel all night.', 'J’ai eu un hamster ! Il fait tourner sa roue toute la nuit.']], [1, 'h-1', ['My parents said no to the hamster. I named my sock Hammy instead.', 'Mes parents ont refusé le hamster. J’ai appelé ma chaussette Hammy à la place.']]]]
    ]],
    ['bday', 6, 12, 5, 'par', null, ['It’s your birthday! What kind of party do you want?', 'C’est ton anniversaire ! Quel genre de fête veux-tu ?'], [
      [['A pool party', 'Une fête à la piscine'], [[1, 'h+6 F2', ['I had a pool party for my birthday. Everyone came, even the shy kids.', 'J’ai fait une fête à la piscine pour mon anniversaire. Tout le monde est venu, même les timides.']]]],
      [['A games tournament', 'Un tournoi de jeux'], [[1, 'h+5 s+1', ['I organised a games tournament for my birthday and lost every round. Best day ever.', 'J’ai organisé un tournoi de jeux pour mon anniversaire et j’ai perdu toutes les parties. Meilleur jour de ma vie.']]]],
      [['A quiet cake with family', 'Un gâteau en famille'], [[1, 'h+4 B+4', ['I had a small birthday with my family and the biggest chocolate cake I have ever seen.', 'J’ai fêté mon anniversaire en famille avec le plus gros gâteau au chocolat que j’aie jamais vu.']]]]
    ]],
    ['window', 8, 14, 5, null, null, ['Your ball just smashed a neighbour’s window.', 'Ton ballon vient de briser la fenêtre d’un voisin.'], [
      [['Own up', 'Avouer'], [[1, 'k+6 h-1 B+1', ['I knocked on the neighbour’s door and owned up. I paid for the glass with my pocket money.', 'J’ai sonné chez le voisin et j’ai tout avoué. J’ai payé la vitre avec mon argent de poche.']]]],
      [['Run away', 'S’enfuir'], [[3, 'k-5 B-6', ['I ran away, but the neighbour had seen everything. My parents were furious.', 'Je me suis enfui{e}, mais le voisin avait tout vu. Mes parents étaient furieux.']], [1, 'k-4 h-2', ['I ran away and got away with it. I felt guilty for months.', 'Je me suis enfui{e} sans être vu{e}. Je me suis senti{e} coupable pendant des mois.']]]],
      [['Blame a friend', 'Accuser un ami'], [[1, 'k-9 h-2', ['I blamed my friend for the window. That was a terrible idea.', 'J’ai accusé mon ami pour la vitre. C’était une très mauvaise idée.']]]]
    ]],
    ['talentkid', 8, 14, 5, null, 'school', ['The school talent show is coming up. What will you do?', 'Le spectacle de talents de l’école approche. Que vas-tu faire ?'], [
      [['Sing a song', 'Chanter une chanson'], [[s => 10 + s.me.sk.mus, 'h+7 f+2 xmus+3', ['I sang at the talent show and got a standing ovation.', 'J’ai chanté au spectacle de l’école et j’ai eu une ovation debout.']], [50, 'h-2 xmus+2', ['I sang at the talent show. My voice cracked, but I finished the song.', 'J’ai chanté au spectacle. Ma voix a déraillé, mais j’ai fini la chanson.']]]],
      [['Magic tricks', 'Des tours de magie'], [[s => 20 + s.me.st.s / 2, 'h+6 f+1 s+1', ['My magic tricks amazed everyone. I still won’t say how the coin trick works.', 'Mes tours de magie ont épaté tout le monde. Je ne dirai jamais comment marche celui de la pièce.']], [40, 'h-1', ['I dropped the cards in the middle of my magic trick. People clapped anyway.', 'J’ai fait tomber les cartes au milieu de mon tour. Le public a applaudi quand même.']]]],
      [['A dance routine', 'Une chorégraphie'], [[s => 20 + s.me.a / 2, 'h+6 a+2 f+1', ['My dance routine brought the house down.', 'Ma chorégraphie a fait un tabac.']], [40, 'h+1 a+1', ['I danced with all my heart. My heart was a little off the beat.', 'J’ai dansé de tout mon cœur. Mon cœur était un peu à contretemps.']]]],
      [['Stay in the audience', 'Rester dans le public'], [[1, 'h+1', ['I watched the talent show from the audience and cheered for everyone.', 'J’ai regardé le spectacle depuis le public et j’ai applaudi tout le monde.']]]]
    ]],
    ['museum', 7, 15, 4, null, 'school', ['On a school trip to the museum, you lose sight of your class.', 'Pendant une sortie au musée, tu perds ta classe de vue.'], [
      [['Ask a guard for help', 'Demander de l’aide à un gardien'], [[1, 's+1', ['A guard helped me find my class. The teacher looked very relieved.', 'Un gardien m’a aidé{e} à retrouver ma classe. Le professeur avait l’air très soulagé.']]]],
      [['Explore on your own', 'Explorer tout{e} seul{e}'], [[2, 's+4 h+3', ['I explored the dinosaur hall on my own and learned more than anyone else that day.', 'J’ai exploré la salle des dinosaures tout{e} seul{e} et j’ai appris plus que tout le monde ce jour-là.']], [1, 's+2 p-4 h-2', ['I explored the museum alone and got a long lecture from my teacher.', 'J’ai exploré le musée seul{e} et j’ai eu droit à un long sermon du professeur.']]]],
      [['Wait where you are', 'Attendre sur place'], [[1, 'k+1', ['I waited by the exit until my class came back. Very sensible.', 'J’ai attendu près de la sortie que ma classe revienne. Très raisonnable.']]]]
    ]],
    ['newgame', 8, 30, 5, null, null, ['A new video game is out and everyone is talking about it.', 'Un nouveau jeu vidéo vient de sortir et tout le monde en parle.'], [
      [['Play it all weekend', 'Y jouer tout le week-end'], [[1, 'h+6 p-4 H-1', ['I played the new game all weekend and reached the final boss.', 'J’ai joué au nouveau jeu tout le week-end et j’ai atteint le boss final.']]]],
      [['Play a little each day', 'Y jouer un peu chaque jour'], [[1, 'h+4', ['I played the new game a little every day. Perfect balance.', 'J’ai joué un peu chaque jour. L’équilibre parfait.']]]],
      [['Skip it', 'Passer son tour'], [[1, 's+1', ['I skipped the new game and read a book instead.', 'J’ai fait l’impasse sur le jeu et j’ai lu un livre à la place.']]]]
    ], { r: 4 }],
    ['tree', 6, 13, 5, null, null, ['There’s a huge old tree in the park, perfect for climbing.', 'Il y a un grand vieil arbre dans le parc, parfait pour grimper.'], [
      [['Climb to the very top', 'Grimper tout en haut'], [[4, 'h+6 a+3', ['I climbed to the top of the old tree and could see my school from there.', 'J’ai grimpé tout en haut du vieil arbre et j’ai vu mon école de là-haut.']], [1, 'h-3 i:arm', ['I climbed the tree, slipped and broke my arm. Everyone signed my cast.', 'J’ai grimpé à l’arbre, j’ai glissé et je me suis cassé le bras. Tout le monde a signé mon plâtre.']]]],
      [['Climb a few branches', 'Monter sur quelques branches'], [[1, 'h+3 a+1', ['I climbed a few branches and sat there feeling like a bird.', 'Je suis monté{e} sur quelques branches et je me suis senti{e} comme un oiseau.']]]],
      [['Stay on the ground', 'Rester au sol'], [[1, 'h+1', ['I stayed on the ground and collected the best conkers.', 'Je suis resté{e} au sol et j’ai ramassé les plus beaux marrons.']]]]
    ]],
    ['lemonade', 6, 11, 5, null, null, ['You want to set up a lemonade stand. How much will you charge?', 'Tu veux ouvrir un stand de limonade. Quel prix vas-tu demander ?'], [
      [['A fair price', 'Un prix juste'], [[1, 'm+30 s+2 h+3', ['My lemonade stand was a success. I made 30 in one afternoon.', 'Mon stand de limonade a été un succès. J’ai gagné 30 en un après-midi.']]]],
      [['A fortune', 'Une fortune'], [[1, 'm+6 s+1', ['I charged a fortune for my lemonade. Only one very thirsty man bought a glass.', 'J’ai vendu ma limonade hors de prix. Seul un monsieur très assoiffé en a acheté.']]]],
      [['Give it away for free', 'La donner gratuitement'], [[1, 'k+5 h+4', ['I gave away free lemonade all afternoon. The whole street smiled at me.', 'J’ai offert de la limonade tout l’après-midi. Toute la rue m’a souri.']]]]
    ]],
    ['dogwork', 7, 14, 4, 'dog', 'school', ['Your dog {p} has actually eaten your homework.', 'Ton chien {p} a vraiment mangé tes devoirs.'], [
      [['Tell the teacher the truth', 'Dire la vérité au professeur'], [[1, 'h+2 k+1', ['I told my teacher my dog ate my homework. She gave me one more day.', 'J’ai dit à ma professeure que mon chien avait mangé mes devoirs. Elle m’a laissé un jour de plus.']], [1, 'p-3', ['I told the teacher my dog ate my homework. She did not believe a word.', 'J’ai dit au professeur que mon chien avait mangé mes devoirs. Il n’en a pas cru un mot.']]]],
      [['Redo it all tonight', 'Tout refaire ce soir'], [[1, 's+2 p+2 h-1', ['I redid my homework from scratch. It was better the second time.', 'J’ai refait mes devoirs depuis le début. Ils étaient meilleurs la deuxième fois.']]]],
      [['Bring the chewed pages as proof', 'Apporter les pages mâchouillées comme preuve'], [[1, 'h+4 f+1', ['I brought the chewed pages to school as evidence. The class loved it.', 'J’ai apporté les pages mâchouillées comme preuve. La classe a adoré.']]]]
    ]],
    ['phone', 11, 14, 6, 'par', s => !s.me.fl.phone, ['Everyone in your class has a smartphone except you.', 'Tout le monde dans ta classe a un smartphone sauf toi.'], [
      [['Ask your parents for one', 'En demander un à tes parents'], [[s => 20 + s.pw * 20, 'h+5 !phone', ['My parents gave me my first smartphone, with lots of rules attached.', 'Mes parents m’ont offert mon premier smartphone, avec beaucoup de règles.']], [40, 'h-2', ['My parents said I could have a phone when I am older.', 'Mes parents ont dit que j’aurais un téléphone plus tard.']]]],
      [['Save up for one', 'Économiser pour en acheter un'], [[1, 's+1 h+2 !phone', ['I saved my pocket money for a year and bought a second-hand phone myself.', 'J’ai économisé mon argent de poche pendant un an et je me suis acheté un téléphone d’occasion.']]]],
      [['Who needs one anyway?', 'Qui en a besoin, de toute façon ?'], [[1, 's+2 h-1', ['I decided I didn’t need a phone. I read three extra books instead.', 'J’ai décidé que je n’avais pas besoin de téléphone. J’ai lu trois livres de plus.']]]]
    ]],
    ['cheat', 13, 17, 5, 'X', 'school', ['{p} is selling the answers to tomorrow’s test.', '{p} vend les réponses du contrôle de demain.'], [
      [['Buy them', 'Les acheter'], [[3, 'k-6 p+3', ['I bought the answers. I got a good mark, but it didn’t feel like mine.', 'J’ai acheté les réponses. J’ai eu une bonne note, mais elle ne me ressemblait pas.']], [2, 'k-7 p-15 h-5 B-6', ['I bought the answers and got caught. I was suspended for two days.', 'J’ai acheté les réponses et je me suis fait prendre. J’ai été exclu{e} deux jours.']]]],
      [['Report it to a teacher', 'Le signaler à un professeur'], [[1, 'k+5 h-1', ['I reported {p} to a teacher. The test was changed at the last minute.', 'J’ai signalé {p} à un professeur. Le contrôle a été changé à la dernière minute.']]]],
      [['Study instead', 'Réviser plutôt'], [[1, 's+3 p+4', ['I ignored {p} and studied all evening. I passed with a good mark.', 'J’ai ignoré {p} et j’ai révisé toute la soirée. J’ai eu une bonne note.']]]]
    ]],
    ['crush', 13, 17, 6, 'X', s => !olLove(s), ['You have a crush on {p} from your class.', 'Tu as le béguin pour {p}, de ta classe.'], [
      [['Ask {him} out', 'Lui proposer de sortir'], [[s => 25 + s.me.st.l / 2, 'h+8 P', ['I asked {p} out and {he} said yes! We went for ice cream.', 'J’ai proposé à {p} de sortir et {il} a dit oui ! On est allés manger une glace.']], [55, 'h-4', ['I asked {p} out. {He} said {he} just wants to be friends.', 'J’ai proposé à {p} de sortir. {Il} a dit qu’{il} voulait juste qu’on soit amis.']]]],
      [['Write {him} a note', 'Lui écrire un mot'], [[s => 20 + s.me.sk.wri / 2 + s.me.st.l / 3, 'h+7 xwri+2 P', ['I wrote {p} a note. {He} wrote back: “Yes.” With three exclamation marks.', 'J’ai écrit un mot à {p}. {Il} a répondu : « Oui. » Avec trois points d’exclamation.']], [50, 'h-3 xwri+1', ['I wrote {p} a note. The whole class read it before {he} did.', 'J’ai écrit un mot à {p}. Toute la classe l’a lu avant {lui}.']]]],
      [['Keep it a secret', 'Garder le secret'], [[1, 'h-1', ['I kept my crush on {p} a secret. It is safely locked in my diary.', 'J’ai gardé mon béguin pour {p} secret. Il est bien caché dans mon journal.']]]]
    ]],
    ['partyhome', 14, 17, 5, 'X', null, ['{p} invites you to a party while {his} parents are away.', '{p} t’invite à une fête pendant que ses parents sont absents.'], [
      [['Go', 'Y aller'], [[2, 'h+5 F', ['I went to {p}’s party. We danced until the neighbours complained.', 'Je suis allé{e} à la fête de {p}. On a dansé jusqu’à ce que les voisins se plaignent.']], [1, 'h+2 B-5', ['I went to the party without telling my parents. They found out.', 'Je suis allé{e} à la fête sans le dire à mes parents. Ils l’ont découvert.']]]],
      [['Ask your parents first', 'Demander d’abord à tes parents'], [[1, 'B+3 h+3', ['I asked my parents, who said yes as long as I was home by eleven.', 'J’ai demandé à mes parents, qui ont accepté à condition que je rentre avant 23 h.']], [1, 'B+3 h-2', ['I asked my parents and they said no. At least they trust me more now.', 'J’ai demandé à mes parents et ils ont refusé. Au moins, ils me font plus confiance.']]]],
      [['Stay home', 'Rester à la maison'], [[1, 'h-1', ['I stayed home that night and watched a film.', 'Je suis resté{e} à la maison ce soir-là et j’ai regardé un film.']]]]
    ]],
    ['tryout', 11, 17, 6, null, 'school', ['Tryouts for the school {sport} team are this week.', 'Les sélections pour l’équipe de {sport} du lycée ont lieu cette semaine.'], [
      [['Try out', 'Tenter sa chance'], [[s => 10 + s.me.a, 'h+6 a+5 !team', ['I made the school {sport} team!', 'J’ai été sélectionné{e} dans l’équipe de {sport} !']], [50, 'h-3 a+2', ['I didn’t make the {sport} team this year.', 'Je n’ai pas été pris{e} dans l’équipe de {sport} cette année.']]]],
      [['Train hard first', 'S’entraîner d’abord'], [[s => 25 + s.me.a, 'h+6 a+7 H+2 !team', ['I trained every morning for a month and made the {sport} team.', 'Je me suis entraîné{e} tous les matins pendant un mois et j’ai intégré l’équipe de {sport}.']], [40, 'a+4 H+2', ['I trained hard but missed the team by one place.', 'Je me suis bien entraîné{e}, mais j’ai raté l’équipe d’une place.']]]],
      [['Not for me', 'Ce n’est pas pour moi'], [[1, '', ['I skipped the tryouts.', 'Je ne suis pas allé{e} aux sélections.']]]]
    ]],
    ['band', 13, 22, 5, 'friend', null, ['{p} wants to start a band with you.', '{p} veut monter un groupe de musique avec toi.'], [
      [['Be the singer', 'Être au chant'], [[1, 'xmus+5 h+5 b+5', ['We started a band. I sing, and we practise in {p}’s garage.', 'On a monté un groupe. Je chante, et on répète dans le garage de {p}.']]]],
      [['Play the drums', 'Jouer de la batterie'], [[1, 'xmus+5 h+5 b+5 a+1', ['I became the drummer of our band. The neighbours bought earplugs.', 'Je joue maintenant de la batterie dans le groupe. Les voisins ont acheté des bouchons d’oreille.']]]],
      [['Be the manager', 'Être le manager'], [[1, 's+3 b+4', ['I became the band’s manager and booked our first gig at the school fair.', 'Je suis devenu{e} le manager du groupe et j’ai décroché notre premier concert à la fête de l’école.']]]],
      [['No thanks', 'Non merci'], [[1, 'b-3', ['I said no to the band. {p} found another singer.', 'J’ai refusé de rejoindre le groupe. {p} a trouvé quelqu’un d’autre.']]]]
    ]],
    ['photo', 12, 30, 5, null, null, ['An embarrassing photo of you is being shared online.', 'Une photo gênante de toi circule en ligne.'], [
      [['Laugh it off', 'En rire'], [[1, 'h+2 f+1', ['I laughed about the photo with everyone. By Friday nobody cared.', 'J’ai ri de la photo avec tout le monde. Vendredi, plus personne n’en parlait.']]]],
      [['Ask for it to be taken down', 'Demander qu’elle soit supprimée'], [[2, 'h+2 s+1', ['I asked for the photo to be removed and reported it. It disappeared quickly.', 'J’ai demandé qu’on supprime la photo et je l’ai signalée. Elle a vite disparu.']], [1, 'h-2', ['I asked for the photo to be removed, but it took weeks to go away.', 'J’ai demandé qu’on supprime la photo, mais elle a mis des semaines à disparaître.']]]],
      [['Tell a trusted adult', 'En parler à un adulte de confiance'], [[1, 'h+3 B+2 k+1', ['I talked to my family about the photo. They helped me sort it out.', 'J’ai parlé de la photo à ma famille. Ils m’ont aidé{e} à régler le problème.']]]]
    ]],
    ['detention', 12, 17, 5, null, 'school', ['You got detention for talking during class.', 'Tu as une heure de retenue pour avoir bavardé en classe.'], [
      [['Accept it', 'L’accepter'], [[1, 'k+1 h-1', ['I served my detention without complaining.', 'J’ai fait mon heure de retenue sans me plaindre.']]]],
      [['Argue with the teacher', 'Discuter avec le professeur'], [[1, 'p-5 h-2', ['I argued about my detention and got a second one.', 'J’ai contesté ma retenue et j’en ai eu une deuxième.']]]],
      [['Use the time for homework', 'En profiter pour faire tes devoirs'], [[1, 's+2 p+3', ['I finished all my homework during detention. The most productive hour of my week.', 'J’ai fini tous mes devoirs pendant la retenue. L’heure la plus productive de ma semaine.']]]]
    ], { r: 3 }],
    ['trip', 13, 17, 4, 'par', 'school', ['Your school is organising a trip to {city}.', 'Ton école organise un voyage à {city}.'], [
      [['Ask your parents to pay for it', 'Demander à tes parents de payer'], [[s => 30 + s.pw * 20, 'h+7 xlan+5 s+2', ['I went on the school trip to {city}. I tried every local dish I could find.', 'Je suis parti{e} en voyage scolaire à {city}. J’ai goûté tous les plats locaux possibles.']], [40, 'h-3', ['My parents couldn’t afford the trip to {city} this year.', 'Mes parents n’ont pas pu payer le voyage à {city} cette année.']]]],
      [['Earn the money yourself', 'Gagner l’argent toi-même'], [[1, 'h+6 xlan+4 k+2', ['I washed cars all spring to pay for the trip to {city}. Worth every bucket.', 'J’ai lavé des voitures tout le printemps pour payer le voyage à {city}. Chaque seau en valait la peine.']]]],
      [['Stay home', 'Ne pas y aller'], [[1, 'h-1', ['I didn’t go on the school trip.', 'Je ne suis pas parti{e} en voyage scolaire.']]]]
    ]],
    ['screens', 12, 17, 6, 'par', null, ['{Yrel} {p} says you spend far too much time on screens.', '{Yrel} {p} trouve que tu passes beaucoup trop de temps sur les écrans.'], [
      [['Agree to some limits', 'Accepter des limites'], [[1, 'b+5 s+1 H+1', ['I agreed to put my phone away after nine. I sleep better now.', 'J’ai accepté de ranger mon téléphone après 21 h. Je dors mieux maintenant.']]]],
      [['Argue', 'Protester'], [[1, 'b-6 h+1', ['I argued with {myrel} about screen time. Doors were slammed.', 'Je me suis disputé{e} avec {myrel} à propos des écrans. Des portes ont claqué.']]]],
      [['Make a deal', 'Négocier un accord'], [[1, 'b+3 s+2', ['I negotiated one extra hour of screen time in exchange for walking the dog.', 'J’ai négocié une heure d’écran en plus en échange des promenades du chien.']]]]
    ]],
    ['shelter', 12, 17, 4, null, null, ['The local animal shelter needs young volunteers.', 'Le refuge pour animaux du quartier cherche de jeunes bénévoles.'], [
      [['Help every weekend', 'Aider tous les week-ends'], [[1, 'k+6 h+4 !vol', ['I volunteered at the animal shelter every weekend. The dogs know my name now.', 'J’ai été bénévole au refuge tous les week-ends. Les chiens connaissent mon prénom maintenant.']]]],
      [['Help once a month', 'Aider une fois par mois'], [[1, 'k+3 h+2', ['I helped at the animal shelter once a month.', 'J’ai aidé au refuge une fois par mois.']]]],
      [['Not right now', 'Pas pour le moment'], [[1, '', ['I didn’t have time to volunteer this year.', 'Je n’ai pas eu le temps de faire du bénévolat cette année.']]]]
    ]],
    ['dye', 13, 30, 5, null, null, ['You are thinking about dyeing your hair a bold colour.', 'Tu penses te teindre les cheveux d’une couleur audacieuse.'], [
      [['Electric blue', 'Bleu électrique'], [[1, 'h+4 l+1 hair:blue', ['I dyed my hair electric blue. People notice me from across the street.', 'Je me suis teint les cheveux en bleu électrique. On me remarque de l’autre côté de la rue.']]]],
      [['Bubblegum pink', 'Rose bonbon'], [[1, 'h+4 l+1 hair:pink', ['I dyed my hair bubblegum pink and it looks fantastic.', 'Je me suis teint les cheveux en rose bonbon et c’est superbe.']]]],
      [['Forest green', 'Vert forêt'], [[1, 'h+3 hair:green', ['I dyed my hair green. My grandmother asked if I was feeling well.', 'Je me suis teint les cheveux en vert. Ma grand-mère m’a demandé si j’allais bien.']]]],
      [['Keep my natural colour', 'Garder ma couleur naturelle'], [[1, '', ['I decided to keep my natural hair colour.', 'J’ai décidé de garder ma couleur naturelle.']]]]
    ]],
    ['olympiad', 13, 17, 5, null, s => olAt(s, 'high', 'mid') && s.me.st.s >= 70, ['Your teacher wants you to compete in the national maths olympiad.', 'Ton professeur veut que tu participes aux olympiades nationales de maths.'], [
      [['Accept the challenge', 'Relever le défi'], [[s => s.me.st.s - 40, 's+5 h+7 f+2 !olymp', ['I won a medal at the national maths olympiad!', 'J’ai gagné une médaille aux olympiades nationales de maths !']], [50, 's+4 h+1', ['I competed in the maths olympiad and finished in the top half.', 'J’ai participé aux olympiades de maths et j’ai fini dans la première moitié.']]]],
      [['Politely decline', 'Refuser poliment'], [[1, '', ['I turned down the maths olympiad.', 'J’ai décliné les olympiades de maths.']]]]
    ]],
    ['stress', 15, 17, 6, null, s => olAt(s, 'high'), ['Exams are coming and you feel very stressed.', 'Les examens approchent et tu te sens très stressé{e}.'], [
      [['Make a revision plan', 'Faire un planning de révisions'], [[1, 's+3 p+6 h-1', ['I made a revision timetable and stuck to it. I felt in control.', 'J’ai fait un planning de révisions et je m’y suis tenu{e}. Je me sentais prêt{e}.']]]],
      [['Take breaks and exercise', 'Faire des pauses et du sport'], [[1, 'h+3 H+2 p+3', ['I studied in short bursts and went running in between. It really helped.', 'J’ai révisé par petites sessions avec des footings entre deux. Ça m’a beaucoup aidé{e}.']]]],
      [['Stay up all night', 'Réviser toute la nuit'], [[1, 'p+2 H-3 h-3', ['I studied all night before every exam. I was exhausted.', 'J’ai révisé toute la nuit avant chaque examen. J’étais épuisé{e}.']]]]
    ], { r: 2 }],
    ['careersfair', 14, 17, 4, null, 'school', ['At the careers fair, which stand do you visit first?', 'Au salon des métiers, quel stand visites-tu en premier ?'], [
      [['Hospitals and medicine', 'Hôpitaux et médecine'], [[1, 's+2 !medint', ['At the careers fair, a surgeon let me try stitching up a banana.', 'Au salon des métiers, une chirurgienne m’a laissé{e} recoudre une banane.']]]],
      [['Technology and games', 'Technologie et jeux vidéo'], [[1, 'xcod+3', ['At the careers fair, I tested a video game before it came out.', 'Au salon des métiers, j’ai testé un jeu vidéo avant sa sortie.']]]],
      [['Arts and media', 'Arts et médias'], [[1, 'xart+3', ['At the careers fair, I met an animator who drew me as a superhero.', 'Au salon des métiers, j’ai rencontré une animatrice qui m’a dessiné{e} en super-héros.']]]],
      [['Sport and fitness', 'Sport et forme'], [[1, 'a+3', ['At the careers fair, I beat a fitness coach at a plank challenge.', 'Au salon des métiers, j’ai battu un coach sportif au gainage.']]]]
    ]],
    ['classrep', 10, 17, 4, null, 'school', ['Class representative elections are coming up.', 'Les élections de délégués de classe approchent.'], [
      [['Promise longer breaks', 'Promettre des récrés plus longues'], [[1, 'h+4 f+1', ['I promised longer breaks and won the election. The breaks stayed the same length.', 'J’ai promis des récrés plus longues et j’ai gagné l’élection. Les récrés n’ont pas changé.']], [1, 'h-1', ['I promised longer breaks. Nobody believed me and I lost.', 'J’ai promis des récrés plus longues. Personne ne m’a cru{e} et j’ai perdu.']]]],
      [['Run with serious ideas', 'Te présenter avec des idées sérieuses'], [[s => s.me.st.s, 's+2 h+4 k+2 f+1', ['I won the election with a plan for a recycling club. It actually happened.', 'J’ai gagné l’élection avec un projet de club de recyclage. Il a vraiment vu le jour.']], [50, 's+1', ['I ran with serious ideas and lost by two votes.', 'Je me suis présenté{e} avec des idées sérieuses et j’ai perdu de deux voix.']]]],
      [['Vote for a friend', 'Voter pour un ami'], [[1, 'k+1 h+1', ['I voted for my friend, who won and made me vice-representative.', 'J’ai voté pour mon ami, qui a gagné et m’a nommé{e} suppléant{e}.']]]]
    ]],
    ['sibtoy', 5, 13, 5, 'sib', s => true, ['{Yrel} {p} broke something you love.', '{Yrel} {p} a cassé un objet auquel tu tiens.'], [
      [['Forgive {him}', 'Lui pardonner'], [[1, 'k+4 b+4', ['{Myrel} {p} broke my favourite thing. I forgave {him}. Mostly.', '{Myrel} {p} a cassé mon objet préféré. Je lui ai pardonné. Presque.']]]],
      [['Tell your parents', 'Le dire aux parents'], [[1, 'b-3', ['I told my parents that {p} broke my things. {He} got no dessert.', 'J’ai dit à mes parents que {p} avait cassé mes affaires. {Il} a été privé{pe} de dessert.']]]],
      [['Break something of theirs', 'Casser un de ses objets'], [[1, 'k-5 b-9', ['I broke something of {p}’s in revenge. We both got grounded.', 'J’ai cassé un objet de {p} pour me venger. On a été punis tous les deux.']]]]
    ]],
    ['diary', 9, 15, 4, 'ysib', null, ['{Yrel} {p} read your secret diary!', '{Yrel} {p} a lu ton journal intime !'], [
      [['Talk about privacy', 'Parler de vie privée'], [[1, 'b+3 k+2', ['I explained to {p} why diaries are private. {He} promised never to do it again.', 'J’ai expliqué à {p} pourquoi un journal est privé. {Il} a promis de ne jamais recommencer.']]]],
      [['Hide it somewhere better', 'Le cacher ailleurs'], [[1, 's+1', ['I now hide my diary inside an old maths book. Nobody will ever look there.', 'Je cache maintenant mon journal dans un vieux livre de maths. Personne n’ira jamais regarder là.']]]],
      [['Read {his} diary back', 'Lire son journal en retour'], [[1, 'k-3 b-5 h+2', ['I read {p}’s diary in revenge. It was mostly about dinosaurs.', 'J’ai lu le journal de {p} pour me venger. Il parlait surtout de dinosaures.']]]]
    ]],
    ['gpstory', 5, 40, 5, 'gp', null, ['You visit {yrel} {p}, who starts telling stories about the old days.', 'Tu rends visite à {yrel} {p}, qui commence à raconter le bon vieux temps.'], [
      [['Listen carefully', 'Écouter attentivement'], [[1, 'b+8 s+1 h+2', ['{Myrel} {p} told me how {he} met the love of {his} life at a dance. I listened to every word.', '{Myrel} {p} m’a raconté comment {il} a rencontré l’amour de sa vie dans un bal. J’ai écouté chaque mot.']]]],
      [['Ask to see old photos', 'Demander à voir de vieilles photos'], [[1, 'b+7 h+3', ['{Myrel} {p} showed me photos of my parents as babies. Hilarious.', '{Myrel} {p} m’a montré des photos de mes parents bébés. Hilarant.']]]],
      [['Check your phone', 'Regarder ton téléphone'], [[1, 'b-5', ['I checked my phone while {myrel} {p} was talking. {He} noticed.', 'J’ai regardé mon téléphone pendant que {myrel} {p} parlait. {Il} l’a remarqué.']]]]
    ], { r: 5 }],
    ['roommate', 18, 23, 6, 'X', s => olAt(s, 'uni', 'grad'), ['Your new flatmate, {p}, leaves dirty dishes everywhere.', '{Un} colocataire, {p}, laisse de la vaisselle sale partout.'], [
      [['Talk to {him} about it', 'Lui en parler'], [[2, 'h+2 F', ['I talked to {p} about the dishes. We made a rota and became friends.', 'J’ai parlé de la vaisselle avec {p}. On a fait un planning et on est devenus amis.']], [1, 'h-1', ['I talked to {p} about the dishes. Nothing changed.', 'J’ai parlé de la vaisselle avec {p}. Rien n’a changé.']]]],
      [['Wash them yourself', 'La laver toi-même'], [[1, 'k+2 h-2', ['I washed {p}’s dishes for a whole term. I deserve a medal.', 'J’ai lavé la vaisselle de {p} pendant tout un trimestre. Je mérite une médaille.']]]],
      [['Leave a passive-aggressive note', 'Laisser un mot passif-agressif'], [[1, 'h+1 xwri+1', ['I left {p} a note on the sink. {He} left one back. This continued for months.', 'J’ai laissé un mot à {p} sur l’évier. {Il} m’a répondu par un autre mot. Ça a duré des mois.']]]]
    ]],
    ['fresher', 18, 22, 6, null, s => olAt(s, 'uni'), ['It’s the student clubs fair. Which club do you join?', 'C’est le salon des associations étudiantes. Laquelle rejoins-tu ?'], [
      [['Debating society', 'Club de débat'], [[1, 's+4 f+1', ['I joined the debating society and learned to argue with style.', 'J’ai rejoint le club de débat et j’ai appris à argumenter avec style.']]]],
      [['Hiking club', 'Club de randonnée'], [[1, 'H+4 a+3 h+3', ['I joined the hiking club and climbed my first real mountain.', 'J’ai rejoint le club de randonnée et j’ai gravi ma première vraie montagne.']]]],
      [['Student theatre', 'Théâtre étudiant'], [[1, 'xact+6 h+4', ['I joined the student theatre and played a very dramatic ghost.', 'J’ai rejoint le théâtre étudiant et j’ai joué un fantôme très dramatique.']]]],
      [['Volunteering group', 'Groupe de bénévoles'], [[1, 'k+5 h+3', ['I joined the volunteering group and helped at a food bank every week.', 'J’ai rejoint les bénévoles et j’ai aidé à la banque alimentaire chaque semaine.']]]]
    ]],
    ['essay', 18, 26, 6, null, s => olAt(s, 'uni', 'grad'), ['You have a big essay due tomorrow and haven’t started it.', 'Tu as un gros devoir à rendre demain et tu ne l’as pas commencé.'], [
      [['Pull an all-nighter', 'Y passer la nuit'], [[2, 'p+3 H-3 h-2', ['I wrote my whole essay overnight. It was surprisingly good.', 'J’ai écrit tout mon devoir en une nuit. Il était étonnamment bon.']], [1, 'p-3 H-3', ['I wrote my essay overnight and fell asleep on the keyboard.', 'J’ai écrit mon devoir en une nuit et je me suis endormi{e} sur le clavier.']]]],
      [['Ask for an extension', 'Demander un délai'], [[1, 'p+1 h+2', ['My tutor gave me three extra days. I used all of them.', 'Mon directeur d’études m’a accordé trois jours de plus. Je les ai tous utilisés.']], [1, 'p-4', ['My extension was refused, so I handed in a rushed essay.', 'Mon délai a été refusé, j’ai rendu un devoir bâclé.']]]],
      [['Hand in something quick', 'Rendre quelque chose de rapide'], [[1, 'p-5 h+1', ['I handed in a very short essay. The feedback was even shorter.', 'J’ai rendu un devoir très court. La correction était encore plus courte.']]]]
    ], { r: 2 }],
    ['intern', 19, 25, 5, null, s => olAt(s, 'uni', 'grad'), ['A company offers you a summer internship.', 'Une entreprise te propose un stage d’été.'], [
      [['Accept it', 'Accepter'], [[1, 'p+5 s+2 m+1500 !intern', ['I did a summer internship and learned how real offices work.', 'J’ai fait un stage d’été et j’ai découvert le vrai monde du travail.']]]],
      [['Travel instead', 'Voyager plutôt'], [[1, 'h+7 xlan+4 m-800', ['I spent the summer travelling with a backpack and a very old map.', 'J’ai passé l’été à voyager avec un sac à dos et une très vieille carte.']]]],
      [['Rest at home', 'Se reposer à la maison'], [[1, 'h+3 H+2', ['I spent the summer resting at home and recharging.', 'J’ai passé l’été à me reposer à la maison.']]]]
    ]],
    ['overtime', 20, 70, 6, null, 'job', ['Your boss asks you to work this weekend.', 'Ton patron te demande de travailler ce week-end.'], [
      [['Agree', 'Accepter'], [[1, 'p+6 h-3 m+300', ['I worked all weekend. My boss noticed.', 'J’ai travaillé tout le week-end. Mon patron l’a remarqué.']]]],
      [['Politely refuse', 'Refuser poliment'], [[1, 'p-2 h+2', ['I said no to weekend work and spent Saturday in the park.', 'J’ai refusé de travailler le week-end et j’ai passé le samedi au parc.']]]],
      [['Ask for a day off later', 'Demander un jour de repos en échange'], [[1, 'p+3', ['I worked the weekend in exchange for a long weekend next month.', 'J’ai travaillé ce week-end en échange d’un long week-end le mois prochain.']]]]
    ], { r: 4 }],
    ['credit', 20, 70, 6, 'Xw', 'job', ['Your coworker {p} took credit for your idea in a meeting.', '{Un} collègue, {p}, s’est attribué ton idée en réunion.'], [
      [['Talk to {him} privately', 'Lui en parler en privé'], [[2, 'h+2 k+2', ['I talked to {p} privately. {He} apologised and corrected it with the team.', 'J’ai parlé à {p} en privé. {Il} s’est excusé{pe} et a rétabli la vérité devant l’équipe.']], [1, 'h-2', ['I talked to {p}, who pretended not to understand.', 'J’ai parlé à {p}, qui a fait semblant de ne pas comprendre.']]]],
      [['Tell your manager', 'En parler à ton responsable'], [[1, 'p+4', ['I showed my manager the email where I first shared the idea.', 'J’ai montré à ma responsable l’e-mail où j’avais proposé l’idée en premier.']], [1, 'p-2', ['I complained to my manager, who said I should sort it out myself.', 'Je me suis plaint{e} à mon responsable, qui m’a dit de régler ça moi-même.']]]],
      [['Let it go', 'Laisser tomber'], [[1, 'h-3 k+1', ['I let it go. I keep my best ideas to myself in meetings now.', 'J’ai laissé tomber. Je garde mes meilleures idées pour moi en réunion maintenant.']]]]
    ], { r: 6 }],
    ['officeparty', 20, 70, 5, null, 'job', ['It’s the office end-of-year party.', 'C’est la fête de fin d’année au bureau.'], [
      [['Dance all night', 'Danser toute la nuit'], [[1, 'h+5 p+1 F', ['I danced all night at the office party and made friends with someone from accounts.', 'J’ai dansé toute la nuit à la fête du bureau et je me suis fait un ami à la comptabilité.']]]],
      [['Give a speech', 'Faire un discours'], [[s => s.me.st.s, 'p+5 f+1 h+3', ['I gave a funny speech at the office party. People quoted it all year.', 'J’ai fait un discours drôle à la fête du bureau. On l’a cité toute l’année.']], [40, 'h-3', ['I gave a speech at the office party and forgot what I was saying halfway through.', 'J’ai fait un discours à la fête et j’ai oublié ce que je disais au milieu.']]]],
      [['Skip it', 'Ne pas y aller'], [[1, 'p-1 h+1', ['I skipped the office party and had an early night.', 'J’ai fait l’impasse sur la fête et je me suis couché{e} tôt.']]]]
    ], { r: 3 }],
    ['rival', 23, 60, 4, null, s => s.me.job && s.me.job.t === 'f', ['A rival company offers you the same job for 20% more money.', 'Une entreprise concurrente te propose le même poste pour 20 % de plus.'], [
      [['Accept the offer', 'Accepter l’offre'], [[1, 'h+3 jobmove', ['I moved to a rival company for a better salary.', 'Je suis parti{e} chez un concurrent pour un meilleur salaire.']]]],
      [['Use it to ask for a raise', 'S’en servir pour demander une augmentation'], [[1, 'h+3 raise:10', ['I showed my boss the offer and got a 10% raise to stay.', 'J’ai montré l’offre à mon patron et j’ai obtenu 10 % d’augmentation pour rester.']], [1, 'p-3', ['I asked my boss to match the offer. He said no, and things got awkward.', 'J’ai demandé à mon patron de s’aligner sur l’offre. Il a refusé et l’ambiance est devenue gênante.']]]],
      [['Stay loyal', 'Rester fidèle'], [[1, 'p+3 k+1', ['I turned down the rival offer. My team was glad I stayed.', 'J’ai refusé l’offre du concurrent. Mon équipe était contente que je reste.']]]]
    ]],
    ['mistake', 20, 70, 5, null, 'job', ['You made an expensive mistake at work.', 'Tu as fait une erreur coûteuse au travail.'], [
      [['Admit it straight away', 'L’avouer tout de suite'], [[1, 'k+4 p-2', ['I admitted my mistake straight away. My boss thanked me for being honest.', 'J’ai avoué mon erreur tout de suite. Ma patronne m’a remercié{e} pour mon honnêteté.']]]],
      [['Fix it quietly', 'La réparer discrètement'], [[s => s.me.st.s, 'p+2 s+1', ['I fixed my mistake before anyone noticed.', 'J’ai réparé mon erreur avant que quelqu’un ne la remarque.']], [40, 'p-8 k-2', ['I tried to fix my mistake quietly and made it worse.', 'J’ai essayé de réparer mon erreur discrètement et j’ai empiré les choses.']]]],
      [['Blame the computer', 'Accuser l’ordinateur'], [[1, 'k-3 p-3', ['I blamed the computer. IT checked. It was not the computer.', 'J’ai accusé l’ordinateur. Le service informatique a vérifié. Ce n’était pas l’ordinateur.']]]]
    ], { r: 6 }],
    ['worktrip', 22, 65, 4, null, s => s.me.job && s.me.job.t === 'f', ['You are sent on a business trip to {city}.', 'Tu pars en voyage d’affaires à {city}.'], [
      [['Explore the city', 'Explorer la ville'], [[1, 'h+5 xlan+3', ['I explored {city} between meetings and found the best bakery in town.', 'J’ai exploré {city} entre deux réunions et j’ai trouvé la meilleure boulangerie de la ville.']]]],
      [['Work from the hotel', 'Travailler depuis l’hôtel'], [[1, 'p+5', ['I worked from my hotel room in {city} and closed the deal.', 'J’ai travaillé depuis ma chambre d’hôtel à {city} et j’ai conclu l’affaire.']]]],
      [['Bring back gifts for everyone', 'Rapporter des cadeaux à tout le monde'], [[1, 'B+4 m-150 h+2', ['I brought back gifts from {city} for the whole family.', 'J’ai rapporté des cadeaux de {city} pour toute la famille.']]]]
    ], { r: 5 }],
    ['teamday', 22, 65, 4, null, s => s.me.job && s.me.job.t === 'f', ['Your company organises a team-building day of paintball.', 'Ton entreprise organise une journée de cohésion au paintball.'], [
      [['Play to win', 'Jouer pour gagner'], [[s => s.me.a, 'h+5 p+2 a+2', ['My team won the paintball day. I was named most valuable player.', 'Mon équipe a gagné au paintball. J’ai reçu le titre de meilleur joueur de la journée.']], [50, 'h+2', ['I played to win and was eliminated in the first minute.', 'J’ai joué pour gagner et j’ai été éliminé{e} à la première minute.']]]],
      [['Hide behind a tree', 'Se cacher derrière un arbre'], [[1, 'h+2', ['I hid behind a tree all day and survived every round.', 'Je me suis caché{e} derrière un arbre toute la journée et j’ai survécu à chaque manche.']]]],
      [['Accidentally hit your boss', 'Toucher ton patron sans le faire exprès'], [[1, 'h+5 p-2', ['I accidentally hit my boss with a yellow paintball. Mostly accidentally.', 'J’ai touché mon patron avec une bille jaune. Presque sans le faire exprès.']]]]
    ], { r: 8 }],
    ['charityrun', 18, 60, 4, null, null, ['Your friends are running a 10K for a children’s charity.', 'Tes amis courent 10 km pour une association d’enfants.'], [
      [['Run with them', 'Courir avec eux'], [[6, 'H+4 a+3 k+3 h+3', ['I ran the charity 10K and raised money for the children’s hospital.', 'J’ai couru les 10 km solidaires et récolté des fonds pour l’hôpital des enfants.']], [1, 'k+2 i:ankle', ['I ran the charity 10K and twisted my ankle at the 8th kilometre.', 'J’ai couru les 10 km et je me suis tordu la cheville au 8e kilomètre.']]]],
      [['Sponsor them', 'Les parrainer'], [[1, 'm-50 k+3', ['I sponsored my friends for the charity run.', 'J’ai parrainé mes amis pour la course solidaire.']]]],
      [['Cheer from the finish line', 'Les encourager à l’arrivée'], [[1, 'h+2 k+1', ['I cheered at the finish line with a giant homemade sign.', 'J’ai encouragé tout le monde à l’arrivée avec une immense pancarte faite maison.']]]]
    ], { r: 6 }],
    ['noise', 18, 90, 5, null, s => s.me.mv, ['Your neighbour plays loud music late every night.', 'Ton voisin met de la musique forte tard tous les soirs.'], [
      [['Knock and ask politely', 'Frapper et demander poliment'], [[3, 'h+3 k+1', ['I asked my neighbour politely to turn it down. He did, and brought me cake.', 'J’ai demandé poliment au voisin de baisser le son. Il l’a fait et m’a apporté un gâteau.']], [1, 'h-2', ['I asked my neighbour to turn it down. He turned it up.', 'J’ai demandé au voisin de baisser le son. Il l’a monté.']]]],
      [['Buy earplugs', 'Acheter des bouchons d’oreilles'], [[1, 'm-10 H+1', ['I bought earplugs. I can no longer hear my alarm either.', 'J’ai acheté des bouchons d’oreilles. Je n’entends plus mon réveil non plus.']]]],
      [['Play your own music louder', 'Mettre ta musique encore plus fort'], [[1, 'h+1 k-3', ['I played my music even louder. The whole building now hates us both.', 'J’ai mis ma musique encore plus fort. Tout l’immeuble nous déteste tous les deux.']]]]
    ], { r: 6 }],
    ['breakdown', 18, 85, 5, null, s => olHasCar(s), ['Your car breaks down on the motorway.', 'Ta voiture tombe en panne sur l’autoroute.'], [
      [['Call a mechanic', 'Appeler un dépanneur'], [[1, 'm-400', ['My car broke down. The tow truck and repairs cost a lot.', 'Ma voiture est tombée en panne. Le dépannage et la réparation ont coûté cher.']]]],
      [['Try to fix it yourself', 'Essayer de la réparer toi-même'], [[s => s.me.st.s / 2, 'h+4 s+1', ['I fixed my car myself on the hard shoulder. I felt like a genius.', 'J’ai réparé ma voiture moi-même sur la bande d’arrêt d’urgence. Je me suis senti{e} génial{e}.']], [50, 'm-900 h-3', ['I tried to fix my car and made it much worse.', 'J’ai essayé de réparer ma voiture et je l’ai encore plus abîmée.']]]],
      [['Leave it and take the train', 'L’abandonner et prendre le train'], [[1, 'carhit', ['I left the car at a garage and took the train home.', 'J’ai laissé la voiture au garage et je suis rentré{e} en train.']]]]
    ], { r: 5 }],
    ['tip', 25, 75, 4, 'friend', s => s.me.m > 3000, ['{p} tells you about a “sure thing” investment.', '{p} te parle d’un placement « sans risque ».'], [
      [['Invest a lot', 'Investir beaucoup'], [[1, 'invest:big', ['I invested a lot in {p}’s tip.', 'J’ai beaucoup investi sur le conseil de {p}.']]]],
      [['Invest a little', 'Investir un peu'], [[1, 'invest:small', ['I invested a little in {p}’s tip.', 'J’ai investi un peu sur le conseil de {p}.']]]],
      [['Politely say no', 'Refuser poliment'], [[1, 's+1', ['I told {p} there is no such thing as a sure thing.', 'J’ai dit à {p} que le risque zéro n’existe pas.']]]]
    ], { r: 8 }],
    ['scam', 14, 95, 6, null, null, ['A message says you have won a prize, but they need your bank details first.', 'Un message dit que tu as gagné un prix, mais il faut d’abord donner tes coordonnées bancaires.'], [
      [['Send your details', 'Envoyer tes coordonnées'], [[1, 'scam h-6', ['I sent my bank details to claim a prize. It was a scam.', 'J’ai envoyé mes coordonnées bancaires pour un prix. C’était une arnaque.']]]],
      [['Delete it', 'Le supprimer'], [[1, 's+2', ['I deleted the fake prize message. Nice try, scammers.', 'J’ai supprimé le faux message. Bien essayé, les arnaqueurs.']]]],
      [['Report it', 'Le signaler'], [[1, 's+2 k+2', ['I reported the scam message so others would not fall for it.', 'J’ai signalé le message d’arnaque pour que d’autres ne tombent pas dans le piège.']]]]
    ], { r: 10 }],
    ['jury', 25, 70, 3, null, null, ['You have been called for jury service.', 'Tu as été convoqué{e} comme juré{e}.'], [
      [['Serve on the jury', 'Siéger au jury'], [[1, 'k+4 s+2', ['I served on a jury for two weeks. It made me think about justice a lot.', 'J’ai été juré{e} pendant deux semaines. Ça m’a fait beaucoup réfléchir à la justice.']]]],
      [['Ask to be excused', 'Demander une dispense'], [[1, '', ['I asked to be excused from jury service and was allowed.', 'J’ai demandé une dispense et je l’ai obtenue.']], [1, 'k+3 s+1', ['My request was refused, so I served on the jury. It was fascinating.', 'Ma demande a été refusée, alors j’ai siégé. C’était passionnant.']]]]
    ]],
    ['marathon', 22, 60, 4, null, s => s.me.st.H > 50, ['Will you train for a marathon this year?', 'Vas-tu t’entraîner pour un marathon cette année ?'], [
      [['Train seriously', 'S’entraîner sérieusement'], [[s => s.me.a + 20, 'H+6 a+6 h+6 !marathon', ['I ran a full marathon! My legs did not work for three days.', 'J’ai couru un marathon complet ! Mes jambes n’ont plus fonctionné pendant trois jours.']], [30, 'H+3 a+3 h-2', ['I trained for a marathon but had to stop at the 30th kilometre.', 'Je me suis entraîné{e} pour un marathon mais j’ai dû abandonner au 30e kilomètre.']]]],
      [['Run a half marathon instead', 'Plutôt un semi-marathon'], [[1, 'H+4 a+3 h+4', ['I ran a half marathon and smiled in every photo.', 'J’ai couru un semi-marathon et j’ai souri sur toutes les photos.']]]],
      [['Not this year', 'Pas cette année'], [[1, '', ['I decided not to run a marathon this year.', 'J’ai décidé de ne pas courir de marathon cette année.']]]]
    ]],
    ['reunion', 28, 70, 4, null, null, ['It’s your old school reunion.', 'C’est la réunion des anciens élèves de ton lycée.'], [
      [['Go', 'Y aller'], [[2, 'h+4 F', ['I went to my school reunion and reconnected with an old classmate.', 'Je suis allé{e} à la réunion des anciens et j’ai retrouvé un ancien camarade.']], [1, 'h+1', ['I went to the reunion. Everyone looked older except me, obviously.', 'Je suis allé{e} à la réunion. Tout le monde avait vieilli sauf moi, évidemment.']]]],
      [['Skip it', 'Ne pas y aller'], [[1, '', ['I skipped my school reunion.', 'Je ne suis pas allé{e} à la réunion des anciens.']]]]
    ], { r: 10 }],
    ['dinner', 20, 90, 5, null, s => s.me.mv, ['You are hosting dinner for friends and the main dish is burnt.', 'Tu reçois des amis à dîner et le plat principal a brûlé.'], [
      [['Order pizza', 'Commander des pizzas'], [[1, 'm-60 h+3', ['My dinner was burnt, so we ordered pizza. Nobody complained.', 'Mon dîner a brûlé, alors on a commandé des pizzas. Personne ne s’est plaint.']]]],
      [['Serve it anyway', 'Le servir quand même'], [[1, 'h-1 f+1', ['I served the burnt dinner and called it “smoky”. My friends still tease me.', 'J’ai servi le dîner brûlé en le qualifiant de « fumé ». Mes amis me taquinent encore.']]]],
      [['Cook something quickly', 'Cuisiner vite autre chose'], [[s => 10 + s.me.sk.coo, 'h+5 xcoo+3', ['I made a delicious pasta dish in fifteen minutes. My friends were amazed.', 'J’ai préparé de délicieuses pâtes en quinze minutes. Mes amis étaient bluffés.']], [40, 'h-2 xcoo+1', ['I rushed a second dish and it was even worse than the first.', 'J’ai improvisé un second plat et il était encore pire que le premier.']]]]
    ], { r: 6 }],
    ['straycat', 20, 90, 4, null, s => !olHasPet(s) && s.me.mv, ['A stray cat keeps visiting your doorstep.', 'Un chat errant vient sans cesse devant ta porte.'], [
      [['Adopt it', 'L’adopter'], [[1, 'h+6 k+3 pet:cat', ['I adopted the stray cat. It now owns my sofa.', 'J’ai adopté le chat errant. Il possède désormais mon canapé.']]]],
      [['Take it to a shelter', 'L’emmener au refuge'], [[1, 'k+3', ['I took the stray cat to a shelter, where a family adopted it.', 'J’ai emmené le chat au refuge, où une famille l’a adopté.']]]],
      [['Leave it be', 'Le laisser tranquille'], [[1, '', ['I left the stray cat alone. It still visits.', 'J’ai laissé le chat tranquille. Il vient toujours.']]]]
    ]],
    ['roof', 25, 95, 4, null, s => olHouse(s), ['Your home needs a new roof.', 'Ton logement a besoin d’une nouvelle toiture.'], [
      [['Pay for a proper repair', 'Payer une vraie réparation'], [[1, 'roof:fix', ['I paid for a brand-new roof. The house is worth more now.', 'J’ai payé une toiture neuve. La maison vaut plus cher maintenant.']]]],
      [['Patch it yourself', 'Rafistoler toi-même'], [[1, 'h+2 m-300', ['I patched the roof myself. It holds, mostly.', 'J’ai rafistolé le toit moi-même. Il tient, en gros.']], [1, 'roof:bad h-3', ['I patched the roof myself, and the next storm found every gap.', 'J’ai rafistolé le toit moi-même, et la tempête suivante a trouvé chaque trou.']]]],
      [['Ignore it', 'Ignorer'], [[1, 'roof:bad', ['I ignored the roof. Now there are buckets in the attic.', 'J’ai ignoré le toit. Il y a maintenant des seaux dans le grenier.']]]]
    ], { r: 12 }],
    ['hobby', 30, 75, 5, null, null, ['You feel like starting a new hobby.', 'Tu as envie de commencer un nouveau loisir.'], [
      [['Painting', 'La peinture'], [[1, 'xart+6 h+4', ['I started painting landscapes on Sunday mornings.', 'J’ai commencé à peindre des paysages le dimanche matin.']]]],
      [['Learning the guitar', 'La guitare'], [[1, 'xmus+6 h+3', ['I started learning the guitar. My family is very patient.', 'J’ai commencé la guitare. Ma famille est très patiente.']]]],
      [['Bird-watching', 'L’observation des oiseaux'], [[1, 's+2 h+4 H+1', ['I took up bird-watching and spotted a kingfisher.', 'Je me suis mis{e} à observer les oiseaux et j’ai vu un martin-pêcheur.']]]],
      [['Baking bread', 'Faire du pain'], [[1, 'xcoo+6 h+4', ['I started baking my own bread. The kitchen smells wonderful.', 'Je me suis mis{e} à faire mon propre pain. La cuisine sent merveilleusement bon.']]]]
    ], { r: 10 }],
    ['adventure', 38, 58, 4, null, null, ['You wake up feeling your life needs an adventure.', 'Tu te réveilles avec l’envie de vivre une aventure.'], [
      [['Go backpacking for a month', 'Partir un mois sac au dos'], [[1, 'h+9 xlan+3 m-2500 !trip', ['I went backpacking for a month and came back with a beard of stories.', 'Je suis parti{e} un mois sac au dos et je suis revenu{e} plein{e} d’histoires.']]]],
      [['Learn to scuba dive', 'Apprendre la plongée'], [[1, 'h+7 a+3 H+2 m-900', ['I learned to scuba dive and swam with a sea turtle.', 'J’ai appris la plongée et j’ai nagé avec une tortue de mer.']]]],
      [['Take a pottery class', 'Prendre des cours de poterie'], [[1, 'xart+5 h+5 m-200', ['I took a pottery class. My first bowl leans to the left.', 'J’ai pris des cours de poterie. Mon premier bol penche à gauche.']]]],
      [['Life is fine as it is', 'La vie est bien comme elle est'], [[1, 'h+1', ['I decided my life was adventurous enough.', 'J’ai décidé que ma vie était assez aventureuse comme ça.']]]]
    ]],
    ['wedspeech', 22, 50, 5, 'friend', null, ['{p} is getting married and asks you to give a speech.', '{p} se marie et te demande de faire un discours.'], [
      [['Accept', 'Accepter'], [[s => s.me.st.s + s.me.sk.wri, 'b+10 h+5 f+1', ['My speech at {p}’s wedding made everybody laugh and cry.', 'Mon discours au mariage de {p} a fait rire et pleurer tout le monde.']], [40, 'b+4 h-2', ['I gave a speech at {p}’s wedding and forgot the bride’s name for a second.', 'J’ai fait un discours au mariage de {p} et j’ai oublié un instant le prénom de la mariée.']]]],
      [['Decline politely', 'Refuser poliment'], [[1, 'b-5', ['I declined to give a speech at {p}’s wedding.', 'J’ai refusé de faire un discours au mariage de {p}.']]]]
    ]],
    ['borrow', 20, 80, 5, 'friend', null, ['Your friend {p} asks to borrow {amt}.', 'Ton ami{pe} {p} te demande de lui prêter {amt}.'], [
      [['Lend it', 'Le prêter'], [[3, 'b+6 k+2', ['I lent money to {p}, who paid me back a month later.', 'J’ai prêté de l’argent à {p}, qui m’a remboursé{e} un mois plus tard.']], [2, 'm-amt b+3 h-2', ['I lent money to {p}. I am still waiting to be paid back.', 'J’ai prêté de l’argent à {p}. J’attends toujours d’être remboursé{e}.']]]],
      [['Give it as a gift', 'Le donner'], [[1, 'm-amt b+10 k+4', ['I gave {p} the money as a gift. {He} hugged me for a long time.', 'J’ai donné l’argent à {p}. {Il} m’a serré{e} longtemps dans ses bras.']]]],
      [['Say no', 'Refuser'], [[1, 'b-6', ['I said no to {p}. Things were awkward for a while.', 'J’ai dit non à {p}. Ça a été gênant pendant un moment.']]]]
    ], { amt: [100, 600], r: 8 }],
    ['anniv', 18, 95, 6, 'love', null, ['It’s your anniversary with {p}.', 'C’est ton anniversaire de couple avec {p}.'], [
      [['A romantic dinner', 'Un dîner romantique'], [[1, 'm-150 b+7 h+4', ['I took {p} out for a candlelit dinner for our anniversary.', 'J’ai invité {p} à un dîner aux chandelles pour notre anniversaire.']]]],
      [['A homemade gift', 'Un cadeau fait main'], [[1, 'b+7 xart+2 h+3', ['I made {p} a photo album of our best memories.', 'J’ai fabriqué pour {p} un album photo de nos plus beaux souvenirs.']]]],
      [['Forget about it', 'L’oublier'], [[1, 'b-10 h-3', ['I completely forgot our anniversary. {p} did not forget that I forgot.', 'J’ai complètement oublié notre anniversaire. {p} n’a pas oublié que j’avais oublié.']]]]
    ], { r: 3 }],
    ['worktoo', 22, 70, 5, 'love', 'job', ['{p} is upset that you work too much.', '{p} est contrarié{pe} que tu travailles autant.'], [
      [['Promise to change', 'Promettre de changer'], [[1, 'b+6 p-2', ['I promised {p} to leave work on time. I mostly keep the promise.', 'J’ai promis à {p} de quitter le travail à l’heure. Je tiens presque toujours parole.']]]],
      [['Plan a weekend away', 'Organiser un week-end à deux'], [[1, 'b+8 m-400 h+4', ['I planned a surprise weekend away with {p}. No laptops allowed.', 'J’ai organisé un week-end surprise avec {p}. Ordinateurs interdits.']]]],
      [['Argue back', 'Répliquer'], [[1, 'b-8 h-2', ['I argued with {p} about work. We didn’t speak for two days.', 'Je me suis disputé{e} avec {p} à propos du travail. On ne s’est pas parlé pendant deux jours.']]]]
    ], { r: 5 }],
    ['inlaws', 24, 70, 4, 'spouse', null, ['Your in-laws are coming to stay for two weeks.', 'Ta belle-famille vient passer deux semaines chez vous.'], [
      [['Welcome them warmly', 'Les accueillir chaleureusement'], [[1, 'b+6 h-1 k+2', ['I welcomed my in-laws warmly. My mother-in-law taught me her famous recipe.', 'J’ai accueilli ma belle-famille chaleureusement. Ma belle-mère m’a appris sa fameuse recette.']]]],
      [['Book a work trip that week', 'Prévoir un déplacement cette semaine-là'], [[1, 'b-6 h+2', ['I booked a work trip during my in-laws’ visit. {p} saw right through it.', 'J’ai prévu un déplacement pendant la visite de ma belle-famille. {p} n’a pas été dupe.']]]],
      [['Plan days out together', 'Prévoir des sorties ensemble'], [[1, 'b+5 h+2 m-200', ['I planned day trips with my in-laws. We all got along brilliantly.', 'J’ai organisé des sorties avec ma belle-famille. On s’est tous très bien entendus.']]]]
    ], { r: 8 }],
    ['kidplay', 25, 70, 6, 'kidsmall', null, ['Your child {p} has a part in the school play.', 'Ton enfant {p} joue dans la pièce de l’école.'], [
      [['Go and cheer loudly', 'Aller l’applaudir très fort'], [[1, 'b+8 h+5', ['I cheered so loudly at {p}’s school play that {he} waved at me from the stage.', 'J’ai applaudi si fort à la pièce de {p} qu’{il} m’a fait coucou depuis la scène.']]]],
      [['Film it for the family', 'Le filmer pour la famille'], [[1, 'b+5 h+3', ['I filmed {p}’s school play for the whole family.', 'J’ai filmé la pièce de {p} pour toute la famille.']]]],
      [['Miss it for work', 'La manquer pour le travail'], [[1, 'b-10 p+2 h-3', ['I missed {p}’s school play because of work. I still regret it.', 'J’ai manqué la pièce de {p} à cause du travail. Je le regrette encore.']]]]
    ], { r: 3 }],
    ['kidhomework', 25, 70, 6, 'kidsmall', null, ['{p} asks for help with {his} maths homework.', '{p} te demande de l’aide pour ses devoirs de maths.'], [
      [['Sit down and help', 'S’asseoir et aider'], [[s => s.me.st.s, 'b+7 s+1', ['I helped {p} with fractions and we both understood them better.', 'J’ai aidé {p} avec les fractions et on les a mieux comprises tous les deux.']], [40, 'b+4', ['I tried to help {p} with maths, but the methods have changed since my day.', 'J’ai essayé d’aider {p} en maths, mais les méthodes ont changé depuis mon époque.']]]],
      [['Teach {him} to find the answer', 'Lui apprendre à chercher'], [[1, 'b+5 k+1', ['I showed {p} how to work it out alone. {He} was proud of {him}self.', 'J’ai montré à {p} comment trouver seul{pe}. {Il} était très content{pe} de {lui}.']]]],
      [['Say you’re busy', 'Dire que tu es occupé{e}'], [[1, 'b-5', ['I told {p} I was too busy to help.', 'J’ai dit à {p} que j’étais trop occupé{e} pour l’aider.']]]]
    ], { r: 3 }],
    ['curfew', 30, 75, 6, 'kidteen', null, ['Your teenager {p} came home two hours after curfew.', 'Ton ado {p} est rentré{pe} deux heures après l’heure prévue.'], [
      [['Talk calmly', 'En parler calmement'], [[1, 'b+4 k+1', ['I talked calmly with {p} about the curfew. {He} apologised.', 'J’ai parlé calmement avec {p}. {Il} s’est excusé{pe}.']]]],
      [['Ground {him}', '{Lp} priver de sortie'], [[1, 'b-5', ['I grounded {p} for two weeks. The house was very quiet.', 'J’ai privé {p} de sortie pendant deux semaines. La maison était très calme.']]]],
      [['Let it slide', 'Laisser passer'], [[1, 'b+2', ['I let the late night slide. {p} was home safe, that’s what mattered.', 'J’ai laissé passer. {p} était bien rentré{pe}, c’est ce qui comptait.']]]]
    ], { r: 4 }],
    ['kidcar', 35, 80, 5, 'kidadult', s => s.me.m > 3000, ['{p} asks if you can help pay for {his} first car.', '{p} te demande si tu peux l’aider à payer sa première voiture.'], [
      [['Pay for all of it', 'Tout payer'], [[1, 'm-6000 b+12', ['I bought {p} {his} first car. {He} drove me around all afternoon.', 'J’ai offert sa première voiture à {p}. {Il} m’a promené{e} tout l’après-midi.']]]],
      [['Pay half', 'Payer la moitié'], [[1, 'm-3000 b+7', ['I paid half of {p}’s first car.', 'J’ai payé la moitié de la première voiture de {p}.']]]],
      [['Say no', 'Refuser'], [[1, 'b-6', ['I told {p} to save up for the car.', 'J’ai dit à {p} d’économiser pour sa voiture.']]]]
    ]],
    ['oldparent', 40, 80, 6, 'oldpar', null, ['{Yrel} {p} is getting older and needs more help at home.', '{Yrel} {p} vieillit et a besoin de plus d’aide à la maison.'], [
      [['Visit every week', 'Lui rendre visite chaque semaine'], [[1, 'b+9 h-1 k+3', ['I now visit {myrel} {p} every Sunday. We play cards and talk.', 'Je rends visite à {myrel} {p} tous les dimanches. On joue aux cartes et on discute.']]]],
      [['Pay for a carer', 'Payer une aide à domicile'], [[1, 'm-3000 b+4', ['I hired a carer to help {myrel} {p} at home.', 'J’ai engagé une aide à domicile pour {myrel} {p}.']]]],
      [['Move {him} in with you', 'L’accueillir chez toi'], [[1, 'b+12 h-2 k+4', ['{Myrel} {p} moved in with me. The house is fuller and warmer.', '{Myrel} {p} est venu{pe} vivre chez moi. La maison est plus pleine et plus chaleureuse.']]]]
    ]],
    ['sibwed', 20, 60, 5, 'sib', s => true, ['{Yrel} {p} is getting married!', '{Yrel} {p} se marie !'], [
      [['Give a heartfelt toast', 'Porter un toast émouvant'], [[1, 'b+7 h+4', ['I gave a toast at {myrel} {p}’s wedding. Even the waiters cried.', 'J’ai porté un toast au mariage de {myrel} {p}. Même les serveurs ont pleuré.']]]],
      [['Dance all night', 'Danser toute la nuit'], [[1, 'h+6 b+4', ['I danced all night at {p}’s wedding.', 'J’ai dansé toute la nuit au mariage de {p}.']]]],
      [['Bring a big gift', 'Offrir un beau cadeau'], [[1, 'm-300 b+6', ['I gave {p} and {his} new spouse a beautiful gift.', 'J’ai offert un très beau cadeau à {p} et à son conjoint.']]]]
    ]],
    ['petsick', 1, 120, 6, 'pet', null, ['Your {pet} {p} isn’t eating and seems unwell.', '{Ton} {pet} {p} ne mange plus et a l’air malade.'], [
      [['Go to the vet', 'Aller chez le vétérinaire'], [[6, 'm-150 b+5', ['I took {p} to the vet. A few days of medicine and {he} was fine.', 'J’ai emmené {p} chez le vétérinaire. Quelques jours de médicaments et tout allait bien.']], [1, 'm-150 petdie', ['I took {p} to the vet, but there was nothing they could do.', 'J’ai emmené {p} chez le vétérinaire, mais il n’y avait rien à faire.']]]],
      [['Wait and see', 'Attendre de voir'], [[1, 'b-2', ['I waited, and {p} got better on {his} own.', 'J’ai attendu, et {p} s’est remis{pe} tout{pe} seul{pe}.']], [1, 'b-4 h-2', ['I waited too long and {p} was ill for weeks.', 'J’ai trop attendu et {p} a été malade pendant des semaines.']]]],
      [['Cook {him} something special', 'Lui préparer un repas spécial'], [[1, 'b+4 xcoo+1', ['I cooked {p} a special meal. {He} ate every bite.', 'J’ai préparé un repas spécial pour {p}. {Il} a tout mangé.']]]]
    ], { r: 5 }],
    ['pettrick', 6, 100, 5, 'pet', s => true, ['You could try to teach {p} a trick.', 'Tu pourrais essayer d’apprendre un tour à {p}.'], [
      [['“Sit”', '« Assis »'], [[1, 'b+5 h+3', ['I taught {p} to sit. Well, {he} sits when there is food.', 'J’ai appris à {p} à s’asseoir. Enfin, {il} s’assoit quand il y a à manger.']]]],
      [['“High five”', '« Tope là »'], [[1, 'b+5 h+4', ['{p} can now give me a high five. Best moment of my week.', '{p} sait maintenant me taper dans la main. Meilleur moment de ma semaine.']], [1, 'b+2', ['I tried to teach {p} a high five. {He} looked at me as if I were silly.', 'J’ai essayé d’apprendre à {p} à taper dans la main. {Il} m’a regardé{e} comme si j’étais idiot{e}.']]]],
      [['Just cuddle instead', 'Faire plutôt un câlin'], [[1, 'b+6 h+3', ['I gave up on tricks and cuddled {p} on the sofa.', 'J’ai abandonné les tours et j’ai fait un câlin à {p} sur le canapé.']]]]
    ], { r: 6 }],
    ['cruise', 60, 95, 5, null, s => s.me.ret, ['Now that you’re retired, you have time to travel.', 'Maintenant que tu es à la retraite, tu as le temps de voyager.'], [
      [['Book a cruise', 'Réserver une croisière'], [[1, 'h+9 m-6000 !trip', ['I went on a cruise and learned to dance the tango on deck.', 'J’ai fait une croisière et j’ai appris le tango sur le pont.']]]],
      [['Visit old friends', 'Rendre visite à de vieux amis'], [[1, 'h+6 m-800', ['I travelled around visiting old friends. We laughed like teenagers.', 'J’ai voyagé pour revoir de vieux amis. On a ri comme des ados.']]]],
      [['Stay home and garden', 'Rester jardiner'], [[1, 'H+3 h+3', ['I stayed home and grew the biggest tomatoes on the street.', 'Je suis resté{e} à la maison et j’ai fait pousser les plus grosses tomates de la rue.']]]]
    ], { r: 5 }],
    ['gkidvisit', 50, 110, 6, 'gkid', null, ['Your grandchild {p} comes to stay for the weekend.', 'Ton petit-enfant {p} vient passer le week-end chez toi.'], [
      [['Bake cookies together', 'Faire des biscuits ensemble'], [[1, 'b+8 h+5 xcoo+1', ['{p} and I baked cookies. Most of the dough was eaten raw.', '{p} et moi avons fait des biscuits. La pâte a été mangée crue en grande partie.']]]],
      [['Teach {him} to play chess', 'Lui apprendre les échecs'], [[1, 'b+6 s+1', ['I taught {p} to play chess. {He} beat me by the end of the weekend.', 'J’ai appris les échecs à {p}. {Il} m’a battu{e} avant la fin du week-end.']]]],
      [['Tell stories from your life', 'Raconter des histoires de ta vie'], [[1, 'b+7 h+4', ['I told {p} stories from my life. {He} asked for more every night.', 'J’ai raconté à {p} des histoires de ma vie. {Il} en redemandait chaque soir.']]]]
    ], { r: 3 }],
    ['tablet', 62, 100, 4, null, null, ['Your family gives you a tablet, but it’s very confusing.', 'Ta famille t’offre une tablette, mais c’est très compliqué.'], [
      [['Take a class', 'Prendre un cours'], [[1, 's+3 h+2', ['I took a tablet class at the library. I now send video messages to everyone.', 'J’ai suivi un cours de tablette à la bibliothèque. J’envoie maintenant des vidéos à tout le monde.']]]],
      [['Ask a young relative', 'Demander à un jeune de la famille'], [[1, 'B+3 s+1', ['A young relative showed me the tablet. I now know seven different emojis.', 'Un jeune de la famille m’a montré la tablette. Je connais maintenant sept émojis différents.']]]],
      [['Use it as a tray', 'S’en servir de plateau'], [[1, 'h+1', ['I use the tablet as a tray for my tea. It works perfectly.', 'J’utilise la tablette comme plateau pour mon thé. Ça marche parfaitement.']]]]
    ]],
    ['memoir', 62, 100, 4, null, null, ['Will you write the story of your life?', 'Vas-tu écrire l’histoire de ta vie ?'], [
      [['Write a memoir', 'Écrire des mémoires'], [[s => s.me.sk.wri + s.me.f, 'xwri+5 h+6 f+3 m+8000', ['I wrote my memoir and a publisher actually printed it!', 'J’ai écrit mes mémoires et un éditeur les a vraiment publiées !']], [60, 'xwri+4 h+4 B+3', ['I wrote my memoir. My family read it and loved it.', 'J’ai écrit mes mémoires. Ma famille les a lues et adorées.']]]],
      [['Record videos for the family', 'Enregistrer des vidéos pour la famille'], [[1, 'B+5 h+4', ['I recorded videos telling my life story for my family.', 'J’ai enregistré des vidéos de l’histoire de ma vie pour ma famille.']]]],
      [['Not interested', 'Pas intéressé{e}'], [[1, '', ['I decided my life story would stay in my head.', 'J’ai décidé que l’histoire de ma vie resterait dans ma tête.']]]]
    ]],
    ['parkchess', 55, 100, 4, 'X', null, ['{p}, a regular at the park, challenges you to a game of chess.', '{p}, un{pe} habitué{pe} du parc, te défie aux échecs.'], [
      [['Accept', 'Accepter'], [[s => s.me.st.s, 's+3 h+5 F', ['I beat {p} at chess in the park. We play every Thursday now.', 'J’ai battu {p} aux échecs au parc. On joue tous les jeudis maintenant.']], [50, 's+2 h+2 F', ['{p} beat me at chess but taught me a brilliant opening.', '{p} m’a battu{e} aux échecs mais m’a appris une ouverture géniale.']]]],
      [['Decline', 'Refuser'], [[1, '', ['I declined the chess challenge.', 'J’ai décliné la partie d’échecs.']]]]
    ]],
    ['checkup', 40, 100, 5, null, null, ['Your doctor recommends a yearly check-up.', 'Ton médecin recommande un bilan de santé annuel.'], [
      [['Go to the check-up', 'Faire le bilan'], [[1, 'checkup', ['I went for a full check-up.', 'J’ai fait un bilan de santé complet.']]]],
      [['Skip it this year', 'Le sauter cette année'], [[1, '', ['I skipped my check-up this year.', 'J’ai sauté mon bilan de santé cette année.']]]]
    ], { r: 5 }],
    ['diet', 22, 90, 5, null, null, ['You are thinking about changing your diet.', 'Tu penses à changer ton alimentation.'], [
      [['Eat more vegetables', 'Manger plus de légumes'], [[1, 'H+4 h+1', ['I started eating more vegetables. I feel lighter.', 'J’ai commencé à manger plus de légumes. Je me sens mieux.']]]],
      [['Cut down on sugar', 'Réduire le sucre'], [[1, 'H+3 h-1 l+1', ['I cut down on sugar. The first month was the hardest.', 'J’ai réduit le sucre. Le premier mois a été le plus dur.']]]],
      [['Keep eating what I love', 'Continuer à manger ce que j’aime'], [[1, 'h+2 H-1', ['I kept eating exactly what I love.', 'J’ai continué à manger exactement ce que j’aime.']]]]
    ], { r: 8 }],
    ['sleep', 16, 90, 5, null, null, ['You have been sleeping badly for weeks.', 'Tu dors mal depuis des semaines.'], [
      [['Go to bed earlier', 'Se coucher plus tôt'], [[1, 'H+3 h+2', ['I started going to bed earlier and feel like a new person.', 'J’ai commencé à me coucher plus tôt et je me sens en pleine forme.']]]],
      [['No screens at night', 'Plus d’écrans le soir'], [[1, 'H+3 s+1', ['I stopped using screens before bed and started reading instead.', 'J’ai arrêté les écrans avant de dormir et je lis à la place.']]]],
      [['Ignore it', 'Ignorer'], [[1, 'H-2 h-2', ['I ignored my sleep problems. Coffee became my best friend.', 'J’ai ignoré mes problèmes de sommeil. Le café est devenu mon meilleur ami.']]]]
    ], { r: 8 }],
    ['flood', 20, 100, 3, null, s => olHouse(s), ['A storm has flooded your ground floor.', 'Un orage a inondé ton rez-de-chaussée.'], [
      [['Pay for repairs', 'Payer les réparations'], [[1, 'm-4000 h-3', ['A storm flooded my home. The repairs were expensive.', 'Un orage a inondé mon logement. Les réparations ont coûté cher.']]]],
      [['Call the insurance company', 'Appeler l’assurance'], [[2, 'm-500 h-1', ['My insurance paid for most of the flood repairs.', 'Mon assurance a payé la plupart des réparations après l’inondation.']], [1, 'm-3000 h-4', ['My insurance found a reason not to pay for the flood.', 'Mon assurance a trouvé une excuse pour ne pas payer l’inondation.']]]]
    ], { r: 15 }],
    ['neighbour', 25, 90, 5, null, null, ['Your elderly neighbour is struggling with heavy shopping bags.', 'Ta voisine âgée a du mal à porter ses courses.'], [
      [['Carry them for her', 'Les porter pour elle'], [[1, 'k+5 h+3', ['I carried my neighbour’s shopping. She gave me homemade jam.', 'J’ai porté les courses de ma voisine. Elle m’a donné de la confiture maison.']]]],
      [['Offer to do her shopping weekly', 'Proposer de faire ses courses chaque semaine'], [[1, 'k+8 h+4', ['I now do my neighbour’s shopping every week. She tells everyone about me.', 'Je fais les courses de ma voisine chaque semaine. Elle parle de moi à tout le monde.']]]],
      [['Pretend not to see', 'Faire semblant de ne pas voir'], [[1, 'k-3', ['I pretended not to see my neighbour struggling.', 'J’ai fait semblant de ne pas voir ma voisine en difficulté.']]]]
    ], { r: 8 }],
    ['blood', 18, 65, 4, null, s => s.me.st.H > 40, ['There’s a blood donation drive in town.', 'Il y a une collecte de sang en ville.'], [
      [['Donate', 'Donner son sang'], [[1, 'k+6 H-1 h+2', ['I donated blood. They gave me a biscuit and a sticker.', 'J’ai donné mon sang. On m’a offert un biscuit et un autocollant.']]]],
      [['Not today', 'Pas aujourd’hui'], [[1, '', ['I didn’t donate blood this time.', 'Je n’ai pas donné mon sang cette fois.']]]]
    ], { r: 3 }],
    ['celeb', 12, 90, 4, null, null, ['You spot a famous actor in a café.', 'Tu repères un acteur célèbre dans un café.'], [
      [['Ask for a selfie', 'Demander un selfie'], [[2, 'h+5', ['I got a selfie with a famous actor. I have looked at it about a thousand times.', 'J’ai eu un selfie avec un acteur célèbre. Je l’ai regardé environ mille fois.']], [1, 'h-1', ['I asked a famous actor for a selfie. He said he was not who I thought.', 'J’ai demandé un selfie à un acteur célèbre. Il a dit qu’il n’était pas celui que je croyais.']]]],
      [['Play it cool', 'Rester naturel{le}'], [[1, 'h+2', ['I played it cool near the famous actor. He nodded at me.', 'Je suis resté{e} naturel{le} près de l’acteur. Il m’a fait un signe de tête.']]]],
      [['Tell him you loved his last film', 'Lui dire que tu as adoré son dernier film'], [[1, 'h+4', ['I told the actor I loved his last film. He bought me a hot chocolate.', 'J’ai dit à l’acteur que j’avais adoré son dernier film. Il m’a offert un chocolat chaud.']]]]
    ]],
    ['startup', 22, 55, 4, null, s => s.me.sk.cod >= 50 || s.me.st.s >= 78, ['You have an idea for an app. Will you start your own company?', 'Tu as une idée d’application. Vas-tu créer ta propre entreprise ?'], [
      [['Go for it', 'Se lancer'], [[1, 'startup', ['I started my own company.', 'J’ai créé ma propre entreprise.']]]],
      [['Keep it as a side project', 'En faire un projet perso'], [[1, 'xcod+4 s+2 h+2', ['I built my app idea on weekends. A few hundred people use it.', 'J’ai développé mon idée le week-end. Quelques centaines de personnes l’utilisent.']]]],
      [['Forget about it', 'Oublier'], [[1, '', ['I let my app idea go.', 'J’ai laissé tomber mon idée d’application.']]]]
    ]],
    ['quiz', 18, 85, 4, null, s => s.me.st.s >= 65, ['You have been invited onto a TV quiz show.', 'Tu es invité{e} à un jeu télévisé.'], [
      [['Go for the big prize', 'Viser le gros lot'], [[s => s.me.st.s - 45, 'm+50000 f+5 h+10 !quiz', ['I won the big prize on a TV quiz show!', 'J’ai gagné le gros lot d’un jeu télévisé !']], [55, 'f+2 h-2', ['I went for the big prize on the quiz show and lost it all on the last question.', 'J’ai visé le gros lot du jeu télévisé et tout perdu à la dernière question.']]]],
      [['Take the safe money', 'Prendre le gain assuré'], [[1, 'm+5000 f+2 h+4', ['I took the safe money on the TV quiz show and went home happy.', 'J’ai pris le gain assuré du jeu télévisé et je suis rentré{e} content{e}.']]]],
      [['Decline', 'Refuser'], [[1, '', ['I said no to the TV quiz show.', 'J’ai refusé le jeu télévisé.']]]]
    ]],
    ['donate', 30, 100, 4, null, s => s.me.m > 20000, ['A children’s hospital is raising money for a new wing.', 'Un hôpital pour enfants récolte des fonds pour une nouvelle aile.'], [
      [['Donate generously', 'Donner généreusement'], [[1, 'donate:10 k+10 f+2 h+5', ['I gave a generous donation to the children’s hospital.', 'J’ai fait un don généreux à l’hôpital pour enfants.']]]],
      [['Give a little', 'Donner un peu'], [[1, 'm-200 k+3 h+2', ['I gave a small donation to the children’s hospital.', 'J’ai fait un petit don à l’hôpital pour enfants.']]]],
      [['Not this time', 'Pas cette fois'], [[1, 'k-1', ['I didn’t donate this time.', 'Je n’ai pas fait de don cette fois.']]]]
    ], { r: 10 }],
    ['oldfriend', 30, 100, 5, 'friend', null, ['{p}, an old friend, calls you out of the blue.', '{p}, {un} ami{pe} de longue date, t’appelle sans prévenir.'], [
      [['Meet for coffee', 'Se retrouver autour d’un café'], [[1, 'b+9 h+4', ['I met {p} for coffee. Three hours flew by.', 'J’ai retrouvé {p} pour un café. Trois heures sont passées en un éclair.']]]],
      [['Have a long chat on the phone', 'Discuter longuement au téléphone'], [[1, 'b+5 h+2', ['I chatted with {p} on the phone for an hour.', 'J’ai discuté avec {p} au téléphone pendant une heure.']]]],
      [['Let it ring', 'Laisser sonner'], [[1, 'b-6', ['I let {p}’s call go to voicemail.', 'J’ai laissé l’appel de {p} partir sur la messagerie.']]]]
    ], { r: 5 }],
    ['concert', 14, 80, 4, null, null, ['There’s a free concert in the park tonight.', 'Il y a un concert gratuit au parc ce soir.'], [
      [['Go and dance', 'Y aller et danser'], [[1, 'h+5 a+1', ['I danced at a free concert in the park until the last song.', 'J’ai dansé au concert gratuit du parc jusqu’à la dernière chanson.']]]],
      [['Listen from your window', 'Écouter depuis ta fenêtre'], [[1, 'h+2', ['I listened to the concert from my window with a cup of tea.', 'J’ai écouté le concert depuis ma fenêtre avec une tasse de thé.']]]]
    ], { r: 4 }],
    ['relocate', 25, 58, 4, null, s => s.me.job && s.me.job.t === 'f' && olCanPromote(s), ['Your company offers you a promotion if you move to {city}.', 'Ton entreprise te propose une promotion si tu déménages à {city}.'], [
      [['Accept and move', 'Accepter et déménager'], [[1, 'promote h+2 friendsdown', ['I accepted a promotion and moved to {city}.', 'J’ai accepté une promotion et j’ai déménagé à {city}.']]]],
      [['Decline and stay', 'Refuser et rester'], [[1, 'B+2', ['I turned down the promotion to stay close to my family and friends.', 'J’ai refusé la promotion pour rester près de ma famille et de mes amis.']]]]
    ]],
    ['learnlang', 18, 80, 4, null, null, ['A friend suggests learning a new language together.', 'Un ami te propose d’apprendre une nouvelle langue ensemble.'], [
      [['Japanese', 'Le japonais'], [[1, 'xlan+6 s+2', ['I started learning Japanese. I can now order noodles very politely.', 'J’ai commencé le japonais. Je sais maintenant commander des nouilles très poliment.']]]],
      [['Spanish', 'L’espagnol'], [[1, 'xlan+6 s+2', ['I started learning Spanish and practise with a pen pal in Seville.', 'J’ai commencé l’espagnol et je m’entraîne avec une correspondante à Séville.']]]],
      [['Sign language', 'La langue des signes'], [[1, 'xlan+5 k+3 s+2', ['I learned sign language and can now chat with my deaf neighbour.', 'J’ai appris la langue des signes et je peux discuter avec mon voisin sourd.']]]],
      [['Maybe later', 'Peut-être plus tard'], [[1, '', ['I decided not to learn a language this year.', 'J’ai décidé de ne pas apprendre de langue cette année.']]]]
    ]],
    ['lostdog', 10, 90, 4, null, null, ['You find a lost dog with a name tag.', 'Tu trouves un chien perdu avec une médaille.'], [
      [['Call the number on the tag', 'Appeler le numéro de la médaille'], [[1, 'k+5 h+4', ['I found a lost dog and called its owner. The dog licked my whole face.', 'J’ai trouvé un chien perdu et j’ai appelé sa propriétaire. Le chien m’a léché tout le visage.']]]],
      [['Take it to a vet', 'L’emmener chez un vétérinaire'], [[1, 'k+4 h+2', ['I took the lost dog to a vet, who scanned its chip and found the family.', 'J’ai emmené le chien chez un vétérinaire, qui a lu sa puce et retrouvé sa famille.']]]],
      [['Walk away', 'Passer ton chemin'], [[1, 'k-3', ['I walked past the lost dog. I hope someone helped it.', 'Je suis passé{e} devant le chien perdu sans m’arrêter. J’espère que quelqu’un l’a aidé.']]]]
    ]],
    ['garage', 30, 90, 3, null, s => olHouse(s), ['Your garage is full of things you never use.', 'Ton garage est plein d’objets dont tu ne te sers jamais.'], [
      [['Hold a garage sale', 'Organiser un vide-grenier'], [[1, 'm+400 h+3', ['I held a garage sale and made some money. I bought nothing back. Almost.', 'J’ai fait un vide-grenier et gagné un peu d’argent. Je n’ai rien racheté. Presque.']]]],
      [['Give everything to charity', 'Tout donner à une association'], [[1, 'k+5 h+3', ['I gave everything in my garage to charity.', 'J’ai donné tout le contenu de mon garage à une association.']]]],
      [['Keep it all, just in case', 'Tout garder, au cas où'], [[1, '', ['I kept everything in the garage, just in case.', 'J’ai tout gardé dans le garage, au cas où.']]]]
    ]]
  ];

  const OL_PE = [
    [0, 1, 6, null, 'h+2', ['I learned to crawl, mostly backwards.', 'J’ai appris à ramper, surtout en marche arrière.']],
    [1, 1, 8, null, 'a+1 h+2', ['I took my first steps and walked straight into the sofa.', 'J’ai fait mes premiers pas, droit dans le canapé.']],
    [0, 2, 4, null, 'h+3', ['I laughed for the first time when the dog sneezed.', 'J’ai ri pour la première fois quand le chien a éternué.']],
    [1, 3, 4, null, 'h+1', ['I spent most of the year saying “no” to everything.', 'J’ai passé presque toute l’année à dire « non » à tout.']],
    [2, 4, 4, null, 's+1', ['I learned to count to ten. Eleven is still a mystery.', 'J’ai appris à compter jusqu’à dix. Onze reste un mystère.']],
    [2, 4, 3, null, 'h+2', ['I insisted on wearing my rain boots every day, even in summer.', 'J’ai tenu à porter mes bottes de pluie tous les jours, même en été.']],
    [3, 5, 3, null, 's+2', ['I asked “why?” about four hundred times a day.', 'J’ai demandé « pourquoi ? » environ quatre cents fois par jour.']],
    [3, 6, 3, null, 'xart+2', ['I drew a portrait of my family. Everyone had seven fingers.', 'J’ai dessiné ma famille. Tout le monde avait sept doigts.']],
    [4, 7, 4, null, 'a+2 h+2', ['I learned to ride a bike without stabilisers.', 'J’ai appris à faire du vélo sans petites roues.']],
    [4, 8, 4, null, 'H+2 a+2', ['I learned to swim.', 'J’ai appris à nager.']],
    [5, 9, 3, null, 'h-2', ['I lost my favourite teddy bear at the supermarket.', 'J’ai perdu mon doudou préféré au supermarché.']],
    [5, 10, 3, null, 's+2', ['I learned to read my first real book on my own.', 'J’ai lu mon premier vrai livre tout{e} seul{e}.']],
    [6, 11, 3, null, 'h+3', ['I won a goldfish at the funfair.', 'J’ai gagné un poisson rouge à la fête foraine.'], 'pet:fish'],
    [6, 12, 3, null, 'h+2', ['I built a treehouse with some friends. It is mostly a platform.', 'J’ai construit une cabane avec des amis. C’est surtout une plateforme.']],
    [6, 12, 3, null, 's+1 h+1', ['I started collecting stones that look like animals.', 'J’ai commencé une collection de cailloux qui ressemblent à des animaux.']],
    [7, 12, 3, null, 'h-3', ['My best friend moved to another city.', 'Mon meilleur ami a déménagé dans une autre ville.']],
    [7, 13, 3, null, 'h+2', ['I learned to whistle. Nobody at home can stop me now.', 'J’ai appris à siffler. Plus personne à la maison ne peut m’arrêter.']],
    [8, 13, 2, null, 's+2', ['I read every book about space in the school library.', 'J’ai lu tous les livres sur l’espace de la bibliothèque de l’école.']],
    [8, 14, 3, null, 'h+2', ['I discovered that I really love {subj}.', 'J’ai découvert que j’adore {subj}.']],
    [8, 16, 2, null, 'h-2', ['I discovered that I really don’t like {subj}.', 'J’ai découvert que je n’aime vraiment pas {subj}.']],
    [10, 14, 3, null, 'l-1', ['I got braces. Smiling feels strange.', 'J’ai eu un appareil dentaire. Sourire me fait bizarre.']],
    [12, 16, 4, null, 'l+2 a+1', ['I grew ten centimetres this year.', 'J’ai pris dix centimètres cette année.']],
    [12, 15, 3, null, 'h+1', ['I started keeping a diary.', 'J’ai commencé à tenir un journal intime.']],
    [12, 17, 3, null, 'h-2', ['I had a big argument with my best friend. We made up a week later.', 'Je me suis disputé{e} avec mon meilleur ami. On s’est réconciliés une semaine plus tard.']],
    [13, 17, 3, null, 's+1', ['I stayed up late reading about black holes.', 'J’ai veillé tard en lisant des articles sur les trous noirs.']],
    [13, 18, 3, null, 'h+3', ['I went to my first concert with friends.', 'Je suis allé{e} à mon premier concert avec des amis.']],
    [14, 18, 3, null, 'xcoo+2', ['I cooked dinner for the whole family for the first time.', 'J’ai préparé le dîner pour toute la famille pour la première fois.']],
    [15, 19, 2, null, 'h-1', ['I realised that adults also don’t know what they are doing.', 'J’ai compris que les adultes non plus ne savent pas toujours ce qu’ils font.']],
    [18, 30, 3, null, 'xcoo+3', ['I learned to cook a proper risotto.', 'J’ai appris à faire un vrai risotto.']],
    [18, 30, 3, null, 'h+2', ['I finally put together a piece of flat-pack furniture without spare screws.', 'J’ai enfin monté un meuble en kit sans qu’il reste de vis.']],
    [18, 40, 3, null, 'H+2 a+1', ['I ran my first 5K.', 'J’ai couru mes premiers 5 km.']],
    [18, 50, 2, null, 'h+3', ['I watched the sunrise from a mountain top.', 'J’ai regardé le lever du soleil depuis le sommet d’une montagne.']],
    [20, 60, 3, null, 'h+2', ['I grew herbs on my windowsill. The basil is thriving.', 'J’ai fait pousser des herbes sur mon rebord de fenêtre. Le basilic se porte très bien.']],
    [20, 60, 2, null, 'h-2', ['I lost my keys four times this year.', 'J’ai perdu mes clés quatre fois cette année.']],
    [20, 70, 2, null, 'h+2', ['A neighbour’s cat decided my home is its second home.', 'Le chat d’un voisin a décidé que chez moi était sa résidence secondaire.']],
    [22, 60, 3, null, 's+2', ['I read twenty books this year.', 'J’ai lu vingt livres cette année.']],
    [25, 60, 2, null, 'H+2', ['I took up yoga.', 'Je me suis mis{e} au yoga.']],
    [25, 70, 2, null, 'h+2', ['I learned the names of all the stars I can see from my window.', 'J’ai appris le nom de toutes les étoiles visibles depuis ma fenêtre.']],
    [28, 45, 2, null, 'l-1', ['I needed glasses for the first time.', 'J’ai eu besoin de lunettes pour la première fois.']],
    [35, 50, 3, null, 'l-1', ['I found my first grey hair.', 'J’ai trouvé mon premier cheveu blanc.']],
    [35, 70, 2, null, 'h+2', ['I finally learned how to fold a fitted sheet.', 'J’ai enfin appris à plier un drap-housse.']],
    [40, 70, 2, null, 'H-1', ['My knees started making noises on the stairs.', 'Mes genoux ont commencé à grincer dans les escaliers.']],
    [45, 80, 2, null, 'h+2', ['I planted a tree. Someone will enjoy its shade one day.', 'J’ai planté un arbre. Quelqu’un profitera de son ombre un jour.']],
    [55, 90, 3, null, 'H+2 h+2', ['I joined a walking group.', 'J’ai rejoint un groupe de marche.']],
    [60, 100, 3, null, 'h+2', ['I learned to make video calls to see the family.', 'J’ai appris à faire des appels vidéo pour voir la famille.']],
    [60, 100, 2, null, 'h+3', ['I became the best gardener on my street.', 'Je suis devenu{e} le meilleur jardinier de ma rue.']],
    [65, 100, 2, null, 'H-1', ['My knees now predict the weather better than the forecast.', 'Mes genoux prédisent la météo mieux que la télévision.']],
    [65, 100, 2, null, 's+1', ['I started doing a crossword every morning.', 'J’ai commencé à faire des mots croisés chaque matin.']],
    [70, 110, 2, null, 'h+2', ['I told the same funny story at every family dinner. It got funnier every time.', 'J’ai raconté la même histoire drôle à chaque repas de famille. Elle était plus drôle à chaque fois.']],
    [70, 110, 2, null, 'h+1', ['I finally finished the jigsaw puzzle I started twenty years ago.', 'J’ai enfin terminé le puzzle commencé il y a vingt ans.']],
    [8, 17, 3, s => s.me.fl.team, 'a+2 h+3', ['My {sport} team won the regional final!', 'Mon équipe de {sport} a gagné la finale régionale !']],
    [8, 17, 2, s => s.me.fl.team, 'a+1 h-2', ['My {sport} team lost every match this season, but we had fun.', 'Mon équipe de {sport} a perdu tous ses matchs cette saison, mais on s’est bien amusés.']],
    [6, 70, 2, s => s.me.sk.mus >= 50, 'xmus+2 h+3', ['I played music in front of an audience and nobody left.', 'J’ai joué de la musique devant un public et personne n’est parti.']],
    [6, 90, 2, s => s.me.sk.art >= 50, 'xart+2 h+3', ['One of my paintings was hung in a local exhibition.', 'Un de mes tableaux a été exposé dans une galerie du quartier.']],
    [10, 90, 2, s => s.me.sk.cod >= 50, 'xcod+2 s+1', ['I built a small game in my spare time. My friends are hooked.', 'J’ai créé un petit jeu sur mon temps libre. Mes amis sont accros.']],
    [10, 90, 2, s => s.me.sk.wri >= 50, 'xwri+2 h+2', ['One of my short stories won a local writing prize.', 'Une de mes nouvelles a gagné un prix d’écriture local.']],
    [10, 90, 2, s => s.me.sk.coo >= 50, 'xcoo+2 h+2', ['My signature dish is now famous among my friends.', 'Mon plat signature est maintenant célèbre parmi mes amis.']],
    [10, 90, 2, s => s.me.sk.lan >= 50, 'xlan+2 h+2', ['I had a whole conversation with a tourist in their own language.', 'J’ai tenu toute une conversation avec un touriste dans sa langue.']],
    [16, 80, 2, s => s.me.f >= 40, 'f+1 h+2', ['A stranger recognised me in the street and asked for an autograph.', 'Un inconnu m’a reconnu{e} dans la rue et m’a demandé un autographe.']],
    [5, 100, 2, s => s.me.k >= 75, 'h+3', ['People keep telling me I am the kindest person they know.', 'On me répète que je suis la personne la plus gentille qu’on connaisse.']],
    [18, 90, 2, s => s.me.m < 0, 'h-3', ['I am struggling to pay my bills.', 'J’ai du mal à payer mes factures.']]
  ];

  const OL_JP = {
    teach: [['One of my former students wrote to thank me for believing in them.', 'Un ancien élève m’a écrit pour me remercier d’avoir cru en lui.'], ['My class put on a play that made the whole school laugh.', 'Ma classe a monté une pièce qui a fait rire toute l’école.']],
    nurse: [['I held a frightened patient’s hand all night. She recovered.', 'J’ai tenu la main d’une patiente effrayée toute la nuit. Elle s’est rétablie.'], ['I worked through a very long winter of flu season.', 'J’ai travaillé pendant un très long hiver de grippe.']],
    doctor: [['I saved a patient’s life in the emergency room.', 'J’ai sauvé la vie d’un patient aux urgences.'], ['I spotted a rare illness that three other doctors had missed.', 'J’ai repéré une maladie rare que trois autres médecins n’avaient pas vue.']],
    dev: [['I fixed a bug that had haunted the whole team for weeks.', 'J’ai corrigé un bug qui hantait toute l’équipe depuis des semaines.'], ['An app I helped build reached a million users.', 'Une application à laquelle j’ai participé a atteint un million d’utilisateurs.']],
    engin: [['A bridge I helped design opened to the public.', 'Un pont que j’ai aidé à concevoir a été inauguré.']],
    cook: [['A food critic praised my dessert in the newspaper.', 'Un critique gastronomique a vanté mon dessert dans le journal.'], ['I survived the busiest Saturday service of the year.', 'J’ai survécu au service du samedi le plus chargé de l’année.']],
    police: [['I found a lost child in the market and brought her back to her parents.', 'J’ai retrouvé une enfant perdue au marché et je l’ai ramenée à ses parents.']],
    fire: [['I rescued a family’s dog from a burning house.', 'J’ai sauvé le chien d’une famille d’une maison en feu.'], ['I visited a primary school to teach fire safety. The children loved the helmet.', 'J’ai fait une intervention de prévention dans une école. Les enfants ont adoré le casque.']],
    lawyer: [['I won a difficult case for a family who had lost everything.', 'J’ai gagné une affaire difficile pour une famille qui avait tout perdu.']],
    vetj: [['I helped a cow give birth to twin calves at 3 a.m.', 'J’ai aidé une vache à mettre bas des jumeaux à 3 h du matin.']],
    music: [['A song I wrote was played on the radio.', 'Une chanson que j’ai écrite est passée à la radio.']],
    actor: [['I was recognised in a supermarket for a role I played.', 'On m’a reconnu{e} au supermarché pour un rôle que j’ai joué.']],
    athl: [['I broke my personal record in front of a full stadium.', 'J’ai battu mon record personnel devant un stade plein.']],
    writer: [['A reader sent me a letter saying my book changed their life.', 'Un lecteur m’a écrit que mon livre avait changé sa vie.']],
    farm: [['We had the best harvest in ten years.', 'On a eu la meilleure récolte depuis dix ans.']],
    retail: [['A customer came back just to thank me for my help.', 'Un client est revenu uniquement pour me remercier de mon aide.']],
    pilot: [['I landed a plane safely in a storm. The passengers applauded.', 'J’ai posé un avion en pleine tempête. Les passagers ont applaudi.']],
    astro: [['I spent six months on the space station and saw sixteen sunrises a day.', 'J’ai passé six mois dans la station spatiale et vu seize levers de soleil par jour.']],
    prof: [['I published a paper that other researchers keep quoting.', 'J’ai publié un article que d’autres chercheurs citent sans arrêt.']],
    lab: [['My experiment finally worked after two hundred tries.', 'Mon expérience a enfin marché après deux cents essais.']]
  };

  const OL_IV = [
    [['Why do you want this job?', 'Pourquoi voulez-vous ce poste ?'], [[['I love this kind of work and I learn fast.', 'J’aime ce type de travail et j’apprends vite.'], 12], [['Mainly for the money, honestly.', 'Surtout pour l’argent, honnêtement.'], -8], [['My parents told me to apply.', 'Mes parents m’ont dit de postuler.'], -12]]],
    [['What is your biggest weakness?', 'Quel est votre plus grand défaut ?'], [[['I can be too much of a perfectionist.', 'Je suis parfois trop perfectionniste.'], 0], [['I used to be shy, but I’m working on it.', 'J’étais timide, mais je travaille dessus.'], 10], [['I don’t have any.', 'Je n’en ai aucun.'], -10]]],
    [['Tell us about a time you solved a problem.', 'Racontez-nous une fois où vous avez résolu un problème.'], [[['I organised a team to fix a project that was going wrong.', 'J’ai réuni une équipe pour sauver un projet qui partait mal.'], 12], [['I can’t think of one right now.', 'Je n’en vois pas pour l’instant.'], -12], [['I usually ask someone else to solve them.', 'D’habitude, je demande à quelqu’un d’autre.'], -6]]],
    [['Where do you see yourself in five years?', 'Où vous voyez-vous dans cinq ans ?'], [[['Growing with this company and taking on more responsibility.', 'En train d’évoluer dans cette entreprise avec plus de responsabilités.'], 10], [['In your chair.', 'Dans votre fauteuil.'], 3], [['On a beach, retired.', 'Sur une plage, à la retraite.'], -10]]],
    [['How do you handle pressure?', 'Comment gérez-vous la pression ?'], [[['I make a plan and take things one step at a time.', 'Je fais un plan et j’avance étape par étape.'], 12], [['I panic, but quietly.', 'Je panique, mais discrètement.'], -4], [['I avoid pressure completely.', 'J’évite complètement la pression.'], -8]]],
    [['Why should we choose you?', 'Pourquoi devrions-nous vous choisir ?'], [[['I am reliable, curious and I work well with others.', 'Je suis fiable, curieux et j’aime travailler en équipe.'], 12], [['Because I really need a job.', 'Parce que j’ai vraiment besoin d’un travail.'], -4], [['Because the other candidates are worse.', 'Parce que les autres candidats sont moins bons.'], -10]]]
  ];

  const OL_FEM = { Infirmier: 'Infirmière', Pompier: 'Pompière', Facteur: 'Factrice', Vendeur: 'Vendeuse', Directeur: 'Directrice', Chercheur: 'Chercheuse', Développeur: 'Développeuse', Coiffeur: 'Coiffeuse', Agriculteur: 'Agricultrice', Conducteur: 'Conductrice', Traducteur: 'Traductrice', Mécanicien: 'Mécanicienne', Électricien: 'Électricienne', Technicien: 'Technicienne', Musicien: 'Musicienne', Plongeur: 'Plongeuse', Avocat: 'Avocate', Associé: 'Associée', associé: 'associée', Candidat: 'Candidate', Auteur: 'Autrice', Créateur: 'Créatrice', Entraîneur: 'Entraîneuse', Inspecteur: 'Inspectrice', Rédacteur: 'Rédactrice', Chirurgien: 'Chirurgienne', Professeur: 'Professeure', Banquier: 'Banquière', Commandant: 'Commandante', Préparateur: 'Préparatrice', Ouvrier: 'Ouvrière', Exploitant: 'Exploitante', Brigadier: 'Brigadière', Apprenti: 'Apprentie', 'Aide-soignant': 'Aide-soignante', Téléconseiller: 'Téléconseillère', Superviseur: 'Superviseuse', Gérant: 'Gérante', Promeneur: 'Promeneuse', Livreur: 'Livreuse', 'Chauffeur-livreur': 'Chauffeuse-livreuse', Caissier: 'Caissière', Serveur: 'Serveuse', Figurant: 'Figurante', Comédien: 'Comédienne', Acteur: 'Actrice', Assistant: 'Assistante', assistant: 'assistante', Ingénieur: 'Ingénieure', Analyste: 'Analyste', Agent: 'Agente', Élève: 'Élève', Fonctionnaire: 'Fonctionnaire', 'Haut': 'Haute', junior: 'junior', principal: 'principale', adjoint: 'adjointe', débutant: 'débutante', signé: 'signée', exposé: 'exposée', indépendant: 'indépendante', publié: 'publiée', 'semi-professionnel': 'semi-professionnelle', professionnel: 'professionnelle', mécanicien: 'mécanicienne', électricien: 'électricienne', Maître: 'Maîtresse', Athlète: 'Athlète', Interprète: 'Interprète', Copilote: 'Copilote', Peintre: 'Peintre', Chef: 'Cheffe', Commissaire: 'Commissaire', particulier: 'particulière', financier: 'financière', régional: 'régionale', Second: 'Seconde', coiffeur: 'coiffeuse' };

  const OL_V = 1;
  const OL_SK = ['mus', 'art', 'cod', 'act', 'lan', 'coo', 'wri'];
  const OL_SKN = { mus: 'Music', art: 'Art', cod: 'Coding', act: 'Acting', lan: 'Languages', coo: 'Cooking', wri: 'Writing' };
  const OL_JOBM = {}, OL_HOUSEM = {}, OL_CARM = {}, OL_PETM = {}, OL_ILLM = {}, OL_MAJM = {}, OL_GRADM = {}, OL_AWM = {}, OL_EVM = {};
  OL_JOB.forEach(j => { OL_JOBM[j[0]] = j; });
  OL_HOUSE.forEach(h => { OL_HOUSEM[h[0]] = h; });
  OL_CAR.forEach(c => { OL_CARM[c[0]] = c; });
  OL_PET.forEach(p => { OL_PETM[p[0]] = p; });
  OL_ILL.forEach(i => { OL_ILLM[i[0]] = i; });
  OL_MAJ.forEach(m => { OL_MAJM[m[0]] = m; });
  OL_GRAD.forEach(g => { OL_GRADM[g[0]] = g; });
  OL_AW.forEach(a => { OL_AWM[a[0]] = a; });
  OL_EV.forEach(e => { OL_EVM[e[0]] = e; });
  const OL_SKIN = ['#f7dcc8', '#efc3a2', '#dba47c', '#bb7d57', '#8f5b3c', '#5f3c29'];
  const OL_HAIR = ['#2a211e', '#4b3122', '#7b4a2a', '#a4532c', '#d8b066', '#c25230', '#3b78d6', '#ee6aa7', '#3f9e52'];
  const OL_EYE = ['#5b3a24', '#3b5f8a', '#4f7a43', '#2c2420'];
  const OL_SHIRT = ['#5b8def', '#ef6f6c', '#40b98c', '#f2b542', '#9b6be0', '#ef8a3c', '#3fb3c9', '#e46fa8'];
  const OL_INST = [['piano', 'du piano'], ['guitar', 'de la guitare'], ['violin', 'du violon'], ['drums', 'de la batterie'], ['singing', 'du chant'], ['trumpet', 'de la trompette']];
  const OL_TRAIT = [['funny', 'drôle'], ['kind', 'gentil'], ['clever', 'brillant'], ['sporty', 'sportif'], ['artistic', 'artiste'], ['calm', 'calme'], ['chatty', 'bavard'], ['curious', 'curieux'], ['loyal', 'loyal'], ['adventurous', 'aventurier']];
  const OL_TRAITF = { gentil: 'gentille', brillant: 'brillante', sportif: 'sportive', bavard: 'bavarde', curieux: 'curieuse', loyal: 'loyale', aventurier: 'aventurière' };
  const OL_TRIP = [[['a beach holiday in Portugal', 'des vacances à la plage au Portugal'], 1200], [['a city break in Rome', 'un week-end à Rome'], 900], [['a ski trip in the Alps', 'un séjour au ski dans les Alpes'], 2100], [['a road trip across Canada', 'un road trip à travers le Canada'], 3600], [['a safari in Kenya', 'un safari au Kenya'], 4800], [['an adventure in Tokyo', 'une aventure à Tokyo'], 4200], [['a camping trip in the mountains', 'du camping en montagne'], 400], [['a cruise around Greece', 'une croisière en Grèce'], 3000]];

  const olR = Math.random;
  const olI = (a, b) => a + Math.floor(olR() * (b - a + 1));
  const olP = a => a[Math.floor(olR() * a.length)];
  const olC = (v, a = 0, b = 100) => (v < a ? a : v > b ? b : v);
  const olLang = () => (window.gpI18n && gpI18n.lang) || 'en';
  const olFr = () => olLang() === 'fr';
  const L = (s, o) => { let t = window.gpI18n && gpI18n.t ? gpI18n.t(s) : s; if (typeof t !== 'string') t = s; return o ? t.replace(/\{(\w+)\}/g, (m, k) => (k in o ? o[k] : m)) : t; };
  const X = p => (p == null ? '' : typeof p === 'string' ? p : (olFr() && p[1]) || p[0]);
  const olEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const olW = (list, wf) => { let t = 0; const w = list.map(x => { const v = Math.max(0, wf(x)); t += v; return v; }); if (t <= 0) return null; let r = olR() * t; for (let i = 0; i < list.length; i++) { r -= w[i]; if (r < 0) return list[i]; } return list[list.length - 1]; };
  const olNF = {};
  function olMoney(v, li) {
    const lg = li === 0 ? 'en' : li === 1 ? 'fr' : olLang();
    const key = lg + (Math.abs(v) >= 1e7 ? 'c' : '');
    if (!olNF[key]) {
      const loc = { en: 'en-US', fr: 'fr-FR', es: 'es-ES', de: 'de-DE', it: 'it-IT', pt: 'pt-PT' }[lg] || 'en-US';
      try { olNF[key] = new Intl.NumberFormat(loc, { style: 'currency', currency: lg === 'en' ? 'USD' : 'EUR', maximumFractionDigits: key.endsWith('c') ? 1 : 0, notation: key.endsWith('c') ? 'compact' : 'standard' }); } catch (e) { olNF[key] = { format: n => (lg === 'en' ? '$' : '€') + Math.round(n) }; }
    }
    return olNF[key].format(Math.round(v));
  }
  const olMoneyTxt = s => s.replace(/\{\$(-?\d+)\}/g, (m, n) => olMoney(+n));
  const olLow = s => s.charAt(0).toLowerCase() + s.slice(1);
  const olArt = s => (/^[aeiou]/i.test(s) ? 'an ' : 'a ') + olLow(s);
  function olFem(t) { return t.split(' ').map(w => OL_FEM[w] || w).join(' '); }
  function olJobT(id, lvl, g, li) {
    const j = OL_JOBM[id];
    if (!j) return '';
    const l = j[6][Math.min(lvl, j[6].length - 1)];
    if (li === 0) return l[0];
    if (li === 1) return g === 'f' ? olFem(l[1]) : l[1];
    return olFr() ? (g === 'f' ? olFem(l[1]) : l[1]) : l[0];
  }
  const olJobPair = (id, lvl, g) => [olJobT(id, lvl, g, 0), olJobT(id, lvl, g, 1)];
  const olTrait = (t, g, li) => (li === 1 ? (g === 'f' && OL_TRAITF[t[1]]) || t[1] : t[0]);

  function olName(g) { return olP(OL_NM[g === 'f' ? 'f' : 'm']); }
  function olLook(g) { const lg = olR() < 0.72; return { sk: olI(0, 5), hc: olI(0, 5), hs: g === 'f' ? (lg ? olP([1, 3]) : olP([0, 2])) : g === 'm' ? (lg ? olP([0, 2]) : olP([1, 3])) : olI(0, 3), ec: olI(0, 3), sh: olI(0, 7), bd: g === 'm' && olR() < 0.35 ? 1 : 0, gl: olR() < 0.3 ? 1 : 0 }; }
  function olPerson(s, r, g, age, o) {
    let n = olName(g);
    for (let t = 0; t < 8 && (s.pp.some(q => q.al && q.n === n && q.r !== 'friend') || (s.me && s.me.fn === n)); t++) n = olName(g);
    const p = Object.assign({ i: ++s.nid, r, n, g, age, al: 1, b: olI(55, 80), lk: olLook(g), d: [] }, o || {});
    if (p.lk && r === 'kid' && s.me) p.lk.sk = olR() < 0.5 ? s.me.lk.sk : olC(s.me.lk.sk + olI(-1, 1), 0, 5);
    s.pp.push(p);
    return p;
  }
  function olTemp(s, age) { const g = olP(['m', 'f']); return { t: 1, i: 0, r: 'tmp', n: olName(g), ln: olP(OL_NM.l), g, age: Math.max(3, age), lk: olLook(g), b: 50, al: 1, d: [] }; }
  const olAlive = (s, r) => s.pp.filter(p => p.al && (!r || p.r === r));
  const olLove = s => s.pp.find(p => p.al && p.r === 'love');
  function olHasPet(s) { return s.pp.some(p => p.al && p.r === 'pet'); }
  function olHasCar(s) { return s.me.as.some(a => a.t === 'car' && OL_CARM[a.id] && OL_CARM[a.id][4]); }
  function olHouse(s) { return s.me.as.find(a => a.t === 'house'); }
  function olAt(s, ...k) { return !!s.me.sch && k.includes(s.me.sch.k); }
  function olCanPromote(s) { const j = s.me.job; if (!j) return false; const d = OL_JOBM[j.id]; return !!d && j.lvl < d[6].length - 1; }
  function olWorth(s) { const me = s.me; let w = me.m - me.debt; me.as.forEach(a => { w += a.v - (a.lo || 0); }); return Math.round(w); }

  function olRel(p, me) {
    const f = p.g === 'f';
    switch (p.r) {
      case 'mom': return ['mother', 'mère', 'ta', 'ma'];
      case 'dad': return ['father', 'père', 'ton', 'mon'];
      case 'sib': return f ? ['sister', 'sœur', 'ta', 'ma'] : ['brother', 'frère', 'ton', 'mon'];
      case 'gp': return f ? ['grandmother', 'grand-mère', 'ta', 'ma'] : ['grandfather', 'grand-père', 'ton', 'mon'];
      case 'friend': return f ? ['friend', 'amie', 'ton', 'mon'] : ['friend', 'ami', 'ton', 'mon'];
      case 'love':
        if (p.st === 'mar') return f ? ['wife', 'femme', 'ta', 'ma'] : ['husband', 'mari', 'ton', 'mon'];
        if (p.st === 'eng') return f ? ['fiancée', 'fiancée', 'ta', 'ma'] : ['fiancé', 'fiancé', 'ton', 'mon'];
        return f ? ['girlfriend', 'petite amie', 'ta', 'ma'] : ['boyfriend', 'petit ami', 'ton', 'mon'];
      case 'kid': return f ? ['daughter', 'fille', 'ta', 'ma'] : ['son', 'fils', 'ton', 'mon'];
      case 'gkid': return f ? ['granddaughter', 'petite-fille', 'ta', 'ma'] : ['grandson', 'petit-fils', 'ton', 'mon'];
      case 'pet': { const sp = OL_PETM[p.sp] || OL_PET[0], fe = p.sp === 'tortoise'; return [sp[1][0], sp[1][1], fe ? 'ta' : 'ton', fe ? 'ma' : 'mon']; }
      default: return ['classmate', 'camarade', 'ton', 'mon'];
    }
  }
  const olCap = s => s.charAt(0).toUpperCase() + s.slice(1);
  function olTok(k, c, li, s) {
    const me = s.me, p = c.p, pf = p && p.g === 'f', mf = me.g === 'f';
    switch (k) {
      case 'p': return p ? p.n : '';
      case 'e': return li === 1 && mf ? 'e' : '';
      case 'le': return li === 1 && mf ? 'le' : '';
      case 'pe': return li === 1 && pf ? 'e' : '';
      case 'he': return pf ? 'she' : 'he';
      case 'He': return pf ? 'She' : 'He';
      case 'him': return pf ? 'her' : 'him';
      case 'his': return pf ? 'her' : 'his';
      case 'il': return pf ? 'elle' : 'il';
      case 'Il': return pf ? 'Elle' : 'Il';
      case 'lui': return pf ? 'elle' : 'lui';
      case 'Lp': return pf ? 'La' : 'Le';
      case 'un': return pf ? 'une' : 'un';
      case 'Un': return pf ? 'Une' : 'Un';
      case 'rel': case 'yrel': case 'Yrel': case 'myrel': case 'Myrel': case 'Ton': case 'pet': {
        if (!p) return '';
        const r = olRel(p, me);
        if (k === 'pet') return li === 1 ? r[1] : r[0];
        if (k === 'Ton') return li === 1 ? olCap(r[2]) : 'Your';
        if (k === 'rel') return li === 1 ? r[1] : r[0];
        const v = li === 1 ? (k[0].toLowerCase() === 'y' ? r[2] : r[3]) + ' ' + r[1] : (k[0].toLowerCase() === 'y' ? 'your ' : 'my ') + r[0];
        return k[0] === 'Y' || k[0] === 'M' ? olCap(v) : v;
      }
      case 'amt': return '{$' + Math.round(c.amt || 0) + '}';
      case 'job': return me.job ? olJobT(me.job.id, me.job.lvl, me.g, li) : '';
      default: { const v = c[k]; if (Array.isArray(v)) return v[li] || v[0]; return v === undefined ? undefined : String(v); }
    }
  }
  function olFill(str, c, li, s) { return str.replace(/\{(\w+)\}/g, (m, k) => { const v = olTok(k, c, li, s); return v === undefined ? m : v; }); }
  const olFP = (pair, c, s) => [olFill(pair[0], c, 0, s), olFill(pair[1] || pair[0], c, 1, s)];
  const olNoC = {};

  function olNewLife(o) {
    o = o || {};
    const g = o.g === 'f' || o.g === 'm' ? o.g : olP(['m', 'f']);
    const yr = o.yr || new Date().getFullYear();
    const s = { v: OL_V, nid: 0, pp: [], log: [], q: [], gen: o.gen || 1, line: o.line || Math.floor(olR() * 1e9), pw: o.pw !== undefined ? o.pw : olW([0, 1, 2, 3], x => [2, 4, 3, 1][x]), net: 0 };
    const ln = o.ln || olP(OL_NM.l);
    s.me = {
      fn: o.fn || olName(g), ln, g, age: 0, yr, born: yr, city: o.city !== undefined ? o.city : olI(0, OL_CITY.length - 1), lk: o.lk || olLook(g), al: 1,
      st: { h: olI(62, 96), H: olI(72, 100), s: olI(18, 92), l: olI(18, 96) }, k: 50, f: 0, a: olI(10, 30),
      sk: { mus: 0, art: 0, cod: 0, act: 0, lan: 0, coo: 0, wri: 0 }, m: 0, debt: 0, fl: {}, cnt: {}, ev: {}, dn: [], ill: [], as: [], lic: 0, mv: 0, ret: 0, pen: 0,
      sch: null, edu: { hs: 0, deg: null, grad: null, ex: 0, gpa: 0, left: 0 }, job: null, hist: [], top: 0, sum: [0, 0, 0], kids: 0, pets: 0, mar: 0, inst: -1, spt: -1
    };
    const me = s.me;
    me.lk.bd = 0;
    const pj = [['retail', 'clean', 'care', 'farm', 'wareh', 'call', 'post'], ['police', 'post', 'elec', 'teach', 'mech', 'nurse', 'driver', 'cook'], ['engin', 'acct', 'nurse', 'dev', 'archi', 'psych', 'teach', 'mkt'], ['doctor', 'lawyer', 'bank', 'dent', 'pilot', 'prof']][s.pw];
    const ma = olI(22, 40), da = olC(ma + olI(-3, 6), 22, 50);
    const mk = (r, g2, age) => { const p = olPerson(s, r, g2, age, { ln, w: s.pw }); const jid = olP(pj), lv = Math.min(OL_JOBM[jid][6].length - 1, olI(age > 32 ? 1 : 0, 2)); p.job = olJobPair(jid, lv, g2); p.b = olI(70, 95); return p; };
    const mom = mk('mom', 'f', ma), dad = mk('dad', 'm', da);
    mom.lk.bd = 0;
    dad.lk.sk = mom.lk.sk = olC(me.lk.sk + olI(-1, 1), 0, 5);
    [[ma, 'f'], [ma, 'm'], [da, 'f'], [da, 'm']].forEach(([pa, g2]) => { const age = pa + olI(22, 34); if (age <= 92 && olR() < 0.8) { const p = olPerson(s, 'gp', g2, age); p.b = olI(60, 90); p.lk.hc = 0; } });
    const ns = olW([0, 1, 2], x => [5, 4, 1][x]);
    for (let i = 0; i < ns; i++) { const g2 = olP(['m', 'f']); const p = olPerson(s, 'sib', g2, olI(1, 8), { ln }); p.lk.sk = me.lk.sk; p.b = olI(55, 85); }
    olYearStart(s);
    const ci = OL_CITY[me.city];
    olSay(s, [`I was born a ${g === 'f' ? 'girl' : 'boy'} in ${ci[0]}, ${ci[2]}.`, `Je suis ${g === 'f' ? 'une fille, née' : 'un garçon, né'} à ${ci[1]}, ${ci[3]}.`], 'm');
    olSay(s, [`My mother is ${mom.n} ${ln}, ${olArt(mom.job[0])}. My father is ${dad.n} ${ln}, ${olArt(dad.job[0])}.`, `Ma mère s’appelle ${mom.n} ${ln}, elle est ${olLow(mom.job[1])}. Mon père s’appelle ${dad.n} ${ln}, il est ${olLow(dad.job[1])}.`]);
    const sibs = olAlive(s, 'sib');
    if (sibs.length) olSay(s, [`I have ${sibs.length === 1 ? 'one older sibling' : sibs.length + ' older siblings'}: ${sibs.map(x => x.n).join(' and ')}.`, `J’ai ${sibs.length === 1 ? 'un aîné' : sibs.length + ' aînés'} : ${sibs.map(x => x.n).join(' et ')}.`]);
    return s;
  }

  function olYearStart(s) {
    s.log.push({ a: s.me.age, y: s.me.yr, l: [] });
    if (s.log.length > 130) s.log.splice(0, s.log.length - 130);
  }
  function olSay(s, pair, tone) {
    const b = s.log[s.log.length - 1];
    if (!b) return;
    b.l.push([pair[0], pair[1] || pair[0], tone || '']);
    if (b.l.length > 40) b.l.splice(0, b.l.length - 40);
    s.dirty = 1;
  }
  function olSayC(s, pair, c, tone) { olSay(s, olFP(pair, c || olNoC, s), tone); }

  function olAddIll(s, id) {
    const me = s.me, d = OL_ILLM[id];
    if (!d || me.ill.some(x => x[0] === id)) return false;
    me.ill.push([id, 0, 0]);
    return true;
  }
  function olGain(s, k, v) {
    const me = s.me;
    if (k === 'h' || k === 'H' || k === 's' || k === 'l') { const o = me.st[k]; me.st[k] = olC(o + v); return me.st[k] - o; }
    if (k === 'k' || k === 'f' || k === 'a') { const o = me[k]; me[k] = olC(o + v); return me[k] - o; }
    return 0;
  }
  function olAddPet(s, sp, age) {
    const d = OL_PETM[sp];
    if (!d) return null;
    const p = olPerson(s, 'pet', olP(['m', 'f']), age === undefined ? olI(0, 2) : age, { sp, n: olP(OL_PETN), ly: olI(d[2], d[3]) });
    p.b = olI(70, 90);
    s.me.pets++;
    return p;
  }
  function olMoveTemp(s, c, r, o) {
    const t = c.p;
    if (!t || !t.t) return t;
    const p = olPerson(s, r, t.g, t.age, Object.assign({ n: t.n, ln: t.ln, lk: t.lk }, o || {}));
    p.b = olI(50, 70);
    c.p = p;
    return p;
  }

  function olApply(s, eff, c, out) {
    const me = s.me, ch = out || {};
    const add = (k, v) => { if (v) ch[k] = (ch[k] || 0) + v; };
    (eff || '').split(' ').forEach(tk => {
      if (!tk) return;
      let m = /^([hHslkfa])([+-]\d+)$/.exec(tk);
      if (m) { add(m[1], olGain(s, m[1], +m[2])); return; }
      m = /^m([+-])(\d+|amt)$/.exec(tk);
      if (m) { const v = (m[2] === 'amt' ? c.amt || 0 : +m[2]) * (m[1] === '-' ? -1 : 1); me.m += v; add('m', v); return; }
      m = /^b([+-]\d+)$/.exec(tk);
      if (m) { if (c.p && !c.p.t) c.p.b = olC(c.p.b + +m[1]); return; }
      m = /^B([+-]\d+)$/.exec(tk);
      if (m) { s.pp.forEach(p => { if (p.al && (p.r === 'mom' || p.r === 'dad' || p.r === 'sib')) p.b = olC(p.b + +m[1]); }); return; }
      m = /^p([+-]\d+)$/.exec(tk);
      if (m) { if (me.job) me.job.perf = olC(me.job.perf + +m[1]); else if (me.sch) me.sch.perf = olC(me.sch.perf + +m[1]); return; }
      m = /^x([a-z]{3})([+-]\d+)$/.exec(tk);
      if (m && m[1] in me.sk) { const o = me.sk[m[1]]; me.sk[m[1]] = olC(o + +m[2]); return; }
      if (tk[0] === '!') { me.fl[tk.slice(1)] = 1; return; }
      if (tk.startsWith('i:')) { if (olAddIll(s, tk.slice(2))) add('H', 0); return; }
      if (tk.startsWith('pet:')) { olAddPet(s, tk.slice(4)); return; }
      if (tk.startsWith('hair:')) { const ix = { blue: 6, pink: 7, green: 8 }[tk.slice(5)]; if (ix) me.lk.hc = ix; return; }
      if (tk === 'F') { if (c.p && c.p.t && olAlive(s, 'friend').length < 12) olMoveTemp(s, c, 'friend'); return; }
      if (tk === 'F2') { for (let i = 0; i < 2; i++) if (olAlive(s, 'friend').length < 12) { const g = olP(['m', 'f']); olPerson(s, 'friend', g, me.age + olI(-1, 1)); } return; }
      if (tk === 'P') { if (c.p && c.p.t && !olLove(s)) olMoveTemp(s, c, 'love', { st: 'date', yrs: 0 }); return; }
      if (tk === 'jobmove') { const j = me.job; if (j) { j.sal = Math.round(j.sal * 1.2); j.perf = 55; j.ly = 0; add('m', 0); } return; }
      m = /^raise:(\d+)$/.exec(tk);
      if (m) { if (me.job) me.job.sal = Math.round(me.job.sal * (1 + +m[1] / 100)); return; }
      if (tk === 'carhit') { const a = me.as.find(x => x.t === 'car' && OL_CARM[x.id][4]); if (a) a.v = Math.round(a.v * 0.5); return; }
      m = /^invest:(big|small)$/.exec(tk);
      if (m) {
        const amt = Math.round(Math.min(m[1] === 'big' ? 50000 : 5000, Math.max(0, me.m) * (m[1] === 'big' ? 0.3 : 0.1)));
        const r = olR(), back = r < 0.4 ? amt * 2 : r < 0.6 ? Math.round(amt * 1.2) : 0;
        me.m += back - amt; add('m', back - amt);
        c.amt = Math.abs(back - amt);
        olSayC(s, back > amt ? ['The investment paid off: I made {amt}.', 'Le placement a payé : j’ai gagné {amt}.'] : ['The investment failed and I lost {amt}.', 'Le placement a échoué et j’ai perdu {amt}.'], c, back > amt ? 'g' : 'b');
        return;
      }
      if (tk === 'scam') { const v = Math.min(Math.max(0, me.m), olI(300, 2000)); me.m -= v; add('m', -v); return; }
      if (tk === 'roof:fix') { const h = olHouse(s); if (h) { me.m -= 8000; add('m', -8000); h.v = Math.round(h.v * 1.05); } return; }
      if (tk === 'roof:bad') { const h = olHouse(s); if (h) h.v = Math.round(h.v * 0.94); return; }
      if (tk === 'checkup') { add('H', olGain(s, 'H', 2)); me.ill = me.ill.filter(x => { const d = OL_ILLM[x[0]]; if (d[9]) { x[2] = 1; return true; } return olR() > d[8]; }); return; }
      if (tk === 'startup') {
        const cost = 4000, r = olR();
        me.m -= cost; me.fl.startup = 1;
        if (r < 0.15) { const v = olI(25, 200) * 10000; me.m += v; add('m', v - cost); add('f', olGain(s, 'f', 8)); c.amt = v; olSayC(s, ['My company took off! A bigger firm bought it for {amt}.', 'Mon entreprise a décollé ! Un grand groupe l’a rachetée pour {amt}.'], c, 'g'); }
        else if (r < 0.5) { const v = olI(2, 6) * 10000; me.m += v; add('m', v - cost); c.amt = v; olSayC(s, ['My little company did well and earned me {amt}.', 'Ma petite entreprise a bien marché et m’a rapporté {amt}.'], c, 'g'); }
        else { add('m', -cost); add('h', olGain(s, 'h', -5)); olSayC(s, ['My company failed after a year. I learned a lot.', 'Mon entreprise a fait faillite au bout d’un an. J’ai beaucoup appris.'], c, 'b'); }
        return;
      }
      m = /^donate:(\d+)$/.exec(tk);
      if (m) { const v = Math.round(Math.max(0, me.m) * +m[1] / 100); me.m -= v; add('m', -v); return; }
      if (tk === 'promote') { olPromote(s); return; }
      if (tk === 'friendsdown') { olAlive(s, 'friend').forEach(p => { p.b = olC(p.b - 15); }); return; }
      if (tk === 'petdie') { if (c.p && c.p.r === 'pet') { c.p.al = 0; c.p.dz = c.p.age; add('h', olGain(s, 'h', -6)); } }
    });
    s.dirty = 1;
    return ch;
  }

  function olRoleOk(s, role) {
    const me = s.me, A = s.pp;
    const has = f => A.some(p => p.al && f(p));
    switch (role) {
      case 'par': return has(p => p.r === 'mom' || p.r === 'dad');
      case 'oldpar': return me.age >= 40 && has(p => (p.r === 'mom' || p.r === 'dad') && p.age >= 70);
      case 'sib': return has(p => p.r === 'sib');
      case 'ysib': return has(p => p.r === 'sib' && p.age < me.age);
      case 'gp': return has(p => p.r === 'gp');
      case 'friend': return has(p => p.r === 'friend');
      case 'love': return has(p => p.r === 'love');
      case 'spouse': return has(p => p.r === 'love' && p.st === 'mar');
      case 'kidsmall': return has(p => p.r === 'kid' && p.age >= 5 && p.age <= 12);
      case 'kidteen': return has(p => p.r === 'kid' && p.age >= 13 && p.age <= 17);
      case 'kidadult': return has(p => p.r === 'kid' && p.age >= 18);
      case 'gkid': return has(p => p.r === 'gkid' && p.age >= 3);
      case 'pet': return has(p => p.r === 'pet');
      case 'dog': return has(p => p.r === 'pet' && p.sp === 'dog');
      default: return true;
    }
  }
  function olRolePick(s, role) {
    const me = s.me, A = s.pp.filter(p => p.al);
    const f = {
      par: p => p.r === 'mom' || p.r === 'dad', oldpar: p => (p.r === 'mom' || p.r === 'dad') && p.age >= 70, sib: p => p.r === 'sib', ysib: p => p.r === 'sib' && p.age < me.age,
      gp: p => p.r === 'gp', friend: p => p.r === 'friend', love: p => p.r === 'love', spouse: p => p.r === 'love' && p.st === 'mar', kidsmall: p => p.r === 'kid' && p.age >= 5 && p.age <= 12,
      kidteen: p => p.r === 'kid' && p.age >= 13 && p.age <= 17, kidadult: p => p.r === 'kid' && p.age >= 18, gkid: p => p.r === 'gkid' && p.age >= 3, pet: p => p.r === 'pet', dog: p => p.r === 'pet' && p.sp === 'dog'
    }[role];
    if (role === 'X') return olTemp(s, me.age + olI(-1, 1));
    if (role === 'Xw') return olTemp(s, olI(23, 60));
    if (!f) return null;
    const c = A.filter(f);
    return c.length ? olP(c) : null;
  }
  function olEventOk(s, ev) {
    const me = s.me, [id, a0, a1, , role, cond, , , fl] = ev;
    if (me.age < a0 || me.age > a1) return false;
    const last = me.ev[id];
    if (last !== undefined && (!fl || !fl.r || me.age - last < fl.r)) return false;
    if (cond === 'school' && !me.sch) return false;
    if (cond === 'job' && !me.job) return false;
    if (typeof cond === 'function' && !cond(s)) return false;
    if (role && role !== 'X' && role !== 'Xw' && !olRoleOk(s, role)) return false;
    return true;
  }
  function olCtx(s, ev) {
    const c = { p: ev[4] ? olRolePick(s, ev[4]) : null, sport: olP(OL_SPORT), city: (() => { const ci = olP(OL_CITY); return [ci[0], ci[1]]; })(), subj: olP(OL_SUBJ), topic: olP(OL_TOPIC) };
    if (s.me.spt >= 0) c.sport = OL_SPORT[s.me.spt];
    const fl = ev[8];
    if (fl && fl.amt) c.amt = olI(fl.amt[0] / 10, fl.amt[1] / 10) * 10;
    return c;
  }
  function olCtxSave(c) { const o = Object.assign({}, c); if (o.p) o.p = o.p.t ? Object.assign({}, o.p) : o.p.i; return o; }
  function olCtxLoad(s, o) { const c = Object.assign({}, o); if (typeof c.p === 'number') c.p = s.pp.find(p => p.i === c.p) || null; return c; }
  function olPickEvent(s) {
    const list = OL_EV.filter(ev => olEventOk(s, ev));
    return list.length ? olW(list, ev => ev[3]) : null;
  }
  function olResolve(s, ev, ci, c) {
    const ch = ev[7][ci];
    if (!ch) return null;
    const o = olW(ch[1], x => (typeof x[0] === 'function' ? x[0](s) : x[0])) || ch[1][0];
    s.me.ev[ev[0]] = s.me.age;
    const out = {};
    const before = s.log[s.log.length - 1].l.length;
    const txt = olFP(o[2], c, s);
    olSay(s, txt, '');
    const idx = before;
    olApply(s, o[1], c, out);
    const good = (out.h || 0) + (out.H || 0) + (out.s || 0) + (out.l || 0) + (out.k || 0) / 2 + Math.sign(out.m || 0) * 3;
    const b = s.log[s.log.length - 1];
    if (b.l[idx]) b.l[idx][2] = good > 1 ? 'g' : good < -1 ? 'b' : '';
    return { txt, out, good };
  }

  function olDeathP(age, H) {
    if (age >= 118) return 1;
    if (age < 40) return H < 6 ? 0.2 : 0.00025;
    const base = 0.00003 * Math.exp(0.094 * age);
    return Math.min(0.95, base * Math.pow(Math.max(0.2, 1.7 - H / 80), 2) + (H < 6 ? 0.3 : 0));
  }

  function olPromote(s) {
    const me = s.me, j = me.job;
    if (!j) return false;
    const d = OL_JOBM[j.id];
    if (!d || j.lvl >= d[6].length - 1) return false;
    j.lvl++; j.ly = 0;
    j.sal = Math.round(Math.max(j.sal * 1.08, d[6][j.lvl][2] * (0.95 + olR() * 0.1)));
    j.perf = olC(j.perf - 10);
    if (j.lvl === d[6].length - 1) me.top = Math.max(me.top, d[6].length >= 3 ? 2 : 1);
    if (j.t === 't') olGain(s, 'f', 6 + j.lvl * 6);
    olSay(s, [`I was promoted to ${olLow(olJobT(j.id, j.lvl, me.g, 0))}!`, `J’ai été promu${me.g === 'f' ? 'e' : ''} ${olLow(olJobT(j.id, j.lvl, me.g, 1))} !`], 'g');
    olGain(s, 'h', 6);
    s.fx = 'win';
    return true;
  }
  function olStartJob(s, id, lvl) {
    const me = s.me, d = OL_JOBM[id];
    if (!d) return;
    lvl = Math.min(lvl || 0, d[6].length - 1);
    const sal = Math.round(d[6][lvl][2] * (0.94 + olR() * 0.12) * (me.edu.grad === 'msc' && d[1] === 'f' && d[3] >= 2 ? 1.1 : 1));
    me.job = { id, lvl, perf: 55, yrs: 0, ly: 0, sal, t: d[1] };
    if (!me.hist.includes(id)) me.hist.push(id);
    if (d[1] !== 'p' && me.age >= 18) me.mv = 1;
    if (lvl === d[6].length - 1) me.top = Math.max(me.top, d[6].length >= 3 ? 2 : 1);
  }
  function olQuitJob(s, why) {
    const me = s.me, j = me.job;
    if (!j) return;
    const t = olJobPair(j.id, j.lvl, me.g);
    if (why === 'fired') olSay(s, [`I was fired from my job as ${olLow(t[0])}.`, `J’ai été licencié${me.g === 'f' ? 'e' : ''} de mon poste de ${olLow(t[1])}.`], 'b');
    else if (why === 'retire') olSay(s, [`I retired after working as ${olArt(t[0])}.`, `J’ai pris ma retraite après avoir été ${olLow(t[1])}.`], 'm');
    else olSay(s, [`I quit my job as ${olLow(t[0])}.`, `J’ai quitté mon poste de ${olLow(t[1])}.`], '');
    me.lastJob = { id: j.id, lvl: j.lvl, yrs: j.yrs };
    me.cnt['y_' + j.id] = (me.cnt['y_' + j.id] || 0) + j.yrs;
    me.job = null;
  }

  function olReqOk(s, d) {
    const me = s.me, rq = d[5] || {}, why = [];
    if (me.age < d[2]) why.push(L('Minimum age {n}', { n: d[2] }));
    if (d[1] === 'p' && me.age > 25) why.push(L('For students and teenagers'));
    if (d[3] >= 1 && !me.edu.hs) why.push(L('Needs a high school diploma'));
    if (d[3] === 2) { if (!me.edu.deg) why.push(L('Needs a university degree')); else if (Array.isArray(d[4]) && !d[4].includes(me.edu.deg)) why.push(L('Needs a degree in {x}', { x: d[4].filter(x => OL_MAJM[x]).map(x => X(OL_MAJM[x].slice(1, 3))).join(L(' or ')) })); }
    if (d[3] === 3 && !(Array.isArray(d[4]) && d[4].includes(me.edu.grad))) why.push(L('Needs: {x}', { x: d[4].map(x => X(OL_GRADM[x].slice(1, 3))).join(L(' or ')) }));
    if (rq.H && me.st.H < rq.H) why.push(L('Needs better health'));
    if (rq.s && me.st.s < rq.s) why.push(L('Needs more smarts'));
    if (rq.l && me.st.l < rq.l) why.push(L('Needs better looks'));
    if (rq.a && me.a < rq.a) why.push(L('Needs more fitness'));
    if (rq.lic && !me.lic) why.push(L('Needs a driving licence'));
    OL_SK.forEach(k => { if (rq[k] && me.sk[k] < rq[k]) why.push(L('Needs more {x} skill', { x: L(OL_SKN[k]).toLowerCase() })); });
    return why;
  }
  function olListings(s) {
    const me = s.me;
    if (s.lst && s.lst.y === me.age) return s.lst.ids;
    const teen = me.age < 18 || olAt(s, 'uni', 'grad', 'high', 'mid');
    let pool = OL_JOB.filter(d => me.age >= d[2] - 1 && (teen ? d[1] === 'p' || (me.age >= 16 && d[1] === 't') : d[1] !== 'p' || me.age <= 25));
    const ok = pool.filter(d => !olReqOk(s, d).length), no = pool.filter(d => olReqOk(s, d).length);
    const pickN = (a, n) => { const c = a.slice(), o = []; while (c.length && o.length < n) o.push(c.splice(Math.floor(olR() * c.length), 1)[0]); return o; };
    const ids = pickN(ok, teen ? 5 : 7).concat(pickN(no, teen ? 2 : 4)).map(d => d[0]);
    s.lst = { y: me.age, ids };
    return ids;
  }

  function olFamilyYear(s) {
    const me = s.me;
    s.pp.forEach(p => {
      if (!p.al) return;
      p.age++;
      p.d = [];
      if (p.r === 'pet') {
        p.b = olC(p.b - 1);
        if (p.age >= p.ly) { p.al = 0; p.dz = p.age; olSayC(s, ['{Myrel} {p} passed away at the age of ' + p.age + '. I will always remember {him}.', '{Myrel} {p} nous a quittés à l’âge de ' + p.age + ' ans. Je ne l’oublierai jamais.'], { p }, 'b'); olGain(s, 'h', -6); }
        return;
      }
      const dec = { friend: 4, love: 3, mom: 2, dad: 2, sib: 3, gp: 2, kid: 2, gkid: 2 }[p.r] || 2;
      p.b = olC(p.b - dec);
      if (p.r === 'love') p.yrs = (p.yrs || 0) + 1;
      if (p.r === 'love' && p.st === 'mar') me.mar++;
      if (p.age > 35 && olR() < olDeathP(p.age, p.r === 'gp' ? 52 : 62)) {
        p.al = 0; p.dz = p.age;
        const close = { mom: 1, dad: 1, love: 1, kid: 1, sib: 0.8, gp: 0.6, friend: 0.5, gkid: 0.8 }[p.r] || 0.4;
        olSayC(s, ['{Myrel} {p} died at the age of ' + p.age + '.', '{Myrel} {p} est décédé{pe} à l’âge de ' + p.age + ' ans.'], { p }, 'b');
        olGain(s, 'h', -Math.round((4 + p.b / 10) * close));
        if ((p.r === 'mom' || p.r === 'dad') && !s.pp.some(q => q.al && (q.r === 'mom' || q.r === 'dad'))) {
          const w = p.w || 0, base = [olI(2, 12), olI(20, 90), olI(120, 600), olI(800, 3000)][w] * 1000, n = olAlive(s, 'sib').length + 1;
          const v = Math.round(base / n / 100) * 100;
          if (v > 0) { me.m += v; olSayC(s, ['I inherited {amt} from my parents.', 'J’ai hérité de {amt} de mes parents.'], { amt: v }, 'g'); }
        }
        if (p.r === 'love') { p.r = 'love'; me.widow = 1; }
        return;
      }
      if (p.b <= 0 && p.r === 'friend') { p.al = 0; p.gone = 1; olSayC(s, ['{p} and I drifted apart.', '{p} et moi, on s’est perdus de vue.'], { p }, 'b'); return; }
      if (p.r === 'love' && p.st !== 'mar') {
        const risk = (p.b < 25 ? 0.45 : 0.04) + (me.age < 18 ? 0.25 : 0);
        if (olR() < risk) { p.al = 0; p.gone = 1; olSayC(s, ['{p} and I broke up.', '{p} et moi, on s’est séparés.'], { p }, 'b'); olGain(s, 'h', -6); return; }
      }
      if (p.r === 'love' && p.st === 'mar' && p.b < 12 && olR() < 0.3) { olDivorce(s, p, 1); return; }
      if (p.r === 'kid') {
        if (p.age === 18) olSayC(s, ['{Myrel} {p} turned 18 and moved out.', '{Myrel} {p} a eu 18 ans et a quitté la maison.'], { p }, 'm');
        if (p.age === 23 && !p.job) { const jid = olP(['teach', 'nurse', 'dev', 'engin', 'cook', 'retail', 'police', 'design', 'acct', 'mech', 'lab', 'journ']); p.job = olJobPair(jid, 0, p.g); }
        const gk = s.pp.filter(q => q.r === 'gkid' && q.par === p.i).length;
        if (p.age >= 24 && p.age <= 42 && gk < 3 && olR() < 0.1) {
          const g = olP(['m', 'f']), k = olPerson(s, 'gkid', g, 0, { par: p.i });
          k.b = olI(60, 85);
          const first = !me.fl.gp;
          me.fl.gp = 1;
          olSay(s, [`${olCap(olFP(['{myrel}', ''], { p }, s)[0])} ${p.n} had a baby ${g === 'f' ? 'girl' : 'boy'} named ${k.n}.${first ? ' I am a grandparent!' : ''}`, `${olCap(olFP(['', '{myrel}'], { p }, s)[1])} ${p.n} a eu ${g === 'f' ? 'une petite fille' : 'un petit garçon'} prénommé${g === 'f' ? 'e' : ''} ${k.n}.${first ? ' Je suis grand-' + (me.g === 'f' ? 'mère' : 'père') + ' !' : ''}`], 'g');
          olGain(s, 'h', 6);
        }
      }
    });
    const mom = s.pp.find(p => p.r === 'mom' && p.al), dad = s.pp.find(p => p.r === 'dad' && p.al);
    if (mom && dad && me.age <= 10 && mom.age <= 42 && olAlive(s, 'sib').length < 3 && olR() < 0.11) {
      const g = olP(['m', 'f']), k = olPerson(s, 'sib', g, 0, { ln: me.ln });
      k.lk.sk = me.lk.sk;
      olSay(s, [`My mother gave birth to a baby ${g === 'f' ? 'girl' : 'boy'} named ${k.n}.`, `Ma mère a donné naissance à ${g === 'f' ? 'une petite fille' : 'un petit garçon'} prénommé${g === 'f' ? 'e' : ''} ${k.n}.`], 'g');
    }
    if (s.preg) {
      s.preg = 0;
      const love = olLove(s);
      s.q.push({ k: 'baby', tw: olR() < 0.03 ? 1 : 0, g: olP(['m', 'f']) });
      if (!love) s.q.pop();
    }
  }
  function olDivorce(s, p, them) {
    const me = s.me;
    const v = Math.round(Math.max(0, me.m) * 0.4);
    me.m -= v;
    p.al = 0; p.gone = 1;
    olSayC(s, them ? ['{p} asked for a divorce. We split our savings.', '{p} a demandé le divorce. Nous avons partagé nos économies.'] : ['{p} and I divorced. We split our savings.', '{p} et moi avons divorcé. Nous avons partagé nos économies.'], { p }, 'b');
    olGain(s, 'h', -10);
  }

  function olDrift(s) {
    const me = s.me, st = me.st, a = me.age;
    st.h = olC(st.h + (62 - st.h) * 0.08 + (olR() - 0.5) * 4);
    if (a < 25) st.H = olC(st.H + (90 - st.H) * 0.12 + (olR() - 0.5) * 2);
    else if (a < 50) st.H = olC(st.H - 0.2 - olR() * 0.4);
    else if (a < 70) st.H = olC(st.H - 0.5 - olR() * 0.8);
    else st.H = olC(st.H - 0.9 - olR() * 1.1);
    if (a < 12) st.l = olC(st.l + (olR() - 0.5) * 2);
    else if (a < 20) st.l = olC(st.l + olI(-2, 3));
    else if (a < 36) st.l = olC(st.l + (olR() - 0.55) * 2);
    else if (a < 60) st.l = olC(st.l - olR() * 1.2);
    else st.l = olC(st.l - 0.5 - olR());
    if (a > 72) st.s = olC(st.s - olR() * 1.5);
    if (a < 18) me.a = olC(me.a + olR() * 1.5);
    else if (a > 30) me.a = olC(me.a - olR() * 1.6);
    if (!(me.job && me.job.t === 't')) me.f = olC(me.f - 2);
    if (me.m < 0 && a >= 18) st.h = olC(st.h - 3);
    me.k = olC(me.k + (50 - me.k) * 0.01);
    me.sum[0] += st.h; me.sum[1] += st.H; me.sum[2]++;
  }

  function olGrade(v, li) {
    if (li === 1) return Math.round(v / 5) + '/20';
    return (v >= 93 ? 'A+' : v >= 85 ? 'A' : v >= 75 ? 'B' : v >= 65 ? 'C' : v >= 55 ? 'D' : 'F') + ' (' + Math.round(v) + '%)';
  }
  function olSchoolStart(s, k, n, o) {
    s.me.sch = Object.assign({ k, y: 0, n, perf: 55, gr: 0, sum: 0 }, o || {});
  }
  function olSchoolYear(s) {
    const me = s.me;
    if (!me.sch) {
      if (me.age === 5 && !me.edu.left) { olSchoolStart(s, 'pri', 6); olSay(s, ['I started primary school.', 'Je suis entré' + (me.g === 'f' ? 'e' : '') + ' à l’école primaire.'], 'm'); }
      return;
    }
    const sc = me.sch;
    const g = olC(0.55 * me.st.s + 0.45 * sc.perf + (olR() - 0.5) * 16);
    sc.gr = g; sc.sum += g; sc.y++;
    me.st.s = olC(me.st.s + (0.6 + olR() * 1.6) * (0.6 + sc.perf / 100));
    sc.perf = olC(sc.perf + (48 - sc.perf) * 0.3);
    if (sc.club) { const ck = sc.club; if (ck === 'a') me.a = olC(me.a + 3); else if (ck === 's') me.st.s = olC(me.st.s + 1.5); else if (me.sk[ck] !== undefined) me.sk[ck] = olC(me.sk[ck] + 4); }
    if (sc.k === 'uni' || sc.k === 'grad') {
      const fund = sc.fund;
      if (fund === 'loan') { me.debt += 9000; }
      else if (fund === 'self') { me.m -= 9000; }
    }
    if (sc.k !== 'pri') olSay(s, [`My report card: ${olGrade(g, 0)}.`, `Mon bulletin : ${olGrade(g, 1)} de moyenne.`], g >= 75 ? 'g' : g < 55 ? 'b' : '');
    else if (sc.y % 2 === 0) olSay(s, g >= 70 ? ['My teacher says I am doing really well.', 'Ma maîtresse dit que je travaille très bien.'] : g >= 50 ? ['My teacher says I could try a little harder.', 'Ma maîtresse dit que je pourrais faire un peu plus d’efforts.'] : ['My teacher is worried about my school work.', 'Ma maîtresse s’inquiète pour mon travail scolaire.'], g >= 70 ? 'g' : g < 50 ? 'b' : '');
    if (sc.y < sc.n) return;
    const avg = sc.sum / Math.max(1, sc.y);
    if (sc.k === 'pri') { olSchoolStart(s, 'mid', 4, { club: sc.club, ci: sc.ci }); olSay(s, ['I finished primary school and started middle school.', 'J’ai fini l’école primaire et je suis entré' + (me.g === 'f' ? 'e' : '') + ' au collège.'], 'm'); return; }
    if (sc.k === 'mid') { olSchoolStart(s, 'high', 3, { club: sc.club, ci: sc.ci }); olSay(s, ['I started high school.', 'Je suis entré' + (me.g === 'f' ? 'e' : '') + ' au lycée.'], 'm'); return; }
    if (sc.k === 'high') {
      const ex = Math.round(olC(0.6 * me.st.s + 0.4 * avg + (olR() - 0.5) * 12));
      me.edu.ex = ex;
      me.sch = null;
      if (ex >= 50) {
        me.edu.hs = 1;
        olSay(s, [`I passed my final exams with ${ex}% and got my high school diploma!`, `J’ai eu mon bac avec ${Math.round(ex / 5)}/20 de moyenne !`], 'g');
        olGain(s, 'h', 6); s.fx = 'win';
        s.q.push({ k: 'after' });
      } else {
        olSay(s, [`I failed my final exams with ${ex}%.`, `J’ai raté mon bac avec ${Math.round(ex / 5)}/20.`], 'b');
        olGain(s, 'h', -8);
        s.q.push({ k: 'fail' });
      }
      return;
    }
    if (sc.k === 'uni') {
      me.edu.deg = sc.maj; me.edu.gpa = Math.round(avg);
      me.sch = null;
      const mj = OL_MAJM[sc.maj];
      olSay(s, [`I graduated from university with a degree in ${olLow(mj[1])}${avg >= 85 ? ', with honours' : ''}!`, `J’ai obtenu mon diplôme universitaire en ${olLow(mj[2])}${avg >= 85 ? ', avec mention' : ''} !`], 'g');
      olGain(s, 'h', 7); s.fx = 'win';
      s.q.push({ k: 'grad' });
      return;
    }
    if (sc.k === 'grad') {
      me.edu.grad = sc.maj; me.sch = null;
      const gd = OL_GRADM[sc.maj];
      olSay(s, gd[0] === 'msc' ? ['I completed my master’s degree!', 'J’ai obtenu mon master !'] : gd[0] === 'phd' ? ['I completed my doctorate!', 'J’ai obtenu mon doctorat !'] : [`I graduated from ${olLow(gd[1])}!`, `J’ai terminé l’${olLow(gd[2])} !`], 'g');
      olGain(s, 'h', 7); s.fx = 'win';
      s.q.push({ k: 'work' });
    }
  }

  function olJobYear(s) {
    const me = s.me, j = me.job;
    if (!j) return;
    const d = OL_JOBM[j.id];
    j.yrs++; j.ly++;
    const sk = d[7], skv = sk ? (sk === 'a' ? me.a : me.sk[sk] || 0) : 50;
    j.perf = olC(j.perf + (50 - j.perf) * 0.18 + (olR() - 0.5) * 8 + (skv - 50) / 25 + (me.st.h - 50) / 40);
    j.sal = Math.round(j.sal * 1.02);
    if (j.t === 't') {
      olGain(s, 'f', j.lvl * 2);
      if (sk && me.sk[sk] !== undefined) me.sk[sk] = olC(me.sk[sk] + 1);
      if (sk === 'a') me.a = olC(me.a + 1);
    }
    if (j.id === 'athl' && me.age >= 35 + olI(0, 3)) { olQuitJob(s, 'retire'); return; }
    if (olCanPromote(s) && j.ly >= 2) {
      const ch = j.t === 't' ? (skv - 45) / 120 + me.f / 300 + j.perf / 400 : j.perf >= 68 ? 0.45 : 0;
      const nx = d[6][j.lvl + 1];
      if (olR() < ch && !(j.id === 'lawyer' && j.lvl === 2 && me.age < 45)) olPromote(s);
    }
    if (j.perf < 18 && olR() < 0.55) { olQuitJob(s, 'fired'); olGain(s, 'h', -8); return; }
    if (olR() < 0.14 && OL_JP[j.id]) { olSay(s, olFP(olP(OL_JP[j.id]), olNoC, s), 'g'); olGain(s, 'h', 3); j.perf = olC(j.perf + 3); }
  }
  function olTax(v) { let t = 0; if (v > 11000) t += (Math.min(v, 50000) - 11000) * 0.22; if (v > 50000) t += (Math.min(v, 150000) - 50000) * 0.35; if (v > 150000) t += (v - 150000) * 0.45; return t; }
  function olMoneyYear(s) {
    const me = s.me;
    let inc = 0, cost = 0;
    if (me.job) inc += me.job.sal;
    if (me.ret || (me.age >= 67 && !me.job)) { if (!me.pen) { me.pen = 9000; if (me.age >= 18) olSay(s, ['I started receiving the state pension.', 'J’ai commencé à toucher la retraite de base.'], 'm'); } inc += me.pen; }
    const net = inc - olTax(inc);
    const love = olLove(s), mar = love && love.st === 'mar';
    let hh = 0;
    if (mar && love.age < 67) hh = (love.inc || 24000) * 0.35;
    const kids = s.pp.filter(p => p.al && p.r === 'kid' && p.age < 18).length;
    const stu = olAt(s, 'uni', 'grad');
    const fund = stu ? me.sch.fund : '';
    if (stu && fund !== 'self') { if (fund === 'loan') me.debt += 7000; }
    else if (me.mv) {
      if (!olHouse(s)) cost += stu ? 6500 : 11000 + (mar ? 3000 : 0);
      cost += stu ? 4500 : 9000 + (mar ? 3000 : 0);
      cost += kids * 4500;
    } else if (me.age >= 18) cost += 1500;
    me.as.forEach(a => {
      if (a.t === 'house') {
        cost += a.v * 0.01;
        a.v = Math.round(a.v * (1 + (olR() * 0.08 - 0.02)));
        if (a.lo > 0) { const it = a.lo * 0.04, pr = Math.min(a.lo, Math.max(0, a.pm - it)); cost += it + pr; a.lo = Math.round(a.lo - pr); if (a.lo <= 0) { a.lo = 0; olSay(s, [`I paid off the mortgage on my ${olLow(OL_HOUSEM[a.id][1][0])}.`, `J’ai fini de rembourser le crédit de mon logement.`], 'g'); } }
      } else {
        const d = OL_CARM[a.id];
        a.v = Math.round(a.v * (d[0] === 'classic' ? 1.03 : 0.88));
        cost += d[4] ? 1100 : 60;
      }
    });
    if (me.debt > 0) { const pay = Math.min(me.debt, Math.max(0, inc - 25000) * 0.09); cost += pay; me.debt = Math.round((me.debt - pay) * 1.02); }
    const delta = net + hh - cost;
    me.m += delta;
    if (me.m > 0) me.m *= 1.005; else me.m *= 1.07;
    me.m = Math.round(me.m);
    s.net = Math.round(delta);
  }
  function olHealthYear(s) {
    const me = s.me;
    me.ill = me.ill.filter(x => {
      const d = OL_ILLM[x[0]];
      if (!d) return false;
      const k = x[2] ? 0.4 : 1;
      olGain(s, 'H', -d[5] * k);
      olGain(s, 'h', -d[6] * k);
      x[1]++; x[2] = 0;
      if (!d[9] && olR() < d[7]) { olSay(s, [`I got over ${d[1][0]}.`, `Je me suis remis${me.g === 'f' ? 'e' : ''} ${d[1][1].replace(/^un /, 'd’un ').replace(/^une /, 'd’une ').replace(/^la /, 'de la ').replace(/^des /, 'de mes ')}.`], 'g'); return false; }
      return true;
    });
    let nw = 0;
    for (const d of OL_ILL) {
      if (nw >= 1 || !d[4] || me.age < d[2] || me.age > d[3]) continue;
      if (me.ill.some(x => x[0] === d[0]) || (d[0] === 'pox' && me.fl.pox)) continue;
      if (olR() < d[4] * (1.7 - me.st.H / 100)) {
        olAddIll(s, d[0]); nw++;
        if (d[0] === 'pox') me.fl.pox = 1;
        olSay(s, [`I came down with ${d[1][0]}.`, `J’ai attrapé ${d[1][1]}.`].map((x, i) => (d[9] && i === 0 ? `I was diagnosed with ${d[1][0]}.` : d[9] && i === 1 ? `On m’a diagnostiqué ${d[1][1]}.` : x)), 'b');
      }
    }
    if (me.age >= 72 && olR() < 0.03 && !me.ill.some(x => x[0] === 'hip')) { olAddIll(s, 'hip'); olSay(s, ['I slipped on the stairs and broke my hip.', 'J’ai glissé dans l’escalier et je me suis cassé la hanche.'], 'b'); }
  }
  function olCause(s) {
    const me = s.me, has = id => me.ill.some(x => x[0] === id);
    if (has('heart')) return OL_CAUSE.heart;
    if (has('serious')) return OL_CAUSE.ill;
    if (has('pneu')) return OL_CAUSE.pneu;
    if (me.age >= 80) return olR() < 0.5 ? OL_CAUSE.sleep : OL_CAUSE.age;
    if (me.age >= 65) return olP([OL_CAUSE.age, OL_CAUSE.heart, OL_CAUSE.stroke]);
    return me.age < 40 && olR() < 0.4 ? OL_CAUSE.acc : OL_CAUSE.sudden;
  }

  function olAgeUp(s) {
    const me = s.me;
    if (!me.al || s.q.length) return false;
    me.age++; me.yr++;
    me.dn = [];
    olYearStart(s);
    olFamilyYear(s);
    olDrift(s);
    olSchoolYear(s);
    olJobYear(s);
    if (me.age >= 16 || me.mv) olMoneyYear(s);
    olHealthYear(s);
    if (me.age === 18 && !me.edu.hs && !me.sch && !s.q.length) s.q.push({ k: 'after' });
    if (me.age === 66 && me.job && me.job.t === 'f') s.q.push({ k: 'retire' });
    let pdie = olDeathP(me.age, me.st.H);
    if (me.ill.some(x => x[0] === 'heart')) pdie *= 1.8;
    if (me.ill.some(x => x[0] === 'serious')) pdie = pdie * 2.5 + 0.02;
    if (me.age > 0 && olR() < pdie) { olDie(s); return true; }
    if (me.age >= 1 && olR() < 0.75) {
      const list = OL_PE.filter(e => me.age >= e[0] && me.age <= e[1] && (!e[3] || e[3](s)) && !me.ev['pe' + OL_PE.indexOf(e)]);
      const e = list.length ? olW(list, x => x[2]) : null;
      if (e) {
        me.ev['pe' + OL_PE.indexOf(e)] = me.age;
        const c = { sport: me.spt >= 0 ? OL_SPORT[me.spt] : olP(OL_SPORT), subj: olP(OL_SUBJ) };
        const out = olApply(s, e[4], c);
        olSay(s, olFP(e[5], c, s), (out.h || 0) + (out.H || 0) > 0 ? 'g' : (out.h || 0) + (out.H || 0) < 0 ? 'b' : '');
        if (e[6]) olApply(s, e[6], c);
      }
    }
    const pc = me.age < 1 ? 0 : me.age < 5 ? 0.55 : s.q.length ? 0.3 : 0.82;
    if (olR() < pc) {
      const ev = olPickEvent(s);
      if (ev) { const c = olCtx(s, ev); if (!ev[4] || c.p) s.q.push({ k: 'ev', id: ev[0], c: olCtxSave(c) }); }
    }
    return true;
  }
  function olAward(s) {
    const me = s.me, w = olWorth(s), kids = s.pp.filter(p => p.r === 'kid').length;
    const avgH = me.sum[2] ? me.sum[0] / me.sum[2] : 0, avgHe = me.sum[2] ? me.sum[1] / me.sum[2] : 0;
    const yrsIn = ids => ids.reduce((t, id) => t + (me.cnt['y_' + id] || 0) + (me.job && me.job.id === id ? me.job.yrs : 0), 0);
    const friends = olAlive(s, 'friend').length;
    const top = Math.max(...OL_SK.map(k => me.sk[k]));
    const list = [
      ['century', me.age >= 100], ['tycoon', w >= 1e7], ['genius', (me.edu.grad === 'phd' || me.edu.grad === 'mds') && me.st.s >= 85], ['star', me.f >= 70 || me.fl.fame],
      ['healer', yrsIn(['doctor', 'nurse', 'vetj', 'dent', 'psych', 'physio']) >= 15], ['mentor', yrsIn(['teach', 'prof', 'coach']) >= 15], ['clan', kids >= 4], ['kind', me.k >= 85],
      ['athlete', me.a >= 88 || yrsIn(['athl']) >= 5], ['artist', top >= 90], ['globe', (me.cnt.hol || 0) >= 12], ['rich', w >= 2e6], ['scholar', !!me.edu.deg && me.st.s >= 82],
      ['boss', me.top >= 2], ['love', me.mar >= 40], ['happy', avgH >= 78], ['healthy', me.age >= 85 && avgHe >= 70], ['book', (me.cnt.read || 0) + (me.cnt.lib || 0) >= 40],
      ['social', friends >= 6], ['jack', me.hist.filter(id => OL_JOBM[id][1] !== 'p').length >= 6], ['animal', me.pets >= 4], ['brief', me.age < 30]
    ];
    const got = list.filter(x => x[1]).map(x => x[0]);
    return got.length ? got : ['ordinary'];
  }
  function olDie(s) {
    const me = s.me;
    me.al = 0;
    const cause = olCause(s);
    me.cause = cause;
    olSay(s, [`I died ${cause[0] === 'peacefully in my sleep' ? cause[0] : 'of ' + cause[0]} at the age of ${me.age}.`.replace('of an accident', 'in an accident'), `Je suis mort${me.g === 'f' ? 'e' : ''} ${cause[1]} à l’âge de ${me.age} ans.`], 'b');
    me.aw = olAward(s);
    me.worth = olWorth(s);
    s.q = [];
    s.fx = 'lose';
  }
  function olHeir(s, kid) {
    const me = s.me, kids = s.pp.filter(p => p.al && p.r === 'kid');
    const share = Math.max(0, Math.round((me.worth || 0) * 0.9 / Math.max(1, kids.length)));
    const n = olNewLife({ g: kid.g, fn: kid.n, ln: me.ln, yr: me.yr - kid.age, gen: s.gen + 1, line: s.line, lk: kid.lk, city: me.city, pw: share > 600000 ? 3 : share > 120000 ? 2 : share > 15000 ? 1 : 0 });
    n.log = [];
    n.pp = [];
    n.nid = 0;
    const nm = n.me;
    nm.age = kid.age; nm.yr = me.yr;
    const par = (src, r) => { const p = olPerson(n, r, src.g, src.age, { n: src.n, lk: src.lk, al: src.al, w: n.pw, job: src.job || null, dz: src.dz }); p.b = src.al ? olI(70, 95) : 80; return p; };
    const dad = par({ g: me.g, n: me.fn, age: me.age, lk: me.lk, al: 0, dz: me.age, job: me.job ? olJobPair(me.job.id, me.job.lvl, me.g) : me.lastJob ? olJobPair(me.lastJob.id, me.lastJob.lvl, me.g) : null }, me.g === 'f' ? 'mom' : 'dad');
    const sp = s.pp.find(p => p.r === 'love' && p.st === 'mar' && !p.gone);
    if (sp) par(sp, sp.g === 'f' ? 'mom' : 'dad');
    s.pp.filter(p => p.r === 'kid' && p !== kid).forEach(k => { const p = olPerson(n, 'sib', k.g, k.age, { n: k.n, lk: k.lk, al: k.al, job: k.job || null }); p.b = k.al ? olC(k.b + olI(-10, 10)) : 60; });
    s.pp.filter(p => p.r === 'gkid' && p.par === kid.i && p.al).forEach(k => { const p = olPerson(n, 'kid', k.g, k.age, { n: k.n, lk: k.lk }); p.b = olI(65, 90); nm.kids++; });
    s.pp.filter(p => p.r === 'pet' && p.al && kid.age < 25).forEach(k => { const p = olPerson(n, 'pet', k.g, k.age, { n: k.n, sp: k.sp, ly: k.ly, lk: k.lk }); p.b = k.b; });
    nm.st = { h: olI(55, 85), H: olC(95 - Math.max(0, kid.age - 25) * 0.8 + olI(-8, 4)), s: olI(25, 90), l: olC(olI(30, 90) - Math.max(0, kid.age - 40) * 0.6) };
    if (kid.age >= 18) { nm.edu.hs = olR() < 0.9 ? 1 : 0; nm.mv = 1; nm.lic = olR() < 0.7 ? 1 : 0; }
    if (kid.age >= 22 && nm.edu.hs && olR() < 0.55) nm.edu.deg = olP(OL_MAJ)[0];
    if (kid.age >= 5 && kid.age < 18) olSchoolStart(n, kid.age < 11 ? 'pri' : kid.age < 15 ? 'mid' : 'high', kid.age < 11 ? 6 : kid.age < 15 ? 4 : 3, { y: kid.age < 11 ? kid.age - 5 : kid.age < 15 ? kid.age - 11 : kid.age - 15 });
    if (kid.age >= 23 && kid.job) {
      const pool = OL_JOB.filter(d => d[1] === 'f' && !olReqOk(n, d).length);
      if (pool.length) { olStartJob(n, olP(pool)[0], Math.min(3, Math.floor((kid.age - 22) / 8))); nm.job.yrs = Math.max(0, kid.age - 23); }
    }
    if (kid.age >= 67) { nm.ret = 1; nm.pen = 12000; nm.job = null; }
    nm.m = share;
    olYearStart(n);
    n.log[0].y = nm.yr;
    olSay(n, [`I am ${kid.n} ${me.ln}, ${me.g === 'f' ? 'daughter' : 'son'} of ${me.fn}. Our family story continues with me, at the age of ${kid.age}.`.replace(me.g === 'f' ? 'daughter' : 'son', kid.g === 'f' ? 'daughter' : 'son'), `Je suis ${kid.n} ${me.ln}, ${kid.g === 'f' ? 'fille' : 'fils'} de ${me.fn}. L’histoire de notre famille continue avec moi, à ${kid.age} ans.`], 'm');
    if (share > 0) olSayC(n, ['I inherited {amt}.', 'J’ai hérité de {amt}.'], { amt: share }, 'g');
    return n;
  }

  const olSvg = (p, vb) => `<svg viewBox="${vb || '0 0 24 24'}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const OL_IC = {
    job: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 13h18"/>',
    school: '<path d="M2 9.5 12 5l10 4.5L12 14z"/><path d="M6 11.5V16c2.5 2.2 9.5 2.2 12 0v-4.5M22 9.5V15"/>',
    home: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5M10 20v-5.5h4V20"/>',
    people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6"/><path d="M16 4.6a3.2 3.2 0 0 1 0 6.3M18 14.4c1.8.8 3 2.8 3 5.6"/>',
    acts: '<path d="M12 3.5l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    chev: '<path d="M9 5l7 7-7 7"/>',
    h: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1.8 2 5.2 2 7 0M9 9.5h.01M15 9.5h.01"/>',
    H: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
    s: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
    l: '<path d="M12 3l1.8 5.2L19 9.5l-4.2 3.3 1.4 5.4L12 15.1l-4.2 3.1 1.4-5.4L5 9.5l5.2-1.3z"/>',
    play: '<path d="M12 3 4 13h6l-1 8 8-11h-6z"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>',
    pad: '<rect x="2.5" y="7" width="19" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3M15.5 12h.01M18 13.5h.01"/>',
    lib: '<path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>',
    run: '<circle cx="14" cy="4.5" r="2"/><path d="M7 21l3.5-6.5L14 17v4M10.5 14.5 12 9l-4 1.5L6 14M12 9l3 3 3.5 1"/>',
    gym: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
    lotus: '<path d="M12 20c-4.5 0-8-2.2-9-5.5 3 .3 5.4 1.5 7 3.3M12 20c4.5 0 8-2.2 9-5.5-3 .3-5.4 1.5-7 3.3M12 20c-2.6-2.4-3.5-5.8-2.6-9.5L12 6l2.6 4.5c.9 3.7 0 7.1-2.6 9.5z"/>',
    doc: '<path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>',
    note: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    brush: '<path d="M14.5 4.5l5 5-8 8-5-5z"/><path d="M6.5 12.5c-2.5 0-3.5 2-3.5 4.5v3.5H7c2.5 0 4.5-1.5 4.5-3.5"/>',
    code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
    chef: '<path d="M7 14v6h10v-6M7 14a4 4 0 0 1-.8-7.9A4.5 4.5 0 0 1 12 3.5a4.5 4.5 0 0 1 5.8 2.6A4 4 0 0 1 17 14z"/>',
    mask: '<path d="M4 5c5 1.5 11 1.5 16 0v6c0 5-3.6 9-8 9s-8-4-8-9z"/><path d="M8 10.5h2M14 10.5h2M9 15c1.8 1.4 4.2 1.4 6 0"/>',
    pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 7l3 3"/>',
    ball: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5l3.8 2.7-1.4 4.4H9.6l-1.4-4.4zM12 3v4.5M3.6 9.5l4.6.7M20.4 9.5l-4.6.7M6.5 19.5l3.1-4.9M17.5 19.5l-3.1-4.9"/>',
    hands: '<path d="M12 20s-6-3.8-6-8.2A3.3 3.3 0 0 1 12 9.6a3.3 3.3 0 0 1 6 2.2C18 16.2 12 20 12 20z"/><path d="M4 9V6M20 9V6M8 4.5 7 3M16 4.5 17 3"/>',
    scissors: '<circle cx="6" cy="6.5" r="2.8"/><circle cx="6" cy="17.5" r="2.8"/><path d="M8.3 8.2 20 18M8.3 15.8 20 6"/>',
    plane: '<path d="M10.5 13.5 3 11l1.5-2 8 1 4.5-5c1-1 2.8-1.3 3.5-.5.8.7.5 2.5-.5 3.5l-5 4.5 1 8-2 1.5-2.5-7.5-4 3.5v2.5L6 21l-1.5-3L2 16.5 3.5 15H6z"/>',
    spa: '<path d="M12 21c-4.4 0-7.5-3-7.5-7 0-4.6 7.5-11 7.5-11s7.5 6.4 7.5 11c0 4-3.1 7-7.5 7z"/><path d="M9 14.5a3 3 0 0 0 3 3"/>',
    car: '<path d="M4 16.5V12l2-5h12l2 5v4.5z"/><path d="M4 12h16"/><circle cx="7.5" cy="16.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
    leaf: '<path d="M5 19C4 11 9 4.5 20 4c.5 10-5.5 16-15 15z"/><path d="M5 19c3-5 6-8 10-10"/>',
    paw: '<circle cx="7" cy="9.5" r="2"/><circle cx="17" cy="9.5" r="2"/><circle cx="10" cy="5.5" r="2"/><circle cx="14" cy="5.5" r="2"/><path d="M7.5 17c0-3.2 2-5.5 4.5-5.5s4.5 2.3 4.5 5.5c0 2.2-2 3-4.5 3s-4.5-.8-4.5-3z"/>',
    tree: '<circle cx="12" cy="4.5" r="2.3"/><circle cx="5.5" cy="18.5" r="2.3"/><circle cx="12" cy="18.5" r="2.3"/><circle cx="18.5" cy="18.5" r="2.3"/><path d="M12 7v9M12 11.5H5.5V16M12 11.5h6.5V16"/>',
    award: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.2 7 21l5-2.5 5 2.5-1.5-7.8"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M14.8 9c-.5-1-1.6-1.6-2.8-1.6-1.6 0-2.9 1-2.9 2.3 0 3 5.8 1.6 5.8 4.6 0 1.3-1.3 2.3-2.9 2.3-1.3 0-2.4-.6-2.9-1.6M12 5.8v1.6M12 16.6v1.6"/>',
    dice: '<rect x="3.5" y="3.5" width="17" height="17" rx="3.5"/><path d="M8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5"/>',
    bank: '<path d="M3 9.5 12 4l9 5.5zM5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 20h18"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    flat: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M11 21v-3h2v3"/>',
    house: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5M10 20v-5.5h4V20"/>',
    cottage: '<path d="M3 12 12 5l9 7M5 10.5V20h14v-9.5M10 20v-5h4v5M16 7.5V5h2v4"/>',
    villa: '<path d="M2.5 20h19M4 20v-8h16v8M3 12l9-6 9 6M8 20v-4h3v4M14.5 15h3"/><path d="M19.5 6.5a2 2 0 1 1-3-2.5"/>',
    bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-7h5l3 7M10 9 8.5 6.5H7M15 9l-3 7"/>',
    scooter: '<circle cx="6" cy="17.5" r="2.5"/><circle cx="18" cy="17.5" r="2.5"/><path d="M8.5 17.5h7M16 5h2.5l-2 12.5M9.5 14h6"/>',
    van: '<path d="M3 16.5V8.5A2.5 2.5 0 0 1 5.5 6H15l5 5v5.5z"/><path d="M15 6v5h5M3 11h12"/><circle cx="7.5" cy="16.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/>',
    gift: '<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5V20h14v-7.5M12 8.5V20M12 8.5C9 8.5 7 7.5 7 5.8 7 4.7 8 4 9 4c2 0 3 2.5 3 4.5zM12 8.5c3 0 5-1 5-2.7C17 4.7 16 4 15 4c-2 0-3 2.5-3 4.5z"/>',
    chat: '<path d="M4 5.5h16v10H10l-4.5 3.5v-3.5H4z"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1.8 2 5.2 2 7 0M9 9.5h.01M15 9.5h.01"/>',
    ring: '<circle cx="12" cy="14.5" r="6"/><path d="M9.5 4h5l1.5 2.5-4 3-4-3z"/>',
    baby: '<circle cx="12" cy="12.5" r="7.5"/><path d="M9.5 12h.01M14.5 12h.01M10 15.5c1.2.9 2.8.9 4 0M12 5c-1.5 0-2 1-1 2"/>',
    broken: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/><path d="M12 7.2 10.5 11l3 2-1.5 3"/>',
    walk: '<circle cx="13" cy="4.5" r="2"/><path d="M9 21l2-6 3 2.5V21M11 15l1-6-3.5 2L7 14.5M12 9l2.5 3 3 .5"/>',
    sell: '<path d="M3 12V4h8l10 10-8 7z"/><circle cx="7.5" cy="8" r="1.5"/>',
    star: '<path d="M12 3.5l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/>'
  };
  const olI2 = k => olSvg(OL_IC[k] || OL_IC.star);
  const OL_PETC = ['#c98b4f', '#3d3532', '#e9e2d6', '#9a7c63', '#f0a95a', '#7d7f86'];
  function olPetSvg(p) {
    const c = OL_PETC[(p.lk && p.lk.hc) % OL_PETC.length || 0], d = '#2a2420', bg = '#ffefd9';
    let o = `<circle cx="32" cy="32" r="32" fill="${bg}"/>`;
    switch (p.sp) {
      case 'dog': o += `<path d="M14 22c-3 8-1 17 5 18l3-14z" fill="${c}" opacity=".75"/><path d="M50 22c3 8 1 17-5 18l-3-14z" fill="${c}" opacity=".75"/><ellipse cx="32" cy="33" rx="15" ry="16" fill="${c}"/><ellipse cx="32" cy="41" rx="8" ry="6" fill="#f6e6d2"/><circle cx="26" cy="30" r="2.2" fill="${d}"/><circle cx="38" cy="30" r="2.2" fill="${d}"/><ellipse cx="32" cy="38" rx="3.4" ry="2.4" fill="${d}"/><path d="M32 40v3M28.5 44c2 1.6 5 1.6 7 0" stroke="${d}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`; break;
      case 'cat': o += `<path d="M18 26l2-14 10 8zM46 26l-2-14-10 8z" fill="${c}"/><ellipse cx="32" cy="35" rx="16" ry="14" fill="${c}"/><path d="M26 31c1 2 3 2 4 0M34 31c1 2 3 2 4 0" stroke="${d}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M30.5 37h3l-1.5 2z" fill="#e9837f"/><path d="M14 36l9 1M14 41l9-1M50 36l-9 1M50 41l-9-1" stroke="${d}" stroke-width="1" opacity=".6"/>`; break;
      case 'rabbit': o += `<ellipse cx="25" cy="16" rx="4.5" ry="12" fill="${c}"/><ellipse cx="39" cy="16" rx="4.5" ry="12" fill="${c}"/><ellipse cx="25" cy="17" rx="2" ry="8" fill="#f3b6b6"/><ellipse cx="39" cy="17" rx="2" ry="8" fill="#f3b6b6"/><ellipse cx="32" cy="38" rx="14" ry="13" fill="${c}"/><circle cx="27" cy="36" r="2" fill="${d}"/><circle cx="37" cy="36" r="2" fill="${d}"/><ellipse cx="32" cy="41" rx="2" ry="1.5" fill="#e9837f"/>`; break;
      case 'hamster': case 'guinea': o += `<ellipse cx="32" cy="36" rx="19" ry="15" fill="${c}"/><circle cx="19" cy="24" r="5" fill="${c}"/><circle cx="45" cy="24" r="5" fill="${c}"/><circle cx="19" cy="24" r="2.5" fill="#f3b6b6"/><circle cx="45" cy="24" r="2.5" fill="#f3b6b6"/><ellipse cx="32" cy="42" rx="10" ry="7" fill="#f6e6d2"/><circle cx="26" cy="33" r="2" fill="${d}"/><circle cx="38" cy="33" r="2" fill="${d}"/><ellipse cx="32" cy="38" rx="1.8" ry="1.3" fill="#e9837f"/>`; break;
      case 'parrot': o += `<ellipse cx="32" cy="36" rx="13" ry="17" fill="#3fb36b"/><path d="M32 14c8 0 13 6 13 12H19c0-6 5-12 13-12z" fill="#e8483d"/><path d="M36 26c6 0 8 4 7 8-3-2-5-2-7-1z" fill="#f2c13c"/><circle cx="29" cy="25" r="2.2" fill="${d}"/><path d="M20 40c-6 6-6 12-4 16l8-9z" fill="#2f86d8"/>`; break;
      case 'fish': o += `<path d="M46 32l12-9v18z" fill="#f08a2e"/><ellipse cx="30" cy="32" rx="18" ry="12" fill="#f5a23b"/><path d="M26 22c4-4 10-4 13 1z" fill="#f08a2e"/><circle cx="20" cy="30" r="2.4" fill="${d}"/><path d="M34 27c2 3 2 7 0 10" stroke="#e07a22" stroke-width="1.6" fill="none"/>`; break;
      case 'tortoise': o += `<ellipse cx="13" cy="35" rx="6" ry="5" fill="#9ab86a"/><ellipse cx="32" cy="34" rx="18" ry="13" fill="#7a9a4a"/><path d="M22 30l5-5h10l5 5-5 5H27z" fill="#a3bf6c"/><circle cx="11" cy="34" r="1.4" fill="${d}"/><path d="M20 46v4M44 46v4" stroke="#9ab86a" stroke-width="4" stroke-linecap="round"/>`; break;
    }
    return `<svg viewBox="0 0 64 64" aria-hidden="true">${o}</svg>`;
  }
  function olFace(lk, g, age, mood, al) {
    if (!lk) lk = { sk: 1, hc: 0, hs: 0, ec: 0, sh: 0 };
    const sk = OL_SKIN[lk.sk] || OL_SKIN[1];
    let hc = OL_HAIR[lk.hc] || OL_HAIR[0];
    if (lk.hc < 6) { if (age >= 74) hc = '#e6e3de'; else if (age >= 56) hc = '#aba59d'; }
    const baby = age < 3, kid = age < 13, old = age >= 64;
    const bg = ['#dbe6ff', '#ffe0e0', '#dcf4e7', '#fff0cc', '#ece2ff', '#ffe6d3', '#d9f2f7', '#fde0ef'][lk.sh] || '#e6ecf5';
    const sh = OL_SHIRT[lk.sh] || OL_SHIRT[0], eye = OL_EYE[lk.ec] || OL_EYE[0];
    const hy = baby ? 30 : 27, rx = baby ? 15 : 13.2, ry = baby ? 14.5 : 15.2;
    let o = `<circle cx="32" cy="32" r="32" fill="${bg}"/>`;
    const longHair = !baby && (lk.hs === 1) ;
    if (longHair) o += `<path d="M17.5 27c-1.5 12 .5 22 4 25h21c3.5-3 5.5-13 4-25-1-10-7-15-14.5-15S18.5 17 17.5 27z" fill="${hc}"/>`;
    o += baby ? `<path d="M15 64c1-9 7-14 17-14s16 5 17 14z" fill="${sh}"/>` : `<path d="M9 64c1.5-11 9-17.5 23-17.5S53.5 53 55 64z" fill="${sh}"/><path d="M26 46.5c1.5 3 10.5 3 12 0" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="2"/>`;
    if (!baby) o += `<rect x="27" y="37" width="10" height="11" rx="4.5" fill="${sk}"/>`;
    o += `<circle cx="${32 - rx}" cy="${hy + 1}" r="3.2" fill="${sk}"/><circle cx="${32 + rx}" cy="${hy + 1}" r="3.2" fill="${sk}"/>`;
    o += `<ellipse cx="32" cy="${hy}" rx="${rx}" ry="${ry}" fill="${sk}"/>`;
    if (kid) o += `<circle cx="24" cy="${hy + 5}" r="2.6" fill="#ff8f8f" opacity=".3"/><circle cx="40" cy="${hy + 5}" r="2.6" fill="#ff8f8f" opacity=".3"/>`;
    const ey = hy + (baby ? 1 : 0), er = baby ? 2.3 : 1.9;
    if (al === 0) o += `<path d="M${26 - er} ${ey}h${er * 2}M${38 - er} ${ey}h${er * 2}" stroke="#2a211e" stroke-width="1.7" stroke-linecap="round"/>`;
    else o += `<circle cx="26.5" cy="${ey}" r="${er}" fill="${eye}"/><circle cx="37.5" cy="${ey}" r="${er}" fill="${eye}"/><circle cx="27.1" cy="${ey - 0.6}" r=".65" fill="#fff"/><circle cx="38.1" cy="${ey - 0.6}" r=".65" fill="#fff"/>`;
    if (!baby) o += `<path d="M23.5 ${ey - 4.2}q3-1.6 5.5 0M35 ${ey - 4.2}q2.5-1.6 5.5 0" stroke="${lk.hc < 6 && age >= 56 ? '#8f877d' : hc}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    if (old) o += `<path d="M21.5 ${ey + 1.5}l-1.5 1M42.5 ${ey + 1.5}l1.5 1M28 ${hy - 9}h8" stroke="rgba(0,0,0,.18)" stroke-width="1" stroke-linecap="round"/>`;
    const my = hy + (baby ? 6.5 : 7.5);
    const mp = mood >= 62 ? `M27.5 ${my}q4.5 4 9 0` : mood >= 38 ? `M28.5 ${my + 1}q3.5 1 7 0` : `M28.5 ${my + 2}q3.5-2.6 7 0`;
    o += `<path d="${mp}" stroke="#8a3d33" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
    if (!baby && g === 'm' && lk.bd && age >= 19) o += `<path d="M19.5 ${hy + 1}c0 9 5 15.5 12.5 15.5S44.5 ${hy + 10} 44.5 ${hy + 1}c-2 5-6 7-12.5 7s-10.5-2-12.5-7z" fill="${hc}"/><path d="${mp}" stroke="#8a3d33" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
    if (baby) o += `<path d="M30 ${hy - 13}c-1-3 2-5 4-3.5-2 0-2.5 2-1 3.5" stroke="${hc}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    else if (lk.hs === 2) { [[20, 21, 5.2], [24.5, 15, 5.4], [31.5, 12.5, 5.8], [38.5, 15, 5.4], [43.5, 21, 5.2], [19, 27, 3.6], [45, 27, 3.6]].forEach(([x, y, r]) => { o += `<circle cx="${x}" cy="${y + hy - 27}" r="${r}" fill="${hc}"/>`; }); }
    else if (lk.hs === 3) o += `<circle cx="32" cy="${hy - 17}" r="5.5" fill="${hc}"/><path d="M18.8 ${hy - 1}c0-9 5.5-14.5 13.2-14.5S45.2 ${hy - 10} 45.2 ${hy - 1}c-3-6-7.5-8.5-13.2-8.5S21.8 ${hy - 7} 18.8 ${hy - 1}z" fill="${hc}"/>`;
    else if (lk.hs === 1) o += `<path d="M18.8 ${hy}c0-10 5.5-15.5 13.2-15.5S45.2 ${hy - 10} 45.2 ${hy}c-4-6-8-8.2-11-8.2-3 2-8.5 4-15.4 8.2z" fill="${hc}"/>`;
    else if (g === 'm' && age >= 62) o += `<path d="M19 ${hy - 2}c0-5 1.5-8 3.5-9.5-1 3-1 6-1 9.5zM45 ${hy - 2}c0-5-1.5-8-3.5-9.5 1 3 1 6 1 9.5z" fill="${hc}"/>`;
    else o += `<path d="M19 ${hy - 1}c0-10 5.5-14.5 13-14.5s13 4.5 13 14.5c-2.5-5-7-7.2-13-7.2s-10.5 2.2-13 7.2z" fill="${hc}"/>`;
    if (!baby && (lk.gl && age >= 9 || age >= 66)) o += `<g fill="none" stroke="#2f3542" stroke-width="1.4"><circle cx="26.5" cy="${ey}" r="4.4"/><circle cx="37.5" cy="${ey}" r="4.4"/><path d="M30.9 ${ey}h2.2M22.1 ${ey - 0.5}l-3-1M41.9 ${ey - 0.5}l3-1"/></g>`;
    return `<svg viewBox="0 0 64 64" aria-hidden="true"${al === 0 ? ' style="filter:grayscale(1);opacity:.75"' : ''}>${o}</svg>`;
  }
  const olAv = (p, me) => (p.r === 'pet' ? olPetSvg(p) : olFace(p.lk, p.g, p.age, p.al ? 50 + p.b / 3 : 50, p.al ? 1 : 0));
  const olMeAv = me => olFace(me.lk, me.g, me.age, me.st.h, me.al ? 1 : 0);
  function olBadge(id, sz) {
    const a = OL_AWM[id] || OL_AWM.ordinary, c = a[3];
    const glyph = { century: '100', tycoon: '$', genius: 'Ph', star: '★', healer: '+', mentor: 'A', clan: '4', kind: '♥', athlete: '1', artist: '♪', globe: '✈', rich: '$', scholar: '∑', boss: '▲', love: '∞', happy: '☀', healthy: '♡', book: '¶', social: '☺', jack: '⚙', animal: '❀', brief: '·', ordinary: '○' }[a[0]] || '○';
    return `<svg viewBox="0 0 64 64" width="${sz || 56}" height="${sz || 56}" aria-hidden="true"><path d="M20 38 14 62l10-5 6 7 2-24zM44 38l6 24-10-5-6 7-2-24z" fill="${c}" opacity=".75"/><circle cx="32" cy="26" r="22" fill="${c}"/><circle cx="32" cy="26" r="17" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"/><text x="32" y="${glyph.length > 1 ? 31.5 : 33}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="${glyph.length > 2 ? 13 : glyph.length > 1 ? 15 : 20}" fill="#fff">${glyph}</text></svg>`;
  }

  const OL_CSS = `
.gm-one-life{--bg:#eef2f8;--card:#fff;--ink:#1d2738;--mut:#69768b;--line:#e2e7ef;--acc:#22b573;--accd:#17925b;--blue:#3d7be0;--bad:#e5533d;--good:#1fa463;position:relative;padding:0;gap:0;align-items:stretch;justify-content:flex-start;overflow:hidden;border-radius:14px;background:var(--bg);color:var(--ink);font-family:var(--sans);height:clamp(520px,calc(100dvh - max(var(--goff,250px),168px)),880px);min-height:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.gm-one-life [hidden]{display:none!important}
.gm-one-life button{font-family:inherit;color:inherit;cursor:pointer}
.gm-one-life svg{display:block}
.gm-one-life .ol-app{position:absolute;inset:0;display:grid;grid-template-rows:auto minmax(0,1fr)}
.gm-one-life .ol-hd{display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--card);border-bottom:1px solid var(--line)}
.gm-one-life .ol-me{display:flex;align-items:center;gap:11px;min-width:0;flex:1;border:0;background:none;padding:2px 6px 2px 2px;border-radius:14px;text-align:left}
.gm-one-life .ol-me:hover{background:#f3f6fb}
.gm-one-life .ol-av{flex:none;width:50px;height:50px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 2px #fff,0 0 0 3.5px var(--line)}
.gm-one-life .ol-av svg{width:100%;height:100%}
.gm-one-life .ol-nm{display:block;font:800 17px/1.2 var(--sans);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm-one-life .ol-sub{display:block;font-size:13px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
.gm-one-life .ol-cash{flex:none;text-align:right}
.gm-one-life .ol-cash small{display:block;font-size:11px;color:var(--mut);text-transform:uppercase;letter-spacing:.06em;font-weight:700}
.gm-one-life .ol-cash b{display:block;font:800 18px/1.2 var(--sans);font-variant-numeric:tabular-nums;color:var(--good)}
.gm-one-life .ol-cash b.neg{color:var(--bad)}
.gm-one-life .ol-body{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,390px);min-height:0}
.gm-one-life .ol-main{display:flex;flex-direction:column;min-height:0;min-width:0}
.gm-one-life .ol-feed{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:10px 14px 16px;scroll-behavior:smooth}
.gm-one-life .yb{background:var(--card);border-radius:14px;padding:10px 14px 11px;margin-bottom:9px;box-shadow:0 1px 2px rgba(20,30,50,.06)}
.gm-one-life .yh{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:5px}
.gm-one-life .yh b{font:800 15px/1.3 var(--sans);color:var(--blue)}
.gm-one-life .yh span{font-size:12px;color:var(--mut);font-variant-numeric:tabular-nums}
.gm-one-life .yb p{position:relative;margin:3px 0 0;padding-left:14px;font-size:15px;line-height:1.42}
.gm-one-life .yb p:before{content:"";position:absolute;left:0;top:.55em;width:6px;height:6px;border-radius:50%;background:#c4ccd8}
.gm-one-life .yb p.g:before{background:var(--good)}
.gm-one-life .yb p.b:before{background:var(--bad)}
.gm-one-life .yb p.m{font-weight:700}
.gm-one-life .yb p.m:before{background:var(--blue)}
.gm-one-life .yb.new{animation:olIn .35s ease-out}
@keyframes olIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.gm-one-life .ol-stats{display:grid;grid-template-columns:1fr 1fr;gap:6px 46px;padding:10px 14px 16px;background:var(--card);border-top:1px solid var(--line)}
.gm-one-life .st{display:grid;grid-template-columns:20px auto 1fr 38px;align-items:center;gap:7px;font-size:13px;font-weight:700}
.gm-one-life .st svg{width:18px;height:18px;color:var(--mut)}
.gm-one-life .st .br{position:relative;height:10px;border-radius:99px;background:#e9edf3;overflow:hidden}
.gm-one-life .st .br i{position:absolute;left:0;top:0;bottom:0;border-radius:99px;transition:width .5s,background .5s}
.gm-one-life .st em{font-style:normal;text-align:right;font-variant-numeric:tabular-nums;color:var(--mut)}
.gm-one-life .st .dl{position:absolute;right:0;top:-1px;font-size:10px}
.gm-one-life .ol-nav{display:grid;grid-template-columns:repeat(5,1fr);align-items:end;background:var(--card);border-top:1px solid var(--line);padding:4px 6px calc(6px + env(safe-area-inset-bottom,0px))}
.gm-one-life .nb{display:flex;flex-direction:column;align-items:center;gap:3px;border:0;background:none;padding:7px 2px 4px;border-radius:12px;font-size:12px;font-weight:700;color:var(--mut);min-width:0}
.gm-one-life .nb svg{width:23px;height:23px}
.gm-one-life .nb span{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm-one-life .nb:hover{background:#f2f5fa;color:var(--ink)}
.gm-one-life .nb[aria-pressed="true"]{color:var(--blue)}
.gm-one-life .nb.age{position:relative;margin-top:-22px}
.gm-one-life .nb.age i{display:grid;place-items:center;width:66px;height:66px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#4fd896,var(--acc) 60%,var(--accd));color:#fff;box-shadow:0 6px 14px rgba(23,146,91,.35),0 0 0 5px var(--card);transition:transform .12s}
.gm-one-life .nb.age i svg{width:30px;height:30px;stroke-width:3}
.gm-one-life .nb.age:hover{background:none}
.gm-one-life .nb.age:hover i{transform:scale(1.05)}
.gm-one-life .nb.age:active i{transform:scale(.95)}
.gm-one-life .nb.age span{color:var(--accd);font-weight:800}
.gm-one-life .nb.age:disabled{opacity:.5;cursor:default}
.gm-one-life .ol-side{min-height:0;overflow-y:auto;overscroll-behavior:contain;background:var(--card);border-left:1px solid var(--line)}
.gm-one-life .ol-side .sx{display:none}
.gm-one-life.narrow .ol-body{grid-template-columns:minmax(0,1fr)}
.gm-one-life.narrow .ol-side{position:absolute;inset:0 0 var(--nh,70px);z-index:5;border-left:0;transform:translateY(100%);transition:transform .25s ease;visibility:hidden}
.gm-one-life.narrow .ol-side.open{transform:none;visibility:visible}
.gm-one-life.narrow .ol-side .sx{display:grid}
.gm-one-life .ph{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:8px;padding:12px 14px 10px;background:var(--card);border-bottom:1px solid var(--line)}
.gm-one-life .ph h3{flex:1;margin:0;font:800 17px/1.2 var(--sans)}
.gm-one-life .ib{display:grid;place-items:center;flex:none;width:34px;height:34px;border-radius:50%;border:0;background:#eef2f8}
.gm-one-life .ib svg{width:18px;height:18px}
.gm-one-life .ib:hover{background:#e2e8f2}
.gm-one-life .pc{padding:10px 14px 18px}
.gm-one-life .sec{margin:14px 0 6px;font-size:12px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--mut)}
.gm-one-life .sec:first-child{margin-top:4px}
.gm-one-life .card{background:#f6f8fc;border:1px solid var(--line);border-radius:14px;padding:12px}
.gm-one-life .card h4{margin:0 0 3px;font:800 16px/1.25 var(--sans)}
.gm-one-life .card p{margin:2px 0;font-size:13.5px;color:var(--mut)}
.gm-one-life .row{display:flex;align-items:center;gap:11px;width:100%;margin:0 0 6px;padding:9px 11px;border:1px solid var(--line);border-radius:13px;background:var(--card);text-align:left;font-size:14.5px}
.gm-one-life button.row:hover:not(:disabled){border-color:#c9d3e2;background:#f8fafd}
.gm-one-life button.row:disabled{opacity:.55;cursor:default}
.gm-one-life .row .ri{display:grid;place-items:center;flex:none;width:38px;height:38px;border-radius:11px;background:#eef3fb;color:var(--blue)}
.gm-one-life .row .ri svg{width:21px;height:21px}
.gm-one-life .row .ra{flex:none;width:42px;height:42px;border-radius:50%;overflow:hidden}
.gm-one-life .row .ra svg{width:100%;height:100%}
.gm-one-life .row .rt{flex:1;min-width:0}
.gm-one-life .row .rt b{display:block;font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm-one-life .row .rt small{display:block;font-size:12.5px;color:var(--mut);margin-top:1px;white-space:normal}
.gm-one-life .row .rv{flex:none;font-size:13px;font-weight:800;color:var(--mut);font-variant-numeric:tabular-nums;text-align:right}
.gm-one-life .row .rv.ok{color:var(--good)}
.gm-one-life .row .rv.no{color:var(--bad)}
.gm-one-life .row.done .rv{color:var(--good)}
.gm-one-life .bond{display:block;height:6px;border-radius:99px;background:#e9edf3;margin-top:5px;overflow:hidden;max-width:190px}
.gm-one-life .bond i{display:block;height:100%;border-radius:99px}
.gm-one-life .pbar{height:9px;border-radius:99px;background:#e3e8f0;overflow:hidden;margin:7px 0 3px}
.gm-one-life .pbar i{display:block;height:100%;border-radius:99px;background:var(--blue);transition:width .4s}
.gm-one-life .kv{display:grid;grid-template-columns:1fr auto;gap:5px 10px;font-size:14px}
.gm-one-life .kv span{color:var(--mut)}
.gm-one-life .kv b{text-align:right;font-variant-numeric:tabular-nums}
.gm-one-life .hint{font-size:13px;color:var(--mut);margin:6px 2px;line-height:1.4}
.gm-one-life .pf{display:flex;align-items:center;gap:14px;margin-bottom:6px}
.gm-one-life .pf .ra{width:76px;height:76px;border-radius:50%;overflow:hidden;flex:none;box-shadow:0 0 0 3px #fff,0 0 0 4.5px var(--line)}
.gm-one-life .pf .ra svg{width:100%;height:100%}
.gm-one-life .pf h4{margin:0;font:800 19px/1.2 var(--sans)}
.gm-one-life .pf p{margin:3px 0 0;font-size:13.5px;color:var(--mut)}
.gm-one-life .sk{display:grid;grid-template-columns:110px 1fr 34px;align-items:center;gap:8px;font-size:13.5px;margin:5px 0}
.gm-one-life .sk .pbar{margin:0}
.gm-one-life .sk em{font-style:normal;color:var(--mut);text-align:right;font-variant-numeric:tabular-nums}
.gm-one-life .aw{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}
.gm-one-life .aw div{display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px;padding:10px 6px;border:1px solid var(--line);border-radius:13px;background:#fafbfd;font-size:12.5px;font-weight:700}
.gm-one-life .aw div.lk{opacity:.45;filter:grayscale(1)}
.gm-one-life .aw small{font-weight:600;color:var(--mut);font-size:11.5px;line-height:1.3}
.gm-one-life .tr{display:flex;flex-direction:column;align-items:center;gap:0}
.gm-one-life .tg{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;padding:8px 0;position:relative}
.gm-one-life .tg+.tg:before{content:"";position:absolute;left:50%;top:-6px;height:12px;border-left:2px solid #cfd7e4}
.gm-one-life .tn{display:flex;flex-direction:column;align-items:center;width:76px;text-align:center;font-size:11.5px;line-height:1.25}
.gm-one-life .tn .ra{width:46px;height:46px;border-radius:50%;overflow:hidden;margin-bottom:3px}
.gm-one-life .tn .ra svg{width:100%;height:100%}
.gm-one-life .tn b{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:76px}
.gm-one-life .tn span{color:var(--mut)}
.gm-one-life .tn.me .ra{box-shadow:0 0 0 3px var(--acc)}
.gm-one-life .tlab{font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--mut);margin-top:6px}
.gm-one-life .gl{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--line);border-radius:12px;margin-bottom:6px;background:#fafbfd}
.gm-one-life .gl .ra{width:40px;height:40px;border-radius:50%;overflow:hidden;flex:none}
.gm-one-life .gl .ra svg{width:100%;height:100%}
.gm-one-life .gl div{flex:1;min-width:0;font-size:13px}
.gm-one-life .gl b{display:block;font-size:14px}
.gm-one-life .gl span{color:var(--mut)}
.gm-one-life .ol-pop{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(18,26,40,.42);animation:olFade .18s ease-out}
@keyframes olFade{from{opacity:0}to{opacity:1}}
.gm-one-life .pk{width:min(460px,100%);max-height:100%;overflow-y:auto;background:var(--card);border-radius:20px;padding:18px 18px 16px;box-shadow:0 20px 50px rgba(10,20,40,.3);animation:olPop .22s cubic-bezier(.2,.9,.3,1.2)}
@keyframes olPop{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}
.gm-one-life .pk .pa{width:64px;height:64px;border-radius:50%;overflow:hidden;margin:0 auto 8px}
.gm-one-life .pk .pa svg{width:100%;height:100%}
.gm-one-life .pk .pi{display:grid;place-items:center;width:58px;height:58px;border-radius:18px;margin:0 auto 8px;background:#eef3fb;color:var(--blue)}
.gm-one-life .pk .pi svg{width:30px;height:30px}
.gm-one-life .pk h3{margin:0 0 6px;text-align:center;font:800 19px/1.25 var(--sans)}
.gm-one-life .pk .pt{margin:0 0 14px;text-align:center;font-size:15.5px;line-height:1.45;color:#38445a}
.gm-one-life .pk .ch{display:block;width:100%;margin:0 0 8px;padding:12px 14px;border:0;border-radius:13px;background:var(--blue);color:#fff!important;font-size:15px;font-weight:750;text-align:left;line-height:1.3;transition:filter .12s,transform .08s}
.gm-one-life .pk .ch small{display:block;font-weight:600;font-size:12.5px;opacity:.85;margin-top:2px}
.gm-one-life .pk .ch:hover:not(:disabled){filter:brightness(1.08)}
.gm-one-life .pk .ch:active:not(:disabled){transform:scale(.985)}
.gm-one-life .pk .ch:disabled{background:#c7cfdc;cursor:default}
.gm-one-life .pk .ch.alt{background:#eef2f8;color:var(--ink)!important}
.gm-one-life .pk .ch.go{background:var(--acc)}
.gm-one-life .pk .ch.warn{background:var(--bad)}
.gm-one-life .pk .ch kbd{float:right;font:700 11px/1 var(--sans);opacity:.7;border:1px solid rgba(255,255,255,.5);border-radius:5px;padding:3px 5px;margin-left:8px}
.gm-one-life .pk .ch.alt kbd{border-color:#c5cedb}
.gm-one-life .chips{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin:-4px 0 14px}
.gm-one-life .chips span{display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:99px;font-size:12.5px;font-weight:800;background:#e8f7ef;color:var(--good)}
.gm-one-life .chips span.n{background:#fdeceа;background:#fdece9;color:var(--bad)}
.gm-one-life .pk input[type=text]{width:100%;box-sizing:border-box;margin:0 0 10px;padding:11px 13px;border:1.5px solid var(--line);border-radius:12px;font:600 16px var(--sans);color:var(--ink);background:#fff}
.gm-one-life .pk input[type=text]:focus{outline:none;border-color:var(--blue)}
.gm-one-life .seg{display:flex;gap:6px;margin:0 0 10px}
.gm-one-life .seg button{flex:1;padding:9px;border-radius:11px;border:1.5px solid var(--line);background:#fff;font-weight:750;font-size:14px}
.gm-one-life .seg button[aria-pressed="true"]{border-color:var(--blue);background:#eef4ff;color:var(--blue)}
.gm-one-life .ol-scr{position:absolute;inset:0;z-index:30;overflow-y:auto;background:linear-gradient(160deg,#dff3ea,#e4ecfb 55%,#f3e6f6);display:flex;align-items:flex-start;justify-content:center;padding:22px 16px}
.gm-one-life .scr{width:min(520px,100%);margin:auto 0}
.gm-one-life .logo{text-align:center;margin:4px 0 14px}
.gm-one-life .logo b{display:block;font:900 clamp(34px,6vw,46px)/1 var(--sans);letter-spacing:-.02em;color:#173a5c}
.gm-one-life .logo b em{font-style:normal;color:var(--acc)}
.gm-one-life .logo span{display:block;margin-top:6px;color:var(--mut);font-size:15px}
.gm-one-life .scr .pk{width:100%;animation:none}
.gm-one-life .nw{display:flex;gap:14px;align-items:center;margin-bottom:12px}
.gm-one-life .nw .pa{width:84px;height:84px;margin:0;flex:none}
.gm-one-life .nw .f{flex:1;min-width:0}
.gm-one-life .nw input[type=text]{margin-bottom:7px}
.gm-one-life .lbl{display:block;font-size:12px;font-weight:800;color:var(--mut);text-transform:uppercase;letter-spacing:.06em;margin:0 0 5px}
.gm-one-life .mini{display:flex;justify-content:center;gap:16px;margin-top:12px;font-size:13px;color:var(--mut);flex-wrap:wrap}
.gm-one-life .mini b{color:var(--ink)}
.gm-one-life .end .big{display:flex;flex-direction:column;align-items:center;margin:2px 0 10px}
.gm-one-life .end .big .pa{width:92px;height:92px}
.gm-one-life .end .yrs{font-size:14px;color:var(--mut);font-weight:700;margin-top:-2px}
.gm-one-life .end .awd{display:flex;align-items:center;gap:12px;padding:10px 12px;margin:0 0 12px;border-radius:14px;background:#fff8e6;border:1px solid #f2e3b8}
.gm-one-life .end .awd b{display:block;font-size:16px}
.gm-one-life .end .awd small{display:block;color:var(--mut);font-size:13px}
.gm-one-life .end .awd em{display:inline-block;margin-left:6px;font-style:normal;font-size:11px;font-weight:800;color:#b5801b;text-transform:uppercase;letter-spacing:.05em}
.gm-one-life .end .kv{margin-bottom:14px}
.gm-one-life.narrow .ol-hd{padding:8px 12px}
.gm-one-life.narrow .ol-av{width:44px;height:44px}
.gm-one-life.narrow .ol-feed{padding:8px 10px 12px}
.gm-one-life.narrow .yb p{font-size:14.5px}
.gm-one-life.narrow .ol-stats{gap:5px 40px;padding:8px 12px 14px}
.gm-one-life.narrow .st{grid-template-columns:18px 1fr 34px;font-size:12px}
.gm-one-life.narrow .st .lb{display:none}
.gm-one-life.narrow .nb{font-size:11px}
.gm-one-life.tiny .ol-stats{grid-template-columns:1fr 1fr}
`;

  function olSan(raw) {
    const G = { v: OL_V, cur: null, tree: [], aw: {}, best: 0, lives: 0, tab: 'occ' };
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return G;
    const num = (v, a, b, d) => (typeof v === 'number' && isFinite(v) ? Math.max(a, Math.min(b, v)) : d);
    const str = (v, n, d) => (typeof v === 'string' ? v.slice(0, n) : d);
    if (raw.aw && typeof raw.aw === 'object') Object.keys(raw.aw).slice(0, 40).forEach(k => { if (OL_AWM[k]) G.aw[k] = num(raw.aw[k], 0, 1e6, 0) | 0; });
    G.best = num(raw.best, 0, 130, 0) | 0;
    G.lives = num(raw.lives, 0, 1e6, 0) | 0;
    if (['occ', 'assets', 'people', 'acts'].includes(raw.tab)) G.tab = raw.tab;
    if (Array.isArray(raw.tree)) raw.tree.slice(-60).forEach(t => {
      if (!t || typeof t !== 'object') return;
      G.tree.push({ n: str(t.n, 60, '?'), g: t.g === 'f' ? 'f' : 'm', b: num(t.b, -1e4, 1e5, 0) | 0, d: num(t.d, -1e4, 1e5, 0) | 0, a: num(t.a, 0, 130, 0) | 0, aw: OL_AWM[t.aw] ? t.aw : 'ordinary', j: Array.isArray(t.j) ? [str(t.j[0], 80, ''), str(t.j[1], 80, '')] : null, w: num(t.w, -1e10, 1e11, 0), k: num(t.k, 0, 50, 0) | 0, ln: num(t.ln, 0, 1e10, 0), gen: num(t.gen, 1, 999, 1) | 0, lk: olSanLook(t.lk) });
    });
    try { G.cur = olSanState(raw.cur); } catch (e) { G.cur = null; }
    return G;
  }
  function olSanLook(l) {
    const n = (v, b) => (Number.isInteger(v) && v >= 0 && v <= b ? v : 0);
    l = l && typeof l === 'object' ? l : {};
    return { sk: n(l.sk, 5), hc: n(l.hc, 8), hs: n(l.hs, 3), ec: n(l.ec, 3), sh: n(l.sh, 7), bd: l.bd ? 1 : 0, gl: l.gl ? 1 : 0 };
  }
  function olSanState(c) {
    if (!c || typeof c !== 'object' || c.v !== OL_V) return null;
    const ok = (v, a, b) => typeof v === 'number' && isFinite(v) && v >= a && v <= b;
    const me = c.me;
    if (!me || typeof me !== 'object' || typeof me.fn !== 'string' || typeof me.ln !== 'string') return null;
    if (!ok(me.age, 0, 130) || !ok(me.yr, -1e4, 1e5) || !ok(me.m, -1e11, 1e11) || !ok(me.debt, 0, 1e9)) return null;
    if (!me.st || !['h', 'H', 's', 'l'].every(k => ok(me.st[k], 0, 100))) return null;
    if (!['k', 'f', 'a'].every(k => ok(me[k], 0, 100))) return null;
    if (!me.sk || !OL_SK.every(k => ok(me.sk[k], 0, 100))) return null;
    if (!Array.isArray(c.pp) || c.pp.length > 300 || !Array.isArray(c.log) || c.log.length > 140 || !Array.isArray(c.q) || c.q.length > 12) return null;
    if (!Array.isArray(me.ill) || !Array.isArray(me.as) || !Array.isArray(me.dn) || !Array.isArray(me.hist) || !Array.isArray(me.sum)) return null;
    if (!me.fl || typeof me.fl !== 'object' || !me.cnt || typeof me.cnt !== 'object' || !me.ev || typeof me.ev !== 'object' || !me.edu || typeof me.edu !== 'object') return null;
    me.fn = me.fn.slice(0, 24); me.ln = me.ln.slice(0, 24);
    me.g = me.g === 'f' ? 'f' : 'm';
    me.lk = olSanLook(me.lk);
    me.city = Number.isInteger(me.city) && OL_CITY[me.city] ? me.city : 0;
    me.ill = me.ill.filter(x => Array.isArray(x) && OL_ILLM[x[0]]).slice(0, 20).map(x => [x[0], x[1] | 0, x[2] ? 1 : 0]);
    me.as = me.as.filter(a => a && (a.t === 'house' ? OL_HOUSEM[a.id] : a.t === 'car' ? OL_CARM[a.id] : 0) && ok(a.v, 0, 1e10) && (a.lo === undefined || ok(a.lo, 0, 1e10))).slice(0, 30).map(a => ({ t: a.t, id: a.id, v: a.v, lo: a.lo || 0, pm: ok(a.pm, 0, 1e9) ? a.pm : 0, y: a.y | 0 }));
    me.dn = me.dn.filter(x => typeof x === 'string').slice(0, 60);
    me.hist = me.hist.filter(x => OL_JOBM[x]).slice(0, 60);
    if (me.sum.length !== 3 || !me.sum.every(v => ok(v, 0, 1e7))) me.sum = [0, 0, 0];
    if (me.job) { const j = me.job, d = OL_JOBM[j.id]; if (!d || !Number.isInteger(j.lvl) || j.lvl < 0 || j.lvl >= d[6].length || !ok(j.perf, 0, 100) || !ok(j.sal, 0, 1e8)) me.job = null; else { j.yrs = j.yrs | 0; j.ly = j.ly | 0; j.t = d[1]; } }
    if (me.sch) { const k = me.sch; if (!['pri', 'mid', 'high', 'uni', 'grad'].includes(k.k) || !ok(k.perf, 0, 100) || !ok(k.y, 0, 20) || !ok(k.n, 1, 20) || (k.k === 'uni' && !OL_MAJM[k.maj]) || (k.k === 'grad' && !OL_GRADM[k.maj])) me.sch = null; else { k.sum = ok(k.sum, 0, 3000) ? k.sum : 0; k.gr = ok(k.gr, 0, 100) ? k.gr : 0; if (k.club && !['s', 'a', 'act', 'art', 'mus', 'cod', 'wri'].includes(k.club)) k.club = null; k.ci = Number.isInteger(k.ci) && OL_CLUBS[k.ci] ? k.ci : 0; } }
    const e = me.edu;
    e.hs = e.hs ? 1 : 0; if (!OL_MAJM[e.deg]) e.deg = null; if (!OL_GRADM[e.grad]) e.grad = null; e.ex = ok(e.ex, 0, 100) ? e.ex : 0; e.gpa = ok(e.gpa, 0, 100) ? e.gpa : 0;
    ['kids', 'pets', 'mar', 'top', 'lic', 'mv', 'ret'].forEach(k => { me[k] = ok(me[k], 0, 1e4) ? me[k] | 0 : 0; });
    me.pen = ok(me.pen, 0, 1e7) ? me.pen : 0;
    me.inst = Number.isInteger(me.inst) && OL_INST[me.inst] ? me.inst : -1;
    me.spt = Number.isInteger(me.spt) && OL_SPORT[me.spt] ? me.spt : -1;
    me.al = me.al ? 1 : 0;
    const ids = new Set();
    c.pp = c.pp.filter(p => p && typeof p === 'object' && Number.isInteger(p.i) && !ids.has(p.i) && ids.add(p.i) && typeof p.n === 'string' && ['mom', 'dad', 'sib', 'gp', 'friend', 'love', 'kid', 'gkid', 'pet'].includes(p.r) && ok(p.age, 0, 130) && ok(p.b, 0, 100) && (p.r !== 'pet' || OL_PETM[p.sp]));
    c.pp.forEach(p => { p.n = p.n.slice(0, 24); p.g = p.g === 'f' ? 'f' : 'm'; p.al = p.al ? 1 : 0; p.lk = olSanLook(p.lk); p.d = Array.isArray(p.d) ? p.d.filter(x => typeof x === 'string').slice(0, 20) : []; if (p.job && !(Array.isArray(p.job) && typeof p.job[0] === 'string')) p.job = null; if (p.r === 'love' && !['date', 'eng', 'mar'].includes(p.st)) p.st = 'date'; if (p.r === 'pet') p.ly = ok(p.ly, 1, 120) ? p.ly : 10; });
    c.nid = Math.max(c.nid | 0, ...c.pp.map(p => p.i), 0);
    c.log = c.log.filter(b => b && ok(b.a, 0, 130) && Array.isArray(b.l)).map(b => ({ a: b.a, y: ok(b.y, -1e4, 1e5) ? b.y : 0, l: b.l.filter(x => Array.isArray(x) && typeof x[0] === 'string').slice(-40).map(x => [x[0].slice(0, 500), typeof x[1] === 'string' ? x[1].slice(0, 500) : x[0].slice(0, 500), ['g', 'b', 'm', ''].includes(x[2]) ? x[2] : '']) }));
    if (!c.log.length) c.log.push({ a: me.age, y: me.yr, l: [] });
    c.q = c.q.filter(d => d && typeof d === 'object' && ['ev', 'after', 'fail', 'grad', 'work', 'retire', 'baby'].includes(d.k) && (d.k !== 'ev' || OL_EVM[d.id]));
    c.pw = Number.isInteger(c.pw) && c.pw >= 0 && c.pw <= 3 ? c.pw : 1;
    c.gen = ok(c.gen, 1, 999) ? c.gen | 0 : 1;
    c.line = ok(c.line, 0, 1e10) ? c.line : 1;
    c.net = ok(c.net, -1e10, 1e10) ? c.net : 0;
    c.preg = c.preg ? 1 : 0;
    if (c.lst && !(Array.isArray(c.lst.ids) && c.lst.ids.every(x => OL_JOBM[x]))) c.lst = null;
    if (c.shop && !(Array.isArray(c.shop.h) && Array.isArray(c.shop.c))) c.shop = null;
    if (!me.al && !Array.isArray(me.aw)) me.aw = olAward(c);
    if (Array.isArray(me.aw)) me.aw = me.aw.filter(x => OL_AWM[x]);
    if (!me.al && !me.cause) me.cause = OL_CAUSE.age;
    return c;
  }

  const OL_EVI = { firstword: 'chat', crayon: 'brush', tooth: 'smile', spelling: 'pen', sciencefair: 'code', wallet: 'coin', snowday: 'star', window: 'ball', talentkid: 'mic', museum: 'lib', newgame: 'pad', tree: 'leaf', lemonade: 'coin', play: 'mask', photo: 'chat', detention: 'school', shelter: 'paw', dye: 'scissors', olympiad: 'award', stress: 'book', careersfair: 'job', classrep: 'award', fresher: 'star', essay: 'pen', intern: 'job', overtime: 'job', officeparty: 'note', rival: 'job', mistake: 'job', worktrip: 'plane', teamday: 'star', charityrun: 'run', noise: 'note', breakdown: 'car', scam: 'chat', jury: 'lib', marathon: 'run', reunion: 'school', dinner: 'chef', straycat: 'paw', roof: 'house', hobby: 'brush', adventure: 'globe', cruise: 'plane', tablet: 'chat', memoir: 'pen', checkup: 'doc', diet: 'leaf', sleep: 'lotus', flood: 'house', neighbour: 'hands', blood: 'H', celeb: 'star', startup: 'code', quiz: 's', donate: 'hands', concert: 'note', relocate: 'plane', learnlang: 'globe', lostdog: 'paw', garage: 'home', tryout: 'ball', trip: 'plane' };
  const OL_CLUBS = [['s', ['Chess club', 'Club d’échecs']], ['s', ['Debate club', 'Club de débat']], ['act', ['Drama club', 'Club de théâtre']], ['art', ['Art club', 'Club d’arts plastiques']], ['mus', ['School choir', 'Chorale']], ['cod', ['Robotics club', 'Club de robotique']], ['a', ['School sports team', 'Équipe de sport']], ['wri', ['School newspaper', 'Journal du lycée']]];

  function mountOneLife(root, api) {
    let G = olSan(api.load());
    let s = G.cur, tab = G.tab, sel = null, sub = null, pop = null, res = null, tq = [], fed = { n: -1, l: 0 }, lastLang = olLang(), saveT = 0, ageLock = 0, newF = null;
    root.innerHTML = `<div class="ol-app"><header class="ol-hd"><button type="button" class="ol-me" data-a="me"><span class="ol-av"></span><span style="min-width:0"><b class="ol-nm"></b><small class="ol-sub"></small></span></button><div class="ol-cash"><small></small><b></b></div></header><div class="ol-body"><section class="ol-main"><div class="ol-feed" aria-live="polite"></div><div class="ol-stats"></div><nav class="ol-nav"></nav></section><aside class="ol-side"></aside></div></div><div class="ol-pop" hidden></div><div class="ol-scr" hidden></div>`;
    const $ = q => root.querySelector(q);
    const feed = $('.ol-feed'), side = $('.ol-side'), nav = $('.ol-nav'), stats = $('.ol-stats'), popEl = $('.ol-pop'), scr = $('.ol-scr');
    const narrow = () => root.classList.contains('narrow');
    const persist = () => { clearTimeout(saveT); saveT = setTimeout(snap, 250); };
    function snap() { clearTimeout(saveT); G.cur = s; G.tab = tab; try { api.save(G); } catch (e) {} }
    api.on(window, 'pagehide', snap);
    const sfx = n => api.sfx(n);
    const me = () => s.me;

    function stage() {
      const m = me(), sc = m.sch;
      if (!m.al) return L('Deceased');
      if (sc) return sc.k === 'pri' ? L('Primary school') : sc.k === 'mid' ? L('Middle school') : sc.k === 'high' ? L('High school') : sc.k === 'uni' ? L('University student') : L('Graduate student');
      if (m.job) return olJobT(m.job.id, m.job.lvl, m.g);
      if (m.ret) return L('Retired');
      if (m.age < 5) return m.age < 2 ? L('Baby') : L('Toddler');
      if (m.age < 18) return L('Child');
      return L('Unemployed');
    }
    function renderHead() {
      const m = me();
      $('.ol-av').innerHTML = olMeAv(m);
      $('.ol-nm').textContent = m.fn + ' ' + m.ln;
      $('.ol-sub').textContent = L('Age {n}', { n: m.age }) + ' · ' + stage();
      $('.ol-cash small').textContent = L('Bank balance');
      const b = $('.ol-cash b');
      b.textContent = olMoney(m.m);
      b.classList.toggle('neg', m.m < 0);
      api.score(m.age);
    }
    const barC = v => (v < 25 ? '#e5533d' : v < 45 ? '#f08a24' : v < 65 ? '#e8c22e' : v < 82 ? '#7cc443' : '#22b573');
    let prevSt = null;
    function renderStats() {
      const st = me().st, names = { h: L('Happiness'), H: L('Health'), s: L('Smarts'), l: L('Looks') };
      if (!stats.firstChild) stats.innerHTML = ['h', 'H', 's', 'l'].map(k => `<div class="st" data-k="${k}">${olI2(k)}<span class="lb"></span><span class="br"><i></i></span><em></em></div>`).join('');
      ['h', 'H', 's', 'l'].forEach(k => {
        const v = Math.round(st[k]), r = stats.querySelector(`[data-k="${k}"]`);
        r.querySelector('.lb').textContent = names[k];
        r.title = names[k];
        const i = r.querySelector('i');
        i.style.width = v + '%'; i.style.background = barC(v);
        r.querySelector('em').textContent = v + '%';
      });
      prevSt = Object.assign({}, st);
    }
    function lineHtml(x) {
      const t = olMoneyTxt(olFr() ? x[1] : x[0]);
      return `<p class="${x[2]}">${olEsc(t)}</p>`;
    }
    function blockHtml(b, nw) {
      const h = b.a === 0 ? L('Born') : L('Age {n}', { n: b.a });
      return `<div class="yb${nw ? ' new' : ''}"><div class="yh"><b>${h}</b><span>${b.y}</span></div>${b.l.map(lineHtml).join('')}</div>`;
    }
    function renderFeed(full) {
      const log = s.log;
      if (full || fed.n < 0 || fed.n > log.length || feed.children.length !== fed.n) {
        feed.innerHTML = log.map(b => blockHtml(b)).join('');
        fed = { n: log.length, l: log.length ? log[log.length - 1].l.length : 0 };
      } else {
        if (fed.n === log.length) {
          const b = log[log.length - 1], el = feed.lastElementChild;
          if (el && b.l.length !== fed.l) { el.insertAdjacentHTML('beforeend', b.l.slice(fed.l).map(lineHtml).join('')); fed.l = b.l.length; }
        } else {
          const last = feed.lastElementChild, pb = log[fed.n - 1];
          if (last && pb && pb.l.length !== fed.l) last.insertAdjacentHTML('beforeend', pb.l.slice(fed.l).map(lineHtml).join(''));
          feed.insertAdjacentHTML('beforeend', log.slice(fed.n).map(b => blockHtml(b, 1)).join(''));
          while (feed.children.length > log.length) feed.firstElementChild.remove();
          fed = { n: log.length, l: log[log.length - 1].l.length };
        }
      }
      requestAnimationFrame(() => { feed.scrollTop = feed.scrollHeight; });
    }
    function renderNav() {
      const m = me(), occ = m.sch || (m.age < 18 && !m.job) ? ['school', L('School')] : ['job', L('Job')];
      const b = (k, ic, lb) => `<button type="button" class="nb" data-a="tab:${k}" aria-pressed="${tab === k && (!narrow() || side.classList.contains('open'))}">${olI2(ic)}<span>${lb}</span></button>`;
      nav.innerHTML = b('occ', occ[0], occ[1]) + b('assets', 'home', L('Assets')) + `<button type="button" class="nb age" data-a="age" ${!m.al || pop ? 'disabled' : ''} aria-label="${L('Age up')}"><i>${olI2('plus')}</i><span>${L('Age')}</span></button>` + b('people', 'people', L('People')) + b('acts', 'acts', L('Activities'));
      const nh = nav.offsetHeight;
      if (nh) root.style.setProperty('--nh', nh + 'px');
    }
    function renderAll() {
      if (!s) return;
      renderHead(); renderStats(); renderFeed(true); renderNav(); renderSide();
    }
    function refresh() {
      if (!s) return;
      renderHead(); renderStats(); renderFeed(); renderNav(); renderSide();
      persist();
    }

    const row = (o) => `<button type="button" class="row${o.done ? ' done' : ''}" data-a="${o.a}"${o.dis ? ' disabled' : ''}>${o.av ? `<span class="ra">${o.av}</span>` : `<span class="ri">${olI2(o.ic || 'star')}</span>`}<span class="rt"><b>${olEsc(o.t)}</b>${o.s ? `<small>${o.s}</small>` : ''}${o.bond !== undefined ? `<span class="bond"><i style="width:${Math.round(o.bond)}%;background:${barC(o.bond)}"></i></span>` : ''}</span>${o.v !== undefined ? `<span class="rv ${o.vc || ''}">${o.v}</span>` : ''}</button>`;
    const head = (t, back) => `<div class="ph">${back ? `<button type="button" class="ib" data-a="${back}" aria-label="${L('Back')}">${olI2('back')}</button>` : ''}<h3>${olEsc(t)}</h3><button type="button" class="ib sx" data-a="close" aria-label="${L('Close')}">${olI2('x')}</button></div>`;
    const doneTag = () => L('Done this year');

    function renderSide() {
      if (!s) return;
      let h = '';
      if (sub === 'me') h = vMe();
      else if (sub === 'tree') h = vTree();
      else if (sub === 'awards') h = vAwards();
      else if (sel) h = vPerson();
      else if (tab === 'occ') h = vOcc();
      else if (tab === 'assets') h = vAssets();
      else if (tab === 'people') h = vPeople();
      else h = vActs();
      const y = side.scrollTop, key = (sub || '') + (sel ? sel.i : '') + tab;
      side.innerHTML = h;
      if (side.dataset.k === key) side.scrollTop = y; else side.scrollTop = 0;
      side.dataset.k = key;
    }

    function vOcc() {
      const m = me(), sc = m.sch, j = m.job;
      let h = head(sc || (m.age < 18 && !j) ? L('School') : L('Job')) + '<div class="pc">';
      if (!m.al) return h + '</div>';
      if (sc) {
        const nm = sc.k === 'uni' ? L('University') + ' · ' + X(OL_MAJM[sc.maj].slice(1, 3)) : sc.k === 'grad' ? X(OL_GRADM[sc.maj].slice(1, 3)) : stage();
        h += `<div class="card"><h4>${olEsc(nm)}</h4><p>${L('Year {a} of {b}', { a: Math.min(sc.y + 1, sc.n), b: sc.n })}${sc.gr ? ' · ' + L('Last report: {g}', { g: olGrade(sc.gr, olFr() ? 1 : 0) }) : ''}</p>${sc.club ? `<p>${L('Club: {c}', { c: olEsc(X(OL_CLUBS[sc.ci | 0][1])) })}</p>` : ''}<div class="pbar"><i style="width:${Math.round(sc.perf)}%"></i></div><p>${L('Performance {n}%', { n: Math.round(sc.perf) })}</p></div>`;
        h += `<div class="sec">${L('Actions')}</div>`;
        const dn = k => m.dn.includes(k);
        h += row({ a: 'sch:study', ic: 'book', t: L('Study harder'), s: L('Better grades, a little less fun'), done: dn('study'), dis: dn('study'), v: dn('study') ? '✓' : undefined });
        if (sc.k !== 'pri' || m.age >= 7) h += row({ a: 'sch:teach', ic: 'chat', t: sc.k === 'uni' || sc.k === 'grad' ? L('Visit your professor') : L('Talk to your teacher'), done: dn('teach'), dis: dn('teach'), v: dn('teach') ? '✓' : undefined });
        if (sc.k !== 'pri' && sc.k !== 'grad') h += row({ a: 'sch:club', ic: 'star', t: sc.club ? L('Change or leave your club') : L('Join a club'), s: L('Grow a skill every year') });
        if ((sc.k === 'high' && m.age >= 16) || sc.k === 'uni' || sc.k === 'grad') h += row({ a: 'sch:quit', ic: 'x', t: sc.k === 'high' ? L('Leave school') : L('Drop out') });
      }
      if (j) {
        h += `<div class="sec">${L('Current job')}</div><div class="card"><h4>${olEsc(olJobT(j.id, j.lvl, m.g))}</h4><p>${L('{m} a year', { m: olMoney(j.sal) })} · ${L('{n} years here', { n: j.yrs })}</p><div class="pbar"><i style="width:${Math.round(j.perf)}%"></i></div><p>${L('Performance {n}%', { n: Math.round(j.perf) })}</p></div>`;
        const dn = k => m.dn.includes(k);
        h += row({ a: 'job:hard', ic: 'up', t: L('Work harder'), s: L('Raise your performance'), done: dn('hard'), dis: dn('hard') || dn('easy'), v: dn('hard') ? '✓' : undefined });
        h += row({ a: 'job:easy', ic: 'lotus', t: L('Take it easy'), s: L('More happiness, less performance'), done: dn('easy'), dis: dn('hard') || dn('easy'), v: dn('easy') ? '✓' : undefined });
        if (j.t !== 'p') h += row({ a: 'job:raise', ic: 'coin', t: L('Ask for a raise'), done: dn('raise'), dis: dn('raise'), v: dn('raise') ? '✓' : undefined });
        if (j.t !== 'p' && olCanPromote(s)) h += row({ a: 'job:promo', ic: 'award', t: L('Ask for a promotion'), done: dn('promo'), dis: dn('promo'), v: dn('promo') ? '✓' : undefined });
        h += row({ a: 'job:quit', ic: 'x', t: L('Quit job') });
        if (m.age >= 60 && j.t !== 'p') h += row({ a: 'job:retire', ic: 'leaf', t: L('Retire'), s: L('Stop working and receive a pension') });
      }
      if (!sc && m.age >= 18) {
        const ed = [];
        if (!m.edu.hs) ed.push(row({ a: 'edu:adult', ic: 'school', t: L('Finish high school'), s: L('A one-year adult education course') }));
        else if (!m.edu.deg) ed.push(row({ a: 'edu:uni', ic: 'school', t: L('Apply to university'), s: L('Your exam score: {n}%', { n: m.edu.ex }) }));
        else if (!m.edu.grad) ed.push(row({ a: 'edu:grad', ic: 'school', t: L('Apply to graduate school') }));
        if (ed.length) h += `<div class="sec">${L('Education')}</div>` + ed.join('');
      }
      if (m.age >= 13) {
        h += `<div class="sec">${m.age < 18 || sc ? L('Part-time jobs') : L('Job listings')}</div>`;
        olListings(s).forEach(id => {
          const d = OL_JOBM[id], why = olReqOk(s, d), mine = j && j.id === id;
          h += row({ a: 'apply:' + id, ic: d[1] === 't' ? 'star' : d[1] === 'p' ? 'coin' : 'job', t: olJobT(id, 0, m.g), s: mine ? L('Your current job') : why.length ? olEsc(why[0]) : d[1] === 'p' ? L('Part-time') : d[1] === 't' ? L('Talent career') : L('Full-time'), v: olMoney(d[6][0][2]), vc: why.length ? 'no' : 'ok', dis: mine || why.length > 0 });
        });
        h += `<p class="hint">${L('New listings appear every year.')}</p>`;
      } else if (!sc) h += `<p class="hint">${L('You are too young for school or work. Enjoy being little!')}</p>`;
      if (m.ret) h += `<p class="hint">${L('You are retired. Your pension is {m} a year.', { m: olMoney(m.pen) })}</p>`;
      return h + '</div>';
    }

    function shopList() {
      const m = me();
      if (!s.shop || s.shop.y !== m.age) {
        const pk = (a, n) => { const c = a.slice(), o = []; while (c.length && o.length < n) o.push(c.splice(Math.floor(olR() * c.length), 1)[0]); return o; };
        s.shop = { y: m.age, h: pk(OL_HOUSE, 4).map(d => [d[0], Math.round(d[2] * (0.85 + olR() * 0.3) * Math.pow(1.02, Math.max(0, m.yr - m.born - m.age)) / 500) * 500]).sort((a, b) => a[1] - b[1]), c: pk(OL_CAR, 5).map(d => [d[0], Math.round(d[2] * (0.9 + olR() * 0.2) / 50) * 50]).sort((a, b) => a[1] - b[1]) };
      }
      return s.shop;
    }
    function vAssets() {
      const m = me();
      let h = head(L('Assets')) + '<div class="pc">';
      h += `<div class="card"><div class="kv"><span>${L('Bank balance')}</span><b style="color:${m.m < 0 ? 'var(--bad)' : 'var(--good)'}">${olMoney(m.m)}</b><span>${L('Last year')}</span><b>${(s.net > 0 ? '+' : '') + olMoney(s.net)}</b>${m.debt > 0 ? `<span>${L('Student loan')}</span><b>${olMoney(-m.debt)}</b>` : ''}${m.job ? `<span>${L('Salary')}</span><b>${olMoney(m.job.sal)}</b>` : ''}${m.pen ? `<span>${L('Pension')}</span><b>${olMoney(m.pen)}</b>` : ''}<span>${L('Net worth')}</span><b>${olMoney(olWorth(s))}</b></div></div>`;
      h += `<div class="sec">${L('What you own')}</div>`;
      if (!m.as.length) h += `<p class="hint">${L('You don’t own anything yet.')}</p>`;
      m.as.forEach((a, i) => {
        const d = a.t === 'house' ? OL_HOUSEM[a.id] : OL_CARM[a.id];
        h += row({ a: 'sell:' + i, ic: d[3], t: X(d[1]), s: (a.lo ? L('Mortgage left: {m}', { m: olMoney(a.lo) }) + ' · ' : '') + L('Tap to sell'), v: olMoney(a.v) });
      });
      if (!m.al) return h + '</div>';
      if (m.age < 18) { h += `<p class="hint">${L('You can buy homes and cars once you are 18. Until then, save your pocket money!')}</p>`; if (m.age >= 10) { const bk = OL_CARM.bike; h += row({ a: 'buy:c:bike:' + bk[2], ic: 'bike', t: X(bk[1]), v: olMoney(bk[2]), vc: m.m >= bk[2] ? 'ok' : 'no', dis: m.m < bk[2] || m.as.some(a => a.id === 'bike') }); } return h + '</div>'; }
      const sh = shopList();
      h += `<div class="sec">${L('Homes for sale')}</div>`;
      const inc = (m.job ? m.job.sal : 0) + (olLove(s) && olLove(s).st === 'mar' ? olLove(s).inc || 0 : 0);
      sh.h.forEach(([id, pr]) => {
        const d = OL_HOUSEM[id], cash = m.m >= pr, mort = !cash && m.m >= pr * 0.2 && inc * 5 >= pr * 0.8 && !olHouse(s);
        h += row({ a: 'buy:h:' + id + ':' + pr, ic: d[3], t: X(d[1]), s: cash ? L('Buy outright') : mort ? L('Mortgage: {m} deposit', { m: olMoney(pr * 0.2) }) : L('Not enough money or income'), v: olMoney(pr), vc: cash || mort ? 'ok' : 'no', dis: !(cash || mort) });
      });
      h += `<div class="sec">${L('Vehicles for sale')}</div>`;
      sh.c.forEach(([id, pr]) => {
        const d = OL_CARM[id], lic = !d[4] || m.lic;
        h += row({ a: 'buy:c:' + id + ':' + pr, ic: d[3], t: X(d[1]), s: lic ? '' : L('Needs a driving licence'), v: olMoney(pr), vc: m.m >= pr && lic ? 'ok' : 'no', dis: m.m < pr || !lic });
      });
      return h + '</div>';
    }

    const relName = p => { const r = olRel(p, me()); return olCap(olFr() ? r[1] : r[0]); };
    function vPeople() {
      const m = me();
      let h = head(L('People')) + '<div class="pc">';
      const grp = [[L('Family'), p => ['mom', 'dad', 'sib', 'gp'].includes(p.r)], [L('Partner'), p => p.r === 'love'], [L('Children'), p => p.r === 'kid'], [L('Grandchildren'), p => p.r === 'gkid'], [L('Friends'), p => p.r === 'friend'], [L('Pets'), p => p.r === 'pet']];
      grp.forEach(([t, f]) => {
        const list = s.pp.filter(p => p.al && f(p));
        if (!list.length) return;
        h += `<div class="sec">${t}</div>`;
        list.forEach(p => { h += row({ a: 'pp:' + p.i, av: olAv(p), t: p.n + (p.r === 'pet' || p.r === 'friend' ? '' : ''), s: relName(p) + ' · ' + L('Age {n}', { n: p.age }) + (p.job && p.age >= 18 ? ' · ' + olEsc(X(p.job)) : ''), bond: p.b }); });
      });
      if (m.al) {
        h += `<div class="sec">${L('Meet people')}</div>`;
        h += row({ a: 'meet:friend', ic: 'smile', t: L('Make a new friend'), dis: m.age < 4 || m.dn.includes('friend'), done: m.dn.includes('friend'), v: m.dn.includes('friend') ? '✓' : undefined, s: m.age < 4 ? L('From age 4') : '' });
        if (!olLove(s)) h += row({ a: 'meet:love', ic: 'heart', t: L('Find love'), dis: m.age < 16 || m.dn.includes('love'), done: m.dn.includes('love'), v: m.dn.includes('love') ? '✓' : undefined, s: m.age < 16 ? L('From age 16') : '' });
        const love = olLove(s);
        if (m.age >= 25 && m.m >= 4000 && !m.dn.includes('adopt')) h += row({ a: 'meet:adopt', ic: 'baby', t: L('Adopt a child'), s: L('Costs {m}', { m: olMoney(4000) }) });
      }
      const gone = s.pp.filter(p => !p.al && !p.gone && p.r !== 'pet').length;
      if (gone) h += `<p class="hint">${L('{n} loved ones have passed away. See the family tree in your profile.', { n: gone })}</p>`;
      return h + '</div>';
    }
    function pActs(p) {
      const m = me(), r = p.r, a = [];
      const add = (k, ic, t, sub2) => a.push([k, ic, t, sub2]);
      if (r === 'pet') { add('play', 'paw', L('Play together')); if (p.sp === 'dog') add('walk', 'walk', L('Go for a walk')); add('treat', 'gift', L('Give a treat')); add('vet', 'doc', L('Take to the vet'), olMoney(80)); return a; }
      add('time', 'smile', L('Spend time together'));
      add('talk', 'chat', L('Have a conversation'));
      if (r !== 'gkid' || p.age >= 4) add('compl', 'star', L('Give a compliment'));
      add('gift', 'gift', L('Give a gift'), olMoney(m.age < 18 ? 10 : 80));
      if ((r === 'mom' || r === 'dad' || r === 'gp') && m.age >= 6) add('money', 'coin', L('Ask for money'));
      if (r === 'kid' && p.age < 18 && m.age >= 18) add('pocket', 'coin', L('Give pocket money'), olMoney(100));
      if (r === 'love') {
        if (m.age >= 16) add('date', 'heart', L('Go on a date'), olMoney(m.age < 18 ? 15 : 60));
        if (p.st === 'date' && m.age >= 18 && p.age >= 18) add('propose', 'ring', L('Propose'));
        if (p.st === 'eng') add('wed', 'ring', L('Plan the wedding'));
        if (p.st === 'mar' && m.age >= 18 && m.age <= 50 && p.age <= 50) add('baby', 'baby', L('Try for a baby'));
        add('split', 'broken', p.st === 'mar' ? L('Ask for a divorce') : L('Break up'));
      }
      if (r === 'friend') add('end', 'broken', L('End the friendship'));
      return a;
    }
    function vPerson() {
      const p = sel, m = me();
      if (!p.al) { sel = null; return vPeople(); }
      let h = head(p.n, 'back') + '<div class="pc">';
      h += `<div class="pf"><span class="ra">${olAv(p)}</span><div><h4>${olEsc(p.n + (p.ln && p.r !== 'pet' ? ' ' + p.ln : ''))}</h4><p>${relName(p)} · ${L('Age {n}', { n: p.age })}</p>${p.job && p.age >= 18 ? `<p>${olEsc(X(p.job))}</p>` : ''}</div></div>`;
      h += `<div class="kv" style="margin:8px 0 4px"><span>${L('Relationship')}</span><b>${Math.round(p.b)}%</b></div><div class="pbar"><i style="width:${Math.round(p.b)}%;background:${barC(p.b)}"></i></div>`;
      if (m.al) {
        h += `<div class="sec">${L('Interactions')}</div>`;
        pActs(p).forEach(([k, ic, t, sb]) => { const d = p.d.includes(k); h += row({ a: 'pa:' + k, ic, t, s: sb, done: d, dis: d, v: d ? '✓' : undefined }); });
        h += `<p class="hint">${L('Each interaction can be done once a year.')}</p>`;
      }
      return h + '</div>';
    }

    function vActs() {
      const m = me();
      let h = head(L('Activities')) + '<div class="pc">';
      if (!m.al) return h + '</div>';
      const list = OL_ACT.filter(a => m.age >= a[1] && m.age <= a[2]);
      if (!list.length) h += `<p class="hint">${L('Babies mostly sleep, eat and smile. Age up to do more!')}</p>`;
      list.forEach(a => {
        const d = m.dn.includes(a[0]), cost = m.age < 18 ? 0 : a[3];
        let sb = cost ? L('Costs {m}', { m: olMoney(cost) }) : '';
        if (a[0] === 'doctor') sb = m.ill.length ? m.ill.map(x => X(OL_ILLM[x[0]][1])).join(', ') : L('No health problems');
        if (a[0] === 'drive' && m.lic) return;
        if (a[0] === 'shelter' && !m.mv) return;
        h += row({ a: 'act:' + a[0], ic: a[4], t: X(a[5]), s: sb, done: d, dis: d || (cost > 0 && m.m < cost && a[0] !== 'doctor'), v: d ? '✓' : undefined });
      });
      h += `<div class="sec">${L('Your life')}</div>`;
      h += row({ a: 'sub:me', ic: 'user', t: L('Profile and skills') }) + row({ a: 'sub:tree', ic: 'tree', t: L('Family tree') }) + row({ a: 'sub:awards', ic: 'award', t: L('Life awards'), v: Object.keys(G.aw).length + ' / ' + OL_AW.length });
      return h + '</div>';
    }
    function vMe() {
      const m = me(), ci = OL_CITY[m.city];
      let h = head(L('Profile'), 'back') + '<div class="pc">';
      h += `<div class="pf"><span class="ra">${olMeAv(m)}</span><div><h4>${olEsc(m.fn + ' ' + m.ln)}</h4><p>${L('Born in {y} in {c}', { y: m.born, c: olFr() ? ci[1] : ci[0] })}</p><p>${L('Generation {n}', { n: s.gen })}</p></div></div>`;
      const edu = m.edu.grad ? X(OL_GRADM[m.edu.grad].slice(1, 3)) : m.edu.deg ? L('Degree in {x}', { x: X(OL_MAJM[m.edu.deg].slice(1, 3)) }) : m.edu.hs ? L('High school diploma') : L('None yet');
      h += `<div class="kv" style="margin-top:10px"><span>${L('Education')}</span><b>${olEsc(edu)}</b><span>${L('Occupation')}</span><b>${olEsc(stage())}</b><span>${L('Net worth')}</span><b>${olMoney(olWorth(s))}</b><span>${L('Driving licence')}</span><b>${m.lic ? L('Yes') : L('No')}</b></div>`;
      h += `<div class="sec">${L('Hidden traits')}</div>`;
      const sk = (t, v) => `<div class="sk"><span>${t}</span><div class="pbar"><i style="width:${Math.round(v)}%;background:${barC(v)}"></i></div><em>${Math.round(v)}%</em></div>`;
      h += sk(L('Kindness'), m.k) + sk(L('Fitness'), m.a) + sk(L('Fame'), m.f);
      h += `<div class="sec">${L('Skills')}</div>`;
      const has = OL_SK.filter(k => m.sk[k] >= 1);
      h += has.length ? has.map(k => sk(L(OL_SKN[k]), m.sk[k])).join('') : `<p class="hint">${L('Take lessons and classes in Activities to build skills.')}</p>`;
      if (m.ill.length) h += `<div class="sec">${L('Health conditions')}</div><p class="hint">${m.ill.map(x => olEsc(olCap(X(OL_ILLM[x[0]][1])))).join(' · ')}</p>`;
      h += `<div class="sec">${L('Your life')}</div>` + row({ a: 'sub:tree', ic: 'tree', t: L('Family tree') }) + row({ a: 'sub:awards', ic: 'award', t: L('Life awards'), v: Object.keys(G.aw).length + ' / ' + OL_AW.length }) + row({ a: 'restart', ic: 'dice', t: L('Start a new life') });
      return h + '</div>';
    }
    function tnode(p, lab, isMe) { return `<div class="tn${isMe ? ' me' : ''}"><span class="ra">${p.r === 'pet' ? olPetSvg(p) : olFace(p.lk, p.g, p.age, 60, p.al === 0 ? 0 : 1)}</span><b>${olEsc(p.n)}</b><span>${lab}</span></div>`; }
    function vTree() {
      const m = me();
      let h = head(L('Family tree'), 'back') + '<div class="pc">';
      const line = G.tree.filter(t => t.ln === s.line);
      if (line.length) {
        h += `<div class="sec">${L('Family line')}</div>`;
        line.forEach(t => { h += `<div class="gl"><span class="ra">${olFace(t.lk, t.g, t.a, 60, 0)}</span><div><b>${olEsc(t.n)}</b><span>${L('Generation {n}', { n: t.gen })} · ${t.b}–${t.d} · ${t.j ? olEsc(X(t.j)) : ''}</span></div>${olBadge(t.aw, 34)}</div>`; });
      }
      const A = s.pp, lab = p => (p.al ? L('Age {n}', { n: p.age }) : L('Died at {n}', { n: p.dz || p.age }));
      const gps = A.filter(p => p.r === 'gp'), par = A.filter(p => p.r === 'mom' || p.r === 'dad'), sib = A.filter(p => p.r === 'sib' && !p.gone), love = A.filter(p => p.r === 'love' && !p.gone), kids = A.filter(p => p.r === 'kid'), gk = A.filter(p => p.r === 'gkid');
      h += `<div class="sec">${L('Your family')}</div><div class="tr">`;
      if (gps.length) h += `<div class="tlab">${L('Grandparents')}</div><div class="tg">${gps.map(p => tnode(p, lab(p))).join('')}</div>`;
      if (par.length) h += `<div class="tlab">${L('Parents')}</div><div class="tg">${par.map(p => tnode(p, lab(p))).join('')}</div>`;
      h += `<div class="tg">${tnode({ n: m.fn, g: m.g, age: m.age, lk: m.lk, al: m.al }, L('You'), 1)}${love.map(p => tnode(p, relName(p))).join('')}${sib.map(p => tnode(p, relName(p))).join('')}</div>`;
      if (kids.length) h += `<div class="tlab">${L('Children')}</div><div class="tg">${kids.map(p => tnode(p, lab(p))).join('')}</div>`;
      if (gk.length) h += `<div class="tlab">${L('Grandchildren')}</div><div class="tg">${gk.map(p => tnode(p, lab(p))).join('')}</div>`;
      return h + '</div></div>';
    }
    function vAwards() {
      let h = head(L('Life awards'), 'back') + '<div class="pc"><p class="hint">' + L('Each life earns awards for how it was lived. Collect them all across your lives.') + '</p><div class="aw">';
      OL_AW.forEach(a => { const n = G.aw[a[0]] || 0; h += `<div class="${n ? '' : 'lk'}" title="${olEsc(X(a[2]))}">${olBadge(a[0], 46)}<span>${olEsc(X(a[1]))}</span><small>${n ? '×' + n : olEsc(X(a[2]))}</small></div>`; });
      return h + `</div><p class="hint">${L('Lives lived: {n}', { n: G.lives })} · ${L('Oldest age: {n}', { n: G.best })}</p></div>`;
    }

    function chips(out) {
      const nm = { h: L('Happiness'), H: L('Health'), s: L('Smarts'), l: L('Looks') };
      const c = [];
      ['h', 'H', 's', 'l'].forEach(k => { const v = Math.round(out[k] || 0); if (v) c.push(`<span class="${v < 0 ? 'n' : ''}">${nm[k]} ${v > 0 ? '+' : ''}${v}</span>`); });
      if (out.m) c.push(`<span class="${out.m < 0 ? 'n' : ''}">${out.m > 0 ? '+' : ''}${olMoney(out.m)}</span>`);
      return c.length ? `<div class="chips">${c.join('')}</div>` : '';
    }
    function showCard(o) {
      pop = o;
      const ch = (o.ch || []).map((c, i) => `<button type="button" class="ch ${c.cls || ''}" data-pc="${i}"${c.dis ? ' disabled' : ''}>${c.kb !== false && i < 6 ? `<kbd>${i + 1}</kbd>` : ''}${olEsc(c.t)}${c.s ? `<small>${c.s}</small>` : ''}</button>`).join('');
      popEl.innerHTML = `<div class="pk" role="dialog" aria-modal="true">${o.av ? `<div class="pa">${o.av}</div>` : o.ic ? `<div class="pi">${olI2(o.ic)}</div>` : ''}${o.title ? `<h3>${olEsc(o.title)}</h3>` : ''}${o.text ? `<p class="pt">${o.text}</p>` : ''}${o.chips || ''}${o.html || ''}${ch}</div>`;
      popEl.hidden = false;
      renderNav();
      const f = popEl.querySelector('input[type=text]') || popEl.querySelector('.ch:not(:disabled)');
      if (f && f.tagName === 'INPUT') f.focus({ preventScroll: true });
    }
    function closeCard() { pop = null; popEl.hidden = true; popEl.innerHTML = ''; }
    function nextPop() {
      closeCard();
      if (tq.length) { const t = tq.shift(); showCard(t); return; }
      if (!s || !s.me.al) { refresh(); if (s && !s.me.al) showEnd(); return; }
      if (s.q.length) { const d = s.q[0]; const c = cardFor(d); if (c) { showCard(c); refresh(); return; } s.q.shift(); return nextPop(); }
      refresh();
    }
    const done = (q) => { if (q) s.q.shift(); nextPop(); };
    function result(txt, out, tone, icon, av) {
      const t = olEsc(olMoneyTxt(olFr() ? txt[1] : txt[0]));
      return { av, ic: av ? null : icon || (tone === 'b' ? 'broken' : 'star'), text: t, chips: chips(out || {}), ch: [{ t: L('Continue'), cls: 'go', kb: false, fn: () => done(0) }] };
    }

    function cardFor(d) {
      const m = me();
      if (d.k === 'ev') {
        const ev = OL_EVM[d.id], c = olCtxLoad(s, d.c);
        if (!ev || (ev[4] && !c.p)) return null;
        const p = c.p;
        return {
          av: p ? olAv(p) : null, ic: p ? null : OL_EVI[ev[0]] || 'star',
          text: olEsc(olMoneyTxt(olFr() ? olFill(ev[6][1], c, 1, s) : olFill(ev[6][0], c, 0, s))),
          ch: ev[7].map((x, i) => ({ t: olFr() ? olFill(x[0][1], c, 1, s) : olFill(x[0][0], c, 0, s), cls: i === 0 ? '' : '', fn: () => {
            s.q.shift();
            const r = olResolve(s, ev, i, c);
            sfx(r.good > 1 ? 'good' : r.good < -1 ? 'bad' : 'tap');
            tq.unshift(result(r.txt, r.out, r.good < -1 ? 'b' : 'g', null, c.p && c.p.al !== 0 ? olAv(c.p) : null));
            nextPop();
          } }))
        };
      }
      if (d.k === 'after') {
        return { ic: 'school', title: L('What will you do next?'), text: olEsc(L('You are {n}. Your final exam score was {e}%.', { n: m.age, e: m.edu.ex })), ch: [
          { t: L('Go to university'), s: L('Choose a subject to study'), fn: () => { s.q.shift(); uniPick(); } },
          { t: L('Look for a job'), s: L('Open the job listings'), cls: 'alt', fn: () => { s.q.shift(); m.mv = 1; olSay(s, ['I decided to start working.', 'J’ai décidé de commencer à travailler.'], 'm'); openTab('occ'); nextPop(); } },
          { t: L('Take a gap year'), s: L('Travel and decide later'), cls: 'alt', fn: () => { s.q.shift(); m.fl.gap = 1; olGain(s, 'h', 6); m.sk.lan = olC(m.sk.lan + 5); olSay(s, ['I took a gap year to travel and think about my future.', 'J’ai pris une année sabbatique pour voyager et réfléchir à mon avenir.'], 'g'); nextPop(); } }
        ].filter((x, i) => i !== 0 || m.edu.hs) };
      }
      if (d.k === 'fail') {
        return { ic: 'school', title: L('You failed your exams'), text: L('You can repeat your final year and try again, or leave school now.'), ch: [
          { t: L('Repeat the year'), fn: () => { s.q.shift(); olSchoolStart(s, 'high', 1, { sum: 60 }); olSay(s, ['I decided to repeat my final year of high school.', 'J’ai décidé de redoubler ma terminale.'], 'm'); nextPop(); } },
          { t: L('Leave school'), cls: 'alt', fn: () => { s.q.shift(); m.edu.left = 1; olSay(s, ['I left school without a diploma.', 'J’ai quitté l’école sans diplôme.'], 'b'); nextPop(); } }
        ] };
      }
      if (d.k === 'grad') {
        const opts = OL_GRAD.filter(g => (!g[4] || g[4].includes(m.edu.deg)) && m.st.s >= g[5] - 8);
        return { ic: 'school', title: d.m ? L('Graduate school') : L('You graduated!'), text: d.m ? L('Which programme will you apply to?') : L('What will you do now?'), ch: opts.slice(0, 4).map(g => ({ t: X(g.slice(1, 3)), s: L('{n} years', { n: g[3] }), fn: () => { s.q.shift(); gradApply(g); } })).concat([{ t: d.m ? L('Cancel') : L('Look for a job'), cls: 'alt', fn: () => { s.q.shift(); if (!d.m) openTab('occ'); nextPop(); } }]) };
      }
      if (d.k === 'work') return { ic: 'job', title: L('Time to work'), text: L('Your studies are finished. Open the job listings to start your career.'), ch: [{ t: L('Open the job listings'), cls: 'go', fn: () => { s.q.shift(); openTab('occ'); nextPop(); } }] };
      if (d.k === 'retire') return { ic: 'leaf', title: L('Retirement age'), text: L('You have reached retirement age. Will you retire?'), ch: [
        { t: L('Retire'), fn: () => { s.q.shift(); retire(); nextPop(); } },
        { t: L('Keep working'), cls: 'alt', fn: () => { s.q.shift(); nextPop(); } }
      ] };
      if (d.k === 'baby') {
        const love = olLove(s);
        const sug = olName(d.g);
        return { ic: 'baby', title: d.tw ? L('Twins!') : d.g === 'f' ? L('It’s a girl!') : L('It’s a boy!'), text: L('What will you name your baby?'), html: `<input type="text" maxlength="20" value="${olEsc(sug)}" aria-label="${L('Name')}">`, ch: [{ t: L('Choose this name'), cls: 'go', kb: false, fn: () => {
          const inp = popEl.querySelector('input');
          const nm = (inp && inp.value.trim().replace(/[<>]/g, '').slice(0, 20)) || sug;
          s.q.shift();
          const k = olPerson(s, 'kid', d.g, 0, { n: nm, ln: m.ln }); k.b = olI(80, 95); m.kids++;
          olSay(s, [`My ${d.g === 'f' ? 'daughter' : 'son'} ${nm} was born!`, `${d.g === 'f' ? 'Ma fille' : 'Mon fils'} ${nm} est né${d.g === 'f' ? 'e' : ''} !`], 'g');
          if (d.tw) { const g2 = olP(['m', 'f']), k2 = olPerson(s, 'kid', g2, 0, { ln: m.ln }); k2.b = olI(80, 95); m.kids++; olSay(s, [`${k2.n} arrived a few minutes later. Twins!`, `${k2.n} est arrivé${g2 === 'f' ? 'e' : ''} quelques minutes plus tard. Des jumeaux !`], 'g'); }
          olGain(s, 'h', 10); sfx('win');
          nextPop();
        } }] };
      }
      return null;
    }

    function uniPick() {
      const m = me();
      tq.unshift({ ic: 'school', title: L('Choose your subject'), text: L('Your chances depend on your exam score and skills.'), ch: OL_MAJ.map(mj => {
        const sc = mj[5] === 's' ? m.edu.ex : (m.edu.ex + (mj[5] === 'a' ? m.a : m.sk[mj[5]] || 0)) / 2 + 10;
        const odds = sc >= mj[3] + 8 ? L('Very likely') : sc >= mj[3] ? L('Likely') : sc >= mj[3] - 10 ? L('Possible') : L('Unlikely');
        return { t: X(mj.slice(1, 3)), s: odds + ' · ' + L('{n} years', { n: mj[4] }), kb: false, fn: () => {
          const ok = sc + olI(-6, 6) >= mj[3];
          if (!ok) { olSay(s, [`My application to study ${olLow(mj[1])} was rejected.`, `Ma candidature en ${olLow(mj[2])} a été refusée.`], 'b'); sfx('bad'); tq.unshift({ ic: 'broken', title: L('Application rejected'), text: L('You were not accepted. You can try another subject.'), ch: [{ t: L('Try another subject'), fn: () => { uniPick(); nextPop(); } }, { t: L('Not now'), cls: 'alt', fn: () => { m.mv = 1; nextPop(); } }] }); nextPop(); return; }
          fund(mj, 'uni');
        } };
      }) });
      nextPop();
    }
    function fund(item, kind) {
      const m = me();
      const par = s.pp.filter(p => p.al && (p.r === 'mom' || p.r === 'dad'));
      const parOk = par.length && s.pw >= 2 && par.some(p => p.b >= 40);
      const schol = m.edu.ex >= 90 || m.a >= 85 || (kind === 'grad' && m.st.s >= 92);
      const start = f => {
        if (kind === 'uni') { olSchoolStart(s, 'uni', item[4], { maj: item[0], fund: f }); olSay(s, [`I started university to study ${olLow(item[1])}.`, `Je suis entré${m.g === 'f' ? 'e' : ''} à l’université en ${olLow(item[2])}.`], 'm'); }
        else { olSchoolStart(s, 'grad', item[3], { maj: item[0], fund: f }); olSay(s, [`I started ${item[0] === 'msc' ? 'a master’s degree' : item[0] === 'phd' ? 'a doctorate' : olLow(item[1])}.`, `J’ai commencé ${item[0] === 'msc' ? 'un master' : item[0] === 'phd' ? 'un doctorat' : 'l’' + olLow(item[2])}.`], 'm'); }
        if (m.job && m.job.t === 'f') olQuitJob(s, 'quit');
        m.mv = 1;
        if (f === 'sch') olSay(s, ['I won a scholarship that pays for my studies!', 'J’ai obtenu une bourse qui paie mes études !'], 'g');
        if (f === 'par') olSay(s, ['My parents are paying for my studies.', 'Mes parents paient mes études.'], 'g');
        if (f === 'loan') olSay(s, ['I took out a student loan to pay for my studies.', 'J’ai pris un prêt étudiant pour payer mes études.'], '');
        sfx('good');
        s.lst = null;
        refresh();
        nextPop();
      };
      if (schol) { start('sch'); return; }
      const cost = 9000;
      tq.unshift({ ic: 'coin', title: L('You got in!'), text: L('Studies cost {m} a year. How will you pay?', { m: olMoney(cost) }), ch: [
        { t: L('Ask my parents'), dis: !par.length, s: parOk ? L('They can probably afford it') : L('Money is tight at home'), fn: () => { if (parOk || olR() < 0.25 + s.pw * 0.15) start('par'); else { tq.unshift({ ic: 'broken', text: L('Your parents can’t afford to pay. Choose another way.'), ch: [{ t: L('OK'), fn: () => fund(item, kind) }] }); nextPop(); } } },
        { t: L('Take a student loan'), s: L('Paid back later from your salary'), fn: () => start('loan') },
        { t: L('Pay myself'), dis: m.m < cost, s: L('Bank balance: {m}', { m: olMoney(m.m) }), fn: () => start('self') }
      ] });
      nextPop();
    }
    function gradApply(g) {
      const m = me();
      const need = g[0] === 'mds' ? 80 : g[0] === 'lws' ? 72 : g[5];
      const sc = m.st.s * 0.6 + m.edu.gpa * 0.4 + olI(-6, 6);
      if (sc < need) { olSay(s, [`I was not accepted into ${olLow(g[1])}.`, `Je n’ai pas été accepté${m.g === 'f' ? 'e' : ''} en ${olLow(g[2])}.`], 'b'); sfx('bad'); tq.unshift({ ic: 'broken', title: L('Application rejected'), text: L('You can look for a job instead, and apply again another year.'), ch: [{ t: L('Open the job listings'), fn: () => { openTab('occ'); nextPop(); } }] }); nextPop(); return; }
      fund(g, 'grad');
    }

    function retire() {
      const m = me();
      if (!m.job) return;
      const j = m.job;
      m.pen = Math.max(9000, Math.round(j.sal * 0.45));
      olQuitJob(s, 'retire');
      m.ret = 1;
      olGain(s, 'h', 6);
      sfx('win');
    }
    function openTab(k) { tab = k; sel = null; sub = null; if (narrow()) side.classList.add('open'); renderSide(); renderNav(); }
    function closeSide() { side.classList.remove('open'); sel = null; sub = null; renderNav(); }

    function ageUp() {
      if (!s || pop || !me().al || performance.now() < ageLock) return;
      if (s.q.length || tq.length) { nextPop(); return; }
      ageLock = performance.now() + 220;
      if (narrow()) closeSide();
      sel = null; sub = null;
      olAgeUp(s);
      const fx = s.fx; s.fx = null;
      if (!me().al) { recordDeath(); sfx('lose'); refresh(); snap(); api.timeout(showEnd, 900); return; }
      sfx(fx || 'pop');
      refresh();
      if (s.q.length) api.timeout(() => { if (!pop && s && s.q.length) nextPop(); }, 380);
    }

    function act(id) {
      const m = me(), a = OL_ACT.find(x => x[0] === id);
      if (!a || m.dn.includes(id) || m.age < a[1] || m.age > a[2] || !m.al) return;
      const cost = m.age < 18 ? 0 : a[3];
      if (cost > 0 && m.m < cost && id !== 'doctor') { api.toast(L('Not enough money')); return; }
      const out = {}, c = { topic: olP(OL_TOPIC), sport: m.spt >= 0 ? OL_SPORT[m.spt] : olP(OL_SPORT), inst: m.inst >= 0 ? OL_INST[m.inst] : OL_INST[0] };
      const say = (pair, eff, tone) => { if (eff) olApply(s, eff, c, out); const t = olFP(pair, c, s); olSay(s, t, tone === undefined ? ((out.h || 0) + (out.H || 0) + (out.s || 0) + (out.l || 0) >= 0 ? 'g' : 'b') : tone); return t; };
      const fin = (t, tone) => { m.dn.push(id); if (cost && id !== 'doctor') { m.m -= cost; out.m = (out.m || 0) - cost; } sfx(tone === 'b' ? 'bad' : 'good'); tq.unshift(result(t, out, tone, a[4])); nextPop(); };
      const r = (x, y) => olI(x, y);
      switch (id) {
        case 'play': return fin(say(olP([['I played outside until it got dark.', 'J’ai joué dehors jusqu’à la tombée de la nuit.'], ['I built a den in the garden with sticks and blankets.', 'J’ai construit une cabane dans le jardin avec des bâtons et des couvertures.'], ['I chased butterflies in the park.', 'J’ai couru après les papillons au parc.']]), `h+${r(3, 6)} H+${r(1, 2)} a+2`));
        case 'read': m.cnt.read = (m.cnt.read || 0) + 1; return fin(say(['I read a book about {topic}.', 'J’ai lu un livre sur {topic}.'], `s+${r(2, 4)} h+1 xwri+1`));
        case 'games': return fin(say(olP([['I played video games all afternoon.', 'J’ai joué aux jeux vidéo tout l’après-midi.'], ['I finally beat a level I had been stuck on for weeks.', 'J’ai enfin réussi un niveau sur lequel je bloquais depuis des semaines.']]), `h+${r(3, 6)} s+${r(0, 1)}`));
        case 'library': m.cnt.lib = (m.cnt.lib || 0) + 1; return fin(say(['I spent the afternoon studying at the library.', 'J’ai passé l’après-midi à étudier à la bibliothèque.'], `s+${r(3, 6)} p+3`));
        case 'run': if (olR() < 0.05) { olAddIll(s, 'ankle'); return fin(say(['I went for a run and twisted my ankle.', 'Je suis allé' + (m.g === 'f' ? 'e' : '') + ' courir et je me suis tordu la cheville.'], 'h-2', 'b'), 'b'); } return fin(say(['I went for a run around the park.', 'Je suis allé' + (m.g === 'f' ? 'e' : '') + ' courir autour du parc.'], `H+${r(2, 4)} a+${r(2, 4)} h+1`));
        case 'gym': return fin(say(['I worked out at the gym.', 'Je me suis entraîné' + (m.g === 'f' ? 'e' : '') + ' à la salle de sport.'], `H+${r(3, 5)} l+${r(1, 2)} a+${r(3, 5)}`));
        case 'meditate': return fin(say(['I meditated for twenty minutes every morning.', 'J’ai médité vingt minutes chaque matin.'], `h+${r(3, 6)} H+1`));
        case 'doctor': {
          if (!m.ill.length) return fin(say(['The doctor said I am in good health.', 'Le médecin a dit que j’étais en bonne santé.'], 'H+1'), 'g');
          const fee = m.age < 18 ? 0 : 60 * m.ill.length;
          m.m -= fee; out.m = -fee;
          const lines = [];
          m.ill = m.ill.filter(x => {
            const d = OL_ILLM[x[0]];
            if (d[9]) { x[2] = 1; lines.push([`The doctor helped me manage my ${d[1][0].replace(/^(a |an |the )/, '')}.`, `Le médecin m’a aidé${m.g === 'f' ? 'e' : ''} à soigner ${d[1][1]}.`]); return true; }
            if (olR() < d[8]) { lines.push([`The doctor cured my ${d[1][0].replace(/^(a |an |the )/, '')}.`, `Le médecin m’a guéri${m.g === 'f' ? 'e' : ''} : fini, ${d[1][1]}.`]); olGain(s, 'H', 4); out.H = (out.H || 0) + 4; return false; }
            lines.push([`The treatment for ${d[1][0]} did not work yet.`, `Le traitement contre ${d[1][1]} n’a pas encore marché.`]);
            return true;
          });
          lines.forEach(t => olSay(s, t, 'g'));
          return fin([lines.map(x => x[0]).join(' '), lines.map(x => x[1]).join(' ')], 'g');
        }
        case 'music': {
          if (m.inst < 0) { tq.unshift({ ic: 'note', title: L('Choose an instrument'), ch: OL_INST.map((x, i) => ({ t: L(olCap(x[0])), kb: false, fn: () => { m.inst = i; act('music'); } })) }); return nextPop(); }
          return fin(say(['I practised {inst} at my music lessons.', 'J’ai pratiqué {inst} en cours de musique.'].map((x, i) => x.replace('{inst}', i ? OL_INST[m.inst][1] : 'the ' + OL_INST[m.inst][0]).replace('the singing', 'singing')), `xmus+${r(4, 8)} h+2`));
        }
        case 'art': return fin(say(olP([['I painted a portrait in my art class.', 'J’ai peint un portrait en cours de dessin.'], ['I learned to draw people in perspective.', 'J’ai appris à dessiner en perspective.']]), `xart+${r(4, 8)} h+2`));
        case 'code': return fin(say(olP([['I built a small website at coding club.', 'J’ai créé un petit site web au club de programmation.'], ['I programmed a robot to follow a line.', 'J’ai programmé un robot qui suit une ligne.']]), `xcod+${r(4, 8)} s+2`));
        case 'lang': return fin(say(['I spent the year learning a new language.', 'J’ai passé l’année à apprendre une nouvelle langue.'], `xlan+${r(4, 8)} s+1`));
        case 'cook': return fin(say(olP([['I learned to make fresh pasta.', 'J’ai appris à faire des pâtes fraîches.'], ['I baked a lemon tart from scratch.', 'J’ai préparé une tarte au citron maison.']]), `xcoo+${r(4, 8)} h+2`));
        case 'drama': return fin(say(['I rehearsed a play in drama class.', 'J’ai répété une pièce en cours de théâtre.'], `xact+${r(4, 8)} h+2 l+1`));
        case 'write': return fin(say(['I wrote a short story about {topic}.', 'J’ai écrit une nouvelle sur {topic}.'], `xwri+${r(3, 7)} h+1`));
        case 'sport': {
          if (m.spt < 0) { tq.unshift({ ic: 'ball', title: L('Choose a sport'), ch: OL_SPORT.slice(0, 8).map((x, i) => ({ t: olCap(X(x)), kb: false, fn: () => { m.spt = i; act('sport'); } })) }); return nextPop(); }
          return fin(say(['I trained hard at my {sport} club.', 'Je me suis bien entraîné' + (m.g === 'f' ? 'e' : '') + ' au club de {sport}.'], `a+${r(3, 6)} H+${r(2, 3)} h+2`));
        }
        case 'volunteer': m.cnt.vol = (m.cnt.vol || 0) + 1; return fin(say(olP([['I volunteered at a food bank.', 'J’ai été bénévole à la banque alimentaire.'], ['I volunteered to clean up the beach.', 'J’ai participé au nettoyage de la plage.'], ['I read stories to children at the hospital.', 'J’ai lu des histoires aux enfants à l’hôpital.']]), `k+${r(3, 6)} h+3`));
        case 'hair': m.lk.hs = (m.lk.hs + 1 + olI(0, 2)) % 4; if (m.lk.hc >= 6 && olR() < 0.5) m.lk.hc = olI(0, 5); return fin(say(['I got a new haircut. I love it.', 'J’ai changé de coiffure. J’adore.'], `l+${r(1, 3)} h+2`));
        case 'holiday': {
          tq.unshift({ ic: 'plane', title: L('Where will you go?'), ch: OL_TRIP.map(tp => ({ t: olCap(X(tp[0])), s: olMoney(tp[1]), dis: m.m < tp[1], kb: false, fn: () => {
            m.cnt.hol = (m.cnt.hol || 0) + 1; m.m -= tp[1]; out.m = -tp[1];
            const t = say([`I went on ${tp[0][0]}.`, `Je suis parti${m.g === 'f' ? 'e' : ''} en vacances : ${tp[0][1]}.`], `h+${r(6, 12)} xlan+2 H+1`);
            m.dn.push('holiday'); sfx('good'); tq.unshift(result(t, out, 'g', 'plane')); nextPop();
          } })).concat([{ t: L('Cancel'), cls: 'alt', kb: false, fn: () => nextPop() }]) });
          return nextPop();
        }
        case 'spa': return fin(say(['I spent a relaxing day at the spa.', 'J’ai passé une journée relaxante au spa.'], `h+${r(4, 7)} l+1 H+1`));
        case 'drive': {
          if (olR() * 100 < 45 + m.st.s / 2) { m.lic = 1; return fin(say(['I passed my driving test!', 'J’ai eu mon permis de conduire !'], 'h+8'), 'g'); }
          return fin(say(['I failed my driving test. I will try again next year.', 'J’ai raté mon permis. Je retenterai l’année prochaine.'], 'h-4', 'b'), 'b');
        }
        case 'talent': {
          const best = Math.max(m.sk.mus, m.sk.act, m.a * 0.6);
          if (olR() * 100 < best * 0.9 + m.st.l * 0.1) { const pr = m.age < 18 ? 200 : 1000; return fin(say(['I won the talent show! The crowd went wild.', 'J’ai gagné le concours de talents ! Le public était en délire.'], `h+8 f+5 m+${pr}`), 'g'); }
          return fin(say(['I performed at a talent show but didn’t win. I’ll practise more.', 'J’ai participé à un concours de talents sans gagner. Je vais m’entraîner davantage.'], 'h-2 f+1', 'b'), 'b');
        }
        case 'garden': return fin(say(['I spent the spring gardening. The tomatoes were delicious.', 'J’ai jardiné tout le printemps. Les tomates étaient délicieuses.'], 'H+2 h+3'));
        case 'shelter': {
          const opts = [0, 1, 2].map(() => { const d = olP(OL_PET); return { sp: d[0], n: olP(OL_PETN), age: olI(0, Math.min(6, d[2] - 1)), g: olP(['m', 'f']), lk: { hc: olI(0, 5) } }; });
          tq.unshift({ ic: 'paw', title: L('Adopt a pet'), text: L('These animals at the shelter need a home.'), ch: opts.map(o => ({ t: `${o.n} · ${olCap(X(OL_PETM[o.sp][1]))}`, s: L('Age {n}', { n: o.age }) + ' · ' + olMoney(OL_PETM[o.sp][4]), dis: m.m < OL_PETM[o.sp][4], kb: false, fn: () => {
            const p = olAddPet(s, o.sp, o.age); p.n = o.n; p.g = o.g; p.lk = Object.assign(p.lk, o.lk);
            m.m -= OL_PETM[o.sp][4];
            m.dn.push('shelter');
            const t = olFP(['I adopted {p}, a {pet}, from the shelter.', 'J’ai adopté {p} au refuge.'], { p }, s);
            olSay(s, t, 'g'); olGain(s, 'h', 6); sfx('good');
            tq.unshift(result(t, { h: 6, m: -OL_PETM[o.sp][4] }, 'g', null, olPetSvg(p))); nextPop();
          } })).concat([{ t: L('Cancel'), cls: 'alt', kb: false, fn: () => nextPop() }]) });
          return nextPop();
        }
      }
    }

    function schAct(k) {
      const m = me(), sc = m.sch;
      if (!sc) return;
      const out = {};
      if (k === 'study') { if (m.dn.includes('study')) return; m.dn.push('study'); sc.perf = olC(sc.perf + olI(10, 16)); out.s = olGain(s, 's', olI(1, 3)); out.h = olGain(s, 'h', -olI(1, 3)); const t = ['I studied harder than ever this year.', 'J’ai travaillé plus dur que jamais cette année.']; olSay(s, t, 'g'); sfx('good'); tq.unshift(result(t, out, 'g', 'book')); return nextPop(); }
      if (k === 'teach') {
        if (m.dn.includes('teach')) return; m.dn.push('teach');
        const good = olR() < 0.7, t = good ? ['My teacher gave me great advice on how to improve.', 'Mon professeur m’a donné de précieux conseils pour progresser.'] : ['My teacher was too busy to talk to me.', 'Mon professeur était trop occupé pour me parler.'];
        if (good) sc.perf = olC(sc.perf + olI(4, 8));
        olSay(s, t, good ? 'g' : ''); sfx(good ? 'good' : 'tap'); tq.unshift(result(t, out, good ? 'g' : '', 'chat')); return nextPop();
      }
      if (k === 'club') {
        tq.unshift({ ic: 'star', title: L('School clubs'), ch: OL_CLUBS.map((c, ci) => ({ t: X(c[1]), kb: false, fn: () => { sc.club = c[0]; sc.ci = ci; olSay(s, [`I joined the ${olLow(c[1][0])}.`, `J’ai rejoint : ${olLow(c[1][1])}.`], 'g'); sfx('good'); refresh(); nextPop(); } })).concat(sc.club ? [{ t: L('Leave my club'), cls: 'alt', kb: false, fn: () => { sc.club = null; refresh(); nextPop(); } }] : []).concat([{ t: L('Cancel'), cls: 'alt', kb: false, fn: () => nextPop() }]) });
        return nextPop();
      }
      if (k === 'quit') {
        tq.unshift({ ic: 'x', title: sc.k === 'high' ? L('Leave school?') : L('Drop out?'), text: L('Many jobs need a diploma. Are you sure?'), ch: [{ t: L('Yes, leave'), cls: 'warn', kb: false, fn: () => {
          if (sc.k === 'high') { m.edu.left = 1; olSay(s, ['I left high school without a diploma.', 'J’ai quitté le lycée sans diplôme.'], 'b'); }
          else olSay(s, ['I dropped out of my studies.', 'J’ai abandonné mes études.'], 'b');
          m.sch = null; s.lst = null; olGain(s, 'h', -2); sfx('bad'); refresh(); nextPop();
        } }, { t: L('Stay'), cls: 'alt', kb: false, fn: () => nextPop() }] });
        return nextPop();
      }
    }
    function jobAct(k) {
      const m = me(), j = m.job;
      if (!j) return;
      const out = {};
      if (k === 'hard' || k === 'easy') {
        if (m.dn.includes('hard') || m.dn.includes('easy')) return;
        m.dn.push(k);
        if (k === 'hard') { j.perf = olC(j.perf + olI(9, 15)); out.h = olGain(s, 'h', -2); out.H = olGain(s, 'H', -1); }
        else { j.perf = olC(j.perf - olI(5, 9)); out.h = olGain(s, 'h', olI(3, 5)); }
        const t = k === 'hard' ? ['I worked harder than anyone in the office.', 'J’ai travaillé plus dur que tout le monde.'] : ['I took it easy at work this year.', 'J’ai levé le pied au travail cette année.'];
        olSay(s, t, k === 'hard' ? 'g' : ''); sfx('tap'); tq.unshift(result(t, out, '', k === 'hard' ? 'up' : 'lotus')); return nextPop();
      }
      if (k === 'raise') {
        if (m.dn.includes('raise')) return; m.dn.push('raise');
        const ok = olR() * 100 < j.perf - 15, pct = olI(4, 10), t = ok ? [`My boss gave me a ${pct}% raise!`, `Mon patron m’a accordé ${pct} % d’augmentation !`] : ['My boss said no to a raise this year.', 'Mon patron a refusé de m’augmenter cette année.'];
        if (ok) { j.sal = Math.round(j.sal * (1 + pct / 100)); out.h = olGain(s, 'h', 4); } else { j.perf = olC(j.perf - 3); out.h = olGain(s, 'h', -2); }
        olSay(s, t, ok ? 'g' : 'b'); sfx(ok ? 'good' : 'bad'); tq.unshift(result(t, out, ok ? 'g' : 'b', 'coin')); return nextPop();
      }
      if (k === 'promo') {
        if (m.dn.includes('promo')) return; m.dn.push('promo');
        const ok = j.ly >= 1 && olR() * 100 < (j.perf - 40) * 1.4;
        if (ok && olPromote(s)) { sfx('win'); tq.unshift(result([`Promoted to ${olLow(olJobT(j.id, j.lvl, m.g, 0))}!`, `Promu${m.g === 'f' ? 'e' : ''} ${olLow(olJobT(j.id, j.lvl, m.g, 1))} !`], { h: 6 }, 'g', 'award')); return nextPop(); }
        const t = ['My boss said I am not ready for a promotion yet.', 'Mon patron trouve que je ne suis pas encore prêt' + (m.g === 'f' ? 'e' : '') + ' pour une promotion.'];
        olSay(s, t, 'b'); out.h = olGain(s, 'h', -2); sfx('bad'); tq.unshift(result(t, out, 'b', 'award')); return nextPop();
      }
      if (k === 'quit') {
        tq.unshift({ ic: 'x', title: L('Quit your job?'), text: olEsc(olJobT(j.id, j.lvl, m.g)), ch: [{ t: L('Yes, quit'), cls: 'warn', kb: false, fn: () => { olQuitJob(s, 'quit'); sfx('tap'); refresh(); nextPop(); } }, { t: L('Stay'), cls: 'alt', kb: false, fn: () => nextPop() }] });
        return nextPop();
      }
      if (k === 'retire') {
        tq.unshift({ ic: 'leaf', title: L('Retire now?'), text: L('Your pension would be about {m} a year.', { m: olMoney(Math.max(9000, Math.round(j.sal * 0.45))) }), ch: [{ t: L('Retire'), cls: 'go', kb: false, fn: () => { retire(); refresh(); nextPop(); } }, { t: L('Keep working'), cls: 'alt', kb: false, fn: () => nextPop() }] });
        return nextPop();
      }
    }
    function apply(id) {
      const m = me(), d = OL_JOBM[id];
      if (!d || olReqOk(s, d).length || (m.job && m.job.id === id)) return;
      const q = olP(OL_IV);
      const ans = q[1].map((a, i) => [a, i]).sort(() => olR() - 0.5);
      tq.unshift({ ic: 'job', title: L('Job interview'), text: olEsc(olJobT(id, 0, m.g)) + '<br><br>' + olEsc(X(q[0])), ch: ans.map(([a]) => ({ t: X(a[0]), kb: true, fn: () => {
        let ch = d[1] === 'p' ? 62 : 42;
        ch += a[1] + (m.st.s - 50) / 4 + (m.st.l - 50) / 10 + (m.fl.intern ? 8 : 0) + (m.edu.gpa >= 85 ? 6 : 0);
        if (d[1] === 't') { const sk = d[7]; ch = 30 + a[1] + ((sk === 'a' ? m.a : m.sk[sk] || 0) - 60) + m.f / 4; }
        const ok = olR() * 100 < ch;
        if (ok) {
          if (m.job) olQuitJob(s, 'quit');
          let lvl = 0;
          if (m.lastJob && m.lastJob.id === id) lvl = Math.max(0, m.lastJob.lvl - 1);
          olStartJob(s, id, lvl);
          s.lst = null;
          const t = [`I got the job as ${olLow(olJobT(id, lvl, m.g, 0))}!`, `J’ai décroché le poste : ${olLow(olJobT(id, lvl, m.g, 1))} !`];
          olSay(s, t, 'g'); olGain(s, 'h', 5); sfx('win');
          tq.unshift(result(t, { h: 5 }, 'g', 'job'));
        } else {
          const t = [`I didn’t get the job as ${olLow(olJobT(id, 0, m.g, 0))}.`, `Je n’ai pas obtenu le poste : ${olLow(olJobT(id, 0, m.g, 1))}.`];
          olSay(s, t, 'b'); olGain(s, 'h', -2); sfx('bad');
          s.lst.ids = s.lst.ids.filter(x => x !== id);
          tq.unshift(result(t, { h: -2 }, 'b', 'job'));
        }
        nextPop();
      } })) });
      nextPop();
    }

    function buy(kind, id, pr) {
      const m = me();
      pr = +pr;
      if (m.age < 18 && id !== 'bike') return;
      if (kind === 'h') {
        const d = OL_HOUSEM[id];
        if (!d || !s.shop || !s.shop.h.some(x => x[0] === id && x[1] === pr)) return;
        const cash = m.m >= pr;
        const go = mort => {
          if (mort) { const lo = Math.round(pr * 0.8); m.m -= pr - lo; m.as.push({ t: 'house', id, v: pr, lo, pm: Math.round(lo * 0.075), y: 0 }); }
          else { m.m -= pr; m.as.push({ t: 'house', id, v: pr, lo: 0, pm: 0, y: 0 }); }
          m.mv = 1;
          s.shop.h = s.shop.h.filter(x => x[0] !== id);
          const t = [`I bought ${olArt(d[1][0])} for ${olMoney(pr, 0)}.`, `J’ai acheté ${olFrA(d[1][1])[0]}${olLow(d[1][1])} pour ${olMoney(pr, 1)}.`];
          olSay(s, t, 'g'); olGain(s, 'h', 8); sfx('win'); tq.unshift(result(t, { h: 8, m: -(mort ? pr * 0.2 : pr) }, 'g', d[3])); nextPop();
        };
        tq.unshift({ ic: d[3], title: X(d[1]), text: olEsc(olMoney(pr)), ch: [cash ? { t: L('Buy outright'), cls: 'go', kb: false, fn: () => go(0) } : null, !olHouse(s) && m.m >= pr * 0.2 ? { t: L('Take a mortgage'), s: L('Deposit {a}, then about {b} a year', { a: olMoney(pr * 0.2), b: olMoney(pr * 0.8 * 0.075) }), kb: false, fn: () => go(1) } : null, { t: L('Cancel'), cls: 'alt', kb: false, fn: () => nextPop() }].filter(Boolean) });
        return nextPop();
      }
      const d = OL_CARM[id];
      if (!d || m.m < pr || (d[4] && !m.lic)) return;
      if (id !== 'bike' && !(s.shop && s.shop.c.some(x => x[0] === id && x[1] === pr))) return;
      m.m -= pr;
      m.as.push({ t: 'car', id, v: pr, lo: 0, pm: 0, y: 0 });
      if (s.shop) s.shop.c = s.shop.c.filter(x => x[0] !== id);
      const t = [`I bought ${olArt(d[1][0])}.`, `Je me suis offert ${olFrA(d[1][1])[0]}${olLow(d[1][1])}.`];
      olSay(s, t, 'g'); olGain(s, 'h', 5); sfx('good');
      tq.unshift(result(t, { h: 5, m: -pr }, 'g', d[3]));
      nextPop();
    }
    function olFrA(t) { return /^(Voiture|Petite|Citadine|Berline|Maison|Villa)/.test(t) ? ['une ', 'ma '] : ['un ', 'mon ']; }
    function sell(i) {
      const m = me(), a = m.as[+i];
      if (!a) return;
      const d = a.t === 'house' ? OL_HOUSEM[a.id] : OL_CARM[a.id], net = a.v - (a.lo || 0);
      tq.unshift({ ic: d[3], title: L('Sell this?'), text: olEsc(X(d[1])) + '<br>' + L('You would receive {m}.', { m: olMoney(net) }), ch: [{ t: L('Sell'), cls: 'warn', kb: false, fn: () => {
        m.as.splice(+i, 1); m.m += net;
        olSay(s, [`I sold my ${olLow(d[1][0])} for ${olMoney(a.v, 0)}.`, `J’ai vendu ${olFrA(d[1][1])[1]}${olLow(d[1][1])} pour ${olMoney(a.v, 1)}.`], '');
        sfx('tap'); refresh(); nextPop();
      } }, { t: L('Keep it'), cls: 'alt', kb: false, fn: () => nextPop() }] });
      nextPop();
    }

    function meet(k) {
      const m = me();
      if (k === 'friend') {
        if (m.age < 4 || m.dn.includes('friend')) return;
        const cs = [0, 1, 2].map(() => { const t = olTemp(s, m.age + olI(-2, 2)); t.age = Math.max(4, t.age); t.tr = olP(OL_TRAIT); return t; });
        tq.unshift({ ic: 'smile', title: L('Make a new friend'), text: L('Who would you like to get to know?'), ch: cs.map(t => ({ t: t.n, s: L('Age {n}', { n: t.age }) + ' · ' + olTrait(t.tr, t.g, olFr() ? 1 : 0), kb: false, fn: () => {
          m.dn.push('friend');
          const ok = olR() < 0.55 + m.st.h / 400 + m.k / 400;
          const c = { p: t };
          if (ok) { olMoveTemp(s, c, 'friend'); c.p.b = olI(55, 75); const tx = olFP(['{p} and I became friends.', '{p} et moi sommes devenus amis.'], c, s); olSay(s, tx, 'g'); olGain(s, 'h', 4); sfx('good'); tq.unshift(result(tx, { h: 4 }, 'g', null, olAv(c.p))); }
          else { const tx = olFP(['I tried to make friends with {p}, but we didn’t click.', 'J’ai essayé de sympathiser avec {p}, mais le courant n’est pas passé.'], c, s); olSay(s, tx, 'b'); sfx('bad'); tq.unshift(result(tx, {}, 'b', null, olAv(t))); }
          nextPop();
        } })).concat([{ t: L('Cancel'), cls: 'alt', kb: false, fn: () => nextPop() }]) });
        return nextPop();
      }
      if (k === 'love') {
        if (m.age < 16 || m.dn.includes('love') || olLove(s)) return;
        const prefOf = () => G.pref || (m.g === 'f' ? 'm' : 'f');
        const mkC = pref => [0, 1, 2].map(() => { const g = pref === 'a' ? olP(['m', 'f']) : pref; const t = olTemp(s, 0); t.g = g; t.n = olName(g); t.lk = olLook(g); t.age = m.age < 18 ? olI(16, 17) : olC(m.age + olI(-4, 4), 18, 110); t.l = olI(20, 95); t.tr = olP(OL_TRAIT); if (t.age >= 18) { const jid = olP(['teach', 'nurse', 'dev', 'engin', 'cook', 'retail', 'police', 'design', 'acct', 'mech', 'lab', 'journ', 'barista', 'farm', 'doctor', 'lawyer']); t.job = olJobPair(jid, Math.min(OL_JOBM[jid][6].length - 1, olI(0, 2)), g); } return t; });
        const build = () => {
          const pref = prefOf(), cs = mkC(pref);
          return { ic: 'heart', title: L('Find love'), html: `<div class="seg">${[['f', L('Girls')], ['m', L('Boys')], ['a', L('Everyone')]].map(([v, t]) => `<button type="button" data-pref="${v}" aria-pressed="${pref === v}">${t}</button>`).join('')}</div>`, ch: cs.map(t => ({ t: t.n + ', ' + t.age, s: L('Looks {n}%', { n: t.l }) + ' · ' + olTrait(t.tr, t.g, olFr() ? 1 : 0) + (t.job ? ' · ' + olEsc(X(t.job)) : ''), kb: false, fn: () => {
            m.dn.push('love');
            const ok = olR() * 100 < 42 + (m.st.l - t.l) / 2 + m.st.h / 10;
            const c = { p: t };
            if (ok) { olMoveTemp(s, c, 'love', { st: 'date', yrs: 0, job: t.job || null }); c.p.b = olI(60, 80); const tx = olFP(['I asked {p} out and {he} said yes!', 'J’ai proposé à {p} de sortir avec moi et {il} a dit oui !'], c, s); olSay(s, tx, 'g'); olGain(s, 'h', 8); sfx('win'); tq.unshift(result(tx, { h: 8 }, 'g', null, olAv(c.p))); }
            else { const tx = olFP(['I asked {p} out, but {he} said no.', 'J’ai proposé à {p} de sortir avec moi, mais {il} a refusé.'], c, s); olSay(s, tx, 'b'); olGain(s, 'h', -3); sfx('bad'); tq.unshift(result(tx, { h: -3 }, 'b', null, olAv(t))); }
            nextPop();
          } })).concat([{ t: L('Cancel'), cls: 'alt', kb: false, fn: () => nextPop() }]) };
        };
        newF = build;
        tq.unshift(build());
        return nextPop();
      }
      if (k === 'adopt') {
        if (m.dn.includes('adopt') || m.m < 4000 || m.age < 25) return;
        tq.unshift({ ic: 'baby', title: L('Adopt a child'), text: L('Adoption costs {m}. Give a child a loving home?', { m: olMoney(4000) }), ch: [{ t: L('Adopt'), cls: 'go', kb: false, fn: () => {
          m.dn.push('adopt'); m.m -= 4000;
          const g = olP(['m', 'f']), k2 = olPerson(s, 'kid', g, olI(0, 7), { ln: m.ln }); k2.b = olI(70, 90); m.kids++;
          const tx = [`I adopted a ${g === 'f' ? 'girl' : 'boy'} named ${k2.n}, aged ${k2.age}.`, `J’ai adopté ${g === 'f' ? 'une petite fille' : 'un petit garçon'} prénommé${g === 'f' ? 'e' : ''} ${k2.n}, âgé${g === 'f' ? 'e' : ''} de ${k2.age} ans.`];
          olSay(s, tx, 'g'); olGain(s, 'h', 9); sfx('win'); tq.unshift(result(tx, { h: 9, m: -4000 }, 'g', null, olAv(k2))); nextPop();
        } }, { t: L('Cancel'), cls: 'alt', kb: false, fn: () => nextPop() }] });
        return nextPop();
      }
    }

    function pAct(k) {
      const m = me(), p = sel;
      if (!p || !p.al || p.d.includes(k) || !m.al) return;
      const c = { p, topic: olP(OL_TOPIC) }, out = {};
      const fin = (pair, eff, tone, ic) => { p.d.push(k); olApply(s, eff, c, out); const t = olFP(pair, c, s); olSay(s, t, tone || 'g'); sfx(tone === 'b' ? 'bad' : 'good'); tq.unshift(result(t, out, tone, ic, olAv(p))); nextPop(); };
      const b = (x, y) => olI(x, y);
      switch (k) {
        case 'time': return fin(p.r === 'kid' && p.age < 13 ? ['I took {myrel} {p} to the park.', 'J’ai emmené {myrel} {p} au parc.'] : ['I spent the afternoon with {myrel} {p}.', 'J’ai passé l’après-midi avec {myrel} {p}.'], `b+${b(5, 10)} h+2`);
        case 'talk': if (olR() < 0.15) return fin(['I talked with {p} about {topic}, and we ended up arguing.', 'J’ai discuté de {topic} avec {p}, et on a fini par se disputer.'], 'b-4 h-1', 'b');
          return fin(['I had a long conversation with {p} about {topic}.', 'J’ai eu une longue discussion avec {p} sur {topic}.'], `b+${b(3, 7)} h+1`);
        case 'compl': return fin(olP([['I told {p} how much {he} means to me.', 'J’ai dit à {p} à quel point {il} compte pour moi.'], ['I complimented {p} on {his} amazing sense of humour.', 'J’ai complimenté {p} sur son sens de l’humour.']]), `b+${b(3, 6)}`);
        case 'gift': { const cost = m.age < 18 ? 10 : 80; if (m.m < cost) { api.toast(L('Not enough money')); return; } m.m -= cost; out.m = -cost; return fin(['I gave {p} a thoughtful gift.', 'J’ai offert à {p} un cadeau attentionné.'], `b+${b(6, 11)}`); }
        case 'money': {
          const w = p.w !== undefined ? p.w : s.pw, ok = olR() * 100 < 25 + w * 18 + p.b / 4;
          if (!ok) return fin(['I asked {p} for money. {He} said no.', 'J’ai demandé de l’argent à {p}. {Il} a refusé.'], 'b-2', 'b');
          const v = Math.round((m.age < 18 ? olI(5, 20) * (w + 1) : olI(50, 300) * (w * w + 1)) / 5) * 5;
          c.amt = v; m.m += v; out.m = v;
          return fin(['{p} gave me {amt}.', '{p} m’a donné {amt}.'], 'b-1');
        }
        case 'pocket': if (m.m < 100) { api.toast(L('Not enough money')); return; } m.m -= 100; out.m = -100; return fin(['I gave {p} some pocket money.', 'J’ai donné de l’argent de poche à {p}.'], 'b+6');
        case 'date': { const cost = m.age < 18 ? 15 : 60; if (m.m < cost) { api.toast(L('Not enough money')); return; } m.m -= cost; out.m = -cost; return fin(olP([['I took {p} out for dinner and a film.', 'J’ai emmené {p} au restaurant puis au cinéma.'], ['{p} and I had a picnic by the lake.', '{p} et moi avons pique-niqué au bord du lac.'], ['{p} and I went ice skating.', '{p} et moi sommes allés faire du patin à glace.']]), `b+${b(6, 10)} h+3`); }
        case 'propose': {
          const ok = (p.yrs || 0) >= 1 && olR() * 100 < p.b - 10;
          if (ok) { p.st = 'eng'; return fin(['I proposed to {p} and {he} said yes! We’re engaged!', 'J’ai demandé {p} en mariage et {il} a dit oui ! Nous sommes fiancés !'], 'b+10 h+10', 'g', 'ring'); }
          return fin(['I proposed to {p}, but {he} said {he} isn’t ready yet.', 'J’ai demandé {p} en mariage, mais {il} n’est pas encore prêt{pe}.'], 'b-8 h-5', 'b', 'ring');
        }
        case 'wed': {
          tq.unshift({ ic: 'ring', title: L('Plan the wedding'), ch: [[L('A small ceremony with close family'), 1500], [L('A big party with everyone'), 14000], [L('Run away and marry on a beach'), 400]].map(([t, cst], i) => ({ t, s: olMoney(cst), dis: m.m < cst, kb: false, fn: () => {
            p.d.push('wed'); m.m -= cst; p.st = 'mar';
            if (!p.inc) p.inc = olI(20, 55) * 1000;
            const t = olFP([['{p} and I got married in a small ceremony. It was perfect.', '{p} et moi nous sommes mariés lors d’une petite cérémonie. C’était parfait.'], ['{p} and I got married at a huge party. We danced until sunrise.', '{p} et moi nous sommes mariés lors d’une grande fête. Nous avons dansé jusqu’à l’aube.'], ['{p} and I ran away and got married on a beach at sunset.', '{p} et moi nous sommes enfuis pour nous marier sur une plage au coucher du soleil.']][i], c, s);
            olApply(s, `b+12 h+${i === 1 ? 12 : 9}`, c, out); out.m = -cst;
            olSay(s, t, 'g'); sfx('win'); tq.unshift(result(t, out, 'g', 'ring', olAv(p))); nextPop();
          } })).concat([{ t: L('Cancel'), cls: 'alt', kb: false, fn: () => nextPop() }]) });
          return nextPop();
        }
        case 'baby': {
          if (s.preg) { api.toast(L('A baby is already on the way!')); return; }
          const fert = Math.max(0.08, 0.6 - Math.max(0, Math.max(m.g === 'f' ? m.age : p.age, 30) - 30) * 0.03);
          if (olR() < fert) { s.preg = 1; return fin(['{p} and I are expecting a baby!', '{p} et moi attendons un bébé !'], 'b+6 h+8', 'g', 'baby'); }
          return fin(['{p} and I are trying for a baby. No news yet.', '{p} et moi essayons d’avoir un bébé. Pas encore de nouvelles.'], 'b+3', '', 'baby');
        }
        case 'split': {
          tq.unshift({ ic: 'broken', title: p.st === 'mar' ? L('Ask for a divorce?') : L('Break up?'), text: olEsc(p.n), ch: [{ t: L('Yes'), cls: 'warn', kb: false, fn: () => {
            if (p.st === 'mar') olDivorce(s, p, 0);
            else { p.al = 0; p.gone = 1; olSayC(s, ['I broke up with {p}.', 'J’ai rompu avec {p}.'], c, 'b'); olGain(s, 'h', -5); }
            sel = null; sfx('bad'); refresh(); nextPop();
          } }, { t: L('No'), cls: 'alt', kb: false, fn: () => nextPop() }] });
          return nextPop();
        }
        case 'end': p.al = 0; p.gone = 1; sel = null; olSayC(s, ['I ended my friendship with {p}.', 'J’ai mis fin à mon amitié avec {p}.'], c, 'b'); sfx('bad'); refresh(); return;
        case 'play': return fin(['I played with {myrel} {p} in the garden.', 'J’ai joué avec {myrel} {p} dans le jardin.'], `b+${b(5, 9)} h+3`);
        case 'walk': return fin(['I took {p} for a long walk.', 'J’ai emmené {p} faire une longue promenade.'], `b+${b(4, 8)} H+2 a+1`);
        case 'treat': return fin(['I gave {p} a special treat.', 'J’ai donné une friandise à {p}.'], `b+${b(4, 7)}`);
        case 'vet': if (m.m < 80 && m.age >= 18) { api.toast(L('Not enough money')); return; } if (m.age >= 18) { m.m -= 80; out.m = -80; } p.ly = Math.min(p.ly + (olR() < 0.3 ? 1 : 0), 120); return fin(['I took {p} to the vet for a check-up. All good!', 'J’ai emmené {p} chez le vétérinaire pour un bilan. Tout va bien !'], 'b+3');
      }
    }

    function recordDeath() {
      const m = me();
      G.lives++;
      G.best = Math.max(G.best, m.age);
      (m.aw || []).forEach(a => { G.aw[a] = (G.aw[a] || 0) + 1; });
      G.tree.push({ n: m.fn + ' ' + m.ln, g: m.g, b: m.born, d: m.yr, a: m.age, aw: (m.aw || ['ordinary'])[0], j: m.job ? olJobPair(m.job.id, m.job.lvl, m.g) : m.lastJob ? olJobPair(m.lastJob.id, m.lastJob.lvl, m.g) : null, w: m.worth || 0, k: s.pp.filter(p => p.r === 'kid').length, ln: s.line, gen: s.gen, lk: Object.assign({}, m.lk) });
      if (G.tree.length > 60) G.tree.splice(0, G.tree.length - 60);
      api.submit(m.age);
    }
    function showEnd() {
      if (!s || me().al) return;
      closeCard();
      const m = me(), kids = s.pp.filter(p => p.al && p.r === 'kid');
      const aw = m.aw || ['ordinary'], a0 = OL_AWM[aw[0]];
      const first = G.aw[aw[0]] === 1;
      const edu = m.edu.grad ? X(OL_GRADM[m.edu.grad].slice(1, 3)) : m.edu.deg ? L('Degree in {x}', { x: X(OL_MAJM[m.edu.deg].slice(1, 3)) }) : m.edu.hs ? L('High school diploma') : L('No diploma');
      const job = m.job ? olJobT(m.job.id, m.job.lvl, m.g) : m.lastJob ? olJobT(m.lastJob.id, m.lastJob.lvl, m.g) : '—';
      const cause = X(m.cause);
      const ct = olFr() ? `${m.fn} est mort${m.g === 'f' ? 'e' : ''} ${cause} à ${m.age} ans.` : `${m.fn} died ${cause === 'peacefully in my sleep' ? 'peacefully in their sleep' : cause === 'an accident' ? 'in an accident' : 'of ' + cause} at the age of ${m.age}.`;
      let h = `<div class="scr end"><div class="pk"><div class="big"><div class="pa">${olMeAv(m)}</div><h3>${olEsc(m.fn + ' ' + m.ln)}</h3><div class="yrs">${m.born} – ${m.yr}</div></div><p class="pt">${olEsc(ct)}</p>`;
      h += `<div class="awd">${olBadge(aw[0], 56)}<div><b>${olEsc(X(a0[1]))}${first ? `<em>${L('New')}</em>` : ''}</b><small>${olEsc(X(a0[2]))}</small>${aw.length > 1 ? `<small>${L('Also earned: {x}', { x: aw.slice(1).map(x => X(OL_AWM[x][1])).join(', ') })}</small>` : ''}</div></div>`;
      h += `<div class="kv"><span>${L('Education')}</span><b>${olEsc(edu)}</b><span>${L('Career')}</span><b>${olEsc(job)}</b><span>${L('Net worth')}</span><b>${olMoney(m.worth || 0)}</b><span>${L('Children')}</span><b>${s.pp.filter(p => p.r === 'kid').length}</b><span>${L('Generation')}</span><b>${s.gen}</b></div>`;
      h += kids.length ? `<p class="lbl">${L('Continue as one of your children')}</p>` + kids.slice(0, 6).map(k => `<button type="button" class="ch go" data-a="heir:${k.i}">${olEsc(k.n)}<small>${L('Age {n}', { n: k.age })} · ${olMoney(Math.max(0, Math.round((m.worth || 0) * 0.9 / kids.length)))}</small></button>`).join('') : `<p class="hint" style="text-align:center">${L('No children to carry on the family. The family line ends here.')}</p>`;
      h += `<button type="button" class="ch alt" data-a="newlife">${L('Start a new life')}</button><div class="mini"><span>${L('Lives lived: {n}', { n: G.lives })}</span><span>${L('Oldest age: {n}', { n: G.best })}</span><span>${L('Awards: {n}', { n: Object.keys(G.aw).length + ' / ' + OL_AW.length })}</span></div></div></div>`;
      scr.innerHTML = h;
      scr.hidden = false;
      scr.scrollTop = 0;
    }

    let nf = null;
    function showNew() {
      closeCard();
      if (!nf) { const g = olP(['m', 'f']); nf = { g, fn: olName(g), ln: olP(OL_NM.l), lk: olLook(g), city: olI(0, OL_CITY.length - 1) }; }
      nf.lk.bd = 0;
      const ci = OL_CITY[nf.city];
      scr.innerHTML = `<div class="scr"><div class="logo"><b>One <em>Life</em></b><span>${L('Live a whole life, one year at a time.')}</span></div><div class="pk"><div class="nw"><div class="pa">${olFace(nf.lk, nf.g, 22, 75, 1)}</div><div class="f"><label class="lbl">${L('First name')}</label><input type="text" data-f="fn" maxlength="20" value="${olEsc(nf.fn)}"><label class="lbl">${L('Last name')}</label><input type="text" data-f="ln" maxlength="20" value="${olEsc(nf.ln)}"></div></div><div class="seg"><button type="button" data-a="ng:f" aria-pressed="${nf.g === 'f'}">${L('Girl')}</button><button type="button" data-a="ng:m" aria-pressed="${nf.g === 'm'}">${L('Boy')}</button><button type="button" data-a="nr" aria-label="${L('Random')}">${L('Random')}</button></div><p class="hint" style="text-align:center">${L('Born in {c}', { c: olFr() ? ci[1] : ci[0] })}</p><button type="button" class="ch go" data-a="nstart">${L('Start life')}</button>${G.cur && G.cur.me && G.cur.me.al ? `<button type="button" class="ch alt" data-a="ncancel">${L('Back to my life')}</button>` : ''}<div class="mini"><span>${L('Lives lived: {n}', { n: G.lives })}</span><span>${L('Oldest age: {n}', { n: G.best })}</span><span>${L('Awards: {n}', { n: Object.keys(G.aw).length + ' / ' + OL_AW.length })}</span></div></div></div>`;
      scr.hidden = false;
    }
    function readNew() { scr.querySelectorAll('input[data-f]').forEach(i => { const v = i.value.replace(/[<>]/g, '').trim().slice(0, 20); if (v) nf[i.dataset.f] = v; }); }
    function startLife(n) {
      s = n; G.cur = s; sel = null; sub = null; tab = 'occ'; tq = []; nf = null;
      scr.hidden = true; scr.innerHTML = '';
      fed = { n: -1, l: 0 };
      renderAll(); snap();
      sfx('win');
      if (s.q.length) nextPop();
    }

    api.on(root, 'click', e => {
      if (!api.alive) return;
      const pb = e.target.closest('.ol-pop [data-pc]');
      if (pb) { if (pb.disabled || !pop) return; const c = pop.ch[+pb.dataset.pc]; if (c && c.fn && !c.dis) { const f = c.fn; pop.ch = []; f(); } return; }
      const pr = e.target.closest('.ol-pop [data-pref]');
      if (pr) { G.pref = pr.dataset.pref; if (newF) { const c = newF(); showCard(c); } return; }
      const b = e.target.closest('[data-a]');
      if (!b || b.disabled) return;
      const a = b.dataset.a, [k, x, y, z] = a.split(':');
      if (k === 'nstart') { readNew(); const n = olNewLife({ g: nf.g, fn: nf.fn, ln: nf.ln, lk: nf.lk, city: nf.city }); startLife(n); return; }
      if (k === 'ncancel') { scr.hidden = true; nf = null; return; }
      if (k === 'ng') { readNew(); if (nf.g !== x) { nf.g = x; nf.fn = olName(x); nf.lk = olLook(x); } sfx('tap'); showNew(); return; }
      if (k === 'nr') { const g = olP(['m', 'f']); nf = { g, fn: olName(g), ln: olP(OL_NM.l), lk: olLook(g), city: olI(0, OL_CITY.length - 1) }; sfx('tap'); showNew(); return; }
      if (k === 'heir') { const kid = s.pp.find(p => p.i === +x && p.al && p.r === 'kid'); if (kid) startLife(olHeir(s, kid)); return; }
      if (k === 'newlife') { G.cur = null; s = null; nf = null; showNew(); snap(); return; }
      if (!s) return;
      if (pop) return;
      if (k === 'age') return ageUp();
      sfx('tap');
      if (k === 'tab') { if (narrow() && tab === x && side.classList.contains('open') && !sel && !sub) closeSide(); else openTab(x); return; }
      if (k === 'close') return closeSide();
      if (k === 'back') { if (sel) sel = null; else sub = null; renderSide(); return; }
      if (k === 'me') { sub = 'me'; sel = null; if (narrow()) side.classList.add('open'); renderSide(); renderNav(); return; }
      if (k === 'sub') { sub = x; sel = null; if (narrow()) side.classList.add('open'); renderSide(); return; }
      if (k === 'restart') { tq.unshift({ ic: 'dice', title: L('Start a new life?'), text: L('Your current life will end and its progress will be lost.'), ch: [{ t: L('Start a new life'), cls: 'warn', kb: false, fn: () => { closeCard(); G.cur = null; s = null; nf = null; showNew(); snap(); } }, { t: L('Cancel'), cls: 'alt', kb: false, fn: () => nextPop() }] }); return nextPop(); }
      if (k === 'pp') { sel = s.pp.find(p => p.i === +x) || null; renderSide(); return; }
      if (k === 'pa') return pAct(x);
      if (k === 'act') return act(x);
      if (k === 'sch') return schAct(x);
      if (k === 'job') return jobAct(x);
      if (k === 'apply') return apply(x);
      if (k === 'edu') { const m = me(); if (x === 'adult') { olSchoolStart(s, 'high', 1, { sum: 55 }); olSay(s, ['I went back to school to finish my diploma.', 'J’ai repris mes études pour obtenir mon diplôme.'], 'm'); m.edu.left = 0; if (m.job && m.job.t === 'f') olQuitJob(s, 'quit'); s.lst = null; refresh(); return; } if (x === 'uni') return uniPick(); if (x === 'grad') { s.q.unshift({ k: 'grad', m: 1 }); return nextPop(); } return; }
      if (k === 'buy') return buy(x, y, z);
      if (k === 'sell') return sell(x);
      if (k === 'meet') return meet(x);
    });
    api.on(root, 'keydown', e => {
      if (e.key === 'Enter' && e.target.matches && e.target.matches('.ol-pop input[type=text]')) { e.preventDefault(); const g = popEl.querySelector('.ch.go'); if (g) g.click(); }
    });
    api.on(window, 'keydown', e => {
      if (!api.alive || api.paused || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (!root.isConnected || !scr.hidden) return;
      if (pop) {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= 9 && !e.repeat) { const btn = popEl.querySelectorAll('.ch')[n - 1]; if (btn && !btn.disabled) { e.preventDefault(); btn.click(); } }
        return;
      }
      if (!s) return;
      if ((e.code === 'Space' || e.key === 'Enter') && !e.repeat && !(t && t.tagName === 'BUTTON' && root.contains(t))) { e.preventDefault(); ageUp(); }
      if (e.key === 'Escape' && narrow() && side.classList.contains('open')) closeSide();
    });

    function layout() {
      const w = root.clientWidth;
      root.classList.toggle('narrow', w > 0 && w < 760);
      root.classList.toggle('tiny', w > 0 && w < 420);
      if (s) { renderNav(); }
    }
    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(() => { if (!api.alive) return ro.disconnect(); layout(); });
      ro.observe(root);
    }
    layout();
    api.interval(() => { const l = olLang(); if (l !== lastLang) { lastLang = l; if (s) renderAll(); if (!scr.hidden) { if (s && !me().al) showEnd(); else if (!s || !G.cur) showNew(); } if (pop && s && s.q.length && !tq.length) { closeCard(); nextPop(); } } }, 800);

    if (s) {
      renderAll();
      if (!s.me.al) showEnd();
      else if (s.q.length) api.timeout(() => nextPop(), 300);
    } else showNew();
  }

  Ameplay.register({
    id: 'one-life',
    title: 'One Life',
    category: 'Strategy',
    better: 'high',
    width: 1060,
    blurb: 'Live a whole life one year at a time: school, exams, careers, friends, love, family, money and a family line that carries on.',
    help: 'Press <kbd>Space</kbd> or the green button to age one year · answer event cards with the buttons or <kbd>1</kbd>–<kbd>4</kbd> · use Job, Assets, People and Activities between years',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="24"/><path d="M32 18v28M18 32h28"/></svg>',
    css: OL_CSS,
    mount: mountOneLife
  });
})();
