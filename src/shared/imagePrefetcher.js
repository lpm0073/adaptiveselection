//import { wpGetImage } from './wpGetImage';

export const imagePreFetcher = (arr, delay, desc) => {

    setTimeout(function() {
        arr.forEach((post) => {
            new Image().src = "FIX ME: wpGetImage(post);"
        });
        }, delay * 1000 * Math.random());

    return arr;
}
