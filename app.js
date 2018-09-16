//app.js
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

(function($) {

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
 
  var app = $.sammy('#app', function() {

    this.get('#/', function(context) {
      context.app.swap('');
      context.render('dashboard.html', {}) // direct url only for html
               .appendTo(context.$element());
    });
     
    this.get('#/orders', function(context) {
        context.app.swap('<div class="text-center"><h2>Loading...</h2></div>');
        context.load('orders.template', { cache: true, json: true }) // any url and expects json result
          .then(function(data){ // data = { "styles": [], "scripts": [], "tamplate": ""}
            appSourceFileload(data);
            context.app.swap(data.template); // here data.template is html string
          });
    });
    this.get('#/products', function(context) {
        context.app.swap('<div class="text-center"><h2>Loading...</h2></div>');
        var files = {};
        context.load('products.json', { cache: true }) // It will only work for .json file
                .then(function(data) { // data = { "styles": [], "scripts": [], "tamplate": ""}
                  context.app.swap('');
                  appSourceFileload(data);
                  context.render(data.template, {}).appendTo(context.$element()); // here data.template is a url path.
                });
        
    });
 
    this.before('.*', function() {
        var hash = document.location.hash;
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
 
  $(function() {
    app.run('#/');
  });
 
})(jQuery);