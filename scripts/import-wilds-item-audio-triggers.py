#!/usr/bin/env python3
"""Normalize installed Wilds hunter-item sound trigger -> Wwise event references."""

import json
import struct
import sys
from collections.abc import Mapping
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parents[1]
REASY = ROOT / "game_extracts" / "tools" / "REasy-master" / "REasy-master"
SOURCE = (
    ROOT
    / "game_extracts"
    / "wilds"
    / "natives"
    / "STM"
    / "Sound"
    / "UserData"
    / "11_TriggerInfoList"
    / "Hunter"
    / "HunterItem_TriggerInfoListData.user.3"
)
OUTPUT = ROOT / "game_extracts" / "tools" / "wilds-item-audio-triggers.json"
ITEM_MOTION_LIST = (
    ROOT
    / "game_extracts"
    / "wilds"
    / "natives"
    / "STM"
    / "Motion"
    / "Player"
    / "Common"
    / "plc_ItemUse"
    / "plc_ItemUse.motlist.992"
)
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
    if hasattr(value, "string"):
        return value.string.rstrip("\0")
    if hasattr(value, "value"):
        return scalar(value.value)
    return value


def type_name(parsed, index):
    info = REGISTRY.get_type_info(parsed.instance_infos[index].type_id)
    return info.get("name", "") if isinstance(info, dict) else str(info)


def utf16(buffer, offset):
    end = offset
    while end + 1 < len(buffer) and end - offset <= 1024 and buffer[end : end + 2] != b"\0\0":
        end += 2
    return buffer[offset:end].decode("utf-16le", errors="replace")


def motion_trigger_contexts(file, trigger_ids):
    buffer = file.read_bytes()
    if len(buffer) < 0x58 or buffer[4:8] != b"mlst" or struct.unpack_from("<I", buffer, 0)[0] != 992:
        return {}
    pointers_offset = struct.unpack_from("<Q", buffer, 0x10)[0]
    count = struct.unpack_from("<I", buffer, 0x30)[0]
    offsets = []
    for index in range(count):
        offset = struct.unpack_from("<Q", buffer, pointers_offset + index * 8)[0]
        if offset and offset + 0x60 < len(buffer) and buffer[offset + 4 : offset + 8] == b"mot ":
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


def main():
    if not REASY.exists() or not SOURCE.exists():
        raise FileNotFoundError("REasy or extracted Wilds hunter-item trigger data is missing")
    parsed = RszFile()
    parsed.filepath = str(SOURCE)
    parsed.type_registry = REGISTRY
    parsed.read(SOURCE.read_bytes())

    bank = None
    records = []
    structures = []
    for index in range(len(parsed.instance_infos)):
        values = parsed.parsed_elements.get(index)
        if not isinstance(values, Mapping):
            continue
        kind = type_name(parsed, index)
        normalized = scalar(values)
        if kind == "soundlib.SoundTriggerInfo":
            trigger_id = normalized.get("_TriggerId")
            event_id = normalized.get("_EventId")
            if trigger_id not in (None, 0xFFFFFFFF) and event_id not in (None, 0xFFFFFFFF):
                records.append({"triggerId": int(trigger_id), "eventId": int(event_id)})
        elif kind == "soundlib.SoundTriggerInfoListData":
            bank = normalized.get("_Bank")
        else:
            structures.append({"type": kind, "values": normalized})

    trigger_ids = {row["triggerId"] for row in records}
    contexts = motion_trigger_contexts(ITEM_MOTION_LIST, trigger_ids)
    player_motion_root = ITEM_MOTION_LIST.parents[2]
    for motion_file in player_motion_root.rglob("*.motlist.992"):
        if motion_file == ITEM_MOTION_LIST:
            continue
        for trigger_id, names in motion_trigger_contexts(motion_file, trigger_ids).items():
            contexts.setdefault(trigger_id, set()).update(names)
    for row in records:
        names = sorted(contexts.get(row["triggerId"], ()))
        if names:
            row["motionNames"] = names
            row["motionEvidence"] = "installed-item-use-motlist-trigger-track"

    output = {
        "version": 1,
        "game": "Monster Hunter Wilds",
        "bankReference": bank,
        "sourcePath": SOURCE.relative_to(ROOT).as_posix(),
        "evidencePolicy": (
            "Installed SoundTriggerInfoListData proves trigger-to-event identity; "
            "item meaning remains unknown until an item/action/motion reference labels the trigger."
        ),
        "records": records,
        "supportingStructures": structures,
    }
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[wilds-items] indexed {len(records)} hunter-item trigger/event links -> {OUTPUT}")


if __name__ == "__main__":
    main()
