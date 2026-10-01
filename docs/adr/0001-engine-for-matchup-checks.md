# Full damage engine for per-member matchup checks

Offence and defence checks in the per-member EV view use the full NCP damage engine (`calculateDamage`), not the cheap type-chart used by Coverage/Weaknesses, because training needs real ranges plus percent. We accept ~100+ async calcs per member and mitigate with auto-recompute plus lazy row rendering.
