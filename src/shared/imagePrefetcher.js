//import { wpGetImage } from './wpGetImage';

export const imagePreFetcher = (url) => {

    setTimeout(function() {
        console.log("imagePreFetcher()", url);
        new Image().src = url;
        }, 10);

}
