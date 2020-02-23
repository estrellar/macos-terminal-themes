const {app, BrowserWindow, ipcMain}  = require('electron');
const fs = require('fs');
const url = require('url');
const plist = require('plist');
const path = require('path');
const exec = require('child_process').exec;

const schemes_dir = __dirname+'/schemes';
let win = null;

/**************************HELPER FUNCTIONS***************************/
//call bash function
function execute(command, callback) {
  console.log(command);
  exec(command, (error, stdout, stderr) => {
    if(error){
      console.log('error', error);
    }
    callback(stdout);
  });
};

//read schemes function and return as objects
function getProfiles(){
  var profiles = [];
  files = fs.readdirSync(schemes_dir);
  for(var i = 0; i < files.length; i++){
    let properties = plist.parse(fs.readFileSync(path.resolve(schemes_dir, files[i]), 'utf8'))
    let theme = { name: properties.name, fname: files[i]}
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

/************************INITIALIZATION*********************/
//setup main electron window
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

app.on('ready', loadWindow);


/*************************LISTENERS***********************/
ipcMain.on('index-loaded', (event, args) =>{
  event.returnValue = getProfiles();
});

ipcMain.on('install-theme', (event, args) => {
  event.returnValue = installTheme(args);
});

function installTheme(filename){
  var file = schemes_dir + '/' + filename;
  execute('./tools/installTheme.sh "'+ file + '"', (output) => {
      console.log(output);
  });
  return 'hi';
}
