export const wpGetImage = (item, imageSize) => {

    let dict;
    const max_width = 500;
    const max_height = 500;

    try {
        // try to retrieve an optimized version of the image, if it exists
        dict = {
          id: item.id,
          source_url: item.media_details.sizes[imageSize].source_url,
          height: item.media_details.sizes[imageSize].height,
          width: item.media_details.sizes[imageSize].width
        };
      }
      catch(err) {
        // otherwise return the original image
        try {
          dict =  {
            id: item.id,
            source_url: item.media_details.sizes["full"].source_url,
            height: item.media_details.sizes["full"].height,
            width: item.media_details.sizes["full"].width
          };
          }
        catch(err) {
          // this post has no featured image.
        }
      }

      try {
        if (dict.height > max_height || dict.width > max_width) {
          console.log("size issues");
          const proportion = dict.height / dict.width;

          if (dict.height > max_height) {
            dict.height = max_width;
            dict.width = max_width / proportion;
          } else {
            dict.width = max_width;
            dict.height = max_width * proportion;
          }
        }
      }
      catch(err) {
        console.log("could not check size");
      }

      return dict;
}
