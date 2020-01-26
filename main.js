const {app, BrowserWindow, ipcMain}  = require('electron');
const fs = require('fs');
const url = require('url');
const plist = require('plist')
const path = require('path')

let win = null;

function loadWindow() {
  win = new BrowserWindow({
    width: 1080,
    height: 970,
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
    let properties = plist.parse(fs.readFileSync(path.resolve(__dirname+'/schemes', files[i]), 'utf8'))
    let theme = { name: properties.name }
    for (let property in properties) {
      if ((property.startsWith('ANSI') || property.startsWith('Background')) || property.startsWith('Text') && property.includes('Color')) {
        let formattedColor = property.replace('ANSI', '').replace('Color', '')
        let regexp = /\d(?:\.?\d+)? \d(?:\.?\d+)? \d(?:\.?\d+)?/
        let parsedBase64Buffer = properties[property].toString()
        let matches = parsedBase64Buffer.match(regexp)
        if (matches && matches.length === 1) {
          let colors = matches[0].split(' ')
          if (colors.length === 3) {
            let hex = colors
            .map(c => {
              let hex = (~~(parseFloat(c) * 255)).toString(16)
              if (hex.length < 2) hex = '0' + hex
              return hex
            })
            .join('')
            theme[formattedColor] = '#' + hex
          } else {
            console.log(`Failed to parse ${property} for RGB - ${parsedBase64Buffer}`)
          }
        } else {
          console.log(`Failed to parse ${property} for RGB - ${parsedBase64Buffer}`)
        }
      }
    }
    profiles.push(theme);
  }
  return profiles;
}


app.on('ready', loadWindow);

ipcMain.on('index-loaded', (event, args) =>{
  event.returnValue = getProfiles();
});
