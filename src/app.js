const tmi = require("tmi.js");
const pb = require('@madelsberger/pausebuffer');
const fs = require('fs');
var config = JSON.parse(fs.readFileSync(process.cwd() + "/config.json", 'utf8'));
const request = require("request");
const base64url = require("base64-url");
const {
  app,
  BrowserWindow,
  ipcMain
} = require("electron");
var sanitize = require('sanitize-html');
var Url = require('url-parse');

//Set options
let options = {
  options: {
    debug: true
  },
  connection: {
    reconnect: true,
    secure: true
  },
  identity: {
    username: config.username,
    password: config.oauth
  },
  channels: config.channels
};

app.on('ready', () => {
  //Setup dashboard window
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    show: false,
    autoHideMenuBar: true
  });

  win.loadFile('./src/pages/dashboard.html');
  //win.webContents.openDevTools();

  //Get a token
  var tokenReqBody = {
    username: config.username,
    password: ""
  };
  request({
      method: "POST",
      url: "https://www.ravenfall.stream/api/auth",
      body: tokenReqBody,
      json: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    },
    (error, response, body) => {
      if (error) {
        console.log(error);
      } else {
        console.log(body);
        var tokenObj = body;

        /*request({method: 'GET', uri: 'https://www.ravenfall.stream/api/players/28430435', json: true, headers: {'Accept': 'application/json', 'Content-Type': 'application/json', 'auth-token': }}, (err, res, body) => {
              if (err) {
                  console.log(err);
              } else {
                  console.log(body);
              }
          });*/

        let client = pb.wrap(new tmi.client(options));
        var inGame = false;
        var raiding = false;
        var kicker = "";
        var joinTimeout = false;
        var canKick = true;
        var data = {
          training: ""
        };
        var authToken = '';

        try {
          authToken = Buffer.from(JSON.stringify(tokenObj)).toString("base64");
        } catch (err) {
          console.log(`ERROR: ${err}`);
        }

        var loop;

        client.on("message", (channel, userstate, message, self) => {
          if (self) {
            return;
          }

          //Catch my messages
          if (userstate.username == config.username) {
            if (message.startsWith("!train") && !inGame) {
              console.log("I'm already in the game apparently");
              trainLoop(channel, userstate, message, self, false, false);
            } else if (message.startsWith("!raid")) {
              raiding = true;
            }
            return;
          }

          //Special join instructions
          if (message == config.username + ", Welcome to the game!") {
            if (userstate.username == config.bot) {
              trainLoop(channel, userstate, message, self, true, false);
              setJoinTimeout();
            } else {
              var troller = userstate.username;
              var trollRes = [
                "really? PMSTwin",
                "Nice try @%user% zerrat1LUL",
                "@%user% two can play that game LUL",
                "PogChamp PogChamp",
                "PMSTwin",
                "ugh trentoTriggered"
              ];
              setTimeout(function () {
                client.say(
                  channel,
                  trollRes[Math.floor(Math.random() * trollRes.length)].replace(
                    "%user%",
                    troller
                  )
                );
                setTimeout(function () {
                  client.say(channel, `!kick ${troller}`);
                }, Math.floor(Math.random() * 4000) + 1000);
              }, Math.floor(Math.random() * 4000) + 1000);
            }
            return;
          } else if (message == `${config.username}, Join failed. Reason: You're already playing!`) {
            trainLoop(channel, userstate, message, self, false, false);
            setJoinTimeout();
            return;
          }

          //Detect Game Restarts
          if (message.includes(`${channel.replace("#", "").toLowerCase()}, Welcome to the game`) && !joinTimeout) {
            client.say(channel, "!join");
            setJoinTimeout();
          }

          //Catch kicks
          if (message.startsWith(`!kick ${config.username}`)) {
            kicker = userstate.username;
          }

          if (userstate.username == config.bot) {
            //Only if zerrabot says things
            if (message.includes(`${config.username} was kicked from the game`)) {
              if (canKick) {
                client.say(channel, "Rude PMSTwin");
                setTimeout(function () {
                  client.say(channel, `!kick ${kicker}`);
                  setTimeout(function () {
                    client.say(channel, "!join");
                  }, Math.floor(Math.random() * 4000) + 2000);
                }, 1500);
                canKick = false;
                setTimeout(function () {
                  canKick = true;
                }, 10000);
              } else {
                client.say(
                  channel,
                  `@${kicker} Can we not have a kick war? Kthxbye`
                );
              }
            }

            if (message.includes("zerratar was kicked from the game")) {
              setJoinTimeout();
            }

            if (message.includes("raid boss has appeared")) {
              setTimeout(function () {
                client.say(channel, "!raid");
              }, Math.floor(Math.random() * 5000) + 1000);
            }

            if (
              message.startsWith(
                `${config.username}, A duel request received from`
              )
            ) {
              client.say(channel, "!duel accept");
            }

            if (message.includes("Ravenfall has not started.") && inGame) {
              console.log("RavenFall is not running! Stopping train loop...");
              inGame = false;
              clearInterval(loop);
            }
          }
        });

        var trains = [
          "def",
          "atk",
          "str",
          "crafting",
          "mining",
          "woodcutting",
          "fishing",
          "farming"
        ];
        var curTrain = 0;

        trainLoop = function (channel, userstate, message, self, initTrain, randTrain) {
          win.webContents.send('inGame', true);
          inGame = true;
          var random = Math.floor(Math.random() * config.trains.length);
          if (initTrain) {
            client.say(channel, `!train ${config.defaultSkill}`);
            data.training = config.defaultSkill;
          }
          if (randTrain) {
            var toTrain = config.trains[random];
            client.say(channel, `!train ${toTrain}`);
            data.training = toTrain;
          }
          if (loop) clearInterval(loop);
          loop = setInterval(function () {
            if (!raiding) {
              var toTrain = config.trains[random];
              client.say(channel, `!train ${toTrain}`);
              data.training = toTrain;
            }
            raiding = false;
          }, 1000 * 1000);
          win.webContents.send('training', data.training);
        };

        setJoinTimeout = () => {
          joinTimeout = true;
          setInterval(function () {
            joinTimeout = false;
          }, 1000 * 60 * 2);
        };

        //IPC Messages
        ipcMain.on('method-trainNext', (event) => {
          console.log("* Training next skill!");
          trainLoop(config.channels[0], "", "", "", false, true);
          console.log(config.trains + ", " + data.training);
          win.webContents.send('training', data.training);
        });
        ipcMain.on('trainableChanged', (event, skill, value) => {
          var changeMade = false;
          if (value) {
            if (!config.trains.includes(skill)) {
              config.trains.push(skill);
              changeMade = true;
            }
          } else {
            if (config.trains.includes(skill)) {
              var index = config.trains.indexOf(skill);
              config.trains.splice(index, 1);
              changeMade = true;
            }
          }

          if (changeMade) {
            fs.writeFile(process.cwd() + '/config.json', JSON.stringify(config), (err) => {
              if (err) {
                console.log(err);
              }
            });
          }
        });

        config.trains.forEach((value) => {
          win.webContents.send('setTrainCheck', value, true);
        });

        //Connect
        client.connect().then(() => {
          win.show();
        }).catch(error => {
          loginWinFunc(win);
        });
      }
    }
  );
});


