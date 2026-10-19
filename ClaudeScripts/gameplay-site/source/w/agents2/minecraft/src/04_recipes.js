  const TAGS = Object.create(null);
  const tagAdd = (t, ...ids) => { const s = TAGS[t] || (TAGS[t] = new Set()); for (const i of ids) if (IN[i]) s.add(IN[i].idx); };
  for (const w of WOODS) {
    const n = w.n;
    tagAdd('planks', n + '_planks');
    tagAdd('wooden_slabs', n + '_slab');
    tagAdd('wooden_buttons', n + '_button');
    if (w.bamboo) tagAdd('bamboo_logs', 'bamboo_block', 'stripped_bamboo_block');
    else if (w.nether) { tagAdd(n + '_logs', n + '_stem', n + '_hyphae', 'stripped_' + n + '_stem', 'stripped_' + n + '_hyphae'); tagAdd('logs', n + '_stem', n + '_hyphae', 'stripped_' + n + '_stem', 'stripped_' + n + '_hyphae'); }
    else { tagAdd(n + '_logs', n + '_log', n + '_wood', 'stripped_' + n + '_log', 'stripped_' + n + '_wood'); tagAdd('logs', n + '_log', n + '_wood', 'stripped_' + n + '_log', 'stripped_' + n + '_wood'); tagAdd('logs_burn', n + '_log', n + '_wood', 'stripped_' + n + '_log', 'stripped_' + n + '_wood'); }
  }
  tagAdd('coals', 'coal', 'charcoal');
  tagAdd('stone_craft', 'cobblestone', 'cobbled_deepslate', 'blackstone');
  tagAdd('wool', ...COLORS.map(c => c + '_wool'));
  tagAdd('sand', 'sand', 'red_sand');
  tagAdd('soul', 'soul_sand', 'soul_soil');
  tagAdd('eggs', 'egg', 'blue_egg', 'brown_egg');
  tagAdd('small_flowers', ...FLOWERS);
  tagAdd('stone_bricks', 'stone_bricks', 'mossy_stone_bricks', 'cracked_stone_bricks', 'chiseled_stone_bricks');
  tagAdd('quartz_blocks', 'quartz_block', 'chiseled_quartz_block', 'quartz_pillar', 'smooth_quartz');
  const RECIPES = [], SHAPELESS = [];
  const ing = v => { if (v == null) return null; if (v[0] === '#') { const s = TAGS[v.slice(1)]; if (!s) throw new Error('tag ' + v); return s; } const it = IN[v]; if (!it) throw new Error('item ' + v); return it.idx; };
  function shaped(rows, key, out, n, o) {
    if (!IN[out]) return;
    try {
      const k = {}; for (const c in key) k[c] = ing(key[c]);
      const h = rows.length, w = Math.max(...rows.map(r => r.length));
      const g = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = rows[y][x] || ' '; g.push(c === ' ' ? null : k[c]); }
      RECIPES.push({ w, h, g, out: IN[out].idx, n: n || 1, rem: o && o.rem });
    } catch (e) { }
  }
  function shapeless(list, out, n) { if (!IN[out]) return; try { SHAPELESS.push({ l: list.map(ing), out: IN[out].idx, n: n || 1 }); } catch (e) { } }
  const ringR = (c, m, out, n) => shaped(['MMM', 'MCM', 'MMM'], { M: m, C: c }, out, n);
  const box2 = (m, out, n) => shaped(['MM', 'MM'], { M: m }, out, n || 1);
  const box3 = (m, out, n) => shaped(['MMM', 'MMM', 'MMM'], { M: m }, out, n || 1);
  const stairR = (m, out) => shaped(['M  ', 'MM ', 'MMM'], { M: m }, out, 4);
  const slabR = (m, out) => shaped(['MMM'], { M: m }, out, 6);
  const wallR = (m, out) => shaped(['MMM', 'MMM'], { M: m }, out, 6);
  const store = (blockId, itemId) => { box3(itemId, blockId, 1); shapeless([blockId], itemId, 9); };
  for (const w of WOODS) {
    const n = w.n, pl = n + '_planks';
    if (w.bamboo) { shaped(['M', 'M'], { M: 'bamboo' }, 'stick', 1); box3('bamboo', 'bamboo_block'); shapeless(['#bamboo_logs'], pl, 2); shaped(['M', 'M'], { M: 'bamboo_slab' }, 'bamboo_mosaic'); stairR('bamboo_mosaic', 'bamboo_mosaic_stairs'); slabR('bamboo_mosaic', 'bamboo_mosaic_slab'); }
    else {
      shapeless(['#' + n + '_logs'], pl, 4);
      const log = w.nether ? n + '_stem' : n + '_log', wood = w.nether ? n + '_hyphae' : n + '_wood';
      box2(log, wood, 3); box2('stripped_' + log, 'stripped_' + wood, 3);
      shaped(['SSS', '   ', 'SSS'], { S: 'stripped_' + log }, n + '_shelf', 6);
      shaped(['C C', 'SSS', 'SSS'], { C: 'chain', S: 'stripped_' + log }, n + '_hanging_sign', 6);
    }
    if (w.bamboo) shaped(['C C', 'SSS', 'SSS'], { C: 'chain', S: 'stripped_bamboo_block' }, 'bamboo_hanging_sign', 6);
    if (w.bamboo) shaped(['SSS', '   ', 'SSS'], { S: 'stripped_bamboo_block' }, 'bamboo_shelf', 6);
    stairR(pl, n + '_stairs'); slabR(pl, n + '_slab');
    shaped(['PSP', 'PSP'], { P: pl, S: 'stick' }, n + '_fence', 3);
    shaped(['SPS', 'SPS'], { P: pl, S: 'stick' }, n + '_fence_gate', 1);
    shaped(['PP', 'PP', 'PP'], { P: pl }, n + '_door', 3);
    shaped(['PPP', 'PPP'], { P: pl }, n + '_trapdoor', 2);
    shaped(['PP'], { P: pl }, n + '_pressure_plate', 1);
    shapeless([pl], n + '_button', 1);
    shaped(['PPP', 'PPP', ' S '], { P: pl, S: 'stick' }, n + '_sign', 3);
    if (!w.nether) { const b = w.bamboo ? 'bamboo_raft' : n + '_boat', cb2 = w.bamboo ? 'bamboo_chest_raft' : n + '_chest_boat'; shaped(['P P', 'PPP'], { P: pl }, b, 1); shapeless([b, 'chest'], cb2, 1); }
  }
  shaped(['P', 'P'], { P: '#planks' }, 'stick', 4);
  box2('#planks', 'crafting_table');
  shaped(['MMM', 'M M', 'MMM'], { M: '#planks' }, 'chest');
  shapeless(['chest', 'tripwire_hook'], 'trapped_chest');
  shaped(['MMM', 'M M', 'MMM'], { M: '#stone_craft' }, 'furnace');
  shaped(['C', 'S'], { C: '#coals', S: 'stick' }, 'torch', 4);
  shaped(['C', 'S', 'X'], { C: '#coals', S: 'stick', X: '#soul' }, 'soul_torch', 4);
  shaped(['N', 'C', 'S'], { N: 'copper_nugget', C: '#coals', S: 'stick' }, 'copper_torch', 4);
  shaped(['R', 'S'], { R: 'redstone', S: 'stick' }, 'redstone_torch', 1);
  const TM = { wooden: '#planks', stone: '#stone_craft', copper: 'copper_ingot', iron: 'iron_ingot', golden: 'gold_ingot', diamond: 'diamond' };
  for (const t in TM) {
    const M = TM[t];
    shaped(['MMM', ' S ', ' S '], { M, S: 'stick' }, t + '_pickaxe'); shaped(['MM', 'MS', ' S'], { M, S: 'stick' }, t + '_axe'); shaped(['M', 'S', 'S'], { M, S: 'stick' }, t + '_shovel');
    shaped(['MM', ' S', ' S'], { M, S: 'stick' }, t + '_hoe'); shaped(['M', 'M', 'S'], { M, S: 'stick' }, t + '_sword'); shaped(['  M', ' S ', 'S  '], { M, S: 'stick' }, t + '_spear');
  }
  const AM = { leather: 'leather', copper: 'copper_ingot', iron: 'iron_ingot', golden: 'gold_ingot', diamond: 'diamond' };
  for (const a in AM) { const M = AM[a]; shaped(['MMM', 'M M'], { M }, a + '_helmet'); shaped(['M M', 'MMM', 'MMM'], { M }, a + '_chestplate'); shaped(['MMM', 'M M', 'M M'], { M }, a + '_leggings'); shaped(['M M', 'M M'], { M }, a + '_boots'); }
  shaped(['MMM', 'M M'], { M: 'turtle_scute' }, 'turtle_helmet');
  shaped(['  M', ' MM', 'MMM'].map(r => r), { M: 'armadillo_scute' }, 'wolf_armor');
  shaped([' ST', 'S T', ' ST'], { S: 'stick', T: 'string' }, 'bow');
  shaped(['F', 'S', 'E'], { F: 'flint', S: 'stick', E: 'feather' }, 'arrow', 4);
  shaped(['SIS', 'TJT', ' S '], { S: 'stick', I: 'iron_ingot', T: 'string', J: 'tripwire_hook' }, 'crossbow');
  shaped(['WIW', 'WWW', ' W '], { W: '#planks', I: 'iron_ingot' }, 'shield');
  shaped(['  S', ' ST', 'S T'], { S: 'stick', T: 'string' }, 'fishing_rod');
  shaped(['R ', ' C'], { R: 'fishing_rod', C: 'carrot' }, 'carrot_on_a_stick');
  shapeless(['iron_ingot', 'flint'], 'flint_and_steel');
  shaped([' I', 'I '], { I: 'iron_ingot' }, 'shears');
  shaped(['F', 'C', 'S'], { F: 'feather', C: 'copper_ingot', S: 'stick' }, 'brush');
  shaped(['I I', ' I '], { I: 'iron_ingot' }, 'bucket');
  shaped([' I ', 'IRI', ' I '], { I: 'iron_ingot', R: 'redstone' }, 'compass');
  shaped([' G ', 'GRG', ' G '], { G: 'gold_ingot', R: 'redstone' }, 'clock');
  shaped(['PPP', 'PCP', 'PPP'], { P: 'paper', C: 'compass' }, 'map');
  shaped(['A', 'C', 'C'], { A: 'amethyst_shard', C: 'copper_ingot' }, 'spyglass');
  shaped(['SS ', 'SB ', '  S'], { S: 'string', B: 'slime_ball' }, 'lead', 2);
  shaped([' L ', 'LIL'], { L: 'leather', I: 'iron_ingot' }, 'saddle');
  shaped(['S', 'L'], { S: 'string', L: 'leather' }, 'bundle');
  for (const c of COLORS) { shapeless(['bundle', c + '_dye'], c + '_bundle'); shaped(['LLL', 'GWG'], { L: 'leather', G: 'glass', W: c + '_wool' }, c + '_harness'); }
  shapeless(['paper', 'paper', 'paper', 'leather'], 'book');
  shapeless(['book', 'ink_sac', 'feather'], 'writable_book');
  shaped(['SSS'], { S: 'sugar_cane' }, 'paper', 3);
  shapeless(['sugar_cane'], 'sugar'); shapeless(['honey_bottle'], 'sugar', 3);
  shaped(['P P', ' P '], { P: '#planks' }, 'bowl', 4);
  shaped(['G G', ' G '], { G: 'glass' }, 'glass_bottle', 3);
  shaped(['WWW'], { W: 'wheat' }, 'bread');
  shaped(['MMM', 'SES', 'WWW'], { M: 'milk_bucket', S: 'sugar', E: '#eggs', W: 'wheat' }, 'cake', 1, { rem: 'bucket' });
  shaped(['WCW'], { W: 'wheat', C: 'cocoa_beans' }, 'cookie', 8);
  shapeless(['pumpkin', 'sugar', '#eggs'], 'pumpkin_pie');
  shapeless(['brown_mushroom', 'red_mushroom', 'bowl'], 'mushroom_stew');
  shapeless(['beetroot', 'beetroot', 'beetroot', 'beetroot', 'beetroot', 'beetroot', 'bowl'], 'beetroot_soup');
  shapeless(['cooked_rabbit', 'carrot', 'baked_potato', 'brown_mushroom', 'bowl'], 'rabbit_stew');
  shapeless(['red_mushroom', 'brown_mushroom', 'bowl', '#small_flowers'], 'suspicious_stew');
  ringR('apple', 'gold_ingot', 'golden_apple'); ringR('carrot', 'gold_nugget', 'golden_carrot'); ringR('melon_slice', 'gold_nugget', 'glistering_melon_slice');
  shapeless(['bone'], 'bone_meal', 3); box3('bone_meal', 'bone_block'); shapeless(['bone_block'], 'bone_meal', 9);
  for (const [b, i] of [['iron_block', 'iron_ingot'], ['gold_block', 'gold_ingot'], ['diamond_block', 'diamond'], ['emerald_block', 'emerald'], ['lapis_block', 'lapis_lazuli'], ['redstone_block', 'redstone'], ['coal_block', 'coal'], ['netherite_block', 'netherite_ingot'], ['copper_block', 'copper_ingot'], ['raw_iron_block', 'raw_iron'], ['raw_copper_block', 'raw_copper'], ['raw_gold_block', 'raw_gold'], ['hay_block', 'wheat'], ['slime_block', 'slime_ball'], ['dried_kelp_block', 'dried_kelp'], ['resin_block', 'resin_clump']]) store(b, i);
  for (const [i, n] of [['iron_ingot', 'iron_nugget'], ['gold_ingot', 'gold_nugget'], ['copper_ingot', 'copper_nugget']]) { box3(n, i); shapeless([i], n, 9); }
  box3('melon_slice', 'melon'); shapeless(['melon_slice'], 'melon_seeds'); shapeless(['pumpkin'], 'pumpkin_seeds', 4);
  box3('ice', 'packed_ice'); box3('packed_ice', 'blue_ice');
  shaped(['HH', 'HH'], { H: 'honey_bottle' }, 'honey_block', 1, { rem: 'glass_bottle' }); shapeless(['honey_block', 'glass_bottle', 'glass_bottle', 'glass_bottle', 'glass_bottle'], 'honey_bottle', 4);
  box2('honeycomb', 'honeycomb_block'); box2('snowball', 'snow_block'); box2('clay_ball', 'clay'); box2('brick', 'bricks'); box2('nether_brick', 'nether_bricks'); box2('glowstone_dust', 'glowstone'); box2('quartz', 'quartz_block'); box2('amethyst_shard', 'amethyst_block'); box2('prismarine_shard', 'prismarine'); box3('prismarine_shard', 'prismarine_bricks');
  shaped(['SSS', 'SIS', 'SSS'], { S: 'prismarine_shard', I: 'black_dye' }, 'dark_prismarine');
  shaped(['SCS', 'CCC', 'SCS'], { S: 'prismarine_shard', C: 'prismarine_crystals' }, 'sea_lantern');
  box2('resin_brick', 'resin_bricks');
  shaped(['SSS'], { S: 'snow_block' }, 'snow', 6);
  box2('stone', 'stone_bricks', 4); box2('granite', 'polished_granite', 4); box2('diorite', 'polished_diorite', 4); box2('andesite', 'polished_andesite', 4);
  shapeless(['diorite', 'quartz'], 'granite'); shaped(['CQ', 'QC'], { C: 'cobblestone', Q: 'quartz' }, 'diorite', 2); shapeless(['diorite', 'cobblestone'], 'andesite', 2);
  shapeless(['cobblestone', 'vine'], 'mossy_cobblestone'); shapeless(['cobblestone', 'moss_block'], 'mossy_cobblestone'); shapeless(['stone_bricks', 'vine'], 'mossy_stone_bricks'); shapeless(['stone_bricks', 'moss_block'], 'mossy_stone_bricks');
  shaped(['S', 'S'], { S: 'stone_brick_slab' }, 'chiseled_stone_bricks');
  box2('sand', 'sandstone'); box2('sandstone', 'cut_sandstone', 4); shaped(['S', 'S'], { S: 'sandstone_slab' }, 'chiseled_sandstone');
  box2('red_sand', 'red_sandstone'); box2('red_sandstone', 'cut_red_sandstone', 4); shaped(['S', 'S'], { S: 'red_sandstone_slab' }, 'chiseled_red_sandstone');
  box2('cobbled_deepslate', 'polished_deepslate', 4); box2('polished_deepslate', 'deepslate_bricks', 4); box2('deepslate_bricks', 'deepslate_tiles', 4); shaped(['S', 'S'], { S: 'cobbled_deepslate_slab' }, 'chiseled_deepslate');
  box2('tuff', 'polished_tuff', 4); box2('polished_tuff', 'tuff_bricks', 4); shaped(['S', 'S'], { S: 'tuff_slab' }, 'chiseled_tuff'); shaped(['S', 'S'], { S: 'tuff_brick_slab' }, 'chiseled_tuff_bricks');
  box2('blackstone', 'polished_blackstone', 4); box2('polished_blackstone', 'polished_blackstone_bricks', 4); shaped(['S', 'S'], { S: 'polished_blackstone_slab' }, 'chiseled_polished_blackstone');
  shapeless(['mud', 'wheat'], 'packed_mud'); box2('packed_mud', 'mud_bricks', 4);
  box2('popped_chorus_fruit', 'purpur_block', 4); shaped(['S', 'S'], { S: 'purpur_slab' }, 'purpur_pillar');
  shaped(['Q', 'Q'], { Q: 'quartz_block' }, 'quartz_pillar', 2); shaped(['S', 'S'], { S: 'quartz_slab' }, 'chiseled_quartz_block'); box2('quartz_block', 'quartz_bricks', 4);
  box2('end_stone', 'end_stone_bricks', 4);
  shaped(['NW', 'WN'], { N: 'nether_brick', W: 'nether_wart' }, 'red_nether_bricks');
  shaped(['BNB', 'BNB'], { B: 'nether_bricks', N: 'nether_brick' }, 'nether_brick_fence', 6);
  shaped(['S', 'S'], { S: 'nether_brick_slab' }, 'chiseled_nether_bricks');
  shaped(['S', 'S'], { S: 'resin_brick_slab' }, 'chiseled_resin_bricks');
  box2('cinnabar', 'polished_cinnabar', 4); box2('polished_cinnabar', 'cinnabar_bricks', 4); shaped(['S', 'S'], { S: 'cinnabar_brick_slab' }, 'chiseled_cinnabar');
  box2('sulfur', 'polished_sulfur', 4); box2('polished_sulfur', 'sulfur_bricks', 4); shaped(['S', 'S'], { S: 'sulfur_brick_slab' }, 'chiseled_sulfur');
  for (const [base, tex, set] of STONE_FAMS) {
    const nm = slabName(base);
    if (set.includes('st')) stairR(base, nm + '_stairs');
    if (set.includes('sl')) slabR(base, nm + '_slab');
    if (set.includes('w')) wallR(base, nm + '_wall');
  }
  slabR('smooth_stone', 'smooth_stone_slab');
  for (const c of COLORS) {
    shapeless([c + '_dye', '#wool'], c + '_wool'); shaped(['WW'], { W: c + '_wool' }, c + '_carpet', 3);
    stairR(c + '_wool', c + '_wool_stairs'); slabR(c + '_wool', c + '_wool_slab'); shaped(['SSS'], { S: c + '_wool_slab' }, c + '_cushion', 1);
    stairR(c + '_concrete', c + '_concrete_stairs'); slabR(c + '_concrete', c + '_concrete_slab');
    shaped(['WWW', 'PPP'], { W: c + '_wool', P: '#planks' }, c + '_bed');
    shaped(['WWW', 'WWW', ' S '], { W: c + '_wool', S: 'stick' }, c + '_banner');
    ringR(c + '_dye', 'glass', c + '_stained_glass', 8); shaped(['GGG', 'GGG'], { G: c + '_stained_glass' }, c + '_stained_glass_pane', 16);
    ringR(c + '_dye', 'terracotta', c + '_terracotta', 8);
    shapeless([c + '_dye', 'sand', 'sand', 'sand', 'sand', 'gravel', 'gravel', 'gravel', 'gravel'], c + '_concrete_powder', 8);
    shapeless(['candle', c + '_dye'], c + '_candle');
    shapeless(['shulker_box', c + '_dye'], c + '_shulker_box');
  }
  box2('string', 'white_wool');
  shaped(['S', 'H'], { S: 'string', H: 'honeycomb' }, 'candle');
  shaped(['GGG', 'GGG'], { G: 'glass' }, 'glass_pane', 16);
  shaped([' S ', 'SGS', ' S '], { S: 'amethyst_shard', G: 'glass' }, 'tinted_glass', 2);
  shaped(['MM'], { M: 'moss_block' }, 'moss_carpet', 3); shaped(['MM'], { M: 'pale_moss_block' }, 'pale_moss_carpet', 3);
  shaped(['DG', 'GD'], { D: 'dirt', G: 'gravel' }, 'coarse_dirt', 4);
  box2('pointed_dripstone', 'dripstone_block');
  const DYEF = [['dandelion', 'yellow'], ['golden_dandelion', 'yellow'], ['poppy', 'red'], ['red_tulip', 'red'], ['beetroot', 'red'], ['blue_orchid', 'light_blue'], ['allium', 'magenta'], ['azure_bluet', 'light_gray'], ['oxeye_daisy', 'light_gray'], ['white_tulip', 'light_gray'], ['orange_tulip', 'orange'], ['pink_tulip', 'pink'], ['pink_petals', 'pink'], ['cornflower', 'blue'], ['lily_of_the_valley', 'white'], ['wither_rose', 'black'], ['torchflower', 'orange'], ['cocoa_beans', 'brown'], ['lapis_lazuli', 'blue'], ['ink_sac', 'black'], ['bone_meal', 'white'], ['open_eyeblossom', 'orange'], ['closed_eyeblossom', 'gray'], ['wildflowers', 'yellow'], ['cactus_flower', 'pink']];
  for (const [f, c] of DYEF) shapeless([f], c + '_dye');
  for (const [f, c] of [['sunflower', 'yellow'], ['rose_bush', 'red'], ['lilac', 'magenta'], ['peony', 'pink'], ['pitcher_plant', 'cyan']]) shapeless([f], c + '_dye', 2);
  for (const [a, b, c, n] of [['red_dye', 'yellow_dye', 'orange_dye', 2], ['blue_dye', 'white_dye', 'light_blue_dye', 2], ['red_dye', 'white_dye', 'pink_dye', 2], ['green_dye', 'white_dye', 'lime_dye', 2], ['black_dye', 'white_dye', 'gray_dye', 2], ['gray_dye', 'white_dye', 'light_gray_dye', 2], ['blue_dye', 'green_dye', 'cyan_dye', 2], ['red_dye', 'blue_dye', 'purple_dye', 2], ['purple_dye', 'pink_dye', 'magenta_dye', 2]]) shapeless([a, b], c, n);
  shapeless(['black_dye', 'white_dye', 'white_dye'], 'light_gray_dye', 3);
  shaped(['S', 'C'], { S: 'stick', C: 'cobblestone' }, 'lever');
  shaped(['TRT', 'SSS'], { T: 'redstone_torch', R: 'redstone', S: 'stone' }, 'repeater');
  shaped([' T ', 'TQT', 'SSS'], { T: 'redstone_torch', Q: 'quartz', S: 'stone' }, 'comparator');
  shaped(['PPP', 'CIC', 'CRC'], { P: '#planks', C: 'cobblestone', I: 'iron_ingot', R: 'redstone' }, 'piston');
  shaped(['S', 'P'], { S: 'slime_ball', P: 'piston' }, 'sticky_piston');
  shaped(['CCC', 'RRQ', 'CCC'], { C: 'cobblestone', R: 'redstone', Q: 'quartz' }, 'observer');
  shaped(['CCC', 'CBC', 'CRC'], { C: 'cobblestone', B: 'bow', R: 'redstone' }, 'dispenser');
  shaped(['CCC', 'C C', 'CRC'], { C: 'cobblestone', R: 'redstone' }, 'dropper');
  shaped(['I I', 'ICI', ' I '], { I: 'iron_ingot', C: 'chest' }, 'hopper');
  shaped([' R ', 'RGR', ' R '], { R: 'redstone', G: 'glowstone' }, 'redstone_lamp');
  shaped(['GGG', 'QQQ', 'SSS'], { G: 'glass', Q: 'quartz', S: '#wooden_slabs' }, 'daylight_detector');
  shaped([' R ', 'RHR', ' R '], { R: 'redstone', H: 'hay_block' }, 'target');
  shaped(['I', 'S', 'P'], { I: 'iron_ingot', S: 'stick', P: '#planks' }, 'tripwire_hook', 2);
  shaped(['I I', 'ISI', 'I I'], { I: 'iron_ingot', S: 'stick' }, 'rail', 16);
  shaped(['G G', 'GSG', 'GRG'], { G: 'gold_ingot', S: 'stick', R: 'redstone' }, 'powered_rail', 6);
  shaped(['I I', 'IPI', 'IRI'], { I: 'iron_ingot', P: 'stone_pressure_plate', R: 'redstone' }, 'detector_rail', 6);
  shaped(['ISI', 'ITI', 'ISI'], { I: 'iron_ingot', S: 'stick', T: 'redstone_torch' }, 'activator_rail', 6);
  shaped(['GSG', 'SGS', 'GSG'], { G: 'gunpowder', S: '#sand' }, 'tnt');
  ringR('redstone', '#planks', 'note_block'); ringR('diamond', '#planks', 'jukebox');
  shaped(['C', 'C', 'C'], { C: 'copper_ingot' }, 'lightning_rod');
  shaped(['SS'], { S: 'stone' }, 'stone_pressure_plate'); shapeless(['stone'], 'stone_button');
  shaped(['SS'], { S: 'polished_blackstone' }, 'polished_blackstone_pressure_plate'); shapeless(['polished_blackstone'], 'polished_blackstone_button');
  shaped(['GG'], { G: 'gold_ingot' }, 'light_weighted_pressure_plate'); shaped(['II'], { I: 'iron_ingot' }, 'heavy_weighted_pressure_plate');
  shaped(['II', 'II', 'II'], { I: 'iron_ingot' }, 'iron_door', 3); box2('iron_ingot', 'iron_trapdoor');
  shaped(['III', 'ICI', 'RDR'], { I: 'iron_ingot', C: 'crafting_table', R: 'redstone', D: 'dropper' }, 'crafter');
  shaped([' C ', 'CBC', ' R '], { C: 'copper_block', B: 'blaze_rod', R: 'redstone' }, 'copper_bulb', 4);
  shaped(['II', 'II', 'II'], { I: 'copper_ingot' }, 'copper_door', 3); box2('copper_ingot', 'copper_trapdoor');
  box2('copper_block', 'cut_copper', 4); shaped(['S', 'S'], { S: 'cut_copper_slab' }, 'chiseled_copper'); shaped([' C ', 'C C', ' C '], { C: 'copper_block' }, 'copper_grate', 4);
  ringR('chest', 'copper_ingot', 'copper_chest');
  shaped(['NNN', 'NTN', 'NNN'], { N: 'copper_nugget', T: 'copper_torch' }, 'copper_lantern');
  shaped(['BBB', ' I ', 'III'], { B: 'iron_block', I: 'iron_ingot' }, 'anvil');
  shaped([' B ', 'DOD', 'OOO'], { B: 'book', D: 'diamond', O: 'obsidian' }, 'enchanting_table');
  shaped(['PPP', 'BBB', 'PPP'], { P: '#planks', B: 'book' }, 'bookshelf');
  shaped(['PPP', 'SSS', 'PPP'], { P: '#planks', S: '#wooden_slabs' }, 'chiseled_bookshelf');
  shaped(['SSS', ' B ', ' S '], { S: '#wooden_slabs', B: 'bookshelf' }, 'lectern');
  shaped(['S S', 'S S', 'SSS'], { S: '#wooden_slabs' }, 'composter');
  shaped(['I I', 'I I', 'III'], { I: 'iron_ingot' }, 'cauldron');
  shaped([' B ', 'CCC'], { B: 'blaze_rod', C: '#stone_craft' }, 'brewing_stand');
  shaped(['PSP', 'P P', 'PSP'], { P: '#planks', S: '#wooden_slabs' }, 'barrel');
  shaped([' L ', 'LFL', ' L '], { L: '#logs', F: 'furnace' }, 'smoker');
  shaped(['III', 'IFI', 'SSS'], { I: 'iron_ingot', F: 'furnace', S: 'smooth_stone' }, 'blast_furnace');
  shaped(['STS', 'P P'], { S: 'stick', T: 'stone_slab', P: '#planks' }, 'grindstone');
  shaped(['II', 'PP', 'PP'], { I: 'iron_ingot', P: '#planks' }, 'smithing_table');
  shaped(['FF', 'PP', 'PP'], { F: 'flint', P: '#planks' }, 'fletching_table');
  shaped(['pp', 'PP', 'PP'], { p: 'paper', P: '#planks' }, 'cartography_table');
  shaped(['SS', 'PP'], { S: 'string', P: '#planks' }, 'loom');
  shaped([' I ', 'SSS'], { I: 'iron_ingot', S: 'stone' }, 'stonecutter');
  shaped([' S ', 'SCS', 'LLL'], { S: 'stick', C: '#coals', L: '#logs' }, 'campfire');
  shaped([' S ', 'SCS', 'LLL'], { S: 'stick', C: '#soul', L: '#logs' }, 'soul_campfire');
  shaped(['NNN', 'NTN', 'NNN'], { N: 'iron_nugget', T: 'torch' }, 'lantern'); shaped(['NNN', 'NTN', 'NNN'], { N: 'iron_nugget', T: 'soul_torch' }, 'soul_lantern');
  shaped(['N', 'I', 'N'], { N: 'iron_nugget', I: 'iron_ingot' }, 'chain');
  shaped(['III', 'III'], { I: 'iron_ingot' }, 'iron_bars', 16);
  shaped(['S S', 'SSS', 'S S'], { S: 'stick' }, 'ladder', 3);
  shaped(['BSB', 'B B', 'B B'], { B: 'bamboo', S: 'string' }, 'scaffolding', 6);
  shaped(['B B', ' B '], { B: 'brick' }, 'flower_pot');
  shaped([' B ', 'B B', ' B '], { B: 'brick' }, 'decorated_pot');
  shaped(['SSS', ' S ', 'SPS'], { S: 'stick', P: 'smooth_stone_slab' }, 'armor_stand');
  ringR('leather', 'stick', 'item_frame'); shapeless(['item_frame', 'glow_ink_sac'], 'glow_item_frame'); ringR('#wool', 'stick', 'painting');
  shaped(['PPP', 'HHH', 'PPP'], { P: '#planks', H: 'honeycomb' }, 'beehive');
  shaped(['SSS', 'SNS', 'SSS'], { S: 'chiseled_stone_bricks', N: 'netherite_ingot' }, 'lodestone');
  shaped(['OOO', 'GGG', 'OOO'], { O: 'crying_obsidian', G: 'glowstone' }, 'respawn_anchor');
  ringR('ender_eye', 'obsidian', 'ender_chest');
  shapeless(['ender_pearl', 'blaze_powder'], 'ender_eye'); shapeless(['blaze_rod'], 'blaze_powder', 2);
  shapeless(['blaze_powder', 'slime_ball'], 'magma_cream'); shapeless(['spider_eye', 'brown_mushroom', 'sugar'], 'fermented_spider_eye');
  shapeless(['blaze_powder', '#coals', 'gunpowder'], 'fire_charge', 3);
  shapeless(['paper', 'gunpowder'], 'firework_rocket', 3);
  box2('rabbit_hide', 'leather');
  shaped(['GGG', 'GSG', 'OOO'], { G: 'glass', S: 'nether_star', O: 'obsidian' }, 'beacon');
  shaped(['GGG', 'GEG', 'GTG'], { G: 'glass', E: 'ender_eye', T: 'ghast_tear' }, 'end_crystal');
  shaped(['NNN', 'NHN', 'NNN'], { N: 'nautilus_shell', H: 'heart_of_the_sea' }, 'conduit');
  shapeless(['netherite_scrap', 'netherite_scrap', 'netherite_scrap', 'netherite_scrap', 'gold_ingot', 'gold_ingot', 'gold_ingot', 'gold_ingot'], 'netherite_ingot');
  shaped(['WWW', 'WSW', 'WWW'], { W: 'wheat', S: 'string' }, 'straw_bed');
  shaped(['TTT', 'TCT', 'TTT'], { T: 'iron_ingot', C: 'diamond' }, 'diamond_horse_armor');
  const SMELT = Object.create(null), SM_BLAST = new Set(), SM_SMOKE = new Set();
  const smelt = (i, o, xp, kind) => { const a = i[0] === '#' ? [...(TAGS[i.slice(1)] || [])] : IN[i] ? [IN[i].idx] : []; if (!IN[o]) return; for (const x of a) { SMELT[x] = [IN[o].idx, xp]; if (kind === 'b') SM_BLAST.add(x); if (kind === 's') SM_SMOKE.add(x); } };
  for (const [a, b, x] of [['raw_iron', 'iron_ingot', .7], ['iron_ore', 'iron_ingot', .7], ['deepslate_iron_ore', 'iron_ingot', .7], ['raw_gold', 'gold_ingot', 1], ['gold_ore', 'gold_ingot', 1], ['deepslate_gold_ore', 'gold_ingot', 1], ['nether_gold_ore', 'gold_ingot', 1], ['raw_copper', 'copper_ingot', .7], ['copper_ore', 'copper_ingot', .7], ['deepslate_copper_ore', 'copper_ingot', .7], ['ancient_debris', 'netherite_scrap', 2], ['coal_ore', 'coal', .1], ['deepslate_coal_ore', 'coal', .1], ['diamond_ore', 'diamond', 1], ['deepslate_diamond_ore', 'diamond', 1], ['emerald_ore', 'emerald', 1], ['deepslate_emerald_ore', 'emerald', 1], ['lapis_ore', 'lapis_lazuli', .2], ['deepslate_lapis_ore', 'lapis_lazuli', .2], ['redstone_ore', 'redstone', .7], ['deepslate_redstone_ore', 'redstone', .7], ['nether_quartz_ore', 'quartz', .2]]) smelt(a, b, x, 'b');
  for (const t of ['iron', 'golden']) for (const k of ['sword', 'pickaxe', 'axe', 'shovel', 'hoe', 'helmet', 'chestplate', 'leggings', 'boots', 'horse_armor']) smelt(t + '_' + k, t === 'iron' ? 'iron_nugget' : 'gold_nugget', .1, 'b');
  for (const k of ['helmet', 'chestplate', 'leggings', 'boots']) smelt('chainmail_' + k, 'iron_nugget', .1, 'b');
  for (const [a, b] of [['beef', 'cooked_beef'], ['porkchop', 'cooked_porkchop'], ['chicken', 'cooked_chicken'], ['mutton', 'cooked_mutton'], ['rabbit', 'cooked_rabbit'], ['cod', 'cooked_cod'], ['salmon', 'cooked_salmon'], ['potato', 'baked_potato'], ['kelp', 'dried_kelp']]) smelt(a, b, .35, 's');
  for (const [a, b, x] of [['sand', 'glass', .1], ['red_sand', 'glass', .1], ['cobblestone', 'stone', .1], ['stone', 'smooth_stone', .1], ['cobbled_deepslate', 'deepslate', .1], ['stone_bricks', 'cracked_stone_bricks', .1], ['deepslate_bricks', 'cracked_deepslate_bricks', .1], ['deepslate_tiles', 'cracked_deepslate_tiles', .1], ['nether_bricks', 'cracked_nether_bricks', .1], ['polished_blackstone_bricks', 'cracked_polished_blackstone_bricks', .1], ['clay_ball', 'brick', .3], ['netherrack', 'nether_brick', .1], ['clay', 'terracotta', .35], ['cactus', 'green_dye', 1], ['sea_pickle', 'lime_dye', .1], ['#logs_burn', 'charcoal', .15], ['wet_sponge', 'sponge', .15], ['chorus_fruit', 'popped_chorus_fruit', .1], ['sandstone', 'smooth_sandstone', .1], ['red_sandstone', 'smooth_red_sandstone', .1], ['quartz_block', 'smooth_quartz', .1], ['basalt', 'smooth_basalt', .1], ['resin_clump', 'resin_brick', .3]]) smelt(a, b, x);
  for (const c of COLORS) smelt(c + '_terracotta', c + '_glazed_terracotta', .1);
  const CUT = Object.create(null);
  const cut = (i, o, n) => { if (!IN[i] || !IN[o]) return; (CUT[IN[i].idx] = CUT[IN[i].idx] || []).push([IN[o].idx, n || 1]); };
  for (const [base, tex, set] of STONE_FAMS) { const nm = slabName(base); if (set.includes('sl')) cut(base, nm + '_slab', 2); if (set.includes('st')) cut(base, nm + '_stairs'); if (set.includes('w')) cut(base, nm + '_wall'); }
  for (const [a, l] of [['stone', ['stone_bricks', 'stone_brick_slab', 'stone_brick_stairs', 'stone_brick_wall', 'chiseled_stone_bricks']], ['stone_bricks', ['chiseled_stone_bricks']], ['granite', ['polished_granite', 'polished_granite_slab', 'polished_granite_stairs']], ['diorite', ['polished_diorite', 'polished_diorite_slab', 'polished_diorite_stairs']], ['andesite', ['polished_andesite', 'polished_andesite_slab', 'polished_andesite_stairs']], ['cobbled_deepslate', ['polished_deepslate', 'deepslate_bricks', 'deepslate_tiles', 'chiseled_deepslate']], ['polished_deepslate', ['deepslate_bricks', 'deepslate_tiles']], ['deepslate_bricks', ['deepslate_tiles']], ['tuff', ['polished_tuff', 'tuff_bricks', 'chiseled_tuff', 'chiseled_tuff_bricks']], ['polished_tuff', ['tuff_bricks', 'chiseled_tuff_bricks']], ['tuff_bricks', ['chiseled_tuff_bricks']], ['sandstone', ['cut_sandstone', 'chiseled_sandstone', 'cut_sandstone_slab']], ['red_sandstone', ['cut_red_sandstone', 'chiseled_red_sandstone', 'cut_red_sandstone_slab']], ['blackstone', ['polished_blackstone', 'polished_blackstone_bricks', 'chiseled_polished_blackstone']], ['polished_blackstone', ['polished_blackstone_bricks', 'chiseled_polished_blackstone']], ['quartz_block', ['quartz_pillar', 'chiseled_quartz_block', 'quartz_bricks']], ['purpur_block', ['purpur_pillar']], ['end_stone', ['end_stone_bricks', 'end_stone_brick_slab', 'end_stone_brick_stairs', 'end_stone_brick_wall']], ['copper_block', ['cut_copper', 'cut_copper_slab', 'cut_copper_stairs', 'chiseled_copper', 'copper_grate']], ['smooth_stone', ['smooth_stone_slab']], ['cinnabar', ['polished_cinnabar', 'cinnabar_bricks', 'chiseled_cinnabar']], ['sulfur', ['polished_sulfur', 'sulfur_bricks', 'chiseled_sulfur']], ['mud_bricks', []]]) for (const o of l) cut(a, o, o.endsWith('_slab') ? 2 : 1);
  const ingOk = (k, id) => k === null ? id === null : id !== null && (typeof k === 'number' ? k === id : k.has(id));
  function craftMatch(grid, w) {
    let x0 = 9, y0 = 9, x1 = -1, y1 = -1, n = 0;
    const h = grid.length / w;
    for (let i = 0; i < grid.length; i++) if (grid[i]) { const x = i % w, y = i / w | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); n++; }
    if (!n) return null;
    const cw = x1 - x0 + 1, ch = y1 - y0 + 1, at = (x, y) => { const s = grid[(y0 + y) * w + x0 + x]; return s ? s.id : null; };
    for (const r of RECIPES) {
      if (r.w !== cw || r.h !== ch) continue;
      for (const mir of [0, 1]) {
        let ok = true;
        for (let y = 0; y < ch && ok; y++) for (let x = 0; x < cw && ok; x++) ok = ingOk(r.g[y * cw + (mir ? cw - 1 - x : x)], at(x, y));
        if (ok) return r;
      }
    }
    const items = []; for (const s of grid) if (s) items.push(s.id);
    for (const r of SHAPELESS) {
      if (r.l.length !== items.length) continue;
      const used = new Array(items.length).fill(false);
      let ok = true;
      for (const k of r.l) { let f = -1; for (let i = 0; i < items.length; i++) if (!used[i] && ingOk(k, items[i])) { f = i; break; } if (f < 0) { ok = false; break; } used[f] = true; }
      if (ok) return r;
    }
    if (items.length === 2 && items[0] === items[1] && IT[items[0]].dur) { const a = grid.filter(Boolean); const d = Math.max(0, IT[items[0]].dur - ((IT[items[0]].dur - a[0].d) + (IT[items[0]].dur - a[1].d) + Math.floor(IT[items[0]].dur / 20))); return { out: items[0], n: 1, dmg: d, repair: 1 }; }
    return null;
  }
  const fuelOf = id => IT[id] && IT[id].fuel || 0;
