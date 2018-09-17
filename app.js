var Routing = function (appRoot, contentSelector, defaultRoute, tamplateCache) {
  function getUrlFromHash(hash) {
      var url = hash.split('#/')[1];
      if (url === "" || url === appRoot)
          url = defaultRoute;
      return appRoot + url;
  }
  function getUrlFromSplat(splat) {
    if(splat === "" || splat === appRoot) 
      splat = defaultRoute;
    return appRoot + splat;
  }
  function loadFile(path, type){
    var fileref;
      if (type=="js"){
        fileref=document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("class", "extrasource");
        fileref.setAttribute("src", path);
      }
      else if (type=="css"){
        fileref=document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("class", "extrasource");
        fileref.setAttribute("href", path);
      }
      fileref && document.getElementsByTagName("head")[0].appendChild(fileref);
  }
  var appSourceFileload = function(data){
    if(data.styles && data.styles.length) {
      for(var i=0 ; i<data.styles.length; i++){
        loadFile(data.styles[i], 'css');
      }
    }
    if(data.scripts && data.scripts.length) {
      for(var i=0 ; i<data.scripts.length; i++){
        loadFile(data.scripts[i], 'js');
      }
    }
  };
  var error404Html = '<h2 class="text-muted p-3">Oops, that couldn\'t be found</h2>';
  var errorCallback = function(xhr, ajaxOptions, thrownError){
    console.log(xhr.status, ajaxOptions, thrownError);
    var errorHtml = '<span class="text-danger">' + xhr.status + '</span>';
    switch(xhr.status) {
      case 400: errorHtml = '<h2 class="p-3 text-uppercase">' + errorHtml + ' Bad Request</h2>'; break;
      case 401: errorHtml = '<h2 class="p-3 text-uppercase">' + errorHtml + ' Unauthorized</h2>'; break;
      case 403: errorHtml = '<h2 class="p-3 text-uppercase">' + errorHtml + ' Forbidden</h2>'; break;
      case 404: errorHtml = error404Html; break;
      case 500: errorHtml = '<h2 class="p-3 text-uppercase">' + errorHtml + ' Internal Server Error</h2>'; break;
      case 502: errorHtml = '<h2 class="p-3 text-uppercase">' + errorHtml + ' Bad Gateway</h2>'; break;
      default: errorHtml = '<h2 class="text-danger p-3">Invalid URL</h2>';
    }
    this.app.swap(errorHtml);
  }
  var app = Sammy(contentSelector, function () {
      this.get(/\#\/(.*)/, function (context) {
          var url = getUrlFromSplat(this.params.splat[0]); 
          // Page loading indication
          context.app.swap('<h4 class="text-center p-2"><span class="badge badge-primary">Loading...</span></h4>');

          // load page
          context.load(url, { cache: tamplateCache, json: true, error: errorCallback.bind(context)})
          .then(function(data){ // data = { "styles": [], "scripts": [], "tamplate": ""}
            if(typeof data === "object" && data && data.template !== "") {
              appSourceFileload(data);
              return data;
            } else {
              return { template: error404Html };
            }
          }).then(function(data){
            setTimeout(function(){ // this timeout is for waiting external script load and then tamplate script running
              context.app.swap(this.template); // here data.template is html string
            }.bind(data), 300);
          });
      });
      this.before('.*', function() { // before page load  added left menu active class and removed all injected scripts and styles
          var hash = '#' + getUrlFromHash(document.location.hash);
          $("nav.sidebar").find(".nav-link").removeClass("active");
          $("nav.sidebar").find(".nav-link[href='"+hash+"']").addClass("active");
          var loadedSource = document.querySelectorAll('.extrasource');
          if(loadedSource.length > 0) {
            for(var i =0; i< loadedSource.length; i++){
              loadedSource[i].remove();
            }
          }
      });
  });
  return {
      init: function () {
          app.run('#/' + defaultRoute);
      }
  };
}

$(function () {
  var routing = new Routing('/', '#app', 'dashboard.template', true);
  routing.init();
});