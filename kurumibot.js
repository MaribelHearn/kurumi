﻿/* Setup */
const MODULE_DIR = "./modules/";
const COMMAND_DIR = "./commands/";

try {
    Discord = require("discord.js");
    bot = new Discord.Client();
    allCommands = {};

    timeStamp = function () {
        return "[" + new Date().toISOString().split('T')[0] + " " + new Date().toTimeString().split(' ')[0] + "] ";
    };
} catch (err) {
	console.log(timeStamp() + err.stack + "\n" + timeStamp() + process.versions.node + "\n" + timeStamp() + "Run npm install without any having any errors occur!");
	process.exit();
}

console.log(timeStamp() + "Node version: " + process.versions.node + "\n" + timeStamp() + "Discord.js version: " + Discord.version);

var file, fileName, command, i;

/* Load Modules */
const MODULES = fs.readdirSync(MODULE_DIR).filter(file => file.endsWith(".js"));

for (file of MODULES) {
    fileName = file.replace(".js", "");

    try {
        console.log(timeStamp() + "Loading module " + file + "...");
        global[file] = require(MODULE_DIR + file);
    } catch (err) {
        console.log(timeStamp() + "An error occurred while loading " + file + ": " + err);
    }
}

globals.define();
console.log(timeStamp() + "Modules loaded.");

/* Load Commands */
const COMMAND_FILES = fs.readdirSync(COMMAND_DIR).filter(file => file.endsWith(".js"));

for (file of COMMAND_FILES) {
    commands = require(COMMAND_DIR + file);
    fileName = file.replace(".js", "");

    try {
        console.log(timeStamp() + "Loading command file " + file + "...");
        allCommands[fileName] = commands;
    } catch (err) {
        console.log(timeStamp() + "An error occurred while loading " + file + ": " + err);
    }
}

console.log(timeStamp() + "Commands loaded.");

/* Load Data */
if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
}

if (!fs.existsSync("images")) {
    fs.mkdirSync("images");
}

if (!fs.existsSync("music")) {
    fs.mkdirSync("music");
}

for (i in permData) {
    try {
        if (fs.existsSync("data/" + i + ".txt")) {
            // console.log(timeStamp() + "Reading " + i + ".txt...");
            permData[i] = fs.readFileSync("data/" + i + ".txt");
            permData[i] = String(permData[i]).replace(/^\uFEFF/, "");
            permData[i] = JSON.parse(permData[i]);
        } else if (i != "serverData") {
            fs.writeFileSync("data/" + i + ".txt", JSON.stringify(permData[i]));
            console.log(timeStamp() + "Data file " + i + ".txt created.");
        }
    } catch (err) {
        console.log(timeStamp() + "An error occurred while loading the " + i + " data file: " + err);
    }
}

console.log(timeStamp() + "Data loaded.");
enabled = true;

/* Login */
if (permData.token === "") {
    console.log(timeStamp() + "Please put your token into the token.txt data file, and make sure it is in quotes!");
	process.exit();
} else {
    bot.login(permData.token).then(console.log(timeStamp() + "Logged in!")).catch(console.error);
}

/* Events */
bot.on("ready", function () {
    if (!permData) {
        console.log("Something went horribly wrong here...");
        bot.destroy();
    }

    var serversArray = bot.guilds.cache.array(), id, filename;

    for (var k in serversArray) {
        serversArray[k].members.fetch();
        id = serversArray[k].id;

        if (!serverData[id]) {
            serverData[id] = {};
        }

        for (var l in SERVER_DATA_DEFAULTS) {
            filename = "data/" + id;

            if (!fs.existsSync(filename)) {
                fs.mkdirSync(filename);
            }

            filename += "/" + l + ".txt";

            if (!fs.existsSync(filename)) {
                fs.writeFileSync(filename, JSON.stringify(SERVER_DATA_DEFAULTS[l]));
                console.log(timeStamp() + serversArray[k].name + " specific data file " + l + ".txt created.");
            } else {
                // console.log(timeStamp() + "Reading the " + serversArray[k].name + " " + l + ".txt...");
                serverData[id][l] = fs.readFileSync(filename);
                serverData[id][l] = String(serverData[id][l]).replace(/^\uFEFF/, "");
                serverData[id][l] = JSON.parse(serverData[id][l]);
            }
        }
    }

    console.log(timeStamp() + "Server specific data loaded.");
});

bot.on("disconnect", function () {
	process.exit();
});

bot.on("warn", function (warning) {
    console.log("Warning:", warning);
});

bot.on("error", function (error) {
    console.log("Error:", error);
});

bot.on("guildCreate", function (server) {
    var id = server.id, file;

    var filename = "data/" + id;

    fs.mkdirSync(filename);
    serverData[id] = {};

    for (file in SERVER_DATA_DEFAULTS) {
        serverData[id][file] = SERVER_DATA_DEFAULTS[file];
        filename = "data/" + id + "/" + file + ".txt";
        fs.writeFileSync(filename, JSON.stringify(SERVER_DATA_DEFAULTS[file]));
        console.log(timeStamp() + server.name + " specific data file " + file + ".txt created.");
    }

    console.log(timeStamp() + "Joined " + server.name + "!");
});

bot.on("guildDelete", function (server) {
    var path = "data/" + server.id, file;

    for (file in SERVER_DATA_DEFAULTS) {;
        filename = "data/" + server.id + "/" + file + ".txt";
        fs.unlinkSync(filename);
        console.log(timeStamp() + server.name + " specific data file " + file + ".txt deleted.");
    }

    delete serverData[server.id];

    fs.rmdirSync(path);
    console.log(timeStamp() + "Left " + server.name + " and deleted its data folder.");
});

bot.on("guildMemberAdd", function (user) {
    var server = user.guild;

    var logChannel = serverData[server.id].logChannel;

    if (logChannel) {
        server.channels.get(logChannel).send(serverData[server.id].entryMessage.replace("%u", "**" + user.user.username + "**")).catch(console.error);
    }
});

bot.on("guildMemberRemove", function (user) {
    var server = user.guild;

    var logChannel = serverData[server.id].logChannel;

    if (logChannel) {
        server.channels.get(logChannel).send(serverData[server.id].leaveMessage.replace("%u", "**" + user.user.username + "**")).catch(console.error);
    }

    if (serverData[server.id].aliasesList[user.id]) {
        delete serverData[server.id].aliasesList[user.id];
    }

    if (serverData[server.id].waifus[user.id]) {
        delete serverData[server.id].waifus[user.id];
    }

    if (serverData[server.id].touhouWaifus[user.id]) {
        delete serverData[server.id].touhouWaifus[user.id];
    }

    if (serverData[server.id].fanmemeWaifus[user.id]) {
        delete serverData[server.id].fanmemeWaifus[user.id];
    }

    if (serverData[server.id].lenenWaifus[user.id]) {
        delete serverData[server.id].lenenWaifus[user.id];
    }
});

bot.on("message", function (message) {
    handlers.messageHandler(message);
});

bot.on("messageUpdate", function (oldMessage, newMessage) {
    handlers.messageHandler(newMessage);
});
