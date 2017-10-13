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

/* JavaScript Native Object Additions */
String.prototype.contains = function (string) {
    return this.indexOf(string) > -1;
};

String.prototype.replaceAt = function (index, character) {
    return this.substr(0, index) + character + this.substr(index + 1);
};

String.prototype.detect = function (string) {
    var letters = this.replace(/[^a-zA-Z]/g, "");
    
    return this == string || this.contains(" " + string + " ") || this.substring(0, string.length + 1) == string + " " || letters.substring(letters.length - string.length - 1, letters.length) == " " + string;
};

Object.defineProperty(Array.prototype, "contains", {
    configurable: true,
    enumerable: false,
    value: function (value) {
        return this.indexOf(value) > -1;
    }
});

Object.defineProperty(Array.prototype, "concatStrict", {
    configurable: true,
    enumerable: false,
    value: function (array) {
        for (var i in array) {
            if (!this.contains(array[i])) {
                this.push(array[i]);
            }
        }
        
        return this;
    }
});

Object.defineProperty(Array.prototype, "remove", {
    configurable: true,
    enumerable: false,
    value: function (value) {
        return this.splice(this.indexOf(value), 1);
    }
});

Object.defineProperty(Array.prototype, "rand", {
    configurable: true,
    enumerable: false,
    value: function () {
        return this[Math.floor(Math.random() * this.length)];
    }
});

Object.defineProperty(Array.prototype, "shuffle", {
    configurable: true,
    enumerable: false,
    value: function () {
        for (var i = this.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = this[i];
            this[i] = this[j];
            this[j] = temp;
        }
        
        return this;
    }
});

Object.defineProperty(Object.prototype, "isEmpty", {
    configurable: true,
    enumerable: false,
    value: function () {
        return Object.keys(this).length === 0 && this.constructor === Object;
    }
});

/* Load Modules And Data */
MODULES = ["globals", "handlers", "helpcmds", "funcmds", "utilitycmds", "modcmds", "mastercmds"];
allCommands = {};

for (var i in MODULES) {
    var module = MODULES[i];
    
    try {
        console.log(timeStamp() + "Evaluating module " + module + ".js...");
        
        module.contains("cmds") ? allCommands[module.replace("cmds", "")] = require("./" + module + ".js") : global[module] = require("./" + module + ".js");
    } catch (err) {
        console.log(timeStamp() + "An error occurred while loading the " + module + " module: " + err);
    }
}

globals.define();
console.log(timeStamp() + "Modules loaded.");

if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
}

if (!fs.existsSync("./images")) {
    fs.mkdirSync("./images");
}

if (!fs.existsSync("./music")) {
    fs.mkdirSync("./music");
}

for (var j in permData) {
    try {
        if (fs.existsSync("./data/" + j + ".txt")) {
            console.log(timeStamp() + "Reading " + j + ".txt...");
            permData[j] = fs.readFileSync("./data/" + j + ".txt");
            permData[j] = String(permData[j]).replace(/^\uFEFF/, "");
            permData[j] = JSON.parse(permData[j]);
        } else if (j != "serverData") {
            fs.writeFileSync("./data/" + j + ".txt", JSON.stringify(permData[j]));
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
    console.log(timeStamp() + "Logged in!");
    
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
            filename = "./data/" + id;
            
            if (!fs.existsSync(filename)) {
                fs.mkdirSync(filename);
            }
            
            filename += "/" + l + ".txt";
            
            if (!fs.existsSync(filename)) {
                fs.writeFileSync(filename, JSON.stringify(SERVER_DATA_DEFAULTS[l]));
                console.log(timeStamp() + serversArray[k].name + " specific data file " + l + ".txt created.");
            } else {
                console.log(timeStamp() + "Reading the " + serversArray[k].name + " " + l + ".txt...");
                serverData[id][l] = fs.readFileSync(filename);
                serverData[id][l] = String(serverData[id][l]).replace(/^\uFEFF/, "");
                serverData[id][l] = JSON.parse(serverData[id][l]);
            }
        }
    }
    
    console.log(timeStamp() + "Server specific data loaded.");
});

bot.on("disconnected", function () {
	console.log(timeStamp() + "Disconnected!");
	process.exit();
});

bot.on("warn", function (warning) {
    for (var id in servers) {
        if (servers[id].isTestingServer) {
            bot.guilds.get(id).defaultchannel.send(warning);
        }
    }
});

bot.on("error", function (error) {
    for (var id in servers) {
        if (servers[id].isTestingServer) {
            bot.guilds.get(id).defaultchannel.send(error);
        }
    }
});

bot.on("guildCreate", function (server) {
    var servers = permData.servers, id = server.id, file;
    
    servers[id] = {};
    
    for (value in SERVER_SPECIFICS) {
        servers[id][value] = SERVER_SPECIFICS[value];
    }
    
    var filename = "./data/" + id;
    
    fs.mkdirSync(filename);
    serverData[id] = {};
    
    for (file in SERVER_DATA_DEFAULTS) {
        serverData[id][file] = SERVER_DATA_DEFAULTS[file];
        filename = "./data/" + id + "/" + file + ".txt";
        fs.writeFileSync(filename, JSON.stringify(SERVER_DATA_DEFAULTS[file]));
        console.log(timeStamp() + server.name + " specific data file " + file + ".txt created.");
    }
    
    save("servers");
    console.log(timeStamp() + "Joined " + server.name + "!");
});

bot.on("guildDelete", function (server) {
    var servers = permData.servers, path = "./data/" + server.id, file;
    
    delete servers[server.id];
    delete serverData[server.id];
    
    save("servers");
    
    console.log(timeStamp() + "Left " + server.name + "!");
});

bot.on("guildMemberAdd", function (user) {
    var server = user.guild, servers = permData.servers;
    
    var logChannel = servers[server.id].logChannel;
    
    if (logChannel) {
        server.channels.get(logChannel).send(servers[server.id].entryMessage.replace("%u", "**" + user.user.username + "**"));
    }
});

bot.on("guildMemberRemove", function (user) {
    var server = user.guild, servers = permData.servers;
    
    var logChannel = servers[server.id].logChannel;
    
    if (logChannel) {
        server.channels.get(logChannel).send(servers[server.id].leaveMessage.replace("%u", "**" + user.user.username + "**"));
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
    bot.login(permData.token);
}