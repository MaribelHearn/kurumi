/* Setup */
try {
    timeStamp = function () {
        return "[" + new Date().toTimeString().split(' ')[0] + "] ";
    };

    Discord = require("discord.js");
    bot = new Discord.Client();
} catch (err) {
	console.log(timeStamp() + err.stack + "\n" + timeStamp() + process.versions.node + "\n" + timeStamp() + "Run npm install without any having any errors occur!");
	process.exit();
}

console.log(timeStamp() + "Node version: " + process.versions.node + "\n" + timeStamp() + "Discord.js version: " + Discord.version);

/* Load Modules And Data */
MODULES = ["generator", "globals", "handlers", "helpcmds", "funcmds", "utilitycmds", "modcmds", "mastercmds"];
allCommands = {};

for (var i in MODULES) {
    var module = MODULES[i];

    try {
        console.log(timeStamp() + "Evaluating module " + module + ".js...");

        module.indexOf("cmds") > -1 ? allCommands[module.replace("cmds", "")] = require("./" + module + ".js") : global[module] = require("./" + module + ".js");
    } catch (err) {
        console.log(timeStamp() + "An error occurred while loading the " + module + " module: " + err);
    }
}

globals.define();
console.log(timeStamp() + "Modules loaded.");

if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
}

if (!fs.existsSync("images")) {
    fs.mkdirSync("images");
}

if (!fs.existsSync("music")) {
    fs.mkdirSync("music");
}

for (var j in permData) {
    try {
        if (fs.existsSync("data/" + j + ".txt")) {
            // console.log(timeStamp() + "Reading " + j + ".txt...");
            permData[j] = fs.readFileSync("data/" + j + ".txt");
            permData[j] = String(permData[j]).replace(/^\uFEFF/, "");
            permData[j] = JSON.parse(permData[j]);
        } else if (j != "serverData") {
            fs.writeFileSync("data/" + j + ".txt", JSON.stringify(permData[j]));
            console.log(timeStamp() + "Data file " + j + ".txt created.");
        }
    } catch (err) {
        console.log(timeStamp() + "An error occurred while loading the " + j + " data file: " + err);
    }
}

console.log(timeStamp() + "Permanent data loaded.");
enabled = true;

/* Events */
bot.on("ready", function () {
    if (!permData) {
        console.log("Something went horribly wrong here...");
        bot.destroy();
    }

    var serversArray = bot.guilds.array(), servers = permData.servers, id, filename;

    for (var k in serversArray) {
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
    var servers = permData.servers, id = server.id, file;

    servers[id] = {};

    for (value in SERVER_SPECIFICS) {
        servers[id][value] = SERVER_SPECIFICS[value];
    }

    var filename = "data/" + id;

    fs.mkdirSync(filename);
    serverData[id] = {};

    for (file in SERVER_DATA_DEFAULTS) {
        serverData[id][file] = SERVER_DATA_DEFAULTS[file];
        filename = "data/" + id + "/" + file + ".txt";
        fs.writeFileSync(filename, JSON.stringify(SERVER_DATA_DEFAULTS[file]));
        console.log(timeStamp() + server.name + " specific data file " + file + ".txt created.");
    }

    save("servers");
    console.log(timeStamp() + "Joined " + server.name + "!");
});

bot.on("guildDelete", function (server) {
    var servers = permData.servers, path = "data/" + server.id, file;

    delete servers[server.id];
    delete serverData[server.id];

    save("servers");

    console.log(timeStamp() + "Left " + server.name + "!");
});

bot.on("guildMemberAdd", function (user) {
    var server = user.guild, servers = permData.servers;

    var logChannel = servers[server.id].logChannel;

    if (logChannel) {
        server.channels.get(logChannel).send(servers[server.id].entryMessage.replace("%u", "**" + user.user.username + "**")).catch(console.error);
    }
});

bot.on("guildMemberRemove", function (user) {
    var server = user.guild, servers = permData.servers;

    var logChannel = servers[server.id].logChannel;

    if (logChannel) {
        server.channels.get(logChannel).send(servers[server.id].leaveMessage.replace("%u", "**" + user.user.username + "**")).catch(console.error);
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

if (permData.token === "") {
    console.log(timeStamp() + "Please put your token into the token.txt data file, and make sure it is in quotes!");
	process.exit();
} else {
    bot.login(permData.token).then(console.log(timeStamp() + "Logged in!")).catch(console.error);
}
