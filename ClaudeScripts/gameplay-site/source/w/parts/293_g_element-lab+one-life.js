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
.gm-little-alchemy{--ink:#3b3447;--mut:#8a8499;--ac:#2f9e8f;--acd:#237d71;--line:#e4dfd2;--paper:#fffdf8;--ws:#f7f4ec;--iw:76px;--ih:90px;position:relative;align-items:stretch;justify-content:flex-start;gap:0;padding:0;overflow:hidden;border-radius:14px;background:var(--paper);color:var(--ink);font-family:var(--sans);height:clamp(500px,calc(100dvh - var(--goff,250px)),780px);min-height:0;touch-action:manipulation}
.gm-little-alchemy [hidden]{display:none!important}
.gm-little-alchemy button{font-family:inherit;color:inherit}
.gm-little-alchemy .la-top{flex:none;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:1px solid var(--line);background:var(--paper)}
.gm-little-alchemy .la-prog{display:flex;align-items:center;gap:10px;min-width:0;flex:1}
.gm-little-alchemy .la-cnt{font:800 16px/1 var(--sans);white-space:nowrap;font-variant-numeric:tabular-nums}
.gm-little-alchemy .la-bar{position:relative;flex:1;max-width:240px;height:9px;border-radius:99px;background:#ece7d9;overflow:hidden}
.gm-little-alchemy .la-bar i{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:99px;background:linear-gradient(90deg,#46c2b1,var(--ac));transition:width .5s}
.gm-little-alchemy .la-btns{display:flex;gap:6px}
.gm-little-alchemy .la-b{position:relative;display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 13px;border:1.5px solid var(--line);border-radius:999px;background:#fff;font:800 13px/1 var(--sans);cursor:pointer;transition:background .15s,border-color .15s,transform .15s;white-space:nowrap}
.gm-little-alchemy .la-b:hover{border-color:var(--ac);background:#f1fbf9}
.gm-little-alchemy .la-b:active{transform:scale(.95)}
.gm-little-alchemy .la-b svg{width:18px;height:18px;flex:none}
.gm-little-alchemy .la-b em{font-style:normal;min-width:19px;height:19px;padding:0 5px;border-radius:99px;background:var(--ac);color:#fff;font:800 11px/19px var(--sans);text-align:center}
.gm-little-alchemy .la-b.off{opacity:.55}
.gm-little-alchemy .la-main{flex:1;min-height:0;display:flex;position:relative}
.gm-little-alchemy .la-ws{position:relative;flex:1;min-width:0;background:radial-gradient(#d8d1bf 1.2px,transparent 1.6px) 0 0/24px 24px,var(--ws)}
.gm-little-alchemy .la-tip{position:absolute;inset:0;display:grid;place-items:center;margin:0;padding:24px;text-align:center;font:700 15px/1.4 var(--sans);color:#b3ac9a;pointer-events:none;transition:opacity .4s}
.gm-little-alchemy .la-tip.gone{opacity:0}
.gm-little-alchemy .la-lib{flex:none;width:276px;display:flex;flex-direction:column;border-left:1px solid var(--line);background:var(--paper);transition:background .2s}
.gm-little-alchemy .la-lib.over{background:#ffe9e6}
.gm-little-alchemy .la-lib.over::after{content:"Drop to remove";position:absolute;inset:0;display:grid;place-items:center;font:800 15px var(--sans);color:#c4473a;pointer-events:none}
.gm-little-alchemy .la-lh{flex:none;display:flex;align-items:center;justify-content:space-between;padding:9px 12px;font:800 13px/1 var(--sans);color:var(--mut);text-transform:uppercase;letter-spacing:.06em}
.gm-little-alchemy .la-lh button{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px;border:1.5px solid var(--line);border-radius:99px;background:#fff;font:800 11px/1 var(--sans);cursor:pointer;letter-spacing:0;text-transform:none}
.gm-little-alchemy .la-lh button svg{width:14px;height:14px}
.gm-little-alchemy .la-grid{flex:1;min-height:0;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));grid-auto-rows:88px;gap:2px;padding:4px 8px 12px;align-content:start;touch-action:pan-y;overscroll-behavior:contain;scrollbar-width:thin}
.gm-little-alchemy .lt{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:2px;padding:6px 2px 2px;border:0;border-radius:12px;background:none;cursor:grab;touch-action:pan-y;min-width:0;-webkit-user-drag:none}
.gm-little-alchemy .lt:hover{background:#f1ede1}
.gm-little-alchemy .lt:focus-visible,.gm-little-alchemy .bt:focus-visible,.gm-little-alchemy .la-b:focus-visible{outline:3px solid var(--ac);outline-offset:1px}
.gm-little-alchemy .lt .ic{width:50px;height:50px;pointer-events:none}
.gm-little-alchemy .lt .nm{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:700 11.5px/1.2 var(--sans);color:#4a4358;pointer-events:none}
.gm-little-alchemy .lt.fresh{animation:la-fresh 1.6s ease 2}
.gm-little-alchemy .lt.hint{background:#fff3c4;box-shadow:0 0 0 2.5px #f5c542;animation:la-hint 1s ease-in-out infinite}
@keyframes la-fresh{0%,100%{background:none}50%{background:#d9f5ef}}
@keyframes la-hint{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
.gm-little-alchemy .ic svg{display:block;width:100%;height:100%;overflow:visible;pointer-events:none}
.gm-little-alchemy .la-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:5}
.gm-little-alchemy .it{position:absolute;left:0;top:0;width:var(--iw);height:var(--ih);display:flex;flex-direction:column;align-items:center;pointer-events:auto;cursor:grab;touch-action:none;will-change:translate}
.gm-little-alchemy .it .ic{width:calc(var(--iw) - 14px);height:calc(var(--iw) - 14px);filter:drop-shadow(0 3px 3px rgba(60,50,70,.22));transition:transform .15s}
.gm-little-alchemy .it .nm{margin-top:1px;max-width:130%;padding:1px 6px;border-radius:99px;background:rgba(255,253,248,.82);font:800 11.5px/1.25 var(--sans);color:#4a4358;white-space:nowrap;pointer-events:none}
.gm-little-alchemy .it.drag{cursor:grabbing}
.gm-little-alchemy .it.drag .ic{transform:scale(1.14) rotate(-3deg);filter:drop-shadow(0 8px 8px rgba(60,50,70,.3))}
.gm-little-alchemy .it.target .ic{transform:scale(1.18);filter:drop-shadow(0 0 7px #46c2b1) drop-shadow(0 0 2px #46c2b1)}
.gm-little-alchemy .it.slide{transition:translate .24s cubic-bezier(.2,.8,.3,1)}
.gm-little-alchemy .it.pop{animation:la-pop .5s cubic-bezier(.2,1.4,.4,1)}
.gm-little-alchemy .it.out{animation:la-out .22s ease forwards;pointer-events:none}
.gm-little-alchemy .it.shake .ic{animation:la-shake .3s}
@keyframes la-pop{0%{scale:.2;opacity:0}60%{scale:1.25;opacity:1}100%{scale:1}}
@keyframes la-out{to{scale:.1;opacity:0}}
@keyframes la-shake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.gm-little-alchemy .ring{position:absolute;left:0;top:0;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;border:3px solid #46c2b1;pointer-events:none;animation:la-ring .55s ease-out forwards}
@keyframes la-ring{to{transform:scale(6);opacity:0}}
.gm-little-alchemy .la-new{position:absolute;left:50%;top:62px;z-index:8;display:flex;align-items:center;gap:10px;padding:8px 18px 8px 10px;border-radius:99px;background:#fff;border:2px solid var(--ac);box-shadow:0 12px 28px -10px rgba(35,125,113,.55);animation:la-ban 2.4s ease forwards;pointer-events:none;translate:-50% 0}
.gm-little-alchemy .la-new .ic{width:42px;height:42px}
.gm-little-alchemy .la-new small{display:block;font:800 10.5px/1 var(--sans);text-transform:uppercase;letter-spacing:.08em;color:var(--ac)}
.gm-little-alchemy .la-new b{display:block;font:800 17px/1.2 var(--sans)}
@keyframes la-ban{0%{opacity:0;margin-top:-16px}12%{opacity:1;margin-top:0}85%{opacity:1}100%{opacity:0}}
.gm-little-alchemy .la-book{position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;background:var(--paper);animation:la-in .22s ease}
@keyframes la-in{from{opacity:0;transform:translateY(12px)}}
.gm-little-alchemy .bk-h{flex:none;display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid var(--line)}
.gm-little-alchemy .bk-h h3{margin:0;font:800 19px/1 var(--sans)}
.gm-little-alchemy .bk-h .sp{flex:1}
.gm-little-alchemy .bk-st{font:700 12.5px/1.3 var(--sans);color:var(--mut);text-align:right}
.gm-little-alchemy .bk-st b{color:var(--ink)}
.gm-little-alchemy .bk-x{width:38px;height:38px;display:grid;place-items:center;border:1.5px solid var(--line);border-radius:50%;background:#fff;cursor:pointer;flex:none}
.gm-little-alchemy .bk-x svg{width:18px;height:18px}
.gm-little-alchemy .bk-c{flex:none;display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:10px 14px}
.gm-little-alchemy .bk-tabs{display:inline-flex;padding:3px;border-radius:99px;background:#efeadc}
.gm-little-alchemy .bk-tabs button{border:0;background:none;padding:7px 13px;border-radius:99px;font:800 12.5px/1 var(--sans);color:var(--mut);cursor:pointer;white-space:nowrap}
.gm-little-alchemy .bk-tabs button[aria-pressed="true"]{background:#fff;color:var(--ac);box-shadow:0 1px 3px rgba(60,50,70,.2)}
.gm-little-alchemy .la-q{flex:1;min-width:130px;height:36px;padding:0 14px;border:1.5px solid var(--line);border-radius:99px;font:700 14px var(--sans);color:var(--ink);background:#fff;outline:0}
.gm-little-alchemy .la-q:focus{border-color:var(--ac)}
.gm-little-alchemy .bk-b{flex:1;min-height:0;display:flex;position:relative}
.gm-little-alchemy .bk-g{flex:1;min-width:0;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));grid-auto-rows:90px;gap:2px;padding:4px 10px 16px;align-content:start;scrollbar-width:thin}
.gm-little-alchemy .bt{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px 2px;border:0;border-radius:12px;background:none;cursor:pointer;min-width:0}
.gm-little-alchemy .bt:hover,.gm-little-alchemy .bt.sel{background:#f1ede1}
.gm-little-alchemy .bt .ic{width:50px;height:50px}
.gm-little-alchemy .bt .nm{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:700 11.5px/1.2 var(--sans)}
.gm-little-alchemy .bt.sil .ic{filter:brightness(0);opacity:.16}
.gm-little-alchemy .bt.sil .nm{color:#c0b9a8}
.gm-little-alchemy .bt.fin::after,.gm-little-alchemy .tag.fin::before{content:"";position:absolute;right:10px;top:6px;width:11px;height:11px;border-radius:50%;background:#f5c542;border:2px solid #fff;box-shadow:0 0 0 1px #d9a21f}
.gm-little-alchemy .bk-e{grid-column:1/-1;padding:40px 12px;text-align:center;font:700 14px/1.5 var(--sans);color:var(--mut)}
.gm-little-alchemy .bk-d{flex:none;width:286px;overflow:auto;padding:16px;border-left:1px solid var(--line);background:#fcfaf3}
.gm-little-alchemy .bk-d .bd-ic{width:96px;height:96px;margin:4px auto 6px}
.gm-little-alchemy .bk-d .bd-ic.sil{filter:brightness(0);opacity:.16}
.gm-little-alchemy .bk-d h4{margin:0 0 6px;text-align:center;font:800 21px/1.2 var(--sans)}
.gm-little-alchemy .bk-d h5{margin:14px 0 6px;font:800 11px/1 var(--sans);text-transform:uppercase;letter-spacing:.08em;color:var(--mut)}
.gm-little-alchemy .bk-d .mut{margin:10px 0;text-align:center;font:700 13px/1.45 var(--sans);color:var(--mut)}
.gm-little-alchemy .bk-d .tags{display:flex;justify-content:center;gap:6px;flex-wrap:wrap}
.gm-little-alchemy .tag{position:relative;padding:4px 10px;border-radius:99px;background:#efeadc;font:800 11px/1.2 var(--sans)}
.gm-little-alchemy .tag.fin{padding-left:24px;background:#fff3c4}
.gm-little-alchemy .tag.fin::before{left:7px;top:5px;right:auto}
.gm-little-alchemy .rc{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px}
.gm-little-alchemy .rc>b{color:var(--mut)}
.gm-little-alchemy .ch{display:inline-flex;align-items:center;gap:5px;padding:3px 10px 3px 4px;border:1.5px solid var(--line);border-radius:99px;background:#fff;font:700 12px/1 var(--sans);cursor:pointer}
.gm-little-alchemy .ch .ic{width:26px;height:26px}
.gm-little-alchemy .ch.sil{cursor:default;color:#b9b2a1}
.gm-little-alchemy .ch.sil .ic{filter:brightness(0);opacity:.16}
.gm-little-alchemy .mk{display:flex;flex-wrap:wrap;gap:4px}
.gm-little-alchemy .mk .ch{padding-right:4px}
.gm-little-alchemy .mk .ch .ic{width:30px;height:30px}
.gm-little-alchemy .bk-d .bk-x{display:none}
@media (max-width:720px){
.gm-little-alchemy{--iw:62px;--ih:78px}
.gm-little-alchemy .la-top{padding:8px 10px;gap:6px}
.gm-little-alchemy .la-b span{display:none}
.gm-little-alchemy .la-b{padding:0 10px}
.gm-little-alchemy .la-b em{display:inline-block}
.gm-little-alchemy .la-main{flex-direction:column}
.gm-little-alchemy .la-lib{width:auto;height:196px;border-left:0;border-top:1px solid var(--line)}
.gm-little-alchemy .la-lh{padding:6px 12px}
.gm-little-alchemy .la-grid{display:grid;grid-template-columns:none;grid-template-rows:repeat(2,84px);grid-auto-flow:column;grid-auto-columns:68px;overflow-x:auto;overflow-y:hidden;touch-action:pan-x;padding:2px 8px 6px}
.gm-little-alchemy .lt{touch-action:pan-x}
.gm-little-alchemy .la-new{top:52px}
.gm-little-alchemy .bk-b{flex-direction:column}
.gm-little-alchemy .bk-d{position:absolute;left:0;right:0;bottom:0;width:auto;max-height:62%;border-left:0;border-top:1px solid var(--line);box-shadow:0 -14px 30px -14px rgba(60,50,70,.45);z-index:2}
.gm-little-alchemy .bk-d .bk-x{display:grid;position:absolute;right:10px;top:10px}
.gm-little-alchemy .bk-st{display:none}
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
    id: 'little-alchemy',
    title: 'Little Alchemy 2',
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
