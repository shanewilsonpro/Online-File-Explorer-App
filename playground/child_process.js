const {execSync} = require('child_process');

try {
    const result = execSync('du -sh "/Users/shanewilson/Documents/Developments/Web_Dev/Online-File-Explorer-App"').toString();
    console.log(result);
}catch(err) {
    console.log('Error: ' + err);
}

