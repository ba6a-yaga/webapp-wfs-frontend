const express = require('express')
const app = express()
const path = require('path');
const templatePath = path.join(__dirname, 'templates');
const fs = require('fs');
app.use('/assets', express.static(__dirname + '/assets'));
//Load all templates for JSRender
app.get('/templates', async (req, res) => {
    
    return fs.readdir(templatePath, (err, files) => {
        var templates = {};
        files.forEach(file => {
            let nameTemplate = file.replace('.html', '');

            templates[nameTemplate] =  fs.readFileSync(templatePath+'/'+file, 'utf8');
        });

        return res.json(templates);
    });

});

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/index.html')
})



app.listen(8070);