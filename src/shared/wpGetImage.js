
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
  console.log("getAspectRatio didnt return a value", item, height, width);
  return -1
}

function sizeChooser(item) {
  /*
    Analyze available options for image size.
    Choose the largest available size based on device screen
   */
  const aspect_ratio = getAspectRatio(item);
  const max_width = window.screen.width;
  const max_height = window.screen.height;
  var validSizes = [],
      x,
      largest = 0, 
      selected_size = "DEFAULT";

  /* 
    if there are size options included in the results
    then analyze these and choose the best one.
   */
  if (item.media_details.hasOwnProperty("sizes")) {
    for (var prop in item.media_details.sizes) {
      x = item.media_details.sizes[prop];
      if (x.hasOwnProperty("width") && x.hasOwnProperty("height") && typeof(x.width) === "number" && typeof(x.height) === "number") {
        if ((aspect_ratio < 1 && x.width < max_width) || 
        (aspect_ratio >= 1 && x.height < max_height)) {
         validSizes.push(prop);
        }
      } else console.log("sizeChooser - validations failed", item);
    }
  } else console.log("sizeChooser - no Sizes array found", item);

  // scan the list of qualified sizes, choose the largest.
  validSizes.forEach((obj, idx) => {
    x = item.media_details.sizes[obj];
    if (x.width > largest && aspect_ratio < 1) {
      largest = x.width;
    }
    if (x.height > largest && aspect_ratio >= 1) {
      largest = x.height;
    }
  });

  // scan the list, find the name of the largest.
  validSizes.forEach((obj, idx) => {
    x = item.media_details.sizes[obj];
    if (x.width = largest && aspect_ratio < 1) {
      selected_size = obj;
    }
    if (x.height > largest && aspect_ratio >= 1) {
      selected_size = obj;
    }
  });
  if (selected_size === "DEFAULT") {
    console.log("sizeChooser() - didnt find anything", item);
  }

  return selected_size;

}

export const wpGetImage = (item, imageSize) => {
  /*
    return a dict of image meta data based on available
    images, screen size, and aspect_ratio.
   */
    let dict, imgDict;
    const max_width = window.screen.width;
    const max_height = window.screen.height;
    var size = "DEFAULT",
        sizes = null,
        height = 0,
        width =0;

        // try to retrieve an optimized version of the image, if it exists
        size = sizeChooser(item);
        imgDict = size === "DEFAULT" ? item.media_details : item.media_details.sizes[size];
        sizes = item.media_details.hasOwnProperty("sizes") ? item.media_details.sizes : item.media_details;

        if (imgDict.hasOwnProperty("height")) {
          width = imgDict.height;
        }
        if (imgDict.hasOwnProperty("width")) {
          width = imgDict.width;
        }
      dict = {
          id: item.id,
          source_url: imgDict.source_url,
          height: height,
          width: width,
          aspect_ratio: getAspectRatio(item),
          sizes: sizes
        };

      //console.log("wpGetImage() - results", size, dict, imgDict);

      return dict;
}
