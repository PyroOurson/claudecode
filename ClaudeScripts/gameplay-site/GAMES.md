# gameplay: game roadmap and tracker

Target: about 1000 games, added in waves of at most 100. Every game is a remake of a popular game (real name kept so it is searchable), and new waves focus on online multiplayer.

| Wave | Games | Status |
|---|---|---|
| 0 | 78 | Live (22 removed after player testing) |
| 1 | 122 | Planned (below), not started; brings the total to 200 |
| 2 to 9 | about 800 | Idea pool at the bottom |

## Quality bar (every game must pass before a wave ships)

1. Plays like the original: same rules, controls, goal and feel; a real start menu, game over / win screen and restart.
2. Polished look: proper models or drawn art, animations, effects and sound; no placeholder shapes.
3. Works with keyboard and with touch (phones and tablets), at the normal size, in theater and in fullscreen.
4. Multiplayer is online only, never same-screen. Every game uses the same party lobby: the host picks the party size, a code is generated (show/hide), players join by code or link with their saved username, the host can pass the crown or kick, there is a live chat, and the host presses Play. Only the party's real players are in the match; bots only if the host explicitly adds them. Host leaving and players leaving are handled; rematch and back to lobby.
5. Esc pauses (online games open their menu without freezing others).
6. No console errors; 60 fps on an ordinary laptop; loads only when opened.
7. Tested: solo run, multiplayer session with real separate browsers, phone layout.

## Removed after testing with 20 players

Doom, Vampire Survivors, Fireboy and Watergirl, Bomberman, Zuma, Atelier, Glide, Jetpack Joyride, Doodle Jump, Lights Out, Deep Miner, Angry Birds, Cut the Rope, Lane Racer, Galaga, Hill Climb Racing, Mini Golf, Asteroids, Strike 3D, Mario Kart, Tower Defense, Stick Hero.

## Wave 0 (live)

Minecraft, Geometry Dash, Subway Surfers, Crossy Road, Slither.io, Flappy Bird, Super Mario Bros., Rocket League, Slope, Tunnel Rush, Angry Birds, Bomberman, Fireboy and Watergirl, Paper.io, Agar.io, Hole.io, Plants vs. Zombies, Vampire Survivors, DOOM, Fall Guys, Basket Random, Tank Trouble, UNO, Cut the Rope, Moto X3M, Cookie Clicker, Bloxorz, Zuma, Battleship, Snake, Traffic Racer, Lane Racer, Tetris, 2048, Galaga, Hill Climb Racing, 8 Ball Pool, Helix Jump, Chrome Dino, Reaction, Chess, Minesweeper, Hoops 3D, Atelier, Fruit Ninja, Wordle, Sky Pilot, Mini Golf, Tank Arena, Bubble Shooter, Pairs, Target Range, Breakout, Asteroids, Penalty Kick, Stack, Sudoku, Marble Roll, Trivia, Space Invaders, Strike 3D, Mario Kart, Aim Trainer, Maze Escape 3D, Connect Four, Bejeweled, Asteroid Field, Glide, Jetpack Joyride, Rubik's Cube, Solitaire, Perfect Stop, Piano Tiles, Math Sprint, Tower Defense, Whack-a-Mole, Air Hockey, Typing Test, Pac-Man, Pulse, Checkers, Pong, Doodle Jump, Tic-Tac-Toe, Archery, Sequence, Pinball, Slide 15, Sokoban, Number Memory, Reversi, Lights Out, Pipe Mania, Knife Hit, Stick Hero, CPS Test, Chimp Test, Hangman, True or False, Deep Miner.

The 22 removed games above are still listed here for history. Online today: Rocket League (up to 6), UNO and Tank Trouble (up to 4), and 2-player online for Basket Random, Battleship, 8 Ball Pool, Chess, Connect Four, Air Hockey, Checkers, Pong, Tic-Tac-Toe, Reversi.

## Later (not started)

- Sign in with Google creating a profile with username and display name.
- Connect everything to Supabase: accounts (email, username, display name), stats, analytics events (the site already records them locally through `Ameplay.analytics`).

