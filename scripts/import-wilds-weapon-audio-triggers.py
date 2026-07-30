#!/usr/bin/env python3
"""Index installed Wilds weapon motion trigger -> Wwise event evidence."""

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
WILDS = ROOT / "game_extracts" / "wilds" / "natives" / "STM"
TRIGGER_ROOT = WILDS / "Sound" / "UserData" / "11_TriggerInfoList"
MOTION_ROOT = WILDS / "Motion" / "Player" / "Weapon"
OUTPUT = (
    Path(sys.argv[1]).resolve()
    if len(sys.argv) > 1
    else ROOT / "game_extracts" / "tools" / "wilds-weapon-audio-triggers.json"
)
WEAPONS = json.loads(
    (ROOT / "data" / "hunt" / "wilds-weapon-codes.json").read_text(encoding="utf-8")
)["codes"]
sys.path.insert(0, str(REASY))

from utils.type_registry import TypeRegistry  # noqa: E402
from file_handlers.rsz.rsz_file import RszFile  # noqa: E402

REGISTRY = TypeRegistry(str(REASY / "resources" / "data" / "dumps" / "rszmhwilds.json"))
WEAPON_FILE = re.compile(r"(?:Hunter)?(Wp\d{2})", re.IGNORECASE)


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
    return value


def parse(file):
    parsed = RszFile()
    parsed.filepath = str(file)
    parsed.type_registry = REGISTRY
    parsed.read(file.read_bytes())
    return parsed


def type_name(parsed, index):
    info = REGISTRY.get_type_info(parsed.instance_infos[index].type_id)
    return info.get("name", "") if isinstance(info, dict) else str(info)


def source(file):
    return file.relative_to(ROOT).as_posix()


def trigger_role(file):
    name = file.name.lower()
    if "/Hit/" in file.as_posix():
        return "hit"
    if "uniqueeffect" in name:
        return "unique-effect"
    if "insect_effect" in name:
        return "insect-effect"
    if "insect" in name:
        return "insect"
    if "effect" in name:
        return "effect"
    if "sub" in name:
        return "sub"
    return "motion"


def utf16(buffer, offset):
    end = offset
    while end + 1 < len(buffer) and end - offset <= 1024 and buffer[end : end + 2] != b"\0\0":
        end += 2
    return buffer[offset:end].decode("utf-16le", errors="replace")


def motion_trigger_contexts(file, trigger_ids):
    """Return exact owning embedded motion for each aligned trigger ID."""
    buffer = file.read_bytes()
    if len(buffer) < 0x58 or buffer[4:8] != b"mlst" or struct.unpack_from("<I", buffer, 0)[0] != 992:
        return {}
    pointers_offset = struct.unpack_from("<Q", buffer, 0x10)[0]
    motion_ids_offset = struct.unpack_from("<Q", buffer, 0x18)[0]
    count = struct.unpack_from("<I", buffer, 0x30)[0]
    if count <= 0 or count > 20000:
        return {}
    motions = []
    for index in range(count):
        pointer = pointers_offset + index * 8
        motion_id_pointer = motion_ids_offset + index * 72 + 8
        if pointer + 8 > len(buffer) or motion_id_pointer + 2 > len(buffer):
            continue
        offset = struct.unpack_from("<Q", buffer, pointer)[0]
        if not offset or offset + 0x60 >= len(buffer) or buffer[offset + 4 : offset + 8] != b"mot ":
            continue
        name_offset = offset + struct.unpack_from("<Q", buffer, offset + 0x58)[0]
        motions.append(
            {
                "start": offset,
                "index": index,
                "motionId": struct.unpack_from("<H", buffer, motion_id_pointer)[0],
                "motionName": utf16(buffer, name_offset),
            }
        )
    motions.sort(key=lambda item: item["start"])
    contexts = {}
    for position, motion in enumerate(motions):
        end = motions[position + 1]["start"] if position + 1 < len(motions) else len(buffer)
        for cursor in range(motion["start"] - (motion["start"] % 4), end - 3, 4):
            trigger_id = struct.unpack_from("<I", buffer, cursor)[0]
            if trigger_id not in trigger_ids:
                continue
            context = {
                "motionId": motion["motionId"],
                "motionIndex": motion["index"],
                "motionName": motion["motionName"],
                "motionList": source(file),
            }
            contexts.setdefault(trigger_id, {})[
                (context["motionList"], context["motionId"], context["motionName"])
            ] = context
    return {key: list(values.values()) for key, values in contexts.items()}


