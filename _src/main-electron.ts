// main.js

// Modules to control application life and create native browser window
import { app, BrowserWindow, Menu, ipcMain, dialog, shell, /*ipcRenderer*/ } from 'electron'
import path from 'path'
import fs from 'fs';
import * as mem from './copyFromMemUtils';
import execFile from 'child_process'

/*------------------------------------------------------------------------*/
const devMode = !false;
/*------------------------------------------------------------------------*/

const Version = 'alpha 0.0.01';
const Desc = 'Plum Notes.'


let mainWindow:BrowserWindow;
const createWindow = () => {
//   sendMessage(process.cwd());
//   execFile.execFile(process.cwd()+'plum')
  mainWindow = new BrowserWindow({
    // width: 800,
    // height: 600,
    icon: path.join(__dirname, '../img/plum.png'),
    //frame:false,
    //titleBarStyle: "hidden",
    

    webPreferences: {
        spellcheck: false,
        nodeIntegration: true,
        contextIsolation: false
      //preload: path.join(__dirname, '../dist/preload.js')
    }
  });
  mainWindow.maximize();
  
  const menu = Menu.buildFromTemplate([{
      label: 'File',
      submenu:[
        {label: 'New Instance',enabled:false,visible:false},
        // {label: 'Open Project', click(){ openProjectScreenWindow() }},//openProjectScreenWindow()
        {label: 'Open Project', accelerator: 'Ctrl+O', click(){ getFolder((selectedPath:string)=>{mainWindow.webContents.send('loadTree',selectedPath);}) }},//openProjectScreenWindow()
        {label: 'Show Project In Explorer', click(){ mainWindow.webContents.send('requestOpenProjectFolder') }},
        {label: 'Recent Projects',submenu:[],enabled:false},
        { type: 'separator' },
        {label: 'Library',submenu:[
            {label: 'Generate Global Library', click(){ generateDefaultLibrary() }},
            {label: 'Assign Global Library', click(){ getFolder((selectedPath:string)=>{mainWindow.webContents.send('loadTreeLibrary',selectedPath);}) }},
            {label: 'Open Current Library As Project', enabled:false},
        ]},
        { type: 'separator' },
        {label: 'Save Current Node', accelerator: 'Ctrl+S', click(){mainWindow.webContents.send('requestSave')}},
        {label: 'Save Current Node As', accelerator: 'Ctrl+Shift+S', enabled:false},
        { type: 'separator' },
        {label: 'Exit', click(){app.quit()}, accelerator: 'Alt+F4'},
    ]
  },{
    label: 'Edit',
    submenu:[
        { role: 'undo' },
        { role: 'redo' },
        { role: 'copy' },
        { role: 'cut' },
        { role: 'paste' },
        { type: 'separator' },
        {label: 'New Node', click(){openNewNodeWindow();}, accelerator: 'Ctrl+N'},
    ]
  },{
    label: 'View',
    submenu:[
        {label: 'Switch View', click(){mainWindow.webContents.send('switchView')}, accelerator: 'Ctrl+Space'},
        { type: 'separator' },
        {label: 'Welcome Screen', accelerator: 'Ctrl+Home', click(){mainWindow.webContents.send('requestWelcomeScreen')}},
    ]
  },{
    label: 'Help',
    submenu:[
        {
            label: 'Dev',
            visible:devMode,
            submenu:[
                {label: 'Dev Tools', click(){ mainWindow.webContents.openDevTools() }, accelerator:'Ctrl+Shift+I'},
                {label: 'AST', click(){ mainWindow.webContents.send('logAst'); }},
                {label: 'Catch errors?', id:'catchErrors', type: 'checkbox', checked: true, click:e => {
                    //const checked = menu?.getMenuItemById('catchErrors')?.checked;
                    mainWindow.webContents.send('switchCatchErrors', e.checked);
                }},

            ]
        },
        {label: 'Contact',click(){shell.openExternal('https://twitter.com/plum_notes');}},
        {label: 'About',click(){dialog.showMessageBox({message:Desc+'\nVersion: '+Version})}},
    ]
  }])
  Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
//   mainWindow.loadFile(devMode?'dist/index.html':'dist/app.html')//index.html //app.html
  mainWindow.loadFile('dist/app.html')//index.html //app.html

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('close', e => {
    mainWindow.webContents.send('closeRequest');
    e.preventDefault();
  })

}

