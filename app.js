//app.js
function loadFile(path, type){
  var fileref;
    if (type=="js"){
      var loadedScript = document.querySelectorAll('script[src="' + path + '"]');
      if(loadedScript.length > 0) {
        loadedScript[0].remove();
      }
      fileref=document.createElement('script');
      fileref.setAttribute("type","text/javascript");
      fileref.setAttribute("src", path);
    }
    else if (type=="css"){
      var loadedStyle = document.querySelectorAll('link[href="' + path + '"]');
      if(loadedStyle.length > 0) {
        loadedStyle[0].remove;
      }
      fileref=document.createElement("link");
      fileref.setAttribute("rel", "stylesheet");
      fileref.setAttribute("type", "text/css");
      fileref.setAttribute("href", path);
    }
    fileref && document.getElementsByTagName("head")[0].appendChild(fileref);
}

function getScripts(scripts, callback) {
    var progress = 0;
    scripts.forEach(function(script) { 
        $.getScript(script, function () {
            if (++progress == scripts.length && callback) callback();
        }); 
    });
}

(function($) {

 
  var app = $.sammy('#app', function() {

 
    this.get('#/', function(context) {
      context.app.swap('');
      context.render('dashboard.html', {})
               .appendTo(context.$element());
    });
     
    this.get('#/orders', function(context) {
        context.app.swap('');
        context.render('orders.html', {})
               .appendTo(context.$element());
    });
    this.get('#/products', function(context) {
        context.app.swap('');
        var files = {};
        context.load('products.json', { cache: true }) // It will only work for .json file
                .then(function(data) { // data = { "styles": [], "scripts": [], "tamplate": ""}
                  if(data.styles && data.styles.length) {
                    for(var i=0 ; i<data.styles.length; i++){
                      loadFile(data.styles[i], 'css');
                    }
                  }
                  if(data.scripts && data.scripts.length) {
                    //getScripts(data.scripts);
                    for(var i=0 ; i<data.scripts.length; i++){
                      loadFile(data.scripts[i], 'js');
                    }
                  }
                  context.render(data.tamplate, {}).appendTo(context.$element());
                });
        
    });
 
    this.before('.*', function() {
        var hash = document.location.hash;
        $("nav.sidebar").find(".nav-link").removeClass("active");
        $("nav.sidebar").find(".nav-link[href='"+hash+"']").addClass("active");
   });
 
  });
 
  $(function() {
    app.run('#/');
  });
 
})(jQuery);