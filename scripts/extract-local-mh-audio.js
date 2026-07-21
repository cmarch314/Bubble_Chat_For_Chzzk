#!/usr/bin/env node
'use strict';

// Private, local-only extractor for the user's installed Monster Hunter games.
// Output lives below game_extracts/, which is intentionally excluded from Git.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const game = process.argv.find(value => value.startsWith('--game='))?.split('=')[1]?.toLowerCase() || 'wilds';
const fresh = process.argv.includes('--fresh');
const motionOnly = process.argv.includes('--motion');
const motionLinksOnly = process.argv.includes('--motion-links');
const monsterActionsOnly = process.argv.includes('--monster-actions');
const referenceDataOnly = process.argv.includes('--reference-data');
const soundReferenceOnly = process.argv.includes('--sound-reference');

function run(command, args, options = {}) {
    const result = spawnSync(command, args, { stdio: 'inherit', ...options });
    // RETool returns 1 on some successful selective extractions. The output
    // stamp is a safer resume contract than its legacy exit status.
    if (result.status !== 0 && result.status !== 1) throw new Error(`${path.basename(command)} failed (${result.status})`);
}

function wildsPaks(gameRoot) {
    const names = fs.readdirSync(gameRoot).filter(name => /^re_chunk_000\.pak(?:\.(?:sub_000\.pak|patch_\d+\.pak|sub_000\.pak\.patch_\d+\.pak))?$/i.test(name));
    const order = name => {
        if (name === 're_chunk_000.pak') return 0;
        if (name === 're_chunk_000.pak.sub_000.pak') return 1;
        const patch = Number(name.match(/patch_(\d+)/i)?.[1] || 0);
        const sub = /sub_000/i.test(name) ? 1 : 0;
        return patch * 2 + sub + 1;
    };
    return names.sort((a, b) => order(a) - order(b) || a.localeCompare(b)).map(name => path.join(gameRoot, name));
}

