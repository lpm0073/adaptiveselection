
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
function getValidSizes(item, images_per_row = 3) {
  const aspect_ratio = getAspectRatio(item);
  const max_width = window.screen.width / images_per_row;
  const max_height = window.screen.height;
  var x = null,
      height = 0,
      width = 0,
      validSizes = []

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
  return validSizes;
}

/*
  return the largest image from our list of valid image sizes
 */
function getLargest(item, validSizes) {
  var largest = 0,
      selected_size = "DEFAULT",
      x = 0;
  const aspect_ratio = getAspectRatio(item);

  validSizes.forEach((obj, idx) => {
    x = item.media_details.sizes[obj];
    if (x.width > largest && aspect_ratio < 1) {
      largest = x.width;
      selected_size = obj;
    }
    if (x.height > largest && aspect_ratio >= 1) {
      largest = x.height;
      selected_size = obj;
    }
  });

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
    x = item.media_details.sizes[obj];
    if (x.width < smallest && aspect_ratio < 1) {
      smallest = x.width;
      selected_size = obj;
    }
    if (x.height < smallest && aspect_ratio >= 1) {
      smallest = x.height;
      selected_size = obj;
    }
  });

  return selected_size;

}

function sizeChooser(item, images_per_row = 3) {
  /*
    Analyze available options for image size.
    Choose the largest available size based on device screen
   */
  var validSizes = [],
      selected_size = "DEFAULT";

  validSizes = getValidSizes(item, images_per_row);
  selected_size = getSmallest(item, validSizes);
  if (selected_size === "DEFAULT") {
    selected_size = getLargest(item, validSizes);
  }

  return selected_size;

}

function getMaxRenderingHeight(max_height = 500) {
  return  window.screen.height < max_height ? window.screen.height : max_height;

}
function getMaxRenderingWidth(images_per_row) {

  return window.screen.width / images_per_row

}

export const wpGetImage = (item, images_per_row = 3, max_height = 500) => {
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
        size = sizeChooser(item, images_per_row);
        imgDict = size === "DEFAULT" ? item.media_details : item.media_details.sizes[size];
        sizes = item.media_details.hasOwnProperty("sizes") ? item.media_details.sizes : item.media_details;
        height = getHeight(imgDict.height, imgDict.width, aspect_ratio);
        width = getWidth(imgDict.height, imgDict.width, aspect_ratio);

        if (height > getMaxRenderingHeight(max_height)) {
            height = getMaxRenderingHeight(max_height);
            width = height / aspect_ratio;
        }
        if (width > getMaxRenderingWidth()) {
          width = getMaxRenderingWidth();
          height = width * aspect_ratio;
        }

      dict = {
          id: item.id,
          source_url: imgDict.source_url,
          raw_height: imgDict.height,
          raw_width: imgDict.width,
          height: height,
          width: width,
          aspect_ratio: aspect_ratio,
          valid_sizes: getValidSizes(item, images_per_row),
          size: size,
          sizes: sizes
        };

      //console.log("wpGetImage() results", dict);

      return dict;
}
