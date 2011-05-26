/*global window, document, jQuery, localStorage, JSON, photoframe */
window.photoframe = {};

(function($, pf) {
    var sites = {},
        origins = JSON.parse(localStorage.getItem("origins") || "[]"),
        defaultOrigins = [
            { site: "picasa", username: "sparkleysprout" },
            { site: "picasa", username: "jollytoad" }
        ],
        photos = JSON.parse(localStorage.getItem("photos") || "[]"),
        albums = JSON.parse(localStorage.getItem("albums") || "[]"),
        rebuildPhotos = false;

    function addAlbum(album, index) {
        if (index === undefined) {
            index = albums.length;
        }
        albums[index] = album;
        pf.ui.setAlbum(album, index);
        if (!album.exclude) {
            rebuildPhotos = true;
        }
        return index;
    }

    function addOrigin(origin, index) {
        if (index === undefined) {
            index = origins.length;
        }
        origins[index] = origin;
        pf.ui.setOrigin(origin, index);
        return index;
    }

    function getAlbum(index) {
        return albums[index];
    }

    function setAlbumProperty(index, key, value) {
        var album = albums[index];
        if (album) {
            album[key] = value;
            rebuildPhotos = true;
            // pf.ui.setAlbum(album)
        }
    }

    function setOriginProperty(index, key, value) {
        var origin = origins[index];
        if (origin) {
            origin[key] = value;
            // pf.ui.setOrigin(album)
        }
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


	function doRebuildPhotos() {
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
		rebuildPhotos = false;
	}

    function getRandomPhoto(callback) {
        if (rebuildPhotos) {
            doRebuildPhotos();
        }

        var i = Math.floor(Math.random()*photos.length),
            photo = photos[i],
            album = photo && albums[photo.a],
            photoId = album && album.photos && album.photos[photo.p],
            origin = album && origins[album.origin],
            site = origin && sites[origin.site];

        if (site && site.loadPhoto && photoId) {
            site.loadPhoto(origin, album, photoId, function(data) {
                callback($.extend({ origin: origin, album: album, photoId: photoId }, data));
            });
        }
    }

	function loadPhotoData() {
	    pf.ui.msg("Loading...");
	    albums = [];
        origins.forEach(function(origin, originIndex) {
            var site = sites[origin.site];
            if (site && site.loadOrigin) {
                site.loadOrigin(origin, originIndex);
            }
        });
	}

    function start() {
        if (!origins || !origins.length) {
            origins = defaultOrigins;
            loadPhotoData();
            pf.ui.startSlideshow(1000, 4000);
        } else {
            origins.forEach(pf.ui.setOrigin);
            albums.forEach(pf.ui.setAlbum);
            pf.ui.startSlideshow(0, 2000);
        }
    }

    $.extend(pf, {
        sites: sites,
        addAlbum: addAlbum,
        setAlbumProperty: setAlbumProperty,
        addOrigin: addOrigin,
        setOriginProperty: setOriginProperty,
        getOriginOfAlbum: getOriginOfAlbum,
        getRandomPhoto: getRandomPhoto,
        saveOrigins: saveOrigins,
        saveAlbums: saveAlbums,
        start: start
    });
})(jQuery, photoframe);
