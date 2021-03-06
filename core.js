/*global window, document, jQuery, localStorage, JSON, photoframe */
window.photoframe = {};

(function($, pf) {
    var sites = {},
        model = {
            origins: [],
            albums: [],
            photos: []
        },
        defaultOrigins = [
            { site: "picasa", username: "sparkleysprout" },
            { site: "picasa", username: "jollytoad" }
        ],
        timeout = {},
        rebuildPhotos = true;

    function msg() {
        pf.ui.msg.apply(this, arguments);
    }

    function loadData(name, defaultJSON) {
        return (model[name] = JSON.parse(localStorage.getItem("photoframe-" + name) || defaultJSON || "[]"));
    }

    function saveData(name, delay) {
        window.clearTimeout(timeout[name]);
        timeout[name] = window.setTimeout(function() {
            localStorage.setItem("photoframe-" + name, JSON.stringify(model[name]));
        }, delay || 1000);
    }

    function loadOrigin(origin, originIndex) {
        var site = sites[origin.site];
        if (site && site.loadOrigin) {
            site.loadOrigin(origin, originIndex);
        }
    }

    function addAlbum(album, index) {
        if (index === undefined) {
            index = model.albums.length;
        }
        model.albums[index] = album;
        pf.ui.setAlbum(album, index);
        if (!album.exclude) {
            rebuildPhotos = true;
        }
        saveData("albums");
        return index;
    }

    function addOrigin(origin, index) {
        if (index === undefined) {
            index = model.origins.length;
        }
        model.origins[index] = origin;
        pf.ui.setOrigin(origin, index);
        loadOrigin(origin, index);
        saveData("origins");
        return index;
    }

    function getAlbum(index) {
        return model.albums[index];
    }

    function setAlbumProperty(index, key, value) {
        var album = model.albums[index];
        if (album && album[key] !== value) {
            album[key] = value;
            rebuildPhotos = true;
            pf.ui.setAlbum(album, index);
            saveData("albums");
        }
    }

    function setOriginProperty(originIndex, key, value) {
        var origin = model.origins[originIndex];
        if (origin && origin[key] !== value) {
            origin[key] = value;
            pf.ui.setOrigin(origin, originIndex);
            if (key === "exclude") {
                rebuildPhotos = true;
                model.albums.forEach(function(album, albumIndex) {
                    if (album.origin === originIndex) {
                        pf.ui.setAlbum(album, albumIndex);
                    }
                });
            }
            saveData("origins");
        }
    }

    function setProperty(modelList, index, key, value) {
        ({
            'albums': setAlbumProperty,
            'origins': setOriginProperty
        })[modelList](index, key, value);
    }

    function getOriginOfAlbum(album) {
        return model.origins[album.origin];
    }

	function doRebuildPhotos() {
		model.photos = [];
		model.albums.forEach(function(album, albumIndex) {
			if (!album.exclude && album.photos && !getOriginOfAlbum(album).exclude) {
				album.photos.forEach(function(photo, photoIndex) {
					model.photos.push({
						a: albumIndex,
						p: photoIndex
					});
				});
                saveData("albums");
			}
		});
		rebuildPhotos = false;
	}

    function getRandomPhoto(callback) {
        if (rebuildPhotos) {
            doRebuildPhotos();
        }

        var i = Math.floor(Math.random() * model.photos.length),
            photo = model.photos[i],
            album = photo && model.albums[photo.a],
            photoId = album && album.photos && album.photos[photo.p],
            origin = album && model.origins[album.origin],
            site = origin && sites[origin.site];

        if (site && site.loadPhoto && photoId) {
            site.loadPhoto(origin, album, photoId, function(data) {
                callback($.extend({ origin: origin, album: album, photoId: photoId }, data));
            });
        }
    }

	function loadPhotoData() {
	    pf.msg("Loading...");
	    model.albums = [];
        model.origins.forEach(loadOrigin);
        saveData("origins");
        saveData("albums");
	}

    function start() {
        loadData("origins");
        if (!model.origins || !model.origins.length) {
            model.origins = defaultOrigins;
            loadPhotoData();
            pf.ui.startSlideshow(1000, 4000);
        } else {
            loadData("albums");
            model.origins.forEach(pf.ui.setOrigin);
            model.albums.forEach(pf.ui.setAlbum);
            pf.ui.startSlideshow(0, 2000);
        }
    }

    $.extend(pf, {
        sites: sites,
        addAlbum: addAlbum,
        setAlbumProperty: setAlbumProperty,
        addOrigin: addOrigin,
        setOriginProperty: setOriginProperty,
        setProperty: setProperty,
        getOriginOfAlbum: getOriginOfAlbum,
        getRandomPhoto: getRandomPhoto,
        msg: msg,
        start: start
    });
})(jQuery, photoframe);