## Wave 1 plan (122 games, to reach 200)

Order is build order: simple 2D card and board games first, then party games, then the harder 2D and 3D games. Players: max online (bots fill empty seats where the game has opponents). "Ref" means a research folder exists in `references/`.

### Part A: cards (2D)
| # | Game | Players | Notes |
|---|---|---|---|
| 1 | Texas Hold'em Poker | 2-8 | Chips, blinds, side pots, showdown, all-in |
| 2 | Blackjack | 1-6 | Shared dealer table, split, double, insurance |
| 3 | Durak | 2-6 | Podkidnoy and Perevodnoy, trump, attack/defend |
| 4 | Belote (Coinche) | 4 | Teams, bidding, belote-rebelote, French deck |
| 5 | French Tarot | 3-5 | Bids, excuse, oudlers, chien |
| 6 | President | 3-8 | Ranks swap between rounds |
| 7 | Crazy Eights | 2-6 | Suit change on 8 |
| 8 | Go Fish | 2-6 | Ask, books |
| 9 | War | 2 | Fast flips, war piles |
| 10 | Hearts | 4 | Passing, shooting the moon |
| 11 | Spades | 4 | Teams, bids, bags |
| 12 | Euchre | 4 | Bowers, going alone |
| 13 | Gin Rummy | 2 | Melds, knock, gin |
| 14 | Rummikub | 2-4 | Tiles, table rearranging |
| 15 | Phase 10 | 2-6 | Phases, skips, wilds |
| 16 | Skip-Bo | 2-6 | Stock piles, building piles |
| 17 | Cheat (BS) | 3-8 | Bluff and call |
| 18 | Old Maid | 2-6 | Pairs, the last card |
| 19 | Speed (Spit) | 2 | Real-time, no turns |
| 20 | Exploding Kittens | 2-5 | Defuse, nope, attack, see the future |
| 21 | Coup | 2-6 | Bluffing roles, challenges, coins |
| 22 | Cribbage | 2 | Board pegging, crib |
| 23 | Spider Solitaire | solo | 1, 2 and 4 suits |
| 24 | FreeCell | solo | Numbered deals |
| 25 | Pyramid Solitaire | solo | Pairs to 13 |
| 26 | Mahjong Solitaire | solo | Turtle and other layouts |

### Part B: board (2D)
| # | Game | Players | Notes |
|---|---|---|---|
| 27 | Ludo | 2-4 | Captures, safe squares |
| 28 | Snakes and Ladders | 2-6 | Animated board |
| 29 | Monopoly | 2-6 | Trading, auctions, houses, jail |
| 30 | Backgammon | 2 | Doubling cube |
| 31 | Mancala | 2 | Kalah rules |
| 32 | Go | 2 | 9x9, 13x13, 19x19, scoring |
| 33 | Gomoku | 2 | Five in a row |
| 34 | Dots and Boxes | 2-4 | Grid sizes |
| 35 | Chinese Checkers | 2-6 | Star board |
| 36 | Dominoes | 2-4 | Draw and block |
| 37 | Yahtzee | 2-6 | Score sheet, three rolls |
| 38 | Scrabble | 2-4 | Dictionary check, premium squares |
| 39 | Boggle | 2-8 | Timed shared grid |
| 40 | Mastermind | 1-2 | Code breaking |
| 41 | Stratego | 2 | Hidden ranks, setup phase |
| 42 | Guess Who | 2 | Yes/no questions |
| 43 | Clue | 3-6 | Suggestions, accusation |
| 44 | Sorry! | 2-4 | Card-driven pawn race |
| 45 | Nine Men's Morris | 2 | Mills, flying |
| 46 | Blokus | 2-4 | Corner-touch placement |
| 47 | Quoridor | 2-4 | Walls, shortest path |
| 48 | Catan | 3-4 | Resources, trading, robber, longest road |
| 49 | Risk | 2-6 | World map, armies, cards |
| 50 | Mahjong (Riichi) | 4 | Hands, riichi, scoring |

