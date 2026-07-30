#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { classifyAction, actionLabel } = require('./generate-wilds-monster-behavior');

const ROOT = path.resolve(__dirname, '..');
const WIKI_DIR = path.join(ROOT, 'game_extracts', 'reference-repos', 'MonsterHunterWorldModding.wiki');
const OUTPUT_PATH = path.join(ROOT, 'data', 'hunt', 'world-shell-behavior.generated.json');
const RUNTIME_PATH = path.join(ROOT, 'js', 'effects', 'hunt', 'data', 'WorldShellBehavior.generated.js');
const SOURCE_URL = 'https://github.com/AniBullet/MonsterHunterWorldModding/wiki/Monster-Action-%E2%80%90-Shell-Mappings-(A%E2%80%90P)';

const GROUP_IDS = Object.freeze({
    Alatreon: 'alatreon', AncientLeshen: 'ancient_leshen', Banbaro: 'banbaro',
    Behemoth: 'behemoth', Beotodus: 'beotodus', Deviljho: 'deviljho',
    Dodogama: 'dodogama', GreatGirros: 'great_girros', GreatJagras: 'great_jagras',
    KulveTaroth: 'kulve_taroth', Legiana: 'legiana', Leshen: 'leshen',
    Lunastra: 'lunastra', Namielle: 'namielle', Odogaron: 'odogaron',
    Paolumu: 'paolumu', Radobaan: 'radobaan', Safijiiva: 'safi_jiiva',
    ScarredYianGaruga: 'scarred_yian_garuga', SharaIshvalda_forceTransG: 'shara_ishvalda',
    SharaIshvalda_skipTransG: 'shara_ishvalda', TzitziYaku: 'tzitzi_ya_ku',
    VaalHazak: 'vaal_hazak', Xenojiiva: 'xeno_jiiva', ZorahMagdaros_Magmacore: 'zorah_magdaros',
    AcidicGlavenus: 'acidic_glavenus', Anjanath: 'anjanath', AzureRathalos: 'azure_rathalos',
    Barioth: 'barioth', Barroth: 'barroth', Bazelgeuse: 'bazelgeuse', BlackDiablos: 'black_diablos',
    BlackveilVaal: 'blackveil_vaal_hazak', Brachydios: 'brachydios', BruteTigrex: 'brute_tigrex',
    CoralPukei: 'coral_pukei_pukei', Diablos: 'diablos', EbonyOdogaron: 'ebony_odogaron',
    Fatalis: 'fatalis', FrostfangBarioth: 'frostfang_barioth', FulgurAnjanath: 'fulgur_anjanath',
    FuriousRajang: 'furious_rajang', Glavenus: 'glavenus', GoldRathian: 'gold_rathian',
    Jyuratodus: 'jyuratodus', Jyuuratodus: 'jyuratodus', Kirin: 'kirin', KuluYaku: 'kulu_ya_ku',
    KushalaDaora: 'kushala_daora', Lavasioth: 'lavasioth', Nargacuga: 'nargacuga',
    Nergigante: 'nergigante', NightshadePaolumu: 'nightshade_paolumu', PinkRathian: 'pink_rathian',
    PukeiPukei: 'pukei_pukei', RagingBrachydios_forceFinalMode: 'raging_brachydios',
    RagingBrachydios_skipFinalMode: 'raging_brachydios', Rajang: 'rajang', Rathalos: 'rathalos',
    Rathian: 'rathian', RuinerNergigante: 'ruiner_nergigante', SavageDeviljho: 'savage_deviljho',
    SeethingBazelgeuse: 'seething_bazelgeuse', ShriekingLegiana: 'shrieking_legiana',
    SilverRathalos: 'silver_rathalos', StygianZinogre: 'stygian_zinogre', Teostra: 'teostra',
    Tigrex: 'tigrex', TobiKadachi: 'tobi_kadachi', Uragaan: 'uragaan', Velkhana: 'velkhana',
    ViperTobi: 'viper_tobi_kadachi', YianGaruga: 'yian_garuga', Zinogre: 'zinogre'
});

