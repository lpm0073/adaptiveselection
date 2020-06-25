export const wpBackendUrl = 'https://api.fotomashup.com/wp-json/wp/v2/';
export const wpMediaUrl = wpBackendUrl + 'media?_fields=id,categories,acf,media_details&per_page=100';
export const wpCategoriesUrl = wpBackendUrl + 'categories?per_page=100&_fields=id,count,acf';
const wpSplashUrl = wpMediaUrl + '&categories=41';

// https://api.fotomashup.com/wp-json/wp/v2/media?_fields=id,categories,acf,media_details&per_page=100&categories=41
export class WPImages {

    level = 0;
    pageNumber = 1;
    pagesReturned = [];
    items = [];
    callBackMethod = null;
    fetchDelay = null;
    categories = null;
    gettingSplashData = false;
    gotSplashData = false;
  
    constructor(level, callBackMethod) {
        this.level = level;
        this.callBackMethod = callBackMethod;

        this.fetch(); // query the splash page data
        this.fetchCategories(); // fetch & process categories, then recall fetch()

    }
  
    getNextPage() {
      return this.pageNumber += 1;
    }
  
    fetch() {
      var url;

      if (this.categories !== null && !this.gettingSplashData && !this.gotSplashData) {
        this.gettingSplashData = true;
        url = wpSplashUrl;
      } else {
        if (this.categories) url = wpMediaUrl + "&page=" + this.pageNumber + "&" + wpGetExclusions(this.level, this.categories);
        else return;
        if (this.pageNumber < 1) return;
        this.pageNumber = this.getNextPage(); 

      }

      fetch(url)
      .then(response => {
            if (response.ok) {
                return response;
            } else {
                var error = new Error('Error ' + response.status + ': ' + response.statusText);
                error.response = response;
                throw error;
            }
        },
        error => {
            throw new Error(error.message);
      })
      .then(response => response.json())
      .then(images => {
        if (this.gettingSplashData) {
          this.gotSplashData = true;
          this.gettingSplashData = false;
        }

        // only add unique return values, so that we don't accumulated duplicates in the working set
        var new_images = [];
        for (var i=0; i<images.length;  i++) {
          const candidate = images[i]
          if (this.items.filter(image => candidate.id === image.id).length === 0) new_images.push(images[i]);
        }
  
        // attribute pre-initializations
        new_images = new_images.map((image) => {
          image.type = "WPData";
          image.viewing_sequence = 0;
          image.rank = 1;   
          return image;
        })
        this.callBackMethod(new_images);
        this.items = this.items.concat(new_images);
        this.pagesReturned.push(this.pageNumber);

        const self = this;
        this.fetchDelay = setTimeout(function() {
          self.fetch();      
        }, 1000);

      })
      .catch(error => {
        // don't do anything
      });
  } /* ----------------- fetch() ----------------------------- */

