# Ravenfall Trainer
This is a auto-trainer tool for Ravenfall by Zerratar.

## How To Use
### Recommended
It is recommended you download the latest release from the **Releases** tab.

### Optional
If you want to build the program yourself you can follow the instructions below (Note: NodeJS is required to be installed on your computer):
First you'll need to clone the repository. If you have git installed you can type the following into the command-line:
```
git clone https://github.com/TrentonPottruff/ravenfall-trainer.git
```
Otherwise you can download a zip of the repo in the top right if you click the `Clone or download` button.

### Required Configuration
Next you'll need to create or edit the `config.json` file and fill it with the follow information (Note: replace the descriptions with the relevant data:
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
    "username": "twitchuser123",
    "oauth": "oauth:asd8443jdfh347ejhds73wh9da8",
    "channels": [
        "#zerratar"
    ],
    "defaultSkill": "crafting"
}
```
