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
let niubaWin
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  //Menu.setApplicationMenu(null)
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  ipcMain.on('openScreen', function(event, arg) {
    if (!niubaWin) {
      if (!arg.full) {
        niubaWin =  new BrowserWindow({
          width: arg.width,
          height: arg.height,
          frame: false,
          transparent: true,
          title: '牛霸霸屏'
        })
      } else {
        niubaWin =  new BrowserWindow({fullscreen: true, frame: false,transparent: true})
      }
      /*niubaWin.loadURL(url.format({
        pathname: path.join(__static, '/index.html'),
        query: 'ht_id=105',
        protocol: 'file:',
        slashes: true
      }))*/
      niubaWin.loadURL('http://xnb.siweiquanjing.com/electron/?ht_id=' + 91)
      niubaWin.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        niubaWin = null
      })
    } else {
      if (!arg.full) {
        niubaWin.setBounds(arg)
      } else {
        niubaWin.setFullScreen(true)
      }
      
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
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
