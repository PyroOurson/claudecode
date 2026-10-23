
(() => {
  'use strict';

  const ID = 'cookie-baker';
  const CFG = {
    PRICE_GROWTH: 1.15, SELL_RATE: 0.25,
    TIER_UNLOCK: [1, 5, 25, 50, 100, 150, 200, 250, 300, 350], TIER_PRICE: [10, 50, 500, 5e4, 5e6, 5e8, 5e11, 5e14, 5e17, 5e20],
    TIER_COL: ['#ccb3ac', '#ff89e7', '#00deff', '#ffcc2f', '#e9d673', '#ff8a6a', '#a58bff', '#7bffb4', '#ffc4ee', '#ffffff'],
    CURSOR_UPS: [[100, 1], [500, 1], [10000, 10]],
    FINGERS: [[1e5, 25, 0], [1e7, 50, 5], [1e8, 100, 10], [1e9, 150, 20], [1e10, 200, 20], [1e13, 250, 20], [1e16, 300, 20], [1e19, 350, 20], [1e22, 400, 20], [1e25, 450, 20]],
    THOUSAND_ADD: 0.1, GRANDMA_TYPE_PRICE: 50, GRANDMA_TYPE_NEED: 15, COOKIE_UNLOCK_DIV: 20,
    GC_MIN: 60, GC_MAX: 180, GC_LIFE: 13, GC_FPS: 30,
    FRENZY_MULT: 7, FRENZY_TIME: 77, CF_MULT: 777, CF_TIME: 13, CF_CHANCE: 0.1,
    LUCKY_BANK: 0.15, LUCKY_SECS: 900, LUCKY_FLAT: 13,
    MOUSE_PCT: 0.01, MILK_PER_ACH: 0.04, PRESTIGE_DIV: 1e12, PRESTIGE_BONUS: 0.01,
    OFFLINE_RATE: 0.1, OFFLINE_GATES: 0.5, OFFLINE_CAP: 86400,
    AUTOSAVE_MS: 30000, NEWS_SECS: 10, NARROW: 760, ROW_H: 110
  };

  const B = [
    ['Cursor', 'cursors', 15, 0.1, 'Autoclicks the big cookie once every 10 seconds.'],
    ['Grandma', 'grandmas', 100, 1, 'A kindly grandma who bakes more cookies.'],
    ['Farm', 'farms', 1100, 8, 'Grows cookie plants from cookie seeds.'],
    ['Mine', 'mines', 12000, 47, 'Digs up cookie dough and chocolate chips.'],
    ['Factory', 'factories', 130000, 260, 'Churns out cookies by the truckload.'],
    ['Bank', 'banks', 1.4e6, 1400, 'Generates cookies from compound interest.'],
    ['Temple', 'temples', 2e7, 7800, 'Full of precious, ancient chocolate.'],
    ['Wizard tower', 'wizard towers', 3.3e8, 44000, 'Summons cookies with arcane incantations.'],
    ['Shipment', 'shipments', 5.1e9, 260000, 'Imports fresh cookies from the cookie planet.'],
    ['Alchemy lab', 'alchemy labs', 7.5e10, 1.6e6, 'Transmutes gold into cookies!'],
    ['Portal', 'portals', 1e12, 1e7, 'Opens a door to a dimension made of dough.'],
    ['Time machine', 'time machines', 1.4e13, 6.5e7, 'Fetches cookies from the past, before anyone could eat them.'],
    ['Antimatter condenser', 'antimatter condensers', 1.7e14, 4.3e8, 'Condenses the antimatter of the universe into cookies.'],
    ['Prism', 'prisms', 2.1e15, 2.9e9, 'Converts light itself into cookies.'],
    ['Chancemaker', 'chancemakers', 2.6e16, 2.1e10, 'Bakes cookies out of thin air through sheer luck.'],
    ['Fractal engine', 'fractal engines', 3.1e17, 1.5e11, 'Turns cookies into even more cookies.'],
    ['Javascript console', 'javascript consoles', 7.1e19, 1.1e12, 'Bakes cookies out of keystrokes, semicolons and the occasional error.'],
    ['Idleverse', 'idleverses', 1.2e22, 8.3e12, 'Spins up spare universes that bake while nobody is watching.'],
    ['Cortex baker', 'cortex bakers', 1.9e24, 6.4e13, 'A giant brain that thinks cookies into existence.'],
    ['You', 'you', 5.4e26, 5.1e14, 'Creates cookies the way only you can. Slightly more of you, slightly more cookies.']
  ];
  const NB = B.length;
  const cap = t => t[0].toUpperCase() + t.slice(1);

  const TIERS = [
    null,
    [['Sturdier rolling pins', 'Forged from a retired anvil. Grandma insists it is for the dough.'], ['Orthopedic slippers', 'Maximum shuffle, minimum ouch.'], ['Industrial dentures', 'Now chewing through stale biscuits at 400 bites a minute.'], ['Prune smoothies', 'Keeps everything moving. Everything.'], ['Bifocal lasers', 'She can spot a burnt edge from across the county.']],
    [['Cheap hoes', 'Rake in the profits.'], ['Chocolate fertilizer', 'It smells sweet, which is somehow worse.'], ['Cookie orchards', 'Rows and rows of crunchy, low-hanging fruit.'], ['Pre-sweetened wheat', 'Sugared at the cellular level.'], ['Gingerbread scarecrows', 'The crows are not scared, but they are very well fed.']],
    [['Sugar gas', 'A pink gas found deep underground. Smells like candy floss and danger.'], ['Megadrill', 'Drills twice as deep, complains twice as loud.'], ['Ultradrill', 'We stopped calling it a drill. The drill union objected.'], ['Fudge-proof helmets', 'Safety first, chocolate a close second.'], ['Core forge', 'It turns out the centre of the planet is mostly nougat.']],
    [['Sturdier conveyor belts', 'You are going places.'], ['Robot assistants', 'Beep boop. Please stop asking them to dance.'], ['Overtime whistles', 'Toot toot, nobody goes home.'], ['Radium ovens', 'Gives your cookies a healthy glow.'], ['Recombobulators', 'Puts things back together the way they never were.']],
    [['Taller tellers', 'Can finally reach the top shelf of the vault.'], ['Snap-proof credit cards', 'For truly tough financial decisions.'], ['Acid-proof vaults', 'Because the last ones dissolved. Do not ask.'], ['Chocolate coins', 'Legal tender, delicious tender.'], ['Exponential interest', 'The maths is sound. The economists are not.']],
    [['Golden idols', 'Lures greedier adventurers into fetching your cookies.'], ['Offerings of milk', 'The gods prefer it at room temperature.'], ['Delicious blessing', 'Praise the crumb.'], ['Sun festival', 'Cookies baked on the hottest stone at noon.'], ['Enlarged pantheon', 'More gods, more appetites.']],
    [['Pointier hats', 'Tests show a 42% increase in pointiness-related magic.'], ['Beardlier beards', 'Every single strand is a spell component.'], ['Ancient grimoires', 'Contains a spell for a perfectly crisp edge.'], ['Kitchen curses', 'The oven now preheats itself out of spite.'], ['School of sorcery', 'All exams are graded on crunchiness.']],
    [['Vanilla nebulae', 'Gives your rockets a lovely smell.'], ['Wormholes', 'A shortcut through space. Mind the crumbs.'], ['Frequent flyer miles', 'Redeemable for more cookies, naturally.'], ['Warp drive', 'Warp factor oatmeal.'], ['Chocolate monoliths', 'Mysterious slabs that hum lullabies to the cargo.']],
    [['Antimony', 'Lots of things are made of antimony. Whatever that is.'], ['Essence of dough', 'Distilled from a thousand kneadings.'], ['True chocolate', 'The pure source of all chocolate, before it got watered down.'], ['Ambrosia', 'Tastes like every dessert at once. Unsettling.'], ['Aqua biscuitae', 'Holy cookie water. Do not dunk.']],
    [['Ancient tablet', 'A slab covered in recipes for things that do not exist yet.'], ['Oat-whispering workers', 'They will not stop talking about the oats.'], ['Soul bond', 'Signed in milk, binding for eternity.'], ['Sanity dance', 'Keeps the portal stable with a little two-step.'], ['Brane transplant', 'The cookies over there are just slightly more cookie.']],
    [['Chrono-whisks', 'Whisks yesterday into tomorrow.'], ['Paradox resolver', 'No more stealing cookies from your own grandfather.'], ['Quantum conundrum', 'Everywhere and nowhere at once. Mostly in the jar.'], ['Causality enforcer', 'What happened, happened. Especially the snacking.'], ['Yestermorrow comparators', 'Compares tomorrow to yesterday. Both taste great.']],
    [['Sugar bosons', 'Gives mass to cookies. Specifically, to your waistline.'], ['String theory', 'The cookies are vibrating in eleven dimensions.'], ['Large macaron collider', 'Smashing pastries at near light speed, for science.'], ['Big bang bake', 'In the beginning, there was the oven.'], ['Reverse cyclotrons', 'Unspins your particles, respins your cookies.']],
    [['Gem polish', 'Squeaky-clean photons only.'], ['Ninth colour', 'Somewhere past violet. It smells like vanilla.'], ['Chocolate light', 'Bask in its warm, crumbly glow.'], ['Grainbow', 'A rainbow made entirely of oats.'], ['Pure cosmic light', 'Shipped straight from the edge of the observable pantry.']],
    [['Your lucky cookie', 'Do not eat it. Seriously.'], ['Edge-landing coin', 'Lands on its edge every single time.'], ['Winning lottery ticket', 'What lottery? Who cares, it won.'], ['Four-leaf clover field', 'Mowed only on Friday the thirteenth.'], ['Horseshoe bakeware', 'Everything comes out lucky, and slightly horseshoe-shaped.']],
    [['Metabakeries', 'Bakeries that bake bakeries.'], ['Mandelbrown sugar', 'Sweet at every single scale.'], ['Fractoids', 'Tiny cookies made of tinier cookies.'], ['Nested universe theory', 'It is cookies all the way down.'], ['Sponge cake geometry', 'Infinite surface area, no volume, perfectly moist.']],
    [['The JavaScript console for dummies', 'Step one: open it. Step two: bake.'], ['64bit arrays', 'Twice the bits, twice the crumbs.'], ['Stack overflow', 'The cookies keep coming and nobody knows why.'], ['Enterprise compiler', 'Takes nine meetings to bake one cookie.'], ['Syntactic sugar', 'Literally.']],
    [['Manifold bakeries', 'Every bakery sits on a slightly different bake.'], ['Infinite dough', 'Never runs out, never rises.'], ['Pocket universes', 'Small enough to fit in a cookie jar.'], ['Reality sandwiches', 'Two universes with a cookie in the middle.'], ['Idle gods', 'They only wake up for snacks.']],
    [['Principled neural shortcuts', 'The brain skips the boring parts of baking.'], ['Obey', 'The cookies do as they are told.'], ['A sound mind', 'Rests well, bakes better.'], ['Cookie dreams', 'Fall asleep, wake up to a pantry full.'], ['Neural nets of dough', 'Learns what a cookie is. Mostly right.']],
    [['Cloning vats', 'One more of you, one more oven.'], ['Mirror dimension', 'Where you are the cookie.'], ['Work-life balance', 'Spend it all on baking.'], ['Soul bargain', 'Read the fine print. Then bake.'], ['Better you', 'The same, but fresher out of the oven.']]
  ];
  const TIERX = ['Aging agents|Xtreme walkers|The Unbridling|Reverse dementia|Timeproof hair dyes', 'Rain dances|Crop rotation 3000|Seed vaults|Mutant wheat|Cookie genome project', 'Dynamite sticks|Core samples|Laser picks|Deepest veins|Cookie magma', 'Night shifts|Quality control bots|Assembly singularity|Self-oiling gears|Perpetual motion belts', 'Gold-plated vaults|Interest on interest|Offshore ovens|Cookie derivatives|Compound crumbs', 'Choir of crumbs|Pilgrimage routes|Sacred sprinkles|Oven oracles|Divine leavening', 'Mana ovens|Runic whisks|Arcane pastry|Spellbound sugar|Grand baking archmagi', 'Faster-than-light freight|Cookie tankers|Interstellar express|Hyperlane depots|Galactic loading docks', 'Philosopher\'s flour|Distilled butter|Elixir of dough|Transmuted sprinkles|Flask of eternal bake', 'Wider doorways|Stable rifts|Cookie customs|Dimensional bakeries|Rift sweeteners', 'Pocket watches|Rewound recipes|Temporal ovens|Cookie loops|Eternal Tuesdays', 'Magnetic bottles|Positron cream|Annihilation frosting|Zero-point jam|Vacuum sprinkles', 'Rainbow glazes|Polarized sugar|Lens polishing|Spectral sprinkles|Photon icing', 'Lucky socks|Rabbit\'s feet|Perfect shuffle|Fortune ovens|Probability sprinkles', 'Self-replicating dough|Zoom-in zoom-out|Infinite icing|Recursive ovens|Mandelcrumb sets', 'Semicolon sprinkles|Async oven|Promise cookies|Callback hell bakery|Garbage-collected crumbs', 'Spare timelines|Sleepy galaxies|Pocket multiverse|Idle gods\' blessing|Cosmic naps', 'Neural icing|Synapse whisks|Dream recipes|Lucid baking|Galaxy brain batter', 'Mirror practice|Inner baker|Perfect posture|Cookie meditation|Peak you'];
  const TIERF = ['Twice the output, as usual.', 'A bigger bonus for a bigger bakery.', 'Experts agree this is probably fine.', 'The accountants are afraid to look.', 'Production is now officially suspicious.'];
  TIERX.forEach((l, k) => l.split('|').forEach((n, j) => TIERS[k + 1].push([n, TIERF[j]])));
  const GTYPES = [
    ['Farmer grandmas', 'She talks to the plants. They listen.'], ['Miner grandmas', 'Hard hats, soft cookies.'], ['Worker grandmas', 'Unionised and unstoppable.'],
    ['Banker grandmas', 'Lends cookies at 300% interest, with a pinch on the cheek.'], ['Priestess grandmas', 'Blessed are the bakers.'], ['Witch grandmas', 'Her broom doubles as a whisk.'],
    ['Cosmic grandmas', 'In space, nobody can hear you knit.'], ['Gilded grandmas', 'Solid gold, still complaining about the weather.'], ['Otherworldly grandmas', 'Knits with yarn from the fourth dimension.'],
    ['Time-travelling grandmas', 'Came back from the future to tell you to wear a sweater.'], ['Quantum grandmas', 'Both baking and napping until observed.'], ['Prismatic grandmas', 'Glows softly while humming old songs.'],
    ['Lucky grandmas', 'Has never once lost at bingo.'], ['Fractal grandmas', 'Each one contains a smaller, crankier grandma.'],
    ['Binary grandmas', 'Knits in ones and zeroes. Mostly ones.'], ['Alternate grandmas', 'From a universe where cookies came first.'], ['Brainy grandmas', 'Remembers every recipe. And every grudge.'], ['Grandmas of you', 'Reminds you to call. Reminds you often.']
  ];
  const DOUGH = ['#f6d18f', '#dd9e52', '#b06a2c', '#6a3713'];
  const COOKIES = [
    ['Plain cookies', 999999, 1, DOUGH, '#4a2a14', 'Humble, honest and slightly crunchy.'],
    ['Sugar cookies', 5e6, 1, ['#fbe6b8', '#f0c97c', '#cf9a4c', '#8a5a26'], '#f4f4ff', 'Sparkly enough to be seen from orbit.'],
    ['Oatmeal raisin cookies', 1e7, 1, ['#e8c890', '#c99a5a', '#94632e', '#5e3a16'], '#4a1f2a', 'Raisins: the plot twist nobody asked for.'],
    ['Peanut butter cookies', 5e7, 1, ['#eebc72', '#d4954a', '#a36a2a', '#6a3e14'], '#8a5226', 'Sticks to the roof of your mouth and your heart.'],
    ['Coconut cookies', 1e8, 2, ['#fbf3e2', '#eadbbd', '#c9b08a', '#8a7452'], '#ffffff', 'Tropical, flaky and a little smug.'],
    ['White chocolate cookies', 5e8, 2, DOUGH, '#fff6e2', 'Technically not chocolate. Technically delicious.'],
    ['Macadamia nut cookies', 1e9, 2, DOUGH, '#f0dca8', 'Fancy nuts for fancy people.'],
    ['Double-chip cookies', 5e9, 2, DOUGH, '#2e170a', 'Twice the chips, half the self-control.'],
    ['White chocolate macadamia nut cookies', 1e10, 2, DOUGH, '#fffaf0', 'The name is long because the flavour is longer.'],
    ['All-chocolate cookies', 5e10, 2, ['#9a5a34', '#7a4024', '#552a14', '#331808'], '#2a1408', 'Chocolate on chocolate, with a side of chocolate.'],
    ['Dark chocolate-coated cookies', 1e11, 4, ['#5a3420', '#3e2212', '#2a160a', '#160a04'], '#24120a', 'Dipped in the darkest chocolate known to bakers.'],
    ['White chocolate-coated cookies', 1e11, 4, ['#fffaf0', '#f2e6cc', '#d8c6a2', '#9c8a66'], '#e6d4ae', 'Wrapped in a pristine, snowy shell.'],
    ['Eclipse cookies', 5e11, 2, ['#c98a4c', '#7a4a26', '#3a200e', '#1a0c04'], '#f2d9a8', 'Half light, half dark, fully crunchy.'],
    ['Zebra cookies', 1e12, 2, ['#f4ead6', '#8a6a52', '#2a1a10', '#140a04'], '#1a0e06', 'The stripes make them faster. Into your mouth.'],
    ['Snickerdoodles', 5e12, 2, ['#f2cf96', '#d9a066', '#a8703a', '#6a4220'], '#9a4a22', 'Say it three times fast for a free cookie.'],
    ['Stroopwafels', 1e13, 2, ['#e6aa5a', '#c98a40', '#94602a', '#5e3a16'], '#7a4416', 'Best warmed on top of a steaming cup of cocoa.'],
    ['Macaroons', 5e13, 2, ['#fffbf2', '#efe2c6', '#d4be96', '#9a8460'], '#c9a46a', 'Coconut mountains with a toasted summit.'],
    ['Empire biscuits', 1e14, 2, ['#ffd9e2', '#f4a9bc', '#d07890', '#8a4456'], '#d1263c', 'A jam-filled reign of sweetness.'],
    ['Madeleines', 5e14, 2, ['#f8d888', '#e8b45a', '#c08432', '#7a5016'], '#e8b45a', 'Remembrances of things baked.'],
    ['Shortbread biscuits', 1e15, 2, ['#fbe8b4', '#f0d08a', '#cfa860', '#8a6a34'], '#e2c27a', 'Not short, not bread, absolutely biscuit.'],
    ['Gingerbread men', 5e15, 2, ['#c9844a', '#a8622e', '#7a4218', '#4a240a'], '#ffffff', 'Run, run, as fast as you can.'],
    ['Fortune cookies', 1e16, 2, ['#fbe0a0', '#efbf6a', '#cf9640', '#8a5e1e'], '#fffef6', 'Your future holds more cookies.'],
    ['Florentines', 5e16, 2, ['#f2c46a', '#d89a3a', '#a8681c', '#6a3e0a'], '#4a2410', 'Lacy, nutty and terribly sophisticated.'],
    ['Butter biscuits', 1e17, 2, ['#fff0bc', '#f8da8a', '#dcb25a', '#9a7a30'], '#f8da8a', 'Ninety percent butter, ten percent biscuit, all joy.'],
    ['Palmiers', 5e17, 2, ['#f6d08a', '#e0a85a', '#b8772f', '#6e4418'], '#fff0c0', 'Heart-shaped puff pastry. Sparks joy, flakes everywhere.'],
    ['Palets', 1e18, 2, ['#e6b774', '#c78a46', '#945a24', '#5a3210'], '#6a3a1a', 'Plain, round and surprisingly French.'],
    ['Sables', 5e18, 2, ['#f8e2a8', '#ecc772', '#c99a45', '#8a6224'], '#f6dc92', 'Sandy, buttery and gone in one bite.'],
    ['Caramoas', 1e19, 3, ['#d29a52', '#b06f2a', '#7a4818', '#40220a'], '#f6f0e4', 'Caramel, coconut and chocolate stripes. Do not share.'],
    ['Sagalongs', 5e19, 3, ['#f2c88a', '#d8a05a', '#a86e30', '#6a3e14'], '#fbf2dc', 'Peanut butter on shortbread. Join the trail.'],
    ['Shortfoils', 1e20, 3, ['#f0c488', '#d49a54', '#a46a2a', '#62380e'], '#4a2a14', 'Mint-chocolate crisp with a hint of wrapper.'],
    ['Win mints', 5e20, 3, ['#d8f0d8', '#a8d8b0', '#74aa84', '#3a6a4a'], '#ffffff', 'Minty fresh and slightly smug.'],
    ['Gingerbread trees', 1e21, 3, ['#c4793e', '#a05a28', '#74401a', '#44240a'], '#2f8a3c', 'A whole forest, baked on one sheet.']
  ];
  const MICE = [
    ['Plastic mouse', 5e4, 1e3, '#ecedf2', 'Squeaks a little when clicked.'],
    ['Iron mouse', 5e6, 1e5, '#8d939b', 'Heavy enough to anchor a small boat.'],
    ['Titanium mouse', 5e8, 1e7, '#bcd0e2', 'Light, strong and smells of spaceships.'],
    ['Adamantium mouse', 5e10, 1e9, '#4f5a68', 'Unscratchable, unstoppable, unplugged.'],
    ['Unobtainium mouse', 5e12, 1e11, '#a87be0', 'You obtained it anyway.'],
    ['Mythril mouse', 5e14, 1e13, '#6fd6e6', 'Forged in the fires of a very serious desk setup.'],
    ['Wishmetal mouse', 5e16, 1e15, '#f6b6d8', 'Cast from the leftovers of shooting stars.'],
    ['Fantasteel mouse', 5e18, 1e17, '#a0e2d0', 'Strong enough that even the legends stopped arguing.'],
    ['Nevercrack mouse', 5e20, 1e19, '#ffd9a0', 'Guaranteed never to crack, bend or sing.'],
    ['Armythril mouse', 5e22, 1e21, '#9aa6d8', 'Click with the weight of an entire regiment.'],
    ['Technobsidian mouse', 5e24, 1e23, '#6a5a8a', 'Wires, glass and a faint sense of dread.'],
    ['Plasmarble mouse', 5e26, 1e25, '#f2c4f2', 'Cold to the touch and hot to the click.']
  ];
  const KITTENS = [
    ['Kitten helpers', 9e6, 0.5, 0.1, 'They will help, in exchange for a saucer of milk.'],
    ['Kitten workers', 9e9, 1, 0.125, 'Clocks in, then immediately naps on the keyboard.'],
    ['Kitten engineers', 9e13, 2, 0.15, 'Built a laser pointer into every machine.'],
    ['Kitten overseers', 9e16, 3, 0.175, 'Watching you. Judging you. Improving output.'],
    ['Kitten managers', 9e20, 4, 0.2, 'Has a corner office with a permanent sunbeam.'],
    ['Kitten accountants', 9e23, 5, 0.2, 'Counts every whisker. Bills you for it.'],
    ['Kitten specialists', 9e26, 6, 0.2, 'Certified in cuddling and quantum napping.'],
    ['Kitten experts', 9e29, 7, 0.2, 'Knows exactly which sunbeam is the best.'],
    ['Kitten consultants', 9e32, 8, 0.2, 'Charges by the purr.'],
    ['Kitten assistants to the regional manager', 9e35, 9, 0.175, 'Mostly sits on the paperwork.']
  ];
  const GOLDUPS = [
    ['Lucky day', 777777777, 7, 'f', 'Golden cookies appear <b>twice as often</b> and stay <b>twice as long</b>.', 'Today the toast lands butter side up.'],
    ['Serendipity', 77777777777, 27, 'f', 'Golden cookies appear <b>twice as often</b> and stay <b>twice as long</b>.', 'Happy accidents, served warm.'],
    ['Get lucky', 77777777777777, 77, 'd', 'Golden cookie effects last <b>twice as long</b>.', 'Luck is just a well-timed snack.']
  ];
  const HEAV0 = [
    ['tg', 'Pearly oven doors', 1, 'While you are away, your bakery keeps producing at <b>50%</b> of its CpS instead of 10%.', 'The oven never truly closes.'],
    ['hc', 'Heavenly cookies', 3, 'Cookie production multiplier <b>+10%</b>, permanently.', 'Baked on a cloud at very high altitude.'],
    ['sk', 'Starter kit', 50, 'You start every run with <b>10 free cursors</b>.', 'A fresh pair of hands. Ten, actually.'],
    ['hl', 'Heavenly luck', 77, 'Golden cookies appear <b>5%</b> more often.', 'A blessing on every crumb.'],
    ['cc', 'Celestial coupon', 99, 'All buildings are <b>1%</b> cheaper.', 'Valid in this world and the next.'],
    ['lf', 'Lasting fortune', 777, 'Golden cookie effects last <b>10%</b> longer.', 'Good things come to those who bake.'],
    ['sc', 'Starter kitchen', 5000, 'You start every run with <b>5 free grandmas</b>.', 'They brought their own aprons.'],
    ['ka', 'Kitten angels', 9, 'Kitten upgrades are <b>10%</b> more effective.', 'They have halos. And claws.'],
    ['cd', 'Classic dairy selection', 100, 'Unlocks the <b>milk selector</b> in the options menu, with 25 flavours.', 'Every flavour, one jug.'],
    ['fd', 'Fanciful dairy selection', 2500, 'Unlocks <b>9 more milk flavours</b> in the milk selector.', 'The kind of milk that sparkles.'],
    ['sg', 'Sacrilegious corruption', 15000, 'Wrinklers give back <b>5%</b> more cookies when popped.', 'It bites back, in your favour.'],
    ['dd', 'Decisive fate', 7777, 'Golden cookies stay <b>5%</b> longer.', 'Choose the cookie that chooses you.'],
    ['dc', 'Divine discount', 99999, 'All buildings are <b>1%</b> cheaper.', 'A coupon signed by an angel.'],
    ['dp', 'Divine bakeries', 399999, 'All upgrades are <b>5%</b> cheaper.', 'The prices went to heaven too.'],
    ['sb', 'Sugar baking', 400, 'Each unspent sugar lump (up to 100) gives <b>+1% CpS</b>.', 'Hoard them, they are doing something.']
  ];
  const HPOS = { tg: [50, 90, null], hc: [50, 76, 'tg'], ka: [28, 76, 'hc'], cd: [18, 62, 'ka'], fd: [8, 47, 'cd'], sk: [72, 76, 'hc'], sc: [84, 62, 'sk'], sg: [92, 47, 'sc'], hl: [60, 62, 'hc'], lf: [68, 47, 'hl'], dd: [76, 32, 'lf'], cc: [40, 62, 'hc'], dc: [40, 47, 'cc'], dp: [40, 32, 'dc'], sb: [52, 47, 'hc'] };
  const HEAV = HEAV0.map(h => h.concat([HPOS[h[0]]]));
  const HMAP = Object.fromEntries(HEAV.map(h => [h[0], h]));

  const UP = [];
  const addU = o => UP.push(o);
  const CUR_TXT = [['Reinforced index finger', 'Poke. Poke. Poke.'], ['Carpal tunnel prevention cream', 'Smells faintly of menthol and regret.'], ['Ambidextrous', 'Look, no ha... wait, both hands!']];
  CFG.CURSOR_UPS.forEach(([price, need], k) => addU({ id: 'c' + k, name: CUR_TXT[k][0], flav: CUR_TXT[k][1], price, kind: 'cur', icon: ['cur', k], desc: 'The mouse and cursors are <b>twice</b> as efficient.', unlock: s => s.b[0] >= need }));
  const FING_TXT = [['Thousand fingers', 'Clickety-clack.'], ['Million fingers', 'Clickety-clickety-clack.'], ['Billion fingers', 'The sound alone is a public nuisance.'], ['Trillion fingers', 'Fingers now have fingers.'], ['Quadrillion fingers', 'There is no hand big enough. Yet.'], ['Quintillion fingers', 'Hand-made has never meant so much.'], ['Sextillion fingers', 'One for every crumb in the universe.'], ['Septillion fingers', 'The mouse is starting to feel left out.'], ['Octillion fingers', 'Your keyboard filed a complaint.'], ['Nonillion fingers', 'Technically, all fingers everywhere.']];
  CFG.FINGERS.forEach(([price, need, pow], k) => addU({ id: 'f' + k, name: FING_TXT[k][0], flav: FING_TXT[k][1], price, pow, kind: 'fing', icon: ['fing', k], desc: pow ? `Multiplies the gain from Thousand fingers by <b>${pow}</b>.` : 'The mouse and cursors gain <b>+0.1</b> cookies for each non-cursor object owned.', unlock: s => s.b[0] >= need }));
  for (let b = 1; b < NB; b++) for (let t = 0; t < 10; t++) addU({ id: `t${b}_${t}`, name: TIERS[b][t][0], flav: TIERS[b][t][1], price: B[b][2] * CFG.TIER_PRICE[t], kind: 'tier', b, icon: ['tier', b, t], desc: `${cap(B[b][1])} are <b>twice</b> as efficient.`, unlock: s => s.b[b] >= CFG.TIER_UNLOCK[t] });
  for (let b = 2; b < NB; b++) addU({ id: 'g' + b, name: GTYPES[b - 2][0], flav: GTYPES[b - 2][1], price: B[b][2] * CFG.GRANDMA_TYPE_PRICE, kind: 'gt', b, icon: ['gt', b], desc: `Grandmas are <b>twice</b> as efficient. ${cap(B[b][1])} gain <b>+1% CpS</b> per ${b === 2 ? 'grandma' : (b - 1) + ' grandmas'}.`, unlock: s => s.b[b] >= CFG.GRANDMA_TYPE_NEED && s.b[1] >= 1 });
  COOKIES.forEach(([name, price, pow, , , flav], k) => addU({ id: 'k' + k, name, flav, price, pow, kind: 'ck', tag: 'Cookie', icon: ['ck', k], desc: `Cookie production multiplier <b>+${pow}%</b>.`, unlock: s => s.earned >= price / CFG.COOKIE_UNLOCK_DIV }));
  MICE.forEach(([name, price, need, , flav], k) => addU({ id: 'm' + k, name, flav, price, kind: 'mouse', icon: ['mouse', k], desc: 'Clicking gains <b>+1% of your CpS</b>.', unlock: s => s.handmade >= need }));
  KITTENS.forEach(([name, price, milk, pow, flav], k) => addU({ id: 'n' + k, name, flav, price, pow, kind: 'kit', icon: ['kit', k], desc: 'You gain <b>more CpS</b> the more milk you have.', unlock: (s, A) => A.size * CFG.MILK_PER_ACH >= milk }));
  GOLDUPS.forEach(([name, price, need, pow, desc, flav], k) => addU({ id: 'l' + k, name, flav, price, pow, kind: 'gold', icon: ['gold', k], desc, unlock: s => s.gc >= need }));
  let PLEDGES = 0;
  const GPU = [
    ['r0', 'Bingo center/Research facility', 1e12, 'Grandmas are <b>4 times</b> as efficient.', 'Where grandmas go to learn how to be unstoppable.', 0],
    ['r1', 'One mind', 5e12, 'Each grandma gains <b>+0.02 base CpS</b> per grandma. <b>Warning :</b> the grandmas are waking up. Wrinklers will start to appear.', 'We are all one. We are grandma.', 0.02],
    ['r2', 'Communal brainsweep', 2.5e13, 'Each grandma gains <b>+0.03 base CpS</b> per grandma. Wrinklers appear faster.', 'Burns the hair right off your head.', 0.03],
    ['r3', 'Elder Pact', 1.25e14, 'Each grandma gains <b>+0.05 base CpS</b> per grandma. Wrinklers swarm in.', 'Signed in cookie dough.', 0.05]
  ];
  GPU.forEach(([id, name, price, desc, flav, add], k) => addU({ id, name, flav, price, kind: 'gp', add, stage: k, icon: ['tier', 1, 5 + k], desc, unlock: (s, A, U) => k ? U.has('r' + (k - 1)) : [...U].filter(x => UPMAP[x] && UPMAP[x].kind === 'gt').length >= 7 }));
  addU({ id: 'ep', name: 'Elder Pledge', flav: 'Gives the grandmas something soft to nap on.', get price() { return Math.pow(8, Math.min(PLEDGES + 2, 14)); }, kind: 'pledge', icon: ['gt', 1], desc: 'Puts the grandmas to sleep for <b>30 minutes</b> and pops every wrinkler.', unlock: (s, A, U) => U.has('r1') });
  const UPMAP = Object.fromEntries(UP.map(u => [u.id, u]));

  const LONG = ['', ' million', ' billion', ' trillion', ' quadrillion', ' quintillion', ' sextillion', ' septillion', ' octillion', ' nonillion', ' decillion', ' undecillion', ' duodecillion', ' tredecillion', ' quattuordecillion', ' quindecillion'];
  const SHORT = ['', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid'];
  const comma = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  function beautify(v, floats, short) {
    v = +v || 0;
    if (!isFinite(v)) return 'Infinity';
    if (v < 0) return '-' + beautify(-v, floats, short);
    if (v >= 1e6) {
      let i = Math.floor(Math.log10(v) / 3), n = Math.round(v / Math.pow(10, i * 3) * 1000) / 1000;
      if (n >= 1000) { i++; n = Math.round(v / Math.pow(10, i * 3) * 1000) / 1000; }
      const names = short ? SHORT : LONG;
      if (i - 1 >= names.length) return v.toExponential(3).replace('e+', 'e');
      return n + names[i - 1];
    }
    if (floats && v < 1000) {
      const f = Math.round(v * 10) / 10;
      if (f % 1) return comma(Math.floor(f)) + '.' + Math.round((f % 1) * 10);
      return comma(f);
    }
    return comma(Math.floor(v));
  }

  const ACH = [];
  const aa = (name, desc, icon, test) => ACH.push({ id: 'a' + ACH.length, name, desc, icon, test });
  [[1, 'Wake and bake'], [1e3, 'Making some dough'], [1e5, 'So baked right now'], [1e6, 'Fledgling bakery'], [1e8, 'World-famous bakery'], [1e9, 'Cosmic bakery'], [1e11, 'Universal bakery'], [1e12, 'Timeless bakery'], [1e14, 'Immortal bakery'], [1e15, 'Don\'t stop me now'], [1e17, 'You can stop now'], [1e18, 'Cookies all the way down'], [1e20, 'Overdose'], [1e21, 'How?']]
    .forEach(([v, n], k) => aa(n, `Bake <b>${beautify(v)}</b> cookie${v === 1 ? '' : 's'} in total.`, ['ckA', k], s => s.allTime >= v));
  [[1, 'Casual baking'], [10, 'Hardcore baking'], [100, 'Steady tasty stream'], [1e3, 'Cookie monster'], [1e4, 'Mass producer'], [1e5, 'Cookie vortex'], [1e6, 'Cookie pulsar'], [1e7, 'Cookie quasar'], [1e8, 'Oh hey, you\'re still here'], [1e9, 'Let\'s never bake again'], [1e10, 'A world filled with cookies'], [1e11, 'Ludicrous bake speed']]
    .forEach(([v, n], k) => aa(n, `Bake <b>${beautify(v)}</b> cookie${v === 1 ? '' : 's'} per second.`, ['cps', k], (s, C) => C.cps >= v));
  aa('First poke', 'Click the big cookie once.', ['hand', 0], s => s.clicksAll >= 1);
  [[1e3, 'Clicktastic'], [1e5, 'Clickathlon'], [1e7, 'Clickolympics'], [1e9, 'Clickorama'], [1e11, 'Clickasmic'], [1e13, 'Clickageddon']]
    .forEach(([v, n], k) => aa(n, `Make <b>${beautify(v)}</b> cookies from clicking.`, ['hand', k + 1], s => s.handAll >= v));
  const BACH = [['Click', 'Mouse wheel', 'Of Mice and Men'], ['Grandma\'s cookies', 'Sloppy kisses', 'Retirement home'], ['My first farm', 'Reap what you sow', 'Farm ill'], ['You know the drill', 'Excavation', 'Hollow the planet'], ['Production chain', 'Industrial revolution', 'Global warming'], ['Pretty penny', 'Fit the bill', 'A loan in the dark'], ['Your time to shine', 'Shady sect', 'New-age cult'], ['Bewitched', 'The sorcerer\'s apprentice', 'Charms and enchantments'], ['Rocket man', 'Greener on the other side', 'Out of this world'], ['Transmutation', 'Transmogrification', 'Gold member'], ['A whole new world', 'Now you\'re thinking', 'Dimensional shift'], ['Time warp', 'Alternate timeline', 'Rewriting history'], ['Antibatter', 'Quirky quarks', 'It does matter!'], ['Lone photon', 'Dazzling glimmer', 'Blinding flash'], ['Lucked out', 'What are the odds', 'Grandma needs a new pair of shoes'], ['Self-contained', 'Threw you for a loop', 'The sum of its parts']];
  BACH.forEach((names, i) => [1, 50, 100].forEach((n, k) => aa(names[k], `Have <b>${n}</b> ${n === 1 ? B[i][0].toLowerCase() : B[i][1]}.`, ['bld', i, k], s => s.b[i] >= n)));
  aa('Balanced diet', 'Have at least <b>1</b> of every building.', ['bld', 1, 0], s => s.b.every(v => v >= 1));
  aa('Well-rounded', 'Have at least <b>25</b> of every building.', ['bld', 4, 1], s => s.b.every(v => v >= 25));
  aa('Collector\'s edition', 'Have at least <b>50</b> of every building.', ['bld', 15, 2], s => s.b.every(v => v >= 50));
  [[100, 'Real estate'], [500, 'Urban sprawl'], [1000, 'Megalopolis']].forEach(([n, name], k) => aa(name, `Own <b>${n}</b> buildings.`, ['bld', 5, k], s => s.b.reduce((a, v) => a + v, 0) >= n));
  [[1, 'Fortune smiles'], [7, 'Gilded touch'], [27, 'Midas of crumbs'], [77, 'Golden age']].forEach(([n, name], k) => aa(name, `Click <b>${n}</b> golden cookie${n === 1 ? '' : 's'}.`, ['gold', k % 3], s => s.gc >= n));
  [[20, 'Shopping spree'], [50, 'Enhancer'], [100, 'Augmented']].forEach(([n, name], k) => aa(name, `Purchase <b>${n}</b> upgrades.`, ['cur', k], (s, C, A, U) => U.size >= n));
  aa('Change of heart', 'Sell a grandma. How could you?', ['bld', 1, 0], s => s.sold > 0);
  aa('Breaking news', 'Click on the news ticker <b>50</b> times.', ['news', 0], s => s.news >= 50);
  aa('Name dropper', 'Give your bakery a new name.', ['news', 1], s => s.named > 0);
  aa('Hands off', 'Bake <b>1 million</b> cookies in one run while clicking the big cookie no more than <b>15</b> times.', ['hand', 6], s => s.earned >= 1e6 && s.clicks <= 15);
  aa('Frenzied fingers', 'Trigger a click frenzy.', ['gold', 2], s => s.cfCount > 0);
  aa('Milk mustache', 'Unlock <b>25</b> achievements and fill a whole glass of milk.', ['milk', 0], (s, C, A) => A.size >= 25);
  aa('Got milk?', 'Unlock <b>50</b> achievements.', ['milk', 1], (s, C, A) => A.size >= 50);
  aa('Born again', 'Ascend for the first time.', ['heav', 0], s => s.ascends >= 1);
  aa('Serial reincarnator', 'Ascend <b>5</b> times.', ['heav', 1], s => s.ascends >= 5);
  aa('Hoarder', 'Have <b>1 billion</b> cookies in the bank at once.', ['ckA', 5], s => s.cookies >= 1e9);
  [['Hello world', 'Alt-tab', 'Stack overflow'], ['Multiverse mess', 'Universe of cookies', 'Forever idle'], ['Brainwave', 'Mind over matter', 'Brain trust'], ['Mirror, mirror', 'Clone army', 'Identity crisis']]
    .forEach((names, j) => [1, 50, 100].forEach((n, k) => aa(names[k], `Have <b>${n}</b> ${n === 1 ? B[16 + j][0].toLowerCase() : B[16 + j][1]}.`, ['bld', 16 + j, k], s => s.b[16 + j] >= n)));
  const ADJ6 = ['Sizable', 'Bustling', 'Teeming', 'Legendary', 'Mythic', 'Eternal'];
  [150, 200, 250, 300, 350, 400].forEach((n, k) => B.forEach((b, i) => aa(`${ADJ6[k]} ${b[1]}`, `Have <b>${n}</b> ${b[1]}.`, ['bld', i, 2], s => s.b[i] >= n)));
  [[1e24, 'Septillion'], [1e27, 'Octillion'], [1e30, 'Nonillion'], [1e33, 'Decillion'], [1e36, 'Undecillion']].forEach(([v, n], k) => aa(`${n} crumbs`, `Bake <b>${beautify(v)}</b> cookies in total.`, ['ckA', 10 + k], s => s.allTime >= v));
  [[1e12, 'Cookie nebula'], [1e13, 'Cookie quasar II'], [1e14, 'Cookie singularity'], [1e15, 'Sugar supernova'], [1e16, 'Dough deluge']].forEach(([v, n], k) => aa(n, `Bake <b>${beautify(v)}</b> cookies per second.`, ['cps', 12 + k], (s, C) => C.cps >= v));
  [[1e15, 'Clickpocalypse'], [1e17, 'Clickuniverse']].forEach(([v, n], k) => aa(n, `Make <b>${beautify(v)}</b> cookies from clicking.`, ['hand', 7 + k], s => s.handAll >= v));
  [[100, 'Click, then click again'], [500, 'A thousand pokes'], [2000, 'Clicking is my cardio'], [10000, 'Carpal tunnel club']].forEach(([n, name], k) => aa(name, `Click the big cookie <b>${comma(n)}</b> times.`, ['hand', k], s => s.clicksAll >= n));
  [[150, 'Golden rush'], [365, 'Year of gold'], [777, 'Lucky sevens'], [1000, 'Gold digger']].forEach(([n, name], k) => aa(name, `Click <b>${n}</b> golden cookies.`, ['gold', k % 3], s => s.gc >= n));
  [[150, 'Upgrade addict'], [250, 'Upgrade maniac'], [350, 'Upgrade completionist']].forEach(([n, name], k) => aa(name, `Purchase <b>${n}</b> upgrades.`, ['cur', 3 + k], (s, C, A, U) => U.size >= n));
  [[2000, 'Housing bubble'], [3000, 'Sprawling empire'], [5000, 'Everything is a bakery']].forEach(([n, name], k) => aa(name, `Own <b>${n}</b> buildings.`, ['bld', 6, k], s => s.b.reduce((a, v) => a + v, 0) >= n));
  aa('Bingo!', 'Buy the Bingo center/Research facility.', ['tier', 1, 5], (s, C, A, U) => U.has('r0'));
  aa('One with everything', 'Buy One mind.', ['tier', 1, 6], (s, C, A, U) => U.has('r1'));
  aa('Elder', 'Own <b>7</b> different grandma upgrades.', ['gt', 1], (s, C, A, U) => [...U].filter(x => UPMAP[x] && UPMAP[x].kind === 'gt').length >= 7);
  aa('Elder Pact', 'Sign the Elder Pact.', ['tier', 1, 8], (s, C, A, U) => U.has('r3'));
  aa('Elder calm', 'Pledge to the grandmas.', ['gt', 1], s => s.pledges >= 1);
  aa('Elder calm II', 'Pledge to the grandmas <b>5</b> times.', ['gt', 1], s => s.pledges >= 5);
  [[1, 'Itchscratcher'], [50, 'Wrinklesquisher'], [200, 'Moistburster']].forEach(([n, name], k) => aa(name, `Pop <b>${n}</b> wrinkler${n === 1 ? '' : 's'}.`, ['wrk'], s => s.pops >= n));
  [[1, 'Sweet'], [10, 'Sugar rush'], [100, 'Sugar sugar'], [1000, 'Lump hoarder']].forEach(([n, name], k) => aa(name, `Harvest <b>${comma(n)}</b> sugar lump${n === 1 ? '' : 's'} in total.`, ['lump', k % 3 ? (k % 3 === 2 ? 4 : 1) : 0], s => s.lumpTot >= n));
  [[1, 'Level up'], [10, 'Ten levels deep'], [25, 'Master of one']].forEach(([n, name], k) => aa(name, `Get a building to level <b>${n}</b>.`, ['lump', 0], s => Math.max(0, ...s.lvl) >= n));
  aa('Level headed', 'Reach a total of <b>100</b> building levels.', ['lump', 1], s => s.lvl.reduce((a, v) => a + v, 0) >= 100);
  [[2, 'Second wind'], [10, 'Ascension junkie'], [25, 'Eternal return']].forEach(([n, name], k) => aa(name, `Ascend <b>${n}</b> times.`, ['heav', k + 2], s => s.ascends >= n));
  [[10, 'Heavenly start'], [100, 'Halo hoarder'], [1000, 'Prestigious']].forEach(([n, name], k) => aa(name, `Reach prestige level <b>${comma(n)}</b>.`, ['heav', k], s => s.prestige >= n));
  [[75, 'Whole lotta milk'], [100, 'Dairy farmer'], [150, 'Cow baron'], [200, 'Milk empire'], [250, 'Lactose legend'], [300, 'The great milkening']].forEach(([n, name]) => aa(name, `Unlock <b>${n}</b> achievements.`, ['milk', 1], (s, C, A) => A.size >= n));
  [[3600e3, 'Just one more minute'], [86400e3, 'A day in the bakery'], [7 * 86400e3, 'Week of dough']].forEach(([v, name]) => aa(name, `Play for <b>${v >= 86400e3 ? v / 86400e3 + ' day' + (v > 86400e3 ? 's' : '') : '1 hour'}</b>.`, ['news', 0], s => Date.now() - s.gameStart >= v));
  const ACHMAP = Object.fromEntries(ACH.map(a => [a.id, a]));

  const has = i => s => s.b[i] > 0;
  const NEWS = [
    ['You bake a batch of cookies. They are fine. Nobody notices.', s => s.allTime < 1e3],
    ['Your neighbours sniff the air suspiciously. Something smells delicious.', s => s.allTime < 1e4],
    ['Local mom says your cookies are "fine, I guess."', s => s.allTime < 1e4],
    ['Your cookie gets passed around the office. It is still the only one.', s => s.allTime < 5e3],
    ['Rumour has it your kitchen smells unusually good today.', s => s.allTime < 5e4],
    ['People are starting to talk about your cookies. Mostly in a good way.', s => s.allTime >= 1e3 && s.allTime < 1e6],
    ['Your cookies are reviewed on a food blog with eleven loyal readers.', s => s.allTime >= 5e3 && s.allTime < 1e6],
    ['Word of your cookies spreads across town like warm butter.', s => s.allTime >= 1e4 && s.allTime < 1e7],
    ['Your cookies are now a regional delicacy, tourists confirm.', s => s.allTime >= 1e6],
    ['Cookie tourism skyrockets; hotels install complimentary milk fountains.', s => s.allTime >= 1e7],
    ['Economists baffled as cookies become the world\'s most stable currency.', s => s.allTime >= 1e9],
    ['Your bakery is now visible from space, astronomers report.', s => s.allTime >= 1e10],
    ['Global summit convened to discuss "the cookie situation". Snacks provided.', s => s.allTime >= 1e11],
    ['Cookies now outnumber people. People not complaining yet.', s => s.allTime >= 1e12],
    ['Ancient prophecy found to be mostly about you and your cookies.', s => s.allTime >= 1e14],
    ['The universe is now 4% cookie by mass, physicists announce.', s => s.allTime >= 1e16],
    ['Man eats 300 cookies, says he "feels fantastic", is clearly lying.', () => true],
    ['Study finds 9 out of 10 dogs prefer cookies. The tenth dog was a cat.', () => true],
    ['Cookie-shaped cloud spotted over the capital; crowd tries to eat it.', () => true],
    ['Area child declares cookies "better than broccoli"; experts reluctantly agree.', () => true],
    ['New fitness craze: running away from cookies. Nobody has won yet.', () => true],
    ['Milk prices soar as dunking becomes the national pastime.', () => true],
    ['Fashion week dominated by the new "crumb chic" look.', () => true],
    ['Poll: 72% of citizens would trade their car for one warm cookie.', () => true],
    ['Local cat knocks cookie off table, shows absolutely no remorse.', () => true],
    ['Chef unveils "deconstructed cookie". It is flour on a plate.', () => true],
    ['Dentists report record profits, send you a fruit basket.', s => s.allTime >= 1e5],
    ['Grandmas spotted knitting cookie-shaped mittens. "For the cookies," one explains.', has(1)],
    ['Local grandma wins marathon, credits "the dough".', has(1)],
    ['Grandmas form choir. Their only song is about cookies.', has(1)],
    ['Grandma reportedly says: "I have seen things, dear. Doughy things."', s => s.b[1] >= 25],
    ['Cookie farms accused of growing more cookies than strictly necessary.', has(2)],
    ['Scarecrow union demands cookie rations.', has(2)],
    ['Farmers report this year\'s harvest is "crunchier than ever".', has(2)],
    ['Miners strike a chocolate vein the size of a small country.', has(3)],
    ['Geologists alarmed: planet\'s crust increasingly biscuit-like.', has(3)],
    ['Factory smoke now smells of vanilla; citizens inhale deeply.', has(4)],
    ['Conveyor belt breaks speed record, cookies achieve brief flight.', has(4)],
    ['Banks now accept cookies as collateral. Cookies refuse to accept banks.', has(5)],
    ['Stock market crashes, rebounds after a short snack break.', has(5)],
    ['Temple priests chant the name of your bakery at sunrise.', has(6)],
    ['Archaeologists unearth a golden cookie idol. It is still warm.', has(6)],
    ['Wizard accidentally turns himself into a cookie, describes it as "crumbly".', has(7)],
    ['Magic school adds "Introductory Baking Hexes" to the curriculum.', has(7)],
    ['Cookie planet discovered; locals described as "extremely chewy".', has(8)],
    ['Astronauts report that space smells faintly of brown sugar.', has(8)],
    ['Gold reserves plummet as alchemists keep turning it into cookies.', has(9)],
    ['Alchemist claims to have found the elixir of life. It is a cookie.', has(9)],
    ['Portal mishap: dimension made entirely of crumbs discovered.', has(10)],
    ['Strange creatures emerge from portal, politely ask for milk.', has(10)],
    ['Historians baffled as cookies appear in very old paintings.', has(11)],
    ['Time traveller arrives, eats all the cookies, leaves yesterday.', has(11)],
    ['Antimatter cookies taste exactly like regular cookies, but backwards.', has(12)],
    ['Rainbows now come with a light cookie aftertaste.', has(13)],
    ['Man finds four-leaf clover, lucky penny and winning ticket in one cookie jar.', has(14)],
    ['Cookie found to contain a smaller cookie, which contains a smaller cookie...', has(15)],
    ['Programmer blames missing semicolon for a cookie shortage that does not exist.', has(16)],
    ['Developers insist the cookie bug is a feature. Cookies agree.', has(16)],
    ['Spare universe spotted behind the pantry; residents describe it as "cozy".', has(17)],
    ['Idle gods seen napping on a pile of cookies, do not disturb.', has(17)],
    ['Giant brain wins baking contest, thanks judges for "thinking so highly".', has(18)],
    ['Neuroscientists puzzled: the cortex smells faintly of vanilla.', has(18)],
    ['Local man finds out he is the secret ingredient. He is thrilled and slightly sticky.', has(19)],
    ['Mirror shop reports an unusual run on cookie-shaped reflections.', has(19)],
    ['Golden cookie sighting causes stampede in shopping district.', s => s.gc >= 1],
    ['Experts warn: clicking that fast may cause "cookie elbow".', s => s.clicksAll >= 500],
    ['Mysterious bakery ascends to the heavens; returns with very good ideas.', s => s.ascends >= 1],
    ['Grandmas wake up with a start; "something is wrong with the dough", they whisper.', (s, C) => C.gp > 0],
    ['Wrinkly things seen clinging to the great cookie. Locals avoid eye contact.', (s, C) => C.gp > 0],
    ['Scientists confirm the wrinklers are, in fact, extremely hungry.', s => s.wr.length > 0],
    ['Elder pledge signed; grandmas now nap at an alarming rate.', s => s.pledge > 0],
    ['Grandmas demand better knitting needles. Needles demand better grandmas.', has(1)],
    ['Neighbourhood grandma is now a feared underground chess champion.', s => s.b[1] >= 100],
    ['Sugar lump found in a pocket. It is, regrettably, a rock.', s => s.lumpStart > 0],
    ['Farmers report sugar lumps growing in the cookie fields, delighted.', s => s.lumpStart > 0],
    ['Lumpy sugar crystals become the hottest collectible of the season.', s => s.lumpTot >= 5],
    ['Industry insiders claim buildings "work harder when they are level headed".', s => s.lvl.some(v => v > 0)],
    ['Heavenly chips declared the new reserve currency of the clouds.', s => s.chips > 0],
    ['Angels seen browsing the upgrade tree for "something cheap and glowy".', s => s.chips > 0 || s.ascends > 0],
    ['Milk now comes in more flavours than anyone asked for.', (s, C) => C.milk >= 5],
    ['Kittens unionize; demand cream and a corner office.', (s, C) => C.milk >= 2],
    ['Zebra spotted in the dairy aisle, unrelated to the milk.', (s, C) => C.milk >= 25],
    ['Stunned scientists discover the cookie is also a pretty good sundial.', s => s.allTime >= 1e8],
    ['Cookie-powered cities report 40% fewer traffic jams and 90% more crumbs.', s => s.allTime >= 1e10],
    ['The moon is revealed to be a very old cookie. NASA refuses to comment.', s => s.allTime >= 1e13],
    ['Multiverse council approves cookie exports to neighbouring realities.', s => s.allTime >= 1e18],
    ['Galaxy-wide census finds more cookies than stars. Stars mildly offended.', s => s.allTime >= 1e21],
    ['Time itself reportedly tastes of vanilla since your latest batch.', s => s.allTime >= 1e24],
    ['Entire alphabet reorganised to start with the letter C.', s => s.allTime >= 1e27],
    ['Economists formally replace the number line with a cookie line.', s => s.allTime >= 1e30],
    ['Cookie-based physics breakthroughs rewrite every textbook, again.', s => s.allTime >= 1e33],
    ['Old man says he once saw a golden cookie. Nobody believes him. Then he clicks it.', s => s.gc >= 10],
    ['Tourists line up for a photo with the legendary golden cookie, which blinks.', s => s.gc >= 77],
    ['Man trapped in elevator with cookie jar reports "best day of my life".', () => true],
    ['Cookie jar lids declared illegal in three small countries.', () => true],
    ['Baker spotted whispering to the dough, dough appears to whisper back.', () => true],
    ['Local library adds a shelf of cookbooks, then a second shelf, then the whole library.', s => s.allTime >= 1e6],
    ['Pigeons organise sit-in outside bakery until further crumbs.', s => s.allTime >= 1e5],
    ['Rival bakery closes after "mysterious" craving for your cookies.', s => s.allTime >= 1e7],
    ['Cookie critic gives your latest batch "five stars, would dunk again".', s => s.allTime >= 1e4],
    ['Local legend: if you click fast enough, the cookie clicks back.', s => s.clicksAll >= 5000],
    ['Mall cookie stand rebrands as "cookie stand of the past".', s => s.allTime >= 1e9]
  ];

  const ADJ = ['Crumbly', 'Golden', 'Sticky', 'Toasty', 'Fluffy', 'Merry', 'Sugar', 'Cozy', 'Velvet', 'Honey', 'Maple', 'Cinnamon', 'Buttery', 'Lucky', 'Sunny', 'Jolly', 'Gooey', 'Crispy'];
  const NOUN = ['Biscuit', 'Muffin', 'Crumpet', 'Scone', 'Pretzel', 'Waffle', 'Brownie', 'Bun', 'Truffle', 'Pudding', 'Cupcake', 'Pancake', 'Toffee', 'Nugget', 'Dumpling', 'Macaron', 'Fudge'];
  const randName = () => ADJ[Math.floor(Math.random() * ADJ.length)] + ' ' + NOUN[Math.floor(Math.random() * NOUN.length)];

  const rng = seed => () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
  const TAU = Math.PI * 2;
  const circ = (x, cx, cy, r) => { x.beginPath(); x.arc(cx, cy, r, 0, TAU); };
  const ell = (x, cx, cy, rx, ry, rot) => { x.beginPath(); x.ellipse(cx, cy, rx, ry, rot || 0, 0, TAU); };
  const rrect = (x, X, Y, W, H, r) => { x.beginPath(); x.roundRect(X, Y, W, H, r); };
  const poly = (x, p) => { x.beginPath(); x.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) x.lineTo(p[i], p[i + 1]); x.closePath(); };
  const paint = (x, f, s, lw) => { if (f) { x.fillStyle = f; x.fill(); } if (s) { x.strokeStyle = s; x.lineWidth = lw || 1.6; x.stroke(); } };
  const lin = (x, x0, y0, x1, y1, st) => { const g = x.createLinearGradient(x0, y0, x1, y1); st.forEach((c, i) => g.addColorStop(i / (st.length - 1), c)); return g; };
  const rad = (x, cx, cy, r0, r1, st, ox, oy) => { const g = x.createRadialGradient(ox ?? cx, oy ?? cy, r0, cx, cy, r1); st.forEach((c, i) => g.addColorStop(i / (st.length - 1), c)); return g; };
  const OL = 'rgba(28,16,8,.88)';

  function blob(x, pts) {
    const n = pts.length;
    x.beginPath();
    x.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
    for (let k = 0; k < n; k++) { const a = pts[k], b = pts[(k + 1) % n]; x.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
    x.closePath();
  }
  function drawCookie(x, cx, cy, r, o) {
    o = o || {};
    const rnd = rng(o.seed || 7), d = o.dough || DOUGH, ph = rnd() * 6, big = r > 40, ph2 = rnd() * 6;
    const edge = [];
    const N = big ? 72 : 36;
    for (let i = 0; i < N; i++) {
      const a = i / N * TAU, q = r * (1 + 0.022 * Math.sin(a * 4 + ph) + 0.016 * Math.sin(a * 9 + ph2) + (big ? 0.012 * (rnd() - 0.5) : 0));
      edge.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]);
    }
    x.save();
    if (big) { x.save(); x.shadowColor = 'rgba(40,20,5,.45)'; x.shadowBlur = r * 0.12; x.shadowOffsetY = r * 0.05; blob(x, edge); x.fillStyle = d[2]; x.fill(); x.restore(); }
    blob(x, edge);
    x.fillStyle = rad(x, cx, cy, r * 0.05, r * 1.02, [d[0], d[1], d[1], d[2]], cx - r * 0.28, cy - r * 0.32);
    x.fill();
    x.save();
    blob(x, edge); x.clip();
    const rim = x.createRadialGradient(cx, cy, r * 0.72, cx, cy, r * 1.02);
    rim.addColorStop(0, 'rgba(110,55,15,0)'); rim.addColorStop(0.7, 'rgba(120,60,18,.28)'); rim.addColorStop(1, 'rgba(90,40,10,.55)');
    x.fillStyle = rim; x.fillRect(cx - r * 1.1, cy - r * 1.1, r * 2.2, r * 2.2);
    if (o.zebra) { x.fillStyle = 'rgba(30,16,8,.85)'; for (let k = -3; k <= 3; k += 2) { x.save(); x.translate(cx, cy); x.rotate(-0.5); x.fillRect(k * r * 0.28, -r * 1.2, r * 0.26, r * 2.4); x.restore(); } }
    if (o.half) { x.fillStyle = 'rgba(50,26,12,.9)'; x.beginPath(); x.arc(cx, cy, r * 1.1, -Math.PI / 2 - 0.4, Math.PI / 2 - 0.4); x.fill(); }
    if (o.icing) { x.fillStyle = o.icing; ell(x, cx, cy, r * 0.62, r * 0.62); x.fill(); }
    const blot = big ? 14 : 4;
    for (let i = 0; i < blot; i++) {
      const a = rnd() * TAU, q = Math.sqrt(rnd()) * r * 0.85, bx = cx + Math.cos(a) * q, by = cy + Math.sin(a) * q, br = r * (0.12 + rnd() * 0.18);
      const g = x.createRadialGradient(bx, by, 0, bx, by, br);
      g.addColorStop(0, rnd() < 0.55 ? 'rgba(160,85,25,.16)' : 'rgba(255,230,170,.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    const spk = Math.floor(r * (big ? 2.2 : 0.9));
    for (let i = 0; i < spk; i++) {
      const a = rnd() * TAU, q = Math.sqrt(rnd()) * r, px = cx + Math.cos(a) * q, py = cy + Math.sin(a) * q, pr = r * (0.006 + rnd() * (big ? 0.016 : 0.026));
      if (rnd() < 0.55) { x.fillStyle = `rgba(110,52,14,${0.12 + rnd() * 0.2})`; circ(x, px, py, pr); x.fill(); x.fillStyle = `rgba(255,240,205,${0.12 + rnd() * 0.18})`; circ(x, px - pr * 0.5, py - pr * 0.5, pr * 0.55); x.fill(); }
      else { x.fillStyle = `rgba(255,238,195,${0.08 + rnd() * 0.14})`; circ(x, px, py, pr); x.fill(); }
    }
    x.lineCap = 'round';
    for (let i = 0; i < (big ? 7 : 3); i++) {
      const a = rnd() * TAU, q = r * (0.25 + rnd() * 0.55), l = r * (0.08 + rnd() * 0.14), px = cx + Math.cos(a) * q, py = cy + Math.sin(a) * q, b = a + Math.PI / 2 + (rnd() - 0.5);
      const ex = px + Math.cos(b) * l, ey = py + Math.sin(b) * l, mx = (px + ex) / 2 + Math.cos(a) * l * 0.3, my = (py + ey) / 2 + Math.sin(a) * l * 0.3;
      x.strokeStyle = 'rgba(95,45,12,.42)'; x.lineWidth = Math.max(0.7, r * 0.018);
      x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(mx, my, ex, ey); x.stroke();
      x.strokeStyle = 'rgba(255,235,190,.35)'; x.lineWidth = Math.max(0.5, r * 0.008);
      x.beginPath(); x.moveTo(px - r * 0.012, py - r * 0.016); x.quadraticCurveTo(mx - r * 0.012, my - r * 0.016, ex - r * 0.012, ey - r * 0.016); x.stroke();
    }
    const hl = x.createRadialGradient(cx - r * 0.35, cy - r * 0.42, 0, cx - r * 0.35, cy - r * 0.42, r * 0.75);
    hl.addColorStop(0, 'rgba(255,245,215,.32)'); hl.addColorStop(1, 'rgba(255,245,215,0)');
    x.fillStyle = hl; x.fillRect(cx - r * 1.1, cy - r * 1.1, r * 2.2, r * 2.2);
    x.restore();
    blob(x, edge);
    x.lineWidth = Math.max(1, r * (big ? 0.03 : 0.045)); x.strokeStyle = d[3]; x.stroke();
    x.restore();
    const n = o.chips ?? 9, pts = [];
    for (let i = 0, tries = 0; i < n && tries < 300; tries++) {
      const a = rnd() * TAU, q = Math.sqrt(0.03 + rnd() * 0.97) * r * 0.78, px = cx + Math.cos(a) * q, py = cy + Math.sin(a) * q, sz = r * (0.07 + rnd() * 0.065);
      if (pts.some(p => Math.hypot(p[0] - px, p[1] - py) < (p[2] + sz) * 1.15)) continue;
      pts.push([px, py, sz]); i++;
    }
    const chip = o.chip || '#4a2a14';
    for (const [px, py, sz] of pts) {
      const k = 6 + Math.floor(rnd() * 3), bp = [], rot = rnd() * TAU;
      for (let j = 0; j < k; j++) { const a = rot + j / k * TAU, q = sz * (0.78 + rnd() * 0.42); bp.push([px + Math.cos(a) * q, py + Math.sin(a) * q * 0.9]); }
      x.save();
      x.translate(sz * 0.12, sz * 0.18); blob(x, bp); x.fillStyle = 'rgba(70,32,8,.35)'; x.fill();
      x.restore();
      blob(x, bp);
      const g = x.createRadialGradient(px - sz * 0.35, py - sz * 0.4, sz * 0.05, px, py, sz * 1.2);
      g.addColorStop(0, shade(chip, 0.35)); g.addColorStop(0.55, chip); g.addColorStop(1, shade(chip, -0.45));
      x.fillStyle = g; x.fill();
      x.lineWidth = Math.max(0.5, r * 0.008); x.strokeStyle = 'rgba(20,8,2,.45)'; x.stroke();
      x.fillStyle = 'rgba(255,255,255,.32)'; ell(x, px - sz * 0.28, py - sz * 0.34, sz * 0.3, sz * 0.15, -0.6); x.fill();
    }
  }
  function drawBigCookie(x, cx, cy, r) {
    const rnd = rng(19), N = 96, edge = [];
    for (let i = 0; i < N; i++) { const a = i / N * TAU, q = r * (1 + 0.012 * Math.sin(a * 3 + 1) + 0.008 * Math.sin(a * 7 + 2) + 0.01 * (rnd() - 0.5)); edge.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); }
    x.save();
    blob(x, edge); x.fillStyle = rad(x, cx, cy, r * 0.04, r * 1.02, ['#cfa772', '#bd9262', '#a07445', '#7a5330'], cx - r * 0.22, cy - r * 0.28); x.fill();
    x.save(); blob(x, edge); x.clip();
    for (let i = 0; i < 70; i++) {
      const a = rnd() * TAU, q = Math.sqrt(rnd()) * r, bx = cx + Math.cos(a) * q, by = cy + Math.sin(a) * q, br = r * (0.05 + rnd() * 0.12);
      const g = x.createRadialGradient(bx, by, 0, bx, by, br); g.addColorStop(0, rnd() < 0.5 ? 'rgba(235,205,150,.2)' : 'rgba(80,46,20,.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    const spk = Math.floor(r * r * 0.034);
    for (let i = 0; i < spk; i++) {
      const a = rnd() * TAU, q = Math.sqrt(rnd()) * r, px = cx + Math.cos(a) * q, py = cy + Math.sin(a) * q;
      x.fillStyle = rnd() < 0.5 ? `rgba(70,40,16,${0.12 + rnd() * 0.25})` : `rgba(255,236,190,${0.1 + rnd() * 0.22})`;
      x.fillRect(px, py, 1 + (rnd() < 0.25 ? 1 : 0), 1);
    }
    x.lineCap = 'round'; x.lineJoin = 'round';
    const crack = (px, py, ang, len, w, depth) => {
      x.beginPath(); x.moveTo(px, py);
      let a = ang;
      for (let k = 0; k < len; k++) {
        a += (rnd() - 0.5) * 1.1; px += Math.cos(a) * r * 0.035; py += Math.sin(a) * r * 0.035; x.lineTo(px, py);
        if (depth < 2 && rnd() < 0.12) crack(px, py, a + (rnd() < 0.5 ? 1 : -1) * (0.6 + rnd() * 0.6), 3 + Math.floor(rnd() * 4), w * 0.7, depth + 1);
      }
      x.strokeStyle = 'rgba(62,36,16,.55)'; x.lineWidth = w; x.stroke();
    };
    for (let i = 0; i < 26; i++) { const a = rnd() * TAU, q = r * (0.5 + rnd() * 0.5); crack(cx + Math.cos(a) * q, cy + Math.sin(a) * q, a + Math.PI + (rnd() - 0.5) * 1.4, 4 + Math.floor(rnd() * 6), Math.max(0.8, r * 0.011), 0); }
    const rim = x.createRadialGradient(cx, cy, r * 0.7, cx, cy, r * 1.02);
    rim.addColorStop(0, 'rgba(80,44,16,0)'); rim.addColorStop(0.75, 'rgba(80,44,16,.22)'); rim.addColorStop(1, 'rgba(50,26,8,.6)');
    x.fillStyle = rim; x.fillRect(cx - r * 1.1, cy - r * 1.1, r * 2.2, r * 2.2);
    const hl = x.createRadialGradient(cx - r * 0.34, cy - r * 0.4, 0, cx - r * 0.34, cy - r * 0.4, r * 0.8);
    hl.addColorStop(0, 'rgba(255,238,200,.22)'); hl.addColorStop(1, 'rgba(255,238,200,0)');
    x.fillStyle = hl; x.fillRect(cx - r * 1.1, cy - r * 1.1, r * 2.2, r * 2.2);
    x.restore();
    blob(x, edge); x.lineWidth = Math.max(1.5, r * 0.022); x.strokeStyle = '#5e4026'; x.stroke();
    const CH = [[0.1, 0.02, 0.2, 0.9], [-0.28, -0.5, 0.15, 0.7], [0.42, -0.12, 0.14, 0.4], [0.3, 0.42, 0.15, 1.1], [-0.12, 0.5, 0.15, 0.2], [-0.5, 0.18, 0.1, 0.5], [0.5, -0.46, 0.09, 1.5], [-0.58, -0.28, 0.06, 0.3]];
    for (const [ox, oy, sz, rot] of CH) {
      const px = cx + ox * r, py = cy + oy * r, rr = sz * r, k = 7 + Math.floor(rnd() * 3), pts = [];
      for (let j = 0; j < k; j++) { const a = rot + j / k * TAU, q = rr * (0.62 + rnd() * 0.5) * (j % 2 ? 1.12 : 0.92); pts.push([px + Math.cos(a) * q * 1.12, py + Math.sin(a) * q * 0.86]); }
      x.save(); x.translate(rr * 0.1, rr * 0.16);
      x.beginPath(); pts.forEach((p, j) => j ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.fillStyle = 'rgba(30,14,4,.4)'; x.fill(); x.restore();
      x.beginPath(); pts.forEach((p, j) => j ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath();
      x.fillStyle = rad(x, px, py, rr * 0.1, rr * 1.2, ['#6a4642', '#4a2e2c', '#33201e'], px - rr * 0.35, py - rr * 0.4); x.fill();
      x.lineJoin = 'round'; x.lineWidth = Math.max(1, r * 0.012); x.strokeStyle = 'rgba(22,10,6,.7)'; x.stroke();
      x.fillStyle = 'rgba(255,225,215,.2)'; ell(x, px - rr * 0.32, py - rr * 0.38, rr * 0.4, rr * 0.14, -0.6); x.fill();
    }
    x.restore();
  }
  function shade(hex, k) {
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).map(v => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)));
    return `rgb(${c.join(',')})`;
  }
  function drawGolden(x, cx, cy, r) {
    drawCookie(x, cx, cy, r, { seed: 11, chips: 7, dough: ['#fff6c0', '#ffd34a', '#d99a14', '#8a5a06'], chip: '#c98a10' });
    x.save(); x.globalAlpha = 0.55; x.fillStyle = '#fff';
    ell(x, cx - r * 0.35, cy - r * 0.4, r * 0.28, r * 0.13, -0.6); x.fill();
    x.restore();
  }

  function hand(x) {
    x.beginPath();
    x.moveTo(-3.6, -2); x.lineTo(-3.6, -22); x.arc(0, -22, 3.6, Math.PI, 0); x.lineTo(3.6, -6);
    x.arc(6.6, -6, 3, Math.PI, 0); x.arc(12.6, -5, 3, Math.PI, 0); x.arc(18.1, -3.4, 2.5, Math.PI, 0);
    x.lineTo(20.6, 8); x.quadraticCurveTo(20, 18, 10, 20); x.lineTo(0, 20); x.quadraticCurveTo(-6, 19, -9, 12);
    x.lineTo(-14, 2); x.quadraticCurveTo(-15.5, -2.5, -11, -3); x.lineTo(-3.6, 4); x.closePath();
    x.fillStyle = '#fff'; x.fill(); x.lineJoin = 'round'; x.lineWidth = 2.4; x.strokeStyle = '#1b1b1b'; x.stroke();
    x.lineWidth = 1.4; x.beginPath(); x.moveTo(9.6, -6); x.lineTo(9.6, 1); x.moveTo(15.6, -5); x.lineTo(15.6, 1); x.stroke();
  }
  const DRAW = [
    x => { x.save(); x.translate(30, 36); x.rotate(-0.45); hand(x); x.restore(); },
    x => {
      ell(x, 32, 61, 18, 3); paint(x, 'rgba(0,0,0,.25)');
      x.beginPath(); x.moveTo(15, 62); x.lineTo(21, 39); x.quadraticCurveTo(32, 33, 43, 39); x.lineTo(49, 62); x.closePath(); paint(x, lin(x, 0, 36, 0, 62, ['#d06aa6', '#a5427f']), OL);
      rrect(x, 25, 42, 14, 19, 3); paint(x, '#f6f1e6', OL, 1.2);
      rrect(x, 12, 44, 40, 5, 2.5); paint(x, lin(x, 0, 44, 0, 49, ['#d9a05c', '#9a6430']), OL, 1.2);
      circ(x, 18, 46.5, 3.2); paint(x, '#f2c9a5', OL, 1.2); circ(x, 46, 46.5, 3.2); paint(x, '#f2c9a5', OL, 1.2);
      circ(x, 32, 24, 11.5); paint(x, rad(x, 32, 24, 2, 12, ['#fbd9bb', '#eab48c'], 29, 21), OL);
      x.beginPath(); x.arc(32, 23, 12.4, Math.PI * 1.03, Math.PI * 1.97); x.quadraticCurveTo(32, 15, 19.6, 22); paint(x, '#dcdce4', OL, 1.4);
      circ(x, 32, 9.5, 5.5); paint(x, '#e6e6ee', OL, 1.4);
      x.lineWidth = 1.5; x.strokeStyle = '#3a3a44';
      circ(x, 27.5, 25, 3.4); x.stroke(); circ(x, 36.5, 25, 3.4); x.stroke();
      x.beginPath(); x.moveTo(30.9, 25); x.lineTo(33.1, 25); x.stroke();
      circ(x, 27.5, 25.3, 1.1); paint(x, '#222'); circ(x, 36.5, 25.3, 1.1); paint(x, '#222');
      circ(x, 24.5, 29.5, 2.2); paint(x, 'rgba(240,110,120,.45)'); circ(x, 39.5, 29.5, 2.2); paint(x, 'rgba(240,110,120,.45)');
      x.beginPath(); x.arc(32, 29, 3.4, 0.2 * Math.PI, 0.8 * Math.PI); x.strokeStyle = '#6a2a1a'; x.lineWidth = 1.4; x.stroke();
    },
    x => {
      ell(x, 32, 52, 29, 10); paint(x, lin(x, 0, 42, 0, 62, ['#8e5a2c', '#5e3816']), OL);
      x.strokeStyle = 'rgba(40,20,6,.45)'; x.lineWidth = 1.5;
      for (const y of [48, 53, 58]) { x.beginPath(); x.moveTo(10, y); x.quadraticCurveTo(32, y + 3, 54, y); x.stroke(); }
      [[17, 23], [32, 15], [47, 25]].forEach(([px, top], k) => {
        x.strokeStyle = '#2f7a2a'; x.lineWidth = 2.6; x.beginPath(); x.moveTo(px, 51); x.quadraticCurveTo(px + 2, (51 + top) / 2, px, top + 6); x.stroke();
        ell(x, px - 5, 40 - k, 5, 2.4, 0.5); paint(x, '#5cbf4a', OL, 1); ell(x, px + 5, 36 - k, 5, 2.4, -0.5); paint(x, '#5cbf4a', OL, 1);
        drawCookie(x, px, top + 2, 6.5, { seed: 30 + k, chips: 3 });
      });
    },
    x => {
      x.beginPath(); x.moveTo(3, 61); x.quadraticCurveTo(8, 24, 26, 12); x.quadraticCurveTo(40, 6, 50, 20); x.quadraticCurveTo(60, 34, 61, 61); x.closePath();
      paint(x, lin(x, 0, 8, 0, 62, ['#8a7c70', '#5a4e44']), OL);
      [[16, 30, 4], [44, 22, 3], [52, 44, 4], [12, 50, 3]].forEach(([a, b, r]) => { ell(x, a, b, r, r * 0.7); paint(x, 'rgba(255,255,255,.12)'); });
      x.beginPath(); x.moveTo(21, 62); x.lineTo(21, 40); x.arc(32, 40, 11, Math.PI, 0); x.lineTo(43, 62); x.closePath(); paint(x, '#1a120c');
      x.strokeStyle = '#8b5a2b'; x.lineWidth = 3.5; x.beginPath(); x.moveTo(20, 62); x.lineTo(20, 32); x.moveTo(44, 62); x.lineTo(44, 32); x.moveTo(17, 31); x.lineTo(47, 31); x.stroke();
      x.strokeStyle = '#3a2a1a'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(6, 61.5); x.lineTo(60, 61.5); x.stroke();
      rrect(x, 33, 48, 22, 9, 2); paint(x, lin(x, 0, 48, 0, 57, ['#7d858e', '#4a5058']), OL, 1.2);
      [[37, 47], [42, 46], [47, 47], [51, 46.5]].forEach(([a, b]) => { circ(x, a, b, 2.6); paint(x, '#5a3418', OL, 0.8); });
      circ(x, 37, 58.5, 2.2); paint(x, '#222'); circ(x, 51, 58.5, 2.2); paint(x, '#222');
    },
    x => {
      rect(x, 6, 28, 52, 33, lin(x, 0, 28, 0, 61, ['#a3adb8', '#6f7a86']));
      x.beginPath(); x.moveTo(6, 28); for (let k = 0; k < 3; k++) { x.lineTo(6 + k * 17.3, 17); x.lineTo(6 + (k + 1) * 17.3, 28); } x.closePath(); paint(x, '#5f6a76', OL);
      rrect(x, 6, 28, 52, 33, 0); paint(x, null, OL);
      rect(x, 45, 6, 8, 18, '#8a4a32'); rrect(x, 45, 6, 8, 18, 0); paint(x, null, OL, 1.2);
      x.fillStyle = 'rgba(230,230,235,.75)'; circ(x, 50, 3, 3.4); x.fill(); circ(x, 56, 0, 2.6); x.fill();
      for (let k = 0; k < 3; k++) { rrect(x, 11 + k * 15, 33, 9, 8, 1.5); paint(x, '#ffd36b', OL, 1); }
      rrect(x, 25, 47, 14, 14, 1); paint(x, '#46505b', OL, 1.2);
      drawCookie(x, 14, 52, 4.5, { seed: 41, chips: 2 }); drawCookie(x, 50, 52, 4.5, { seed: 42, chips: 2 });
    },
    x => {
      rect(x, 5, 55, 54, 6, '#c9c0aa'); rect(x, 9, 51, 46, 4, '#d9d1bd');
      rrect(x, 5, 55, 54, 6, 0); paint(x, null, OL, 1.2);
      for (const cx of [13, 24, 36, 47]) { rrect(x, cx - 3, 29, 6.5, 22, 1); paint(x, lin(x, cx - 3, 0, cx + 3.5, 0, ['#fffcf4', '#d8d0bc']), OL, 1); }
      rect(x, 7, 24, 50, 5, '#e6dfcd'); rrect(x, 7, 24, 50, 5, 0); paint(x, null, OL, 1.2);
      poly(x, [5, 24, 32, 8, 59, 24]); paint(x, lin(x, 0, 8, 0, 24, ['#f5f0e2', '#d9d1bd']), OL);
      circ(x, 32, 18, 4.2); paint(x, rad(x, 32, 18, 0.5, 4.2, ['#fff2a0', '#e0a820']), '#8a6010', 1);
    },
    x => {
      [[6, 48, 52, 13, '#cfa765'], [13, 36, 38, 12, '#dcb877'], [20, 24, 24, 12, '#e8c78a']].forEach(([a, b, w, h, c]) => { rrect(x, a, b, w, h, 1); paint(x, c, OL, 1.3); });
      rrect(x, 25, 14, 14, 10, 1); paint(x, '#c4964c', OL, 1.3);
      poly(x, [24, 14, 32, 6, 40, 14]); paint(x, lin(x, 0, 6, 0, 14, ['#fff2a0', '#e0a820']), OL, 1.2);
      rrect(x, 28, 51, 8, 10, [4, 4, 0, 0]); paint(x, '#3a2410');
      x.fillStyle = 'rgba(255,255,255,.22)'; for (let k = 0; k < 4; k++) x.fillRect(29, 26 + k * 6, 6, 2);
    },
    x => {
      x.beginPath(); x.moveTo(21, 62); x.lineTo(23, 26); x.lineTo(41, 26); x.lineTo(43, 62); x.closePath(); paint(x, lin(x, 21, 0, 43, 0, ['#a49cbe', '#7a7298']), OL);
      x.strokeStyle = 'rgba(40,30,60,.35)'; x.lineWidth = 1; for (let k = 0; k < 6; k++) { x.beginPath(); x.moveTo(22, 32 + k * 5); x.lineTo(42, 32 + k * 5); x.stroke(); }
      poly(x, [14, 28, 32, 1, 50, 28]); paint(x, lin(x, 14, 0, 50, 0, ['#6b5fd6', '#3e2f9a']), OL);
      x.fillStyle = '#ffe27a'; [[28, 18, 1.6], [36, 22, 1.3], [32, 11, 1.2]].forEach(([a, b, r]) => { circ(x, a, b, r); x.fill(); });
      rrect(x, 28, 34, 8, 10, [4, 4, 0, 0]); paint(x, rad(x, 32, 40, 1, 7, ['#fff6c4', '#ffb83a']), OL, 1);
      rrect(x, 28, 52, 8, 10, [4, 4, 0, 0]); paint(x, '#3a2a4a', OL, 1);
    },
    x => {
      x.save(); x.translate(32, 32); x.rotate(0.35);
      x.beginPath(); x.moveTo(0, 15); x.quadraticCurveTo(-5, 24, 0, 30); x.quadraticCurveTo(5, 24, 0, 15); paint(x, rad(x, 0, 18, 1, 12, ['#fff6b0', '#ff9a2a', '#e8401a']));
      poly(x, [-9, 4, -16, 18, -8, 14]); paint(x, '#d8343a', OL, 1.3); poly(x, [9, 4, 16, 18, 8, 14]); paint(x, '#d8343a', OL, 1.3);
      x.beginPath(); x.moveTo(0, -28); x.quadraticCurveTo(12, -14, 9, 14); x.lineTo(-9, 14); x.quadraticCurveTo(-12, -14, 0, -28); paint(x, lin(x, -10, 0, 10, 0, ['#ffffff', '#cfd6e0']), OL);
      x.save(); x.clip(); rect(x, -14, -32, 28, 12, '#d8343a'); x.restore();
      x.beginPath(); x.moveTo(0, -28); x.quadraticCurveTo(12, -14, 9, 14); x.lineTo(-9, 14); x.quadraticCurveTo(-12, -14, 0, -28); paint(x, null, OL);
      circ(x, 0, -6, 4.6); paint(x, rad(x, 0, -6, 0.5, 4.6, ['#c8f0ff', '#3a9ad8'], -1.5, -7.5), '#3a4a5a', 1.4);
      rrect(x, -1.5, 3, 3, 12, 1); paint(x, '#d8343a');
      x.restore();
    },
    x => {
      x.strokeStyle = '#6a4424'; x.lineWidth = 3; x.beginPath(); x.moveTo(18, 62); x.lineTo(22, 52); x.moveTo(46, 62); x.lineTo(42, 52); x.stroke();
      rrect(x, 14, 50, 36, 4, 2); paint(x, '#8a5a2c', OL, 1);
      circ(x, 32, 36, 15); paint(x, 'rgba(210,236,246,.55)');
      x.save(); circ(x, 32, 36, 15); x.clip(); rect(x, 15, 34, 34, 20, lin(x, 0, 34, 0, 52, ['#ffe680', '#f0a020']));
      x.fillStyle = 'rgba(255,255,255,.7)'; [[26, 42, 1.8], [34, 46, 1.3], [38, 40, 2.2]].forEach(([a, b, r]) => { circ(x, a, b, r); x.fill(); }); x.restore();
      rect(x, 28, 8, 8, 16, 'rgba(210,236,246,.6)');
      x.beginPath(); x.moveTo(28, 8); x.lineTo(28, 23); x.arc(32, 36, 15, -Math.PI / 2 - 0.27, -Math.PI / 2 + 0.27 + TAU, true); x.lineTo(36, 8); paint(x, null, '#3a5a6a', 1.8);
      x.beginPath(); x.arc(32, 36, 15, 0, TAU); x.strokeStyle = '#3a5a6a'; x.lineWidth = 1.8; x.stroke();
      rrect(x, 27, 4, 10, 5, 1.5); paint(x, '#a8703a', OL, 1);
      x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 2; x.beginPath(); x.arc(32, 36, 11, Math.PI * 1.1, Math.PI * 1.4); x.stroke();
    },
    x => {
      for (const [a, b] of [[10, 60], [54, 60]]) { rrect(x, a - 5, b - 4, 10, 6, 1); paint(x, '#5a5262', OL, 1); }
      circ(x, 32, 33, 25); paint(x, lin(x, 0, 8, 0, 58, ['#77708a', '#433c52']), OL);
      circ(x, 32, 33, 18.5); paint(x, rad(x, 32, 33, 1, 19, ['#ffe0ff', '#c46aff', '#6a1ea8', '#22063e']));
      x.strokeStyle = 'rgba(255,210,255,.55)'; x.lineWidth = 1.8;
      for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(32, 33, 5 + k * 4.5, k * 2, k * 2 + 3.4); x.stroke(); }
      x.fillStyle = 'rgba(255,255,255,.18)'; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; circ(x, 32 + Math.cos(a) * 21.8, 33 + Math.sin(a) * 21.8, 1.6); x.fill(); }
    },
    x => {
      x.strokeStyle = '#7a5a26'; x.lineWidth = 3; x.beginPath(); x.moveTo(10, 46); x.quadraticCurveTo(2, 34, 12, 22); x.moveTo(54, 46); x.quadraticCurveTo(62, 34, 52, 22); x.stroke();
      rrect(x, 9, 38, 46, 22, 4); paint(x, lin(x, 0, 38, 0, 60, ['#e8c272', '#a57a30']), OL);
      circ(x, 32, 50, 4.5); paint(x, rad(x, 32, 50, 0.5, 4.5, ['#e6fdff', '#38c8ff']), OL, 1);
      circ(x, 32, 27, 15); paint(x, '#c99c48', OL); circ(x, 32, 27, 12); paint(x, '#fbf4de', OL, 1.2);
      x.strokeStyle = '#3a2a14'; x.lineWidth = 1.2;
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; x.beginPath(); x.moveTo(32 + Math.cos(a) * 10, 27 + Math.sin(a) * 10); x.lineTo(32 + Math.cos(a) * 11.4, 27 + Math.sin(a) * 11.4); x.stroke(); }
      x.lineWidth = 1.8; x.beginPath(); x.moveTo(32, 27); x.lineTo(32, 19); x.moveTo(32, 27); x.lineTo(38, 29); x.stroke();
    },
    x => {
      rrect(x, 20, 52, 24, 9, 2); paint(x, lin(x, 0, 52, 0, 61, ['#5a6a86', '#2c3648']), OL, 1.2);
      circ(x, 32, 30, 21); paint(x, 'rgba(80,220,255,.16)');
      circ(x, 32, 30, 12); paint(x, rad(x, 32, 30, 1, 12, ['#ffffff', '#7af0ff', '#1890d8', '#0a3a6e'], 29, 27));
      x.strokeStyle = '#a8f6ff'; x.lineWidth = 2;
      ell(x, 32, 30, 21, 7, 0.6); x.stroke(); ell(x, 32, 30, 21, 7, -0.6); x.stroke();
      x.fillStyle = '#fff'; circ(x, 32 + Math.cos(0.6) * 21, 30 + Math.sin(0.6) * 21 * 0.35, 2); x.fill();
    },
    x => {
      x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 3; x.beginPath(); x.moveTo(2, 42); x.lineTo(24, 36); x.stroke();
      ['#ff5a5a', '#ffa83a', '#ffe14a', '#5ad25a', '#4ab0ff', '#9a6aff'].forEach((c, k) => { poly(x, [38, 33 + k * 1.2, 63, 22 + k * 7, 63, 28 + k * 7, 38, 34.5 + k * 1.2]); paint(x, c); });
      poly(x, [14, 54, 32, 14, 50, 54]); paint(x, lin(x, 14, 14, 50, 54, ['rgba(240,252,255,.95)', 'rgba(170,220,240,.85)']), '#5a9ab0', 1.8);
      poly(x, [32, 14, 36, 54, 50, 54]); paint(x, 'rgba(255,255,255,.25)');
    },
    x => {
      circ(x, 32, 32, 25); paint(x, rad(x, 32, 32, 2, 25, ['#fff2a8', '#f2c23a', '#c8901a'], 26, 24), '#8a6010', 2);
      circ(x, 32, 32, 20); paint(x, null, 'rgba(140,96,16,.6)', 1.2);
      x.strokeStyle = '#2a6a2a'; x.lineWidth = 2.4; x.beginPath(); x.moveTo(32, 33); x.quadraticCurveTo(36, 44, 34, 50); x.stroke();
      for (let k = 0; k < 4; k++) {
        x.save(); x.translate(32, 32); x.rotate(k * Math.PI / 2 + Math.PI / 4);
        x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(-9, -4, -8, -15, -2, -13); x.bezierCurveTo(0, -12.5, 0, -11, 0, -10); x.bezierCurveTo(0, -11, 0, -12.5, 2, -13); x.bezierCurveTo(8, -15, 9, -4, 0, 0);
        paint(x, '#45b84e', '#1e5a22', 1.2); x.restore();
      }
    },
    x => {
      circ(x, 32, 34, 27); paint(x, rad(x, 32, 34, 2, 27, ['rgba(160,110,255,.35)', 'rgba(60,20,120,0)']));
      const tri = (cx, cy, sz, d) => { if (!d) { drawCookie(x, cx, cy, sz * 0.48, { seed: Math.round(cx * 7 + cy), chips: 2 }); return; } const h = sz / 2; tri(cx, cy - h * 0.58, h, d - 1); tri(cx - h / 2, cy + h * 0.29, h, d - 1); tri(cx + h / 2, cy + h * 0.29, h, d - 1); };
      tri(32, 36, 50, 2);
    },
    x => {
      rrect(x, 6, 10, 52, 40, 3); paint(x, lin(x, 0, 10, 0, 50, ['#3a3f4a', '#1c2028']), OL);
      rect(x, 9, 13, 46, 6, '#59606e'); circ(x, 13, 16, 1.6); paint(x, '#ff6a5a'); circ(x, 19, 16, 1.6); paint(x, '#ffd23a'); circ(x, 25, 16, 1.6); paint(x, '#5ad25a');
      rect(x, 9, 21, 46, 26, '#0c1118');
      x.fillStyle = '#5affb0'; x.font = 'bold 7px monospace'; x.fillText('> cookie++', 11, 29); x.fillStyle = '#7ab8ff'; x.fillText('var c = 1', 11, 37);
      rect(x, 11, 40, 5, 5, '#5affb0');
      drawCookie(x, 47, 38, 6, { seed: 61, chips: 3 });
      rect(x, 24, 50, 16, 4, '#2a2f38'); rrect(x, 16, 54, 32, 5, 2); paint(x, lin(x, 0, 54, 0, 59, ['#6a7282', '#3a404c']), OL, 1);
    },
    x => {
      for (const [cx, cy, r, c] of [[20, 44, 13, 'rgba(120,200,255,.28)'], [46, 22, 12, 'rgba(255,160,230,.28)'], [47, 47, 9, 'rgba(160,255,190,.3)']]) { circ(x, cx, cy, r); paint(x, c, 'rgba(255,255,255,.55)', 1.2); }
      circ(x, 30, 28, 20); paint(x, rad(x, 30, 28, 1, 21, ['#fff3ff', '#a98cff', '#3a2a8a', '#140a3a'], 24, 21), '#d0c0ff', 1.6);
      x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 1.4;
      for (let k = 0; k < 2; k++) { x.beginPath(); for (let t = 0; t < 7; t += 0.25) { const a = t + k * Math.PI, q = 2 + t * 2.3; x.lineTo(30 + Math.cos(a) * q, 28 + Math.sin(a) * q * 0.7); } x.stroke(); }
      x.fillStyle = '#fff'; for (const [a, b, r] of [[22, 20, 1], [38, 36, 1.2], [36, 18, 0.9], [20, 36, 0.8]]) { circ(x, a, b, r); x.fill(); }
      drawCookie(x, 20, 44, 5, { seed: 62, chips: 3 });
    },
    x => {
      ell(x, 32, 54, 20, 5); paint(x, 'rgba(0,0,0,.25)');
      x.beginPath(); x.moveTo(12, 38); x.bezierCurveTo(4, 24, 12, 10, 26, 12); x.bezierCurveTo(32, 5, 44, 8, 48, 14); x.bezierCurveTo(60, 16, 62, 32, 52, 40); x.bezierCurveTo(50, 50, 38, 52, 32, 48); x.bezierCurveTo(24, 54, 14, 48, 12, 38); x.closePath();
      paint(x, rad(x, 32, 28, 2, 30, ['#ffc2d6', '#f08aac', '#b8527a'], 26, 20), OL);
      x.strokeStyle = 'rgba(130,40,80,.65)'; x.lineWidth = 1.5; x.lineCap = 'round';
      for (const d of ['M32 12Q28 22 34 28Q40 34 32 46', 'M18 20Q26 24 22 32Q16 38 24 44', 'M46 18Q40 24 46 30Q54 36 46 42', 'M12 32Q20 30 22 36', 'M52 26Q46 26 42 22']) x.stroke(new Path2D(d));
      rrect(x, 24, 0, 16, 6, 2); paint(x, '#fff', OL, 1.2); circ(x, 28, 2, 5); paint(x, '#fff', OL, 1.2); circ(x, 36, 2, 5); paint(x, '#fff', OL, 1.2);
    },
    x => {
      circ(x, 32, 16, 9); paint(x, rad(x, 32, 16, 1, 10, ['#fbd9bb', '#e0a77a'], 29, 13), OL);
      x.beginPath(); x.arc(32, 14, 10, Math.PI * 1.05, Math.PI * 1.95); x.quadraticCurveTo(32, 8, 22.6, 12); paint(x, '#5a3a22', OL, 1.4);
      circ(x, 29, 17, 1.1); paint(x, '#222'); circ(x, 35, 17, 1.1); paint(x, '#222');
      x.beginPath(); x.arc(32, 19, 2.6, 0.2 * Math.PI, 0.8 * Math.PI); x.strokeStyle = '#6a2a1a'; x.lineWidth = 1.2; x.stroke();
      x.beginPath(); x.moveTo(14, 56); x.quadraticCurveTo(14, 30, 32, 29); x.quadraticCurveTo(50, 30, 50, 56); x.closePath(); paint(x, lin(x, 0, 28, 0, 58, ['#4a90e0', '#2a5aa8']), OL);
      x.fillStyle = '#fff'; x.font = 'bold 8px sans-serif'; x.textAlign = 'center'; x.fillText('YOU', 32, 44); x.textAlign = 'start';
      drawCookie(x, 52, 30, 6.5, { seed: 63, chips: 3 });
      rrect(x, 20, 56, 8, 5, 1.5); paint(x, '#2a2f48', OL, 1); rrect(x, 36, 56, 8, 5, 1.5); paint(x, '#2a2f48', OL, 1);
    }
  ];
  function rect(x, X, Y, W, H, f) { x.fillStyle = f; x.fillRect(X, Y, W, H); }

  function paintIcon(x, ic) {
    const [type, a, b] = ic;
    const glow = c => { if (GLOW) { GLOW.c = c; return; } x.fillStyle = rad(x, 32, 32, 2, 32, [c, 'rgba(0,0,0,0)']); x.fillRect(0, 0, 64, 64); };
    const sub = (fn, sc, dx, dy) => { x.save(); x.translate(dx, dy); x.scale(sc, sc); fn(x); x.restore(); };
    if (type === 'cur') { glow(CFG.TIER_COL[a]); sub(DRAW[0], 0.9, 4, 3); }
    else if (type === 'fing') { glow(CFG.TIER_COL[a % 5]); sub(DRAW[0], 0.62, 0, 4); sub(DRAW[0], 0.62, 22, 0); sub(DRAW[0], 0.62, 12, 22); }
    else if (type === 'tier') { glow(CFG.TIER_COL[b]); sub(DRAW[a], 0.86, 4.5, 3); x.fillStyle = CFG.TIER_COL[b]; x.strokeStyle = '#000'; x.lineWidth = 1; const sp = Math.min(7, 50 / (b + 1)); for (let k = 0; k <= b; k++) { const o = 8 + k * sp; poly(x, [o, 58, o + 3, 54, o + 6, 58, o + 3, 62]); x.fill(); x.stroke(); } }
    else if (type === 'gt') { glow('rgba(255,200,230,.8)'); sub(DRAW[1], 0.9, 2, 2); x.fillStyle = 'rgba(0,0,0,.4)'; circ(x, 47, 47, 14); x.fill(); sub(DRAW[a], 0.4, 34, 34); }
    else if (type === 'ck') { const c = COOKIES[a]; drawCookie(x, 32, 32, 25, { seed: 50 + a, dough: c[3], chip: c[4], chips: a === 7 ? 13 : a === 0 ? 7 : 9, zebra: a === 13, half: a === 12, icing: a === 17 ? '#f4a9bc' : null }); }
    else if (type === 'mouse') {
      glow('rgba(255,255,255,.35)');
      x.strokeStyle = '#333'; x.lineWidth = 2; x.beginPath(); x.moveTo(32, 12); x.quadraticCurveTo(30, 4, 40, 3); x.stroke();
      rrect(x, 18, 12, 28, 42, 14); paint(x, lin(x, 18, 0, 46, 0, ['#fff', MICE[a][3], 'rgba(0,0,0,.35)']), '#1a1a1a', 2);
      rrect(x, 18, 12, 28, 42, 14); paint(x, MICE[a][3]); rrect(x, 18, 12, 28, 42, 14); paint(x, lin(x, 18, 0, 46, 0, ['rgba(255,255,255,.5)', 'rgba(255,255,255,0)', 'rgba(0,0,0,.3)']), '#1a1a1a', 2);
      x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(32, 13); x.lineTo(32, 30); x.moveTo(19, 30); x.lineTo(45, 30); x.stroke();
    }
    else if (type === 'kit') {
      const col = ['#f2a65a', '#9a9aa6', '#f4f0e6', '#3a3640', '#d8b080'][a];
      glow('rgba(255,255,255,.4)');
      poly(x, [13, 30, 16, 8, 28, 20]); paint(x, col, OL); poly(x, [51, 30, 48, 8, 36, 20]); paint(x, col, OL);
      ell(x, 32, 36, 21, 18); paint(x, col, OL);
      poly(x, [17, 24, 18, 13, 25, 20]); paint(x, '#f4a0b0');
      poly(x, [47, 24, 46, 13, 39, 20]); paint(x, '#f4a0b0');
      ell(x, 24, 34, 3.2, 4); paint(x, '#2a6a3a'); ell(x, 40, 34, 3.2, 4); paint(x, '#2a6a3a');
      circ(x, 25, 33, 1.2); paint(x, '#fff'); circ(x, 41, 33, 1.2); paint(x, '#fff');
      poly(x, [30, 41, 34, 41, 32, 44]); paint(x, '#e8708a');
      x.strokeStyle = OL; x.lineWidth = 1.2; x.beginPath(); x.moveTo(32, 44); x.quadraticCurveTo(29, 48, 26, 46); x.moveTo(32, 44); x.quadraticCurveTo(35, 48, 38, 46); x.stroke();
      if (a >= 2) { rrect(x, 22, 2, 20, 9, 3); paint(x, ['', '', '#f2c23a', '#2a2a3a', '#a83a3a'][a], OL, 1.2); }
    }
    else if (type === 'gold') {
      glow('rgba(255,230,120,.8)'); drawGolden(x, 32, 32, 24);
      x.fillStyle = '#fff';
      const star = (cx, cy, r) => { poly(x, [cx, cy - r, cx + r * 0.25, cy - r * 0.25, cx + r, cy, cx + r * 0.25, cy + r * 0.25, cx, cy + r, cx - r * 0.25, cy + r * 0.25, cx - r, cy, cx - r * 0.25, cy - r * 0.25]); x.fill(); };
      for (let k = 0; k <= a; k++) star(50 - k * 9, 12 + k * 3, 6 - k);
    }
    else if (type === 'lump') { glow('rgba(255,240,150,.6)'); x.drawImage(lumpSprite(a || 0), 8, 8, 48, 48); }
    else if (type === 'wrk') { glow('rgba(255,120,100,.6)'); x.save(); x.translate(32, 50); wrinklerShape(x, 46, 0); x.restore(); }
    else if (type === 'heav') {
      glow(typeof a === 'string' && a.length === 2 ? `hsla(${(a.charCodeAt(0) * 37 + a.charCodeAt(1) * 11) % 360},90%,78%,.9)` : 'rgba(255,250,210,.9)');
      x.strokeStyle = '#fff6b0'; x.lineWidth = 3; ell(x, 32, 10, 14, 4); x.stroke();
      x.fillStyle = 'rgba(255,255,255,.9)';
      for (const sx of [-1, 1]) { x.beginPath(); x.moveTo(32 + sx * 14, 30); x.quadraticCurveTo(32 + sx * 34, 14, 32 + sx * 30, 40); x.quadraticCurveTo(32 + sx * 22, 34, 32 + sx * 14, 38); x.closePath(); x.fill(); x.strokeStyle = 'rgba(120,110,80,.6)'; x.lineWidth = 1; x.stroke(); }
      drawGolden(x, 32, 36, 17);
    }
    else if (type === 'bld') { glow(CFG.TIER_COL[[0, 2, 3][a === undefined ? 0 : b] || 0]); sub(DRAW[a], 0.9, 3, 3); }
    else if (type === 'ckA') { glow(`hsla(${30 + a * 22},90%,70%,.85)`); drawCookie(x, 32, 32, 24, { seed: 3 + a, chips: 8 }); }
    else if (type === 'cps') { glow(`hsla(${200 + a * 12},90%,70%,.8)`); x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 3; x.lineCap = 'round'; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(4, 22 + k * 10); x.lineTo(18, 22 + k * 10); x.stroke(); } drawCookie(x, 38, 32, 21, { seed: 90 + a, chips: 7 }); }
    else if (type === 'hand') { glow(`hsla(${a * 40},85%,72%,.85)`); sub(DRAW[0], 0.92, 3, 3); }
    else if (type === 'milk') {
      glow('rgba(200,230,255,.7)');
      x.beginPath(); x.moveTo(18, 10); x.lineTo(46, 10); x.lineTo(42, 58); x.lineTo(22, 58); x.closePath(); paint(x, 'rgba(230,245,255,.5)', '#5a7a8a', 2);
      x.beginPath(); x.moveTo(19.5, a ? 18 : 28); x.lineTo(44.5, a ? 18 : 28); x.lineTo(42, 57); x.lineTo(22, 57); x.closePath(); paint(x, a ? '#8b5a3c' : '#fbfbf6');
    }
    else if (type === 'news') {
      glow('rgba(255,255,255,.5)');
      rrect(x, 10, 12, 44, 40, 2); paint(x, '#f2eee2', OL, 1.6);
      rect(x, 14, 16, 36, 7, '#3a3a3a');
      x.fillStyle = '#9a9a9a'; for (let k = 0; k < 5; k++) x.fillRect(14, 27 + k * 5, k % 2 ? 16 : 36, 2.2);
      if (a) drawCookie(x, 42, 39, 8, { seed: 8, chips: 3 }); else { rect(x, 34, 27, 16, 14, '#c9b38a'); }
    }
  }

  const ROWBG = [null,
    { g: ['#f3d6b3', '#e2b88c'], p: (x, w, h) => { x.fillStyle = 'rgba(200,120,90,.18)'; for (let i = 0; i < w; i += 26) x.fillRect(i, 0, 10, h - 20); rect(x, 0, h - 20, w, 20, lin(x, 0, h - 20, 0, h, ['#b07a46', '#8a5a2e'])); x.fillStyle = 'rgba(60,30,10,.35)'; for (let i = 0; i < w; i += 48) x.fillRect(i, h - 20, 1.5, 20); } },
    { g: ['#9a6a3a', '#6e4522'], p: (x, w, h, r) => { rect(x, 0, 0, w, 11, '#6cb04a'); x.fillStyle = '#4e9436'; for (let i = 0; i < w; i += 5) x.fillRect(i, 9 + r() * 4, 2, 4); x.strokeStyle = 'rgba(40,20,6,.35)'; x.lineWidth = 2; for (const y of [32, 54, 76]) { x.beginPath(); x.moveTo(0, y); x.lineTo(w, y + 2); x.stroke(); } } },
    { g: ['#5a4d44', '#342a24'], p: (x, w, h, r) => { for (let i = 0; i < w / 6; i++) { ell(x, r() * w, r() * h, 4 + r() * 12, 3 + r() * 7, r()); x.fillStyle = r() < 0.5 ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.06)'; x.fill(); } x.strokeStyle = 'rgba(110,60,25,.6)'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, h * 0.7); for (let i = 0; i <= w; i += 30) x.lineTo(i, h * 0.6 + r() * h * 0.25); x.stroke(); } },
    { g: ['#7c8794', '#59636e'], p: (x, w, h) => { x.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < w; i += 64) x.fillRect(i, 0, 2, h); x.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 8; i < w; i += 64) for (const y of [8, h - 16]) { circ(x, i, y, 1.6); x.fill(); } for (let i = 0; i < w; i += 16) { x.fillStyle = (i / 16) % 2 ? '#2a2a2a' : '#e8c12a'; poly(x, [i, h, i + 8, h - 6, i + 16, h - 6, i + 8, h]); x.fill(); } } },
    { g: ['#e6dfce', '#c4bba5'], p: (x, w, h, r) => { x.strokeStyle = 'rgba(120,120,110,.25)'; x.lineWidth = 1.2; for (let i = 0; i < w / 40; i++) { const a = r() * w; x.beginPath(); x.moveTo(a, 0); x.bezierCurveTo(a + 30, h * 0.3, a - 20, h * 0.6, a + 40, h); x.stroke(); } rect(x, 0, h - 14, w, 14, 'rgba(60,90,70,.25)'); } },
    { g: ['#efd5a0', '#d2ae6c'], p: (x, w, h) => { x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.moveTo(0, h * 0.7); for (let i = 0; i <= w; i += 10) x.lineTo(i, h * 0.7 + Math.sin(i / 40) * 6); x.lineTo(w, h); x.lineTo(0, h); x.fill(); x.fillStyle = 'rgba(120,80,30,.18)'; for (let i = 20; i < w; i += 70) { x.fillRect(i, 14, 8, 8); x.fillRect(i + 12, 16, 4, 12); } } },
    { g: ['#43316e', '#231842'], p: (x, w, h, r) => { for (let i = 0; i < w / 4; i++) { x.fillStyle = `rgba(255,240,200,${0.2 + r() * 0.6})`; circ(x, r() * w, r() * h * 0.8, r() * 1.3 + 0.3); x.fill(); } } },
    { g: ['#161d40', '#060918'], p: (x, w, h, r) => { for (let i = 0; i < w / 3; i++) { x.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.7})`; circ(x, r() * w, r() * h, r() * 1.2 + 0.3); x.fill(); } circ(x, w - 40, 24, 16); x.fillStyle = rad(x, w - 40, 24, 2, 16, ['#e0a060', '#8a4a20'], w - 45, 19); x.fill(); } },
    { g: ['#4a3b2a', '#2a2016'], p: (x, w, h, r) => { x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, 24, w, 4); for (let i = 10; i < w; i += 22) { const c = ['#5ad25a', '#e05a8a', '#4ab0ff', '#ffd23a'][Math.floor(r() * 4)]; rrect(x, i, 10, 8, 14, 2); x.fillStyle = c; x.globalAlpha = 0.55; x.fill(); x.globalAlpha = 1; } } },
    { g: ['#30184e', '#12061f'], p: (x, w, h, r) => { for (let i = 0; i < w / 50; i++) { circ(x, r() * w, r() * h, 20 + r() * 30); x.fillStyle = rad(x, 0, 0, 0, 1, ['rgba(0,0,0,0)', 'rgba(0,0,0,0)']); x.fillStyle = 'rgba(190,90,255,.08)'; x.fill(); } } },
    { g: ['#36475e', '#1f2a3a'], p: (x, w, h, r) => { x.strokeStyle = 'rgba(200,220,255,.08)'; x.lineWidth = 4; for (let i = 0; i < w / 90; i++) { const cx = r() * w, cy = r() * h, rr = 12 + r() * 20; circ(x, cx, cy, rr); x.stroke(); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; x.beginPath(); x.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); x.lineTo(cx + Math.cos(a) * (rr + 6), cy + Math.sin(a) * (rr + 6)); x.stroke(); } } } },
    { g: ['#0d2547', '#06132a'], p: (x, w, h) => { x.strokeStyle = 'rgba(80,220,255,.1)'; x.lineWidth = 1; for (let i = 0; i < w; i += 20) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (let j = 0; j < h; j += 20) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); } } },
    { g: ['#fbeeff', '#dff3ff'], p: (x, w, h) => { ['#ff5a5a', '#ffa83a', '#ffe14a', '#5ad25a', '#4ab0ff', '#9a6aff'].forEach((c, k) => { x.fillStyle = c; x.globalAlpha = 0.1; x.beginPath(); x.moveTo(k * 40, 0); x.lineTo(k * 40 + 30, 0); x.lineTo(k * 40 + 30 + h, h); x.lineTo(k * 40 + h, h); x.fill(); }); x.globalAlpha = 1; } },
    { g: ['#3a7a44', '#245a2e'], p: (x, w, h, r) => { x.fillStyle = 'rgba(160,255,160,.12)'; for (let i = 0; i < w / 10; i++) { const cx = r() * w, cy = r() * h; for (let k = 0; k < 4; k++) { circ(x, cx + Math.cos(k * 1.57) * 3, cy + Math.sin(k * 1.57) * 3, 3); x.fill(); } } } },
    { g: ['#2e1f46', '#170f26'], p: (x, w, h, r) => { x.strokeStyle = 'rgba(200,160,255,.15)'; x.lineWidth = 1.2; for (let i = 0; i < w / 18; i++) { const cx = r() * w, cy = r() * h, s = 6 + r() * 14; poly(x, [cx, cy - s, cx + s, cy + s * 0.7, cx - s, cy + s * 0.7]); x.stroke(); } } },
    { g: ['#0e1a14', '#050a08'], p: (x, w, h, r) => { x.fillStyle = 'rgba(90,255,176,.22)'; x.font = '9px monospace'; for (let i = 0; i < w / 12; i++) { const cx = r() * w; for (let k = 0; k < 8; k++) x.fillText(r() < 0.5 ? '1' : '0', cx, 8 + k * 11 + r() * 3); } } },
    { g: ['#1c1052', '#080424'], p: (x, w, h, r) => { for (let i = 0; i < w / 40; i++) { const cx = r() * w, cy = r() * h, rr = 10 + r() * 26; circ(x, cx, cy, rr); x.fillStyle = rad(x, cx, cy, 0, rr, [r() < 0.5 ? 'rgba(120,200,255,.25)' : 'rgba(255,140,230,.22)', 'rgba(0,0,0,0)']); x.fill(); x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 1; x.stroke(); } } },
    { g: ['#4a2036', '#240c1a'], p: (x, w, h, r) => { x.strokeStyle = 'rgba(255,170,210,.16)'; x.lineWidth = 1.2; const pts = []; for (let i = 0; i < w / 26; i++) pts.push([r() * w, r() * h * 0.9]); for (const a of pts) for (const b of pts) if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 70) { x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); } x.fillStyle = 'rgba(255,200,230,.5)'; for (const a of pts) { circ(x, a[0], a[1], 2); x.fill(); } } },
    { g: ['#cfd8e6', '#98a6bc'], p: (x, w, h, r) => { x.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < w; i += 90) { x.beginPath(); x.moveTo(i, h); x.lineTo(i + 30, 0); x.lineTo(i + 50, 0); x.lineTo(i + 20, h); x.fill(); } x.strokeStyle = 'rgba(60,80,110,.25)'; x.lineWidth = 2; for (let i = 0; i < w; i += 90) x.strokeRect(i + 4, 6, 70, h - 28); } }
  ];

  const SPR = {}, URL_CACHE = {};
  let GLOW = null;
  function bldSprite(i) {
    if (!SPR['b' + i]) { const c = mk(128, 128), x = c.getContext('2d'); x.scale(2, 2); DRAW[i](x); SPR['b' + i] = c; }
    return SPR['b' + i];
  }
  function pixelize(src, n, out, under) {
    const p = mk(n, n), px = p.getContext('2d');
    px.imageSmoothingEnabled = true; px.imageSmoothingQuality = 'high';
    px.drawImage(src, 0, 0, n, n);
    let im;
    try { im = px.getImageData(0, 0, n, n); } catch (e) { im = null; }
    if (im) {
      const d = im.data, A = new Uint8ClampedArray(n * n);
      for (let k = 0; k < n * n; k++) {
        const a = d[k * 4 + 3];
        if (a < 70) { d[k * 4 + 3] = 0; A[k] = 0; continue; }
        if (a > 170) d[k * 4 + 3] = 255;
        for (let q = 0; q < 3; q++) d[k * 4 + q] = Math.round(d[k * 4 + q] / 17) * 17;
        A[k] = d[k * 4 + 3];
      }
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const k = y * n + x;
        if (A[k]) continue;
        const nb = (x > 0 && A[k - 1] > 160) || (x < n - 1 && A[k + 1] > 160) || (y > 0 && A[k - n] > 160) || (y < n - 1 && A[k + n] > 160);
        if (nb) { d[k * 4] = 34; d[k * 4 + 1] = 18; d[k * 4 + 2] = 8; d[k * 4 + 3] = 235; }
      }
      px.putImageData(im, 0, 0);
    }
    const c = mk(out, out), x = c.getContext('2d');
    if (under) under(x);
    x.imageSmoothingEnabled = false;
    x.drawImage(p, 0, 0, out, out);
    return c;
  }
  function bldURL(i) { return URL_CACHE['b' + i] || (URL_CACHE['b' + i] = pixelize(bldSprite(i), 64, 128).toDataURL()); }
  function iconURL(ic) {
    const k = ic.join(',');
    if (!URL_CACHE[k]) {
      const f = mk(96, 96), fx = f.getContext('2d'); fx.scale(1.5, 1.5);
      GLOW = {}; paintIcon(fx, ic); const g = GLOW.c; GLOW = null;
      URL_CACHE[k] = pixelize(f, 48, 96, g ? (x => { x.fillStyle = rad(x, 48, 48, 3, 48, [g, 'rgba(0,0,0,0)']); x.globalAlpha = 0.85; x.fillRect(0, 0, 96, 96); x.globalAlpha = 1; }) : null).toDataURL();
    }
    return URL_CACHE[k];
  }
  function smallCookie() {
    if (!SPR.sc) { const c = mk(64, 64), x = c.getContext('2d'); drawCookie(x, 32, 32, 28, { seed: 21, chips: 5 }); SPR.sc = c; }
    return SPR.sc;
  }
  const scURL = () => URL_CACHE.sc || (URL_CACHE.sc = smallCookie().toDataURL());
  function goldSprite() {
    if (!SPR.gold) { const c = mk(160, 160), x = c.getContext('2d'); x.fillStyle = rad(x, 80, 80, 30, 80, ['rgba(255,240,150,.55)', 'rgba(255,220,90,0)']); x.fillRect(0, 0, 160, 160); drawGolden(x, 80, 80, 52); SPR.gold = c; }
    return SPR.gold;
  }
  const goldURL = () => URL_CACHE.gold || (URL_CACHE.gold = goldSprite().toDataURL());
  const LCOL = { 0: ['#fff6cf', '#e8d28a', '#b89a4a'], 1: ['#ffe3ea', '#f0b4c6', '#b8708a'], 2: ['#fff2a0', '#ffcc2a', '#b8860b'], 4: ['#e6b878', '#b87a38', '#6e4018'] };
  function lumpSprite(ty) {
    const k = 'l' + ty;
    if (!SPR[k]) {
      const c = mk(48, 48), x = c.getContext('2d'), col = LCOL[ty] || LCOL[0], r = rng(ty * 31 + 5);
      const pts = []; for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, rr = 15 + r() * 4; pts.push([24 + Math.cos(a) * rr * 1.05, 26 + Math.sin(a) * rr * 0.9]); }
      blob(x, pts); x.fillStyle = rad(x, 24, 26, 2, 22, col, 18, 18); x.fill(); x.strokeStyle = '#5a4418'; x.lineWidth = 1.8; x.stroke();
      if (ty === 1) { x.strokeStyle = 'rgba(90,44,60,.55)'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(24, 12); x.quadraticCurveTo(20, 26, 24, 40); x.stroke(); }
      x.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 16; i++) { const a = r() * TAU, d = r() * 13; x.fillRect(24 + Math.cos(a) * d, 26 + Math.sin(a) * d * 0.85, 1.6, 1.6); }
      x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 2; x.beginPath(); x.arc(24, 26, 12, Math.PI * 1.1, Math.PI * 1.45); x.stroke();
      SPR[k] = c;
    }
    return SPR[k];
  }
  const lumpURL = ty => URL_CACHE['l' + ty] || (URL_CACHE['l' + ty] = lumpSprite(ty).toDataURL());
  function wrinklerShape(x, s0, t) {
    x.lineCap = 'round'; x.strokeStyle = '#5a1e18'; x.lineWidth = s0 * 0.14;
    for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(k * s0 * 0.2, -s0 * 0.1); x.quadraticCurveTo(k * s0 * 0.26 + Math.sin(t * 5 + k) * 2, s0 * 0.15, k * s0 * 0.16, s0 * 0.34); x.stroke(); }
    ell(x, 0, -s0 * 0.42, s0 * 0.56, s0 * 0.5); x.fillStyle = rad(x, 0, -s0 * 0.42, s0 * 0.05, s0 * 0.6, ['#e2766a', '#b3463c', '#7a2a24'], -s0 * 0.15, -s0 * 0.6); x.fill(); x.strokeStyle = '#4a1612'; x.lineWidth = 1.6; x.stroke();
    x.strokeStyle = 'rgba(74,22,18,.55)'; x.lineWidth = 1.2;
    for (let k = 0; k < 4; k++) { x.beginPath(); x.arc(0, -s0 * 0.42, s0 * (0.18 + k * 0.1), Math.PI * 1.1, Math.PI * 1.9); x.stroke(); }
    for (const sx of [-1, 1]) { circ(x, sx * s0 * 0.2, -s0 * 0.5, s0 * 0.13); x.fillStyle = '#fff'; x.fill(); x.strokeStyle = '#4a1612'; x.lineWidth = 1; x.stroke(); circ(x, sx * s0 * 0.2, -s0 * 0.46, s0 * 0.055); x.fillStyle = '#1a0a08'; x.fill(); }
  }
  function cursorSprite() {
    if (!SPR.cur) { const c = mk(64, 64), x = c.getContext('2d'); x.translate(32, 34); x.scale(1.15, 1.15); x.translate(-4, 0); hand(x); SPR.cur = c; }
    return SPR.cur;
  }
  function raysSprite() {
    if (!SPR.rays) {
      const c = mk(512, 512), x = c.getContext('2d'); x.translate(256, 256);
      for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, 256, a - 0.09, a + 0.09); x.closePath(); x.fillStyle = rad(x, 0, 0, 0, 256, ['rgba(255,252,220,.55)', 'rgba(255,240,180,.2)', 'rgba(255,240,180,0)']); x.fill(); }
      SPR.rays = c;
    }
    return SPR.rays;
  }
  function goldRaysSprite() {
    if (!SPR.grs) {
      const c = mk(512, 512), x = c.getContext('2d'); x.translate(256, 256);
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, 256, a - 0.1, a + 0.1); x.closePath(); x.fillStyle = rad(x, 0, 0, 0, 256, ['rgba(255,240,160,.75)', 'rgba(255,210,80,.3)', 'rgba(255,200,60,0)']); x.fill(); }
      SPR.grs = c;
    }
    return SPR.grs;
  }
  const MILK = ['#f6f4ee', '#8b5a3c', '#f48aa0', '#f7a642', '#d29a4e', '#f4e07a', '#a6d870', '#b9a2ec', '#ff6f82', '#fff1c8', '#f2b53a', '#9a6a46', '#c89a60', '#fdf8ee', '#d8344e', '#c9742e', '#c27a2a', '#a8f0d0', '#3a3040', '#f6a8c8', '#ff4fa0', '#ff9b7a', '#6a3a7a', '#ffbf8a', '#a67c52', '#e8e8e8', '#3a3a8a', '#ff7a2a', '#a01020', '#f2c43a', '#1a1a2a', '#3adf5a', '#5adfff', '#e8dcb8'];
  const MILK_N = ['plain milk', 'chocolate milk', 'raspberry milk', 'orange milk', 'caramel milk', 'banana milk', 'lime milk', 'blueberry milk', 'strawberry milk', 'vanilla milk', 'honey milk', 'coffee milk', 'tea milk', 'coconut milk', 'cherry milk', 'spiced milk', 'maple milk', 'mint milk', 'licorice milk', 'rose milk', 'dragonfruit milk', 'melon milk', 'blackcurrant milk', 'peach milk', 'hazelnut milk', 'zebra milk', 'cosmic milk', 'flaming milk', 'sanguine milk', 'midas milk', 'midnight milk', 'green inferno milk', 'frostfire milk', 'soy milk'];
  function texCv(k, w, h, fn) {
    if (!SPR[k]) { const c = mk(w, h), x = c.getContext('2d'); fn(x, w, h, rng(w * 31 + h * 7)); SPR[k] = c; }
    return SPR[k];
  }
  function texURL(k, w, h, fn) { return URL_CACHE[k] || (URL_CACHE[k] = texCv(k, w, h, fn).toDataURL()); }
  function grain(x, w, h, r, n, vert, dk, lt) {
    for (let i = 0; i < n; i++) {
      const p0 = r() * (vert ? w : h), al = 0.05 + r() * 0.14, d = r() < 0.62;
      x.strokeStyle = d ? `rgba(${dk},${al})` : `rgba(${lt},${al * 0.8})`; x.lineWidth = 0.5 + r() * 1.3;
      x.beginPath();
      for (let q = 0; q <= (vert ? h : w); q += 12) { const o = p0 + Math.sin(q * 0.021 + i * 1.7) * 1.4 + (r() - 0.5) * 0.6; if (vert) x.lineTo(o, q); else x.lineTo(q, o); }
      x.stroke();
    }
  }
  const woodURL = () => texURL('wood', 320, 64, (x, w, h, r) => {
    x.fillStyle = lin(x, 0, 0, 0, h, ['#caa275', '#b88d5b', '#a57a49']); x.fillRect(0, 0, w, h);
    grain(x, w, h, r, 60, false, '86,50,18', '255,236,200');
    for (let i = 0; i < 2; i++) { const cx = 30 + r() * (w - 60), cy = 14 + r() * (h - 28); for (let k = 4; k > 0; k--) { x.strokeStyle = `rgba(90,50,18,${0.1 + 0.06 * k})`; x.lineWidth = 1; ell(x, cx, cy, k * 5, k * 1.7); x.stroke(); } ell(x, cx, cy, 2.5, 1); x.fillStyle = 'rgba(70,36,10,.45)'; x.fill(); }
    const sx = 120 + r() * 100; x.fillStyle = 'rgba(60,32,10,.55)'; x.fillRect(sx, 0, 1.5, h); x.fillStyle = 'rgba(255,236,200,.22)'; x.fillRect(sx + 1.5, 0, 1, h);
    x.fillStyle = 'rgba(255,244,220,.5)'; x.fillRect(0, 0, w, 1); x.fillStyle = 'rgba(255,244,220,.2)'; x.fillRect(0, 1, w, 1);
    x.fillStyle = 'rgba(50,26,8,.35)'; x.fillRect(0, h - 3, w, 1); x.fillStyle = 'rgba(30,14,4,.8)'; x.fillRect(0, h - 2, w, 2);
  });
  const panelV = () => texURL('pv', 24, 256, (x, w, h, r) => {
    x.fillStyle = lin(x, 0, 0, w, 0, ['#2a1608', '#6e4320', '#a3703c', '#b98448', '#8a5a2c', '#4a2a10', '#22110a']); x.fillRect(0, 0, w, h);
    grain(x, w, h, r, 14, true, '40,18,4', '255,220,170');
    x.fillStyle = 'rgba(0,0,0,.7)'; x.fillRect(0, 0, w, 2); x.fillStyle = 'rgba(255,220,170,.28)'; x.fillRect(0, 2, w, 1);
    for (const y of [28, h - 28]) { circ(x, w / 2, y, 3.2); x.fillStyle = rad(x, w / 2, y, 0.5, 3.4, ['#fff2c4', '#d2a04c', '#6a4210'], w / 2 - 1, y - 1); x.fill(); x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = 0.8; x.stroke(); }
  });
  const panelH = () => texURL('ph', 256, 24, (x, w, h, r) => {
    x.fillStyle = lin(x, 0, 0, 0, h, ['#2a1608', '#6e4320', '#a3703c', '#b98448', '#8a5a2c', '#4a2a10', '#22110a']); x.fillRect(0, 0, w, h);
    grain(x, w, h, r, 14, false, '40,18,4', '255,220,170');
    x.fillStyle = 'rgba(0,0,0,.65)'; x.fillRect(0, 0, 2, h); x.fillStyle = 'rgba(255,220,170,.25)'; x.fillRect(2, 0, 1, h);
  });
  const crateURL = () => texURL('crate', 60, 60, (x, w, h) => {
    x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
    x.fillStyle = lin(x, 0, 0, w, h, ['#b89566', '#7a5a34', '#4a3018']); x.fillRect(1, 1, w - 2, h - 2);
    x.fillStyle = lin(x, 0, 0, 0, h, ['#3a2a1c', '#1c130b']); x.fillRect(5, 5, w - 10, h - 10);
    x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(5, 5, w - 10, 1); x.fillRect(5, 5, 1, h - 10);
    x.fillStyle = 'rgba(255,230,190,.18)'; x.fillRect(5, h - 6, w - 10, 1); x.fillRect(w - 6, 5, 1, h - 10);
    x.fillStyle = 'rgba(255,240,210,.55)'; x.fillRect(1, 1, w - 2, 1); x.fillRect(1, 1, 1, h - 2);
    for (const [cx, cy] of [[3, 3], [w - 3, 3], [3, h - 3], [w - 3, h - 3]]) { x.fillStyle = '#e8c27a'; x.fillRect(cx - 1, cy - 1, 2, 2); }
  });
  const goldRaysURL = () => texURL('grays', 256, 256, x => {
    x.translate(128, 128);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, 128, a - 0.12, a + 0.12); x.closePath(); x.fillStyle = rad(x, 0, 0, 0, 128, ['rgba(255,250,200,.9)', 'rgba(255,220,90,.45)', 'rgba(255,210,80,0)']); x.fill(); }
    x.fillStyle = rad(x, 0, 0, 0, 80, ['rgba(255,245,170,.7)', 'rgba(255,220,90,0)']); x.fillRect(-128, -128, 256, 256);
  });
  const paperURL = () => texURL('paper', 256, 64, (x, w, h, r) => {
    x.fillStyle = lin(x, 0, 0, 0, h, ['#dad6c9', '#c3bfb2', '#a7a396']); x.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { const cx = r() * w, cy = r() * h, rr = 5 + r() * 18; for (const ox of [-w, 0, w]) { x.fillStyle = rad(x, cx + ox, cy, 0, rr, [r() < 0.5 ? 'rgba(255,255,245,.16)' : 'rgba(60,56,44,.13)', 'rgba(0,0,0,0)']); x.fillRect(cx + ox - rr, cy - rr, rr * 2, rr * 2); } }
    for (let i = 0; i < 380; i++) { x.fillStyle = r() < 0.5 ? `rgba(70,64,50,${0.05 + r() * 0.12})` : `rgba(255,255,250,${0.06 + r() * 0.12})`; x.fillRect(r() * w, r() * h, 1 + (r() < 0.2 ? 1 : 0), 1); }
    x.fillStyle = 'rgba(255,255,250,.55)'; x.fillRect(0, 0, w, 1); x.fillStyle = 'rgba(30,26,18,.45)'; x.fillRect(0, h - 3, w, 1); x.fillStyle = 'rgba(10,8,4,.8)'; x.fillRect(0, h - 2, w, 2);
  });
  const darkWoodURL = () => texURL('dwood', 160, 96, (x, w, h, r) => {
    x.fillStyle = lin(x, 0, 0, 0, h, ['#3e2714', '#4a2e18', '#33200f']); x.fillRect(0, 0, w, h);
    grain(x, w, h, r, 44, false, '14,6,0', '190,140,90');
    for (const y of [h / 3, h * 2 / 3]) { x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(0, y, w, 1.5); x.fillStyle = 'rgba(210,160,100,.22)'; x.fillRect(0, y + 1.5, w, 1); }
    x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(0, 0, w, 1); x.fillRect(0, h - 1, w, 1);
  });
  const blueURL = () => URL_CACHE.blue || (URL_CACHE.blue = blueTile().toDataURL());
  const blueTile = () => texCv('blue', 256, 256, (x, w, h, r) => {
    x.fillStyle = '#2a5590'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 320; i++) {
      const cx = r() * w, cy = r() * h, rr = 4 + r() * 22, col = r() < 0.5 ? 'rgba(140,190,250,.11)' : 'rgba(5,15,45,.17)';
      for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) { x.fillStyle = rad(x, cx + ox, cy + oy, 0, rr, [col, 'rgba(0,0,0,0)']); x.fillRect(cx + ox - rr, cy + oy - rr, rr * 2, rr * 2); }
    }
  });

  const CSS = `
.gm-cookie-baker.g-root{display:grid;grid-template-columns:minmax(240px,31%) 12px minmax(0,1fr) 12px minmax(240px,300px);grid-template-rows:minmax(0,1fr);gap:0;align-items:stretch;justify-items:stretch;justify-content:stretch;width:100%;height:clamp(480px,calc(100dvh - var(--goff,250px)),760px);min-height:0;border-radius:18px;overflow:hidden;background:#102544;color:#fff;--cbT:'Kavoon',Georgia,serif;--cbB:'Merriweather',Georgia,'Times New Roman',serif;font:13px/1.35 var(--cbB);text-align:left;user-select:none;-webkit-user-select:none}
.gm-cookie-baker button{font-family:inherit;color:inherit;-webkit-tap-highlight-color:transparent}
.gm-cookie-baker [hidden]{display:none!important}
.gm-cookie-baker .cb-pane{position:relative;min-width:0;min-height:0;overflow:hidden;grid-row:1}
.gm-cookie-baker .cb-L{grid-column:1;background:#1d4073;touch-action:none}
.gm-cookie-baker .cb-cv{position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:none}
.gm-cookie-baker .cb-head{position:absolute;left:0;right:0;top:0;text-align:center;pointer-events:none;z-index:2}
.gm-cookie-baker .cb-name{pointer-events:auto;display:block;width:100%;border:0;margin:0;padding:8px 10px 6px;background:linear-gradient(rgba(0,0,0,.6),rgba(0,0,0,.35));font:400 17px/1.2 var(--cbT);letter-spacing:.2px;text-shadow:0 0 4px #000,0 1px 0 #000,0 2px 3px #000;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gm-cookie-baker .cb-name:hover{background:rgba(0,0,0,.55)}
.gm-cookie-baker .cb-count{margin-top:10px;padding:6px 8px 8px;background:linear-gradient(90deg,rgba(0,0,0,0),rgba(0,0,0,.45) 15%,rgba(0,0,0,.45) 85%,rgba(0,0,0,0))}
.gm-cookie-baker .cb-n{font:400 27px/1.12 var(--cbT);letter-spacing:.3px;text-shadow:0 0 4px #000,0 1px 0 #000,0 2px 0 #000,0 3px 6px #000;word-break:break-word}
.gm-cookie-baker .cb-cps{margin-top:2px;font:700 12px/1.3 var(--cbB);text-shadow:0 0 3px #000,0 1px 0 #000}
.gm-cookie-baker .cb-buffs{position:absolute;left:0;right:0;display:flex;justify-content:center;gap:8px;z-index:2;pointer-events:none}
.gm-cookie-baker .cb-buff{position:relative;width:46px;text-align:center;font:400 10px/1.1 var(--cbT);text-shadow:0 1px 2px #000}
.gm-cookie-baker .cb-buff img{width:38px;height:38px;display:block;margin:0 auto 2px;filter:drop-shadow(0 0 6px rgba(255,220,90,.9))}
.gm-cookie-baker .cb-buff i{display:block;height:4px;border-radius:2px;background:#ffd34a;box-shadow:0 0 0 1px #000;margin-bottom:2px}
.gm-cookie-baker .cb-sep{grid-row:1;position:relative;z-index:3;background:var(--cb-pv) 0 0/100% 256px repeat-y,#5a3618;box-shadow:0 0 8px 1px rgba(0,0,0,.75)}
.gm-cookie-baker .cb-sep::after{content:'';position:absolute;inset:0;box-shadow:inset 1px 0 0 rgba(0,0,0,.8),inset -1px 0 0 rgba(0,0,0,.8)}
.gm-cookie-baker .cb-sep.a{grid-column:2}.gm-cookie-baker .cb-sep.b{grid-column:4}
.gm-cookie-baker .cb-M{grid-column:3;display:flex;flex-direction:column;background:linear-gradient(rgba(0,16,36,.32),rgba(0,16,36,.32)),var(--cb-blue) 0 0/256px 256px,#16406c}
.gm-cookie-baker .cb-hp{flex:none;height:11px;position:relative;z-index:2;background:var(--cb-ph) 0 0/256px 100% repeat-x,#5a3618;box-shadow:0 2px 5px rgba(0,0,0,.6),inset 0 1px 0 rgba(0,0,0,.8),inset 0 -1px 0 rgba(0,0,0,.8)}
.gm-cookie-baker .cb-menu{display:flex;align-items:stretch;gap:0;padding:0;flex:none;background:radial-gradient(ellipse at 50% 100%,rgba(0,0,0,0),rgba(0,6,18,.55) 100%),linear-gradient(rgba(0,22,48,.2),rgba(0,22,48,.2)),var(--cb-blue) 0 0/256px 256px,#1a4a7a;justify-content:space-between;min-height:64px}
.gm-cookie-baker .cb-mc{display:flex;flex-direction:column;gap:0;flex:none;width:96px;background:var(--cb-dwood) 0 0/160px 96px repeat,#3a2412;box-shadow:inset 0 0 12px rgba(0,0,0,.65),0 0 6px rgba(0,0,0,.6)}
.gm-cookie-baker .cb-menu .cb-mb{width:100%;flex:1;border:0;border-radius:0;background:none;box-shadow:none;color:#b9b4a8;font:400 17px var(--cbT);text-shadow:0 1px 0 #000,0 0 3px #000;padding:2px 4px}.gm-cookie-baker .cb-menu .cb-mb:hover{color:#fff;background:rgba(255,230,180,.1);box-shadow:none}.gm-cookie-baker .cb-menu .cb-mb.on{color:#fff;background:rgba(255,230,180,.16);box-shadow:inset 0 0 0 1px rgba(255,220,150,.4)}
.gm-cookie-baker .cb-mb,.gm-cookie-baker .cb-btn{border:1px solid #000;border-radius:4px;background:linear-gradient(#5d4126,#3a2512 55%,#2a1a0c);box-shadow:inset 0 0 0 1px rgba(214,170,104,.55),inset 0 2px 0 rgba(255,230,180,.25),0 1px 3px rgba(0,0,0,.9);padding:6px 10px;font:700 12.5px var(--cbB);text-shadow:0 1px 0 #000,0 0 3px #000;cursor:pointer;min-height:32px}
.gm-cookie-baker .cb-mb:hover,.gm-cookie-baker .cb-btn:hover{background:linear-gradient(#78563a,#4a3018 55%,#34210f);box-shadow:inset 0 0 0 1px #f0cc88,inset 0 2px 0 rgba(255,230,180,.35),0 0 6px rgba(255,200,120,.35)}
.gm-cookie-baker .cb-mb.on{background:linear-gradient(#9a6c3a,#5e3e1c);box-shadow:inset 0 0 0 1px #ffe2a0,0 0 8px rgba(255,210,130,.5)}
.gm-cookie-baker .cb-btn:disabled{opacity:.45;cursor:default}
.gm-cookie-baker .cb-btn.warn{border-color:#e06a5a;background:linear-gradient(#7a2a1e,#4a140c)}
.gm-cookie-baker .cb-btn.big{font-size:18px;padding:10px 26px}
.gm-cookie-baker .cb-tick{flex:1;min-width:0;min-height:44px;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden;padding:4px 10px;cursor:pointer;font:700 13px/1.35 var(--cbB);color:#fff;text-shadow:0 0 3px #000,0 1px 0 #000;position:relative}
.gm-cookie-baker .cb-tick span{display:block}
.gm-cookie-baker .cb-tickM{padding:2px 4px;font-size:12px;line-height:1.24}
.gm-cookie-baker .cb-tickM span{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;max-height:5em}
.gm-cookie-baker .cb-tick span.a{animation:gmCbTick .7s cubic-bezier(.2,.8,.2,1)}
.gm-cookie-baker .cb-tick em{font-style:normal;color:#fff;opacity:.85}
@keyframes gmCbTick{from{transform:translateX(50px);opacity:0}to{transform:none;opacity:1}}
.gm-cookie-baker .cb-tickL{display:none}
.gm-cookie-baker .cb-mid{flex:1;position:relative;min-height:0}
.gm-cookie-baker .cb-rows{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;background:linear-gradient(rgba(0,16,36,.32),rgba(0,16,36,.32)),var(--cb-blue) 0 0/256px 256px,#16406c;scrollbar-width:thin;scrollbar-color:#6a4a2a #12304f}
.gm-cookie-baker .cb-row{display:block;width:100%;height:${CFG.ROW_H}px}
.gm-cookie-baker .cb-empty{padding:40px 24px;text-align:center;color:rgba(220,235,255,.55);font-style:italic;text-shadow:0 1px 2px #000}
.gm-cookie-baker .cb-panel{position:absolute;inset:0;overflow-y:auto;padding:14px 18px 24px;background:radial-gradient(ellipse at 50% 0,rgba(70,110,170,.35),rgba(0,0,0,0) 60%),linear-gradient(rgba(10,18,36,.97),rgba(6,10,22,.98));box-shadow:inset 0 0 0 2px #000,inset 0 0 0 4px #7a5a34,inset 0 0 0 5px #000,inset 0 0 40px rgba(0,0,0,.7);z-index:4;scrollbar-width:thin;scrollbar-color:#6a4a2a transparent}
.gm-cookie-baker .cb-x{position:sticky;float:right;top:0;width:40px;height:40px;border:0;border-radius:50%;background:rgba(255,255,255,.08);font:400 22px/1 var(--cbT);cursor:pointer;z-index:2}
.gm-cookie-baker .cb-x:hover{background:rgba(255,255,255,.18)}
.gm-cookie-baker .cb-panel h3,.gm-cookie-baker .cb-heaven h3{margin:4px 0 14px;font:400 32px/1.1 var(--cbT);letter-spacing:.5px;text-align:center;text-shadow:0 0 4px #000,0 2px 0 #000,0 3px 10px rgba(0,0,0,.8)}
.gm-cookie-baker .cb-panel h4{margin:18px 0 8px;padding:0 0 5px;font:400 19px var(--cbT);color:#fff;text-shadow:0 0 3px #000,0 1px 0 #000;background:linear-gradient(90deg,rgba(214,170,104,0),#d6aa68 20%,#fff0c8 50%,#d6aa68 80%,rgba(214,170,104,0)) 0 100%/100% 1px no-repeat}
.gm-cookie-baker .cb-sl{margin:3px 0;font-size:12.5px;color:#cfd8e8}
.gm-cookie-baker .cb-sl b{color:#fff}
.gm-cookie-baker .cb-panel p{margin:6px 0;color:#dfe6f2;font-size:12.5px}
.gm-cookie-baker .cb-orow{display:flex;align-items:center;gap:10px;margin:8px 0;font-size:13px;color:#cdbfa8}
.gm-cookie-baker .cb-orow .cb-btn{flex:none;min-width:140px}
.gm-cookie-baker .cb-orow .cb-btn+.cb-btn{min-width:0}
.gm-cookie-baker .cb-ta{width:100%;box-sizing:border-box;height:60px;resize:vertical;background:rgba(0,0,0,.45);color:#e8dcc4;border:1px solid #000;border-radius:4px;font:11px/1.3 monospace;padding:6px}
.gm-cookie-baker .cb-vol{display:flex;align-items:center;gap:8px;flex:none;min-width:140px;font:700 12.5px var(--cbB)}
.gm-cookie-baker .cb-vol input{width:70px;accent-color:#c8913c}
.gm-cookie-baker .cb-grid{display:flex;flex-wrap:wrap;gap:3px;margin:6px 0}
.gm-cookie-baker .cb-ic{width:52px;height:52px;background:var(--cb-crate) 0 0/100% 100%;display:grid;place-items:center;cursor:default;color:rgba(255,255,255,.25);font:400 20px var(--cbT)}
.gm-cookie-baker .cb-ic img{width:44px;height:44px}
.gm-cookie-baker .cb-ic.off img{filter:brightness(0) opacity(.45)}
.gm-cookie-baker .cb-R{grid-column:5;display:flex;flex-direction:column;background:linear-gradient(rgba(0,10,24,.55),rgba(0,10,24,.7)),var(--cb-blue) 0 0/256px 256px,#0e2a4a}
.gm-cookie-baker .cb-st-title{flex:none;font:400 30px/1 var(--cbT);letter-spacing:.5px;text-align:center;padding:10px 0 8px;text-shadow:0 0 4px #000,0 2px 0 #000,0 3px 8px #000;background:linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,0));padding-top:26px}
.gm-cookie-baker .cb-ups{flex:none;display:flex;flex-wrap:wrap;align-content:flex-start;justify-content:center;gap:0;padding:4px;min-height:64px;max-height:176px;overflow-y:auto;background:rgba(0,6,16,.35);scrollbar-width:thin;scrollbar-color:#6a4a2a transparent}
@media (hover:hover) and (pointer:fine){.gm-cookie-baker:not(.cb-nar) .cb-ups{max-height:64px;overflow:hidden;transition:max-height .18s ease-out}.gm-cookie-baker:not(.cb-nar) .cb-ups:hover{max-height:176px;overflow-y:auto}}
.gm-cookie-baker .cb-ups:empty::after{content:'No upgrades available yet';margin:auto;color:rgba(255,255,255,.3);font-style:italic;font-size:12px}
.gm-cookie-baker .cb-up{width:56px;height:56px;padding:0;border:0;border-radius:0;background:var(--cb-crate) 0 0/100% 100%;cursor:pointer;display:grid;place-items:center;position:relative}
.gm-cookie-baker .cb-up img{width:48px;height:48px;pointer-events:none}
.gm-cookie-baker .cb-up:hover{filter:brightness(1.25);z-index:1}
.gm-cookie-baker .cb-up:hover img{transform:translateY(-1px)}
.gm-cookie-baker .cb-up.no img{filter:grayscale(.55) brightness(.5)}
.gm-cookie-baker .cb-up.sel{filter:brightness(1.3);box-shadow:0 0 0 2px #ffd88a,0 0 10px rgba(255,210,120,.8)}
.gm-cookie-baker .cb-bulk{flex:none;display:flex;gap:2px;padding:4px 6px;background:linear-gradient(#24180d,#140d07)}
.gm-cookie-baker .cb-bulk i{flex:1}
.gm-cookie-baker .cb-bulk button{min-width:38px;min-height:28px;padding:2px 8px;border:0;border-radius:3px;background:none;font:400 15px var(--cbT);color:#aa9;text-shadow:0 1px 0 #000;cursor:pointer}
.gm-cookie-baker .cb-bulk button.on{color:#fff;background:rgba(255,220,160,.12);box-shadow:inset 0 0 0 1px rgba(255,220,160,.5);text-shadow:0 0 6px rgba(255,220,140,.8),0 1px 0 #000}
.gm-cookie-baker .cb-prods{flex:1;overflow-y:auto;overflow-x:hidden;background:#0a1624;scrollbar-width:thin;scrollbar-color:#6a4a2a #1a1008}
.gm-cookie-baker .cb-prod{display:grid;grid-template-columns:64px minmax(0,1fr) auto;align-items:center;height:64px;padding:0 10px 0 0;background:var(--cb-paper) 0 0/256px 100% repeat-x,#b5b1a4;cursor:pointer;position:relative;touch-action:pan-y;overflow:hidden}
.gm-cookie-baker .cb-prod::before{content:'';position:absolute;inset:0;pointer-events:none;background:rgba(0,0,0,0);transition:background .15s}
.gm-cookie-baker .cb-prod:hover::before{background:rgba(255,245,220,.12)}
.gm-cookie-baker .cb-prod>img{width:64px;height:64px;pointer-events:none;position:relative;filter:drop-shadow(0 2px 1px rgba(0,0,0,.35))}
.gm-cookie-baker .cb-pt{min-width:0;padding-left:4px;position:relative}
.gm-cookie-baker .cb-pn{font:400 23px/1.12 var(--cbT);letter-spacing:.2px;color:#fff;text-shadow:0 0 3px #000,0 0 1px #000,0 1px 0 #000,0 2px 0 #000,1px 1px 0 #000,-1px 1px 0 #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-bottom:1px}
.gm-cookie-baker .cb-pp{display:flex;align-items:center;gap:3px;font:700 12.5px var(--cbB);color:#6f6;text-shadow:0 0 2px #000,0 1px 0 #000,0 0 4px #000;white-space:nowrap}
.gm-cookie-baker .cb-pp img{width:15px;height:15px}
.gm-cookie-baker .cb-po{position:relative;font:400 42px/1 var(--cbT);color:rgba(56,54,46,.5);text-shadow:0 1px 0 rgba(255,255,245,.35)}
.gm-cookie-baker .cb-prod.no::before{background:rgba(24,34,48,.34)}
.gm-cookie-baker .cb-prod.no .cb-pp{color:#f66}
.gm-cookie-baker .cb-prod.no>img,.gm-cookie-baker .cb-prod.no .cb-pn{opacity:.6}
.gm-cookie-baker .cb-prod.lock{cursor:default}
.gm-cookie-baker .cb-prod.lock::before{background:rgba(12,18,28,.55)}
.gm-cookie-baker .cb-prod.lock>img{filter:brightness(0);opacity:.55}
.gm-cookie-baker .cb-prod.lock .cb-pn{opacity:.5}
.gm-cookie-baker .cb-prod.bump .cb-po{animation:gmCbBump .35s}
@keyframes gmCbBump{50%{transform:scale(1.3);color:#fff}}
.gm-cookie-baker .cb-gcl{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:20;overflow:hidden}
.gm-cookie-baker .cb-gc{position:absolute;width:84px;height:84px;margin:0;pointer-events:auto;cursor:pointer;touch-action:manipulation;transform:translate(-50%,-50%)}
.gm-cookie-baker .cb-gc i{position:absolute;left:-38px;top:-38px;width:160px;height:160px;background:var(--cb-grays) 0 0/100% 100%;pointer-events:none;animation:gmCbSpin 6s linear infinite}
.gm-cookie-baker .cb-gc img{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
@keyframes gmCbSpin{to{transform:rotate(360deg)}}
.gm-cookie-baker .cb-pop{position:absolute;transform:translate(-50%,-50%);text-align:center;font:400 24px/1.15 var(--cbT);color:#fff;text-shadow:0 0 4px #000,0 2px 0 #000,0 0 14px rgba(255,210,90,.8);white-space:nowrap;pointer-events:none;animation:gmCbPop 3s forwards}
.gm-cookie-baker .cb-pop small{display:block;font:700 13px var(--cbB);color:#fff;text-shadow:0 0 3px #000,0 1px 0 #000}
@keyframes gmCbPop{0%{opacity:0;margin-top:10px}10%{opacity:1;margin-top:0}75%{opacity:1}100%{opacity:0;margin-top:-50px}}
.gm-cookie-baker .cb-notes{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);display:flex;flex-direction:column;gap:6px;z-index:25;width:min(320px,92%);pointer-events:none}
.gm-cookie-baker .cb-note{pointer-events:none;display:flex;gap:10px;align-items:center;padding:8px 8px 8px 10px;background:linear-gradient(rgba(30,22,14,.95),rgba(10,7,4,.95));border-radius:3px;box-shadow:0 0 0 1px #000,0 0 0 3px #8a6a40,0 0 0 4px #000,0 6px 16px rgba(0,0,0,.7);animation:gmCbNote .35s cubic-bezier(.2,.8,.2,1)}
.gm-cookie-baker .cb-note img{width:44px;height:44px;flex:none}
.gm-cookie-baker .cb-note div{flex:1;min-width:0}
.gm-cookie-baker .cb-note>div>b{display:block;font:400 15px var(--cbT)}
.gm-cookie-baker .cb-note>div>span{display:block;font-size:12.5px;color:#ddd}
.gm-cookie-baker .cb-note button{pointer-events:auto;flex:none;width:32px;height:32px;border:0;background:none;font:700 18px var(--cbB);opacity:.6;cursor:pointer}
@keyframes gmCbNote{from{transform:translateY(16px);opacity:0}}
.gm-cookie-baker .cb-tip{position:absolute;z-index:30;width:320px;max-width:calc(100% - 20px);padding:9px 11px 10px;background:linear-gradient(#1c150e,#090604);border-radius:3px;box-shadow:0 0 0 1px #000,0 0 0 3px #8a6a40,0 0 0 4px #000,0 8px 20px rgba(0,0,0,.75);font:12.5px/1.4 var(--cbB);pointer-events:none}
.gm-cookie-baker .cb-tip.touch{pointer-events:auto}
.gm-cookie-baker .tt-h{display:flex;gap:8px;align-items:center;margin-bottom:6px}
.gm-cookie-baker .tt-h img{width:44px;height:44px;flex:none}
.gm-cookie-baker .tt-t{flex:1;min-width:0}
.gm-cookie-baker .tt-t b{display:block;font:400 18px/1.15 var(--cbT);letter-spacing:.2px;text-shadow:0 1px 0 #000}
.gm-cookie-baker .tt-t small{color:#bba;font-size:11.5px}
.gm-cookie-baker .tt-p{display:flex;align-items:center;gap:3px;font-weight:700;color:#6f6;white-space:nowrap;align-self:flex-start}
.gm-cookie-baker .tt-p.no{color:#f66}
.gm-cookie-baker .tt-p img{width:14px;height:14px}
.gm-cookie-baker .tt-d{margin:4px 0;color:#eee}
.gm-cookie-baker .tt-q{margin:6px 0 0;color:#cdbf9f;font-style:italic;font-size:11.5px}
.gm-cookie-baker .cb-tip ul{margin:6px 0 0;padding:6px 0 0 14px;border-top:1px solid rgba(255,255,255,.15);color:#ddd;font-size:12px}
.gm-cookie-baker .cb-tip li{margin:2px 0}
.gm-cookie-baker .cb-tip .cb-btn{display:block;width:100%;margin-top:8px}
.gm-cookie-baker .cb-heaven{position:absolute;inset:0;z-index:28;overflow-y:auto;padding:22px 18px 28px;text-align:center;background:radial-gradient(1px 1px at 20% 30%,#fff,transparent),radial-gradient(1px 1px at 70% 20%,#fff,transparent),radial-gradient(1.5px 1.5px at 40% 70%,#fff,transparent),radial-gradient(1px 1px at 85% 60%,#fff,transparent),radial-gradient(1px 1px at 10% 85%,#fff,transparent),radial-gradient(circle at 50% 30%,#4a3a8a,#1a1240 60%,#08061a)}
.gm-cookie-baker .cb-heaven p{margin:4px 0;color:#e8e0ff}
.gm-cookie-baker .cb-tree{position:relative;width:min(100%,83vh,820px);aspect-ratio:1.6/1;margin:-6% auto 6px;border-radius:10px;background:radial-gradient(ellipse at 50% 92%,rgba(255,240,180,.22),rgba(255,255,255,0) 60%)}
.gm-cookie-baker.cb-nar .cb-tree{width:100%;aspect-ratio:1/1.1}
.gm-cookie-baker .cb-tree svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.gm-cookie-baker .cb-tree line{stroke:rgba(255,255,255,.22);stroke-width:2.5;vector-effect:non-scaling-stroke}
.gm-cookie-baker .cb-tree line.on{stroke:#ffe680;stroke-width:3.5}
.gm-cookie-baker .cb-hn{position:absolute;width:9.5%;aspect-ratio:1;transform:translate(-50%,-50%);padding:0;border-radius:50%;border:2px solid rgba(255,255,255,.3);background:rgba(20,14,50,.8);cursor:pointer;opacity:.4;min-width:30px}
.gm-cookie-baker .cb-hn img{width:100%;height:100%;display:block;border-radius:50%}
.gm-cookie-baker .cb-hn.ok{opacity:1;border-color:#fff;box-shadow:0 0 10px rgba(255,255,255,.7)}
.gm-cookie-baker .cb-hn.own{opacity:1;border-color:#ffe680;box-shadow:0 0 12px #ffd24a}
.gm-cookie-baker .cb-hn.sel{outline:3px solid #8fd0ff;outline-offset:2px;opacity:1}
.gm-cookie-baker .cb-hd{max-width:520px;margin:6px auto 12px;padding:10px 14px;border-radius:8px;background:rgba(0,0,20,.4);min-height:92px;font-size:13px}
.gm-cookie-baker .cb-hd b{font:400 20px var(--cbT)}
.gm-cookie-baker .cb-hd .q{font-style:italic;color:#b8b0d8;font-size:12px}
.gm-cookie-baker .cb-hd em{font-style:normal;font-weight:700;color:#ffe680}
.gm-cookie-baker .cb-lump{position:absolute;left:8px;top:8px;z-index:5;width:46px;height:46px;padding:0;border:0;border-radius:50%;background:rgba(0,10,30,.45);cursor:pointer;transform:scale(var(--g,1));transform-origin:0 0}
.gm-cookie-baker .cb-lump img{width:100%;height:100%;display:block;image-rendering:auto;pointer-events:none}
.gm-cookie-baker .cb-lump.mature{box-shadow:0 0 8px rgba(255,236,150,.6)}
.gm-cookie-baker .cb-lump.ripe{box-shadow:0 0 14px #fff2a0;animation:gmCbLump 1.1s ease-in-out infinite}
@keyframes gmCbLump{50%{filter:brightness(1.35)}}
.gm-cookie-baker .cb-rein{margin:6px auto;box-shadow:0 4px 16px rgba(0,0,0,.6)}
.gm-cookie-baker .cb-mini,.gm-cookie-baker .cb-tabs{display:none}
.gm-cookie-baker.cb-nar{grid-template-columns:100%;grid-template-rows:auto minmax(0,1fr) 60px;height:clamp(440px,calc(100dvh - var(--goff,250px)),900px);border-radius:12px}
.gm-cookie-baker.cb-nar .cb-sep{display:none}
.gm-cookie-baker.cb-nar .cb-pane{grid-column:1;grid-row:2}
.gm-cookie-baker.cb-nar .cb-pane:not(.on){display:none}
.gm-cookie-baker.cb-nar .cb-tickL{display:flex;position:absolute;left:0;right:0;top:0;z-index:3;height:42px;min-height:0;padding:3px 10px;font-size:12px;line-height:1.2}
.gm-cookie-baker.cb-nar .cb-tickL span{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.gm-cookie-baker.cb-nar .cb-head{top:42px}
.gm-cookie-baker.cb-nar .cb-tickM{display:none}
.gm-cookie-baker.cb-nar .cb-mc{flex:1}
.gm-cookie-baker.cb-nar .cb-mini.on{display:flex;grid-row:1;justify-content:space-between;align-items:center;gap:8px;padding:7px 12px;background:#000;border-bottom:2px solid #3a2614;font:400 14px var(--cbT)}
.gm-cookie-baker.cb-nar .cb-mini span{font-size:12px;color:#ddd;white-space:nowrap}
.gm-cookie-baker.cb-nar .cb-tabs{display:grid;grid-row:3;grid-template-columns:repeat(4,1fr);background:linear-gradient(#4a3018,#1e1309);border-top:3px solid #120b05}
.gm-cookie-baker .cb-tabs button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border:0;background:none;font:700 11.5px var(--cbB);opacity:.65;cursor:pointer;touch-action:manipulation}
.gm-cookie-baker .cb-tabs button img{width:30px;height:30px}
.gm-cookie-baker .cb-tabs button.on{opacity:1;background:rgba(255,210,120,.14);box-shadow:inset 0 3px 0 #ffd88a}
.gm-cookie-baker.cb-nar .cb-notes{bottom:68px;width:min(300px,88%);gap:4px}
.gm-cookie-baker.cb-nar .cb-note{padding:4px 4px 4px 8px;gap:8px}
.gm-cookie-baker.cb-nar .cb-note img{width:30px;height:30px}
.gm-cookie-baker.cb-nar .cb-note>div>b{font-size:13px}
.gm-cookie-baker.cb-nar .cb-note span{font-size:11.5px}
.gm-cookie-baker.cb-nar .cb-prod{height:66px}
.gm-cookie-baker.cb-nar .cb-ups{max-height:132px}
.gm-cookie-baker.cb-nar .cb-panel{padding:12px 14px 22px}
.gm-cookie-baker.cb-nar .cb-mc{flex-direction:row;width:auto}
.gm-cookie-baker.cb-nar .cb-mc .cb-mb{width:auto}
.gm-cookie-baker.cb-nar .cb-tabs{background:var(--cb-ph) 0 0/256px 100% repeat-x,#3a2614;border-top:2px solid #000}
.gm-cookie-baker .cb-tabs button{font:400 13px var(--cbT);text-shadow:0 1px 0 #000}
.gm-cookie-baker.cb-nar .cb-mini.on{background:linear-gradient(#1a120a,#000);border-bottom:2px solid #000;box-shadow:0 2px 0 #6a4a2a}
`;

  Ameplay.register({
    id: ID,
    title: 'Cookie Baker',
    category: 'Idle',
    tint: '#d9923b',
    blurb: 'Click the big cookie, hire grandmas and bake your way to infinity.',
    help: 'Click or tap the big cookie · buy buildings and upgrades in the store · <kbd>Ctrl</kbd>/<kbd>Shift</kbd> + click buys 10/100 · catch golden cookies · progress saves on its own',
    better: 'high',
    format: v => beautify(v),
    width: 1120,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 7c3 2 6 1 8 3s1 5 3 7 5 2 6 5-1 5 0 8 4 5 3 8-4 4-5 7 0 6-3 8-6 0-8 2-4 4-7 4-5-2-8-2-6 1-8-1-1-5-3-7-5-3-6-6 1-5 0-8-3-5-2-8 4-4 5-7-1-6 2-8 6 0 8-2 3-4 6-4z"/><circle cx="24" cy="24" r="3"/><circle cx="38" cy="22" r="2.5"/><circle cx="40" cy="38" r="3"/><circle cx="26" cy="40" r="2.5"/><circle cx="32" cy="31" r="1.5"/></svg>',
    css: CSS,
    mount(root, api) {
      const R = root;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      try {
        if (!document.querySelector('link[data-cb-font]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Kavoon&family=Merriweather:wght@400;700;900&display=swap'; l.setAttribute('data-cb-font', '1'); document.head.append(l); }
      } catch (e) {}
      for (const [k, f] of [['--cb-wood', woodURL], ['--cb-paper', paperURL], ['--cb-dwood', darkWoodURL], ['--cb-blue', blueURL], ['--cb-pv', panelV], ['--cb-ph', panelH], ['--cb-crate', crateURL], ['--cb-grays', goldRaysURL]]) R.style.setProperty(k, `url(${f()})`);
      const num = (v, d) => (typeof v === 'number' && isFinite(v) && v >= 0 ? v : d);
      const fresh = () => ({ lumps: 0, lumpTot: 0, lumpStart: 0, lumpTy: 0, lvl: B.map(() => 0), wr: [], pops: 0, pledge: 0, pledges: 0, v: 1, cookies: 0, earned: 0, allTime: 0, forfeit: 0, handmade: 0, handAll: 0, clicks: 0, clicksAll: 0, gc: 0, gcRun: 0, b: B.map(() => 0), free: B.map(() => 0), made: B.map(() => 0), up: [], unl: [], ach: [], heav: [], prestige: 0, chips: 0, ascends: 0, rev: 0, runStart: Date.now(), gameStart: Date.now(), news: 0, sold: 0, named: 0, name: randName(), t: Date.now(), subBand: 0, leftBand: 0, lastSub: 0, gcT: 0, frenzy: 0, frenzyMax: 0, cfrenzy: 0, cfMax: 0, cfCount: 0, heaven: 0, prefs: { p: 1, n: 1, sh: 0, vol: 50, m: 1, c: 1, ml: -1 } });
      function loadState(o) {
        const f = fresh();
        if (!o || o.v !== 1) return f;
        for (const k of ['cookies', 'earned', 'allTime', 'forfeit', 'handmade', 'handAll', 'clicks', 'clicksAll', 'gc', 'gcRun', 'prestige', 'chips', 'ascends', 'news', 'sold', 'named', 'subBand', 'leftBand', 'lastSub', 'gcT', 'frenzy', 'frenzyMax', 'cfrenzy', 'cfMax', 'cfCount', 'heaven', 'runStart', 'gameStart', 't', 'lumps', 'lumpTot', 'lumpStart', 'lumpTy', 'pops', 'pledge', 'pledges']) f[k] = num(o[k], f[k]);
        f.lvl = B.map((_, i) => Math.floor(num(Array.isArray(o.lvl) ? o.lvl[i] : 0, 0)));
        f.wr = (Array.isArray(o.wr) ? o.wr : []).slice(0, 10).map((w, i) => ({ slot: i, c: num(w && w.c, 0), h: 0 }));
        f.allTime = Math.max(f.allTime, f.earned);
        f.rev = Number.isInteger(o.rev) ? Math.max(0, Math.min(NB - 1, o.rev)) : 0;
        for (const k of ['b', 'free', 'made']) f[k] = B.map((_, i) => num(Array.isArray(o[k]) ? o[k][i] : 0, 0));
        f.b = f.b.map(Math.floor); f.free = f.free.map((v, i) => Math.min(Math.floor(v), f.b[i]));
        const ok = { up: UPMAP, unl: UPMAP, ach: ACHMAP, heav: HMAP };
        for (const k in ok) f[k] = Array.isArray(o[k]) ? o[k].filter(x => typeof x === 'string' && ok[k][x]) : [];
        if (typeof o.name === 'string' && o.name) f.name = o.name.replace(/[<>&"]/g, '').slice(0, 40);
        if (o.prefs) f.prefs = { p: o.prefs.p === 0 ? 0 : 1, n: o.prefs.n === 0 ? 0 : 1, sh: o.prefs.sh ? 1 : 0, m: o.prefs.m === 0 ? 0 : 1, c: o.prefs.c === 0 ? 0 : 1, ml: Number.isInteger(o.prefs.ml) && o.prefs.ml >= 0 && o.prefs.ml < MILK.length ? o.prefs.ml : -1, vol: Number.isFinite(o.prefs.vol) ? Math.max(0, Math.min(100, Math.round(o.prefs.vol))) : 50 };
        return f;
      }
      let s = loadState(api.load());
      const up = new Set(s.up), unl = new Set(s.unl), ach = new Set(s.ach), heav = new Set(s.heav);
      const F = (v, f) => beautify(v, f, s.prefs.sh);

      R.innerHTML = `
<div class="cb-pane cb-L on">
  <canvas class="cb-cv"></canvas>
  <div class="cb-tick cb-tickL"><span></span></div>
  <div class="cb-head"><button class="cb-name" type="button"></button><div class="cb-count"><div class="cb-n"></div><div class="cb-cps"></div></div></div>
  <div class="cb-buffs"></div>
</div>
<div class="cb-sep a"></div>
<div class="cb-pane cb-M">
  <div class="cb-menu"><div class="cb-mc"><button class="cb-mb" data-m="opt" type="button">Options</button><button class="cb-mb" data-m="stats" type="button">Stats</button></div><div class="cb-tick cb-tickM"><span></span></div><div class="cb-mc"><button class="cb-mb" data-m="info" type="button">Info</button><button class="cb-mb" data-m="leg" type="button">Legacy</button></div></div>
  <div class="cb-hp"></div>
  <div class="cb-mid"><div class="cb-rows"><div class="cb-empty">Your buildings will show up here.<br>Buy a grandma to get started!</div></div><button class="cb-lump" type="button" data-tip="l:0" aria-label="Sugar lump" hidden><img alt="" draggable="false"></button><div class="cb-panel" hidden><button class="cb-x" type="button" aria-label="Close">&times;</button><div class="cb-pin"></div></div></div>
</div>
<div class="cb-sep b"></div>
<div class="cb-pane cb-R">
  <div class="cb-st-title">Store</div>
  <div class="cb-ups"></div>
  <div class="cb-hp"></div>
  <div class="cb-bulk"><button data-bm="0" class="on" type="button">Buy</button><button data-bm="1" type="button">Sell</button><i></i><button data-bq="1" class="on" type="button">1</button><button data-bq="10" type="button">10</button><button data-bq="100" type="button">100</button></div>
  <div class="cb-prods"></div>
</div>
<div class="cb-mini"><b></b><span></span></div>
<div class="cb-tabs"><button data-t="L" class="on" type="button"><img alt="" src="${scURL()}">Bakery</button><button data-t="R" type="button"><img alt="" src="${iconURL(['cur', 0])}">Store</button><button data-t="M" type="button"><img alt="" src="${bldURL(1)}">Buildings</button><button data-t="S" type="button"><img alt="" src="${iconURL(['ckA', 6])}">Stats</button></div>
<div class="cb-gcl"></div>
<div class="cb-notes"></div>
<div class="cb-tip" hidden></div>
<div class="cb-heaven" hidden></div>`;
      const $ = q => R.querySelector(q);
      const paneL = $('.cb-L'), paneM = $('.cb-M'), paneR = $('.cb-R'), cv = $('.cb-cv'), lx = cv.getContext('2d');
      const head = $('.cb-head'), nameEl = $('.cb-name'), countEl = $('.cb-n'), cpsEl = $('.cb-cps'), buffsEl = $('.cb-buffs');
      const tickEls = [$('.cb-tickL span'), $('.cb-tickM span')];
      const rowsEl = $('.cb-rows'), emptyEl = $('.cb-empty'), panelEl = $('.cb-panel'), pinEl = $('.cb-pin');
      const upsEl = $('.cb-ups'), bulkEl = $('.cb-bulk'), prodsEl = $('.cb-prods');
      const miniEl = $('.cb-mini'), tabsEl = $('.cb-tabs'), gcl = $('.cb-gcl'), notesEl = $('.cb-notes'), tipEl = $('.cb-tip'), heavenEl = $('.cb-heaven'), lumpEl = $('.cb-lump');
      const setCls = (el, c, on) => { if (el.classList.contains(c) !== !!on) el.classList.toggle(c, !!on); };
      const setText = (el, t) => { t = String(t); if (el.textContent !== t) el.textContent = t; };

      const milkRank = () => Math.min(24, Math.floor(C.milk));
      const milkShown = () => s.prefs.ml >= 0 && heav.has('cd') && (s.prefs.ml < 25 || heav.has('fd')) ? s.prefs.ml : milkRank();
      let ac = null, master = null;
      const actx = () => {
        if (api.muted) return null;
        if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = s.prefs.vol / 100; master.connect(ac.destination); } catch (e) { ac = null; return null; } }
        if (ac.state === 'suspended') ac.resume().catch(() => {});
        return ac;
      };
      const tone = (f0, f1, dur, type, vol, delay) => {
        const a = actx(); if (!a) return;
        const t0 = a.currentTime + (delay || 0), o = a.createOscillator(), g = a.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t0); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.03);
      };
      const SFX = {
        click: () => { const f = 260 + Math.random() * 120; tone(f * 2, f * 0.7, 0.07, 'sine', 0.28); tone(f * 4, f * 3, 0.025, 'triangle', 0.05); },
        buy: () => { tone(880, 880, 0.08, 'triangle', 0.12); tone(1318, 1318, 0.16, 'triangle', 0.1, 0.06); },
        sell: () => { tone(700, 420, 0.16, 'triangle', 0.12); },
        up: () => { [784, 988, 1175].forEach((f, i) => tone(f, f, 0.14, 'triangle', 0.1, i * 0.05)); },
        gcSpawn: () => { [1568, 2093, 2637, 2093].forEach((f, i) => tone(f, f, 0.3, 'sine', 0.045, i * 0.08)); },
        gcClick: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f, 0.24, 'triangle', 0.1, i * 0.05)); },
        ach: () => { [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, f, 0.6, 'sine', 0.06, i * 0.04)); }
      };
      const sfx = k => { if (!api.muted) SFX[k](); };
      api.on(R, 'pointerdown', () => actx(), true);

      const C = { gp: 0, udisc: 1, bc: B.map(() => 0), raw: 0, glob: 1, base: 0, cps: 0, click: 1, add: 0, c2: 1, mice: 0, gcF: 1, gcStay: 1, gcD: 1, disc: 1, milk: 0, ck: 1, kit: 1 };
      function buffs() {
        C.cps = C.base * (s.frenzy > 0 ? CFG.FRENZY_MULT : 1) * (1 - 0.05 * s.wr.length);
        C.click = (C.c2 + C.add + C.cps * CFG.MOUSE_PCT * C.mice) * (s.cfrenzy > 0 ? CFG.CF_MULT : 1);
      }
      function recalc() {
        const milk = ach.size * CFG.MILK_PER_ACH;
        PLEDGES = s.pledges;
        let cur = 0, fing = 0, fm = 1, mice = 0, ck = 1, kit = 1, gcF = 1, gcD = 1, gts = 0, gm = 1, gadd = 0, gp = 0;
        const tier = B.map(() => 0), gt = B.map(() => false);
        for (const id of up) {
          const u = UPMAP[id];
          if (u.kind === 'cur') cur++;
          else if (u.kind === 'fing') { if (u.pow) fm *= u.pow; else fing = CFG.THOUSAND_ADD; }
          else if (u.kind === 'tier') tier[u.b]++;
          else if (u.kind === 'gt') { gt[u.b] = true; gts++; }
          else if (u.kind === 'ck') ck *= 1 + u.pow / 100;
          else if (u.kind === 'mouse') mice++;
          else if (u.kind === 'kit') kit *= 1 + milk * u.pow * (heav.has('ka') ? 1.1 : 1);
          else if (u.kind === 'gp') { if (!u.stage) gm *= 4; gadd += u.add; gp = Math.max(gp, u.stage); }
          else if (u.kind === 'gold') { if (u.pow === 'f') gcF *= 2; else gcD *= 2; }
        }
        const nonCur = s.b.reduce((a, v) => a + v, 0) - s.b[0];
        const add = fing * fm * nonCur, c2 = Math.pow(2, cur);
        C.bc[0] = (0.1 * c2 + add) * (1 + 0.01 * s.lvl[0]);
        for (let i = 1; i < NB; i++) {
          let m = Math.pow(2, tier[i]);
          if (i === 1) m *= Math.pow(2, gts) * gm;
          if (gt[i]) m *= 1 + s.b[1] * 0.01 / (i - 1);
          C.bc[i] = (B[i][3] + (i === 1 ? gadd * s.b[1] : 0)) * m * (1 + 0.01 * s.lvl[i]);
        }
        let raw = 0; for (let i = 0; i < NB; i++) raw += C.bc[i] * s.b[i];
        C.ck = ck; C.kit = kit;
        C.glob = (1 + s.prestige * CFG.PRESTIGE_BONUS) * (heav.has('hc') ? 1.1 : 1) * (heav.has('sb') ? 1 + Math.min(100, s.lumps) / 100 : 1) * ck * kit;
        C.raw = raw; C.base = raw * C.glob; C.add = add; C.c2 = c2; C.mice = mice; C.milk = milk;
        C.gp = gp; C.gcStay = gcF * (heav.has('dd') ? 1.05 : 1); C.gcF = gcF * (heav.has('hl') ? 1.05 : 1); C.gcD = gcD * (heav.has('lf') ? 1.1 : 1);
        C.disc = (heav.has('cc') ? 0.99 : 1) * (heav.has('dc') ? 0.99 : 1); C.udisc = heav.has('dp') ? 0.95 : 1;
        buffs();
      }
      const upPrice = u => u.price * C.udisc;
      const priceAt = (i, k) => B[i][2] * C.disc * Math.pow(CFG.PRICE_GROWTH, Math.max(0, k - s.free[i]));
      const buyCost = (i, n) => { let t = 0; for (let k = 0; k < n; k++) t += priceAt(i, s.b[i] + k); return Math.ceil(t); };
      const sellGain = (i, n) => { let t = 0; n = Math.min(n, s.b[i]); for (let k = 1; k <= n; k++) t += priceAt(i, s.b[i] - k); return Math.floor(t * CFG.SELL_RATE); };
      const prestigeFor = v => Math.floor(Math.cbrt(v / CFG.PRESTIGE_DIV));
      const earn = v => { s.cookies += v; s.earned += v; s.allTime += v; };

      function note(title, text, icon, life) {
        const el = document.createElement('div'); el.className = 'cb-note';
        el.innerHTML = `${icon ? `<img alt="" src="${icon}">` : ''}<div><b>${title}</b><span>${text}</span></div><button type="button" aria-label="Close">&times;</button>`;
        notesEl.prepend(el);
        while (notesEl.children.length > (nar ? 2 : 3)) notesEl.lastElementChild.remove();
        el.querySelector('button').addEventListener('click', () => el.remove());
        api.timeout(() => el.remove(), (life || 6) * 1000);
      }

      function checkAch() {
        let got = 0;
        for (const a of ACH) if (!ach.has(a.id) && a.test(s, C, ach, up)) { ach.add(a.id); got++; if (got <= 3) note('Achievement unlocked', a.name, iconURL(a.icon), 5); }
        if (got) { recalc(); sfx('ach'); }
      }
      function checkUnlocks() {
        for (const u of UP) if (!unl.has(u.id) && u.unlock(s, ach, up)) unl.add(u.id);
        while (s.rev < NB - 1 && (s.cookies >= B[s.rev + 1][2] * C.disc || s.b[s.rev + 1] > 0)) s.rev++;
      }

      const L = { W: 0, H: 0, top: 0, R0: 100, cx: 0, cy: 0, big: null, bigR: 0, bg: null, sc: 1, sv: 0, hov: false, hw: -1 };
      const rain = [], flings = [], nums = [];
      let rainAcc = 0;
      function makeBg(W, H) {
        const c = mk(W * dpr, H * dpr), x = c.getContext('2d'); x.scale(dpr, dpr);
        x.fillStyle = x.createPattern(blueTile(), 'repeat'); x.fillRect(0, 0, W, H);
        x.globalCompositeOperation = 'soft-light'; x.fillStyle = rad(x, W / 2, H * 0.42, 10, Math.max(W, H) * 0.8, ['#9cc8ff', '#3a6aa8', '#0a1a3a']); x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over';
        x.fillStyle = rad(x, W / 2, H / 2, Math.min(W, H) * 0.3, Math.max(W, H) * 0.78, ['rgba(0,0,20,0)', 'rgba(0,5,25,.55)']); x.fillRect(0, 0, W, H);
        x.fillStyle = lin(x, 0, 0, 0, 90, ['rgba(0,0,0,.35)', 'rgba(0,0,0,0)']); x.fillRect(0, 0, W, 90);
        return c;
      }
      function geom() {
        const hb = head.offsetTop + head.offsetHeight;
        buffsEl.style.top = (hb + 6) + 'px';
        L.top = hb + 52;
        const avail = L.H - L.top;
        L.R0 = Math.max(48, Math.min(128, L.W * 0.36, avail * 0.3));
        L.cx = L.W / 2;
        L.cy = Math.max(L.top + L.R0 + 8, L.top + avail * 0.4);
        if (Math.abs(L.bigR - L.R0) > 0.5) {
          L.bigR = L.R0;
          const sz = (L.R0 * 2 + 40) * dpr, c = mk(sz, sz), x = c.getContext('2d');
          x.scale(dpr, dpr);
          x.save(); x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 18; x.shadowOffsetY = 8; circ(x, L.R0 + 20, L.R0 + 20, L.R0 * 0.97); x.fillStyle = '#6a3a14'; x.fill(); x.restore();
          drawBigCookie(x, L.R0 + 20, L.R0 + 20, L.R0);
          L.big = c;
        }
      }

      const rows = B.map((b, i) => {
        if (!i) return null;
        const c = document.createElement('canvas'); c.className = 'cb-row'; c.hidden = true; rowsEl.append(c);
        api.on(c, 'click', e => { const r = c.getBoundingClientRect(), w = rows[i].w || r.width, px = (e.clientX - r.left) * (w / (r.width || 1)), py = (e.clientY - r.top) * (CFG.ROW_H / (r.height || 1)); if (s.lumpStart && s.b[i] && px > w - 78 && py < 28) levelUp(i); });
        return { c, x: c.getContext('2d'), w: 0, bg: null, i };
      });
      function rowBg(i, w) {
        const h = CFG.ROW_H, c = mk(w * dpr, h * dpr), x = c.getContext('2d'); x.scale(dpr, dpr);
        const th = ROWBG[i], r = rng(i * 97 + 13), hh = h - 10;
        x.fillStyle = lin(x, 0, 0, 0, hh, th.g); x.fillRect(0, 0, w, hh);
        x.save(); x.beginPath(); x.rect(0, 0, w, hh); x.clip(); th.p(x, w, hh, r); x.restore();
        x.fillStyle = lin(x, 0, hh, 0, h, ['#9a6a36', '#6a4220', '#3a220e']); x.fillRect(0, hh, w, 10);
        x.fillStyle = 'rgba(0,0,0,.5)'; x.fillRect(0, hh - 1, w, 1);
        x.fillStyle = 'rgba(255,220,170,.3)'; x.fillRect(0, hh, w, 1);
        x.fillStyle = 'rgba(40,20,6,.35)'; for (let k = 0; k < w; k += 70) x.fillRect(k + r() * 20, hh + 3, 30, 1);
        const vg = x.createLinearGradient(0, 0, w, 0); vg.addColorStop(0, 'rgba(0,0,0,.4)'); vg.addColorStop(0.06, 'rgba(0,0,0,0)'); vg.addColorStop(0.94, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.4)');
        x.fillStyle = vg; x.fillRect(0, 0, w, hh);
        return c;
      }
      function drawRow(r, t) {
        const x = r.x, w = r.w, i = r.i, n = s.b[i];
        x.setTransform(dpr, 0, 0, dpr, 0, 0);
        x.drawImage(r.bg, 0, 0, w, CFG.ROW_H);
        const span = w - 64, cnt = Math.min(n, Math.floor(span / 11) + 1), step = cnt > 1 ? Math.min(34, span / (cnt - 1)) : 0, spr = bldSprite(i), sz = i === 1 ? 46 : 50;
        for (let lane = 0; lane < 2; lane++) for (let k = lane; k < cnt; k += 2) {
          const h1 = Math.sin(k * 12.9898 + i * 78.233) * 43758.5453, j = h1 - Math.floor(h1);
          const bob = (i === 1 || i === 8 || i === 12) ? Math.sin(t * (i === 1 ? 3 : 2) + k * 1.7) * (i === 1 ? 1.2 : 2) : 0;
          const px = 8 + k * step + (j - 0.5) * 4, py = (lane ? 46 : 14) + (j - 0.5) * 6 + bob;
          x.drawImage(spr, px, py, sz, sz);
        }
        if (s.lumpStart && n) {
          x.fillStyle = 'rgba(0,0,0,.55)'; rrect(x, w - 74, 4, 68, 20, 4); x.fill(); x.strokeStyle = 'rgba(255,230,160,.45)'; x.lineWidth = 1; x.stroke();
          x.font = '13px Kavoon, Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = s.lumps > s.lvl[i] ? '#ffe9a0' : '#b8b0a0'; x.fillText('Lvl ' + s.lvl[i], w - 40, 14.5);
        }
      }

      const prodEls = B.map((b, i) => {
        const el = document.createElement('div');
        el.className = 'cb-prod'; el.dataset.tip = 'b:' + i; el.dataset.i = i; el.hidden = true; el.style.backgroundPosition = `${-((i * 137) % 320)}px 0`;
        el.innerHTML = `<img alt="" draggable="false" src="${bldURL(i)}"><div class="cb-pt"><div class="cb-pn"></div><div class="cb-pp"><img alt="" src="${scURL()}"><span></span></div></div><div class="cb-po"></div>`;
        el._n = el.querySelector('.cb-pn'); el._p = el.querySelector('.cb-pp span'); el._o = el.querySelector('.cb-po');
        el._n.style.fontSize = B[i][0].length > 12 ? '18px' : '';
        prodsEl.append(el);
        return el;
      });
      let bulkN = 1, bulkSell = false;
      function refreshStore() {
        for (let i = 0; i < NB; i++) {
          const el = prodEls[i], st = i <= s.rev ? 1 : i <= s.rev + 2 ? 2 : 0;
          el.hidden = !st;
          if (!st) continue;
          const lock = st === 2;
          setCls(el, 'lock', lock);
          setText(el._n, lock ? '???' : B[i][0]);
          const price = bulkSell ? sellGain(i, bulkN) : buyCost(i, bulkN);
          setCls(el, 'no', lock || (bulkSell ? s.b[i] <= 0 : s.cookies < price));
          setText(el._p, F(price));
          setText(el._o, s.b[i] || '');
        }
        let any = false;
        for (let i = 1; i < NB; i++) { const on = s.b[i] > 0; if (rows[i].c.hidden === on) rows[i].c.hidden = !on; any = any || on; }
        emptyEl.hidden = any;
      }
      let upSig = null;
      function refreshUps() {
        const list = UP.filter(u => unl.has(u.id) && !up.has(u.id)).sort((a, b) => a.price - b.price);
        const vis = list.filter(u => u.kind !== 'pledge' || s.pledge <= 0);
        list.length = 0; list.push(...vis);
        const sig = list.map(u => u.id).join();
        if (sig !== upSig) {
          upSig = sig;
          upsEl.innerHTML = list.map(u => `<button class="cb-up" type="button" data-tip="u:${u.id}" data-u="${u.id}"><img alt="" draggable="false" src="${iconURL(u.icon)}"></button>`).join('');
        }
        for (const el of upsEl.children) setCls(el, 'no', s.cookies < upPrice(UPMAP[el.dataset.u]));
      }

      let gc = null;
      function spawnGC() {
        const W = R.clientWidth, H = R.clientHeight, top = nar ? 90 : 60, bot = nar ? 130 : 60;
        const x = 50 + Math.random() * Math.max(10, W - 100), y = top + Math.random() * Math.max(10, H - top - bot);
        const el = document.createElement('div');
        el.className = 'cb-gc'; el.setAttribute('role', 'button'); el.setAttribute('aria-label', 'Golden cookie');
        el.innerHTML = `<i></i><img alt="" draggable="false" src="${goldURL()}">`;
        el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.opacity = '0';
        el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); collectGC(); });
        gcl.append(el);
        const life = CFG.GC_LIFE * C.gcStay;
        gc = { el, x, y, life, t: 0 };
        s.gcT = 0;
        sfx('gcSpawn');
      }
      function removeGC() { if (gc) { gc.el.remove(); gc = null; } s.gcT = 0; }
      function pop(x, y, html) {
        const W = R.clientWidth;
        const el = document.createElement('div'); el.className = 'cb-pop'; el.innerHTML = html;
        el.style.left = Math.max(130, Math.min(W - 130, x)) + 'px'; el.style.top = y + 'px';
        gcl.append(el);
        api.timeout(() => el.remove(), 3100);
      }
      const sparks = [];
      let flash = 0;
      function burst() {
        flash = 1;
        if (!L.W) return;
        for (let k = 0; k < 36; k++) { const a = Math.random() * TAU, v = 160 + Math.random() * 320; sparks.push({ x: L.cx, y: L.cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, t: 0, s: 2 + Math.random() * 4 }); }
        if (s.prefs.p) for (let k = 0; k < 24 && flings.length < 90; k++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, v = 260 + Math.random() * 280; flings.push({ x: L.cx, y: L.cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * TAU, vr: (Math.random() - 0.5) * 10, t: 0, s: 16 + Math.random() * 14 }); }
      }
      function collectGC() {
        if (!gc) return;
        const { x, y } = gc;
        removeGC();
        s.gc++; s.gcRun++;
        const list = ['frenzy', 'lucky'];
        if (Math.random() < CFG.CF_CHANCE) list.push('click');
        const ef = list[Math.floor(Math.random() * list.length)];
        let msg;
        if (ef === 'frenzy') { const d = Math.ceil(CFG.FRENZY_TIME * C.gcD); s.frenzy = s.frenzyMax = d; msg = `Frenzy<small>Cookie production x${CFG.FRENZY_MULT} for ${d} seconds!</small>`; }
        else if (ef === 'click') { const d = Math.ceil(CFG.CF_TIME * C.gcD); s.cfrenzy = s.cfMax = d; s.cfCount++; msg = `Click frenzy<small>Clicking power x${CFG.CF_MULT} for ${d} seconds!</small>`; }
        else { const v = Math.min(s.cookies * CFG.LUCKY_BANK, C.cps * CFG.LUCKY_SECS) + CFG.LUCKY_FLAT; earn(v); msg = `Lucky!<small>+${F(v)} cookies!</small>`; burst(); }
        buffs(); syncBuffs(); pop(x, y, msg); sfx('gcClick'); checkAch(); checkUnlocks();
      }
      let buffEls = [];
      function syncBuffs() {
        const list = [];
        if (s.frenzy > 0) list.push(['Frenzy', 'frenzy', 'frenzyMax']);
        if (s.cfrenzy > 0) list.push(['Click frenzy', 'cfrenzy', 'cfMax']);
        buffsEl.innerHTML = list.map(b => `<div class="cb-buff"><img alt="" src="${goldURL()}"><i></i>${b[0]}<br><span></span></div>`).join('');
        buffEls = list.map((b, k) => ({ k: b[1], m: b[2], el: buffsEl.children[k] }));
        tickBuffs();
      }
      function tickBuffs() {
        for (const b of buffEls) {
          const left = Math.max(0, s[b.k]);
          b.el.querySelector('i').style.width = (100 * left / Math.max(1, s[b.m])) + '%';
          setText(b.el.querySelector('span'), Math.floor(left / 60) + ':' + String(Math.floor(left % 60)).padStart(2, '0'));
        }
      }

      let newsT = 0, newsLast = [];
      function nextNews() {
        const pool = NEWS.filter(n => n[1](s, C) && !newsLast.includes(n[0]));
        const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)][0] : NEWS[16][0];
        newsLast.push(pick); if (newsLast.length > 8) newsLast.shift();
        for (const el of tickEls) { el.innerHTML = `<em>News :</em> ${pick}`; el.classList.remove('a'); void el.offsetWidth; el.classList.add('a'); }
        newsT = 0;
      }
      const tickClick = () => { s.news++; nextNews(); checkAch(); };
      tickEls.forEach(el => api.on(el.parentNode, 'click', tickClick));

      const tip = { key: null, el: null, touch: false };
      const priceHTML = (v, ok, chips) => `<div class="tt-p${ok ? '' : ' no'}">${chips ? '' : `<img alt="" src="${scURL()}">`}${F(v)}${chips ? ' chips' : ''}</div>`;
      function tipHTML(key, touch) {
        const [k, v] = key.split(':');
        if (k === 'b') {
          const i = +v;
          if (i > s.rev) return `<div class="tt-h"><img alt="" src="${bldURL(i)}" style="filter:brightness(0)"><div class="tt-t"><b>???</b><small>Keep baking to reveal this building.</small></div>${priceHTML(buyCost(i, 1), false)}</div>`;
          const n = s.b[i], mult = s.frenzy > 0 ? CFG.FRENZY_MULT : 1, each = C.bc[i] * C.glob * mult, tot = each * n, pct = C.cps > 0 ? tot / C.cps * 100 : 0;
          const price = bulkSell ? sellGain(i, bulkN) : buyCost(i, bulkN);
          const nm = B[i][0].toLowerCase();
          return `<div class="tt-h"><img alt="" src="${bldURL(i)}"><div class="tt-t"><b>${B[i][0]}</b><small>owned: ${n}${bulkN > 1 ? ` · ${bulkSell ? 'sell' : 'buy'} ${bulkN}` : ''}</small></div>${priceHTML(price, bulkSell ? n > 0 : s.cookies >= price)}</div>
<div class="tt-q">&ldquo;${B[i][4]}&rdquo;</div>
${n ? `<ul><li>each ${nm} produces <b>${F(each, 1)}</b> cookie${each === 1 ? '' : 's'} per second</li><li>${n} ${n === 1 ? nm : B[i][1]} producing <b>${F(tot, 1)}</b> cookie${tot === 1 ? '' : 's'} per second (<b>${pct.toFixed(1)}%</b> of total CpS)</li><li><b>${F(s.made[i])}</b> cookies ${i ? 'baked' : 'clicked'} so far</li></ul>` : ''}`;
        }
        if (k === 'u') {
          const u = UPMAP[v], own = up.has(v);
          return `<div class="tt-h"><img alt="" src="${iconURL(u.icon)}"><div class="tt-t"><b>${u.name}</b><small>[${u.tag || 'Upgrade'}]${own ? ' · purchased' : ''}</small></div>${own ? '' : priceHTML(upPrice(u), s.cookies >= upPrice(u))}</div><div class="tt-d">${u.desc}</div><div class="tt-q">&ldquo;${u.flav}&rdquo;</div>${touch && !own ? `<button class="cb-btn cb-buy" type="button" data-buy="${v}" ${s.cookies >= upPrice(u) ? '' : 'disabled'}>Buy</button>` : ''}`;
        }
        if (k === 'l') {
          const age = Date.now() - s.lumpStart, mat = age >= LUMP.mature, ty = mat ? s.lumpTy : 0, nm = { 0: 'Sugar lump', 1: 'Bifurcated sugar lump', 2: 'Golden sugar lump', 4: 'Caramelized sugar lump' }[ty];
          const st = !mat ? `Still growing. It will be mature in ${mmss(LUMP.mature - age)}.` : age < LUMP.ripe ? `Mature, ripe in ${mmss(LUMP.ripe - age)}. Harvesting it now has a 50% chance to fail.` : 'Ripe! Click it to harvest.';
          return `<div class="tt-h"><img alt="" src="${lumpURL(ty)}"><div class="tt-t"><b>${nm}</b><small>${comma(s.lumps)} sugar lump${s.lumps === 1 ? '' : 's'} owned</small></div></div><div class="tt-d">${st}</div><div class="tt-q">&ldquo;Spend lumps on the Lvl buttons in the building rows: each level adds 1% CpS to that building.&rdquo;</div>`;
        }
        if (k === 'a') {
          const a = ACHMAP[v], got = ach.has(v);
          return `<div class="tt-h"><img alt="" src="${iconURL(a.icon)}" ${got ? '' : 'style="filter:brightness(0) opacity(.5)"'}><div class="tt-t"><b>${a.name}</b><small>[Achievement]${got ? ' · Unlocked' : ' · Locked'}</small></div></div><div class="tt-d">${a.desc}</div>`;
        }
        return '';
      }
      function placeTip(el) {
        const rr = R.getBoundingClientRect(), er = el.getBoundingClientRect(), sc = rr.width / (R.offsetWidth || 1) || 1;
        const ex = (er.left - rr.left) / sc, ey = (er.top - rr.top) / sc, ew = er.width / sc, eh = er.height / sc;
        const W = R.clientWidth, H = R.clientHeight, tw = tipEl.offsetWidth, th = tipEl.offsetHeight;
        let x, y;
        if (!nar && ex - tw - 10 >= 4) { x = ex - tw - 10; y = ey + eh / 2 - th / 2; }
        else if (!nar && ex + ew + 10 + tw <= W - 4) { x = ex + ew + 10; y = ey + eh / 2 - th / 2; }
        else { x = ex + ew / 2 - tw / 2; y = ey + eh + 8; if (y + th > H - 6) y = ey - th - 8; }
        x = Math.max(6, Math.min(W - tw - 6, x)); y = Math.max(6, Math.min(H - th - 6, y));
        tipEl.style.left = x + 'px'; tipEl.style.top = y + 'px';
      }
      function showTip(el, touch) {
        const key = el.dataset.tip;
        if (!key) return;
        tip.key = key; tip.el = el; tip.touch = touch;
        tipEl.innerHTML = tipHTML(key, touch); tipEl.hidden = false; setCls(tipEl, 'touch', touch);
        for (const u of upsEl.children) setCls(u, 'sel', touch && u === el);
        placeTip(el);
      }
      function hideTip() { if (tip.key) { tip.key = null; tip.el = null; tipEl.hidden = true; for (const u of upsEl.children) setCls(u, 'sel', false); } }
      function refreshTip() {
        if (!tip.key) return;
        if (!tip.el.isConnected) { hideTip(); return; }
        const h = tipHTML(tip.key, tip.touch);
        if (tipEl.innerHTML !== h) { tipEl.innerHTML = h; placeTip(tip.el); }
      }
      api.on(R, 'pointerover', e => {
        if (e.pointerType !== 'mouse') return;
        const t = e.target.closest('[data-tip]');
        if (t && t !== tip.el && R.contains(t)) showTip(t, false);
      });
      api.on(R, 'pointerout', e => {
        if (e.pointerType !== 'mouse' || !tip.el || tip.touch) return;
        const to = e.relatedTarget;
        if (!to || !tip.el.contains(to)) { if (!to || to.closest('[data-tip]') !== tip.el) hideTip(); }
      });
      api.on(R, 'pointerdown', e => {
        if (tip.key && tip.touch && !tipEl.contains(e.target) && e.target.closest('[data-tip]') !== tip.el) hideTip();
      }, true);
      api.on(tipEl, 'click', e => {
        const b = e.target.closest('[data-buy]');
        if (b && buyUp(b.dataset.buy)) hideTip();
      });

      function delegate(el, sel, onAct, onLong) {
        let mouseDown = false, lpTok = 0, lpFired = false, sx = 0, sy = 0;
        api.on(el, 'pointerdown', e => {
          if (e.button) return;
          const t = e.target.closest(sel);
          mouseDown = e.pointerType === 'mouse';
          if (!t || !el.contains(t)) return;
          if (mouseDown) { e.preventDefault(); onAct(t, e, false); return; }
          lpFired = false; sx = e.clientX; sy = e.clientY;
          if (onLong) { const tok = ++lpTok; api.timeout(() => { if (tok === lpTok) { lpFired = true; onLong(t); } }, 480); }
        });
        api.on(el, 'pointermove', e => { if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 12) lpTok++; });
        api.on(el, 'pointerup', () => { lpTok++; });
        api.on(el, 'pointercancel', () => { lpTok++; lpFired = true; });
        api.on(el, 'click', e => {
          const t = e.target.closest(sel);
          if (!t || !el.contains(t)) return;
          if (mouseDown && e.detail) return;
          if (lpFired) { lpFired = false; return; }
          onAct(t, e, true);
        });
      }
      function actProd(t, e, touch) {
        const i = +t.dataset.i;
        if (i > s.rev) { if (touch) showTip(t, true); return; }
        const n = e.shiftKey ? 100 : (e.ctrlKey || e.metaKey) ? 10 : bulkN;
        if (bulkSell) {
          const k = Math.min(n, s.b[i]);
          if (!k) return;
          s.cookies += sellGain(i, k); s.b[i] -= k; s.free[i] = Math.min(s.free[i], s.b[i]);
          if (i === 1) s.sold = 1;
          sfx('sell');
        } else {
          const c = buyCost(i, n);
          if (s.cookies < c) return;
          s.cookies -= c; s.b[i] += n;
          sfx('buy');
        }
        recalc(); checkUnlocks(); refreshStore(); refreshUps(); checkAch();
        t.classList.remove('bump'); void t.offsetWidth; t.classList.add('bump');
        if (tip.el === t) refreshTip();
      }
      function buyUp(id) {
        const u = UPMAP[id];
        if (!u || up.has(id) || !unl.has(id) || s.cookies < upPrice(u) || (u.kind === 'pledge' && s.pledge > 0)) return false;
        s.cookies -= upPrice(u);
        if (u.kind === 'pledge') { s.pledge = 1800; s.pledges++; PLEDGES = s.pledges; popAllWrinklers(); } else up.add(id);
        recalc(); refreshUps(); refreshStore(); checkAch(); sfx('up');
        if (tip.key === 'u:' + id) hideTip();
        return true;
      }
      delegate(prodsEl, '.cb-prod', actProd, t => showTip(t, true));
      delegate(upsEl, '.cb-up', (t, e, touch) => { if (touch) showTip(t, true); else buyUp(t.dataset.u); });
      api.on(bulkEl, 'click', e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.bm) bulkSell = b.dataset.bm === '1';
        if (b.dataset.bq) bulkN = +b.dataset.bq;
        for (const x of bulkEl.querySelectorAll('button')) setCls(x, 'on', x.dataset.bm ? (x.dataset.bm === '1') === bulkSell : +x.dataset.bq === bulkN);
        refreshStore(); refreshTip(); api.sfx('tick');
      });
      api.on(nameEl, 'click', () => { s.name = randName(); s.named = 1; syncName(); checkAch(); });
      const syncName = () => setText(nameEl, s.name + '’s bakery');

      let panel = null, wipeArm = 0, ascArm = 0, statSig = '';
      const ago = ms => { const sec = Math.max(0, ms / 1000); if (sec < 60) return Math.floor(sec) + ' seconds'; if (sec < 3600) return Math.floor(sec / 60) + ' minute' + (Math.floor(sec / 60) === 1 ? '' : 's'); if (sec < 86400) { const h = Math.floor(sec / 3600); return h + ' hour' + (h === 1 ? '' : 's') + ', ' + Math.floor(sec % 3600 / 60) + ' minutes'; } const d = Math.floor(sec / 86400); return d + ' day' + (d === 1 ? '' : 's') + ', ' + Math.floor(sec % 86400 / 3600) + ' hours'; };
      const sl = (k, v) => `<div class="cb-sl">${k} : <b>${v}</b></div>`;
      const PANELS = {
        gen: () => {
          const totalB = s.b.reduce((a, v) => a + v, 0), milkR = milkRank();
          return `<h4>General</h4>
${sl('Cookies in bank', F(s.cookies))}${sl('Cookies baked (this ascension)', F(s.earned))}${sl('Cookies baked (all time)', F(s.allTime))}${s.forfeit ? sl('Cookies forfeited by ascending', F(s.forfeit)) : ''}
${sl('Run started', ago(Date.now() - s.runStart) + ' ago')}${sl('Buildings owned', comma(totalB))}
${sl('Cookies per second', F(C.cps, 1) + ` <small>(multiplier : ${F(Math.round(C.glob * 100))}%)</small>`)}${sl('Raw cookies per second', F(C.raw, 1))}${sl('Cookies per click', F(C.click, 1))}
${sl('Cookie clicks', comma(s.clicksAll))}${sl('Hand-made cookies', F(s.handAll))}${sl('Golden cookie clicks', comma(s.gc))}${s.lumpStart ? sl('Sugar lumps', `${comma(s.lumps)} <small>(${comma(s.lumpTot)} harvested)</small>`) : ''}${C.gp || s.pops ? sl('Wrinklers', `${s.wr.length}/10 <small>(${F(s.wr.reduce((a, w) => a + w.c, 0))} cookies stored)</small>`) + sl('Wrinklers popped', comma(s.pops)) : ''}${s.pledges ? sl('Elder pledges', comma(s.pledges)) + (s.pledge > 0 ? sl('Pledge ends in', mmss(s.pledge * 1000)) : '') : ''}
<h4>Special</h4>${sl('Prestige level', comma(s.prestige) + ` <small>(+${s.prestige}% CpS)</small>`)}${sl('Heavenly chips', comma(s.chips))}${sl('Ascensions', s.ascends)}${sl('Milk', Math.round(C.milk * 100) + '% (' + MILK_N[milkR] + ')')}`;
        },
        stats: () => {
          const owned = UP.filter(u => up.has(u.id));
          statSig = up.size + ':' + ach.size;
          return `<h3>Statistics</h3><div class="cb-sgen">${PANELS.gen()}</div>
<h4>Upgrades unlocked</h4>${sl('Unlocked', `${owned.length}/${UP.length} (${Math.floor(owned.length / UP.length * 100)}%)`)}
<div class="cb-grid">${owned.map(u => `<div class="cb-ic" data-tip="u:${u.id}"><img alt="" src="${iconURL(u.icon)}"></div>`).join('')}</div>
<h4>Achievements</h4>${sl('Unlocked', `${ach.size}/${ACH.length} (${Math.floor(ach.size / ACH.length * 100)}%)`)}
<div class="cb-grid">${ACH.map(a => `<div class="cb-ic${ach.has(a.id) ? '' : ' off'}" data-tip="a:${a.id}"><img alt="" src="${iconURL(a.icon)}"></div>`).join('')}</div>`;
        },
        opt: () => `<h3>Options</h3><h4>General</h4>
<div class="cb-orow"><button class="cb-btn" type="button" data-o="save">Save</button><span>Your game also saves on its own every 30 seconds.</span></div>
<div class="cb-orow"><button class="cb-btn warn" type="button" data-o="wipe">${wipeArm ? 'Really wipe?' : 'Wipe save'}</button><span>${wipeArm ? 'Click again to delete everything, including achievements.' : 'Delete all your progress, including your achievements.'}</span></div>
<div class="cb-orow"><button class="cb-btn" type="button" data-o="exp">Export save</button><button class="cb-btn" type="button" data-o="imp">Import save</button><span>Copy your save as text, or paste one and import it.</span></div>
<textarea class="cb-ta" spellcheck="false" placeholder="Save text">${expTxt}</textarea>
<h4>Settings</h4>
<div class="cb-orow"><label class="cb-vol">Volume <input type="range" min="0" max="100" step="5" value="${s.prefs.vol}" data-o="vol"><b>${s.prefs.vol}%</b></label><span>Master volume of the sound effects.</span></div>
<div class="cb-orow"><button class="cb-btn" type="button" data-o="p">Particles ${s.prefs.p ? 'ON' : 'OFF'}</button><span>Falling cookies and flying crumbs.</span></div>
<div class="cb-orow"><button class="cb-btn" type="button" data-o="n">Numbers ${s.prefs.n ? 'ON' : 'OFF'}</button><span>Numbers that pop up when you click the cookie.</span></div>
<div class="cb-orow"><button class="cb-btn" type="button" data-o="sh">Short numbers ${s.prefs.sh ? 'ON' : 'OFF'}</button><span>Shorten big numbers (1.5M instead of 1.5 million).</span></div>
<div class="cb-orow"><button class="cb-btn" type="button" data-o="m">Milk ${s.prefs.m ? 'ON' : 'OFF'}</button><span>The milk at the bottom of the big cookie pane.</span></div>
<div class="cb-orow"><button class="cb-btn" type="button" data-o="c">Cursors ${s.prefs.c ? 'ON' : 'OFF'}</button><span>The cursors circling the big cookie.</span></div>
${heav.has('cd') ? `<div class="cb-orow"><button class="cb-btn" type="button" data-o="ml">Milk : ${s.prefs.ml < 0 || (s.prefs.ml >= 25 && !heav.has('fd')) ? 'auto' : MILK_N[s.prefs.ml].replace(' milk', '')}</button><span>Pick any milk flavour you like. Purely cosmetic.</span></div>` : ''}`,
        info: () => `<h3>Info</h3><h4>About</h4><p>This Cookie Clicker is a fan-made remake of the classic idle cookie-clicking game. Every cookie is drawn by hand-written code, and every joke is fresh out of the oven.</p>
<h4>How to play</h4><p>Click the big cookie to bake cookies. Spend them in the store on buildings that bake for you, and on upgrades that make everything better.</p><p>Golden cookies pop up every few minutes. Click them fast for a Frenzy, a Lucky windfall or a Click frenzy.</p><p>Achievements fill your glass of milk, which kittens love. Once you have baked a trillion cookies, visit Legacy to ascend and earn heavenly chips.</p><p>Your bakery keeps baking at a reduced rate while you are away.</p>
<h4>Version history</h4><p><b>1.0</b> &mdash; The bakery opens: ${NB} buildings, ${UP.length} upgrades, ${ACH.length} achievements, golden cookies and ascension.</p><p><b>1.1</b> &mdash; Ten upgrade tiers per building, the full cursor, mouse, kitten and cookie upgrades, a heavenly upgrade tree, wrinklers and the grandmapocalypse, sugar lumps with building levels, 34 milk flavours, milk and cursor toggles, and ${ACH.length} achievements.</p>`,
        leg: () => {
          const p = prestigeFor(s.allTime), gain = p - s.prestige, next = Math.pow(p + 1, 3) * CFG.PRESTIGE_DIV - s.allTime;
          return `<h3>Legacy</h3>${sl('Prestige level', comma(s.prestige) + ` <small>(+${s.prestige}% CpS)</small>`)}${sl('Heavenly chips', comma(s.chips))}${sl('Cookies baked (all time)', F(s.allTime))}
<p>Ascending now would grant you <b>${comma(gain)}</b> prestige level${gain === 1 ? '' : 's'} and as many heavenly chips.</p><p>Next prestige level in <b>${F(next)}</b> more cookies.</p>
<div class="cb-orow"><button class="cb-btn big" type="button" data-o="asc" ${gain < 1 ? 'disabled' : ''}>${ascArm ? 'Click again to ascend' : 'Ascend'}</button></div>
<p>Ascending resets your cookies, buildings and upgrades. You keep your achievements, prestige levels (+1% CpS each) and heavenly chips, which you spend on heavenly upgrades before you reincarnate.</p>`;
        }
      };
      let expTxt = '';
      function renderPanel() {
        for (const b of R.querySelectorAll('.cb-mb')) setCls(b, 'on', b.dataset.m === panel);
        panelEl.hidden = !panel;
        if (panel) pinEl.innerHTML = PANELS[panel]();
      }
      function openPanel(k) {
        panel = panel === k ? null : k;
        wipeArm = ascArm = 0;
        if (nar) { tab = panel ? 'S' : 'M'; syncTabs(); }
        renderPanel(); panelEl.scrollTop = 0; hideTip();
      }
      api.on($('.cb-menu'), 'click', e => { const b = e.target.closest('[data-m]'); if (b) { openPanel(b.dataset.m); api.sfx('tap'); } });
      api.on($('.cb-x'), 'click', () => { panel = null; if (nar) { tab = 'M'; syncTabs(); } renderPanel(); });
      api.on(panelEl, 'click', e => {
        const b = e.target.closest('[data-o]'); if (!b) return;
        const o = b.dataset.o;
        if (o === 'save') { persist(); note('Game saved', 'Your bakery is safe.', scURL(), 3); }
        else if (o === 'wipe') {
          if (!wipeArm) { const tok = wipeArm = performance.now(); api.timeout(() => { if (wipeArm === tok) { wipeArm = 0; if (panel === 'opt') renderPanel(); } }, 4000); }
          else { wipeArm = 0; wipe(); }
        }
        else if (o === 'exp') { persist(); expTxt = btoa(unescape(encodeURIComponent(JSON.stringify(s)))); renderPanel(); const ta = pinEl.querySelector('.cb-ta'); ta.focus(); ta.select(); return; }
        else if (o === 'imp') { importSave(pinEl.querySelector('.cb-ta').value); return; }
        else if (o === 'ml') { const mx = heav.has('fd') ? MILK.length - 1 : 24; s.prefs.ml = s.prefs.ml >= mx || s.prefs.ml < -1 ? -1 : s.prefs.ml + 1; refreshAll(); }
        else if (o === 'p' || o === 'n' || o === 'sh' || o === 'm' || o === 'c') { s.prefs[o] = s.prefs[o] ? 0 : 1; if (o === 'p') rain.length = 0; refreshAll(); }
        else if (o === 'asc') {
          if (!ascArm) { const tok = ascArm = performance.now(); api.timeout(() => { if (ascArm === tok) { ascArm = 0; if (panel === 'leg') renderPanel(); } }, 4000); }
          else { ascArm = 0; ascend(); return; }
        }
        renderPanel();
      });

      function resetRun() {
        s.cookies = 0; s.earned = 0; s.handmade = 0; s.clicks = 0; s.gcRun = 0;
        s.b = B.map(() => 0); s.free = B.map(() => 0); s.made = B.map(() => 0);
        up.clear(); unl.clear(); s.rev = 0; s.frenzy = s.cfrenzy = 0; s.wr = []; s.pledge = 0; s.runStart = Date.now();
        removeGC(); rain.length = flings.length = nums.length = 0;
      }
      function ascend() {
        const gain = prestigeFor(s.allTime) - s.prestige;
        if (gain < 1) return;
        s.prestige += gain; s.chips += gain; s.forfeit += s.cookies; s.ascends++;
        resetRun(); s.heaven = 1;
        panel = null; if (nar) tab = 'L';
        refreshAll(); checkAch(); persist(); openHeaven();
        api.sfx('win');
      }
      function openHeaven() { heavenEl.hidden = false; renderHeaven(); hideTip(); }
      let hSel = null;
      function renderHeaven() {
        const own = id => heav.has(id), avail = h => !h[5][2] || own(h[5][2]), d = hSel && HMAP[hSel];
        heavenEl.innerHTML = `<h3>Ascension</h3><p>Prestige level <b>${comma(s.prestige)}</b> &middot; +${s.prestige}% CpS forever</p><p>Heavenly chips : <b>${comma(s.chips)}</b></p>
<div class="cb-tree"><svg viewBox="0 0 100 100" preserveAspectRatio="none">${HEAV.filter(h => h[5][2]).map(h => { const p = HMAP[h[5][2]][5]; return `<line x1="${p[0]}" y1="${p[1]}" x2="${h[5][0]}" y2="${h[5][1]}" class="${own(h[0]) ? 'on' : ''}"/>`; }).join('')}</svg>${HEAV.map(h => `<button type="button" class="cb-hn${own(h[0]) ? ' own' : !avail(h) ? ' lock' : s.chips >= h[2] ? ' ok' : ''}${hSel === h[0] ? ' sel' : ''}" data-h="${h[0]}" style="left:${h[5][0]}%;top:${h[5][1]}%" aria-label="${h[1]}"><img alt="" style="filter:hue-rotate(${(h[0].charCodeAt(0) * 37 + h[0].charCodeAt(1) * 11) % 360}deg)" src="${iconURL(['heav', h[0]])}"></button>`).join('')}</div>
<div class="cb-hd">${d ? `<b>${d[1]}</b><p>${d[3]}</p><p class="q">&ldquo;${d[4]}&rdquo;</p>${own(d[0]) ? '<em>Owned</em>' : !avail(d) ? '<em>Locked : buy ' + HMAP[d[5][2]][1] + ' first</em>' : `<button type="button" class="cb-btn" data-hb="${d[0]}" ${s.chips >= d[2] ? '' : 'disabled'}>Buy for ${comma(d[2])} heavenly chip${d[2] === 1 ? '' : 's'}</button>`}` : '<p>Tap an upgrade to read about it.</p>'}</div>
<button class="cb-btn big cb-rein" type="button" data-o="rein">Reincarnate</button>`;
      }
      api.on(heavenEl, 'click', e => {
        const h = e.target.closest('[data-h]'), hb = e.target.closest('[data-hb]');
        if (h) { hSel = h.dataset.h; api.sfx('tick'); renderHeaven(); return; }
        if (hb) { const d = HMAP[hb.dataset.hb]; if (d && !heav.has(d[0]) && (!d[5][2] || heav.has(d[5][2])) && s.chips >= d[2]) { s.chips -= d[2]; heav.add(d[0]); api.sfx('good'); recalc(); renderHeaven(); persist(); } return; }
        if (e.target.closest('[data-o="rein"]')) {
          s.heaven = 0; heavenEl.hidden = true;
          if (heav.has('sk')) { s.b[0] = s.free[0] = 10; }
          if (heav.has('sc')) { s.b[1] = s.free[1] = 5; }
          s.runStart = Date.now(); s.gcT = 0;
          recalc(); checkUnlocks(); refreshAll(); persist(); api.sfx('pop');
          note('Reincarnated', 'A fresh start, with heavenly help.', iconURL(['heav', 'x']), 5);
        }
      });
      api.on(panelEl, 'input', e => {
        const r = e.target.closest('[data-o=vol]'); if (!r) return;
        s.prefs.vol = +r.value; r.nextElementSibling.textContent = r.value + '%';
        if (master) master.gain.value = s.prefs.vol / 100;
      });
      function importSave(txt) {
        let o;
        try { o = JSON.parse(decodeURIComponent(escape(atob(txt.trim())))); if (!o || typeof o !== 'object' || o.v !== 1) throw 0; } catch (e) { note('Import failed', 'That is not a valid save text.', scURL(), 4); return; }
        s = loadState(o); s.t = Date.now(); expTxt = '';
        up.clear(); unl.clear(); ach.clear(); heav.clear();
        s.up.forEach(x => up.add(x)); s.unl.forEach(x => unl.add(x)); s.ach.forEach(x => ach.add(x)); s.heav.forEach(x => heav.add(x));
        removeGC(); rain.length = flings.length = nums.length = 0; heavenEl.hidden = true;
        recalc(); checkUnlocks(); refreshAll(); persist();
        note('Save imported', 'Welcome back to your bakery.', scURL(), 4);
      }
      function wipe() {
        s = fresh(); up.clear(); unl.clear(); ach.clear(); heav.clear();
        removeGC(); rain.length = flings.length = nums.length = 0; heavenEl.hidden = true;
        recalc(); checkUnlocks(); refreshAll(); persist();
        note('Save wiped', 'A brand new bakery awaits.', scURL(), 4);
      }

      let tab = 'L', nar = false;
      function syncTabs() {
        for (const b of tabsEl.children) setCls(b, 'on', b.dataset.t === tab);
        setCls(paneL, 'on', tab === 'L'); setCls(paneR, 'on', tab === 'R'); setCls(paneM, 'on', tab === 'M' || tab === 'S');
        setCls(miniEl, 'on', tab !== 'L');
        layout();
      }
      api.on(tabsEl, 'click', e => {
        const b = e.target.closest('[data-t]'); if (!b) return;
        tab = b.dataset.t;
        if (tab === 'S') { if (!panel) panel = 'stats'; } else if (tab === 'M') panel = null;
        wipeArm = ascArm = 0;
        hideTip(); syncTabs(); renderPanel(); api.sfx('tap');
      });

      let rowsW = 0;
      function layout() {
        const n = R.clientWidth < CFG.NARROW;
        if (n !== nar) {
          nar = n; setCls(R, 'cb-nar', n);
          if (!n && panel === null && tab === 'S') tab = 'L';
          if (n && panel) tab = 'S';
          for (const b of tabsEl.children) setCls(b, 'on', b.dataset.t === tab);
          setCls(paneL, 'on', tab === 'L'); setCls(paneR, 'on', tab === 'R'); setCls(paneM, 'on', tab === 'M' || tab === 'S'); setCls(miniEl, 'on', tab !== 'L');
        }
        const w = paneL.clientWidth, h = paneL.clientHeight;
        if (w && h && (w !== L.W || h !== L.H)) { L.W = w; L.H = h; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); L.bg = makeBg(w, h); }
        if (w && h) geom();
        const rw = rowsEl.clientWidth;
        if (rw && rw !== rowsW) { rowsW = rw; for (const r of rows) if (r) { r.w = rw; r.c.width = Math.round(rw * dpr); r.c.height = Math.round(CFG.ROW_H * dpr); r.bg = rowBg(r.i, rw); } }
        if (tip.key && tip.el) placeTip(tip.el);
      }
      const ro = new ResizeObserver(() => layout());
      ro.observe(R); ro.observe(paneL); ro.observe(rowsEl); ro.observe(head);

      const local = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * L.W / (r.width || 1), y: (e.clientY - r.top) * L.H / (r.height || 1) }; };
      const inCookie = p => Math.hypot(p.x - L.cx, p.y - L.cy) <= L.R0 * 1.02;
      function clickCookie(px, py) {
        if (s.heaven) return;
        const v = C.click;
        earn(v); s.handmade += v; s.handAll += v; s.clicks++; s.clicksAll++;
        L.sc = Math.min(L.sc, 0.93); L.sv = 0;
        if (s.prefs.n && nums.length < 60) nums.push({ x: px + (Math.random() - 0.5) * 12, y: py - 8, t: 0, txt: '+' + F(v, 1) });
        if (s.prefs.p && flings.length < 60) flings.push({ x: px, y: py, vx: (Math.random() - 0.5) * 260, vy: -160 - Math.random() * 200, r: Math.random() * TAU, vr: (Math.random() - 0.5) * 10, t: 0, s: 16 + Math.random() * 10 });
        sfx('click');
      }
      api.on(cv, 'pointerdown', e => {
        if (e.button) return;
        e.preventDefault();
        const p = local(e), wi = wrinklerAt(p);
        if (wi >= 0) { const w = s.wr[wi]; w.ht = 0; if (++w.h >= 3) popWrinkler(wi); else api.sfx('tick'); return; }
        if (inCookie(p)) clickCookie(p.x, p.y);
      });
      api.on(cv, 'pointermove', e => { if (e.pointerType !== 'mouse') return; const q = local(e); L.hw = wrinklerAt(q); const h = inCookie(q) && L.hw < 0; L.hov = h; cv.style.cursor = h || L.hw >= 0 ? 'pointer' : ''; });
      api.on(cv, 'pointerleave', () => { L.hov = false; L.hw = -1; cv.style.cursor = ''; });

      function renderL(dt, t) {
        if (!L.W || !L.H || !L.big || !L.bg) return;
        const x = lx, W = L.W, H = L.H;
        x.setTransform(dpr, 0, 0, dpr, 0, 0); x.globalAlpha = 1;
        x.drawImage(L.bg, 0, 0, W, H);
        const sc = smallCookie();
        for (const p of rain) {
          const c = Math.cos(p.r) * dpr, sn = Math.sin(p.r) * dpr;
          x.setTransform(c, sn, -sn, c, p.x * dpr, p.y * dpr); x.globalAlpha = p.a;
          x.drawImage(sc, -p.s / 2, -p.s / 2, p.s, p.s);
        }
        x.setTransform(dpr, 0, 0, dpr, 0, 0); x.globalAlpha = 1;
        const mh = s.prefs.m ? H * 0.24 * Math.min(1, C.milk) : 0;
        if (mh > 1) {
          const rank = milkShown(), my = H - mh;
          x.beginPath(); x.moveTo(0, H);
          for (let px = 0; px <= W + 8; px += 8) x.lineTo(px, my + Math.sin(px * 0.025 + t * 1.6) * 3.5 + Math.sin(px * 0.06 - t * 2.3) * 1.5);
          x.lineTo(W, H); x.closePath();
          x.fillStyle = MILK[rank]; x.globalAlpha = 0.88; x.fill(); x.globalAlpha = 1;
          x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(0, my + 6, W, 2);
          const sh = x.createLinearGradient(0, my, 0, H); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.25)'); x.fillStyle = sh; x.fillRect(0, my, W, mh);
        }
        const fz = s.frenzy > 0, cf = s.cfrenzy > 0;
        if (fz || cf) {
          const pu = 0.5 + 0.5 * Math.sin(t * 3);
          x.fillStyle = rad(x, L.cx, L.cy, L.R0 * 0.8, Math.max(W, H) * 0.9, cf ? ['rgba(255,120,200,0)', `rgba(255,110,190,${0.16 + 0.12 * pu})`] : ['rgba(255,210,80,0)', `rgba(255,196,60,${0.14 + 0.1 * pu})`]);
          x.fillRect(0, 0, W, H);
        }
        const rays = fz ? goldRaysSprite() : raysSprite(), RS = L.R0 * (fz ? 2.6 : 2.3), sp = cf ? 3 : 1;
        x.save(); x.translate(L.cx, L.cy);
        x.rotate(t * 0.12 * sp); x.globalAlpha = fz ? 0.75 : 0.6; x.drawImage(rays, -RS, -RS, RS * 2, RS * 2);
        x.rotate(-t * 0.29 * sp); x.globalAlpha = fz ? 0.55 : 0.4; x.drawImage(rays, -RS * 0.85, -RS * 0.85, RS * 1.7, RS * 1.7);
        x.restore(); x.globalAlpha = 1;
        const nc = s.prefs.c ? Math.min(s.b[0], 250) : 0;
        if (nc) {
          const cs = cursorSprite(), z = 18;
          for (let k = 0; k < nc; k++) {
            const ring = Math.floor(k / 50), idx = k % 50;
            const a = idx / 50 * TAU + ring * 0.06 - t * 0.06;
            const poke = Math.pow(Math.max(0, Math.sin(t * 2.2 - idx * 0.55 - ring)), 10) * 7;
            const rr = L.R0 * L.sc + 12 + ring * 15 - poke;
            const px = L.cx + Math.cos(a) * rr, py = L.cy + Math.sin(a) * rr, th = a - Math.PI / 2;
            const c = Math.cos(th) * dpr, sn = Math.sin(th) * dpr;
            x.setTransform(c, sn, -sn, c, px * dpr, py * dpr);
            x.drawImage(cs, -z / 2, -z * 0.15, z, z);
          }
          x.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        const bs = (L.R0 * 2 + 40) * L.sc;
        x.drawImage(L.big, L.cx - bs / 2, L.cy - bs / 2, bs, bs);
        for (let k = 0; k < s.wr.length; k++) {
          const w = s.wr[k], q = wrPos(w), sh = L.hw === k || w.h ? Math.sin(t * 45) * 2.2 : Math.sin(t * 3 + w.slot) * 0.8;
          x.save(); x.translate(q.x, q.y); x.rotate(q.a + Math.PI / 2 + sh * 0.03); x.translate(sh, 0); wrinklerShape(x, q.sz, t); x.restore();
          if (L.hw === k) { x.font = "400 15px Kavoon, Georgia, serif"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 3; x.strokeStyle = 'rgba(0,0,0,.7)'; const tx = F(w.c, 1); x.strokeText(tx, q.x, q.y - q.sz - 8); x.fillStyle = '#ffe9c8'; x.fillText(tx, q.x, q.y - q.sz - 8); }
        }
        for (const p of flings) {
          const c = Math.cos(p.r) * dpr, sn = Math.sin(p.r) * dpr;
          x.setTransform(c, sn, -sn, c, p.x * dpr, p.y * dpr); x.globalAlpha = Math.max(0, 1 - p.t);
          x.drawImage(sc, -p.s / 2, -p.s / 2, p.s, p.s);
        }
        x.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (sparks.length) {
          x.globalCompositeOperation = 'lighter';
          for (const p of sparks) { x.globalAlpha = Math.max(0, 1 - p.t); x.fillStyle = p.t < 0.3 ? '#fffbe0' : '#ffd24a'; x.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); }
          x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
        }
        if (flash > 0) { x.fillStyle = `rgba(255,236,150,${flash * 0.45})`; x.fillRect(0, 0, W, H); }
        if (nums.length) {
          x.font = "400 21px Kavoon, Georgia, serif"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
          for (const p of nums) {
            x.globalAlpha = Math.max(0, 1 - p.t);
            x.lineWidth = 4; x.strokeStyle = 'rgba(0,0,0,.65)'; x.strokeText(p.txt, p.x, p.y);
            x.fillStyle = '#fff'; x.fillText(p.txt, p.x, p.y);
          }
        }
        x.globalAlpha = 1;
      }
      function updateParts(dt) {
        if (s.prefs.p && L.W) {
          rainAcc += dt * Math.min(20, Math.pow(C.cps, 0.3) * 0.5);
          while (rainAcc >= 1 && rain.length < 160) { rainAcc--; const sz = 12 + Math.random() * 14; rain.push({ x: Math.random() * L.W, y: -20, vy: 60 + Math.random() * 90 + sz * 2, r: Math.random() * TAU, vr: (Math.random() - 0.5) * 2, s: sz, a: 0.75 + Math.random() * 0.25 }); }
          if (rainAcc > 1) rainAcc = 1;
        }
        for (let i = rain.length - 1; i >= 0; i--) { const p = rain[i]; p.y += p.vy * dt; p.r += p.vr * dt; if (p.y > L.H + 30) rain.splice(i, 1); }
        for (let i = flings.length - 1; i >= 0; i--) { const p = flings[i]; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.t += dt * 1.1; if (p.t >= 1) flings.splice(i, 1); }
        for (let i = nums.length - 1; i >= 0; i--) { const p = nums[i]; p.y -= 70 * dt; p.t += dt; if (p.t >= 1) nums.splice(i, 1); }
        for (let i = sparks.length - 1; i >= 0; i--) { const p = sparks[i]; p.vy += 420 * dt; p.vx *= Math.exp(-2 * dt); p.x += p.vx * dt; p.y += p.vy * dt; p.t += dt * 0.8; if (p.t >= 1) sparks.splice(i, 1); }
        if (flash > 0) flash = Math.max(0, flash - dt * 2.2);
        for (const w of s.wr) if (w.h && (w.ht = (w.ht || 0) + dt) > 2.5) { w.h = 0; w.ht = 0; }
        const tg = L.hov ? 1.03 : 1;
        L.sv += (tg - L.sc) * 520 * dt; L.sv *= Math.exp(-16 * dt); L.sc += L.sv * dt;
      }

      const mmss = ms => { const t = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
      const LUMP = { mature: 5 * 60e3, ripe: 6 * 60e3, fall: 3600e3 };
      let lumpSig = '';
      function syncLump() {
        lumpEl.hidden = !s.lumpStart;
        if (!s.lumpStart) return;
        const age = Date.now() - s.lumpStart, ty = age >= LUMP.mature ? s.lumpTy : 0, sig = ty + ':' + (age >= LUMP.ripe ? 2 : age >= LUMP.mature ? 1 : 0);
        if (sig !== lumpSig) { lumpSig = sig; lumpEl.firstChild.src = lumpURL(ty); setCls(lumpEl, 'ripe', age >= LUMP.ripe); setCls(lumpEl, 'mature', age >= LUMP.mature); }
        lumpEl.style.setProperty('--g', (0.55 + 0.45 * Math.min(1, age / LUMP.mature)).toFixed(2));
      }
      function startLump(first) {
        s.lumpStart = Date.now(); const r = Math.random(); s.lumpTy = r < 0.0015 ? 2 : r < 0.0511 ? 1 : r < 0.0608 ? 4 : 0;
        if (first) note('Sugar lumps', 'Because you baked a billion cookies, sugar lumps now grow next to the menu. Harvest them when ripe and spend them on building levels!', lumpURL(2), 10);
        lumpSig = ''; syncLump();
      }
      function harvestLump(auto) {
        if (!s.lumpStart) return;
        const age = Date.now() - s.lumpStart;
        if (!auto && age < LUMP.mature) { note('Sugar lump', `Still growing. It will be mature in ${mmss(LUMP.mature - age)}.`, lumpURL(0), 3); return; }
        const fail = !auto && age < LUMP.ripe && Math.random() < 0.5, ty = s.lumpTy;
        let got = fail ? 0 : ty === 1 ? 1 + (Math.random() < 0.5 ? 1 : 0) : ty === 2 ? 2 + Math.floor(Math.random() * 6) : ty === 4 ? 1 + Math.floor(Math.random() * 3) : 1;
        if (auto) got += Math.max(0, Math.floor(age / LUMP.fall) - 1);
        s.lumps += got; s.lumpTot += got;
        let extra = '';
        if (!fail && ty === 2) { const v = Math.min(s.cookies, C.cps * 86400); earn(v); extra = ` Your bank doubled: +${F(v)} cookies!`; }
        s.lumpStart = Date.now() - (auto ? age % LUMP.fall : 0); const r = Math.random(); s.lumpTy = r < 0.0015 ? 2 : r < 0.0511 ? 1 : r < 0.0608 ? 4 : 0; lumpSig = '';
        note(fail ? 'Harvest failed' : 'Sugar lump harvested', fail ? 'It was not quite ripe and crumbled away.' : `+${got} sugar lump${got === 1 ? '' : 's'}.${extra}`, lumpURL(fail ? 0 : ty), 5);
        api.sfx(fail ? 'tick' : 'good'); recalc(); syncLump(); renderPanel(); refreshStore(); checkAch();
      }
      function tickLump() {
        if (!s.lumpStart) { if (s.allTime >= 1e9) startLump(true); return; }
        if (Date.now() - s.lumpStart >= LUMP.fall) harvestLump(true);
        syncLump();
      }
      api.on(lumpEl, 'click', () => harvestLump(false));
      function levelUp(i) {
        const need = s.lvl[i] + 1;
        if (s.lumps < need) { note('Not enough sugar lumps', `${B[i][0]} level ${need} costs ${need} sugar lump${need === 1 ? '' : 's'}.`, lumpURL(0), 4); return; }
        s.lumps -= need; s.lvl[i]++; recalc(); refreshAll(); api.sfx('good');
        note(`${B[i][0]} level ${s.lvl[i]}`, `This building now bakes <b>+${s.lvl[i]}%</b> more.`, bldURL(i), 4); checkAch();
      }

      const wrPos = w => { const a = w.slot / 10 * TAU + 0.31, r = L.R0 * L.sc * 0.93; return { x: L.cx + Math.cos(a) * r, y: L.cy + Math.sin(a) * r, a, sz: 24 + 20 * (1 - Math.exp(-w.c / (C.base * 90 + 20))) }; };
      const wrinklerAt = p => s.wr.findIndex(w => { const q = wrPos(w); return Math.hypot(p.x - q.x, p.y - q.y) < q.sz * 0.7; });
      function popWrinkler(i) {
        const w = s.wr[i], q = wrPos(w), v = w.c * (1.1 + (heav.has('sg') ? 0.05 : 0));
        s.wr.splice(i, 1); s.pops++; earn(v); buffs();
        if (s.prefs.n && nums.length < 60) nums.push({ x: q.x, y: q.y - 12, t: 0, txt: '+' + F(v, 1) });
        if (s.prefs.p) for (let k = 0; k < 8 && flings.length < 90; k++) flings.push({ x: q.x, y: q.y, vx: (Math.random() - 0.5) * 360, vy: -120 - Math.random() * 240, r: Math.random() * TAU, vr: (Math.random() - 0.5) * 10, t: 0, s: 14 + Math.random() * 10 });
        api.sfx('pop'); checkAch();
      }
      function popAllWrinklers() { while (s.wr.length) popWrinkler(0); }
      function spawnWrinkler() {
        const free = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(k => !s.wr.some(w => w.slot === k));
        if (!free.length) return;
        s.wr.push({ slot: free[Math.floor(Math.random() * free.length)], c: 0, h: 0 }); buffs();
        if (!s.pops && s.wr.length === 1) note('The grandmas are awake', 'A wrinkler appeared on the big cookie. It sucks your cookies, but pays them back with interest when popped. Click it 3 times.', iconURL(['wrk']), 9);
      }

      function step(dt) {
        if (s.heaven) return;
        const fz = Math.min(dt, s.frenzy), nw = s.wr.length;
        const full = C.base * dt + C.base * (CFG.FRENZY_MULT - 1) * fz, prod = full * (1 - 0.05 * nw);
        if (nw) { const each = full * 0.05 * nw; for (const w of s.wr) w.c += each; }
        if (C.gp > 0 && s.pledge <= 0 && nw < 10 && Math.random() < dt * (0.02 + 0.015 * C.gp)) spawnWrinkler();
        if (s.pledge > 0) s.pledge = Math.max(0, s.pledge - dt);
        if (prod > 0) { earn(prod); const per = prod / C.raw; for (let i = 0; i < NB; i++) if (s.b[i]) s.made[i] += C.bc[i] * s.b[i] * per; }
        if (s.frenzy > 0) { s.frenzy -= dt; if (s.frenzy <= 0) { s.frenzy = 0; buffs(); syncBuffs(); } }
        if (s.cfrenzy > 0) { s.cfrenzy -= dt; if (s.cfrenzy <= 0) { s.cfrenzy = 0; buffs(); syncBuffs(); } }
        if (!gc) {
          s.gcT += dt;
          const mn = CFG.GC_MIN / C.gcF, mx = CFG.GC_MAX / C.gcF;
          if (s.gcT > mn) { const q = Math.pow(Math.min(1, (s.gcT - mn) / (mx - mn)), 5); if (q >= 1 || Math.random() < 1 - Math.pow(1 - q, dt * CFG.GC_FPS)) spawnGC(); }
        } else { gc.life -= dt; if (gc.life <= 0) removeGC(); }
      }

      const MS = v => { let m = 1000; while (m <= v) m *= 10; return m; };
      function checkSubmit() {
        const v = Math.floor(s.allTime);
        if (v < 1000) return;
        const band = MS(v);
        if (band > s.subBand) { s.subBand = band; s.lastSub = v; api.submit(v); }
      }
      function leaveSubmit() {
        const v = Math.floor(s.allTime);
        if (v >= 1000 && v > s.lastSub && s.leftBand !== s.subBand) { s.leftBand = s.subBand; s.lastSub = v; api.submit(v); }
      }
      const persist = () => { s.t = Date.now(); s.up = [...up]; s.unl = [...unl]; s.ach = [...ach]; s.heav = [...heav]; api.save(s); };

      function refreshAll() { syncName(); refreshStore(); refreshUps(); syncBuffs(); renderPanel(); updateText(true); }
      let lastTxt = '';
      function updateText(force) {
        const n = Math.floor(s.cookies), txt = F(n) + (n === 1 ? ' cookie' : ' cookies'), cps = 'per second : ' + F(C.cps, 1);
        if (force || txt !== lastTxt) { lastTxt = txt; setText(countEl, txt); setText(miniEl.firstChild, txt); }
        setText(cpsEl, cps); setText(miniEl.lastChild, F(C.cps, 1) + ' per second');
      }

      recalc();
      const away = s.t ? (Date.now() - s.t) / 1000 : 0;
      if (away > 30 && !s.heaven) {
        s.frenzy = Math.max(0, s.frenzy - away); s.cfrenzy = Math.max(0, s.cfrenzy - away); buffs();
        if (C.base > 0) {
          const rate = heav.has('tg') ? CFG.OFFLINE_GATES : CFG.OFFLINE_RATE, secs = Math.min(away, CFG.OFFLINE_CAP), v = C.base * secs * rate;
          earn(v);
          for (let i = 0; i < NB; i++) if (s.b[i]) s.made[i] += C.bc[i] * s.b[i] * C.glob * secs * rate;
          api.timeout(() => note('Welcome back!', `You baked <b>${F(v)}</b> cookies while away (${ago(away * 1000)}).`, scURL(), 9), 600);
        }
      }
      checkUnlocks(); checkAch(); layout(); refreshAll(); nextNews(); syncTabs(); tickLump();
      if (s.heaven) openHeaven();
      api.score(Math.floor(s.allTime));

      let last = performance.now(), acc2 = 0, acc5 = 0, acc1 = 0, accRow = 0, accTxt = 0, lastScore = -1;
      api.loop(() => {
        const now = performance.now();
        let real = (now - last) / 1000; last = now;
        if (real > CFG.OFFLINE_CAP) real = CFG.OFFLINE_CAP;
        if (real < 0) real = 0;
        step(real);
        const dt = Math.min(real, 0.05), t = now / 1000;
        updateParts(dt);
        if (gc) {
          gc.t += dt;
          gc.el.style.opacity = Math.min(1, gc.t * 1.5, Math.max(0, gc.life));
          gc.el.style.transform = `translate(-50%,-50%) rotate(${Math.sin(gc.t * 1.4) * 14}deg) scale(${1 + Math.sin(gc.t * 4.5) * 0.06})`;
        }
        if (!nar || tab === 'L') renderL(dt, t);
        accRow += dt; accTxt += dt; acc5 += dt; acc2 += dt; acc1 += dt; newsT += dt;
        if (accTxt >= 0.05) { accTxt = 0; updateText(false); }
        if (accRow >= 1 / 12) {
          accRow = 0;
          if (!panel && (!nar || tab === 'M')) {
            const top = rowsEl.scrollTop, hh = rowsEl.clientHeight;
            for (const r of rows) if (r && !r.c.hidden && r.bg) { const y = r.c.offsetTop - top; if (y < hh && y + CFG.ROW_H > 0) drawRow(r, t); }
          }
        }
        if (acc5 >= 0.2) { acc5 = 0; refreshStore(); refreshUps(); tickBuffs(); }
        if (acc2 >= 0.5) { acc2 = 0; checkUnlocks(); checkAch(); refreshTip(); }
        if (acc1 >= 1) {
          acc1 = 0; tickLump();
          const sc = Math.floor(s.allTime); if (sc !== lastScore) { lastScore = sc; api.score(sc); }
          checkSubmit();
          if (panel === 'stats' && statSig === up.size + ':' + ach.size) { const g = pinEl.querySelector('.cb-sgen'); if (g) g.innerHTML = PANELS.gen(); }
          else if ((panel === 'stats' || panel === 'leg') && !(tip.el && panelEl.contains(tip.el))) { const st = panelEl.scrollTop; renderPanel(); panelEl.scrollTop = st; }
        }
        if (newsT >= CFG.NEWS_SECS) nextNews();
      });
      api.interval(persist, CFG.AUTOSAVE_MS);
      api.on(document, 'visibilitychange', () => { if (document.hidden) { persist(); leaveSubmit(); } });
      api.on(window, 'pagehide', () => { persist(); leaveSubmit(); });

      return {
        destroy() {
          persist();
          ro.disconnect();
          if (ac) { try { ac.close(); } catch (e) {} ac = null; }
        }
      };
    }
  });

  Ameplay.covers[ID] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ckb-bg" cx=".5" cy=".46" r=".75"><stop offset="0" stop-color="#5a97d6"/><stop offset=".55" stop-color="#2c5d9c"/><stop offset="1" stop-color="#132c55"/></radialGradient><radialGradient id="ckb-ck" cx=".36" cy=".32" r=".8"><stop offset="0" stop-color="#f9d896"/><stop offset=".6" stop-color="#dc9d4c"/><stop offset="1" stop-color="#a8642a"/></radialGradient><radialGradient id="ckb-gd" cx=".38" cy=".34" r=".75"><stop offset="0" stop-color="#fff8c8"/><stop offset=".55" stop-color="#ffd34a"/><stop offset="1" stop-color="#d1900e"/></radialGradient><radialGradient id="ckb-gl" r=".5"><stop offset="0" stop-color="#fff2a0" stop-opacity=".8"/><stop offset="1" stop-color="#fff2a0" stop-opacity="0"/></radialGradient><path id="ckb-h" d="M-3.6-2V-22a3.6 3.6 0 0 1 7.2 0V-6a3 3 0 0 1 6 0a3 3 0 0 1 6 1a2.5 2.5 0 0 1 5 1.6V8q-.6 10-10.6 12H0q-6-1-9-8l-5-10q-1.5-4.5 3-5l7.4 7z" fill="#fff" stroke="#1b1b1b" stroke-width="2.4" stroke-linejoin="round"/></defs>
<rect width="400" height="300" fill="url(#ckb-bg)"/>
<path d="M200 142L458 108L458 176ZM200 142L440 242L406 300ZM200 142L358 348L300 382ZM200 142L234 400L166 400ZM200 142L100 382L42 348ZM200 142L-6 300L-40 242ZM200 142L-58 176L-58 108ZM200 142L-40 42L-6 -16ZM200 142L42 -64L100 -98ZM200 142L166 -116L234 -116ZM200 142L300 -98L358 -64ZM200 142L406 -16L440 42Z" fill="#fffbe0" opacity=".16"/>
<g transform="translate(34 40) rotate(10)"><circle r="13" fill="#dc9d4c" stroke="#7a4418" stroke-width="2.5"/><circle cx="-4.5" cy="-3.2" r="2.6" fill="#4a2a14"/><circle cx="4.5" cy="1.3" r="2.9" fill="#4a2a14"/><circle cx="-0.7" cy="5.9" r="2.2" fill="#4a2a14"/></g><g transform="translate(70 96) rotate(40)"><circle r="9" fill="#dc9d4c" stroke="#7a4418" stroke-width="2.5"/><circle cx="-3.1" cy="-2.2" r="1.8" fill="#4a2a14"/><circle cx="3.1" cy="0.9" r="2.0" fill="#4a2a14"/><circle cx="-0.5" cy="4.0" r="1.5" fill="#4a2a14"/></g><g transform="translate(30 170) rotate(80)"><circle r="11" fill="#dc9d4c" stroke="#7a4418" stroke-width="2.5"/><circle cx="-3.8" cy="-2.8" r="2.2" fill="#4a2a14"/><circle cx="3.8" cy="1.1" r="2.4" fill="#4a2a14"/><circle cx="-0.6" cy="5.0" r="1.9" fill="#4a2a14"/></g><g transform="translate(368 190) rotate(20)"><circle r="12" fill="#dc9d4c" stroke="#7a4418" stroke-width="2.5"/><circle cx="-4.2" cy="-3.0" r="2.4" fill="#4a2a14"/><circle cx="4.2" cy="1.2" r="2.6" fill="#4a2a14"/><circle cx="-0.6" cy="5.4" r="2.0" fill="#4a2a14"/></g><g transform="translate(346 250) rotate(60)"><circle r="9" fill="#dc9d4c" stroke="#7a4418" stroke-width="2.5"/><circle cx="-3.1" cy="-2.2" r="1.8" fill="#4a2a14"/><circle cx="3.1" cy="0.9" r="2.0" fill="#4a2a14"/><circle cx="-0.5" cy="4.0" r="1.5" fill="#4a2a14"/></g><g transform="translate(60 250) rotate(0)"><circle r="10" fill="#dc9d4c" stroke="#7a4418" stroke-width="2.5"/><circle cx="-3.5" cy="-2.5" r="2.0" fill="#4a2a14"/><circle cx="3.5" cy="1.0" r="2.2" fill="#4a2a14"/><circle cx="-0.5" cy="4.5" r="1.7" fill="#4a2a14"/></g><g transform="translate(378 110) rotate(30)"><circle r="8" fill="#dc9d4c" stroke="#7a4418" stroke-width="2.5"/><circle cx="-2.8" cy="-2.0" r="1.6" fill="#4a2a14"/><circle cx="2.8" cy="0.8" r="1.8" fill="#4a2a14"/><circle cx="-0.4" cy="3.6" r="1.4" fill="#4a2a14"/></g><g transform="translate(100 28) rotate(50)"><circle r="8" fill="#dc9d4c" stroke="#7a4418" stroke-width="2.5"/><circle cx="-2.8" cy="-2.0" r="1.6" fill="#4a2a14"/><circle cx="2.8" cy="0.8" r="1.8" fill="#4a2a14"/><circle cx="-0.4" cy="3.6" r="1.4" fill="#4a2a14"/></g>
<path d="M0 262q50-14 100 0t100 0t100 0t100 0V300H0z" fill="#f6f4ee"/><path d="M0 272q50-12 100 0t100 0t100 0t100 0" fill="none" stroke="#fff" stroke-width="4" opacity=".7"/>
<ellipse cx="200" cy="234" rx="80" ry="12" fill="#0b1a33" opacity=".35"/>
<use href="#ckb-h" transform="translate(167 266) rotate(15) scale(1.15)"/><use href="#ckb-h" transform="translate(109 233) rotate(45) scale(1.15)"/><use href="#ckb-h" transform="translate(76 175) rotate(75) scale(1.15)"/><use href="#ckb-h" transform="translate(76 109) rotate(105) scale(1.15)"/><use href="#ckb-h" transform="translate(109 51) rotate(135) scale(1.15)"/><use href="#ckb-h" transform="translate(167 18) rotate(165) scale(1.15)"/><use href="#ckb-h" transform="translate(233 18) rotate(195) scale(1.15)"/><use href="#ckb-h" transform="translate(291 51) rotate(225) scale(1.15)"/><use href="#ckb-h" transform="translate(324 109) rotate(255) scale(1.15)"/>
<path d="M292 142L288 158L283 172L277 186L265 197L254 207L245 219L231 227L215 230L200 232L185 229L171 221L157 216L143 210L132 199L122 187L114 173L114 157L116 142L115 127L118 112L124 98L130 83L141 72L157 67L171 62L185 56L200 56L215 56L231 56L245 64L256 75L267 86L275 99L279 113L287 127Z" fill="url(#ckb-ck)" stroke="#6e3c16" stroke-width="5" stroke-linejoin="round"/>
<path d="M142 102q22-34 64-38" fill="none" stroke="#fff3d0" stroke-width="7" stroke-linecap="round" opacity=".45"/>
<path d="M147 104q3 -13 13 -12t13 10t-9 13t-17 -12z" fill="#4a2a14"/><ellipse cx="157" cy="98" rx="5" ry="3" fill="#fff" opacity=".25"/><path d="M197 87q2 -11 11 -10t11 9t-8 11t-14 -10z" fill="#4a2a14"/><ellipse cx="206" cy="82" rx="4" ry="2" fill="#fff" opacity=".25"/><path d="M231 112q3 -14 14 -13t14 11t-10 14t-18 -13z" fill="#4a2a14"/><ellipse cx="242" cy="106" rx="5" ry="3" fill="#fff" opacity=".25"/><path d="M133 150q2 -12 12 -11t12 10t-8 12t-16 -11z" fill="#4a2a14"/><ellipse cx="143" cy="145" rx="4" ry="2" fill="#fff" opacity=".25"/><path d="M173 134q3 -15 15 -14t15 12t-10 15t-20 -14z" fill="#4a2a14"/><ellipse cx="185" cy="127" rx="5" ry="3" fill="#fff" opacity=".25"/><path d="M218 154q2 -12 12 -11t12 10t-8 12t-16 -11z" fill="#4a2a14"/><ellipse cx="228" cy="149" rx="4" ry="2" fill="#fff" opacity=".25"/><path d="M157 187q3 -13 13 -12t13 10t-9 13t-17 -12z" fill="#4a2a14"/><ellipse cx="167" cy="181" rx="5" ry="3" fill="#fff" opacity=".25"/><path d="M203 192q2 -12 12 -11t12 10t-8 12t-16 -11z" fill="#4a2a14"/><ellipse cx="213" cy="187" rx="4" ry="2" fill="#fff" opacity=".25"/><path d="M248 172q2 -10 10 -9t10 8t-7 10t-13 -9z" fill="#4a2a14"/><ellipse cx="256" cy="168" rx="4" ry="2" fill="#fff" opacity=".25"/><path d="M130 117q2 -8 8 -7t8 6t-6 8t-10 -7z" fill="#4a2a14"/><ellipse cx="136" cy="113" rx="3" ry="2" fill="#fff" opacity=".25"/>
<circle cx="336" cy="62" r="46" fill="url(#ckb-gl)"/>
<g transform="rotate(-14 336 62)"><circle cx="336" cy="62" r="27" fill="url(#ckb-gd)" stroke="#9a6406" stroke-width="3.5"/><circle cx="328" cy="54" r="5" fill="#c98a10"/><circle cx="345" cy="62" r="5.5" fill="#c98a10"/><circle cx="332" cy="72" r="4" fill="#c98a10"/><ellipse cx="327" cy="48" rx="8" ry="3.5" fill="#fff" opacity=".6"/></g>
<path d="M372 26l3 8 8 3-8 3-3 8-3-8-8-3 8-3zM300 30l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff"/>
</svg>`;
})();

