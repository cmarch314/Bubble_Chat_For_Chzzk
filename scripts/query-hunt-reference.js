#!/usr/bin/env node
'use strict';

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const args = process.argv.slice(2);
let dbPath = path.resolve(__dirname, '..', 'game_extracts', 'catalogs', 'mh-wilds.sqlite');
if (args[0] === '--db') {
    args.shift();
    dbPath = path.resolve(args.shift() || dbPath);
}
const domain = args.shift() || 'summary';
const query = args.join(' ').trim();
const db = new DatabaseSync(dbPath, { readOnly: true });
let rows;
if (domain === 'monster') {
    rows = db.prepare(`SELECT m.name, m.base_health, p.kind, p.health AS part_health, p.breakable,
        p.slash, p.blunt, p.pierce, p.fire, p.water, p.thunder, p.ice, p.dragon
        FROM monsters m JOIN monster_parts p ON p.monster_id=m.id
        WHERE m.name LIKE ? ORDER BY p.breakable DESC, max(p.slash,p.blunt,p.pierce) DESC LIMIT 80`).all(`%${query}%`);
} else if (domain === 'combo') {
    rows = db.prepare(`SELECT e.weapon_id, a.class_name AS source, b.class_name AS target,
        e.input_json, e.conditions_json, e.evidence FROM combo_edges e
        LEFT JOIN combo_actions a ON a.weapon_id=e.weapon_id AND a.action_guide_id=e.source_action_id
        LEFT JOIN combo_actions b ON b.weapon_id=e.weapon_id AND b.action_guide_id=e.target_action_id
        WHERE e.weapon_id LIKE ? LIMIT 100`).all(`%${query}%`);
} else if (domain === 'motion') {
    rows = db.prepare(`SELECT owner_id, motion_id, internal_name, frames, fps, seconds, evidence
        FROM motion_timings WHERE owner_id LIKE ? OR internal_name LIKE ? LIMIT 100`).all(`%${query}%`, `%${query}%`);
} else if (domain === 'weapon') {
    rows = db.prepare(`SELECT kind, name, rank, rarity, raw_damage, affinity, defense_bonus,
        specials_json, slots_json, skills_json FROM final_weapons
        WHERE kind LIKE ? OR name LIKE ? ORDER BY rarity DESC, raw_damage DESC LIMIT 80`).all(`%${query}%`, `%${query}%`);
} else if (domain === 'item') {
    rows = db.prepare('SELECT id, name, rarity, carry_limit, description FROM items WHERE name LIKE ? LIMIT 80').all(`%${query}%`);
} else if (domain === 'item-param') {
    rows = db.prepare(`SELECT parameter_group, parameter_key, value_json, evidence
        FROM item_parameters WHERE parameter_key LIKE ? OR parameter_group LIKE ? LIMIT 100`).all(`%${query}%`, `%${query}%`);
} else if (domain === 'monster-pattern') {
    rows = db.prepare(`SELECT p.monster_id, i.name_en, i.name_ko, p.action_kind, p.class_name, p.offensive_candidate,
        p.state_name, p.state_candidates_json, p.conditions_json, p.evidence
        FROM monster_patterns p LEFT JOIN monster_identifiers i
            ON i.monster_code=p.monster_id AND i.variant_index=0
        WHERE p.monster_id LIKE ? OR p.class_name LIKE ? OR i.name_en LIKE ? OR i.name_ko LIKE ?
        ORDER BY p.offensive_candidate DESC, p.class_name LIMIT 100`).all(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
} else if (domain === 'monster-attack') {
    rows = db.prepare(`SELECT a.monster_code, i.name_en, i.name_ko, a.rsid, a.rs_name, a.group_name, a.collision_name,
        damage_type, attack, fixed_attack, stun_damage, guard_power, attack_attribute,
        attribute_value, multi_hit_timer, source_path
        FROM monster_attack_colliders a LEFT JOIN monster_identifiers i
            ON i.monster_code=a.monster_code AND i.variant_index=0
        WHERE a.monster_code LIKE ? OR a.rs_name LIKE ? OR a.collision_name LIKE ? OR i.name_en LIKE ? OR i.name_ko LIKE ?
        ORDER BY coalesce(a.attack, a.fixed_attack) DESC LIMIT 100`).all(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
} else if (domain === 'audio') {
    rows = db.prepare(`SELECT game, owner_type, owner_id, semantic_purpose, action_family,
        language, bank_name, event_ids_json, source_ids_json, decoded_path,
        duration, confidence, semantic_evidence_json
        FROM audio_evidence
        WHERE owner_id LIKE ? OR semantic_purpose LIKE ? OR action_family LIKE ? OR bank_name LIKE ?
        ORDER BY CASE confidence WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, game LIMIT 100`).all(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
} else {
    rows = db.prepare(`SELECT
        (SELECT count(*) FROM motion_timings) AS motion_timings,
        (SELECT count(*) FROM motion_values) AS motion_values,
        (SELECT count(*) FROM monsters) AS monsters,
        (SELECT count(*) FROM monster_identifiers WHERE public_monster_id IS NOT NULL) AS named_monster_identifiers,
        (SELECT count(*) FROM monster_parts) AS monster_parts,
        (SELECT count(*) FROM final_weapons) AS final_weapons,
        (SELECT count(*) FROM items) AS items,
        (SELECT count(*) FROM item_parameters) AS item_parameters,
        (SELECT count(*) FROM combo_edges) AS combo_edges,
        (SELECT count(*) FROM monster_patterns) AS monster_patterns,
        (SELECT count(*) FROM monster_attack_colliders) AS monster_attack_colliders,
        (SELECT count(*) FROM audio_evidence) AS audio_evidence`).all();
}
console.log(JSON.stringify(rows, null, 2));
db.close();
