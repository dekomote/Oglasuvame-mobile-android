var OglSettings = {
	chosen_region: "",
	chosen_category: "",
	search_query: "",
	current_page: 0,
	purpose: ""
}


var API_URL = "http://oglasuva.me/api/";

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady(){

    $.mobile.allowCrossDomainPages = true;
    $.support.cors = true;
    $.mobile.defaultPageTransition = 'none';    
	checkConnection();
	
	$.ajaxSetup({
		timeout: 10000,
		async: false,
		cache:false,
		beforeSend: function(){
			$('body').addClass('ui-loading');
		},
		complete: function(){
			$('body').removeClass('ui-loading');
		}
	});
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
				var opt = $('<option value="'+em.id+'">'+em.name+'</option>');
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
	$.ajax({
		async: false,
		timeout: 5000,
		url:API_URL + "classifieds.json",
		dataType: "json",
		
		data: {
			region: OglSettings.chosen_region, 
			category: OglSettings.chosen_category, 
			q: OglSettings.search_query, 
			page: OglSettings.current_page, 
			purpose: OglSettings.purpose
		},
		
		success: function(data){
				
			if($(data).length>0){
				if(OglSettings.current_page==0)
					$("#classifieds-listview").html("");
				$.each(data, function(idx, em){
					var li = $('<li data-theme="a">\
							<a href="#" data-icon="plus"><h3>'+em.title.toLowerCase()+'</h3>\
							<p>'+formatElementContent(em)+'</p></a></li>');

					if($("#more-btn").length>0){
						$(li).insertAfter("#classifieds-listview li:not(.more-btn):last");
					}
					else{
						$(li).appendTo("#classifieds-listview");
					}
					
					$(li).tap(function(){fetchDetails(em.id);});
				});
				if($(data).length>=15 && $("#more-btn").length==0){
					var li = $('<li data-theme="b" class="more-btn"><a id="more-btn" href="#details">Следни Огласи</a></li>');
					$(li).appendTo("#classifieds-listview");
				}
				$("#classifieds-listview").listview('refresh');				
				OglSettings.current_page += 1;				
			}
			else{
				if(OglSettings.current_page == 0)
					alert('Не е пронајден ни еден оглас.');				
				else
					alert('Нема следни огласи.');							
			}
		    
			if(callback){
				callback();
			}
		}, 
		
		error: function(jqXHR, textStatus){
			alert('Проблем со конекција. Пробајте повторно.');				
		}
	});
}

function formatElementContent(em){
	var content = "";
	content += "<b>"+ em.category.name +"</b> | ";
	content += "<b>"+em.purpose.name+" во "+ em.region.name+"</b>";
   	if(em.price)
   		content += " | <b>Цена:</b> "+em.price+" "+em.currency + "<br/>";
   	return content
}

function fetchDetails(id){
	$.ajax({
			url: API_URL + "details/"+id+".json",
			cache: false,
			async: false,
			success: function(data,tm,jq){
				$('#details .details-title').text(data.title);
				$('#details .details-content').text(data.content);
				$('#details .details-category').text(data.category.name);
				$('#details .details-purpose').text(data.purpose.name);
				$('#details .details-region').text(data.region.name);
				if(data.price)
					$('#details .details-price').html("Цена: "+data.price+" "+data.currency);
				else
					$('#details .details-price').html("");
				$('#details .details-contact-name').html(data.contact_person_name);
				
				if(data.home_phone)
					$('#details .details-contact-home-phone').html('<a data-icon="gear" href="tel:'+data.home_phone+'">'+data.home_phone+'</a>');
				else
					$('#details .details-contact-home-phone').html("");
				
				if(data.mobile_phone)
					$('#details .details-contact-mobile-phone').html('<a data-icon="gear" href="tel:'+data.mobile_phone+'">'+data.mobile_phone+'</a>');
				else
					$('#details .details-contact-mobile-phone').html("");
				
				if(data.location_lon){
					$("#details-map").css("width","100%");
					$("#details-map").css("height","10em");
					var latitude = data.location_lat;
			        var longitude = data.location_lon;
			        var initialLocation = new google.maps.LatLng(latitude, longitude);
			        var myOptions = {
			            zoom: 12, 
			            center: initialLocation, 
			            mapTypeId: google.maps.MapTypeId.ROADMAP
			        };
			        var map = new google.maps.Map(document.getElementById("details-map"), 
			                                      myOptions);
			        var marker = new google.maps.Marker({
			            position: initialLocation,
			            map: map,
			            title:data.title
			        });
			        google.maps.event.trigger(map, 'resize');
				}
				else{
					$("#details-map").css("width","100%");
					$("#details-map").css("height","0em");
					$("#details-map").html("");
				}				
				$("#details .details-contact-mobile-phone a,#details .details-contact-home-phone a").button();
				$("#details").page();
				$.mobile.changePage('#details', {transition: 'none'});
				
			}, 
			dataType: "json",
			error: function(jqm, text){
				alert('Проблем со конекција. Пробајте повторно.');
			}
	});
}

$("#classifieds").live('pageinit', function(e){
	
	loadClassifieds();
	
	$("#filter-button").tap(function(e){
		e.preventDefault();
		OglSettings.search_query = $("#q").val();
		OglSettings.purpose = $("#purpose").val();
		OglSettings.chosen_category = $("#category-select").val();
		OglSettings.chosen_region = $("#region-select").val();
		OglSettings.current_page = 0;
		loadClassifieds(function(){$.mobile.changePage("#classifieds");});
	});
	
	$("#filter-all-button").tap(function(e){
		e.preventDefault();
		OglSettings.search_query = "";
		OglSettings.purpose = "";
		OglSettings.chosen_category = "";
		OglSettings.chosen_region = "";
		OglSettings.current_page = 0;
		loadClassifieds(function(){$.mobile.changePage("#classifieds");});
	});
	
	$("#more-btn").live("tap", function(e){
		e.preventDefault();
		var t = $(this).offset().top;
		loadClassifieds(function(){$.mobile.silentScroll(t)});
	});
	
	$("#close-app").tap(function(e){
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
