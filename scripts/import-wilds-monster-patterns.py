#!/usr/bin/env python3
"""Index evidence-backed Wilds monster actions and their behavior-table contexts."""

import json
import re
import sys
from collections import defaultdict
from collections.abc import Mapping
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parents[1]
REASY = ROOT / "game_extracts" / "tools" / "REasy-master" / "REasy-master"
ENEMY_ROOT = ROOT / "game_extracts" / "wilds" / "natives" / "STM" / "GameDesign" / "Enemy"
OUTPUT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "game_extracts" / "tools" / "wilds-monster-patterns.json"
sys.path.insert(0, str(REASY))

from utils.type_registry import TypeRegistry  # noqa: E402
from file_handlers.rsz.rsz_file import RszFile  # noqa: E402

REGISTRY = TypeRegistry(str(REASY / "resources" / "data" / "dumps" / "rszmhwilds.json"))
ACTION_TYPE = re.compile(r"^app\.(Em\d{4}_\d{2})(Action|SubAction)\.(c.+)$")
OFFENSIVE = re.compile(
    r"attack|bite|breath|rush|roar|howl|charge|claw|tail|tackle|slam|strike|"
    r"shot|shoot|shell|beam|laser|bomb|explosion|explode|dive|glideattack|"
    r"somersault|stamp|kick|punch|throw|sweep|spin|tornado|thunder|fire|"
    r"poison|web|bind|bodypress|jumpattack|ambush",
    re.IGNORECASE,
)
REFERENCE_FIELDS = {"_ActionComponentArray", "_AttrBit", "_MotionSequenceFilters"}


def parse(file):
    parsed = RszFile()
    parsed.filepath = str(file)
    parsed.type_registry = REGISTRY
    parsed.read(file.read_bytes())
    return parsed


def type_name(parsed, index):
    info = REGISTRY.get_type_info(parsed.instance_infos[index].type_id)
    return info.get("name", "") if isinstance(info, dict) else str(info)


