#!/usr/bin/env python3
"""Join installed Wilds EmID codes to public monster names through the fixed game ID."""

import json
import re
import sys
from collections.abc import Mapping
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parents[1]
REASY = ROOT / "game_extracts" / "tools" / "REasy-master" / "REasy-master"
SOURCE = ROOT / "game_extracts" / "wilds" / "natives" / "STM" / "GameDesign" / "Enemy" / "CommonData" / "EnumMaker" / "EmID.user.3"
GAME_REFERENCE = ROOT / "data" / "hunt" / "wilds-game-reference.json"
MERGED_MONSTERS = ROOT / "game_extracts" / "tools" / "mhdb-wilds-data" / "output" / "merged" / "LargeMonsters.json"
OUTPUT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "game_extracts" / "tools" / "wilds-monster-identifiers.json"
sys.path.insert(0, str(REASY))

from utils.type_registry import TypeRegistry  # noqa: E402
from file_handlers.rsz.rsz_file import RszFile  # noqa: E402

REGISTRY = TypeRegistry(str(REASY / "resources" / "data" / "dumps" / "rszmhwilds.json"))


def scalar(value):
    if isinstance(value, str):
        return value.rstrip("\0")
    if hasattr(value, "string"):
        return value.string.rstrip("\0")
    if hasattr(value, "value"):
        return scalar(value.value)
    return value


def main():
    if not all(path.exists() for path in (REASY, SOURCE, GAME_REFERENCE)):
        raise FileNotFoundError("REasy, EmID, or Wilds game reference is missing")
    public = json.loads(GAME_REFERENCE.read_text(encoding="utf-8"))
    public_by_game_id = {row["gameId"]: row for row in public.get("monsters", [])}
    localized_by_game_id = {}
    if MERGED_MONSTERS.exists():
        localized_by_game_id = {row["game_id"]: row.get("names", {}) for row in json.loads(MERGED_MONSTERS.read_text(encoding="utf-8"))}
    parsed = RszFile()
    parsed.filepath = str(SOURCE)
    parsed.type_registry = REGISTRY
    parsed.read(SOURCE.read_bytes())
    rows = []
    for index in range(1, len(parsed.instance_infos)):
        values = parsed.parsed_elements.get(index)
        if not isinstance(values, Mapping):
            continue
        enum_name = scalar(values.get("_EnumName"))
        match = re.match(r"EM(\d{4})_(\d{2})_(\d+)$", enum_name or "", re.IGNORECASE)
        if not match:
            continue
        game_id = scalar(values.get("_FixedID"))
        public_row = public_by_game_id.get(game_id)
        names = localized_by_game_id.get(game_id, {})
        rows.append({
            "enumName": enum_name,
            "monsterCode": f"Em{match.group(1)}_{match.group(2)}",
            "variantIndex": int(match.group(3)),
            "enumValue": scalar(values.get("_EnumValue")),
            "gameId": game_id,
            "publicMonsterId": public_row.get("id") if public_row else None,
            "nameEn": public_row.get("name") if public_row else names.get("en"),
            "nameKo": names.get("ko"),
            "evidence": "installed-game-emid-fixed-id+mhdb-game-id" if public_row else "installed-game-emid",
        })
    data = {
        "version": 1,
        "game": "Monster Hunter Wilds",
        "sourcePath": SOURCE.relative_to(ROOT).as_posix(),
        "joinPolicy": "Names join only when installed EmID _FixedID exactly equals the public game_id.",
        "identifiers": rows,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    matched = sum(1 for row in rows if row["publicMonsterId"] is not None)
    print(f"[wilds-monsters] indexed {len(rows)} EmID records; {matched} exact public-name joins -> {OUTPUT}")


if __name__ == "__main__":
    main()
