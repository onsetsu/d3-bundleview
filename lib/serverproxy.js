// TODO: convert to esnext
// TODO: recursive glob/browse
// TODO: fetch instead of $
"use strict";

export default class Server {
    static save(path, content, callback) {
        console.log("SAVING:", path);
        var postString =
            'path=' + encodeURIComponent(path) +
            '&data=' + encodeURIComponent(content);

        var req = $.ajax({
            url: 'lib/weltmeister/api/save.php',
            type: 'POST',
            dataType: 'json',
            async: false,
            data: postString,
            success: callback || function() { console.log("FILE SAVED"); }
        });

        return req;
    }

    static browse(dirPath, type) {
        return new Promise(function (resolve, reject) {
            var query =
                'dir=' + encodeURIComponent(dirPath) +
                '&type=' + encodeURIComponent(type);

            return $.ajax({
                url: 'lib/weltmeister/api/browse.php',
                dataType: 'json',
                //async: false,
                data: query,
                success: resolve
            });
        });

        /*
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", 'json');

        var myInit = {
            method: 'GET',
            headers: myHeaders
        };

        var myRequest = new Request('lib/weltmeister/api/browse.php' +
            '?dir=' + encodeURIComponent(dirPath) +
            '&type=' + encodeURIComponent(type), myInit);

        return fetch(myRequest).then(response => {
            if(response.ok) {
                return response.json();
            } else {
                console.log('Network response was not ok.');
            }
        });
        */
    }

    static browseRecursive(dirPath, type) {
        return Server.browse(dirPath, type)
            .then(desc => {
                return Promise.all(desc.dirs.map(subDir =>
                        Server.browseRecursive(subDir, type)
                )).then(dirContents =>
                        desc.dirContents = dirContents
                ).then(() => desc);
            });
    }

    static glob(pattern) {
        return new Promise((resolve, reject) => {
            var query =
                'glob=' + encodeURIComponent(pattern);

            return $.ajax({
                url: 'lib/weltmeister/api/glob.php',
                dataType: 'json',
                async: false,
                data: query,
                success: resolve
            });
        });
    }

    static glob2(basedir, pattern) {
        return new Promise((resolve, reject) => {
            var query =
                'basedir=' + encodeURIComponent(basedir) +
                '&pattern=' + encodeURIComponent(pattern);

            return $.ajax({
                url: 'lib/weltmeister/api/glob2.php',
                dataType: 'json',
                async: false,
                data: query,
                success: resolve
            });
        });
    }
};

Server.types = {
    scripts: "scripts"
};
