(() => {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const HUES = ['#ff5d73', '#ffbe0b', '#3a86ff', '#26b37a', '#a855f7', '#ff8a3d', '#4cc9f0'];
  const myName = () => {
    try {
      const p = JSON.parse(localStorage.getItem('gameplay:profile'));
      const n = p && (p.username || p.displayName);
      if (n) return String(n).replace(/[<>&"']/g, '').slice(0, 16) || 'You';
    } catch (e) {}
    return 'You';
  };
  const tap = (el, sel, fn, lazy) => {
    let tch = false;
    el.addEventListener('pointerdown', e => { if (e.button) return; tch = lazy && e.pointerType === 'touch'; if (tch) return; const b = e.target.closest(sel); if (b && !b.disabled && el.contains(b)) { e.preventDefault(); fn(b, e); } });
    el.addEventListener('click', e => { if (e.detail && !tch) return; const b = e.target.closest(sel); if (b && !b.disabled && el.contains(b)) fn(b, e); });
  };
  let AUD = null;
  const tone = (api, f, d = .12, type = 'sine', v = .06, f2 = 0, delay = 0) => {
    if (api.muted) return;
    try {
      AUD = AUD || new (window.AudioContext || window.webkitAudioContext)();
      if (AUD.state === 'suspended') AUD.resume();
      const t = AUD.currentTime + delay, o = AUD.createOscillator(), g = AUD.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g).connect(AUD.destination); o.start(t); o.stop(t + d + .03);
    } catch (e) {}
  };
  const fanfare = api => [523, 659, 784, 1046].forEach((f, i) => tone(api, f, .22, 'triangle', .07, 0, i * .11));
  const sadTone = api => [392, 330, 262].forEach((f, i) => tone(api, f, .26, 'sine', .06, 0, i * .16));
  function confetti(root, api, n = 150) {
    const w = root.clientWidth, h = Math.max(root.clientHeight, 320), dpr = Math.min(window.devicePixelRatio || 1, 2);
    const c = document.createElement('canvas');
    c.style.cssText = 'position:absolute;left:0;top:0;z-index:60;pointer-events:none;width:' + w + 'px;height:' + h + 'px';
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    root.append(c);
    const g = c.getContext('2d'), P = [];
    for (let i = 0; i < n; i++) {
      const s = i % 2 ? 1 : -1;
      P.push({ x: w / 2 - s * w * .42, y: h * .62, vx: s * (160 + Math.random() * 560), vy: -(380 + Math.random() * 640), z: 6 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - .5) * 14, f: Math.random() * 6, col: HUES[i % HUES.length] });
    }
    let life = 0;
    const stop = api.loop(dt => {
      life += dt;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height);
      g.globalAlpha = life > 2.3 ? Math.max(0, (2.9 - life) / .6) : 1;
      for (const p of P) {
        p.vy += 900 * dt; p.vx *= 1 - 1.3 * dt; p.vy *= 1 - .5 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.f += dt * 9;
        const co = Math.cos(p.r) * dpr, si = Math.sin(p.r) * dpr, k = Math.cos(p.f);
        g.setTransform(co, si, -si * k, co * k, p.x * dpr, p.y * dpr);
        g.fillStyle = p.col; g.fillRect(-p.z / 2, -p.z * .3, p.z, p.z * .6);
      }
      if (life > 2.9) { stop(); c.remove(); }
    });
  }
  const parseQ = raw => raw.trim().split('\n').map(l => l.split('|')).filter(a => a.length === 5);

  const TR_RAW = `
The quick brown fox jumps over the lazy dog.
Pack my box with five dozen liquor jugs.
How vexingly quick daft zebras jump!
Sphinx of black quartz, judge my vow.
Waltz, bad nymph, for quick jigs vex.
The early bird catches the worm, but the second mouse gets the cheese.
A stitch in time saves nine.
Actions speak louder than words.
Slow and steady wins the race.
Every cloud has a silver lining.
When the going gets tough, the tough get going.
Fortune favors the bold.
A journey of a thousand miles begins with a single step.
The pen is mightier than the sword.
Look before you leap, and think before you speak.
Where there is smoke, there is fire.
Rome was not built in a day, but they were laying bricks every hour.
Practice makes progress, and progress makes a champion.
The best time to plant a tree was twenty years ago. The second best time is now.
Honesty is the best policy, even when nobody is watching.
It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. | Jane Austen, Pride and Prejudice
It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity. | Charles Dickens, A Tale of Two Cities
Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. | Herman Melville, Moby-Dick
To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and by opposing end them. | William Shakespeare, Hamlet
All the world's a stage, and all the men and women merely players; they have their exits and their entrances, and one man in his time plays many parts. | William Shakespeare, As You Like It
Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. | Abraham Lincoln, Gettysburg Address
We hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness. | Declaration of Independence
"Curiouser and curiouser!" cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English). | Lewis Carroll, Alice's Adventures in Wonderland
Once upon a midnight dreary, while I pondered, weak and weary, over many a quaint and curious volume of forgotten lore, while I nodded, nearly napping, suddenly there came a tapping, as of some one gently rapping, rapping at my chamber door. | Edgar Allan Poe, The Raven
I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived. | Henry David Thoreau, Walden
Hope is the thing with feathers that perches in the soul, and sings the tune without the words, and never stops at all. | Emily Dickinson
The only thing we have to fear is fear itself. | Franklin D. Roosevelt
There is nothing either good or bad, but thinking makes it so. | William Shakespeare, Hamlet
Better three hours too soon than a minute too late. | William Shakespeare, The Merry Wives of Windsor
The course of true love never did run smooth. | William Shakespeare, A Midsummer Night's Dream
You see, but you do not observe. The distinction is clear. | Arthur Conan Doyle, A Scandal in Bohemia
How often have I said to you that when you have eliminated the impossible, whatever remains, however improbable, must be the truth? | Arthur Conan Doyle, The Sign of the Four
It is a far, far better thing that I do, than I have ever done; it is a far, far better rest that I go to than I have ever known. | Charles Dickens, A Tale of Two Cities
I am no bird; and no net ensnares me: I am a free human being with an independent will. | Charlotte Bronte, Jane Eyre
Whenever you find yourself on the side of the majority, it is time to pause and reflect. | Mark Twain
I can resist everything except temptation. | Oscar Wilde, Lady Windermere's Fan
We are all in the gutter, but some of us are looking at the stars. | Oscar Wilde, Lady Windermere's Fan
I wandered lonely as a cloud that floats on high o'er vales and hills, when all at once I saw a crowd, a host, of golden daffodils. | William Wordsworth
Shall I compare thee to a summer's day? Thou art more lovely and more temperate. | William Shakespeare, Sonnet 18
O Captain! My Captain! our fearful trip is done, the ship has weather'd every rack, the prize we sought is won. | Walt Whitman
Two roads diverged in a yellow wood, and sorry I could not travel both and be one traveler, long I stood and looked down one as far as I could to where it bent in the undergrowth. | Robert Frost, The Road Not Taken
The tortoise and the hare agreed to race to the old oak at the end of the lane. The hare sprinted ahead, grew bored, and fell asleep in the sun, while the tortoise plodded on and crossed the line first.
A shepherd boy who cried wolf for fun soon found that nobody came when a real wolf appeared. Lies, even small ones, cost us the trust we need most.
The fox looked up at the grapes hanging high on the vine, jumped a few times, and finally walked away muttering that they were probably sour anyway.
An ant worked all summer carrying grain to its nest, while a grasshopper sang in the grass. When winter came, only one of them had dinner.
Honey bees communicate by dancing. A bee that finds flowers returns to the hive and waggles in a figure eight, and the angle and length of the waggle tell her sisters where to fly.
The octopus has three hearts, blue blood, and nine brains if you count the small cluster of nerve cells in each of its eight arms.
A group of crows is called a murder, a group of owls is called a parliament, and a group of flamingos is called a flamboyance.
Lightning is hotter than the surface of the sun, reaching about 30,000 degrees Celsius for a split second before the air around it explodes into thunder.
Sound travels about 343 meters per second in air, which means you can estimate how far away a storm is by counting the seconds between the flash and the boom.
Water is strange. It expands when it freezes, which is why ice floats, and that simple fact is the reason lakes freeze from the top down and fish survive the winter.
The human heart beats around 100,000 times a day, pumping blood through about 100,000 kilometers of vessels. That is enough to circle the Earth two and a half times.
A single cloud can weigh more than a million kilograms, yet it floats because that weight is spread across billions of tiny droplets in a huge volume of air.
Deep in the ocean, where sunlight never reaches, many animals make their own light. Jellyfish, squid, and anglerfish glow to hunt, to hide, and to find one another in the dark.
Tardigrades, also known as water bears, are microscopic animals that can survive freezing, boiling, radiation, and even the vacuum of outer space by curling into a dry ball.
The Amazon rainforest produces a great deal of the planet's oxygen, but it also uses most of it. Its real gift to the world is rain, climate control, and an enormous variety of life.
Bamboo is a grass, not a tree, and some species can grow almost a meter in a single day. Forests of it sway and creak like a ship at sea.
Mount Everest grows about four millimeters taller every year because the two great plates of rock beneath the Himalayas are still pressing together.
Venus spins so slowly that one day there lasts longer than one year. It also spins backward, so the sun rises in the west and sets in the east.
Saturn is so light for its size that, if you could find a bathtub big enough, the whole planet would float. Its rings are mostly chunks of ice, some as small as sand and some as big as houses.
Light from the sun takes about eight minutes to reach the Earth. When you look at the night sky, you are seeing stars as they were years, centuries, or even millennia ago.
The first computer bug was a real moth found trapped in a relay of the Harvard Mark II in 1947. The operators taped it into their logbook with the note: first actual case of bug being found.
Early computers filled entire rooms and had less power than a modern calculator. Today, the phone in your pocket can perform billions of operations every second.
A password should be long rather than complicated. Four unrelated words strung together are easier to remember and much harder to crack than a short jumble of symbols.
When you press a key, a tiny switch closes, a signal races along a wire, and a program somewhere decides what to do with it. All of this happens in a few thousandths of a second.
The internet is not a cloud. It is a vast tangle of cables, some of them lying on the ocean floor, carrying light from one continent to another in a fraction of a second.
Good code is like a good recipe: short, clear, and easy to follow. If you need a long note to explain a line, the line probably needs to be rewritten.
Before you trust a message that asks for money or a password, stop and check. Real companies do not rush you, and a scam always does.
To make a simple tomato sauce, warm olive oil in a pan, add chopped garlic for thirty seconds, pour in a can of crushed tomatoes, and simmer gently with a pinch of salt for twenty minutes.
Bread needs only four things: flour, water, salt, and yeast. The rest is time and patience, because the dough does most of the work while you are asleep.
Always taste as you cook. Salt wakes up flavor, acid brightens it, fat carries it, and heat changes everything, so adjust a little at a time.
Rice should be rinsed until the water runs clear, then cooked with exactly as much water as it needs. Once the lid is on, resist the urge to peek.
A cup of strong black coffee contains about 95 milligrams of caffeine, while a cup of green tea has roughly a third of that. Both are best enjoyed slowly.
Chocolate comes from the seeds of the cacao tree. The seeds are fermented, dried, roasted, and ground, then blended with sugar and milk to make the bar in your hand.
The smell of fresh bread, rain on warm pavement, and a pine forest in the morning can all bring back memories we thought we had lost.
A good map shows you where you are, where you want to go, and what lies in between. A great map also tells you which roads are worth taking just for the view.
The Great Wall of China is not one continuous wall. It is a series of walls, towers, and natural barriers built by many dynasties over more than two thousand years.
Venice is built on more than a hundred small islands, linked by about four hundred bridges. There are no cars in the old city, so everything travels by boat or on foot.
Iceland sits on the line between two tectonic plates, so it has glaciers, geysers, hot springs, and volcanoes all within a few hours' drive of each other.
The Sahara is the largest hot desert in the world, about the size of the United States. Only a small part of it is sand dunes; most of it is rock, gravel, and dry plains.
The Nile flows north for more than 6,600 kilometers, from the highlands of East Africa to the Mediterranean Sea. For thousands of years, the farms of Egypt depended on its yearly flood.
Tokyo is the largest city in the world by population, home to more than thirty million people in its wider area, yet its streets are famously clean and its trains are famously on time.
Canada has more lakes than any other country in the world. If you stood at a map and counted them all, you would be there for a very long time.
The Pacific Ocean is larger than all of the land on Earth put together. It is so deep in places that Mount Everest could sink beneath the surface with more than two kilometers to spare.
The ancient Romans built roads so well that some of them are still in use two thousand years later. They laid stone on gravel on sand, and built a gentle curve into every surface so that water ran off.
Long before there were clocks, people measured time with shadows. A simple stick in the ground, a sundial, was good enough to tell the hours on a bright day.
The printing press, invented around 1440, let people copy a book in days instead of months. Within fifty years, millions of books were circulating across Europe, and ideas spread faster than ever.
In 1969, two astronauts walked on the surface of the Moon while a third circled above. The computer that guided them had less memory than a modern greeting card.
The pyramids of Giza were built more than four thousand five hundred years ago, and for almost four thousand years the largest of them was the tallest building on the planet.
Gutenberg, Galileo, Newton, and Darwin all changed how we see the world, and each of them started with the same thing: a curious mind and a stubborn willingness to look closely.
Cleopatra lived closer in time to the first iPhone than to the building of the Great Pyramid. History is longer than it feels, and our own era is only a small part of it.
Samurai in feudal Japan followed a code of honor called bushido, which valued loyalty, courage, discipline, and skill in both the sword and the brush.
A marathon is 42.195 kilometers long, a distance first fixed at the 1908 Olympic Games in London so that the race could start at the castle and finish in front of the royal box.
Basketball was invented in 1891 by a teacher who nailed two peach baskets to the walls of a gym and wrote down thirteen simple rules for his students to follow.
In tennis, the scoring goes love, fifteen, thirty, forty, and game. Nobody is completely sure why, but many people think it comes from the quarters of a clock face.
A perfect score in ten-pin bowling is 300, which requires twelve strikes in a row. Even the best players in the world manage it only a few times in a lifetime.
The first modern Olympic Games were held in Athens in 1896, with 14 nations and 241 athletes. Today, more than 200 nations send over ten thousand athletes to each summer edition.
Good teams are not built from the best players. They are built from players who trust each other, pass the ball, and play for the name on the front of the shirt.
A violin has four strings, a guitar usually has six, and a piano has eighty-eight keys, but behind each of them is a person who practiced the same simple passage a thousand times.
The beat of a song is like a heartbeat. Tap your foot to it, and you will find that the whole room begins to move in the same rhythm without anybody planning it.
Painting a landscape takes more than copying what you see. You have to decide what to leave out, where to put the light, and which small detail will make a stranger feel they have been there.
Every great story has the same few bones: someone wants something, something stands in the way, and the person has to change to get it. Everything else is decoration.
A library is a quiet place full of loud ideas. Every shelf holds thousands of voices waiting for someone to open a cover and let them speak.
Film is made of still pictures shown so quickly that your eyes cannot separate them. At twenty-four frames per second, a thousand photographs become a moving horse, a kiss, a chase across the rooftops.
The road to the lighthouse was long and narrow, and the wind pushed against us the whole way. When the lamp finally swept over the rocks, nobody said a word.
She had never seen snow before, and she stood at the window for an hour watching it settle on the garden, the fence, and the old bicycle that nobody had ridden since summer.
The train pulled out of the station at exactly seven o'clock, and the platform slowly emptied. He folded his ticket into his pocket, leaned back, and watched the city turn into fields.
There was a small bakery on the corner of the street, and every morning the smell of warm bread rolled out the door and down the hill, waking the neighbors one by one.
At the top of the hill there stood a crooked little house with a green door, and in its garden grew roses that no one remembered planting.
The rain began softly, a whisper on the roof, and then it came down in sheets. We sat on the porch with cups of tea and watched the street turn into a river.
When the power went out, the whole building went quiet. Then someone lit a candle, someone else found a deck of cards, and by midnight the hallway was full of laughter.
The old clock in the hall had not worked for years, but nobody dared to take it down. It reminded us that some things are worth keeping simply because they were always there.
He opened the letter slowly, afraid of what it might say. It was only three lines long, and by the end of the last one he was smiling so widely that his cheeks hurt.
The market was loud and crowded, with stalls piled high with oranges, spices, and bright cloth. A boy in a red cap ran between the carts carrying a tray of warm sesame bread.
Under the bridge, the river moved slowly, brown and heavy after the rain. A heron stood in the shallows, so still that you could almost mistake it for part of the bank.
The lake was as smooth as glass at dawn. We pushed the canoe out without a sound, and the only thing that moved was the mist rising slowly off the water.
It started as a small idea in a notebook, one line in the corner of a page, and over the next ten years it turned into a company, a team of two hundred people, and a product used in forty countries.
The best way to learn something new is to teach it to someone else. Explaining an idea out loud shows you right away which parts you really understand and which parts you only thought you did.
You do not need to be great to start, but you do need to start to be great. Every expert you admire was once a beginner who kept showing up on the days when they did not feel like it.
Sleep is not wasted time. While you rest, your brain sorts the day's memories, clears out waste, and gets ready to learn again. A tired mind is a slow mind, no matter how hard it tries.
Drinking water, walking outside, and talking with a friend are three of the cheapest ways to feel better, and almost no one does them as often as they should.
A balanced day has room for work, play, food, rest, and people you love. If one of them is missing for too long, the others start to wobble.
Typing fast is not about moving your fingers faster. It is about looking ahead, keeping a steady rhythm, and trusting your hands to know where the letters are.
Speed comes from accuracy. If you slow down just enough to avoid mistakes, you will soon find that you are going faster than when you rushed and kept stopping to fix them.
Posture matters when you type. Keep your wrists straight, your shoulders relaxed, and your eyes on the screen, and you will be able to practice for much longer without getting tired.
Fifty words per minute is good, eighty is excellent, and over a hundred puts you among the fastest typists in the world. Every level starts with the same thing: a few minutes of practice every day.
The home row keys are A, S, D, F for the left hand and J, K, L, and semicolon for the right. Small bumps on the F and J keys help your fingers find their place without looking.
Remember to breathe. When you are racing against the clock, it is easy to hold your breath and tighten your arms. Loose hands and a calm mind are faster than tense ones.
The fastest typist in the world has been measured at over 200 words per minute, but even that number belongs to a short burst. The real skill is staying fast for a whole page.
In a race, the car that wins is not always the fastest one. It is the one that makes the fewest mistakes, stays calm in the last corner, and never stops believing that the finish line is close.
The engine roared, the lights turned green, and the whole field launched down the track in a cloud of smoke and noise. Within seconds, the leader had already pulled away.
A good pit stop takes less than three seconds. Four tires are changed, the car is refueled in some series, and the driver is back on the track before the crowd has finished gasping.
The race was decided on the final lap. Two cars went into the last corner side by side, and by the time the dust cleared, a tiny gap of only a few centimeters separated the winner from second place.
Champions are made in the quiet hours when nobody is watching: the early mornings, the late evenings, and the long drives home after a bad day when they promised themselves to try again.
Small habits repeated every day add up to big results. One page a day makes a book each year, one mile a day makes a marathon each month, and one kind word a day changes a whole life.
Kindness costs nothing, yet it is worth more than almost anything you can buy. A single smile can turn around a stranger's morning, and a single thank you can make someone's whole week.
To solve a hard problem, break it into small pieces. Solve the first one, then the next, and soon you will look back and wonder why the whole thing ever seemed so scary.
Failure is just information. The scientist whose experiment goes wrong learns something new, and the person who falls off a bike learns exactly how not to fall next time.
Wind turbines turn the movement of air into electricity. A single large turbine can power hundreds of homes, and the blades can be longer than a jumbo jet's wings.
Solar panels are made from thin slices of silicon that release tiny electric charges when sunlight hits them. In one hour, the sun sends the Earth more energy than humanity uses in a whole year.
A recycled aluminum can be back on the shelf as a brand new can in as little as sixty days, and making it uses only five percent of the energy needed to produce one from raw ore.
Trees talk to one another. Under the forest floor, a network of fungus threads links their roots, letting them share water, sugar, and even warnings about insects.
The blue whale is the biggest animal that has ever lived. Its heart is the size of a small car, its tongue weighs as much as an elephant, and its call can be heard hundreds of kilometers away.
Penguins cannot fly, but they are superb swimmers. Some species dive deeper than five hundred meters and stay underwater for over twenty minutes while hunting for fish.
Elephants are among the few animals that seem to mourn their dead. Herds have been seen returning to the bones of a lost friend, touching them gently with their trunks.
A cheetah can go from zero to one hundred kilometers per hour in about three seconds, but it can keep up that speed for only a few hundred meters before it has to rest.
Hummingbirds beat their wings up to eighty times a second, and they are the only birds that can fly backward. To fuel such a life, they must feed dozens of times an hour, all day long.
Dogs can smell thousands of times better than we can. A bloodhound can follow a trail that is several days old, and some dogs can even detect illness by scent alone.
Cats spend about two thirds of their lives asleep, which means a ten-year-old cat has been awake for a little over three years. They save their energy for a few moments of brilliant mischief.
There are more stars in the universe than grains of sand on all the beaches of the Earth. Each one is a sun, and many of them have planets circling them in the dark.
The Milky Way is the galaxy where we live. It contains hundreds of billions of stars, and our sun is just one of them, about two thirds of the way out along one of the spiral arms.
Black holes are not really holes. They are places where so much matter has been squeezed into so small a space that nothing, not even light, can climb out of their gravity.
A day on Mars is only about forty minutes longer than a day on Earth, which is why the scientists who drive the rovers set their wristwatches to Martian time and adjust their sleep to match.
Astronauts on the space station see sixteen sunrises and sixteen sunsets every day, because they circle the planet once every ninety minutes at a speed of nearly twenty-eight thousand kilometers per hour.
Mathematics is the language of patterns. A sunflower, a seashell, and a galaxy all follow the same spiral, and a child with a pencil can discover it by adding each number to the one before.
Zero is one of the most important numbers ever invented. Without it, we could not write large numbers easily, balance a bank account, or run any of the computers that drive the modern world.
The number pi, the ratio of a circle's circumference to its diameter, never ends and never repeats. Computers have calculated it to trillions of digits, and there is still no pattern in sight.
A prime number can be divided only by one and itself. Two is the only even prime, and mathematicians have proven that there are infinitely many primes, so the list never comes to an end.
If you fold a piece of paper in half fifty times, it would be thick enough to reach almost as far as the sun. Of course, you cannot really fold it more than seven or eight times, but the math is still amazing.
The first email was sent in 1971, the first text message in 1992, and the first photo shared on the web in 1992 as well. Since then, the pace of change has only grown faster.
Radio waves, microwaves, visible light, and X-rays are all forms of the same thing: electromagnetic waves. The only difference between them is how quickly they wiggle.
The compass works because the Earth is a giant magnet. The needle lines up with the invisible field, pointing the way for sailors, hikers, and pilots who have no other signs to follow.
Glass is made by melting sand at very high temperatures. When it cools, it becomes hard and clear, and it can be shaped into windows, lenses, bottles, and screens.
The invention of the bicycle gave ordinary people the freedom to travel farther than their feet could carry them, and for many families in the early twentieth century it was the first vehicle they ever owned.
A lighthouse does not just shine a light. Its lens bends the beam into a narrow ray, and the rotation of the lens makes each lighthouse flash in a pattern that sailors can recognize at night.
The first photographs needed several hours of exposure, so people in them had to sit perfectly still. That is one reason why so many old portraits show serious faces and no smiles.
Maps from the age of exploration were full of sea monsters and blank spaces, but they were also works of art, drawn by hand with the finest ink and sometimes decorated with gold.
Chess was invented in India more than fifteen hundred years ago, and over the centuries it traveled to Persia, to Arabia, and to Europe, changing a little with every new country that adopted it.
Jigsaw puzzles were first made as maps cut into pieces to teach children geography. Today, they are enjoyed by millions of people who like to relax by finding where each piece fits.
Origami is the art of folding paper into shapes without cutting or gluing. From a simple square, a patient hand can make a crane, a frog, a boat, or a flower with a hundred petals.
Chewing gum was originally made from the sap of a tropical tree. Today, most gum is made from synthetic rubber, but the old trees are still tapped in a few places in Central America.
Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over three thousand years old, and the honey was still perfectly good to eat.
Popcorn pops because each kernel holds a drop of water inside a hard shell. When it is heated, the water turns to steam, pressure builds, and the kernel bursts inside out.
Bananas are berries but strawberries are not. In the strict language of botany, a berry grows from a single flower with one ovary, and by that rule bananas, grapes, and tomatoes all qualify.
A rainbow is a full circle, but from the ground we usually see only the top half. If you ever fly high enough in an airplane on a rainy day, you may see the whole ring around the shadow of the plane.
The first rule of the road is to be seen and to see. Slow down at corners, look both ways twice, and never assume that the driver of the car has noticed you.
Packing for a trip is easy once you know the rule: lay out everything you think you need, then put half of it back. You will return home with clean clothes you never wore.
The best part of any journey is not the arrival but the small surprises along the way: a friendly stranger, a hidden cafe, a view that is not in any guidebook at all.
Mountains teach patience. You cannot rush a climb, and the summit is always farther than it looks. But when you finally stand on top, the whole world is laid out below you like a map.
Every snowflake has six sides, yet no two are exactly alike. Each one forms as a tiny crystal floating through the clouds, and its shape records the temperature and humidity of its long, quiet journey.
The wind is not heard until it meets something: a tree, a wire, a chimney, a flag. In an empty desert at night, even a gale can be completely silent.
In the middle of a crowded city, a small park can feel like a different country. The traffic fades, the birds take over, and for a few minutes everything slows to the pace of a walking dog.
Thunderstorms usually form on warm afternoons, when rising air carries water vapor high into the sky and the vapor turns into towering clouds. By evening, the storm has often disappeared.
Coral reefs cover less than one percent of the ocean floor, but they are home to about a quarter of all marine species. They are often called the rainforests of the sea.
The Moon is slowly drifting away from the Earth at about the speed that your fingernails grow, nearly four centimeters each year. In a billion years, it will look noticeably smaller.
Every second, about four million tons of matter in the sun are turned into energy. And yet the sun is so enormous that it has enough fuel to keep shining for another five billion years.
Between 1 and 100, there are 25 prime numbers, 12 perfect squares or cubes, and exactly one number, 1, that is neither prime nor composite. Counting is the oldest game in the world!
At 9:45 a.m. on June 12th, 2023, the 14-car convoy left the garage, turned left at Elm Street, and headed 27.5 miles north to the track, arriving with 3 minutes to spare.
Our order #4821 includes 3 lamps, 12 chairs, and 2 tables, priced at $149.99, $39.50, and $210.00 each, with free shipping on anything over $500 (tax not included).
"Don't worry," she said, "we'll make it on time if we leave now; the traffic's light, the roads are dry, and my brother's driving, which means we'll arrive early!"
Ingredients: 2 cups flour, 1 tsp baking soda, 1/2 tsp salt, 3/4 cup sugar, 2 eggs, and 1 cup milk. Mix the dry items first, then fold in the wet ones until just combined.
Q: What has keys but cannot open locks? A: A piano! Q: What has a face and two hands but no arms or legs? A: A clock. Riddles are good practice for the fingers and the mind.
Remember: the meeting is at 3:30 p.m. in Room B-12 (not B-21). Bring your laptop, a pen, and last month's report; coffee and snacks will be provided by the front desk.
The password hint reads: first pet + birth year + favorite color. Keep it secret, keep it safe, and never share it with anyone, even if they say they work for tech support.
Whenever the weather turned cold, my grandmother would pull a heavy quilt from the cedar chest, and the whole house would smell of lavender and woodsmoke until spring finally returned.
The detective turned the key very slowly, listening for any sound from the room beyond. The door swung open on a perfectly tidy study, and yet something about it felt completely wrong.
Down by the harbor, the fishing boats rocked in the gray light, their nets heaped on the decks, their engines coughing awake one after another as the town slowly began its day.
Her first marathon felt like three different races: a joyful one for the first ten kilometers, a stubborn one in the middle, and a tearful, triumphant one in the last mile.
A good teacher is a lantern in the hallway. You may not notice the light while you are walking, but you remember how dark it was when it went out, and how far it showed you.
You cannot cross the sea merely by standing and staring at the water. You have to build the boat, learn the stars, trust your crew, and be willing to lose sight of land.
In the garden at dusk the fireflies came out, one by one, then in dozens, drifting above the lawn like slow sparks while the crickets tuned up for their long nightly concert.
When he was a boy, he took apart every clock in the house to see how it worked. Most of them never ran again, but by the age of twenty, he could repair any watch in the town.
The old library had a sliding ladder, a spiral staircase, and a smell like warm paper. It was the kind of place where a rainy afternoon could swallow a whole novel and a pot of tea.
Cooking for friends is a form of conversation. You listen to what they love, you add a pinch of something new, and when the plates come back empty, you know you have been heard.
If your keyboard feels slow, check your hands before you blame your fingers. Tense shoulders, stiff wrists, and a rushed mind each cost you a few words per minute without you noticing.
Most races are won in the first few seconds and lost in the last few meters. Start clean, stay smooth, and keep something in reserve for the final push to the line.
Thank you for typing along with me! Keep your eyes on the words ahead, let your hands do the work, and remember that every mistake you fix today is one you will not make tomorrow.
`;

  const QA_ART = `
Who painted the Mona Lisa?|Leonardo da Vinci|Michelangelo|Raphael|Botticelli
Who painted the ceiling of the Sistine Chapel?|Michelangelo|Leonardo da Vinci|Donatello|Titian
Which artist painted The Starry Night?|Vincent van Gogh|Claude Monet|Paul Cezanne|Edvard Munch
Who painted The Persistence of Memory with its melting clocks?|Salvador Dali|Pablo Picasso|Rene Magritte|Joan Miro
Which painter is famous for The Scream?|Edvard Munch|Gustav Klimt|Egon Schiele|Henri Matisse
Who painted Girl with a Pearl Earring?|Johannes Vermeer|Rembrandt|Frans Hals|Jan van Eyck
Which movement was Claude Monet a founder of?|Impressionism|Cubism|Surrealism|Baroque
Pablo Picasso co-founded which art movement with Georges Braque?|Cubism|Fauvism|Dadaism|Futurism
Who painted Guernica?|Pablo Picasso|Francisco Goya|Diego Velazquez|Salvador Dali
Who created the sculpture David in Florence, finished in 1504?|Michelangelo|Bernini|Donatello|Rodin
Who painted The Last Supper?|Leonardo da Vinci|Raphael|Caravaggio|El Greco
Which artist is known for his soup can paintings?|Andy Warhol|Roy Lichtenstein|Jackson Pollock|Keith Haring
Who sculpted The Thinker?|Auguste Rodin|Constantin Brancusi|Henry Moore|Alberto Giacometti
Which painter is known for dripping and pouring paint onto canvas?|Jackson Pollock|Mark Rothko|Willem de Kooning|Franz Kline
The Birth of Venus was painted by which artist?|Sandro Botticelli|Titian|Giorgione|Tintoretto
Which Dutch painter created The Night Watch?|Rembrandt|Vermeer|Rubens|Van Dyck
Which artist painted the Water Lilies series?|Claude Monet|Edgar Degas|Pierre-Auguste Renoir|Camille Pissarro
Who painted The Kiss, covered in gold leaf, in 1907-08?|Gustav Klimt|Egon Schiele|Alphonse Mucha|Marc Chagall
Who is the Mexican painter famous for her self-portraits and unibrow?|Frida Kahlo|Georgia O'Keeffe|Tamara de Lempicka|Diego Rivera
What are the three primary colors in painting?|Red, yellow and blue|Red, green and blue|Orange, green and purple|Black, white and red
Mixing blue and yellow paint gives which color?|Green|Purple|Orange|Brown
Which museum in Paris houses the Mona Lisa?|The Louvre|Musee d'Orsay|Centre Pompidou|Petit Palais
In which city is the Uffizi Gallery?|Florence|Rome|Venice|Milan
Which city is home to the Prado Museum?|Madrid|Barcelona|Lisbon|Seville
In which city is the Rijksmuseum?|Amsterdam|Rotterdam|Brussels|The Hague
Who designed the Guggenheim Museum in Bilbao?|Frank Gehry|Zaha Hadid|Renzo Piano|Norman Foster
Which architect designed the Sagrada Familia in Barcelona?|Antoni Gaudi|Santiago Calatrava|Le Corbusier|Oscar Niemeyer
The Eiffel Tower was built for the World's Fair of which year?|1889|1789|1900|1925
The Eiffel Tower is named after which engineer?|Gustave Eiffel|Georges Haussmann|Victor Horta|Auguste Perret
The Taj Mahal was built by Shah Jahan as a memorial to whom?|His wife Mumtaz Mahal|His mother|His father Jahangir|His son Dara Shikoh
In which country is the Parthenon?|Greece|Italy|Turkey|Egypt
Which Roman amphitheater was used for gladiator fights?|The Colosseum|The Pantheon|The Forum|The Circus Maximus
What style of architecture is Notre-Dame de Paris?|Gothic|Baroque|Romanesque|Neoclassical
Which Italian city has the Leaning Tower?|Pisa|Florence|Siena|Bologna
Who wrote the play Romeo and Juliet?|William Shakespeare|Christopher Marlowe|Ben Jonson|John Webster
Who wrote the novel Pride and Prejudice?|Jane Austen|Charlotte Bronte|George Eliot|Mary Shelley
Who wrote 1984?|George Orwell|Aldous Huxley|Ray Bradbury|H. G. Wells
Who wrote The Great Gatsby?|F. Scott Fitzgerald|Ernest Hemingway|John Steinbeck|William Faulkner
Who wrote Don Quixote?|Miguel de Cervantes|Lope de Vega|Federico Garcia Lorca|Gabriel Garcia Marquez
Who wrote The Divine Comedy?|Dante Alighieri|Petrarch|Boccaccio|Virgil
Who wrote the novel Les Miserables?|Victor Hugo|Alexandre Dumas|Gustave Flaubert|Emile Zola
Who wrote Crime and Punishment?|Fyodor Dostoevsky|Leo Tolstoy|Anton Chekhov|Ivan Turgenev
Which author created the detective Sherlock Holmes?|Arthur Conan Doyle|Agatha Christie|Edgar Allan Poe|Wilkie Collins
Which author wrote Frankenstein?|Mary Shelley|Emily Bronte|Jane Austen|Bram Stoker
Who wrote The Hobbit?|J. R. R. Tolkien|C. S. Lewis|Roald Dahl|Philip Pullman
Who wrote the Harry Potter series?|J. K. Rowling|Suzanne Collins|Stephenie Meyer|Rick Riordan
Who wrote Moby-Dick?|Herman Melville|Nathaniel Hawthorne|Mark Twain|Jack London
Who wrote Alice's Adventures in Wonderland?|Lewis Carroll|Beatrix Potter|J. M. Barrie|Kenneth Grahame
Who wrote The Little Prince?|Antoine de Saint-Exupery|Jules Verne|Albert Camus|Jean-Paul Sartre
Which poet wrote The Raven?|Edgar Allan Poe|Walt Whitman|Robert Frost|Emily Dickinson
Which Greek poet is credited with the Iliad and the Odyssey?|Homer|Sophocles|Hesiod|Euripides
Who wrote the plays Hamlet, Macbeth and Othello?|William Shakespeare|Oscar Wilde|Samuel Beckett|George Bernard Shaw
In which Shakespeare play does the character Prospero appear?|The Tempest|Twelfth Night|King Lear|Much Ado About Nothing
Who composed the Four Seasons?|Antonio Vivaldi|Johann Sebastian Bach|George Frideric Handel|Claudio Monteverdi
Who composed the Ninth Symphony that includes the Ode to Joy?|Ludwig van Beethoven|Wolfgang Amadeus Mozart|Johannes Brahms|Franz Schubert
Who composed The Magic Flute?|Wolfgang Amadeus Mozart|Joseph Haydn|Gioachino Rossini|Giuseppe Verdi
Which composer wrote the ballet Swan Lake?|Pyotr Ilyich Tchaikovsky|Sergei Rachmaninoff|Igor Stravinsky|Sergei Prokofiev
Which composer wrote the opera La Traviata?|Giuseppe Verdi|Giacomo Puccini|Gaetano Donizetti|Vincenzo Bellini
Which composer was almost completely deaf when he wrote his later works, including the Ninth Symphony?|Ludwig van Beethoven|Frederic Chopin|Franz Liszt|Robert Schumann
Who composed The Rite of Spring?|Igor Stravinsky|Claude Debussy|Maurice Ravel|Bela Bartok
Which instrument has 88 keys on a standard model?|Piano|Organ|Harpsichord|Accordion
How many strings does a standard violin have?|4|5|6|3
Which instrument family does the flute belong to?|Woodwind|Brass|Strings|Percussion
Which of these is a brass instrument?|Trombone|Clarinet|Oboe|Cello
What is the term for a gradual increase in volume in music?|Crescendo|Diminuendo|Staccato|Legato
How many members were in the Beatles?|4|3|5|6
Which band released the album The Dark Side of the Moon?|Pink Floyd|Led Zeppelin|The Rolling Stones|Queen
Who is known as the King of Pop?|Michael Jackson|Elvis Presley|Prince|Little Richard
Which band had a lead singer called Freddie Mercury?|Queen|The Who|Genesis|Deep Purple
What is the art of beautiful handwriting called?|Calligraphy|Typography|Cartography|Heraldry
What is the Japanese art of paper folding called?|Origami|Ikebana|Kintsugi|Bonsai
What is the Japanese art of repairing broken pottery with gold called?|Kintsugi|Raku|Sumi-e|Ukiyo-e
What is a painting done on wet plaster called?|Fresco|Mosaic|Tempera|Gouache
Which art technique uses small colored tiles to make a picture?|Mosaic|Collage|Etching|Lithography
What do we call a painting of a person?|A portrait|A still life|A landscape|A seascape
What is the term for a picture of objects such as fruit and flowers on a table?|Still life|Landscape|Genre scene|Vanitas
Which Italian word means light and dark contrast in painting?|Chiaroscuro|Sfumato|Impasto|Pentimento
Which famous painting technique of Leonardo creates soft, smoky transitions?|Sfumato|Pointillism|Cloisonne|Grisaille
Which painter created A Sunday Afternoon on the Island of La Grande Jatte?|Georges Seurat|Paul Signac|Camille Pissarro|Henri Rousseau
Which Renaissance artist painted The School of Athens?|Raphael|Michelangelo|Titian|Giotto
Which Dutch painter is famous for his Sunflowers series?|Vincent van Gogh|Piet Mondrian|Jan Steen|Hieronymus Bosch
Which Dutch painter is known for grids of black lines and blocks of primary colors?|Piet Mondrian|Wassily Kandinsky|Kazimir Malevich|Paul Klee
Which painter is known for The Garden of Earthly Delights?|Hieronymus Bosch|Pieter Bruegel|Albrecht Durer|Hans Holbein
Who painted American Gothic?|Grant Wood|Edward Hopper|Norman Rockwell|Andrew Wyeth
Who painted Nighthawks, set in a late-night diner?|Edward Hopper|Andrew Wyeth|Georgia O'Keeffe|Thomas Hart Benton
Which Spanish artist painted Las Meninas?|Diego Velazquez|Francisco Goya|El Greco|Bartolome Murillo
Which Catalan artist is famous for dream-like, curving melting forms and a waxed moustache?|Salvador Dali|Joan Miro|Antoni Tapies|Pablo Gargallo
Who painted The Treachery of Images, with the words This is not a pipe?|Rene Magritte|Max Ernst|Giorgio de Chirico|Yves Tanguy
Which anonymous street artist is famous for stenciled work such as Girl with Balloon?|Banksy|Shepard Fairey|Invader|JR
In theater, what is the area of the stage closest to the audience called?|Downstage|Upstage|Backstage|Wings
What is a play with no spoken words, using only gesture, called?|Mime|Opera|Farce|Monologue
Which London theater is famous for staging Shakespeare plays in a reconstructed building on the Thames?|Shakespeare's Globe|The Old Vic|Drury Lane|The Palladium
Which dance style originated in Argentina and is danced in a close embrace?|Tango|Salsa|Flamenco|Samba
Which dance is associated with Spain and features guitar and castanets?|Flamenco|Waltz|Polka|Foxtrot
In which Russian city is the Bolshoi Theatre?|Moscow|Saint Petersburg|Kazan|Novosibirsk
Who wrote the opera Carmen?|Georges Bizet|Jacques Offenbach|Hector Berlioz|Camille Saint-Saens
Which author wrote One Hundred Years of Solitude?|Gabriel Garcia Marquez|Jorge Luis Borges|Isabel Allende|Mario Vargas Llosa
Which novelist wrote To Kill a Mockingbird?|Harper Lee|Toni Morrison|Maya Angelou|Flannery O'Connor
Which poet wrote Leaves of Grass?|Walt Whitman|Ralph Waldo Emerson|Henry Wadsworth Longfellow|Carl Sandburg
Which author wrote The Catcher in the Rye?|J. D. Salinger|Jack Kerouac|Kurt Vonnegut|Philip Roth
Who wrote the fairy tale The Ugly Duckling?|Hans Christian Andersen|The Brothers Grimm|Charles Perrault|Aesop
What do we call a three-line Japanese poem with 5-7-5 syllables?|Haiku|Sonnet|Limerick|Ode
How many lines does a sonnet have?|14|12|10|16
Which architect designed Fallingwater, the house built over a waterfall?|Frank Lloyd Wright|Mies van der Rohe|Louis Sullivan|Philip Johnson
The Sydney Opera House was designed by an architect from which country?|Denmark|Australia|England|Finland
Which pharaoh is famous for the gold funeral mask found in his tomb in 1922?|Tutankhamun|Ramesses II|Akhenaten|Khufu
Which ancient wonder was a huge statue at the entrance to the harbor of Rhodes?|Colossus of Rhodes|Statue of Zeus|Lighthouse of Alexandria|Hanging Gardens
Which famous statue was given to the United States by France?|Statue of Liberty|Lincoln Memorial|Mount Rushmore|Christ the Redeemer
`;

  const QA_SCI = `
What is the chemical symbol for gold?|Au|Ag|Gd|Go
What is the chemical symbol for water?|H2O|HO2|CO2|H2O2
What is the chemical symbol for sodium?|Na|So|Sd|S
What is the chemical symbol for iron?|Fe|Ir|In|I
What gas do plants absorb from the air for photosynthesis?|Carbon dioxide|Oxygen|Nitrogen|Hydrogen
What gas do humans need to breathe to survive?|Oxygen|Helium|Methane|Argon
What is the most abundant gas in Earth's atmosphere?|Nitrogen|Oxygen|Carbon dioxide|Argon
How many planets are in our solar system?|8|9|7|10
Which planet is known as the Red Planet?|Mars|Venus|Jupiter|Mercury
Which is the largest planet in our solar system?|Jupiter|Saturn|Neptune|Earth
Which planet is closest to the sun?|Mercury|Venus|Mars|Earth
Which planet has the most visible rings?|Saturn|Uranus|Neptune|Jupiter
What is the name of our galaxy?|The Milky Way|Andromeda|Triangulum|Whirlpool
What is the closest star to Earth?|The Sun|Proxima Centauri|Sirius|Betelgeuse
What force keeps us on the ground?|Gravity|Magnetism|Friction|Inertia
Who developed the theory of general relativity?|Albert Einstein|Isaac Newton|Niels Bohr|Galileo Galilei
Who is famous for discovering the laws of motion and universal gravitation?|Isaac Newton|Johannes Kepler|James Clerk Maxwell|Michael Faraday
Who proposed the theory of evolution by natural selection?|Charles Darwin|Gregor Mendel|Louis Pasteur|Alfred Wegener
Who discovered penicillin in 1928?|Alexander Fleming|Louis Pasteur|Joseph Lister|Robert Koch
Who is known as the father of genetics for his work on pea plants?|Gregor Mendel|Charles Darwin|James Watson|Thomas Hunt Morgan
Which scientist discovered radium and polonium and won two Nobel Prizes?|Marie Curie|Rosalind Franklin|Lise Meitner|Dorothy Hodgkin
What is the speed of light in a vacuum, approximately?|300,000 km per second|30,000 km per second|3,000 km per second|3 million km per second
What is the boiling point of water at sea level in Celsius?|100|90|110|212
What is the freezing point of water in Celsius?|0|-10|10|32
What is the hardest natural substance?|Diamond|Quartz|Steel|Topaz
What is the largest organ of the human body?|The skin|The liver|The brain|The lungs
How many bones does an adult human have?|206|186|226|256
How many chambers does the human heart have?|4|2|3|5
Which organ pumps blood around the body?|The heart|The liver|The kidney|The stomach
Which part of the blood carries oxygen?|Red blood cells|White blood cells|Platelets|Plasma
Which blood cells help fight infection?|White blood cells|Red blood cells|Platelets|Hemoglobin
What do we call animals that eat only plants?|Herbivores|Carnivores|Omnivores|Insectivores
What do we call animals that eat both plants and meat?|Omnivores|Herbivores|Carnivores|Detritivores
What is the process by which plants make food using sunlight?|Photosynthesis|Respiration|Fermentation|Digestion
What is the green pigment in plants that absorbs sunlight?|Chlorophyll|Carotene|Melanin|Keratin
What is the powerhouse of the cell?|Mitochondria|Nucleus|Ribosome|Golgi apparatus
What molecule carries genetic information in living things?|DNA|ATP|RNA polymerase|Glucose
Who is credited with discovering the double helix structure of DNA in 1953, together with Crick?|James Watson|Linus Pauling|Francis Bacon|Erwin Schrodinger
How many chromosomes do humans normally have?|46|23|44|48
What is the study of fungi called?|Mycology|Botany|Zoology|Entomology
What is the study of insects called?|Entomology|Ornithology|Herpetology|Ichthyology
What is the study of birds called?|Ornithology|Ichthyology|Mammalogy|Entomology
What is the largest mammal in the world?|Blue whale|African elephant|Giraffe|Sperm whale
What is the fastest land animal?|Cheetah|Lion|Pronghorn|Greyhound
How many legs does an insect have?|6|8|4|10
How many legs does a spider have?|8|6|10|4
Which group of animals are cold-blooded and include snakes and lizards?|Reptiles|Mammals|Birds|Amphibians
What do caterpillars turn into?|Butterflies or moths|Beetles|Dragonflies|Bees
Which animal is the only mammal capable of true flight?|Bat|Flying squirrel|Sugar glider|Flying lemur
Which planet has the Great Red Spot?|Jupiter|Mars|Saturn|Neptune
What is the name of the force that opposes motion between two surfaces in contact?|Friction|Tension|Gravity|Buoyancy
What do you call a substance that speeds up a chemical reaction without being used up?|Catalyst|Solvent|Reagent|Solute
What is the pH of pure water?|7|0|14|1
Which acid is found in the human stomach?|Hydrochloric acid|Sulfuric acid|Nitric acid|Acetic acid
What is the most common element in the universe?|Hydrogen|Oxygen|Helium|Carbon
What is the lightest element?|Hydrogen|Helium|Lithium|Carbon
What is the atomic number of carbon?|6|12|8|4
What particles orbit the nucleus of an atom?|Electrons|Protons|Neutrons|Quarks
What particle in the nucleus has a positive charge?|Proton|Electron|Neutron|Photon
Which metal is liquid at room temperature?|Mercury|Lead|Tin|Zinc
Which metal is the best conductor of electricity among common metals?|Silver|Iron|Aluminum|Lead
What is the chemical formula of table salt?|NaCl|KCl|NaOH|CaCO3
What is the main gas responsible for the greenhouse effect that humans emit by burning fossil fuels?|Carbon dioxide|Neon|Oxygen|Helium
What are the three states of matter commonly taught in school?|Solid, liquid and gas|Hot, cold and warm|Metal, wood and stone|Atom, ion and molecule
What is it called when a liquid turns into a gas?|Evaporation|Condensation|Sublimation|Freezing
What is it called when a gas turns into a liquid?|Condensation|Evaporation|Melting|Deposition
What unit is used to measure electric current?|Ampere|Volt|Ohm|Watt
What unit is used to measure force?|Newton|Joule|Pascal|Watt
What unit is used to measure frequency?|Hertz|Decibel|Lumen|Tesla
What device measures atmospheric pressure?|Barometer|Thermometer|Anemometer|Hygrometer
What is the layer of gases surrounding the Earth called?|The atmosphere|The lithosphere|The biosphere|The hydrosphere
Which layer of the Earth lies between the crust and the core?|The mantle|The lithosphere only|The stratosphere|The magnetosphere
What causes the tides on Earth?|The Moon's gravity|Wind|Earth's rotation only|The sun's heat
What causes the seasons on Earth?|The tilt of Earth's axis|Distance from the sun|Ocean currents|The Moon
Roughly how long does it take the Earth to orbit the sun?|365 days|30 days|400 days|52 days
How long does the Moon take to orbit the Earth, roughly?|About 27 days|About 7 days|About 365 days|About 3 days
Which scientist first used a telescope to observe moons orbiting Jupiter?|Galileo Galilei|Nicolaus Copernicus|Tycho Brahe|Edwin Hubble
What was the name of the first artificial satellite launched in 1957?|Sputnik 1|Explorer 1|Vostok 1|Apollo 1
Who was the first human in space, in 1961?|Yuri Gagarin|Neil Armstrong|Alan Shepard|John Glenn
Who was the first person to walk on the Moon?|Neil Armstrong|Buzz Aldrin|Yuri Gagarin|Michael Collins
What is the name of the telescope launched in 1990 that orbits the Earth?|Hubble Space Telescope|James Webb Space Telescope|Kepler|Spitzer
What is a group of stars forming a pattern in the sky called?|A constellation|A galaxy|A nebula|A cluster of planets
What is the name of the biggest moon of Saturn?|Titan|Europa|Ganymede|Io
Which is the hottest planet in the solar system?|Venus|Mercury|Mars|Jupiter
What is the largest bone in the human body?|Femur|Tibia|Humerus|Spine
What is the smallest bone in the human body?|Stapes|Hyoid|Patella|Coccyx
What vitamin do we get mainly from sunlight?|Vitamin D|Vitamin C|Vitamin A|Vitamin B12
Which vitamin is found in oranges and prevents scurvy?|Vitamin C|Vitamin K|Vitamin D|Vitamin E
What does a seismograph measure?|Earthquakes|Wind speed|Rainfall|Ocean tides
What is the scale used to measure the hardness of minerals?|Mohs scale|Richter scale|Beaufort scale|Kelvin scale
What is the name for a scientist who studies rocks?|Geologist|Meteorologist|Astronomer|Botanist
What is the name for a scientist who studies weather?|Meteorologist|Geologist|Volcanologist|Cartographer
What does a thermometer measure?|Temperature|Pressure|Humidity|Wind speed
What type of energy does a moving object have?|Kinetic energy|Potential energy|Thermal energy|Chemical energy
What kind of energy is stored in a stretched rubber band?|Potential energy|Kinetic energy|Sound energy|Nuclear energy
Which type of rock is formed from cooled magma or lava?|Igneous|Sedimentary|Metamorphic|Fossil
Which part of a plant absorbs water from the soil?|Roots|Leaves|Petals|Stem only
What do bees collect from flowers to make honey?|Nectar|Pollen only|Sap|Dew
What is the term for animals that are active at night?|Nocturnal|Diurnal|Crepuscular|Migratory
What is the name of the process by which a caterpillar becomes a butterfly?|Metamorphosis|Mutation|Migration|Evolution
Which sense organ contains the retina?|The eye|The ear|The nose|The tongue
What do we call a computer program that fixes a problem in code?|A patch|A virus|A cookie|A firewall
What does CPU stand for?|Central Processing Unit|Computer Personal Unit|Central Program Utility|Core Processing Utility
How many bits are in a byte?|8|4|16|10
Who is often called the first computer programmer, for her notes on Babbage's Analytical Engine?|Ada Lovelace|Grace Hopper|Hedy Lamarr|Margaret Hamilton
Which language is mostly used to add interactivity to web pages?|JavaScript|SQL|COBOL|Fortran
What does the acronym USB stand for?|Universal Serial Bus|United System Board|Ultra Speed Bridge|Universal Storage Block
`;

  const QA_SPO = `
How many players are on the field for one team in a soccer match?|11|10|9|12
How many players from one team are on the court in a basketball game?|5|6|7|4
How many players are on a volleyball team on the court?|6|5|7|9
How many players are on the field for one team in a rugby union match?|15|13|11|17
Which country has won the most FIFA World Cups?|Brazil|Germany|Italy|Argentina
Which country won the 2022 FIFA World Cup?|Argentina|France|Brazil|Croatia
Which country hosted the 2018 FIFA World Cup?|Russia|Brazil|Qatar|Germany
Which country hosted the 2014 FIFA World Cup?|Brazil|South Africa|Germany|Argentina
Which country won the first FIFA World Cup in 1930?|Uruguay|Brazil|Argentina|Italy
Which player is nicknamed La Pulga and won the 2022 World Cup with Argentina?|Lionel Messi|Angel Di Maria|Sergio Aguero|Diego Maradona
Which Portuguese forward has scored the most goals in the history of men's international football?|Cristiano Ronaldo|Eusebio|Luis Figo|Pepe
Which Brazilian player is the only one to have won three World Cups?|Pele|Ronaldo|Romario|Garrincha
Whose Hand of God goal came against England in the 1986 World Cup?|Diego Maradona|Pele|Johan Cruyff|Franz Beckenbauer
How long is a standard soccer match without extra time?|90 minutes|80 minutes|100 minutes|120 minutes
What color card does a referee show to send a soccer player off?|Red|Yellow|Blue|Green
What is the maximum number of points scored by a single shot in basketball under regular rules?|3|2|4|5
Which NBA player is nicknamed His Airness?|Michael Jordan|LeBron James|Kobe Bryant|Magic Johnson
Which basketball team did Michael Jordan win six championships with?|Chicago Bulls|Los Angeles Lakers|Boston Celtics|Detroit Pistons
How many points is a touchdown worth in American football?|6|7|3|5
How many points is a field goal worth in American football?|3|2|6|1
How many players are on the field for one team in American football?|11|9|12|15
What do you call the American football championship game?|The Super Bowl|The World Series|The Stanley Cup|The Final Four
What is a score of three strikes in a row in bowling called?|A turkey|A spare|A split|A gutter
How many pins are used in ten-pin bowling?|10|9|12|8
In baseball, how many strikes make an out?|3|4|2|5
How many bases are there on a baseball diamond including home plate?|4|3|5|6
How many innings are in a standard professional baseball game?|9|7|10|12
What is the term for hitting the ball out of the park in baseball?|Home run|Grand slam only|Triple|Bunt
Which sport is played at Wimbledon?|Tennis|Cricket|Golf|Badminton
What surface is the French Open played on?|Clay|Grass|Hard court|Carpet
Which tennis player has won the most men's singles Grand Slam titles, with 24?|Novak Djokovic|Roger Federer|Rafael Nadal|Pete Sampras
Which tennis player is nicknamed the King of Clay and won the French Open 14 times?|Rafael Nadal|Roger Federer|Novak Djokovic|Andy Murray
What is the term for a score of zero in tennis?|Love|Nil|Duck|Zero
How many sets must a man win to take a Grand Slam match in the best-of-five format?|3|2|4|5
How many holes are on a standard golf course?|18|9|12|24
What is it called when you score one stroke under par on a hole?|Birdie|Eagle|Bogey|Albatross
What is it called when you score two strokes under par on a hole?|Eagle|Birdie|Bogey|Condor
What is the name of the famous golf tournament held every year in Augusta, Georgia?|The Masters|The Open Championship|The US Open|The PGA Championship
Who won the Tour de France seven times in a row from 1999 to 2005 before being stripped of the titles?|Lance Armstrong|Miguel Indurain|Chris Froome|Eddy Merckx
What color jersey does the overall leader of the Tour de France wear?|Yellow|Green|Pink|White
How many players are on the ice for one team in ice hockey, including the goalie?|6|5|7|11
What trophy is awarded to the NHL champion?|The Stanley Cup|The Vince Lombardi Trophy|The Larry O'Brien Trophy|The Commissioner's Trophy
Which country is the sport of sumo wrestling from?|Japan|China|South Korea|Mongolia
Which martial art, from Korea, is known for high kicks and is an Olympic sport?|Taekwondo|Judo|Karate|Kung fu
In which sport do you perform a slam dunk?|Basketball|Volleyball|Handball|Netball
In which art or sport is a pirouette a common move?|Ballet|Archery|Weightlifting|Sailing
How many rings are on the Olympic flag?|5|4|6|7
In which city were the first modern Olympic Games held in 1896?|Athens|Paris|London|Rome
Which city hosted the 2016 Summer Olympics?|Rio de Janeiro|London|Beijing|Tokyo
Which city hosted the 2012 Summer Olympics?|London|Beijing|Athens|Sydney
Which city hosted the 2008 Summer Olympics?|Beijing|Athens|Atlanta|Barcelona
Which city hosted the 2024 Summer Olympics?|Paris|Los Angeles|Tokyo|Rome
Which country hosted the 2020 Summer Olympics, held in 2021?|Japan|China|South Korea|Brazil
Who is the Jamaican sprinter who holds the world record in the 100 meters, set in 2009?|Usain Bolt|Yohan Blake|Asafa Powell|Justin Gatlin
What is the length of a marathon?|42.195 km|40 km|45 km|50 km
How many events are in a decathlon?|10|7|8|12
What do you call the part of a track and field event in which athletes jump over a bar with a long pole?|Pole vault|High jump|Hurdles|Javelin
Which Olympic swimmer won eight gold medals at the 2008 Beijing Games?|Michael Phelps|Ian Thorpe|Mark Spitz|Ryan Lochte
In which sport do competitors use a shuttlecock?|Badminton|Squash|Table tennis|Tennis
In which sport do teams compete for the America's Cup?|Sailing|Rowing|Surfing|Water polo
Which sport uses the terms scrum, lineout and try?|Rugby|Handball|Lacrosse|Cricket
How many wickets must be taken to dismiss a cricket team?|10|11|9|8
What is the name of the trophy contested by England and Australia in cricket?|The Ashes|The Calcutta Cup|The Davis Cup|The Ryder Cup
How many players are on a cricket team on the field?|11|9|12|15
Which sport has the Ryder Cup?|Golf|Tennis|Cricket|Rugby
Which sport has the Davis Cup?|Tennis|Golf|Polo|Squash
In Formula 1, how many points does a driver get for winning a race in the current system?|25|10|20|15
Which Formula 1 driver won seven world championships, tied with Michael Schumacher?|Lewis Hamilton|Sebastian Vettel|Ayrton Senna|Alain Prost
Which Formula 1 driver won four titles in a row from 2010 to 2013?|Sebastian Vettel|Fernando Alonso|Jenson Button|Kimi Raikkonen
Which Brazilian driver was a three-time Formula 1 world champion and died at Imola in 1994?|Ayrton Senna|Nelson Piquet|Emerson Fittipaldi|Rubens Barrichello
In which city is the Monaco Grand Prix held?|Monte Carlo|Nice|Cannes|Genoa
Which country does the Ferrari Formula 1 team come from?|Italy|Germany|France|Spain
What is the name of the famous 24-hour endurance car race held in France?|24 Hours of Le Mans|Dakar Rally|Targa Florio|Mille Miglia
Which sport is played on a table with a net and a small celluloid ball?|Table tennis|Squash|Badminton|Pickleball
Which sport features a puck?|Ice hockey|Field hockey|Lacrosse|Curling
Which winter sport involves sliding stones across ice toward a target called the house?|Curling|Bobsled|Luge|Skeleton
In which sport is the Stanley Cup awarded?|Ice hockey|Baseball|Basketball|Lacrosse
Which sport combines cross-country skiing and rifle shooting?|Biathlon|Nordic combined|Skeleton|Slalom
In which sport would you hear the term birdie, apart from golf?|Badminton|Table tennis|Squash|Tennis
How many points does a free throw count for in basketball?|1|2|3|0
How many minutes are in a quarter of an NBA game?|12|10|15|8
What is the name of the Spanish football club based in Madrid with white shirts?|Real Madrid|Atletico Madrid|Sevilla|Valencia
Which English football club plays at Old Trafford?|Manchester United|Liverpool|Chelsea|Arsenal
Which English football club plays at Anfield?|Liverpool|Everton|Manchester City|Leeds United
Which Italian club is nicknamed the Old Lady?|Juventus|AC Milan|Inter Milan|Roma
Which German club is based in Munich and has won the most Bundesliga titles?|Bayern Munich|Borussia Dortmund|Schalke 04|RB Leipzig
Which club did Kylian Mbappe leave in 2024 to join Real Madrid?|Paris Saint-Germain|Olympique de Marseille|Olympique Lyonnais|Lille
Which competition is the top European club football tournament?|UEFA Champions League|UEFA Europa League|Copa Libertadores|Copa del Rey
In which stadium does FC Barcelona play?|Camp Nou|Santiago Bernabeu|Wanda Metropolitano|Mestalla
Who scored the most goals in a single World Cup tournament with 13 goals in 1958?|Just Fontaine|Gerd Muller|Pele|Eusebio
Which country is the home of the sport of judo?|Japan|China|Korea|Thailand
Which wrestler-turned-actor goes by the nickname The Rock?|Dwayne Johnson|John Cena|Hulk Hogan|Dave Bautista
Which boxer was originally named Cassius Clay?|Muhammad Ali|Mike Tyson|Joe Frazier|George Foreman
The Ironman World Championship in Hawaii is a race in which sport?|Triathlon|Marathon|Cycling|Swimming
Which tennis player won a calendar-year Grand Slam in 1988 and a Golden Slam including Olympic gold?|Steffi Graf|Martina Navratilova|Serena Williams|Chris Evert
Which American gymnast won four gold medals at the 2016 Rio Olympics?|Simone Biles|Gabby Douglas|Nastia Liukin|Aly Raisman
Which sport is played with a racket and a ball against a wall in a four-walled court?|Squash|Tennis|Badminton|Cricket
Which sport has a Grand Slam made up of the Australian Open, French Open, Wimbledon and US Open?|Tennis|Golf|Squash|Badminton
In rugby union, how many points is a try worth?|5|3|6|7
What is the name of the area in front of the goal that only the goalkeeper may handle the ball in, in soccer?|The penalty area|The center circle|The corner arc|The technical area
Which country does the football club Boca Juniors come from?|Argentina|Brazil|Uruguay|Chile
In which sport can you score a hat-trick, apart from soccer?|Ice hockey|Golf|Rowing|Archery
Which athlete is known for the Fosbury Flop technique in high jump?|Dick Fosbury|Carl Lewis|Bob Beamon|Sergey Bubka
How many players are on a standard handball team on the court, including the goalkeeper?|7|6|9|11
Which sport is played on the largest field: soccer, rugby, polo or tennis?|Polo|Soccer|Rugby|Tennis
`;

  const QA_ENT = `
Which film features a ship that hits an iceberg in 1912, starring Leonardo DiCaprio and Kate Winslet?|Titanic|Poseidon|The Abyss|Pearl Harbor
Who directed the movies Jaws and E.T. the Extra-Terrestrial?|Steven Spielberg|George Lucas|James Cameron|Ridley Scott
Who directed Pulp Fiction?|Quentin Tarantino|Martin Scorsese|Guy Ritchie|David Fincher
Who directed the Lord of the Rings film trilogy?|Peter Jackson|Sam Raimi|Christopher Nolan|Tim Burton
Who directed Inception and The Dark Knight?|Christopher Nolan|Denis Villeneuve|Zack Snyder|Ridley Scott
What is the name of the wizard school in the Harry Potter series?|Hogwarts|Beauxbatons|Durmstrang|Ilvermorny
Who plays Jack Sparrow in the Pirates of the Caribbean films?|Johnny Depp|Orlando Bloom|Brad Pitt|Hugh Jackman
Which animated film features a lion cub named Simba?|The Lion King|Madagascar|Jungle Book|Tarzan
In Toy Story, what is the name of the cowboy doll?|Woody|Buzz|Rex|Slinky
In which animated film does a clownfish named Marlin search for his son?|Finding Nemo|Shark Tale|Moana|Ice Age
Which Disney film features the song Let It Go?|Frozen|Tangled|Moana|Brave
In The Lion King, what is the name of Simba's villainous uncle?|Scar|Mufasa|Zazu|Rafiki
Which actress voices Elsa in Frozen?|Idina Menzel|Kristen Bell|Auli'i Cravalho|Anna Kendrick
Which superhero is also known as Bruce Wayne?|Batman|Superman|Iron Man|Daredevil
Which superhero is Peter Parker?|Spider-Man|Ant-Man|Hawkeye|Doctor Strange
What is Tony Stark's superhero name?|Iron Man|Thor|Black Panther|War Machine
Which Marvel hero wields a hammer called Mjolnir?|Thor|Captain America|Hulk|Loki
Which actor played Black Panther in the Marvel Cinematic Universe?|Chadwick Boseman|Michael B. Jordan|Idris Elba|Anthony Mackie
In Star Wars, who is Luke Skywalker's father?|Darth Vader|Obi-Wan Kenobi|Han Solo|Emperor Palpatine
Who created Star Wars?|George Lucas|Steven Spielberg|J. J. Abrams|Gene Roddenberry
What is the name of the green creature in Star Wars who trains Jedi?|Yoda|Chewbacca|Jabba|Jar Jar Binks
In The Matrix, which pill does Neo take to learn the truth?|The red pill|The blue pill|The green pill|The white pill
Which film series features a character named Dom Toretto?|Fast and Furious|Mission: Impossible|The Transporter|Need for Speed
Who played the Joker in The Dark Knight, winning a posthumous Oscar?|Heath Ledger|Joaquin Phoenix|Jared Leto|Jack Nicholson
How many Academy Awards did The Lord of the Rings: The Return of the King win?|11|7|9|13
Which animated studio produced Toy Story, Up and Inside Out?|Pixar|DreamWorks|Illumination|Blue Sky
Which studio made Shrek?|DreamWorks|Pixar|Illumination|Sony Pictures Animation
In Shrek, who voices Donkey?|Eddie Murphy|Mike Myers|Cameron Diaz|Antonio Banderas
What is the name of the yellow minions' boss in Despicable Me?|Gru|Dr. Nefario|Vector|Scarlet Overkill
Which Japanese animation studio produced Spirited Away?|Studio Ghibli|Toei Animation|Madhouse|Gainax
Who directed Spirited Away?|Hayao Miyazaki|Isao Takahata|Makoto Shinkai|Mamoru Hosoda
In which TV series do the characters Ross, Rachel, Monica, Chandler, Joey and Phoebe appear?|Friends|Seinfeld|How I Met Your Mother|Cheers
Which TV series is set in the fictional land of Westeros?|Game of Thrones|The Witcher|Vikings|The Last Kingdom
Which TV show features a chemistry teacher turned drug manufacturer named Walter White?|Breaking Bad|The Wire|Ozark|Dexter
Which TV series features the Upside Down and a girl named Eleven?|Stranger Things|Dark|The OA|Black Mirror
Which animated TV family lives at 742 Evergreen Terrace?|The Simpsons|The Griffins|The Flintstones|The Jetsons
In SpongeBob SquarePants, where does SpongeBob live?|A pineapple under the sea|A rock|A boot|A sand castle
What is the name of the coffee shop in the TV series Friends?|Central Perk|Cafe Nervosa|Monk's Cafe|Luke's Diner
Who is the lead singer of U2?|Bono|The Edge|Sting|Chris Martin
Who is the lead singer of Coldplay?|Chris Martin|Bono|Thom Yorke|Brandon Flowers
Which singer is known for the albums 1989 and Folklore?|Taylor Swift|Adele|Katy Perry|Billie Eilish
Which British singer released the albums 19, 21, 25 and 30?|Adele|Dua Lipa|Amy Winehouse|Ellie Goulding
Which Barbadian singer is known for the song Umbrella?|Rihanna|Beyonce|Alicia Keys|Nicki Minaj
Which singer is known as the Queen of Pop?|Madonna|Cher|Whitney Houston|Janet Jackson
Which artist is known for the albums Thriller and Bad?|Michael Jackson|Prince|Stevie Wonder|Lionel Richie
Which singer was known as the King of Rock and Roll?|Elvis Presley|Chuck Berry|Buddy Holly|Johnny Cash
Which band sang Bohemian Rhapsody?|Queen|Led Zeppelin|Pink Floyd|Genesis
Which band was formed in Liverpool and included John, Paul, George and Ringo?|The Beatles|The Kinks|The Who|The Hollies
Which band wrote the song Smells Like Teen Spirit?|Nirvana|Pearl Jam|Soundgarden|Foo Fighters
Which rapper's real name is Marshall Mathers?|Eminem|Jay-Z|Snoop Dogg|50 Cent
Which South Korean group is known for the songs Dynamite and Butter?|BTS|Blackpink|EXO|Stray Kids
Which K-pop song by Psy became the first YouTube video to reach one billion views?|Gangnam Style|Dynamite|Ddu-Du Ddu-Du|Fantastic Baby
Which singer performed the song Shape of You?|Ed Sheeran|Justin Bieber|Sam Smith|Shawn Mendes
What is the best-selling video game franchise from Nintendo featuring a plumber in a red cap?|Super Mario|Zelda|Metroid|Kirby
In The Legend of Zelda, what is the name of the hero?|Link|Zelda|Ganon|Navi
Which video game features a creature collecting franchise with Pikachu?|Pokemon|Digimon|Yu-Gi-Oh|Monster Hunter
What is the name of the blue hedgehog from Sega?|Sonic|Knuckles|Tails|Shadow
Which video game is a sandbox where you mine and craft blocks?|Minecraft|Roblox|Terraria|Fortnite
Which game features battle royale with a Battle Bus and building structures?|Fortnite|Apex Legends|PUBG|Call of Duty: Warzone
Which game series has the character Master Chief?|Halo|Gears of War|Doom|Destiny
Which classic arcade game features a yellow character eating dots and avoiding ghosts?|Pac-Man|Space Invaders|Galaga|Donkey Kong
Which falling-blocks puzzle game was created by Alexey Pajitnov?|Tetris|Columns|Bejeweled|Puyo Puyo
Which Nintendo console introduced motion controls in 2006?|Wii|GameCube|Switch|Wii U
Which company makes the PlayStation?|Sony|Sega|Microsoft|Nintendo
Which company makes the Xbox?|Microsoft|Sony|Nintendo|Atari
What is the name of the princess Mario often rescues?|Princess Peach|Princess Daisy|Princess Zelda|Princess Rosalina
What is the name of Mario's brother?|Luigi|Wario|Toad|Yoshi
Who wrote the Hunger Games trilogy?|Suzanne Collins|Veronica Roth|Stephenie Meyer|Cassandra Clare
What is the name of the main character in The Hunger Games?|Katniss Everdeen|Tris Prior|Bella Swan|Hermione Granger
Who is the author of The Chronicles of Narnia?|C. S. Lewis|J. R. R. Tolkien|Roald Dahl|Philip Pullman
Which author wrote Charlie and the Chocolate Factory?|Roald Dahl|Enid Blyton|Dr. Seuss|Michael Morpurgo
Who wrote the Diary of a Wimpy Kid books?|Jeff Kinney|Rick Riordan|Dav Pilkey|Lemony Snicket
In Percy Jackson, what is Percy's father's name?|Poseidon|Zeus|Hades|Apollo
Which fictional detective lives at 221B Baker Street?|Sherlock Holmes|Hercule Poirot|Miss Marple|Philip Marlowe
Which city is known for the Hollywood sign?|Los Angeles|San Francisco|New York|Las Vegas
In which city is Broadway, famous for theatrical productions?|New York City|Chicago|Los Angeles|Boston
Which Italian city hosts the Venice Film Festival?|Venice|Rome|Milan|Turin
Which French city hosts a famous film festival each May with the Palme d'Or?|Cannes|Nice|Lyon|Marseille
What is the highest award at the Oscars called?|Best Picture|Best Director|Best Actor|Best Screenplay
What is the name of the statue awarded at the Oscars?|Oscar|Emmy|Grammy|Tony
Which award is given for the best music recordings in the United States?|The Grammy|The Emmy|The Tony|The Oscar
Which award honors theater in New York?|The Tony Award|The Emmy|The Grammy|The BAFTA
Which actor played Forrest Gump?|Tom Hanks|Tom Cruise|Kevin Costner|Robin Williams
Which actress played Katniss Everdeen in The Hunger Games films?|Jennifer Lawrence|Emma Stone|Shailene Woodley|Kristen Stewart
Which actor played Wolverine in the X-Men films for many years?|Hugh Jackman|Ryan Reynolds|Patrick Stewart|Christian Bale
Which actor played the title role in the film Gladiator?|Russell Crowe|Joaquin Phoenix|Mel Gibson|Brad Pitt
Which actress played the title role in Mary Poppins in 1964?|Julie Andrews|Audrey Hepburn|Judy Garland|Shirley Temple
Which musical includes the songs Do-Re-Mi and My Favorite Things?|The Sound of Music|Mary Poppins|Oliver!|My Fair Lady
Which musical tells the story of Simba on the stage with costumes and puppets?|The Lion King|Wicked|Hamilton|Cats
Which musical is about the life of Alexander Hamilton?|Hamilton|Rent|Chicago|Les Miserables
Which musical is based on the Wizard of Oz from the witch's point of view?|Wicked|Matilda|Cats|Evita
What is the name of the magical land in the Wizard of Oz where Dorothy lands?|Oz|Narnia|Wonderland|Neverland
What is the name of the boy who never grows up in J. M. Barrie's play?|Peter Pan|Tom Sawyer|Pinocchio|Mowgli
Who is the green character that steals Christmas in the Dr. Seuss story?|The Grinch|Sam-I-Am|The Lorax|Horton
What color is Kermit the Frog?|Green|Blue|Yellow|Red
In which city is the TV show The Office (US version) set?|Scranton|Boston|Pittsburgh|Buffalo
In which TV show does a family live in the town of Springfield and the dad works at a nuclear plant?|The Simpsons|Family Guy|South Park|King of the Hill
Which streaming service produced the series The Crown?|Netflix|Disney+|Amazon Prime Video|HBO Max
Which streaming service has the series The Mandalorian?|Disney+|Netflix|Hulu|Apple TV+
What is the name of the Instagram-owning company that was previously named Facebook?|Meta|Alphabet|X Corp|Snap
Which short-video app is owned by ByteDance?|TikTok|Snapchat|Vine|Triller
What is the name of the largest video-sharing website, founded in 2005?|YouTube|Vimeo|Dailymotion|Twitch
`;

  const QA_GEO = `
What is the capital of France?|Paris|Lyon|Marseille|Nice
What is the capital of Italy?|Rome|Milan|Venice|Naples
What is the capital of Spain?|Madrid|Barcelona|Seville|Valencia
What is the capital of Germany?|Berlin|Munich|Frankfurt|Hamburg
What is the capital of the United Kingdom?|London|Edinburgh|Manchester|Cardiff
What is the capital of Portugal?|Lisbon|Porto|Faro|Coimbra
What is the capital of Greece?|Athens|Thessaloniki|Sparta|Crete
What is the capital of Turkey?|Ankara|Istanbul|Izmir|Antalya
What is the capital of Russia?|Moscow|Saint Petersburg|Kazan|Sochi
What is the capital of Poland?|Warsaw|Krakow|Gdansk|Wroclaw
What is the capital of Austria?|Vienna|Salzburg|Graz|Innsbruck
What is the capital of Switzerland?|Bern|Zurich|Geneva|Basel
What is the capital of Sweden?|Stockholm|Gothenburg|Malmo|Uppsala
What is the capital of Norway?|Oslo|Bergen|Trondheim|Stavanger
What is the capital of Ireland?|Dublin|Cork|Galway|Belfast
What is the capital of Japan?|Tokyo|Kyoto|Osaka|Hiroshima
What is the capital of China?|Beijing|Shanghai|Hong Kong|Guangzhou
What is the capital of South Korea?|Seoul|Busan|Incheon|Pyongyang
What is the capital of India?|New Delhi|Mumbai|Kolkata|Bangalore
What is the capital of Thailand?|Bangkok|Phuket|Chiang Mai|Pattaya
What is the capital of Vietnam?|Hanoi|Ho Chi Minh City|Da Nang|Hue
What is the capital of Indonesia?|Jakarta|Bali|Surabaya|Bandung
What is the capital of Australia?|Canberra|Sydney|Melbourne|Perth
What is the capital of New Zealand?|Wellington|Auckland|Christchurch|Queenstown
What is the capital of Canada?|Ottawa|Toronto|Vancouver|Montreal
What is the capital of the United States?|Washington, D.C.|New York City|Los Angeles|Chicago
What is the capital of Mexico?|Mexico City|Guadalajara|Cancun|Monterrey
What is the capital of Brazil?|Brasilia|Rio de Janeiro|Sao Paulo|Salvador
What is the capital of Argentina?|Buenos Aires|Cordoba|Rosario|Mendoza
What is the capital of Chile?|Santiago|Valparaiso|Lima|Concepcion
What is the capital of Peru?|Lima|Cusco|Quito|Arequipa
What is the capital of Colombia?|Bogota|Medellin|Cali|Cartagena
What is the capital of Egypt?|Cairo|Alexandria|Giza|Luxor
What is the capital of Morocco?|Rabat|Marrakech|Casablanca|Fez
What is the capital of Nigeria?|Abuja|Lagos|Kano|Ibadan
What is the capital of Kenya?|Nairobi|Mombasa|Kisumu|Nakuru
What is the capital of South Africa, where the executive branch sits?|Pretoria|Cape Town|Johannesburg|Durban
What is the capital of Saudi Arabia?|Riyadh|Jeddah|Mecca|Dammam
What is the capital of Iran?|Tehran|Isfahan|Tabriz|Shiraz
What is the largest country in the world by area?|Russia|Canada|China|United States
Which country has the largest population?|India|China|United States|Indonesia
What is the smallest country in the world by area?|Vatican City|Monaco|San Marino|Liechtenstein
What is the largest ocean on Earth?|Pacific Ocean|Atlantic Ocean|Indian Ocean|Arctic Ocean
What is the longest river in Africa?|The Nile|The Congo|The Niger|The Zambezi
Which river flows through Paris?|The Seine|The Loire|The Rhone|The Garonne
Which river flows through London?|The Thames|The Severn|The Mersey|The Tyne
Which river flows through Cairo?|The Nile|The Tigris|The Euphrates|The Jordan
Which is the longest river in South America?|The Amazon|The Orinoco|The Parana|The Magdalena
Which river runs through Vienna, Budapest and Belgrade?|The Danube|The Rhine|The Elbe|The Vistula
What is the highest mountain in the world above sea level?|Mount Everest|K2|Kangchenjunga|Mont Blanc
What is the highest mountain in Africa?|Mount Kilimanjaro|Mount Kenya|Mount Stanley|Mount Meru
What is the highest mountain in Europe outside the Caucasus?|Mont Blanc|The Matterhorn|Mount Etna|Monte Rosa
Which mountain range separates Europe from Asia in Russia?|The Ural Mountains|The Alps|The Carpathians|The Caucasus
Which mountain range runs along the west coast of South America?|The Andes|The Rockies|The Alps|The Himalayas
What is the largest desert in the world (including polar deserts)?|Antarctic Desert|Sahara Desert|Gobi Desert|Arabian Desert
What is the largest hot desert in the world?|Sahara|Gobi|Kalahari|Arabian Desert
Which is the largest island in the world?|Greenland|Madagascar|Borneo|New Guinea
Which country is made up of more than 17,000 islands including Java and Sumatra?|Indonesia|Philippines|Japan|Malaysia
Which sea lies between Europe and Africa?|The Mediterranean Sea|The Baltic Sea|The Red Sea|The Black Sea
Which sea is the saltiest and lowest point on land, bordering Jordan and Israel?|The Dead Sea|The Caspian Sea|The Red Sea|The Aral Sea
Which is the biggest lake in Africa?|Lake Victoria|Lake Tanganyika|Lake Malawi|Lake Chad
Which is the deepest lake in the world?|Lake Baikal|Lake Superior|Lake Tanganyika|Lake Titicaca
Which are the Great Lakes shared by Canada and the United States?|Superior, Michigan, Huron, Erie, Ontario|Victoria, Albert, Edward, George, Kyoga|Geneva, Constance, Como, Garda, Maggiore|Baikal, Ladoga, Onega, Peipus, Balkhash
Which country is shaped like a boot?|Italy|Greece|Portugal|Croatia
Which country occupies an entire continent by itself?|Australia|Greenland|Madagascar|New Zealand
How many continents are there?|7|5|6|8
Which is the smallest continent by land area?|Australia (Oceania)|Europe|Antarctica|South America
Which is the coldest continent?|Antarctica|Asia|North America|Europe
On which continent is Egypt located?|Africa|Asia|Europe|South America
Which two countries share the longest international border?|Canada and the United States|Russia and China|India and Pakistan|Argentina and Chile
Which country has the most time zones, counting overseas territories?|France|Russia|United States|United Kingdom
Which strait separates Spain from Morocco?|Strait of Gibraltar|Bosphorus|Strait of Hormuz|Dover Strait
Which canal connects the Mediterranean and the Red Sea?|Suez Canal|Panama Canal|Kiel Canal|Corinth Canal
Which canal connects the Atlantic and the Pacific Oceans through Central America?|Panama Canal|Suez Canal|Erie Canal|Grand Canal
Which waterfall lies on the border of Zambia and Zimbabwe?|Victoria Falls|Niagara Falls|Iguazu Falls|Angel Falls
Which is the tallest waterfall in the world, in Venezuela?|Angel Falls|Niagara Falls|Victoria Falls|Yosemite Falls
In which country can you find the ancient city of Machu Picchu?|Peru|Mexico|Bolivia|Chile
In which country is Petra, the rose-red city carved in rock?|Jordan|Egypt|Saudi Arabia|Syria
In which country is Angkor Wat?|Cambodia|Thailand|Vietnam|Laos
In which country is the Taj Mahal?|India|Pakistan|Bangladesh|Nepal
In which city is the Christ the Redeemer statue?|Rio de Janeiro|Sao Paulo|Lima|Buenos Aires
Which city is called the Big Apple?|New York City|Los Angeles|Chicago|Boston
Which country is home to the kangaroo and the koala?|Australia|New Zealand|South Africa|Indonesia
Which country is known as the Land of the Rising Sun?|Japan|China|South Korea|Thailand
Which country is known as the Land of Fire and Ice?|Iceland|Norway|Greenland|Finland
Which country has a maple leaf on its flag?|Canada|Australia|Switzerland|Ireland
Which country has one of only two square national flags, showing a white cross on red?|Switzerland|Denmark|Norway|Georgia
Which country's flag features a red circle on a white background?|Japan|Bangladesh|South Korea|Palau
Which European country is known for its fjords?|Norway|Denmark|Poland|Belgium
Which European country is famous for tulips and windmills?|The Netherlands|Belgium|Denmark|Germany
Which country is the origin of pizza and pasta?|Italy|Greece|Spain|France
In which country is the city of Marrakech?|Morocco|Egypt|Tunisia|Algeria
Which city is the capital of Catalonia in Spain?|Barcelona|Madrid|Valencia|Girona
Which city on the Bosphorus lies in both Europe and Asia?|Istanbul|Ankara|Athens|Baku
Which is the most populous city in Africa, in Nigeria?|Lagos|Cairo|Johannesburg|Kinshasa
Which is the most populous country in Africa?|Nigeria|Ethiopia|Egypt|South Africa
Which US state is the largest by area?|Alaska|Texas|California|Montana
Which US state is made up entirely of islands?|Hawaii|Alaska|Maine|Florida
What is the capital of the US state of California?|Sacramento|Los Angeles|San Francisco|San Diego
What is the capital of Texas?|Austin|Houston|Dallas|San Antonio
Which line of latitude circles the Earth at 0 degrees?|The Equator|The Tropic of Cancer|The Prime Meridian|The Arctic Circle
Which line of longitude passes through Greenwich, London?|The Prime Meridian|The Equator|The Tropic of Capricorn|The International Date Line
Which tropic lies in the northern hemisphere?|Tropic of Cancer|Tropic of Capricorn|Arctic Circle|Antarctic Circle
Which country does the territory of Gibraltar border?|Spain|Portugal|France|Morocco
Which small country sits between France and Spain in the Pyrenees?|Andorra|Monaco|Luxembourg|Liechtenstein
Which small European country is bordered by France and has the Grand Prix on its streets?|Monaco|San Marino|Malta|Andorra
`;

  const QA_HIS = `
In which year did World War II end?|1945|1939|1918|1950
In which year did World War I begin?|1914|1912|1918|1905
In which year did the Titanic sink?|1912|1905|1914|1920
In which year did Christopher Columbus first reach the Americas?|1492|1392|1520|1607
In which year did the French Revolution begin?|1789|1776|1804|1815
In which year was the Declaration of Independence signed in the United States?|1776|1789|1812|1865
Who was the first President of the United States?|George Washington|Thomas Jefferson|Abraham Lincoln|John Adams
Who was the US President during the Civil War?|Abraham Lincoln|Ulysses S. Grant|Andrew Jackson|James Buchanan
Who was the first woman to fly solo across the Atlantic Ocean?|Amelia Earhart|Bessie Coleman|Harriet Quimby|Jacqueline Cochran
Who led the Soviet Union during most of World War II?|Joseph Stalin|Vladimir Lenin|Nikita Khrushchev|Leon Trotsky
Who was the British Prime Minister during most of World War II?|Winston Churchill|Neville Chamberlain|Clement Attlee|Margaret Thatcher
Which French general became Emperor in 1804?|Napoleon Bonaparte|Charles de Gaulle|Louis XIV|Marshal Foch
At which battle was Napoleon finally defeated in 1815?|Waterloo|Austerlitz|Trafalgar|Borodino
Which admiral defeated the French and Spanish at Trafalgar in 1805?|Horatio Nelson|Francis Drake|John Hawkins|Arthur Wellesley
Which ancient civilization built the pyramids at Giza?|Ancient Egyptians|Aztecs|Romans|Sumerians
Which ancient civilization built Machu Picchu?|The Incas|The Aztecs|The Mayas|The Olmecs
Which ancient civilization built Chichen Itza?|The Maya|The Incas|The Aztecs|The Toltecs
Who was the famous queen of Egypt who allied with Julius Caesar and Mark Antony?|Cleopatra|Nefertiti|Hatshepsut|Isis
Which Roman general crossed the Rubicon in 49 BC?|Julius Caesar|Augustus|Pompey|Mark Antony
Who was the first Roman Emperor?|Augustus|Julius Caesar|Nero|Trajan
Which Roman emperor is said to have played the lyre while Rome burned?|Nero|Caligula|Commodus|Tiberius
What was the ancient Greek city-state famous for its warriors?|Sparta|Athens|Corinth|Thebes
Which city-state is considered the birthplace of democracy?|Athens|Sparta|Rome|Troy
Who was the Macedonian king who conquered Persia and reached India?|Alexander the Great|Philip II|Leonidas|Pericles
Which Greek philosopher was the teacher of Alexander the Great?|Aristotle|Socrates|Plato|Pythagoras
Which Greek philosopher was condemned to drink hemlock?|Socrates|Plato|Aristotle|Diogenes
Which wall was built by the Romans across northern England?|Hadrian's Wall|The Great Wall|The Berlin Wall|Offa's Dyke
In which year did the Berlin Wall fall?|1989|1961|1975|1991
In which year did the Berlin Wall go up?|1961|1949|1973|1989
In which year did the Soviet Union dissolve?|1991|1985|1989|1999
Which US President was assassinated in Dallas in 1963?|John F. Kennedy|Lyndon B. Johnson|Richard Nixon|Abraham Lincoln
Which US President was assassinated in 1865 at Ford's Theatre?|Abraham Lincoln|James Garfield|William McKinley|Andrew Johnson
Who was the first man to travel into space?|Yuri Gagarin|Neil Armstrong|Alan Shepard|Valentina Tereshkova
In which year did humans first land on the Moon?|1969|1961|1972|1957
Who was the first woman in space, in 1963?|Valentina Tereshkova|Sally Ride|Svetlana Savitskaya|Mae Jemison
Which civil rights leader gave the I Have a Dream speech in 1963?|Martin Luther King Jr.|Malcolm X|Rosa Parks|Frederick Douglass
Who led the Indian independence movement through nonviolent resistance?|Mahatma Gandhi|Jawaharlal Nehru|Subhas Chandra Bose|Sardar Patel
Who was the first President of South Africa after apartheid, elected in 1994?|Nelson Mandela|Desmond Tutu|F. W. de Klerk|Thabo Mbeki
Who was the first female Prime Minister of the United Kingdom?|Margaret Thatcher|Theresa May|Elizabeth I|Indira Gandhi
Which queen ruled England for 63 years until 1901?|Queen Victoria|Queen Elizabeth I|Queen Anne|Queen Mary I
Which English queen was on the throne when the Spanish Armada was defeated in 1588?|Elizabeth I|Mary I|Victoria|Anne
Which English king had six wives?|Henry VIII|Richard III|Edward I|Charles II
In which year was the Battle of Hastings fought?|1066|1215|1415|1666
Which document, signed in 1215, limited the power of the English king?|Magna Carta|Domesday Book|Bill of Rights|Act of Union
Which great fire destroyed much of London in 1666?|The Great Fire of London|The Great Smog|The Blitz|The Great Stink
Which plague killed about a third of Europe's population in the 14th century?|The Black Death|The Spanish flu|Smallpox|Cholera
Which war lasted from 1337 to 1453 between England and France?|The Hundred Years' War|The Thirty Years' War|The Wars of the Roses|The Seven Years' War
Which English king was killed at Bosworth Field in 1485?|Richard III|Henry VI|Edward IV|John
Which Italian explorer is credited with first sailing for Spain across the Atlantic in 1492?|Christopher Columbus|Marco Polo|Amerigo Vespucci|Giovanni Caboto
Which Portuguese navigator led the first voyage to sail around the world, ended after his death?|Ferdinand Magellan|Vasco da Gama|Bartolomeu Dias|Pedro Alvares Cabral
Which Portuguese explorer was the first European to reach India by sea?|Vasco da Gama|Ferdinand Magellan|Henry the Navigator|Bartolomeu Dias
Who led the Spanish conquest of the Aztec Empire?|Hernan Cortes|Francisco Pizarro|Ponce de Leon|Vasco Nunez de Balboa
Which Venetian traveler wrote about his journeys to China in the 13th century?|Marco Polo|Ibn Battuta|Leif Erikson|Amerigo Vespucci
Which Viking explorer is believed to have reached North America around the year 1000?|Leif Erikson|Erik the Red|Ragnar Lodbrok|Harald Hardrada
What was the name of the ship that carried the Pilgrims to America in 1620?|The Mayflower|The Santa Maria|The Endeavour|The Beagle
Which scientist traveled on the HMS Beagle and later wrote On the Origin of Species?|Charles Darwin|Alfred Wallace|Thomas Huxley|Joseph Hooker
Who painted the ceiling of the Sistine Chapel during the Renaissance?|Michelangelo|Raphael|Caravaggio|Bernini
Which Italian city is considered the birthplace of the Renaissance?|Florence|Rome|Venice|Milan
Which German invented the movable-type printing press around 1440?|Johannes Gutenberg|Martin Luther|Albrecht Durer|Johannes Kepler
Which monk started the Protestant Reformation in 1517?|Martin Luther|John Calvin|Thomas More|Erasmus
Which Chinese dynasty built much of the Great Wall that survives today?|The Ming Dynasty|The Han Dynasty|The Tang Dynasty|The Song Dynasty
Who was the first emperor of unified China?|Qin Shi Huang|Kublai Khan|Emperor Wu|Confucius
Which Mongol leader founded the Mongol Empire in 1206?|Genghis Khan|Kublai Khan|Attila|Tamerlane
Which Mongol ruler became the first emperor of the Yuan Dynasty in China?|Kublai Khan|Genghis Khan|Ogedei Khan|Batu Khan
Who was the leader of the Huns who threatened Rome in the 5th century?|Attila|Alaric|Hannibal|Spartacus
Which Carthaginian general crossed the Alps with elephants to attack Rome?|Hannibal|Hasdrubal|Scipio|Hamilcar
Which Ottoman city was conquered in 1453, ending the Byzantine Empire?|Constantinople|Athens|Jerusalem|Alexandria
Which empire was ruled by Suleiman the Magnificent?|The Ottoman Empire|The Mughal Empire|The Persian Empire|The Byzantine Empire
Which Mughal emperor built the Taj Mahal?|Shah Jahan|Akbar|Babur|Aurangzeb
Who was the leader of Nazi Germany from 1933 to 1945?|Adolf Hitler|Otto von Bismarck|Paul von Hindenburg|Heinrich Himmler
Which event in December 1941 brought the United States into World War II?|The attack on Pearl Harbor|The Battle of Britain|D-Day|The sinking of the Lusitania
What was the code name for the Allied invasion of Normandy in 1944?|Operation Overlord|Operation Barbarossa|Operation Market Garden|Operation Torch
On what date did the D-Day landings take place in 1944?|June 6|May 8|December 7|August 6
Which diary was written by a Jewish girl hiding in Amsterdam during WWII?|The Diary of Anne Frank|The Diary of Samuel Pepys|The Book Thief|Schindler's List
Which two Japanese cities were hit by atomic bombs in 1945?|Hiroshima and Nagasaki|Tokyo and Osaka|Kyoto and Nara|Kobe and Yokohama
Which treaty ended World War I with Germany?|Treaty of Versailles|Treaty of Paris|Treaty of Vienna|Treaty of Utrecht
Who was the Archduke whose assassination in 1914 triggered World War I?|Franz Ferdinand|Franz Joseph|Karl I|Rudolf
In which city was Archduke Franz Ferdinand assassinated?|Sarajevo|Vienna|Belgrade|Budapest
Which revolution in 1917 brought the Bolsheviks to power in Russia?|The October Revolution|The French Revolution|The Glorious Revolution|The Velvet Revolution
Who led the Bolsheviks in the 1917 Russian Revolution?|Vladimir Lenin|Joseph Stalin|Leon Trotsky|Nicholas II
Who was the last Tsar of Russia?|Nicholas II|Alexander III|Peter the Great|Ivan the Terrible
Who founded the city of Saint Petersburg in 1703?|Peter the Great|Catherine the Great|Ivan the Terrible|Alexander I
Which Chinese leader founded the People's Republic of China in 1949?|Mao Zedong|Deng Xiaoping|Sun Yat-sen|Chiang Kai-shek
Which crisis in 1962 brought the United States and the Soviet Union close to nuclear war?|The Cuban Missile Crisis|The Berlin Airlift|The Suez Crisis|The Bay of Pigs invasion
Who was the Cuban revolutionary leader who took power in 1959?|Fidel Castro|Che Guevara|Fulgencio Batista|Simon Bolivar
Which South American liberator helped free Venezuela, Colombia, Ecuador, Peru and Bolivia from Spanish rule?|Simon Bolivar|Jose de San Martin|Bernardo O'Higgins|Francisco de Miranda
Which US document begins with the words We the People?|The Constitution|The Declaration of Independence|The Bill of Rights|The Gettysburg Address
Which amendment to the US Constitution abolished slavery?|The 13th Amendment|The 1st Amendment|The 19th Amendment|The 15th Amendment
Which amendment gave women the right to vote in the US?|The 19th Amendment|The 13th Amendment|The 15th Amendment|The 26th Amendment
Who invented the telephone and patented it in 1876?|Alexander Graham Bell|Thomas Edison|Nikola Tesla|Guglielmo Marconi
Which brothers made the first powered airplane flight in 1903?|The Wright brothers|The Montgolfier brothers|The Lumiere brothers|The Grimm brothers
Who invented the practical incandescent light bulb in 1879 and held over 1,000 patents?|Thomas Edison|Nikola Tesla|Benjamin Franklin|Michael Faraday
Who developed the first successful polio vaccine in the 1950s?|Jonas Salk|Louis Pasteur|Edward Jenner|Alexander Fleming
Which industrial revolution invention by James Watt improved the efficiency of the steam engine?|The separate condenser|The spinning jenny|The telegraph|The cotton gin
Which ancient wonder was a tomb built for King Mausolus?|The Mausoleum at Halicarnassus|The Hanging Gardens of Babylon|The Pharos of Alexandria|The Temple of Artemis
Which ancient writing system used pictures and was used in Egypt?|Hieroglyphs|Cuneiform|Runes|Linear B
Which stone, discovered in 1799, helped scholars decipher Egyptian hieroglyphs?|The Rosetta Stone|The Blarney Stone|The Moabite Stone|The Black Obelisk
Which civilization invented cuneiform, one of the earliest forms of writing?|The Sumerians|The Romans|The Phoenicians|The Minoans
Which island civilization had a palace at Knossos and a legendary labyrinth?|The Minoans|The Mycenaeans|The Etruscans|The Phoenicians
Which Greek poet's epic describes the Trojan War?|Homer|Hesiod|Virgil|Sophocles
Which 1066 conqueror became King of England after the Battle of Hastings?|William the Conqueror|Harold Godwinson|Edward the Confessor|Canute
Which English ruler led the country during the Civil War and became Lord Protector?|Oliver Cromwell|Charles I|William of Orange|Thomas Wolsey
Which American president signed the Emancipation Proclamation in 1863?|Abraham Lincoln|Ulysses S. Grant|Andrew Jackson|Theodore Roosevelt
Which American civil rights activist refused to give up her bus seat in Montgomery in 1955?|Rosa Parks|Harriet Tubman|Ruby Bridges|Coretta Scott King
Who was the first woman to win a Nobel Prize?|Marie Curie|Mother Teresa|Jane Addams|Bertha von Suttner
`;

  const TR_COLS = ['#e53935', '#1e88e5', '#43a047', '#fdb813', '#8e24aa', '#fb8c00', '#00acc1', '#ec407a'];
  const TR_GHOSTS = ['Turbo', 'Nitro', 'Comet', 'Blaze', 'Drift', 'Rocket', 'Zephyr', 'Bolt', 'Viper', 'Falcon', 'Sprint', 'Ranger'];
  const TR_QUOTES = TR_RAW.trim().split('\n').map(l => { const i = l.indexOf(' | '); return i < 0 ? [l, ''] : [l.slice(0, i), l.slice(i + 3)]; });
  const TR_CD = 4;
  const ord = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10 > 3 ? 0 : n % 10]);
  const botF = (b, t) => { const u = t - b.r; return u <= 0 ? 0 : u + (.12 / .8) * (Math.cos(b.a) - Math.cos(.8 * u + b.a)) + (.07 / 2.1) * (Math.cos(b.b) - Math.cos(2.1 * u + b.b)); };
  const botP = (b, t) => b.v * botF(b, t);
  const mkBot = (w, total) => {
    const b = { w, r: .3 + rnd(60) / 100, a: Math.random() * 6.283, b: Math.random() * 6.283, acc: clamp(Math.round(99.2 - w / 45 + (Math.random() - .5) * 2.4), 82, 100) };
    const T = total / (w * 5 / 60);
    b.v = total / botF(b, T); b.fin = T;
    return b;
  };
  const prefixLen = (w, v) => { let k = 0; const m = Math.min(w.length, v.length); while (k < m && w[k] === v[k]) k++; return k; };

  function drawCar(g, x, cy, s, col, rot, moving, t) {
    g.save(); g.translate(x, cy); g.scale(s, s);
    if (moving) {
      for (let k = 0; k < 4; k++) {
        const ph = (t * 5 + k * .27) % 1;
        g.fillStyle = 'rgba(210,214,224,' + (.32 * (1 - ph)).toFixed(3) + ')';
        g.beginPath(); g.arc(-4 - ph * 22, 6 - k % 2 * 2, 1.6 + ph * 3.6, 0, 6.3); g.fill();
      }
    }
    g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(28, 14, 29, 4, 0, 0, 6.3); g.fill();
    g.fillStyle = col; g.beginPath(); g.roundRect(0, -6, 56, 14, 5); g.fill();
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.roundRect(0, 2, 56, 6, [0, 0, 5, 5]); g.fill();
    g.fillStyle = col; g.beginPath(); g.moveTo(12, -6); g.lineTo(19, -14); g.lineTo(36, -14); g.lineTo(46, -6); g.closePath(); g.fill();
    g.fillStyle = '#d3ebff'; g.beginPath(); g.moveTo(17, -6.5); g.lineTo(21.5, -12); g.lineTo(34, -12); g.lineTo(41, -6.5); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(28, -12, 1.5, 5.5);
    g.fillStyle = 'rgba(255,255,255,.78)'; g.fillRect(4, -1.5, 48, 2.2);
    g.fillStyle = '#20232b'; g.fillRect(-3, -12, 11, 2.6); g.fillRect(1, -10, 2.4, 5);
    g.fillStyle = '#fff3a0'; g.fillRect(52.5, -3, 3.5, 3.5);
    g.fillStyle = '#ff3b3b'; g.fillRect(0, -2, 2.4, 3);
    for (const wx of [12, 43]) {
      g.save(); g.translate(wx, 8);
      g.fillStyle = '#14161b'; g.beginPath(); g.arc(0, 0, 6.8, 0, 6.3); g.fill();
      g.fillStyle = '#c9ced8'; g.beginPath(); g.arc(0, 0, 3.5, 0, 6.3); g.fill();
      g.rotate(rot); g.fillStyle = '#6a7080'; g.fillRect(-3.5, -.8, 7, 1.6); g.fillRect(-.8, -3.5, 1.6, 7);
      g.restore();
    }
    g.restore();
  }

  const trCss = `
.gm-typeracer{align-items:stretch;justify-content:flex-start;gap:12px;min-height:0;padding:clamp(12px,2.2vw,22px);border-radius:20px;background:radial-gradient(120% 90% at 50% 0%,#2f64b8 0%,#173064 55%,#0d1b3a 100%);color:#fff;overflow:hidden;text-align:left}
.gm-typeracer .tr-hud{display:flex;gap:8px;flex-wrap:wrap;align-items:stretch}
.gm-typeracer .tr-title{display:flex;flex-direction:column;justify-content:center;margin-right:auto;font:900 13px/1.2 var(--sans);letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.7)}
.gm-typeracer .tr-title b{font-size:20px;letter-spacing:-.02em;color:#fff;text-transform:none}
.gm-typeracer .tr-chip{display:flex;flex-direction:column;align-items:center;gap:1px;min-width:78px;padding:7px 12px;border-radius:14px;background:rgba(255,255,255,.13)}
.gm-typeracer .tr-chip .k{font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.7)}
.gm-typeracer .tr-chip .v{font-size:21px;font-weight:900;font-variant-numeric:tabular-nums;line-height:1.15}
.gm-typeracer .tr-chip .v.w{color:#ffd166}
.gm-typeracer .tr-track{position:relative;display:flex;justify-content:center}
.gm-typeracer .tr-track .g-canvas{background:#2f7d3a;border-radius:14px;box-shadow:0 6px 0 rgba(0,0,0,.28)}
.gm-typeracer .tr-cd{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;font:900 clamp(40px,9vw,92px)/1 var(--sans);color:#fff;text-shadow:0 4px 0 rgba(0,0,0,.45),0 0 28px rgba(0,0,0,.4);letter-spacing:-.03em;text-align:center;padding:0 10px}
.gm-typeracer .tr-cd small{display:block;margin-top:6px;font-size:clamp(14px,2.4vw,20px);letter-spacing:0;text-shadow:0 2px 0 rgba(0,0,0,.45)}
.gm-typeracer .tr-cd.pop span{animation:trPop .5s var(--spring,ease-out)}
@keyframes trPop{from{transform:scale(1.6);opacity:0}to{transform:none;opacity:1}}
.gm-typeracer .tr-card{position:relative;padding:18px 22px 16px;border-radius:20px;background:#fff;color:var(--ink,#1f1d2b);box-shadow:0 8px 0 rgba(8,20,48,.45)}
.gm-typeracer .tr-text{font:500 clamp(17px,2.4vw,23px)/1.62 Georgia,'Times New Roman',serif;color:#4a4f66;word-break:normal;overflow-wrap:anywhere;user-select:none;-webkit-user-select:none;transition:filter .25s,opacity .25s}
.gm-typeracer .tr-text .w{display:inline;padding:1px 1px;border-radius:5px}
.gm-typeracer .tr-text .w.done{color:#2f9560}
.gm-typeracer .tr-text .w.cur{background:rgba(255,176,32,.2)}
.gm-typeracer .tr-text .w.cur.bad{background:rgba(255,91,91,.16)}
.gm-typeracer .tr-text .w.rdy::after{content:"";display:inline-block;width:.45em;height:3px;margin-left:1px;background:#ffb020;vertical-align:baseline;border-radius:2px;animation:trBlink 1s steps(2) infinite}
.gm-typeracer .tr-text i{font-style:normal}
.gm-typeracer .tr-text i.o{color:#1b8a4a;font-weight:700}
.gm-typeracer .tr-text i.x{background:#ff5b5b;color:#fff;border-radius:3px}
.gm-typeracer .tr-text i.n{box-shadow:inset 0 -3px 0 #ffb020}
@keyframes trBlink{50%{opacity:.2}}
.gm-typeracer .tr-src{min-height:18px;margin:8px 0 0;font:italic 700 12.5px/1.3 var(--sans);color:#7b7f95}
.gm-typeracer .tr-in{display:block;width:100%;height:48px;margin-top:10px;padding:0 16px;border:2px solid #d4d2e2;border-radius:12px;background:#f7f6fc;color:var(--ink,#1f1d2b);font:700 20px/1 var(--sans);outline:0;transition:border-color .15s,background .15s,box-shadow .15s;user-select:text;-webkit-user-select:text}
.gm-typeracer .tr-in:focus{border-color:#3a7bd5;background:#fff;box-shadow:0 0 0 4px rgba(58,123,213,.2)}
.gm-typeracer .tr-in.err{border-color:#ef4f4f;background:#ffecec;box-shadow:0 0 0 4px rgba(239,79,79,.18);color:#b41f1f}
.gm-typeracer .tr-in:disabled{opacity:.55}
.gm-typeracer .tr-card.blur .tr-text{filter:blur(5px);opacity:.5}
.gm-typeracer .tr-card .tr-focus{position:absolute;left:0;right:0;top:0;bottom:70px;display:grid;place-items:center;font:900 15px var(--sans);color:#3d3a4d;opacity:0;pointer-events:none;transition:opacity .25s}
.gm-typeracer .tr-card.blur .tr-focus{opacity:1}
.gm-typeracer .tr-foot{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;color:rgba(255,255,255,.8);font-size:13px;font-weight:700}
.gm-typeracer .tr-btn{height:38px;padding:0 16px;border-radius:999px;border:0;background:rgba(255,255,255,.16);color:#fff;font:800 13px var(--sans);cursor:pointer;touch-action:manipulation}
.gm-typeracer .tr-btn:hover{background:rgba(255,255,255,.26)}
.gm-typeracer .tr-pane{position:absolute;inset:0;z-index:20;display:grid;place-items:safe center;padding:14px;overflow-y:auto;background:rgba(7,15,34,.78);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.gm-typeracer .tr-pane[hidden]{display:none}
.gm-typeracer.tr-menu>:not(.tr-pane){display:none}
.gm-typeracer.tr-menu .tr-pane{position:relative;inset:auto;background:none;-webkit-backdrop-filter:none;backdrop-filter:none;overflow:visible;flex:1}
.gm-typeracer .tr-box2{width:100%;max-width:520px;padding:22px 22px 20px;border-radius:22px;background:#fff;color:var(--ink,#1f1d2b);text-align:center;box-shadow:0 12px 0 rgba(8,20,48,.4),0 30px 60px -20px rgba(0,0,0,.6);animation:trIn .45s var(--spring,ease-out)}
@keyframes trIn{from{transform:translateY(14px) scale(.95);opacity:0}}
.gm-typeracer .tr-kick{display:inline-block;margin:0 0 8px;padding:4px 12px;border-radius:999px;background:#e3edff;color:#2a62c4;font:900 11px var(--sans);letter-spacing:.1em;text-transform:uppercase}
.gm-typeracer .tr-big{margin:0 0 10px;font:900 clamp(28px,5vw,40px)/1.05 var(--sans);letter-spacing:-.035em}
.gm-typeracer .tr-p{margin:0 auto 14px;max-width:34em;font-size:14px;font-weight:600;line-height:1.55;color:#4a4863}
.gm-typeracer .tr-sec{margin:14px 0 6px;font:900 11px var(--sans);letter-spacing:.1em;text-transform:uppercase;color:#7b7f95;text-align:left}
.gm-typeracer .tr-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px}
.gm-typeracer .tr-bb{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:46px;padding:0 22px;border-radius:999px;border:2px solid #2a62c4;background:#2a62c4;color:#fff;font:800 15px var(--sans);cursor:pointer;touch-action:manipulation;transition:transform .12s,background .12s}
.gm-typeracer .tr-bb:hover{background:#1f50a8;border-color:#1f50a8;transform:translateY(-2px)}
.gm-typeracer .tr-bb.ghost{background:#fff;color:#1f1d2b;border-color:#d4d2e2}
.gm-typeracer .tr-bb.ghost:hover{border-color:#8a889b;background:#fff}
.gm-typeracer .tr-bb.ora{background:#ff8a1f;border-color:#ff8a1f}
.gm-typeracer .tr-bb.ora:hover{background:#e87510;border-color:#e87510}
.gm-typeracer .tr-bb.big{height:54px;padding:0 30px;font-size:17px}
.gm-typeracer .tr-bb.sm{height:36px;padding:0 14px;font-size:13px}
.gm-typeracer .tr-bb:disabled{opacity:.4;pointer-events:none}
.gm-typeracer .tr-seg{display:inline-flex;gap:2px;padding:4px;border-radius:999px;background:#eceaf5;flex-wrap:wrap;justify-content:center}
.gm-typeracer .tr-seg button{height:32px;padding:0 14px;border:0;border-radius:999px;background:none;font:800 13px var(--sans);color:#6b6785;cursor:pointer;touch-action:manipulation;white-space:nowrap}
.gm-typeracer .tr-seg button[aria-pressed="true"]{background:#fff;color:#2a62c4;box-shadow:0 1px 2px rgba(31,29,43,.08),0 4px 12px -6px rgba(31,29,43,.4)}
.gm-typeracer .tr-gh{display:flex;flex-direction:column;gap:6px}
.gm-typeracer .tr-row{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:12px;background:#f3f2f9;text-align:left}
.gm-typeracer .tr-dot{flex:none;width:14px;height:14px;border-radius:50%;box-shadow:inset 0 -3px 0 rgba(0,0,0,.2)}
.gm-typeracer .tr-row b{flex:1;min-width:0;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-typeracer .tr-row .tr-num{min-width:74px;text-align:center;font:900 15px var(--sans);font-variant-numeric:tabular-nums}
.gm-typeracer .tr-row button{width:30px;height:30px;border:0;border-radius:9px;background:#fff;color:#1f1d2b;font:900 17px/1 var(--sans);cursor:pointer;box-shadow:0 1px 2px rgba(31,29,43,.12);touch-action:manipulation}
.gm-typeracer .tr-row button:hover{background:#e3edff}
.gm-typeracer .tr-chips{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:8px}
.gm-typeracer .tr-chips button{height:30px;padding:0 12px;border:0;border-radius:999px;background:#eceaf5;font:800 12px var(--sans);color:#3d3a4d;cursor:pointer}
.gm-typeracer .tr-chips button:hover{background:#dcd8ee}
.gm-typeracer .tr-stats{display:flex;margin:6px 0 12px;border-radius:14px;background:#f3f2f9;overflow:hidden}
.gm-typeracer .tr-stats div{flex:1;padding:10px 6px}
.gm-typeracer .tr-stats span{display:block;font:900 10px var(--sans);letter-spacing:.1em;text-transform:uppercase;color:#7b7f95}
.gm-typeracer .tr-stats b{font:900 22px var(--sans);font-variant-numeric:tabular-nums}
.gm-typeracer .tr-tab{width:100%;border-collapse:collapse;font-size:13.5px;text-align:left}
.gm-typeracer .tr-tab th{padding:4px 6px;font:900 10px var(--sans);letter-spacing:.1em;text-transform:uppercase;color:#7b7f95;text-align:left}
.gm-typeracer .tr-tab td{padding:6px;border-top:1px solid #ece9f5;font-weight:700;font-variant-numeric:tabular-nums}
.gm-typeracer .tr-tab tr.me td{background:#fff6dd}
.gm-typeracer .tr-tab tr.dnf td{opacity:.5}
.gm-typeracer .tr-tab td:first-child{width:36px;font-weight:900}
.gm-typeracer .tr-tab .tr-dot{display:inline-block;vertical-align:middle;margin-right:6px}
.gm-typeracer .tr-wait{margin:8px 0 0;font-size:13px;font-weight:800;color:#6b6785}
.gm-typeracer .tr-note{margin:10px 0 0;font-size:12px;font-weight:700;color:#7b7f95}
.gm-typeracer .tr-net{position:absolute;left:50%;transform:translateX(-50%);top:4px;z-index:5;padding:3px 10px;border-radius:999px;background:rgba(255,255,255,.14);font:800 11px var(--sans);color:#d6f5e0}
.gm-typeracer .tr-net.bad{color:#ffd2d2;background:rgba(239,79,79,.3)}
.gm-typeracer .tr-net[hidden]{display:none}
@media (max-width:640px){.gm-typeracer{min-height:620px}.gm-typeracer .tr-card{padding:14px 14px 12px}.gm-typeracer .tr-chip{min-width:0;padding:6px 9px;flex:1}.gm-typeracer .tr-chip .v{font-size:18px}.gm-typeracer .tr-title{width:100%;flex-direction:row;align-items:baseline;gap:8px}.gm-typeracer .tr-in{height:44px;font-size:18px}}
@media (pointer:coarse){.gm-typeracer .tr-foot .hintk{display:none}}`;

  Ameplay.register({
    id: 'typeracer',
    title: 'Typeracer',
    category: 'Skill',
    tint: '#1f56a8',
    blurb: 'Race cars along the track by typing real passages. Fix every typo to keep moving. Practice against ghost racers at the speed you choose, or race 2 to 8 players online with a shared countdown.',
    help: 'Type the passage exactly · <kbd>Space</kbd> next word (only when the word is right) · <kbd>Backspace</kbd> fixes a typo · <kbd>Tab</kbd> restarts practice · pasting is disabled',
    better: 'high',
    format: v => v + ' wpm',
    width: 940,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 36h8l5-9h22l7 9h10v8H6z"/><circle cx="19" cy="46" r="5" fill="currentColor" stroke="none"/><circle cx="46" cy="46" r="5" fill="currentColor" stroke="none"/><path d="M12 18h6M24 18h10M40 18h4" opacity=".5"/></svg>',
    css: trCss,
    mount(root, api) {
      const saved = api.load() || {};
      const cfg = {
        gh: Array.isArray(saved.gh) && saved.gh.length ? saved.gh.map(v => clamp(Math.round(+v) || 40, 10, 220)).slice(0, 7) : [30, 50, 75],
        len: ['any', 's', 'm', 'l'].includes(saved.len) ? saved.len : 'any',
        best: +saved.best || 0
      };
      const persist = () => api.save({ gh: cfg.gh, len: cfg.len, best: cfg.best });
      root.innerHTML = `<div class="tr-hud"><div class="tr-title">Typeracer<b class="tr-sub">Practice race</b></div><div class="tr-chip"><span class="k">Time</span><b class="v tr-t">0:00</b></div><div class="tr-chip"><span class="k">WPM</span><b class="v w tr-w">0</b></div><div class="tr-chip"><span class="k">Accuracy</span><b class="v tr-a">100%</b></div><div class="tr-chip"><span class="k">Place</span><b class="v tr-pl">-</b></div></div>
<div class="tr-track"><div class="tr-cd"></div></div>
<div class="tr-card blur"><div class="tr-text" aria-live="off"></div><div class="tr-src"></div><input class="tr-in" type="text" aria-label="Type the passage here" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="text" enterkeyhint="next"><div class="tr-focus">Click or tap here to focus</div></div>
<div class="tr-foot"><span class="hintk"><kbd>Tab</kbd> restarts · <kbd>Esc</kbd> pauses practice</span><button type="button" class="tr-btn tr-quit">Quit race</button></div>
<div class="tr-net" hidden>Online</div>
<div class="tr-pane" hidden></div>`;
      const q = s => root.querySelector(s);
      const trackEl = q('.tr-track'), cdEl = q('.tr-cd'), card = q('.tr-card'), textEl = q('.tr-text'), srcEl = q('.tr-src'), input = q('.tr-in');
      const tEl = q('.tr-t'), wEl = q('.tr-w'), aEl = q('.tr-a'), pEl = q('.tr-pl'), subEl = q('.tr-sub'), pane = q('.tr-pane'), netEl = q('.tr-net');
      const M = { mode: 'solo', role: 'local', tok: 0, hooked: false, players: [], size: 2, bots: false };
      const H = { round: 0, tally: {} };
      let R = null, tx = null, cv = null, wEls = [], cEls = [], paneFn = null, lastNow = 0, used = new Set(), idleAt = 0, resumeOffered = false;
      const SK = 'gameplay:trsave';

      const showPane = (html, fn) => { pane.innerHTML = html; pane.hidden = false; root.classList.toggle('tr-menu', !R); paneFn = fn || null; pane.scrollTop = 0; };
      const hidePane = () => { pane.hidden = true; root.classList.remove('tr-menu'); paneFn = null; pane.innerHTML = ''; };
      tap(pane, '[data-a]', b => { if (paneFn) paneFn(b.dataset.a, b); });

      const pickQuote = () => {
        const ok = qq => cfg.len === 'any' || (cfg.len === 's' ? qq[0].length < 100 : cfg.len === 'm' ? qq[0].length >= 100 && qq[0].length < 190 : qq[0].length >= 190);
        let c = TR_QUOTES.map((_, i) => i).filter(i => ok(TR_QUOTES[i]) && !used.has(i));
        if (!c.length) { TR_QUOTES.forEach((x, i) => { if (ok(x)) used.delete(i); }); c = TR_QUOTES.map((_, i) => i).filter(i => ok(TR_QUOTES[i])); }
        const i = pick(c); used.add(i);
        return TR_QUOTES[i];
      };

      const curC = () => !R ? 0 : tx.done ? R.total : tx.cc + prefixLen(R.words[tx.wi], tx.val);
      const accOf = r => r.me ? (tx.keys ? Math.round((tx.keys - tx.errs) / tx.keys * 100) : 100) : r.bot ? r.b.acc : (r.k ? clamp(Math.round((r.k - r.e) / r.k * 100), 0, 100) : 100);
      const wpmNow = (c, t) => t > 1 ? Math.round(c / 5 / (t / 60)) : 0;
      const wpmFin = (r) => r.fin ? Math.round(R.total / 5 / (r.fin / 60)) : 0;
      const noPaste = () => { const n = performance.now(); if (n - idleAt > 1500) { idleAt = n; api.toast('Pasting is disabled in races'); } tone(api, 150, .08, 'square', .04); };

      function paintWord(i) {
        const w = R.words[i], el = wEls[i], cs = cEls[i];
        if (!el) return;
        if (i < tx.wi || tx.done) { if (el.className !== 'w done') { el.className = 'w done'; for (const c of cs) c.className = ''; } return; }
        if (i > tx.wi) { if (el.className !== 'w') { el.className = 'w'; for (const c of cs) c.className = ''; } return; }
        const v = tx.val, k = prefixLen(w, v), bad = v.length > k;
        el.className = 'w cur' + (bad ? ' bad' : '') + (!bad && v === w && i < R.words.length - 1 ? ' rdy' : '');
        for (let j = 0; j < w.length; j++) cs[j].className = j < k ? 'o' : j < v.length || (bad && v.length > w.length) ? 'x' : j === v.length ? 'n' : '';
        input.classList.toggle('err', bad);
      }
      function buildText() {
        textEl.innerHTML = R.words.map(w => `<span class="w">${[...w].map(c => `<i>${esc(c)}</i>`).join('')}</span>`).join(' ');
        wEls = [...textEl.children]; cEls = wEls.map(e => [...e.children]);
        srcEl.textContent = R.src ? '- ' + R.src : 'Original passage';
      }
      function resetTyping() {
        tx = { wi: 0, cc: 0, val: '', keys: 0, errs: 0, done: false };
        input.value = ''; input.classList.remove('err'); input.disabled = false;
      }
      function restoreAt(c) {
        let cc = 0, wi = 0;
        while (wi < R.words.length - 1 && cc + R.words[wi].length + 1 <= c) { cc += R.words[wi].length + 1; wi++; }
        tx.cc = cc; tx.wi = wi; tx.val = R.words[wi].slice(0, Math.max(0, Math.min(R.words[wi].length, c - cc)));
        input.value = tx.val;
        for (let i = 0; i <= wi; i++) paintWord(i);
      }
      const racing = () => R && R.phase === 'race' && !tx.done;
      const focusIn = () => { if (!R || tx.done || !pane.hidden) return; input.focus({ preventScroll: true }); setBlur(); };
      const setBlur = () => card.classList.toggle('blur', document.activeElement !== input && !!R && R.phase !== 'done' && pane.hidden);

      function commitWord() {
        const w = R.words[tx.wi];
        tx.cc += w.length + 1; tx.wi++; tx.val = ''; input.value = '';
        paintWord(tx.wi - 1); paintWord(tx.wi);
        tone(api, 880, .03, 'square', .012);
        sendProgress(true);
      }
      function typeChar(ch) {
        const w = R.words[tx.wi], last = tx.wi === R.words.length - 1;
        if (ch === ' ') {
          tx.keys++;
          if (tx.val === w && !last) { commitWord(); } else { tx.errs++; tone(api, 150, .06, 'square', .035); }
          return;
        }
        if (tx.val.length >= w.length + 6) return;
        const j = tx.val.length, ok = tx.val === w.slice(0, j) && ch === w[j];
        tx.keys++;
        if (!ok) { tx.errs++; tone(api, 150, .06, 'square', .035); }
        tx.val += ch;
        if (tx.val === w && last) { finishTyping(); return; }
        paintWord(tx.wi);
      }
      function onInput() {
        if (!racing()) { input.value = ''; if (tx) tx.val = ''; return; }
        const v = input.value, prev = tx.val;
        if (v.length - prev.length > 24) { input.value = prev; noPaste(); return; }
        if (v.length > prev.length && v.startsWith(prev)) { for (const ch of v.slice(prev.length)) { if (tx.done) break; typeChar(ch); } }
        else { tx.val = v.replace(/ /g, '').slice(0, R.words[tx.wi].length + 6); paintWord(tx.wi); }
        if (!tx.done && input.value !== tx.val) input.value = tx.val;
        updateHud();
      }
      input.addEventListener('beforeinput', e => { if (/^insertFrom(Paste|Drop|Yank)|^insertFromPasteAsQuotation/.test(e.inputType || '')) { e.preventDefault(); noPaste(); } });
      ['paste', 'drop', 'cut', 'copy', 'dragover', 'dragenter', 'contextmenu'].forEach(t => input.addEventListener(t, e => { e.preventDefault(); if (t === 'paste' || t === 'drop') noPaste(); }));
      textEl.addEventListener('copy', e => e.preventDefault());
      textEl.addEventListener('contextmenu', e => e.preventDefault());
      input.addEventListener('input', onInput);
      input.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.preventDefault(); input.blur(); document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); }
        else if (e.key === 'Tab') { e.preventDefault(); if (M.mode === 'solo' && R) startSolo(); }
        else if (((e.ctrlKey || e.metaKey) && /^[vxy]$/i.test(e.key)) || (e.shiftKey && e.key === 'Insert')) { e.preventDefault(); noPaste(); }
        else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) e.preventDefault();
      });
      const toEnd = () => { const n = input.value.length; try { input.setSelectionRange(n, n); } catch (_) { } };
      input.addEventListener('click', toEnd);
      input.addEventListener('focus', () => { toEnd(); setBlur(); });
      input.addEventListener('blur', setBlur);
      card.addEventListener('pointerdown', () => setTimeout(focusIn, 0));
      api.on(window, 'keydown', e => {
        if (!R || !pane.hidden || tx.done || document.activeElement === input || e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key && e.key.length === 1) focusIn();
      });

      function updateHud() {
        if (!R) return;
        const rt = R.t, me = R.racers[R.me];
        const c = curC();
        tEl.textContent = rt <= 0 ? '0:00' : Math.floor(Math.min(rt, tx.done && me.fin ? me.fin : rt) / 60) + ':' + String(Math.floor(Math.min(rt, tx.done && me.fin ? me.fin : rt) % 60)).padStart(2, '0');
        wEl.textContent = tx.done && me.fin ? wpmFin(me) : wpmNow(c, rt);
        aEl.textContent = accOf(me) + '%';
        const order = R.racers.map((r, i) => i).sort((a, b) => rankKey(b) - rankKey(a));
        pEl.textContent = R.phase === 'count' ? '-' : ord(order.indexOf(R.me) + 1) + '/' + R.racers.length;
      }
      const rankKey = i => { const r = R.racers[i]; return r.fin != null ? 1e6 - r.fin : (r.d || r.c || 0); };

      function sendProgress(force) {
        if (!R || !R.online || M.role !== 'guest' || R.phase !== 'race') return;
        const n = performance.now();
        if (!force && n - R.lastSend < 180) return;
        R.lastSend = n;
        const me = R.racers[R.me];
        api.net.send({ t: 'p', c: curC(), k: tx.keys, e: tx.errs, f: me.fin ? Math.round(me.fin * 1000) : 0 }, !me.fin);
      }

      function finishTyping() {
        const me = R.racers[R.me];
        tx.done = true; tx.val = ''; input.value = ''; input.classList.remove('err');
        me.fin = Math.max(.5, R.t); me.c = R.total;
        for (let i = 0; i < R.words.length; i++) paintWord(i);
        R.order.push(R.me);
        api.score(wpmFin(me));
        fanfare(api);
        input.blur(); setBlur();
        updateHud();
        if (R.online && M.role === 'guest') { sendProgress(true); cdEl.innerHTML = '<span>Finished!<small>Waiting for the other racers</small></span>'; }
        else if (R.online) { cdEl.innerHTML = '<span>Finished!<small>Waiting for the other racers</small></span>'; }
        else { R.endAt = performance.now() + 1500; }
      }

      function makeCanvas() {
        if (cv) cv.canvas.remove();
        const n = R.racers.length, narrow = root.clientWidth < 560;
        const W = narrow ? 560 : 900, lh = Math.min(50, Math.floor(300 / n)), top = 14, H = top * 2 + lh * n;
        const c = api.canvas(W, H, trackEl);
        trackEl.prepend(c.canvas);
        cv = { canvas: c.canvas, ctx: c.ctx, w: W, h: H, lh, top, gut: narrow ? 88 : 124, narrow };
      }

      function draw(t) {
        const g = cv.ctx, W = cv.w, H = cv.h, LH = cv.lh, top = cv.top, gut = cv.gut, n = R.racers.length;
        const sx = gut + 8, fx = W - (cv.narrow ? 54 : 74), cs = clamp(LH / 46, .62, 1.05), cl = 56 * cs;
        g.fillStyle = '#2f7d3a'; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(255,255,255,.05)';
        for (let x = (cv.narrow ? 10 : 0); x < W; x += 60) g.fillRect(x, 0, 30, H);
        for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? '#3a3f4b' : '#343945'; g.fillRect(gut, top + i * LH, W - gut, LH); }
        g.fillStyle = '#0f2243'; g.fillRect(0, top, gut, n * LH);
        g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 2; g.setLineDash([14, 12]);
        for (let i = 1; i < n; i++) { g.beginPath(); g.moveTo(gut, top + i * LH); g.lineTo(W, top + i * LH); g.stroke(); }
        g.setLineDash([]); g.strokeStyle = '#f2f2f2'; g.lineWidth = 3;
        g.beginPath(); g.moveTo(gut, top); g.lineTo(W, top); g.moveTo(gut, top + n * LH); g.lineTo(W, top + n * LH); g.stroke();
        g.fillStyle = '#fff'; g.fillRect(sx - 4, top, 3, n * LH);
        const cq = 7, cols = Math.ceil(n * LH / cq);
        for (let j = 0; j < cols; j++) for (let k = 0; k < 2; k++) { g.fillStyle = (j + k) % 2 ? '#111' : '#fff'; g.fillRect(fx + 8 + k * cq, top + j * cq, cq, Math.min(cq, n * LH - j * cq)); }
        g.font = '900 ' + (cv.narrow ? 11 : 13) + 'px Nunito,system-ui,sans-serif'; g.textBaseline = 'middle';
        const placeIdx = R.racers.map((r, i) => i).filter(i => R.racers[i].fin != null).sort((a, b) => R.racers[a].fin - R.racers[b].fin);
        for (let i = 0; i < n; i++) {
          const r = R.racers[i], cy = top + i * LH + LH / 2;
          const frac = clamp((r.d || 0) / R.total, 0, 1);
          const x = sx + (fx - sx - cl - 6) * frac;
          if (r.me) { g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(gut, top + i * LH, W - gut, LH); g.fillStyle = TR_COLS[r.col]; g.fillRect(0, top + i * LH, 4, LH); }
          g.textAlign = 'left';
          let nm = r.n + (r.me ? ' (you)' : '');
          while (nm.length > 3 && g.measureText(nm).width > gut - 14) nm = nm.slice(0, -2) + '.';
          g.fillStyle = r.left ? '#8893ab' : '#fff';
          g.fillText(nm, 10, cy - (cv.narrow || LH < 36 ? 5 : 7));
          g.font = '800 ' + (cv.narrow ? 10 : 11) + 'px Nunito,system-ui,sans-serif';
          g.fillStyle = r.left ? '#8893ab' : '#ffd166';
          g.fillText(r.left ? 'left' : (r.fin != null ? wpmFin(r) : r.wpm | 0) + ' wpm', 10, cy + (cv.narrow || LH < 36 ? 7 : 9));
          g.font = '900 ' + (cv.narrow ? 11 : 13) + 'px Nunito,system-ui,sans-serif';
          const moving = r.v > 1 && !r.left && r.fin == null;
          g.globalAlpha = r.left ? .4 : 1;
          drawCar(g, x, cy - 2 * cs, cs, TR_COLS[r.col], r.rot, moving, t);
          g.globalAlpha = 1;
          if (r.fin != null) {
            const p = placeIdx.indexOf(i) + 1;
            g.fillStyle = p === 1 ? '#ffd54a' : p === 2 ? '#d5dde3' : p === 3 ? '#d99058' : '#8fa2c2';
            g.beginPath(); g.arc(W - (cv.narrow ? 20 : 28), cy, Math.min(12, LH / 2 - 3), 0, 6.3); g.fill();
            g.fillStyle = '#10213f'; g.textAlign = 'center'; g.fillText(p, W - (cv.narrow ? 20 : 28), cy + 1); g.textAlign = 'left';
          }
        }
      }

      function beginRace(s) {
        hidePane();
        const text = s.q[0];
        R = {
          text, src: s.q[1], words: text.split(' '), total: text.length, me: s.me, startPerf: s.startPerf, phase: 'count', t: -TR_CD, online: M.mode === 'online', round: s.round || 0,
          ended: false, order: [], lastSend: 0, lastSt: 0, endAt: 0, cd: 99, goUntil: 0, quote: s.q,
          racers: s.racers.map((r, i) => Object.assign({ c: 0, d: 0, v: 0, pd: 0, fin: null, wpm: 0, left: false, rot: 0, k: 0, e: 0, me: i === s.me }, r))
        };
        R.racers.forEach(r => { if (r.bot && !r.b) r.b = mkBot(r.w || 50, R.total); });
        buildText(); resetTyping();
        wEls.forEach((_, i) => paintWord(i));
        makeCanvas();
        cdEl.innerHTML = ''; cdEl.classList.remove('pop');
        subEl.textContent = R.online ? 'Online race' + (R.round > 1 ? ' ' + R.round : '') : 'Practice race';
        netEl.hidden = !R.online;
        q('.hintk').innerHTML = R.online ? '<kbd>Backspace</kbd> fixes typos · first to finish wins' : '<kbd>Tab</kbd> restarts · <kbd>Esc</kbd> pauses practice';
        tEl.textContent = '0:00'; wEl.textContent = '0'; aEl.textContent = '100%'; pEl.textContent = '-';
        api.score(0);
        if (s.restoreC) restoreAt(s.restoreC);
        lastNow = 0;
        if (s.startPerf < performance.now()) { R.phase = 'race'; R.t = (performance.now() - s.startPerf) / 1000; }
        focusIn();
      }

      function startSolo() {
        M.mode = 'solo'; M.role = 'local';
        const qq = pickQuote(), total = qq[0].length;
        const racers = [{ n: myName(), col: 1, me: true }];
        const cols = [0, 2, 3, 4, 5, 6, 7];
        cfg.gh.forEach((w, i) => racers.push({ n: TR_GHOSTS[i % TR_GHOSTS.length], col: cols[i], bot: true, w, b: mkBot(w, total) }));
        beginRace({ q: qq, racers, me: 0, startPerf: performance.now() + TR_CD * 1000 });
      }

      function standingsOf() {
        return R.racers.map((r, i) => ({ r, i })).sort((a, b) => {
          const fa = a.r.fin, fb = b.r.fin;
          if (fa != null && fb != null) return fa - fb || a.i - b.i;
          if (fa != null) return -1;
          if (fb != null) return 1;
          return (b.r.d || b.r.c) - (a.r.d || a.r.c);
        });
      }
      function makeRes() {
        if (!R.online || M.role === 'host') R.racers.forEach(r => { if (r.bot && r.fin == null) r.fin = r.b.fin; });
        return standingsOf().map((s, k) => ({ i: s.i, n: s.r.n, col: s.r.col, bot: !!s.r.bot, w: s.r.fin != null ? wpmFin(s.r) : 0, a: accOf(s.r), t: s.r.fin, p: s.r.fin != null ? k + 1 : 0 }));
      }

      function showResults(res, tally, round) {
        R.phase = 'done'; R.ended = true;
        cdEl.innerHTML = '';
        const me = res.find(x => x.i === R.me) || { p: 0, w: 0, a: 0, t: null };
        const meR = R.racers[R.me];
        let nb = false;
        if (me.p && me.w > 0) {
          api.score(me.w);
          if (me.w > cfg.best) { cfg.best = me.w; persist(); }
          nb = api.submit(me.w);
        }
        if (me.p === 1) { fanfare(api); confetti(root, api); } else if (me.p) tone(api, 440, .25, 'triangle', .06); else sadTone(api);
        const head = !me.p ? 'Did not finish' : me.p === 1 ? (R.racers.length > 1 ? 'You won!' : 'Finished!') : ord(me.p) + ' place';
        const rows = res.map(x => `<tr class="${x.i === R.me ? 'me' : ''}${x.p ? '' : ' dnf'}"><td>${x.p ? ord(x.p) : 'DNF'}</td><td><span class="tr-dot" style="background:${TR_COLS[x.col]}"></span>${esc(x.n)}${x.i === R.me ? ' (you)' : x.bot && !R.online ? ' (ghost)' : ''}</td><td>${x.p ? x.w : '-'}</td><td>${x.p ? x.a + '%' : '-'}</td><td>${x.t != null ? x.t.toFixed(1) + ' s' : '-'}</td></tr>`).join('');
        const tl = tally ? Object.keys(tally).sort((a, b) => tally[b] - tally[a]).map(k => esc(k) + ' ' + tally[k]).join(' · ') : '';
        let btns;
        if (!R.online) btns = '<button class="tr-bb ora" data-a="again">Race again</button><button class="tr-bb ghost" data-a="menu">Menu</button>';
        else if (M.role === 'host') btns = '<button class="tr-bb ora" data-a="again">Race again</button><button class="tr-bb ghost" data-a="lobby">Lobby</button><button class="tr-bb ghost" data-a="leave">Leave</button>';
        else btns = '<button class="tr-bb ghost" data-a="leave">Leave</button>';
        showPane(`<div class="tr-box2"><p class="tr-kick">${R.online ? 'Online race' + (round > 1 ? ' ' + round : '') : 'Practice race'}${nb ? ' · New best!' : ''}</p><h3 class="tr-big">${head}</h3>
<div class="tr-stats"><div><span>WPM</span><b>${me.p ? me.w : '-'}</b></div><div><span>Accuracy</span><b>${me.p ? me.a + '%' : '-'}</b></div><div><span>Time</span><b>${me.t != null ? me.t.toFixed(1) + ' s' : '-'}</b></div><div><span>Typos</span><b>${meR === R.racers[R.me] ? tx.errs : 0}</b></div></div>
<table class="tr-tab"><thead><tr><th></th><th>Racer</th><th>WPM</th><th>Acc</th><th>Time</th></tr></thead><tbody>${rows}</tbody></table>
${tl ? `<p class="tr-note">Series wins: ${tl}</p>` : ''}<p class="tr-note">${esc(R.src || 'Original passage')} · your best ${cfg.best} wpm</p>
<div class="tr-btns">${btns}</div>${R.online && M.role === 'guest' ? '<p class="tr-wait">Waiting for the host to start the next race...</p>' : ''}</div>`, onResAct);
        saveSeries();
      }
      function onResAct(a) {
        if (a === 'again') { if (M.mode === 'solo') startSolo(); else hostBegin(); }
        else if (a === 'menu') { leaveRace(); showMenu(); }
        else if (a === 'lobby') startOnline();
        else if (a === 'leave') { leaveOnline(); }
      }

      function showMenu() {
        leaveRace(); M.mode = 'solo'; M.role = 'local'; netEl.hidden = true;
        subEl.textContent = 'Practice race';
        const rows = cfg.gh.map((w, i) => `<div class="tr-row"><span class="tr-dot" style="background:${TR_COLS[[0, 2, 3, 4, 5, 6, 7][i]]}"></span><b>${TR_GHOSTS[i % TR_GHOSTS.length]}</b><button data-a="gd" data-i="${i}" aria-label="Slower">-</button><span class="tr-num">${w} wpm</span><button data-a="gu" data-i="${i}" aria-label="Faster">+</button><button data-a="gx" data-i="${i}" aria-label="Remove ghost"${cfg.gh.length < 2 ? ' disabled' : ''}>x</button></div>`).join('');
        const seg = (k, items) => `<div class="tr-seg">${items.map(([v, t]) => `<button type="button" data-a="${k}" data-v="${v}" aria-pressed="${cfg.len === v}">${t}</button>`).join('')}</div>`;
        showPane(`<div class="tr-box2"><p class="tr-kick">Typing race</p><h3 class="tr-big">Typeracer</h3>
<p class="tr-p">Type the passage as fast as you can. Every typo turns red and must be fixed before you can move on. Your best: <b>${cfg.best || '-'}</b> wpm.</p>
<p class="tr-sec">Practice ghosts (set their speed)</p><div class="tr-gh">${rows}</div>
<div class="tr-chips"><button data-a="addg"${cfg.gh.length >= 7 ? ' disabled' : ''}>+ Add ghost</button><button data-a="pre" data-v="25,40">Easy</button><button data-a="pre" data-v="40,60,80">Medium</button><button data-a="pre" data-v="70,95,120">Hard</button><button data-a="pre" data-v="${cfg.best || 40}">My best (${cfg.best || 40})</button></div>
<p class="tr-sec">Passage length</p>${seg('len', [['any', 'Any'], ['s', 'Short'], ['m', 'Medium'], ['l', 'Long']])}
<div class="tr-btns"><button class="tr-bb ora big" data-a="go">Start race</button></div>
<div class="tr-btns"><button class="tr-bb ghost" data-a="online">Race online (2-8)</button></div></div>`, onMenuAct);
      }
      function onMenuAct(a, b) {
        const i = +b.dataset.i;
        if (a === 'go') { hidePane(); startSolo(); return; }
        if (a === 'online') { startOnline(); return; }
        if (a === 'gd') cfg.gh[i] = clamp(cfg.gh[i] - (cfg.gh[i] > 100 ? 10 : 5), 10, 220);
        else if (a === 'gu') cfg.gh[i] = clamp(cfg.gh[i] + (cfg.gh[i] >= 100 ? 10 : 5), 10, 220);
        else if (a === 'gx') { if (cfg.gh.length > 1) cfg.gh.splice(i, 1); }
        else if (a === 'addg') cfg.gh.push(clamp((cfg.gh[cfg.gh.length - 1] || 40) + 10, 10, 220));
        else if (a === 'pre') cfg.gh = b.dataset.v.split(',').map(Number);
        else if (a === 'len') cfg.len = b.dataset.v;
        persist(); showMenu();
      }
      function leaveRace() { R = null; if (cv) { cv.canvas.remove(); cv = null; } textEl.textContent = ''; srcEl.textContent = ''; cdEl.innerHTML = ''; tx = null; }
      tap(q('.tr-foot'), '.tr-quit', () => {
        if (M.mode === 'online') { leaveOnline(); return; }
        leaveRace(); showMenu();
      });

      const saveSeries = () => {
        if (M.mode !== 'online' || M.role !== 'host') return;
        try { sessionStorage.setItem(SK, JSON.stringify({ code: api.net.code, at: Date.now(), round: H.round, tally: H.tally })); } catch (e) {}
      };

      function hostBegin() {
        const live = M.players.filter((x, i) => !i || api.net.players.some(p => p.id === x.id && !p.away));
        M.players = live;
        const humans = live.slice(0, 8);
        const total = clamp(M.bots ? Math.max(humans.length, M.size || humans.length) : humans.length, 1, 8);
        const qq = pickQuote(), len = qq[0].length;
        const racers = humans.map((p, i) => ({ n: p.name, id: p.id, col: i, me: i === 0 }));
        const names = shuffle(TR_GHOSTS.slice());
        while (racers.length < total) { const w = 35 + rnd(60); racers.push({ n: names.pop() + ' (bot)', bot: true, col: racers.length, w, b: mkBot(w, len) }); }
        H.round++;
        const sp = performance.now() + TR_CD * 1000;
        M.mode = 'online'; M.role = 'host';
        beginRace({ q: qq, racers, me: 0, startPerf: sp, round: H.round });
        R.racers.forEach((r, i) => { if (r.id && i) sendGo(r.id, i, 0); });
        saveSeries();
      }
      function sendGo(id, seat, c) {
        api.net.sendTo(id, { t: 'go', cd: Math.round(R.startPerf - performance.now()), text: R.text, src: R.src, round: R.round, you: seat, c: c || 0, rs: R.racers.map(r => [r.n, r.col, r.bot ? 1 : 0]) });
      }
      function hostEnd() {
        if (R.ended) return;
        const res = makeRes();
        const w = res[0];
        if (w && w.p === 1) H.tally[w.n] = (H.tally[w.n] || 0) + 1;
        api.net.send({ t: 'end', res, tally: H.tally, round: R.round });
        showResults(res, H.tally, R.round);
      }
      function hostTick(rt) {
        const now = performance.now();
        if (now - R.lastSt > 200) {
          R.lastSt = now;
          api.net.send({ t: 'st', rt: Math.round(rt * 1000), a: R.racers.map(r => [Math.round(r.c), r.fin != null ? Math.round(r.fin * 1000) : -1, r.fin != null ? wpmFin(r) : wpmNow(r.c, rt), accOf(r), r.left ? 1 : 0]) }, true);
        }
        if (rt < 1 || R.ended) return;
        const hum = R.racers.filter(r => !r.bot), act = hum.filter(r => !r.left);
        const firstFin = Math.min(...hum.filter(r => r.fin != null).map(r => r.fin), Infinity);
        if (act.every(r => r.fin != null) || (firstFin < Infinity && rt > firstFin + 20) || rt > 240) {
          if (!R.endAt) R.endAt = now + 1200;
        }
        if (R.endAt && now > R.endAt) hostEnd();
      }

      function onData(d, from) {
        if (!d || !d.t || !api.alive || M.mode !== 'online') return;
        if (api.net.role === 'host') {
          if (d.t !== 'p' || !R || M.role !== 'host' || R.phase !== 'race') return;
          const r = R.racers.find(x => x.id === from);
          if (!r || r.left || r.fin != null) return;
          const n = performance.now(), dtp = Math.max(.05, (n - (r.last || n - 200)) / 1000);
          r.last = n;
          let c = clamp(Math.floor(+d.c) || 0, 0, R.total);
          const lim = r.c + dtp * 30 + 8;
          if (c > lim) { c = Math.floor(lim); r.sus = (r.sus || 0) + 1; }
          if (c < r.c) c = r.c;
          r.c = c; r.d = c; r.k = clamp(+d.k || 0, 0, 5000); r.e = clamp(+d.e || 0, 0, 5000);
          if (c >= R.total && d.f > 0) { r.fin = clamp(d.f / 1000, R.total / 35, Math.max(R.t, R.total / 35)); R.order.push(R.racers.indexOf(r)); }
          return;
        }
        if (api.net.role !== 'guest') return;
        if (d.t === 'go' && Array.isArray(d.rs) && typeof d.text === 'string') {
          const rs = d.rs.slice(0, 8).map(a => ({ n: String(a[0]).slice(0, 18), col: clamp(+a[1] | 0, 0, 7), bot: !!a[2] }));
          const sp = performance.now() + (+d.cd || 0) - (api.net.rtt || 0) / 2;
          beginRace({ q: [String(d.text).slice(0, 400), String(d.src || '').slice(0, 80)], racers: rs, me: clamp(+d.you | 0, 0, rs.length - 1), startPerf: sp, round: +d.round || 1, restoreC: +d.c || 0 });
        } else if (d.t === 'st' && R && R.online && Array.isArray(d.a)) {
          const exp = performance.now() - (d.rt || 0) - (api.net.rtt || 0) / 2;
          if (R.phase === 'race' || R.phase === 'count') R.startPerf += (exp - R.startPerf) * .25;
          d.a.slice(0, R.racers.length).forEach((a, i) => {
            const r = R.racers[i];
            if (!r) return;
            r.left = !!a[4];
            if (i === R.me) { if (!r.fin && a[1] >= 0 && tx.done) r.fin = a[1] / 1000; return; }
            r.c = +a[0] || 0; r.wpm = +a[2] || 0; r.ac = +a[3] || 100;
            r.fin = a[1] >= 0 ? a[1] / 1000 : null;
          });
        } else if (d.t === 'end' && R && Array.isArray(d.res)) {
          R.racers.forEach(r => { r.fin = null; });
          const res = d.res.slice(0, 8).map(x => ({ i: +x.i | 0, n: String(x.n), col: clamp(+x.col | 0, 0, 7), bot: !!x.bot, w: +x.w || 0, a: +x.a || 0, t: x.t == null ? null : +x.t, p: +x.p || 0 }));
          res.forEach(x => { if (R.racers[x.i] && x.t != null) R.racers[x.i].fin = x.t; });
          if (!tx.done && res.find(x => x.i === R.me && x.p)) { tx.done = true; }
          showResults(res, d.tally || null, +d.round || 1);
        }
      }

      function hookNet() {
        if (M.hooked) return;
        M.hooked = true;
        api.net.on('data', onData);
        api.net.on('leave', p => {
          if (M.mode !== 'online' || M.role !== 'host' || !p || !R) return;
          const r = R.racers.find(x => x.id === p.id);
          if (r && !r.left) { r.left = true; api.toast(r.n + ' left the race'); }
        });
        api.net.on('rejoin', p => {
          if (M.mode !== 'online' || M.role !== 'host' || !p || !R) return;
          const i = R.racers.findIndex(x => x.id === p.id);
          if (i < 1) return;
          R.racers[i].left = false;
          if (R.ended) api.net.sendTo(p.id, { t: 'end', res: R.lastRes || [], tally: H.tally, round: R.round });
          else sendGo(p.id, i, Math.round(R.racers[i].c));
        });
        api.net.on('lobby', () => { if (M.mode === 'online' && M.role === 'guest') startOnline(); });
        api.net.on('close', reason => {
          if (M.mode !== 'online' || M.role === 'local') return;
          M.tok++; M.role = 'local';
          sadTone(api);
          const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
          const t = reason === 'kicked' ? 'The host removed you from the party.' : reason === 'host-left' ? 'The host ended the party.' : 'The connection to the host was lost.';
          if (R) R.phase = 'done';
          showPane(`<div class="tr-box2"><p class="tr-kick">Online</p><h3 class="tr-big">${h}</h3><p class="tr-p">${t}</p><div class="tr-btns"><button class="tr-bb" data-a="room">Online lobby</button><button class="tr-bb ghost" data-a="solo">Practice</button></div></div>`, a => {
            if (a === 'room') startOnline(); else { api.net.close(); leaveRace(); showMenu(); }
          });
        });
        api.interval(() => {
          if (M.mode !== 'online' || !R) return;
          const on = api.net.connected;
          netEl.classList.toggle('bad', !on);
          netEl.textContent = !on ? 'Reconnecting...' : M.role === 'host' ? (() => { const h = R.racers.filter(r => !r.bot && !r.left).length, b = R.racers.filter(r => r.bot).length; return 'Online · ' + h + (h === 1 ? ' player' : ' players') + (b ? ' + ' + b + ' bots' : ''); })() : 'Online' + (api.net.rtt ? ' · ' + api.net.rtt + ' ms' : '');
        }, 1000);
      }
      function leaveOnline() {
        try { sessionStorage.removeItem(SK); } catch (e) {}
        M.tok++; M.mode = 'solo'; M.role = 'local'; M.players = [];
        api.net.close(); leaveRace(); showMenu();
      }
      async function startOnline() {
        M.tok++; const tok = M.tok;
        hookNet();
        leaveRace(); hidePane();
        M.mode = 'online'; M.role = null; netEl.hidden = true;
        const r = await api.net.room({ title: 'Typeracer', sizes: [2, 3, 4, 5, 6, 7, 8], defaultSize: 4, min: 2, max: 8, bots: true });
        if (!api.alive || tok !== M.tok) return;
        if (!r) { M.mode = 'solo'; M.role = 'local'; return showMenu(); }
        M.role = r.role; M.players = r.players.slice(0, 8); M.bots = !!r.bots; M.size = +r.size || r.players.length;
        if (r.role === 'host') {
          let sv = null;
          try { const x = JSON.parse(sessionStorage.getItem(SK) || 'null'); if (x && x.code === api.net.code && Date.now() - x.at < 432e5) sv = x; } catch (e) {}
          if (sv && !resumeOffered) {
            resumeOffered = true;
            showPane(`<div class="tr-box2"><p class="tr-kick">Online</p><h3 class="tr-big">Race series saved</h3><p class="tr-p">You were at race ${sv.round}. Resume the series with the scores kept, or start a new one.</p><div class="tr-btns"><button class="tr-bb ora big" data-a="resume">Resume game</button><button class="tr-bb ghost" data-a="new">New series</button></div></div>`, a => {
              if (a === 'resume') { H.round = sv.round || 0; H.tally = sv.tally || {}; } else { H.round = 0; H.tally = {}; }
              hostBegin();
            });
          } else { if (!sv) { H.round = 0; H.tally = {}; } hostBegin(); }
        } else {
          showPane('<div class="tr-box2"><p class="tr-kick">Online</p><h3 class="tr-big">Connected!</h3><p class="tr-p">The race starts in a moment. Get your fingers ready.</p><div class="tr-btns"><button class="tr-bb ghost sm" data-a="leave">Leave</button></div></div>', a => { if (a === 'leave') leaveOnline(); });
        }
      }

      api.loop(() => {
        if (!R) return;
        const now = performance.now(), gap = lastNow ? now - lastNow : 0;
        lastNow = now;
        if (!R.online && gap > 400 && R.phase !== 'done') R.startPerf += gap;
        const rt = (now - R.startPerf) / 1000, dt = Math.min(.1, gap / 1000);
        R.t = rt;
        if (R.phase === 'count') {
          const left = Math.ceil(-rt);
          if (rt >= 0) {
            R.phase = 'race'; R.goUntil = now + 800;
            cdEl.innerHTML = '<span>GO!</span>'; cdEl.classList.remove('pop'); void cdEl.offsetWidth; cdEl.classList.add('pop');
            tone(api, 1046, .35, 'square', .05);
            focusIn();
          } else if (left !== R.cd) {
            R.cd = left;
            const lbl = left > 3 ? 'Get ready' : String(left);
            cdEl.innerHTML = '<span>' + lbl + (left > 3 ? '<small>' + (R.online ? 'Everyone starts together' : 'Place your fingers on the keys') + '</small>' : '') + '</span>';
            cdEl.classList.remove('pop'); void cdEl.offsetWidth; cdEl.classList.add('pop');
            if (left <= 3) tone(api, 523, .18, 'square', .045);
          }
        } else if (R.phase === 'race' && R.goUntil && now > R.goUntil && !tx.done) { cdEl.innerHTML = ''; R.goUntil = 0; }
        const hostSide = !R.online || M.role === 'host';
        const live = R.phase === 'race';
        if (live && hostSide) {
          R.racers.forEach((r, i) => {
            if (r.bot) {
              r.c = Math.min(R.total, botP(r.b, rt));
              if (r.c >= R.total && r.fin == null) { r.fin = r.b.fin; R.order.push(i); }
              r.wpm = wpmNow(r.c, rt);
            } else if (r.me) {
              r.c = curC(); r.k = tx.keys; r.e = tx.errs; r.wpm = wpmNow(r.c, rt);
            } else if (!r.left) r.wpm = r.fin != null ? wpmFin(r) : wpmNow(r.c, rt);
          });
        } else if (live) {
          const me = R.racers[R.me];
          me.c = curC(); me.wpm = wpmNow(me.c, rt);
        }
        R.racers.forEach(r => {
          const pd = r.d || 0;
          r.d = r.me || r.bot || (R.online && M.role === 'host') ? r.c : pd + (r.c - pd) * (1 - Math.exp(-dt * 9));
          r.v = dt > 0 ? (r.d - pd) / dt : 0;
          r.rot += r.v * .09 * dt;
        });
        if (live || R.phase === 'count') {
          if (live) updateHud();
          if (R.online && M.role === 'host') hostTick(rt);
          else if (R.online && M.role === 'guest') sendProgress(false);
          else if (live) {
            if (R.endAt && now > R.endAt && !R.ended) showResults(makeRes(), null, 0);
            else if (rt > 300 && !R.ended) showResults(makeRes(), null, 0);
          }
        } else if (R.phase === 'done' && R.online && M.role === 'host' && !R.lastRes) R.lastRes = makeRes();
        draw(now / 1000);
      });

      q('.tr-track').addEventListener('pointerdown', () => setTimeout(focusIn, 0));
      root._tr = { get R() { return R; }, get tx() { return tx; }, M, H, cfg, startSolo, curC, showMenu };
      if (api.net.invite) startOnline(); else showMenu();
    }
  });

  Ameplay.covers['typeracer'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="trc-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f64b8"/><stop offset="1" stop-color="#0d1b3a"/></linearGradient></defs><rect width="400" height="300" fill="url(#trc-g)"/><g transform="translate(0 40)"><rect x="0" y="40" width="400" height="48" fill="#353a46"/><rect x="0" y="88" width="400" height="48" fill="#3a3f4b"/><rect x="0" y="136" width="400" height="48" fill="#353a46"/><g stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-dasharray="16 12"><path d="M0 88H400M0 136H400"/></g><g fill="#fff"><rect x="350" y="40" width="10" height="144"/></g><g fill="#111"><rect x="350" y="40" width="10" height="10"/><rect x="360" y="50" width="10" height="10"/><rect x="350" y="60" width="10" height="10"/><rect x="360" y="70" width="10" height="10"/><rect x="350" y="80" width="10" height="10"/><rect x="360" y="90" width="10" height="10"/><rect x="350" y="100" width="10" height="10"/><rect x="360" y="110" width="10" height="10"/><rect x="350" y="120" width="10" height="10"/><rect x="360" y="130" width="10" height="10"/><rect x="350" y="140" width="10" height="10"/><rect x="360" y="150" width="10" height="10"/><rect x="350" y="160" width="10" height="10"/><rect x="360" y="170" width="10" height="10"/></g>
<g transform="translate(230 48) scale(1.4)"><rect x="0" y="-6" width="56" height="14" rx="5" fill="#e53935"/><path d="M12-6l7-8h17l10 8z" fill="#e53935"/><path d="M17-6.500l4.500-5.500H34l7 5.500z" fill="#d3ebff"/><rect x="4" y="-1.500" width="48" height="2.200" fill="#fff" opacity=".8"/><rect x="-3" y="-12" width="11" height="2.600" fill="#20232b"/><circle cx="12" cy="8" r="6.800" fill="#14161b"/><circle cx="12" cy="8" r="3.500" fill="#c9ced8"/><circle cx="43" cy="8" r="6.800" fill="#14161b"/><circle cx="43" cy="8" r="3.500" fill="#c9ced8"/></g>
<g transform="translate(120 100) scale(1.4)"><rect x="0" y="-6" width="56" height="14" rx="5" fill="#fdb813"/><path d="M12-6l7-8h17l10 8z" fill="#fdb813"/><path d="M17-6.500l4.500-5.500H34l7 5.500z" fill="#d3ebff"/><rect x="4" y="-1.500" width="48" height="2.200" fill="#fff" opacity=".8"/><rect x="-3" y="-12" width="11" height="2.600" fill="#20232b"/><circle cx="12" cy="8" r="6.800" fill="#14161b"/><circle cx="12" cy="8" r="3.500" fill="#c9ced8"/><circle cx="43" cy="8" r="6.800" fill="#14161b"/><circle cx="43" cy="8" r="3.500" fill="#c9ced8"/></g>
<g transform="translate(60 148) scale(1.4)"><rect x="0" y="-6" width="56" height="14" rx="5" fill="#1e88e5"/><path d="M12-6l7-8h17l10 8z" fill="#1e88e5"/><path d="M17-6.500l4.500-5.500H34l7 5.500z" fill="#d3ebff"/><rect x="4" y="-1.500" width="48" height="2.200" fill="#fff" opacity=".8"/><rect x="-3" y="-12" width="11" height="2.600" fill="#20232b"/><circle cx="12" cy="8" r="6.800" fill="#14161b"/><circle cx="12" cy="8" r="3.500" fill="#c9ced8"/><circle cx="43" cy="8" r="6.800" fill="#14161b"/><circle cx="43" cy="8" r="3.500" fill="#c9ced8"/></g></g>
<g font-family="Nunito, Arial Rounded MT Bold, Arial, sans-serif" font-weight="900"><rect x="40" y="236" width="320" height="38" rx="12" fill="#fff"/><text x="58" y="262" font-size="20" fill="#1b8a4a">the quick brown</text><text x="214" y="262" font-size="20" fill="#4a4f66"> fox jumps</text><rect x="196" y="244" width="3" height="22" fill="#ffb020"/></g></svg>`;

  const TC = [
    { k: 'art', n: 'Art', col: '#f97316', who: 'Beret Bea', ic: 'M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.5-1.9-.4-1.2.4-2.1 1.5-2.1H17a4 4 0 0 0 4-4c0-5-4-10-9-10zM7.5 12a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6zM10.5 8a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6zM15.5 8a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6z',
      acc: '<ellipse cx="22" cy="13" rx="14" ry="6" fill="#d1432f"/><circle cx="25" cy="6.500" r="2.400" fill="#d1432f"/><path d="M14 36q10 6 20 0" stroke="#7c2d12" stroke-width="0" fill="none"/>' },
    { k: 'sci', n: 'Science', col: '#22c55e', who: 'Prof. Bubbles', ic: 'M9 2.500h6v2h-1V9l5.400 9.200A2 2 0 0 1 17.700 21H6.300a2 2 0 0 1-1.700-2.800L10 9V4.500H9z',
      acc: '<path d="M10 21q-5-9 2-12 1-6 8-4 4-3 9 1 7 0 7 7 5 3 1 8-3-6-7-7-8-3-14 2-3 2-6 5z" fill="#f3f4f6"/><circle cx="18" cy="27" r="5.200" fill="#cfe8ff" stroke="#334155" stroke-width="1.800"/><circle cx="30" cy="27" r="5.200" fill="#cfe8ff" stroke="#334155" stroke-width="1.800"/><path d="M23 27h2" stroke="#334155" stroke-width="1.800"/>' },
    { k: 'spo', n: 'Sports', col: '#ef4444', who: 'Captain Goal', ic: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 2.100V11H4.100A8 8 0 0 1 11 4.100zm2 0A8 8 0 0 1 19.900 11H13zM4.100 13H11v6.900A8 8 0 0 1 4.100 13zm8.900 0h6.900A8 8 0 0 1 13 19.900z',
      acc: '<path d="M10 20q0-12 14-12t14 12z" fill="#3b2a1a"/><rect x="9" y="17" width="30" height="5.500" rx="2.500" fill="#fff" stroke="#e2e8f0"/><rect x="9" y="19" width="30" height="2.500" fill="#2563eb"/>' },
    { k: 'ent', n: 'Entertainment', col: '#ec4899', who: 'Starla Spot', ic: 'M12 2l2.900 6.300 6.900.7-5.200 4.600 1.500 6.800L12 16.900 5.900 20.400l1.500-6.800L2.200 9l6.900-.7z',
      acc: '<path d="M9 22q-1-14 15-14t15 14q-8-7-15-7t-15 7z" fill="#a855f7"/><rect x="10.500" y="22.500" width="12.500" height="8" rx="3.500" fill="#111827"/><rect x="25" y="22.500" width="12.500" height="8" rx="3.500" fill="#111827"/><path d="M23 26h2" stroke="#111827" stroke-width="2"/>' },
    { k: 'geo', n: 'Geography', col: '#3b82f6', who: 'Globe Gus', ic: 'M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.500a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5z',
      acc: '<ellipse cx="24" cy="17" rx="20" ry="4.200" fill="#a16207"/><path d="M12 17q0-12 12-12t12 12z" fill="#ca8a04"/><rect x="12" y="12.500" width="24" height="3.500" fill="#78350f"/>' },
    { k: 'his', n: 'History', col: '#eab308', who: 'Sir Scroll', ic: 'M12 2L2 7v2h20V7zM4 11h2v7H4zm5 0h2v7H9zm4 0h2v7h-2zm5 0h2v7h-2zM2 20h20v2H2z',
      acc: '<path d="M8 23q0-17 16-17t16 17h-5q0-8-11-8t-11 8z" fill="#b45309"/><rect x="21.500" y="1" width="5" height="13" rx="2.500" fill="#dc2626"/>' }
  ];
  const TCQ = [QA_ART, QA_SCI, QA_SPO, QA_ENT, QA_GEO, QA_HIS].map(parseQ);
  const TC_CROWN = 'M3 8l4.500 4L12 4l4.500 8L21 8l-2 11H5z';
  const TC_PU = [
    { n: 'Bomb', k: 'q', d: 'Removes two wrong answers', svg: '<circle cx="10" cy="14.500" r="7" fill="currentColor"/><path d="M15 9.500l4-4" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" fill="none"/><path d="M20 2v3M23 5h-3M22 3l-2 2" stroke="currentColor" stroke-width="1.600" stroke-linecap="round" fill="none"/>' },
    { n: 'Double chance', k: 'w', d: 'A second try if your first answer is wrong', svg: '<circle cx="8.500" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2.600"/><circle cx="15.500" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="2.600"/>' },
    { n: 'Extra time', k: 'e', d: 'Adds 15 seconds', svg: '<circle cx="12" cy="13.500" r="8" fill="none" stroke="currentColor" stroke-width="2.600"/><path d="M12 8.500v5.500l3.500 2M9 2h6" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" fill="none"/>' },
    { n: 'Skip', k: 'r', d: 'Swaps the question for a new one', svg: '<path d="M4 5l10 7-10 7z" fill="currentColor"/><path d="M18 5v14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' }
  ];
  const SPIN_MS = 3400, LAND_MS = 900, REV_MS = 1900, CEL_MS = 2600, QSECS = 20, IDLE_MS = 45000;
  const TAU = Math.PI * 2, SLICE = TAU / 7;
  const svgI = (d, cls) => `<svg class="${cls || ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="currentColor" fill-rule="evenodd"/></svg>`;
  const chrSvg = i => `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23.500" fill="${TC[i].col}"/><circle cx="24" cy="28" r="14" fill="#ffd9b8"/><circle cx="18.500" cy="28" r="1.900" fill="#1f2937"/><circle cx="29.500" cy="28" r="1.900" fill="#1f2937"/><path d="M19 34q5 4 10 0" stroke="#7c2d12" stroke-width="1.800" fill="none" stroke-linecap="round"/>${TC[i].acc}</svg>`;
  const mkGame = c => {
    const base = [.5, .66, .82][c.diff] || .66;
    return {
      seq: 0, evn: 0, ev: null, gain: null, cfg: { target: c.target, secs: QSECS, diff: c.diff },
      S: c.names.map((n, i) => ({ n, bot: !!c.bots[i], cr: [0, 0, 0, 0, 0, 0], pu: [1, 1, 1, 1], st: 0, r: 0, w: 0 })),
      sk: TC.map(() => clamp(base + (Math.random() - .5) * .22, .3, .95)),
      u: TC.map(() => []), turn: rnd(2), ph: 'spin', tm: IDLE_MS, tmax: 0, ct: 0, spin: null, q: null, duel: null, da: [null, null], cel: null, cn: false, win: -1, hold: false
    };
  };
  const bump = G => { G.seq++; };
  const evt = (G, k, o) => { G.ev = Object.assign({ id: ++G.evn, k }, o || {}); bump(G); };
  const botT = (G, lo, hi) => { G.ct = G.S[G.turn].bot ? lo + rnd(hi - lo + 1) : 0; };
  const setPh = (G, ph, tm) => { G.ph = ph; G.tm = tm; G.ct = 0; bump(G); };
  const nCr = s => s.cr.reduce((a, b) => a + b, 0);
  const thinkMs = G => 2200 + rnd(4200) + (2 - G.cfg.diff) * 1300;
  function pq(G, ci) {
    const bank = TCQ[ci], u = G.u[ci];
    if (u.length >= bank.length) u.length = 0;
    let i;
    do i = rnd(bank.length); while (u.includes(i));
    u.push(i);
    const r = bank[i], o = shuffle(r.slice(1));
    return { c: ci, t: r[0], o, a: o.indexOf(r[1]), m: 'n', rm: [], dbl: 0, tr: [], rev: -1, pk: -1, ok: null, bp: 0, tt: 0 };
  }
  function startAsk(G, ci, m) {
    G.q = pq(G, ci); G.q.m = m;
    G.da = [null, null];
    setPh(G, 'ask', G.cfg.secs * 1000); G.tmax = G.tm;
    G.ct = G.S[G.turn].bot ? thinkMs(G) : 0;
  }
  function passTurn(G) {
    G.turn = 1 - G.turn; G.cn = false; G.S.forEach(s => { s.st = 0; });
    setPh(G, 'spin', IDLE_MS); botT(G, 900, 1600);
    evt(G, 'turn');
  }
  function toSpin(G) { setPh(G, 'spin', IDLE_MS); botT(G, 900, 1600); }
  function givePU(G, seat) {
    const k = rnd(4);
    G.S[seat].pu[k]++; G.gain = { id: (G.gain ? G.gain.id : 0) + 1, s: seat, k };
  }
  function win(G, seat) { G.win = seat; setPh(G, 'over', 0); evt(G, 'over', { s: seat }); }
  function finishQ(G, ok, pk) {
    const q = G.q, s = G.S[G.turn];
    q.rev = q.a; q.pk = pk; q.ok = ok;
    if (ok) s.r++; else s.w++;
    setPh(G, 'rev', REV_MS);
    evt(G, ok ? 'right' : 'wrong', { s: G.turn });
  }
  function celebrate(G, k, c, seat) {
    G.cel = { k, c, s: seat };
    setPh(G, 'cel', CEL_MS);
    evt(G, k === 'def' ? 'def' : 'crown', { s: seat, c });
  }
  function afterQ(G) {
    const s = G.S[G.turn], q = G.q;
    if (q.ok) {
      if (q.m === 'c') { s.cr[q.c] = 1; givePU(G, G.turn); celebrate(G, 'crown', q.c, G.turn); return; }
      s.st++;
      if (s.st % 3 === 0) { G.cn = true; givePU(G, G.turn); evt(G, 'streak', { s: G.turn }); }
      toSpin(G);
    } else passTurn(G);
  }
  function afterCel(G) {
    const c = G.cel;
    if (nCr(G.S[c.s]) >= G.cfg.target) return win(G, c.s);
    if (c.k === 'def') passTurn(G); else toSpin(G);
  }
  function land(G) {
    const sl = G.spin.sl;
    if (sl < 6) startAsk(G, sl, 'n');
    else { setPh(G, 'crown', IDLE_MS); botT(G, 1300, 2200); evt(G, 'landc'); }
  }
  function startDuel(G, c) {
    G.duel = { c, ch: G.turn, sc: [0, 0], n: 0 };
    nextDuel(G);
  }
  function nextDuel(G) {
    const c = G.duel.c;
    G.q = pq(G, c); G.q.m = 'd'; G.da = [null, null];
    setPh(G, 'duel', G.cfg.secs * 1000); G.tmax = G.tm;
    G.ct = G.S.some(s => s.bot) ? thinkMs(G) + 800 : 0;
  }
  function revealDuel(G) {
    const q = G.q, d = G.duel;
    q.rev = q.a;
    for (let i = 0; i < 2; i++) { if (G.da[i] === null) G.da[i] = -1; if (G.da[i] === q.a) { d.sc[i]++; G.S[i].r++; } else G.S[i].w++; }
    d.n++;
    setPh(G, 'drev', REV_MS + 500);
    evt(G, 'drev');
  }
  function afterDuelQ(G) {
    const d = G.duel, left = 3 - d.n, diff = d.sc[d.ch] - d.sc[1 - d.ch];
    if (d.n < 3 && Math.abs(diff) <= left) return nextDuel(G);
    if (diff === 0 && d.n < 6) return nextDuel(G);
    const ch = d.ch, w = diff > 0 ? ch : 1 - ch;
    if (w === ch) {
      G.S[ch].cr[d.c] = 1; G.S[1 - ch].cr[d.c] = 0; givePU(G, ch);
      celebrate(G, 'steal', d.c, ch);
    } else celebrate(G, 'def', d.c, 1 - ch);
  }
  function usePU(G, seat, k) {
    const q = G.q, s = G.S[seat];
    if (G.ph !== 'ask' || seat !== G.turn || !s.pu[k] || q.rev >= 0 || q.pp && q.pp.includes(k)) return false;
    if (k === 0 && q.rm.length) return false;
    if (k === 1 && q.dbl) return false;
    q.pp = (q.pp || []).concat(k);
    s.pu[k]--;
    if (k === 0) q.rm = shuffle([0, 1, 2, 3].filter(i => i !== q.a && !q.tr.includes(i))).slice(0, 2);
    else if (k === 1) q.dbl = 1;
    else if (k === 2) { G.tm += 15000; G.tmax += 15000; }
    else { const m = q.m; G.q = pq(G, q.c); G.q.m = m; G.q.pp = [3]; G.tm = G.cfg.secs * 1000; G.tmax = G.tm; G.ct = G.S[G.turn].bot ? thinkMs(G) : 0; }
    evt(G, 'pu', { s: seat, k });
    return true;
  }
  function answer(G, seat, i) {
    const q = G.q;
    if (G.ph === 'duel') {
      if (G.da[seat] !== null || !(i >= 0 && i < 4)) return;
      G.da[seat] = i; bump(G);
      if (G.da[0] !== null && G.da[1] !== null) revealDuel(G);
      return;
    }
    if (G.ph !== 'ask' || seat !== G.turn || !(i >= 0 && i < 4) || q.rm.includes(i) || q.tr.includes(i)) return;
    if (i === q.a) finishQ(G, true, i);
    else if (q.dbl === 1) { q.dbl = 2; q.tr.push(i); G.ct = G.S[seat].bot ? 1100 : 0; evt(G, 'dbl', { s: seat }); }
    else finishQ(G, false, i);
  }
  function pickCrown(G, seat, c, duel) {
    if (G.ph !== 'crown' || seat !== G.turn || !(c >= 0 && c < 6)) return;
    const me = G.S[seat], op = G.S[1 - seat];
    if (me.cr[c]) return;
    if (duel) { if (!op.cr[c]) return; startDuel(G, c); }
    else startAsk(G, c, 'c');
  }
  function autoPick(G) {
    const seat = G.turn, me = G.S[seat], op = G.S[1 - seat];
    const lack = [0, 1, 2, 3, 4, 5].filter(i => !me.cr[i]);
    if (!lack.length) return;
    const du = lack.filter(i => op.cr[i]);
    if (me.bot) {
      const best = lack.slice().sort((a, b) => G.sk[b] - G.sk[a]);
      const dd = du.slice().sort((a, b) => G.sk[b] - G.sk[a]);
      if (dd.length && Math.random() < .45) return pickCrown(G, seat, dd[0], true);
      return pickCrown(G, seat, best[0], false);
    }
    pickCrown(G, seat, pick(lack), false);
  }
  function act(G, seat, a) {
    if (!a || G.ph === 'over') return;
    if (a.t === 'spin') {
      if (G.ph !== 'spin' || seat !== G.turn) return;
      const sl = G.cn ? 6 : rnd(7);
      G.cn = false;
      G.spin = { n: (G.spin ? G.spin.n : 0) + 1, sl, j: (Math.random() - .5) * .62 };
      setPh(G, 'spinning', SPIN_MS + LAND_MS);
      evt(G, 'spin', { s: seat });
    } else if (a.t === 'pick') pickCrown(G, seat, a.c | 0, !!a.d);
    else if (a.t === 'ans') answer(G, seat, a.i | 0);
    else if (a.t === 'pu') usePU(G, seat, a.k | 0);
  }
  function botAsk(G) {
    const s = G.S[G.turn], q = G.q, p = G.sk[q.c];
    const know = Math.random() < (q.dbl === 2 ? .5 : p);
    if (!know && !q.bp) {
      q.bp = 1;
      if (s.pu[0] && !q.rm.length && rnd(10) < 6) { usePU(G, G.turn, 0); G.ct = 900; return; }
      if (s.pu[1] && !q.dbl && rnd(10) < 5) { usePU(G, G.turn, 1); G.ct = 900; return; }
      if (s.pu[3] && q.m === 'n' && rnd(10) < 3) { usePU(G, G.turn, 3); return; }
    }
    const wr = [0, 1, 2, 3].filter(i => i !== q.a && !q.rm.includes(i) && !q.tr.includes(i));
    answer(G, G.turn, know || !wr.length ? q.a : pick(wr));
    if (G.ph === 'ask') G.ct = Math.max(G.ct, 1100);
  }
  function tick(G, d) {
    if (G.ph === 'over' || G.hold) return;
    G.tm -= d;
    if (G.ct > 0) G.ct -= d;
    const bt = G.S[G.turn].bot;
    switch (G.ph) {
      case 'spin': if (bt ? G.ct <= 0 : G.tm <= 0) act(G, G.turn, { t: 'spin' }); break;
      case 'spinning': if (G.tm <= 0) land(G); break;
      case 'crown': if (bt ? G.ct <= 0 : G.tm <= 0) autoPick(G); break;
      case 'ask':
        if (G.tm <= 0) finishQ(G, false, -1);
        else if (bt && G.ct <= 0) botAsk(G);
        break;
      case 'rev': if (G.tm <= 0) afterQ(G); break;
      case 'duel':
        if (G.tm <= 0) revealDuel(G);
        else if (G.ct <= 0 && G.ct !== -1) {
          const i = G.S.findIndex((s, k) => s.bot && G.da[k] === null);
          if (i < 0) { G.ct = -1; break; }
          const q = G.q, wr = [0, 1, 2, 3].filter(x => x !== q.a);
          answer(G, i, Math.random() < G.sk[q.c] ? q.a : pick(wr));
          if (G.ph === 'duel') G.ct = 1000;
        }
        break;
      case 'drev': if (G.tm <= 0) afterDuelQ(G); break;
      case 'cel': if (G.tm <= 0) afterCel(G); break;
    }
  }
  function mkView(G, seat) {
    const q = G.q, rv = !!q && q.rev >= 0, d = G.duel, show = G.ph === 'drev' || G.ph === 'cel' || G.ph === 'over';
    return {
      seq: G.seq, you: seat, cfg: G.cfg, turn: G.turn, ph: G.ph, tm: Math.round(G.tm), tmax: G.tmax, sp: G.spin, cn: G.cn, win: G.win, ev: G.ev, gain: G.gain, cel: G.cel, hold: G.hold,
      S: G.S.map(s => ({ n: s.n, bot: s.bot, cr: s.cr, pu: s.pu, st: s.st, r: s.r, w: s.w })),
      q: q && { c: q.c, t: q.t, o: q.o, m: q.m, rm: q.rm, dbl: q.dbl, tr: q.tr, rev: q.rev, pk: q.pk, ok: q.ok, a: rv ? q.a : undefined },
      du: d && { c: d.c, ch: d.ch, sc: d.sc, n: d.n },
      da: G.da.map((x, i) => x === null ? null : show || i === seat ? x : -2)
    };
  }

  const tcCss = `
.gm-trivia-crack{align-items:stretch;justify-content:flex-start;gap:12px;min-height:0;padding:clamp(10px,2vw,20px);border-radius:20px;background:radial-gradient(120% 90% at 50% 0%,#7a3df0 0%,#4a1fb5 52%,#2a1170 100%);color:#fff;overflow:hidden;text-align:left}
.gm-trivia-crack button{font-family:var(--sans)}
.gm-trivia-crack .tc-top{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:stretch}
.gm-trivia-crack .tc-pl{display:flex;gap:10px;align-items:center;min-width:0;padding:8px 12px;border-radius:16px;background:rgba(255,255,255,.11);border:2px solid transparent;transition:background .25s,border-color .25s,box-shadow .25s}
.gm-trivia-crack .tc-pl.on{border-color:#ffd166;background:rgba(255,255,255,.2);box-shadow:0 0 0 4px rgba(255,209,102,.18)}
.gm-trivia-crack .tc-pl.r{flex-direction:row-reverse;text-align:right}
.gm-trivia-crack .tc-av{flex:none;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font:900 20px var(--sans);box-shadow:inset 0 -4px 0 rgba(0,0,0,.22)}
.gm-trivia-crack .tc-pi{min-width:0;flex:1}
.gm-trivia-crack .tc-pi>b{display:block;font-size:15px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-trivia-crack .tc-crs{display:flex;gap:4px;margin:5px 0 3px}
.gm-trivia-crack .tc-pl.r .tc-crs,.gm-trivia-crack .tc-pl.r .tc-mt{justify-content:flex-end}
.gm-trivia-crack .tc-cr{position:relative;flex:none;width:28px;height:28px;border-radius:50%;transition:transform .3s}
.gm-trivia-crack .tc-cr svg{display:block;width:100%;height:100%}
.gm-trivia-crack .tc-cr.off svg{filter:grayscale(1) brightness(.55);opacity:.35}
.gm-trivia-crack .tc-cr.on{box-shadow:0 0 0 2px #ffd166}
.gm-trivia-crack .tc-cr.on::after{content:"";position:absolute;left:50%;top:-8px;width:14px;height:11px;margin-left:-7px;background:#ffd166;clip-path:polygon(0 100%,0 20%,25% 55%,50% 0,75% 55%,100% 20%,100% 100%)}
.gm-trivia-crack .tc-mt{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:11px;font-weight:800;color:rgba(255,255,255,.8)}
.gm-trivia-crack .tc-pips{display:inline-flex;gap:3px;align-items:center}
.gm-trivia-crack .tc-pip{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.22)}
.gm-trivia-crack .tc-pip.on{background:#ffd166;box-shadow:0 0 6px #ffd166}
.gm-trivia-crack .tc-cn{color:#ffd166;font-weight:900}
.gm-trivia-crack .tc-pc{display:inline-flex;align-items:center;gap:2px}
.gm-trivia-crack .tc-pc svg{width:13px;height:13px;color:#fff}
.gm-trivia-crack .tc-pc.z{opacity:.35}
.gm-trivia-crack .tc-vs{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:132px;text-align:center}
.gm-trivia-crack .tc-vs b{font:900 17px var(--sans);letter-spacing:-.01em}
.gm-trivia-crack .tc-vs small{font:800 11px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.7)}
.gm-trivia-crack .tc-stage{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:440px}
.gm-trivia-crack .tc-stage>div{width:100%}
.gm-trivia-crack .tc-stage>div[hidden]{display:none}
.gm-trivia-crack .tc-wheel{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px}
.gm-trivia-crack .tc-wheel .g-canvas{background:none;width:min(100%,400px)!important;max-height:420px}
.gm-trivia-crack .tc-wcv{position:relative;width:min(100%,400px)}
.gm-trivia-crack .tc-wcv .g-canvas{width:100%!important}
.gm-trivia-crack .tc-spin{position:absolute;left:50%;top:50.5%;width:24%;aspect-ratio:1;transform:translate(-50%,-50%);border:0;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe9a8,#ffb020 70%);color:#5a2a00;font:900 clamp(13px,2.4vw,18px)/1 var(--sans);letter-spacing:.04em;cursor:pointer;box-shadow:0 5px 0 #b8710b,0 8px 18px rgba(0,0,0,.35);touch-action:manipulation;transition:transform .12s,box-shadow .12s,opacity .2s}
.gm-trivia-crack .tc-spin:hover:not(:disabled){transform:translate(-50%,-52%) scale(1.04)}
.gm-trivia-crack .tc-spin:active:not(:disabled){transform:translate(-50%,-47%);box-shadow:0 2px 0 #b8710b}
.gm-trivia-crack .tc-spin:disabled{opacity:.55;cursor:default;box-shadow:0 3px 0 #7a5010;filter:grayscale(.4)}
.gm-trivia-crack .tc-spin.pulse:not(:disabled){animation:tcPulse 1.1s ease-in-out infinite}
@keyframes tcPulse{50%{transform:translate(-50%,-50%) scale(1.08)}}
.gm-trivia-crack .tc-say{margin:0;min-height:26px;font:900 clamp(15px,2.4vw,19px)/1.3 var(--sans);text-align:center;text-shadow:0 2px 0 rgba(0,0,0,.25)}
.gm-trivia-crack .tc-q{max-width:760px;margin:0 auto;border-radius:20px;background:#fff;color:var(--ink,#1f1d2b);overflow:hidden;box-shadow:0 8px 0 rgba(20,8,60,.45),0 24px 40px -18px rgba(0,0,0,.6);animation:tcIn .35s var(--spring,ease-out)}
@keyframes tcIn{from{transform:translateY(12px) scale(.97);opacity:0}}
.gm-trivia-crack .tc-qh{display:flex;align-items:center;gap:10px;padding:10px 16px;color:#fff;font:900 16px var(--sans)}
.gm-trivia-crack .tc-qh svg{width:26px;height:26px;flex:none}
.gm-trivia-crack .tc-tag{padding:3px 10px;border-radius:999px;background:rgba(0,0,0,.2);font:800 11px var(--sans);letter-spacing:.06em;text-transform:uppercase}
.gm-trivia-crack .tc-tm{margin-left:auto;font:900 20px var(--sans);font-variant-numeric:tabular-nums}
.gm-trivia-crack .tc-tm.low{animation:tcBlink .6s steps(2) infinite}
@keyframes tcBlink{50%{opacity:.4}}
.gm-trivia-crack .tc-tb{height:6px;background:rgba(0,0,0,.12)}
.gm-trivia-crack .tc-tb i{display:block;height:100%;width:100%;background:var(--c);transform-origin:left;transition:background .3s}
.gm-trivia-crack .tc-tb i.low{background:#ef4444}
.gm-trivia-crack .tc-qb{padding:16px 18px 16px}
.gm-trivia-crack .tc-qt{margin:0 0 14px;font:800 clamp(18px,2.7vw,25px)/1.32 var(--sans);letter-spacing:-.01em}
.gm-trivia-crack .tc-opts{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.gm-trivia-crack .tc-o{position:relative;display:flex;align-items:center;gap:10px;min-height:54px;padding:8px 12px;border:2px solid #e2dff0;border-radius:14px;background:#faf9ff;color:inherit;text-align:left;font:700 clamp(14px,2vw,17px)/1.25 var(--sans);cursor:pointer;touch-action:manipulation;transition:transform .12s,border-color .12s,background .12s,opacity .2s}
.gm-trivia-crack .tc-o:hover:not(:disabled){border-color:var(--c);background:#fff;transform:translateY(-2px)}
.gm-trivia-crack .tc-o:disabled{cursor:default}
.gm-trivia-crack .tc-o kbd{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:9px;background:var(--c);color:#fff;font:900 14px var(--sans);box-shadow:none;border:0;padding:0}
.gm-trivia-crack .tc-o.ok{border-color:#16a34a;background:#dcfce7;animation:tcOk .5s}
.gm-trivia-crack .tc-o.ok kbd{background:#16a34a}
.gm-trivia-crack .tc-o.bad,.gm-trivia-crack .tc-o.tried{border-color:#ef4444;background:#fee2e2}
.gm-trivia-crack .tc-o.bad kbd,.gm-trivia-crack .tc-o.tried kbd{background:#ef4444}
.gm-trivia-crack .tc-o.bad{animation:tcShake .4s}
.gm-trivia-crack .tc-o.dim{opacity:.45}
.gm-trivia-crack .tc-o.gone{visibility:hidden}
.gm-trivia-crack .tc-o.mine{border-color:var(--c);background:#fff}
.gm-trivia-crack .tc-o em{margin-left:auto;font:900 10px var(--sans);font-style:normal;letter-spacing:.06em;text-transform:uppercase;padding:2px 7px;border-radius:999px;background:#1f1d2b;color:#fff}
.gm-trivia-crack .tc-o em+em{margin-left:4px}
@keyframes tcOk{40%{transform:scale(1.04)}}
@keyframes tcShake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.gm-trivia-crack .tc-qf{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:14px;min-height:42px}
.gm-trivia-crack .tc-pu{display:inline-flex;align-items:center;gap:6px;height:42px;padding:0 12px;border:2px solid #e2dff0;border-radius:999px;background:#fff;color:#3d3a4d;font:800 13px var(--sans);cursor:pointer;touch-action:manipulation;transition:transform .12s,border-color .12s,background .12s}
.gm-trivia-crack .tc-pu svg{width:20px;height:20px}
.gm-trivia-crack .tc-pu b{display:inline-grid;place-items:center;min-width:20px;height:20px;padding:0 5px;border-radius:999px;background:var(--c);color:#fff;font-size:12px}
.gm-trivia-crack .tc-pu kbd{display:none;font:800 10px var(--sans);padding:1px 5px;border-radius:5px;background:#eceaf5;box-shadow:none;border:0;color:#6b6785}
.gm-trivia-crack .tc-pu:hover:not(:disabled){border-color:var(--c);transform:translateY(-2px)}
.gm-trivia-crack .tc-pu:disabled{opacity:.4;cursor:default}
.gm-trivia-crack .tc-pu.armed{border-color:var(--c);background:#f3efff}
.gm-trivia-crack .tc-res{margin-left:auto;font:900 16px var(--sans)}
.gm-trivia-crack .tc-res.ok{color:#16a34a}
.gm-trivia-crack .tc-res.bad{color:#dc2626}
.gm-trivia-crack .tc-wait{font:800 14px var(--sans);color:#6b6785}
.gm-trivia-crack .tc-ds{display:flex;gap:8px;align-items:center;justify-content:center;margin-bottom:10px;font:900 15px var(--sans)}
.gm-trivia-crack .tc-ds span{padding:3px 12px;border-radius:999px;background:#f1eefb;font-size:16px}
.gm-trivia-crack .tc-pick{max-width:780px;margin:0 auto;text-align:center}
.gm-trivia-crack .tc-ph{margin:0 0 12px;font:900 clamp(16px,2.6vw,21px)/1.3 var(--sans);text-shadow:0 2px 0 rgba(0,0,0,.25)}
.gm-trivia-crack .tc-pg{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.gm-trivia-crack .tc-pt{display:flex;flex-direction:column;align-items:center;gap:3px;padding:12px 8px;border-radius:16px;background:#fff;color:var(--ink,#1f1d2b);border-bottom:5px solid var(--c)}
.gm-trivia-crack .tc-pt.own{opacity:.55}
.gm-trivia-crack .tc-pa{display:block;width:54px;height:54px}
.gm-trivia-crack .tc-pa svg{display:block;width:100%;height:100%}
.gm-trivia-crack .tc-pt b{font-size:14px}
.gm-trivia-crack .tc-pt small{font:800 11px var(--sans);letter-spacing:.06em;text-transform:uppercase;color:#6b6785}
.gm-trivia-crack .tc-pb{width:100%;height:34px;margin-top:4px;border:0;border-radius:999px;background:var(--c);color:#fff;font:800 12.5px var(--sans);cursor:pointer;touch-action:manipulation;transition:transform .12s,filter .12s}
.gm-trivia-crack .tc-pb:hover{transform:translateY(-2px);filter:brightness(1.08)}
.gm-trivia-crack .tc-pb.duel{background:#1f1d2b}
.gm-trivia-crack .tc-pbd{margin-top:4px;font:900 11px var(--sans);color:#6b6785;letter-spacing:.06em;text-transform:uppercase}
.gm-trivia-crack .tc-cl{max-width:520px;margin:0 auto;padding:22px;border-radius:22px;background:#fff;color:var(--ink,#1f1d2b);text-align:center;border-bottom:8px solid var(--c);animation:tcIn .4s var(--spring,ease-out)}
.gm-trivia-crack .tc-cl .big{position:relative;width:110px;height:110px;margin:6px auto 10px;animation:tcBob 1.2s ease-in-out infinite}
.gm-trivia-crack .tc-cl .big svg{display:block;width:100%;height:100%}
.gm-trivia-crack .tc-cl .big::after{content:"";position:absolute;left:50%;top:-26px;width:60px;height:44px;margin-left:-30px;background:#ffd166;clip-path:polygon(0 100%,0 20%,25% 55%,50% 0,75% 55%,100% 20%,100% 100%);animation:tcDrop .6s var(--spring,ease-out)}
@keyframes tcBob{50%{transform:translateY(-6px)}}
@keyframes tcDrop{from{transform:translateY(-40px);opacity:0}}
.gm-trivia-crack .tc-cl h3{margin:0 0 4px;font:900 clamp(22px,4vw,30px)/1.1 var(--sans);letter-spacing:-.02em}
.gm-trivia-crack .tc-cl p{margin:0;font:700 14px/1.5 var(--sans);color:#4a4863}
.gm-trivia-crack .tc-cl.def .big{filter:grayscale(.2)}
.gm-trivia-crack .tc-cl.def .big::after{display:none}
.gm-trivia-crack .tc-bar{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;color:rgba(255,255,255,.8);font-size:13px;font-weight:700}
.gm-trivia-crack .tc-btn{height:38px;padding:0 16px;border-radius:999px;border:0;background:rgba(255,255,255,.16);color:#fff;font:800 13px var(--sans);cursor:pointer;touch-action:manipulation}
.gm-trivia-crack .tc-btn:hover{background:rgba(255,255,255,.26)}
.gm-trivia-crack .tc-net{position:absolute;left:50%;transform:translateX(-50%);top:4px;z-index:5;padding:3px 10px;border-radius:999px;background:rgba(255,255,255,.14);font:800 11px var(--sans);color:#d6f5e0}
.gm-trivia-crack .tc-net.bad{color:#ffd2d2;background:rgba(239,79,79,.3)}
.gm-trivia-crack .tc-net[hidden]{display:none}
.gm-trivia-crack .tc-hold{position:absolute;left:50%;top:6px;z-index:6;transform:translateX(-50%);padding:6px 14px;border-radius:999px;background:#ffb020;color:#3a2200;font:900 12px var(--sans)}
.gm-trivia-crack .tc-hold[hidden]{display:none}
.gm-trivia-crack .tc-pane{position:absolute;inset:0;z-index:20;display:grid;place-items:safe center;padding:14px;overflow-y:auto;background:rgba(20,8,60,.8);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.gm-trivia-crack .tc-pane[hidden]{display:none}
.gm-trivia-crack.tc-menu>:not(.tc-pane){display:none}
.gm-trivia-crack.tc-menu .tc-pane{position:relative;inset:auto;background:none;-webkit-backdrop-filter:none;backdrop-filter:none;overflow:visible;flex:1}
.gm-trivia-crack .tc-box{width:100%;max-width:520px;padding:22px 22px 20px;border-radius:22px;background:#fff;color:var(--ink,#1f1d2b);text-align:center;box-shadow:0 12px 0 rgba(20,8,60,.4),0 30px 60px -20px rgba(0,0,0,.6);animation:tcIn .45s var(--spring,ease-out)}
.gm-trivia-crack .tc-kick{display:inline-block;margin:0 0 8px;padding:4px 12px;border-radius:999px;background:#efe9ff;color:#6a2cd0;font:900 11px var(--sans);letter-spacing:.1em;text-transform:uppercase}
.gm-trivia-crack .tc-big{margin:0 0 10px;font:900 clamp(28px,5vw,40px)/1.05 var(--sans);letter-spacing:-.035em}
.gm-trivia-crack .tc-p{margin:0 auto 12px;max-width:34em;font-size:14px;font-weight:600;line-height:1.55;color:#4a4863}
.gm-trivia-crack .tc-sec{margin:14px 0 6px;font:900 11px var(--sans);letter-spacing:.1em;text-transform:uppercase;color:#7b7f95}
.gm-trivia-crack .tc-seg{display:inline-flex;gap:2px;padding:4px;border-radius:999px;background:#eceaf5;flex-wrap:wrap;justify-content:center}
.gm-trivia-crack .tc-seg button{height:32px;padding:0 16px;border:0;border-radius:999px;background:none;font:800 13px var(--sans);color:#6b6785;cursor:pointer;touch-action:manipulation;white-space:nowrap}
.gm-trivia-crack .tc-seg button[aria-pressed="true"]{background:#fff;color:#6a2cd0;box-shadow:0 1px 2px rgba(31,29,43,.08),0 4px 12px -6px rgba(31,29,43,.4)}
.gm-trivia-crack .tc-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px}
.gm-trivia-crack .tc-bb{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:46px;padding:0 22px;border-radius:999px;border:2px solid #6a2cd0;background:#6a2cd0;color:#fff;font:800 15px var(--sans);cursor:pointer;touch-action:manipulation;transition:transform .12s,background .12s}
.gm-trivia-crack .tc-bb:hover{background:#5520b0;border-color:#5520b0;transform:translateY(-2px)}
.gm-trivia-crack .tc-bb.ghost{background:#fff;color:#1f1d2b;border-color:#d4d2e2}
.gm-trivia-crack .tc-bb.ghost:hover{border-color:#8a889b;background:#fff}
.gm-trivia-crack .tc-bb.ora{background:#ff8a1f;border-color:#ff8a1f}
.gm-trivia-crack .tc-bb.ora:hover{background:#e87510;border-color:#e87510}
.gm-trivia-crack .tc-bb.big{height:54px;padding:0 30px;font-size:17px}
.gm-trivia-crack .tc-bb.sm{height:36px;padding:0 14px;font-size:13px}
.gm-trivia-crack .tc-rules{display:grid;gap:6px;margin:6px 0 0;padding:0;list-style:none;text-align:left;font-size:13px;font-weight:600;line-height:1.45;color:#4a4863}
.gm-trivia-crack .tc-rules li{display:flex;gap:8px;align-items:flex-start}
.gm-trivia-crack .tc-rules svg{flex:none;width:18px;height:18px;margin-top:1px;color:#6a2cd0}
.gm-trivia-crack .tc-ovs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0 10px}
.gm-trivia-crack .tc-ovp{padding:10px 8px;border-radius:14px;background:#f3f2f9}
.gm-trivia-crack .tc-ovp.w{background:#fff3cf;box-shadow:0 0 0 2px #ffd166}
.gm-trivia-crack .tc-ovp b{display:block;margin-bottom:4px;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gm-trivia-crack .tc-ovp .tc-crs{justify-content:center}
.gm-trivia-crack .tc-ovp span{display:block;margin-top:4px;font:700 12px var(--sans);color:#6b6785}
.gm-trivia-crack .tc-note{margin:10px 0 0;font-size:12px;font-weight:700;color:#7b7f95}
@media (max-width:640px){
.gm-trivia-crack{gap:8px}
.gm-trivia-crack .tc-top{grid-template-columns:1fr 1fr}
.gm-trivia-crack .tc-vs{grid-column:1/-1;grid-row:1;flex-direction:row;gap:10px;min-width:0}
.gm-trivia-crack .tc-pl,.gm-trivia-crack .tc-pl.r{flex-direction:column;align-items:flex-start;text-align:left;padding:8px}
.gm-trivia-crack .tc-pl.r .tc-crs,.gm-trivia-crack .tc-pl.r .tc-mt{justify-content:flex-start}
.gm-trivia-crack .tc-av{display:none}
.gm-trivia-crack .tc-cr{width:19px;height:19px}
.gm-trivia-crack .tc-crs{gap:2px}
.gm-trivia-crack .tc-pi{min-width:0;max-width:100%}
.gm-trivia-crack .tc-stage{min-height:380px}
.gm-trivia-crack .tc-opts{grid-template-columns:1fr}
.gm-trivia-crack .tc-o{min-height:46px}
.gm-trivia-crack .tc-qb{padding:12px}
.gm-trivia-crack .tc-pg{grid-template-columns:repeat(2,1fr)}
.gm-trivia-crack .tc-pu span{display:none}
.gm-trivia-crack .tc-box{padding:18px 14px 16px}
}
@media (pointer:fine){.gm-trivia-crack .tc-pu kbd{display:inline-block}}`;

  Ameplay.register({
    id: 'trivia-crack',
    title: 'Trivia Crack',
    category: 'Quiz',
    tint: '#6a2cd0',
    blurb: 'Spin the wheel, answer questions in six categories and collect all the character crowns. Land three right answers in a row for a crown spin, challenge your rival to a duel and play bomb, double chance, extra time and skip power-ups. Solo against the CPU or 1v1 online.',
    help: '<kbd>Space</kbd> spin · <kbd>1</kbd>-<kbd>4</kbd> or <kbd>A</kbd>-<kbd>D</kbd> answer · <kbd>Q</kbd> bomb <kbd>W</kbd> double chance <kbd>E</kbd> extra time <kbd>R</kbd> skip',
    better: 'high',
    format: v => v + ' pts',
    width: 940,
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="34" r="22"/><path d="M32 34V12M32 34l19-11M32 34l19 11M32 34L13 45M32 34L13 23"/><path d="M24 6l4 5 4-7 4 7 4-5-1 8H25z" fill="currentColor" stroke="none"/></svg>',
    css: tcCss,
    mount(root, api) {
      const saved = api.load() || {};
      const cfg = { diff: [0, 1, 2].includes(saved.diff) ? saved.diff : 1, target: [3, 4, 6].includes(saved.target) ? saved.target : 6, best: +saved.best || 0 };
      const persist = () => api.save({ diff: cfg.diff, target: cfg.target, best: cfg.best });
      const DN = ['Easy', 'Medium', 'Hard'];
      root.innerHTML = `<div class="tc-top"><div class="tc-pl"></div><div class="tc-vs"><b class="tc-turn"></b><small class="tc-goal"></small></div><div class="tc-pl r"></div></div>
<div class="tc-stage"><div class="tc-wheel" hidden><div class="tc-wcv"><button type="button" class="tc-spin" aria-label="Spin the wheel">SPIN</button></div><p class="tc-say"></p></div><div class="tc-pick" hidden></div><div class="tc-q" hidden></div><div class="tc-cl" hidden></div></div>
<div class="tc-bar"><span class="tc-hint">Spin, answer, collect crowns</span><button type="button" class="tc-btn tc-quit">Quit match</button></div>
<div class="tc-net" hidden>Online</div><div class="tc-hold" hidden>Opponent reconnecting...</div>
<div class="tc-pane" hidden></div>`;
      const $ = s => root.querySelector(s);
      const plEls = [...root.querySelectorAll('.tc-pl')], turnEl = $('.tc-turn'), goalEl = $('.tc-goal'), wheelBox = $('.tc-wheel'), wcv = $('.tc-wcv'), spinBtn = $('.tc-spin'), sayEl = $('.tc-say');
      const pickBox = $('.tc-pick'), qBox = $('.tc-q'), celBox = $('.tc-cl'), pane = $('.tc-pane'), netEl = $('.tc-net'), holdEl = $('.tc-hold'), hintEl = $('.tc-hint');
      const wc = api.canvas(400, 420, wcv);
      wcv.prepend(wc.canvas);
      const wg = wc.ctx;
      const icP = TC.map(c => new Path2D(c.ic)), crP = new Path2D(TC_CROWN);
      let G = null, V = null, mode = 'solo', role = 'local', tok = 0, hooked = false, lastSeq = -1, lastStep = 0, lastEv = 0, lastGain = 0, rtAt = 0, paneFn = null, overShown = false, lastSec = -1, lastQkey = '';
      const W = { a: -Math.PI / 2, a0: 0, a1: 0, n: 0, t0: 0, idx: -99, flick: 0 };
      const SK = 'gameplay:tcsave';
      const guest = () => role === 'guest';

      const showPane = (html, fn) => { pane.innerHTML = html; pane.hidden = false; root.classList.toggle('tc-menu', !V); paneFn = fn || null; pane.scrollTop = 0; };
      const hidePane = () => { pane.hidden = true; root.classList.remove('tc-menu'); paneFn = null; pane.innerHTML = ''; };
      tap(pane, '[data-a]', b => { if (paneFn) paneFn(b.dataset.a, b); });

      const send = a => {
        if (!V) return;
        if (guest()) api.net.send({ t: 'a', a });
        else if (G) { act(G, 0, a); flush(); }
      };
      const tmNow = now => guest() || !G ? (V.hold ? V.tm : V.tm - (now - rtAt)) : G.tm;
      const fmt = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

      const plHtml = (si, k) => {
        const s = V.S[si], mine = si === V.you, on = V.turn === si;
        const pips = [0, 1, 2].map(i => `<i class="tc-pip${on && V.cn || i < s.st % 3 ? ' on' : ''}"></i>`).join('');
        const pus = TC_PU.map((p, i) => `<span class="tc-pc${s.pu[i] ? '' : ' z'}" title="${p.n}"><svg viewBox="0 0 24 24" fill="none">${p.svg}</svg>${s.pu[i]}</span>`).join('');
        return `<div class="tc-av" style="background:${mine ? '#7c4dff' : '#ff8a3d'}">${esc((s.n.trim()[0] || '?').toUpperCase())}</div><div class="tc-pi"><b>${esc(s.n)}${mine ? ' (you)' : ''}</b><div class="tc-crs">${TC.map((c, i) => `<i class="tc-cr ${s.cr[i] ? 'on' : 'off'}" title="${c.who} - ${c.n}">${chrSvg(i)}</i>`).join('')}</div><div class="tc-mt"><span class="tc-pips" title="Right answers in a row">${pips}</span>${on && V.cn ? '<span class="tc-cn">Crown spin!</span>' : ''}${pus}</div></div>`;
      };

      const optHtml = () => {
        const q = V.q, c = TC[q.c], rev = q.rev >= 0, duel = V.ph === 'duel' || V.ph === 'drev', mine = V.turn === V.you;
        const myAns = duel ? V.da[V.you] : null;
        return q.o.map((t, i) => {
          let cl = 'tc-o', tags = '';
          const gone = q.rm.includes(i), tried = q.tr.includes(i);
          if (gone) cl += ' gone';
          if (tried) cl += ' tried';
          if (rev) { cl += i === q.a ? ' ok' : (!duel && i === q.pk) || (duel && V.da.includes(i)) ? ' bad' : ' dim'; }
          else if (duel && myAns === i) cl += ' mine';
          if (duel && rev) V.da.forEach((x, s) => { if (x === i) tags += `<em>${s === V.you ? 'You' : 'Opp'}</em>`; });
          const dis = gone || tried || rev || (duel ? myAns !== null : !mine);
          return `<button type="button" class="${cl}" data-i="${i}" style="--c:${c.col}"${dis ? ' disabled' : ''}><kbd>${'ABCD'[i]}</kbd><span>${esc(t)}</span>${tags}</button>`;
        }).join('');
      };

      function qHtml() {
        const q = V.q, c = TC[q.c], rev = q.rev >= 0, duel = V.ph === 'duel' || V.ph === 'drev', mine = V.turn === V.you, me = V.S[V.you], op = V.S[1 - V.you];
        let tag = q.m === 'c' ? 'Crown question' : 'Question';
        let top = '';
        if (duel) {
          const d = V.du, cur = V.ph === 'drev' ? d.n : d.n + 1;
          tag = 'Duel - round ' + cur;
          top = `<div class="tc-ds"><b>${esc(me.n)}</b><span>${d.sc[V.you]} - ${d.sc[1 - V.you]}</span><b>${esc(op.n)}</b></div>`;
        }
        let foot;
        if (rev && !duel) foot = `<span class="tc-res ${q.ok ? 'ok' : 'bad'}">${q.ok ? 'Correct!' : q.pk < 0 ? 'Time is up!' : 'Not quite'}</span>`;
        else if (rev) foot = `<span class="tc-res ${V.da[V.you] === q.a ? 'ok' : 'bad'}">${V.da[V.you] === q.a ? 'You got it!' : V.da[V.you] < 0 ? 'Too slow' : 'Missed it'}</span>`;
        else if (duel) foot = `<span class="tc-wait">${V.da[V.you] !== null ? 'Answer locked. Waiting for ' + esc(op.n) + '...' : 'Both players answer the same question. Be fast and right.'}</span>`;
        else if (mine) foot = TC_PU.map((p, i) => `<button type="button" class="tc-pu${q.pp && q.pp.includes(i) || (i === 1 && q.dbl) ? ' armed' : ''}" data-k="${i}" style="--c:${c.col}" title="${p.d}"${!me.pu[i] || (q.pp && q.pp.includes(i)) || (i === 0 && q.rm.length) || (i === 1 && q.dbl) ? ' disabled' : ''}><svg viewBox="0 0 24 24" fill="none">${p.svg}</svg><span>${p.n}</span><b>${me.pu[i]}</b><kbd>${p.k.toUpperCase()}</kbd></button>`).join('');
        else foot = `<span class="tc-wait">${esc(op.n)} is thinking...</span>`;
        return `<div class="tc-qh" style="background:${c.col}">${svgI(c.ic)}<b>${c.n}</b><span class="tc-tag">${tag}</span><span class="tc-tm"></span></div><div class="tc-tb" style="--c:${c.col}"><i></i></div><div class="tc-qb">${top}<p class="tc-qt">${esc(q.t)}</p><div class="tc-opts">${optHtml()}</div><div class="tc-qf">${foot}</div></div>`;
      }

      function pickHtml() {
        const me = V.S[V.you], op = V.S[1 - V.you], mine = V.turn === V.you;
        return `<p class="tc-ph">${mine ? 'Crown slice! Pick a character to win' : esc(V.S[V.turn].n) + ' landed on the crown slice'}</p><div class="tc-pg">${TC.map((c, i) => {
          const own = me.cr[i], opp = op.cr[i];
          let acts = '';
          if (own) acts = '<span class="tc-pbd">You hold it</span>';
          else if (mine) acts = `<button type="button" class="tc-pb" data-c="${i}">Win the crown</button>${opp ? `<button type="button" class="tc-pb duel" data-c="${i}" data-d="1">Challenge to a duel</button>` : ''}`;
          else if (opp) acts = '<span class="tc-pbd">Rival holds it</span>';
          return `<div class="tc-pt${own ? ' own' : ''}" style="--c:${c.col}"><i class="tc-pa">${chrSvg(i)}</i><b>${c.who}</b><small>${c.n}</small>${acts}</div>`;
        }).join('')}</div>`;
      }

      function celHtml() {
        const c = V.cel, ch = TC[c.c], nm = c.s === V.you ? 'You' : esc(V.S[c.s].n), loser = esc(V.S[1 - c.s].n);
        const mineC = c.s === V.you;
        if (c.k === 'def') return `<span class="big">${chrSvg(c.c)}</span><h3>${nm === 'You' ? 'You defended' : nm + ' defended'} ${ch.who}!</h3><p>${ch.n} crown stays put. The challenger loses the turn.</p>`;
        return `<span class="big">${chrSvg(c.c)}</span><h3>${mineC ? 'You won' : nm + ' won'} ${ch.who}!</h3><p>${c.k === 'steal' ? (mineC ? 'You stole the ' + ch.n + ' crown from ' + loser + '.' : 'The ' + ch.n + ' crown was stolen from you.') : 'The ' + ch.n + ' crown is ' + (mineC ? 'yours.' : 'theirs.')}</p>`;
      }

      function render() {
        if (!V) return;
        const ph = V.ph, mine = V.turn === V.you;
        plEls[0].innerHTML = plHtml(V.you); plEls[1].innerHTML = plHtml(1 - V.you);
        plEls[0].classList.toggle('on', V.turn === V.you && ph !== 'over'); plEls[1].classList.toggle('on', V.turn !== V.you && ph !== 'over');
        turnEl.textContent = ph === 'over' ? 'Game over' : ph === 'duel' || ph === 'drev' ? 'Duel!' : mine ? 'Your turn' : V.S[V.turn].n + "'s turn";
        goalEl.textContent = 'First to ' + V.cfg.target + ' crowns';
        holdEl.hidden = !V.hold;
        const wv = ph === 'spin' || ph === 'spinning';
        wheelBox.hidden = !wv; pickBox.hidden = ph !== 'crown';
        const qv = ph === 'ask' || ph === 'rev' || ph === 'duel' || ph === 'drev';
        qBox.hidden = !qv; celBox.hidden = ph !== 'cel';
        if (wv) {
          spinBtn.disabled = !(ph === 'spin' && mine);
          spinBtn.classList.toggle('pulse', ph === 'spin' && mine);
          spinBtn.style.visibility = ph === 'spinning' ? 'hidden' : '';
          const nm = V.S[V.turn].n;
          sayEl.textContent = ph === 'spin' ? (mine ? (V.cn ? 'Crown spin! Spin to land on the crown' : 'Your turn - spin the wheel!') : nm + ' is about to spin...') : '';
        }
        if (ph === 'crown') pickBox.innerHTML = pickHtml();
        if (qv) { qBox.innerHTML = qHtml(); lastSec = -1; }
        if (ph === 'cel') { celBox.className = 'tc-cl' + (V.cel.k === 'def' ? ' def' : ''); celBox.style.setProperty('--c', TC[V.cel.c].col); celBox.innerHTML = celHtml(); }
        hintEl.textContent = hintFor();
        if (ph === 'over' && !overShown) { overShown = true; showOver(); }
      }
      const hintFor = () => {
        const ph = V.ph, mine = V.turn === V.you;
        if (ph === 'spin') return mine ? 'Press Space or tap SPIN' : 'Waiting for the other player';
        if (ph === 'ask') return mine ? 'Answer with 1-4 or A-D. Use a power-up if you are stuck' : 'Waiting for the answer';
        if (ph === 'crown') return mine ? 'Win a crown, or challenge your rival for one they hold' : 'Waiting for the pick';
        return 'Three right in a row earns a crown spin';
      };

      function showOver() {
        try { sessionStorage.removeItem(SK); } catch (e) {}
        const w = V.win, you = w === V.you, S = V.S;
        let pts = 0, nb = false;
        if (mode === 'solo') {
          pts = S[V.you].r * 10 + S[V.you].cr.reduce((a, b) => a + b, 0) * 50 + (you ? 200 + V.cfg.diff * 100 : 0);
          api.score(pts);
          if (pts > cfg.best) { cfg.best = pts; persist(); nb = true; }
          api.submit(pts);
        }
        if (you) { fanfare(api); confetti(root, api); } else sadTone(api);
        const card = si => { const s = S[si], tot = s.r + s.w; return `<div class="tc-ovp${w === si ? ' w' : ''}"><b>${esc(s.n)}${si === V.you ? ' (you)' : ''}</b><div class="tc-crs">${TC.map((c, i) => `<i class="tc-cr ${s.cr[i] ? 'on' : 'off'}">${chrSvg(i)}</i>`).join('')}</div><span>${s.cr.reduce((a, b) => a + b, 0)} crowns - ${s.r}/${tot} right</span></div>`; };
        let btns;
        if (mode === 'solo') btns = '<button class="tc-bb ora" data-a="again">Play again</button><button class="tc-bb ghost" data-a="menu">Menu</button>';
        else if (role === 'host') btns = '<button class="tc-bb ora" data-a="rematch">Rematch</button><button class="tc-bb ghost" data-a="leave">Leave</button>';
        else btns = '<button class="tc-bb ghost" data-a="leave">Leave</button>';
        showPane(`<div class="tc-box"><p class="tc-kick">${mode === 'solo' ? 'vs CPU ' + DN[V.cfg.diff] : 'Online 1v1'}${nb ? ' - New best!' : ''}</p><h3 class="tc-big">${you ? 'You win!' : esc(S[w].n) + ' wins'}</h3><p class="tc-p">${you ? 'All those crowns look great on you.' : 'So close. One more match?'}</p><div class="tc-ovs">${card(V.you)}${card(1 - V.you)}</div>${mode === 'solo' ? `<p class="tc-note">${pts} points - your best ${cfg.best}</p>` : ''}<div class="tc-btns">${btns}</div>${mode !== 'solo' && role === 'guest' ? '<p class="tc-note">Waiting for the host to start a rematch...</p>' : ''}</div>`, a => {
          if (a === 'again') startSolo();
          else if (a === 'menu') { quit(); showMenu(); }
          else if (a === 'rematch') startOnline();
          else if (a === 'leave') leaveOnline();
        });
      }

      function evs() {
        const e = V.ev;
        if (V.gain && V.gain.id !== lastGain) { if (V.gain.s === V.you) api.toast('+1 ' + TC_PU[V.gain.k].n); lastGain = V.gain.id; }
        if (!e || e.id === lastEv) return;
        lastEv = e.id;
        const mineE = e.s === V.you;
        if (e.k === 'right') { [523, 659, 784].forEach((f, i) => tone(api, f, .16, 'triangle', .06, 0, i * .07)); }
        else if (e.k === 'wrong') { tone(api, 196, .35, 'sawtooth', .05, 140); }
        else if (e.k === 'drev') { const ok = V.da[V.you] === V.q.a; if (ok) [523, 659, 784].forEach((f, i) => tone(api, f, .16, 'triangle', .06, 0, i * .07)); else tone(api, 196, .35, 'sawtooth', .05, 140); }
        else if (e.k === 'crown') { fanfare(api); if (mineE) confetti(root, api, 90); }
        else if (e.k === 'def') { tone(api, 330, .25, 'triangle', .06); tone(api, 494, .3, 'triangle', .06, 0, .12); }
        else if (e.k === 'streak') { [659, 880, 1175].forEach((f, i) => tone(api, f, .18, 'triangle', .06, 0, i * .08)); if (mineE) api.toast('Three in a row! Crown spin next'); }
        else if (e.k === 'pu' || e.k === 'dbl') tone(api, 880, .12, 'square', .035, 1320);
        else if (e.k === 'landc') [784, 988, 1319].forEach((f, i) => tone(api, f, .2, 'triangle', .06, 0, i * .09));
        else if (e.k === 'turn') tone(api, 392, .12, 'sine', .04);
        else if (e.k === 'spin') tone(api, 200, .4, 'sine', .04, 600);
      }

      function gotView() {
        if (V.ph !== 'over') overShown = false;
        if (mode === 'solo' && V.S) api.score(V.S[V.you].r * 10 + V.S[V.you].cr.reduce((a, b) => a + b, 0) * 50);
        if (!pane.hidden && paneFn === waitFn && V.ph !== 'over') hidePane();
        evs();
        render();
      }
      const waitFn = a => { if (a === 'leave') leaveOnline(); };

      function flush() {
        if (!G || G.seq === lastSeq) return;
        lastSeq = G.seq;
        V = mkView(G, 0); rtAt = performance.now();
        if (mode === 'online' && role === 'host') { api.net.send({ t: 's', v: mkView(G, 1) }); saveHost(); }
        gotView();
      }
      function saveHost() {
        try { if (G && G.ph !== 'over') sessionStorage.setItem(SK, JSON.stringify({ code: api.net.code, at: Date.now(), G })); } catch (e) {}
      }

      function newGameUI() { V = null; lastSeq = -1; lastEv = 0; lastGain = 0; overShown = false; W.n = 0; hidePane(); }
      function quit() { G = null; V = null; lastSeq = -1; qBox.hidden = true; celBox.hidden = true; pickBox.hidden = true; wheelBox.hidden = true; plEls.forEach(p => { p.innerHTML = ''; }); }

      function startSolo() {
        tok++; mode = 'solo'; role = 'local';
        newGameUI(); netEl.hidden = true;
        G = mkGame({ names: [myName(), 'CPU ' + DN[cfg.diff]], bots: [false, true], target: cfg.target, diff: cfg.diff });
        lastStep = performance.now();
        api.score(0);
        flush();
      }

      function showMenu() {
        quit(); mode = 'solo'; role = 'local'; netEl.hidden = true; holdEl.hidden = true;
        const seg = (k, items, cur) => `<div class="tc-seg">${items.map(([v, t]) => `<button type="button" data-a="${k}" data-v="${v}" aria-pressed="${cur === v}">${t}</button>`).join('')}</div>`;
        showPane(`<div class="tc-box"><p class="tc-kick">Quiz showdown</p><h3 class="tc-big">Trivia Crack</h3>
<ul class="tc-rules"><li>${svgI(TC_CROWN)}<span>Spin the wheel and answer a question from the category it lands on. Keep going while you are right.</span></li><li>${svgI(TC[4].ic)}<span>Three right in a row gives a crown spin. On the crown slice you pick a character to win, or challenge a rival to a duel for one they hold.</span></li><li>${svgI(TC[1].ic)}<span>Bomb, double chance, extra time and skip power-ups help on tough questions.</span></li></ul>
<p class="tc-sec">CPU level</p>${seg('diff', [[0, 'Easy'], [1, 'Medium'], [2, 'Hard']], cfg.diff)}
<p class="tc-sec">Crowns to win</p>${seg('target', [[3, '3'], [4, '4'], [6, 'All 6']], cfg.target)}
<div class="tc-btns"><button class="tc-bb ora big" data-a="go">Play vs CPU</button></div><div class="tc-btns"><button class="tc-bb ghost" data-a="online">Play online (1v1)</button></div><p class="tc-note">${cfg.best ? 'Best score ' + cfg.best + ' pts · ' : ''}${TCQ.reduce((a, b) => a + b.length, 0)} questions</p></div>`, (a, b) => {
          if (a === 'go') { startSolo(); }
          else if (a === 'online') startOnline();
          else { cfg[a] = +b.dataset.v; persist(); showMenu(); }
        });
      }

      tap(root.querySelector('.tc-bar'), '.tc-quit', () => { if (mode === 'online') leaveOnline(); else { quit(); showMenu(); } });
      tap(spinBtn.parentElement, '.tc-spin', () => { if (V && V.ph === 'spin' && V.turn === V.you) send({ t: 'spin' }); }, false);
      tap(qBox, '.tc-o', b => { if (V && V.q) send({ t: 'ans', i: +b.dataset.i }); });
      tap(qBox, '.tc-pu', b => { if (V && V.ph === 'ask') send({ t: 'pu', k: +b.dataset.k }); });
      tap(pickBox, '.tc-pb', b => { if (V && V.ph === 'crown' && V.turn === V.you) send({ t: 'pick', c: +b.dataset.c, d: !!b.dataset.d }); });
      api.on(window, 'keydown', e => {
        if (!V || !pane.hidden || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
        const k = (e.key || '').toLowerCase(), mine = V.turn === V.you;
        if ((k === ' ' || k === 'enter') && V.ph === 'spin' && mine) { e.preventDefault(); send({ t: 'spin' }); return; }
        if (V.ph === 'ask' || V.ph === 'duel') {
          const i = '1234'.includes(k) && k ? +k - 1 : 'abcd'.includes(k) && k ? 'abcd'.indexOf(k) : -1;
          if (k.length === 1 && i >= 0) { e.preventDefault(); send({ t: 'ans', i }); return; }
          const p = TC_PU.findIndex(x => x.k === k);
          if (p >= 0 && V.ph === 'ask' && mine) { e.preventDefault(); send({ t: 'pu', k: p }); }
        }
      });

      function drawWheel(now) {
        const g = wg, cx = 200, cy = 212, R = 168, t = now / 1000;
        g.clearRect(0, 0, 400, 420);
        g.save();
        g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
        g.fillStyle = '#2a1170'; g.beginPath(); g.arc(cx, cy, R + 20, 0, TAU); g.fill();
        g.restore();
        const g1 = g.createLinearGradient(0, cy - R, 0, cy + R); g1.addColorStop(0, '#5a2fd0'); g1.addColorStop(1, '#2a1170');
        g.fillStyle = g1; g.beginPath(); g.arc(cx, cy, R + 20, 0, TAU); g.fill();
        g.lineWidth = 3; g.strokeStyle = '#ffd166'; g.beginPath(); g.arc(cx, cy, R + 20, 0, TAU); g.stroke();
        const lit = V && V.ph === 'spinning' ? t * 14 : t * 2;
        for (let i = 0; i < 21; i++) {
          const a = i / 21 * TAU, on = (Math.floor(lit) + i) % 2 === 0;
          g.fillStyle = on ? '#fff3b0' : '#ffb020'; g.globalAlpha = on ? 1 : .55;
          g.beginPath(); g.arc(cx + Math.cos(a) * (R + 10), cy + Math.sin(a) * (R + 10), 3.2, 0, TAU); g.fill();
        }
        g.globalAlpha = 1;
        const landed = V && V.ph === 'spinning' && V.sp && (now - W.t0) >= SPIN_MS, hl = landed ? V.sp.sl : -1;
        for (let i = 0; i < 7; i++) {
          const a0 = W.a + i * SLICE;
          g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a0, a0 + SLICE); g.closePath();
          g.fillStyle = i < 6 ? TC[i].col : '#7c3aed'; g.fill();
          g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke();
          g.save(); g.translate(cx, cy); g.rotate(a0 + SLICE / 2); g.translate(R * .66, 0); g.rotate(Math.PI / 2);
          const sz = 50; g.translate(-sz / 2, -sz / 2); g.scale(sz / 24, sz / 24);
          g.fillStyle = i < 6 ? '#fff' : '#ffd166';
          g.fill(i < 6 ? icP[i] : crP, 'evenodd');
          g.restore();
          if (hl >= 0) {
            g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a0, a0 + SLICE); g.closePath();
            g.fillStyle = i === hl ? 'rgba(255,255,255,' + (.18 + .14 * Math.sin(t * 12)) + ')' : 'rgba(20,6,60,.45)'; g.fill();
          }
        }
        const rg = g.createRadialGradient(cx, cy, R * .1, cx, cy, R); rg.addColorStop(0, 'rgba(255,255,255,.28)'); rg.addColorStop(.7, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(0,0,0,.18)');
        g.fillStyle = rg; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, R * .27, 0, TAU); g.fill();
        g.save(); g.translate(cx, cy - R - 22); g.rotate(W.flick * -.5);
        g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 6; g.shadowOffsetY = 3;
        g.fillStyle = '#ffd166'; g.strokeStyle = '#7a4a00'; g.lineWidth = 2.5;
        g.beginPath(); g.moveTo(-15, -10); g.lineTo(15, -10); g.lineTo(0, 30); g.closePath(); g.fill(); g.stroke();
        g.restore();
      }

      function wheelStep(now) {
        if (!V || !V.sp) return;
        const sp = V.sp, target = -Math.PI / 2 - (sp.sl + .5 + sp.j) * SLICE;
        if (W.n !== sp.n) {
          W.n = sp.n; W.a0 = ((W.a % TAU) + TAU) % TAU;
          W.a1 = W.a0 + 5 * TAU + ((((target - W.a0) % TAU) + TAU) % TAU);
          const el = V.ph === 'spinning' ? SPIN_MS + LAND_MS - tmNow(now) : SPIN_MS + LAND_MS;
          W.t0 = now - el;
        }
        if (V.ph === 'spinning') {
          const x = clamp((now - W.t0) / SPIN_MS, 0, 1);
          W.a = W.a0 + (W.a1 - W.a0) * (1 - Math.pow(1 - x, 3.8));
        } else W.a = W.a1;
        const idx = Math.floor((-Math.PI / 2 - W.a) / SLICE);
        if (idx !== W.idx) { if (W.idx !== -99 && V.ph === 'spinning') { W.flick = 1; tone(api, 700 + rnd(80), .04, 'square', .02); } W.idx = idx; }
        W.flick = Math.max(0, W.flick - .09);
      }

      function uiFrame(now) {
        if (!V) return;
        if (V.ph === 'spin' || V.ph === 'spinning') { wheelStep(now); drawWheel(now); }
        if (V.ph === 'ask' || V.ph === 'duel') {
          const left = tmNow(now), tmEl = qBox.querySelector('.tc-tm'), bar = qBox.querySelector('.tc-tb i');
          if (tmEl) {
            tmEl.textContent = fmt(left); tmEl.classList.toggle('low', left < 5000);
            bar.style.transform = 'scaleX(' + clamp(left / Math.max(1, V.tmax), 0, 1).toFixed(4) + ')'; bar.classList.toggle('low', left < 5000);
            const sec = Math.ceil(left / 1000);
            if (sec !== lastSec) { lastSec = sec; if (sec <= 5 && sec > 0 && (V.ph === 'duel' || V.turn === V.you)) tone(api, 880, .06, 'square', .03); }
          }
        }
      }

      function step() {
        if (!G || (mode !== 'solo' && role !== 'host')) return;
        const now = performance.now(), d = Math.min(now - lastStep, mode === 'solo' ? 100 : 1500);
        lastStep = now;
        tick(G, d); flush();
      }
      api.loop(() => { step(); if (V) uiFrame(performance.now()); });

      function onData(d) {
        if (!d || !d.t || !api.alive || mode !== 'online') return;
        if (api.net.role === 'host') {
          if (d.t === 'a' && G && role === 'host') { act(G, 1, d.a); flush(); }
          return;
        }
        if (d.t === 's' && d.v && d.v.S) { role = 'guest'; V = d.v; rtAt = performance.now(); gotView(); }
      }
      function hookNet() {
        if (hooked) return;
        hooked = true;
        api.net.on('data', onData);
        api.net.on('leave', () => {
          if (mode !== 'online' || role !== 'host' || !G || G.ph === 'over') return;
          G.hold = true; bump(G); flush();
          showPane(`<div class="tc-box"><p class="tc-kick">Online</p><h3 class="tc-big">Opponent left</h3><p class="tc-p">Your rival left the match. Carry on against the CPU from the same position, or go back to the lobby.</p><div class="tc-btns"><button class="tc-bb ora" data-a="cpu">Continue vs CPU</button><button class="tc-bb ghost" data-a="lobby">Back to lobby</button></div></div>`, a => {
            if (a === 'cpu') {
              G.S[1].bot = true; G.S[1].n = 'CPU ' + DN[cfg.diff]; G.hold = false; bump(G);
              try { sessionStorage.removeItem(SK); } catch (e) {}
              api.net.close(); mode = 'solo'; role = 'local'; netEl.hidden = true; lastStep = performance.now(); hidePane(); flush();
            } else startOnline();
          });
        });
        api.net.on('rejoin', () => {
          if (mode !== 'online' || role !== 'host' || !G) return;
          if (paneFn && pane.innerHTML.includes('Opponent left')) hidePane();
          G.hold = false; bump(G); lastSeq = -1; flush();
        });
        api.net.on('lobby', () => { if (mode === 'online' && role === 'guest') startOnline(); });
        api.net.on('close', reason => {
          if (mode !== 'online' || role === 'local') return;
          tok++; role = 'local'; sadTone(api);
          const h = reason === 'kicked' ? 'You were removed' : reason === 'host-left' ? 'The host left' : 'Connection lost';
          const t = reason === 'kicked' ? 'The host removed you from the party.' : reason === 'host-left' ? 'The host ended the party.' : 'The connection to the host was lost.';
          showPane(`<div class="tc-box"><p class="tc-kick">Online</p><h3 class="tc-big">${h}</h3><p class="tc-p">${t}</p><div class="tc-btns"><button class="tc-bb" data-a="room">Online lobby</button><button class="tc-bb ghost" data-a="solo">Menu</button></div></div>`, a => {
            if (a === 'room') startOnline(); else { api.net.close(); quit(); mode = 'solo'; showMenu(); }
          });
        });
        api.interval(() => {
          if (mode !== 'online') return;
          const on = api.net.connected;
          netEl.hidden = false; netEl.classList.toggle('bad', !on);
          netEl.textContent = !on ? 'Reconnecting...' : role === 'host' ? 'Online - hosting' : 'Online' + (api.net.rtt ? ' - ' + api.net.rtt + ' ms' : '');
          if (role === 'host' && G) {
            const g = api.net.players.find(p => !p.host), h = !!(g && g.away);
            if (h !== G.hold && G.ph !== 'over') { G.hold = h; bump(G); }
            step();
          }
        }, 300);
      }
      function leaveOnline() {
        try { sessionStorage.removeItem(SK); } catch (e) {}
        tok++; mode = 'solo'; role = 'local';
        api.net.close(); quit(); showMenu();
      }

      async function startOnline() {
        tok++; const my = tok;
        hookNet();
        quit(); hidePane();
        mode = 'online'; role = null; netEl.hidden = true;
        const r = await api.net.room({ title: 'Trivia Crack', sizes: [2], defaultSize: 2, min: 2, max: 2, bots: false });
        if (!api.alive || my !== tok) return;
        if (!r) { mode = 'solo'; role = 'local'; return showMenu(); }
        role = r.role;
        if (r.role === 'host') {
          let sv = null;
          try { const x = JSON.parse(sessionStorage.getItem(SK) || 'null'); if (x && x.code === api.net.code && Date.now() - x.at < 432e5 && x.G && x.G.S) sv = x; } catch (e) {}
          const names = [r.players[0].name, r.players[1] ? r.players[1].name : 'Player 2'];
          const begin = resume => {
            newGameUI(); lastStep = performance.now();
            if (resume) { G = sv.G; G.S[0].n = names[0]; G.S[1].n = names[1]; G.S[1].bot = false; G.hold = false; bump(G); }
            else G = mkGame({ names, bots: [false, false], target: cfg.target, diff: cfg.diff });
            lastSeq = -1; flush();
          };
          if (sv) {
            showPane(`<div class="tc-box"><p class="tc-kick">Online</p><h3 class="tc-big">Match saved</h3><p class="tc-p">Your last online match is still here. Resume it where you stopped, or start a new one.</p><div class="tc-btns"><button class="tc-bb ora big" data-a="resume">Resume game</button><button class="tc-bb ghost" data-a="new">New match</button></div></div>`, a => { hidePane(); begin(a === 'resume'); });
          } else begin(false);
        } else {
          newGameUI();
          showPane('<div class="tc-box"><p class="tc-kick">Online</p><h3 class="tc-big">Connected!</h3><p class="tc-p">The match starts in a moment. Get ready to spin.</p><div class="tc-btns"><button class="tc-bb ghost sm" data-a="leave">Leave</button></div></div>', waitFn);
        }
      }

      root._tc = { get G() { return G; }, get V() { return V; }, cfg, act: (s, a) => { if (G) { act(G, s, a); flush(); } }, tick: d => { if (G) { tick(G, d); flush(); } }, startSolo };
      if (api.net.invite) startOnline(); else showMenu();
    }
  });

  Ameplay.covers['trivia-crack'] = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="tcc-g" cx=".5" cy="0" r="1.1"><stop offset="0" stop-color="#7a3df0"/><stop offset=".6" stop-color="#4a1fb5"/><stop offset="1" stop-color="#2a1170"/></radialGradient></defs><rect width="400" height="300" fill="url(#tcc-g)"/><g transform="translate(200 160)"><circle r="108" fill="#2a1170" stroke="#ffd166" stroke-width="4"/><g stroke="#fff" stroke-width="4"><path d="M0 0L-0 -92A92 92 0 0 1 72 -57z" fill="#f97316"/><path d="M0 0L72 -57A92 92 0 0 1 90 20z" fill="#22c55e"/><path d="M0 0L90 20A92 92 0 0 1 40 83z" fill="#ef4444"/><path d="M0 0L40 83A92 92 0 0 1 -40 83z" fill="#ec4899"/><path d="M0 0L-40 83A92 92 0 0 1 -90 20z" fill="#3b82f6"/><path d="M0 0L-90 20A92 92 0 0 1 -72 -57z" fill="#eab308"/><path d="M0 0L-72 -57A92 92 0 0 1 0 -92z" fill="#7c3aed"/></g><circle r="26" fill="#fff"/><path d="M-14 8l-3-18 10 8 7-14 7 14 10-8-3 18z" fill="#ffb020"/><path d="M-14 -128l14 36 14-36z" fill="#ffd166" stroke="#7a4a00" stroke-width="4"/></g></svg>`;
})();
