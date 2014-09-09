/*****************************************************************************************
	* jQuery plug-in
	* Flickr Photo Gallery
	* Developed by J.P. Given (http://johnpatrickgiven.com)
	* Useage: anyone so long as credit is left alone...oh and get your own API key ;)
******************************************************************************************/

var flickrhelpers = null;

(function(jQuery) {

	jQuery.fn.flickrGallery = function(args) {

		var $element = jQuery(this), // reference to the jQuery version of the current DOM element
		    element = this;         // reference to the actual DOM element

		// Public methods
		var methods = {
			init : function () {
				// Extend the default options
				settings = jQuery.extend({}, defaults, args);

				// Make sure the api key and setID are passed
				if (settings.flickrKey === null || (settings.flickrSet === null && settings.flickrUser === null)) {
					alert('You must pass an API key and a Flickr setID');
					return;
				}

				// init the image loader and set values
				$("body").append('<div id="flickr_loader"></div>');
				$("#flickr_loader").css({
					"width"            : element.width(),
					"height"           : element.height(),
				});

				// CSS jqfobject overflow for aspect ratio
				element.css("overflow","hidden");

                // Set navigation click event:s
                element.click(function() {
                    //next
                    if ($('#flickr_div').css('cursor') == "e-resize") {
                        if (settings.currentIndex < (settings.imgArray.length - 1)) {
                            settings.currentIndex = settings.currentIndex + 1;
                            flickrhelpers.navImg(settings.currentIndex);
                        }
                    }
                    //prev
                    if ($('#flickr_div').css('cursor') == "w-resize") {
                        if (settings.currentIndex > 0) {
                            settings.currentIndex = settings.currentIndex - 1;
                            flickrhelpers.navImg(settings.currentIndex);
                        }
                    }
                });

               if (!(settings.flickrUser === null)) {
                    $.getJSON("http://api.flickr.com/services/rest/?format=json&method=flickr.photosets.getList&user_id=" + settings.flickrUser + "&api_key=" + settings.flickrKey + "&jsoncallback=?", function(flickrData){
                        var length = flickrData.photosets.total;
                        Photo_sort = flickrData.photosets.photoset.sort(function(a,b){
                          return a.title._content < b.title._content? -1 : 1;
                        });
                        element.parent().before('<div id="flickr_sets" class="box"></div>');
                        var sets = $("#flickr_sets");
                        var espetaculos = true;
                        var eventos = true;
                        var outras = true;
                        for (i=0; i<length; i++) {
                            var photoset = Photo_sort[i];
                            if(photoset.title._content.search(/\*/) >= 0){
                                if(espetaculos){
                              espetaculos = false;
                              sets.append('<span id="espetaculos">Espetáculos</span>');
                                }
                            } else if(photoset.title._content.search(/#/) >= 0){
                              if(eventos){
                              eventos = false;
                              sets.append('<span id="eventos">Eventos</span>');
                              }
                            } else if(outras) {
                              outras = false;
                              sets.append('<span id="outras">Outras fotos</span>');
                            }
                            var args = "flickrSet=" + photoset.id;
                            sets.append("<div id='"+photoset.id+"'><a href='?" + args + "' title='" + photoset.description._content + "'>" + photoset.title._content +  " </a></div>");
                            $.getJSON("http://api.flickr.com/services/rest/?format=json&method=flickr.photosets.getPhotos&photoset_id=" + photoset.id + "&extras=date_upload&api_key=" + settings.flickrKey + "&jsoncallback=?", function(flk){
                                /*console.log(flk.photoset);*/
                                last_photo = flk.photoset.photo.length - 1;
                                var thumbURL = 'http://farm' + flk.photoset.photo[last_photo].farm + '.' + 'static.flickr.com/' + flk.photoset.photo[last_photo].server + '/' + flk.photoset.photo[last_photo].id + '_' + flk.photoset.photo[last_photo].secret + '_s.jpg'

                                var thumbHTML = '<img src=' + thumbURL + ' width="25" height="25" title="' + flk.photoset.photo[last_photo].title + '">';
                                $('#'+flk.photoset.id).prepend(thumbHTML);
                            });
                        }
                        if (settings.flickrSet === null)
                           settings.flickrSet = flickrData.photosets.photoset[0].id;
                        loadFlickrSet();
                    });
                } else {
                    loadFlickrSet();
                }
			}
		}

        loadFlickrSet = function() {
				// Get the Flickr Set :)
				$.getJSON("http://api.flickr.com/services/rest/?format=json&method=flickr.photosets.getPhotos&photoset_id=" + settings.flickrSet + "&api_key=" + settings.flickrKey + "&jsoncallback=?", function(flickrData){

					var length = flickrData.photoset.photo.length;
					var thumbHTML = '';

					for (i=0; i<length; i++) {
						var photoURL = 'http://farm' + flickrData.photoset.photo[i].farm + '.' + 'static.flickr.com/' + flickrData.photoset.photo[i].server + '/' + flickrData.photoset.photo[i].id + '_' + flickrData.photoset.photo[i].secret +'.jpg'
						var thumbURL = 'http://farm' + flickrData.photoset.photo[i].farm + '.' + 'static.flickr.com/' + flickrData.photoset.photo[i].server + '/' + flickrData.photoset.photo[i].id + '_' + flickrData.photoset.photo[i].secret + '_s.jpg'
						thumbHTML += '<img src=' + thumbURL + ' width="50" height="50" onclick="flickrhelpers.navImg('+ i +');" style="cursor: pointer;" title="' + flickrData.photoset.photo[i].title + '">';
						settings.imgArray[i] = photoURL;
						settings.titleArray[i] = flickrData.photoset.photo[i].title;
					}

					// Get the position of the element Flickr jqfobj will be loaded into
					settings.x = element.offset().left;
					settings.y = element.offset().top;
					settings.c = settings.x + (element.width() / 2);
					settings.ct = settings.y + (element.height() / 2);

					// position loader
					$("#flickr_loader").css({
						"left" : settings.x,
						"top"  : settings.y
					});

					// Append the Thumbs holder to the body
					element.after('<div id="flickr_thumbs"></div>');
					$("#flickr_thumbs").append('<div id="flickr_thumbs_in"></div>');
					$("#flickr_thumbs").css("background-color",element.css("background-color"));
					$("#flickr_thumbs").css("width",element.width());
                    $("#flickr_thumbs").css({overflow: 'hidden'});

					$("#flickr_thumbs_in").html(thumbHTML);
					$("#flickr_thumbs_in").css("white-space","nowrap"); //element.width()
          $("#flickr_thumbs_in").css("text-align","center"); //element.width()

          $('#flickr_thumbs').mousemove(function(e){
            var div = $("#flickr_thumbs");
            var ul = $("#flickr_thumbs_in");
            var lastLi = ul.find('img:last-child');
            var divWidth = div.width();
            var ulWidth = lastLi[0].offsetLeft + lastLi.outerWidth();

            var left = (e.pageX - div.offset().left) * (ulWidth-divWidth) / divWidth / 2;
            div.scrollLeft(left);
          });


					// When data is set, load first image.
                    if (settings.last === null){
	    				flickrhelpers.navImg(0);
                    } else {
	    				flickrhelpers.navImg(length - 1);
                    }

				});
        }

		// Helper functions here
		flickrhelpers = {
			navImg : function (index) {
				// Set the global index
				currentIndex = index;

				// Set the loader gif pos and display
				$("#flickr_loader").css({
					"top" : settings.y,
					"left" : settings.x,
					"display" : "block"
				});


				// Create an image Obj with the URL from array
				var thsImage = null;
				thsImage = new Image();
				thsImage.src = settings.imgArray[index];

				// Set global imgObj to jQuery img Object
				settings.fImg = $( thsImage );

				// Display the image
				element.html('');
				element.html('<img id="thsImage" src=' + settings.imgArray[index] + ' border=0>');

				// Call to function to take loader away once image is fully loaded
				$("#thsImage").load(function() {
					// Set the aspect ratio
					var w = $("#thsImage").width();
					var h = $("#thsImage").height();
					if (w > h) {
						var fRatio = w/h;
						$("#thsImage").css("width",element.width());
						$("#thsImage").css("height",Math.round(element.width() * (1/fRatio)));
					} else {
						var fRatio = h/w;
						$("#thsImage").css("height",element.height());
						$("#thsImage").css("width",Math.round(element.height() * (1/fRatio)));
					}

          element.animate({height: $("#thsImage").height()}, 300, function(){
            if (element.outerHeight() > $("#thsImage").outerHeight()) {
              var thisHalfImage = $("#thsImage").outerHeight()/2;
              var thisTopOffset = (element.outerHeight()/2) - thisHalfImage;
              $("#thsImage").animate({marginTop: thisTopOffset+"px"}, 200);
            }
          });

					var current_count = currentIndex + 1;
					$("#flickr_count").html("Foto " + current_count + " / " + settings.imgArray.length);
					if (settings.titleArray[currentIndex] != "") {
						$("#flickr_count").append(" : " + settings.titleArray[currentIndex]);
					}

					$("#flickr_loader").fadeOut();
				});


			},
		}

		// Hooray, defaults
		var defaults = {
			"flickrUser" : null,
			"flickrSet" : null,
			"flickrKey" : null,
            "last" : null,
			"x" : 0, // Object X
			"y" : 0, // Object Y
			"c" : 0, // Object center point
			"ct" : 0, // Object center point from top
			"mX" : 0, // Mouse X
			"mY" : 0,  // Mouse Y
			"imgArray" : [], // Array to hold urls to flickr images
			"titleArray" : [], // Array to hold image titles if they exist
			"currentIndex" : 0, // Default image index
			"fImg" : null, // For checking if the image jqfobject is loaded.
		}

		// For extending the defaults!
		var settings = {}

		// Init this thing
		jQuery(document).ready(function () {
			methods.init();
		});

		// Sort of like an init() but re-positions dynamic elements if browser resized.
		$(window).resize(function() {
			// Get the position of the element Flickr jqfobj will be loaded into
			settings.x = element.offset().left;
			settings.y = element.offset().top;
			settings.c = settings.x + (element.width() / 2);
			settings.ct = settings.y + (element.height() / 2);

			$("#flickr_loader").css("background-color","#fff"); // Set background color of loader to the background-color of container
			$("#flickr_loader").css("width",element.width() + "px");
			$("#flickr_loader").css("height",element.height() + "px");

			$("#flickr_thumbs").css("background-color",element.css("background-color"));
			$("#flickr_thumbs").css("width",element.width() + "px");
		});

		$(document).mousemove(function (e) {
			// Set global mouse position
			settings.mX = e.pageX;
			settings.mY = e.pageY;

			// Bounding box coordinents of jqfobject
			var bY = settings.y + element.height();
			var rX = settings.x + element.width();
			if (((settings.mY > settings.y) && (settings.mY < bY)) && ((settings.mX > settings.x) && (settings.mX < rX))) {
				if (settings.mX < settings.c) {
					element.css("cursor","w-resize");
				} else if (settings.mX > settings.c) {
					element.css("cursor","e-resize");
				} else {
					element.css("cursor","pointer");
				}
			} else {
			    element.css("cursor","pointer");
			}
		});

	}


})(jQuery);
