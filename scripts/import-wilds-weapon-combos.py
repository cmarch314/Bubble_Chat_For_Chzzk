#!/usr/bin/env python3
"""Build a compact, evidence-labelled Wilds weapon combo graph from extracted RSZ files."""

import json
import re
import sys
from collections import defaultdict
from collections.abc import Mapping
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parents[1]
REASY = ROOT / "game_extracts" / "tools" / "REasy-master" / "REasy-master"
EXTRACTED = ROOT / "game_extracts" / "wilds" / "natives" / "STM"
OUTPUT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "game_extracts" / "tools" / "wilds-weapon-combos.json"
sys.path.insert(0, str(REASY))

from utils.type_registry import TypeRegistry  # noqa: E402
from file_handlers.rsz.rsz_file import RszFile  # noqa: E402

REGISTRY = TypeRegistry(str(REASY / "resources" / "data" / "dumps" / "rszmhwilds.json"))
WEAPONS = json.loads((ROOT / "data" / "hunt" / "wilds-weapon-codes.json").read_text(encoding="utf-8"))["codes"]


def parse(file):
    result = RszFile()
    result.filepath = str(file)
    result.type_registry = REGISTRY
    result.read(file.read_bytes())
    return result


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


def resolve_value(parsed, reference, name="_Value"):
    raw = scalar(reference)
    if isinstance(raw, int) and 0 <= raw < len(parsed.instance_infos):
        return field(parsed, raw, name)
    return raw


def source(file):
    return file.relative_to(ROOT).as_posix()


def action_id_catalog(file):
    parsed = parse(file)
    actions = []
    for index in range(len(parsed.instance_infos)):
        if type_name(parsed, index) != "ace.user_data.ActionID.cID":
            continue
        actions.append({
            "className": field(parsed, index, "_Class"),
            "actionGuid": field(parsed, index, "_InstanceGuid"),
            "baseActionGuid": field(parsed, index, "_BaseActionGuid"),
            "sourcePath": source(file),
            "evidence": "installed-game-action-id",
        })
    return actions


def action_params(files):
    by_guide = defaultdict(list)
    for file in files:
        parsed = parse(file)
        for index in range(len(parsed.instance_infos)):
            values = fields(parsed, index)
            if "_ActionGuideID" not in values:
                continue
            guide_id = field(parsed, index, "_ActionGuideID")
            if not isinstance(guide_id, int) or guide_id == -1:
                continue
            name = type_name(parsed, index).rsplit(".", 1)[-1]
            by_guide[guide_id].append({
                "actionGuideId": guide_id,
                "className": name,
                "sourcePath": source(file),
                "evidence": "installed-game-action-param",
            })
    return by_guide


def action_name_metadata(file):
    parsed = parse(file)
    result = {}
    for index in range(len(parsed.instance_infos)):
        values = fields(parsed, index)
        if "_Action" not in values or "_ActionName" not in values:
            continue
        action_id = field(parsed, index, "_Action")
        result[action_id] = {
            "actionGuideId": action_id,
            "textGuid": field(parsed, index, "_ActionName"),
            "comboEnd": bool(field(parsed, index, "_IsComboEnd", False)),
            "visible": not bool(field(parsed, index, "_IsInvisible", False)),
            "trainingVisible": not bool(field(parsed, index, "_IsTrainingInvisible", False)),
            "sourcePath": source(file),
            "evidence": "installed-game-action-guide-name",
        }
    return result


def action_guide_edges(file):
    parsed = parse(file)
    output = []
    for index in range(len(parsed.instance_infos)):
        values = fields(parsed, index)
        if "_Action" not in values or "_TransitionAction" not in values:
            continue
        action = field(parsed, index, "_Action")
        target = field(parsed, index, "_TransitionAction")
        if not isinstance(action, int) or not isinstance(target, int):
            continue
        inputs = []
        input_refs = scalar(values.get("_Input", [])) or []
        input_types = scalar(values.get("_InputType", [])) or []
        for position, reference in enumerate(input_refs):
            value = resolve_value(parsed, reference)
            if value not in (None, 1629007360, 235815680):
                inputs.append({"position": position, "keyId": value, "inputType": input_types[position] if position < len(input_types) else None})
        output.append({
            "sourceActionId": action,
            "targetActionId": target,
            "beforeChargeActionId": field(parsed, index, "_BeforeChargeAction"),
            "input": inputs,
            "conditions": {
                "isBeforeCharge": bool(field(parsed, index, "_IsBeforeCharge", False)),
                "isProgramCall": bool(field(parsed, index, "_IsProgramCall", False)),
                "viewType": field(parsed, index, "_ViewType"),
                "leftStick": field(parsed, index, "_LStickInput"),
                "rightStick": field(parsed, index, "_RStickInput"),
            },
            "sourcePath": source(file),
            "evidence": "installed-game-action-guide-transition",
        })
    return output


