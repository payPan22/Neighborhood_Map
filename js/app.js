var map;
var infoWindow;
var locationsList;

function initMap() {

    // Creating the map with the Center at Union Square
    var mapCenter = { lat: 40.7347062, lng: -73.9895759 };

    map = new google.maps.Map(document.getElementById('map'), { center: mapCenter, zoom: 13 });

    infoWindow = new google.maps.InfoWindow();
    // Binding to the View Model
    ko.applyBindings(new ViewModel());
}

//Making a model for the Location	 
var LocationMarker = function (data) {
    var self = this;

    //Each location in data.js consists of a title, position i.e. lat and lng and a wikiPedia identifier
    this.title = data.title;
    this.positon = data.location;
    this.wikiLink = data.wikiLink;

    //This property is used to show/hide markers based on filter applied in the search box
    this.setVisible = ko.observable(true);

    //Creating a default icon
    var defaultIcon = makeMarkerIcon('9A2B46');

    //Creating a highlighted icon
    var highlightedIcon = makeMarkerIcon('ADFF2F');

    //Setting up a location marker
    self.marker = new google.maps.Marker({ position: this.positon, title: this.title, animation: google.maps.Animation.drop, icon: defaultIcon });


    if (self.setVisible())
        self.marker.setMap(map); //Show the marker on the map
    else
        self.marker.setMap(null); //Hide the marker on the map

    //Highlight the location marker when user hovers over it
    self.marker.addListener('mouseover', function () {
        this.setIcon(highlightedIcon);
        toggleBounce(this);
    });

    //Set the location marker back to default
    self.marker.addListener('mouseout', function () {
        this.setIcon(defaultIcon);
    });


    //The click on a location marker displays the panoramic street view and displays relevant wikipedia links on the side
    self.marker.addListener('click', function () {
        populateLocationInfoWindow(this, infoWindow);
    });
}


//This is the ViewModel that serves as communicator between the Data and the View 
var ViewModel = function () {
    var self = this;

    self.locationsList = ko.observableArray([]);

    //Create location markers and push them into the locationsList variable
    locations.forEach(function (location) {
        self.locationsList.push(new LocationMarker(location));
    });

    //The input-text entered in the search box
    self.searchFilter = ko.observable();


    self.filteredLocationsList = ko.computed(function () {
        if (!self.searchFilter()) {
            //Return all the locations and display all their markers when the search field is empty
            self.locationsList().forEach(function (location) {
                location.marker.setVisible(true);
            });
            return self.locationsList();
        }
        else {
            /*Return only the locations that match the search criteria and display their markers
            Hide the markers for the locations that do not match the search criteria*/
            return ko.utils.arrayFilter(self.locationsList(), function (location) {
                var result = (location.title.toLowerCase().search(self.searchFilter()) >= 0);
                location.marker.setVisible(result);
                return result;
            });
        }

    });

    self.wikiLocation = ko.observable('');
    self.wikipediaUrl = ko.observable('');
    self.wikipediaContent = ko.observable('');
    //Making the marker bounce and showing relevant wikipedia links when a location is clicked on the List View
    self.setLocation = function (clickedLocation) {
        populateLocationInfoWindow(clickedLocation.marker, infoWindow);
        loadWikipediaLinks(clickedLocation.wikiLink, self.wikipediaContent, self.wikipediaUrl, self.wikiLocation);
        toggleBounce(clickedLocation.marker);
    };


}


//Show the Relevant Wikipedia Links for the selected marker 
function loadWikipediaLinks(locationStr, wikipediaContent, wikipediaUrl, wikiLocation) {


    var $wikiElem = $('#wikipedia-links');
    $wikiElem.text("");
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + locationStr + '&format=json&callback=wikiCallback';

    //Show error if Timeout happens when trying to get response from Wikipedia
    var wikiRequestTimeout = setTimeout(function () {
        wikipediaContent("Failed to get wikipedia resources");

    }, 8000);

    //Make an AJAX Request to the Wikipedia API
    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        jsonp: "callback",
        success: function (response) {

            var articleList = response[1] ? response[1] : 'No Link found.'; //The link to the wikipedia page
            var articleSnippet = response[2] ? response[2] : 'No snippet found.'; //Snippet of the linked wikipedia page
            console.log(response);
            for (var i = 0; i < articleList.length; i++) {
                articleStr = articleList[i];
                var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                wikiLocation(articleStr);
                wikipediaUrl(url);
                wikipediaContent(articleSnippet);
            };

            clearTimeout(wikiRequestTimeout);
        }
    });
    return false;
}



/*This function populates the infowindow when the marker is clicked. We'll only allow
 one infowindow which will open at the marker that is clicked, and populate based
 on that markers position.*/
function populateLocationInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        infowindow.setContent('');
        infowindow.marker = marker;

        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;

        var windowContent = '<h4>' + marker.title + '</h4>';

        /* In case the status is OK, which means the pano was found, compute the
        position of the streetview image, then calculate the heading, then get a
      panorama from that and set the options*/
        var getStreetView = function (data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                infowindow.setContent(windowContent + '<div id="pano"></div>');
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 20
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent(windowContent + '<div style="color: red">No Street View Found</div>');
            }
        };
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}





//Customize the Location Marker Icon
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
      '|40|_|%E2%80%A2',
     new google.maps.Size(21, 34),
   new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
     new google.maps.Size(21, 34));
    return markerImage;
}




//Marker bounces when the location is clicked in the list view
function toggleBounce(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
        marker.setAnimation(null);
    }, 1400);
}

//Display an alert if something went wrong with Google Maps	 
function googleMapsError() {
    alert('An error occurred with Google Maps!');
}



