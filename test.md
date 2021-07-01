---
layout: dashboard
title: "Test"
nav: "no"
sortTitle: "a"
customjs:
  - /vendor/d3-5.16.0.min.js
  - /vendor/crossfilter-1.5.4.min.js
  - /vendor/dc-4.2.7.min.js
  - /assets/test.js
---

<div class="banner">
  <div class="container-fluid">
  	<div class="header">
  	 	  	<div class="title">
  					<h1>Test first and second cities</h1>
  				</div>
  	</div>
    <div class="row">
      <div class="col">
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
      <h3>Composers</h3>
      <div id="chart-row-composers"></div>
    </div>
    <div class="col-md-9">
      <!-- MAIN -->
      <div class="row">
        <div class="col-md-6">
          <h3>First city</h3>
          <div id="chart-row-firstCities"></div>
        </div>
        <div class="col-md-6">
          <h3>Second city</h3>
          <div id="chart-composite-secondCities"></div>
        </div>
      </div> <!-- /row-->
      

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