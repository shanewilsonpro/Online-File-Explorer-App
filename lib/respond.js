//require node modules
const url = require('url');
const path = require('path');
const fs = require('fs');

//static base bath for location of static folder
const staticBasePath = path.join(__dirname, '..', 'static');

//respond to a request
const respond = (request, response) => {

    //before working with path name, need to decode it
    let pathname = url.parse(request.url, true).pathname;

    //if favicon.ico stop
    if(pathname === '/favicon.ico') {
        return false;
    }

    pathname = decodeURIComponent(pathname);

    //get corresponding full static path located in the static folder
    const fullStaticPath = path.join(staticBasePath, pathname);

    //send 404 file not found
    if(!fs.existsSync(fullStaticPath)) {
        console.log('${fullStaticPath} does not exist');
        response.write('404: File not found!');
        response.end();
        return false;
    } 

    //detect a file or directory
    let stats;
    try {
        stats = fs.lstatSync(fullStaticPath);
    } catch(err) {
        console.log('lstatSync Error: ${err}');
    }

    //a directory
    if(stats.isDirectory) {
        //get contents from template index.html
        let data = fs.readFileSync(path.join(staticBasePath, 'project_files/index.html'), 'utf-8');

        //build page title
        let pathElements = pathname.split('/').reverse();
        pathElements = pathElements.filter(element => element !== '');
        const folderName = pathElements[0];
        data = data.replace('page_title', folderName);

        response.statusCode = 200;
        response.write(data);
        response.end();
    }
    response.write(stats.isDirectory().toString());
    response.end();
}

module.exports = respond;