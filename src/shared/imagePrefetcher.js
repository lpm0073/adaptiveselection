import { wpGetImage } from './wpGetImage';

export const imagePreFetcher = (arr, delay, desc) => {

    setTimeout(function() {
        arr.forEach((post) => {
            new Image().src = wpGetImage(post);
        });
        }, delay * 1000 * Math.random());

    return arr;
}
