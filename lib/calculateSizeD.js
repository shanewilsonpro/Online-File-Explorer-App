//require node modules
const {execSync} = require('child_process');

const calculateSizeD = itemFullStaticPath => {
    //escape spaces, tabs, etc
    const itemFullStaticPathCleaned = itemFullStaticPath.replace(/\s/g, '\ ');

    const commandOutput = execSync('du -sh "' + itemFullStaticPathCleaned + '"').toString();

    console.log(commandOutput);

    //remove spaces, tabs, etc
    let filesize = commandOutput.replace(/\s/g, '');

    //split filesize using '/' separator
    filesize = filesize.split('/');

    //human size is first item of array
    filesize = filesize[0];
    console.log(filesize);

    //unit
    const filesizeUnit = filesize.replace(/\d|\./g, '');
    console.log(filesizeUnit);

    //size number
    const filesizeNumber = filesize.replace(/[a-z]/i, '');
    console.log(filesizeNumber);

    return [filesize, 110*1000*1000];
};

module.exports = calculateSizeD;