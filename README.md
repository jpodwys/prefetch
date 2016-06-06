# prefetch

Customizable interaction-based link prefetching based largely on [InstantcClick](http://instantclick.io/).

Start downloading the next page before the user even clicks!

# Why Does this Exist?

There is [between 250ms and 400ms](http://instantclick.io/click-test) from the time a user starts hovering over a link they fully intend to click and actually clicking it. That's unnecessary latency! Prefetch makes pages load up to 400ms faster by requesting them as soon as the user begins hovering over a link. Awesome, right?

# Features

* No external dependencies
* Prefetch links based on hover, mousedown, or touchstart
* Programmatic background asset prefetching
* Customizable
  * disable an interaction and set a prefetch delay for hover events
  * [pass a custom callback](#using-the-callback-config-property) to override the default link injection behavior
* Automatically works with dynamically added links
* Identify any number of containers and add more after initialization
* Identify links to never prefetch ([by attribute or href](#how-do-i-blacklist-a-link)) even if they're within a prefetchable container
* Tracks links so a single link is not requested multiple times
* Prevents attempting to prefetch [links that cannot/should not be prefetched](#what-links-are-prefetchable)
* [Packaged as a UMD](http://bob.yexley.net/umd-javascript-that-runs-anywhere/)--compatible with CommonJS, AMD, and global scope

# Basic Usage

```javascript
var Prefetch = require('prefetch');
Prefetch.init({containers: ['.primary-nav']});
```

This example will listen for a mouseover event on any anchor tags within the element with class `.primary-nav`. If the anchor [is prefetchable](#what-links-are-prefetchable), it will be retrieved in the background.

# What Links are Prefetchable?

A prefetchable anchor tag must meet the following criteria:

* Must have an `href` attribute
* Must not have a `download` attribute
* Must not have already been prefetched
* Must not have been [blacklisted](#how-do-i-blacklist-a-link)
* The href (with hash removed) must not be the same as `location.href` (with hash removed)

# How do I Blacklist a Link?

There are two ways to blacklist a link:

* Add a `data-no-prefetch` attribute to anchor tags you want to ignore
* Use the `exclusions` feature from the `.init()` call or the `.addExclusions()` call

# API

## .init(config)

This is how you initialize Prefetch with any settings you want to pass in. You can call init as many times as you want, but be aware that, each time you do, any arguments you do not pass within `config` will take on the default value shown below.

#### Arguments

* config: object

#### Example

```javascript
//All options shown with default values
Prefetch.init({
  containers: [],           //An array of CSS selectors passed as strings--a delegate listener will be attached to these elements
  exclusions: [],           //An array of partial links passed as strings--if the potential prefetch link contains any of these partial links, it will be ignored
  hoverDelay: 50,           //The number of miliseconds after which a sustained hover triggers a link prefetch
  enableTouch: false,       //Whether to prefetch on touchstart and therefore on mobile
  waitForMousedown: false,  //Whether to prefetch on mousedown instead of on hover
  callback: undefined       //A function that overrides the default link injection behavior
});
```

## .prefetch(urls)

Allows you to programmatically prefetch fully-qualified URLs outside of user interaction. You can pass either a single URL or an array of URLs. This is useful if you know that a high percentage of your users navigate to a specific page from the current page. You can begin prefetching not only the page to which the user is likely to go, but also the render-blocking assets included on that page.

#### Arguments

* urls: string || array of strings

## .addContainers(containers)

Allows you to attach additional listeners after the `.init()` call is made. This can be useful if you have an app-wide Prefetch config in shared code but want to add page-specific listeners outside of that shared code.

#### Arguments

* containers: array of CSS selectors as strings

## .addExclusions(exclusions)

Allows you to add an array of items to the `exclusions` argument provided at initialization. You should not make your exclusions list long as iterating over long lists will degrade the performance gain Prefetch introduces.

#### Arguments

* exclusions: array of partial URL strings

# Using the `callback` config property

By default, `prefetch` injects a `<link rel="prefetch" href="..."/>` tag in the document's head, but there may be times when it's useful to override that behavior. You can do so by adding a `callback` property to the `config` object you pass to `prefetch.init(config)`.

The `callback` param must be a function and it accepts up to three parameters. In the example below, the callback function evaluates the href's URL and, based on the presence of some identifier, decides whether to execute an ajax call or procede with the normal `prefetch` behavior.

```javascript
function handlePrefetch(url, anchor, fetch){
  //url: the string from the href attribute of the anchor tag over which the user's cursor hovered
  //anchor: the <a> tag over which the user's cursor hovered
  //fetch: the function that prefetch internally executes to inject a prefetch link
  
  if(url.indexOf('some-identifier') > 0){
    doAjaxCall(url);
  } else {
    fetch(url);
  }
}
```
