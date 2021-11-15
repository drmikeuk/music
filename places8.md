---
layout: dashboard
title: "Places"
nav: "yes"
sortTitle: "y"
customjs:
  - /vendor/d3-5.16.0.min.js
  - /vendor/crossfilter-1.5.4.min.js
  - /vendor/dc-4.2.7.min.js
  - /assets/places8.js
---

<div class="banner">
  <div class="container-fluid">
  	<div class="header">
  	 	  	<div class="title">
  					<h1>Places</h1>
  				</div>
  	</div>
    <div class="row">
      <div class="col-md-2">
        <p>Select two places</p>
      </div>
      <div class="col-md-10">
        <p id="datacount"></p>
      </div>
    </div>
  </div>
</div>


<!-- DATA -->
<div class="container-fluid dashboard">
  <div class="row">
    <div class="col-md-2">
      <!-- LH -->
      <div id="triangle-down"></div>
      <input id="filter" class="form-control" placeholder="Filter list...">
      <div id="filterPlaces"></div>
    </div>


    <div class="col-md-10">
      <!-- RH -->
      <div id="info">
        <h2>Getting started</h2>

        <div class="steps clearfix">
          <div class="card">
            <img src="assets/bulletlist.png" class="card-img-top" alt="...">
            <div class="card-body">
              <p class="card-text">Select two places from the list</p>
            </div>
          </div>

          <div class="card">
            <img src="assets/bubblechart.png" class="card-img-top" alt="...">
            <div class="card-body">
              <p class="card-text">See which composers were performed</p>
            </div>
          </div>

          <div class="card">
            <img src="assets/datatable.png" class="card-img-top" alt="...">
            <div class="card-body">
              <p class="card-text">See a list of all performances</p>
            </div>
          </div>
        </div>

        <h3>Learn more</h3>
        <p> watch this video tutorial...</p>
      </div> <!-- /info -->


      <div id="graphs" class="hidden">
        <div class="row">
          <div class="col-md-4">
            <h3>Composers</h3>
            <div id="selectPlaces2"></div>
            <div id="chart-bubble-composers"></div>
          </div>


          <div class="col-md-8">
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
      </div> <!-- /graphs -->




    </div>
  </div>
</div>
