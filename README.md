# Neighborhood Map 

## About
This project is a single page application featuring a map of a neighborhood I would like to visit. This application supports the functionality of highlighted locations, third-party data about those locations and various ways to browse the content.

## Tech Stack
* JavaScript
* jQuery
* HTML
* CSS
* KnockoutJS
* Google Maps API
* Wikipedia API

## Getting Started
1. Download the project or clone this repository.
2. Run the index.html file in your preferred browser.
3. A list-view of location names is provided which displays all locations by default, and displays the filtered subset of locations when a search filter is applied.
4. The search field is  a text input field or dropdown menu that filters the map markers and list items to locations matching the text input. 
5. Clicking a location on the map displays panoramic street view of the location, and animates its associated map marker by bouncing and with color change from red to green when you hover over it.
6. Clicking a location item on the list view of location makes the location marker bounce, opens the info window with the panoramic street view and displays the relevant wikipedia links.
7. NOTE: This map displays the locations stored in the data.js file.

![Sample View of the Application](https://github.com/payPan22/Neighborhood_Map/blob/master/SampleView.PNG)

## My Learnings
1. Understood how design patterns assist in developing a manageable codebase. 
2. Explored how frameworks can decrease the time required developing an application and provide a number of utilities for us to use. 
3. Implemented third-party APIs that provide valuable data sets that can improve the quality of our application.

## Reference materials
1. Udacity Full Stack Web Developer Nanodegree
2. Markdown - https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet
3. Git Hub - https://github.com/ddavignon/neighborhood-map
4. Stack Overflow - https://stackoverflow.com/questions/45422066/set-marker-visible-with-knockout-js-ko-utils-arrayfilter/45423774
