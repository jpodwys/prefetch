(function (root, factory) {
  if (typeof define === 'function' && define.amd) define(factory);
  else if (typeof exports === 'object') module.exports = factory();
  else root.Prefetch = factory();
})(this, function () {

  function Prefetch(){
    var self = this;

    self.init = function(config){
      config = config || {};
      self.$prefetchOnMousedown = config.waitForMousedown || false;
      self.$enableMobile = config.enableMobile || false;
      self.$delayBeforePrefetch = config.hoverDelay || 50;
      config.parentContainers = config.parentContainers || [];
      self.attachListeners(config.parentContainers);
    }

    self.prefetch = function(a){
      a = a || self.$anchorToPrefetch;
      if(self.$prefetchTimer){
        clearTimeout(self.$prefetchTimer);
        self.$prefetchTimer = false;
      }
      if(Object.prototype.toString.call(a) === '[object Array]'){
        for(var i = 0; i < a.length; i++){
          injectPrefetchLink(a[i]);
        }
      }
      else{
        injectPrefetchLink(a);
      }
    }

    self.attachListeners = function(containers){
      for(var i = 0; i < containers.length; i++){
        var el = document.querySelector(containers[i]);
        if(el){
          if(self.$enableMobile){
            attachListener(el, 'touchstart');
          }
          if(self.$prefetchOnMousedown){
            attachListener(el, 'mousedown');
          }
          else{
            attachListener(el, 'mouseover');
          }
        }
      }
    }

    function removeHash(url){
      var index = url.indexOf('#');
      return (index < 0) ? url : url.substr(0, index);
    }

    function getLinkTarget(target){
      while(target && target.nodeName != 'A'){
        target = target.parentNode;
      }
      return target;
    }

    function isBlacklisted(elem){
      do{
        if(!elem.hasAttribute){
          break;
        }
        if(elem.hasAttribute('data-no-instant')){
          return true;
        }
      } while(elem = elem.parentNode);
      return false;
    }

    function isPrefetchable(a){
      if(a.hasAttribute('download')
        || !a.href
        || isBlacklisted(a))
        || (a.href.indexOf('#') > -1 && removeHash(a.href) === removeHash(location.href)){
        return false;
      }
      return true;
    }

    function injectPrefetchLink(a){
      if(a && isPrefetchable(a)){
        var url = (typeof a === 'object') ? a.href : a;
        var link = document.createElement('link');
        link.setAttribute('rel', 'prefetch');
        link.setAttribute('href', url);
        document.getElementsByTagName('head')[0].appendChild(link);
        if(typeof a === 'object'){
          a.setAttribute('data-no-instant', '');
        }
      }
    }

    function touchstart(e){
      self.$lastTouchTimestamp = new Date().getTime();
      var a = getLinkTarget(e.target);
      injectPrefetchLink(a);
    }

    function mousedown(e){
      if(self.$lastTouchTimestamp > (new Date().getTime() - 500)){
        return;
      }
      var a = getLinkTarget(e.target);
      injectPrefetchLink(a);
    }

    function mouseover(e){
      if(self.$lastTouchTimestamp > (new Date().getTime() - 500)){
        return;
      }
      var a = getLinkTarget(e.target);
      if(a && isPrefetchable(a)){
        a.addEventListener('mouseout', mouseout);
        if(!self.$delayBeforePrefetch){
          injectPrefetchLink(a);
        }
        else{
          self.$anchorToPrefetch = a;
          self.$prefetchTimer = setTimeout(self.prefetch, self.$delayBeforePrefetch);
        }
      }
    }

    function mouseout(){
      if(self.$prefetchTimer){
        clearTimeout(self.$prefetchTimer);
        self.$prefetchTimer = false;
      }
    }

    function attachListener(el, type){
      el.addEventListener(type, function (e){
        if(e.target.matches('a')){
          switch(type){
            case 'touchstart': touchstart(e); break;
            case 'mousedown':  mousedown(e);  break;
            case 'mouseover':  mouseover(e);  break;
          }
        }
      });
    }
  }
    
  return Prefetch;
});
