#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const root = path.resolve(__dirname, '..');
const outputPath = process.argv[2] || path.join(root, 'game_extracts', 'catalogs', 'mh-wilds.sqlite');
const inputs = {
    game: path.join(root, 'data', 'hunt', 'wilds-game-reference.json'),
    motionValues: path.join(root, 'data', 'hunt', 'wilds-motion-values.json'),
    motionTimings: path.join(root, 'game_extracts', 'tools', 'wilds-motion-timings.json'),
    combos: path.join(root, 'game_extracts', 'tools', 'wilds-weapon-combos.json'),
    itemActions: path.join(root, 'game_extracts', 'tools', 'wilds-item-actions.json'),
    itemParameters: path.join(root, 'game_extracts', 'tools', 'wilds-item-parameters.json'),
    monsterPatterns: path.join(root, 'game_extracts', 'tools', 'wilds-monster-patterns.json'),
    monsterAudioTriggers: path.join(root, 'game_extracts', 'tools', 'wilds-monster-audio-triggers.json')
};
inputs.enemyRcol = path.join(root, 'game_extracts', 'tools', 'mhws-rcol-record', 'Enemy');
inputs.monsterIdentifiers = path.join(root, 'game_extracts', 'tools', 'wilds-monster-identifiers.json');
inputs.audioManifests = ['wilds', 'world', 'rise'].map(game => ({ game, file: path.join(root, 'local_assets', 'monster_hunter', game, 'manifest.json') }));

