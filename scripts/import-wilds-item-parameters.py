#!/usr/bin/env python3
"""Normalize Wilds hunter item parameters without guessing their semantics."""

import json
import sys
from collections.abc import Mapping
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parents[1]
REASY = ROOT / "game_extracts" / "tools" / "REasy-master" / "REasy-master"
SOURCE = ROOT / "game_extracts" / "wilds" / "natives" / "STM" / "GameDesign" / "Player" / "ActionData" / "Common" / "GlobalParam" / "PlayerItemParam.user.3"
OUTPUT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "game_extracts" / "tools" / "wilds-item-parameters.json"
sys.path.insert(0, str(REASY))

from utils.type_registry import TypeRegistry  # noqa: E402
from file_handlers.rsz.rsz_file import RszFile  # noqa: E402

REGISTRY = TypeRegistry(str(REASY / "resources" / "data" / "dumps" / "rszmhwilds.json"))


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
    if hasattr(value, "x") and hasattr(value, "y"):
        result = {"x": value.x, "y": value.y}
        if hasattr(value, "z"):
            result["z"] = value.z
        if hasattr(value, "w"):
            result["w"] = value.w
        return result
    if isinstance(value, str):
        return value.rstrip("\0")
    return repr(value) if not isinstance(value, (bool, int, float, type(None))) else value


def main():
    if not SOURCE.exists() or not REASY.exists():
        raise FileNotFoundError("REasy or PlayerItemParam.user.3 is missing")
    parsed = RszFile()
    parsed.filepath = str(SOURCE)
    parsed.type_registry = REGISTRY
    parsed.read(SOURCE.read_bytes())
    groups = []
    for index in range(1, len(parsed.instance_infos)):
        values = parsed.parsed_elements.get(index)
        if not isinstance(values, Mapping) or not values:
            continue
        info = REGISTRY.get_type_info(parsed.instance_infos[index].type_id)
        name = info.get("name", "") if isinstance(info, dict) else str(info)
        groups.append({
            "groupId": f"{name}#{index}",
            "typeName": name,
            "instanceIndex": index,
            "parameters": {key: scalar(value) for key, value in values.items()},
        })
    data = {
        "version": 1,
        "game": "Monster Hunter Wilds",
        "sourcePath": SOURCE.relative_to(ROOT).as_posix(),
        "evidence": "installed-game-player-item-param",
        "mappingPolicy": "Field names and values are retained verbatim. Integer references are not re-labelled as item IDs without direct evidence.",
        "groups": groups,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    field_count = sum(len(group["parameters"]) for group in groups)
    print(f"[wilds-items] indexed {field_count} item parameters in {len(groups)} groups -> {OUTPUT}")


if __name__ == "__main__":
    main()
