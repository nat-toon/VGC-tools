# Opponent copies are session-only and never touch ncp-sets.json

The matchup panel edits an in-memory copy of the NCP set (SP spread, nature, level, item, ability) defaulting to the NCP values, discarded when the panel closes. Opponent moves stay as the NCP set lists them. We chose this so training experiments can't corrupt the canonical NCP list and need no persistence UI.
