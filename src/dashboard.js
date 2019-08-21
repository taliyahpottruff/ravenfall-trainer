const electron = require('electron');
const {ipcRenderer} = electron;

ipcRenderer.on('inGame', (event, status) => {
    var text = `<span style="color: ${(status) ? 'green' : 'red'};">${(status) ? "In Game" : "Not In Game"}</span>`;
    document.querySelector("#online-status").innerHTML = text;
});

ipcRenderer.on('training', (event, skill) => {
    document.querySelector("#training").innerHTML = skill;
});

nextTraining = function() {
    ipcRenderer.send('method-trainNext');
};