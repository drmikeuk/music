---
layout: dashboard
title: "FirstSecond"
nav: "yes"
sortTitle: "z"
customjs:
  - /vendor/d3-5.16.0.min.js
  - /vendor/crossfilter-1.5.4.min.js
  - /vendor/dc-4.2.7.min.js
  - /assets/firstsecond8.js
---

<div class="banner">
  <div class="container-fluid">
  	<div class="header">
  	 	  	<div class="title">
  					<h1>First and Second Cities</h1>
  				</div>
  	</div>
    <div class="row">
      <div class="col-md-3">
        <p>Select first city</p>
      </div>
      <div class="col-md-9">
        <p id="datacount"></p>
      </div>
    </div>
  </div>
</div>


<!-- DATA -->
<div class="container-fluid dashboard">
	<div class="row">
    <div class="col-md-3">
      <!-- LH -->
      <div id="triangle-down"></div>
      <input id="filter" class="form-control" placeholder="Filter list...">
      <div id="filterCities"></div>
    </div>

    <div class="col-md-9">

      <div id="info">
        <h2>Getting started</h2>

        <div class="steps clearfix">
          <div class="card">
            <img src="assets/bulletlist.png" class="card-img-top" alt="...">
            <div class="card-body">
              <p class="card-text">Select a city from the list</p>
            </div>
          </div>

          <div class="card">
            <img src="assets/bubblechart.png" class="card-img-top" alt="...">
            <div class="card-body">
              <p class="card-text">See the next city where this composer was performed</p>
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

<!--
        <div class="steps">
          <img src="assets/bulletlist.png" />
          <img src="assets/bubblechart.png" />
          <img src="assets/datatable.png" />
        </div>

        <p>Select a composer from the list on the left</p>
        <ul>
          <li>see where they were performed</li>
          <li>see a list of all their performances</li>
          <li>optionally select a range of years from the <i>Total performances</i> graph to filter</li>
        </ul>
        <p>Then select another composer to explore the data further...</p>
-->

      </div> <!-- /info -->

      <div id="graphs" class="hidden">
        <!-- removed chart-composite-composers
        <div id="chart-composite-composers"><div id="this-composer"></div></div> -->

        <h2 id="this-city"></h2>

        <h3>Next city </h3>
        <div id="chart-bar-secondCities"></div>

        <p>Total first performances per year</p>
        <div id="chart-bar-time"></div>

        <!--<h3>Datatable</h3>-->
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
