// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  Menu,
  MenuItem,
  ipcMain,
  ipcRenderer,
  shell,
  remote,
  dialog
} = require('electron')

const path = require('path')

const isMac = process.platform === 'darwin'

const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  {
    label: 'Club',
    submenu: [
      {
        label: 'Website',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://www.chesterlestreetasc.co.uk')
        }
      }
    ]
  },
  // { role: 'editMenu' }
  // {
  //   label: 'Edit',
  //   submenu: [
  //     { role: 'undo' },
  //     { role: 'redo' },
  //     { type: 'separator' },
  //     { role: 'cut' },
  //     { role: 'copy' },
  //     { role: 'paste' },
  //     ...(isMac ? [
  //       { role: 'pasteAndMatchStyle' },
  //       { role: 'delete' },
  //       { role: 'selectAll' },
  //       { type: 'separator' },
  //       {
  //         label: 'Speech',
  //         submenu: [
  //           { role: 'startspeaking' },
  //           { role: 'stopspeaking' }
  //         ]
  //       }
  //     ] : [
  //       { role: 'delete' },
  //       { type: 'separator' },
  //       { role: 'selectAll' }
  //     ])
  //   ]
  // },
  // { role: 'viewMenu' }
  {
    label: 'Developer',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      // { type: 'separator' },
      // { role: 'resetzoom' },
      // { role: 'zoomin' },
      // { role: 'zoomout' },
      // { type: 'separator' },
      // { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      // { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
          { role: 'close' }
        ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://www.myswimmingclub.uk/live')
        }
      },
      {
        label: 'SPORTSYSTEMS Help',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://helpdesk.sportsys.co.uk/')
        }
      },
      ...(!isMac ? [
        { type: 'separator' },
        {
          label: 'About',
          click: async () => {
            const { dialog } = require('electron')
            const os = require('os')
            const options = {
              type: 'info',
              title: 'SCDS Live Results (Visual)',
              message:
                "Electron version: " + process.versions.electron + os.EOL +
                "Chrome version: " + process.versions.chrome + os.EOL +
                "V8 version: " + process.versions.v8 + os.EOL +
                "Node.js version: " + process.versions.node + os.EOL +
                "Architecture: " + os.arch + os.EOL +
                "Platform: " + os.platform + os.EOL +
                "Home directory: " + os.homedir + os.EOL + os.EOL +
                "Copyright Swimming Club Data Systems",
              buttons: ['OK']
            }
            await dialog.showMessageBox(options, (index) => {
              // Do nothing
            })
          }
        }
      ] : [])
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, fileWorkerWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: './assets/images/logos/scds.png'
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('toMain', (event, args) => {
  shell.beep()
  // mainWindow.webContents.send('fromMain', responseObj);
});

ipcMain.on('select-dirs', async (event, arg) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: [
      'openDirectory',
      'showHiddenFiles'
    ]
  })
  console.log('directories selected', result.filePaths)
  mainWindow.webContents.send('file-select-path', result.filePaths);
})

ipcMain.on('connectionDetails', async (event, arg) => {
  // console.log(arg);
  // mainWindow.webContents.send('connectionDetails', {response: true});

  if (true) {
    fileWorkerWindow = new BrowserWindow({
      show: false,
      webPreferences: { nodeIntegration: true }
    });
    fileWorkerWindow.loadFile('./workers/file-worker-window.html')
      .then(() => {
          // Handle any error that occurred in any of the previous
          // promises in the chain.
          fileWorkerWindow.webContents.send('fWW.ListenTo', arg.directory)
          console.log('Sent watch instruction')
        })
        //
      .catch((err) => {
        // Handle any error that occurred in any of the previous
        // promises in the chain.
        console.log(err);
      });
  }
  mainWindow.webContents.send('connectionDetails', { response: true });
})

ipcMain.on('fWW.Log', async (event, arg) => {
  console.log(arg);
})

ipcMain.on('fWW', async (event, arg) => {
  console.log(arg);
})