### Part C: puzzle and word (2D, solo)
| # | Game | Notes |
|---|---|---|
| 51 | Word Search | Themes, timed |
| 52 | Mini Crossword | Daily grid |
| 53 | Nonogram (Picross) | Sizes 5 to 20 |
| 54 | Flow Free | Connect colours |
| 55 | Water Sort | Pour to sort colours |
| 56 | Unblock Me (Rush Hour) | Slide blocks out |
| 57 | Spelling Bee | Seven letters, pangram |
| 58 | Connections | Four groups of four |

### Part D: party and social (2D, online)
| # | Game | Players | Notes |
|---|---|---|---|
| 59 | Gartic Phone | 3-10 | Write, draw, guess chain; album replay. Ref |
| 60 | Skribbl.io | 2-10 | Draw and guess, hints, word choice |
| 61 | Werewolf (Wolvesville) | 5-16 | Night/day, Seer, Doctor, Witch, Hunter, votes, chat. Ref |
| 62 | Codenames | 4-10 | Teams, spymaster clues |
| 63 | Spyfall | 3-8 | Location cards, find the spy |
| 64 | Undercover | 3-12 | Secret words, find the impostors |
| 65 | Word Bomb (BombParty) | 2-8 | Word with the letters before it explodes |
| 66 | Kahoot-style quiz | 2-30 | Timed rounds, podium, question packs |
| 67 | Quiplash | 3-8 | Funny answers, head-to-head votes |
| 68 | Wavelength | 2-8 | Dial between two extremes |
| 69 | Petit Bac (Scattergories) | 2-10 | Letter, categories, votes |
| 70 | Bingo | 2-12 | Called numbers, several cards |
| 71 | Typeracer | 2-8 | Live typing race |
| 72 | Trivia Crack | 2 | Category wheel, crowns |

### Part E: harder 2D
| # | Game | Players | Notes |
|---|---|---|---|
| 73 | Terraria | 1-4 | Mining, building, crafting, bosses, co-op. Ref |
| 74 | Among Us | 4-10 | Tasks, vents, sabotage, meetings |
| 75 | Worms | 2-4 | Turn-based artillery, destructible terrain |
| 76 | Stick Fight | 2-4 | Physics stickman brawls |
| 77 | Smash Bros. style fighter | 2-4 | Damage percent, stocks |
| 78 | Brawl Stars | 2-6 | 3v3 gem grab, brawlers, supers |
| 79 | Surviv.io | 2-20 | Battle royale, loot, zone |
| 80 | Diep.io | 2-10 | Tank classes, upgrades |
| 81 | Bonk.io | 2-8 | Physics ball arena |
| 82 | Starve.io | 2-10 | Survival, crafting, day/night |
| 83 | Head Soccer | 2 | Big heads, power shots |
| 84 | Slime Volleyball | 2-4 | Classic slime volley |
| 85 | Basketball Legends | 2 | Arcade 1v1 with powers |
| 86 | Ragdoll Archers | 2 | Physics archery duel |
| 87 | Stickman Hook | solo | Swing physics levels |
| 88 | Vex 5 | solo | Parkour platformer |
| 89 | Happy Wheels | solo | Ragdoll obstacle courses |
| 90 | Getting Over It | solo | Hammer climbing |
| 91 | Tomb of the Mask | solo | Maze dash |
| 92 | Bloons TD | solo | Balloon tower defense |
| 93 | Papa's Pizzeria | solo | Orders, topping, baking |
| 94 | Retro Bowl | solo | Football management and play |
| 95 | Drift Boss | solo | One-button drifting |
| 96 | Tiny Fishing | solo | Idle fishing upgrades |
| 97 | Duck Life | solo | Train and race |
| 98 | Color Switch | solo | Colour gates |
| 99 | Eggy Car | solo | Keep the egg on |
| 100 | Friday Night Funkin' | solo | Rhythm battles |
| 101 | osu! | solo | Circles, sliders, spinners |
| 102 | Clash Royale style | 2 | Cards, elixir, towers |
| 103 | Balatro style | solo | Poker-hand roguelike, jokers |
| 104 | Little Alchemy 2 | solo | Combine elements |
| 105 | BitLife | solo | Life simulator choices |

