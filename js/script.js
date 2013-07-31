window.onload = function() {
	loadPictures("Sunflower");
}

/**
 * Load new pictures when scrolled to the end of page
 *
 * TODO: stop loading more than once when end of page reached
 */
window.onscroll = function() {
	if (window.pageYOffset + window.innerHeight + 100 >= document.body.scrollHeight) {
		appendImages();		
	}		
}

/**
 * Delete pictures from page and load new ones
 * Not used anymore because of automatic reload
 */		
function showNextPage(form) {
	incPageNumber();		
	
	var photosContainer = document.getElementById("photos");
	while (photosContainer.hasChildNodes()) {
			photosContainer.removeChild(photosContainer.firstChild);
	}			
	
	var currentSearchString = encodeURI(document.getElementById("searchQuery").placeholder);
	var pageNumber = document.getElementById("pageNumber").value;
	loadPictures(currentSearchString, pageNumber);
}

/**
 * Append images to page without deleting old ones
 */
function appendImages() {
	incPageNumber();
		
	var currentSearchString = document.getElementById("searchQuery").placeholder;
	var pageNumber = document.getElementById("pageNumber").value;
	loadPictures(currentSearchString, pageNumber);
}

/**
 * Keep track of page number for Flickr API
 */
function incPageNumber() {
	var pageNumber = document.getElementById("pageNumber").value;
	pageNumber = parseInt(pageNumber);
	pageNumber++;		
	document.getElementById("pageNumber").value = pageNumber;
}

/**
 * Reset if new search is performed
 */
function resetPageNumber() {
	document.getElementById("pageNumber").value = "1";
}

/**
 * Extracts the search query from the form and
 * rewrites the form so that the placeholer is displayed. Then
 * deletes old pictures and passes the searchString to the
 * loadPictures method.
 *
 *TODO: value of placeholder can be changed by simply assigning
 */ 
function searchImages(form) {
	var searchString = encodeURI(form.searchString.value);
	
	form.removeChild(document.getElementById("searchQuery"));
	
	var newInputField = document.createElement("input");
	newInputField.setAttribute("type", "text");
	newInputField.setAttribute("name", "searchString");
	newInputField.setAttribute("value", "");
	newInputField.setAttribute("placeholder", decodeURI(searchString));
	newInputField.setAttribute("id", "searchQuery");
	
	form.insertBefore(newInputField, form.firstChild);		

	resetPageNumber();	
	
	//delete old pictures
	var photosContainer = document.getElementById("photos");
	
	while (photosContainer.hasChildNodes()) {
			photosContainer.removeChild(photosContainer.firstChild);
	}
	
	loadPictures(searchString);	
}

/**
 * Load new pictures and append them to the buttom of page
 */
function loadPictures(tag, pageNumber) {
	
	if (tag == "") {
		tag = "Sunflowers";
	}
	
	var apiScript = document.createElement("script");
	apiScript.setAttribute("type", "text/javascript");
	apiScript.src = "http://api.flickr.com/services/rest/?format=json&sort=random&method=flickr.photos.search&page=" + pageNumber + "&per_page=120&tags=" + tag + "&tag_mode=all&api_key=6202031574e5d7c896dd4711b2611cc5";
	document.getElementsByTagName('head')[0].appendChild(apiScript);

	jsonFlickrApi = function(response) {
	 	if (response.stat != "ok") {
	 		alert("no API");
			return;
	 	}
		
		var photosContainer = document.getElementById("photos");
						
		for (var i=0; i < response.photos.photo.length; i++) {
			photo = response.photos.photo[i];

			var url = pictureThumb(photo);
			var previewThumb = document.createElement("img");
			previewThumb.setAttribute("src", url);
			previewThumb.setAttribute("titleOfPicture", photo.title);
			previewThumb.setAttribute("class", "previewThumb");
			
			var linkToMediumPicture = document.createElement("a");
			linkToMediumPicture.setAttribute("href", pictureMedium(photo));
			linkToMediumPicture.setAttribute("class", "linkToMediumPicture");
			
			linkToMediumPicture.appendChild(previewThumb);
			photosContainer.appendChild(linkToMediumPicture);	
			
			previewThumb.onmouseover = showPictureInformation;
			linkToMediumPicture.onclick = showMediumImg;		
		}
		
		if (response.photos.photo.length == 0) {
			photosContainer.appendChild(document.createTextNode("No Pictures found. "));	
		}		
		document.getElementsByTagName('head')[0].removeChild(document.getElementsByTagName('head')[0].lastChild);
	}
}

/**
 * Get the picture title and display it in the sidebar
 */		
function showPictureInformation(event) {
	var picture = event.currentTarget;
	var pictureTitle = event.currentTarget.getAttribute("titleOfPicture");
	var info = document.createTextNode(pictureTitle);
	
	var tdTitle = document.getElementById("pictureTitle");
	tdTitle.appendChild(info);
	
	picture.onmouseout = function() {
		tdTitle.removeChild(info);
	}
	
	//information.setAttribute("class", "pictureInformation");
	//information.appendChild(pictureTitle);
	//sidebar.appendChild(pictureTitle);		
}	

/**
 * Show the medium-sized image in a on-page popup
 */
function showMediumImg(event) {
	var photosContainer = document.getElementById("photos");
	var url = event.currentTarget.getAttribute("href");
	
	var overlayImage = document.createElement("img");
	overlayImage.setAttribute("src", url);
	overlayImage.setAttribute("class", "overlayImage");
	
	var overlayBlack = document.createElement("div");
	overlayBlack.setAttribute("class", "overlayBlack");			
	
	var overlayContainer = document.createElement("div");
	overlayContainer.setAttribute("class", "overlayContainer");
	
	var overlayFloater = document.createElement("div");
	overlayFloater.setAttribute("class", "overlayFloater");
	
	overlayFloater.appendChild(overlayImage)
	overlayContainer.appendChild(overlayFloater);
	photosContainer.appendChild(overlayBlack);			
	photosContainer.appendChild(overlayContainer);
				
	overlayContainer.onclick = function() {
		photosContainer.removeChild(overlayContainer);
		photosContainer.removeChild(overlayBlack);
	}			
	return false;
}


// Utility-Functions: Generate Flickr-URS
// Documentation See http://www.flickr.com/services/api/misc.urls.html

// Picture-URL (Thumbnail):	
function pictureThumb(photo) {
 	return "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" +
 	photo.id + "_" + photo.secret + "_" + "s.jpg";				
}

// Picture-URL (medium):	
function pictureMedium(photo) {
 	return "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" +
 	photo.id + "_" + photo.secret + "_" + "z.jpg";				
}

// Picture-URL (big):		
function pictureLarge(photo) {
 	return "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" +
 	photo.id + "_" + photo.secret + "_" + "b.jpg";				
}

// URL to the Flickr page:
function linkURL(photo) {	
 	return "http://www.flickr.com/photos/" + photo.owner + "/" + photo.id;
}