ipcMain.on('quit', (ev,allsaved:boolean) => {
    if(allsaved){
        forceQuit();
        return;
    }
    const choice = dialog.showMessageBox(
    mainWindow,
        {
            type: 'question',
            buttons: ['No', 'Yes'],
            title: 'Confirm',
            message: 'Not all files have been saved. Close anyway?'
        }
    )
    choice.then(
        function(value) { if(value.response==1)forceQuit() },
        function(/*error*/) { forceQuit(); }
    );   
})

function forceQuit(){
    app.quit();
    mainWindow.destroy();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('openFolder', (ev,path:string) => {
    open_file_exp(path);
})

ipcMain.on('openLink', (ev, link:string) => {
    shell.openExternal(link);
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('msg', (ev,msg:string) => {
    sendMessage(msg);
})
ipcMain.on('error', (ev,msg:string) => {
    sendMessage(msg, 'error');
})
export function sendMessage(msg:string, type='none'){
    dialog.showMessageBoxSync(mainWindow,{message:msg,type:type});
}


ipcMain.on('openWelcomeScreen', (ev,projSet:boolean,libSet:boolean) => {
    openProjectScreenWindow(projSet,libSet);
})

ipcMain.on('newNode', () => {
    //dialog.showMessageBoxSync(mainWindow,{message:'+++++++++'});
    openNewNodeWindow();
})

ipcMain.on('nodeCreated', (ev,name:string,asChild:boolean) => {
    mainWindow.webContents.send('nodeCreated', name, asChild);
    newNodeWindow.close();
})
ipcMain.on('closeMiscWindows', (/*ev,arg*/) => {
    closeMiscWindows();
})
function closeMiscWindows(){
    //console.log();
    //console.log(newNodeWindow);
    if(newNodeWindow != null && !newNodeWindow.isDestroyed())
        newNodeWindow.close();
    if(welcomeWindow != null && !welcomeWindow.isDestroyed())
        welcomeWindow.close();
}

ipcMain.on('saveNode', (ev,node:{ data: string; id: string; path:string}) => {
    const existPath = fs.existsSync(node.path);
    if (!existPath){
        fs.mkdirSync(node.path, { recursive: true });
    }
    const fullPath = node.path+'/'+node.id+'.plum';
    fs.writeFile(fullPath,node.data as string,{encoding: "utf8",},(err)=>{
        if(err){
            console.log('Error creating new file:'+ err);
        }
    })
})


ipcMain.on('promptLibraryCreation', () => {
    const onCloseLibCreation = dialog.showMessageBox(mainWindow, {
        message:'Library not yet created.\n'+
        '*The library is like a global project that all other projects have access to.\n'+
        'Click Create to select a path to generate a library folder with template and utility files.\n'+
        'This can be changed later using the top menu.',
        buttons: ['Create', 'Cancel'],
        type:'question',
        title: 'Generate Library?',
    });
    onCloseLibCreation.then(
        function(value) {
            if(value.response==0){
                generateDefaultLibrary();
            }else{
                // mainWindow.webContents.send('onTryLibraryCreation',value.response);
            }
        },
        // function(/*error*/) { forceQuit(); }
    )
})
ipcMain.on('generateDefaultLibrary', (ev,libPath) => {
    generateDefaultLibrary(libPath==null?'':libPath);
});
function generateDefaultLibrary(libPath=''){
    if(libPath != ''){
        mem.generateLibrary(libPath, (path)=>{
            mainWindow.webContents.send('loadTreeLibrary',path);
        })
        return;
    }
    getFolder((selectedPath:string)=>{mem.generateLibrary(selectedPath, (path)=>{
        mainWindow.webContents.send('loadTreeLibrary',path);
    })});
}
ipcMain.on('generateHelpProject', (ev, libSet) => {
    getFolder((selectedPath:string)=>{
        if(!libSet){
            generateDefaultLibrary(selectedPath);
        }
        mem.generateHelpProject(selectedPath, (path)=>{
            mainWindow.webContents.send('loadTree',path);
            closeMiscWindows();
        })
    });
})
ipcMain.on('loadTree', (ev,projectPath) => {
    mainWindow.webContents.send('loadTree',projectPath);
})
ipcMain.on('loadTreeLibrary', (ev,data,projectPath) => {
    mainWindow.webContents.send('loadTreeLibrary',projectPath);
})
// ipcMain.on('openProjectScreenWindow',(/*ev,arg*/) => {
//     openProjectScreenWindow();
// });

ipcMain.on('getFolder',(ev,callback) => {
    getFolder((selectedPath:string)=>{ev.sender.send(callback, selectedPath);})
})

function getFolder(callback:{(selectedPath: string): void}){
    dialog.showOpenDialog({
        title: 'Select...',
        defaultPath: '/',//path.join(__dirname, '../testFiles'),
        buttonLabel: 'Select folder',
        properties: ['openDirectory']//, 'showHiddenFiles'
    }).then(file => {
        const loadCanceled = file.canceled;
        if(loadCanceled){
            console.log('Load folder canceled.');
            //callback();
            return;
        }
        const selectedPath = file.filePaths[0].toString();
        //callback(selectedPath);
        //ev.sender.send(callback, selectedPath);
        callback(selectedPath);
        return;
        //console.log('Path::::   '+filepath);
        //const data = fs.readFileSync(filepath, 'utf-8');
        //console.log(data);
        fs.readdir(selectedPath, (err, files) => {
            const data: { id: string; data: string; }[] = [];
            if (err == null){
                files.forEach(fileName => {
                if(path.extname(fileName)=='.plum'){// || path.extname(fileName)=='.plm'
                    const content = fs.readFileSync(selectedPath+'/'+fileName, 'utf-8');
                    data.push({id:path.parse(fileName).name, data:content});
                }
                })
            }
            //mainWindow.webContents.send('loadTree', data);
        })
    }).catch(err => {
        console.log(err)
        //callback();
    });
}

function openProjectScreenWindow(projSet:boolean, libSet:boolean){
    const args:string[] = [];
    if(projSet)
        args.push('projSet')
    if(libSet)
        args.push('libSet')
    if(welcomeWindow == null || welcomeWindow.isDestroyed()){
        welcomeWindow = new BrowserWindow({
            parent:mainWindow,
            modal:true,
            maximizable:false,
            frame:false,
            width:620, 
            height:540,
            // alwaysOnTop:true,
            resizable:false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                additionalArguments: args
            }
        })
    }
    welcomeWindow.loadFile('dist/projectScreen.html').then(
        function(/*value*/) {
            sendDataToWelcomeScreen(projSet,libSet)
        },
        function(error) {
            console.warn(error);
        }
    );
    // openWindow.on('focus', (ev)=>{openWindow.webContents.send('appData',projSet,libSet);})ev.sender.send
}

function sendDataToWelcomeScreen(projSet:boolean, libSet:boolean){
    welcomeWindow.webContents.send('appStoredData',projSet,libSet);
}

function openNewNodeWindow(){
    //newNodeWindow.webContents.openDevTools()
    if(newNodeWindow == null || newNodeWindow.isDestroyed()){
        newNodeWindow = new BrowserWindow({
            parent:mainWindow,
            modal:true,
            maximizable:false,
            frame:false,
            width:400, 
            height:220,
            // alwaysOnTop:true,
            resizable: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            }
        })
    }
    newNodeWindow.loadFile('dist/newNode.html')
    //win.show();
}
let newNodeWindow:BrowserWindow;
let welcomeWindow:BrowserWindow;

function open_file_exp(fpath:string) {
    let command = '';
    switch (process.platform) {
      case 'darwin':
        command = 'open -R ' + fpath;
        break;
      case 'win32':
        if (process.env.SystemRoot) {
          command = path.join(process.env.SystemRoot, 'explorer.exe');
        } else {
          command = 'explorer.exe';
        }
        command += ' /select,' + fpath;
        break;
      default:
        fpath = path.dirname(fpath)
        command = 'xdg-open ' + fpath;
    }
    console.log(command);
    execFile.exec(command, function(/*stdout:execFile.ExecException | null*/) {
    // child_process.exec(command, function(stdout) {
      //Do something if you really need to
    });
  }
  
