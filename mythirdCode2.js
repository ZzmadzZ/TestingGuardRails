 
if (window.location.hash) {
        var hash = window.location.hash.substring(1);
        var elem = $('#reports_nav_links .' + hash);
        var path = elem.data('path');
