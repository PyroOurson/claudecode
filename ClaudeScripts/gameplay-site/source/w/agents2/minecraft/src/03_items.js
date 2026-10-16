  const TIERS = {
    wooden: { sp: 2, dur: 59, lvl: 0, sw: 4, ax: 7, axs: .8, pk: 2, sh: 2.5, hs: 1, mat: 'planks', ench: 15 },
    stone: { sp: 4, dur: 131, lvl: 1, sw: 5, ax: 9, axs: .8, pk: 3, sh: 3.5, hs: 2, mat: 'cobblestone', ench: 5 },
    copper: { sp: 5, dur: 190, lvl: 1, sw: 5, ax: 9, axs: .8, pk: 3, sh: 3.5, hs: 2.5, mat: 'copper_ingot', ench: 13 },
    iron: { sp: 6, dur: 250, lvl: 2, sw: 6, ax: 9, axs: .9, pk: 4, sh: 4.5, hs: 3, mat: 'iron_ingot', ench: 14 },
    golden: { sp: 12, dur: 32, lvl: 0, sw: 4, ax: 7, axs: 1, pk: 2, sh: 2.5, hs: 1, mat: 'gold_ingot', ench: 22 },
    diamond: { sp: 8, dur: 1561, lvl: 3, sw: 7, ax: 9, axs: 1, pk: 5, sh: 5.5, hs: 4, mat: 'diamond', ench: 10 },
    netherite: { sp: 9, dur: 2031, lvl: 4, sw: 8, ax: 10, axs: 1, pk: 6, sh: 6.5, hs: 4, mat: 'netherite_ingot', ench: 15 }
  };
  for (const tn in TIERS) {
    const T = TIERS[tn];
    itm(tn + '_sword', { stack: 1, dur: T.dur, tab: 'combat', tool: { k: 'sword', sp: 1.5, lvl: T.lvl }, dmg: T.sw, aspd: 1.6, tex: 'i_' + tn + '_sword', fuel: tn === 'wooden' ? 200 : 0 });
    itm(tn + '_shovel', { stack: 1, dur: T.dur, tab: 'tools', tool: { k: 'shovel', sp: T.sp, lvl: T.lvl }, dmg: T.sh, aspd: 1, tex: 'i_' + tn + '_shovel', fuel: tn === 'wooden' ? 200 : 0 });
    itm(tn + '_pickaxe', { stack: 1, dur: T.dur, tab: 'tools', tool: { k: 'pick', sp: T.sp, lvl: T.lvl }, dmg: T.pk, aspd: 1.2, tex: 'i_' + tn + '_pickaxe', fuel: tn === 'wooden' ? 200 : 0 });
    itm(tn + '_axe', { stack: 1, dur: T.dur, tab: 'tools', tool: { k: 'axe', sp: T.sp, lvl: T.lvl }, dmg: T.ax, aspd: T.axs, tex: 'i_' + tn + '_axe', fuel: tn === 'wooden' ? 200 : 0, tabs: ['tools', 'combat'] });
    itm(tn + '_hoe', { stack: 1, dur: T.dur, tab: 'tools', tool: { k: 'hoe', sp: T.sp, lvl: T.lvl }, dmg: 1, aspd: T.hs, tex: 'i_' + tn + '_hoe', fuel: tn === 'wooden' ? 200 : 0 });
    itm(tn + '_spear', { stack: 1, dur: T.dur, tab: 'combat', dmg: T.sw - 1, aspd: 1.25, reach: 1, tex: 'i_' + tn + '_spear', spear: 1, fuel: tn === 'wooden' ? 200 : 0 });
  }
  const ARM = {
    leather: { d: [1, 3, 2, 1], m: 5, t: 0, names: ['leather_helmet', 'leather_chestplate', 'leather_leggings', 'leather_boots'], disp: ['Leather Cap', 'Leather Tunic', 'Leather Pants', 'Leather Boots'] },
    chainmail: { d: [2, 5, 4, 1], m: 15, t: 0 }, copper: { d: [2, 4, 3, 1], m: 11, t: 0 }, iron: { d: [2, 6, 5, 2], m: 15, t: 0 }, golden: { d: [2, 5, 3, 1], m: 7, t: 0 },
    diamond: { d: [3, 8, 6, 3], m: 33, t: 2 }, netherite: { d: [3, 8, 6, 3], m: 37, t: 3, kb: .1 }
  };
  const SLOTN = ['helmet', 'chestplate', 'leggings', 'boots'], SLOTB = [11, 16, 15, 13];
  for (const an in ARM) {
    const A = ARM[an];
    for (let i = 0; i < 4; i++) {
      const id = an + '_' + SLOTN[i];
      itm(id, { name: A.disp ? A.disp[i] : undefined, stack: 1, dur: SLOTB[i] * A.m, tab: 'combat', armor: { slot: i, def: A.d[i], tough: A.t, kb: A.kb || 0, mat: an }, tex: 'i_' + id });
    }
  }
  itm('turtle_helmet', { stack: 1, dur: 275, tab: 'combat', armor: { slot: 0, def: 2, tough: 0, mat: 'turtle' }, tex: 'i_turtle_helmet' });
  itm('elytra', { stack: 1, dur: 432, tab: 'tools', armor: { slot: 1, def: 0, tough: 0, mat: 'elytra' }, tex: 'i_elytra' });
  itm('wolf_armor', { stack: 1, dur: 64, tab: 'combat', tex: 'i_wolf_armor' });
  for (const h of ['leather', 'copper', 'iron', 'golden', 'diamond', 'netherite']) itm(h + '_horse_armor', { stack: 1, tab: 'combat', tex: 'i_' + h + '_horse_armor' });
  for (const h of ['copper', 'iron', 'golden', 'diamond', 'netherite']) itm(h + '_nautilus_armor', { stack: 1, tab: 'combat', tex: 'i_' + h + '_nautilus_armor' });
  itm('shield', { stack: 1, dur: 336, tab: 'combat', tex: 'i_shield', shield: 1, fuel: 300 });
  itm('bow', { stack: 1, dur: 384, tab: 'combat', tex: 'i_bow', bow: 1, fuel: 300 });
  itm('crossbow', { stack: 1, dur: 465, tab: 'combat', tex: 'i_crossbow_standby', crossbow: 1, fuel: 300 });
  itm('trident', { stack: 1, dur: 250, tab: 'combat', dmg: 9, aspd: 1.1, tex: 'i_trident', trident: 1 });
  itm('mace', { stack: 1, dur: 500, tab: 'combat', dmg: 6, aspd: .6, tex: 'i_mace', mace: 1 });
  itm('arrow', { tab: 'combat', tex: 'i_arrow' }); itm('spectral_arrow', { tab: 'combat', tex: 'i_spectral_arrow' }); itm('tipped_arrow', { tab: 'combat', tex: 'i_tipped_arrow' });
  itm('wind_charge', { tab: 'combat', tex: 'i_wind_charge', throwable: 'wind_charge' });
  itm('totem_of_undying', { name: 'Totem of Undying', stack: 1, tab: 'combat', tex: 'i_totem_of_undying', totem: 1 });
  itm('snowball', { stack: 16, tab: 'combat', tex: 'i_snowball', throwable: 'snowball' });
  itm('egg', { stack: 16, tab: 'combat', tex: 'i_egg', throwable: 'egg' }); itm('blue_egg', { stack: 16, tab: 'combat', tex: 'i_blue_egg', throwable: 'egg' }); itm('brown_egg', { stack: 16, tab: 'combat', tex: 'i_brown_egg', throwable: 'egg' });
  itm('ender_pearl', { stack: 16, tab: 'combat', tex: 'i_ender_pearl', throwable: 'ender_pearl' });
  itm('flint_and_steel', { stack: 1, dur: 64, tab: 'tools', tex: 'i_flint_and_steel', ignite: 1 });
  itm('fire_charge', { tab: 'combat', tex: 'i_fire_charge', ignite: 2 });
  itm('shears', { stack: 1, dur: 238, tab: 'tools', tex: 'i_shears', tool: { k: 'shears', sp: 1.5, lvl: 0 } });
  itm('brush', { stack: 1, dur: 64, tab: 'tools', tex: 'i_brush' });
  itm('fishing_rod', { stack: 1, dur: 64, tab: 'tools', tex: 'i_fishing_rod', rod: 1, fuel: 300 });
  itm('carrot_on_a_stick', { stack: 1, dur: 25, tab: 'tools', tex: 'i_carrot_on_a_stick' });
  itm('warped_fungus_on_a_stick', { stack: 1, dur: 100, tab: 'tools', tex: 'i_warped_fungus_on_a_stick' });
  itm('bucket', { stack: 16, tab: 'tools', tex: 'i_bucket', bucket: 'empty' });
  itm('water_bucket', { stack: 1, tab: 'tools', tex: 'i_water_bucket', bucket: 'water' });
  itm('lava_bucket', { stack: 1, tab: 'tools', tex: 'i_lava_bucket', bucket: 'lava', fuel: 20000 });
  itm('powder_snow_bucket', { stack: 1, tab: 'tools', tex: 'i_powder_snow_bucket', bucket: 'powder_snow' });
  itm('milk_bucket', { stack: 1, tab: 'food', tex: 'i_milk_bucket', drink: 'milk' });
  for (const f of ['cod', 'salmon', 'pufferfish', 'tropical_fish', 'axolotl', 'tadpole', 'sulfur_cube']) itm(f === 'sulfur_cube' ? 'bucket_of_sulfur_cube' : f + '_bucket', { name: 'Bucket of ' + title(f), stack: 1, tab: 'tools', tex: 'i_' + f + '_bucket', bucket: 'water', mobB: f });
  itm('compass', { tab: 'tools', tex: 'i_compass', compass: 1 }); itm('recovery_compass', { tab: 'tools', tex: 'i_recovery_compass' }); itm('lodestone_compass', { tab: 'tools', tex: 'i_compass' });
  itm('clock', { tab: 'tools', tex: 'i_clock', clock: 1 });
  itm('spyglass', { stack: 1, tab: 'tools', tex: 'i_spyglass', spyglass: 1 });
  itm('map', { name: 'Empty Map', tab: 'tools', tex: 'i_map' }); itm('filled_map', { name: 'Map', tab: null, tex: 'i_filled_map' });
  itm('name_tag', { tab: 'tools', tex: 'i_name_tag' }); itm('lead', { tab: 'tools', tex: 'i_lead' }); itm('saddle', { stack: 1, tab: 'tools', tex: 'i_saddle' });
  itm('bundle', { stack: 1, tab: 'tools', tex: 'i_bundle' });
  for (const c of COLORS) { itm(c + '_bundle', { stack: 1, tab: 'tools', tex: 'i_bundle', tintC: c }); itm(c + '_harness', { stack: 1, tab: 'tools', tex: 'i_harness', tintC: c }); }
  itm('goat_horn', { stack: 1, tab: 'tools', tex: 'i_goat_horn' });
  itm('book', { tab: 'ingr', tex: 'i_book' }); itm('writable_book', { name: 'Book and Quill', stack: 1, tab: 'tools', tex: 'i_writable_book' }); itm('written_book', { stack: 16, tab: null, tex: 'i_written_book' });
  itm('enchanted_book', { stack: 1, tab: 'ingr', tex: 'i_enchanted_book', glint: 1 }); itm('knowledge_book', { stack: 1, tab: null, tex: 'i_knowledge_book' });
  itm('experience_bottle', { name: "Bottle o' Enchanting", tab: 'tools', tex: 'i_experience_bottle', throwable: 'xp_bottle', glint: 1 });
  itm('ender_eye', { name: 'Eye of Ender', tab: 'tools', tex: 'i_ender_eye' });
  itm('end_crystal', { tab: 'combat', tex: 'i_end_crystal' });
  itm('firework_rocket', { tab: 'tools', tex: 'i_firework_rocket' }); itm('firework_star', { tab: 'ingr', tex: 'i_firework_star' });
  for (const w of WOODS) { if (w.nether) continue; const b = w.bamboo ? 'bamboo_raft' : w.n + '_boat'; itm(b, { stack: 1, tab: 'tools', tex: 'i_' + b, boat: w.n, fuel: 1200 }); itm(w.bamboo ? 'bamboo_chest_raft' : w.n + '_chest_boat', { name: w.bamboo ? 'Bamboo Raft with Chest' : title(w.n) + ' Boat with Chest', stack: 1, tab: 'tools', tex: 'i_' + (w.bamboo ? 'bamboo_chest_raft' : w.n + '_chest_boat'), boat: w.n, fuel: 1200 }); }
  for (const m of ['minecart', 'chest_minecart', 'furnace_minecart', 'tnt_minecart', 'hopper_minecart', 'command_block_minecart']) itm(m, { name: m === 'minecart' ? 'Minecart' : 'Minecart with ' + title(m.replace('_minecart', '')), stack: 1, tab: m === 'command_block_minecart' ? null : 'tools', tex: 'i_' + m, cart: 1 });
  itm('armor_stand', { stack: 16, tab: 'func', tex: 'i_armor_stand' }); itm('item_frame', { tab: 'func', tex: 'i_item_frame' }); itm('glow_item_frame', { tab: 'func', tex: 'i_glow_item_frame' }); itm('painting', { tab: 'func', tex: 'i_painting', painting: 1 });
  for (const c of COLORS) itm(c + '_cushion', { tab: 'color', tex: 'i_cushion', tintC: c, cushion: c, fuel: 50 });
  const FOOD = {
    apple: [4, 2.4], baked_potato: [5, 6], beef: [3, 1.8, 'Raw Beef'], cooked_beef: [8, 12.8, 'Steak'], beetroot: [1, 1.2], beetroot_soup: [6, 7.2, 0, 1], bread: [5, 6], carrot: [3, 3.6], chorus_fruit: [4, 2.4],
    chicken: [2, 1.2, 'Raw Chicken'], cooked_chicken: [6, 7.2], cod: [2, .4, 'Raw Cod'], cooked_cod: [5, 6], mutton: [2, 1.2, 'Raw Mutton'], cooked_mutton: [6, 9.6], porkchop: [3, 1.8, 'Raw Porkchop'], cooked_porkchop: [8, 12.8],
    rabbit: [3, 1.8, 'Raw Rabbit'], cooked_rabbit: [5, 6], salmon: [2, .4, 'Raw Salmon'], cooked_salmon: [6, 9.6], cookie: [2, .4], dried_kelp: [1, .6], enchanted_golden_apple: [4, 9.6], glow_berries: [2, .4],
    golden_apple: [4, 9.6], golden_carrot: [6, 14.4], honey_bottle: [6, 1.2], melon_slice: [2, 1.2], mushroom_stew: [6, 7.2, 0, 1], poisonous_potato: [2, 1.2], potato: [1, .6], pufferfish: [1, .2], pumpkin_pie: [8, 4.8],
    rabbit_stew: [10, 12, 0, 1], rotten_flesh: [4, .8], spider_eye: [2, 3.2], suspicious_stew: [6, 7.2, 0, 1], sweet_berries: [2, .4], tropical_fish: [1, .2]
  };
  for (const id in FOOD) { const f = FOOD[id]; itm(id, { name: f[2] || undefined, tab: 'food', tex: 'i_' + id, food: { n: f[0], s: f[1], fast: id === 'dried_kelp', bowl: f[3], always: id === 'golden_apple' || id === 'enchanted_golden_apple' || id === 'chorus_fruit' || id === 'honey_bottle' || id === 'suspicious_stew' }, stack: f[3] ? 1 : id === 'honey_bottle' ? 16 : 64, glint: id === 'enchanted_golden_apple' }); }
  itm('potion', { name: 'Water Bottle', stack: 1, tab: 'food', tex: 'i_potion', drink: 'water' });
  itm('splash_potion', { name: 'Splash Water Bottle', stack: 1, tab: 'food', tex: 'i_splash_potion', throwable: 'splash' });
  itm('lingering_potion', { name: 'Lingering Water Bottle', stack: 1, tab: 'food', tex: 'i_lingering_potion', throwable: 'splash' });
  itm('ominous_bottle', { tab: 'food', tex: 'i_ominous_bottle', drink: 'ominous' });
  const MATS = ['stick', 'coal', 'charcoal', 'diamond', 'emerald', 'lapis_lazuli', 'quartz', 'amethyst_shard', 'raw_iron', 'iron_ingot', 'iron_nugget', 'raw_copper', 'copper_ingot', 'copper_nugget', 'raw_gold', 'gold_ingot', 'gold_nugget',
    'netherite_scrap', 'netherite_ingot', 'redstone', 'glowstone_dust', 'flint', 'clay_ball', 'brick', 'nether_brick', 'resin_clump', 'resin_brick', 'paper', 'sugar', 'wheat', 'string', 'feather', 'leather', 'rabbit_hide', 'rabbit_foot',
    'bone', 'bone_meal', 'gunpowder', 'slime_ball', 'honeycomb', 'ink_sac', 'glow_ink_sac', 'blaze_rod', 'blaze_powder', 'breeze_rod', 'ghast_tear', 'magma_cream', 'ender_pearl_dummy', 'nether_star', 'shulker_shell', 'phantom_membrane',
    'prismarine_shard', 'prismarine_crystals', 'nautilus_shell', 'heart_of_the_sea', 'turtle_scute', 'armadillo_scute', 'echo_shard', 'disc_fragment_5', 'fermented_spider_eye', 'glistering_melon_slice', 'popped_chorus_fruit',
    'dragon_breath', 'bowl', 'glass_bottle', 'trial_key', 'ominous_trial_key', 'heavy_core_dummy', 'cocoa_beans', 'wheat_seeds', 'pumpkin_seeds', 'melon_seeds', 'beetroot_seeds', 'torchflower_seeds', 'pitcher_pod', 'nether_wart_dummy'];
  const MATN = { slime_ball: 'Slimeball', quartz: 'Nether Quartz', disc_fragment_5: 'Disc Fragment', dragon_breath: "Dragon's Breath", rabbit_foot: "Rabbit's Foot", glow_ink_sac: 'Glow Ink Sac', redstone: 'Redstone Dust', bone_meal: 'Bone Meal', armadillo_scute: 'Armadillo Scute' };
  for (const id of MATS) { if (id.endsWith('_dummy')) continue; itm(id, { name: MATN[id], tex: 'i_' + id, tab: 'ingr', fuel: id === 'coal' || id === 'charcoal' ? 1600 : id === 'stick' || id === 'bowl' ? 100 : id === 'blaze_rod' ? 2400 : 0 }); }
  Object.assign(IN.redstone, { place: 'redstone_wire', tab: 'red' });
  Object.assign(IN.wheat_seeds, { place: 'wheat', tabs: ['nature'] }); Object.assign(IN.pumpkin_seeds, { place: 'pumpkin_stem', tabs: ['nature'] }); Object.assign(IN.melon_seeds, { place: 'melon_stem', tabs: ['nature'] });
  Object.assign(IN.beetroot_seeds, { place: 'beetroots', tabs: ['nature'] }); Object.assign(IN.torchflower_seeds, { place: 'torchflower_crop', tabs: ['nature'] }); Object.assign(IN.pitcher_pod, { place: 'pitcher_plant', tabs: ['nature'] });
  Object.assign(IN.cocoa_beans, { place: 'cocoa', tabs: ['nature'] }); Object.assign(IN.carrot, { place: 'carrots' }); Object.assign(IN.potato, { place: 'potatoes' }); Object.assign(IN.sweet_berries, { place: 'sweet_berry_bush', placeAge: 0 }); Object.assign(IN.glow_berries, { place: null });
  Object.assign(IN.bone_meal, { boneMeal: 1 }); Object.assign(IN.string, { place: null });
  itm('nether_wart', { tex: 'i_nether_wart', tab: 'ingr', place: 'nether_wart', tabs: ['nature'] });
  itm('kelp', { tex: 'i_kelp', tab: 'nature', place: 'kelp' });
  itm('ender_pearl', {});
  const DYES = COLORS.map(c => c + '_dye');
  for (const c of COLORS) itm(c + '_dye', { tex: 'i_dye', tintC: c, tab: 'ingr', dye: c });
  const DISCS = ['13', 'cat', 'blocks', 'chirp', 'far', 'mall', 'mellohi', 'stal', 'strad', 'ward', '11', 'wait', 'otherside', '5', 'pigstep', 'relic', 'precipice', 'creator', 'creator_music_box', 'lava_chicken', 'tears', 'bounce'];
  for (const d of DISCS) itm('music_disc_' + d, { name: 'Music Disc', desc: d === 'creator_music_box' ? 'Lena Raine - Creator (Music Box)' : title(d.replace('_', ' ')), stack: 1, tab: 'tools', tex: 'i_music_disc', disc: d });
  const SHERDS = ['angler', 'archer', 'arms_up', 'blade', 'brewer', 'burn', 'danger', 'explorer', 'flow', 'friend', 'guster', 'heart', 'heartbreak', 'howl', 'miner', 'mourner', 'plenty', 'prize', 'scrape', 'sheaf', 'shelter', 'skull', 'snort'];
  for (const s of SHERDS) itm(s + '_pottery_sherd', { tex: 'i_pottery_sherd', tab: 'ingr', sherd: s });
  const TRIMS = ['bolt', 'coast', 'dune', 'eye', 'flow', 'host', 'raiser', 'rib', 'sentry', 'shaper', 'silence', 'snout', 'spire', 'tide', 'vex', 'ward', 'wayfinder', 'wild'];
  for (const t of TRIMS) itm(t + '_armor_trim_smithing_template', { name: 'Smithing Template', desc: title(t) + ' Armor Trim', tex: 'i_smithing_template', tab: 'ingr', trim: t });
  itm('netherite_upgrade_smithing_template', { name: 'Smithing Template', desc: 'Netherite Upgrade', tex: 'i_smithing_template', tab: 'ingr' });
  const PATTERNS = ['flower', 'creeper', 'skull', 'mojang', 'globe', 'piglin', 'flow', 'guster', 'field_masoned', 'bordure_indented'];
  for (const p of PATTERNS) itm(p + '_banner_pattern', { name: 'Banner Pattern', desc: title(p), tex: 'i_banner_pattern', tab: 'ingr' });
  const EXPLORER = ['abandoned_camp', 'buried_ancient_city', 'buried_mineshaft', 'desert_pyramid', 'warm_ocean_ruins', 'bamboo_camp', 'birch_forest_camp', 'cherry_grove_camp', 'dappled_forest_camp', 'flower_forest_camp', 'pale_garden_camp', 'swamp_camp', 'windswept_forest_camp', 'buried_treasure', 'trial_chambers', 'jungle_pyramid', 'ocean_monument', 'woodland_mansion', 'swamp_hut', 'plains_village', 'desert_village', 'savanna_village', 'snowy_village', 'taiga_village'];
  for (const e of EXPLORER) itm(e + '_map', { tex: 'i_explorer_map', tab: 'tools', stack: 1 });
  const MOBS_EGG = [['pig', [240, 160, 156], [219, 99, 94]], ['cow', [68, 54, 37], [161, 161, 161]], ['sheep', [231, 231, 231], [255, 181, 181]], ['chicken', [161, 161, 161], [255, 0, 0]], ['zombie', [0, 175, 175], [121, 156, 101]], ['skeleton', [193, 193, 193], [73, 73, 73]], ['creeper', [13, 161, 12], [0, 0, 0]], ['spider', [52, 45, 39], [163, 0, 0]], ['enderman', [22, 22, 22], [0, 0, 0]], ['slime', [81, 160, 69], [126, 191, 110]], ['wolf', [215, 211, 211], [206, 175, 150]], ['rabbit', [153, 115, 85], [115, 84, 59]], ['villager', [86, 60, 51], [189, 139, 114]], ['bee', [237, 197, 82], [67, 36, 31]], ['sulfur_cube', [222, 214, 81], [176, 158, 47]]];
  for (const [m, a, b] of MOBS_EGG.slice(0, 10)) itm(m + '_spawn_egg', { tex: 'i_spawn_egg', egg: m, eggC: [a, b], tab: 'eggs' });
  for (const t of TT) {
    if (t.item === true && !IN[t.id]) itm(t.id, { name: t.name, block: t.id, place: t.id, tab: t.tab, tabs: t.tabs, stack: t.stack || 64, icon: t.icon, fuel: t.fuel || (t.flam && t.snd === 'wood' ? (t.slab ? 150 : 300) : 0) });
    else if (t.item === true && IN[t.id] && !IN[t.id].place) Object.assign(IN[t.id], { block: t.id, place: t.id });
  }
  for (const n of ['crafting_table', 'chest', 'trapped_chest', 'barrel', 'bookshelf', 'ladder', 'jukebox', 'note_block', 'composter', 'lectern', 'loom', 'cartography_table', 'fletching_table', 'smithing_table', 'daylight_detector']) if (IN[n]) IN[n].fuel = 300;
  for (const it of IT) if (it.block) { const t = TN[it.block]; if (t.tags.has('sapling')) it.fuel = 100; if (t.tags.has('wool')) it.fuel = 100; if (t.id.endsWith('_carpet') && !t.id.includes('moss')) it.fuel = 67; if (t.id.endsWith('_button') && t.snd === 'wood') it.fuel = 100; if (t.door && t.snd === 'wood') it.fuel = 200; if (t.sign) it.fuel = 200; if (t.id.includes('banner')) it.fuel = 300; }
  if (IN.coal_block) IN.coal_block.fuel = 16000; if (IN.dried_kelp_block) IN.dried_kelp_block.fuel = 4001; if (IN.bamboo) IN.bamboo.fuel = 50; if (IN.scaffolding) IN.scaffolding.fuel = 50;
  const isTool = it => !!(it && (it.tool || it.dur));
  const maxStack = id => IT[id].stack;
