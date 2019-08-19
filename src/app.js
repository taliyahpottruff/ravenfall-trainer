const tmi = require("tmi.js");
const config = require('../config.json');

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

let client = new tmi.client(options);
var inGame = false;
var raiding = false;
var kicker = '';
var joinTimeout = false;
var canKick = true;

var loop;

client.on('message', (channel, userstate, message, self) => {
    if (self) {
        return;
    }

    //Detect Game Restarts
    if (message.includes(`${channel.replace('#', '').toLowerCase()}, Welcome to the game`) && !joinTimeout) {
        client.say(channel, '!join');
        setJoinTimeout();
    }

    //Catch my messages
    if (userstate.username == config.username) {
        if (message.startsWith('!train') && !inGame) {
            console.log("I'm already in the game apparently");
            trainLoop(channel, userstate, message, self, false);
        } else if (message.startsWith('!raid')) {
            raiding = true;
        }
        return;
    }

    //Special join instructions
    if (message == (config.username + ", Welcome to the game!")) {
        if (userstate.username == 'zerrabot') {
            trainLoop(channel, userstate, message, self, true);
            setJoinTimeout();
        } else {
            var troller = userstate.username;
            var trollRes = ['really? PMSTwin', 'Nice try @%user% zerrat1LUL', '@%user% two can play that game LUL', 'PogChamp PogChamp', 'PMSTwin', 'ugh trentoTriggered'];
            setTimeout(function() {
                client.say(channel, trollRes[Math.floor(Math.random() * trollRes.length)].replace('%user%', troller));
                setTimeout(function() {
                    client.say(channel, `!kick ${troller}`);
                }, Math.floor(Math.random() * 4000) + 1000);
            }, Math.floor(Math.random() * 4000) + 1000);
        }
        return;
    } else if (message == `${config.username}, Join failed. Reason: You're already playing!`) {
        trainLoop(channel, userstate, message, self, false);
        setJoinTimeout();
        return;
    }

    //Catch kicks
    if (message.startsWith(`!kick ${config.username}`)) {
        kicker = userstate.username;
    }

    if (userstate.username == 'zerrabot') { //Only if zerrabot says things
        if (message.includes(`${config.username} was kicked from the game`)) {
            if (canKick) {
                client.say(channel, 'Rude PMSTwin');
                setTimeout(function() {
                    client.say(channel, `!kick ${kicker}`);
                    setTimeout(function() {
                        client.say(channel, '!join');
                    }, Math.floor(Math.random() * 4000) + 2000);
                }, 1500);
                canKick = false;
                setTimeout(function(){
                    canKick = true;
                }, 10000);
            } else {
                client.say(channel, `@${kicker} Can we not have a kick war? Kthxbye`);
            }
        }
        
        if (message.includes('zerratar was kicked from the game')) {
            setJoinTimeout();
        }

        if (message.includes('raid boss has appeared')) {
            setTimeout(function() {
                client.say(channel, '!raid');
            }, Math.floor(Math.random() * 5000) + 1000);
        }

        if (message.includes("Welcome to the game!") && !inGame && !joinTimeout) {
            client.say(channel, "!join");
            trainLoop();
        }

        if (message.startsWith(`${config.username}, A duel request received from`)) {
            client.say(channel, "!duel accept");
        }

        if (message.includes('Ravenfall has not started.') && inGame) {
            console.log('RavenFall is not running! Stopping train loop...');
            inGame = false;
            clearInterval(loop);
        }
    }
});

var trains = ['def', 'atk', 'str'];
var curTrain = 0;

trainLoop = function(channel, userstate, message, self, initTrain) {
    inGame = true;
    if (initTrain) client.say(channel, `!train ${config.defaultSkill}`);
    if (loop) clearInterval(loop);
    loop = setInterval(function() {
        var random = Math.floor(Math.random() * trains.length);
        if (!raiding) client.say(channel, `!train ${trains[random]}`);
        raiding = false;
    }, 1000 * 1000);
}

setJoinTimeout = () => {
    joinTimeout = true;
    setInterval(function() {
        joinTimeout = false;
    }, 1000 * 60 * 2);
};

//Finally, connect to server
client.connect();