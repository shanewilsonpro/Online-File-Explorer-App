// require node modules
const fs = require('fs');
const path = require('path');

const buildMainContent = (fullStaticPath, pathname) => {
    let mainContent = '';
    let items;

    //loop through the elements inside folder
    try {
        items = fs.readdirSync(fullStaticPath);
        console.log(items);
    }catch(err) {
        console.log('readdirSync error: ' + err);
        return '<div class="alert alert-danger">Internal Server Error</div>';
    }

    //get following elements for each item
    items.forEach(item => {
        const link = path.join(pathname, item);
        console.log(link);

        mainContent += '<tr><td><a href="' + link + '">' + item + '</a></td><td>100M</td><td>12/08/2018, 09:00:00 PM</td></tr>';
    });


    

    return mainContent;
};

module.exports = buildMainContent;