  fetchCategories() {

    return fetch(wpCategoriesUrl)
    .then(
        response => {
            if (response.ok) {
                return response;
            } else {
                var error = new Error('Error ' + response.status + ': ' + response.statusText);
                error.response = response;
                throw error;
            }
        },
        error => {
            var errmess = new Error(error.message);
            throw errmess;
        })
    .then(response => response.json())
    .then(categories => {
        // Calculate category factor weights by level of explicitness (0 thru 4)
        let i;
        var explicitness = 0;
        var factorweighted_categories = [],

            level0_exclusions = [],
            level1_exclusions = [],
            level2_exclusions = [],
            level3_exclusions = [],
            level4_exclusions = [],

            level0_cnt = 0,
            level1_cnt = 0,
            level2_cnt = 0,
            level3_cnt = 0,
            level4_cnt = 0,

            level0_i = 0,
            level1_i = 0,
            level2_i = 0,
            level3_i = 0,
            level4_i = 0,

            level0_normalization_factor = 0,
            level1_normalization_factor = 0,
            level2_normalization_factor = 0,
            level3_normalization_factor = 0,
            level4_normalization_factor = 0,

            SumOfCountWeight_0 = 0,
            SumOfCountWeight_1 = 0,
            SumOfCountWeight_2 = 0,
            SumOfCountWeight_3 = 0,
            SumOfCountWeight_4 = 0;

        

        for (i=0; i < categories.length; i++) {
            const x = categories[i]
            explicitness = 0;
            if (x.acf.explicitness) explicitness = x.acf.explicitness
            explicitness = parseInt(explicitness, 10);
            switch (explicitness) {
                case 0:
                    level0_cnt += x.count;
                    level0_i += 1;
                    break;
                case 1:
                    level1_cnt += x.count;
                    level1_i += 1;
                    level0_exclusions.push(x.id);
                    break;
                case 2:
                    level2_cnt += x.count;
                    level2_i += 1;
                    level1_exclusions.push(x.id);
                    break;
                case 3:
                    level3_cnt += x.count;
                    level3_i += 1;
                    level2_exclusions.push(x.id);
                    break;
                case 4:
                    level4_cnt += x.count;
                    level4_i += 1;
                    level3_exclusions.push(x.id);
                    break;
                default:
                    break;
            }
        }
        level2_exclusions = level2_exclusions.concat(level3_exclusions);
        level1_exclusions = level1_exclusions.concat(level2_exclusions);
        level0_exclusions = level0_exclusions.concat(level1_exclusions);

        level4_cnt += level3_cnt + level2_cnt + level1_cnt + level0_cnt;
        level3_cnt += level2_cnt + level1_cnt + level0_cnt;
        level2_cnt += level1_cnt + level0_cnt;
        level1_cnt += level0_cnt;

        level4_i += level3_i + level2_i + level1_i + level0_i;
        level3_i += level2_i + level1_i + level0_i;
        level2_i += level1_i + level0_i;
        level1_i += level0_i;

        // add percentage weights by level
        for (i=0; i < categories.length; i++) {
            
            var x = categories[i];

            // initialize analytics data
            x.user_signals = {
                like: 0,
                unlike: 0,
                dislike: 0,
                info: 0,
                close: 0,
                click: 0,
                move: 0,
                resize: 0
            }
            explicitness = 0;
            if (x.acf.explicitness) explicitness = x.acf.explicitness
            explicitness = parseInt(explicitness, 10);

            x.level = explicitness;
            x.level0_item_pct = x.count / level0_cnt;
            x.level1_item_pct = x.count / level1_cnt;
            x.level2_item_pct = x.count / level2_cnt;
            x.level3_item_pct = x.count / level3_cnt;
            x.level4_item_pct = x.count / level4_cnt;

            x.level0_count_weight = x.count / (level0_cnt / level0_i);
            x.level1_count_weight = x.count / (level1_cnt / level1_i);
            x.level2_count_weight = x.count / (level2_cnt / level2_i);
            x.level3_count_weight = x.count / (level3_cnt / level3_i);
            x.level4_count_weight = x.count / (level4_cnt / level4_i);

            // initialize scoring metric
            x.factor_score = 0;

            delete x.acf;
            factorweighted_categories.push(x);
        }
        // normalize factor results (step 1)
        for (i=0; i < factorweighted_categories.length; i++) {
            SumOfCountWeight_0 += factorweighted_categories[i].level0_count_weight;
            SumOfCountWeight_1 += factorweighted_categories[i].level1_count_weight;
            SumOfCountWeight_2 += factorweighted_categories[i].level2_count_weight;
            SumOfCountWeight_3 += factorweighted_categories[i].level3_count_weight;
            SumOfCountWeight_4 += factorweighted_categories[i].level4_count_weight;
        }

        level0_normalization_factor = SumOfCountWeight_0 / level0_i;
        level1_normalization_factor = SumOfCountWeight_1 / level1_i;
        level2_normalization_factor = SumOfCountWeight_2 / level2_i;
        level3_normalization_factor = SumOfCountWeight_3 / level3_i;
        level4_normalization_factor = SumOfCountWeight_4 / level4_i;


        for (i=0; i < factorweighted_categories.length; i++) {
            factorweighted_categories[i].level0_weight = factorweighted_categories[i].level0_count_weight / level0_normalization_factor;
            factorweighted_categories[i].level1_weight = factorweighted_categories[i].level1_count_weight / level1_normalization_factor;
            factorweighted_categories[i].level2_weight = factorweighted_categories[i].level2_count_weight / level2_normalization_factor;
            factorweighted_categories[i].level3_weight = factorweighted_categories[i].level3_count_weight / level3_normalization_factor;
            factorweighted_categories[i].level4_weight = factorweighted_categories[i].level4_count_weight / level4_normalization_factor;
        }

        this.categories = {
            level0_exclusions: level0_exclusions,
            level1_exclusions: level1_exclusions,
            level2_exclusions: level2_exclusions,
            level3_exclusions: level3_exclusions,
            level4_exclusions: level4_exclusions,
            level0_i: level0_i,
            level1_i: level1_i,
            level2_i: level2_i,
            level3_i: level3_i,
            level4_i: level4_i,
            level0_normalization_factor: level0_normalization_factor,
            level1_normalization_factor: level1_normalization_factor,
            level2_normalization_factor: level2_normalization_factor,
            level3_normalization_factor: level3_normalization_factor,
            level4_normalization_factor: level4_normalization_factor,
            categories: factorweighted_categories
        }
        this.fetch();
    })
    .catch(error => console.log("fetchCategories() failed.", error.message));

} /* ------------------- fetchCategories)() ------------------- */

}  /* ---------------------------------- WPImages --------------------------------------------------- */

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
    
    const exclusions = array_to_csv(level, categories);

    if (exclusions.length > 0) {
        return "categories_exclude=" + exclusions;
    }

    return "";
}