def btable_targets(files, guid_to_class):
    targets = []
    for file in files:
        parsed = parse(file)
        for index in range(len(parsed.instance_infos)):
            values = fields(parsed, index)
            if "_EditActionGuid" not in values:
                continue
            guid = resolve_value(parsed, values["_EditActionGuid"])
            if not isinstance(guid, str) or guid.startswith("00000000-"):
                continue
            targets.append({
                "actionGuid": guid,
                "className": guid_to_class.get(guid),
                "commandType": type_name(parsed, index),
                "sourcePath": source(file),
                "evidence": "installed-game-btable-command-target",
            })
    unique = {(item["actionGuid"], item["commandType"], item["sourcePath"]): item for item in targets}
    return list(unique.values())


def build_weapon(code, weapon_id):
    action_dir = EXTRACTED / "GameDesign" / "Player" / "ActionData" / code / "Action"
    btable_dir = action_dir.parent / "BTable"
    guide_dir = EXTRACTED / "GameDesign" / "Common" / "Player" / "ActionGuide"
    id_file = action_dir / f"{code}_ActionID.user.3"
    guide_file = guide_dir / f"ActionGuideData_{code}.user.3"
    name_file = guide_dir / f"ActionGuideData_{code}Name.user.3"
    if not all(file.exists() for file in (id_file, guide_file, name_file)):
        raise FileNotFoundError(f"Incomplete extracted action data for {code}")
    id_actions = action_id_catalog(id_file)
    guid_to_class = {row["actionGuid"]: row["className"] for row in id_actions}
    params = action_params(sorted(action_dir.glob(f"{code}*ActionParam.user.3")))
    metadata = action_name_metadata(name_file)
    edges = action_guide_edges(guide_file)
    actions = []
    for guide_id in sorted(set(params) | set(metadata)):
        param = params.get(guide_id, [{}])[0]
        meta = metadata.get(guide_id, {})
        class_name = param.get("className")
        matching_guids = [row["actionGuid"] for row in id_actions if row["className"] == class_name]
        actions.append({
            **meta,
            **param,
            "actionGuideId": guide_id,
            "actionGuid": matching_guids[0] if len(matching_guids) == 1 else None,
            "candidateActionGuids": matching_guids,
            "evidence": "installed-game-action-param+guide" if param and meta else (param.get("evidence") or meta.get("evidence")),
        })
    known = {row["actionGuideId"] for row in actions}
    unresolved = sorted({edge[side] for edge in edges for side in ("sourceActionId", "targetActionId")} - known)
    return {
        "weaponCode": code,
        "actions": actions,
        "edges": edges,
        "actionIdRecords": id_actions,
        "btableCommandTargets": btable_targets(sorted(btable_dir.glob("*.user.3")), guid_to_class),
        "unresolvedGuideIds": unresolved,
        "mechanism": "ActionGuideData _Action -> _TransitionAction edges, enriched by ActionParam _ActionGuideID and ActionID GUID records.",
    }


def main():
    weapons = {weapon_id: build_weapon(code, weapon_id) for code, weapon_id in WEAPONS.items()}
    data = {
        "version": 1,
        "game": "Monster Hunter Wilds",
        "evidencePolicy": "Only ActionGuide transitions are graph edges. BTable command targets are retained separately because REasy does not expose their owning table row.",
        "weapons": weapons,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    edge_count = sum(len(graph["edges"]) for graph in weapons.values())
    action_count = sum(len(graph["actions"]) for graph in weapons.values())
    print(f"[wilds-combos] indexed {action_count} actions and {edge_count} verified guide transitions -> {OUTPUT}")


if __name__ == "__main__":
    main()
