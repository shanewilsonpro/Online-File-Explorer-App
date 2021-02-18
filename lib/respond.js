//require node modules
const url = require('url');
const path = require('path');
const fs = require('fs');

//file imports
const buildBreadcrumb = require('./breadcrumb.js');
const buildMainContent = require('./mainContent.js');

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
        console.log(fullStaticPath + ' does not exist');
        response.write('404: File not found!');
        response.end();
        return false;
    } 

    //detect a file or directory
    let stats;
    try {
        stats = fs.lstatSync(fullStaticPath);
    } catch(err) {
        console.log('lstatSync Error: ' + err);
    }

    //a directory
    if(stats.isDirectory) {
        //get contents from template index.html
        let data = fs.readFileSync(path.join(staticBasePath, 'project_files/index.html'), 'utf-8');

        //build page title
        let pathElements = pathname.split('/').reverse();
        pathElements = pathElements.filter(element => element !== '');
        const folderName = pathElements[0];
        console.log(folderName);

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
    response.write(stats.isDirectory().toString());
    return response.end();
}

module.exports = respond;