loginWinFunc = function (win) {
  let loginWin = new BrowserWindow({
    width: 887,
    height: 556,
    webPreferences: {
      nodeIntegration: true
    },
    center: true,
    autoHideMenuBar: true,
    fullscreenable: false,
    maximizable: false,
    autoHideMenuBar: true,
    resizable: false,
    show: false
  });

  loginWin.once('ready-to-show', () => {
    loginWin.show();
  });

  loginWin.once('close', () => {
    app.quit();
  });
  loginWin.webContents.once("will-redirect", function (e, url, isInPlace, isMainFrame, procId, routId) {
    var urlObj = new Url(url);
    //Check to see if it's a token
    if (urlObj.hostname == 'localhost') {
      e.preventDefault();
      var hash = urlObj.hash;
      hash = hash.replace('#', '');
      var hashes = hash.split('&');
      for (var i = 0; i < hashes.length; i++) {
        if (hashes[i].startsWith('access_token')) {
          var token = hashes[i].split('=')[1];
          console.log(token);
          //JSON.parse(require('fs').readFileSync(process.cwd() + "/config.json", 'utf8'));
          config.oauth = `oauth:${token}`;
          fs.writeFile(process.cwd() + '/config.json', JSON.stringify(config), (err) => {
            if (err) {
              console.log(`AN ERROR OCCURED WITH SAVING: ${err}`);
            }
          });

          //Grab client info from Twitch
          request('https://id.twitch.tv/oauth2/validate', {
            headers: {
              'Authorization': `OAuth ${token}`
            }
          }, (err, resp, body) => {
            if (err) {
              console.log(err);
              return;
            }
            console.log(body);

            options.identity.password = config.oauth;
            client = pb.wrap(new tmi.client(options));
            client.connect().then(() => {
              console.log("Success!");
              win.show();
              loginWin.destroy();
            }).catch((reason) => {
              console.log(`Failure: ${reason}`);
              loginWinFunc();
              loginWin.destroy();
            });
          });
        }
      }
    }
  });

  loginWin.loadFile("./src/pages/loginForm.html");
}

clean = (input) => {
  return sanitize(input, {
    allowedTags: [],
    allowedAttributes: {
      'a': []
    },
    allowedIframeHostnames: []
  });
}