//import { wpGetImage } from './wpGetImage';

export const imagePreFetcher = (url) => {

    setTimeout(function() {
        new Image().src = url;
        }, 10);

}