function extractWilds() {
    const install = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\MonsterHunterWilds';
    const tool = path.join(root, 'game_extracts', 'tools', 'MonsterHunterRiseModding', 'files', 'REtool.exe');
    const sourceList = path.join(root, 'game_extracts', 'tools', 'MonsterHunterWildsModding', 'files', 'MHWs.list');
    const out = path.join(root, 'game_extracts', 'wilds');
    const profile = soundReferenceOnly ? 'sound-reference' : referenceDataOnly ? 'reference-data' : monsterActionsOnly ? 'monster-actions' : motionLinksOnly ? 'motion-links' : motionOnly ? 'motion' : 'audio';
    const profileFiles = {
        'sound-reference': ['monster_sound_reference.list', 'monster-sound-reference-extraction-state.json'],
        'reference-data': ['game_reference.list', 'reference-data-extraction-state.json'],
        'monster-actions': ['monster_actions.list', 'monster-actions-extraction-state.json'],
        'motion-links': ['weapon_motion_links.list', 'motion-links-extraction-state.json'],
        motion: ['weapon_motion.list', 'motion-extraction-state.json'],
        audio: ['audio_neutral_ja.list', 'extraction-state.json']
    };
    const list = path.join(out, profileFiles[profile][0]);
    const statePath = path.join(out, profileFiles[profile][1]);
    if (![install, tool, sourceList].every(fs.existsSync)) throw new Error('Wilds install or extractor prerequisites are missing.');
    fs.mkdirSync(out, { recursive: true });
    const selected = fs.readFileSync(sourceList, 'utf8').split(/\r?\n/).filter(line => {
        if (soundReferenceOnly) {
            return /^natives\/STM\/Sound\/UserData\/(?:02_Container|11_TriggerInfoList)\/Enemy\/.+\.user\.3$/i.test(line);
        }
        if (referenceDataOnly) {
            return /^natives\/STM\/GameDesign\/Common\/Enemy\/(?:EM\d{4}_\d{2}_\d|EnemyNameBossSortData)\.user\.\d+$/i.test(line)
                || /^natives\/STM\/GameDesign\/Enemy\/CommonData\/EnumMaker\/EmID\.user\.\d+$/i.test(line)
                || /^natives\/STM\/GameDesign\/Enemy\/CommonData\/Data\/(?:EnemyCategoryList|EnemyDangerData|EnemyWeakAttrData|EmCommonDifficulty2|EmCommonSize)\.user\.\d+$/i.test(line)
                || /^natives\/STM\/GameDesign\/Enemy\/CommonData\/StageResident\/(?:Data\/Em[01]\d{3}_\d{2}_\d_StageResident|List\/EnemyAppearanceStageData)\.user\.\d+$/i.test(line);
        }
        if (monsterActionsOnly) {
            return /^natives\/STM\/GameDesign\/Enemy\/Em[01]\d{3}\/\d{2}\/Action\/.+_(?:Sub)?Action(?:Param|ID)\.user\.\d+$/i.test(line)
                || /^natives\/STM\/GameDesign\/Enemy\/Em[01]\d{3}\/\d{2}\/BTable\/.+\.user\.\d+$/i.test(line)
                || /^natives\/STM\/GameDesign\/Enemy\/Em[01]\d{3}\/\d{2}\/Data\/.+_Param_(?:Angry|AttackAreaParam|Combat|Stamina|Parts|PartsBreakReward|PartsLost)\.user\.\d+$/i.test(line)
                || /^natives\/STM\/GameDesign\/Enemy\/Em[01]\d{3}\/\d{2}\/Collision\/Collider\/.+_Attack\.rcol\.\d+$/i.test(line)
                || /^natives\/STM\/GameDesign\/Enemy\/Em[01]\d{3}\/\d{2}\/Shell\/.+(?:MainParam|EffectParam)\.user\.\d+$/i.test(line)
                || /^natives\/STM\/Motion\/Enemy\/em[01]\d{3}\/\d{2}\/em\d{4}_\d{2}\/em\d{4}_\d{2}\.(?:motlist\.\d+|user\.\d+)$/i.test(line);
        }
        if (motionLinksOnly) {
            return /^natives\/STM\/GameDesign\/Player\/ActionData\/Wp\d{2}\/Action\/[^/]+_(?:ActionParam|ActionID)\.user\.\d+$/i.test(line)
                || /^natives\/STM\/GameDesign\/Player\/ActionData\/Wp\d{2}\/BTable\/[^/]+\.user\.\d+$/i.test(line)
                || /^natives\/STM\/GameDesign\/Common\/Player\/ActionGuide\/ActionGuideData_Wp\d{2}(?:Always|Combo|ComboDetail|Name)?\.user\.\d+$/i.test(line)
                || /^natives\/STM\/GameDesign\/Player\/ActionData\/Common\/Action\/PlCommon(?:Sub)?_(?:ActionParam|ActionID)\.user\.\d+$/i.test(line)
                || /^natives\/STM\/GameDesign\/Player\/ActionData\/Common\/GlobalParam\/PlayerItemParam\.user\.\d+$/i.test(line)
                || /^natives\/STM\/Motion\/Player\/Common\/plc_ItemUse(?:_tree)?\/.+\.(?:motlist\.\d+|user\.\d+)$/i.test(line)
                || /^natives\/STM\/Sound\/UserData\/(?:11_TriggerInfoList\/Hunter\/(?:Shell\/)?HunterItem|39_Shell\/Hunter\/ItemThorow_).+\.user\.\d+$/i.test(line)
                || /^natives\/STM\/GameDesign\/Enemy\/Em\d{4}\/\d{2}\/Data\/Em\d{4}_\d{2}_Param_(?:Parts|PartsBreakReward|PartsEffect|PartsLost)\.user\.\d+$/i.test(line)
                || /^natives\/STM\/Motion\/Player\/Weapon\/Wp\d{2}\/.+_(?:mct|mex|mcb|meb)\.user\.\d+$/i.test(line);
        }
        if (motionOnly) {
            return /^natives\/STM\/Motion\/Player\/Weapon\/Wp\d{2}\/(?:[^/]+\/[^/]+\.motlist\.\d+|[^/]+\.motbank\.\d+)$/i.test(line);
        }
        if (!/^natives\/STM\/Sound\/Wwise\/.+\.(?:sbnk|spck)\.\d+\.X64(?:\.[A-Za-z0-9]+)?$/i.test(line)) return false;
        const locale = line.match(/\.X64\.([A-Za-z0-9]+)$/i)?.[1]?.toLowerCase();
        return !locale || locale === 'ja';
    });
    fs.writeFileSync(list, `${selected.join('\n')}\n`, 'utf8');
    const selectionHash = crypto.createHash('sha256').update(selected.join('\n')).digest('hex');
    const state = !fresh && fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : { version: 1, completed: [] };
    if (state.selectionHash !== selectionHash) state.completed = [];
    state.selectionHash = selectionHash;
    const completed = new Set(state.completed || []);
    for (const pak of wildsPaks(install)) {
        const name = path.basename(pak);
        if (completed.has(name)) continue;
        console.log(`[mh-extract] Wilds ${name}`);
        run(tool, ['-skipUnknowns', '-noExtractDir', '-h', list, '-x', pak], { cwd: out });
        completed.add(name);
        state.completed = [...completed];
        state.updatedAt = new Date().toISOString();
        state.selectedPaths = selected.length;
        fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
    }
    const label = soundReferenceOnly ? 'monster sound trigger/container reference' : referenceDataOnly ? 'game reference' : monsterActionsOnly ? 'monster action/pattern/motion' : motionLinksOnly ? 'weapon action/motion-link' : motionOnly ? 'weapon motion' : 'neutral/Japanese bank';
    console.log(`[mh-extract] Wilds complete: ${selected.length} ${label} paths.`);
}

function extractWorld() {
    const install = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Monster Hunter World\\chunk';
    const tool = path.join(root, 'game_extracts', 'tools', 'WorldChunkTool', 'portable', 'WorldChunkTool.exe');
    const out = path.join(root, 'game_extracts', 'world');
    if (![install, tool].every(fs.existsSync)) throw new Error('World install or extractor prerequisites are missing.');
    fs.mkdirSync(out, { recursive: true });
    const chunks = fs.readdirSync(install).filter(name => /^chunkG\d+\.bin$/i.test(name)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
    for (const name of chunks) {
        console.log(`[mh-extract] World ${name}`);
        run(tool, [path.join(install, name), '-AutoConfirm'], { cwd: out });
    }
}

if (game === 'wilds') extractWilds();
else if (game === 'world') extractWorld();
else throw new Error(`Unsupported extraction profile: ${game}`);