def scalar(value):
    if isinstance(value, Mapping):
        return {key: scalar(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [scalar(item) for item in value]
    if hasattr(value, "values") and not callable(value.values):
        return [scalar(item) for item in value.values]
    if hasattr(value, "guid_str"):
        return value.guid_str.lower()
    if hasattr(value, "string"):
        return value.string.rstrip("\0")
    if hasattr(value, "value"):
        return scalar(value.value)
    if isinstance(value, str):
        return value.rstrip("\0")
    return value


def fields(parsed, index):
    value = parsed.parsed_elements.get(index)
    return value if isinstance(value, Mapping) else {}


def field(parsed, index, name, default=None):
    return scalar(fields(parsed, index).get(name, default))


def resolve_value(parsed, value):
    resolved = scalar(value)
    if isinstance(resolved, int) and 0 <= resolved < len(parsed.instance_infos):
        nested = fields(parsed, resolved)
        if "_Value" in nested:
            return scalar(nested["_Value"])
    return resolved


def source(file):
    return file.relative_to(ROOT).as_posix()


def simple_parameters(values):
    output = {}
    for key, value in values.items():
        if key in REFERENCE_FIELDS:
            continue
        item = scalar(value)
        if isinstance(item, (bool, int, float)) or item is None:
            output[key] = item
        elif isinstance(item, str) and len(item) <= 160:
            output[key] = item
        elif isinstance(item, list) and len(item) <= 32 and all(isinstance(entry, (bool, int, float, str)) or entry is None for entry in item):
            output[key] = item
    return output


def read_action_ids(file):
    parsed = parse(file)
    output = []
    for index in range(len(parsed.instance_infos)):
        if type_name(parsed, index) != "ace.user_data.ActionID.cID":
            continue
        output.append({
            "className": field(parsed, index, "_Class"),
            "actionGuid": field(parsed, index, "_InstanceGuid"),
            "baseActionGuid": field(parsed, index, "_BaseActionGuid"),
            "upperGuid": field(parsed, index, "_UpperGuid"),
            "lowerGuid": field(parsed, index, "_LowerGuid"),
            "evidence": "installed-game-action-id",
        })
    return output


def read_action_parameters(file, monster_code, action_kind):
    parsed = parse(file)
    output = defaultdict(list)
    for index in range(len(parsed.instance_infos)):
        match = ACTION_TYPE.match(type_name(parsed, index))
        if not match or match.group(1) != monster_code or match.group(2).lower() != action_kind.lower():
            continue
        class_name = match.group(3)
        output[class_name].append(simple_parameters(fields(parsed, index)))
    return output


def btable_contexts(files):
    contexts = defaultdict(set)
    command_types = defaultdict(set)
    parsed_count = 0
    for file in files:
        try:
            parsed = parse(file)
        except Exception as error:  # preserve progress when optional/story tables use unsupported shapes
            print(f"[wilds-monsters] warning: skipped {source(file)}: {error}", file=sys.stderr)
            continue
        parsed_count += 1
        state_name = re.sub(r"^.+?_B[Tt]able_?", "", file.stem.replace(".user", "")) or file.stem
        for index in range(len(parsed.instance_infos)):
            values = fields(parsed, index)
            if "_EditActionGuid" not in values:
                continue
            guid = resolve_value(parsed, values["_EditActionGuid"])
            if not isinstance(guid, str) or guid.startswith("00000000-"):
                continue
            contexts[guid].add(state_name)
            command_types[guid].add(type_name(parsed, index))
    return contexts, command_types, parsed_count


def build_action_file(action_param):
    action_dir = action_param.parent
    variant_dir = action_dir.parent
    match = re.match(r"(Em\d{4}_\d{2})_(SubAction|Action)Param\.user\.3$", action_param.name)
    if not match:
        return None
    monster_code = match.group(1)
    action_kind = match.group(2)
    id_file = action_dir / f"{monster_code}_{action_kind}ID.user.3"
    if not id_file.exists():
        return None
    action_ids = read_action_ids(id_file)
    params = read_action_parameters(action_param, monster_code, action_kind)
    contexts, command_types, table_count = btable_contexts(sorted((variant_dir / "BTable").rglob("*.user.3")))
    patterns = []
    seen_classes = set()
    for record in action_ids:
        class_name = record.get("className")
        guid = record.get("actionGuid")
        if not class_name or not guid:
            continue
        seen_classes.add(class_name)
        variants = params.get(class_name) or [{}]
        parameters = variants[0]
        state_names = sorted(contexts.get(guid, ()))
        patterns.append({
            "actionId": guid,
            "actionKind": action_kind.lower(),
            "className": class_name,
            "offensiveCandidate": bool(OFFENSIVE.search(class_name)),
            "stateName": state_names[0] if len(state_names) == 1 else None,
            "stateCandidates": state_names,
            "btableCommandTypes": sorted(command_types.get(guid, ())),
            "motionId": None,
            "frames": None,
            "fps": None,
            "seconds": None,
            "conditions": {
                "parameters": parameters,
                "parameterVariantCount": len(variants),
                "baseActionGuid": record.get("baseActionGuid"),
                "upperGuid": record.get("upperGuid"),
                "lowerGuid": record.get("lowerGuid"),
            },
            "damage": None,
            "transitions": [],
            "sourcePath": source(action_param),
            "evidence": "installed-game-action-id+action-param" + ("+btable-context" if state_names else ""),
        })
    # Preserve parameter classes omitted from ActionID without inventing a GUID.
    for class_name in sorted(set(params) - seen_classes):
        parameters = params[class_name][0]
        patterns.append({
            "actionId": f"class:{class_name}",
            "actionKind": action_kind.lower(),
            "className": class_name,
            "offensiveCandidate": bool(OFFENSIVE.search(class_name)),
            "stateName": None,
            "stateCandidates": [],
            "btableCommandTypes": [],
            "motionId": None, "frames": None, "fps": None, "seconds": None,
            "conditions": {"parameters": parameters, "parameterVariantCount": len(params[class_name])},
            "damage": None, "transitions": [],
            "sourcePath": source(action_param),
            "evidence": "installed-game-action-param-unlinked",
        })
    return monster_code, patterns, table_count


def main():
    if not REASY.exists() or not ENEMY_ROOT.exists():
        raise FileNotFoundError("REasy or extracted Wilds enemy data is missing")
    monsters = {}
    total_tables = 0
    files = sorted(ENEMY_ROOT.glob("Em????/??/Action/*ActionParam.user.3"))
    for position, file in enumerate(files, 1):
        built = build_action_file(file)
        if built:
            code, patterns, table_count = built
            monsters.setdefault(code, []).extend(patterns)
            total_tables += table_count
        if position % 10 == 0:
            print(f"[wilds-monsters] parsed {position}/{len(files)} variants", file=sys.stderr)
    data = {
        "version": 1,
        "game": "Monster Hunter Wilds",
        "mappingPolicy": "ActionID and ActionParam are verified. BTable filenames are contexts only; motion and damage remain unlinked until a direct game reference proves them.",
        "monsterCount": len(monsters),
        "btableFilesParsed": total_tables,
        "monsters": monsters,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    action_count = sum(len(rows) for rows in monsters.values())
    offensive_count = sum(1 for rows in monsters.values() for row in rows if row["offensiveCandidate"])
    print(f"[wilds-monsters] indexed {action_count} actions ({offensive_count} offensive candidates), {total_tables} behavior tables -> {OUTPUT}")


if __name__ == "__main__":
    main()
