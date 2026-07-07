
// Mock jQuery to prevent crashes outside a browser
if (typeof window === 'undefined') {
  globalThis.window = { location: { hostname: '' } };
  globalThis.document = { querySelectorAll: () => [], querySelector: () => null, getElementById: () => null };
  globalThis.$ = function() { return { text: function(){}, prop: function(){return false}, is: function(){return false}, html: function(){}, val: function(){}, attr: function(){} }; };
  globalThis.$.fn = {};
  globalThis.$.extend = function(){};
}

// NCP calculator factory — new Function() runs in non-strict mode
const __ncpCalc = new Function("\$g", `
var gen = \$g.gen;
var AT = 0, DF = 1, SA = 2, SD = 3, SP = 4;
var STATS = [AT, DF, SA, SD, SP];
var lastHighestStat = [-1, -1];
var manualProtoQuark = false;
var resultDisplayMode = \$g.resultDisplayMode;
var typeChart = \$g.typeChart;
var NATURES = \$g.natures;
var moves = \$g.moves;


function getItemBoostType(item) {
    var m = {
        'Flame Plate':'Fire','Charcoal':'Fire',
        'Splash Plate':'Water','Mystic Water':'Water','Sea Incense':'Water',
        'Zap Plate':'Electric','Magnet':'Electric',
        'Meadow Plate':'Grass','Miracle Seed':'Grass','Rose Incense':'Grass',
        'Icicle Plate':'Ice','Never-Melt Ice':'Ice',
        'Fist Plate':'Fighting','Black Belt':'Fighting',
        'Toxic Plate':'Poison','Poison Barb':'Poison',
        'Earth Plate':'Ground','Soft Sand':'Ground',
        'Sky Plate':'Flying','Sharp Beak':'Flying',
        'Mind Plate':'Psychic','TwistedSpoon':'Psychic','Odd Incense':'Psychic',
        'Insect Plate':'Bug','SilverPowder':'Bug',
        'Stone Plate':'Rock','Hard Stone':'Rock','Rock Incense':'Rock',
        'Spooky Plate':'Ghost','Spell Tag':'Ghost',
        'Draco Plate':'Dragon','Dragon Fang':'Dragon',
        'Dread Plate':'Dark','Black Glasses':'Dark',
        'Iron Plate':'Steel','Metal Coat':'Steel',
        'Pixie Plate':'Fairy',
        'Silk Scarf':'Normal'
    };
    return m[item] || '';
}
function getItemDualTypeBoost(item) { return ''; }
function getMemoryType(item) {
    var m = {
        'Fire Memory':'Fire','Water Memory':'Water','Electric Memory':'Electric',
        'Grass Memory':'Grass','Ice Memory':'Ice','Fighting Memory':'Fighting',
        'Poison Memory':'Poison','Ground Memory':'Ground','Flying Memory':'Flying',
        'Psychic Memory':'Psychic','Bug Memory':'Bug','Rock Memory':'Rock',
        'Ghost Memory':'Ghost','Dragon Memory':'Dragon','Dark Memory':'Dark',
        'Steel Memory':'Steel','Fairy Memory':'Fairy'
    };
    return m[item] || '';
}
function getNaturalGift(berry) {
    var normal = {type:'Normal',bp:1};
    if (!berry || !berry.includes(' Berry')) return normal;
    var gifts = {
        'Cheri Berry':{type:'Fire',bp:80},'Chesto Berry':{type:'Water',bp:80},'Pecha Berry':{type:'Electric',bp:80},'Rawst Berry':{type:'Grass',bp:80},'Aspear Berry':{type:'Ice',bp:80},'Leppa Berry':{type:'Fighting',bp:80},'Oran Berry':{type:'Poison',bp:80},'Persim Berry':{type:'Ground',bp:80},'Lum Berry':{type:'Flying',bp:80},'Sitrus Berry':{type:'Psychic',bp:80},'Figy Berry':{type:'Bug',bp:80},'Wiki Berry':{type:'Rock',bp:80},'Mago Berry':{type:'Ghost',bp:80},'Aguav Berry':{type:'Dragon',bp:80},'Iapapa Berry':{type:'Dark',bp:80},'Pomeg Berry':{type:'Steel',bp:90},'Kelpsy Berry':{type:'Fighting',bp:90},'Qualot Berry':{type:'Poison',bp:90},'Hondew Berry':{type:'Psychic',bp:90},'Grepa Berry':{type:'Flying',bp:90},'Tamato Berry':{type:'Ghost',bp:90},'Cornn Berry':{type:'Bug',bp:90},'Magost Berry':{type:'Rock',bp:90},'Rabuta Berry':{type:'Ghost',bp:90},'Nomel Berry':{type:'Dragon',bp:90},'Spelon Berry':{type:'Dark',bp:90},'Pamtre Berry':{type:'Steel',bp:90},'Watmel Berry':{type:'Fire',bp:100},'Durin Berry':{type:'Water',bp:100},'Belue Berry':{type:'Electric',bp:100},'Occa Berry':{type:'Fire',bp:60},'Passho Berry':{type:'Water',bp:60},'Wacan Berry':{type:'Electric',bp:60},'Rindo Berry':{type:'Grass',bp:60},'Yache Berry':{type:'Ice',bp:60},'Chople Berry':{type:'Fighting',bp:60},'Kebia Berry':{type:'Poison',bp:60},'Shuca Berry':{type:'Ground',bp:60},'Coba Berry':{type:'Flying',bp:60},'Payapa Berry':{type:'Psychic',bp:60},'Tanga Berry':{type:'Bug',bp:60},'Charti Berry':{type:'Rock',bp:60},'Kasib Berry':{type:'Ghost',bp:60},'Haban Berry':{type:'Dragon',bp:60},'Colbur Berry':{type:'Dark',bp:60},'Babiri Berry':{type:'Steel',bp:60},'Chilan Berry':{type:'Normal',bp:60},'Liechi Berry':{type:'Grass',bp:100},'Ganlon Berry':{type:'Ice',bp:100},'Salac Berry':{type:'Fighting',bp:100},'Petaya Berry':{type:'Psychic',bp:100},'Apicot Berry':{type:'Ground',bp:100},'Lansat Berry':{type:'Flying',bp:100},'Starf Berry':{type:'Psychic',bp:100},'Enigma Berry':{type:'Bug',bp:100},'Micle Berry':{type:'Rock',bp:100},'Custap Berry':{type:'Ghost',bp:100},'Jaboca Berry':{type:'Dragon',bp:100},'Rowap Berry':{type:'Dark',bp:100}
    };
    return gifts[berry] || normal;
}
function getFlingPower(item) {
    var p = {
        'Iron Ball':130,'Choice Specs':10,'Choice Band':10,'Choice Scarf':10,'Light Ball':30,'Eject Button':10,'Red Card':10,'Air Balloon':10,'Electric Seed':10,'Psychic Seed':10,'Misty Seed':10,'Grassy Seed':10,'Absorb Bulb':10,'Cell Battery':10,'Luminous Moss':10,'Snowball':10,
        'Flame Orb':30,'Toxic Orb':30,'Black Sludge':30,'Rock Incense':10,'Rose Incense':10,'Sea Incense':10,'Wave Incense':10,'Odd Incense':10,'Pure Incense':10,'Lax Incense':10,'Full Incense':10,'Luck Incense':10,
        'Adamant Orb':60,'Lustrous Orb':60,'Griseous Orb':60,'Macho Brace':60,'Power Weight':10,'Power Bracer':10,'Power Belt':10,'Power Lens':10,'Power Band':10,'Power Anklet':10,'Damp Rock':60,'Heat Rock':60,'Icy Rock':60,'Smooth Rock':60,'Everstone':30,'Float Stone':30,'Hard Stone':100,'Soft Sand':10,'Razor Claw':30,'Razor Fang':30,'Poison Barb':70,'Dragon Fang':30,'Black Belt':30,'Black Glasses':10,'Iron Plate':10,'Silk Scarf':10,"King's Rock":30,'Metal Coat':10,'Sharp Beak':10,'Silver Powder':10,'Spell Tag':10,'TwistedSpoon':10,'Mystic Water':10,'Never-Melt Ice':30,'Magnet':30,'Miracle Seed':30,'Charcoal':30,
        'Deep Sea Tooth':90,'Shuca Berry':10,'Coba Berry':10,'Payapa Berry':10,'Tanga Berry':10,'Charti Berry':10,'Kasib Berry':10,'Haban Berry':10,'Colbur Berry':10,'Babiri Berry':10,'Chilan Berry':10,'Occa Berry':10,'Passho Berry':10,'Wacan Berry':10,'Rindo Berry':10,'Yache Berry':10,'Chople Berry':10,'Kebia Berry':10,
        'Acorn':10,'Stick':30,'Big Pearl':30,'Pearl':30,'Pearly String':30,'Big Nugget':100,'Nugget':30,'Star Piece':30,'Rare Bone':30,'Balm Mushroom':30,'Big Mushroom':30,'Tiny Mushroom':30,'Shoal Salt':30,'Shoal Shell':30,'Red Shard':30,'Blue Shard':30,'Yellow Shard':30,'Green Shard':30,'Health Feather':10,'Muscle Feather':10,'Resist Feather':10,'Genius Feather':10,'Clever Feather':10,'Swift Feather':10,'Pretty Wing':10,
        "King's Rock":30,'Deep Sea Scale':20,'Soul Dew':30,'Thick Club':90,'Stick':60,'Luck Punch':60,'Metal Powder':10,'Quick Powder':10,'White Herb':10,'Mental Herb':10,'Power Herb':10
    };
    return p[item] || 30;
}
function getBerryResistType(item) {
    var m = {
        'Occa Berry':'Fire','Passho Berry':'Water','Wacan Berry':'Electric','Rindo Berry':'Grass','Yache Berry':'Ice','Chople Berry':'Fighting','Kebia Berry':'Poison','Shuca Berry':'Ground','Coba Berry':'Flying','Payapa Berry':'Psychic','Tanga Berry':'Bug','Charti Berry':'Rock','Kasib Berry':'Ghost','Haban Berry':'Dragon','Colbur Berry':'Dark','Babiri Berry':'Steel','Chilan Berry':'Normal'
    };
    return m[item] || '';
}
function getSignatureZMove(item, species, moveName) { return -1; }
function cantFlingItem(item) {
    return ['Master Ball','Poké Ball','Great Ball','Ultra Ball','Rare Candy'].includes(item);
}
function cantRemoveItem(item) {
    return ['Griseous Orb','Adamant Orb','Lustrous Orb','Blue Orb','Red Orb','Mega Stone','Primal Orb'].includes(item);
}
function getMoveCooldown(pokemon, move) { return 0; }
var setHasTypeFunc = function(...typesToCheck) {
    return typesToCheck.includes(this.type1) || typesToCheck.includes(this.type2);
};


/* Damage calculation for the Generation VIII games: Sword, Shield, Isle of Armor, and Crown Tundra; 
 * and for the Generation VII games: Sun, Moon, Ultra Sun, and Ultra Moon*/

function GET_DAMAGE_HANDLER(attacker, defender, move, field) {
    switch (gen) {
        case 1:
            return CALCULATE_DAMAGE_RBY(attacker, defender, move, field);
        case 2:
            return CALCULATE_DAMAGE_GSC(attacker, defender, move, field);
        case 3:
            return CALCULATE_DAMAGE_ADV(attacker, defender, move, field);
        case 4:
            return CALCULATE_DAMAGE_DPP(attacker, defender, move, field);
        case 5:
        case 6:
            return GET_DAMAGE_XY(attacker, defender, move, field);
        case 7:
        case 8:
        case 9:
        case 10:
            return GET_DAMAGE_SV(attacker, defender, move, field);
        default:
            return -1;
    }
}

function numericSort(a, b) {
    return a - b;
}

function buildDescription(description) {
    var output = "";
    if (description.attackBoost) {
        if (description.attackBoost > 0) {
            output += "+";
        }
        output += description.attackBoost + " ";
    }
    if (description.redItem) {
        output += "Red Item-boosted ";
    }
    if (description.attackerLevel) {
        output = output + 'Lv. ' + description.attackerLevel + ' ';
    }
    if (!description.usesOppAtkStat) {
        output = appendIfSet(output, description.attackEVs);
    }
    output = appendIfSet(output, description.attackerItem);
    output = appendIfSet(output, description.attackerAbility);
    if (description.ruinSwordBeads) {
        output += description.ruinSwordBeads + " of Ruin ";
    }
    if (description.attackerTera) {
        output += "Tera-" + description.attackerTera + " ";
    }
    if (description.isBurned) {
        output += "burned ";
    }
    output += description.attackerName + " ";
    if (description.isHelpingHand) {
        output += "Helping Hand ";
    }
    if (description.isPowerSpot) {
        output += "Power Spot ";
    }
    if (description.isBattery) {
        output += "Battery ";
    }
    if (description.isSteelySpirit) {
        output += "Ally Steely Spirit ";
    }
    if (description.isFlowerGiftAtk) {
        output += "Flower Gift ";
    }
    if (description.meFirst) {
        output += "Me First ";
    }
    if (description.charged) {
        output += "Charged ";
    }
    output += description.moveName + " ";
    if (description.moveBP && description.moveType) {
        output += "(" + description.moveBP + " BP " + description.moveType + ") ";
    } else if (description.moveBP) {
        output += "(" + description.moveBP + " BP) ";
    } else if (description.moveType) {
        output += "(" + description.moveType + ") ";
    }
    if (description.hits) {
        output += "(" + description.hits + " hits) ";
    }
    if (description.courseDriftSE) {
        output += "(Super Effective) ";
    }
    if (description.teraBPBoost) {
        output += "(Tera 60 BP Boost) ";
    }
    if (description.maskBoost) {
        output += "(1.2x Mask Boost) ";
    }
    if (description.stellarBoost) {
        output += "(1st Use) ";
    }
    output += "vs. ";
    if (description.defenseBoost) {
        if (description.defenseBoost > 0) {
            output += "+";
        }
        output += description.defenseBoost + " ";
    }
    if (description.blueItem) {
        output += "Blue Item-boosted ";
    }
    if (description.defenderLevel) {
        output = output + 'Lv. ' + description.defenderLevel + ' ';
    }
    output = appendIfSet(output, description.HPEVs);
    if (description.usesOppAtkStat && description.attackEVs) {
        output += "/ " + description.attackEVs + " ";
    }
    if (description.defenseEVs) {
        output += "/ " + description.defenseEVs + " ";
    }
    if (description.isForesight) {
        output += "revealed ";
    }
    output = appendIfSet(output, description.defenderItem);
    if (description.isFlowerGiftSpD) {
        output += " Flower Gift ";
    }
    output = appendIfSet(output, description.defenderAbility);
    if (description.ruinTabletsVessel) {
        output += description.ruinTabletsVessel + " of Ruin ";
    }
    if (description.isDynamax) output += " Dynamax ";
    if (description.defenderTera) {
        output += "Tera-" + description.defenderTera + " ";
    }
    output += description.defenderName;
    if (description.weather && description.terrain) {
        output += " in " + description.weather + " and " + description.terrain + " Terrain";
    }
    else if (description.weather) {
        output += " in " + description.weather;
    } else if (description.terrain) {
        output += " in " + description.terrain + " Terrain";
    }
    if (description.isAuroraVeil) {
        output += " through Aurora Veil";
    } else if (description.isReflect) {
        output += " through Reflect";
    } else if (description.isLightScreen) {
        output += " through Light Screen";
    }
    if (description.isCritical) {
        output += " on a critical hit";
    }
    if (description.isGravity) {
        output += " under Gravity";
    }
    if (description.isGlaiveMod) {
        output += " after using Glaive Rush";
    }
    if (description.isFriendGuard) {
        output += " with Friend Guard";
    }
    if (description.isQuarteredByProtect) {
        output += " through Protect";
    }
    if (description.isMechanicsTest) {
        output += " with custom modifiers";
    }

    return output;
}

function appendIfSet(str, toAppend) {
    if (toAppend) {
        return str + toAppend + " ";
    }
    return str;
}

function toSmogonStat(stat) {
    return stat === AT ? "Atk"
            : stat === DF ? "Def"
            : stat === SA ? "SpA"
            : stat === SD ? "SpD"
            : stat === SP ? "Spe"
            : "wtf";
}

function chainMods(mods) {
    var M = 0x1000;
    for(var i = 0; i < mods.length; i++) {
        if(mods[i] !== 0x1000) {
            M = Math.round((M * mods[i]) / 0x1000);
        }
    }
    return M;
}

function addLevelDesc(attacker, defender, description) {
    autoLevel = false || gen == 10 ? 50 : 100;
    if (attacker.level !== autoLevel)
        description.attackerLevel = attacker.level;
    if (defender.level !== autoLevel)
        description.defenderLevel = defender.level;
}

function getMoveEffectiveness(move, type1, type2, description, isForesight, isScrappy, isGravity, defItem, isStrongWinds, defIsTera, isTeraShell) {
    var type1Effect = getSingleTypeEffectiveness(move, type1, description, isForesight, isScrappy, isGravity, defItem, isStrongWinds);
    var type2Effect = type2 && type2 != type1 ? getSingleTypeEffectiveness(move, type2, description, isForesight, isScrappy, isGravity, defItem, isStrongWinds) : 1;
    var typeEffectiveness = type1Effect * type2Effect;
    var usesTeraShell = isTeraShell && typeEffectiveness > 0.5;
    var effectiveOverride = overrideTypeEffectiveness(move, [type1, type2].includes("Flying"), defItem, isGravity, defIsTera, usesTeraShell);
    if (effectiveOverride != -1) {
        typeEffectiveness = effectiveOverride;
        if (usesTeraShell) {
            description.attackerAbility = "Tera Shell";
        }
    }
    if (gen == 9.5) {
        typeEffectiveness = additionalTypeEffectModsLegendsZA(move, typeEffectiveness, description);
    }
    return typeEffectiveness;
}

function getSingleTypeEffectiveness(move, type, description, isForesight, isScrappy, isGravity, defItem, isStrongWinds) {
    if ((isForesight || isScrappy) && type === "Ghost" && (["Normal", "Fighting"].includes(move.type))) {
        if (isScrappy)
            description.attackerAbility = isScrappy;
        else
            description.isForesight = true;
        return 1;
    }
    else if ((isGravity || defItem == "Iron Ball") && type === "Flying" && move.type === "Ground") {
        if (isGravity)
            description.isGravity = true;
        else if (defItem == "Iron Ball")
            description.defenderItem = "Iron Ball";
        return 1;
    }
    else if (move.name === "Freeze-Dry" && type === "Water") {
        return 2;
    }
    else if (move.name === "Nihil Light" && type === "Fairy") {
        return 1;
    }
    else {
        var effectiveness = typeChart[move.type][type];
        if (isStrongWinds && type == "Flying" && effectiveness > 1) {
            effectiveness = 1;
        }
        else if (defItem == "Ring Target" && effectiveness == 0) {
            description.defenderItem = "Ring Target";
            effectiveness = 1;
        }
        if (move.name === "Flying Press") {
            effectiveness *= typeChart["Flying"][type];
        }
        return effectiveness;
    }
}
function overrideTypeEffectiveness(move, defIsFlyingType, defItem, isGravity, defIsTera, usesTeraShell) {
    if (usesTeraShell) {
        return 0.5;
    }
    else if (move.type == "Stellar" && defIsTera) {
        return 2;
    }
    else if (defIsFlyingType && move.type === "Ground" && (move.name == "Thousand Arrows" || defItem == "Iron Ball") && !isGravity && gen >= 5) {
        return 1;
    }
    else {
        return -1;
    }
}

function additionalTypeEffectModsLegendsZA(move, typeEffectiveness, description) {
    if (typeEffectiveness < 0) {
        typeEffectiveness = typeEffectiveness * 1.2;
    }
    if (move.isPlusMove) {
        if (typeEffectiveness <= 1) {
            typeEffectiveness = typeEffectiveness * 1.2;
        }
        else {
            typeEffectiveness = typeEffectiveness * 1.3;
        }
        description.moveName += '+';
    }
    return typeEffectiveness;
}

function getModifiedStat(stat, mod) {
    return mod > 0 ? Math.floor(stat * (2 + mod) / 2)
            : mod < 0 ? Math.floor(stat * 2 / (2 - mod))
            : stat;
}

function getHPInfo(description, defender) {
    description.HPEVs = gen < 10 ? defender.HPEVs + " HP " + (defender.HPIVs < 31 ? defender.HPIVs + " IVs" : "") : resultDisplayMode == "SPs" ? defender.HPSPs + " HP " : resultDisplayMode == "EVs" ? (Math.max(0, defender.HPSPs * 8 - 4)) + " HP " : defender.HPraw + " HP ";
}

//Speed Mods
function getFinalSpeed(pokemon, weather, tailwind, swamp, terrain) {

    //1. Speed boosts and drops
    var speed = getModifiedStat(pokemon.rawStats[SP], pokemon.boosts[SP]);
    //2. Other Speed mods
    var otherSpeedMods = 1;
    //a. Scarf
    if (pokemon.item === "Choice Scarf" && !pokemon.isDynamax) {
        otherSpeedMods *= 1.5;
    } //b. Macho Brace, Iron Ball, Power items
    else if (["Macho Brace", "Iron Ball", "Power Anklet", "Power Band", "Power Belt", "Power Bracer", "Power Lens", "Power Weight", "Klutz Iron Ball"].indexOf(pokemon.item) !== -1) {
        otherSpeedMods *= 0.5;
    } //c. Quick Powder
    else if (pokemon.name === "Ditto" && pokemon.item === "Quick Powder") {
        otherSpeedMods *= 2;
    }
    //d. Quick Feet
    if (pokemon.ability === "Quick Feet" && pokemon.status !== "Healthy")
    {
        otherSpeedMods *= 1.5;
    } //e. Slow Start
    else if (pokemon.ability === "Slow Start")
    {
        otherSpeedMods *= 0.5;
    } //f. 2x Abilities
    else if ((((pokemon.ability === "Chlorophyll" && weather.indexOf("Sun") > -1) ||
            (pokemon.ability === "Swift Swim" && weather.indexOf("Rain") > -1)) && pokemon.item !== 'Utility Umbrella') ||
            (pokemon.ability === "Sand Rush" && weather === "Sand") ||
            (pokemon.ability === "Slush Rush" && ["Hail", "Snow"].indexOf(weather) > -1) ||
            (pokemon.ability === "Surge Surfer" && terrain === "Electric") ||
            (pokemon.ability === "Unburden" && pokemon.item === "")) {
        otherSpeedMods *= 2;
    }
    //g. Tailwind
    if (tailwind) otherSpeedMods *= 2;
    //h. Grass/Water Pledge Swamp
    if (swamp) otherSpeedMods *= 0.25;
    //i. Protosynthesis, Quark Drive
    if (pokemon.paradoxAbilityBoost && pokemon.highestStat === 'sp')
        otherSpeedMods *= 1.5;

    speed = pokeRound(speed * otherSpeedMods);

    //3. Paralysis
    if (pokemon.status === "Paralyzed" && pokemon.ability !== "Quick Feet") {
        if (gen >= 7)
            speed = Math.floor(speed / 2);
        else speed = Math.floor(speed / 4);
    }
    //4. 65536 Speed check
    if (speed > 65535) { speed %= 65536; }
    //5. 10000 Speed check
    if (speed > 10000) { speed = 10000; }
    return speed;
}

//Currently used for determining Protosynthesis/Quark Drive boost, may be expanded upon depending on future releases
function setHighestStat(pokemon, pPosition) {
    if (pokemon.highestStat == -1) {
        allStats = [pokemon.stats[AT], pokemon.stats[DF], pokemon.stats[SA], pokemon.stats[SD], pokemon.stats[SP]];
        pokemon.highestStat = allStats.indexOf(Math.max(...allStats));
    }
    lastHighestStat[pPosition] = pokemon.highestStat;
    pokemon.highestStat = pokemon.highestStat == 0 ? 'at'
        : pokemon.highestStat == 1 ? 'df'
            : pokemon.highestStat == 2 ? 'sa'
                : pokemon.highestStat == 3 ? 'sd'
                    : pokemon.highestStat == 4 ? 'sp'
                        : 'oh dear this should not happen';
}

function usesPhysicalAttack(attacker, defender, move) {
    var userStatsMove = move.name == "Photon Geyser" || move.name == "Light That Burns the Sky"
        || (move.name == "Tera Blast" && attacker.isTerastalize) || (move.name == "Tera Starstorm" && attacker.name == "Terapagos-Stellar");
    var smartMove = move.name == "Shell Side Arm";

    return (userStatsMove && attacker.stats[AT] > attacker.stats[SA]) || (smartMove && (attacker.stats[AT] / defender.stats[DF]) > (attacker.stats[SA] / defender.stats[SD]));
}

function checkTrace(source, target) {
    var cannotCopy = ["As One", "Battle Bond", "Comatose", "Commander", "Disguise", "Flower Gift", "Forecast", "Gulp Missile",
        "Ice Face", "Illusion", "Imposter", "Multitype", "Power of Alchemy", 'Protosynthesis', 'Quark Drive', "Receiver", "RKS System", "Schooling",
        "Shields Down", "Stance Change", "Trace", "Wonder Guard", "Zen Mode", "Zero to Hero"];
    if (gen <= 4) {
        if (gen == 3) {
            cannotCopy.splice(cannotCopy.indexOf('Forecast'), 1);
            cannotCopy.splice(cannotCopy.indexOf('Trace'), 1);
        }
        else cannotCopy.splice(cannotCopy.indexOf('Flower Gift'), 1);
    }
    if (source.ability === "Trace" && source.abilityOn && cannotCopy.indexOf(target.ability) === -1 && source.item !== "Ability Shield") {
        source.ability = target.ability;
    }
}

function checkNeutralGas(p1, p2, isNGas) {
    var cannotSupress = ['As One', 'Battle Bond', 'Comatose', 'Disguise', 'Gulp Missile', 'Ice Face', 'Multitype',
        'Power Construct', 'RKS System', 'Schooling', 'Shields Down', 'Stance Change', 'Tera Shift', 'Zen Mode', 'Zero to Hero'];
    if (isNGas) {
        if (cannotSupress.indexOf(p1.ability) == -1 && p1.item !== 'Ability Shield') p1.ability = '';
        if (cannotSupress.indexOf(p2.ability) == -1 && p2.item !== 'Ability Shield') p2.ability = '';
    }
}
function checkAirLock(pokemon, field) {
    if (['Air Lock', 'Cloud Nine'].indexOf(pokemon.ability) !== -1) {
        field.clearWeather();
    }
}
function checkForecast(pokemon, weather) {
    if (pokemon.ability === "Forecast" && pokemon.name === "Castform") {
        if (weather.indexOf("Sun") > -1) {
            pokemon.type1 = "Fire";
        } else if (weather.indexOf("Rain") > -1) {
            pokemon.type1 = "Water";
        } else if (["Hail", "Snow"].indexOf(weather) > -1) {
            pokemon.type1 = "Ice";
        } else {
            pokemon.type1 = "Normal";
        }
        pokemon.type2 = "";
    }
}
function checkMimicry(pokemon, terrain) {
    if (pokemon.ability === "Mimicry" && terrain !== "") {
        pokemon.type1 = terrain === "Electric" ? 'Electric'
            : terrain === "Grassy" ? 'Grass'
                : terrain === "Misty" ? 'Fairy'
                    : 'Psychic';
        pokemon.type2 = '';
    }
}
function checkTerastal(pokemon) {
    if (pokemon.isTerastalize && pokemon.tera_type !== 'Stellar') {
        pokemon.teraSTAB1 = pokemon.type1;
        pokemon.teraSTAB2 = pokemon.type2;
        pokemon.type1 = pokemon.tera_type;
        pokemon.type2 = '';
    }
}

function checkKlutz(pokemon) {
    if (pokemon.ability === "Klutz") {
        if (['Macho Brace', 'Power Anklet', 'Power Band', 'Power Belt', 'Power Bracer', 'Power Lens', 'Power Weight'].indexOf(pokemon.item) === -1) {
            if (gen == 4) {
                if (pokemon.item === 'Iron Ball') {
                    pokemon.item = "Klutz Iron Ball";
                }
                else {
                    pokemon.item = getFlingPower(pokemon.item).toString();
                }
            }
            else {
                pokemon.item = "Klutz";
            }
        }
    }
}

//UNUSED CURRENTLY
function checkWhiteHerb(pokemon) {
    if (pokemon.item === 'White Herb') {
        var boostsLen = pokemon.boosts.length;
        for (i = 0; i < boostsLen; i++) {
            if (pokemon.boosts[i] < 0) {
                pokemon.boosts[i] = 0;
            }
        }
        pokemon.item = '';
    }
}

function checkSeeds(pokemon, terrain) {
    if (pokemon.item === terrain + ' Seed') {
        if (['Electric', 'Grassy'].indexOf(terrain) !== -1)
            pokemon.boosts[DF] = Math.min(6, pokemon.boosts[DF] + 1);
        else
            pokemon.boosts[SD] = Math.min(6, pokemon.boosts[SD] + 1);
        pokemon.item = '';
    }
}

function checkParadoxAbilities(pokemon, terrain, weather) {
    if (['Protosynthesis', 'Quark Drive'].indexOf(pokemon.ability) !== -1) {
        if ((pokemon.ability === 'Protosynthesis' && weather === 'Sun')
            || (pokemon.ability === 'Quark Drive' && terrain === 'Electric')
            || (manualProtoQuark && pokemon.item !== 'Booster Energy'))
            pokemon.paradoxAbilityBoost = true;
        else if (pokemon.item === 'Booster Energy') {
            pokemon.paradoxAbilityBoost = true;
            pokemon.item = '';
        }
    }
}

/**
 * Handles all stat boost changes (Unused currently)
 * @param {any} interactionArray list of all mons involved. If its length is only 1, then it's a self-targetting boost.
 * @param {any} stat the stat affected. Only supports a single stat as is implemented currently, may change in the future.
 * @param {any} numStages number of intended stages to boost/drop the stat. The function will adjust actual number of stages.
 * @returns
 */
function changeStatBoosts(interactionArray, stat, numStages) {
    var isNotSelf = interactionArray.length == 2;
    var source = interactionArray[0], target = isNotSelf ? interactionArray[1] : interactionArray[0];
    if (target.ability == 'Mirror Armor' && isNotSelf && numStages < 0) {
        var mirrorSwitch = source;
        source = target;
        target = mirrorSwitch;
    }
    var statMultiplier = target.ability == 'Simple' ? 2 : target.ability == 'Contrary' ? -1 : 1;
    numStages *= statMultiplier;
    if (numStages < 0) {
        if (isNotSelf && (['Clear Body', 'White Smoke', 'Full Metal Body'].includes(target.ability) || (target.ability == 'Hyper Cutter' && stat == AT) || (target.ability == 'Big Pecks' && stat == DF) || target.item == 'Clear Amulet')) {
            //no effect
        }
        else {
            target.boosts[stat] = Math.max(-6, target.boosts[stat] + numStages);

            if (target.ability == 'Defiant') {
                target.boosts[AT] = Math.min(6, target.boosts[AT] + 2);
            }
            else if (target.ability == 'Competitive') {
                target.boosts[SA] = Math.min(6, target.boosts[SA] + 2);
            }

            if (numStages < 0 && target.item == 'White Herb') {
                target.boosts[stat] = 0;
                target.item == '';
            }
        }
    }
    else if (numStages > 0) {
        target.boosts[stat] = Math.min(6, target.boosts[stat] + numStages);
    }
    else {
        alert("Entered changeStatBoosts with zero stat changes");
    }

    return !isNotSelf ? source : !mirrorSwitch ? [source, target] : [target, source];
}

function checkSupersweetSyrup(source, target) {
    if (source.ability === 'Supersweet Syrup' && source.abilityOn && target.item !== 'Clear Amulet') {
        if (target.ability === "Defiant") {
            target.boosts[AT] = Math.min(6, target.boosts[AT] + 2);
        }
        else if (target.ability === "Competitive") {
            target.boosts[AT] = Math.min(6, target.boosts[SA] + 2);
        }
    }
}

function checkIntimidate(source, target) {
    if (source.ability === "Intimidate" && source.abilityOn) {
        var checkSimple = target.ability === "Simple" ? 1 : 0;

        //Contrary & Guard Dog need to be first; these abilities supersede Clear Amulet but not Mirror Armor for some reason
        if (["Contrary", "Guard Dog"].indexOf(target.ability) !== -1) {
            target.boosts[AT] = Math.min(6, target.boosts[AT] + 1);
        }
        else if (["Clear Body", "White Smoke", "Hyper Cutter", "Full Metal Body"].indexOf(target.ability) !== -1
            || (["Inner Focus", "Oblivious", "Own Tempo", "Scrappy"].indexOf(target.ability) !== -1 && gen >= 8)
            || target.item === "Clear Amulet") {
            // no effect
        }
        else if (target.ability === "Mirror Armor") {
            source.boosts[AT] = Math.max(-6, source.boosts[AT] - 1);
        }
        else {
            target.boosts[AT] = Math.max(-6, target.boosts[AT] - 1 * (1 + checkSimple));
            if (target.ability === "Defiant") {
                target.boosts[AT] = Math.min(6, target.boosts[AT] + 2);
            }
            else if (target.ability === "Competitive") {
                target.boosts[SA] = Math.min(6, target.boosts[SA] + 2);
            }
        }
        if (target.item === "Adrenaline Orb" && target.ability !== "Mirror Armor") {
            target.boosts[SP] = Math.min(6, target.boosts[SP] + 1 * (1 + checkSimple));
            target.item = '';
        }
        if (target.ability === "Rattled" && gen >= 8 && target.item !== "Clear Amulet") {
            target.boosts[SP] = Math.min(6, target.boosts[SP] + 1);
        }
    }
}

function checkSwordShield(pokemon) {
    if (pokemon.ability === "Intrepid Sword" && (gen !== 9 || pokemon.abilityOn)) {
        pokemon.boosts[AT] = Math.min(6, pokemon.boosts[AT] + 1);
    }
    else if (pokemon.ability === "Dauntless Shield" && (gen !== 9 || pokemon.abilityOn)) {
        pokemon.boosts[DF] = Math.min(6, pokemon.boosts[DF] + 1);
    }
}

function checkWindRider(pokemon, tailwind) {
    if (pokemon.ability === "Wind Rider" && tailwind)
        pokemon.boosts[AT] = Math.min(6, pokemon.boosts[AT] + 1);
}

function checkEvo(p1, p2) {
    var maxBoosts = gen == 9.5 ? 1 : 6;
    if (false){
        p1.boosts[AT] = Math.min(maxBoosts, p1.boosts[AT] + 2);
        p1.boosts[DF] = Math.min(maxBoosts, p1.boosts[DF] + 2);
        p1.boosts[SA] = Math.min(maxBoosts, p1.boosts[SA] + 2);
        p1.boosts[SD] = Math.min(maxBoosts, p1.boosts[SD] + 2);
        p1.boosts[SP] = Math.min(maxBoosts, p1.boosts[SP] + 2);
    }
    if (false){
        p2.boosts[AT] = Math.min(maxBoosts, p2.boosts[AT] + 2);
        p2.boosts[DF] = Math.min(maxBoosts, p2.boosts[DF] + 2);
        p2.boosts[SA] = Math.min(maxBoosts, p2.boosts[SA] + 2);
        p2.boosts[SD] = Math.min(maxBoosts, p2.boosts[SD] + 2);
        p2.boosts[SP] = Math.min(maxBoosts, p2.boosts[SP] + 2);
    }

    if(false){
        p1.boosts[SA] = Math.min(6, p1.boosts[SA] + 2);
        p1.boosts[SD] = Math.min(6, p1.boosts[SD] + 2);
        p1.boosts[SP] = Math.min(6, p1.boosts[SP] + 2);
    }
    if(false){
        p2.boosts[SA] = Math.min(6, p2.boosts[SA] + 2);
        p2.boosts[SD] = Math.min(6, p2.boosts[SD] + 2);
        p2.boosts[SP] = Math.min(6, p2.boosts[SP] + 2);
    }
    if (false) {
        p1.boosts[AT] = Math.min(6, p1.boosts[AT] + 2);
        p1.boosts[SA] = Math.min(6, p1.boosts[SA] + 2);
    }
    if (false) {
        p2.boosts[AT] = Math.min(6, p2.boosts[AT] + 2);
        p2.boosts[SA] = Math.min(6, p2.boosts[SA] + 2);
    }

}

function checkDownload(source, target) {
    if (source.ability === "Download") {
        if (target.stats[DF] && target.stats[SD]) {
            if (target.stats[SD] <= target.stats[DF]) {
                source.boosts[SA] = Math.min(6, source.boosts[SA] + 1);
            } else {
                source.boosts[AT] = Math.min(6, source.boosts[AT] + 1);
            }
        }
        else {
            if (getModifiedStat(target.rawStats[SD], target.boosts[SD]) <= getModifiedStat(target.rawStats[DF], target.boosts[DF])) {
                source.boosts[SA] = Math.min(6, source.boosts[SA] + 1);
            } else {
                source.boosts[AT] = Math.min(6, source.boosts[AT] + 1);
            }
        }
    }
}

function checkEmbodyAspect(pokemon) {
    if (pokemon.ability === 'Embody Aspect') {
        if (pokemon.name === 'Ogerpon') {
            pokemon.boosts[SP] = Math.min(6, pokemon.boosts[SP] + 1);
        }
        else if (pokemon.name === 'Ogerpon-Wellspring' && pokemon.item === 'Wellspring Mask') {
            pokemon.boosts[SD] = Math.min(6, pokemon.boosts[SD] + 1);
        }
        else if(pokemon.name === 'Ogerpon-Hearthflame' && pokemon.item === 'Hearthflame Mask') {
            pokemon.boosts[AT] = Math.min(6, pokemon.boosts[AT] + 1);
        }
        else if (pokemon.name === 'Ogerpon-Cornerstone' && pokemon.item === 'Cornerstone Mask') {
            pokemon.boosts[DF] = Math.min(6, pokemon.boosts[DF] + 1);
        }
    }
}

//If we play VGC on a game with Ash Greninja I should just delete this function
function checkBattleBond(pokemon) {
    if (pokemon.ability === 'Battle Bond' && pokemon.abilityOn && gen == 9) {
        pokemon.boosts[AT] = Math.min(6, pokemon.boosts[AT] + 1);
        pokemon.boosts[SA] = Math.min(6, pokemon.boosts[SA] + 1);
        pokemon.boosts[SP] = Math.min(6, pokemon.boosts[SP] + 1);
    }
}

//CONSIDER AN ALL ENCOMPASSING FUNCTION FOR BOOSTS

function checkInfiltrator(attacker, affectedSide) {
    if (attacker.ability === "Infiltrator") {
        affectedSide.isAuroraVeil = false;
        affectedSide.isReflect = false;
        affectedSide.isLightScreen = false;
    }
}

function countBoosts(boosts) {
    var sum = 0;
    for (var i = 0; i < STATS.length; i++) {
        if (boosts[STATS[i]] > 0) {
            sum += boosts[STATS[i]];
        }
    }
    return sum;
}

// GameFreak rounds DOWN on .5
function pokeRound(num) {
    return (num % 1 > 0.5) ? Math.ceil(num) : Math.floor(num);
}

function getWeightMods(p1, p2) {
    if (p1.ability == "Heavy Metal") p1.weight *= 2;
    else if (p1.ability == "Light Metal") p1.weight /= 2;

    if (p2.ability == "Heavy Metal") p2.weight *= 2;
    else if (p2.ability == "Light Metal") p2.weight /= 2;

    if (p1.item == "Float Stone") p1.weight /= 2;
    if (p2.item == "Float Stone") p2.weight /= 2;
}

function checkMoveTypeChange(move, field, attacker) {
    if (move.name == "Weather Ball") {
        move.type = (field.weather.indexOf("Sun") > -1 && attacker.item !== 'Utility Umbrella') || attacker.ability == 'Mega Sol' ? "Fire"
            : field.weather.indexOf("Rain") > -1 && attacker.item !== 'Utility Umbrella' ? "Water"
                : field.weather === "Sand" ? "Rock"
                    : ["Hail", "Snow"].indexOf(field.weather) > -1 ? "Ice"
                        : "Normal";
    }
    else if (move.name == "Terrain Pulse") {
        move.type = field.terrain === "Electric" ? "Electric"
            : field.terrain === "Grassy" ? "Grass"
                : field.terrain === "Misty" ? "Fairy"
                    : field.terrain === "Psychic" ? "Psychic"
                        : "Normal";
    }
    else if (move.name == "Techno Blast") {
        move.type = attacker.item === "Burn Drive" ? "Fire"
            : attacker.item === "Chill Drive" ? "Ice"
                : attacker.item === "Douse Drive" ? "Water"
                    : attacker.item === "Shock Drive" ? "Electric"
                        : "Normal";
    }
    else if (move.name == "Natural Gift" && attacker.item.includes(" Berry")) {
        move.type = getNaturalGift(attacker.item).t;
    }
    else if (move.name === "Multi-Attack" && attacker.item.indexOf("Memory") !== -1) {
        move.type = getMemoryType(attacker.item);
    }
    else if (move.name === "Judgment" && attacker.item.indexOf("Plate") !== -1) {
        move.type = getItemBoostType(attacker.item);
    }
    else if (move.name === "Revelation Dance") {
        move.type = attacker.type1 !== 'Typeless' ? attacker.type1
            : attacker.type2 !== 'Typeless' && attacker.type2 !== "" ? attacker.type2
                : 'Typeless';
    }
    else if (move.isPledge && move.name !== move.combinePledge) {
        var bothPledgeNames = move.name + " " + move.combinePledge;
        move.type = bothPledgeNames.includes("Grass") && bothPledgeNames.includes("Fire") ? 'Fire'
            : bothPledgeNames.includes("Grass") && bothPledgeNames.includes("Water") ? 'Grass'
                : bothPledgeNames.includes("Water") && bothPledgeNames.includes("Fire") ? 'Water'
                    : 'Typeless';   //last case should never happen, just there to help with debugging
    }
    else if (move.name === 'Aura Wheel' && attacker.name === 'Morpeko-Hangry') {
        move.type = 'Dark';
    }
    else if (move.name === "Tera Blast" && attacker.isTerastalize) {
        move.type = attacker.tera_type;
    }
    else if (move.name === "Raging Bull") {
        switch (attacker.name) {
            case "Tauros-Paldea-Combat":
                move.type = "Fighting";
                break;
            case "Tauros-Paldea-Blaze":
                move.type = "Fire";
                break;
            case "Tauros-Paldea-Aqua":
                move.type = "Water";
                break;
            default:
                move.type = "Normal";
        }
    }
    else if (move.name === "Ivy Cudgel") {
        switch (attacker.name) {
            case "Ogerpon-Wellspring":
                move.type = "Water";
                break;
            case "Ogerpon-Hearthflame":
                move.type = "Fire";
                break;
            case "Ogerpon-Cornerstone":
                move.type = "Rock";
                break;
            default:
                move.type = "Grass";
        }
    }
    else if ((move.name == "Struggle" && gen >= 2) || (['Beat Up', 'Future Sight', 'Doom Desire'].indexOf(move.name) != -1 && gen <= 4)) {
        move.type = 'Typeless';
    }
    else if (move.name === 'Tera Starstorm' && attacker.name === 'Terapagos-Stellar') {
        move.type = 'Stellar';
    }
}

function checkConditionalPriority(move, terrain, attacker, attIsGrounded) {
    if ((move.isHealing && attacker.ability == "Triage") || (move.name == "Grassy Glide" && terrain == "Grassy" && attIsGrounded)
        || (move.type == "Flying" && attacker.ability == "Gale Wings" && (gen == 6 || attacker.curHP == attacker.maxHP)))
        move.isPriority = true;
}

function checkConditionalSpread(move, terrain, attacker, attIsGrounded) {
    if ((move.name == "Expanding Force" && terrain == "Psychic" && attIsGrounded) || (move.name == "Tera Starstorm" && attacker.name == "Terapagos-Stellar"))
        move.isSpread = true;
}

function checkContactOverride(move, attacker) {
    if (move.makesContact && (attacker.item === 'Protective Pads' || (attacker.item === 'Punching Glove' && move.isPunch) || attacker.ability === "Long Reach"))
        move.makesContact = false;
    else if (move.name === "Shell Side Arm" && move.category === "Physical")
        move.makesContact = true;
}

function setIsQuarteredByProtect(attacker, defender, field, move, description) {
    let qualifiedQuartered = field.isProtect && (move.isZ || move.isSignatureZ || attacker.isDynamax || attacker.ability === 'Piercing Drill' || (attacker.ability === 'Unseen Fist' && gen >= 10));
    if (qualifiedQuartered && attacker.ability === 'Piercing Drill') description.attackerAbility = attacker.ability;
    return qualifiedQuartered;
}

function ZMoves(move, field, attacker, moveDescName) {
    if (move.isSignatureZ) {
        move.isZ = true;
        if (attacker.ability == 'Parental Bond') attacker.ability = '';
    }
    else if (move.isZ) {
        var tempMove = move;

        if (move.name.includes("Hidden Power") || move.name === 'Revelation Dance') {
            move.type = "Normal";
        }
        else move.type = tempMove.type;

        var ZName = ZMOVES_LOOKUP[tempMove.type];
        var SigZ;
        if (attacker.isTransformed) {
            var tempSpecies = false.prop("checked") ? transformSpecies["p1"] : transformSpecies["p2"];
            SigZ = getSignatureZMove(attacker.item, tempSpecies, move.name);
        }
        else
            SigZ = getSignatureZMove(attacker.item, attacker.name, tempMove.name);
        if (SigZ !== -1) ZName = SigZ;
        //turning it into a generic single-target Z-move
        move = moves[ZName];
        if (move == undefined) move = tempMove;
        move.name = ZName;
        if (SigZ == -1) {
            if (tempMove.zp) move.bp = tempMove.zp; //for any moves that don't fit into the bracketed z-move bp
            else if (tempMove.bp <= 55) move.bp = 100;
            else if (tempMove.bp <= 65) move.bp = 120;
            else if (tempMove.bp <= 75) move.bp = 140;
            else if (tempMove.bp <= 85) move.bp = 160;
            else if (tempMove.bp <= 95) move.bp = 175;
            else if (tempMove.bp <= 100) move.bp = 180;
            else if (tempMove.bp <= 110) move.bp = 185;
            else if (tempMove.bp <= 125) move.bp = 190;
            else if (tempMove.bp <= 130) move.bp = 195;
            else move.bp = 200;
            move.name = "Z-" + tempMove.name;
            move.isZ = true;
            move.category = tempMove.category;
            moveDescName = ZName + " (" + move.bp + " BP)";
        }
        else
            moveDescName = ZName;
        move.isCrit = tempMove.isCrit;
        move.hits = 1;
        if (attacker.ability == 'Parental Bond') attacker.ability = '';
    }
    return [move, moveDescName];
}

function MaxMoves(move, attacker, isQuarteredByProtect, moveDescName, field) {
    var exceptions_100_fight = ["Low Kick", "Reversal", "Final Gambit"];
    var exceptions_80_fight = ["Double Kick", "Triple Kick"];
    var exceptions_75_fight = ["Counter", "Seismic Toss"];
    var exceptions_140 = ["Crush Grip", "Wring Out", "Magnitude", "Double Iron Bash", "Rising Voltage", "Triple Axel"];
    var exceptions_130 = ["Pin Missile", "Power Trip", "Punishment", "Dragon Darts", "Dual Chop", "Electro Ball", "Heat Crash",
        "Bullet Seed", "Grass Knot", "Bonemerang", "Bone Rush", "Fissure", "Icicle Spear", "Sheer Cold", "Weather Ball", "Tail Slap", "Guillotine", "Horn Drill",
        "Flail", "Return", "Frustration", "Endeavor", "Natural Gift", "Trump Card", "Stored Power", "Rock Blast", "Gear Grind", "Gyro Ball", "Heavy Slam",
        "Dual Wingbeat", "Terrain Pulse", "Surging Strikes", "Scale Shot"];
    var exceptions_120 = ["Double Hit", "Spike Cannon"];
    var exceptions_100 = ["Twineedle", "Beat Up", "Fling", "Dragon Rage", "Nature's Madness", "Night Shade", "Comet Punch", "Fury Swipes", "Sonic Boom", "Bide",
        "Super Fang", "Present", "Spit Up", "Psywave", "Mirror Coat", "Metal Burst"];
    var tempMove = move;
    var maxName = MAXMOVES_LOOKUP[tempMove.type];
    if (G_MAXMOVES_TYPE[attacker.name] == tempMove.type && attacker.gmax_factor) {
        maxName = G_MAXMOVES_LOOKUP[attacker.name];
    }
    move = moves[maxName];
    if (move == undefined) move = tempMove; //prevents crashing when switching between Gen VII and VIII, as well as for Typeless Max Moves
    else {
        move.type = tempMove.type;
        move.name = maxName;
    }
    if (['G-Max Drum Solo', 'G-Max Fireball', 'G-Max Hydrosnipe'].indexOf(maxName) == -1) {
        if (move.type == "Fighting" || move.type == "Poison") {
            if (tempMove.bp >= 150 || exceptions_100_fight.includes(tempMove.name)) move.bp = 100;
            else if (tempMove.bp >= 110) move.bp = 95;
            else if (tempMove.bp >= 75) move.bp = 90;
            else if (tempMove.bp >= 65) move.bp = 85;
            else if (tempMove.bp >= 55 || exceptions_80_fight.includes(tempMove.name)) move.bp = 80;
            else if (tempMove.bp >= 45 || exceptions_75_fight.includes(tempMove.name)) move.bp = 75;
            else move.bp = 70;
        }
        else {
            if (tempMove.bp >= 150) move.bp = 150;
            else if (tempMove.bp >= 110 || exceptions_140.includes(tempMove.name)) move.bp = 140;
            else if (tempMove.bp >= 75 || exceptions_130.includes(tempMove.name)) move.bp = 130;
            else if (tempMove.bp >= 65 || exceptions_120.includes(tempMove.name)) move.bp = 120;
            else if (tempMove.bp >= 55 || exceptions_100.includes(tempMove.name)) move.bp = 110;
            else if (tempMove.bp >= 45) move.bp = 100;
            else move.bp = 90;
        }
    }
    if (move.name === "G-Max Wind Rage")
        move.ignoresScreens = true;
    if (maxName != undefined)
        moveDescName = maxName + " (" + move.bp + " BP)";
    if (tempMove.name == "(No Move)") {
        moveDescName = "(No Move)";
        move.bp = 0;
        move.isCrit = false;
    }
    else if (tempMove.category == "Status") {
        moveDescName = "Max Guard";
        move.name = moveDescName;
        move.bp = 0;
        move.isCrit = false;
    }
    else move.isCrit = tempMove.isCrit;
    move.category = tempMove.category;
    move.hits = 1;
    if (isQuarteredByProtect && ["G-Max One Blow", "G-Max Rapid Flow"].includes(maxName)) isQuarteredByProtect = false;
    if (attacker.ability == 'Parental Bond') attacker.ability = '';

    return [move, isQuarteredByProtect, moveDescName];
}

function NaturePower(move, field, moveDescName) {         //Rename Nature Power to its appropriately called moves; needs to be done after Max Moves since Nature Power becomes Max Guard
    move.category = "Special";
    var natureZ = move.isZ;
    var npMove = gen == 3 ? "Swift" : gen == 5 ? "Earthquake"
        : (field.terrain == "Electric") ? "Thunderbolt"
            : (field.terrain == "Grassy") ? "Energy Ball"
                : (field.terrain == "Psychic") ? "Psychic"
                    : (field.terrain == "Misty") ? "Moonblast"
                        : "Tri Attack";
    move = moves[npMove];
    move.name = npMove;
    move.isZ = natureZ;
    move.hits = 1;
    moveDescName = npMove;
    return [move, moveDescName];
}

function checkMeFirst(move, moveDescName, defender, isDynamax) {
    var moveName = defender.moves[move.usedOppMoveIndex].name;
    var cannotCall = ['Beak Blast', 'Belch', 'Chatter', 'Counter', 'Covet', 'Focus Punch', 'Metal Burst', 'Mirror Coat', 'Shell Trap', 'Struggle', 'Thief'].includes(moveName);
    var meFirstZ = move.isZ, isMeFirst = false, tempCrit = move.isCrit;
    if (!cannotCall && moves[moveName].category !== 'Status' && !isDynamax) {
        move = moves[moveName];
        move.name = moveName;
        isMeFirst = true;
        move.isZ = meFirstZ;
        move.isCrit = tempCrit;
        moveDescName = moveName;
    }
    return [move, moveDescName, isMeFirst];
}

function statusMoves(move, attacker, defender, description) {
    if (move.name === "Pain Split" && attacker.item !== "Assault Vest") {
        return { "damage": [Math.floor((defender.curHP - attacker.curHP) / 2)], "description": buildDescription(description) };
    }
    else if (move.bp === 0 || move.category === "Status") {
        return { "damage": [0], "description": buildDescription(description) };
    }
}

function abilityIgnore(attacker, move, defAbility, description, defItem = "") {
    var isIgnoreable = ['Shadow Shield', 'Full Metal Body', 'Prism Armor', 'As One', 'Protosynthesis', 'Quark Drive',
        'Tablets of Ruin', 'Vessel of Ruin', 'Sword of Ruin', 'Beads of Ruin'].indexOf(defAbility) == -1 && defItem !== "Ability Shield";
    var isMoldBreaker = ["Mold Breaker", "Teravolt", "Turboblaze"].indexOf(attacker.ability) !== -1;
    var isIgnoreMove = ["Moongeist Beam", "Sunsteel Strike", "Photon Geyser", "Searing Sunraze Smash", "Menacing Moonraze Maelstrom",
        "Light That Burns the Sky", 'G-Max Drum Solo', 'G-Max Fireball', 'G-Max Hydrosnipe'].indexOf(move.name) !== -1;

    if (isMoldBreaker || isIgnoreMove) {
        move.ignoresFriendGuard = true;
        if (isIgnoreable) {
            defAbility = "[ignored]";
            if (isMoldBreaker)
                description.attackerAbility = attacker.ability;
        }
    }

    return [defAbility, description];
}

function critMove(move, defAbility) {
    return move.isCrit && ["Battle Armor", "Shell Armor"].indexOf(defAbility) === -1;
}

//UNUSED CURRENTLY
function HiddenPower(move, attacker, description) {
    var typeOrder = ['Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost', 'Steel', 'Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Dragon', 'Dark'];
    var typeIndex = Math.floor(((attacker.ivs['hp'] & 1) + (attacker.ivs[AT] & 1) * 2 + (attacker.ivs[DF] & 1) * 4 + (attacker.ivs[SP] & 1) * 8 + (attacker.ivs[SA] & 1) * 16 + (attacker.ivs[SD] & 1) * 32) * 15 / 63);
    move.type = typeOrder[typeIndex];
    if (gen < 6) {
        move.bp = Math.floor((secondLeastSigBit(attacker.ivs['hp']) + (secondLeastSigBit(attacker.ivs[AT]) * 2) + (secondLeastSigBit(attacker.ivs[DF]) * 4) + (secondLeastSigBit(attacker.ivs[SP]) * 8) + (secondLeastSigBit(attacker.ivs[SA]) * 16) + (secondLeastSigBit(attacker.ivs[SD]) * 32)) * 40 / 63) + 30;
        description.moveBP = move.bp;
    }
    description.moveType = move.type;

    return [move, description];
}

function secondLeastSigBit(val) {
    if (val & 2) {
        return 1;
    }
    return 0;
}

function NaturalGift(move, attacker, description) {
        var gift = getNaturalGift(attacker.item);
        move.type = gift.t;
        move.bp = gift.p;
        description.attackerItem = attacker.item;
        description.moveBP = move.bp;
        description.moveType = move.type;
    
    return [move, description];
}

const TYPE_CHANGE_BOOST_ABILITIES = [
    'Normalize',
    'Aerilate',
    'Pixilate',
    'Refrigerate',
    'Galvanize',
    'Dragonize'
];
function checkAbilityTypeChange(move, attacker, description) {
    var isBoosted = false;
    if (attacker.ability === "Liquid Voice") {
        if (move.isSound) {
            move.type = "Water";
            description.attackerAbility = attacker.ability;
        }
    }
    else {
        if (attacker.ability !== "Normalize" && move.type === "Normal") { //Z-Moves don't receive -ate type changes
            switch (attacker.ability) {
                case "Aerilate":
                    move.type = "Flying";
                    break;
                case "Pixilate":
                    move.type = "Fairy";
                    break;
                case "Refrigerate":
                    move.type = "Ice";
                    break;
                case "Galvanize":
                    move.type = "Electric";
                    break;
                case "Dragonize":
                    move.type = "Dragon";
            }
            if (attacker.isDynamax)
                description.moveName = MAXMOVES_LOOKUP[move.type] + " (" + move.bp + " BP)";
            isBoosted = true;     //indicates whether the move gets the boost or not
        }
        else if (attacker.ability === "Normalize") {
            move.type = "Normal";
            if (attacker.isDynamax)
                description.moveName = "Max Strike (" + move.bp + " BP)";
            isBoosted = gen >= 7 ? true : false;     //indicates whether the move gets the boost or not
        }
    }

    return [move, description, isBoosted];
}


function immunityChecks(move, attacker, defender, field, description, defAbility, typeEffectiveness) {
    if (typeEffectiveness === 0 || (gen === 3 && move.type === '???')) {
        return { "damage": [0], "description": buildDescription(description) };
    }
    if ((defAbility === "Wonder Guard" && typeEffectiveness <= 1 && move.type !== 'Typeless' && (gen !== 4 || move.name !== 'Fire Fang')) ||
        (move.type === "Grass" && defAbility === "Sap Sipper") ||
        (move.type === "Fire" && ["Flash Fire", "Well-Baked Body"].indexOf(defAbility) !== -1) ||
        (move.type === "Water" && (["Dry Skin", "Water Absorb"].indexOf(defAbility) !== -1 || (defAbility === 'Storm Drain' && gen !== 4))) ||
        (move.type === "Electric" && (["Motor Drive", "Volt Absorb"].indexOf(defAbility) !== -1 || (defAbility === 'Lightning Rod' && gen > 4))) ||
        (move.type === "Ground" && ((!field.isGravity && defender.item !== "Iron Ball" && ['Levitate','Eelevate'].includes(defAbility)) || defAbility === "Earth Eater")) ||
        (move.isBullet && defAbility === "Bulletproof") ||
        (move.isSound && defAbility === "Soundproof") ||
        (move.isWind && defAbility === "Wind Rider")) {
        description.defenderAbility = defAbility;
        return { "damage": [0], "description": buildDescription(description) };
    }
    if (move.type === "Ground" && !field.isGravity && defender.item === "Air Balloon" && move.name !== "Thousand Arrows") {
        description.defenderItem = defender.item;
        return { "damage": [0], "description": buildDescription(description) };
    }
    if ((field.weather === "Harsh Sun" && move.type === "Water") || (field.weather === "Heavy Rain" && move.type === "Fire")) {
        return { "damage": [0], "description": buildDescription(description) };
    }
    if (move.name === "Sky Drop" &&
        (defender.hasType("Flying") ||
            (gen >= 6 && defender.weight >= 200.0) || field.isGravity)) {
        return { "damage": [0], "description": buildDescription(description) };
    }
    if (move.name === "Synchronoise" && !(defender.hasType(attacker.type1, attacker.type2))) {
        return { "damage": [0], "description": buildDescription(description) };
    }
    if (defender.isDynamax && ["Grass Knot", "Low Kick", "Heat Crash", "Heavy Slam"].indexOf(move.name) !== -1) {
        return { "damage": [0], "description": buildDescription(description) };
    }
    if ((defAbility === "Damp" || attacker.ability === "Damp") && ["Self-Destruct", "Explosion", "Mind Blown", "Misty Explosion"].indexOf(move.name) !== -1) {
        if (defAbility === "Damp")
            description.defenderAbility = defAbility;
        if (attacker.ability === "Damp")
            description.attackerAbility = attacker.ability;
        return { "damage": [0], "description": buildDescription(description) };
    }
    if (move.isOHKO && defAbility === "Sturdy") {
        description.defenderAbility = defAbility;
        return { "damage": [0], "description": buildDescription(description) };
    }
    if (move.name === "Fling" && cantFlingItem(attacker.item, attacker.name, defAbility)) {
        description.attackerItem = attacker.item;
        return { "damage": [0], "description": buildDescription(description) };
    }
    if (move.name === "Natural Gift" && attacker.item.indexOf(" Berry") === -1) {
        return { "damage": [0], "description": buildDescription(description) };
    }
    if (["Queenly Majesty", "Dazzling", "Armor Tail"].indexOf(defAbility) !== -1 && move.isPriority) {
        description.defenderAbility = defAbility;
        return { "damage": [0], "description": buildDescription(description) };
    }
    if (field.terrain === "Psychic" && move.isPriority && pIsGrounded(defender, field)) {
        description.terrain = field.terrain;
        return { "damage": [0], "description": buildDescription(description) };
    }
    if (move.name === 'Dream Eater' && defender.status !== 'Asleep' && defAbility !== 'Comatose') {
        return { "damage": [0], "description": buildDescription(description) };
    }

    return -1;
}

//Special Cases
function setDamage(move, attacker, defender, description, isQuarteredByProtect, field) {
    var isParentBond = attacker.ability === "Parental Bond";
    //a. Counterattacks (Counter, Mirror Coat, Metal Burst, Comeuppance, Bide)
    if (['Counter', 'Mirror Coat', 'Metal Burst', 'Comeuppance'].indexOf(move.name) !== -1) {
        var counteredMove = defender.moves[move.usedOppMoveIndex];
        if (counteredMove.category !== 'Status') {
            if (gen <= 3) counteredMove.category = typeChart[counteredMove.type].category;
            counteredResult = GET_DAMAGE_HANDLER(defender, attacker, counteredMove, field);
            if (Array.isArray(counteredResult.damage[0]))
                counteredResult.damage = counteredResult.damage[counteredResult.damage.length - 1];
            if (gen > 3 || counteredMove.name.indexOf('Hidden Power') === -1) {
                if (['Counter', 'Mirror Coat'].indexOf(move.name) !== -1 && move.category == counteredMove.category) {
                    for (i = 0; i < counteredResult.damage.length; i++) {
                        counteredResult.damage[i] *= 2;
                    }
                    counteredResult.description = '2x ' + move.name + ' (' + counteredResult.description + ') vs. ' + description.HPEVs + ' ' + description.defenderName;
                }
                else if (['Metal Burst', 'Comeuppance'].indexOf(move.name) !== -1) {
                    for (i = 0; i < counteredResult.damage.length; i++) {
                        counteredResult.damage[i] = Math.floor(counteredResult.damage[i] * 1.5);
                    }
                    counteredResult.description = '1.5x ' + move.name + ' (' + counteredResult.description + ') vs. ' + description.HPEVs + ' ' + description.defenderName;
                }
                else {
                    return { "damage": [0], "description": buildDescription(description) };
                }
            }
            else if (move.name === 'Counter') {
                for (i = 0; i < counteredResult.damage.length; i++) {
                    counteredResult.damage[i] *= 2;
                }
                counteredResult.description = '2x ' + move.name + ' (' + counteredResult.description + ') vs. ' + description.HPEVs + ' ' + description.defenderName;
            }
            else {
                return { "damage": [0], "description": buildDescription(description) };
            }
            if (isParentBond) {
                for (var i = 0; i < counteredResult.damage.length; i++) {
                    counteredResult.damage[i] *= 2;
                }
            }
            return counteredResult;
        }
        else {
            return { "damage": [0], "description": buildDescription(description) };
        }
        //Bide ain't being added it's too niche
    }

    //b. Defender HP Dependent (Super Fang/Nature's Madness/Ruination, Guardian of Alola)
    var def_curHP;
    if (["Super Fang", "Nature's Madness", "Ruination"].indexOf(move.name) !== -1) {
        def_curHP = Math.floor(defender.curHP / 2);
        if (isParentBond) {
            def_curHP = Math.floor(def_curHP * 3 / 2);
        }
        if (defender.isDynamax) {
            def_curHP = Math.floor(def_curHP / 2);
        }
        if (gen == 9.5) {
            def_curHP = Math.floor(def_curHP * 0.75);
        }
        return { "damage": [def_curHP], "description": buildDescription(description) };
    }
    else if (move.name === "Guardian of Alola") {
        if (!isQuarteredByProtect) {
            def_curHP = Math.floor(defender.curHP * 3 / 4);
        }
        else {
            def_curHP = Math.floor(defender.curHP * 3 / 16);
        }
        return { "damage": [def_curHP], "description": buildDescription(description) };
    }

    //c. Attacker HP Dependent (Endeavor, Final Gambit)
    if (move.name === "Endeavor") {
        var endvr_dmg = 0;
        if (attacker.curHP < defender.curHP) endvr_dmg = defender.curHP - attacker.curHP;
        return { "damage": [endvr_dmg], "description": buildDescription(description) };
    }
    if (move.name === "Final Gambit") {
        var at_curHP = attacker.curHP;
        return { "damage": [at_curHP], "description": buildDescription(description) };
    }

    //d. Set Damage (Sonic Boom, Dragon Rage)
    if (move.name === "Sonic Boom") {
        return !isParentBond
            ? { "damage": [20], "description": buildDescription(description) }
            : { "damage": [40], "description": buildDescription(description) };
    }
    if (move.name === "Dragon Rage") {
        return !isParentBond
            ? { "damage": [40], "description": buildDescription(description) }
            : { "damage": [80], "description": buildDescription(description) };
    }

    //e. Level Dependent Damage (Seismic Toss, Night Shade)
    if (move.name === "Seismic Toss" || move.name === "Night Shade") {
        var lv = attacker.level;
        if (isParentBond) {
            lv *= 2;
        }
        return { "damage": [lv], "description": buildDescription(description) };
    }

    //f. OHKO moves
    if (move.isOHKO) {
        if (move.name == 'Sheer Cold' && defender.hasType("Ice"))
            return { "damage": [0], "description": buildDescription(description) };
        else
            return { "damage": [defender.curHP], "description": buildDescription(description) };
    }
    //g. Psywave

    return -1;
}

/**
 * Returns true if the Pokemon is grounded, and false if it is airborne. Cases not covered:
 * - Klutz + Iron Ball/Air Balloon (handled in function checkKlutz)
 * - Levitate + ignoring/negating abilities (handled before; ability should be blank by the time this function is called)
 * - Flying type + Ring Target (handled in function getMoveEffectiveness)
 * - Thousand Arrows (handled in function getMoveEffectiveness)
 * - Ingrain (not implemented currently)
 * - Flying type + Roost (not implemented, not planning on implementing, wouldn't be handled here anyway)
 */
function pIsGrounded(mon, field) {
    return field.isGravity || mon.item == "Iron Ball" || (mon.item != "Air Balloon" && !(["Levitate", "Eelevate"].includes(mon.ability)) && !(mon.hasType("Flying")));
}

//1. Custom BP
function basePowerFunc(move, description, turnOrder, attacker, defender, field, attIsGrounded, defIsGrounded, defAbility) {
    var basePower;
    switch (move.name) {
        //a. Speed based
        //a.i. Gyro Ball
        case "Gyro Ball":
            basePower = Math.min(150, Math.floor(25 * defender.stats[SP] / attacker.stats[SP]));
            description.moveBP = basePower;
            break;
        //a.ii. Electro Ball
        case "Electro Ball":
            var r = (defender.stats[SP] == 0) ? 0 : Math.floor(attacker.stats[SP] / defender.stats[SP]);
            basePower = r >= 4 ? 150 : r >= 3 ? 120 : r >= 2 ? 80 : r >= 1 ? 60 : 40;
            description.moveBP = basePower;
            break;

        //b. Weight based
        //b.i. Low Kick, Grass Knot
        case "Low Kick":
        case "Grass Knot":
            if (gen >= 3) {
                var w = defender.weight;
                basePower = w >= 200 ? 120 : w >= 100 ? 100 : w >= 50 ? 80 : w >= 25 ? 60 : w >= 10 ? 40 : 20;
                description.moveBP = basePower;
                if (defAbility == "Heavy Metal" || defAbility == "Light Metal")
                    description.defenderAbility = defAbility;
                if (defender.item == "Float Stone")
                    description.defenderItem = defender.item;
            }
            else basePower = move.bp;
            break;
        //b.ii. Heavy Slam, Heat Crash
        case "Heavy Slam":
        case "Heat Crash":
            var wr = attacker.weight / defender.weight;
            basePower = wr >= 5 ? 120 : wr >= 4 ? 100 : wr >= 3 ? 80 : wr >= 2 ? 60 : 40;
            description.moveBP = basePower;
            if (defAbility == "Heavy Metal" || defAbility == "Light Metal")
                description.defenderAbility = defAbility;
            if (defender.item == "Float Stone")
                description.defenderItem = defender.item;
            if (attacker.ability == "Heavy Metal" || attacker.ability == "Light Metal")
                description.attackerAbility = attacker.ability;
            if (attacker.item == "Float Stone")
                description.attackerItem = attacker.item;
            break;

        //c. HP based
        //c.i. Eruption, Water Spout, Dragon Energy
        case "Eruption":
        case "Water Spout":
        case "Dragon Energy":
            basePower = Math.max(1, Math.floor(150 * attacker.curHP / attacker.maxHP));
            description.moveBP = basePower;
            break;
        //c.ii. Flail, Reversal
        case "Flail":
        case "Reversal":
            var p = Math.floor(48 * attacker.curHP / attacker.maxHP);
            basePower = p <= 1 ? 200 : p <= 4 ? 150 : p <= 9 ? 100 : p <= 16 ? 80 : p <= 32 ? 40 : 20;
            description.moveBP = basePower;
            break;
        //c.iii. Crush Grip, Wring Out, Hard Press
        case "Crush Grip":
        case "Wring Out":
            basePower = Math.floor(pokeRound(120 * 100 * Math.floor(defender.curHP * 0x1000 / defender.maxHP) / 0x1000) / 100);
            description.moveBP = basePower;
            break;
        case "Hard Press":
            basePower = Math.floor(pokeRound(100 * 100 * Math.floor(defender.curHP * 0x1000 / defender.maxHP) / 0x1000) / 100);
            description.moveBP = basePower;
            break;

        //d. Friendship based   (not done under the assumption that it will always deal max damage)
        //d.i. Return
        //d.ii. Frustration

        //e. Counter based
        //e.i. Fury Cutter
        //e.ii. Rollout, Ice Ball
        //e.iii. Spit Up

        //f. Boost based
        //f.i. Stored Power, Power Trip
        case "Stored Power":
        case "Power Trip":
            basePower = 20 + 20 * countBoosts(attacker.boosts);
            description.moveBP = basePower;
            break;
        //f.ii. Punishment
        case "Punishment":
            basePower = Math.min(200, 60 + 20 * countBoosts(defender.boosts));
            description.moveBP = basePower;
            break;

        //g. Dichotomous BP
        //g.i. Acrobatics
        case "Acrobatics":
            basePower = attacker.item === 'Flying Gem'
                || attacker.item === "" ? 110 : 55;
            if (basePower !== move.bp) description.moveBP = basePower;
            break;
        //g.ii. Hex
        case "Hex":
        case "Infernal Parade":
            basePower = move.bp * (defender.status !== "Healthy" || defAbility === 'Comatose' ? 2 : 1);
            if (basePower !== move.bp) description.moveBP = basePower;
            break;
        //g.iii. Smelling Salts
        case "Smelling Salts":
            basePower = move.bp * (defender.status === "Paralyzed" ? 2 : 1);
            if (basePower !== move.bp) description.moveBP = basePower;
            break;
        //g.iv. Wake-Up Slap
        case "Wake-Up Slap":
            basePower = move.bp * (defender.status === "Asleep" || defAbility === 'Comatose' ? 2 : 1);
            if (basePower !== move.bp) description.moveBP = basePower;
            break;
        //g.v. Weather Ball
        case "Weather Ball":
            let isWeatherBoost = !(['', 'Strong Winds'].includes(field.weather));
            let isMegaSol = attacker.ability === 'Mega Sol';
            basePower = move.bp * (isWeatherBoost || isMegaSol ? 2 : 1);
            if (basePower !== move.bp) {
                description.moveBP = basePower;
                if (isWeatherBoost) {
                    description.weather = field.weather;
                }
                else if (isMegaSol) {
                    description.attackerAbility = attacker.ability;
                }
                description.moveType = move.type;
            }
            break;
        //g.vi. Water Shuriken
        case "Water Shuriken":
            basePower = (attacker.name === "Ash-Greninja" && attacker.ability === "Battle Bond") ? 20 : move.bp;
            if (basePower !== move.bp) description.moveBP = basePower;
            break;
        //g.vii. Terrain Pulse
        case "Terrain Pulse":
            basePower = (field.terrain !== "" && attIsGrounded) ? move.bp * 2 : move.bp;
            if (basePower !== move.bp) {
                description.moveBP = basePower;
                description.terrain = field.terrain;
                description.moveType = move.type;
            }
            break;
        //g.viii. Rising Voltage
        case "Rising Voltage":
            basePower = (field.terrain === "Electric" && defIsGrounded) ? move.bp * 2 : move.bp;
            if (basePower !== move.bp) description.moveBP = basePower;
            break;
        //g.ix. Grass Pledge, Fire Pledge, Water Pledge combined
        case "Grass Pledge":
        case "Fire Pledge":
        case "Water Pledge":
            basePower = move.combinePledge !== move.name ? 150 : move.bp;
            description.moveBP = basePower;
            if (move.combinePledge !== move.name)
                description.moveType = move.type;
            break;
        //g.x. Tera Blast Tera-Stellar
        case "Tera Blast":
            basePower = move.type == 'Stellar' ? 100 : 80;
            if (basePower !== move.bp) description.moveBP = basePower;
            break;
        //g.xi. Brine (Gen 4)
        case "Brine":
            if (gen == 4 && defender.curHP <= (defender.maxHP / 2)) {
                basePower = move.bp * 2;
                description.moveBP = basePower;
            }
            else basePower = move.bp;
            break;
        //g.xii. Facade (Gens 3-4)
        case "Facade":
            if (gen <= 4 && ["Burned", "Paralyzed", "Poisoned", "Badly Poisoned"].indexOf(attacker.status) !== -1) {
                basePower = move.bp * 2;
                description.moveBP = basePower;
            }
            else basePower = move.bp;
            break;
        //g.xiii. Payback, Fisheous Rend, Bolt Beak                                            CURRENTLY USING ISDOUBLE IN DEFAULT
        //case "Payback":
        //case "Fisheous Rend":
        //case "Bolt Beak":
        //    basePower = turnOrder === "LAST" ? move.bp * 2 : move.bp;
        //    if (basePower !== move.bp) description.moveBP = basePower;
        //    break;
        //g.xvi. Everything else (Assurance, Avalanche, Revenge, Gust, Twister, Pursuit, Round, Stomping Tantrum, Temper Flare)    CHECK DEFAULT

        //h. Item based
        //h.i. Fling
        case "Fling":
            basePower = getFlingPower(attacker.item);
            description.moveBP = basePower;
            if (gen !== 4 || attacker.ability !== "Klutz")
                description.attackerItem = attacker.item;
            break;
        //h.ii. Natural Gift
        case "Natural Gift":
            if (attacker.item.indexOf(" Berry") !== -1) {
                [move, description] = NaturalGift(move, attacker, description);
                basePower = move.bp;
            }
            break;

        //i. Other
        //i.i. Beat Up
        //i.ii. Echoed Voice
        //i.iii. Hidden Power (ONLY APPLIES TO THE HIDDEN POWER THAT DOESN'T SPECIFY ITS TYPE; BP is actually calculated earlier for ease of use, so this is just for the description)
        case "Hidden Power":
            basePower = move.bp;
            if (gen < 6) {
                description.moveBP = basePower;
            }
            description.moveType = move.type;
            break;
        //i.iv. Magnitude
        //i.v. Present
        //i.vi. Triple Kick, Triple Axel 
        case "Triple Kick":
        case "Triple Axel":
            if (move.currTripleHit)
                basePower = move.bp * move.currTripleHit;
            else
                basePower = move.bp;
            break;
        //i.vii. Trump Card
        //i.viii. Last Respects, Rage Fist
        case "Last Respects":
        case "Rage Fist":
            basePower = move.bp * (move.timesAffected + 1);
            if (move.timesAffected)
                description.moveBP = basePower;
            break;
        //i.ix. Dark Void (Legends Z-A)         NEEDS TO BE VERIFIED
        case "Dark Void":
            if (gen == 9.5 && defender.status == "Drowsy") {
                basePower = 2 * move.bp;
                description.moveBP = basePower;
            }
            else {
                basePower = move.bp;
            }
            break;
        default:
            if (move.isDouble && ['Retaliate', 'Fusion Bolt', 'Fusion Flare', 'Lash Out'].indexOf(move.name) === -1) {
                basePower = 2 * move.bp;
                if (basePower !== move.bp) description.moveBP = basePower;
            }
            else {
                basePower = move.bp;
                if (!move.isZ && basePower !== moves[move.name].bp && !description.moveBP) {
                    description.moveBP = basePower;
                }
            }
    }

    return [basePower, description];
}

//2. BP Mods
function calcBPMods(attacker, defender, field, move, description, ateIzeBoosted, basePower, attIsGrounded, defIsGrounded, turnOrder, defAbility, isMeFirst) {
    var bpMods = [];
    var isAttackerAura = attacker.ability === (move.type + " Aura");
    var isDefenderAura = defAbility === (move.type + " Aura");
    var auraActive = isAttackerAura || isDefenderAura;
    var auraBreak = (undefined != undefined);

    //a. Aura Break
    if (auraActive && auraBreak && !field.isNeutralizingGas && defAbility !== '[ignored]') {
        bpMods.push(0x0C00);
        if (isAttackerAura || attacker.ability == "Aura Break") {
            description.attackerAbility = attacker.ability;
        }
        else if (isDefenderAura || defAbility == "Aura Break") {
            description.defenderAbility = defAbility;
        }
    }

    //b. Rivalry
    if (attacker.ability == "Rivalry" && attacker.rivalryGender != '') {
        if (attacker.rivalryGender == 'Same') {
            bpMods.push(0x1400);
            description.attackerAbility = 'Rivalry (1.25x)';
        }
        else if (attacker.rivalryGender == 'Opposite') {
            bpMods.push(0x0C00);
            description.attackerAbility = 'Rivalry (0.75x)';
        }
    }

    //c. 1.2x Abilities
    //c.i. Galvanize, Aerilate, Pixilate, Refrigerate, Dragonize, Normalize        (Technically Normalize is separate but it doesn't hurt to handle it where it is now)
    if (!move.isZ && !attacker.isDynamax && ateIzeBoosted) {     //function checkAbilityTypeChange sets this value
        var ateIzeMultiplier = gen > 6 ? 0x1333 : 0x14CD;
        bpMods.push(ateIzeMultiplier);
        description.attackerAbility = attacker.ability;
    }
    //c.ii Reckless, Iron Fist                                          (Same deal; hasRecoil shouldn't ever be true, but it's still checked for unknown recoil amount)
    else if ((attacker.ability === "Reckless" && (move.hasRecoil || move.recoilHP || move.hasCrash)) || (attacker.ability === "Iron Fist" && move.isPunch)) {
        bpMods.push(0x1333);
        description.attackerAbility = attacker.ability;
    }

    //d. Field Abilities
    //d.i. Battery
    if (field.isBattery && move.category === "Special") {
        bpMods.push(0x14CD);
        description.isBattery = true;
    }
    //d.ii. Power Spot
    if (field.isPowerSpot) {
        bpMods.push(0x14CD);
        description.isPowerSpot = true;
    }
    //d.iii. Ally Steely Spirit (probably doesn't go here but Smogon makes Doubles research a pain to find)
    if (field.isSteelySpirit && move.type === "Steel") {
        bpMods.push(0x1800);
        description.isSteelySpirit = true;
    }

    //e. 1.3x Abilities
    //e.i. Sheer Force
    if (attacker.ability === "Sheer Force" && move.hasSecondaryEffect) {
        bpMods.push(0x14CD);
        description.attackerAbility = attacker.ability;
    }
    //e.ii. Sand Force
    else if (attacker.ability === "Sand Force" && field.weather === "Sand" && ["Rock", "Ground", "Steel"].indexOf(move.type) !== -1) {
        bpMods.push(0x14CD);
        description.attackerAbility = attacker.ability;
        description.weather = field.weather;
    }
    //e.iii. Analytic
    else if (attacker.ability === "Analytic" && turnOrder !== "FIRST") {
        bpMods.push(0x14CD);
        description.attackerAbility = attacker.ability;
    }
    //e.iv. Tough Claws
    else if (attacker.ability === "Tough Claws" && move.makesContact) {
        bpMods.push(0x14CD);
        description.attackerAbility = attacker.ability;
    }
    //e.v. Punk Rock
    else if (attacker.ability == "Punk Rock" && move.isSound) {
        bpMods.push(0x14CD);
        description.attackerAbility = attacker.ability;
    }

    //f. Fairy Aura, Dark Aura
    if (auraActive && !auraBreak && !field.isNeutralizingGas && (gen > 7 || defAbility !== '[ignored]')) {
        bpMods.push(0x1548);
        if (isAttackerAura) {
            description.attackerAbility = attacker.ability;
        }
        else if (isDefenderAura) {
            description.defenderAbility = defAbility;
        }
    }

    //If the BP before this point would trigger Technician, don't apply it
    var tempBP = pokeRound(basePower * chainMods(bpMods) / 0x1000);

    //g. 1.5x Abilities (Technician, Flare Boost, Toxic Boost, Strong Jaw, Mega Launcher, Steely Spirit)
    if ((attacker.ability === "Technician" && tempBP <= 60) ||
        (attacker.ability === "Flare Boost" && attacker.status === "Burned" && move.category === "Special") ||
        (attacker.ability === "Toxic Boost" && (attacker.status === "Poisoned" || attacker.status === "Badly Poisoned") && move.category === "Physical") ||
        (attacker.ability === "Mega Launcher" && move.isPulse) ||
        (attacker.ability === "Strong Jaw" && move.isBite) ||
        (attacker.ability === "Steely Spirit" && move.type === "Steel")) {
        bpMods.push(0x1800);
        description.attackerAbility = attacker.ability;
    }

    //h. Heatproof (pre Gen 9)
    if (defAbility === "Heatproof" && move.type === "Fire" & gen < 9) {
        bpMods.push(0x800);
        description.defenderAbility = defAbility;
    }

    //i. Dry Skin
    else if (defAbility === "Dry Skin" && move.type === "Fire") {
        bpMods.push(0x1400);
        description.defenderAbility = defAbility;
    }

    //j. 1.1x Items
    if ((attacker.item === "Muscle Band" && move.category === "Physical")
        || (attacker.item === "Wise Glasses" && move.category === "Special")) {
        bpMods.push(0x1199);
        description.attackerItem = attacker.item;
    }

    //k. 1.2x Items
    else if (getItemBoostType(attacker.item) === move.type) {
        var itemTypeMultiplier = 0x1333;
        bpMods.push(itemTypeMultiplier);
        description.attackerItem = attacker.item;
    }
    else if (getItemDualTypeBoost(attacker.item, attacker.name).indexOf(move.type) !== -1) {
        bpMods.push(0x1333);
        description.attackerItem = attacker.item;
    }
    else if (attacker.item && attacker.item.indexOf(' Mask') !== -1 && attacker.name && attacker.name.indexOf('Ogerpon-') !== -1
        && attacker.item.substring(0, attacker.item.indexOf(' Mask')) === attacker.name.substring(8) && attacker.name.indexOf('(') === -1) {
        bpMods.push(0x1333);
        description.maskBoost = true;
    }

    //l. Gems
    else if (attacker.item === move.type + " Gem" && !move.isPledge) {
        var gemMultiplier = gen > 5 ? 0x14CD : 0x1800;
        bpMods.push(gemMultiplier);
        description.attackerItem = attacker.item;
    }

    //m. Solar Beam, Solar Blade
    if ((move.name === "Solar Beam" || move.name === "Solar Blade") && !(["None", "Sun", "Harsh Sun", "Strong Winds", ""].includes(field.weather)) && attacker.item !== 'Utility Umbrella' && attacker.ability !== 'Mega Sol') {
        bpMods.push(0x800);
        description.moveBP = move.bp / 2;
        description.weather = field.weather;
    }

    //n. Me First
    if (isMeFirst) {
        bpMods.push(0x1800);
        description.meFirst = true;
    }

    //o. Knock Off
    if (gen > 5 && move.name === "Knock Off" && defender.name !== null && !cantRemoveItem(defender.item, defender.name, field.terrain)) {
        bpMods.push(0x1800);
        description.moveBP = move.bp * 1.5;
    }
    //p. Psyblade
    else if (field.terrain === "Electric" && move.name === "Psyblade") {
        bpMods.push(0x1800);
        description.moveBP = move.bp * 1.5;
        description.terrain = field.terrain;
    }
    //q. Misty Explosion
    else if ((move.name === "Misty Explosion" && field.terrain == "Misty" && attIsGrounded) ||
        (move.name === "Grav Apple" && field.isGravity)) {
        bpMods.push(0x1800);
        description.moveBP = move.bp * 1.5;
    }
    //r. Expanding Force
    else if (move.name === "Expanding Force" && field.terrain == "Psychic" && attIsGrounded) {
        bpMods.push(0x1800);
        description.moveBP = move.bp * 1.5;
    }

    //s. Helping Hand
    if (field.isHelpingHand) {
        bpMods.push(0x1800);
        description.isHelpingHand = true;
    }

    //t. Charge, Electromorphosis, Wind Power
    if ((((attacker.ability === "Electromorphosis" || attacker.ability === "Wind Power") && attacker.abilityOn) || field.isCharge) && move.type === "Electric") {
        bpMods.push(0x2000);
        description.charged = true;
    }

    //u. Double power (Facade, Brine, Venoshock, Retaliate, Fusion Bolt, Fusion Flare, Lash Out)
    if ((move.name === "Facade" && ["Burned", "Paralyzed", "Poisoned", "Badly Poisoned"].indexOf(attacker.status) !== -1) ||
        (move.name === "Brine" && defender.curHP <= defender.maxHP / 2) ||
        (["Venoshock", "Barb Barrage"].indexOf(move.name) !== -1 && (defender.status === "Poisoned" || defender.status === "Badly Poisoned")) ||
        (['Retaliate', 'Fusion Bolt', 'Fusion Flare', 'Lash Out'].indexOf(move.name) !== -1 && move.isDouble)) {
        bpMods.push(0x2000);
        description.moveBP = move.bp * 2;
    }

    //v. Offensive Terrain
    if (attIsGrounded) {
        var terrainMultiplier = gen > 7 ? 0x14CD : 0x1800;
        if (field.terrain === "Electric" && move.type === "Electric") {
            bpMods.push(terrainMultiplier);
            description.terrain = field.terrain;
        } else if (field.terrain === "Grassy" && move.type == "Grass") {
            bpMods.push(terrainMultiplier);
            description.terrain = field.terrain;
        } else if (field.terrain === "Psychic" && move.type == "Psychic") {
            bpMods.push(terrainMultiplier);
            description.terrain = field.terrain;
        }
    }
    //w. Defensive Terrain
    if (defIsGrounded) {
        if ((field.terrain === "Misty" && move.type === "Dragon") ||
            (field.terrain === "Grassy" && (move.name === "Earthquake" || move.name === "Bulldoze"))) {
            bpMods.push(0x800);
            description.terrain = field.terrain;
        }
    }

    //x. Mud Sport, Water Sport

    //y. Supreme Overlord
    if (attacker.ability === "Supreme Overlord" && attacker.supremeOverlord > 0) {
        overlordBoost = [0x119A, 0x1333, 0x14CD, 0x1666, 0x1800];
        bpMods.push(overlordBoost[attacker.supremeOverlord - 1]);
        description.attackerAbility = attacker.supremeOverlord > 1 ? attacker.ability + " (" + attacker.supremeOverlord + " allies down)"
            : attacker.ability + " (1 ally down)";
    }
    //z. Punching Glove
    if (attacker.item === "Punching Glove" && move.isPunch) {
        bpMods.push(0x119A);
        description.attackerItem = attacker.item;
    }

    //If the BP before this point would exceed 60 BP, don't apply it
    tempBP = pokeRound(basePower * chainMods(bpMods) / 0x1000);

    //aa. Tera boost for moves with <60 BP
    if (attacker.isTerastalize && (move.type === attacker.tera_type || (attacker.tera_type === 'Stellar' && move.getsStellarBoost)) && tempBP < 60 && canTeraBoost60BP(move)) {
        bpMods.push(60 / tempBP * 0x1000);
        description.teraBPBoost = true;
    }

    //MECHANICS TESTING
    if (attacker.hasCustomModifiers && attacker.customModifiers['bpMods']) {
        let customBPMods = attacker.customModifiers['bpMods'];
        for (let i = 0; i < customBPMods.length; i++) {
            bpMods.push(customBPMods[i]);
        }
        description.isMechanicsTest = true;
    }

    return [bpMods, description, move];
}

function canTeraBoost60BP(move) {
    var priority = move.isPriority;
    var multiHit = move.hitRange ? true : false;
    var otherExceptions = ["Crush Grip", "Dragon Energy", "Electro Ball", "Eruption", "Flail", "Fling", "Grass Knot", "Gyro Ball",
        "Heat Crash", "Heavy Slam", "Low Kick", "Reversal", "Water Spout", "Hard Press"].indexOf(move.name) !== -1;
    return !priority && !multiHit && !otherExceptions;
}

//3. Attack
function calcAttack(move, attacker, defender, description, isCritical, defAbility) {
    //a. Foul Play, Photon Geyser, Light That Burns The Sky, Shell Side Arm, Body Press, Tera Blast
    var attack;
    var attackSource = move.name === "Foul Play" ? defender : attacker;
    var usesDefenseStat = move.name === "Body Press";
    var attackStat = usesDefenseStat ? DF : move.category === "Physical" ? AT : SA;
    var isMidMoveAtkBoost = false;
    var isContrary = attacker.ability === 'Contrary' ? -1 : 1;
    var maxBoost = gen == 9.5 ? 1 : 6;
    var attackInvest = gen < 10 ? attackSource.evs[attackStat] : resultDisplayMode == "SPs" ? attackSource.sps[attackStat] : resultDisplayMode == "EVs" ? Math.max(0, attackSource.sps[attackStat] * 8 - 4) : attackSource.rawStats[attackStat];
    description.attackEVs = attackInvest +
        ((gen < 10 || resultDisplayMode !='raw') && NATURES[attackSource.nature][0] === attackStat ? "+" : (gen < 10 || resultDisplayMode !='raw') && NATURES[attackSource.nature][1] === attackStat ? "-" : "") + " " +
        toSmogonStat(attackStat) + (attackSource.ivs[attackStat] < 31 ? " " + attackSource.ivs[attackStat] + " IV" : "");
    description.usesOppAtkStat = move.name === "Foul Play";
    //Spectral Thief and Meteor Beam aren't part of the calculations but are instead here to properly account for the boosts they give
    if (move.name === "Spectral Thief" && defender.boosts[attackStat] > 0) {
        attacker.boosts[attackStat] = Math.min(maxBoost, attacker.boosts[attackStat] + defender.boosts[attackStat]);
        isMidMoveAtkBoost = true;
    }
    else if (["Meteor Beam", "Electro Shot"].indexOf(move.name) !== -1 && ((isContrary === -1 && attacker.boosts[attackStat] > -1 * maxBoost) || attacker.boosts[attackStat] < maxBoost)) {
        attacker.boosts[attackStat] += (1 * isContrary);
        isMidMoveAtkBoost = true;
    }
    //b. Unaware
    if (defAbility === "Unaware" && attackSource.boosts[attackStat] !== 0) {
        attack = attackSource.rawStats[attackStat];
        description.defenderAbility = defAbility;
        description.attackBoost = attackSource.boosts[attackStat];
    }
    else if (isMidMoveAtkBoost) {
        description.attackBoost = attacker.boosts[attackStat];
        attack = getModifiedStat(attackSource.rawStats[attackStat], attacker.boosts[attackStat]);
        attacker.boosts[attackStat] -= (1 * isContrary);
    }
    //c. Crit
    else if (attackSource.boosts[attackStat] === 0 || (isCritical && attackSource.boosts[attackStat] < 0)) {
        attack = attackSource.rawStats[attackStat];
    }
    //THIS IS NEEDED TO GUARANTEE CATCH ALL UNAWARE CONDITIONS, WITHOUT IT SOME WILL SLIP BY!!!
    else if (defAbility === "Unaware") {
        attack = attackSource.rawStats[attackStat];
    }
    //d. Attack boosts and drops
    else {
        attack = attackSource.stats[attackStat];
        description.attackBoost = attackSource.boosts[attackStat];
    }

    //e. Hustle
    // unlike all other attack modifiers, Hustle gets applied directly
    if (attacker.ability === "Hustle" && move.category === "Physical") {
        attack = pokeRound(attack * 3 / 2);
        description.attackerAbility = attacker.ability;
    }

    return [attack, description];
}

//4. Attack Mods
function calcAtMods(move, attacker, defAbility, description, field) {
    atMods = [];
    var ruinActive = {
        "Tablets of Ruin": undefined != undefined && !field.isNeutralizingGas,
        "Vessel of Ruin": undefined != undefined && !field.isNeutralizingGas,
    };

    //a. Tablets of Ruin, Vessel of Ruin
    if (ruinActive["Tablets of Ruin"] && move.category === "Physical" && attacker.ability !== "Tablets of Ruin") {
        atMods.push(0x0C00);
        description.ruinTabletsVessel = "Tablets";
    }
    else if (ruinActive["Vessel of Ruin"] && move.category === "Special" && attacker.ability !== "Vessel of Ruin") {
        atMods.push(0x0C00);
        description.ruinTabletsVessel = "Vessel";
    }

    //b. 0.5x Abilities
    //Slow Start also halves damage with special Z-moves
    if ((attacker.ability === "Slow Start" && attacker.abilityOn && (move.category === "Physical" || (move.category === "Special" && move.isZ))) ||
        (attacker.ability === "Defeatist" && attacker.curHP <= attacker.maxHP / 2)) {
        atMods.push(0x800);
        description.attackerAbility = attacker.ability;
    }
    //c. Flower Gift
    if (attacker.ability === "Flower Gift" && attacker.name === "Cherrim" && field.weather.indexOf("Sun") > -1 && move.category === "Physical" && attacker.item !== 'Utility Umbrella') {
        atMods.push(0x1800);
        description.attackerAbility = attacker.ability;
        description.weather = field.weather;
    }
    else if (field.isFlowerGiftAtk && field.weather.indexOf("Sun") > -1 && move.category === "Physical" && attacker.item !== 'Utility Umbrella') {
        atMods.push(0x1800);
        description.isFlowerGiftAtk = true;
        description.weather = field.weather;
    }
    //d. 1.5x Offensive Abilities
    if ((attacker.ability === "Guts" && attacker.status !== "Healthy" && move.category === "Physical")
        || (attacker.ability === "Overgrow" && attacker.curHP <= attacker.maxHP / 3 && move.type === "Grass")
        || (attacker.ability === "Blaze" && attacker.curHP <= attacker.maxHP / 3 && move.type === "Fire")
        || (attacker.ability === "Torrent" && attacker.curHP <= attacker.maxHP / 3 && move.type === "Water")
        || (attacker.ability === "Swarm" && attacker.curHP <= attacker.maxHP / 3 && move.type === "Bug")
        || (attacker.ability === "Transistor" && move.type === "Electric" && gen == 8)
        || (attacker.ability === "Dragon's Maw" && move.type === "Dragon")
        || (attacker.ability === "Flash Fire" && attacker.abilityOn && move.type === "Fire")
        || (attacker.ability === "Steelworker" && move.type === "Steel")
        || (attacker.ability === "Gorilla Tactics" && move.category === "Physical" && !attacker.isDynamax)
        || (["Plus", "Minus"].indexOf(attacker.ability) !== -1 && attacker.abilityOn)
        || (attacker.ability === "Sharpness" && move.isSlice)
        || (attacker.ability === "Rocky Payload" && move.type === "Rock")
        || (attacker.ability === "Fire Mane" && move.type === "Fire")) {
        atMods.push(0x1800);
        description.attackerAbility = attacker.ability;
    }
    else if (attacker.ability === "Solar Power" && field.weather.indexOf("Sun") > -1 && move.category === "Special" && attacker.item !== 'Utility Umbrella') {
        atMods.push(0x1800);
        description.attackerAbility = attacker.ability;
        description.weather = field.weather;
    }
    //e. 1.3x Abilities
    else if (attacker.paradoxAbilityBoost && ((attacker.highestStat === 'at' && move.category === "Physical") || (attacker.highestStat === 'sa' && move.category === "Special"))
        || (attacker.ability === "Transistor" && move.type === "Electric" && gen >= 9)) {
        atMods.push(0x14CD);
        description.attackerAbility = attacker.ability;
    }
    //f. Orichalcum Pulse, Hadron Engine
    else if ((attacker.ability == "Orichalcum Pulse" && field.weather === "Sun" && move.category === "Physical" && attacker.item !== "Utility Umbrella")
        || (attacker.ability == "Hadron Engine" && field.terrain === "Electric" && move.category === "Special")) {
        atMods.push(0x1555);
        description.attackerAbility = attacker.ability;
    }

    //g. 2.0x Offensive Abilities
    if ((attacker.ability === "Water Bubble" && move.type === "Water") ||
        ((attacker.ability === "Huge Power" || attacker.ability === "Pure Power") && move.category === "Physical")
        || (attacker.ability === "Stakeout" && attacker.abilityOn)) {
        atMods.push(0x2000);
        description.attackerAbility = attacker.ability;
    }
    //h. 0.5x Defensive Abilities
    if ((defAbility === "Thick Fat" && (move.type === "Fire" || move.type === "Ice"))
        || (defAbility === "Water Bubble" && move.type === "Fire")
        || (defAbility === "Purifying Salt" && move.type === "Ghost")
        || (defAbility === 'Heatproof' && move.type === 'Fire' && gen >= 9)) {
        atMods.push(0x800);
        description.defenderAbility = defAbility;
    }

    //i. 2.0x Items
    if ((attacker.item === "Thick Club" && (attacker.name === "Cubone" || attacker.name === "Marowak" || attacker.name === "Marowak-Alola") && move.category === "Physical") ||
        (attacker.item === "Deep Sea Tooth" && attacker.name === "Clamperl" && move.category === "Special") ||
        (attacker.item === "Light Ball" && (attacker.name === "Pikachu" || attacker.name === "Pikachu-Gmax"))) {
        atMods.push(0x2000);
        description.attackerItem = attacker.item;
    } //j. 1.5x Items
    else if ((attacker.item === "Choice Band" && move.category === "Physical" && !attacker.isDynamax) ||
        (attacker.item === "Choice Specs" && move.category === "Special" && !attacker.isDynamax) ||
        (attacker.item === "Soul Dew" && ["Latias", "Latios"].indexOf(attacker.name) !== -1 && move.category === 'Special' && gen <= 6)) {
        atMods.push(0x1800);
        description.attackerItem = attacker.item;
    }
    //k. Link Battle Red Item (LEGENDS Z-A ONLY)
    if (field.isRedItem) {
        atMods.push(0x2000);
        description.redItem = true;
    }

    //MECHANICS TESTING
    if (attacker.hasCustomModifiers && attacker.customModifiers['atMods']) {
        let customATMods = attacker.customModifiers['atMods'];
        for (let i = 0; i < customATMods.length; i++) {
            atMods.push(customATMods[i]);
        }
        description.isMechanicsTest = true;
    }

    return [atMods, description];
}

//5. Defense
function calcDefense(move, attacker, defender, description, hitsPhysical, isCritical, field) {
    //a. Psyshock, Psystrike, Secret Sword (handled in hitsPhysical declaration)
    var defenseStat = hitsPhysical ? DF : SD;
    var defenseInvest = gen < 10 ? defender.evs[defenseStat] : resultDisplayMode == "SPs" ? defender.sps[defenseStat] : resultDisplayMode == "EVs" ? Math.max(0, defender.sps[defenseStat] * 8 - 4) : defender.rawStats[defenseStat];
    description.defenseEVs = defenseInvest +
        ((gen < 10 || resultDisplayMode !='raw') && NATURES[defender.nature][0] === defenseStat ? "+" : (gen < 10 || resultDisplayMode !='raw') && NATURES[defender.nature][1] === defenseStat ? "-" : "") + " " +
        toSmogonStat(defenseStat) + (defender.ivs[defenseStat] < 31 ? " " + defender.ivs[defenseStat] + " IV" : "");

    //b. Wonder Room

    //Spectral Thief isn't part of the calculations but is instead here to properly account for the boosts it takes
    if (move.name === "Spectral Thief" && defender.boosts[defenseStat] > 0) {
        defense = defender.rawStats[defenseStat];
    }
    //c. Unaware
    else if (attacker.ability === "Unaware" && defender.boosts[defenseStat] !== 0) {
        defense = defender.rawStats[defenseStat];
        description.attackerAbility = attacker.ability;
        description.defenseBoost = defender.boosts[defenseStat];
    }
    //d. Chip Away, Sacred Sword
    else if (move.ignoresDefenseBoosts && defender.boosts[defenseStat] !== 0) {
        defense = defender.rawStats[defenseStat];
        description.defenseBoost = defender.boosts[defenseStat];
    }
    //e. Crits
    else if (defender.boosts[defenseStat] === 0 || (isCritical && defender.boosts[defenseStat] > 0)) {
        defense = defender.rawStats[defenseStat];
    }
    //THIS IS NEEDED TO GUARANTEE CATCH ALL UNAWARE AND SACRED SWORD CONDITIONS, WITHOUT IT SOME WILL SLIP BY!!!
    else if (move.ignoresDefenseBoosts || attacker.ability === "Unaware") {
        defense = defender.rawStats[defenseStat];
    }
    // f. Defense drops and boosts
    else {
        defense = defender.stats[defenseStat];
        description.defenseBoost = defender.boosts[defenseStat];
    }

    //g. Sandstorm Rock types, Snowstorm Ice Types
    // unlike all other defense modifiers, Sandstorm SpD boost gets applied directly
    if (((field.weather === "Sand" && defender.hasType("Rock") && !hitsPhysical) || (field.weather === "Snow" && defender.hasType("Ice") && hitsPhysical))
        && attacker.ability !== 'Mega Sol') {
        defense = pokeRound(defense * 3 / 2);
        description.weather = field.weather;
    }
    return [defense, description];
}

//6. Defense Mods
function calcDefMods(move, defender, field, description, hitsPhysical, defAbility) {
    var dfMods = [];
    var ruinActive = {
        "Sword of Ruin": undefined != undefined && !field.isNeutralizingGas,
        "Beads of Ruin": undefined != undefined && !field.isNeutralizingGas,
    };

    //a. Sword of Ruin, Beads of Ruin
    if (ruinActive["Sword of Ruin"] && hitsPhysical && defAbility !== "Sword of Ruin") {
        dfMods.push(0x0C00);
        description.ruinSwordBeads = "Sword";
    }
    else if (ruinActive["Beads of Ruin"] && !hitsPhysical && defAbility !== "Beads of Ruin") {
        dfMods.push(0x0C00);
        description.ruinSwordBeads = "Beads";
    }

    //b. Flower Gift
    if (defAbility === "Flower Gift" && defender.name === "Cherrim" && field.weather.indexOf("Sun") > -1 && !hitsPhysical && defender.item !== 'Utility Umbrella') {
        dfMods.push(0x1800);
        description.defenderAbility = defAbility;
        description.weather = field.weather;
    }
    else if (field.isFlowerGiftSpD && field.weather.indexOf("Sun") > -1 && !hitsPhysical && defender.item !== 'Utility Umbrella') {
        dfMods.push(0x1800);
        description.isFlowerGiftSpD = true;
        description.weather = field.weather;
    }
    //c. 1.5x Abilities
    if ((defAbility === "Marvel Scale" && defender.status !== "Healthy" && hitsPhysical) ||
        (defAbility === "Grass Pelt" && field.terrain === "Grassy" && hitsPhysical)) {
        dfMods.push(0x1800);
        description.defenderAbility = defAbility;
    }
    //d. 1.3x Abilities
    else if (defender.paradoxAbilityBoost && ((defender.highestStat === 'df' && hitsPhysical) || (defender.highestStat === 'sd' && !hitsPhysical))) {
        dfMods.push(0x14CD);
        description.defenderAbility = defAbility;
    }
    //e. 2x Abilities
    else if (defAbility === "Fur Coat" && hitsPhysical) {
        dfMods.push(0x2000);
        description.defenderAbility = defAbility;
    }
    //f. 1.5x Items
    if ((defender.item === "Assault Vest" && !hitsPhysical) ||
        (defender.item === "Eviolite" && defender.canEvolve) ||
        (defender.item === "Soul Dew" && ["Latias", "Latios"].indexOf(defender.name) !== -1 && !hitsPhysical && gen <= 6)) {
        dfMods.push(0x1800);
        description.defenderItem = defender.item;
    } //g. 2.0x Items
    else if ((defender.item === "Deep Sea Scale" && defender.name === "Clamperl" && !hitsPhysical) ||
        (defender.item === "Metal Powder" && defender.name === "Ditto" && hitsPhysical)) {
        dfMods.push(0x2000);
        description.defenderItem = defender.item;
    }
    //h. Link Battle Blue Item (LEGENDS Z-A ONLY)
    if (field.isBlueItem) {
        dfMods.push(0x2000);
        description.blueItem = true;
    }

    //MECHANICS TESTING
    if (defender.hasCustomModifiers && defender.customModifiers['dfMods']) {
        let customDFMods = defender.customModifiers['dfMods'];
        for (let i = 0; i < customDFMods.length; i++) {
            dfMods.push(customDFMods[i]);
        }
        description.isMechanicsTest = true;
    }

    return [dfMods, description];
}

//7. Base Damage
function calcBaseDamage(attacker, basePower, attack, defense) {
    return Math.floor(Math.floor((Math.floor((2 * attacker.level) / 5 + 2) * basePower * attack) / defense) / 50 + 2);
}

//8. General Damage Mods
function calcGeneralMods(baseDamage, move, attacker, defender, defAbility, field, description, isCritical, typeEffectiveness, isQuarteredByProtect, hitsPhysical) {
    //a. Spread Move mod
    if (field.format !== "Singles" && move.isSpread) {
        baseDamage = pokeRound(baseDamage * 0xC00 / 0x1000);
    }
    //b. Parental Bond mod
    var childMod = gen >= 7 ? 0x0400 : 0x0800;
    baseDamage = attacker.isChild ? pokeRound(baseDamage * childMod / 0x1000) : baseDamage;    //should be accurate based on implementation
    //c. Weather mod, Hydro Steam
    if (((((field.weather.indexOf("Sun") > -1 || attacker.ability === 'Mega Sol') && move.type === "Fire") || (field.weather.indexOf("Rain") > -1 && move.type === "Water")) && defender.item !== 'Utility Umbrella')
        || ((field.weather.indexOf("Sun") > -1 || attacker.ability === 'Mega Sol') && move.name === "Hydro Steam" && attacker.item !== 'Utility Umbrella')) {
        baseDamage = pokeRound(baseDamage * 0x1800 / 0x1000);
        if (attacker.ability === 'Mega Sol') {
            description.attackerAbility = attacker.ability;
        }
        else {
            description.weather = field.weather;
        }
    }
    else if (((field.weather === "Sun" && move.type === "Water") || (field.weather === "Rain" && move.type === "Fire" && attacker.ability !== 'Mega Sol')) && defender.item !== 'Utility Umbrella') {
        baseDamage = pokeRound(baseDamage * 0x800 / 0x1000);
        description.weather = field.weather;
    }
    else if ((field.weather === "Strong Winds" && defender.hasType("Flying") &&
        typeChart[move.type]["Flying"] > 1)) {
        description.weather = field.weather;        //not actually a mod, just adding the description here
    }
    //d. Glaive Rush 2x mod
    if (defender.glaiveRushMod) {
        baseDamage = pokeRound(baseDamage * 0x2000 / 0x1000);
        description.isGlaiveMod = true;
    }
    //e. Crit mod
    if (isCritical) {
        baseDamage = Math.floor(baseDamage * (gen >= 6 ? 1.5 : 2));
        description.isCritical = isCritical;
    }
    // the random factor is applied between the crit mod and the stab mod, so don't apply anything below this until we're inside the loop
    //see GENERAL MODS CONTINUED for further comments

    var stabMod = 0x1000;
    if (move.type !== 'Typeless') {     //Typeless moves cannot get stab even if the user is Typeless
        if (attacker.isTerastalize && attacker.tera_type !== 'Stellar') {
            if (move.type === attacker.tera_type && [attacker.teraSTAB1, attacker.teraSTAB2].indexOf(attacker.tera_type) !== -1 ) {
                if (attacker.ability === "Adaptability") {
                    stabMod = 0x2400;
                    description.attackerAbility = attacker.ability;
                } else {
                    stabMod = 0x2000;
                }
            }
            else if ((move.type !== attacker.tera_type && [attacker.teraSTAB1, attacker.teraSTAB2].indexOf(move.type) !== -1) || move.type === attacker.tera_type) {
                if (attacker.ability === "Adaptability" && move.type === attacker.tera_type) {
                    stabMod = 0x2000;
                    description.attackerAbility = attacker.ability;
                } else {
                    stabMod = 0x1800;
                }
            }
        }
        else if (attacker.isTerastalize && (move.getsStellarBoost || attacker.name === 'Terapagos-Stellar')) { //Tera Type being Stellar is implicit
            if (attacker.hasType(move.type) || (move.combinePledge && move.combinePledge !== move.name)) {
                stabMod = 0x2000;
            }
            else {
                stabMod = 0x1333;
            }
            if (attacker.name !== 'Terapagos-Stellar') description.stellarBoost = true;
        }
        else { //Covers for non-terastalized and Stellar being used up
            if (attacker.hasType(move.type) || (move.combinePledge && move.combinePledge !== move.name)) {
                if (attacker.ability === "Adaptability") {
                    stabMod = 0x2000;
                    description.attackerAbility = attacker.ability;
                } else {
                    stabMod = 0x1800;
                }
            } else if (["Protean", "Libero"].indexOf(attacker.ability) !== -1 && (gen < 9 || attacker.abilityOn)) {
                stabMod = 0x1800;
                description.attackerAbility = attacker.ability;
            }
        }
    }
    var applyBurn = (attacker.status === "Burned" && move.category === "Physical" && attacker.ability !== "Guts" && !move.ignoresBurn);
    description.isBurned = applyBurn;
    var finalMod;
    [finalMod, description] = calcFinalMods(move, attacker, defender, field, description, isCritical, typeEffectiveness, defAbility);
    finalMods = chainMods(finalMod);
    var reSortDamage = false;

    var damage = [], additionalDamage = [], allDamage = [];
    var minDamageValue = 85;    //this has been made into a value in case of any more damage roll alterations

    //GENERAL MODS CONTINUED
    for (var i = 0; i + minDamageValue <= 100; i++) { //e. Rand mod
        damage[i] = Math.floor(baseDamage * (minDamageValue + i) / 100);
        //f. STAB mod (with Terastal changes)
        damage[i] = pokeRound(damage[i] * stabMod / 0x1000);
        //g. Type Effect mod
        damage[i] = Math.floor(damage[i] * typeEffectiveness);
        //h. Burn mod
        if (applyBurn) {
            damage[i] = Math.floor(damage[i] / 2);
        }
        //i. Final mods
        damage[i] = pokeRound(damage[i] * finalMods / 0x1000);
        //j. Z-move and Max move protecting mod
        if (isQuarteredByProtect) {
            damage[i] = pokeRound(damage[i] * 0x400 / 0x1000);
            description.isQuarteredByProtect = true;
        }
        //k. Damage Reduction (LEGENDS Z-A ONLY)
        if (gen == 9.5) {
            damage[i] = Math.floor(Math.floor(damage[i] * 70) / 100);
        }
        //l. Min Damage Check
        damage[i] = Math.max(1, damage[i]);
        //m. Max Damage Check
        if (damage[i] > 65535) {
            damage[i] %= 65536;
            reSortDamage = true;
        }
    }

    if (reSortDamage) {
        damage.sort(numericSort);
    }

    //if (defAbility === 'Sand Spit' && field.weather !== 'Sand' && !(['Harsh Sun', 'Heavy Rain', 'Strong Winds'].includes(defAbility))) {
    //    field.weather = 'Sand';
    //}
    //else if (defAbility === 'Seed Sower' && field.terrain !== 'Grassy') {
    //    field.terrain = 'Grassy';
    //}

    if (!move.isNextMove) {
        var addQualList = checkAddCalcQualifications(attacker, defender, move, field, hitsPhysical);
        var addCalcQualified = false;
        for (check in addQualList) {
            if (addQualList[check]) {
                addCalcQualified = true;
                break;
            }
        }
        if (addCalcQualified) {
            additionalDamage = additionalDamageCalcs(attacker, defender, move, field, description, addQualList);
            allDamage[0] = damage;
        }
        else
            allDamage = damage;
        if (additionalDamage.length) {
            for (var i = 0; i < additionalDamage.length; i++) {
                allDamage[i + 1] = additionalDamage[i];
            }
        }
    }
    else
        allDamage = damage;

    return {
        "damage": allDamage,
        "description": buildDescription(description)
    };
}

//9. Finals Damage Mods
function calcFinalMods(move, attacker, defender, field, description, isCritical, typeEffectiveness, defAbility) {
    var finalMods = [];
    //a. Screens/Aurora Veil
    if (field.isAuroraVeil && !isCritical && !move.ignoresScreens) {
        finalMods.push(field.format !== "Singles" ? 0xAAC : 0x800);
        description.isAuroraVeil = true;
    }
    else if (field.isReflect && move.category === "Physical" && !isCritical && !move.ignoresScreens) {  //Note: Reflect/Light Screen stop physical/special moves respectively, NOT moves that hit physical/special
        finalMods.push(field.format !== "Singles" ? 0xAAC : 0x800);
        description.isReflect = true;
    } else if (field.isLightScreen && move.category === "Special" && !isCritical) {
        finalMods.push(field.format !== "Singles" ? 0xAAC : 0x800);
        description.isLightScreen = true;
    }
    if (defender.isDynamax) description.isDynamax = true;
    //b. Neuroforce
    if (attacker.ability === "Neuroforce" && typeEffectiveness > 1) {
        finalMods.push(0x1400);
        description.attackerAbility = attacker.ability;
    }
    //c. Collision Course/Electro Drift
    if (["Collision Course", "Electro Drift"].indexOf(move.name) !== -1 && typeEffectiveness > 1) {
        finalMods.push(0x1555);
        description.courseDriftSE = true;
    }
    //d. Sniper
    if (attacker.ability === "Sniper" && isCritical) {
        finalMods.push(0x1800);
        description.attackerAbility = attacker.ability;
    }
    //e. Tinted Lens
    if (attacker.ability === "Tinted Lens" && typeEffectiveness < 1) {
        finalMods.push(0x2000);
        description.attackerAbility = attacker.ability;
    }
    //f. Dynamax Cannon, Behemoth Blade, Behemoth Bash
    if ((move.name === "Dynamax Cannon" || move.name === "Behemoth Blade" || move.name === "Behemoth Bash") && defender.isDynamax) {
        finalMods.push(0x2000);
    }
    //g. Multiscale, Shadow Shield
    if ((defAbility === "Multiscale" || defAbility == "Shadow Shield") && defender.curHP === defender.maxHP) {
        finalMods.push(0x800);
        description.defenderAbility = defAbility;
    }
    //h. Fluffy (contact)
    if (defAbility === "Fluffy" && move.makesContact) {
        finalMods.push(0x800);
        description.defenderAbility = defAbility;
    }
    //i. Punk Rock
    if (defAbility === "Punk Rock" && move.isSound) {
        finalMods.push(0x800);
        description.defenderAbility = defAbility;
    }
    //j. Ice Scales
    if (defAbility === "Ice Scales" && move.category === "Special"){
        finalMods.push(0x800);
        description.defenderAbility = defAbility;
    }
    //k. Friend Guard
    if (field.isFriendGuard && !move.ignoresFriendGuard) {
        finalMods.push(0xC00);
        description.isFriendGuard = true;
    }
    //l. Solid Rock, Filter, Prism Armor
    if ((defAbility === "Solid Rock" || defAbility === "Filter" || defAbility === "Prism Armor") && typeEffectiveness > 1) {
        finalMods.push(0xC00);
        description.defenderAbility = defAbility;
    }
    //m. Metronome item
    //n. Fluffy (fire moves)
    if (defAbility === "Fluffy" && move.type === "Fire") {
        finalMods.push(0x2000);
        description.defenderAbility = defAbility;
    }
    //o. Expert Belt
    if (attacker.item === "Expert Belt" && typeEffectiveness > 1) {
        finalMods.push(0x1333);
        description.attackerItem = attacker.item;
    } //p. Life Orb
    else if (attacker.item === "Life Orb") {
        finalMods.push(0x14CC);
        description.attackerItem = attacker.item;
    }
    //q. Resist Berries
    if (getBerryResistType(defender.item) === move.type && (typeEffectiveness > 1 || move.type === "Normal") &&
        attacker.ability !== "Unnerve" && attacker.ability !== "As One") {
        if (defAbility === "Ripen") {
            finalMods.push(0x400);
            description.defenderAbility = defAbility;
        }
        else {
            finalMods.push(0x800);
        }
        description.defenderItem = defender.item;
        defender.consumeResistBerry = true;
    }
    //r. Doubled damage (These likely won't be added since Minimize/Dig/Dive are hardly ever used)
    //r.i. Body Slam, Stomp, Dragon Rush, Steamroller, Heat Crash, Heavy Slam, Flying Press, Malicious Moonsault
    //r.ii. Earthquake
    //r.iii. Surf, Whirlpool

    //MECHANICS TESTING
    if (attacker.hasCustomModifiers && attacker.customModifiers['fnMods']) {
        let customFinalMods = attacker.customModifiers['fnMods'];
        for (let i = 0; i < customFinalMods.length; i++) {
            finalMods.push(customFinalMods[i]);
        }
        description.isMechanicsTest = true;
    }

    return [finalMods, description];
}

//All conditions I can think of:
//-Using Triple Kick/Axel (move changes BP depending on which # kick it's on)
//-Resist berries (only active for the first hit)
//-Attacking with Parental Bond ("child" damage is a reduced general mod)
//-Multiscale/Shadow Shield (first hit deals reduced damage)
//-Stamina (each physical hit increases Defense until it reaches +6; yes it's any hit when playing but only physical hits are relevant in the calc)
//-Kee/Maranga Berry (first hit increases Defense/Special Defense by +1)
//-Weak Armor (each physical hit decreases Defense until it reaches -6)
//-Gooey/Tangling Hair (contact moves decreases attacker's Speed, only relevant for Defiant)
//-Cotton Down (any move decreases attacker's Speed, only relevant for Defiant)
//-Spicy Spray (any move burns the target, matters for physical moves and Flare Boost)
//Current implementation has all of the above use cases
//Not implemented (and no plans to do so in the near future):
//-Sand Spit/Seed Sower
//-Liechi/Ganlon/Petaya/Grepa/Salac Berries
//-Crush Grip/Wring Out
function checkAddCalcQualifications(attacker, defender, move, field, hitsPhysical) {
    var addQualList = {
        triple: false,
        resistBerry: false,
        multiscale: false,
        weakArmor: false,
        parentalBond: attacker.ability === "Parental Bond" && move.hits === 1 && !move.hitRange && (field.format === "Singles" || !move.isSpread),
        gooey: false,
        kee: false,
        maranga: false,
        moss: false,
        stamina: false,
        spicySpray: false,
    };
    if (move.hits > 1 || addQualList['parentalBond']) {
        addQualList['triple'] = move.isTripleHit && !addQualList['parentalBond'];
        addQualList['resistBerry'] = defender.consumeResistBerry;
        addQualList['multiscale'] = ['Multiscale', 'Shadow Shield'].includes(defender.ability) && defender.curHP === defender.maxHP;
        addQualList['weakArmor'] = defender.ability === 'Weak Armor' && hitsPhysical && defender.boosts[DF] > -6;
        addQualList['gooey'] = (['Gooey', 'Tangling Hair'].includes(defender.ability) && move.makesContact) || defender.ability === 'Cotton Down' && (['Defiant', 'Competitive'].includes(attacker.ability) || ['Electro Ball', 'Gyro Ball'].includes(move.name)) && defender.boosts[SP] > -6;
        addQualList['kee'] = defender.item === 'Kee Berry' && hitsPhysical && defender.boosts[DF] < 6;
        addQualList['maranga'] = defender.item === 'Maranga Berry' && !hitsPhysical && defender.boosts[SD] < 6;
        addQualList['moss'] = defender.item === 'Luminous Moss' && move.type == 'Water' && !hitsPhysical && defender.boosts[SD] < 6;
        addQualList['stamina'] = defender.ability === 'Stamina' && hitsPhysical && defender.boosts[DF] < 6;
        addQualList['spicySpray'] = defender.ability === 'Spicy Spray' && (attacker.ability === 'Flare Boost' || move.category === 'Physical') && canBeBurned(attacker, move, field);
    }
    return addQualList;
}

function canBeBurned(attacker, move, field) {
    return attacker.status != 'Burned' && !(attacker.hasType('Fire')) && !(['Protean', 'Libero'].includes(attacker.ability) && attacker.abilityOn && move.type == 'Fire')
        && !(attacker.ability == 'Leaf Guard' && field.weather.includes('Sun')) && !(['Water Veil', 'Water Bubble', 'Comatose', 'Thermal Exchange', 'Purifying Salt'].includes(attacker.ability))
        && (field.terrain != 'Misty' || !pIsGrounded(attacker, field));
}

//Inefficient for what it does now but should be a good setup for when more conditions are added
function additionalDamageCalcs(attacker, defender, move, field, description, addQualList) {
    var nextAttacker = JSON.parse(JSON.stringify(attacker)), nextDefender = JSON.parse(JSON.stringify(defender)), nextMove = JSON.parse(JSON.stringify(move));
    //Adding hasType function back in since the deep copy loses it
    nextAttacker.hasType = setHasTypeFunc;
    nextDefender.hasType = setHasTypeFunc;
    var allAdditionalDamages = [];
    var uniqueHits = 1;     //Keeps track of the number of unique hits that need to be calculated, done to minimize redundant function calls
    if (addQualList['parentalBond']) {
        nextAttacker.ability = '';
        nextAttacker.isChild = true;
        nextMove = move;

        if (moves[move.name]['statChange']) {
            var statChange = moves[move.name]['statChange'];
            var affectedStat, numStages = statChange[1], recipient = statChange[2] === 'user' ? nextAttacker : nextDefender;
            switch (statChange[0]) {
                case 'attack':
                    affectedStat = AT;
                    break;
                case 'defense':
                    affectedStat = DF;
                    break;
                case 'special attack':
                    affectedStat = SA;
                    break;
                case 'special defense':
                    affectedStat = SD;
                    break;
            }
            if (numStages > 0) {
                recipient.boosts[affectedStat] = Math.min(6, recipient.boosts[affectedStat] + numStages);
                //recipient = changeStatBoosts([recipient], affectedStat, numStages);
            }
            else {  //TODO: check opponent for: clear/full metal body/white smoke, hyper cutter/big pecks, amulet/cloak, simple, contrary, mirror armor
                recipient.boosts[affectedStat] = Math.max(-6, recipient.boosts[affectedStat] + numStages);
            }
            recipient.stats[affectedStat] = getModifiedStat(recipient.rawStats[affectedStat], recipient.boosts[affectedStat]);
        }
        else if (move.name === 'Assurance') {
            nextMove.isDouble = 1;
        }
        description.attackerAbility = attacker.ability;
        move.hits = 2;  //this persists for properly displaying .result-move and for calculations with function getKOChanceText()
        uniqueHits = 2;
        description.hits = move.hits;
    }
    else if (addQualList['triple']) {
        uniqueHits = move.hits;
    }
    if (addQualList['multiscale']) {
        nextDefender.ability = '';
        if (uniqueHits === 1) {
            uniqueHits = 2;
        }
    }
    else if (addQualList['weakArmor']) {
        uniqueHits = Math.max(uniqueHits, Math.min(-1 * (-6 - defender.boosts[DF]) + 1, move.hits), Math.min(Math.ceil((6 - defender.boosts[SP]) / 2) + 1, move.hits));
        description.defenderAbility = defender.ability;
    }
    else if (addQualList['gooey']) {
        uniqueHits = Math.max(uniqueHits, Math.min(-1 * (-6 - attacker.boosts[SP]) + 1, move.hits));
        description.defenderAbility = defender.ability;
        if (['Defiant', 'Competitive'].includes(attacker.ability)) {
            var boostStat = attacker.ability === 'Defiant' ? AT : SA;
            uniqueHits = Math.max(uniqueHits, Math.min(Math.ceil((6 - attacker.boosts[boostStat]) / 2) + 1, move.hits));
            description.attackerAbility = attacker.ability;
        }
    }
    else if (addQualList['stamina']) {
        uniqueHits = Math.max(uniqueHits, Math.min(6 - defender.boosts[DF] + 1, move.hits));
        description.defenderAbility = defender.ability;
    }
    else if (addQualList['spicySpray']) {
        var burnHealConsumed = false;
        if (['Rawst Berry', 'Lum Berry'].includes(attacker.item)) {
            burnHealConsumed = true;
            description.attackerItem = attacker.item;
            if (move.hits >= 3) {
                uniqueHits = 3;
            }
        }
        else {
            nextAttacker.status = 'Burned';
            if (uniqueHits == 1) {
                uniqueHits = 2;
            }
        }
        description.defenderAbility = defender.ability;
    }
    if (addQualList['kee']) {
        nextDefender.boosts[DF] = Math.min(6, nextDefender.boosts[DF] + 1);
        nextDefender.stats[DF] = getModifiedStat(nextDefender.rawStats[DF], nextDefender.boosts[DF]);
        if (uniqueHits === 1) {
            uniqueHits = 2;
        }
        description.defenderItem = defender.item;
    }
    else if (addQualList['maranga'] || addQualList['moss']) {
        nextDefender.boosts[SD] = Math.min(6, nextDefender.boosts[SD] + 1);
        nextDefender.stats[SD] = getModifiedStat(nextDefender.rawStats[SD], nextDefender.boosts[SD]);
        if (uniqueHits === 1) {
            uniqueHits = 2;
        }
        description.defenderItem = defender.item;
    }
    else if (addQualList['resistBerry']) {
        nextDefender.item = '';
        if (uniqueHits === 1) {
            uniqueHits = 2;
        }
    }
    nextMove.isNextMove = true;

    for (var i = 0; i < uniqueHits - 1; i++) {
        if (addQualList['gooey']) {
            nextAttacker.boosts[SP] = Math.max(-6, attacker.boosts[SP] - 1);
            nextAttacker.stats[SP] = getModifiedStat(nextAttacker.rawStats[SP], nextAttacker.boosts[SP]);
            if (['Defiant', 'Competitive'].includes(attacker.ability)) {
                boostStat = attacker.ability === 'Defiant' ? AT : SA;
                nextAttacker.boosts[boostStat] = Math.min(6, attacker.boosts[boostStat] + 2);
                nextAttacker.stats[boostStat] = getModifiedStat(nextAttacker.rawStats[boostStat], nextAttacker.boosts[boostStat]);
            }
        }
        else if (addQualList['weakArmor']) {
            nextDefender.boosts[SP] = Math.min(6, nextDefender.boosts[SP] + 2);
            nextDefender.stats[SP] = getModifiedStat(nextDefender.rawStats[SP], nextDefender.boosts[SP]);
            nextDefender.boosts[DF] = Math.max(-6, nextDefender.boosts[DF] - 1);
            nextDefender.stats[DF] = getModifiedStat(nextDefender.rawStats[DF], nextDefender.boosts[DF]);
        }
        else if (addQualList['stamina']) {
            nextDefender.boosts[DF] = Math.min(6, nextDefender.boosts[DF] + 1);
            nextDefender.stats[DF] = getModifiedStat(nextDefender.rawStats[DF], nextDefender.boosts[DF]);
        }
        if (addQualList['triple']) {
            nextMove.currTripleHit = i + 2;
        }
        allAdditionalDamages[i] = GET_DAMAGE_HANDLER(nextAttacker, nextDefender, nextMove, field).damage;
        if (burnHealConsumed && addQualList['spicySpray']) {
            burnHealConsumed = false;
            nextAttacker.item = '';
            nextAttacker.status = 'Burned';
        }
    }
    return allAdditionalDamages;
}


/* Damage calculation for the side game: Champions;
 * for the Generation IX games: Scarlet, Violet, and Legends: Z-A;
 * for the Generation VIII games: Sword, Shield, Brilliant Diamond, and Shining Pearl;
 * and for the Generation VII games: Sun, Moon, Ultra Sun, and Ultra Moon */

function CALCULATE_ALL_MOVES_SV(p1, p2, field) {
    checkTrace(p1, p2);
    checkTrace(p2, p1);
    checkNeutralGas(p1, p2, field.getNeutralGas());
    checkAirLock(p1, field);
    checkAirLock(p2, field);
    checkForecast(p1, field.getWeather());
    checkForecast(p2, field.getWeather());
    checkMimicry(p1, field.getTerrain());
    checkMimicry(p2, field.getTerrain());
    checkTerastal(p1);
    checkTerastal(p2);
    checkKlutz(p1);
    checkKlutz(p2);
    checkEvo(p1, p2);
    checkParadoxAbilities(p1, field.getTerrain(), field.getWeather());
    checkParadoxAbilities(p2, field.getTerrain(), field.getWeather());
    checkSeeds(p1, field.getTerrain());
    checkSeeds(p2, field.getTerrain());
    checkSwordShield(p1);
    checkSwordShield(p2);
    checkWindRider(p1, field.getTailwind(0));
    checkWindRider(p2, field.getTailwind(1));
    checkIntimidate(p1, p2);
    checkIntimidate(p2, p1);
    checkSupersweetSyrup(p1, p2);
    checkSupersweetSyrup(p2, p1);
    checkDownload(p1, p2);
    checkDownload(p2, p1);
    checkEmbodyAspect(p1);
    checkEmbodyAspect(p2);
    checkBattleBond(p1);
    checkBattleBond(p2);
    p1.stats[AT] = getModifiedStat(p1.rawStats[AT], p1.boosts[AT]); //new order is important for the proper Protosynthesis/Quark Drive boost
    p1.stats[DF] = getModifiedStat(p1.rawStats[DF], p1.boosts[DF]);
    p1.stats[SA] = getModifiedStat(p1.rawStats[SA], p1.boosts[SA]);
    p1.stats[SD] = getModifiedStat(p1.rawStats[SD], p1.boosts[SD]);
    p1.stats[SP] = getModifiedStat(p1.rawStats[SP], p1.boosts[SP]);
    setHighestStat(p1, 0);
    p1.stats[SP] = getFinalSpeed(p1, field.getWeather(), field.getTailwind(0), field.getSwamp(0), field.getTerrain());
    
    p2.stats[AT] = getModifiedStat(p2.rawStats[AT], p2.boosts[AT]);
    p2.stats[DF] = getModifiedStat(p2.rawStats[DF], p2.boosts[DF]);
    p2.stats[SA] = getModifiedStat(p2.rawStats[SA], p2.boosts[SA]);
    p2.stats[SD] = getModifiedStat(p2.rawStats[SD], p2.boosts[SD]);
    p2.stats[SP] = getModifiedStat(p2.rawStats[SP], p2.boosts[SP]);
    setHighestStat(p2, 1);
    p2.stats[SP] = getFinalSpeed(p2, field.getWeather(), field.getTailwind(1), field.getSwamp(1), field.getTerrain());
    
    var side1 = field.getSide(1);
    var side2 = field.getSide(0);
    checkInfiltrator(p1, side1);
    checkInfiltrator(p2, side2);
    getWeightMods(p1, p2);
    var results = [[],[]];
    for (var i = 0; i < 4; i++) {
        results[0][i] = GET_DAMAGE_SV(p1, p2, p1.moves[i], side1);
        results[1][i] = GET_DAMAGE_SV(p2, p1, p2.moves[i], side2);
        if (gen == 9.5) {
            results[0][i].cooldown = getMoveCooldown(p1, p1.moves[i]);
            results[1][i].cooldown = getMoveCooldown(p2, p2.moves[i]);
        }
    }
    return results;
}

function GET_DAMAGE_SV(attacker, defender, move, field) {
    var moveDescName = move.name;
    var isQuarteredByProtect = false, isMeFirst = false;

    var attIsGrounded = pIsGrounded(attacker, field);
    var defIsGrounded = pIsGrounded(defender, field);

    if (move.name == 'Me First')
        [move, moveDescName, isMeFirst] = checkMeFirst(move, moveDescName, defender, attacker.isDynamax);

    checkMoveTypeChange(move, field, attacker);
    checkConditionalPriority(move, field.terrain, attacker, attIsGrounded);
    checkConditionalSpread(move, field.terrain, attacker, attIsGrounded);

    if (attacker.isDynamax && gen === 8)    //without the gen check a Dynamaxed Pokemon can lead to an error switching between gen 8 and either 7 or 9
        [move, isQuarteredByProtect, moveDescName] = MaxMoves(move, attacker, isQuarteredByProtect, moveDescName, field);
    else if (move.name == "Nature Power" && attacker.item !== 'Assault Vest')
        [move, moveDescName] = NaturePower(move, field, moveDescName);

    if (move.isZ || move.isSignatureZ)
        [move, moveDescName] = ZMoves(move, field, attacker, moveDescName);

    //Needs to be after the Z-move check since Light That Burns The Sky can change category
    if (usesPhysicalAttack(attacker, defender, move)) {
        move.category = "Physical";
    }

    //Placed here so 1) Me First moves get contact, and 2) physical Shell Side Arm gets contact
    checkContactOverride(move, attacker);

    attacker_name = attacker.name;
    if (attacker_name && attacker_name.includes("-Gmax")) attacker_name = attacker_name.substring(0, attacker_name.indexOf('-Gmax'));
    defender_name = defender.name;
    if (defender_name && defender_name.includes("-Gmax")) defender_name = defender_name.substring(0, defender_name.indexOf('-Gmax'));

    var description = {
        "attackerName": attacker_name,
        "moveName": moveDescName,
        "defenderName": defender_name
    };

    isQuarteredByProtect = setIsQuarteredByProtect(attacker, defender, field, move, description);

    addLevelDesc(attacker, defender, description);

    if (move.bp === 0 || move.category === "Status") {
        return statusMoves(move, attacker, defender, description);
    }

    description.attackerTera = attacker.isTerastalize ? attacker.tera_type : false;
    description.defenderTera = defender.isTerastalize ? defender.tera_type : false;

    var defAbility = defender.ability;
    [defAbility, description] = abilityIgnore(attacker, move, defAbility, description, defender.item);

    var isCritical = critMove(move, defAbility);

    var ateIzeBoosted;
    if (!move.isZ && (TYPE_CHANGE_BOOST_ABILITIES.includes(attacker.ability) || attacker.ability == "Liquid Voice")
        && !(['Hidden Power', 'Weather Ball', 'Natural Gift', 'Judgement', 'Techno Blast', 'Revelation Dance', 'Multi-Attack', 'Terrain Pulse'].includes(move.name))) {
        [move, description, ateIzeBoosted] = checkAbilityTypeChange(move, attacker, description);
    }

    var typeEffectiveness = getMoveEffectiveness(move, defender.type1, defender.type2, description, field.isForesight, ["Scrappy", "Mind's Eye"].includes(attacker.ability) ? attacker.ability : false, field.isGravity, defender.item, field.weather === "Strong Winds", defender.isTerastalize, defAbility === 'Tera Shell' && defender.curHP === defender.maxHP);
    immuneBuildDesc = immunityChecks(move, attacker, defender, field, description, defAbility, typeEffectiveness);
    if (immuneBuildDesc !== -1) return immuneBuildDesc;

    getHPInfo(description, defender);

    setDamageBuildDesc = setDamage(move, attacker, defender, description, isQuarteredByProtect, field);
    if (setDamageBuildDesc !== -1) return setDamageBuildDesc;

    if (move.hitRange && !(move.isPlusMove && move.plusEffects && move.plusEffects.hitRange == 1)) {
        description.hits = move.hits;
    }
    var turnOrder = attacker.stats[SP] > defender.stats[SP] ? "FIRST" : "LAST";

    ////////////////////////////////
    ////////// BASE POWER //////////
    ////////////////////////////////
    var basePower;
    [basePower, description] = basePowerFunc(move, description, turnOrder, attacker, defender, field, attIsGrounded, defIsGrounded, defAbility);

    var bpMods;
    [bpMods, description, move] = calcBPMods(attacker, defender, field, move, description, ateIzeBoosted, basePower, attIsGrounded, defIsGrounded, turnOrder, defAbility, isMeFirst);

    basePower = Math.max(1, pokeRound(basePower * chainMods(bpMods) / 0x1000));

    ////////////////////////////////
    ////////// (SP)ATTACK //////////
    ////////////////////////////////

    var attack;
    [attack, description] = calcAttack(move, attacker, defender, description, isCritical, defAbility);

    var atMods;
    [atMods, description] = calcAtMods(move, attacker, defAbility, description, field);

    attack = Math.max(1, pokeRound(attack * chainMods(atMods) / 0x1000));

    ////////////////////////////////
    ///////// (SP)DEFENSE //////////
    ////////////////////////////////
    var hitsPhysical = move.category === "Physical" || move.dealsPhysicalDamage;

    var defense;
    [defense, description] = calcDefense(move, attacker, defender, description, hitsPhysical, isCritical, field);

    var dfMods;
    [dfMods, description] = calcDefMods(move, defender, field, description, hitsPhysical, defAbility);

    defense = Math.max(1, pokeRound(defense * chainMods(dfMods) / 0x1000));

    ////////////////////////////////
    //////////// DAMAGE ////////////
    ////////////////////////////////
    var baseDamage = calcBaseDamage(attacker, basePower, attack, defense);


    return calcGeneralMods(baseDamage, move, attacker, defender, defAbility, field, description, isCritical, typeEffectiveness, isQuarteredByProtect, hitsPhysical);
}


function getKOChanceText(damageIn, move, defender, field, isBadDreams, isItemlessAttacker = false) {
    if (isNaN(damageIn[0]) && !Array.isArray(damageIn[0])) {
        return 'something broke; please tell nerd of now';
    }
    if (move.name == "Pain Split" && !move.painMax) {
        return 'The battlers shared their pain!';
    }
    if (move.category == "Status" && ['Me First', '(No Move)'].indexOf(move.name) == -1) {
        return "It's a status move, it won't deal damage.";
    }
    if (damageIn[damageIn.length - 1] === 0) {
        if (field.weather === "Harsh Sun" && move.type === "Water") {
            return 'the Water-Type attack evaporated in the harsh sunlight';
        } else if (field.weather === "Heavy Rain" && move.type === "Fire") {
            return 'the Fire-Type attack fizzled out in the heavy rain';
        }
        return 'No damage for you';
    }
    let preventsHeal = move.name == 'Psychic Noise';
    let preventsHealItem = ['Knock Off', 'Psychic Noise'].includes(move.name) || (['Thief', 'Covet'].includes(move.name) && isItemlessAttacker);
    let preventsRestoreHP = preventsHealItem || (defender.item.includes(' Berry') && ['Bug Bite', 'Pluck', 'Incinerate'].includes(move.name));
    var restoreHP = getRestoreHP(defender.item, defender.maxHP, preventsRestoreHP);
    var isRipen = applyRipen(defender.ability == "Ripen", defender.item, restoreHP);
    if (isRipen) {
        restoreHP *= 2;
    }
    var isGluttony, restoreThreshold;
    [restoreThreshold, isGluttony] = getRestoreThreshold(defender.item, restoreHP, defender.maxHP, defender.ability == "Gluttony");
    if (defender.isDynamax) {
        restoreThreshold *= 0.5;
    }
    let tempHits = 0;   //exists specifically for the damage results text in gen 1

    if (gen == 1 && move.hits > 1) {
        damageIn = handleMultiHitGen1(damageIn, move.hits);
        tempHits = move.hits;
        move.hits = 1;
    }
    var multihit = move.hits > 1 || (damageIn.length > 1 && Array.isArray(damageIn[0]));

    //convert each array to a dictionary here
    var damage = damageArrToDict(damageIn, move.hits, defender.curHP, restoreHP, restoreThreshold), damageNums = [];
    if (tempHits) {
        move.hits = tempHits;
    }
    for (eachVal in damage) {
        damageNums.push(parseInt(eachVal));
    }

    if ((!multihit || !restoreHP) && damage[damageNums[0]] >= defender.curHP) {
        return 'guaranteed OHKO';
    }
    else if (multihit && restoreHP && damage[damageNums[0]] >= defender.curHP + restoreHP) {
        return 'guaranteed OHKO';
    }

    var hazards = 0;
    var hazardText = [];
    if (field.isSR && defender.ability !== 'Magic Guard' && defender.item !== "Heavy-Duty Boots") {
        var effectiveness = typeChart['Rock'][defender.type1] * (defender.type2 ? typeChart['Rock'][defender.type2] : 1);
        hazards += Math.max(1, Math.floor(effectiveness * defender.maxHP / 8));
        hazardText.push('Stealth Rock');
    }
    if (field.isSteelsurge && defender.ability !== 'Magic Guard' && defender.item !== "Heavy-Duty Boots") {
        var effectiveness = typeChart['Steel'][defender.type1] * (defender.type2 ? typeChart['Steel'][defender.type2] : 1);
        hazards += Math.max(1, Math.floor(effectiveness * defender.maxHP / 8));
        hazardText.push('Steelsurge');
    }
    if (pIsGrounded(defender, field) && defender.ability !== 'Magic Guard' && defender.item !== "Heavy-Duty Boots") {
        if (field.spikes === 1) {
            hazards += Math.max(1, Math.floor(defender.maxHP / 8));
            if (gen === 2 || gen == 9.5) {
                hazardText.push('Spikes');
            } else {
                hazardText.push('1 layer of Spikes');
            }
        } else if (field.spikes === 2) {
            hazards += Math.floor(defender.maxHP / 6);
            hazardText.push('2 layers of Spikes');
        } else if (field.spikes === 3) {
            hazards += Math.floor(defender.maxHP / 4);
            hazardText.push('3 layers of Spikes');
        }
    }
    if (isNaN(hazards)) {
        hazards = 0;
    }

    var eot = 0;
    var eotText = [];
    var toxicCounter = 0;
    var eotDict = getAllEndOfTurnEffects(defender, field, isBadDreams, preventsHeal, preventsHealItem, preventsRestoreHP);
    let maxChip = defender.isDynamax ? 0.5 : 1;
    for (eotType in eotDict) {
        if (eotDict[eotType].val != 0) {
            if (eotDict[eotType].isToxic) {
                toxicCounter = eotDict[eotType].val;
                eot -= Math.floor(Math.floor(toxicCounter * defender.maxHP / 16) * maxChip);
            }
            else {
                eot += eotDict[eotType].val;
            }
            eotText.push(eotDict[eotType].text);
        }
    }

    var c = getKOChance(damage, multihit, defender.curHP - hazards, 0, 1, defender.maxHP, toxicCounter, restoreHP, restoreThreshold);
    var afterText = hazardText.length > 0 ? ' after ' + serializeText(hazardText) : '';
    var percNumText = '';
    if (c === 1) {
        return 'guaranteed OHKO' + afterText;
    }
    else if (c > 0 && eot >= 0) {
        if (c < 0.0001)
            percNumText = '<0.01';
        else if (c > 0.9999)
            percNumText = '>99.99';
        else
            percNumText = Math.round(c * 10000) / 100;
        return percNumText + '% chance to OHKO' + afterText;
    }

    if (restoreHP) {
        let eotTemp = '';
        if (isRipen) eotTemp += 'Ripen ';
        else if (isGluttony) eotTemp += 'Gluttony ';
        eotTemp += defender.item + ' recovery';
        eotText.push(eotTemp);
    }

    c = getKOChance(damage, multihit, defender.curHP - hazards, eot, 1, defender.maxHP, toxicCounter, restoreHP, restoreThreshold, maxChip, eotDict);
    afterText = hazardText.length > 0 || eotText.length > 0 ? ' after ' + serializeText(hazardText.concat(eotText)) : '';
    if (c === 1) {
        return 'guaranteed OHKO' + afterText;
    }
    else if (c > 0) {
        if (c < 0.0001)
            percNumText = '<0.01';
        else if (c > 0.9999)
            percNumText = '>99.99';
        else
            percNumText = Math.round(c * 10000) / 100;
        return percNumText + '% chance to OHKO' + afterText;
    }

    var i;
    for (i = 2; i <= 4; i++) {
        c = getKOChance(damage, multihit, defender.curHP - hazards, eot, i, defender.maxHP, toxicCounter, restoreHP, restoreThreshold, maxChip, eotDict);
        if (c === 1) {
            return 'guaranteed ' + i + 'HKO' + afterText;
        }
        else if (c > 0) {
            if (c < 0.0001)
                percNumText = '<0.01';
            else if (c > 0.9999)
                percNumText = '>99.99';
            else
                percNumText = Math.round(c * 10000) / 100;
            return percNumText + '% chance to ' + i + 'HKO' + afterText;
        }
    }

    for (i = 5; i <= 9; i++) {
        if (predictTotal(damageNums[0], eot, i, toxicCounter, defender.curHP - hazards, defender.maxHP, restoreHP, restoreThreshold) >= defender.curHP - hazards) {
            return 'guaranteed ' + i + 'HKO' + afterText;
        }
        else if (predictTotal(damageNums[damageNums.length - 1], eot, i, toxicCounter, defender.curHP - hazards, defender.maxHP, restoreHP, restoreThreshold) >= defender.curHP - hazards) {
            return 'possible ' + i + 'HKO' + afterText;
        }
    }

    return 'possibly the worst move ever';
}

function damageArrToDict(damageArr, hits, currHP, restoreHP, restoreThreshold) {
    var pivotSpread = {}, addedSpread = {}, tempSpread = {};
    var tempKey = 0, is2dArr = Array.isArray(damageArr[0]), damageArrL = damageArr.length;
    if (!(is2dArr && damageArrL > 1)) {
        pivotSpread = arrayToProbabilityDict(damageArr, currHP, restoreHP, restoreThreshold);
        addedSpread = pivotSpread;
    }
    else {
        pivotSpread = arrayToProbabilityDict(damageArr[1], currHP, restoreHP, restoreThreshold);
        addedSpread = arrayToProbabilityDict(damageArr[0], currHP, restoreHP, restoreThreshold);
    }
    for (var i = 0; i < hits - 1; i++) {
        if (is2dArr && i != 0) {
            //this if-else statement assumes that, if the number of 2D arrays is less than the number of hits, all of the remaining hits use the last array calculated
            if (damageArrL - 1 >= i + 1)
                pivotSpread = arrayToProbabilityDict(damageArr[i + 1], currHP, restoreHP, restoreThreshold);
            else
                pivotSpread = arrayToProbabilityDict(damageArr[damageArrL - 1], currHP, restoreHP, restoreThreshold);
        }
        for (addedNum in addedSpread) {
            let tempAddedNum = parseInt(addedNum);
            for (pivotNum in pivotSpread) {
                let tempPivotNum = parseInt(pivotNum);
                tempKey = tempPivotNum + tempAddedNum;
                if (checkThresholdCriteria(currHP, tempPivotNum, restoreHP, restoreThreshold, addedNum)) {
                    tempKey = tempKey + '*';
                }
                if (tempKey in tempSpread)
                    tempSpread[tempKey] = tempSpread[tempKey] + (pivotSpread[pivotNum] * addedSpread[addedNum]);
                else
                    tempSpread[tempKey] = pivotSpread[pivotNum] * addedSpread[addedNum];
            }
        }
        addedSpread = sortByKeys(tempSpread);
        tempSpread = {};
    }
    return addedSpread;
}

function arrayToProbabilityDict(arr, currHP, restoreHP, restoreThreshold) {
    let returnArr = {};
    let instanceUnit = 1 / (gen >= 3 ? 16 : 39);
    for (let i = 0; i < arr.length; i++) {
        let returnArrKey = arr[i];
        if (checkThresholdCriteria(currHP, returnArrKey, restoreHP, restoreThreshold)) {
            returnArrKey = returnArrKey + '*';
        }
        if (returnArrKey in returnArr)
            returnArr[returnArrKey] = returnArr[returnArrKey] + instanceUnit;
        else
            returnArr[returnArrKey] = instanceUnit;
    }
    return returnArr;
}

function numericSortParseInt(a, b) {
    return parseInt(a) - parseInt(b);
}

function sortByKeys(dict) {
    var sorted = [], tempDict = {};

    sorted = Object.keys(dict).sort(numericSortParseInt);
    for (let i = 0; i < sorted.length; i++)
        tempDict[sorted[i]] = dict[sorted[i]];

    return tempDict;
}

function getKOChance(damage, multihit, hp, eotSum, timesUsed, maxHP, toxicCounter, restoreHP, restoreThreshold, maxChip = 1, eotDict = {}) {
    var damageKeys = Object.keys(damage).sort(numericSortParseInt);
    let firstDamage = damageKeys[0];
    let lastDamage = damageKeys[damageKeys.length - 1];
    var minDamage = parseInt(firstDamage);
    var maxDamage = parseInt(lastDamage);
    var activateHealItem = false;
    let tempSpread = {};
    if (timesUsed === 1) {
        if (((!multihit && lastDamage[lastDamage.length - 1] != '*') || !restoreHP) && maxDamage - eotSum < hp) {
            return 0;
        }
        else if ((multihit || lastDamage[lastDamage.length - 1] == '*') && restoreHP && maxDamage - eotSum < hp + restoreHP) {
            return 0;
        }
        else if (((!multihit && firstDamage[firstDamage.length - 1] != '*') || !restoreHP) && minDamage - eotSum >= hp) {
            return 1;
        }
        else if ((multihit || firstDamage[firstDamage.length - 1] == '*') && restoreHP && minDamage - eotSum >= hp + restoreHP) {
            return 1;
        }
    }
    for (damageNum of damageKeys) {
        let tempDamageNum = parseInt(damageNum);
        activateHealItem = damageNum[damageNum.length - 1] == '*';
        if (eotSum) {
            [tempDamageNum, activateHealItem] = eotProcess(eotDict, tempDamageNum, toxicCounter, hp, restoreHP, restoreThreshold, maxHP, activateHealItem, maxChip);
        }
        if (activateHealItem) {
            tempDamageNum = tempDamageNum + '*';
        }
        if (tempDamageNum in tempSpread)
            tempSpread[tempDamageNum] = tempSpread[tempDamageNum] + damage[damageNum];
        else
            tempSpread[tempDamageNum] = damage[damageNum];
    }
    toxicCounter++;
    if (timesUsed == 1) {
        let tempSpreadKeysSorted = Object.keys(tempSpread).sort(numericSortParseInt);
        if (parseInt(tempSpreadKeysSorted[tempSpreadKeysSorted.length - 1]) >= hp) {
            let earlyTotalSpread = {};
            let returnSum = 0, probabilitySum = 0;
            for (spreadNum of tempSpreadKeysSorted) {
                let earlyItemConsumed = spreadNum[spreadNum.length - 1] == '*';
                let earlyFinalNum = parseInt(spreadNum);
                if (earlyItemConsumed) {
                    earlyFinalNum -= restoreHP;
                    if (hp - earlyFinalNum > maxHP) {
                        earlyFinalNum = hp - maxHP;    //conditional always fails if earlyFinalNum >= 0
                    }
                }
                if (earlyItemConsumed && earlyFinalNum in earlyTotalSpread) {
                    earlyTotalSpread[earlyFinalNum] += tempSpread[spreadNum];
                }
                else {
                    earlyTotalSpread[earlyFinalNum] = tempSpread[spreadNum];
                }
            }
            for (finalNum in earlyTotalSpread) {
                if (parseInt(finalNum) >= hp)
                    returnSum += earlyTotalSpread[finalNum];
                probabilitySum += earlyTotalSpread[finalNum];
            }
            if (returnSum === probabilitySum)
                returnSum = 1;
            return returnSum;
        }
        return 0;
    }
    tempSpread = sortByKeys(tempSpread);
    var sum = verifyKOChance(damage, hp, eotSum, timesUsed, maxHP, toxicCounter, restoreHP, restoreThreshold, eotDict, maxChip, tempSpread);
    return sum;
}

function verifyKOChance(damage, targetHP, eotSum, timesUsed, maxHP, toxicCounter, restoreHP, restoreThreshold, eotDict, maxChip, inSpread = damage) {
    var pivotSpread = {}, addedSpread = {}, tempSpread = {}, totalSpread = {};
    var tempKey = 0, finalNum = 0;
    var returnSum = 0, probabilitySum = 0;
    let activateHealItem = false;
    pivotSpread = damage;
    addedSpread = inSpread;
    for (var i = 0; i < timesUsed - 1; i++) {
        for (addedNum in addedSpread) {
            let tempAddedNum = parseInt(addedNum);
            for (pivotNum in pivotSpread) {
                let tempPivotNum = parseInt(pivotNum);
                tempKey = tempPivotNum + tempAddedNum;
                if (checkThresholdCriteria(targetHP, tempPivotNum, restoreHP, restoreThreshold, addedNum)) {
                    activateHealItem = true;
                }
                if (eotSum) {
                    [tempKey, activateHealItem] = eotProcess(eotDict, tempKey, toxicCounter, targetHP, restoreHP, restoreThreshold, maxHP, activateHealItem, maxChip);
                }
                if (activateHealItem) {
                    tempKey = tempKey + '*';
                }
                activateHealItem = false;

                if (tempKey in tempSpread)
                    tempSpread[tempKey] = tempSpread[tempKey] + (pivotSpread[pivotNum] * addedSpread[addedNum]);
                else
                    tempSpread[tempKey] = pivotSpread[pivotNum] * addedSpread[addedNum];
            }
        }
        addedSpread = sortByKeys(tempSpread);
        tempSpread = {};
    }
    for (spreadNum in addedSpread) {
        let itemConsumed = spreadNum[spreadNum.length - 1] == '*';
        finalNum = parseInt(spreadNum);
        if (itemConsumed && timesUsed > 1) {
            finalNum -= restoreHP;
            if (targetHP - finalNum > maxHP) {
                finalNum = targetHP - maxHP;    //conditional always fails if finalNum >= 0
            }
        }
        if (itemConsumed && finalNum in totalSpread) {
            totalSpread[finalNum] += addedSpread[spreadNum];
        }
        else {
            totalSpread[finalNum] = addedSpread[spreadNum];
        }
    }
    for (finalNum in totalSpread) {
        if (finalNum >= targetHP)
            returnSum += totalSpread[finalNum];
        probabilitySum += totalSpread[finalNum];
    }
    if (returnSum === probabilitySum)
        returnSum = 1;
    return returnSum;
}

function predictTotal(damage, eot, timesUsed, toxicCounter, hp, maxHP, restoreHP, restoreThreshold) {
    var total = 0;
    for (var i = 0; i < timesUsed; i++) {
        total += damage;
        if ((hp - total <= restoreThreshold) && restoreHP) {
            total -= restoreHP;
            if (hp - total > maxHP) {
                total = hp - maxHP;
            }
            restoreHP = 0;
        }
        if (i < timesUsed - 1) {
            total -= eot;
            if (toxicCounter > 0) {
                total += Math.floor((toxicCounter + i) * maxHP / 16);
            }
        }
    }
    return total;
}

function serializeText(arr) {
    if (arr.length === 0) {
        return '';
    }
    else if (arr.length === 1) {
        return arr[0];
    }
    else if (arr.length === 2) {
        return arr[0] + " and " + arr[1];
    }
    else {
        var text = '';
        for (var i = 0; i < arr.length - 1; i++) {
            text += arr[i] + ', ';
        }
        return text + 'and ' + arr[arr.length - 1];
    }
}

function getRestoreHP(item, maxHP, preventsRestoreHP) {
    return preventsRestoreHP ? 0 :
        ["Berry", "Oran Berry"].includes(item) ? 10 :
            item == "Berry Juice" ? 20 :
                ["Gold Berry", "Sitrus Berry"].includes(item) && gen <= 3 ? 30 :
                    item == "Sitrus Berry" ? Math.floor(maxHP / 4) :    //Enigma Berry can also apply if the attack is super effective
                        ["Figy Berry", "Iapapa Berry", "Wiki Berry", "Aguav Berry", "Mago Berry"].includes(item) ? Math.floor(maxHP / (gen <= 6 ? 8 : gen == 7 ? 2 : 3)) :
                            0;
}

function applyRipen(isRipen, item, restoreHP) {
    return isRipen && item.includes(" Berry") && restoreHP;
}

function getRestoreThreshold(item, restoreHP, maxHP, isGluttony) {
    if (restoreHP) {
        if (gen <= 6 || ["Berry", "Oran Berry", "Berry Juice", "Gold Berry", "Sitrus Berry"].includes(item)) {
            return [maxHP / 2, false];
        }
        else if (["Figy Berry", "Iapapa Berry", "Wiki Berry", "Aguav Berry", "Mago Berry"].includes(item)) {
            if (isGluttony) {
                return [maxHP / 2, true];
            }
            else {
                return [maxHP / 4, false];
            }
        }
    }
    return [0, false];
}

/**
 * Converts multihit moves into one Array (In Gen 1, each hit uses the same damage roll, and only the first hit can crit)
 * @param {var} damage Array containing either each damage roll or multiple Arrays that contain each damage roll
 * @param {var} hits Number of times a move hits
 * @returns the sum of all hits with each damage roll
 */
function handleMultiHitGen1(damage, hits) {
    let is2dArr = Array.isArray(damage[0]);
    var firstHit = is2dArr ? damage[0] : damage;
    var laterHits = is2dArr ? damage[1] : damage;
    var allHitsDamage = [];
    for (randIndex in firstHit) {
        allHitsDamage.push(firstHit[randIndex] + laterHits[randIndex] * (hits - 1));
    }
    return allHitsDamage;
}

function getAllEndOfTurnEffects(defender, field, isBadDreams, preventsHeal, preventsHealItem, preventsRestoreHP) {
        //IMPORTANT: THIS ISN'T THE ORDER FOR GEN 3 AND BEFORE. THIS IS WHAT I FOUND TO BE GEN 3 ORDER:
        //Wish, Weather, Ingrain, Sitrus/Oran/Berry Juice healing, Leftovers, burn, Leech Seed, Nightmare, Curse
        //THE SITRUS/ORAN/BERRY JUICE HEALING IS WHY preventsRestoreHP IS PASSED IN
    let weatherEffects = 0,
        //wish = 0,
        seaOfFire = 0,
        gMaxField = 0,
        grassyTerrain = 0,
        leftoversBlackSludge = 0,
        //aquaRing = 0,
        //ingrain = 0,
        //leechSeed = 0,
        poisonedPoisonHeal = 0,
        toxicCounter = 0,
        burn = 0,
        //nightmare = 0,
        //ghostCurse = 0,
        saltCure = 0,
        //bindingMove = 0,
        badDreams = 0;
        //stickyBarb = 0,
        //harvest = 0;
    let weatherEffectsText = '',
        leftoversBlackSludgeText = '',
        poisonedPoisonHealText = '',
        burnedText = '',
        saltCureText = '';
    let isToxicDamage = false;

    //EOT Order
    //1. Weather Effects
    if (field.weather == 'Sun') {
        if (['Dry Skin', 'Solar Power'].includes(defender.ability)) {
            weatherEffects -= Math.floor(defender.maxHP / 8);
            weatherEffectsText = defender.ability + ' damage';
        }
    }
    else if (field.weather == 'Rain') {
        if (!preventsHeal) {
            if (defender.ability === 'Dry Skin') {
                weatherEffects += Math.floor(defender.maxHP / 8);
                weatherEffectsText = 'Dry Skin recovery';
            }
            else if (defender.ability === 'Rain Dish') {
                weatherEffects += Math.floor(defender.maxHP / 16);
                weatherEffectsText = 'Rain Dish recovery';
            }
        }
    }
    else if (field.weather == 'Sand') {
        if (!(defender.hasType("Rock", "Ground", "Steel")) && !(['Magic Guard', 'Overcoat', 'Sand Force', 'Sand Rush', 'Sand Veil'].includes(defender.ability)) && defender.item !== 'Safety Goggles') {
            weatherEffects -= Math.floor(defender.maxHP / 16);
            weatherEffectsText = 'sandstorm damage';
        }
    }
    else if (field.weather == 'Hail') {
        if (defender.ability === 'Ice Body' && !preventsHeal) {
            weatherEffects += Math.floor(defender.maxHP / 16);
            weatherEffectsText = 'Ice Body recovery';
        }
        else if (!(defender.hasType('Ice')) && !(['Magic Guard', 'Overcoat', 'Snow Cloak'].includes(defender.ability)) && defender.item !== 'Safety Goggles') {
            weatherEffects -= Math.floor(defender.maxHP / 16);
            weatherEffectsText = 'hail damage';
        }
    }
    else if (field.weather === 'Snow' && defender.ability === 'Ice Body' && !preventsHeal) {
        weatherEffects += Math.floor(defender.maxHP / 16);
        weatherEffectsText = 'Ice Body recovery';
    }

    //2. Future Sight / Doom Desire (not yet implemented as such)
    //3. Wish (no plans for implementation)
    //4. Speed dependant block
    //a. Sea of Fire, G-Max Vinelash / Wildfire / Cannonade / Volcalith
    if (field.isSeaFire && defender.ability !== 'Magic Guard' && !(defender.hasType("Fire"))) {
        seaOfFire -= Math.floor(defender.maxHP / 8);
    }
    if (field.isGMaxField && defender.ability !== 'Magic Guard') {
        gMaxField -= Math.floor(defender.maxHP / 6);
    }
    //b. Grassy Terrain
    if (field.terrain === "Grassy") {
        if (!preventsHeal && pIsGrounded(defender, field)) {
            grassyTerrain += Math.floor(defender.maxHP / 16);
        }
    }
    //c. Hydration (not implemented, not that it's relevant within this block)
    //d. Leftovers / Black Sludge
    if (defender.item === 'Leftovers' && !preventsHealItem) {
        leftoversBlackSludge += Math.floor(defender.maxHP / 16);
        leftoversBlackSludgeText = 'Leftovers recovery';
    }
    else if (defender.item === 'Black Sludge') {
        if (defender.hasType('Poison') && !preventsHealItem) {
            leftoversBlackSludge += Math.floor(defender.maxHP / 16);
            leftoversBlackSludgeText = 'Black Sludge recovery';
        }
        else if (defender.ability !== 'Magic Guard' && defender.ability !== 'Klutz') {
            leftoversBlackSludge -= Math.floor(defender.maxHP / 8);
            leftoversBlackSludgeText = 'Black Sludge damage';
        }
    }

    //5. Aqua Ring (not implemented)
    //6. Ingrain (not implemented)
    //7. Leech Seed (not implemented)
    //8. Poisoned / Badly Poisoned / Poison Heal
    if (defender.status === 'Poisoned') {
        if (defender.ability === 'Poison Heal' && !preventsHeal) {
            poisonedPoisonHeal += Math.floor(defender.maxHP / 8);
            poisonedPoisonHealText = 'Poison Heal';
        }
        else if (defender.ability !== 'Magic Guard') {
            poisonedPoisonHeal -= Math.floor(defender.maxHP / 8);
            poisonedPoisonHealText = 'poison damage';
        }
    }
    else if (defender.status === 'Badly Poisoned') {
        if (defender.ability === 'Poison Heal' && !preventsHeal) {
            poisonedPoisonHeal += Math.floor(defender.maxHP / 8);
            poisonedPoisonHealText = 'Poison Heal';
        }
        else if (defender.ability !== 'Magic Guard') {
            toxicCounter = defender.toxicCounter;
            poisonedPoisonHealText = 'toxic damage';
            isToxicDamage = true;
        }
    }
    //9. Burned
    else if (defender.status === 'Burned') {
        var burnDmgDivider = (gen >= 7) ? 16 : 8;
        if (defender.ability === 'Heatproof') {
            burn -= Math.floor(defender.maxHP / burnDmgDivider / 2);
            burnedText = 'reduced burn damage';
        }
        else if (defender.ability !== 'Magic Guard') {
            burn -= Math.floor(defender.maxHP / burnDmgDivider);
            burnedText = 'burn damage';
        }
    }

    //10. Nightmare (not implemented)
    //11. Curse (not implemented)
    //12. Salt Cure
    if (field.isSaltCure && defender.ability !== 'Magic Guard') {
        if (!(defender.hasType("Water", "Steel"))) {
            let saltMult = gen == 10 ? 16 : 8;
            saltCure -= Math.floor(defender.maxHP / saltMult);
            saltCureText = 'Salt Cure damage';
        }
        else {
            let saltMult = gen == 10 ? 8 : 4;
            saltCure -= Math.floor(defender.maxHP / saltMult);
            saltCureText = 'extra Salt Cure damage';
        }
    }

    //13. Binding moves (not implemented)
    //14. Bad Dreams
    if ((defender.status === 'Asleep' || defender.ability === 'Comatose') && isBadDreams && defender.ability !== 'Magic Guard') {
        badDreams -= Math.floor(defender.maxHP / 8);
    }

    //15. Sticky Barb (not implemented)
    //16. Harvest (not implemented)

    let maxChip = defender.isDynamax ? 0.5 : 1;
    return {
        weatherEffects: {
            val: Math.floor(weatherEffects * maxChip),
            text: weatherEffectsText
        },
        seaOfFire: {
            val: Math.floor(seaOfFire * maxChip),
            text: 'Sea of Fire damage'
        },
        gMaxField: {
            val: Math.floor(gMaxField * maxChip),
            text: 'G-Max field damage'
        },
        grassyTerrain: {
            val: Math.floor(grassyTerrain * maxChip),
            text: 'Grassy Terrain recovery'
        },
        leftoversBlackSludge: {
            val: Math.floor(leftoversBlackSludge * maxChip),
            text: leftoversBlackSludgeText
        },
        poisonedToxicPoisonHeal: {
            val: isToxicDamage ? toxicCounter : Math.floor(poisonedPoisonHeal * maxChip),
            text: poisonedPoisonHealText,
            isToxic: isToxicDamage
        },
        burned: {
            val: Math.floor(burn * maxChip),
            text: burnedText
        },
        saltCure: {
            val: Math.floor(saltCure * maxChip),
            text: saltCureText
        },
        badDreams: {
            val: Math.floor(badDreams * maxChip),
            text: 'Bad Dreams'
        },
    };
}

function checkThresholdCriteria(currHP, roll, restoreHP, restoreThreshold, prevCalcRolls = 0) {
    let usedPrevCalcRolls = parseInt(prevCalcRolls);
    return isNaN(prevCalcRolls) || (restoreHP && currHP - usedPrevCalcRolls - roll <= restoreThreshold && currHP - usedPrevCalcRolls - roll > 0);
}

function eotProcess(eotDict, damageRoll, toxicCounter, targetHP, restoreHP, restoreThreshold, maxHP, activateHealItem, maxChip) {
    for (eotType in eotDict) {
        if (eotDict[eotType].val != 0) {
            let eotApply = 0;
            if (!eotDict[eotType].isToxic) {
                eotApply = eotDict[eotType].val;
            }
            else {
                eotApply = Math.floor(Math.floor(toxicCounter * maxHP / 16) * maxChip) * -1;
            }
            if (!activateHealItem && checkThresholdCriteria(targetHP, eotApply * -1, restoreHP, restoreThreshold, damageRoll)) {
                activateHealItem = true;
            }
            if ((activateHealItem && targetHP - damageRoll + restoreHP > 0) || (!activateHealItem && targetHP - damageRoll > 0)) {
                damageRoll -= eotApply;     //Currently assumes to always check for a KO before applying the eot damage/healing, consider changing to allow for more lefties healing turns
            }
        }
    }
    return [damageRoll, activateHealItem];
}

return { GET_DAMAGE_SV, GET_DAMAGE_HANDLER, CALCULATE_ALL_MOVES_SV, getKOChanceText, buildDescription, pokeRound, chainMods, getModifiedStat, getFinalSpeed };
`)({
  gen: 10,
  resultDisplayMode: "SPs",
  typeChart: {"Normal":{"Normal":1,"Fire":1,"Water":1,"Electric":1,"Grass":1,"Ice":1,"Fighting":1,"Poison":1,"Ground":1,"Flying":1,"Psychic":1,"Bug":1,"Rock":0.5,"Ghost":0,"Dragon":1,"Dark":1,"Steel":0.5,"Fairy":1},"Fire":{"Normal":1,"Fire":0.5,"Water":0.5,"Electric":1,"Grass":2,"Ice":2,"Fighting":1,"Poison":1,"Ground":1,"Flying":1,"Psychic":1,"Bug":2,"Rock":0.5,"Ghost":1,"Dragon":0.5,"Dark":1,"Steel":2,"Fairy":1},"Water":{"Normal":1,"Fire":2,"Water":0.5,"Electric":1,"Grass":0.5,"Ice":1,"Fighting":1,"Poison":1,"Ground":2,"Flying":1,"Psychic":1,"Bug":1,"Rock":2,"Ghost":1,"Dragon":0.5,"Dark":1,"Steel":1,"Fairy":1},"Electric":{"Normal":1,"Fire":1,"Water":2,"Electric":0.5,"Grass":0.5,"Ice":1,"Fighting":1,"Poison":1,"Ground":0,"Flying":2,"Psychic":1,"Bug":1,"Rock":1,"Ghost":1,"Dragon":0.5,"Dark":1,"Steel":1,"Fairy":1},"Grass":{"Normal":1,"Fire":0.5,"Water":2,"Electric":1,"Grass":0.5,"Ice":1,"Fighting":1,"Poison":0.5,"Ground":2,"Flying":0.5,"Psychic":1,"Bug":0.5,"Rock":2,"Ghost":1,"Dragon":0.5,"Dark":1,"Steel":0.5,"Fairy":1},"Ice":{"Normal":1,"Fire":0.5,"Water":0.5,"Electric":1,"Grass":2,"Ice":0.5,"Fighting":1,"Poison":1,"Ground":2,"Flying":2,"Psychic":1,"Bug":1,"Rock":1,"Ghost":1,"Dragon":2,"Dark":1,"Steel":0.5,"Fairy":1},"Fighting":{"Normal":2,"Fire":1,"Water":1,"Electric":1,"Grass":1,"Ice":2,"Fighting":1,"Poison":0.5,"Ground":1,"Flying":0.5,"Psychic":0.5,"Bug":0.5,"Rock":2,"Ghost":0,"Dragon":1,"Dark":2,"Steel":2,"Fairy":0.5},"Poison":{"Normal":1,"Fire":1,"Water":1,"Electric":1,"Grass":2,"Ice":1,"Fighting":1,"Poison":0.5,"Ground":0.5,"Flying":1,"Psychic":1,"Bug":1,"Rock":0.5,"Ghost":0.5,"Dragon":1,"Dark":1,"Steel":0,"Fairy":2},"Ground":{"Normal":1,"Fire":2,"Water":1,"Electric":2,"Grass":0.5,"Ice":1,"Fighting":1,"Poison":2,"Ground":1,"Flying":0,"Psychic":1,"Bug":0.5,"Rock":2,"Ghost":1,"Dragon":1,"Dark":1,"Steel":2,"Fairy":1},"Flying":{"Normal":1,"Fire":1,"Water":1,"Electric":0.5,"Grass":2,"Ice":1,"Fighting":2,"Poison":1,"Ground":1,"Flying":1,"Psychic":1,"Bug":2,"Rock":0.5,"Ghost":1,"Dragon":1,"Dark":1,"Steel":0.5,"Fairy":1},"Psychic":{"Normal":1,"Fire":1,"Water":1,"Electric":1,"Grass":1,"Ice":1,"Fighting":2,"Poison":2,"Ground":1,"Flying":1,"Psychic":0.5,"Bug":1,"Rock":1,"Ghost":1,"Dragon":1,"Dark":0,"Steel":0.5,"Fairy":1},"Bug":{"Normal":1,"Fire":0.5,"Water":1,"Electric":1,"Grass":2,"Ice":1,"Fighting":0.5,"Poison":0.5,"Ground":1,"Flying":0.5,"Psychic":2,"Bug":1,"Rock":1,"Ghost":0.5,"Dragon":1,"Dark":2,"Steel":0.5,"Fairy":0.5},"Rock":{"Normal":1,"Fire":2,"Water":1,"Electric":1,"Grass":1,"Ice":2,"Fighting":0.5,"Poison":1,"Ground":0.5,"Flying":2,"Psychic":1,"Bug":2,"Rock":1,"Ghost":1,"Dragon":1,"Dark":1,"Steel":0.5,"Fairy":1},"Ghost":{"Normal":0,"Fire":1,"Water":1,"Electric":1,"Grass":1,"Ice":1,"Fighting":1,"Poison":1,"Ground":1,"Flying":1,"Psychic":2,"Bug":1,"Rock":1,"Ghost":2,"Dragon":1,"Dark":0.5,"Steel":1,"Fairy":1},"Dragon":{"Normal":1,"Fire":1,"Water":1,"Electric":1,"Grass":1,"Ice":1,"Fighting":1,"Poison":1,"Ground":1,"Flying":1,"Psychic":1,"Bug":1,"Rock":1,"Ghost":1,"Dragon":2,"Dark":1,"Steel":0.5,"Fairy":0},"Dark":{"Normal":1,"Fire":1,"Water":1,"Electric":1,"Grass":1,"Ice":1,"Fighting":0.5,"Poison":1,"Ground":1,"Flying":1,"Psychic":2,"Bug":1,"Rock":1,"Ghost":2,"Dragon":1,"Dark":0.5,"Steel":0.5,"Fairy":0.5},"Steel":{"Normal":1,"Fire":0.5,"Water":0.5,"Electric":0.5,"Grass":1,"Ice":2,"Fighting":1,"Poison":1,"Ground":1,"Flying":1,"Psychic":1,"Bug":1,"Rock":2,"Ghost":1,"Dragon":1,"Dark":1,"Steel":0.5,"Fairy":2},"Fairy":{"Normal":1,"Fire":0.5,"Water":1,"Electric":1,"Grass":1,"Ice":1,"Fighting":2,"Poison":0.5,"Ground":1,"Flying":1,"Psychic":1,"Bug":1,"Rock":1,"Ghost":1,"Dragon":2,"Dark":2,"Steel":0.5,"Fairy":1}},
  natures: {"Adamant":["at","sa"],"Bashful":["",""],"Bold":["df","at"],"Brave":["at","sp"],"Calm":["sd","at"],"Careful":["sd","sa"],"Docile":["",""],"Gentle":["sd","df"],"Hardy":["",""],"Hasty":["sp","df"],"Impish":["df","sa"],"Jolly":["sp","sa"],"Lax":["df","sd"],"Lonely":["at","df"],"Mild":["sa","df"],"Modest":["sa","at"],"Naive":["sp","sd"],"Naughty":["at","sd"],"Quiet":["sa","sp"],"Quirky":["",""],"Rash":["sa","sd"],"Relaxed":["df","sp"],"Sassy":["sd","sp"],"Serious":["",""],"Timid":["sp","at"]},
  moves: {"10,000,000 Volt Thunderbolt":{"bp":195,"type":"Electric","category":"Special","statChange":null},"Absorb":{"bp":20,"type":"Grass","category":"Special","statChange":null},"Accelerock":{"bp":40,"type":"Rock","category":"Physical","statChange":null},"Acid":{"bp":40,"type":"Poison","category":"Special","statChange":null},"Acid Armor":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Acid Downpour":{"bp":1,"type":"Poison","category":"Physical","statChange":null},"Acid Spray":{"bp":40,"type":"Poison","category":"Special","statChange":null},"Acrobatics":{"bp":55,"type":"Flying","category":"Physical","statChange":null},"Acupressure":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Aerial Ace":{"bp":60,"type":"Flying","category":"Physical","statChange":null},"Aeroblast":{"bp":100,"type":"Flying","category":"Special","statChange":null},"After You":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Agility":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Air Cutter":{"bp":60,"type":"Flying","category":"Special","statChange":null},"Air Slash":{"bp":75,"type":"Flying","category":"Special","statChange":null},"All-Out Pummeling":{"bp":1,"type":"Fighting","category":"Physical","statChange":null},"Alluring Voice":{"bp":80,"type":"Fairy","category":"Special","statChange":null},"Ally Switch":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Amnesia":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Anchor Shot":{"bp":80,"type":"Steel","category":"Physical","statChange":null},"Ancient Power":{"bp":60,"type":"Rock","category":"Special","statChange":null},"Apple Acid":{"bp":80,"type":"Grass","category":"Special","statChange":null},"Aqua Cutter":{"bp":70,"type":"Water","category":"Physical","statChange":null},"Aqua Jet":{"bp":40,"type":"Water","category":"Physical","statChange":null},"Aqua Ring":{"bp":0,"type":"Water","category":"Status","statChange":null},"Aqua Step":{"bp":80,"type":"Water","category":"Physical","statChange":null},"Aqua Tail":{"bp":90,"type":"Water","category":"Physical","statChange":null},"Armor Cannon":{"bp":120,"type":"Fire","category":"Special","statChange":null},"Arm Thrust":{"bp":15,"type":"Fighting","category":"Physical","statChange":null},"Aromatherapy":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Aromatic Mist":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Assist":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Assurance":{"bp":60,"type":"Dark","category":"Physical","statChange":null},"Astonish":{"bp":30,"type":"Ghost","category":"Physical","statChange":null},"Astral Barrage":{"bp":120,"type":"Ghost","category":"Special","statChange":null},"Attack Order":{"bp":90,"type":"Bug","category":"Physical","statChange":null},"Attract":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Aura Sphere":{"bp":80,"type":"Fighting","category":"Special","statChange":null},"Aura Wheel":{"bp":110,"type":"Electric","category":"Physical","statChange":null},"Aurora Beam":{"bp":65,"type":"Ice","category":"Special","statChange":null},"Aurora Veil":{"bp":0,"type":"Ice","category":"Status","statChange":null},"Autotomize":{"bp":0,"type":"Steel","category":"Status","statChange":null},"Avalanche":{"bp":60,"type":"Ice","category":"Physical","statChange":null},"Axe Kick":{"bp":120,"type":"Fighting","category":"Physical","statChange":null},"Baby-Doll Eyes":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Baddy Bad":{"bp":80,"type":"Dark","category":"Special","statChange":null},"Baneful Bunker":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Barb Barrage":{"bp":60,"type":"Poison","category":"Physical","statChange":null},"Barrage":{"bp":15,"type":"Normal","category":"Physical","statChange":null},"Barrier":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Baton Pass":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Beak Blast":{"bp":100,"type":"Flying","category":"Physical","statChange":null},"Beat Up":{"bp":0,"type":"Dark","category":"Physical","statChange":null},"Behemoth Bash":{"bp":100,"type":"Steel","category":"Physical","statChange":null},"Behemoth Blade":{"bp":100,"type":"Steel","category":"Physical","statChange":null},"Belch":{"bp":120,"type":"Poison","category":"Special","statChange":null},"Belly Drum":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Bestow":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Bide":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Bind":{"bp":15,"type":"Normal","category":"Physical","statChange":null},"Bite":{"bp":60,"type":"Dark","category":"Physical","statChange":null},"Bitter Blade":{"bp":90,"type":"Fire","category":"Physical","statChange":null},"Bitter Malice":{"bp":75,"type":"Ghost","category":"Special","statChange":null},"Black Hole Eclipse":{"bp":1,"type":"Dark","category":"Physical","statChange":null},"Blast Burn":{"bp":150,"type":"Fire","category":"Special","statChange":null},"Blaze Kick":{"bp":85,"type":"Fire","category":"Physical","statChange":null},"Blazing Torque":{"bp":80,"type":"Fire","category":"Physical","statChange":null},"Bleakwind Storm":{"bp":100,"type":"Flying","category":"Special","statChange":null},"Blizzard":{"bp":110,"type":"Ice","category":"Special","statChange":null},"Block":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Blood Moon":{"bp":140,"type":"Normal","category":"Special","statChange":null},"Bloom Doom":{"bp":1,"type":"Grass","category":"Physical","statChange":null},"Blue Flare":{"bp":130,"type":"Fire","category":"Special","statChange":null},"Body Press":{"bp":80,"type":"Fighting","category":"Physical","statChange":null},"Body Slam":{"bp":85,"type":"Normal","category":"Physical","statChange":null},"Bolt Beak":{"bp":85,"type":"Electric","category":"Physical","statChange":null},"Bolt Strike":{"bp":130,"type":"Electric","category":"Physical","statChange":null},"Bone Club":{"bp":65,"type":"Ground","category":"Physical","statChange":null},"Bonemerang":{"bp":50,"type":"Ground","category":"Physical","statChange":null},"Bone Rush":{"bp":25,"type":"Ground","category":"Physical","statChange":null},"Boomburst":{"bp":140,"type":"Normal","category":"Special","statChange":null},"Bounce":{"bp":85,"type":"Flying","category":"Physical","statChange":null},"Bouncy Bubble":{"bp":60,"type":"Water","category":"Special","statChange":null},"Branch Poke":{"bp":40,"type":"Grass","category":"Physical","statChange":null},"Brave Bird":{"bp":120,"type":"Flying","category":"Physical","statChange":null},"Breaking Swipe":{"bp":60,"type":"Dragon","category":"Physical","statChange":null},"Breakneck Blitz":{"bp":1,"type":"Normal","category":"Physical","statChange":null},"Brick Break":{"bp":75,"type":"Fighting","category":"Physical","statChange":null},"Brine":{"bp":65,"type":"Water","category":"Special","statChange":null},"Brutal Swing":{"bp":60,"type":"Dark","category":"Physical","statChange":null},"Bubble":{"bp":40,"type":"Water","category":"Special","statChange":null},"Bubble Beam":{"bp":65,"type":"Water","category":"Special","statChange":null},"Bug Bite":{"bp":60,"type":"Bug","category":"Physical","statChange":null},"Bug Buzz":{"bp":90,"type":"Bug","category":"Special","statChange":null},"Bulk Up":{"bp":0,"type":"Fighting","category":"Status","statChange":null},"Bulldoze":{"bp":60,"type":"Ground","category":"Physical","statChange":null},"Bullet Punch":{"bp":40,"type":"Steel","category":"Physical","statChange":null},"Bullet Seed":{"bp":25,"type":"Grass","category":"Physical","statChange":null},"Burning Bulwark":{"bp":0,"type":"Fire","category":"Status","statChange":null},"Burning Jealousy":{"bp":70,"type":"Fire","category":"Special","statChange":null},"Burn Up":{"bp":130,"type":"Fire","category":"Special","statChange":null},"Buzzy Buzz":{"bp":60,"type":"Electric","category":"Special","statChange":null},"Calm Mind":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Camouflage":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Captivate":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Catastropika":{"bp":210,"type":"Electric","category":"Physical","statChange":null},"Ceaseless Edge":{"bp":65,"type":"Dark","category":"Physical","statChange":null},"Celebrate":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Charge":{"bp":0,"type":"Electric","category":"Status","statChange":null},"Charge Beam":{"bp":50,"type":"Electric","category":"Special","statChange":null},"Charm":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Chatter":{"bp":65,"type":"Flying","category":"Special","statChange":null},"Chilling Water":{"bp":50,"type":"Water","category":"Special","statChange":null},"Chilly Reception":{"bp":0,"type":"Ice","category":"Status","statChange":null},"Chip Away":{"bp":70,"type":"Normal","category":"Physical","statChange":null},"Chloroblast":{"bp":150,"type":"Grass","category":"Special","statChange":null},"Circle Throw":{"bp":60,"type":"Fighting","category":"Physical","statChange":null},"Clamp":{"bp":35,"type":"Water","category":"Physical","statChange":null},"Clanging Scales":{"bp":110,"type":"Dragon","category":"Special","statChange":null},"Clangorous Soul":{"bp":0,"type":"Dragon","category":"Status","statChange":null},"Clangorous Soulblaze":{"bp":185,"type":"Dragon","category":"Special","statChange":null},"Clear Smog":{"bp":50,"type":"Poison","category":"Special","statChange":null},"Close Combat":{"bp":120,"type":"Fighting","category":"Physical","statChange":null},"Coaching":{"bp":0,"type":"Fighting","category":"Status","statChange":null},"Coil":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Collision Course":{"bp":100,"type":"Fighting","category":"Physical","statChange":null},"Combat Torque":{"bp":100,"type":"Fighting","category":"Physical","statChange":null},"Comet Punch":{"bp":18,"type":"Normal","category":"Physical","statChange":null},"Comeuppance":{"bp":0,"type":"Dark","category":"Physical","statChange":null},"Confide":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Confuse Ray":{"bp":0,"type":"Ghost","category":"Status","statChange":null},"Confusion":{"bp":50,"type":"Psychic","category":"Special","statChange":null},"Constrict":{"bp":10,"type":"Normal","category":"Physical","statChange":null},"Continental Crush":{"bp":1,"type":"Rock","category":"Physical","statChange":null},"Conversion":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Conversion 2":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Copycat":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Core Enforcer":{"bp":100,"type":"Dragon","category":"Special","statChange":null},"Corkscrew Crash":{"bp":1,"type":"Steel","category":"Physical","statChange":null},"Corrosive Gas":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Cosmic Power":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Cotton Guard":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Cotton Spore":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Counter":{"bp":0,"type":"Fighting","category":"Physical","statChange":null},"Court Change":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Covet":{"bp":60,"type":"Normal","category":"Physical","statChange":null},"Crabhammer":{"bp":100,"type":"Water","category":"Physical","statChange":null},"Crafty Shield":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Cross Chop":{"bp":100,"type":"Fighting","category":"Physical","statChange":null},"Cross Poison":{"bp":70,"type":"Poison","category":"Physical","statChange":null},"Crunch":{"bp":80,"type":"Dark","category":"Physical","statChange":null},"Crush Claw":{"bp":75,"type":"Normal","category":"Physical","statChange":null},"Crush Grip":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Curse":{"bp":0,"type":"Ghost","category":"Status","statChange":null},"Cut":{"bp":50,"type":"Normal","category":"Physical","statChange":null},"Darkest Lariat":{"bp":85,"type":"Dark","category":"Physical","statChange":null},"Dark Pulse":{"bp":80,"type":"Dark","category":"Special","statChange":null},"Dark Void":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Dazzling Gleam":{"bp":80,"type":"Fairy","category":"Special","statChange":null},"Decorate":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Defend Order":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Defense Curl":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Defog":{"bp":0,"type":"Flying","category":"Status","statChange":null},"Destiny Bond":{"bp":0,"type":"Ghost","category":"Status","statChange":null},"Detect":{"bp":0,"type":"Fighting","category":"Status","statChange":null},"Devastating Drake":{"bp":1,"type":"Dragon","category":"Physical","statChange":null},"Diamond Storm":{"bp":100,"type":"Rock","category":"Physical","statChange":null},"Dig":{"bp":80,"type":"Ground","category":"Physical","statChange":null},"Dire Claw":{"bp":80,"type":"Poison","category":"Physical","statChange":null},"Disable":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Disarming Voice":{"bp":40,"type":"Fairy","category":"Special","statChange":null},"Discharge":{"bp":80,"type":"Electric","category":"Special","statChange":null},"Dive":{"bp":80,"type":"Water","category":"Physical","statChange":null},"Dizzy Punch":{"bp":70,"type":"Normal","category":"Physical","statChange":null},"Doodle":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Doom Desire":{"bp":140,"type":"Steel","category":"Special","statChange":null},"Double-Edge":{"bp":120,"type":"Normal","category":"Physical","statChange":null},"Double Hit":{"bp":35,"type":"Normal","category":"Physical","statChange":null},"Double Iron Bash":{"bp":60,"type":"Steel","category":"Physical","statChange":null},"Double Kick":{"bp":30,"type":"Fighting","category":"Physical","statChange":null},"Double Shock":{"bp":120,"type":"Electric","category":"Physical","statChange":null},"Double Slap":{"bp":15,"type":"Normal","category":"Physical","statChange":null},"Double Team":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Draco Meteor":{"bp":130,"type":"Dragon","category":"Special","statChange":null},"Dragon Ascent":{"bp":120,"type":"Flying","category":"Physical","statChange":null},"Dragon Breath":{"bp":60,"type":"Dragon","category":"Special","statChange":null},"Dragon Cheer":{"bp":0,"type":"Dragon","category":"Status","statChange":null},"Dragon Claw":{"bp":80,"type":"Dragon","category":"Physical","statChange":null},"Dragon Dance":{"bp":0,"type":"Dragon","category":"Status","statChange":null},"Dragon Darts":{"bp":50,"type":"Dragon","category":"Physical","statChange":null},"Dragon Energy":{"bp":150,"type":"Dragon","category":"Special","statChange":null},"Dragon Hammer":{"bp":90,"type":"Dragon","category":"Physical","statChange":null},"Dragon Pulse":{"bp":85,"type":"Dragon","category":"Special","statChange":null},"Dragon Rage":{"bp":0,"type":"Dragon","category":"Special","statChange":null},"Dragon Rush":{"bp":100,"type":"Dragon","category":"Physical","statChange":null},"Dragon Tail":{"bp":60,"type":"Dragon","category":"Physical","statChange":null},"Draining Kiss":{"bp":50,"type":"Fairy","category":"Special","statChange":null},"Drain Punch":{"bp":75,"type":"Fighting","category":"Physical","statChange":null},"Dream Eater":{"bp":100,"type":"Psychic","category":"Special","statChange":null},"Drill Peck":{"bp":80,"type":"Flying","category":"Physical","statChange":null},"Drill Run":{"bp":80,"type":"Ground","category":"Physical","statChange":null},"Drum Beating":{"bp":80,"type":"Grass","category":"Physical","statChange":null},"Dual Chop":{"bp":40,"type":"Dragon","category":"Physical","statChange":null},"Dual Wingbeat":{"bp":40,"type":"Flying","category":"Physical","statChange":null},"Dynamax Cannon":{"bp":100,"type":"Dragon","category":"Special","statChange":null},"Dynamic Punch":{"bp":100,"type":"Fighting","category":"Physical","statChange":null},"Earth Power":{"bp":90,"type":"Ground","category":"Special","statChange":null},"Earthquake":{"bp":100,"type":"Ground","category":"Physical","statChange":null},"Echoed Voice":{"bp":40,"type":"Normal","category":"Special","statChange":null},"Eerie Impulse":{"bp":0,"type":"Electric","category":"Status","statChange":null},"Eerie Spell":{"bp":80,"type":"Psychic","category":"Special","statChange":null},"Egg Bomb":{"bp":100,"type":"Normal","category":"Physical","statChange":null},"Electric Terrain":{"bp":0,"type":"Electric","category":"Status","statChange":null},"Electrify":{"bp":0,"type":"Electric","category":"Status","statChange":null},"Electro Ball":{"bp":0,"type":"Electric","category":"Special","statChange":null},"Electro Drift":{"bp":100,"type":"Electric","category":"Special","statChange":null},"Electro Shot":{"bp":130,"type":"Electric","category":"Special","statChange":null},"Electroweb":{"bp":55,"type":"Electric","category":"Special","statChange":null},"Embargo":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Ember":{"bp":40,"type":"Fire","category":"Special","statChange":null},"Encore":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Endeavor":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Endure":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Energy Ball":{"bp":90,"type":"Grass","category":"Special","statChange":null},"Entrainment":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Eruption":{"bp":150,"type":"Fire","category":"Special","statChange":null},"Esper Wing":{"bp":80,"type":"Psychic","category":"Special","statChange":null},"Eternabeam":{"bp":160,"type":"Dragon","category":"Special","statChange":null},"Expanding Force":{"bp":80,"type":"Psychic","category":"Special","statChange":null},"Explosion":{"bp":250,"type":"Normal","category":"Physical","statChange":null},"Extrasensory":{"bp":80,"type":"Psychic","category":"Special","statChange":null},"Extreme Evoboost":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Extreme Speed":{"bp":80,"type":"Normal","category":"Physical","statChange":null},"Facade":{"bp":70,"type":"Normal","category":"Physical","statChange":null},"Fairy Lock":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Fairy Wind":{"bp":40,"type":"Fairy","category":"Special","statChange":null},"Fake Out":{"bp":40,"type":"Normal","category":"Physical","statChange":null},"Fake Tears":{"bp":0,"type":"Dark","category":"Status","statChange":null},"False Surrender":{"bp":80,"type":"Dark","category":"Physical","statChange":null},"False Swipe":{"bp":40,"type":"Normal","category":"Physical","statChange":null},"Feather Dance":{"bp":0,"type":"Flying","category":"Status","statChange":null},"Feint":{"bp":30,"type":"Normal","category":"Physical","statChange":null},"Feint Attack":{"bp":60,"type":"Dark","category":"Physical","statChange":null},"Fell Stinger":{"bp":50,"type":"Bug","category":"Physical","statChange":null},"Fickle Beam":{"bp":80,"type":"Dragon","category":"Special","statChange":null},"Fiery Dance":{"bp":80,"type":"Fire","category":"Special","statChange":null},"Fiery Wrath":{"bp":90,"type":"Dark","category":"Special","statChange":null},"Fillet Away":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Final Gambit":{"bp":0,"type":"Fighting","category":"Special","statChange":null},"Fire Blast":{"bp":110,"type":"Fire","category":"Special","statChange":null},"Fire Fang":{"bp":65,"type":"Fire","category":"Physical","statChange":null},"Fire Lash":{"bp":80,"type":"Fire","category":"Physical","statChange":null},"Fire Pledge":{"bp":80,"type":"Fire","category":"Special","statChange":null},"Fire Punch":{"bp":75,"type":"Fire","category":"Physical","statChange":null},"Fire Spin":{"bp":35,"type":"Fire","category":"Special","statChange":null},"First Impression":{"bp":90,"type":"Bug","category":"Physical","statChange":null},"Fishious Rend":{"bp":85,"type":"Water","category":"Physical","statChange":null},"Fissure":{"bp":0,"type":"Ground","category":"Physical","statChange":null},"Flail":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Flame Burst":{"bp":70,"type":"Fire","category":"Special","statChange":null},"Flame Charge":{"bp":50,"type":"Fire","category":"Physical","statChange":null},"Flamethrower":{"bp":90,"type":"Fire","category":"Special","statChange":null},"Flame Wheel":{"bp":60,"type":"Fire","category":"Physical","statChange":null},"Flare Blitz":{"bp":120,"type":"Fire","category":"Physical","statChange":null},"Flash":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Flash Cannon":{"bp":80,"type":"Steel","category":"Special","statChange":null},"Flatter":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Fleur Cannon":{"bp":130,"type":"Fairy","category":"Special","statChange":null},"Fling":{"bp":0,"type":"Dark","category":"Physical","statChange":null},"Flip Turn":{"bp":60,"type":"Water","category":"Physical","statChange":null},"Floaty Fall":{"bp":90,"type":"Flying","category":"Physical","statChange":null},"Floral Healing":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Flower Shield":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Flower Trick":{"bp":70,"type":"Grass","category":"Physical","statChange":null},"Fly":{"bp":90,"type":"Flying","category":"Physical","statChange":null},"Flying Press":{"bp":100,"type":"Fighting","category":"Physical","statChange":null},"Focus Blast":{"bp":120,"type":"Fighting","category":"Special","statChange":null},"Focus Energy":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Focus Punch":{"bp":150,"type":"Fighting","category":"Physical","statChange":null},"Follow Me":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Force Palm":{"bp":60,"type":"Fighting","category":"Physical","statChange":null},"Foresight":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Forest's Curse":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Foul Play":{"bp":95,"type":"Dark","category":"Physical","statChange":null},"Freeze-Dry":{"bp":70,"type":"Ice","category":"Special","statChange":null},"Freeze Shock":{"bp":140,"type":"Ice","category":"Physical","statChange":null},"Freezing Glare":{"bp":90,"type":"Psychic","category":"Special","statChange":null},"Freezy Frost":{"bp":100,"type":"Ice","category":"Special","statChange":null},"Frenzy Plant":{"bp":150,"type":"Grass","category":"Special","statChange":null},"Frost Breath":{"bp":60,"type":"Ice","category":"Special","statChange":null},"Frustration":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Fury Attack":{"bp":15,"type":"Normal","category":"Physical","statChange":null},"Fury Cutter":{"bp":40,"type":"Bug","category":"Physical","statChange":null},"Fury Swipes":{"bp":18,"type":"Normal","category":"Physical","statChange":null},"Fusion Bolt":{"bp":100,"type":"Electric","category":"Physical","statChange":null},"Fusion Flare":{"bp":100,"type":"Fire","category":"Special","statChange":null},"Future Sight":{"bp":120,"type":"Psychic","category":"Special","statChange":null},"Gastro Acid":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Gear Grind":{"bp":50,"type":"Steel","category":"Physical","statChange":null},"Gear Up":{"bp":0,"type":"Steel","category":"Status","statChange":null},"Genesis Supernova":{"bp":185,"type":"Psychic","category":"Special","statChange":null},"Geomancy":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Giga Drain":{"bp":75,"type":"Grass","category":"Special","statChange":null},"Giga Impact":{"bp":150,"type":"Normal","category":"Physical","statChange":null},"Gigaton Hammer":{"bp":160,"type":"Steel","category":"Physical","statChange":null},"Gigavolt Havoc":{"bp":1,"type":"Electric","category":"Physical","statChange":null},"Glacial Lance":{"bp":120,"type":"Ice","category":"Physical","statChange":null},"Glaciate":{"bp":65,"type":"Ice","category":"Special","statChange":null},"Glaive Rush":{"bp":120,"type":"Dragon","category":"Physical","statChange":null},"Glare":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Glitzy Glow":{"bp":80,"type":"Psychic","category":"Special","statChange":null},"G-Max Befuddle":{"bp":10,"type":"Bug","category":"Physical","statChange":null},"G-Max Cannonade":{"bp":10,"type":"Water","category":"Physical","statChange":null},"G-Max Centiferno":{"bp":10,"type":"Fire","category":"Physical","statChange":null},"G-Max Chi Strike":{"bp":10,"type":"Fighting","category":"Physical","statChange":null},"G-Max Cuddle":{"bp":10,"type":"Normal","category":"Physical","statChange":null},"G-Max Depletion":{"bp":10,"type":"Dragon","category":"Physical","statChange":null},"G-Max Drum Solo":{"bp":160,"type":"Grass","category":"Physical","statChange":null},"G-Max Finale":{"bp":10,"type":"Fairy","category":"Physical","statChange":null},"G-Max Fireball":{"bp":160,"type":"Fire","category":"Physical","statChange":null},"G-Max Foam Burst":{"bp":10,"type":"Water","category":"Physical","statChange":null},"G-Max Gold Rush":{"bp":10,"type":"Normal","category":"Physical","statChange":null},"G-Max Gravitas":{"bp":10,"type":"Psychic","category":"Physical","statChange":null},"G-Max Hydrosnipe":{"bp":160,"type":"Water","category":"Physical","statChange":null},"G-Max Malodor":{"bp":10,"type":"Poison","category":"Physical","statChange":null},"G-Max Meltdown":{"bp":10,"type":"Steel","category":"Physical","statChange":null},"G-Max One Blow":{"bp":10,"type":"Dark","category":"Physical","statChange":null},"G-Max Rapid Flow":{"bp":10,"type":"Water","category":"Physical","statChange":null},"G-Max Replenish":{"bp":10,"type":"Normal","category":"Physical","statChange":null},"G-Max Resonance":{"bp":10,"type":"Ice","category":"Physical","statChange":null},"G-Max Sandblast":{"bp":10,"type":"Ground","category":"Physical","statChange":null},"G-Max Smite":{"bp":10,"type":"Fairy","category":"Physical","statChange":null},"G-Max Snooze":{"bp":10,"type":"Dark","category":"Physical","statChange":null},"G-Max Steelsurge":{"bp":10,"type":"Steel","category":"Physical","statChange":null},"G-Max Stonesurge":{"bp":10,"type":"Water","category":"Physical","statChange":null},"G-Max Stun Shock":{"bp":10,"type":"Electric","category":"Physical","statChange":null},"G-Max Sweetness":{"bp":10,"type":"Grass","category":"Physical","statChange":null},"G-Max Tartness":{"bp":10,"type":"Grass","category":"Physical","statChange":null},"G-Max Terror":{"bp":10,"type":"Ghost","category":"Physical","statChange":null},"G-Max Vine Lash":{"bp":10,"type":"Grass","category":"Physical","statChange":null},"G-Max Volcalith":{"bp":10,"type":"Rock","category":"Physical","statChange":null},"G-Max Volt Crash":{"bp":10,"type":"Electric","category":"Physical","statChange":null},"G-Max Wildfire":{"bp":10,"type":"Fire","category":"Physical","statChange":null},"G-Max Wind Rage":{"bp":10,"type":"Flying","category":"Physical","statChange":null},"Grass Knot":{"bp":0,"type":"Grass","category":"Special","statChange":null},"Grass Pledge":{"bp":80,"type":"Grass","category":"Special","statChange":null},"Grass Whistle":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Grassy Glide":{"bp":55,"type":"Grass","category":"Physical","statChange":null},"Grassy Terrain":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Grav Apple":{"bp":80,"type":"Grass","category":"Physical","statChange":null},"Gravity":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Growl":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Growth":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Grudge":{"bp":0,"type":"Ghost","category":"Status","statChange":null},"Guardian of Alola":{"bp":0,"type":"Fairy","category":"Special","statChange":null},"Guard Split":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Guard Swap":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Guillotine":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Gunk Shot":{"bp":120,"type":"Poison","category":"Physical","statChange":null},"Gust":{"bp":40,"type":"Flying","category":"Special","statChange":null},"Gyro Ball":{"bp":0,"type":"Steel","category":"Physical","statChange":null},"Hail":{"bp":0,"type":"Ice","category":"Status","statChange":null},"Hammer Arm":{"bp":100,"type":"Fighting","category":"Physical","statChange":null},"Happy Hour":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Harden":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Hard Press":{"bp":0,"type":"Steel","category":"Physical","statChange":null},"Haze":{"bp":0,"type":"Ice","category":"Status","statChange":null},"Headbutt":{"bp":70,"type":"Normal","category":"Physical","statChange":null},"Head Charge":{"bp":120,"type":"Normal","category":"Physical","statChange":null},"Headlong Rush":{"bp":120,"type":"Ground","category":"Physical","statChange":null},"Head Smash":{"bp":150,"type":"Rock","category":"Physical","statChange":null},"Heal Bell":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Heal Block":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Healing Wish":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Heal Order":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Heal Pulse":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Heart Stamp":{"bp":60,"type":"Psychic","category":"Physical","statChange":null},"Heart Swap":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Heat Crash":{"bp":0,"type":"Fire","category":"Physical","statChange":null},"Heat Wave":{"bp":95,"type":"Fire","category":"Special","statChange":null},"Heavy Slam":{"bp":0,"type":"Steel","category":"Physical","statChange":null},"Helping Hand":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Hex":{"bp":65,"type":"Ghost","category":"Special","statChange":null},"Hidden Power":{"bp":60,"type":"Normal","category":"Special","statChange":null},"Hidden Power Bug":{"bp":60,"type":"Bug","category":"Special","statChange":null},"Hidden Power Dark":{"bp":60,"type":"Dark","category":"Special","statChange":null},"Hidden Power Dragon":{"bp":60,"type":"Dragon","category":"Special","statChange":null},"Hidden Power Electric":{"bp":60,"type":"Electric","category":"Special","statChange":null},"Hidden Power Fighting":{"bp":60,"type":"Fighting","category":"Special","statChange":null},"Hidden Power Fire":{"bp":60,"type":"Fire","category":"Special","statChange":null},"Hidden Power Flying":{"bp":60,"type":"Flying","category":"Special","statChange":null},"Hidden Power Ghost":{"bp":60,"type":"Ghost","category":"Special","statChange":null},"Hidden Power Grass":{"bp":60,"type":"Grass","category":"Special","statChange":null},"Hidden Power Ground":{"bp":60,"type":"Ground","category":"Special","statChange":null},"Hidden Power Ice":{"bp":60,"type":"Ice","category":"Special","statChange":null},"Hidden Power Poison":{"bp":60,"type":"Poison","category":"Special","statChange":null},"Hidden Power Psychic":{"bp":60,"type":"Psychic","category":"Special","statChange":null},"Hidden Power Rock":{"bp":60,"type":"Rock","category":"Special","statChange":null},"Hidden Power Steel":{"bp":60,"type":"Steel","category":"Special","statChange":null},"Hidden Power Water":{"bp":60,"type":"Water","category":"Special","statChange":null},"High Horsepower":{"bp":95,"type":"Ground","category":"Physical","statChange":null},"High Jump Kick":{"bp":130,"type":"Fighting","category":"Physical","statChange":null},"Hold Back":{"bp":40,"type":"Normal","category":"Physical","statChange":null},"Hold Hands":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Hone Claws":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Horn Attack":{"bp":65,"type":"Normal","category":"Physical","statChange":null},"Horn Drill":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Horn Leech":{"bp":75,"type":"Grass","category":"Physical","statChange":null},"Howl":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Hurricane":{"bp":110,"type":"Flying","category":"Special","statChange":null},"Hydro Cannon":{"bp":150,"type":"Water","category":"Special","statChange":null},"Hydro Pump":{"bp":110,"type":"Water","category":"Special","statChange":null},"Hydro Steam":{"bp":80,"type":"Water","category":"Special","statChange":null},"Hydro Vortex":{"bp":1,"type":"Water","category":"Physical","statChange":null},"Hyper Beam":{"bp":150,"type":"Normal","category":"Special","statChange":null},"Hyper Drill":{"bp":100,"type":"Normal","category":"Physical","statChange":null},"Hyper Fang":{"bp":80,"type":"Normal","category":"Physical","statChange":null},"Hyperspace Fury":{"bp":100,"type":"Dark","category":"Physical","statChange":null},"Hyperspace Hole":{"bp":80,"type":"Psychic","category":"Special","statChange":null},"Hyper Voice":{"bp":90,"type":"Normal","category":"Special","statChange":null},"Hypnosis":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Ice Ball":{"bp":30,"type":"Ice","category":"Physical","statChange":null},"Ice Beam":{"bp":90,"type":"Ice","category":"Special","statChange":null},"Ice Burn":{"bp":140,"type":"Ice","category":"Special","statChange":null},"Ice Fang":{"bp":65,"type":"Ice","category":"Physical","statChange":null},"Ice Hammer":{"bp":100,"type":"Ice","category":"Physical","statChange":null},"Ice Punch":{"bp":75,"type":"Ice","category":"Physical","statChange":null},"Ice Shard":{"bp":40,"type":"Ice","category":"Physical","statChange":null},"Ice Spinner":{"bp":80,"type":"Ice","category":"Physical","statChange":null},"Icicle Crash":{"bp":85,"type":"Ice","category":"Physical","statChange":null},"Icicle Spear":{"bp":25,"type":"Ice","category":"Physical","statChange":null},"Icy Wind":{"bp":55,"type":"Ice","category":"Special","statChange":null},"Imprison":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Incinerate":{"bp":60,"type":"Fire","category":"Special","statChange":null},"Infernal Parade":{"bp":60,"type":"Ghost","category":"Special","statChange":null},"Inferno":{"bp":100,"type":"Fire","category":"Special","statChange":null},"Inferno Overdrive":{"bp":1,"type":"Fire","category":"Physical","statChange":null},"Infestation":{"bp":20,"type":"Bug","category":"Special","statChange":null},"Ingrain":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Instruct":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Ion Deluge":{"bp":0,"type":"Electric","category":"Status","statChange":null},"Iron Defense":{"bp":0,"type":"Steel","category":"Status","statChange":null},"Iron Head":{"bp":80,"type":"Steel","category":"Physical","statChange":null},"Iron Tail":{"bp":100,"type":"Steel","category":"Physical","statChange":null},"Ivy Cudgel":{"bp":100,"type":"Grass","category":"Physical","statChange":null},"Jaw Lock":{"bp":80,"type":"Dark","category":"Physical","statChange":null},"Jet Punch":{"bp":60,"type":"Water","category":"Physical","statChange":null},"Judgment":{"bp":100,"type":"Normal","category":"Special","statChange":null},"Jump Kick":{"bp":100,"type":"Fighting","category":"Physical","statChange":null},"Jungle Healing":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Karate Chop":{"bp":50,"type":"Fighting","category":"Physical","statChange":null},"Kinesis":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"King's Shield":{"bp":0,"type":"Steel","category":"Status","statChange":null},"Knock Off":{"bp":65,"type":"Dark","category":"Physical","statChange":null},"Kowtow Cleave":{"bp":85,"type":"Dark","category":"Physical","statChange":null},"Land's Wrath":{"bp":90,"type":"Ground","category":"Physical","statChange":null},"Laser Focus":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Lash Out":{"bp":75,"type":"Dark","category":"Physical","statChange":null},"Last Resort":{"bp":140,"type":"Normal","category":"Physical","statChange":null},"Last Respects":{"bp":50,"type":"Ghost","category":"Physical","statChange":null},"Lava Plume":{"bp":80,"type":"Fire","category":"Special","statChange":null},"Leafage":{"bp":40,"type":"Grass","category":"Physical","statChange":null},"Leaf Blade":{"bp":90,"type":"Grass","category":"Physical","statChange":null},"Leaf Storm":{"bp":130,"type":"Grass","category":"Special","statChange":null},"Leaf Tornado":{"bp":65,"type":"Grass","category":"Special","statChange":null},"Leech Life":{"bp":80,"type":"Bug","category":"Physical","statChange":null},"Leech Seed":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Leer":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Let's Snuggle Forever":{"bp":190,"type":"Fairy","category":"Physical","statChange":null},"Lick":{"bp":30,"type":"Ghost","category":"Physical","statChange":null},"Life Dew":{"bp":0,"type":"Water","category":"Status","statChange":null},"Light of Ruin":{"bp":140,"type":"Fairy","category":"Special","statChange":null},"Light Screen":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Light That Burns the Sky":{"bp":200,"type":"Psychic","category":"Special","statChange":null},"Liquidation":{"bp":85,"type":"Water","category":"Physical","statChange":null},"Lock-On":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Lovely Kiss":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Low Kick":{"bp":0,"type":"Fighting","category":"Physical","statChange":null},"Low Sweep":{"bp":65,"type":"Fighting","category":"Physical","statChange":null},"Lucky Chant":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Lumina Crash":{"bp":80,"type":"Psychic","category":"Special","statChange":null},"Lunar Blessing":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Lunar Dance":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Lunge":{"bp":80,"type":"Bug","category":"Physical","statChange":null},"Luster Purge":{"bp":95,"type":"Psychic","category":"Special","statChange":null},"Mach Punch":{"bp":40,"type":"Fighting","category":"Physical","statChange":null},"Magical Leaf":{"bp":60,"type":"Grass","category":"Special","statChange":null},"Magical Torque":{"bp":100,"type":"Fairy","category":"Physical","statChange":null},"Magic Coat":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Magic Powder":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Magic Room":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Magma Storm":{"bp":100,"type":"Fire","category":"Special","statChange":null},"Magnet Bomb":{"bp":60,"type":"Steel","category":"Physical","statChange":null},"Magnetic Flux":{"bp":0,"type":"Electric","category":"Status","statChange":null},"Magnet Rise":{"bp":0,"type":"Electric","category":"Status","statChange":null},"Magnitude":{"bp":0,"type":"Ground","category":"Physical","statChange":null},"Make It Rain":{"bp":120,"type":"Steel","category":"Special","statChange":null},"Malicious Moonsault":{"bp":180,"type":"Dark","category":"Physical","statChange":null},"Malignant Chain":{"bp":100,"type":"Poison","category":"Special","statChange":null},"Mat Block":{"bp":0,"type":"Fighting","category":"Status","statChange":null},"Matcha Gotcha":{"bp":80,"type":"Grass","category":"Special","statChange":null},"Max Airstream":{"bp":10,"type":"Flying","category":"Physical","statChange":null},"Max Darkness":{"bp":10,"type":"Dark","category":"Physical","statChange":null},"Max Flare":{"bp":100,"type":"Fire","category":"Physical","statChange":null},"Max Flutterby":{"bp":10,"type":"Bug","category":"Physical","statChange":null},"Max Geyser":{"bp":10,"type":"Water","category":"Physical","statChange":null},"Max Guard":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Max Hailstorm":{"bp":10,"type":"Ice","category":"Physical","statChange":null},"Max Knuckle":{"bp":10,"type":"Fighting","category":"Physical","statChange":null},"Max Lightning":{"bp":10,"type":"Electric","category":"Physical","statChange":null},"Max Mindstorm":{"bp":10,"type":"Psychic","category":"Physical","statChange":null},"Max Ooze":{"bp":10,"type":"Poison","category":"Physical","statChange":null},"Max Overgrowth":{"bp":10,"type":"Grass","category":"Physical","statChange":null},"Max Phantasm":{"bp":10,"type":"Ghost","category":"Physical","statChange":null},"Max Quake":{"bp":10,"type":"Ground","category":"Physical","statChange":null},"Max Rockfall":{"bp":10,"type":"Rock","category":"Physical","statChange":null},"Max Starfall":{"bp":10,"type":"Fairy","category":"Physical","statChange":null},"Max Steelspike":{"bp":10,"type":"Steel","category":"Physical","statChange":null},"Max Strike":{"bp":10,"type":"Normal","category":"Physical","statChange":null},"Max Wyrmwind":{"bp":10,"type":"Dragon","category":"Physical","statChange":null},"Mean Look":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Meditate":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Me First":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Mega Drain":{"bp":40,"type":"Grass","category":"Special","statChange":null},"Megahorn":{"bp":120,"type":"Bug","category":"Physical","statChange":null},"Mega Kick":{"bp":120,"type":"Normal","category":"Physical","statChange":null},"Mega Punch":{"bp":80,"type":"Normal","category":"Physical","statChange":null},"Memento":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Menacing Moonraze Maelstrom":{"bp":200,"type":"Ghost","category":"Special","statChange":null},"Metal Burst":{"bp":0,"type":"Steel","category":"Physical","statChange":null},"Metal Claw":{"bp":50,"type":"Steel","category":"Physical","statChange":null},"Metal Sound":{"bp":0,"type":"Steel","category":"Status","statChange":null},"Meteor Assault":{"bp":150,"type":"Fighting","category":"Physical","statChange":null},"Meteor Beam":{"bp":120,"type":"Rock","category":"Special","statChange":null},"Meteor Mash":{"bp":90,"type":"Steel","category":"Physical","statChange":null},"Metronome":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Mighty Cleave":{"bp":95,"type":"Rock","category":"Physical","statChange":null},"Milk Drink":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Mimic":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Mind Blown":{"bp":150,"type":"Fire","category":"Special","statChange":null},"Mind Reader":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Minimize":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Miracle Eye":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Mirror Coat":{"bp":0,"type":"Psychic","category":"Special","statChange":null},"Mirror Move":{"bp":0,"type":"Flying","category":"Status","statChange":null},"Mirror Shot":{"bp":65,"type":"Steel","category":"Special","statChange":null},"Mist":{"bp":0,"type":"Ice","category":"Status","statChange":null},"Mist Ball":{"bp":95,"type":"Psychic","category":"Special","statChange":null},"Misty Explosion":{"bp":100,"type":"Fairy","category":"Special","statChange":null},"Misty Terrain":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Moonblast":{"bp":95,"type":"Fairy","category":"Special","statChange":null},"Moongeist Beam":{"bp":100,"type":"Ghost","category":"Special","statChange":null},"Moonlight":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Morning Sun":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Mortal Spin":{"bp":30,"type":"Poison","category":"Physical","statChange":null},"Mountain Gale":{"bp":100,"type":"Ice","category":"Physical","statChange":null},"Mud Bomb":{"bp":65,"type":"Ground","category":"Special","statChange":null},"Muddy Water":{"bp":90,"type":"Water","category":"Special","statChange":null},"Mud Shot":{"bp":55,"type":"Ground","category":"Special","statChange":null},"Mud-Slap":{"bp":20,"type":"Ground","category":"Special","statChange":null},"Mud Sport":{"bp":0,"type":"Ground","category":"Status","statChange":null},"Multi-Attack":{"bp":120,"type":"Normal","category":"Physical","statChange":null},"Mystical Fire":{"bp":75,"type":"Fire","category":"Special","statChange":null},"Mystical Power":{"bp":70,"type":"Psychic","category":"Special","statChange":null},"Nasty Plot":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Natural Gift":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Nature Power":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Nature's Madness":{"bp":0,"type":"Fairy","category":"Special","statChange":null},"Needle Arm":{"bp":60,"type":"Grass","category":"Physical","statChange":null},"Never-Ending Nightmare":{"bp":1,"type":"Ghost","category":"Physical","statChange":null},"Night Daze":{"bp":85,"type":"Dark","category":"Special","statChange":null},"Nightmare":{"bp":0,"type":"Ghost","category":"Status","statChange":null},"Night Shade":{"bp":0,"type":"Ghost","category":"Special","statChange":null},"Night Slash":{"bp":70,"type":"Dark","category":"Physical","statChange":null},"Nihil Light":{"bp":100,"type":"Dragon","category":"Special","statChange":null},"Noble Roar":{"bp":0,"type":"Normal","category":"Status","statChange":null},"No Retreat":{"bp":0,"type":"Fighting","category":"Status","statChange":null},"Noxious Torque":{"bp":100,"type":"Poison","category":"Physical","statChange":null},"Nuzzle":{"bp":20,"type":"Electric","category":"Physical","statChange":null},"Oblivion Wing":{"bp":80,"type":"Flying","category":"Special","statChange":null},"Obstruct":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Oceanic Operetta":{"bp":195,"type":"Water","category":"Special","statChange":null},"Octazooka":{"bp":65,"type":"Water","category":"Special","statChange":null},"Octolock":{"bp":0,"type":"Fighting","category":"Status","statChange":null},"Odor Sleuth":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Ominous Wind":{"bp":60,"type":"Ghost","category":"Special","statChange":null},"Order Up":{"bp":80,"type":"Dragon","category":"Physical","statChange":null},"Origin Pulse":{"bp":110,"type":"Water","category":"Special","statChange":null},"Outrage":{"bp":120,"type":"Dragon","category":"Physical","statChange":null},"Overdrive":{"bp":80,"type":"Electric","category":"Special","statChange":null},"Overheat":{"bp":130,"type":"Fire","category":"Special","statChange":null},"Pain Split":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Parabolic Charge":{"bp":65,"type":"Electric","category":"Special","statChange":null},"Parting Shot":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Payback":{"bp":50,"type":"Dark","category":"Physical","statChange":null},"Pay Day":{"bp":40,"type":"Normal","category":"Physical","statChange":null},"Peck":{"bp":35,"type":"Flying","category":"Physical","statChange":null},"Perish Song":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Petal Blizzard":{"bp":90,"type":"Grass","category":"Physical","statChange":null},"Petal Dance":{"bp":120,"type":"Grass","category":"Special","statChange":null},"Phantom Force":{"bp":90,"type":"Ghost","category":"Physical","statChange":null},"Photon Geyser":{"bp":100,"type":"Psychic","category":"Special","statChange":null},"Pika Papow":{"bp":0,"type":"Electric","category":"Special","statChange":null},"Pin Missile":{"bp":25,"type":"Bug","category":"Physical","statChange":null},"Plasma Fists":{"bp":100,"type":"Electric","category":"Physical","statChange":null},"Play Nice":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Play Rough":{"bp":90,"type":"Fairy","category":"Physical","statChange":null},"Pluck":{"bp":60,"type":"Flying","category":"Physical","statChange":null},"Poison Fang":{"bp":50,"type":"Poison","category":"Physical","statChange":null},"Poison Gas":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Poison Jab":{"bp":80,"type":"Poison","category":"Physical","statChange":null},"Poison Powder":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Poison Sting":{"bp":15,"type":"Poison","category":"Physical","statChange":null},"Poison Tail":{"bp":50,"type":"Poison","category":"Physical","statChange":null},"Pollen Puff":{"bp":90,"type":"Bug","category":"Special","statChange":null},"Poltergeist":{"bp":110,"type":"Ghost","category":"Physical","statChange":null},"Population Bomb":{"bp":20,"type":"Normal","category":"Physical","statChange":null},"Pounce":{"bp":50,"type":"Bug","category":"Physical","statChange":null},"Pound":{"bp":40,"type":"Normal","category":"Physical","statChange":null},"Powder":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Powder Snow":{"bp":40,"type":"Ice","category":"Special","statChange":null},"Power Gem":{"bp":80,"type":"Rock","category":"Special","statChange":null},"Power Shift":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Power Split":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Power Swap":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Power Trick":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Power Trip":{"bp":20,"type":"Dark","category":"Physical","statChange":null},"Power-Up Punch":{"bp":40,"type":"Fighting","category":"Physical","statChange":null},"Power Whip":{"bp":120,"type":"Grass","category":"Physical","statChange":null},"Precipice Blades":{"bp":120,"type":"Ground","category":"Physical","statChange":null},"Present":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Prismatic Laser":{"bp":160,"type":"Psychic","category":"Special","statChange":null},"Protect":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Psybeam":{"bp":65,"type":"Psychic","category":"Special","statChange":null},"Psyblade":{"bp":80,"type":"Psychic","category":"Physical","statChange":null},"Psychic":{"bp":90,"type":"Psychic","category":"Special","statChange":null},"Psychic Fangs":{"bp":85,"type":"Psychic","category":"Physical","statChange":null},"Psychic Noise":{"bp":75,"type":"Psychic","category":"Special","statChange":null},"Psychic Terrain":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Psycho Boost":{"bp":140,"type":"Psychic","category":"Special","statChange":null},"Psycho Cut":{"bp":70,"type":"Psychic","category":"Physical","statChange":null},"Psycho Shift":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Psych Up":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Psyshield Bash":{"bp":70,"type":"Psychic","category":"Physical","statChange":null},"Psyshock":{"bp":80,"type":"Psychic","category":"Special","statChange":null},"Psystrike":{"bp":100,"type":"Psychic","category":"Special","statChange":null},"Psywave":{"bp":0,"type":"Psychic","category":"Special","statChange":null},"Pulverizing Pancake":{"bp":210,"type":"Normal","category":"Physical","statChange":null},"Punishment":{"bp":0,"type":"Dark","category":"Physical","statChange":null},"Purify":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Pursuit":{"bp":40,"type":"Dark","category":"Physical","statChange":null},"Pyro Ball":{"bp":120,"type":"Fire","category":"Physical","statChange":null},"Quash":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Quick Attack":{"bp":40,"type":"Normal","category":"Physical","statChange":null},"Quick Guard":{"bp":0,"type":"Fighting","category":"Status","statChange":null},"Quiver Dance":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Rage":{"bp":20,"type":"Normal","category":"Physical","statChange":null},"Rage Fist":{"bp":50,"type":"Ghost","category":"Physical","statChange":null},"Rage Powder":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Raging Bull":{"bp":90,"type":"Normal","category":"Physical","statChange":null},"Raging Fury":{"bp":120,"type":"Fire","category":"Physical","statChange":null},"Rain Dance":{"bp":0,"type":"Water","category":"Status","statChange":null},"Rapid Spin":{"bp":50,"type":"Normal","category":"Physical","statChange":null},"Razor Leaf":{"bp":55,"type":"Grass","category":"Physical","statChange":null},"Razor Shell":{"bp":75,"type":"Water","category":"Physical","statChange":null},"Razor Wind":{"bp":80,"type":"Normal","category":"Special","statChange":null},"Recover":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Recycle":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Reflect":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Reflect Type":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Refresh":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Relic Song":{"bp":75,"type":"Normal","category":"Special","statChange":null},"Rest":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Retaliate":{"bp":70,"type":"Normal","category":"Physical","statChange":null},"Return":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Revelation Dance":{"bp":90,"type":"Normal","category":"Special","statChange":null},"Revenge":{"bp":60,"type":"Fighting","category":"Physical","statChange":null},"Reversal":{"bp":0,"type":"Fighting","category":"Physical","statChange":null},"Revival Blessing":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Rising Voltage":{"bp":70,"type":"Electric","category":"Special","statChange":null},"Roar":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Roar of Time":{"bp":150,"type":"Dragon","category":"Special","statChange":null},"Rock Blast":{"bp":25,"type":"Rock","category":"Physical","statChange":null},"Rock Climb":{"bp":90,"type":"Normal","category":"Physical","statChange":null},"Rock Polish":{"bp":0,"type":"Rock","category":"Status","statChange":null},"Rock Slide":{"bp":75,"type":"Rock","category":"Physical","statChange":null},"Rock Smash":{"bp":40,"type":"Fighting","category":"Physical","statChange":null},"Rock Throw":{"bp":50,"type":"Rock","category":"Physical","statChange":null},"Rock Tomb":{"bp":60,"type":"Rock","category":"Physical","statChange":null},"Rock Wrecker":{"bp":150,"type":"Rock","category":"Physical","statChange":null},"Role Play":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Rolling Kick":{"bp":60,"type":"Fighting","category":"Physical","statChange":null},"Rollout":{"bp":30,"type":"Rock","category":"Physical","statChange":null},"Roost":{"bp":0,"type":"Flying","category":"Status","statChange":null},"Rototiller":{"bp":0,"type":"Ground","category":"Status","statChange":null},"Round":{"bp":60,"type":"Normal","category":"Special","statChange":null},"Ruination":{"bp":0,"type":"Dark","category":"Special","statChange":null},"Sacred Fire":{"bp":100,"type":"Fire","category":"Physical","statChange":null},"Sacred Sword":{"bp":90,"type":"Fighting","category":"Physical","statChange":null},"Safeguard":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Salt Cure":{"bp":40,"type":"Rock","category":"Physical","statChange":null},"Sand Attack":{"bp":0,"type":"Ground","category":"Status","statChange":null},"Sandsear Storm":{"bp":100,"type":"Ground","category":"Special","statChange":null},"Sandstorm":{"bp":0,"type":"Rock","category":"Status","statChange":null},"Sand Tomb":{"bp":35,"type":"Ground","category":"Physical","statChange":null},"Sappy Seed":{"bp":100,"type":"Grass","category":"Physical","statChange":null},"Savage Spin-Out":{"bp":1,"type":"Bug","category":"Physical","statChange":null},"Scald":{"bp":80,"type":"Water","category":"Special","statChange":null},"Scale Shot":{"bp":25,"type":"Dragon","category":"Physical","statChange":null},"Scary Face":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Scorching Sands":{"bp":70,"type":"Ground","category":"Special","statChange":null},"Scratch":{"bp":40,"type":"Normal","category":"Physical","statChange":null},"Screech":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Searing Shot":{"bp":100,"type":"Fire","category":"Special","statChange":null},"Searing Sunraze Smash":{"bp":200,"type":"Steel","category":"Physical","statChange":null},"Secret Power":{"bp":70,"type":"Normal","category":"Physical","statChange":null},"Secret Sword":{"bp":85,"type":"Fighting","category":"Special","statChange":null},"Seed Bomb":{"bp":80,"type":"Grass","category":"Physical","statChange":null},"Seed Flare":{"bp":120,"type":"Grass","category":"Special","statChange":null},"Seismic Toss":{"bp":0,"type":"Fighting","category":"Physical","statChange":null},"Self-Destruct":{"bp":200,"type":"Normal","category":"Physical","statChange":null},"Shadow Ball":{"bp":80,"type":"Ghost","category":"Special","statChange":null},"Shadow Bone":{"bp":85,"type":"Ghost","category":"Physical","statChange":null},"Shadow Claw":{"bp":70,"type":"Ghost","category":"Physical","statChange":null},"Shadow Force":{"bp":120,"type":"Ghost","category":"Physical","statChange":null},"Shadow Punch":{"bp":60,"type":"Ghost","category":"Physical","statChange":null},"Shadow Sneak":{"bp":40,"type":"Ghost","category":"Physical","statChange":null},"Sharpen":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Shattered Psyche":{"bp":1,"type":"Psychic","category":"Physical","statChange":null},"Shed Tail":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Sheer Cold":{"bp":0,"type":"Ice","category":"Special","statChange":null},"Shell Side Arm":{"bp":90,"type":"Poison","category":"Special","statChange":null},"Shell Smash":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Shell Trap":{"bp":150,"type":"Fire","category":"Special","statChange":null},"Shelter":{"bp":0,"type":"Steel","category":"Status","statChange":null},"Shift Gear":{"bp":0,"type":"Steel","category":"Status","statChange":null},"Shock Wave":{"bp":60,"type":"Electric","category":"Special","statChange":null},"Shore Up":{"bp":0,"type":"Ground","category":"Status","statChange":null},"Signal Beam":{"bp":75,"type":"Bug","category":"Special","statChange":null},"Silk Trap":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Silver Wind":{"bp":60,"type":"Bug","category":"Special","statChange":null},"Simple Beam":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Sing":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Sinister Arrow Raid":{"bp":180,"type":"Ghost","category":"Physical","statChange":null},"Sizzly Slide":{"bp":60,"type":"Fire","category":"Physical","statChange":null},"Sketch":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Skill Swap":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Skitter Smack":{"bp":70,"type":"Bug","category":"Physical","statChange":null},"Skull Bash":{"bp":130,"type":"Normal","category":"Physical","statChange":null},"Sky Attack":{"bp":140,"type":"Flying","category":"Physical","statChange":null},"Sky Drop":{"bp":60,"type":"Flying","category":"Physical","statChange":null},"Sky Uppercut":{"bp":85,"type":"Fighting","category":"Physical","statChange":null},"Slack Off":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Slam":{"bp":80,"type":"Normal","category":"Physical","statChange":null},"Slash":{"bp":70,"type":"Normal","category":"Physical","statChange":null},"Sleep Powder":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Sleep Talk":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Sludge":{"bp":65,"type":"Poison","category":"Special","statChange":null},"Sludge Bomb":{"bp":90,"type":"Poison","category":"Special","statChange":null},"Sludge Wave":{"bp":95,"type":"Poison","category":"Special","statChange":null},"Smack Down":{"bp":50,"type":"Rock","category":"Physical","statChange":null},"Smart Strike":{"bp":70,"type":"Steel","category":"Physical","statChange":null},"Smelling Salts":{"bp":70,"type":"Normal","category":"Physical","statChange":null},"Smog":{"bp":30,"type":"Poison","category":"Special","statChange":null},"Smokescreen":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Snap Trap":{"bp":35,"type":"Grass","category":"Physical","statChange":null},"Snarl":{"bp":55,"type":"Dark","category":"Special","statChange":null},"Snatch":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Snipe Shot":{"bp":80,"type":"Water","category":"Special","statChange":null},"Snore":{"bp":50,"type":"Normal","category":"Special","statChange":null},"Snowscape":{"bp":0,"type":"Ice","category":"Status","statChange":null},"Soak":{"bp":0,"type":"Water","category":"Status","statChange":null},"Soft-Boiled":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Solar Beam":{"bp":120,"type":"Grass","category":"Special","statChange":null},"Solar Blade":{"bp":125,"type":"Grass","category":"Physical","statChange":null},"Sonic Boom":{"bp":0,"type":"Normal","category":"Special","statChange":null},"Soul-Stealing 7-Star Strike":{"bp":195,"type":"Ghost","category":"Physical","statChange":null},"Spacial Rend":{"bp":100,"type":"Dragon","category":"Special","statChange":null},"Spark":{"bp":65,"type":"Electric","category":"Physical","statChange":null},"Sparkling Aria":{"bp":90,"type":"Water","category":"Special","statChange":null},"Sparkly Swirl":{"bp":120,"type":"Fairy","category":"Special","statChange":null},"Spectral Thief":{"bp":90,"type":"Ghost","category":"Physical","statChange":null},"Speed Swap":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Spicy Extract":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Spider Web":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Spike Cannon":{"bp":20,"type":"Normal","category":"Physical","statChange":null},"Spikes":{"bp":0,"type":"Ground","category":"Status","statChange":null},"Spiky Shield":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Spin Out":{"bp":100,"type":"Steel","category":"Physical","statChange":null},"Spirit Break":{"bp":75,"type":"Fairy","category":"Physical","statChange":null},"Spirit Shackle":{"bp":80,"type":"Ghost","category":"Physical","statChange":null},"Spite":{"bp":0,"type":"Ghost","category":"Status","statChange":null},"Spit Up":{"bp":0,"type":"Normal","category":"Special","statChange":null},"Splash":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Splintered Stormshards":{"bp":190,"type":"Rock","category":"Physical","statChange":null},"Splishy Splash":{"bp":90,"type":"Water","category":"Special","statChange":null},"Spore":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Spotlight":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Springtide Storm":{"bp":100,"type":"Fairy","category":"Special","statChange":null},"Stealth Rock":{"bp":0,"type":"Rock","category":"Status","statChange":null},"Steam Eruption":{"bp":110,"type":"Water","category":"Special","statChange":null},"Steamroller":{"bp":65,"type":"Bug","category":"Physical","statChange":null},"Steel Beam":{"bp":140,"type":"Steel","category":"Special","statChange":null},"Steel Roller":{"bp":130,"type":"Steel","category":"Physical","statChange":null},"Steel Wing":{"bp":70,"type":"Steel","category":"Physical","statChange":null},"Sticky Web":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Stockpile":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Stoked Sparksurfer":{"bp":175,"type":"Electric","category":"Special","statChange":null},"Stomp":{"bp":65,"type":"Normal","category":"Physical","statChange":null},"Stomping Tantrum":{"bp":75,"type":"Ground","category":"Physical","statChange":null},"Stone Axe":{"bp":65,"type":"Rock","category":"Physical","statChange":null},"Stone Edge":{"bp":100,"type":"Rock","category":"Physical","statChange":null},"Stored Power":{"bp":20,"type":"Psychic","category":"Special","statChange":null},"Storm Throw":{"bp":60,"type":"Fighting","category":"Physical","statChange":null},"Strange Steam":{"bp":90,"type":"Fairy","category":"Special","statChange":null},"Strength":{"bp":80,"type":"Normal","category":"Physical","statChange":null},"Strength Sap":{"bp":0,"type":"Grass","category":"Status","statChange":null},"String Shot":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Struggle":{"bp":50,"type":"Normal","category":"Physical","statChange":null},"Struggle Bug":{"bp":50,"type":"Bug","category":"Special","statChange":null},"Stuff Cheeks":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Stun Spore":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Submission":{"bp":80,"type":"Fighting","category":"Physical","statChange":null},"Substitute":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Subzero Slammer":{"bp":1,"type":"Ice","category":"Physical","statChange":null},"Sucker Punch":{"bp":70,"type":"Dark","category":"Physical","statChange":null},"Sunny Day":{"bp":0,"type":"Fire","category":"Status","statChange":null},"Sunsteel Strike":{"bp":100,"type":"Steel","category":"Physical","statChange":null},"Supercell Slam":{"bp":100,"type":"Electric","category":"Physical","statChange":null},"Super Fang":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Superpower":{"bp":120,"type":"Fighting","category":"Physical","statChange":null},"Supersonic":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Supersonic Skystrike":{"bp":1,"type":"Flying","category":"Physical","statChange":null},"Surf":{"bp":90,"type":"Water","category":"Special","statChange":null},"Surging Strikes":{"bp":25,"type":"Water","category":"Physical","statChange":null},"Swagger":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Swallow":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Sweet Kiss":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Sweet Scent":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Swift":{"bp":60,"type":"Normal","category":"Special","statChange":null},"Switcheroo":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Swords Dance":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Synchronoise":{"bp":120,"type":"Psychic","category":"Special","statChange":null},"Synthesis":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Syrup Bomb":{"bp":60,"type":"Grass","category":"Special","statChange":null},"Tachyon Cutter":{"bp":50,"type":"Steel","category":"Special","statChange":null},"Tackle":{"bp":40,"type":"Normal","category":"Physical","statChange":null},"Tail Glow":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Tail Slap":{"bp":25,"type":"Normal","category":"Physical","statChange":null},"Tail Whip":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Tailwind":{"bp":0,"type":"Flying","category":"Status","statChange":null},"Take Down":{"bp":90,"type":"Normal","category":"Physical","statChange":null},"Take Heart":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Tar Shot":{"bp":0,"type":"Rock","category":"Status","statChange":null},"Taunt":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Tearful Look":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Teatime":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Techno Blast":{"bp":120,"type":"Normal","category":"Special","statChange":null},"Tectonic Rage":{"bp":1,"type":"Ground","category":"Physical","statChange":null},"Teeter Dance":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Telekinesis":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Teleport":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Temper Flare":{"bp":75,"type":"Fire","category":"Physical","statChange":null},"Tera Blast":{"bp":80,"type":"Normal","category":"Special","statChange":null},"Tera Starstorm":{"bp":120,"type":"Normal","category":"Special","statChange":null},"Terrain Pulse":{"bp":50,"type":"Normal","category":"Special","statChange":null},"Thief":{"bp":60,"type":"Dark","category":"Physical","statChange":null},"Thousand Arrows":{"bp":90,"type":"Ground","category":"Physical","statChange":null},"Thousand Waves":{"bp":90,"type":"Ground","category":"Physical","statChange":null},"Thrash":{"bp":120,"type":"Normal","category":"Physical","statChange":null},"Throat Chop":{"bp":80,"type":"Dark","category":"Physical","statChange":null},"Thunder":{"bp":110,"type":"Electric","category":"Special","statChange":null},"Thunderbolt":{"bp":90,"type":"Electric","category":"Special","statChange":null},"Thunder Cage":{"bp":80,"type":"Electric","category":"Special","statChange":null},"Thunderclap":{"bp":70,"type":"Electric","category":"Special","statChange":null},"Thunder Fang":{"bp":65,"type":"Electric","category":"Physical","statChange":null},"Thunderous Kick":{"bp":90,"type":"Fighting","category":"Physical","statChange":null},"Thunder Punch":{"bp":75,"type":"Electric","category":"Physical","statChange":null},"Thunder Shock":{"bp":40,"type":"Electric","category":"Special","statChange":null},"Thunder Wave":{"bp":0,"type":"Electric","category":"Status","statChange":null},"Tickle":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Tidy Up":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Topsy-Turvy":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Torch Song":{"bp":80,"type":"Fire","category":"Special","statChange":null},"Torment":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Toxic":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Toxic Spikes":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Toxic Thread":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Trailblaze":{"bp":50,"type":"Grass","category":"Physical","statChange":null},"Transform":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Tri Attack":{"bp":80,"type":"Normal","category":"Special","statChange":null},"Trick":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Trick-or-Treat":{"bp":0,"type":"Ghost","category":"Status","statChange":null},"Trick Room":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Triple Arrows":{"bp":90,"type":"Fighting","category":"Physical","statChange":null},"Triple Axel":{"bp":20,"type":"Ice","category":"Physical","statChange":null},"Triple Dive":{"bp":30,"type":"Water","category":"Physical","statChange":null},"Triple Kick":{"bp":10,"type":"Fighting","category":"Physical","statChange":null},"Trop Kick":{"bp":70,"type":"Grass","category":"Physical","statChange":null},"Trump Card":{"bp":0,"type":"Normal","category":"Special","statChange":null},"Twin Beam":{"bp":40,"type":"Psychic","category":"Special","statChange":null},"Twineedle":{"bp":25,"type":"Bug","category":"Physical","statChange":null},"Twinkle Tackle":{"bp":1,"type":"Fairy","category":"Physical","statChange":null},"Twister":{"bp":40,"type":"Dragon","category":"Special","statChange":null},"Upper Hand":{"bp":65,"type":"Fighting","category":"Physical","statChange":null},"Uproar":{"bp":90,"type":"Normal","category":"Special","statChange":null},"U-turn":{"bp":70,"type":"Bug","category":"Physical","statChange":null},"Vacuum Wave":{"bp":40,"type":"Fighting","category":"Special","statChange":null},"V-create":{"bp":180,"type":"Fire","category":"Physical","statChange":null},"Veevee Volley":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Venom Drench":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Venoshock":{"bp":65,"type":"Poison","category":"Special","statChange":null},"Victory Dance":{"bp":0,"type":"Fighting","category":"Status","statChange":null},"Vine Whip":{"bp":45,"type":"Grass","category":"Physical","statChange":null},"Vise Grip":{"bp":55,"type":"Normal","category":"Physical","statChange":null},"Vital Throw":{"bp":70,"type":"Fighting","category":"Physical","statChange":null},"Volt Switch":{"bp":70,"type":"Electric","category":"Special","statChange":null},"Volt Tackle":{"bp":120,"type":"Electric","category":"Physical","statChange":null},"Wake-Up Slap":{"bp":70,"type":"Fighting","category":"Physical","statChange":null},"Waterfall":{"bp":80,"type":"Water","category":"Physical","statChange":null},"Water Gun":{"bp":40,"type":"Water","category":"Special","statChange":null},"Water Pledge":{"bp":80,"type":"Water","category":"Special","statChange":null},"Water Pulse":{"bp":60,"type":"Water","category":"Special","statChange":null},"Water Shuriken":{"bp":15,"type":"Water","category":"Special","statChange":null},"Water Sport":{"bp":0,"type":"Water","category":"Status","statChange":null},"Water Spout":{"bp":150,"type":"Water","category":"Special","statChange":null},"Wave Crash":{"bp":120,"type":"Water","category":"Physical","statChange":null},"Weather Ball":{"bp":50,"type":"Normal","category":"Special","statChange":null},"Whirlpool":{"bp":35,"type":"Water","category":"Special","statChange":null},"Whirlwind":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Wicked Blow":{"bp":75,"type":"Dark","category":"Physical","statChange":null},"Wicked Torque":{"bp":80,"type":"Dark","category":"Physical","statChange":null},"Wide Guard":{"bp":0,"type":"Rock","category":"Status","statChange":null},"Wildbolt Storm":{"bp":100,"type":"Electric","category":"Special","statChange":null},"Wild Charge":{"bp":90,"type":"Electric","category":"Physical","statChange":null},"Will-O-Wisp":{"bp":0,"type":"Fire","category":"Status","statChange":null},"Wing Attack":{"bp":60,"type":"Flying","category":"Physical","statChange":null},"Wish":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Withdraw":{"bp":0,"type":"Water","category":"Status","statChange":null},"Wonder Room":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Wood Hammer":{"bp":120,"type":"Grass","category":"Physical","statChange":null},"Work Up":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Worry Seed":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Wrap":{"bp":15,"type":"Normal","category":"Physical","statChange":null},"Wring Out":{"bp":0,"type":"Normal","category":"Special","statChange":null},"X-Scissor":{"bp":80,"type":"Bug","category":"Physical","statChange":null},"Yawn":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Zap Cannon":{"bp":120,"type":"Electric","category":"Special","statChange":null},"Zen Headbutt":{"bp":80,"type":"Psychic","category":"Physical","statChange":null},"Zing Zap":{"bp":80,"type":"Electric","category":"Physical","statChange":null},"Zippy Zap":{"bp":80,"type":"Electric","category":"Physical","statChange":null},"Paleo Wave":{"bp":85,"type":"Rock","category":"Special","statChange":null},"Shadow Strike":{"bp":80,"type":"Ghost","category":"Physical","statChange":null},"Polar Flare":{"bp":75,"type":"Fire","category":"Special","statChange":null}},
});

// Re-export for the adapter
const { GET_DAMAGE_SV, GET_DAMAGE_HANDLER, CALCULATE_ALL_MOVES_SV, getKOChanceText, buildDescription, pokeRound, chainMods, getModifiedStat, getFinalSpeed } = __ncpCalc;
export { GET_DAMAGE_SV, GET_DAMAGE_HANDLER, CALCULATE_ALL_MOVES_SV, getKOChanceText, buildDescription, pokeRound, chainMods, getModifiedStat, getFinalSpeed };
export const gen = 10;
export const AT = 0, DF = 1, SA = 2, SD = 3, SP = 4;
export const STATS = [0, 1, 2, 3, 4];
export const typeChart = {"Normal":{"Normal":1,"Fire":1,"Water":1,"Electric":1,"Grass":1,"Ice":1,"Fighting":1,"Poison":1,"Ground":1,"Flying":1,"Psychic":1,"Bug":1,"Rock":0.5,"Ghost":0,"Dragon":1,"Dark":1,"Steel":0.5,"Fairy":1},"Fire":{"Normal":1,"Fire":0.5,"Water":0.5,"Electric":1,"Grass":2,"Ice":2,"Fighting":1,"Poison":1,"Ground":1,"Flying":1,"Psychic":1,"Bug":2,"Rock":0.5,"Ghost":1,"Dragon":0.5,"Dark":1,"Steel":2,"Fairy":1},"Water":{"Normal":1,"Fire":2,"Water":0.5,"Electric":1,"Grass":0.5,"Ice":1,"Fighting":1,"Poison":1,"Ground":2,"Flying":1,"Psychic":1,"Bug":1,"Rock":2,"Ghost":1,"Dragon":0.5,"Dark":1,"Steel":1,"Fairy":1},"Electric":{"Normal":1,"Fire":1,"Water":2,"Electric":0.5,"Grass":0.5,"Ice":1,"Fighting":1,"Poison":1,"Ground":0,"Flying":2,"Psychic":1,"Bug":1,"Rock":1,"Ghost":1,"Dragon":0.5,"Dark":1,"Steel":1,"Fairy":1},"Grass":{"Normal":1,"Fire":0.5,"Water":2,"Electric":1,"Grass":0.5,"Ice":1,"Fighting":1,"Poison":0.5,"Ground":2,"Flying":0.5,"Psychic":1,"Bug":0.5,"Rock":2,"Ghost":1,"Dragon":0.5,"Dark":1,"Steel":0.5,"Fairy":1},"Ice":{"Normal":1,"Fire":0.5,"Water":0.5,"Electric":1,"Grass":2,"Ice":0.5,"Fighting":1,"Poison":1,"Ground":2,"Flying":2,"Psychic":1,"Bug":1,"Rock":1,"Ghost":1,"Dragon":2,"Dark":1,"Steel":0.5,"Fairy":1},"Fighting":{"Normal":2,"Fire":1,"Water":1,"Electric":1,"Grass":1,"Ice":2,"Fighting":1,"Poison":0.5,"Ground":1,"Flying":0.5,"Psychic":0.5,"Bug":0.5,"Rock":2,"Ghost":0,"Dragon":1,"Dark":2,"Steel":2,"Fairy":0.5},"Poison":{"Normal":1,"Fire":1,"Water":1,"Electric":1,"Grass":2,"Ice":1,"Fighting":1,"Poison":0.5,"Ground":0.5,"Flying":1,"Psychic":1,"Bug":1,"Rock":0.5,"Ghost":0.5,"Dragon":1,"Dark":1,"Steel":0,"Fairy":2},"Ground":{"Normal":1,"Fire":2,"Water":1,"Electric":2,"Grass":0.5,"Ice":1,"Fighting":1,"Poison":2,"Ground":1,"Flying":0,"Psychic":1,"Bug":0.5,"Rock":2,"Ghost":1,"Dragon":1,"Dark":1,"Steel":2,"Fairy":1},"Flying":{"Normal":1,"Fire":1,"Water":1,"Electric":0.5,"Grass":2,"Ice":1,"Fighting":2,"Poison":1,"Ground":1,"Flying":1,"Psychic":1,"Bug":2,"Rock":0.5,"Ghost":1,"Dragon":1,"Dark":1,"Steel":0.5,"Fairy":1},"Psychic":{"Normal":1,"Fire":1,"Water":1,"Electric":1,"Grass":1,"Ice":1,"Fighting":2,"Poison":2,"Ground":1,"Flying":1,"Psychic":0.5,"Bug":1,"Rock":1,"Ghost":1,"Dragon":1,"Dark":0,"Steel":0.5,"Fairy":1},"Bug":{"Normal":1,"Fire":0.5,"Water":1,"Electric":1,"Grass":2,"Ice":1,"Fighting":0.5,"Poison":0.5,"Ground":1,"Flying":0.5,"Psychic":2,"Bug":1,"Rock":1,"Ghost":0.5,"Dragon":1,"Dark":2,"Steel":0.5,"Fairy":0.5},"Rock":{"Normal":1,"Fire":2,"Water":1,"Electric":1,"Grass":1,"Ice":2,"Fighting":0.5,"Poison":1,"Ground":0.5,"Flying":2,"Psychic":1,"Bug":2,"Rock":1,"Ghost":1,"Dragon":1,"Dark":1,"Steel":0.5,"Fairy":1},"Ghost":{"Normal":0,"Fire":1,"Water":1,"Electric":1,"Grass":1,"Ice":1,"Fighting":1,"Poison":1,"Ground":1,"Flying":1,"Psychic":2,"Bug":1,"Rock":1,"Ghost":2,"Dragon":1,"Dark":0.5,"Steel":1,"Fairy":1},"Dragon":{"Normal":1,"Fire":1,"Water":1,"Electric":1,"Grass":1,"Ice":1,"Fighting":1,"Poison":1,"Ground":1,"Flying":1,"Psychic":1,"Bug":1,"Rock":1,"Ghost":1,"Dragon":2,"Dark":1,"Steel":0.5,"Fairy":0},"Dark":{"Normal":1,"Fire":1,"Water":1,"Electric":1,"Grass":1,"Ice":1,"Fighting":0.5,"Poison":1,"Ground":1,"Flying":1,"Psychic":2,"Bug":1,"Rock":1,"Ghost":2,"Dragon":1,"Dark":0.5,"Steel":0.5,"Fairy":0.5},"Steel":{"Normal":1,"Fire":0.5,"Water":0.5,"Electric":0.5,"Grass":1,"Ice":2,"Fighting":1,"Poison":1,"Ground":1,"Flying":1,"Psychic":1,"Bug":1,"Rock":2,"Ghost":1,"Dragon":1,"Dark":1,"Steel":0.5,"Fairy":2},"Fairy":{"Normal":1,"Fire":0.5,"Water":1,"Electric":1,"Grass":1,"Ice":1,"Fighting":2,"Poison":0.5,"Ground":1,"Flying":1,"Psychic":1,"Bug":1,"Rock":1,"Ghost":1,"Dragon":2,"Dark":2,"Steel":0.5,"Fairy":1}};
export const NATURES = {"Adamant":["at","sa"],"Bashful":["",""],"Bold":["df","at"],"Brave":["at","sp"],"Calm":["sd","at"],"Careful":["sd","sa"],"Docile":["",""],"Gentle":["sd","df"],"Hardy":["",""],"Hasty":["sp","df"],"Impish":["df","sa"],"Jolly":["sp","sa"],"Lax":["df","sd"],"Lonely":["at","df"],"Mild":["sa","df"],"Modest":["sa","at"],"Naive":["sp","sd"],"Naughty":["at","sd"],"Quiet":["sa","sp"],"Quirky":["",""],"Rash":["sa","sd"],"Relaxed":["df","sp"],"Sassy":["sd","sp"],"Serious":["",""],"Timid":["sp","at"]};
export const moves = {"10,000,000 Volt Thunderbolt":{"bp":195,"type":"Electric","category":"Special","statChange":null},"Absorb":{"bp":20,"type":"Grass","category":"Special","statChange":null},"Accelerock":{"bp":40,"type":"Rock","category":"Physical","statChange":null},"Acid":{"bp":40,"type":"Poison","category":"Special","statChange":null},"Acid Armor":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Acid Downpour":{"bp":1,"type":"Poison","category":"Physical","statChange":null},"Acid Spray":{"bp":40,"type":"Poison","category":"Special","statChange":null},"Acrobatics":{"bp":55,"type":"Flying","category":"Physical","statChange":null},"Acupressure":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Aerial Ace":{"bp":60,"type":"Flying","category":"Physical","statChange":null},"Aeroblast":{"bp":100,"type":"Flying","category":"Special","statChange":null},"After You":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Agility":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Air Cutter":{"bp":60,"type":"Flying","category":"Special","statChange":null},"Air Slash":{"bp":75,"type":"Flying","category":"Special","statChange":null},"All-Out Pummeling":{"bp":1,"type":"Fighting","category":"Physical","statChange":null},"Alluring Voice":{"bp":80,"type":"Fairy","category":"Special","statChange":null},"Ally Switch":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Amnesia":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Anchor Shot":{"bp":80,"type":"Steel","category":"Physical","statChange":null},"Ancient Power":{"bp":60,"type":"Rock","category":"Special","statChange":null},"Apple Acid":{"bp":80,"type":"Grass","category":"Special","statChange":null},"Aqua Cutter":{"bp":70,"type":"Water","category":"Physical","statChange":null},"Aqua Jet":{"bp":40,"type":"Water","category":"Physical","statChange":null},"Aqua Ring":{"bp":0,"type":"Water","category":"Status","statChange":null},"Aqua Step":{"bp":80,"type":"Water","category":"Physical","statChange":null},"Aqua Tail":{"bp":90,"type":"Water","category":"Physical","statChange":null},"Armor Cannon":{"bp":120,"type":"Fire","category":"Special","statChange":null},"Arm Thrust":{"bp":15,"type":"Fighting","category":"Physical","statChange":null},"Aromatherapy":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Aromatic Mist":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Assist":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Assurance":{"bp":60,"type":"Dark","category":"Physical","statChange":null},"Astonish":{"bp":30,"type":"Ghost","category":"Physical","statChange":null},"Astral Barrage":{"bp":120,"type":"Ghost","category":"Special","statChange":null},"Attack Order":{"bp":90,"type":"Bug","category":"Physical","statChange":null},"Attract":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Aura Sphere":{"bp":80,"type":"Fighting","category":"Special","statChange":null},"Aura Wheel":{"bp":110,"type":"Electric","category":"Physical","statChange":null},"Aurora Beam":{"bp":65,"type":"Ice","category":"Special","statChange":null},"Aurora Veil":{"bp":0,"type":"Ice","category":"Status","statChange":null},"Autotomize":{"bp":0,"type":"Steel","category":"Status","statChange":null},"Avalanche":{"bp":60,"type":"Ice","category":"Physical","statChange":null},"Axe Kick":{"bp":120,"type":"Fighting","category":"Physical","statChange":null},"Baby-Doll Eyes":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Baddy Bad":{"bp":80,"type":"Dark","category":"Special","statChange":null},"Baneful Bunker":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Barb Barrage":{"bp":60,"type":"Poison","category":"Physical","statChange":null},"Barrage":{"bp":15,"type":"Normal","category":"Physical","statChange":null},"Barrier":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Baton Pass":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Beak Blast":{"bp":100,"type":"Flying","category":"Physical","statChange":null},"Beat Up":{"bp":0,"type":"Dark","category":"Physical","statChange":null},"Behemoth Bash":{"bp":100,"type":"Steel","category":"Physical","statChange":null},"Behemoth Blade":{"bp":100,"type":"Steel","category":"Physical","statChange":null},"Belch":{"bp":120,"type":"Poison","category":"Special","statChange":null},"Belly Drum":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Bestow":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Bide":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Bind":{"bp":15,"type":"Normal","category":"Physical","statChange":null},"Bite":{"bp":60,"type":"Dark","category":"Physical","statChange":null},"Bitter Blade":{"bp":90,"type":"Fire","category":"Physical","statChange":null},"Bitter Malice":{"bp":75,"type":"Ghost","category":"Special","statChange":null},"Black Hole Eclipse":{"bp":1,"type":"Dark","category":"Physical","statChange":null},"Blast Burn":{"bp":150,"type":"Fire","category":"Special","statChange":null},"Blaze Kick":{"bp":85,"type":"Fire","category":"Physical","statChange":null},"Blazing Torque":{"bp":80,"type":"Fire","category":"Physical","statChange":null},"Bleakwind Storm":{"bp":100,"type":"Flying","category":"Special","statChange":null},"Blizzard":{"bp":110,"type":"Ice","category":"Special","statChange":null},"Block":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Blood Moon":{"bp":140,"type":"Normal","category":"Special","statChange":null},"Bloom Doom":{"bp":1,"type":"Grass","category":"Physical","statChange":null},"Blue Flare":{"bp":130,"type":"Fire","category":"Special","statChange":null},"Body Press":{"bp":80,"type":"Fighting","category":"Physical","statChange":null},"Body Slam":{"bp":85,"type":"Normal","category":"Physical","statChange":null},"Bolt Beak":{"bp":85,"type":"Electric","category":"Physical","statChange":null},"Bolt Strike":{"bp":130,"type":"Electric","category":"Physical","statChange":null},"Bone Club":{"bp":65,"type":"Ground","category":"Physical","statChange":null},"Bonemerang":{"bp":50,"type":"Ground","category":"Physical","statChange":null},"Bone Rush":{"bp":25,"type":"Ground","category":"Physical","statChange":null},"Boomburst":{"bp":140,"type":"Normal","category":"Special","statChange":null},"Bounce":{"bp":85,"type":"Flying","category":"Physical","statChange":null},"Bouncy Bubble":{"bp":60,"type":"Water","category":"Special","statChange":null},"Branch Poke":{"bp":40,"type":"Grass","category":"Physical","statChange":null},"Brave Bird":{"bp":120,"type":"Flying","category":"Physical","statChange":null},"Breaking Swipe":{"bp":60,"type":"Dragon","category":"Physical","statChange":null},"Breakneck Blitz":{"bp":1,"type":"Normal","category":"Physical","statChange":null},"Brick Break":{"bp":75,"type":"Fighting","category":"Physical","statChange":null},"Brine":{"bp":65,"type":"Water","category":"Special","statChange":null},"Brutal Swing":{"bp":60,"type":"Dark","category":"Physical","statChange":null},"Bubble":{"bp":40,"type":"Water","category":"Special","statChange":null},"Bubble Beam":{"bp":65,"type":"Water","category":"Special","statChange":null},"Bug Bite":{"bp":60,"type":"Bug","category":"Physical","statChange":null},"Bug Buzz":{"bp":90,"type":"Bug","category":"Special","statChange":null},"Bulk Up":{"bp":0,"type":"Fighting","category":"Status","statChange":null},"Bulldoze":{"bp":60,"type":"Ground","category":"Physical","statChange":null},"Bullet Punch":{"bp":40,"type":"Steel","category":"Physical","statChange":null},"Bullet Seed":{"bp":25,"type":"Grass","category":"Physical","statChange":null},"Burning Bulwark":{"bp":0,"type":"Fire","category":"Status","statChange":null},"Burning Jealousy":{"bp":70,"type":"Fire","category":"Special","statChange":null},"Burn Up":{"bp":130,"type":"Fire","category":"Special","statChange":null},"Buzzy Buzz":{"bp":60,"type":"Electric","category":"Special","statChange":null},"Calm Mind":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Camouflage":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Captivate":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Catastropika":{"bp":210,"type":"Electric","category":"Physical","statChange":null},"Ceaseless Edge":{"bp":65,"type":"Dark","category":"Physical","statChange":null},"Celebrate":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Charge":{"bp":0,"type":"Electric","category":"Status","statChange":null},"Charge Beam":{"bp":50,"type":"Electric","category":"Special","statChange":null},"Charm":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Chatter":{"bp":65,"type":"Flying","category":"Special","statChange":null},"Chilling Water":{"bp":50,"type":"Water","category":"Special","statChange":null},"Chilly Reception":{"bp":0,"type":"Ice","category":"Status","statChange":null},"Chip Away":{"bp":70,"type":"Normal","category":"Physical","statChange":null},"Chloroblast":{"bp":150,"type":"Grass","category":"Special","statChange":null},"Circle Throw":{"bp":60,"type":"Fighting","category":"Physical","statChange":null},"Clamp":{"bp":35,"type":"Water","category":"Physical","statChange":null},"Clanging Scales":{"bp":110,"type":"Dragon","category":"Special","statChange":null},"Clangorous Soul":{"bp":0,"type":"Dragon","category":"Status","statChange":null},"Clangorous Soulblaze":{"bp":185,"type":"Dragon","category":"Special","statChange":null},"Clear Smog":{"bp":50,"type":"Poison","category":"Special","statChange":null},"Close Combat":{"bp":120,"type":"Fighting","category":"Physical","statChange":null},"Coaching":{"bp":0,"type":"Fighting","category":"Status","statChange":null},"Coil":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Collision Course":{"bp":100,"type":"Fighting","category":"Physical","statChange":null},"Combat Torque":{"bp":100,"type":"Fighting","category":"Physical","statChange":null},"Comet Punch":{"bp":18,"type":"Normal","category":"Physical","statChange":null},"Comeuppance":{"bp":0,"type":"Dark","category":"Physical","statChange":null},"Confide":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Confuse Ray":{"bp":0,"type":"Ghost","category":"Status","statChange":null},"Confusion":{"bp":50,"type":"Psychic","category":"Special","statChange":null},"Constrict":{"bp":10,"type":"Normal","category":"Physical","statChange":null},"Continental Crush":{"bp":1,"type":"Rock","category":"Physical","statChange":null},"Conversion":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Conversion 2":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Copycat":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Core Enforcer":{"bp":100,"type":"Dragon","category":"Special","statChange":null},"Corkscrew Crash":{"bp":1,"type":"Steel","category":"Physical","statChange":null},"Corrosive Gas":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Cosmic Power":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Cotton Guard":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Cotton Spore":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Counter":{"bp":0,"type":"Fighting","category":"Physical","statChange":null},"Court Change":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Covet":{"bp":60,"type":"Normal","category":"Physical","statChange":null},"Crabhammer":{"bp":100,"type":"Water","category":"Physical","statChange":null},"Crafty Shield":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Cross Chop":{"bp":100,"type":"Fighting","category":"Physical","statChange":null},"Cross Poison":{"bp":70,"type":"Poison","category":"Physical","statChange":null},"Crunch":{"bp":80,"type":"Dark","category":"Physical","statChange":null},"Crush Claw":{"bp":75,"type":"Normal","category":"Physical","statChange":null},"Crush Grip":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Curse":{"bp":0,"type":"Ghost","category":"Status","statChange":null},"Cut":{"bp":50,"type":"Normal","category":"Physical","statChange":null},"Darkest Lariat":{"bp":85,"type":"Dark","category":"Physical","statChange":null},"Dark Pulse":{"bp":80,"type":"Dark","category":"Special","statChange":null},"Dark Void":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Dazzling Gleam":{"bp":80,"type":"Fairy","category":"Special","statChange":null},"Decorate":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Defend Order":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Defense Curl":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Defog":{"bp":0,"type":"Flying","category":"Status","statChange":null},"Destiny Bond":{"bp":0,"type":"Ghost","category":"Status","statChange":null},"Detect":{"bp":0,"type":"Fighting","category":"Status","statChange":null},"Devastating Drake":{"bp":1,"type":"Dragon","category":"Physical","statChange":null},"Diamond Storm":{"bp":100,"type":"Rock","category":"Physical","statChange":null},"Dig":{"bp":80,"type":"Ground","category":"Physical","statChange":null},"Dire Claw":{"bp":80,"type":"Poison","category":"Physical","statChange":null},"Disable":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Disarming Voice":{"bp":40,"type":"Fairy","category":"Special","statChange":null},"Discharge":{"bp":80,"type":"Electric","category":"Special","statChange":null},"Dive":{"bp":80,"type":"Water","category":"Physical","statChange":null},"Dizzy Punch":{"bp":70,"type":"Normal","category":"Physical","statChange":null},"Doodle":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Doom Desire":{"bp":140,"type":"Steel","category":"Special","statChange":null},"Double-Edge":{"bp":120,"type":"Normal","category":"Physical","statChange":null},"Double Hit":{"bp":35,"type":"Normal","category":"Physical","statChange":null},"Double Iron Bash":{"bp":60,"type":"Steel","category":"Physical","statChange":null},"Double Kick":{"bp":30,"type":"Fighting","category":"Physical","statChange":null},"Double Shock":{"bp":120,"type":"Electric","category":"Physical","statChange":null},"Double Slap":{"bp":15,"type":"Normal","category":"Physical","statChange":null},"Double Team":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Draco Meteor":{"bp":130,"type":"Dragon","category":"Special","statChange":null},"Dragon Ascent":{"bp":120,"type":"Flying","category":"Physical","statChange":null},"Dragon Breath":{"bp":60,"type":"Dragon","category":"Special","statChange":null},"Dragon Cheer":{"bp":0,"type":"Dragon","category":"Status","statChange":null},"Dragon Claw":{"bp":80,"type":"Dragon","category":"Physical","statChange":null},"Dragon Dance":{"bp":0,"type":"Dragon","category":"Status","statChange":null},"Dragon Darts":{"bp":50,"type":"Dragon","category":"Physical","statChange":null},"Dragon Energy":{"bp":150,"type":"Dragon","category":"Special","statChange":null},"Dragon Hammer":{"bp":90,"type":"Dragon","category":"Physical","statChange":null},"Dragon Pulse":{"bp":85,"type":"Dragon","category":"Special","statChange":null},"Dragon Rage":{"bp":0,"type":"Dragon","category":"Special","statChange":null},"Dragon Rush":{"bp":100,"type":"Dragon","category":"Physical","statChange":null},"Dragon Tail":{"bp":60,"type":"Dragon","category":"Physical","statChange":null},"Draining Kiss":{"bp":50,"type":"Fairy","category":"Special","statChange":null},"Drain Punch":{"bp":75,"type":"Fighting","category":"Physical","statChange":null},"Dream Eater":{"bp":100,"type":"Psychic","category":"Special","statChange":null},"Drill Peck":{"bp":80,"type":"Flying","category":"Physical","statChange":null},"Drill Run":{"bp":80,"type":"Ground","category":"Physical","statChange":null},"Drum Beating":{"bp":80,"type":"Grass","category":"Physical","statChange":null},"Dual Chop":{"bp":40,"type":"Dragon","category":"Physical","statChange":null},"Dual Wingbeat":{"bp":40,"type":"Flying","category":"Physical","statChange":null},"Dynamax Cannon":{"bp":100,"type":"Dragon","category":"Special","statChange":null},"Dynamic Punch":{"bp":100,"type":"Fighting","category":"Physical","statChange":null},"Earth Power":{"bp":90,"type":"Ground","category":"Special","statChange":null},"Earthquake":{"bp":100,"type":"Ground","category":"Physical","statChange":null},"Echoed Voice":{"bp":40,"type":"Normal","category":"Special","statChange":null},"Eerie Impulse":{"bp":0,"type":"Electric","category":"Status","statChange":null},"Eerie Spell":{"bp":80,"type":"Psychic","category":"Special","statChange":null},"Egg Bomb":{"bp":100,"type":"Normal","category":"Physical","statChange":null},"Electric Terrain":{"bp":0,"type":"Electric","category":"Status","statChange":null},"Electrify":{"bp":0,"type":"Electric","category":"Status","statChange":null},"Electro Ball":{"bp":0,"type":"Electric","category":"Special","statChange":null},"Electro Drift":{"bp":100,"type":"Electric","category":"Special","statChange":null},"Electro Shot":{"bp":130,"type":"Electric","category":"Special","statChange":null},"Electroweb":{"bp":55,"type":"Electric","category":"Special","statChange":null},"Embargo":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Ember":{"bp":40,"type":"Fire","category":"Special","statChange":null},"Encore":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Endeavor":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Endure":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Energy Ball":{"bp":90,"type":"Grass","category":"Special","statChange":null},"Entrainment":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Eruption":{"bp":150,"type":"Fire","category":"Special","statChange":null},"Esper Wing":{"bp":80,"type":"Psychic","category":"Special","statChange":null},"Eternabeam":{"bp":160,"type":"Dragon","category":"Special","statChange":null},"Expanding Force":{"bp":80,"type":"Psychic","category":"Special","statChange":null},"Explosion":{"bp":250,"type":"Normal","category":"Physical","statChange":null},"Extrasensory":{"bp":80,"type":"Psychic","category":"Special","statChange":null},"Extreme Evoboost":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Extreme Speed":{"bp":80,"type":"Normal","category":"Physical","statChange":null},"Facade":{"bp":70,"type":"Normal","category":"Physical","statChange":null},"Fairy Lock":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Fairy Wind":{"bp":40,"type":"Fairy","category":"Special","statChange":null},"Fake Out":{"bp":40,"type":"Normal","category":"Physical","statChange":null},"Fake Tears":{"bp":0,"type":"Dark","category":"Status","statChange":null},"False Surrender":{"bp":80,"type":"Dark","category":"Physical","statChange":null},"False Swipe":{"bp":40,"type":"Normal","category":"Physical","statChange":null},"Feather Dance":{"bp":0,"type":"Flying","category":"Status","statChange":null},"Feint":{"bp":30,"type":"Normal","category":"Physical","statChange":null},"Feint Attack":{"bp":60,"type":"Dark","category":"Physical","statChange":null},"Fell Stinger":{"bp":50,"type":"Bug","category":"Physical","statChange":null},"Fickle Beam":{"bp":80,"type":"Dragon","category":"Special","statChange":null},"Fiery Dance":{"bp":80,"type":"Fire","category":"Special","statChange":null},"Fiery Wrath":{"bp":90,"type":"Dark","category":"Special","statChange":null},"Fillet Away":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Final Gambit":{"bp":0,"type":"Fighting","category":"Special","statChange":null},"Fire Blast":{"bp":110,"type":"Fire","category":"Special","statChange":null},"Fire Fang":{"bp":65,"type":"Fire","category":"Physical","statChange":null},"Fire Lash":{"bp":80,"type":"Fire","category":"Physical","statChange":null},"Fire Pledge":{"bp":80,"type":"Fire","category":"Special","statChange":null},"Fire Punch":{"bp":75,"type":"Fire","category":"Physical","statChange":null},"Fire Spin":{"bp":35,"type":"Fire","category":"Special","statChange":null},"First Impression":{"bp":90,"type":"Bug","category":"Physical","statChange":null},"Fishious Rend":{"bp":85,"type":"Water","category":"Physical","statChange":null},"Fissure":{"bp":0,"type":"Ground","category":"Physical","statChange":null},"Flail":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Flame Burst":{"bp":70,"type":"Fire","category":"Special","statChange":null},"Flame Charge":{"bp":50,"type":"Fire","category":"Physical","statChange":null},"Flamethrower":{"bp":90,"type":"Fire","category":"Special","statChange":null},"Flame Wheel":{"bp":60,"type":"Fire","category":"Physical","statChange":null},"Flare Blitz":{"bp":120,"type":"Fire","category":"Physical","statChange":null},"Flash":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Flash Cannon":{"bp":80,"type":"Steel","category":"Special","statChange":null},"Flatter":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Fleur Cannon":{"bp":130,"type":"Fairy","category":"Special","statChange":null},"Fling":{"bp":0,"type":"Dark","category":"Physical","statChange":null},"Flip Turn":{"bp":60,"type":"Water","category":"Physical","statChange":null},"Floaty Fall":{"bp":90,"type":"Flying","category":"Physical","statChange":null},"Floral Healing":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Flower Shield":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Flower Trick":{"bp":70,"type":"Grass","category":"Physical","statChange":null},"Fly":{"bp":90,"type":"Flying","category":"Physical","statChange":null},"Flying Press":{"bp":100,"type":"Fighting","category":"Physical","statChange":null},"Focus Blast":{"bp":120,"type":"Fighting","category":"Special","statChange":null},"Focus Energy":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Focus Punch":{"bp":150,"type":"Fighting","category":"Physical","statChange":null},"Follow Me":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Force Palm":{"bp":60,"type":"Fighting","category":"Physical","statChange":null},"Foresight":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Forest's Curse":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Foul Play":{"bp":95,"type":"Dark","category":"Physical","statChange":null},"Freeze-Dry":{"bp":70,"type":"Ice","category":"Special","statChange":null},"Freeze Shock":{"bp":140,"type":"Ice","category":"Physical","statChange":null},"Freezing Glare":{"bp":90,"type":"Psychic","category":"Special","statChange":null},"Freezy Frost":{"bp":100,"type":"Ice","category":"Special","statChange":null},"Frenzy Plant":{"bp":150,"type":"Grass","category":"Special","statChange":null},"Frost Breath":{"bp":60,"type":"Ice","category":"Special","statChange":null},"Frustration":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Fury Attack":{"bp":15,"type":"Normal","category":"Physical","statChange":null},"Fury Cutter":{"bp":40,"type":"Bug","category":"Physical","statChange":null},"Fury Swipes":{"bp":18,"type":"Normal","category":"Physical","statChange":null},"Fusion Bolt":{"bp":100,"type":"Electric","category":"Physical","statChange":null},"Fusion Flare":{"bp":100,"type":"Fire","category":"Special","statChange":null},"Future Sight":{"bp":120,"type":"Psychic","category":"Special","statChange":null},"Gastro Acid":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Gear Grind":{"bp":50,"type":"Steel","category":"Physical","statChange":null},"Gear Up":{"bp":0,"type":"Steel","category":"Status","statChange":null},"Genesis Supernova":{"bp":185,"type":"Psychic","category":"Special","statChange":null},"Geomancy":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Giga Drain":{"bp":75,"type":"Grass","category":"Special","statChange":null},"Giga Impact":{"bp":150,"type":"Normal","category":"Physical","statChange":null},"Gigaton Hammer":{"bp":160,"type":"Steel","category":"Physical","statChange":null},"Gigavolt Havoc":{"bp":1,"type":"Electric","category":"Physical","statChange":null},"Glacial Lance":{"bp":120,"type":"Ice","category":"Physical","statChange":null},"Glaciate":{"bp":65,"type":"Ice","category":"Special","statChange":null},"Glaive Rush":{"bp":120,"type":"Dragon","category":"Physical","statChange":null},"Glare":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Glitzy Glow":{"bp":80,"type":"Psychic","category":"Special","statChange":null},"G-Max Befuddle":{"bp":10,"type":"Bug","category":"Physical","statChange":null},"G-Max Cannonade":{"bp":10,"type":"Water","category":"Physical","statChange":null},"G-Max Centiferno":{"bp":10,"type":"Fire","category":"Physical","statChange":null},"G-Max Chi Strike":{"bp":10,"type":"Fighting","category":"Physical","statChange":null},"G-Max Cuddle":{"bp":10,"type":"Normal","category":"Physical","statChange":null},"G-Max Depletion":{"bp":10,"type":"Dragon","category":"Physical","statChange":null},"G-Max Drum Solo":{"bp":160,"type":"Grass","category":"Physical","statChange":null},"G-Max Finale":{"bp":10,"type":"Fairy","category":"Physical","statChange":null},"G-Max Fireball":{"bp":160,"type":"Fire","category":"Physical","statChange":null},"G-Max Foam Burst":{"bp":10,"type":"Water","category":"Physical","statChange":null},"G-Max Gold Rush":{"bp":10,"type":"Normal","category":"Physical","statChange":null},"G-Max Gravitas":{"bp":10,"type":"Psychic","category":"Physical","statChange":null},"G-Max Hydrosnipe":{"bp":160,"type":"Water","category":"Physical","statChange":null},"G-Max Malodor":{"bp":10,"type":"Poison","category":"Physical","statChange":null},"G-Max Meltdown":{"bp":10,"type":"Steel","category":"Physical","statChange":null},"G-Max One Blow":{"bp":10,"type":"Dark","category":"Physical","statChange":null},"G-Max Rapid Flow":{"bp":10,"type":"Water","category":"Physical","statChange":null},"G-Max Replenish":{"bp":10,"type":"Normal","category":"Physical","statChange":null},"G-Max Resonance":{"bp":10,"type":"Ice","category":"Physical","statChange":null},"G-Max Sandblast":{"bp":10,"type":"Ground","category":"Physical","statChange":null},"G-Max Smite":{"bp":10,"type":"Fairy","category":"Physical","statChange":null},"G-Max Snooze":{"bp":10,"type":"Dark","category":"Physical","statChange":null},"G-Max Steelsurge":{"bp":10,"type":"Steel","category":"Physical","statChange":null},"G-Max Stonesurge":{"bp":10,"type":"Water","category":"Physical","statChange":null},"G-Max Stun Shock":{"bp":10,"type":"Electric","category":"Physical","statChange":null},"G-Max Sweetness":{"bp":10,"type":"Grass","category":"Physical","statChange":null},"G-Max Tartness":{"bp":10,"type":"Grass","category":"Physical","statChange":null},"G-Max Terror":{"bp":10,"type":"Ghost","category":"Physical","statChange":null},"G-Max Vine Lash":{"bp":10,"type":"Grass","category":"Physical","statChange":null},"G-Max Volcalith":{"bp":10,"type":"Rock","category":"Physical","statChange":null},"G-Max Volt Crash":{"bp":10,"type":"Electric","category":"Physical","statChange":null},"G-Max Wildfire":{"bp":10,"type":"Fire","category":"Physical","statChange":null},"G-Max Wind Rage":{"bp":10,"type":"Flying","category":"Physical","statChange":null},"Grass Knot":{"bp":0,"type":"Grass","category":"Special","statChange":null},"Grass Pledge":{"bp":80,"type":"Grass","category":"Special","statChange":null},"Grass Whistle":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Grassy Glide":{"bp":55,"type":"Grass","category":"Physical","statChange":null},"Grassy Terrain":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Grav Apple":{"bp":80,"type":"Grass","category":"Physical","statChange":null},"Gravity":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Growl":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Growth":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Grudge":{"bp":0,"type":"Ghost","category":"Status","statChange":null},"Guardian of Alola":{"bp":0,"type":"Fairy","category":"Special","statChange":null},"Guard Split":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Guard Swap":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Guillotine":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Gunk Shot":{"bp":120,"type":"Poison","category":"Physical","statChange":null},"Gust":{"bp":40,"type":"Flying","category":"Special","statChange":null},"Gyro Ball":{"bp":0,"type":"Steel","category":"Physical","statChange":null},"Hail":{"bp":0,"type":"Ice","category":"Status","statChange":null},"Hammer Arm":{"bp":100,"type":"Fighting","category":"Physical","statChange":null},"Happy Hour":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Harden":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Hard Press":{"bp":0,"type":"Steel","category":"Physical","statChange":null},"Haze":{"bp":0,"type":"Ice","category":"Status","statChange":null},"Headbutt":{"bp":70,"type":"Normal","category":"Physical","statChange":null},"Head Charge":{"bp":120,"type":"Normal","category":"Physical","statChange":null},"Headlong Rush":{"bp":120,"type":"Ground","category":"Physical","statChange":null},"Head Smash":{"bp":150,"type":"Rock","category":"Physical","statChange":null},"Heal Bell":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Heal Block":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Healing Wish":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Heal Order":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Heal Pulse":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Heart Stamp":{"bp":60,"type":"Psychic","category":"Physical","statChange":null},"Heart Swap":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Heat Crash":{"bp":0,"type":"Fire","category":"Physical","statChange":null},"Heat Wave":{"bp":95,"type":"Fire","category":"Special","statChange":null},"Heavy Slam":{"bp":0,"type":"Steel","category":"Physical","statChange":null},"Helping Hand":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Hex":{"bp":65,"type":"Ghost","category":"Special","statChange":null},"Hidden Power":{"bp":60,"type":"Normal","category":"Special","statChange":null},"Hidden Power Bug":{"bp":60,"type":"Bug","category":"Special","statChange":null},"Hidden Power Dark":{"bp":60,"type":"Dark","category":"Special","statChange":null},"Hidden Power Dragon":{"bp":60,"type":"Dragon","category":"Special","statChange":null},"Hidden Power Electric":{"bp":60,"type":"Electric","category":"Special","statChange":null},"Hidden Power Fighting":{"bp":60,"type":"Fighting","category":"Special","statChange":null},"Hidden Power Fire":{"bp":60,"type":"Fire","category":"Special","statChange":null},"Hidden Power Flying":{"bp":60,"type":"Flying","category":"Special","statChange":null},"Hidden Power Ghost":{"bp":60,"type":"Ghost","category":"Special","statChange":null},"Hidden Power Grass":{"bp":60,"type":"Grass","category":"Special","statChange":null},"Hidden Power Ground":{"bp":60,"type":"Ground","category":"Special","statChange":null},"Hidden Power Ice":{"bp":60,"type":"Ice","category":"Special","statChange":null},"Hidden Power Poison":{"bp":60,"type":"Poison","category":"Special","statChange":null},"Hidden Power Psychic":{"bp":60,"type":"Psychic","category":"Special","statChange":null},"Hidden Power Rock":{"bp":60,"type":"Rock","category":"Special","statChange":null},"Hidden Power Steel":{"bp":60,"type":"Steel","category":"Special","statChange":null},"Hidden Power Water":{"bp":60,"type":"Water","category":"Special","statChange":null},"High Horsepower":{"bp":95,"type":"Ground","category":"Physical","statChange":null},"High Jump Kick":{"bp":130,"type":"Fighting","category":"Physical","statChange":null},"Hold Back":{"bp":40,"type":"Normal","category":"Physical","statChange":null},"Hold Hands":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Hone Claws":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Horn Attack":{"bp":65,"type":"Normal","category":"Physical","statChange":null},"Horn Drill":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Horn Leech":{"bp":75,"type":"Grass","category":"Physical","statChange":null},"Howl":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Hurricane":{"bp":110,"type":"Flying","category":"Special","statChange":null},"Hydro Cannon":{"bp":150,"type":"Water","category":"Special","statChange":null},"Hydro Pump":{"bp":110,"type":"Water","category":"Special","statChange":null},"Hydro Steam":{"bp":80,"type":"Water","category":"Special","statChange":null},"Hydro Vortex":{"bp":1,"type":"Water","category":"Physical","statChange":null},"Hyper Beam":{"bp":150,"type":"Normal","category":"Special","statChange":null},"Hyper Drill":{"bp":100,"type":"Normal","category":"Physical","statChange":null},"Hyper Fang":{"bp":80,"type":"Normal","category":"Physical","statChange":null},"Hyperspace Fury":{"bp":100,"type":"Dark","category":"Physical","statChange":null},"Hyperspace Hole":{"bp":80,"type":"Psychic","category":"Special","statChange":null},"Hyper Voice":{"bp":90,"type":"Normal","category":"Special","statChange":null},"Hypnosis":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Ice Ball":{"bp":30,"type":"Ice","category":"Physical","statChange":null},"Ice Beam":{"bp":90,"type":"Ice","category":"Special","statChange":null},"Ice Burn":{"bp":140,"type":"Ice","category":"Special","statChange":null},"Ice Fang":{"bp":65,"type":"Ice","category":"Physical","statChange":null},"Ice Hammer":{"bp":100,"type":"Ice","category":"Physical","statChange":null},"Ice Punch":{"bp":75,"type":"Ice","category":"Physical","statChange":null},"Ice Shard":{"bp":40,"type":"Ice","category":"Physical","statChange":null},"Ice Spinner":{"bp":80,"type":"Ice","category":"Physical","statChange":null},"Icicle Crash":{"bp":85,"type":"Ice","category":"Physical","statChange":null},"Icicle Spear":{"bp":25,"type":"Ice","category":"Physical","statChange":null},"Icy Wind":{"bp":55,"type":"Ice","category":"Special","statChange":null},"Imprison":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Incinerate":{"bp":60,"type":"Fire","category":"Special","statChange":null},"Infernal Parade":{"bp":60,"type":"Ghost","category":"Special","statChange":null},"Inferno":{"bp":100,"type":"Fire","category":"Special","statChange":null},"Inferno Overdrive":{"bp":1,"type":"Fire","category":"Physical","statChange":null},"Infestation":{"bp":20,"type":"Bug","category":"Special","statChange":null},"Ingrain":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Instruct":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Ion Deluge":{"bp":0,"type":"Electric","category":"Status","statChange":null},"Iron Defense":{"bp":0,"type":"Steel","category":"Status","statChange":null},"Iron Head":{"bp":80,"type":"Steel","category":"Physical","statChange":null},"Iron Tail":{"bp":100,"type":"Steel","category":"Physical","statChange":null},"Ivy Cudgel":{"bp":100,"type":"Grass","category":"Physical","statChange":null},"Jaw Lock":{"bp":80,"type":"Dark","category":"Physical","statChange":null},"Jet Punch":{"bp":60,"type":"Water","category":"Physical","statChange":null},"Judgment":{"bp":100,"type":"Normal","category":"Special","statChange":null},"Jump Kick":{"bp":100,"type":"Fighting","category":"Physical","statChange":null},"Jungle Healing":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Karate Chop":{"bp":50,"type":"Fighting","category":"Physical","statChange":null},"Kinesis":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"King's Shield":{"bp":0,"type":"Steel","category":"Status","statChange":null},"Knock Off":{"bp":65,"type":"Dark","category":"Physical","statChange":null},"Kowtow Cleave":{"bp":85,"type":"Dark","category":"Physical","statChange":null},"Land's Wrath":{"bp":90,"type":"Ground","category":"Physical","statChange":null},"Laser Focus":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Lash Out":{"bp":75,"type":"Dark","category":"Physical","statChange":null},"Last Resort":{"bp":140,"type":"Normal","category":"Physical","statChange":null},"Last Respects":{"bp":50,"type":"Ghost","category":"Physical","statChange":null},"Lava Plume":{"bp":80,"type":"Fire","category":"Special","statChange":null},"Leafage":{"bp":40,"type":"Grass","category":"Physical","statChange":null},"Leaf Blade":{"bp":90,"type":"Grass","category":"Physical","statChange":null},"Leaf Storm":{"bp":130,"type":"Grass","category":"Special","statChange":null},"Leaf Tornado":{"bp":65,"type":"Grass","category":"Special","statChange":null},"Leech Life":{"bp":80,"type":"Bug","category":"Physical","statChange":null},"Leech Seed":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Leer":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Let's Snuggle Forever":{"bp":190,"type":"Fairy","category":"Physical","statChange":null},"Lick":{"bp":30,"type":"Ghost","category":"Physical","statChange":null},"Life Dew":{"bp":0,"type":"Water","category":"Status","statChange":null},"Light of Ruin":{"bp":140,"type":"Fairy","category":"Special","statChange":null},"Light Screen":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Light That Burns the Sky":{"bp":200,"type":"Psychic","category":"Special","statChange":null},"Liquidation":{"bp":85,"type":"Water","category":"Physical","statChange":null},"Lock-On":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Lovely Kiss":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Low Kick":{"bp":0,"type":"Fighting","category":"Physical","statChange":null},"Low Sweep":{"bp":65,"type":"Fighting","category":"Physical","statChange":null},"Lucky Chant":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Lumina Crash":{"bp":80,"type":"Psychic","category":"Special","statChange":null},"Lunar Blessing":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Lunar Dance":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Lunge":{"bp":80,"type":"Bug","category":"Physical","statChange":null},"Luster Purge":{"bp":95,"type":"Psychic","category":"Special","statChange":null},"Mach Punch":{"bp":40,"type":"Fighting","category":"Physical","statChange":null},"Magical Leaf":{"bp":60,"type":"Grass","category":"Special","statChange":null},"Magical Torque":{"bp":100,"type":"Fairy","category":"Physical","statChange":null},"Magic Coat":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Magic Powder":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Magic Room":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Magma Storm":{"bp":100,"type":"Fire","category":"Special","statChange":null},"Magnet Bomb":{"bp":60,"type":"Steel","category":"Physical","statChange":null},"Magnetic Flux":{"bp":0,"type":"Electric","category":"Status","statChange":null},"Magnet Rise":{"bp":0,"type":"Electric","category":"Status","statChange":null},"Magnitude":{"bp":0,"type":"Ground","category":"Physical","statChange":null},"Make It Rain":{"bp":120,"type":"Steel","category":"Special","statChange":null},"Malicious Moonsault":{"bp":180,"type":"Dark","category":"Physical","statChange":null},"Malignant Chain":{"bp":100,"type":"Poison","category":"Special","statChange":null},"Mat Block":{"bp":0,"type":"Fighting","category":"Status","statChange":null},"Matcha Gotcha":{"bp":80,"type":"Grass","category":"Special","statChange":null},"Max Airstream":{"bp":10,"type":"Flying","category":"Physical","statChange":null},"Max Darkness":{"bp":10,"type":"Dark","category":"Physical","statChange":null},"Max Flare":{"bp":100,"type":"Fire","category":"Physical","statChange":null},"Max Flutterby":{"bp":10,"type":"Bug","category":"Physical","statChange":null},"Max Geyser":{"bp":10,"type":"Water","category":"Physical","statChange":null},"Max Guard":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Max Hailstorm":{"bp":10,"type":"Ice","category":"Physical","statChange":null},"Max Knuckle":{"bp":10,"type":"Fighting","category":"Physical","statChange":null},"Max Lightning":{"bp":10,"type":"Electric","category":"Physical","statChange":null},"Max Mindstorm":{"bp":10,"type":"Psychic","category":"Physical","statChange":null},"Max Ooze":{"bp":10,"type":"Poison","category":"Physical","statChange":null},"Max Overgrowth":{"bp":10,"type":"Grass","category":"Physical","statChange":null},"Max Phantasm":{"bp":10,"type":"Ghost","category":"Physical","statChange":null},"Max Quake":{"bp":10,"type":"Ground","category":"Physical","statChange":null},"Max Rockfall":{"bp":10,"type":"Rock","category":"Physical","statChange":null},"Max Starfall":{"bp":10,"type":"Fairy","category":"Physical","statChange":null},"Max Steelspike":{"bp":10,"type":"Steel","category":"Physical","statChange":null},"Max Strike":{"bp":10,"type":"Normal","category":"Physical","statChange":null},"Max Wyrmwind":{"bp":10,"type":"Dragon","category":"Physical","statChange":null},"Mean Look":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Meditate":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Me First":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Mega Drain":{"bp":40,"type":"Grass","category":"Special","statChange":null},"Megahorn":{"bp":120,"type":"Bug","category":"Physical","statChange":null},"Mega Kick":{"bp":120,"type":"Normal","category":"Physical","statChange":null},"Mega Punch":{"bp":80,"type":"Normal","category":"Physical","statChange":null},"Memento":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Menacing Moonraze Maelstrom":{"bp":200,"type":"Ghost","category":"Special","statChange":null},"Metal Burst":{"bp":0,"type":"Steel","category":"Physical","statChange":null},"Metal Claw":{"bp":50,"type":"Steel","category":"Physical","statChange":null},"Metal Sound":{"bp":0,"type":"Steel","category":"Status","statChange":null},"Meteor Assault":{"bp":150,"type":"Fighting","category":"Physical","statChange":null},"Meteor Beam":{"bp":120,"type":"Rock","category":"Special","statChange":null},"Meteor Mash":{"bp":90,"type":"Steel","category":"Physical","statChange":null},"Metronome":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Mighty Cleave":{"bp":95,"type":"Rock","category":"Physical","statChange":null},"Milk Drink":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Mimic":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Mind Blown":{"bp":150,"type":"Fire","category":"Special","statChange":null},"Mind Reader":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Minimize":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Miracle Eye":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Mirror Coat":{"bp":0,"type":"Psychic","category":"Special","statChange":null},"Mirror Move":{"bp":0,"type":"Flying","category":"Status","statChange":null},"Mirror Shot":{"bp":65,"type":"Steel","category":"Special","statChange":null},"Mist":{"bp":0,"type":"Ice","category":"Status","statChange":null},"Mist Ball":{"bp":95,"type":"Psychic","category":"Special","statChange":null},"Misty Explosion":{"bp":100,"type":"Fairy","category":"Special","statChange":null},"Misty Terrain":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Moonblast":{"bp":95,"type":"Fairy","category":"Special","statChange":null},"Moongeist Beam":{"bp":100,"type":"Ghost","category":"Special","statChange":null},"Moonlight":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Morning Sun":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Mortal Spin":{"bp":30,"type":"Poison","category":"Physical","statChange":null},"Mountain Gale":{"bp":100,"type":"Ice","category":"Physical","statChange":null},"Mud Bomb":{"bp":65,"type":"Ground","category":"Special","statChange":null},"Muddy Water":{"bp":90,"type":"Water","category":"Special","statChange":null},"Mud Shot":{"bp":55,"type":"Ground","category":"Special","statChange":null},"Mud-Slap":{"bp":20,"type":"Ground","category":"Special","statChange":null},"Mud Sport":{"bp":0,"type":"Ground","category":"Status","statChange":null},"Multi-Attack":{"bp":120,"type":"Normal","category":"Physical","statChange":null},"Mystical Fire":{"bp":75,"type":"Fire","category":"Special","statChange":null},"Mystical Power":{"bp":70,"type":"Psychic","category":"Special","statChange":null},"Nasty Plot":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Natural Gift":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Nature Power":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Nature's Madness":{"bp":0,"type":"Fairy","category":"Special","statChange":null},"Needle Arm":{"bp":60,"type":"Grass","category":"Physical","statChange":null},"Never-Ending Nightmare":{"bp":1,"type":"Ghost","category":"Physical","statChange":null},"Night Daze":{"bp":85,"type":"Dark","category":"Special","statChange":null},"Nightmare":{"bp":0,"type":"Ghost","category":"Status","statChange":null},"Night Shade":{"bp":0,"type":"Ghost","category":"Special","statChange":null},"Night Slash":{"bp":70,"type":"Dark","category":"Physical","statChange":null},"Nihil Light":{"bp":100,"type":"Dragon","category":"Special","statChange":null},"Noble Roar":{"bp":0,"type":"Normal","category":"Status","statChange":null},"No Retreat":{"bp":0,"type":"Fighting","category":"Status","statChange":null},"Noxious Torque":{"bp":100,"type":"Poison","category":"Physical","statChange":null},"Nuzzle":{"bp":20,"type":"Electric","category":"Physical","statChange":null},"Oblivion Wing":{"bp":80,"type":"Flying","category":"Special","statChange":null},"Obstruct":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Oceanic Operetta":{"bp":195,"type":"Water","category":"Special","statChange":null},"Octazooka":{"bp":65,"type":"Water","category":"Special","statChange":null},"Octolock":{"bp":0,"type":"Fighting","category":"Status","statChange":null},"Odor Sleuth":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Ominous Wind":{"bp":60,"type":"Ghost","category":"Special","statChange":null},"Order Up":{"bp":80,"type":"Dragon","category":"Physical","statChange":null},"Origin Pulse":{"bp":110,"type":"Water","category":"Special","statChange":null},"Outrage":{"bp":120,"type":"Dragon","category":"Physical","statChange":null},"Overdrive":{"bp":80,"type":"Electric","category":"Special","statChange":null},"Overheat":{"bp":130,"type":"Fire","category":"Special","statChange":null},"Pain Split":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Parabolic Charge":{"bp":65,"type":"Electric","category":"Special","statChange":null},"Parting Shot":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Payback":{"bp":50,"type":"Dark","category":"Physical","statChange":null},"Pay Day":{"bp":40,"type":"Normal","category":"Physical","statChange":null},"Peck":{"bp":35,"type":"Flying","category":"Physical","statChange":null},"Perish Song":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Petal Blizzard":{"bp":90,"type":"Grass","category":"Physical","statChange":null},"Petal Dance":{"bp":120,"type":"Grass","category":"Special","statChange":null},"Phantom Force":{"bp":90,"type":"Ghost","category":"Physical","statChange":null},"Photon Geyser":{"bp":100,"type":"Psychic","category":"Special","statChange":null},"Pika Papow":{"bp":0,"type":"Electric","category":"Special","statChange":null},"Pin Missile":{"bp":25,"type":"Bug","category":"Physical","statChange":null},"Plasma Fists":{"bp":100,"type":"Electric","category":"Physical","statChange":null},"Play Nice":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Play Rough":{"bp":90,"type":"Fairy","category":"Physical","statChange":null},"Pluck":{"bp":60,"type":"Flying","category":"Physical","statChange":null},"Poison Fang":{"bp":50,"type":"Poison","category":"Physical","statChange":null},"Poison Gas":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Poison Jab":{"bp":80,"type":"Poison","category":"Physical","statChange":null},"Poison Powder":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Poison Sting":{"bp":15,"type":"Poison","category":"Physical","statChange":null},"Poison Tail":{"bp":50,"type":"Poison","category":"Physical","statChange":null},"Pollen Puff":{"bp":90,"type":"Bug","category":"Special","statChange":null},"Poltergeist":{"bp":110,"type":"Ghost","category":"Physical","statChange":null},"Population Bomb":{"bp":20,"type":"Normal","category":"Physical","statChange":null},"Pounce":{"bp":50,"type":"Bug","category":"Physical","statChange":null},"Pound":{"bp":40,"type":"Normal","category":"Physical","statChange":null},"Powder":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Powder Snow":{"bp":40,"type":"Ice","category":"Special","statChange":null},"Power Gem":{"bp":80,"type":"Rock","category":"Special","statChange":null},"Power Shift":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Power Split":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Power Swap":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Power Trick":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Power Trip":{"bp":20,"type":"Dark","category":"Physical","statChange":null},"Power-Up Punch":{"bp":40,"type":"Fighting","category":"Physical","statChange":null},"Power Whip":{"bp":120,"type":"Grass","category":"Physical","statChange":null},"Precipice Blades":{"bp":120,"type":"Ground","category":"Physical","statChange":null},"Present":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Prismatic Laser":{"bp":160,"type":"Psychic","category":"Special","statChange":null},"Protect":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Psybeam":{"bp":65,"type":"Psychic","category":"Special","statChange":null},"Psyblade":{"bp":80,"type":"Psychic","category":"Physical","statChange":null},"Psychic":{"bp":90,"type":"Psychic","category":"Special","statChange":null},"Psychic Fangs":{"bp":85,"type":"Psychic","category":"Physical","statChange":null},"Psychic Noise":{"bp":75,"type":"Psychic","category":"Special","statChange":null},"Psychic Terrain":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Psycho Boost":{"bp":140,"type":"Psychic","category":"Special","statChange":null},"Psycho Cut":{"bp":70,"type":"Psychic","category":"Physical","statChange":null},"Psycho Shift":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Psych Up":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Psyshield Bash":{"bp":70,"type":"Psychic","category":"Physical","statChange":null},"Psyshock":{"bp":80,"type":"Psychic","category":"Special","statChange":null},"Psystrike":{"bp":100,"type":"Psychic","category":"Special","statChange":null},"Psywave":{"bp":0,"type":"Psychic","category":"Special","statChange":null},"Pulverizing Pancake":{"bp":210,"type":"Normal","category":"Physical","statChange":null},"Punishment":{"bp":0,"type":"Dark","category":"Physical","statChange":null},"Purify":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Pursuit":{"bp":40,"type":"Dark","category":"Physical","statChange":null},"Pyro Ball":{"bp":120,"type":"Fire","category":"Physical","statChange":null},"Quash":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Quick Attack":{"bp":40,"type":"Normal","category":"Physical","statChange":null},"Quick Guard":{"bp":0,"type":"Fighting","category":"Status","statChange":null},"Quiver Dance":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Rage":{"bp":20,"type":"Normal","category":"Physical","statChange":null},"Rage Fist":{"bp":50,"type":"Ghost","category":"Physical","statChange":null},"Rage Powder":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Raging Bull":{"bp":90,"type":"Normal","category":"Physical","statChange":null},"Raging Fury":{"bp":120,"type":"Fire","category":"Physical","statChange":null},"Rain Dance":{"bp":0,"type":"Water","category":"Status","statChange":null},"Rapid Spin":{"bp":50,"type":"Normal","category":"Physical","statChange":null},"Razor Leaf":{"bp":55,"type":"Grass","category":"Physical","statChange":null},"Razor Shell":{"bp":75,"type":"Water","category":"Physical","statChange":null},"Razor Wind":{"bp":80,"type":"Normal","category":"Special","statChange":null},"Recover":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Recycle":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Reflect":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Reflect Type":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Refresh":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Relic Song":{"bp":75,"type":"Normal","category":"Special","statChange":null},"Rest":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Retaliate":{"bp":70,"type":"Normal","category":"Physical","statChange":null},"Return":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Revelation Dance":{"bp":90,"type":"Normal","category":"Special","statChange":null},"Revenge":{"bp":60,"type":"Fighting","category":"Physical","statChange":null},"Reversal":{"bp":0,"type":"Fighting","category":"Physical","statChange":null},"Revival Blessing":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Rising Voltage":{"bp":70,"type":"Electric","category":"Special","statChange":null},"Roar":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Roar of Time":{"bp":150,"type":"Dragon","category":"Special","statChange":null},"Rock Blast":{"bp":25,"type":"Rock","category":"Physical","statChange":null},"Rock Climb":{"bp":90,"type":"Normal","category":"Physical","statChange":null},"Rock Polish":{"bp":0,"type":"Rock","category":"Status","statChange":null},"Rock Slide":{"bp":75,"type":"Rock","category":"Physical","statChange":null},"Rock Smash":{"bp":40,"type":"Fighting","category":"Physical","statChange":null},"Rock Throw":{"bp":50,"type":"Rock","category":"Physical","statChange":null},"Rock Tomb":{"bp":60,"type":"Rock","category":"Physical","statChange":null},"Rock Wrecker":{"bp":150,"type":"Rock","category":"Physical","statChange":null},"Role Play":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Rolling Kick":{"bp":60,"type":"Fighting","category":"Physical","statChange":null},"Rollout":{"bp":30,"type":"Rock","category":"Physical","statChange":null},"Roost":{"bp":0,"type":"Flying","category":"Status","statChange":null},"Rototiller":{"bp":0,"type":"Ground","category":"Status","statChange":null},"Round":{"bp":60,"type":"Normal","category":"Special","statChange":null},"Ruination":{"bp":0,"type":"Dark","category":"Special","statChange":null},"Sacred Fire":{"bp":100,"type":"Fire","category":"Physical","statChange":null},"Sacred Sword":{"bp":90,"type":"Fighting","category":"Physical","statChange":null},"Safeguard":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Salt Cure":{"bp":40,"type":"Rock","category":"Physical","statChange":null},"Sand Attack":{"bp":0,"type":"Ground","category":"Status","statChange":null},"Sandsear Storm":{"bp":100,"type":"Ground","category":"Special","statChange":null},"Sandstorm":{"bp":0,"type":"Rock","category":"Status","statChange":null},"Sand Tomb":{"bp":35,"type":"Ground","category":"Physical","statChange":null},"Sappy Seed":{"bp":100,"type":"Grass","category":"Physical","statChange":null},"Savage Spin-Out":{"bp":1,"type":"Bug","category":"Physical","statChange":null},"Scald":{"bp":80,"type":"Water","category":"Special","statChange":null},"Scale Shot":{"bp":25,"type":"Dragon","category":"Physical","statChange":null},"Scary Face":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Scorching Sands":{"bp":70,"type":"Ground","category":"Special","statChange":null},"Scratch":{"bp":40,"type":"Normal","category":"Physical","statChange":null},"Screech":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Searing Shot":{"bp":100,"type":"Fire","category":"Special","statChange":null},"Searing Sunraze Smash":{"bp":200,"type":"Steel","category":"Physical","statChange":null},"Secret Power":{"bp":70,"type":"Normal","category":"Physical","statChange":null},"Secret Sword":{"bp":85,"type":"Fighting","category":"Special","statChange":null},"Seed Bomb":{"bp":80,"type":"Grass","category":"Physical","statChange":null},"Seed Flare":{"bp":120,"type":"Grass","category":"Special","statChange":null},"Seismic Toss":{"bp":0,"type":"Fighting","category":"Physical","statChange":null},"Self-Destruct":{"bp":200,"type":"Normal","category":"Physical","statChange":null},"Shadow Ball":{"bp":80,"type":"Ghost","category":"Special","statChange":null},"Shadow Bone":{"bp":85,"type":"Ghost","category":"Physical","statChange":null},"Shadow Claw":{"bp":70,"type":"Ghost","category":"Physical","statChange":null},"Shadow Force":{"bp":120,"type":"Ghost","category":"Physical","statChange":null},"Shadow Punch":{"bp":60,"type":"Ghost","category":"Physical","statChange":null},"Shadow Sneak":{"bp":40,"type":"Ghost","category":"Physical","statChange":null},"Sharpen":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Shattered Psyche":{"bp":1,"type":"Psychic","category":"Physical","statChange":null},"Shed Tail":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Sheer Cold":{"bp":0,"type":"Ice","category":"Special","statChange":null},"Shell Side Arm":{"bp":90,"type":"Poison","category":"Special","statChange":null},"Shell Smash":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Shell Trap":{"bp":150,"type":"Fire","category":"Special","statChange":null},"Shelter":{"bp":0,"type":"Steel","category":"Status","statChange":null},"Shift Gear":{"bp":0,"type":"Steel","category":"Status","statChange":null},"Shock Wave":{"bp":60,"type":"Electric","category":"Special","statChange":null},"Shore Up":{"bp":0,"type":"Ground","category":"Status","statChange":null},"Signal Beam":{"bp":75,"type":"Bug","category":"Special","statChange":null},"Silk Trap":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Silver Wind":{"bp":60,"type":"Bug","category":"Special","statChange":null},"Simple Beam":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Sing":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Sinister Arrow Raid":{"bp":180,"type":"Ghost","category":"Physical","statChange":null},"Sizzly Slide":{"bp":60,"type":"Fire","category":"Physical","statChange":null},"Sketch":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Skill Swap":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Skitter Smack":{"bp":70,"type":"Bug","category":"Physical","statChange":null},"Skull Bash":{"bp":130,"type":"Normal","category":"Physical","statChange":null},"Sky Attack":{"bp":140,"type":"Flying","category":"Physical","statChange":null},"Sky Drop":{"bp":60,"type":"Flying","category":"Physical","statChange":null},"Sky Uppercut":{"bp":85,"type":"Fighting","category":"Physical","statChange":null},"Slack Off":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Slam":{"bp":80,"type":"Normal","category":"Physical","statChange":null},"Slash":{"bp":70,"type":"Normal","category":"Physical","statChange":null},"Sleep Powder":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Sleep Talk":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Sludge":{"bp":65,"type":"Poison","category":"Special","statChange":null},"Sludge Bomb":{"bp":90,"type":"Poison","category":"Special","statChange":null},"Sludge Wave":{"bp":95,"type":"Poison","category":"Special","statChange":null},"Smack Down":{"bp":50,"type":"Rock","category":"Physical","statChange":null},"Smart Strike":{"bp":70,"type":"Steel","category":"Physical","statChange":null},"Smelling Salts":{"bp":70,"type":"Normal","category":"Physical","statChange":null},"Smog":{"bp":30,"type":"Poison","category":"Special","statChange":null},"Smokescreen":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Snap Trap":{"bp":35,"type":"Grass","category":"Physical","statChange":null},"Snarl":{"bp":55,"type":"Dark","category":"Special","statChange":null},"Snatch":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Snipe Shot":{"bp":80,"type":"Water","category":"Special","statChange":null},"Snore":{"bp":50,"type":"Normal","category":"Special","statChange":null},"Snowscape":{"bp":0,"type":"Ice","category":"Status","statChange":null},"Soak":{"bp":0,"type":"Water","category":"Status","statChange":null},"Soft-Boiled":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Solar Beam":{"bp":120,"type":"Grass","category":"Special","statChange":null},"Solar Blade":{"bp":125,"type":"Grass","category":"Physical","statChange":null},"Sonic Boom":{"bp":0,"type":"Normal","category":"Special","statChange":null},"Soul-Stealing 7-Star Strike":{"bp":195,"type":"Ghost","category":"Physical","statChange":null},"Spacial Rend":{"bp":100,"type":"Dragon","category":"Special","statChange":null},"Spark":{"bp":65,"type":"Electric","category":"Physical","statChange":null},"Sparkling Aria":{"bp":90,"type":"Water","category":"Special","statChange":null},"Sparkly Swirl":{"bp":120,"type":"Fairy","category":"Special","statChange":null},"Spectral Thief":{"bp":90,"type":"Ghost","category":"Physical","statChange":null},"Speed Swap":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Spicy Extract":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Spider Web":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Spike Cannon":{"bp":20,"type":"Normal","category":"Physical","statChange":null},"Spikes":{"bp":0,"type":"Ground","category":"Status","statChange":null},"Spiky Shield":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Spin Out":{"bp":100,"type":"Steel","category":"Physical","statChange":null},"Spirit Break":{"bp":75,"type":"Fairy","category":"Physical","statChange":null},"Spirit Shackle":{"bp":80,"type":"Ghost","category":"Physical","statChange":null},"Spite":{"bp":0,"type":"Ghost","category":"Status","statChange":null},"Spit Up":{"bp":0,"type":"Normal","category":"Special","statChange":null},"Splash":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Splintered Stormshards":{"bp":190,"type":"Rock","category":"Physical","statChange":null},"Splishy Splash":{"bp":90,"type":"Water","category":"Special","statChange":null},"Spore":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Spotlight":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Springtide Storm":{"bp":100,"type":"Fairy","category":"Special","statChange":null},"Stealth Rock":{"bp":0,"type":"Rock","category":"Status","statChange":null},"Steam Eruption":{"bp":110,"type":"Water","category":"Special","statChange":null},"Steamroller":{"bp":65,"type":"Bug","category":"Physical","statChange":null},"Steel Beam":{"bp":140,"type":"Steel","category":"Special","statChange":null},"Steel Roller":{"bp":130,"type":"Steel","category":"Physical","statChange":null},"Steel Wing":{"bp":70,"type":"Steel","category":"Physical","statChange":null},"Sticky Web":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Stockpile":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Stoked Sparksurfer":{"bp":175,"type":"Electric","category":"Special","statChange":null},"Stomp":{"bp":65,"type":"Normal","category":"Physical","statChange":null},"Stomping Tantrum":{"bp":75,"type":"Ground","category":"Physical","statChange":null},"Stone Axe":{"bp":65,"type":"Rock","category":"Physical","statChange":null},"Stone Edge":{"bp":100,"type":"Rock","category":"Physical","statChange":null},"Stored Power":{"bp":20,"type":"Psychic","category":"Special","statChange":null},"Storm Throw":{"bp":60,"type":"Fighting","category":"Physical","statChange":null},"Strange Steam":{"bp":90,"type":"Fairy","category":"Special","statChange":null},"Strength":{"bp":80,"type":"Normal","category":"Physical","statChange":null},"Strength Sap":{"bp":0,"type":"Grass","category":"Status","statChange":null},"String Shot":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Struggle":{"bp":50,"type":"Normal","category":"Physical","statChange":null},"Struggle Bug":{"bp":50,"type":"Bug","category":"Special","statChange":null},"Stuff Cheeks":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Stun Spore":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Submission":{"bp":80,"type":"Fighting","category":"Physical","statChange":null},"Substitute":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Subzero Slammer":{"bp":1,"type":"Ice","category":"Physical","statChange":null},"Sucker Punch":{"bp":70,"type":"Dark","category":"Physical","statChange":null},"Sunny Day":{"bp":0,"type":"Fire","category":"Status","statChange":null},"Sunsteel Strike":{"bp":100,"type":"Steel","category":"Physical","statChange":null},"Supercell Slam":{"bp":100,"type":"Electric","category":"Physical","statChange":null},"Super Fang":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Superpower":{"bp":120,"type":"Fighting","category":"Physical","statChange":null},"Supersonic":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Supersonic Skystrike":{"bp":1,"type":"Flying","category":"Physical","statChange":null},"Surf":{"bp":90,"type":"Water","category":"Special","statChange":null},"Surging Strikes":{"bp":25,"type":"Water","category":"Physical","statChange":null},"Swagger":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Swallow":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Sweet Kiss":{"bp":0,"type":"Fairy","category":"Status","statChange":null},"Sweet Scent":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Swift":{"bp":60,"type":"Normal","category":"Special","statChange":null},"Switcheroo":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Swords Dance":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Synchronoise":{"bp":120,"type":"Psychic","category":"Special","statChange":null},"Synthesis":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Syrup Bomb":{"bp":60,"type":"Grass","category":"Special","statChange":null},"Tachyon Cutter":{"bp":50,"type":"Steel","category":"Special","statChange":null},"Tackle":{"bp":40,"type":"Normal","category":"Physical","statChange":null},"Tail Glow":{"bp":0,"type":"Bug","category":"Status","statChange":null},"Tail Slap":{"bp":25,"type":"Normal","category":"Physical","statChange":null},"Tail Whip":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Tailwind":{"bp":0,"type":"Flying","category":"Status","statChange":null},"Take Down":{"bp":90,"type":"Normal","category":"Physical","statChange":null},"Take Heart":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Tar Shot":{"bp":0,"type":"Rock","category":"Status","statChange":null},"Taunt":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Tearful Look":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Teatime":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Techno Blast":{"bp":120,"type":"Normal","category":"Special","statChange":null},"Tectonic Rage":{"bp":1,"type":"Ground","category":"Physical","statChange":null},"Teeter Dance":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Telekinesis":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Teleport":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Temper Flare":{"bp":75,"type":"Fire","category":"Physical","statChange":null},"Tera Blast":{"bp":80,"type":"Normal","category":"Special","statChange":null},"Tera Starstorm":{"bp":120,"type":"Normal","category":"Special","statChange":null},"Terrain Pulse":{"bp":50,"type":"Normal","category":"Special","statChange":null},"Thief":{"bp":60,"type":"Dark","category":"Physical","statChange":null},"Thousand Arrows":{"bp":90,"type":"Ground","category":"Physical","statChange":null},"Thousand Waves":{"bp":90,"type":"Ground","category":"Physical","statChange":null},"Thrash":{"bp":120,"type":"Normal","category":"Physical","statChange":null},"Throat Chop":{"bp":80,"type":"Dark","category":"Physical","statChange":null},"Thunder":{"bp":110,"type":"Electric","category":"Special","statChange":null},"Thunderbolt":{"bp":90,"type":"Electric","category":"Special","statChange":null},"Thunder Cage":{"bp":80,"type":"Electric","category":"Special","statChange":null},"Thunderclap":{"bp":70,"type":"Electric","category":"Special","statChange":null},"Thunder Fang":{"bp":65,"type":"Electric","category":"Physical","statChange":null},"Thunderous Kick":{"bp":90,"type":"Fighting","category":"Physical","statChange":null},"Thunder Punch":{"bp":75,"type":"Electric","category":"Physical","statChange":null},"Thunder Shock":{"bp":40,"type":"Electric","category":"Special","statChange":null},"Thunder Wave":{"bp":0,"type":"Electric","category":"Status","statChange":null},"Tickle":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Tidy Up":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Topsy-Turvy":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Torch Song":{"bp":80,"type":"Fire","category":"Special","statChange":null},"Torment":{"bp":0,"type":"Dark","category":"Status","statChange":null},"Toxic":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Toxic Spikes":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Toxic Thread":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Trailblaze":{"bp":50,"type":"Grass","category":"Physical","statChange":null},"Transform":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Tri Attack":{"bp":80,"type":"Normal","category":"Special","statChange":null},"Trick":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Trick-or-Treat":{"bp":0,"type":"Ghost","category":"Status","statChange":null},"Trick Room":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Triple Arrows":{"bp":90,"type":"Fighting","category":"Physical","statChange":null},"Triple Axel":{"bp":20,"type":"Ice","category":"Physical","statChange":null},"Triple Dive":{"bp":30,"type":"Water","category":"Physical","statChange":null},"Triple Kick":{"bp":10,"type":"Fighting","category":"Physical","statChange":null},"Trop Kick":{"bp":70,"type":"Grass","category":"Physical","statChange":null},"Trump Card":{"bp":0,"type":"Normal","category":"Special","statChange":null},"Twin Beam":{"bp":40,"type":"Psychic","category":"Special","statChange":null},"Twineedle":{"bp":25,"type":"Bug","category":"Physical","statChange":null},"Twinkle Tackle":{"bp":1,"type":"Fairy","category":"Physical","statChange":null},"Twister":{"bp":40,"type":"Dragon","category":"Special","statChange":null},"Upper Hand":{"bp":65,"type":"Fighting","category":"Physical","statChange":null},"Uproar":{"bp":90,"type":"Normal","category":"Special","statChange":null},"U-turn":{"bp":70,"type":"Bug","category":"Physical","statChange":null},"Vacuum Wave":{"bp":40,"type":"Fighting","category":"Special","statChange":null},"V-create":{"bp":180,"type":"Fire","category":"Physical","statChange":null},"Veevee Volley":{"bp":0,"type":"Normal","category":"Physical","statChange":null},"Venom Drench":{"bp":0,"type":"Poison","category":"Status","statChange":null},"Venoshock":{"bp":65,"type":"Poison","category":"Special","statChange":null},"Victory Dance":{"bp":0,"type":"Fighting","category":"Status","statChange":null},"Vine Whip":{"bp":45,"type":"Grass","category":"Physical","statChange":null},"Vise Grip":{"bp":55,"type":"Normal","category":"Physical","statChange":null},"Vital Throw":{"bp":70,"type":"Fighting","category":"Physical","statChange":null},"Volt Switch":{"bp":70,"type":"Electric","category":"Special","statChange":null},"Volt Tackle":{"bp":120,"type":"Electric","category":"Physical","statChange":null},"Wake-Up Slap":{"bp":70,"type":"Fighting","category":"Physical","statChange":null},"Waterfall":{"bp":80,"type":"Water","category":"Physical","statChange":null},"Water Gun":{"bp":40,"type":"Water","category":"Special","statChange":null},"Water Pledge":{"bp":80,"type":"Water","category":"Special","statChange":null},"Water Pulse":{"bp":60,"type":"Water","category":"Special","statChange":null},"Water Shuriken":{"bp":15,"type":"Water","category":"Special","statChange":null},"Water Sport":{"bp":0,"type":"Water","category":"Status","statChange":null},"Water Spout":{"bp":150,"type":"Water","category":"Special","statChange":null},"Wave Crash":{"bp":120,"type":"Water","category":"Physical","statChange":null},"Weather Ball":{"bp":50,"type":"Normal","category":"Special","statChange":null},"Whirlpool":{"bp":35,"type":"Water","category":"Special","statChange":null},"Whirlwind":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Wicked Blow":{"bp":75,"type":"Dark","category":"Physical","statChange":null},"Wicked Torque":{"bp":80,"type":"Dark","category":"Physical","statChange":null},"Wide Guard":{"bp":0,"type":"Rock","category":"Status","statChange":null},"Wildbolt Storm":{"bp":100,"type":"Electric","category":"Special","statChange":null},"Wild Charge":{"bp":90,"type":"Electric","category":"Physical","statChange":null},"Will-O-Wisp":{"bp":0,"type":"Fire","category":"Status","statChange":null},"Wing Attack":{"bp":60,"type":"Flying","category":"Physical","statChange":null},"Wish":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Withdraw":{"bp":0,"type":"Water","category":"Status","statChange":null},"Wonder Room":{"bp":0,"type":"Psychic","category":"Status","statChange":null},"Wood Hammer":{"bp":120,"type":"Grass","category":"Physical","statChange":null},"Work Up":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Worry Seed":{"bp":0,"type":"Grass","category":"Status","statChange":null},"Wrap":{"bp":15,"type":"Normal","category":"Physical","statChange":null},"Wring Out":{"bp":0,"type":"Normal","category":"Special","statChange":null},"X-Scissor":{"bp":80,"type":"Bug","category":"Physical","statChange":null},"Yawn":{"bp":0,"type":"Normal","category":"Status","statChange":null},"Zap Cannon":{"bp":120,"type":"Electric","category":"Special","statChange":null},"Zen Headbutt":{"bp":80,"type":"Psychic","category":"Physical","statChange":null},"Zing Zap":{"bp":80,"type":"Electric","category":"Physical","statChange":null},"Zippy Zap":{"bp":80,"type":"Electric","category":"Physical","statChange":null},"Paleo Wave":{"bp":85,"type":"Rock","category":"Special","statChange":null},"Shadow Strike":{"bp":80,"type":"Ghost","category":"Physical","statChange":null},"Polar Flare":{"bp":75,"type":"Fire","category":"Special","statChange":null}};
