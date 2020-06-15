
function array_to_csv(level, categories) {

    if (categories.hasOwnProperty("level0_exclusions")) {
        switch(level) {
            case 0: return categories.level0_exclusions.join(",");
            case 1: return categories.level1_exclusions.join(",");
            case 2: return categories.level2_exclusions.join(",");
            case 3: return categories.level3_exclusions.join(",");
            case 4: return categories.level4_exclusions.join(",");
            default: return "";
        }
    }
    return "";
}

export const wpGetExclusionArray = (level, categories) => {

    if (categories.hasOwnProperty("level0_exclusions")) {
        switch(level) {
            case 0: return categories.level0_exclusions;
            case 1: return categories.level1_exclusions;
            case 2: return categories.level2_exclusions;
            case 3: return categories.level3_exclusions;
            case 4: return categories.level4_exclusions;
            default: return [];
        }
    }
    return [];
}

export const wpGetExclusions = (level, categories) => {
    // https://api.fotomashup.com/wp-json/wp/v2/media?categories=5,2&_fields=id,categories,acf,media_details&categories_exclude=3,10

    if (categories !== null && !isNaN(level)) {
        const exclusions = array_to_csv(level, categories);
        if (exclusions.length > 0) {
            return "categories_exclude=" + exclusions;
        }
    }
    return "";
}