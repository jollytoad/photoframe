/*global setTimeout, jQuery, photoframe */
(function($, pf) {

    function picasaGetPhotosFromAlbum(album, albumIndex) {
        var origin = pf.getOriginOfAlbum(album);
        pf.msg("Loading album: " + album.title + " from " + (origin.title || origin.username));
        $.ajax({
            url: "http://picasaweb.google.com/data/feed/api/user/" + origin.username + "/albumid/" + album.id,
            data: "alt=json-in-script&v=2&fields=entry(gphoto:id)",
            dataType: "jsonp",
            success: function(data) {
                var photos = data.feed.entry.map(function(entry) { return entry.gphoto$id.$t; });
                pf.setAlbumProperty(albumIndex, "photos", photos);
            }
        });
    }

    function picasaGetAlbumsForUser(origin, originIndex) {
        pf.msg("Loading albums for: " + origin.username);
        $.ajax({
            url: "http://picasaweb.google.com/data/feed/api/user/" + origin.username,
            data: "alt=json-in-script&v=2&fields=gphoto:*,link[@rel='alternate'],entry(title,gphoto:*,media:*(media:thumbnail),link[@rel='alternate'])",
            dataType: "jsonp",
            success: function(data) {
                pf.setOriginProperty(originIndex, "link", data.feed.link[0].href);
                pf.setOriginProperty(originIndex, "title", data.feed.gphoto$nickname.$t);

                data.feed.entry.forEach(function(entry) {
                    var album = {
                            id: entry.gphoto$id.$t,
                            title: entry.title.$t,
                            icon: entry.media$group.media$thumbnail[0].url,
                            origin: originIndex,
                            count: entry.gphoto$numphotos.$t,
                            link: entry.link[0].href
                        };

                    var albumIndex = pf.addAlbum(album);

                    setTimeout(function() {
                        picasaGetPhotosFromAlbum(album, albumIndex);
                    }, 100);
                });
            }
        });
    }

    function picasaGetPhoto(origin, album, photoId, callback) {
        $.ajax({
            url: "http://picasaweb.google.com/data/entry/api/user/" + origin.username + "/albumid/" + album.id + "/photoid/" + photoId,
            dataType: "jsonp",
            data: "alt=json-in-script&v=2&fields=media:*",
            success: function(data) {
                callback({
                    url: data.entry.media$group.media$content[0].url
                });
            }
        });
    }

    pf.sites.picasa = {
        loadOrigin: picasaGetAlbumsForUser,
        loadPhoto: picasaGetPhoto
    };

})(jQuery, photoframe);