def parse_trigger_file(file, code):
    parsed = parse(file)
    bank = None
    records = []
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
            records.append(
                {
                    "weaponCode": code,
                    "weaponId": WEAPONS[code],
                    "role": trigger_role(file),
                    "triggerId": int(trigger_id),
                    "eventId": int(event_id),
                    "offsetJointHash": int(scalar(values.get("_OffsetJointHash")) or 0),
                    "sourcePath": source(file),
                }
            )
        elif kind == "soundlib.SoundTriggerInfoListData":
            bank = scalar(values.get("_Bank"))
    for row in records:
        row["bankReference"] = bank
    return records


def main():
    if not REASY.exists() or not TRIGGER_ROOT.exists() or not MOTION_ROOT.exists():
        raise FileNotFoundError("REasy or extracted Wilds weapon sound/motion references are missing")

    records = []
    trigger_files = []
    candidates = list((TRIGGER_ROOT / "Weapon").rglob("*.user.3"))
    candidates.extend((TRIGGER_ROOT / "Hit").glob("Wp*_Hit_TriggerInfoListData.user.3"))
    for file in sorted(set(candidates)):
        match = WEAPON_FILE.search(file.name)
        if not match:
            continue
        code = f"Wp{match.group(1)[2:]}"
        if code not in WEAPONS:
            continue
        rows = parse_trigger_file(file, code)
        if rows:
            records.extend(rows)
            trigger_files.append(source(file))

    motion_files = 0
    motion_links = 0
    for code, weapon_id in WEAPONS.items():
        weapon_rows = [row for row in records if row["weaponId"] == weapon_id]
        trigger_ids = {row["triggerId"] for row in weapon_rows}
        contexts = {}
        for file in sorted((MOTION_ROOT / code).rglob("*.motlist.992")):
            motion_files += 1
            for trigger_id, values in motion_trigger_contexts(file, trigger_ids).items():
                contexts.setdefault(trigger_id, []).extend(values)
        for row in weapon_rows:
            values = contexts.get(row["triggerId"], [])
            unique = {
                (item["motionList"], item["motionId"], item["motionName"]): item for item in values
            }
            if not unique:
                continue
            row["motionContexts"] = sorted(
                unique.values(), key=lambda item: (item["motionList"], item["motionId"], item["motionName"])
            )
            row["motionEvidence"] = "installed-motlist-trigger-track"
            motion_links += 1

    per_weapon = Counter(row["weaponId"] for row in records)
    linked_per_weapon = Counter(row["weaponId"] for row in records if row.get("motionContexts"))
    output = {
        "version": 1,
        "game": "Monster Hunter Wilds",
        "evidencePolicy": (
            "SoundTriggerInfoListData proves trigger-to-event identity and an aligned trigger inside an "
            "embedded mot proves motion ownership. Runtime action meaning remains probable until an "
            "installed action-to-motion reference labels that motion."
        ),
        "sourceFiles": len(trigger_files),
        "motionFiles": motion_files,
        "motionLinkedRecords": motion_links,
        "coverage": {
            weapon_id: {
                "records": per_weapon[weapon_id],
                "motionLinked": linked_per_weapon[weapon_id],
            }
            for weapon_id in WEAPONS.values()
        },
        "sourcePaths": trigger_files,
        "records": records,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    print(
        f"[wilds-weapon-audio] indexed {len(records)} trigger/event links; "
        f"{motion_links} own installed motions -> {OUTPUT}"
    )
    missing = [weapon_id for weapon_id in WEAPONS.values() if not per_weapon[weapon_id]]
    if missing:
        raise RuntimeError(f"Weapon trigger coverage is missing: {', '.join(missing)}")


if __name__ == "__main__":
    main()
