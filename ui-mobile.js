/*global document, setTimeout, clearTimeout, location, jQuery, photoframe */
(function($, pf) {
    var photoTimeout;

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

    function setAlbum(album, albumIndex) {
        var origin = pf.getOriginOfAlbum(album);
        addListItem("#albumlist", { index: albumIndex, href: album.link, title: album.title, count: album.count, icon: album.icon, desc: origin.title, exclude: album.exclude });
    }

    function setOrigin(origin, originIndex) {
        addListItem("#originlist-" + origin.site, { index: originIndex, href: origin.link, title: origin.title });
    }

    function msg(text) {
        $(".msg").text(text);
    }

    function setRandomPhoto() {
        var page = $(this);
        pf.getRandomPhoto(function(data) {
            page.css("background-image", "url(" + data.url + ")");
            page.find(".album-title").text(data.album.title);
        });
    }

    function startSlideshow(delay1, delay2) {
		setTimeout(function() {
		    $(".photo").each(setRandomPhoto);
		}, delay1);

		if (!location.hash) {
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
			index = parseInt(li.attr("data-item-index"), 10);
		li.toggleClass("exclude");
        pf.setAlbumProperty(index, "exclude", li.hasClass("exclude"));
		event.preventDefault();
	});

    pf.ui = {
        setAlbum: setAlbum,
        setOrigin: setOrigin,
        msg: msg,
        startSlideshow: startSlideshow
    };

    $(document).ready(function() {
        pf.start();
    });

})(jQuery, photoframe);
