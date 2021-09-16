---
layout: home
title: "Performances database"
description: "A database of 19th century performances of symphonies in Europe and North America"
header-img: "World_Map_Grayscale.png"
---

This site contains a set of **prototypes** with dummy data to begin to explore the data and how it might be displayed.
It doesn't reflect the final site design, colours, etc.

We are interested in _patterns_ in the data, in time & space, not on finding a particular item.

The key research questions the database should be able to answer are:

### Composers

- which were the most/least popular composers?
- explore the popularity of a _particular_ composer over time & place
{:.fancyLI .chevron}

- filter to a particular composer (list of composers sorted by number performances)
- what was their popularity over time? (total performances over time)
- where we they performed? (performances per city over time)
- how popular are they compared to other composers? (total performances per composer)
- plus list of performances to show details
{:.fancyLI .tick}

### Compare two places

- how does the popularity of composers compare in two cities?
- who was the most popular composer for a given city and year
{:.fancyLI .chevron}

- filter to two places (list of places)
- who were the popular composers? (total performances per composer)
- how do the two places compare? (performances per composer per city)
- does this change over time? (total performances per city over time; filter by year)
- plus table of performances to show details
{:.fancyLI .tick}

### First performance

- where did a composer first get performed?
- what did this lead to (places; times)?
{:.fancyLI .chevron}

- choose a particular composer (list of composers sorted by year of first performance)
- where and when was their first performance?
- where and when where next performances?
- plus table of performances to show details
{:.fancyLI .tick}

### Symphonies

- explore the popularity of a _particular_ symphony over time & place
{:.fancyLI .chevron}

- as per Composers
{:.fancyLI .tick}


## Prototypes
<ul>
  {% comment %} pages  in nav{% endcomment %}
  {% assign pages = site.pages | where: "nav", "yes" | sort: "sortTitle"  %}
  {% for page in pages %}
  <li><a href="{{ page.url | prepend: site.baseurl }}">{{ page.title }}</a></li>
  {% endfor %}
</ul>
