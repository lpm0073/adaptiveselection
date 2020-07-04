
import { ImagesApi } from './ImagesApi';

const BackendURL = 'https://api.fotomashup.com/wp-json/wp/v2/';
const BaseMediaURL = BackendURL + 'media?_fields=id,categories,acf,media_details&per_page=100';
const PageIdentifer = "&page=";
const CategoryExclusionIdentifier = "categories_exclude=";
const CategoriesURL = BackendURL + 'categories?per_page=100&_fields=id,count,acf';
const SplashURL = BaseMediaURL + '&categories=41';

export class Girls extends ImagesApi {
    constructor(level, callBackMethod, channel) {
        const MediaURL = BaseMediaURL + '&categories=45';
        super("Girls", MediaURL, CategoriesURL, SplashURL, PageIdentifer, CategoryExclusionIdentifier, callBackMethod, level, channel);
    }
}

export class Wallpapers extends ImagesApi {
    constructor(level, callBackMethod, channel) {
        const MediaURL = BaseMediaURL + '&categories=46';    
        super("Wallpapers", MediaURL, CategoriesURL, SplashURL, PageIdentifer, CategoryExclusionIdentifier, callBackMethod, level, channel);
    }
}


