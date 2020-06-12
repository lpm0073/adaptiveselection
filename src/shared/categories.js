
function array_to_csv(level, categories) {
    switch(level) {
        case 0: return categories.level0_exclusions.join(",");
        case 1: return categories.level1_exclusions.join(",");
        case 2: return categories.level2_exclusions.join(",");
        case 3: return categories.level3_exclusions.join(",");
        case 4: return categories.level4_exclusions.join(",");
        default: return "";
    }
}

export const wpGetExclusions = (level, categories) => {
    // https://api.fotomashup.com/wp-json/wp/v2/media?categories=5,2&_fields=id,categories,acf,media_details&categories_exclude=3,10

    const exclusions = array_to_csv(level, categories);
    if (exclusions.length > 0) {
        return "categories_exclude=" + exclusions;
    }
    return "";
}