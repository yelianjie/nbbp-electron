import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import fs from 'fs'
import path from 'path'
import url from 'url'
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = "info"
log.info("App starting...");
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

function sendStatusToWindow(text) {
  if (mainWindow) {
    mainWindow.webContents.send('log', text)
  }
  log.info(text);
}
autoUpdater.on("checking-for-update", () => {
  sendStatusToWindow("Checking for update...");
});
autoUpdater.on("update-available", info => {
  sendStatusToWindow("Update available.");
});
autoUpdater.on("update-not-available", info => {
  sendStatusToWindow("Update not available.");
});
autoUpdater.on("error", err => {
  sendStatusToWindow("Error in auto-updater. " + err);
});
autoUpdater.on("download-progress", progressObj => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + " - Downloaded " + progressObj.percent + "%";
  log_message =
    log_message +
    " (" +
    progressObj.transferred +
    "/" +
    progressObj.total +
    ")";
  sendStatusToWindow(log_message);
});
autoUpdater.on("update-downloaded", info => {
  sendStatusToWindow("Update downloaded");
});

let mainWindow
let qrcodeWin
let niubaWins = {}
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  Menu.setApplicationMenu(null)
  

  if (!fs.existsSync(path.join(__dirname, '/userData/user.json'))) {
    qrcodeWin = new BrowserWindow({
      frame: true,
      width: 400,
      height: 460,
      useContentSize: true
    })

    qrcodeWin.loadURL(url.format({
      pathname: path.join(__static, '/qrcode.html'),
      protocol: 'file:',
      slashes: true
    }))
    ipcMain.on('loginSuccess', function(event, arg) {
      qrcodeWin.hide()
      mainWindow = new BrowserWindow({
        height: 800,
        useContentSize: true,
        width: 1600
      })
      mainWindow.webContents.on('dom-ready', function(){
        qrcodeWin.close()
      })
      mainWindow.loadURL(winURL)
      mainWindow.on('closed', () => {
        mainWindow = null
      })
    })
    
    qrcodeWin.on('closed', () => {
      qrcodeWin = null
    })
  }
  
  // var lastId = 0
  ipcMain.on('openScreen', function(event, arg) {
    /*var isSameId = false
    if (lastId != arg.ht_id) {
      isSameId = false
      niubaWins[arg.deviceId] && niubaWins[arg.deviceId].close()
    } else {
      isSameId = true
    }
    lastId = arg.ht_id*/
    if (arg.status != undefined && !arg.status) {
      niubaWins[arg.deviceId] && niubaWins[arg.deviceId].close()
      return false
    }
    if (!niubaWins[arg.deviceId]) {
      if (!arg.size.full) {
        createNBWin(arg, false)
      } else {
        createNBWin(arg, true)
      }
    } else {
      if (!arg.size.full) {
        niubaWins[arg.deviceId].setBounds(arg.size)
      } else {
        niubaWins[arg.deviceId].setFullScreen(true)
      }
      
    }
  })
  // 改变屏幕大小
  ipcMain.on('setScreenSize', function(event, arg) {
    niubaWins[arg.deviceId] && niubaWins[arg.deviceId].setBounds(arg.size)
  })

  // 改变网页设置
  ipcMain.on('systemSetting', function(event, arg) {
    niubaWins[arg.deviceId] && niubaWins[arg.deviceId].webContents.send('setting',  arg)
  })
}

function createNBWin (arg, isFullscreen) {
  if (isFullscreen) {
    niubaWins[arg.deviceId] =  new BrowserWindow({fullscreen: true, frame: false,transparent: true})
  } else {
    niubaWins[arg.deviceId] =  new BrowserWindow({
      width: arg.size.width,
      height: arg.size.height,
      x: arg.size.x,
      y: arg.size.y,
      frame: false,
      transparent: true,
      title: '牛霸霸屏',
      resizable: false,
      movable: false
    })
  }
  
  var params = {
    ht_id: arg.ht_id,
    bgType: arg.bgTypeRadio,
    from: 'exe'
  }
  var _root = 'http://niuba.siweiquanjing.com/electron/'
  //var _root = 'http://localhost/screen20180320/'
  var url = http_builder_url(_root, params)
  console.log(url)
  niubaWins[arg.deviceId].loadURL(url)
  niubaWins[arg.deviceId].on('close', function () {
    mainWindow.webContents.send('setSwitchOff',  {deviceId: arg.deviceId})
  })
  niubaWins[arg.deviceId].on('closed', function () {
    niubaWins[arg.deviceId] = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})


app.on("ready", function() {
  autoUpdater.setFeedURL("http://xnb.siweiquanjing.com/app/");
  autoUpdater.checkForUpdatesAndNotify();
});


function http_builder_url(url, data) {
    if(typeof(url) == 'undefined' || url == null || url == '') {
        return '';
    }
    if(typeof(data) == 'undefined' || data == null || typeof(data) != 'object') {
        return '';
    }
    url += (url.indexOf("?") != -1) ? "" : "?";
    for(var k in data) {
        url += ((url.indexOf("=") != -1) ? "&" : "") + k + "=" + encodeURI(data[k]);
        console.log(url);
    }
    return url;
}

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
