var chosen_region = "";
var chosen_category = "";
var search_query = "";
var current_page = 0;
var purpose = "";

var API_URL = "http://oglasuva.me/api/";

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady(){

    $.mobile.allowCrossDomainPages = true;
    $.support.cors = true;
    
	checkConnection();
	loadClassifieds();
}

function checkConnection() {
    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

    if(networkState == Connection.NONE){
    	navigator.notification.confirm(
    	        'Апликацијата работи само со активна интернет конекција',  // message
    	        navigator.app.exitApp,
    	        'Проблем',
    	        'Во ред'          // buttonLabels
    	    );
    }
}

function loadRegions(){
	if($("#regions-listview li").length<1){
		$.get(API_URL + "regions.json", function(data){
			$.each(data, function(idx, em){
				var li = $('<li data-theme="a"><a href="#classifieds">'+em.name+'</a></li>');
				$(li).appendTo("#regions-listview");
				$(li).tap(function(){
					chosen_region = em.id;
					current_page = 0;
					loadClassifieds();
				});				
			});
			$("#regions-listview").listview("refresh");
		}, "json");
	}
}

function loadCategories(){
	if($("#categories-listview li").length<1){
		$.get(API_URL + "categories.json", function(data){
			$.each(data, function(idx, em){
				var li = $('<li data-theme="a" data-role="list-divider" data-dividertheme="a">'+em.name+'</li>');
				$(li).appendTo("#categories-listview");
				$.each(em.child_categories, function(ix, el){
					var li = $('<li data-theme="a"><a href="#classifieds">'+el.name+'</a></li>');
					$(li).appendTo("#categories-listview");
					$(li).tap(function(){
						chosen_category = el.id;
						current_page = 0;
						loadClassifieds();
					});
				});
			});
			$("#categories-listview").listview("refresh");
		}, "json");
	}
}

function loadClassifieds(){
	$.get(API_URL + "classifieds.json", {region: chosen_region, category: chosen_category, q: search_query, page: current_page, purpose: purpose}, function(data){
		if(data){
			if(current_page == 0)
				$("#classifieds-listview").html("");
			$.each(data, function(idx, em){
				var li = $('<div data-role="collapsible">\
						   	<h3>'+em.title+'</h3>\
						   	<p>'+formatElementContent(em)+'</p>\
						   	</div>');
				$(li).appendTo("#classifieds-listview");
				$(li).collapsible();
			});
			current_page += 1;
		}
		else{
			if(current_page == 0)
				navigator.notification.confirm(
		    	        'Не е пронајден ни еден оглас.',
		    	        function(){},
		    	        'Известување',
		    	        'Во ред'
		    	    );
		}
	}, "json");
}

function formatElementContent(em){
	var content = "";
	content += "<b>"+ em.category.name +"</b><br/>";
	content += "<b>"+em.purpose.name+" во "+ em.region.name+"</b><br/>";
	
   	if(em.price)
   		content += "<b>Цена:</b> "+em.price+" "+em.currency + "<br/>";
   	content += em.content;
   	
   	return content
}


$("#regions").live('pageinit', function(e){
	loadRegions();
});

$("#categories").live('pageinit', function(e){
	loadCategories();
});

$("#classifieds").live('pageinit', function(e){
	loadClassifieds();
	
	$("#q").live('change', function(e){
		search_query = $(this).val();
		current_page = 0;
		loadClassifieds();
	});
	
	$("#purpose").live('change', function(e){
		purpose = $(this).val();
		current_page = 0;
		loadClassifieds();
	});
});

