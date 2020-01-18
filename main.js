const {app, BrowserWindow}  = require('electron');
const fs = require('fs');

let win = null;

function createWindow() {
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

app.on('ready', createWindow);

//loop through schemes dir
fs.readdir('./schemes', (err, dir) => {
    for(var i = 0; i < dir.length; i++){
        console.log(dir[i]);
    }
});
app.on('activate', () => {
    if(win === null){
        createWindow()
    }
});
