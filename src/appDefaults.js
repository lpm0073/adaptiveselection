// app defaults

/*
  API note to self: 
  in order to get Wordpress api to include all children of a parent category
  i had to hack /var/www/html/fotomashup.com/wp-includes/rest-api/endpoints/class-wp-rest-posts-controller.php
  setting       'include_children' => true
  in two location in this file.

 */

// MAX_ROWS
// ----------------------------------------------------------------
// number of rows of on-screen content
// before garbage collection begins purging
// during timeouts.
export const MAX_ROWS = 75;

// IMAGE_CONTENT
// governs the veracity of multi-image content
// on ItemRow data.
export const IMAGE_CONTENT_2ITEMS = .10;
export const IMAGE_CONTENT_3ITEMS = .10;

// IDLE_TIMEOUT
// ----------------------------------------------------------------
// wait period between on-screen garbage
// collection.
export const IDLE_TIMEOUT = 30000;

// DEFAULT_ADULT_CONTENT
// ----------------------------------------------------------------
// passed to content plugins to govern the extent to which
// adult content can be passed from the api.
// 0 - Suitable for general audiences
// 1 - Adult/suggestive themed, including exposed breasts
// 2 - Adult/suggestive themed, including exposed breasts, buttocks
// 3 - Fully nude
// 4 - Exposed genitalia
// 5 - Sexually explicit / pornography
export const DEFAULT_ADULT_CONTENT = 0;
