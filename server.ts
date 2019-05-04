'use strict';
import {createServer} from 'http';
import {parse} from 'url';
import {readFile} from 'fs';

const contentTypes = new Map();
contentTypes.set('html', 'text/html');
contentTypes.set('js', 'text/javascript');
contentTypes.set('css', 'text/css');
contentTypes.set('json', 'application/json');
contentTypes.set('png', 'image/png');

createServer(function (req, res) {
    const reqUrl = parse(req.url);
    let ext: string = reqUrl.pathname.split('.')[1];
    let fileName: string = reqUrl.pathname.substr(1);

    if (fileName === '') {
        fileName = 'index.html';
        ext = 'html';
    }

    const cType: string = contentTypes.get(ext);
    readFile(fileName, function (err, data) {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('Resource no found');
            } else {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.write('Server Error');
            }
        } else {
            res.writeHead(200, {'Content-Type': cType});
            res.write(data);
        }
        res.end();
    });
}).listen(8080, function () {
    console.log('Client is available at http://localhost:8080');
});