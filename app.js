//app.js
function loadFile(path, type){
    if (type=="js"){
      var fileref=document.createElement('script');
      fileref.setAttribute("type","text/javascript");
      fileref.setAttribute("src", path);
    }
    else if (type=="css"){
      var fileref=document.createElement("link");
      fileref.setAttribute("rel", "stylesheet");
      fileref.setAttribute("type", "text/css");
      fileref.setAttribute("href", path);
    }
    document.getElementsByTagName("head")[0].appendChild(fileref);
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
        context.load('products.json', { cache: true })
                .then(function(data) {
                  if(data.scripts && data.scripts.length) {
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