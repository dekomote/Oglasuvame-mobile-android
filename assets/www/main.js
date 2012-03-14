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
    $.mobile.defaultPageTransition = 'none';
    $.ajaxSetup({timeout: 10000});
	checkConnection();
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
	if($("#region-select option").length<=1){
		$.get(API_URL + "regions.json", function(data){
			$.each(data, function(idx, em){
				var opt = $('<option value="'+em.id.toString()+'">'+em.name+'</option>');
				$(opt).appendTo("#region-select");
			});
		}, "json");
	}
}

function loadCategories(){
	if($("#category-select option").length<=1){
		
		$.get(API_URL + "categories.json", function(data){
			$.each(data, function(idx, em){
				var optgroup = $('<optgroup label="'+em.name+'"></optgroup>');
				$(optgroup).appendTo("#category-select");
				$.each(em.child_categories, function(ix, el){
					var opt = $('<option value="'+el.id.toString()+'">'+el.name+'</option>');
					$(opt).appendTo(optgroup);					
				});
			});
		
		}, "json");
	}
}

function loadClassifieds(callback){
	$.mobile.showPageLoadingMsg();
	$.ajax({
		async: false,
		timeout: 5000,
		url:API_URL + "classifieds.json",
		dataType: "json",		
		data: {
			region: chosen_region, 
			category: chosen_category, 
			q: search_query, 
			page: current_page, 
			purpose: purpose
		},
		
		success: function(data){
				
			if($(data).length>0){
				$("#classifieds-listview").html("");
				$.each(data, function(idx, em){
					var li = $('<li data-theme="a"><a href="#details" data-icon="plus">'+em.title.toLowerCase()+'</a></li>');
					$(li).appendTo("#classifieds-listview");				
				});
				if($(data).length>=15){
					var li = $('<li data-theme="b"><a id="more-btn" href="#details">Следни Огласи</a></li>');
					$(li).appendTo("#classifieds-listview");	
				}
				$("#classifieds-listview").listview('refresh');				
				current_page += 1;				
			}
			else{
				if(current_page == 0)
					alert('Не е пронајден ни еден оглас.');				
				else
					alert('Нема следни огласи.');							
			}
		    $.mobile.hidePageLoadingMsg();
			if(callback){
				callback();
			}
		}, 
		
		error: function(jqXHR, textStatus){
			$.mobile.hidePageLoadingMsg();
			alert('Проблем со конекција. Пробајте повторно.');				
		}
	});
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

$("#classifieds").live('pageinit', function(e){
	loadClassifieds();
	
	$("#filter-button").tap(function(e){
		e.preventDefault();
		search_query = $("#q").val();
		purpose = $("#purpose").val();
		chosen_category = $("#category-select").val();
		chosen_region = $("#region-select").val();
		current_page = 0;
		loadClassifieds(function(){$.mobile.changePage("#classifieds");});
	});
	
	$("#more-btn").live("tap", function(e){
		e.preventDefault();
		loadClassifieds(function(){$.mobile.silentScroll(0);});
	});
	
	$("#close-app").live("tap", function(e){
		navigator.notification.confirm(
    	        'Излези од апликацијата',
    	        function(button){
    	        	if(button==1)
    	        		navigator.app.exitApp();
    	        },
    	        'Излез',
    	        'Да,Не'
    	    );
	});
	
});

$("#filter").live('pageinit', function(e){
	loadCategories();
	loadRegions();
});
