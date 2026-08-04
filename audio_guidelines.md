# 🎵 BubbleChat Audio Guidelines

This document defines the guidelines to follow when configuring sound effects (SFX) and voices for the BubbleChat overlay. Because a broadcast overlay exposes sound to an unspecified, wide audience, development and maintenance must always follow the principles below.

---

## 1. Keep tone and wholesomeness (CRITICAL)
- **Exclude provocative/suggestive sounds**: For character actions such as being hit (Hurt), combos (Combo), or respawn (Respawn), never use, as the default effect, **male or female moans or provocative sounds that feel excessively breathy or suggestive**.
- **Replacing effort/hit sounds**:
  - Files judged inappropriate or provocative (e.g. `ast5.mp3`, `아스아.mp3`, `아스아2.mp3`) and breathy sounds resembling a female moan such as **`Huk.mp3` (`헉!`)** are permanently excluded from default hit and combat effects.
  - Map hit keys and damage reactions only to wholesome, safe male/female effort sounds and moan-avoiding gasp sounds such as **`Hup.mp3` (`흡!`)**, or to impact-sound families.
- **Prefer impact SFX**: Build the default sounds around weapon-native impact sounds (blade whooshes, blunt strikes, gunfire) and metallic effects (`팅!1`, `팅!2`, `팅!3`) rather than human voices, to strengthen immersion.

## 2. Volume balance and leveling
- **Volume ceiling**: To protect hearing, set each effect's volume to `0.7` or lower at most. (Special sounds needed for visual effects, such as the potion sound, may be balanced accordingly, but must stay non-provocative.)
- **Use the audio normalizer**: Enable `NORMALIZER_CONFIG` in `config.js` to prevent clipping (distortion) that can occur when multi-hits or many overlapping effects stack.

## 3. Sound-key configuration rules
- When adding a new sound, register it in `HIVE_SOUND_CONFIG` in `config.js` and give the key a clear name.
- In combat-effect code such as `HuntEffect.js`, call a safe sound key registered in `this.config.getSoundConfig()` rather than hardcoding audio file names directly.