/* return a dict of image meta data based on available images, screen size, and aspect_ratio. */
export const wpGetImage = (item, max_height = window.screen.height, max_width = window.screen.width) => {

    let dict, imgDict;
    const aspect_ratio = getAspectRatio(item);
    var size = "DEFAULT",
        sizes = null,
        height = 0,
        width =0;

        // try to retrieve an optimized version of the image, if it exists
        size = sizeChooser(item);
        imgDict = size === "DEFAULT" ? item.media_details : item.media_details.sizes[size];
        sizes = item.media_details.hasOwnProperty("sizes") ? item.media_details.sizes : item.media_details;
        height = getHeight(imgDict.height, imgDict.width, aspect_ratio);
        width = getWidth(imgDict.height, imgDict.width, aspect_ratio);

        if (height > getMaxRenderingHeight(max_height)) {
            height = getMaxRenderingHeight(max_height);
            width = height / aspect_ratio;
        }
        if (width > getMaxRenderingWidth(max_width)) {
          width = getMaxRenderingWidth(max_width);
          height = width * aspect_ratio;
        }

      dict = {
          id: item.id,
          source_url: imgDict.source_url,
          raw_height: imgDict.height,
          raw_width: imgDict.width,
          max_image_width: getMaxImageWidth(),
          max_image_height: getMaxImageHeight(),      
          height: height,
          width: width,
          aspect_ratio: aspect_ratio,
          valid_sizes: getValidSizes(item),
          size: size,
          sizes: sizes
        };

      if(dict.size === "DEFAULT") {
        console.log("wpGetImage() results", dict);
      }

      return dict;
}

function sizeChooser(item) {
  /*
    Analyze available options for image size.
    Choose the largest available size based on device screen
   */
  var validSizes = [],
      selected_size = "DEFAULT";

  validSizes = getValidSizes(item);
  if (validSizes.length > 0) selected_size = getSmallest(item, validSizes);
  else selected_size = getLargest(item);
  
  return selected_size;
}

function getAspectRatio(item) {
  /*
    If there's enough meta data then 
    try to determine aspect_ratio of image
   */
  var height = 0,
      width = 0;

  if (item !== null && typeof(item) === "object") {
    if (item.media_details.hasOwnProperty("height")) {
      height = item.media_details.height;
    }
    if (item.media_details.hasOwnProperty("width")) {
      width = item.media_details.width;
    }
    if (height > 0 && width > 0) return height / width;
  }
  return -1
}

