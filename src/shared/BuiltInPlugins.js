
import { ImagesApi } from './ImagesApi';


export class SplashContent extends ImagesApi {
    constructor(level, callBackMethod) {
        super("Wallpapers", 41, null, callBackMethod, level, false);
    }
}

export class Wallpapers extends ImagesApi {
    constructor(level, callBackMethod) {
        super("Wallpapers", 46, null, callBackMethod, level, false);
    }
}
export class Girls extends ImagesApi {
    constructor(level, callBackMethod) {
        super("Girls", 45 , null, callBackMethod, level, true);
    }
}

