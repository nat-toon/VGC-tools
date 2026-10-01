# VGC Tools

Team builder for assembling VGC teams and checking them against known competitive sets for training.

## Language

**NCP set**: A named competitive build for one species from ncp-sets.json, with nature, ability, item, SP spread, and moves.
_Avoid_: NCP list entry, build, opponent spread

**Offence check**: For one team member, the member's highest max-damage move vs each NCP set, shown as a card with damage range plus percent of the target's HP and the damage-relevant stat line.
_Avoid_: coverage, my damage

**Defence check**: For one team member, each NCP set's highest max-damage move vs that member, shown as a card with damage range plus percent of the member's HP and the damage-relevant stat line.
_Avoid_: threats, incoming damage

**Speed check**: For one team member, its Speed vs each NCP set's Speed with stages and Tailwind applied, ordered by biggest deficit first.
_Avoid_: speed tiers, turn order

**Opponent copy**: An editable copy of an NCP set's SP spread, nature, level, item, and ability used as the calc target, defaulting to the NCP set values. Edits never change ncp-sets.json.
_Avoid_: opponent spread, edited spread

**Team member**: One of the six slots in a team, with species, item, ability, moves, SP spread, nature, and level.
_Avoid_: pokemon, mon, slot
