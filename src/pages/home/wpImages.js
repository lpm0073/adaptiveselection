

export class WPImages {

    level = 0;
    mediaQuery;
    pageNumber = 100;
    pagesReturned = [];
    items = [];
    callBackMethod = null;
  
    constructor(level, callBackMethod) {
  
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
      const url = this.mediaQuery + "&page=" + this.pageNumber;
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
  
        const isWorkingSetInitialized = this.items.length > 0;
        this.items = this.items.concat(new_images);
  
        if (!isWorkingSetInitialized) this.callBackMethod();
  
        this.pagesReturned.push(this.pageNumber);
        this.pageNumber = this.getNextPage(); 
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
  
      // try to reverse engineer the total number of pages avaiable.
        var numPages = this.numPages > this.pageNumber ? this.numPages - Math.floor((this.numPages - this.pageNumber)/2)  : this.numPages;
        numPages = numPages > Math.max( ...this.pagesReturned ) ? numPages - 1 : Math.max( ...this.pagesReturned );
        this.numPages = numPages;
        this.pageNumber = this.getNextPage();
  
      });
  
  }
}