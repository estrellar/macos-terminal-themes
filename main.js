const {app, BrowserWindow, ipcMain}  = require('electron');
const fs = require('fs');
const url = require('url');
let win = null;

function loadWindow() {
    win = new BrowserWindow({
        width: 700,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile('index.html');
    win.webContents.openDevTools();
    
    win.on('closed', () => {
        win = null
    });
}

function getProfiles(){
    var profiles = [];
    files = fs.readdirSync(__dirname+'/schemes');
    for(var i = 0; i < files.length; i++){
        var profile = {};
        profile.name = files[i];
        //profile.plist = ?
        profile.image_url =url.format({
            pathname: __dirname+'/screenshots/'
            +(files[i].toLowerCase().replace(/[^a-z0-9\.]/gi, '_')
              .replace('.terminal', '.png')),
            protocol:'file:',
            slashes: true
        });
        profiles.push(profile);
    }
    return profiles;
}


app.on('ready', loadWindow);

ipcMain.on('index-loaded', (event, args) =>{
    event.returnValue = getProfiles();
});