function load(file, required = false) {
    if (!fs.existsSync(file)) {
        if (required) throw new Error(`Required hunt reference input is missing: ${file}`);
        return null;
    }
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function json(value) {
    return value == null ? null : JSON.stringify(value);
}

function parseCsv(text) {
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        if (quoted) {
            if (char === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
            else if (char === '"') quoted = false;
            else field += char;
        } else if (char === '"') quoted = true;
        else if (char === ',') { row.push(field); field = ''; }
        else if (char === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
        else field += char;
    }
    if (field.length || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
    const headers = rows.shift() || [];
    return rows.filter(values => values.some(Boolean)).map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function buildDatabase(destination = outputPath) {
    const game = load(inputs.game, true);
    const motionValues = load(inputs.motionValues, true);
    const timings = load(inputs.motionTimings, true);
    const combos = load(inputs.combos);
    const itemActions = load(inputs.itemActions);
    const itemParameters = load(inputs.itemParameters);
    const monsterPatterns = load(inputs.monsterPatterns);
    const monsterAudioTriggers = load(inputs.monsterAudioTriggers);
    const monsterIdentifiers = load(inputs.monsterIdentifiers);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    const temporary = `${destination}.tmp`;
    if (fs.existsSync(temporary)) fs.rmSync(temporary);
    const db = new DatabaseSync(temporary);
    db.exec(`
        PRAGMA journal_mode = OFF;
        PRAGMA synchronous = OFF;
        CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
        CREATE TABLE motion_timings (
            owner_type TEXT NOT NULL, owner_id TEXT NOT NULL, motion_list TEXT NOT NULL,
            motion_id INTEGER NOT NULL, internal_name TEXT NOT NULL, frames REAL NOT NULL,
            fps INTEGER NOT NULL, seconds REAL NOT NULL, source_path TEXT, evidence TEXT NOT NULL,
            PRIMARY KEY(owner_type, owner_id, motion_list, motion_id, internal_name)
        );
        CREATE INDEX idx_motion_lookup ON motion_timings(owner_type, owner_id, motion_id);
        CREATE TABLE motion_values (
            weapon_id TEXT NOT NULL, action_id TEXT NOT NULL, action_name TEXT NOT NULL,
            total REAL NOT NULL, hits_json TEXT NOT NULL, properties_json TEXT,
            source_row INTEGER NOT NULL, source_version TEXT, PRIMARY KEY(weapon_id, action_id, source_row)
        );
        CREATE INDEX idx_mv_name ON motion_values(weapon_id, action_name);
        CREATE TABLE monsters (
            id INTEGER PRIMARY KEY, game_id INTEGER, name TEXT NOT NULL, species TEXT,
            base_health REAL, locations_json TEXT, evidence TEXT
        );
        CREATE INDEX idx_monster_name ON monsters(name);
        CREATE TABLE monster_identifiers (
            enum_name TEXT PRIMARY KEY, monster_code TEXT NOT NULL, variant_index INTEGER NOT NULL,
            enum_value INTEGER, game_id INTEGER, public_monster_id INTEGER,
            name_en TEXT, name_ko TEXT, evidence TEXT NOT NULL
        );
        CREATE INDEX idx_monster_identifier_code ON monster_identifiers(monster_code);
        CREATE TABLE monster_parts (
            monster_id INTEGER NOT NULL, part_id INTEGER NOT NULL, kind TEXT NOT NULL,
            health REAL, breakable INTEGER NOT NULL, kinsect_essence TEXT,
            slash REAL, blunt REAL, pierce REAL, fire REAL, water REAL, thunder REAL,
            ice REAL, dragon REAL, stun REAL, multipliers_json TEXT, evidence TEXT,
            PRIMARY KEY(monster_id, part_id), FOREIGN KEY(monster_id) REFERENCES monsters(id)
        );
        CREATE INDEX idx_part_kind ON monster_parts(monster_id, kind);
        CREATE TABLE monster_traits (
            monster_id INTEGER NOT NULL, relation TEXT NOT NULL, kind TEXT,
            level REAL, condition_text TEXT, payload_json TEXT,
            FOREIGN KEY(monster_id) REFERENCES monsters(id)
        );
        CREATE INDEX idx_trait_monster ON monster_traits(monster_id, relation);
        CREATE TABLE final_weapons (
            id INTEGER PRIMARY KEY, game_id INTEGER, kind TEXT NOT NULL, name TEXT NOT NULL,
            rank TEXT, rarity INTEGER, raw_damage REAL, affinity REAL, defense_bonus REAL,
            specials_json TEXT, sharpness_json TEXT, slots_json TEXT, skills_json TEXT,
            type_data_json TEXT, evidence TEXT
        );
        CREATE INDEX idx_weapon_kind ON final_weapons(kind, rarity);
        CREATE TABLE items (
            id INTEGER PRIMARY KEY, game_id INTEGER, name TEXT NOT NULL, rarity INTEGER,
            carry_limit INTEGER, value INTEGER, description TEXT, icon_json TEXT, evidence TEXT
        );
        CREATE INDEX idx_item_name ON items(name);
        CREATE TABLE combo_actions (
            weapon_id TEXT NOT NULL, action_guide_id INTEGER NOT NULL, class_name TEXT,
            action_guid TEXT, combo_end INTEGER, visible INTEGER, source_path TEXT, evidence TEXT,
            PRIMARY KEY(weapon_id, action_guide_id, action_guid)
        );
        CREATE TABLE combo_edges (
            weapon_id TEXT NOT NULL, source_action_id INTEGER NOT NULL, target_action_id INTEGER NOT NULL,
            before_charge_action_id INTEGER, input_json TEXT, conditions_json TEXT,
            source_path TEXT, evidence TEXT NOT NULL
        );
        CREATE INDEX idx_combo_source ON combo_edges(weapon_id, source_action_id);
        CREATE TABLE item_actions (
            action_id TEXT PRIMARY KEY, class_name TEXT, motion_id INTEGER,
            frames REAL, fps INTEGER, seconds REAL, properties_json TEXT,
            source_path TEXT, evidence TEXT
        );
        CREATE TABLE item_parameters (
            parameter_group TEXT NOT NULL, parameter_key TEXT NOT NULL, value_json TEXT,
            value_type TEXT NOT NULL, source_path TEXT NOT NULL, evidence TEXT NOT NULL,
            PRIMARY KEY(parameter_group, parameter_key)
        );
        CREATE INDEX idx_item_parameter_key ON item_parameters(parameter_key);
        CREATE TABLE monster_patterns (
            monster_id TEXT NOT NULL, action_id TEXT NOT NULL, action_kind TEXT NOT NULL,
            class_name TEXT, offensive_candidate INTEGER NOT NULL, state_name TEXT,
            state_candidates_json TEXT, btable_command_types_json TEXT,
            motion_id INTEGER, frames REAL, fps INTEGER, seconds REAL,
            conditions_json TEXT, damage_json TEXT, transitions_json TEXT,
            source_path TEXT, evidence TEXT, PRIMARY KEY(monster_id, action_id, action_kind)
        );
        CREATE INDEX idx_monster_pattern_class ON monster_patterns(monster_id, offensive_candidate, class_name);
        CREATE TABLE monster_audio_triggers (
            monster_code TEXT NOT NULL, monster_name TEXT, trigger_id INTEGER NOT NULL,
            event_id INTEGER NOT NULL, bank_reference TEXT, offset_joint_hash INTEGER,
            action_family TEXT, motion_names_json TEXT, semantic_evidence TEXT,
            source_path TEXT NOT NULL, PRIMARY KEY(monster_code, trigger_id, event_id, source_path)
        );
        CREATE INDEX idx_monster_audio_event ON monster_audio_triggers(monster_code, event_id);
        CREATE INDEX idx_monster_audio_action ON monster_audio_triggers(action_family, monster_code);
        CREATE TABLE monster_attack_colliders (
            monster_code TEXT NOT NULL, rsid INTEGER NOT NULL, rs_name TEXT, group_name TEXT,
            collision_name TEXT, damage_type TEXT, attack REAL, fixed_attack REAL,
            stun_damage REAL, guard_power REAL, damage_level INTEGER, attack_attribute TEXT,
            attribute_value REAL, attack_condition TEXT, condition_value REAL,
            multi_hit_timer REAL, damage_angle TEXT, joint_names TEXT, shape_types TEXT,
            shape_params TEXT, raw_json TEXT NOT NULL, source_path TEXT NOT NULL,
            PRIMARY KEY(monster_code, rsid, rs_name, group_name, collision_name)
        );
        CREATE INDEX idx_monster_attack_code ON monster_attack_colliders(monster_code, attack);
        CREATE TABLE audio_evidence (
            game TEXT NOT NULL, owner_type TEXT, owner_id TEXT, semantic_purpose TEXT,
            action_family TEXT, language TEXT, bank_name TEXT, event_ids_json TEXT,
            source_ids_json TEXT, stream_id TEXT, decoded_path TEXT, duration REAL,
            sha256 TEXT, semantic_evidence_json TEXT, bank_evidence_json TEXT,
            review_hints_json TEXT, voice_profile_json TEXT, confidence TEXT, source_path TEXT
        );
        CREATE INDEX idx_audio_owner ON audio_evidence(game, owner_type, owner_id, semantic_purpose);
        CREATE INDEX idx_audio_action ON audio_evidence(game, action_family, confidence);
    `);

    const meta = db.prepare('INSERT INTO metadata(key, value) VALUES (?, ?)');
    meta.run('schema_version', '1');
    meta.run('built_at', new Date().toISOString());
    meta.run('game_reference_source', json(game.source));
    meta.run('rank_policy', game.rankPolicy);
    meta.run('timing_policy', timings.actionMappingPolicy);

    const addTiming = db.prepare('INSERT INTO motion_timings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const [weaponId, weapon] of Object.entries(timings.weapons || {})) {
        for (const motion of weapon.motions || []) addTiming.run('weapon', weaponId, path.basename(weapon.source), motion.motionId, motion.internalName, motion.frames, motion.fps, motion.seconds, weapon.source, motion.timingEvidence);
    }
    for (const motion of itemActions?.motions || []) addTiming.run('item', 'hunter_item_use', itemActions.motionList || 'plc_ItemUse.motlist.992', motion.motionId, motion.internalName, motion.frames, motion.fps, motion.seconds, itemActions.sourcePath || null, motion.timingEvidence);

    const addMv = db.prepare('INSERT INTO motion_values VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const [weaponId, rows] of Object.entries(motionValues.weapons || {})) {
        for (const row of rows) addMv.run(weaponId, row.id, row.name, row.motionValueTotal, json(row.motionValueHits), json(row.properties), row.sourceRow, motionValues.gameVersion);
    }

    const addMonster = db.prepare('INSERT INTO monsters VALUES (?, ?, ?, ?, ?, ?, ?)');
    const addPart = db.prepare('INSERT INTO monster_parts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const addTrait = db.prepare('INSERT INTO monster_traits VALUES (?, ?, ?, ?, ?, ?)');
    for (const monster of game.monsters || []) {
        addMonster.run(monster.id, monster.gameId, monster.name, monster.species, monster.baseHealth, json(monster.locations), monster.evidence);
        for (const part of monster.parts || []) {
            const m = part.multipliers || {};
            addPart.run(monster.id, part.id, part.kind, part.health, part.breakable ? 1 : 0, part.kinsectEssence, m.slash, m.blunt, m.pierce, m.fire, m.water, m.thunder, m.ice, m.dragon, m.stun, json(m), part.evidence);
        }
        for (const [relation, entries] of [['weakness', monster.weaknesses], ['resistance', monster.resistances]]) {
            for (const entry of entries || []) addTrait.run(
                monster.id,
                relation,
                typeof entry.kind === 'string' ? entry.kind : json(entry.kind),
                typeof entry.level === 'number' ? entry.level : null,
                typeof entry.condition === 'string' ? entry.condition : json(entry.condition),
                json(entry)
            );
        }
    }
    const addMonsterIdentifier = db.prepare('INSERT OR REPLACE INTO monster_identifiers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const row of monsterIdentifiers?.identifiers || []) addMonsterIdentifier.run(row.enumName, row.monsterCode, row.variantIndex, row.enumValue, row.gameId, row.publicMonsterId, row.nameEn, row.nameKo, row.evidence);

    const addWeapon = db.prepare('INSERT INTO final_weapons VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const weapon of game.finalWeapons || []) addWeapon.run(weapon.id, weapon.gameId, weapon.kind, weapon.name, weapon.rank, weapon.rarity, weapon.damage?.raw, weapon.affinity, weapon.defenseBonus, json(weapon.specials), json(weapon.sharpness), json(weapon.slots), json(weapon.skills), json(weapon.typeData), weapon.evidence);
    const addItem = db.prepare('INSERT INTO items VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const item of game.items || []) addItem.run(item.id, item.gameId, item.name, item.rarity, item.carryLimit, item.value, item.description, json(item.icon), item.evidence);

    const addAction = db.prepare('INSERT OR IGNORE INTO combo_actions VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const addEdge = db.prepare('INSERT INTO combo_edges VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const [weaponId, graph] of Object.entries(combos?.weapons || {})) {
        for (const action of graph.actions || []) addAction.run(weaponId, action.actionGuideId, action.className || null, action.actionGuid || '', action.comboEnd ? 1 : 0, action.visible === false ? 0 : 1, action.sourcePath || null, action.evidence || null);
        for (const edge of graph.edges || []) addEdge.run(weaponId, edge.sourceActionId, edge.targetActionId, edge.beforeChargeActionId ?? null, json(edge.input), json(edge.conditions), edge.sourcePath || null, edge.evidence);
    }
    const addItemAction = db.prepare('INSERT OR REPLACE INTO item_actions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const action of itemActions?.actions || []) addItemAction.run(action.actionId, action.className, action.motionId, action.frames, action.fps, action.seconds, json(action.properties), action.sourcePath, action.evidence);
    const addItemParameter = db.prepare('INSERT OR REPLACE INTO item_parameters VALUES (?, ?, ?, ?, ?, ?)');
    for (const group of itemParameters?.groups || []) {
        for (const [key, value] of Object.entries(group.parameters || {})) {
            const valueType = Array.isArray(value) ? 'array' : (value === null ? 'null' : typeof value);
            addItemParameter.run(group.groupId, key, json(value), valueType, itemParameters.sourcePath, itemParameters.evidence);
        }
    }
    const addPattern = db.prepare('INSERT OR REPLACE INTO monster_patterns VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const [monsterId, patterns] of Object.entries(monsterPatterns?.monsters || {})) {
        for (const pattern of patterns) addPattern.run(monsterId, pattern.actionId, pattern.actionKind || 'action', pattern.className, pattern.offensiveCandidate ? 1 : 0, pattern.stateName, json(pattern.stateCandidates), json(pattern.btableCommandTypes), pattern.motionId, pattern.frames, pattern.fps, pattern.seconds, json(pattern.conditions), json(pattern.damage), json(pattern.transitions), pattern.sourcePath, pattern.evidence);
    }
    const addMonsterAudioTrigger = db.prepare('INSERT OR REPLACE INTO monster_audio_triggers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const row of monsterAudioTriggers?.records || []) addMonsterAudioTrigger.run(
        row.monsterCode, row.monsterName || null, row.triggerId, row.eventId,
        typeof row.bankReference === 'string' ? row.bankReference : json(row.bankReference),
        row.offsetJointHash ?? null, row.actionFamily || null, json(row.motionNames),
        row.semanticEvidence || row.motionEvidence || null, row.sourcePath
    );
    const addCollider = db.prepare('INSERT OR IGNORE INTO monster_attack_colliders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    if (fs.existsSync(inputs.enemyRcol)) {
        for (const name of fs.readdirSync(inputs.enemyRcol).filter(file => file.endsWith('.csv')).sort()) {
            const file = path.join(inputs.enemyRcol, name);
            const monsterCode = path.basename(name, '.csv');
            for (const row of parseCsv(fs.readFileSync(file, 'utf8'))) {
                if (!/^\d+$/.test(row.RSID || '')) continue;
                addCollider.run(monsterCode, Number(row.RSID), row.RSName || null, row.GName || null, row.colName || null,
                    row.DamageTypeFixed || null, number(row.Attack), number(row.FixAttack), number(row.StunDamage),
                    number(row.VersusGuardPower), number(row.DamageLevel), row.AttackAttrFixed || null,
                    number(row.AttrValue), row.AttackCond || null, number(row.CondValue), number(row.MultiHitTimer),
                    row.DamageAngleFixed || null, row.GJointNames1 || null, row.GShapeTypes || null,
                    row.GShapeParams || null, json(row), path.relative(root, file).replace(/\\/g, '/'));
            }
        }
    }
    const addAudio = db.prepare('INSERT INTO audio_evidence VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const descriptor of inputs.audioManifests) {
        const manifest = load(descriptor.file);
        for (const entry of manifest?.entries || []) {
            const ownerType = entry.weaponId ? 'weapon' : entry.monsterId ? 'monster' : entry.voiceProfile ? 'voice_profile' : entry.category || 'unknown';
            const ownerId = entry.weaponId || entry.monsterVariant || entry.monsterId || entry.voiceProfile?.id || entry.group || 'common';
            addAudio.run(entry.game || descriptor.game, ownerType, ownerId, entry.purpose || 'unclassified', entry.actionFamily || 'unknown', entry.language || null,
                entry.sourceBank || null, json(entry.wwiseEventIds || []), json(entry.wwiseSourceIds || []), String(entry.stream ?? ''), entry.path || null,
                number(entry.duration), entry.sha256 || null, json(entry.semanticEvidence), json(entry.bankEvidence), json(entry.reviewHints), json(entry.voiceProfile),
                entry.classification?.level || 'unknown', entry.sourceBank || null);
        }
    }
    db.exec('PRAGMA optimize;');
    db.close();
    if (fs.existsSync(destination)) fs.rmSync(destination);
    fs.renameSync(temporary, destination);
    console.log(`[hunt-db] built token-efficient reference catalog -> ${destination}`);
    return destination;
}

if (require.main === module) buildDatabase();
module.exports = { buildDatabase, inputs, parseCsv };
