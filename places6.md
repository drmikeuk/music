---
layout: dashboard
title: "P6"
nav: "yes"
sortTitle: "m"
customjs:
  - /vendor/d3-5.16.0.min.js
  - /vendor/crossfilter-1.5.4.min.js
  - /vendor/dc-4.2.7.min.js
  - /assets/places6.js
---

<div class="banner">
  <div class="container-fluid">
  	<div class="header">
  	 	  	<div class="title">
  					<h1>Places v6 London, New York, Paris</h1>
            <p>Choose places:</p>
            <div id="selectPlaces"></div>
            <p id="datacount"></p>
  				</div>
  	</div>
  </div>
</div>


<!-- DATA -->
<div class="container-fluid dashboard">
	<div class="row">
    <div class="col-md-3">
      <h3>Composers</h3>
      <div id="selectPlaces2"></div>
      <div id="chart-bubble-composers"></div>
    </div>


    <div class="col-md-9">
      <!-- MAIN -->
      <h3>Performances per city</h3>
      <div id="chart-bubbles-time"></div>

      <p>Total performances</p>
      <div id="chart-bar-time"></div>

      <table id="table-datasummary" class="table data-table "></table>

      <div id="paging">
        Showing <span id="begin"></span>-<span id="end"></span> of <span id="size"></span> <span id="totalsize"></span>
        <input id="last" class="btn" type="Button" value="Previous" onclick="javascript:last()" />
        <input id="next" class="btn" type="button" value="Next" onclick="javascript:next()"/>

        <button type="button" class="btn btn-secondary" id="download">Download this list <i class="fa fa-download" aria-hidden="true"></i></button>
      </div>

    </div>
  </div>
</div>
