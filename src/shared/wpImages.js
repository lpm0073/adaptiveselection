export const wpBackendUrl = 'https://api.fotomashup.com/wp-json/wp/v2/';
export const wpMediaUrl = wpBackendUrl + 'media?_fields=id,categories,acf,media_details&per_page=100';
export const wpCategoriesUrl = wpBackendUrl + 'categories?per_page=100&_fields=id,count,acf';
const wpSplashUrl = wpMediaUrl + '&categories=41';

// https://api.fotomashup.com/wp-json/wp/v2/media?_fields=id,categories,acf,media_details&per_page=100&categories=41
export class WPImages {

    level = 0;
    pageNumber = 1;
    numPages = 25;
    pagesReturned = [];
    items = [];
    callBackMethod = null;
    fetchDelay = null;
    categories = null;
    gettingSplashData = false;
    gotSplashData = false;
  
    constructor(level, categories, callBackMethod) {
        this.categories = categories;
        this.level = level;
        this.callBackMethod = callBackMethod;

        this.fetch();

    }
  
    // find the next random page number to query by choosing
    // a random page that has not already been queried.
    getNextPage() {
      var potentialPages = [];
      for (var i=1; i<this.numPages; i++) {
        if (! this.pagesReturned.includes(i)) {
          potentialPages.push(i);
        }
      }
      if (potentialPages.length === 0) return 0;
      var idx = Math.floor(Math.random() * potentialPages.length);
      return potentialPages[idx];
  
    }
  
    fetch() {
      var url;
      if (this.categories.isLoading && !this.gettingSplashData && !this.gotSplashData) {
        this.gettingSplashData = true;
        url = wpSplashUrl;
      }
      else url = wpMediaUrl + "&" + wpGetExclusions(this.level, this.categories);

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
  
        new_images = new_images.map((image) => {
          image.viewing_sequence = 0;
          image.rank = 1;   // pre-initialize image rank based on user signals. 
          return image;
        })
        this.callBackMethod(new_images);
        this.items = this.items.concat(new_images);
        this.pagesReturned.push(this.pageNumber);
        this.pageNumber = this.getNextPage(); 

        if (this.pagesReturned.length < this.numPages) {
          const self = this;
          this.fetchDelay = setTimeout(function() {
            self.fetch();      
          }, 1000);
        }

      })
      .catch(error => {
        /* most common error is when we query for non-existent page (we don't know how many pages there are) */
         /*
            {
              "code": "rest_post_invalid_page_number",
              "message": "The page number requested is larger than the number of pages available.",
              "data": {
                "status": 400
                }
            }
        */
  
      // try to reverse engineer the total number of pages available.
        var numPages = this.numPages > this.pageNumber ? this.numPages - Math.floor((this.numPages - this.pageNumber)/2)  : this.numPages;
        numPages = numPages > Math.max( ...this.pagesReturned ) ? numPages - 1 : Math.max( ...this.pagesReturned );
        this.numPages = numPages;
        this.pageNumber = this.getNextPage();

        const self = this;
        console.log("fetch() - error", this.numPages, this.pagesReturned.length, this.pageNumber);
        if (this.pagesReturned.length < this.numPages) {
          this.fetchDelay = setTimeout(function() {
            self.fetch();      
          }, 1000);
          }
  
      });
  
  }
}


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
  /*
    return a dict of image meta data based on available
    images, screen size, and aspect_ratio.
  */
 export const wpGetImage = (item, max_height = 1024, max_width = 2048) => {

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