function normalizeGroup(value) {
    return String(value || '').replace(/\//g, '_');
}

function parseGroups(markdown) {
    const starts = [...String(markdown || '').matchAll(/^ {4}<summary>([^<]+)<\/summary>$/gm)];
    return starts.map((match, index) => {
        const body = markdown.slice(match.index, starts[index + 1]?.index ?? markdown.length);
        const actions = [...body.matchAll(/ACTION::([A-Z0-9_]+)/g)].map(action => action[1]);
        const monsterCodes = [...new Set([...body.matchAll(/em\\(em\d{3}(?:\\\d{2})?)\\/gi)]
            .map(code => code[1].replace('\\', '_').toLowerCase()))];
        return { group: match[1], actions: [...new Set(actions)], monsterCodes };
    });
}

function usable(name) {
    if (classifyAction(name) === 'utility') return false;
    return !/(GRAPPLE|DAMAGE|DEATH|THREAT|DISCOVER|MEDIATION|RECEIVER|TUTORIAL|MOVE_|SIGN$|CHECK|RETURN|START$|END$|LOOP|GURAGURA)/i.test(name);
}

function score(name) {
    return (/ULTIMATE|NOVA|SUPER|MAX|LARGE|TRIPLE|DOUBLE|COMBO/i.test(name) ? 50 : 0)
        + (/BREATH|SHOT|BOMB|ATTACK|RUSH|TACKLE|BITE|KICK|LASER|STAMP|TAIL/i.test(name) ? 20 : 0);
}

function selectActions(actions, desired = 6) {
    const candidates = [...new Set(actions)].filter(usable);
    const selected = [];
    for (const semantic of ['projectile', 'charge', 'aerial', 'burrow', 'sweep', 'area', 'close']) {
        const candidate = candidates.filter(name => classifyAction(name) === semantic)
            .sort((a, b) => score(b) - score(a))[0];
        if (candidate && !selected.includes(candidate)) selected.push(candidate);
        if (selected.length >= desired) break;
    }
    for (const candidate of candidates.sort((a, b) => score(b) - score(a))) {
        if (selected.length >= desired) break;
        if (!selected.includes(candidate)) selected.push(candidate);
    }
    return selected;
}

function pattern(monsterId, name, index) {
    const semantic = classifyAction(name);
    const range = ['area', 'sweep'].includes(semantic) ? [2, 4] : semantic === 'projectile' ? [1, 3] : [1, 2];
    return {
        id: `${monsterId}.worldshell.${index}.${name.toLowerCase()}`,
        name: actionLabel(name, semantic), type: semantic === 'close' ? 'physical' : semantic,
        damageRatio: semantic === 'area' ? 0.38 : ['charge', 'aerial'].includes(semantic) ? 0.36 : 0.29,
        windupTicks: ['charge', 'aerial', 'burrow'].includes(semantic) ? 7 : 5,
        activeTicks: ['projectile', 'sweep'].includes(semantic) ? 3 : 2, recoveryTicks: 9,
        minTargets: range[0], maxTargets: range[1], cooldownTicks: 32, weight: 1,
        tags: [semantic, semantic === 'projectile' && 'projectile'].filter(Boolean),
        sourceActionClass: name, sourceGame: 'world-iceborne',
        evidence: 'mhw-action-shell-mapping', confidence: 'extracted-action-shell'
    };
}

function build(groups) {
    const merged = new Map();
    for (const group of groups) {
        const id = GROUP_IDS[normalizeGroup(group.group)];
        if (!id) continue;
        if (!merged.has(id)) merged.set(id, { id, sourceGroups: [], sourceMonsterCodes: [], actions: [] });
        const row = merged.get(id);
        row.sourceGroups.push(group.group);
        row.sourceMonsterCodes.push(...group.monsterCodes);
        row.actions.push(...group.actions);
    }
    return [...merged.values()].map(row => {
        const selected = selectActions(row.actions);
        return {
            id: row.id, sourceGroups: [...new Set(row.sourceGroups)],
            sourceMonsterCodes: [...new Set(row.sourceMonsterCodes)],
            sourceActionCount: new Set(row.actions).size,
            patterns: selected.map((name, index) => pattern(row.id, name, index)),
            evidence: 'mhw-action-shell-mapping'
        };
    }).filter(row => row.patterns.length);
}

function generate() {
    const files = fs.readdirSync(WIKI_DIR).filter(name => name.startsWith('Monster-Action-'));
    const groups = files.flatMap(name => parseGroups(fs.readFileSync(path.join(WIKI_DIR, name), 'utf8')));
    const monsters = build(groups);
    const output = {
        version: 1,
        source: { title: 'Monster Action - Shell Mappings', url: SOURCE_URL, repository: 'AniBullet/MonsterHunterWorldModding.wiki' },
        counts: { sourceGroups: groups.length, monsters: monsters.length, patterns: monsters.reduce((sum, row) => sum + row.patterns.length, 0) },
        monsters
    };
    fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
    fs.writeFileSync(RUNTIME_PATH,
        `window.HUNT_WORLD_SHELL_BEHAVIOR = ${JSON.stringify(Object.fromEntries(monsters.map(row => [row.id, row])), null, 2)};\n`, 'utf8');
    return output;
}

if (require.main === module) console.log(JSON.stringify(generate().counts, null, 2));
module.exports = { normalizeGroup, parseGroups, usable, selectActions, build, generate };
