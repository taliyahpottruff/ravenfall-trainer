const electron = require('electron');
const {
    ipcRenderer
} = electron;

ipcRenderer.on('inGame', (event, status) => {
    var text = `<span style="color: ${(status) ? 'green' : 'red'};">${(status) ? "In Game" : "Not In Game"}</span>`;
    document.querySelector("#online-status").innerHTML = text;
});

ipcRenderer.on('training', (event, skill) => {
    document.querySelector("#training").innerHTML = skill;
});

ipcRenderer.on('setTrainCheck', (event, skill, checked) => {
    var selector = `#${skill}-check`;
    var element = document.querySelector(selector);
    element.checked = checked;
});

document.querySelector('#min-button').addEventListener('click', (e) => {
    ipcRenderer.send('minimizeWindow');
});

document.querySelector('#max-button').addEventListener('click', (e) => {
    ipcRenderer.send('maximizeWindow');
});

document.querySelector('#close-button').addEventListener('click', (e) => {
    ipcRenderer.send('quit-app');
});

document.querySelectorAll('.trcheck').forEach((value) => {
    value.addEventListener("input", (e) => {
        var value = e.target.value;
        var checked = e.target.checked;

        ipcRenderer.send('trainableChanged', value, checked);
    });
});

document.querySelectorAll('.nextTrainButton').forEach((value) => {
    value.addEventListener("click", (e) => {
        ipcRenderer.send('method-trainNext');
    });
});

nextTraining = function () {
    ipcRenderer.send('method-trainNext');
};