# Ravenfall Trainer
This is a auto-trainer tool for Ravenfall by Zerratar.

## Requirements
This bot requires NodeJS. Be sure to install that first if you haven't already. A dependency free build is not yet available.

## How To Use
First you'll need to clone the repository. If you have git installed you can type the following into the command-line:
```
git clone https://github.com/TrentonPottruff/ravenfall-trainer.git
```
Otherwise you can download a zip of the repo in the top right if you click the `Clone or download` button.

Next you'll need to create a `config.json` file and fill it with the follow information (Note: replace the descriptions with the relevant data:
```JSON
{
    "username": "Your Twitch username in all lower-case",
    "oauth": "You oauth code which you can find at twitchapps.com/tmi",
    "channels": [
        "#twitch-channel-to-join"
    ],
    "defaultSkill": "atk, def, str, crafting, fishing, etc."
}
```
An example of valid data below (Note: this is an example and it won't validate properly with Twitch's servers):
```JSON
{
    "username": "twitchuser123"
    "oauth": "oauth:asd8443jdfh347ejhds73wh9da8"
    "channels": [
        "#zerratar
    ],
    "defaultSkill": "crafting"
}
```
