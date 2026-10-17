
(() => {
  'use strict';
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const HUES = ['#ff5d73', '#ffbe0b', '#3a86ff', '#26b37a', '#a855f7', '#ff8a3d', '#4cc9f0'];

  const tap = (el, sel, fn) => {
    el.addEventListener('pointerdown', e => { if (e.button) return; const b = e.target.closest(sel); if (b && !b.disabled && el.contains(b)) { e.preventDefault(); fn(b, e); } });
    el.addEventListener('click', e => { if (e.detail) return; const b = e.target.closest(sel); if (b && !b.disabled && el.contains(b)) fn(b, e); });
  };
  function segBar(groups, sel, onPick) {
    const bar = document.createElement('div');
    bar.className = 'seg-bar';
    bar.innerHTML = groups.map(([k, items]) => `<div class="seg" role="group">${items.map(([v, t]) => `<button type="button" tabindex="-1" data-k="${k}" data-v="${v}">${t}</button>`).join('')}</div>`).join('');
    const sync = () => bar.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(sel[b.dataset.k] === b.dataset.v)));
    tap(bar, 'button', b => { if (sel[b.dataset.k] === b.dataset.v) return; sel[b.dataset.k] = b.dataset.v; sync(); onPick(b.dataset.k); });
    sync();
    return bar;
  }
  const kitCss = id => `
.gm-${id} .seg-bar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.gm-${id} .seg{display:inline-flex;flex-wrap:wrap;justify-content:center;gap:2px;padding:4px;border-radius:999px;background:var(--sunk)}
.gm-${id} .seg button{height:34px;padding:0 15px;border:0;border-radius:999px;background:none;font:800 13.5px/1 var(--sans);color:var(--muted);cursor:pointer;white-space:nowrap;touch-action:manipulation}
.gm-${id} .seg button:hover{color:var(--ink)}
.gm-${id} .seg button[aria-pressed="true"]{background:#fff;color:var(--accent);box-shadow:0 1px 2px rgba(31,29,43,.08),0 4px 12px -6px rgba(108,92,231,.55)}
.gm-${id} .mn{display:flex;flex-direction:column;align-items:center;gap:14px;width:min(580px,100%);margin:auto;padding:26px clamp(16px,3vw,28px);border-radius:24px;background:#fff;box-shadow:0 22px 44px -26px rgba(31,29,43,.55);text-align:center}
.gm-${id} .mn[hidden],.gm-${id} .gm-play[hidden]{display:none}
.gm-${id} .mn-k{margin:0;padding:5px 12px;border-radius:999px;background:var(--accent-soft);font-size:11.5px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:var(--accent)}
.gm-${id} .mn-t{margin:0;font:900 clamp(34px,5vw,46px)/1 var(--sans);letter-spacing:-.035em;color:var(--ink)}
.gm-${id} .mn-p{margin:0;max-width:30em;font-size:14.5px;font-weight:600;line-height:1.55;color:var(--ink-2)}
.gm-${id} .mn-b{margin:0;font-size:13px;font-weight:800;color:var(--muted)}
.gm-${id} .mn .g-btn{min-width:160px;height:52px;font-size:17px}
.gm-${id} .gm-fx{position:absolute;left:0;top:0;z-index:30;pointer-events:none}
.gm-${id} .gm-pop{position:absolute;z-index:6;pointer-events:none;font:900 26px/1 var(--sans);color:#fff;white-space:nowrap;-webkit-text-stroke:5px rgba(31,29,43,.25);paint-order:stroke fill;animation:gmQzPop .9s var(--ease) forwards}
@media (pointer:coarse){.gm-${id} .seg button{min-height:40px}}
@media (max-width:560px){.gm-${id} .mn{gap:10px;padding:18px 14px}}
@keyframes gmQzPop{0%{opacity:0;transform:translate(-50%,-20%) scale(.6)}15%{opacity:1;transform:translate(-50%,-60%) scale(1.1)}60%{opacity:1}100%{opacity:0;transform:translate(-50%,-200%) scale(1)}}`;

  function confetti(root, api, n = 150) {
    const w = root.clientWidth, h = Math.max(root.clientHeight, 320), dpr = Math.min(window.devicePixelRatio || 1, 2);
    const c = document.createElement('canvas');
    c.className = 'gm-fx'; c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    c.style.width = w + 'px'; c.style.height = h + 'px';
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
  const popText = (root, el, txt) => {
    const r = el.getBoundingClientRect(), o = root.getBoundingClientRect(), s = document.createElement('span');
    s.className = 'gm-pop'; s.textContent = txt;
    s.style.left = (r.left + r.width / 2 - o.left) + 'px'; s.style.top = (r.top - o.top + 6) + 'px';
    s.addEventListener('animationend', () => s.remove());
    root.append(s);
  };
  const menu = (k, t, p) => `<div class="mn"><p class="mn-k">${k}</p><h2 class="mn-t">${t}</h2><p class="mn-p">${p}</p><div class="mn-x"></div><button type="button" class="g-btn mn-go">Play</button><p class="mn-b"></p></div>`;

  const TRIVIA = [];
  Object.entries({
    Science: [
      ['What is the chemical symbol for gold?', 'Au', 'Ag', 'Gd', 'Go'],
      ['Which gas do plants absorb from the air for photosynthesis?', 'Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'],
      ['What is the hardest natural substance?', 'Diamond', 'Quartz', 'Granite', 'Topaz'],
      ['How many bones are in the adult human body?', '206', '186', '212', '230', 1],
      ["Which organelle produces most of a cell's energy?", 'Mitochondrion', 'Ribosome', 'Nucleus', 'Golgi apparatus', 1],
      ["What is the most abundant gas in Earth's atmosphere?", 'Nitrogen', 'Oxygen', 'Argon', 'Carbon dioxide'],
      ['At sea level, water boils at what temperature?', '100 °C', '90 °C', '110 °C', '120 °C'],
      ['Which particle carries a negative electric charge?', 'Electron', 'Proton', 'Neutron', 'Photon'],
      ['Which blood cells carry oxygen around the body?', 'Red blood cells', 'White blood cells', 'Platelets', 'Plasma cells'],
      ['What is the chemical symbol for sodium?', 'Na', 'So', 'Sd', 'Sn', 1],
      ['What is the atomic number of carbon?', '6', '8', '12', '4', 1],
      ['Which organ produces insulin?', 'Pancreas', 'Liver', 'Kidney', 'Spleen'],
      ['Roughly how fast does light travel in a vacuum?', '300,000 km/s', '30,000 km/s', '3,000,000 km/s', '150,000 km/s'],
      ['Which element has the chemical symbol Fe?', 'Iron', 'Fluorine', 'Lead', 'Fermium'],
      ['What is the pH of pure water at 25 °C?', '7', '0', '5', '14', 1],
      ['Who developed the theory of general relativity?', 'Albert Einstein', 'Isaac Newton', 'Niels Bohr', 'Max Planck'],
      ['What is the largest organ of the human body?', 'Skin', 'Liver', 'Brain', 'Lungs'],
      ['What is the chemical formula of table salt?', 'NaCl', 'KCl', 'NaOH', 'HCl'],
      ['How many chambers does the human heart have?', '4', '2', '3', '6'],
      ['What do we call water in its solid form?', 'Ice', 'Steam', 'Dew', 'Fog'],
      ['Which organ pumps blood around the body?', 'Heart', 'Lungs', 'Liver', 'Kidneys'],
      ['What is the chemical formula for water?', 'H₂O', 'CO₂', 'O₂', 'H₂O₂'],
      ['What is the most abundant element in the universe?', 'Hydrogen', 'Helium', 'Oxygen', 'Carbon', 1],
      ['What is the chemical symbol for potassium?', 'K', 'P', 'Po', 'Pt', 1],
      ['Who formulated the three laws of motion?', 'Isaac Newton', 'Galileo Galilei', 'Johannes Kepler', 'Albert Einstein', 1],
      ['What is the SI unit of electrical resistance?', 'Ohm', 'Volt', 'Ampere', 'Watt', 1],
      ['Which vitamin does the skin make when exposed to sunlight?', 'Vitamin D', 'Vitamin C', 'Vitamin A', 'Vitamin K', 1],
      ['Roughly how fast does sound travel in air at 20 °C?', '343 m/s', '143 m/s', '743 m/s', '1,243 m/s', 1],
      ['Which noble gas glows bright red-orange in advertising signs?', 'Neon', 'Argon', 'Xenon', 'Krypton', 1],
      ['Which part of the eye controls how much light enters it?', 'Iris', 'Retina', 'Cornea', 'Optic nerve', 1]
    ],
    History: [
      ['In which year did World War II end?', '1945', '1939', '1944', '1950'],
      ['Who was the first President of the United States?', 'George Washington', 'Thomas Jefferson', 'John Adams', 'Abraham Lincoln'],
      ['Which civilization built Machu Picchu?', 'The Inca', 'The Aztecs', 'The Maya', 'The Olmecs'],
      ['In which year did the Berlin Wall fall?', '1989', '1985', '1991', '1979'],
      ['Which ocean liner sank on its maiden voyage in 1912?', '<i>Titanic</i>', '<i>Lusitania</i>', '<i>Britannic</i>', '<i>Queen Mary</i>'],
      ['Who was the first person to walk on the Moon?', 'Neil Armstrong', 'Buzz Aldrin', 'Yuri Gagarin', 'Michael Collins'],
      ['Which Roman city was buried by Mount Vesuvius in AD 79?', 'Pompeii', 'Ostia', 'Capua', 'Ravenna'],
      ['Who was the principal author of the US Declaration of Independence?', 'Thomas Jefferson', 'Benjamin Franklin', 'George Washington', 'John Hancock', 1],
      ['In which year did Columbus first reach the Americas?', '1492', '1488', '1500', '1519'],
      ['What was the first artificial satellite to orbit Earth?', 'Sputnik 1', 'Explorer 1', 'Vostok 1', 'Telstar 1'],
      ['Which French leader was defeated at the Battle of Waterloo?', 'Napoleon Bonaparte', 'Louis XIV', 'Charles de Gaulle', 'Louis XVI'],
      ['Which country gave the Statue of Liberty to the United States?', 'France', 'United Kingdom', 'Spain', 'Italy'],
      ['Who was the British prime minister for most of World War II?', 'Winston Churchill', 'Neville Chamberlain', 'Clement Attlee', 'Anthony Eden'],
      ['In which year was Magna Carta sealed?', '1215', '1066', '1415', '1314', 1],
      ['In which year did the French Revolution begin?', '1789', '1776', '1799', '1815', 1],
      ['Who was the first woman to win a Nobel Prize?', 'Marie Curie', 'Rosalind Franklin', 'Ada Lovelace', 'Florence Nightingale'],
      ['Who was the first emperor of Rome?', 'Augustus', 'Julius Caesar', 'Nero', 'Caligula', 1],
      ['In which country did the Industrial Revolution begin?', 'Great Britain', 'France', 'Germany', 'United States'],
      ['Which ancient wonder stood in the Egyptian city of Alexandria?', 'The Lighthouse', 'The Colossus', 'The Hanging Gardens', 'The Mausoleum', 1],
      ['Which ancient people built the pyramids at Giza?', 'The Egyptians', 'The Romans', 'The Greeks', 'The Persians'],
      ['Which ship carried the Pilgrims to America in 1620?', '<i>Mayflower</i>', '<i>Santa María</i>', '<i>Endeavour</i>', '<i>Beagle</i>'],
      ['In which year did the Battle of Hastings take place?', '1066', '1086', '1056', '1166', 1],
      ['Which empire was ruled by Suleiman the Magnificent?', 'Ottoman Empire', 'Mughal Empire', 'Persian Empire', 'Byzantine Empire', 1],
      ['Who was the first emperor of a unified China?', 'Qin Shi Huang', 'Kublai Khan', 'Sun Yat-sen', 'Liu Bang', 1],
      ['In which year did the American Civil War end?', '1865', '1861', '1870', '1859', 1],
      ['Which treaty formally ended World War I between Germany and the Allies?', 'Treaty of Versailles', 'Treaty of Paris', 'Treaty of Utrecht', 'Treaty of Westphalia', 1],
      ['Who was the last Tsar of Russia?', 'Nicholas II', 'Alexander III', 'Peter the Great', 'Ivan IV', 1],
      ['Which ancient city is traditionally said to have had the Hanging Gardens?', 'Babylon', 'Nineveh', 'Ur', 'Carthage', 1],
      ['Whose expedition was the first to sail around the world (1519–1522)?', 'Ferdinand Magellan', 'Vasco da Gama', 'Francis Drake', 'James Cook', 1],
      ['Which Roman emperor ordered a wall built across northern Britain around AD 122?', 'Hadrian', 'Augustus', 'Nero', 'Constantine', 1]
    ],
    'Arts & Literature': [
      ['Who painted the <i>Mona Lisa</i>?', 'Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Titian'],
      ['Who wrote <i>Romeo and Juliet</i>?', 'William Shakespeare', 'Christopher Marlowe', 'Charles Dickens', 'John Milton'],
      ['Who wrote the novel <i>1984</i>?', 'George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'H. G. Wells'],
      ['Who painted <i>The Starry Night</i>?', 'Vincent van Gogh', 'Claude Monet', 'Paul Cézanne', 'Edvard Munch'],
      ['Who composed the <i>Moonlight Sonata</i>?', 'Ludwig van Beethoven', 'Wolfgang Amadeus Mozart', 'Frédéric Chopin', 'Johann Sebastian Bach', 1],
      ['Who wrote <i>Pride and Prejudice</i>?', 'Jane Austen', 'Charlotte Brontë', 'Emily Brontë', 'Mary Shelley'],
      ['In which city is the Louvre museum?', 'Paris', 'London', 'Rome', 'Madrid'],
      ['Who carved the marble statue of <i>David</i> completed in 1504?', 'Michelangelo', 'Auguste Rodin', 'Antonio Canova', 'Henry Moore'],
      ['Who wrote <i>Don Quixote</i>?', 'Miguel de Cervantes', 'Gabriel García Márquez', 'Lope de Vega', 'Jorge Luis Borges', 1],
      ['Who painted <i>Girl with a Pearl Earring</i>?', 'Johannes Vermeer', 'Rembrandt', 'Frans Hals', 'Vincent van Gogh', 1],
      ['Which ancient Greek poet is credited with <i>The Odyssey</i>?', 'Homer', 'Virgil', 'Sophocles', 'Ovid'],
      ['How many lines does a traditional sonnet have?', '14', '10', '12', '16', 1],
      ['Who composed <i>The Four Seasons</i>?', 'Antonio Vivaldi', 'Johann Sebastian Bach', 'George Frideric Handel', 'Joseph Haydn'],
      ['Which author created Sherlock Holmes?', 'Arthur Conan Doyle', 'Agatha Christie', 'Edgar Allan Poe', 'Wilkie Collins'],
      ["In <i>Moby-Dick</i>, what is the name of the ship's captain?", 'Ahab', 'Nemo', 'Hook', 'Flint', 1],
      ['Who painted the ceiling of the Sistine Chapel?', 'Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Caravaggio'],
      ['Who wrote <i>War and Peace</i>?', 'Leo Tolstoy', 'Fyodor Dostoevsky', 'Anton Chekhov', 'Ivan Turgenev'],
      ['Salvador Dalí is most associated with which art movement?', 'Surrealism', 'Cubism', 'Impressionism', 'Pop art', 1],
      ['Who wrote <i>The Great Gatsby</i>?', 'F. Scott Fitzgerald', 'Ernest Hemingway', 'John Steinbeck', 'William Faulkner'],
      ['How many keys does a standard modern piano have?', '88', '76', '72', '96'],
      ['Who wrote <i>Harry Potter and the Philosopher’s Stone</i>?', 'J. K. Rowling', 'Roald Dahl', 'C. S. Lewis', 'Philip Pullman'],
      ['How many strings does a standard violin have?', '4', '5', '6', '3'],
      ['Who wrote <i>Frankenstein</i>?', 'Mary Shelley', 'Bram Stoker', 'Edgar Allan Poe', 'Percy Bysshe Shelley'],
      ['Who wrote <i>Crime and Punishment</i>?', 'Fyodor Dostoevsky', 'Leo Tolstoy', 'Nikolai Gogol', 'Ivan Turgenev', 1],
      ['Who composed the opera <i>The Magic Flute</i>?', 'Wolfgang Amadeus Mozart', 'Giuseppe Verdi', 'Richard Wagner', 'Giacomo Puccini', 1],
      ['Who painted <i>The Persistence of Memory</i>, with its melting clocks?', 'Salvador Dalí', 'René Magritte', 'Joan Miró', 'Max Ernst', 1],
      ['Who wrote the epic poem <i>Paradise Lost</i>?', 'John Milton', 'Geoffrey Chaucer', 'Edmund Spenser', 'John Donne', 1],
      ['In which country is Shakespeare’s <i>Hamlet</i> set?', 'Denmark', 'Norway', 'Sweden', 'Scotland', 1],
      ['Who painted <i>The Birth of Venus</i>?', 'Sandro Botticelli', 'Titian', 'Raphael', 'Giotto', 1]
    ],
    Nature: [
      ['What is the largest mammal on Earth?', 'Blue whale', 'African elephant', 'Sperm whale', 'Giraffe'],
      ['How many legs does a spider have?', '8', '6', '10', '12'],
      ['What is the fastest land animal?', 'Cheetah', 'Lion', 'Pronghorn', 'Greyhound'],
      ['Bees make honey from which substance collected from flowers?', 'Nectar', 'Pollen', 'Sap', 'Dew'],
      ['What is a baby kangaroo called?', 'Joey', 'Kit', 'Cub', 'Calf'],
      ['Which of these flightless birds breeds in Antarctica?', 'Penguin', 'Ostrich', 'Emu', 'Kiwi'],
      ['What is the tallest living animal?', 'Giraffe', 'African elephant', 'Ostrich', 'Moose'],
      ['How many hearts does an octopus have?', '3', '1', '2', '4', 1],
      ['What kind of animal is a Komodo dragon?', 'Lizard', 'Snake', 'Crocodile', 'Turtle'],
      ['What is the largest species of shark?', 'Whale shark', 'Great white shark', 'Basking shark', 'Tiger shark', 1],
      ['What is the process by which a caterpillar becomes a butterfly?', 'Metamorphosis', 'Photosynthesis', 'Migration', 'Hibernation'],
      ['Which tree produces acorns?', 'Oak', 'Maple', 'Pine', 'Birch'],
      ['What is a group of lions called?', 'A pride', 'A pack', 'A herd', 'A school'],
      ['Which mammal is capable of true flight?', 'Bat', 'Flying squirrel', 'Sugar glider', 'Colugo', 1],
      ['What do giant pandas mainly eat?', 'Bamboo', 'Eucalyptus', 'Fish', 'Berries'],
      ['What is the largest bird in the world?', 'Ostrich', 'Emu', 'Albatross', 'Andean condor'],
      ['What are animals that eat only plants called?', 'Herbivores', 'Carnivores', 'Omnivores', 'Insectivores'],
      ['What do snakes mainly use their forked tongues for?', 'Smelling', 'Hearing', 'Drinking', 'Breathing', 1],
      ['Which part of a plant absorbs water from the soil?', 'Roots', 'Leaves', 'Flowers', 'Petals'],
      ['How many legs does an insect have?', '6', '8', '4', '10'],
      ['Which big cat is known as the “king of the jungle”?', 'Lion', 'Tiger', 'Leopard', 'Jaguar'],
      ['Which is the only continent with no native ants?', 'Antarctica', 'Australia', 'Europe', 'South America', 1],
      ['What is a male honeybee called?', 'Drone', 'Worker', 'Buck', 'Jack', 1],
      ['Which land mammal has the longest pregnancy?', 'Elephant', 'Giraffe', 'Rhinoceros', 'Hippopotamus', 1],
      ['Which bird can fly backwards?', 'Hummingbird', 'Kingfisher', 'Swift', 'Sparrow', 1],
      ['What is the green pigment in plants called?', 'Chlorophyll', 'Carotene', 'Melanin', 'Haemoglobin', 1],
      ['What is a group of crows called?', 'A murder', 'A parliament', 'A gaggle', 'A pod', 1],
      ['How many compartments does a cow’s stomach have?', '4', '2', '3', '6', 1],
      ['Which bird is the fastest in a hunting dive?', 'Peregrine falcon', 'Golden eagle', 'Common swift', 'Albatross', 1],
      ['Which plant produces the largest single flower in the world?', 'Rafflesia', 'Sunflower', 'Lotus', 'Magnolia', 1]
    ],
    Geography: [
      ['What is the capital of Japan?', 'Tokyo', 'Kyoto', 'Osaka', 'Seoul'],
      ['What is the largest ocean on Earth?', 'Pacific', 'Atlantic', 'Indian', 'Arctic'],
      ['What is the capital of Australia?', 'Canberra', 'Sydney', 'Melbourne', 'Perth', 1],
      ['What is the largest country by area?', 'Russia', 'Canada', 'China', 'United States'],
      ['In which country is Mount Kilimanjaro?', 'Tanzania', 'Kenya', 'Uganda', 'Ethiopia', 1],
      ['What is the capital of Canada?', 'Ottawa', 'Toronto', 'Vancouver', 'Montreal'],
      ['What is the highest mountain above sea level?', 'Mount Everest', 'K2', 'Kangchenjunga', 'Mont Blanc'],
      ['What is the largest hot desert in the world?', 'Sahara', 'Gobi', 'Kalahari', 'Arabian'],
      ['How many continents are there in the most widely taught model?', '7', '5', '6', '8'],
      ['What is the capital of Italy?', 'Rome', 'Milan', 'Venice', 'Florence'],
      ['In which country is the city of Marrakesh?', 'Morocco', 'Algeria', 'Tunisia', 'Egypt', 1],
      ['Most of the Amazon rainforest lies in which country?', 'Brazil', 'Peru', 'Colombia', 'Venezuela'],
      ['What is the smallest country in the world by area?', 'Vatican City', 'Monaco', 'San Marino', 'Liechtenstein'],
      ['Which river flows through London?', 'Thames', 'Seine', 'Danube', 'Severn'],
      ['Oslo is the capital of which country?', 'Norway', 'Sweden', 'Denmark', 'Finland'],
      ['Which US state is made up entirely of islands?', 'Hawaii', 'Alaska', 'California', 'Florida'],
      ['What is the largest of the Great Lakes?', 'Lake Superior', 'Lake Michigan', 'Lake Huron', 'Lake Erie', 1],
      ['What is the capital of Egypt?', 'Cairo', 'Alexandria', 'Luxor', 'Giza'],
      ['Which line divides Earth into the Northern and Southern Hemispheres?', 'The Equator', 'Tropic of Cancer', 'Prime Meridian', 'Arctic Circle'],
      ['What is the capital of France?', 'Paris', 'Lyon', 'Marseille', 'Nice'],
      ['On which continent is Brazil?', 'South America', 'Africa', 'North America', 'Europe'],
      ['What is the longest river in South America?', 'Amazon', 'Paraná', 'Orinoco', 'Magdalena', 1],
      ['What is the capital of Turkey?', 'Ankara', 'Istanbul', 'Izmir', 'Antalya', 1],
      ['What is the capital of New Zealand?', 'Wellington', 'Auckland', 'Christchurch', 'Hamilton', 1],
      ['Which strait separates Spain from Morocco?', 'Strait of Gibraltar', 'Bosporus', 'Strait of Hormuz', 'Strait of Dover', 1],
      ['What is the deepest lake in the world?', 'Lake Baikal', 'Lake Tanganyika', 'Lake Superior', 'Lake Victoria', 1],
      ['Which African country has the largest population?', 'Nigeria', 'Ethiopia', 'Egypt', 'South Africa', 1],
      ['Which country has more lakes than any other?', 'Canada', 'Russia', 'Finland', 'United States', 1],
      ['What is the longest mountain range above sea level?', 'Andes', 'Himalayas', 'Rocky Mountains', 'Alps', 1]
    ],
    Sport: [
      ['How many players does each side have on the field in soccer?', '11', '9', '10', '12'],
      ['In which sport would you perform a slam dunk?', 'Basketball', 'Volleyball', 'Tennis', 'Rugby'],
      ['How many years normally separate two Summer Olympic Games?', '4', '2', '3', '5'],
      ['In tennis, what is a score of zero called?', 'Love', 'Nil', 'Duck', 'Zip'],
      ['How many holes are played in a standard round of golf?', '18', '9', '12', '24'],
      ['In which country were the ancient Olympic Games held?', 'Greece', 'Italy', 'Egypt', 'Turkey'],
      ['What is a perfect score in ten-pin bowling?', '300', '200', '250', '400', 1],
      ['How many rings are on the Olympic flag?', '5', '4', '6', '7'],
      ['How many balls are in a standard over in cricket?', '6', '4', '5', '8', 1],
      ['Which sport uses a shuttlecock?', 'Badminton', 'Squash', 'Table tennis', 'Lacrosse'],
      ['How long is a marathon?', '42.195 km', '40 km', '45 km', '50 km'],
      ['In which sport can you score a try?', 'Rugby', 'Cricket', 'Soccer', 'Baseball'],
      ['How many players per team are on a basketball court at once?', '5', '6', '7', '4'],
      ['The Tour de France is a race in which sport?', 'Cycling', 'Running', 'Motor racing', 'Sailing'],
      ['In which sport are “birdie” and “eagle” scoring terms?', 'Golf', 'Tennis', 'Cricket', 'Darts'],
      ['How many points is a touchdown worth in American football?', '6', '3', '7', '5'],
      ['Which martial art’s name means “the gentle way”?', 'Judo', 'Karate', 'Taekwondo', 'Kung fu', 1],
      ['In Olympic archery, what colour is the innermost ring of the target?', 'Gold', 'Red', 'Blue', 'Black', 1],
      ['What is the maximum break in snooker without a free ball?', '147', '140', '155', '180', 1],
      ['How many players does a volleyball team have on court?', '6', '5', '7', '8'],
      ['Which colour card sends a soccer player off the field?', 'Red', 'Yellow', 'Blue', 'Green'],
      ['How many minutes does a standard soccer match last, before stoppage time?', '90', '80', '100', '60'],
      ['Which country won the first FIFA World Cup in 1930?', 'Uruguay', 'Brazil', 'Argentina', 'Italy', 1],
      ['How many players does a rugby union team have on the field?', '15', '13', '11', '12', 1],
      ['Which city hosted the first modern Olympic Games in 1896?', 'Athens', 'Paris', 'London', 'Rome', 1],
      ['What is the diameter of a basketball hoop’s rim?', '18 inches', '16 inches', '20 inches', '22 inches', 1],
      ['How many squares are on a chessboard?', '64', '81', '100', '48', 1],
      ['Which tennis Grand Slam tournament is played on clay?', 'French Open', 'Wimbledon', 'US Open', 'Australian Open', 1],
      ['How long is an Olympic swimming pool?', '50 m', '25 m', '100 m', '75 m', 1]
    ],
    Technology: [
      ['What does CPU stand for?', 'Central Processing Unit', 'Central Program Utility', 'Computer Personal Unit', 'Core Processing Utility'],
      ['What does HTML stand for?', 'HyperText Markup Language', 'HighText Machine Language', 'Hyperlink Text Management Language', 'Home Tool Markup Language'],
      ['Who co-founded Microsoft with Paul Allen?', 'Bill Gates', 'Steve Jobs', 'Steve Wozniak', 'Larry Page'],
      ['What does URL stand for?', 'Uniform Resource Locator', 'Universal Reference Link', 'Unified Routing Locator', 'Uniform Retrieval Link'],
      ['How many bits are in a byte?', '8', '4', '10', '16'],
      ['What does Wi-Fi use to carry data?', 'Radio waves', 'Infrared light', 'Ultrasound', 'Visible light'],
      ['What is the binary number 1010 in decimal?', '10', '8', '12', '5', 1],
      ['Who invented the World Wide Web?', 'Tim Berners-Lee', 'Vint Cerf', 'Alan Turing', 'Bill Gates', 1],
      ['What does RAM stand for?', 'Random Access Memory', 'Read Access Memory', 'Rapid Action Memory', 'Run-time Allocated Memory'],
      ['Which programming language shares its name with an Indonesian island?', 'Java', 'Python', 'Ruby', 'Swift', 1],
      ['What does GPS stand for?', 'Global Positioning System', 'General Positioning Service', 'Global Pointing Satellite', 'Geographic Position Sensor'],
      ['Who proposed a famous test of machine intelligence in 1950?', 'Alan Turing', 'John von Neumann', 'Charles Babbage', 'Claude Shannon', 1],
      ['What does PDF stand for?', 'Portable Document Format', 'Printable Data File', 'Public Document Format', 'Page Description File'],
      ['What does LAN stand for?', 'Local Area Network', 'Large Access Network', 'Linked Area Node', 'Long Area Network'],
      ['Who is often called the first computer programmer?', 'Ada Lovelace', 'Grace Hopper', 'Mary Somerville', 'Alan Turing', 1],
      ['What does USB stand for?', 'Universal Serial Bus', 'Unified System Bus', 'Universal Signal Board', 'Ultra Speed Bus'],
      ['Which company makes the iPhone?', 'Apple', 'Samsung', 'Google', 'Nokia'],
      ['In computing, what does “AI” stand for?', 'Artificial intelligence', 'Automated interface', 'Advanced integration', 'Analog input'],
      ['What is malicious software that demands payment to unlock files called?', 'Ransomware', 'Spyware', 'Adware', 'Firmware'],
      ['What device moves the pointer on a computer screen?', 'Mouse', 'Monitor', 'Speaker', 'Scanner'],
      ['What does “www” stand for in a web address?', 'World Wide Web', 'World Web Wide', 'Wide World Web', 'Web World Wide'],
      ['Which company makes the Windows operating system?', 'Microsoft', 'Apple', 'IBM', 'Intel'],
      ['What does SQL stand for?', 'Structured Query Language', 'Simple Query Logic', 'Standard Question Language', 'Sequential Query List', 1],
      ['In which year was the first iPhone released?', '2007', '2005', '2009', '2010', 1],
      ['Who co-founded Apple with Steve Jobs and Ronald Wayne?', 'Steve Wozniak', 'Bill Gates', 'Paul Allen', 'Larry Ellison', 1],
      ['What is 2 to the power of 10?', '1024', '1000', '512', '2048', 1],
      ['What does HTTP stand for?', 'HyperText Transfer Protocol', 'High Transfer Text Protocol', 'Hyperlink Text Transfer Process', 'Host Text Transfer Protocol', 1],
      ['What does DNS turn domain names into?', 'IP addresses', 'Passwords', 'Email addresses', 'File names', 1],
      ['Which programming language was created by Guido van Rossum?', 'Python', 'Java', 'C++', 'Ruby', 1],
      ['What does CSS stand for in web design?', 'Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style System', 'Colour Styling Syntax', 1]
    ],
    Language: [
      ['What is the plural of “mouse” (the animal)?', 'Mice', 'Mouses', 'Meese', 'Mices'],
      ['Which word is a synonym of “happy”?', 'Joyful', 'Gloomy', 'Weary', 'Bitter'],
      ['What is the opposite of “ancient”?', 'Modern', 'Antique', 'Elderly', 'Historic'],
      ['How many letters are in the English alphabet?', '26', '24', '25', '28'],
      ['How do you say “thank you” in French?', 'Merci', 'Gracias', 'Danke', 'Grazie'],
      ['What is the Spanish word for “dog”?', 'Perro', 'Gato', 'Casa', 'Pájaro'],
      ['What are words that sound alike but differ in meaning called?', 'Homophones', 'Synonyms', 'Antonyms', 'Acronyms', 1],
      ['What does the prefix “bi-” mean?', 'Two', 'One', 'Three', 'Half'],
      ['Which language has the most native speakers?', 'Mandarin Chinese', 'English', 'Spanish', 'Hindi'],
      ['Which word reads the same forwards and backwards?', 'Level', 'Lever', 'Label', 'Lemon'],
      ['What does <i>carpe diem</i> mean?', 'Seize the day', 'Love conquers all', 'Know thyself', 'Time flies', 1],
      ['How do you say “thank you” in Japanese?', 'Arigatou', 'Konnichiwa', 'Sayonara', 'Ohayou'],
      ['What is the past tense of “swim”?', 'Swam', 'Swum', 'Swimmed', 'Swammed'],
      ['What is a word with the opposite meaning of another called?', 'Antonym', 'Synonym', 'Homonym', 'Pronoun'],
      ['From which language does the word “kindergarten” come?', 'German', 'Dutch', 'French', 'Swedish', 1],
      ['What does “e.g.” mean?', 'For example', 'That is', 'And so on', 'Note well'],
      ['How do you say “hello” in German?', 'Hallo', 'Hola', 'Bonjour', 'Ciao'],
      ['What is a word like NASA, formed from initial letters, called?', 'Acronym', 'Anagram', 'Palindrome', 'Homonym', 1],
      ['What is the opposite of “hot”?', 'Cold', 'Warm', 'Wet', 'Dry'],
      ['Which of these letters is a vowel?', 'E', 'B', 'K', 'T'],
      ['Which punctuation mark ends a direct question?', 'Question mark', 'Semicolon', 'Colon', 'Apostrophe'],
      ['What is the Latin plural of “cactus”?', 'Cacti', 'Cactae', 'Cacta', 'Cactis', 1],
      ['What is a word that imitates a sound, like “buzz”, called?', 'Onomatopoeia', 'Alliteration', 'Hyperbole', 'Metaphor', 1],
      ['What is the official language of Brazil?', 'Portuguese', 'Spanish', 'French', 'Italian', 1],
      ['What does the Latin phrase <i>et cetera</i> mean?', 'And the rest', 'For example', 'In good faith', 'By itself', 1],
      ['How many letters are in the modern Greek alphabet?', '24', '26', '22', '28', 1],
      ['What is a comparison using “like” or “as” called?', 'Simile', 'Metaphor', 'Idiom', 'Irony', 1],
      ['Which alphabet is used to write Russian?', 'Cyrillic', 'Latin', 'Greek', 'Arabic', 1]
    ],
    Space: [
      ['Which planet is closest to the Sun?', 'Mercury', 'Venus', 'Mars', 'Earth'],
      ['Which planet is known as the Red Planet?', 'Mars', 'Jupiter', 'Venus', 'Saturn'],
      ['What is the largest planet in our solar system?', 'Jupiter', 'Saturn', 'Neptune', 'Uranus'],
      ['How many planets are in our solar system?', '8', '7', '9', '10'],
      ['What is the name of our galaxy?', 'The Milky Way', 'Andromeda', 'Triangulum', 'Sombrero'],
      ['Who was the first human in space?', 'Yuri Gagarin', 'Neil Armstrong', 'Alan Shepard', 'John Glenn'],
      ['Which planet has the most prominent ring system?', 'Saturn', 'Jupiter', 'Uranus', 'Neptune'],
      ['What is the closest star to Earth?', 'The Sun', 'Proxima Centauri', 'Sirius', 'Polaris'],
      ['About how long does sunlight take to reach Earth?', '8 minutes', '8 seconds', '8 hours', '8 days', 1],
      ['What is the hottest planet in our solar system?', 'Venus', 'Mercury', 'Mars', 'Jupiter'],
      ['What does a light-year measure?', 'Distance', 'Time', 'Brightness', 'Speed'],
      ['Which planet spins on its side, tilted about 98°?', 'Uranus', 'Neptune', 'Saturn', 'Venus', 1],
      ['Which space telescope was launched in 1990?', 'Hubble', 'Kepler', 'Spitzer', 'James Webb', 1],
      ['Which former ninth planet was reclassified as a dwarf planet in 2006?', 'Pluto', 'Ceres', 'Eris', 'Haumea'],
      ["Roughly how strong is the Moon's surface gravity compared to Earth's?", 'About one sixth', 'About one half', 'About one tenth', 'About one third', 1],
      ['Titan is a moon of which planet?', 'Saturn', 'Jupiter', 'Neptune', 'Uranus', 1],
      ['Which program first landed humans on the Moon?', 'Apollo', 'Gemini', 'Mercury', 'Artemis'],
      ['What are stars mostly made of?', 'Hydrogen and helium', 'Oxygen and nitrogen', 'Iron and nickel', 'Carbon and silicon'],
      ['Which force keeps the planets in orbit around the Sun?', 'Gravity', 'Magnetism', 'Friction', 'Static electricity'],
      ['What is a space rock that reaches the ground called?', 'Meteorite', 'Comet', 'Nebula', 'Quasar'],
      ['Which star is at the centre of our solar system?', 'The Sun', 'Sirius', 'Polaris', 'Vega'],
      ['What is the largest moon in the solar system?', 'Ganymede', 'Titan', 'Callisto', 'Europa', 1],
      ['Which planet has the shortest day?', 'Jupiter', 'Saturn', 'Earth', 'Mars', 1],
      ['What is the boundary around a black hole beyond which nothing can escape?', 'Event horizon', 'Photon sphere', 'Accretion disc', 'Corona', 1],
      ['Who was the first woman in space?', 'Valentina Tereshkova', 'Sally Ride', 'Svetlana Savitskaya', 'Mae Jemison', 1],
      ['In which year did Apollo 11 land on the Moon?', '1969', '1967', '1971', '1965', 1],
      ['What is the giant volcano on Mars called?', 'Olympus Mons', 'Mauna Kea', 'Valles Marineris', 'Elysium Planitia', 1],
      ['Phobos and Deimos are moons of which planet?', 'Mars', 'Jupiter', 'Venus', 'Neptune', 1]
    ],
    Food: [
      ['Sushi is most closely associated with which country?', 'Japan', 'China', 'Korea', 'Thailand'],
      ['What is the main ingredient of guacamole?', 'Avocado', 'Tomato', 'Lime', 'Pea'],
      ['Which nut is used to make marzipan?', 'Almond', 'Peanut', 'Cashew', 'Walnut'],
      ['What is tofu made from?', 'Soybeans', 'Rice', 'Wheat', 'Chickpeas'],
      ['What is the most expensive spice by weight?', 'Saffron', 'Cinnamon', 'Paprika', 'Turmeric', 1],
      ['Which pasta’s name means “little ears”?', 'Orecchiette', 'Farfalle', 'Penne', 'Fusilli', 1],
      ['Paella comes from which country?', 'Spain', 'Italy', 'Portugal', 'Mexico'],
      ['What is the main ingredient of hummus?', 'Chickpeas', 'Lentils', 'Fava beans', 'Peas'],
      ['Risotto is traditionally made with which grain?', 'Rice', 'Barley', 'Quinoa', 'Millet'],
      ['Which microorganism makes bread dough rise?', 'Yeast', 'Algae', 'Mould', 'Plankton'],
      ['Japanese miso is made mainly from which fermented ingredient?', 'Soybeans', 'Seaweed', 'Fish', 'Mushrooms', 1],
      ['Pho is a noodle soup from which country?', 'Vietnam', 'Thailand', 'China', 'Cambodia', 1],
      ['Which spice gives curry powder much of its yellow colour?', 'Turmeric', 'Cumin', 'Ginger', 'Cinnamon'],
      ['Which vegetable gives borscht its deep red colour?', 'Beetroot', 'Carrot', 'Potato', 'Onion', 1],
      ['Which cheese is traditional on a Margherita pizza?', 'Mozzarella', 'Cheddar', 'Gouda', 'Brie'],
      ['Wine is traditionally made by fermenting which fruit?', 'Grapes', 'Apples', 'Pears', 'Oranges'],
      ['Which Italian dessert layers coffee-soaked ladyfingers with mascarpone?', 'Tiramisu', 'Panna cotta', 'Cannoli', 'Gelato'],
      ['Raisins are made by drying which fruit?', 'Grapes', 'Plums', 'Figs', 'Apricots'],
      ['What is the main ingredient of a traditional omelette?', 'Eggs', 'Flour', 'Milk', 'Potatoes'],
      ['Kimchi is a traditional dish from which country?', 'Korea', 'Japan', 'China', 'Vietnam'],
      ['Prunes are dried versions of which fruit?', 'Plums', 'Grapes', 'Figs', 'Dates'],
      ['Which country is most famous for maple syrup?', 'Canada', 'Brazil', 'India', 'Egypt'],
      ['Japanese sake is brewed from which grain?', 'Rice', 'Barley', 'Wheat', 'Millet'],
      ['Manchego cheese comes from which country?', 'Spain', 'Italy', 'France', 'Greece', 1],
      ['Which pastry is used to make profiteroles?', 'Choux pastry', 'Puff pastry', 'Filo pastry', 'Shortcrust pastry', 1],
      ['Gazpacho is a cold soup made mainly from which ingredient?', 'Tomatoes', 'Potatoes', 'Lentils', 'Pumpkin', 1],
      ['Which Japanese dish is thinly sliced raw fish served without rice?', 'Sashimi', 'Tempura', 'Ramen', 'Udon', 1],
      ['Traditional feta cheese is made mainly from which milk?', 'Sheep’s milk', 'Cow’s milk', 'Buffalo milk', 'Camel milk', 1],
      ['Which herb gives classic pesto alla genovese its green colour?', 'Basil', 'Parsley', 'Mint', 'Coriander', 1],
      ['Goulash is a national dish of which country?', 'Hungary', 'Austria', 'Poland', 'Czechia', 1]
    ]
  }).forEach(([c, list]) => list.forEach(([q, a, w1, w2, w3, h]) => TRIVIA.push({ q, a, w: [w1, w2, w3], c, h: !!h })));
  const CAT_COL = { Science: '#3d8bfd', History: '#c26a2b', 'Arts & Literature': '#a855f7', Nature: '#26a96c', Geography: '#0e9aa7', Sport: '#ef476f', Technology: '#5a63e8', Language: '#f28c28', Space: '#3b2d8f', Food: '#d9480f' };
  const ICON_OK = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  const ICON_NO = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  Ameplay.register({
    id: 'trivia',
    title: 'Trivia',
    category: 'Quiz',
    better: 'high',
    width: 760,
    blurb: 'Ten topics, two difficulties, fifteen seconds a question.',
    help: '<kbd>1</kbd>–<kbd>4</kbd> or <kbd>A</kbd>–<kbd>D</kbd> to answer · <kbd>F</kbd> 50:50 · <kbd>S</kbd> skip · tap an option',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 10h36a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H28l-9 8v-8h-5a6 6 0 0 1-6-6V16a6 6 0 0 1 6-6z"/><path d="M27 22a5 5 0 1 1 7.5 4.33c-1.5.87-2.5 1.9-2.5 3.67v1.5"/><circle cx="32" cy="37" r="1.7" fill="currentColor" stroke="none"/></svg>',
    css: kitCss('trivia') + `
.gm-trivia{justify-content:flex-start;align-items:stretch;gap:0;min-height:520px;padding:clamp(14px,2.6vw,24px);border-radius:20px;background:radial-gradient(120% 90% at 50% 15%,#ffe49c 0%,#ffcb52 62%,#f4ae30 100%);overflow:hidden}
.gm-trivia .tv-cats{display:flex;flex-wrap:wrap;justify-content:center;gap:7px;margin-bottom:10px}
.gm-trivia .tv-cats button{height:36px;padding:0 14px;border:0;border-radius:999px;background:var(--sunk);color:var(--ink-2);font:800 13.5px/1 var(--sans);cursor:pointer;touch-action:manipulation}
.gm-trivia .tv-cats button[aria-pressed="true"]{background:var(--cc);color:#fff;box-shadow:0 4px 0 rgba(31,29,43,.2)}
.gm-trivia .gm-play{display:flex;flex-direction:column;flex:1}
.gm-trivia .tv-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.gm-trivia .tv-num{padding:7px 13px;border-radius:999px;background:rgba(255,255,255,.75);font-size:13px;font-weight:800;color:var(--ink-2);font-variant-numeric:tabular-nums}
.gm-trivia .tv-num b{color:var(--ink);font-weight:900}
.gm-trivia .tv-cat{padding:7px 13px;border-radius:999px;background:var(--cc,#7b4fd6);color:#fff;font-size:11.5px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}
.gm-trivia .tv-life{display:flex;gap:6px;margin-left:auto}
.gm-trivia .tv-life button{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border:0;border-radius:999px;background:#fff;color:var(--ink);font:900 13px/1 var(--sans);cursor:pointer;box-shadow:0 3px 0 rgba(160,105,10,.45);touch-action:manipulation}
.gm-trivia .tv-life button:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(160,105,10,.45)}
.gm-trivia .tv-life button:disabled{opacity:.45;cursor:default;box-shadow:none;transform:none}
.gm-trivia .tv-life kbd{height:18px;min-width:18px;padding:0 4px;font-size:10px}
.gm-trivia .tv-time{height:12px;margin-top:12px;border-radius:999px;background:rgba(255,255,255,.55);overflow:hidden;box-shadow:inset 0 2px 3px rgba(150,95,0,.22)}
.gm-trivia .tv-time i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#1fa36d,#7ed957);transform-origin:left center}
.gm-trivia .tv-time i.low{background:linear-gradient(90deg,#e8383d,#ff8a5c)}
.gm-trivia .tv-stage{flex:1;display:flex;flex-direction:column;justify-content:center;padding:18px 0;transition:transform .2s var(--ease),opacity .16s var(--ease)}
.gm-trivia .tv-stage.out{opacity:0;transform:translateX(-24px)}
.gm-trivia .tv-stage.pre{opacity:0;transform:translateX(24px);transition:none}
.gm-trivia .tv-q{display:grid;place-items:center;min-height:3.4em;margin:0 0 18px;padding:20px 24px;border-radius:24px;background:#fff;font:900 clamp(21px,3.4vw,30px)/1.2 var(--sans);letter-spacing:-.015em;color:var(--ink);text-align:center;text-wrap:balance;box-shadow:0 7px 0 rgba(196,128,16,.4)}
.gm-trivia .tv-opts{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.gm-trivia .tv-opt{--c:#7b4fd6;--d:#5c33b3;display:flex;align-items:center;gap:12px;min-height:64px;padding:10px 16px 10px 10px;border:0;border-radius:18px;background:var(--c);color:#fff;font:800 16px/1.25 var(--sans);text-align:left;cursor:pointer;box-shadow:0 5px 0 var(--d);touch-action:manipulation}
.gm-trivia .tv-opt:active{transform:translateY(3px);box-shadow:0 2px 0 var(--d)}
.gm-trivia .tv-opt i{flex:none;display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:#fff;color:var(--c);font:900 17px/1 var(--sans);font-style:normal}
.gm-trivia .tv-opt[data-i="1"]{--c:#26b37a;--d:#1a8a5c}
.gm-trivia .tv-opt[data-i="2"]{--c:#ef476f;--d:#c32d52}
.gm-trivia .tv-opt[data-i="3"]{--c:#3d8bfd;--d:#2766c9}
.gm-trivia .tv-opt.right{--c:#22b07d;--d:#167a55}
.gm-trivia .tv-opt.right i{animation:gmTvPing .45s var(--spring)}
.gm-trivia .tv-opt.bad{--c:#ef4f4f;--d:#b42f2f;animation:gmTvShake .36s}
.gm-trivia .tv-opt.dim{opacity:.38}
.gm-trivia .tv-opt.gone{opacity:.16;pointer-events:none}
.gm-trivia .tv-dots{display:flex;justify-content:center;gap:8px}
.gm-trivia .tv-dots i{width:11px;height:11px;border-radius:50%;background:rgba(255,255,255,.55)}
.gm-trivia .tv-dots i.cur{background:#fff;box-shadow:0 0 0 3px rgba(255,255,255,.45)}
.gm-trivia .tv-dots i.ok{background:#22b07d}
.gm-trivia .tv-dots i.no{background:#ef4f4f}
@media (max-width:560px){.gm-trivia{min-height:0}.gm-trivia .tv-opts{grid-template-columns:1fr;gap:9px}.gm-trivia .tv-opt{min-height:52px;font-size:15px}.gm-trivia .tv-opt i{width:32px;height:32px;font-size:15px}.gm-trivia .tv-q{padding:16px;font-size:20px;margin-bottom:14px}.gm-trivia .tv-life{margin-left:0}}
@media (pointer:coarse){.gm-trivia .tv-cats button,.gm-trivia .tv-life button{min-height:40px}.gm-trivia .tv-life kbd{display:none}}
@keyframes gmTvShake{25%{transform:translateX(-7px)}50%{transform:translateX(6px)}75%{transform:translateX(-3px)}}
@keyframes gmTvPing{40%{transform:scale(1.3)}}
`,
    mount(root, api) {
      const LIMIT = 15, ROUND = 10, CATS = ['Mixed', ...Object.keys(CAT_COL)];
      const saved = api.load() || {};
      let recent = Array.isArray(saved.recent) ? saved.recent : [];
      const bests = saved.bests && typeof saved.bests === 'object' ? saved.bests : {};
      const sel = { cat: CATS.includes(saved.cat) ? saved.cat : 'Mixed', diff: saved.diff === 'hard' ? 'hard' : 'easy' };
      const persist = () => api.save({ recent, bests, cat: sel.cat, diff: sel.diff });
      root.innerHTML = menu('Quiz', 'Trivia', 'Ten questions, fifteen seconds each. Faster answers score more, hard questions score more still. One 50:50 and one skip per round.') +
        `<div class="gm-play" hidden><div class="tv-top"><span class="tv-num">Question <b>1</b> / ${ROUND}</span><span class="tv-cat"></span><span class="tv-life"><button type="button" tabindex="-1" data-l="fifty">50:50<kbd>F</kbd></button><button type="button" tabindex="-1" data-l="skip">Skip<kbd>S</kbd></button></span></div><div class="tv-time"><i></i></div><div class="tv-stage"></div><div class="tv-dots">${'<i></i>'.repeat(ROUND)}</div></div>`;
      const $ = s => root.querySelector(s);
      const mn = $('.mn'), play = $('.gm-play'), num = $('.tv-num b'), cat = $('.tv-cat'), bar = $('.tv-time i'), bestEl = $('.mn-b');
      const stage = $('.tv-stage'), dots = [...root.querySelectorAll('.tv-dots i')], fiftyB = $('[data-l="fifty"]'), skipB = $('[data-l="skip"]');
      const cats = document.createElement('div');
      cats.className = 'tv-cats';
      cats.innerHTML = CATS.map(c => `<button type="button" tabindex="-1" data-c="${c}" style="--cc:${CAT_COL[c] || '#6c5ce7'}">${c}</button>`).join('');
      const syncCats = () => cats.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.c === sel.cat)));
      const key = () => sel.cat + '|' + sel.diff;
      const showBest = () => { bestEl.textContent = bests[key()] ? `Best in ${sel.cat} · ${sel.diff === 'hard' ? 'Hard' : 'Easy'}: ${bests[key()]}` : 'No score in this mode yet'; };
      tap(cats, 'button', b => { sel.cat = b.dataset.c; syncCats(); showBest(); persist(); });
      $('.mn-x').append(cats, segBar([['diff', [['easy', 'Easy'], ['hard', 'Hard']]]], sel, () => { showBest(); persist(); }));
      syncCats(); showBest();

      let run = [], spare = [], opts = [], btns = [], idx = 0, score = 0, right = 0, state = 'menu', t0 = 0, fifty = true, skip = true;
      const pool = () => {
        const inCat = TRIVIA.map((_, i) => i).filter(i => sel.cat === 'Mixed' || TRIVIA[i].c === sel.cat);
        const exact = inCat.filter(i => TRIVIA[i].h === (sel.diff === 'hard'));
        return exact.length >= ROUND + 2 ? exact : exact.concat(shuffle(inCat.filter(i => !exact.includes(i))).slice(0, ROUND + 2 - exact.length));
      };
      function newRun() {
        const all = pool(), fresh = all.filter(i => !recent.includes(i));
        const q = shuffle(fresh.length >= ROUND + 2 ? fresh : all);
        run = q.slice(0, ROUND); spare = q.slice(ROUND);
        if (spare.length < 2) spare = spare.concat(shuffle(all.filter(i => !run.includes(i))));
        recent = recent.concat(run).slice(-150);
        persist();
        idx = 0; score = 0; right = 0; fifty = true; skip = true;
        api.score(0);
        dots.forEach(d => { d.className = ''; });
      }
      function render() {
        const q = TRIVIA[run[idx]];
        opts = shuffle([q.a, ...q.w]);
        num.textContent = idx + 1;
        cat.textContent = q.c + (q.h ? ' · Hard' : '');
        cat.style.setProperty('--cc', CAT_COL[q.c]);
        dots.forEach((d, i) => d.classList.toggle('cur', i === idx));
        stage.innerHTML = `<h3 class="tv-q">${q.q}</h3><div class="tv-opts">${opts.map((o, i) => `<button type="button" class="tv-opt" data-i="${i}" tabindex="-1"><i>${'ABCD'[i]}</i><span>${o}</span></button>`).join('')}</div>`;
        btns = [...stage.querySelectorAll('.tv-opt')];
        bar.classList.remove('low'); bar.style.transform = 'scaleX(1)';
        fiftyB.disabled = !fifty; skipB.disabled = !skip || !spare.length;
      }
      const go = () => { state = 'ask'; t0 = performance.now(); };
      function swap() {
        state = 'swap';
        stage.classList.add('out');
        api.timeout(() => {
          render();
          stage.classList.remove('out');
          stage.classList.add('pre'); void stage.offsetWidth; stage.classList.remove('pre');
          go();
        }, 170);
      }
      function answer(i) {
        if (state !== 'ask') return;
        state = 'reveal';
        fiftyB.disabled = skipB.disabled = true;
        const t = Math.min(LIMIT, (performance.now() - t0) / 1000), q = TRIVIA[run[idx]], ok = i >= 0 && opts[i] === q.a;
        btns.forEach((b, j) => {
          if (opts[j] === q.a) { b.classList.add('right'); b.firstChild.innerHTML = ICON_OK; }
          else if (j === i) { b.classList.add('bad'); b.firstChild.innerHTML = ICON_NO; }
          else b.classList.add('dim');
        });
        dots[idx].classList.add(ok ? 'ok' : 'no');
        if (ok) {
          right++;
          const base = q.h ? 150 : 100, pts = base + Math.round(base * (1 - t / LIMIT));
          score += pts;
          api.score(score); api.sfx('good');
          popText(root, btns[i], '+' + pts);
        } else {
          api.sfx('bad');
          if (i < 0) api.toast('Out of time');
        }
        api.timeout(() => { if (++idx < ROUND) swap(); else finish(); }, ok ? 850 : 1350);
      }
      function useFifty() {
        if (state !== 'ask' || !fifty) return;
        fifty = false; fiftyB.disabled = true;
        const a = TRIVIA[run[idx]].a;
        shuffle(btns.filter((b, j) => opts[j] !== a)).slice(0, 2).forEach(b => { b.classList.add('gone'); b.disabled = true; });
        api.sfx('pop');
      }
      function useSkip() {
        if (state !== 'ask' || !skip || !spare.length) return;
        skip = false;
        run[idx] = spare.shift();
        recent.push(run[idx]); persist();
        api.sfx('tap');
        swap();
      }
      function start() {
        if (state !== 'menu' && state !== 'done') return;
        mn.hidden = true; play.hidden = false;
        newRun(); render(); go();
      }
      function showMenu() { state = 'menu'; play.hidden = true; mn.hidden = false; showBest(); }
      function finish() {
        state = 'done';
        const k = key(), prev = bests[k] || 0;
        if (score > prev) { bests[k] = score; persist(); }
        const isBest = api.submit(score);
        if (right >= 7 || isBest) { confetti(root, api); api.sfx('win'); }
        api.overlay({
          kicker: isBest ? 'New best!' : `${sel.cat} · ${sel.diff === 'hard' ? 'Hard' : 'Easy'}`,
          title: right === ROUND ? 'Flawless!' : right >= 8 ? 'Excellent!' : right >= 5 ? 'Well played' : 'Good effort',
          stats: [['Score', score], ['Correct', `${right}/${ROUND}`], ['Mode best', Math.max(prev, score)]],
          button: 'Play again', onAction: start,
          secondary: 'Change quiz', onSecondary: showMenu
        });
      }

      tap(stage, '.tv-opt', b => answer(+b.dataset.i));
      tap(fiftyB.parentNode, 'button', b => b === fiftyB ? useFifty() : useSkip());
      tap(mn, '.mn-go', start);
      api.on(window, 'keydown', e => {
        if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
        if (state === 'menu') { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); } return; }
        const n = /^(?:Digit|Numpad)([1-4])$/.exec(e.code), k = e.key.toLowerCase();
        if (k === 'f') return useFifty();
        if (k === 's') return useSkip();
        const i = n ? n[1] - 1 : k.length === 1 ? 'abcd'.indexOf(k) : -1;
        if (i >= 0 && btns[i] && !btns[i].disabled) answer(i);
      });
      api.loop(() => {
        if (state !== 'ask') return;
        const k = 1 - (performance.now() - t0) / 1000 / LIMIT;
        bar.style.transform = `scaleX(${Math.max(0, k)})`;
        if (k < 1 / 3) bar.classList.add('low');
        if (k <= 0) answer(-1);
      });
    }
  });

  const MINUS = '−', TIMES = '×', DIV = '÷';
  function mathProblem(n) {
    const lvl = n < 5 ? 0 : n < 11 ? 1 : n < 18 ? 2 : n < 26 ? 3 : 4, r = Math.random();
    let a, b, c;
    if (lvl === 0) {
      if (r < .55) { a = rint(1, 9); b = rint(1, 9); return [`${a} + ${b}`, a + b]; }
      a = rint(3, 12); b = rint(1, a - 1); return [`${a} ${MINUS} ${b}`, a - b];
    }
    if (lvl === 1) {
      if (r < .4) { a = rint(11, 49); b = rint(3, 9); return [`${a} + ${b}`, a + b]; }
      if (r < .75) { a = rint(12, 40); b = rint(3, 9); return [`${a} ${MINUS} ${b}`, a - b]; }
      a = rint(2, 5); b = rint(2, 9); return [`${a} ${TIMES} ${b}`, a * b];
    }
    if (lvl === 2) {
      if (r < .35) { a = rint(3, 9); b = rint(3, 9); return [`${a} ${TIMES} ${b}`, a * b]; }
      if (r < .6) { b = rint(2, 9); c = rint(2, 9); return [`${b * c} ${DIV} ${b}`, c]; }
      if (r < .8) { a = rint(15, 69); b = rint(12, 29); return [`${a} + ${b}`, a + b]; }
      a = rint(30, 90); b = rint(11, a - 5); return [`${a} ${MINUS} ${b}`, a - b];
    }
    if (lvl === 3 || r < .35) {
      const s = Math.random();
      if (s < .3) { a = rint(4, 12); b = rint(6, 12); return [`${a} ${TIMES} ${b}`, a * b]; }
      if (s < .55) { b = rint(3, 12); c = rint(3, 12); return [`${b * c} ${DIV} ${b}`, c]; }
      if (s < .8) { a = rint(2, 15); b = rint(a + 1, 25); return [`${a} ${MINUS} ${b}`, a - b]; }
      a = rint(45, 150); b = rint(25, 99); return [`${a} + ${b}`, a + b];
    }
    const s = Math.random();
    if (s < .3) { a = rint(3, 9); b = rint(3, 9); c = rint(2, 20); return [`${a} ${TIMES} ${b} + ${c}`, a * b + c]; }
    if (s < .5) { a = rint(3, 9); b = rint(3, 9); c = rint(2, a * b + 10); return [`${a} ${TIMES} ${b} ${MINUS} ${c}`, a * b - c]; }
    if (s < .7) { a = rint(2, 9); b = rint(2, 9); c = rint(3, 9); return [`(${a} + ${b}) ${TIMES} ${c}`, (a + b) * c]; }
    if (s < .85) { b = rint(2, 9); c = rint(2, 9); a = rint(2, 15); return [`${b * c} ${DIV} ${b} + ${a}`, c + a]; }
    a = rint(8, 20); b = rint(2, a - 2); c = rint(2, 6); return [`(${a} ${MINUS} ${b}) ${TIMES} ${c}`, (a - b) * c];
  }
  const MATH = {
    add: n => {
      let a, b;
      if (n < 6) { a = rint(2, 12); b = rint(2, 12); }
      else if (n < 14) { a = rint(11, 59); b = rint(3, 19); }
      else if (n < 24 || Math.random() < .5) { a = rint(15, 99); b = rint(12, 99); }
      else { a = rint(12, 60); b = rint(12, 60); const c = rint(5, 40); return [`${a} + ${b} + ${c}`, a + b + c]; }
      return [`${a} + ${b}`, a + b];
    },
    mixed: mathProblem,
    times: n => {
      const a = rint(2, n < 8 ? 6 : n < 16 ? 9 : 12), b = rint(2, 12);
      return n >= 10 && Math.random() < .3 ? [`${a * b} ${DIV} ${a}`, b] : Math.random() < .5 ? [`${a} ${TIMES} ${b}`, a * b] : [`${b} ${TIMES} ${a}`, a * b];
    },
    hard: n => {
      const r = Math.random();
      let a, b;
      if (r < .2) { a = rint(12, 49); b = rint(3, 9); return [`${a} ${TIMES} ${b}`, a * b]; }
      if (r < .35) { const p = pick([10, 20, 25, 50, 75]); b = rint(1, 20) * 20; return [`${p}% of ${b}`, p * b / 100]; }
      if (r < .5) { a = rint(6, 15); b = rint(6, 15); return [`${a * b} ${DIV} ${a}`, b]; }
      if (r < .65) { a = rint(120, 480); b = rint(35, 99); return Math.random() < .5 ? [`${a} + ${b}`, a + b] : [`${a} ${MINUS} ${b}`, a - b]; }
      return mathProblem(26 + n);
    }
  };

  const MS_MODES = [['add', 'Addition'], ['mixed', 'Mixed'], ['times', 'Times tables'], ['hard', 'Hard']];

  Ameplay.register({
    id: 'math-sprint',
    title: 'Math Sprint',
    category: 'Quiz',
    better: 'high',
    width: 620,
    blurb: 'Four modes of mental maths against the clock. Keep the streak alive.',
    help: 'Type the answer, it locks in when right · <kbd>Enter</kbd> skips · <kbd>-</kbd> for negatives · tap the keypad on touch',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="22" height="22" rx="6"/><rect x="34" y="8" width="22" height="22" rx="6"/><rect x="8" y="34" width="22" height="22" rx="6"/><rect x="34" y="34" width="22" height="22" rx="6" fill="currentColor" opacity=".3"/><path d="M19 14v10M14 19h10M40 19h10M15.5 41.5l7 7M22.5 41.5l-7 7M40 45h10"/><circle cx="45" cy="40" r="1.6" fill="currentColor" stroke="none"/><circle cx="45" cy="50" r="1.6" fill="currentColor" stroke="none"/></svg>',
    css: kitCss('math-sprint') + `
.gm-math-sprint{justify-content:flex-start;gap:12px;min-height:540px;padding:clamp(14px,2.6vw,22px);border-radius:20px;background:radial-gradient(120% 90% at 50% 20%,#4fb0cf 0%,#118ab2 58%,#0f6f90 100%);overflow:hidden}
.gm-math-sprint .seg-bar{flex-direction:column;align-items:center}
.gm-math-sprint .gm-play{display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;flex:1}
.gm-math-sprint .ms-bar{width:100%;height:12px;border-radius:999px;background:rgba(255,255,255,.25);overflow:hidden;box-shadow:inset 0 2px 3px rgba(0,40,60,.25)}
.gm-math-sprint .ms-bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#ffd166,#ffe7a3);transform-origin:left center}
.gm-math-sprint .ms-bar i.low{background:linear-gradient(90deg,#ff5d73,#ff9aa8)}
.gm-math-sprint .ms-hud{gap:8px;width:100%}
.gm-math-sprint .ms-hud .g-stat{flex:1;max-width:150px;padding:8px 10px;border-radius:16px;background:rgba(255,255,255,.16)}
.gm-math-sprint .ms-hud .k{color:rgba(255,255,255,.75)}
.gm-math-sprint .ms-hud .v{color:#fff}
.gm-math-sprint .ms-t.low{color:#ffd0d6}
.gm-math-sprint .ms-x{display:inline-block;padding:1px 11px;border-radius:999px;background:rgba(255,255,255,.2);font-size:18px;font-weight:900;line-height:1.35;vertical-align:2px}
.gm-math-sprint .ms-x.hot{background:#ffd166;color:#7a4b00}
.gm-math-sprint .ms-x.bump{animation:gmMsBump .5s var(--spring)}
.gm-math-sprint .ms-stage{position:relative;width:100%;height:clamp(84px,15vw,112px)}
.gm-math-sprint .ms-prob{position:absolute;inset:0;display:grid;place-items:center;border-radius:24px;background:#fff;color:var(--ink);font:900 clamp(40px,10vw,68px)/1 var(--sans);letter-spacing:-.02em;word-spacing:.06em;font-variant-numeric:tabular-nums lining-nums;white-space:nowrap;box-shadow:0 7px 0 rgba(0,50,75,.35);transition:transform .22s var(--ease),opacity .18s var(--ease)}
.gm-math-sprint .ms-prob.pre{transform:translateY(26px) scale(.96);opacity:0;transition:none}
.gm-math-sprint .ms-prob.out{transform:translateY(-30px) scale(.96);opacity:0}
.gm-math-sprint .ms-prob.good{background:#22b07d;color:#fff}
.gm-math-sprint .ms-prob.miss{background:#ef4f4f;color:#fff}
.gm-math-sprint .ms-note{height:18px;margin:-2px 0 -4px;font-size:13.5px;font-weight:800;color:#fff;opacity:0;font-variant-numeric:tabular-nums;white-space:nowrap}
.gm-math-sprint .ms-note b{color:#ffd166}
.gm-math-sprint .ms-note.show{animation:gmMsNote 1.8s var(--ease)}
.gm-math-sprint .ms-in{width:min(230px,100%);height:58px;text-align:center;font-size:28px;font-weight:900;font-variant-numeric:tabular-nums;caret-color:var(--accent);border-color:#fff;box-shadow:0 4px 0 rgba(0,50,75,.3)}
.gm-math-sprint .ms-in:disabled{background:#fff;color:var(--ink)}
.gm-math-sprint .ms-in.shake{animation:gmMsShake .38s;border-color:var(--bad)}
.gm-math-sprint .ms-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:min(300px,100%);margin-top:2px}
.gm-math-sprint .ms-pad button{height:50px;border:0;border-radius:14px;background:#fff;color:var(--ink);font:900 21px/1 var(--sans);font-variant-numeric:tabular-nums;cursor:pointer;touch-action:manipulation;box-shadow:0 4px 0 rgba(0,50,75,.35)}
.gm-math-sprint .ms-pad button:active{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,50,75,.35);background:#e9f6fb}
.gm-math-sprint .ms-pad .ms-skip{grid-column:1/-1;height:44px;font-size:15px;background:#ffd166;color:#7a4b00}
@media (pointer:fine){.gm-math-sprint .ms-pad button{height:42px;font-size:18px}.gm-math-sprint .ms-pad .ms-skip{height:38px;font-size:14px}}
@media (max-width:520px){.gm-math-sprint{min-height:0}.gm-math-sprint .ms-hud .g-stat{padding:6px 4px}}
@keyframes gmMsBump{40%{transform:scale(1.25)}}
@keyframes gmMsShake{20%{transform:translateX(-7px)}40%{transform:translateX(6px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
@keyframes gmMsNote{0%{opacity:0;transform:translateY(4px)}12%,70%{opacity:1;transform:none}100%{opacity:0}}
`,
    mount(root, api) {
      let touch = matchMedia('(pointer: coarse)').matches;
      const saved = api.load() || {};
      const bests = saved.bests && typeof saved.bests === 'object' ? saved.bests : {};
      const sel = { mode: MS_MODES.some(m => m[0] === saved.mode) ? saved.mode : 'mixed', dur: ['30', '60', '120'].includes(saved.dur) ? saved.dur : '60' };
      const persist = () => api.save({ bests, mode: sel.mode, dur: sel.dur });
      root.innerHTML = menu('Quiz', 'Math Sprint', `Type each answer and it locks in the moment it is right. Every five in a row raises your multiplier, up to ${TIMES}4. Hard mode scores double.`) +
        `<div class="gm-play" hidden><div class="ms-bar"><i></i></div>
        <div class="g-hud ms-hud"><div class="g-stat"><span class="k">Time</span><span class="v ms-t">60</span></div><div class="g-stat"><span class="k">Solved</span><span class="v ms-n">0</span></div><div class="g-stat"><span class="k">Streak</span><span class="v"><b class="ms-x">${TIMES}1</b></span></div></div>
        <div class="ms-stage"></div><div class="ms-note"></div>
        <input class="g-input ms-in" type="text" inputmode="numeric" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" maxlength="6" aria-label="Your answer" disabled>
        <div class="ms-pad">${[...'123456789', MINUS, '0', 'del'].map(k => `<button type="button" tabindex="-1" data-k="${k}"${k === 'del' ? ' aria-label="Delete">⌫' : `>${k}`}</button>`).join('')}<button type="button" tabindex="-1" class="ms-skip" data-k="skip">Skip</button></div></div>`;
      const $ = s => root.querySelector(s);
      const mn = $('.mn'), playEl = $('.gm-play'), bestEl = $('.mn-b');
      const barI = $('.ms-bar i'), tEl = $('.ms-t'), nEl = $('.ms-n'), xEl = $('.ms-x'), stage = $('.ms-stage'), note = $('.ms-note'), input = $('.ms-in'), pad = $('.ms-pad');
      const key = () => sel.mode + '|' + sel.dur, modeName = () => MS_MODES.find(m => m[0] === sel.mode)[1];
      const showBest = () => { bestEl.textContent = bests[key()] ? `Best in ${modeName()} · ${sel.dur} s: ${bests[key()]}` : 'No score in this mode yet'; };
      $('.mn-x').append(segBar([['mode', MS_MODES], ['dur', [['30', '30 s'], ['60', '60 s'], ['120', '120 s']]]], sel, () => { showBest(); persist(); }));
      showBest();
      input.readOnly = touch;

      root.addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && !touch) { touch = true; input.readOnly = true; input.blur(); } }, true);
      let state = 'menu', DUR = 60, left = 0, shown = 0, score = 0, solved = 0, missed = 0, streak = 0, cur = null, probEl = null, gen = mathProblem, worth = 10;
      const mult = () => Math.min(4, 1 + Math.floor(streak / 5));

      function setMult(bump) {
        const m = mult();
        xEl.textContent = TIMES + m;
        xEl.classList.toggle('hot', m > 1);
        if (bump) restart(xEl, 'bump');
      }
      function show(how) {
        const old = probEl;
        if (old) { if (how) old.classList.add(how); old.classList.add('out'); api.timeout(() => old.remove(), 300); }
        let p = gen(solved);
        if (cur && p[0] === cur[0]) p = gen(solved);
        cur = p;
        probEl = document.createElement('div');
        probEl.className = 'ms-prob pre';
        probEl.textContent = p[0];
        stage.append(probEl);
        void probEl.offsetWidth;
        probEl.classList.remove('pre');
        input.value = '';
      }
      function solve() {
        const m = mult();
        streak++; solved++; score += worth * m;
        api.score(score); nEl.textContent = solved;
        const up = mult() > m;
        setMult(up);
        api.sfx(up ? 'good' : 'pop');
        show('good');
      }
      function miss() {
        if (state !== 'play') return;
        missed++; streak = 0; setMult(false);
        note.innerHTML = `${cur[0]} = <b>${String(cur[1]).replace('-', MINUS)}</b>`;
        restart(note, 'show'); restart(input, 'shake');
        api.sfx('bad');
        show('miss');
      }
      function check() {
        let v = input.value.replace(/[−–]/g, '-').replace(/[^\d-]/g, '');
        v = ((v[0] === '-' ? '-' : '') + v.replace(/-/g, '')).slice(0, 6);
        if (input.value !== v) input.value = v;
        if (state === 'play' && /\d/.test(v) && +v === cur[1]) solve();
      }
      function enter() {
        if (state === 'play' && /\d/.test(input.value)) miss();
      }
      function press(k) {
        if (state !== 'play') return;
        if (k === 'skip') return miss();
        const v = input.value;
        input.value = k === 'del' ? v.slice(0, -1) : k === MINUS ? (v[0] === '-' ? v.slice(1) : '-' + v) : v + k;
        check();
      }
      function start() {
        if (state === 'play') return;
        mn.hidden = true; playEl.hidden = false;
        DUR = +sel.dur; gen = MATH[sel.mode]; worth = sel.mode === 'hard' ? 20 : 10;
        left = DUR; shown = DUR; score = 0; solved = 0; missed = 0; streak = 0;
        api.score(0); tEl.textContent = DUR; nEl.textContent = 0;
        tEl.classList.remove('low'); barI.classList.remove('low'); barI.style.transform = 'scaleX(1)';
        setMult(false);
        stage.textContent = ''; probEl = null; cur = null;
        show();
        state = 'play';
        input.disabled = false;
        if (!touch) input.focus({ preventScroll: true });
      }
      function showMenu() { state = 'menu'; playEl.hidden = true; mn.hidden = false; showBest(); }
      function finish() {
        state = 'done';
        input.blur(); input.disabled = true;
        const k = key(), prev = bests[k] || 0;
        if (score > prev) { bests[k] = score; persist(); }
        const tries = solved + missed, isBest = api.submit(score);
        if (isBest || (prev && score > prev)) confetti(root, api);
        api.sfx(isBest ? 'win' : 'good');
        api.overlay({
          kicker: isBest ? 'New best!' : `${modeName()} · ${DUR} s`,
          title: score ? `${score} points` : 'Out of time',
          stats: [['Solved', solved], ['Accuracy', tries ? Math.round(100 * solved / tries) + '%' : '—'], ['Mode best', Math.max(prev, score)]],
          button: 'Play again', onAction: start,
          secondary: 'Change mode', onSecondary: showMenu
        });
      }

      input.addEventListener('input', check);
      input.addEventListener('animationend', () => input.classList.remove('shake'));
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); enter(); } });
      pad.addEventListener('mousedown', e => e.preventDefault());
      pad.addEventListener('pointerdown', e => { const b = e.target.closest('[data-k]'); if (b && e.button === 0) { e.preventDefault(); press(b.dataset.k); } });
      tap(mn, '.mn-go', start);
      api.on(window, 'keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (state === 'menu') { if (!e.repeat && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); start(); } return; }
        if (state !== 'play' || (e.target === input && !input.readOnly)) return;
        const k = /^\d$/.test(e.key) ? e.key : e.key === '-' ? MINUS : e.key === 'Backspace' ? 'del' : e.key === 'Enter' ? 'enter' : '';
        if (!k) return;
        e.preventDefault();
        if (k === 'enter') enter(); else press(k);
        if (!touch) input.focus({ preventScroll: true });
      });
      api.loop(dt => {
        if (state !== 'play') return;
        left = Math.max(0, left - dt);
        barI.style.transform = `scaleX(${left / DUR})`;
        const s = Math.ceil(left);
        if (s !== shown) {
          shown = s; tEl.textContent = s;
          if (s <= 10) { tEl.classList.add('low'); barI.classList.add('low'); if (s > 0 && s <= 5) api.sfx('tick'); }
        }
        if (left <= 0) finish();
      });
    }
  });

  function scoreGuess(guess, answer) {
    const res = Array(5).fill('absent'), left = {};
    for (let i = 0; i < 5; i++) {
      if (guess[i] === answer[i]) res[i] = 'correct';
      else left[answer[i]] = (left[answer[i]] || 0) + 1;
    }
    for (let i = 0; i < 5; i++) {
      if (res[i] !== 'correct' && left[guess[i]] > 0) { res[i] = 'present'; left[guess[i]]--; }
    }
    return res;
  }

  const ORD = ['1st', '2nd', '3rd', '4th', '5th'];
  function hardMiss(guess, hist) {
    for (const [p, res] of hist) {
      for (let i = 0; i < 5; i++) if (res[i] === 'correct' && guess[i] !== p[i]) return `${ORD[i]} letter must be ${p[i].toUpperCase()}`;
      const need = {};
      for (let i = 0; i < 5; i++) if (res[i] !== 'absent') need[p[i]] = (need[p[i]] || 0) + 1;
      for (const ch in need) {
        let n = 0;
        for (const x of guess) if (x === ch) n++;
        if (n < need[ch]) return `Guess must contain ${ch.toUpperCase()}` + (need[ch] > 1 ? ` ${need[ch]} times` : '');
      }
    }
    return '';
  }

  const WG_ANSWERS = 'abbey abort above abuse actor acute adapt adept admit adopt adore adult after again agent agile agree ahead alarm album alert alien align alike alive allow alone along alter amaze amber ample angel anger angle angry ankle apart apple apply apron arena argue arise armor aroma arrow aside asset audio audit avoid awake award aware awful bacon badge badly bagel baker basic basin batch beach beard beast begin being belly below bench berry birth black blade blame bland blank blast blaze bleak blend bless blind blink bliss block blond blood bloom blown bluff blunt blush board boast bonus boost booth bound brain brake brand brave bread break breed brick bride brief bring brisk broad broke brook broom brown brush build built bunch burst buyer cabin cable camel candy canoe cargo carry catch cause cedar chain chair chalk charm chart chase cheap check cheek cheer chess chest chief child chill choir chord chose civic civil claim clamp clash class clean clear clerk click cliff climb cling clock close cloth cloud clown coach coast cobra cocoa comet comic coral couch cough count court cover crack craft crane crash crawl crazy cream creek crisp cross crowd crown crude cruel crumb crush crust cubic curve cycle daily dairy daisy dance dealt death debut decay delay delta dense depth diary digit diner dirty ditch dizzy dodge doubt dough dozen draft drain drama drawn dream dress drift drill drink drive drove dwarf eager eagle early earth easel eaten eight elbow elder elect elite empty enemy enjoy enter entry equal error essay event every exact exist extra fable faint fairy faith false fancy fault feast fence ferry fever fiber field fifth fight final first flame flash fleet flesh flint float flock flood floor flour fluid flute focus foggy force forge forty found frame fresh front frost fruit fully funny gauge ghost giant given glass globe glory glove grace grade grain grand grape graph grass grave great greed green greet grief grill grind groan group grove guard guess guest guide habit happy harsh hatch heart heavy hedge hello hobby honey honor horse hotel house human humor hurry ideal image index inner input issue ivory jelly jewel joint jolly judge juice kayak knife knock known label labor large laser later laugh layer learn lemon level light limit linen liver local lodge logic loose lucky lunar lunch magic major maple march match mayor medal melon mercy merit metal meter might minor model money month moral motor mount mouse mouth movie music naive nerve never night noble noise north novel nurse ocean offer often olive onion opera orbit order other otter outer owner paint panel panic paper party pasta patch pause peace peach pearl pedal penny phase phone photo piano piece pilot pitch pixel pizza place plain plane plant plate plaza point polar porch pound power press price pride prime print prize proof proud pulse punch pupil puppy purse queen quest quick quiet quilt quite quote radio raise rally ranch range rapid raven reach react ready realm rebel refer relax reply rider ridge rifle right rigid rival river roast robin robot rocky rough round route royal rural salad sauce scale scarf scene scent scoop score scout screw shade shake shape share shark sharp sheep sheet shelf shell shift shine shirt shock shore short shout sight silly since skate skill skirt skull slate sleep slice slide slope small smart smell smile smoke snack snake sneak solar solid solve sound south space spare spark speak speed spell spend spice spike spine spoon sport spray squad stack staff stage stair stamp stand start state steam steel steep stick still stone stood store storm story stove straw strip study stuff style sugar sunny super sweet swift swing sword table taste teach teeth thank theme thick thief thing think third thorn three throw thumb tiger timer title toast today token tooth topic torch total touch tough tower toxic trace track trade trail train trait treat trend trial tribe trick truck truly trunk trust truth tulip twist uncle under union unity until upper upset urban usual valid value valve video vinyl virus visit vital vivid vocal voice wagon waste watch water whale wheat wheel while white whole woman world worry worth wound write wrong yacht yeast yield young youth zebra'.split(' ');
  const WG_VALID = new Set([...WG_ANSWERS, ...'aback abase abate abbot abhor abide abode about abyss ached aches acids acing acorn acres acrid acted adage added adder adobe adorn aegis affix afire afoot afoul agape agate agave aging aglow agony agora aided aides ailed aimed aired aisle algae alias alibi alkyl allay alley allot alloy aloft aloof aloud alpha altar altos amass amble amend amino amiss amity among amped amply amuck amuse angst anime anise annex annoy annul anode antsy anvil aorta aptly arbor ardor areas argon armed arose array arson artsy ascot ashen ashes asked askew assay atlas atoll atoms atone attic aught augur aunts aunty aural auras autos avail avert avian await awash awoke axial axiom axles azure backs baggy bails baked bakes balls balmy banal bands bangs banjo banks barbs bards bared barge barks barns baron basal based bases basil basis baste bathe baths baton bawdy bayou beads beady beaks beams beans bears beats beaux beech beefs beefy beeps beers befit began begat begun beige belch belie belle bells belts bends bendy beret berth beset bests betas bevel bicep bidet bight bigot biker bikes bilge bills binds binge bingo biome birch birds bison biter bites blabs blare blase bleat bleed bleep blimp bling blips blitz bloat blogs bloke blows bluer blurb blurs blurt boats bodes bogus boils bolts bombs bonds boned bones booed books booms boots booty booze boozy borax bored bores borne boron bosom boson bossy botch bough bouts bowed bowel bowls boxed boxer boxes bozos brace brags braid brash brass brats bravo brawl brawn brays brews briar bribe brine brink briny broil brood broth brunt brute bucks buddy budge buffs buggy bugle bulbs bulge bulky bulls bully bumps bumpy bunny buoys burbs burly burns burnt burps burro buses bushy busts butte bylaw bytes byway cacao cache cacti cadet cadre cafes caged cages cagey cairn cakes calls calms calyx cameo camps canal canes canny canon caped caper capes carat cards cared cares carny carob carol carts carve cased cases caste casts cater caved caves cease ceded cello cells cents chafe chaff champ chant chaos chaps chasm chats cheat cheep chefs chemo chews chick chide chili chime chimp chins chips chirp chock choke chomp chops chore chuck chump chums chunk churn chute cider cigar cinch circa cited cites clack clade clams clang clank clans claps clasp claws clays cleat cleft clink clips cloak clods clogs clone clots clout clove clubs cluck clued clues clump clung clunk coals coats cocky codec coded codes codex coeds coils coins colas colds colic colon color colts comas combo combs comes comfy comma conch condo cones conga conic cooks cools copes cords cores corks corns corny corps costs could coupe coups coven covet cowed cower crabs crags cramp crank crass crate crave craze creak credo creed creep crepe crept crest crews cribs cried crier cries crime crimp croak crock crone crony crook croon crops crows crypt cubed cubes cuffs cults cumin cuppa curbs cured cures curls curly curry curse curvy cushy cutie cynic cysts daddy dally dandy dared dares darks darts dated dates datum daunt dawns dazed deals deans dears debit debts debug decaf decal decks decor decoy decry deeds deems defer deity delve demon demos demur denim dents depot derby desks deter detox deuce devil dials diced dicey diets dilly dimer dimes dimly dinar dined dines dings dingy dinky diode dippy disco discs disks ditto ditty ditzy divas dived diver dives divvy docks dodgy doers doggy dogma doing dolls dolly domed domes donor donut doors doozy doped dopes dopey dorks dorky dorms dosed doses dotes douse doves dowdy dowel downs downy dowry dozed dozer drags drake drank drape drawl draws dread dregs dried drier dries drips droll drone drool droop drops dross drown drugs drums drunk dryer dryly ducal duchy ducks ducts dudes duels duets dukes dully dummy dumps dumpy dunce dunes dunks duped dusky dusts dusty duvet dweeb dwell dwelt dying earns eased eases eater eaves ebony ebook edema edged edges edict edits eerie egret eject eking elegy elfin elope elude elves email embed ember emcee emits enact ended endow enema ennui ensue envoy epics epoch epoxy equip erase erect erode erred erupt ether ethic ethos evade evict evoke exalt exams excel execs exert exile exits expel expos extol exult faced faces facet facts faded fades fails fairs faked faker fakes falls famed fangs farce fared fares farms fatal fated fates fatty fauna favor faxed faxes fears feats feeds feels feign feint fella felon femur feral ferns fetal fetch fetus feuds fewer fibre ficus fiefs fiend fiery fifty filed files filet fills filly films filth finch finds fined finer fines fired fires firms fishy fists fiver fives fixed fixer fixes fizzy fjord flags flail flair flake flaky flank flaps flare flask flaws fleas fleck flees flick flier flies fling flips flirt flops flora floss flout flown flows fluff fluke flung flunk flush foals foams foamy focal foils folds folio folks folly fonts foods fools foray forgo forks forms forte forth forts forum fouls fours foxes foyer frail frank fraud freak freed frees frets friar fried fries frill frisk frock frogs froth frown froze fudge fuels fugue fumed fumes funds fungi funky furor furry fused fuses fussy futon fuzzy gable gaffe gains gales galls gamer games gamma gamut gangs gases gassy gated gates gaudy gaunt gauze gavel gazed gazes gears geeks geeky geese genes genie genre gents genus germs getup ghoul giddy gifts girls girly girth giver gives gizmo glade gland glare glaze gleam glean glebe glens glide glint glitz gloat gloom gloss glows glued glues glyph gnash gnats gnome goals goats godly gofer going golds golem golfs golly goner goods goody gooey goofy goose gorge gouge gourd gowns grabs graft grail grams grant grasp grate gravy graze grids grime grimy grins gripe grips grits groin groom grope gross grout growl grown grows grubs gruel gruff grump grunt guava guild guile guilt guise gulag gulch gulfs gulls gully gulps gummy gurus gushy gusto gusts gusty gutsy hacks hacky haiku hails hairs hairy halls halts halve hands handy hangs hanky hardy harem hares harms harps harpy haste hasty hated hater hates hauls haunt haven havoc hazel heads heady heals heaps heard hears heath heats heave heels hefty heirs heist helix hells helms helps hence herbs herds heron hexes hides highs hiked hiker hikes hills hilly hinge hints hippo hippy hired hires hissy hitch hives hoard hocks hoist hokey holds holed holes holly homes honed honks hoods hooey hooks hooky hoops hoped hopes horde horns hosed hoses hosts hotly hound hours hovel hover howdy howls hubby huffy hullo hulls humid humph humps humus hunch hunks hunky hunts hurts husks husky hutch hydra hyena hymns hyped hyper icing icons ideas idiom idiot idled idols igloo imams imply inane inbox incur indie inept inert infer ingot inked inlay inlet intro ionic irate irked irons irony isles islet itchy items jacks jaded jails jaunt jazzy jeans jeeps jerks jerky jests jetty jiffy jocks joins joist joked joker jokes jolts joust juicy julep jumbo jumps jumpy junky junta juror kabob kaput kebab keeps kendo ketch keyed khaki kicks kiddo kills kilns kilos kinds kings kinks kiosk kites kitty kiwis klutz knack knave knead kneed kneel knees knelt knits knobs knoll knots knows koala kooks kooky kopek kudos laced laces lacks laden ladle lager laity lakes lambs lamps lance lands lanes lanky lapel lapse larch larva lasso lasts latch lathe latte lawns leads leafy leaks leaky leans leant leaps leapt lease leash least leave ledge leech lefty legal leggy lemma lemur lends leper levee lever libel licks liege lifer lifts liked liken likes lilac limbo limbs limes limps lined liner lines lingo links lions lipid lippy lists liter lithe lived lives livid llama loads loans loath lobby lobed lobes locks locus lofts lofty login logos loner looks looms loony loops loopy lords lorry loser loses lotto lotus louse lousy loved lover loves lovey lower lowly loyal lucid lucks lumen lumps lumpy lunge lungs lupin lupus lurch lured lures lurid lurks lusts lying lymph lyric macho macro madam madly magma maids mails maize maker makes males malls manes manga mango mangy mania manic manly manor manse marks marry marsh masks mason masts mated mates matey maths matte mauve maxim maybe mazes meals means meant meats meaty media medic meets melee melts memos menus merge merry messy metre metro midge midst miles milks milky mills mimes mimic mince minds mined miner mines mints minty minus mirth miser mists misty mites mitre mixed mixer mixes moans moats mocha mocks modal modem modes mogul moist molar molds moldy moles monks mooch moods moody moons moose moped mopes mopey moray moron morph mosey mossy motel moths motif motto mould mound mourn mousy moved mover moves mowed mower mucus muddy mufti muggy mulch mules mummy mumps munch mural murky muses mushy musty muted myths nacho nadir nails naked named names nanny nappy nasal nasty natty naval navel neato necks needs needy neigh nerds nerdy nests newer newly nicer niche niece nifty nines ninja ninny ninth nippy nixed nobly nodes noisy nomad noons noose norms nosed noses nosey notch noted notes nouns nudge nuked nutty nylon nymph oasis oaths obese obeys obits oboes occur ochre oddly odors odour ogres oiled older oldie omega omens omits onset oomph oozes opens opine opium optic organ ought ounce outdo outed ovary ovate ovens overt ovoid owing owned oxide ozone paced pacer paces packs pagan paged pager pages pails pains pairs paled paleo paler pales palms palsy panda panes pangs pants papal parka parks parse parts paste pasts pasty paths patio paved pawns payee payer peaks peaky pears pecan pecks peeks peels peeps peers peeve pelts penal pence penne peony peppy perch peril perks perky perps pesky pesos pesto pests petal petty phage phony picks picky piers piety piggy piled piles pills pinch pines pinks pinky pints pious piped piper pipes pithy pivot pixie plaid plait plank plans plays plead pleas pleat plied plots plows pluck plugs plumb plume plump plums plush poach poems poets poise poked poker pokes poles polio polka polls ponds pooch pools popes poppy pores ports posed poser poses posse posts potty pouch pours pouty prank prawn prays preen preys prick pried pries prior prism privy probe promo proms prone prong props prose prove prowl proxy prude prune psalm psych pudgy puffs puffy puked pulls pumas pumps punks punts puree purer purge pushy putty pylon quack quail quake qualm quart quasi quays quell query queue quill quips quirk quits quota quoth rabbi rabid raced racer races racks radar radii radon rafts raged rages raids rails rains rainy rajah raked rakes ramps ranks rants rarer rated rates ratio ratty raved raves rayon razed razor reads rears rebut recap recur redid redox reeds reefs reeks reels refit regal rehab reign reins relay relic remit remix renal renew rents repay repel rerun reset resin rests retro retry reuse revel revue rhino rhyme rides riffs rifts rigor riled rinds rings rinks rinse riots ripen riper risen rises risks risky rites ritzy rivet roach roads roams roars robes rocks rodeo rogue roles rolls rondo roofs rooms roomy roost roots roped ropes roses rotor rouge rouse roust rover rowdy rowed rower rubes ruddy rugby ruins ruled ruler rules rumba rummy rumor runes runic runny rupee rusts rusty sable sadly safer safes sagas sages sails saint sales salon salsa salts salty salve samba sands sandy saner sappy sarge sassy satin satyr saucy sauna saute saved saver saves savor savvy sawed scabs scald scalp scaly scams scans scant scare scars scary scion scoff scold scone scoot scope scorn scour scowl scram scrap scrub scrum scuba scuff seals seams seats sects sedan sedge seeds seedy seeks seems seeps seers segue seize sells semis sends sense sepia serfs serif serum serve setup seven sever sewed sewer sexes shack shady shaft shaky shale shall shame shank shard shave shawl sheaf shear sheds sheen sheer sheik shied shins shiny ships shire shirk shoal shoes shone shook shoot shops shots shove shown shows showy shred shrew shrub shrug shunt shush shuts shyly sicko sided sides sidle siege sieve sighs sigma signs silks silky sinew singe sings sinks sinus sired siren sitar sited sites sixes sixth sixty sized sizes skids skied skier skies skiff skimp skink skins skips skits skulk skunk slabs slack slain slams slang slant slaps slash slave slays sleds sleek sleet slept slick slime slimy sling slink slips slits slobs sloop slosh sloth slots slows slugs slump slums slung slunk slurp slush slyly smack smash smear smelt smirk smite smock smoky snags snail snaps snare snarl sneer snide sniff snipe snobs snoop snore snort snout snows snowy snuck snuff soaps soapy soars sober socks sodas sofas softy soggy soils soles solos sonar songs sonic sooth sooty sorry sorts souls soups soupy souse sowed spade spank spans spars spasm spate spawn spear speck specs spelt spent sperm spews spicy spied spiel spies spiky spill spilt spins spiny spire spite spits splat split spoil spoke spoof spook spool spore spots spout spree sprig spurn spurs spurt squab squat squid stabs stags staid stain stake stale stalk stall stank stare stark stars stash stats stave stays steak steal steed steer stems steno steps stern stews stiff sting stink stint stirs stock stoic stoke stole stomp stony stool stoop stops stork stout strap stray strep strut stubs stuck studs stump stung stunk stunt stupa suave suing suite suits sulfa sulky sunup surfs surge surly sushi sutra swabs swamp swans swaps swarm swath swear sweat sweep swell swept swill swims swine swipe swirl swish swoon swoop swore sworn swung synch synod synth syrup tabby taboo tacit tacks tacky tacos taffy taiga tails taint taken taker takes tales talks tally talon tamed tamer tango tangy tanks tapas taped taper tapes tardy tarot tarts tasks tasty taunt tawny taxed taxes taxis taxon teams tears teary tease techs teddy teeny telex tells telly tempo temps tempt tends tenet tenor tense tenth tents tepid terms terns tests testy tetra texts thane thaws theft their there these theta thigh thins thong those threw throb thugs thump thyme tiara tibia ticks tidal tides tiers tight tilde tiled tiles tilts timed times timid tinge tipsy tired tires titan tithe tizzy toads togas tombs tonal toned tones tongs tonic tonne tools topaz torso torus totem tours towed towel towns toxin toyed tract tramp traps trash trawl trays tread trees triad tried tries trill trims trios tripe trips trite troll troop trope trout trove truce truer trump truss tryst tubby tubes tucks tulle tummy tumor tuned tuner tunes tunic turbo turns tutor tuxes tweak tweed tween tweet twerp twice twigs twine twins twirl twits tying tykes typed types tyres udder ulcer ultra uncut undid undue unfit unify unite units unlit unmet untie unwed unzip upped urged urges urine usage users usher using usurp utter vague valet valor vamps vapid vapor vases vault vegan veils veins venom vents venue verbs verge verse verve vests vexed vials vibes vicar vices views vigil vigor villa vines viola viper viral visas visor vista vixen vodka vogue voids volts vomit voted voter votes vouch vowed vowel vying wacky wades wafer waged wager wages wails waist waits waive waken wakes walks walls waltz wands waned wants wards wares warms warns warts wasps waved waver waves waxed waxes wears weary weave wedge weeds weedy weeks weeny weeps weepy weigh weird wells welts whack wharf where which whiff whims whine whiny whips whirl whisk whist whizz whoop whorl whose wicks widen wider widow width wield wimps wimpy winch winds windy wines wings winks wiped wiper wipes wired wires wiser wispy witch witty wives woken women wonky woody wooed woozy words wordy works worms wormy worse worst would woven wowed wraps wrath wreak wreck wrest wring wrist writs wrote wrung wryly yards yarns yawns yearn years yells yelps yodel yokel yours yucca yucky yummy zeros zesty zilch zippy zoned zones zooms'.split(' ')]);
  const WG_BACK = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="m17.5 9.5-5 5M12.5 9.5l5 5"/></svg>';
  const dayNo = () => { const d = new Date(); return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); };
  const dailyWord = day => WG_ANSWERS[(day * 7919) % WG_ANSWERS.length];

  Ameplay.register({
    id: 'word-guess',
    title: 'Five Letters',
    category: 'Puzzle',
    better: 'high',
    format: v => v + ' streak',
    width: 560,
    blurb: 'Find the hidden five-letter word in six guesses. Daily or unlimited.',
    help: 'Type a word and press <kbd>Enter</kbd> · <kbd>⌫</kbd> deletes · green = right spot · yellow = wrong spot · grey = not in the word',
    icon: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="17" width="8" height="8" rx="2"/><rect x="17" y="17" width="8" height="8" rx="2" fill="currentColor" opacity=".3"/><rect x="28" y="17" width="8" height="8" rx="2"/><rect x="39" y="17" width="8" height="8" rx="2"/><rect x="50" y="17" width="8" height="8" rx="2" fill="currentColor" opacity=".3"/><rect x="6" y="28" width="8" height="8" rx="2" fill="currentColor"/><rect x="17" y="28" width="8" height="8" rx="2" fill="currentColor"/><rect x="28" y="28" width="8" height="8" rx="2"/><rect x="39" y="28" width="8" height="8" rx="2" fill="currentColor"/><rect x="50" y="28" width="8" height="8" rx="2"/><rect x="6" y="39" width="8" height="8" rx="2" fill="currentColor"/><rect x="17" y="39" width="8" height="8" rx="2" fill="currentColor"/><rect x="28" y="39" width="8" height="8" rx="2" fill="currentColor"/><rect x="39" y="39" width="8" height="8" rx="2" fill="currentColor"/><rect x="50" y="39" width="8" height="8" rx="2" fill="currentColor"/></svg>',
    css: kitCss('word-guess') + `
.gm-word-guess{justify-content:flex-start;gap:clamp(8px,1.6vw,12px);padding:clamp(12px,2.4vw,20px);border-radius:20px;background:#fff;color:#121213;font-family:'Helvetica Neue',Arial,sans-serif}
.gm-word-guess .wg-bar{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap}
.gm-word-guess .seg{background:#f0f1f2}
.gm-word-guess .seg button[aria-pressed="true"]{color:#121213;box-shadow:0 1px 2px rgba(31,29,43,.08),0 4px 12px -6px rgba(63,125,57,.6)}
.gm-word-guess .wg-hard{display:inline-flex;align-items:center;gap:7px;height:42px;padding:0 14px;border:0;border-radius:999px;background:#f0f1f2;color:#5b5d60;font:700 13.5px/1 'Helvetica Neue',Arial,sans-serif;cursor:pointer;touch-action:manipulation}
.gm-word-guess .wg-hard::before{content:"";width:28px;height:16px;border-radius:999px;background:#878a8c;box-shadow:inset -12px 0 0 2px #fff;transition:background .2s,box-shadow .2s}
.gm-word-guess .wg-hard[aria-pressed="true"]{color:#121213}
.gm-word-guess .wg-hard[aria-pressed="true"]::before{background:#6aaa64;box-shadow:inset 12px 0 0 2px #fff}
.gm-word-guess .wg-info{margin:-2px 0 0;padding-bottom:10px;width:100%;text-align:center;border-bottom:1px solid #d3d6da;font-size:13px;font-weight:700;color:#5b5d60;font-variant-numeric:tabular-nums}
.gm-word-guess .wg-grid{display:grid;gap:5px;width:clamp(200px,calc((100dvh - 540px) * .83),330px);max-width:100%}
.gm-word-guess .wg-grid.fresh{animation:gmWgIn .4s var(--ease)}
.gm-word-guess .wg-row{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}
.gm-word-guess .wg-row.shake{animation:gmWgShake .4s}
.gm-word-guess .wg-tile{aspect-ratio:1;display:grid;place-items:center;border:2px solid #d3d6da;border-radius:0;background:#fff;color:#121213;font:700 clamp(22px,5.8vw,32px)/1 'Helvetica Neue',Arial,sans-serif;text-transform:uppercase}
.gm-word-guess .wg-tile.filled{border-color:#878a8c}
.gm-word-guess .wg-tile.pop{animation:gmWgPop .1s}
.gm-word-guess .wg-tile.flip{animation:gmWgFlip .26s linear}
.gm-word-guess .wg-tile.jump{animation:gmWgJump .55s var(--ease) both}
.gm-word-guess .wg-tile.correct{background:#6aaa64;border-color:#6aaa64;color:#fff}
.gm-word-guess .wg-tile.present{background:#c9b458;border-color:#c9b458;color:#fff}
.gm-word-guess .wg-tile.absent{background:#787c7e;border-color:#787c7e;color:#fff}
.gm-word-guess .wg-kb{display:flex;flex-direction:column;gap:8px;width:min(500px,100%)}
.gm-word-guess .wg-kr{display:flex;justify-content:center;gap:6px}
.gm-word-guess .wg-kb button{flex:1 1 0;min-width:0;max-width:43px;height:58px;padding:0;display:grid;place-items:center;border:0;border-radius:4px;background:#d3d6da;color:#121213;font:700 14px/1 'Helvetica Neue',Arial,sans-serif;text-transform:uppercase;cursor:pointer;touch-action:manipulation}
.gm-word-guess .wg-kb button.wide{flex-grow:1.55;max-width:66px;font-size:12px}
.gm-word-guess .wg-kb button:active{filter:brightness(.9)}
.gm-word-guess .wg-kb button.correct{background:#6aaa64;color:#fff}
.gm-word-guess .wg-kb button.present{background:#c9b458;color:#fff}
.gm-word-guess .wg-kb button.absent{background:#787c7e;color:#fff}
@media (max-width:640px){.gm-word-guess .wg-grid{width:clamp(200px,calc((100dvh - 500px) * .83),330px)}}
@media (max-width:420px){.gm-word-guess .wg-kb button{height:48px}.gm-word-guess .wg-kr{gap:4px}.gm-word-guess .seg button{padding:0 11px}.gm-word-guess .wg-hard{padding:0 11px}}
@keyframes gmWgIn{from{opacity:0;transform:translateY(8px)}}
@keyframes gmWgPop{50%{transform:scale(1.1)}}
@keyframes gmWgFlip{0%{transform:rotateX(0);animation-timing-function:ease-in}50%{transform:rotateX(90deg);animation-timing-function:ease-out}100%{transform:rotateX(0)}}
@keyframes gmWgJump{40%{transform:translateY(-16px)}70%{transform:translateY(2px)}}
@keyframes gmWgShake{20%{transform:translateX(-7px)}40%{transform:translateX(6px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
`,
    mount(root, api) {
      const FLIP = 260, RANK = { absent: 1, present: 2, correct: 3 }, STATES = ['correct', 'present', 'absent'];
      const saved = api.load() || {};
      let streak = Math.max(0, saved.streak | 0), recent = Array.isArray(saved.recent) ? saved.recent : [];
      let dStreak = Math.max(0, saved.dStreak | 0), dLast = saved.dLast | 0, live = !!saved.live;
      let daily = saved.daily && typeof saved.daily === 'object' && Array.isArray(saved.daily.g) ? saved.daily : null;
      const sel = { mode: saved.mode === 'unl' ? 'unl' : 'daily' };
      let hard = !!saved.hard;
      const persist = () => api.save({ streak, recent, dStreak, dLast, daily, live, mode: sel.mode, hard });
      if (live) {
        live = false;
        if (streak > 0) api.timeout(() => api.toast('Unfinished word counted as a loss'), 600);
        streak = 0; persist();
      }
      const key = k => k === '>' ? '<button type="button" tabindex="-1" class="wide" data-k="enter">Enter</button>'
        : k === '<' ? `<button type="button" tabindex="-1" class="wide" data-k="back" aria-label="Delete">${WG_BACK}</button>`
        : `<button type="button" tabindex="-1" data-k="${k}">${k}</button>`;
      root.innerHTML = `<div class="wg-bar"><button type="button" tabindex="-1" class="wg-hard" aria-pressed="false">Hard mode</button></div><p class="wg-info"></p>
        <div class="wg-grid">${('<div class="wg-row">' + '<div class="wg-tile"></div>'.repeat(5) + '</div>').repeat(6)}</div>
        <div class="wg-kb">${['qwertyuiop', 'asdfghjkl', '>zxcvbnm<'].map(r => `<div class="wg-kr">${[...r].map(key).join('')}</div>`).join('')}</div>`;
      const grid = root.querySelector('.wg-grid'), kb = root.querySelector('.wg-kb'), rows = [...grid.children], tiles = rows.map(r => [...r.children]);
      const hardB = root.querySelector('.wg-hard'), info = root.querySelector('.wg-info'), barEl = root.querySelector('.wg-bar');
      const keys = {};
      kb.querySelectorAll('[data-k]').forEach(b => { keys[b.dataset.k] = b; });
      let answer = '', row = 0, cur = '', busy = false, over = false, known = {}, hist = [], gen = 0;
      const curStreak = () => sel.mode === 'daily' ? dStreak : streak;
      const setInfo = () => {
        hardB.setAttribute('aria-pressed', String(hard));
        info.textContent = (sel.mode === 'daily' ? `Daily word · ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · daily streak ${dStreak}` : `Unlimited · win streak ${streak}`) + (hard ? ' · hard' : '');
        api.score(curStreak());
      };

      function clearBoard() {
        row = 0; cur = ''; busy = false; over = false; known = {}; hist = []; gen++;
        tiles.flat().forEach(t => { t.className = 'wg-tile'; t.textContent = ''; t.style.animationDelay = ''; });
        Object.values(keys).forEach(b => b.classList.remove(...STATES));
        restart(grid, 'fresh');
      }
      function markKeys(guess, res) {
        res.forEach((s, i) => {
          const k = guess[i];
          if (known[k] && RANK[known[k]] >= RANK[s]) return;
          known[k] = s;
          keys[k].classList.remove(...STATES);
          keys[k].classList.add(s);
        });
      }
      function begin() {
        clearBoard();
        if (sel.mode === 'daily') {
          const day = dayNo();
          answer = dailyWord(day);
          if (!daily || daily.day !== day || daily.g.some(g => typeof g !== 'string' || g.length !== 5)) daily = { day, g: [], done: false, won: false };
          if (dLast < day - 1) dStreak = 0;
          daily.g.slice(0, 6).forEach((g, r) => {
            const res = scoreGuess(g, answer);
            tiles[r].forEach((t, i) => { t.textContent = g[i]; t.className = 'wg-tile filled ' + res[i]; });
            markKeys(g, res); hist.push([g, res]);
          });
          row = Math.min(5, daily.g.length);
          if (daily.done || daily.g.length >= 6) { over = true; daily.done = true; const my = gen; api.timeout(() => { if (my === gen) dailyDone(); }, 350); }
        } else {
          const pool = WG_ANSWERS.filter(w => !recent.includes(w));
          answer = pick(pool.length ? pool : WG_ANSWERS);
          recent = recent.concat(answer).slice(-150);
        }
        persist(); setInfo();
      }
      function switchMode(m) {
        if (sel.mode === 'unl' && live && !over) { live = false; streak = 0; api.toast('Word abandoned · streak reset'); }
        sel.mode = m; modeBar.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === m)));
        api.hideOverlay();
        begin();
      }

      const modeBar = segBar([['mode', [['daily', 'Daily'], ['unl', 'Unlimited']]]], sel, () => { const m = sel.mode; sel.mode = m === 'daily' ? 'unl' : 'daily'; switchMode(m); });
      barEl.prepend(modeBar);
      function type(ch) {
        if (busy || over || cur.length >= 5) return;
        const t = tiles[row][cur.length];
        cur += ch;
        t.textContent = ch;
        t.classList.add('filled');
        restart(t, 'pop');
      }
      function back() {
        if (busy || over || !cur.length) return;
        cur = cur.slice(0, -1);
        const t = tiles[row][cur.length];
        t.textContent = '';
        t.classList.remove('filled', 'pop');
      }
      function reject(msg) {
        restart(rows[row], 'shake');
        api.toast(msg); api.sfx('bad');
      }
      function submit() {
        if (busy || over) return;
        if (cur.length < 5) return reject('Not enough letters');
        if (!WG_VALID.has(cur)) return reject('Not in word list');
        if (hard) { const m = hardMiss(cur, hist); if (m) return reject(m); }
        busy = true;
        const r = row, guess = cur, res = scoreGuess(guess, answer), my = gen;
        hist.push([guess, res]);
        if (sel.mode === 'daily') daily.g.push(guess); else live = true;
        persist();
        res.forEach((s, i) => {
          const t = tiles[r][i];
          api.timeout(() => { if (my !== gen) return; t.classList.remove('pop'); t.classList.add('flip'); }, i * FLIP);
          api.timeout(() => { if (my === gen) t.classList.add(s); }, i * FLIP + FLIP / 2);
        });
        api.sfx('tap');
        api.timeout(() => {
          if (my !== gen) return;
          markKeys(guess, res);
          if (guess === answer) win(r);
          else if (r === 5) lose();
          else { row++; cur = ''; busy = false; }
        }, 5 * FLIP + 30);
      }
      function win(r) {
        over = true;
        if (sel.mode === 'daily') { daily.done = true; daily.won = true; dStreak = dLast === daily.day - 1 ? dStreak + 1 : 1; dLast = daily.day; }
        else { streak++; live = false; }
        persist(); setInfo();
        const s = curStreak(), isBest = api.submit(s), my = gen;
        api.sfx('win');
        confetti(root, api);
        tiles[r].forEach((t, i) => { t.classList.remove('flip'); t.style.animationDelay = i * 90 + 'ms'; restart(t, 'jump'); });
        api.timeout(() => {
          if (my !== gen) return;
          if (sel.mode === 'daily') return dailyDone(isBest);
          api.overlay({
            kicker: isBest ? 'New best!' : 'Solved',
            title: ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'][r],
            text: `Solved in ${r + 1} ${r ? 'guesses' : 'guess'}${hard ? ' on hard mode' : ''}.`,
            stats: [['Word', answer.toUpperCase()], ['Win streak', streak], ['Best', api.best ?? '—']],
            button: 'Next word', onAction: begin
          });
        }, 1200);
      }
      function lose() {
        over = true;
        const lost = streak;
        if (sel.mode === 'daily') { daily.done = true; daily.won = false; dStreak = 0; }
        else { streak = 0; live = false; }
        persist(); setInfo();
        api.sfx('lose');
        const my = gen;
        api.timeout(() => {
          if (my !== gen) return;
          if (sel.mode === 'daily') return dailyDone();
          api.overlay({
            kicker: 'The word was',
            title: answer.toUpperCase(),
            text: lost ? `Your win streak of ${lost} ends here. A fresh word is waiting.` : 'A fresh word is waiting.',
            stats: [['Win streak', 0], ['Best', api.best ?? '—']],
            button: 'Next word', onAction: begin
          });
        }, 700);
      }
      function dailyDone(isBest) {
        const n = daily.g.length;
        api.overlay({
          kicker: isBest ? 'New best!' : daily.won ? 'Daily solved' : 'Daily missed',
          title: daily.won ? `Solved in ${n}` : answer.toUpperCase(),
          text: (daily.won ? '' : 'That was today’s word. ') + 'A new daily word arrives tomorrow. Unlimited mode has fresh words any time.',
          stats: [['Word', answer.toUpperCase()], ['Daily streak', dStreak], ['Best', api.best ?? '—']],
          button: 'Play unlimited', onAction: () => switchMode('unl'),
          secondary: 'See board'
        });
      }

      tap(hardB.parentNode, '.wg-hard', () => {
        if ((row > 0 || busy) && !over) return api.toast('Hard mode can only change before your first guess');
        hard = !hard; persist(); setInfo(); api.sfx('pop');
        api.toast(hard ? 'Hard mode: revealed hints must be used' : 'Hard mode off');
      });
      kb.addEventListener('pointerdown', e => {
        const b = e.target.closest('[data-k]');
        if (!b || e.button) return;
        e.preventDefault();
        const k = b.dataset.k;
        if (k === 'enter') submit(); else if (k === 'back') back(); else type(k);
      });
      api.on(window, 'keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === 'Enter') { e.preventDefault(); if (!e.repeat) submit(); }
        else if (e.key === 'Backspace') { e.preventDefault(); back(); }
        else if (/^[a-z]$/i.test(e.key)) type(e.key.toLowerCase());
      });

      begin();
    }
  });
})();

