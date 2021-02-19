//require node modules
const url = require('url');
const path = require('path');
const fs = require('fs');

//file imports
const buildBreadcrumb = require('./breadcrumb.js');
const buildMainContent = require('./mainContent.js');
const getMimeType = require('./getMimeType.js');

//static base bath for location of static folder
const staticBasePath = path.join(__dirname, '..', 'static');

//respond to a request
const respond = (request, response) => {

    //before working with path name, need to decode it
    let pathname = url.parse(request.url, true).pathname;

    //if favicon.ico stop
    if (pathname === '/favicon.ico') {
        return false;
    }

    pathname = decodeURIComponent(pathname);

    //get corresponding full static path located in the static folder
    const fullStaticPath = path.join(staticBasePath, pathname);

    //send 404 file not found
    if (!fs.existsSync(fullStaticPath)) {
        console.log(fullStaticPath + ' does not exist');
        response.write('404: File not found!');
        response.end();
        return false;
    }

    //detect a file or directory
    let stats;
    try {
        stats = fs.lstatSync(fullStaticPath);
    } catch (err) {
        console.log('lstatSync Error: ' + err);
    }

    //a directory
    if (stats.isDirectory()) {
        //get contents from template index.html
        let data = fs.readFileSync(path.join(staticBasePath, 'project_files/index.html'), 'utf-8');

        //build page title
        let pathElements = pathname.split('/').reverse();
        pathElements = pathElements.filter(element => element !== '');
        let folderName = pathElements[0];
        if (folderName === undefined) {
            folderName = 'Home';
        }
        console.log(folderName);
        console.log(pathname);
        console.log(fullStaticPath);

        //build breadcrumb
        const breadcrumb = buildBreadcrumb(pathname);

        //build table rows
        const mainContent = buildMainContent(fullStaticPath, pathname);

        //fill with template data with page title, breadcrumb and table rows
        data = data.replace('page_title', folderName);
        data = data.replace('pathname', breadcrumb);
        data = data.replace('mainContent', mainContent);

        //print data to the webpage
        response.statusCode = 200;
        response.write(data);
        return response.end();
    }

    //send 401 access denied
    if (!stats.isFile()) {
        response.statusCode = 401;
        response.write('401: Access denied!');
        console.log('not a file!');
        return response.end();
    }

    //get file extension
    let fileDetails = {};
    fileDetails.extname = path.extname(fullStaticPath);
    console.log(fileDetails.extname);

    //file size
    let stat;
    try {
        stat = fs.statSync(fullStaticPath);
    } catch (err) {
        console.log(`error: ${err}`);
    }
    fileDetails.size = stat.size;

    //get file mime type and add it to response header
    getMimeType(fileDetails.extname).then(mime => {
        //store headers here
        let head = {};
        let options = {};

        //response status code
        let statusCode = 200;

        //set content type for all file types
        head['Content-Type'] = mime;

        //get the file size and add it to the response header
        if (fileDetails.extname === '.pdf') {
            head['Content-Disposition'] = 'inline';
            //head['Content-Disposition'] = 'attachment;filename=file.pdf';
        }

        //audio/video file -> stream in ranges
        if (RegExp('audio').test(mime) || RegExp('video').test(mime)) {
            //header
            head['Accept-Ranges'] = 'bytes';

            const range = request.headers.range;
            console.log(`range: ${range}`);
            if (range) {
                const start_end = range.replace(/bytes=/, "").split('-');
                const start = parseInt(start_end[0]);
                const end = start_end[1]
                    ? parseInt(start_end[1])
                    : fileDetails.size - 1;

                //headers
                //Content-Range
                head['Content-Range'] = `bytes ${start}-${end}/${fileDetails.size}`;
                //Content-Length
                head['Content-Length'] = end - start + 1;
                statusCode = 206;

                //options
                options = { start, end };
            }
        }


        //reading file using fs.readFile
        // fs.promises.readFile(fullStaticPath, 'utf-8').then(data => {
        //     response.writeHead(statusCode, head);
        //     response.write(data);
        //     return response.end();
        // }
        // ).catch(error => {
        //     console.log(error);
        //     response.statusCode = 404;
        //     response.write('404: File reading error!');
        //     return response.end();
        // });

        //streaming method:
        const fileStream = fs.createReadStream(fullStaticPath, options);

        //stream chunks to your response object
        response.writeHead(statusCode, head);
        fileStream.pipe(response);

        //events: close and error
        fileStream.on('close', () => {
            return response.end();
        });
        fileStream.on('error', error => {
            console.log(error.code);
            response.statusCode = 404;
            response.write('404: FileStream error!');
            return response.end();
        });

    }).catch(err => {
        response.statusCode = 500;
        response.write('500: Internal server error!');
        console.log('Promise error: ' + err);
        return response.end();
    });
}

module.exports = respond;