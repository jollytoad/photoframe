window.photoframe = (function($) {
    var sites = {},
        origins = JSON.parse(localStorage.getItem("origins") || "[]"),
        defaultOrigins = [
            { site: "picasa", username: "sparkleysprout" },
            { site: "picasa", username: "jollytoad" }
        ],
        photos = JSON.parse(localStorage.getItem("photos") || "[]"),
        albums = JSON.parse(localStorage.getItem("albums") || "[]"),
        img = document.getElementById("photo"),
        head = document.getElementsByTagName("head")[0],
        photoTimeout,
        rebuild = false;

    function addListItem(list, opts) {
        var o = opts || {},
            ul = $(list),
            li = $("<li/>").appendTo(ul),
            a = $("<a/>", { href: "#", className: "item" }).appendTo(li);

		if (o.index !== undefined) {
			li.attr("data-item-index", o.index);
		}
        if (o.href) {
            $("<a/>", { href: o.href }).appendTo(li);
        }
        if (o.icon) {
            li.addClass("ui-li-has-thumb");
            $('<img/>', { src: o.icon, className: "ui-li-thumb" }).prependTo(a);
        }
        if (o.title) {
            $('<h3/>', { text: o.title }).appendTo(a);
        }
        if (o.desc) {
            $('<p/>', { text: o.desc }).appendTo(a);
        }
        if (o.count !== undefined) {
            $('<span class="ui-li-count"/>').text(o.count).appendTo(a);
        }
		if (o.exclude) {
			li.addClass("exclude");
		}

        if (ul.data("listview")) {
            ul.listview("refresh");
        }
    }

    function addAlbumItem(album, albumIndex) {
        addListItem("#albumlist", { index: albumIndex, href: album.link, title: album.title, count: album.count, icon: album.icon, desc: origins[album.origin].title, exclude: album.exclude });
    }

    function addAlbum(album) {
        var index = albums.length;
        albums.push(album);
        addAlbumItem(album, index);
        if (!album.exclude) {
	        rebuild = true;
        }
        return index;
    }

    function addOriginItem(origin, originIndex) {
        addListItem("#originlist-" + origin.site, { index: originIndex, href: origin.link, title: origin.title });
    }

    function addOrigin(origin) {
        var index = origins.length;
        origins.push(origin);
        addOriginItem(origin, index);
        return index;
    }

    function getOriginOfAlbum(album) {
        return origins[album.origin];
    }

    function saveOrigins() {
        localStorage.setItem("origins", JSON.stringify(origins));
    }

    function saveAlbums() {
        localStorage.setItem("albums", JSON.stringify(albums));
    }

    function savePhotos() {
        localStorage.setItem("photos", JSON.stringify(photos));
    }

    function msg(text) {
        $(".msg").text(text);
    }

	function buildPhotoList() {
		photos = [];
		albums.forEach(function(album, albumIndex) {
			if (!album.exclude && album.photos) {
				album.photos.forEach(function(photo, photoIndex) {
					photos.push({
						a: albumIndex,
						p: photoIndex
					});
				});
			}
		});
		savePhotos();
		rebuild = false;
	}

    function setRandomPhoto() {
    	if (rebuild) {
    		buildPhotoList();
		}

        var i = Math.floor(Math.random()*photos.length),
            photo = photos[i],
            album = photo && albums[photo.a],
            photoId = album.photos && album.photos[photo.p],
            origin = album && origins[album.origin],
            site = origin && sites[origin.site],
            page = $(this);

        if (site && site.loadPhoto && photoId) {
            site.loadPhoto(origin, album, photoId, function(data) {
                console.log(data.url);
                page.css("background-image", "url(" + data.url + ")");
                page.find(".album-title").text(album.title);
            });
        }
    }

	function loadPhotoData() {
	    msg("Loading...");
	    albums = [];
    	origins.forEach(function(origin, originIndex) {
            var site = sites[origin.site];
            if (site && site.loadOrigin) {
                site.loadOrigin(origin, originIndex);
            }
        });
	}

    function startSlideshow(delay1, delay2) {
		setTimeout(function() {
		    $(".photo").each(setRandomPhoto);
		}, delay1);

		if (delay2) {
			setTimeout(function() {
				$.mobile.changePage("photo-0", "slide");
			}, delay2);
		}
	}

    $(".photo")
        .live("pagehide", function() {
            setRandomPhoto.apply(this);
        })
        .live("pageshow", function() {
            photoTimeout = setTimeout(function() {
                var next = $.mobile.activePage.next(".photo");
                if (!next.length) {
                    next = $("#photo-0");
                }
                $.mobile.changePage(next[0].id, "fade");
            }, 5000);
        });

    $("#home").live("pagebeforeshow", function() {
    	clearTimeout(photoTimeout);
    });

	$("#albumlist a.item").live("click", function(event) {
		var li = $(this).closest("li"),
			index = parseInt(li.attr("data-item-index"));
		li.toggleClass("exclude");
		albums[index].exclude = li.hasClass("exclude");
		rebuild = true;
		event.preventDefault();
	});

    $(document).ready(function() {
        if (!origins || !origins.length) {
            origins = defaultOrigins;
            loadPhotoData();
            startSlideshow(1000, location.hash ? 0 : 4000);
        } else {
            origins.forEach(addOriginItem);
            albums.forEach(addAlbumItem);
            startSlideshow(0, location.hash ? 0 : 2000);
        }
    });

    return {
        sites: sites,
        msg: msg,
        addOriginItem: addOriginItem,
        addAlbum: addAlbum,
        getOriginOfAlbum: getOriginOfAlbum,
        saveOrigins: saveOrigins,
        saveAlbums: saveAlbums,
        savePhotos: savePhotos
    };
})(jQuery);
