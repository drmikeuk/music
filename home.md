---
layout: default
title: "Home"
description: "A database of performances of symphonies in Europe and North America during the 19th century (1813-1914)"
header-img: "World_Map_Grayscale.png"
nav: "yes"
sortTitle: "a"
customjs:
  - /vendor/d3-5.16.0.min.js
  - /vendor/topojson-3.0.2.min.js
  - /assets/map.js
---

<!-- Page Header -->
<header class="intro-header home" style="background-image: url('{{ site.baseurl }}/images/{% if page.header-img %}{{ page.header-img }}{% else %}{{ site.header-img }}{% endif %}')">
    <div class="container">
        <div class="row">
            <!-- <div class="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1"> -->
            <div class="col-md-12">
                <div class="site-heading">
                    <h1>Symphonies on the Move</h1>
                    <span class="subheading">{{ page.description }}</span>
                </div>
            </div>
        </div>
    </div>
</header>

<!-- Main -->
<div class="container page">

  <!-- Intro -->
  <div class="row">
    <div class="col-md-6">
      <p>Explore performances of symphonies in Europe and North America in the 19th century.</p>
      <p>Search for composer to see when and where their symphonies were performed.</p>
      <p>Choose a city and see which symphonists were performed there most often.</p>
    </div>
    <div class="col-md-6">
      <p>Add more places to compare the popularity of that composer’s symphonies in different locations. Select the years to trace numbers of performances across time as well as space.</p>
      <p>Find out which city a first symphonic performance led to next. What was the next stop on the journey?</p>
    </div>
  </div>

  <div class="row paddedRow">
    <div class="col-md-3 col-6 BAN">
      100 <div class="label">Composers</div>
    </div>

    <div class="col-md-3 col-6 BAN">
      35 <div class="label">Places</div>
    </div>

    <div class="col-md-3 col-6 BAN">
      100 <div class="label">Years</div>
    </div>

    <div class="col-md-3 col-6 BAN">
      3250 <div class="label">Performances</div>
    </div>
  </div>



  <!-- Actions -->
  <div class="row paddedRow">
    <div class="col">
      <h2>Composers</h2>
    </div>
  </div>

  <div class="row">
    <div class="col-lg-4 col-md-6 col-sm-12 pb-4 d-flexXX">
        <div class="card flex-fill">
            <img src="/images/composers.png" class="card-img-top" alt="photo of ">
            <div class="card-body">
              <h5 class="card-title">Composers</h5>
              <p class="card-text">Explore the popularity of a particular composer over time
              and space</p>
              <a href="/composers8.html" class="stretched-link"><i class="fas fa-chevron-circle-right fa-2x"></i></a>
            </div>
        </div>
    </div>
  </div><!-- end composers row-->

  <div class="row">
    <div class="col">
      <h2>Places</h2>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-4 col-md-6 col-sm-12 pb-4 d-flexXX">
          <div class="card flex-fill">
              <img src="/images/places.png" class="card-img-top" alt="photo of ">
              <div class="card-body">
                <h5 class="card-title">Places</h5>
                <p class="card-text">Compare the popularity of composers in two places</p>
                <a href="places8.html" class="stretched-link"><i class="fas fa-chevron-circle-right fa-2x"></i></a>
              </div>
          </div>
      </div>

<!--
      <div class="col-lg-4 col-md-6 col-sm-12 pb-4 d-flexXX">
          <div class="card flex-fill">
              <img src="/images/journeys.png" class="card-img-top" alt="photo of ">
              <div class="card-body">
                <h5 class="card-title">Journeys</h5>
                <p class="card-text">Discover where a composer was first performed and where this led to</p>
                <a href="first2London.html" class="stretched-link"><i class="fas fa-chevron-circle-right fa-2x"></i></a>
              </div>
          </div>
      </div>
-->
      <div class="col-lg-4 col-md-6 col-sm-12 pb-4 d-flexXX">
          <div class="card flex-fill">
              <img src="/images/firstsecond.png" class="card-img-top" alt="photo of ">
              <div class="card-body">
                <h5 class="card-title">Second performances</h5>
                <p class="card-text">Given a particular starting city which cities were likely to be next?</p>
                <a href="firstsecond8.html" class="stretched-link"><i class="fas fa-chevron-circle-right fa-2x"></i></a>
              </div>
          </div>
      </div>     

  </div> <!-- end places row -->



  <!-- Foot -->
  <div class="row">
    <div class="col">
      <div id="citiesMap"></div>
    </div>
  </div>

</div>
