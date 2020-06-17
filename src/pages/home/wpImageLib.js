export const wpGetImage = (item, max_height = 1024, max_width = 2048) => {
  /*
    return a dict of image meta data based on available
    images, screen size, and aspect_ratio.
   */

    let dict, imgDict;
    const aspect_ratio = getAspectRatio(item);
    var size = "DEFAULT",
        sizes = null,
        height = 0,
        width =0;

        // try to retrieve an optimized version of the image, if it exists
        size = sizeChooser(item);
        imgDict = size === "DEFAULT" ? item.api_props.media_details : item.api_props.media_details.sizes[size];
        sizes = item.api_props.media_details.hasOwnProperty("sizes") ? item.api_props.media_details.sizes : item.api_props.media_details;
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
    if (item.api_props.media_details.hasOwnProperty("height")) {
      height = item.api_props.media_details.height;
    }
    if (item.api_props.media_details.hasOwnProperty("width")) {
      width = item.api_props.media_details.width;
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

  if (item.api_props.hasOwnProperty("media_details")) {
    if (item.api_props.media_details.hasOwnProperty("sizes")) {
      for (var size in item.api_props.media_details.sizes) {
        x = item.api_props.media_details.sizes[size];
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

  if (item.api_props.media_details.hasOwnProperty("sizes")) {
    for (var size in item.api_props.media_details.sizes) {
      x = item.api_props.media_details.sizes[size];
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
    if (item.api_props.hasOwnProperty("media_details")) {
      x = item.api_props.media_details.sizes[obj];
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