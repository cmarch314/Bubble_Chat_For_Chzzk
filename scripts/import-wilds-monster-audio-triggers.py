#!/usr/bin/env python3
"""Normalize installed Wilds monster sound trigger -> Wwise event references."""

import json
import re
import struct
import sys
from collections import Counter
from collections.abc import Mapping
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parents[1]
REASY = ROOT / "game_extracts" / "tools" / "REasy-master" / "REasy-master"
SOURCE_ROOT = ROOT / "game_extracts" / "wilds" / "natives" / "STM" / "Sound" / "UserData" / "11_TriggerInfoList" / "Enemy"
IDENTIFIERS = ROOT / "game_extracts" / "tools" / "wilds-monster-identifiers.json"
OUTPUT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "game_extracts" / "tools" / "wilds-monster-audio-triggers.json"
sys.path.insert(0, str(REASY))

from utils.type_registry import TypeRegistry  # noqa: E402
from file_handlers.rsz.rsz_file import RszFile  # noqa: E402

REGISTRY = TypeRegistry(str(REASY / "resources" / "data" / "dumps" / "rszmhwilds.json"))
MONSTER = re.compile(r"(Em\d{4}_[0-9A-Fa-f]{2})(?:_\d+)?_SoundTriggerInfoListData", re.IGNORECASE)
ROAR_MOTION = re.compile(r"roar|howl", re.IGNORECASE)


def scalar(value):
    if isinstance(value, Mapping):
        return {key: scalar(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [scalar(item) for item in value]
    if hasattr(value, "values") and not callable(value.values):
        return [scalar(item) for item in value.values]
    if hasattr(value, "string"):
        return value.string.rstrip("\0")
    if hasattr(value, "value"):
        return scalar(value.value)
    return value


def parse(file):
    parsed = RszFile()
    parsed.filepath = str(file)
    parsed.type_registry = REGISTRY
    parsed.read(file.read_bytes())
    return parsed


def utf16(buffer, offset):
    end = offset
    while end + 1 < len(buffer) and end - offset <= 1024 and buffer[end:end + 2] != b"\0\0":
        end += 2
    return buffer[offset:end].decode("utf-16le", errors="replace")


def motion_trigger_contexts(file, trigger_ids):
    """Join aligned trigger hashes to the exact embedded motion that owns them."""
    buffer = file.read_bytes()
    if len(buffer) < 0x58 or buffer[4:8] != b"mlst" or struct.unpack_from("<I", buffer, 0)[0] != 992:
        return {}
    pointers_offset = struct.unpack_from("<Q", buffer, 0x10)[0]
    count = struct.unpack_from("<I", buffer, 0x30)[0]
    offsets = []
    for index in range(count):
        offset = struct.unpack_from("<Q", buffer, pointers_offset + index * 8)[0]
        if offset and offset + 0x60 < len(buffer) and buffer[offset + 4:offset + 8] == b"mot ":
            name_offset = offset + struct.unpack_from("<Q", buffer, offset + 0x58)[0]
            offsets.append((offset, utf16(buffer, name_offset)))
    offsets = sorted(set(offsets))
    contexts = {}
    for position, (start, name) in enumerate(offsets):
        end = offsets[position + 1][0] if position + 1 < len(offsets) else len(buffer)
        for cursor in range(start - (start % 4), end - 3, 4):
            trigger_id = struct.unpack_from("<I", buffer, cursor)[0]
            if trigger_id in trigger_ids:
                contexts.setdefault(trigger_id, set()).add(name)
    return contexts


def type_name(parsed, index):
    info = REGISTRY.get_type_info(parsed.instance_infos[index].type_id)
    return info.get("name", "") if isinstance(info, dict) else str(info)


def main():
    if not REASY.exists() or not SOURCE_ROOT.exists():
        raise FileNotFoundError("REasy or extracted Wilds sound references are missing")
    names = {}
    if IDENTIFIERS.exists():
        data = json.loads(IDENTIFIERS.read_text(encoding="utf-8"))
        names = {row["monsterCode"].lower(): row.get("nameEn") for row in data.get("identifiers", []) if row.get("nameEn")}
    records = []
    file_count = 0
    for file in sorted(SOURCE_ROOT.rglob("*SoundTriggerInfoListData.user.3")):
        match = MONSTER.search(file.name)
        if not match:
            continue
        monster_code = match.group(1)
        parsed = parse(file)
        file_count += 1
        bank = None
        pending = []
        for index in range(len(parsed.instance_infos)):
            values = parsed.parsed_elements.get(index)
            if not isinstance(values, Mapping):
                continue
            kind = type_name(parsed, index)
            if kind == "soundlib.SoundTriggerInfo":
                trigger_id = scalar(values.get("_TriggerId"))
                event_id = scalar(values.get("_EventId"))
                if trigger_id in (None, 0xFFFFFFFF) or event_id in (None, 0xFFFFFFFF):
                    continue
                pending.append({
                    "monsterCode": monster_code,
                    "monsterName": names.get(monster_code.lower()),
                    "triggerId": int(trigger_id),
                    "eventId": int(event_id),
                    "offsetJointHash": int(scalar(values.get("_OffsetJointHash")) or 0),
                    "sourcePath": file.relative_to(ROOT).as_posix(),
                })
            elif kind == "soundlib.SoundTriggerInfoListData":
                bank = scalar(values.get("_Bank"))
        for row in pending:
            row["bankReference"] = bank
            records.append(row)
    frequency = Counter(row["triggerId"] for row in records)
    by_monster = {}
    for row in records:
        by_monster.setdefault(row["monsterCode"].lower(), set()).add(row["triggerId"])
    motion_files = 0
    motion_links = 0
    motion_root = ROOT / "game_extracts" / "wilds" / "natives" / "STM" / "Motion" / "Enemy"
    for monster_code, trigger_ids in by_monster.items():
        number, variant = monster_code.split("_")
        folder = motion_root / number.lower() / variant.lower()
        if not folder.exists():
            continue
        contexts = {}
        for file in sorted(folder.rglob("*.motlist.992")):
            motion_files += 1
            for trigger_id, names_for_id in motion_trigger_contexts(file, trigger_ids).items():
                contexts.setdefault(trigger_id, set()).update(names_for_id)
        for row in records:
            if row["monsterCode"].lower() != monster_code:
                continue
            names_for_id = sorted(contexts.get(row["triggerId"], ()))
            if not names_for_id:
                continue
            row["motionNames"] = names_for_id
            row["motionEvidence"] = "installed-motlist-trigger-track"
            motion_links += 1
            if any(ROAR_MOTION.search(name) for name in names_for_id):
                row["actionFamily"] = "monster_roar"
                row["semanticEvidence"] = "installed-roar/howl-motion+trigger+event"
    output = {
        "version": 1,
        "game": "Monster Hunter Wilds",
        "evidencePolicy": "Installed SoundTriggerInfoListData proves trigger-to-event identity; action meaning remains unknown until an action/motion reference or verified audition labels the trigger.",
        "sourceFiles": file_count,
        "motionFiles": motion_files,
        "motionLinkedRecords": motion_links,
        "records": records,
        "sharedTriggerIds": [{"triggerId": key, "recordCount": count} for key, count in frequency.most_common() if count > 1],
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"[wilds-audio] indexed {len(records)} trigger/event links from {file_count} monster files -> {OUTPUT}")


if __name__ == "__main__":
    main()
