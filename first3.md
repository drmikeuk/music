---
layout: dashboard
title: "Journeys3"
nav: "yes"
sortTitle: "o"
customjs:
  - /vendor/d3-5.16.0.min.js
  - /vendor/crossfilter-1.5.4.min.js
  - /vendor/dc-4.2.7.min.js
  - /assets/first3.js
---

<div class="banner">
  <div class="container-fluid">
  	<div class="header">
  	 	 <div class="title"><h1>Journeys v2</h1></div>
  	</div>
    <div class="row">
      <div class="col-md-3">
        <p>Select composer</p>
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
      <input id="filter" class="form-control" placeholder="Filter">
      <div id="filterComposers"></div>
    </div>

    <div class="col-md-9">
      <h3 id="this-composer"></h3>
      <p id="first"></p>



      <h3>Performances per city</h3>
      <div id="chart-bubbles-time"></div>

      <div id="chart-stream-time"></div>

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