// return height, or if necessary try to derive it.
function getHeight(height, width, aspect_ratio) {
  if (typeof(height) === "number") return height;
  if (typeof(width) === "number" && aspect_ratio > 0) return width * aspect_ratio;
  return -1;
}

// return width, or if necessary try to derive it.
function getWidth(height, width, aspect_ratio) {
  if (typeof(width) === "number") return width;
  if (typeof(height) === "number" && aspect_ratio > 0) return height / aspect_ratio;
  return -1;
}

/* 
  if there are size options included in the results
  then analyze these and choose all that are at least
  as large as our expected viewing area.
*/
function getValidSizes(item) {
  const aspect_ratio = getAspectRatio(item);
  const max_width = getMaxImageWidth() 
  const max_height = getMaxImageHeight()
  var x = null,
      height = 0,
      width = 0,
      validSizes = []

  if (item.hasOwnProperty("media_details")) {
    if (item.media_details.hasOwnProperty("sizes")) {
      for (var size in item.media_details.sizes) {
        x = item.media_details.sizes[size];
        if (x.hasOwnProperty("width") && x.hasOwnProperty("height")) {
          height = getHeight(x.height, x.width, aspect_ratio);
          width = getWidth(x.height, x.width, aspect_ratio);
          if ((aspect_ratio < 1 && width > max_width) || (aspect_ratio >= 1 && height > max_height)) {
           validSizes.push(size);
          }
        }
      }
    }  
  }
  return validSizes;
}

/*
  return the largest image
 */
function getLargest(item) {
  var largest = 0,
      selected_size = "DEFAULT",
      x = 0;
  const aspect_ratio = getAspectRatio(item);

  if (item.media_details.hasOwnProperty("sizes")) {
    for (var size in item.media_details.sizes) {
      x = item.media_details.sizes[size];
      if (x.hasOwnProperty("width") && x.hasOwnProperty("height")) {

        if (x.width > largest && aspect_ratio < 1) {
          largest = x.width;
          selected_size = size;
        }
        if (x.height > largest && aspect_ratio >= 1) {
          largest = x.height;
          selected_size = size;
        }
    
      }
    }
  }

  return selected_size;
}

/*
  return the smallest image from our list of valid image sizes
 */
function getSmallest(item, validSizes) {
  var smallest = 99999,
      selected_size = "DEFAULT",
      x = 0;
  const aspect_ratio = getAspectRatio(item);

  validSizes.forEach((obj, idx) => {
    if (item.hasOwnProperty("media_details")) {
      x = item.media_details.sizes[obj];
      if (x.width < smallest && aspect_ratio < 1) {
        smallest = x.width;
        selected_size = obj;
      }
      if (x.height < smallest && aspect_ratio >= 1) {
        smallest = x.height;
        selected_size = obj;
      }
    }
  });

  return selected_size;

}


function getMaxRenderingHeight(max_height = 1024) {
  var homePage = document.getElementById("home-page");
  if (homePage) return  homePage.offsetHeight < max_height ? homePage.offsetHeight : max_height;
  return window.screen.height < max_height ? window.screen.height : max_height;
}
function getMaxRenderingWidth(max_width = 2048) {
  var homePage = document.getElementById("home-page");
  if (homePage) return homePage.offsetWidth < max_width ? homePage.offsetWidth : max_width;
  return window.screen.width < max_width ? window.screen.height : max_width;
}
function getMaxImageHeight(max_height = 1024) {
  var homePage = document.getElementById("home-page");
  if (homePage) return  homePage.offsetHeight < max_height ? homePage.offsetHeight : max_height;
  return window.screen.height < max_height ? window.screen.height : max_height;
}
function getMaxImageWidth(max_width = 2048) {
  var homePage = document.getElementById("home-page");
  if (homePage) return homePage.offsetWidth < max_width ? homePage.offsetWidth : max_width;
  return window.screen.width < max_width ? window.screen.height : max_width;
}