### Part F: harder 3D
| # | Game | Players | Notes |
|---|---|---|---|
| 106 | Counter-Strike 2 | 2-10 | Dust II style map, buy menu, bomb, bots. Ref |
| 107 | PolyTrack | 1-8 | Time trial, track editor, ghosts, codes. Ref |
| 108 | Krunker | 2-8 | Fast FPS, classes, slide hops |
| 109 | Shell Shockers | 2-8 | Egg FPS |
| 110 | 1v1.LOL | 2-4 | Build fights |
| 111 | Smash Karts | 2-8 | Kart arena with weapons |
| 112 | Bedwars | 2-8 | Bed defense, shop, bridges |
| 113 | Tower of Hell | 2-8 | Obby race to the top |
| 114 | Murder Mystery 2 | 4-12 | Murderer, sheriff, innocents |
| 115 | Temple Run | solo | 3D endless runner |
| 116 | Snow Rider 3D | solo | Sled downhill |
| 117 | Drift Hunters | 1-8 | Drift scoring, tuning |
| 118 | Madalin Stunt Cars | 1-8 | Free roam, stunt park |
| 119 | Golf With Your Friends | 2-8 | Online mini golf |
| 120 | Bowling | 2-6 | Ten-pin with spin |
| 121 | Table Tennis | 2 | Spin and smashes |
| 122 | Only Up | 1-8 | 3D climbing |

## Idea pool for later waves

Online: Valorant-style tactical shooter, Fortnite-style battle royale, Roblox Murder Mystery, Roblox Doors, Jailbreak (cops and robbers), Agar-style Blob Wars, Hide and Seek (prop hunt), Tag, Capture the Flag, Paintball 2D, Pirate ship battles, Armor tanks (World of Tanks style), Dogfight planes, Space battle (Starblast), Snowball fight, Laser tag, Zombie co-op survival, Left 4 Dead style co-op, Dungeon crawler co-op, Rocket League Hoops/Dropshot modes, Football (FIFA style), Basketball 3v3, Baseball, Cricket, Rugby, Racing (Need for Speed style), Motorbike race, Boat race, Horse race, Chess variants (960, Bughouse), Shogi, Xiangqi, Connect Four variants, Pictionary, Charades, Taboo, Scattergories, Pictureka, Wordle battle, Sudoku race, Trivia battle royale, Name Place Animal Thing, Battleship Salvo, Air hockey 4P, Pong 4P, Snake battle royale, Tron light cycles, Bumper cars, Demolition derby, Cookie Clicker co-op.

Solo: Run 3, Slope 2, Cluster Rush, Rooftop Snipers, Cubefield, Super Hexagon, Tunnel Rush 2, Dino Run, Bad Ice Cream, Learn to Fly, Burrito Bison, Henry Stickmin, Riddle School, Super Meat Boy style, Celeste style, Hollow Knight style metroidvania, Stardew-style farm, Animal Crossing-style island, Pokemon-style monster catcher, Zelda-style adventure, Undertale-style RPG, Portal-style puzzle, Superhot-style shooter, Beat Saber-style rhythm, Guitar Hero, Osu!, Friday Night Funkin', Plants vs Zombies 2, Clash Royale-style card battler, Hearthstone-style card game, Balatro-style poker roguelike, Slay the Spire-style, Factorio-style automation, SimCity-style city builder, RollerCoaster Tycoon-style park, The Sims-style life, Hitman-style puzzle, Crossy Road 2, Flappy Dunk, Smash Hit, Alto's Adventure, Monument Valley, Two Dots, Candy Crush, Mahjong Solitaire, Spider Solitaire, FreeCell, Jigsaw puzzles, Nonograms, Kakuro, Wordscapes, Crossword.
