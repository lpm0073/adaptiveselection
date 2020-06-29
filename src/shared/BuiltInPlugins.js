
import { ImagesApi } from './ImagesApi';

export class DemoImages extends ImagesApi {
    
    constructor(level, callBackMethod, channel) {

        const BackendURL = 'https://api.fotomashup.com/wp-json/wp/v2/';
        const MediaURL = BackendURL + 'media?_fields=id,categories,acf,media_details&per_page=100';
        const CategoriesURL = BackendURL + 'categories?per_page=100&_fields=id,count,acf';
        const SplashURL = MediaURL + '&categories=41';
        const PageIdentifer = "&page=";
        const CategoryExclusionIdentifier = "categories_exclude=";
    
        super(MediaURL, CategoriesURL, SplashURL, PageIdentifer, CategoryExclusionIdentifier, callBackMethod, level, channel);
    }
}
