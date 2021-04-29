﻿module.exports = {
    eval: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <code>`: evaluates `code` and posts the result, unless the code already sends a bot message.";
        },

        command: function (message, server, command, channel) {
            var code = command[1];

            if (!code) {
                channel.send(message.author.username + ", please specify code to evaluate.");
                return;
            }

            if (removeSpaces(code) != code) {
                channel.send("Evaluating the following code:").catch(console.error);
                channel.send(code, {"code": "JavaScript"}).catch(console.error);
            }

            try {
                if (code.contains("channel.")) {
                    eval(code);
                } else {
                    var result = eval(code);

                    channel.send("Evaluation result: " + result).catch(console.error);
                }
            } catch (err) {
                channel.send("An error occurred: " + err).catch(console.error);
            }
        }
    },

    update: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: updates the script modules and reloads the data files.";
        },

        loadModule: function (error, response, body) {
            if (!error && response.statusCode == 200) {
                fs.writeFileSync(scriptModule + ".js", body);
                console.log(timeStamp() + "Evaluating module " + scriptModule + ".js...");

                delete require.cache[process.cwd() + (os.type() == "Windows_NT" ? "\\" : '/') + scriptModule + ".js"];

                module.contains("cmds") ? allCommands[module.replace("cmds", "")] = require("./" + scriptModule + ".js") : global[scriptModule] = require("./" + scriptModule + ".js");

                if (scriptModule == "globals") {
                    globals.define();
                }
            } else {
                channel.send("An error occurred while downloading the `" + scriptModule +
                "` module: " + error + ", status code " + response.statusCode).catch(console.error);
            }
        },

        command: function (message, server, command, channel) {
            var scriptModule, i, j, k;

            for (i in MODULES) {
                scriptModule = MODULES[i];

                try {
                    console.log(timeStamp() + "Downloading module " + scriptModule + ".js...");

                    request(SCRIPT_BASE_URL + scriptModule + ".js", loadModule);
                } catch (err) {
                    channel.send("An error occurred while loading the `" + scriptModule + "` module: " + err).catch(console.error);
                    return;
                }
            }

            console.log(timeStamp() + "Modules loaded.");

            for (j in permData) {
                try {
                    if (fs.existsSync("data/" + j + ".txt")) {
                        permData[j] = fs.readFileSync("data/" + j + ".txt");
                        permData[j] = String(permData[j]).replace(/^\uFEFF/, "");
                        permData[j] = JSON.parse(permData[j]);
                    } else {
                        fs.writeFileSync("data/" + j + ".txt", JSON.stringify(permData[j]));
                        console.log(timeStamp() + "Data file " + j + ".txt created.");
                    }
                } catch (err) {
                    channel.send("An error occurred with the `" + j + "` data file: " + err).catch(console.error);
                    return;
                }
            }

            console.log(timeStamp() + "Permanent data loaded.");

            var serversArray = bot.guilds.cache.array(), id, filename;

            for (k in serversArray) {
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
                        fs.writeFileSync(filename, SERVER_DATA_DEFAULTS[l]);
                        console.log(timeStamp() + serversArray[k].name + " specific data file " + l + ".txt created.");
                    } else {
                        serverData[id][l] = fs.readFileSync(filename);
                        serverData[id][l] = String(serverData[id][l]).replace(/^\uFEFF/, "");
                        serverData[id][l] = JSON.parse(serverData[id][l]);
                    }
                }
            }

            console.log(timeStamp() + "Server specific data loaded.");
            channel.send("The script modules have been updated!").catch(console.error);
        }
    },

    data: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: posts the current server specific script data.";
        },

        command: function (message, server, command, channel) {
            var dataMessage = "", data = serverData[server.id];

            for (var file in data) {
                dataMessage += "`" + file + "`: ";

                if (typeof data[file] == "object") {
                    dataMessage += JSON.stringify(data[file]) + "\n";
                } else {
                    dataMessage += data[file] + "\n";
                }
            }

            if (dataMessage.length > 2000) {
                dataMessage = dataMessage.substr(0, 1996) + "...";
            }

            channel.send(dataMessage).catch(console.error);
        }
    },

    toggletesting: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: toggles whether this server is a testing server or not.";
        },

        command: function (message, server, command, channel) {
            serverData[server.id].isTestingServer = !serverData[server.id].isTestingServer;
            save("isTestingServer", server);
            channel.send("This server is " + (serverData[server.id].isTestingServer ? "now" : "no longer") + " a testing server.").catch(console.error);
        }
    },

    togglemaintenance: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: toggles maintenance mode. This will disable commands outside of testing servers.";
        },

        command: function (message, server, command, channel) {
            permData.maintenanceMode = !permData.maintenanceMode;
            save("maintenanceMode");
            channel.send("Maintenance mode has been " + (permData.maintenanceMode ? "en" : "dis") + "abled.").catch(console.error);
        }
    },

    addbotchannel: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <channel>`: makes `channel` a bot channel.";
        },

        command: function (message, server, command, channel) {
            var botChannel = command[1], resolve;

            if (!botChannel) {
                channel.send(message.author.username + ", please specify a channel.").catch(console.error);
                return;
            }

            resolve = server.channels.cache.find(chan => chan.name == botChannel.toLowerCase());

            if (!resolve || resolve.type != "text") {
                channel.send(message.author.username + ", that is not a channel!").catch(console.error);
                return;
            }

            botChannel = resolve.id;

            if (serverData[server.id].botChannels.length === 0) {
                channel.send("Bot commands have been restricted to " + resolve.name + "!").catch(console.error);
            } else {
                channel.send(resolve.name + " is now a bot channel!").catch(console.error);
            }

            serverData[server.id].botChannels.push(botChannel);
            save("botChannels", server);
        }
    },

    removebotchannel: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <channel>`: removes `channel` from the bot channels.";
        },

        command: function (message, server, command, channel) {
            var botChannel = command[1];

            if (!botChannel) {
                channel.send(message.author.username + ", please specify a channel.").catch(console.error);
                return;
            }

            resolve = server.channels.cache.find(chan => chan.name == botChannel.toLowerCase());

            if (!resolve || resolve.type != "text") {
                channel.send(message.author.username + ", that is not a channel!").catch(console.error);
                return;
            }

            botChannel = resolve.id;

            if (!serverData[server.id].botChannels.contains(botChannel)) {
                channel.send(message.author.username + ", that is not a bot channel!").catch(console.error);
                return;
            }

            serverData[server.id].botChannels.remove(botChannel);
            save("botChannels", server);

            if (serverData[server.id].botChannels.length === 0) {
                channel.send("Bot commands are now allowed everywhere!").catch(console.error);
            } else {
                channel.send(resolve.name + " is no longer a bot channel!").catch(console.error);
            }
        }
    },

    logchannel: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [channel]`: makes `channel` the logging channel. If `channel` is not specified, removes the log channel.\nAdding a log channel means users entering or leaving will be posted for.";
        },

        command: function (message, server, command, channel) {
            var logChannel = command[1], resolve;

            if (!logChannel) {
                serverData[server.id].logChannel = undefined;
                save("logChannel", server);
                channel.send("The logging channel has been disabled.");
                return;
            }

            resolve = server.channels.cache.find(chan => chan.name == botChannel.toLowerCase());

            if (!resolve || resolve.type != "text") {
                channel.send(message.author.username + ", that is not a channel!");
                return;
            }

            logChannel = resolve.id;
            serverData[server.id].logChannel = logChannel;
            save("logChannel", server);
            channel.send(resolve.name + " is now the logging channel!");
        }
    },

    mainchannel: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <channel>`: makes `channel` my main channel.";
        },

        command: function (message, server, command, channel) {
            var mainChannel = command[1], resolve;

            if (!mainChannel) {
                channel.send(message.author.username + ", please specify a channel.").catch(console.error);
                return;
            }

            resolve = server.channels.cache.find(chan => chan.name == mainChannel);

            if (!resolve || resolve.type != "text") {
                channel.send(message.author.username + ", that is not a channel!").catch(console.error);
                return;
            }

            mainChannel = resolve.id;
            serverData[server.id].mainChannel = mainChannel;
            save("mainChannel", server);
            channel.send(resolve.name + " is now my main channel!").catch(console.error);
        }
    },

    lewdaccessrole: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the lewd access role.";
        },

        command: function (message, server, command, channel) {
            var lewdAccessRole = command[1], resolve;

            if (!lewdAccessRole) {
                channel.send(message.author.username + ", please specify a role.").catch(console.error);
                return;
            }

            resolve = server.roles.cache.find(role => role.name = lewdAccessRole);

            if (!resolve) {
                channel.send(message.author.username + ", that is not a role!").catch(console.error);
                return;
            }

            serverData[server.id].lewdAccessRole = resolve.id;
            save("lewdAccessRole", server);
            channel.send("The '" + lewdAccessRole + "' role has been set as the lewd access role.").catch(console.error);
        }
    },

    firerole: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the Fire faction role.";
        },

        command: function (message, server, command, channel) {
            var factionRole = command[1];

            if (!factionRole) {
                channel.send(message.author.username + ", please specify a role.").catch(console.error);
                return;
            }

            resolve = server.roles.cache.find(role => role.name = factionRole);

            if (!resolve) {
                channel.send(message.author.username + ", that is not a role!").catch(console.error);
                return;
            }

            serverData[server.id].factions.fire = resolve.id;
            save("factions", server);
            channel.send("The '" + factionRole + "' role has been set as the Fire faction role.").catch(console.error);
        }
    },

    waterrole: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the Water faction role.";
        },

        command: function (message, server, command, channel) {
            var factionRole = command[1];

            if (!factionRole) {
                channel.send(message.author.username + ", please specify a role.").catch(console.error);
                return;
            }

            resolve = server.roles.cache.find(role => role.name = factionRole);

            if (!resolve) {
                channel.send(message.author.username + ", that is not a role!").catch(console.error);
                return;
            }

            serverData[server.id].factions.water = resolve.id;
            save("factions", server);
            channel.send("The '" + factionRole + "' role has been set as the Water faction role.").catch(console.error);
        }
    },

    earthrole: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the Earth faction role.";
        },

        command: function (message, server, command, channel) {
            var factionRole = command[1];

            if (!factionRole) {
                channel.send(message.author.username + ", please specify a role.").catch(console.error);
                return;
            }

            resolve = server.roles.cache.find(role => role.name = factionRole);

            if (!resolve) {
                channel.send(message.author.username + ", that is not a role!").catch(console.error);
                return;
            }

            serverData[server.id].factions.earth = resolve.id;
            save("factions", server);
            channel.send("The '" + factionRole + "' role has been set as the Earth faction role.").catch(console.error);
        }
    },

    windrole: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the Wind faction role.";
        },

        command: function (message, server, command, channel) {
            var factionRole = command[1];

            if (!factionRole) {
                channel.send(message.author.username + ", please specify a role.").catch(console.error);
                return;
            }

            resolve = server.roles.cache.find(role => role.name = factionRole);

            if (!resolve) {
                channel.send(message.author.username + ", that is not a role!").catch(console.error);
                return;
            }

            serverData[server.id].factions.wind = resolve.id;
            save("factions", server);
            channel.send("The '" + factionRole + "' role has been set as the Wind faction role.").catch(console.error);
        }
    },

    entrymessage: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <message>`: changes the entry message to `message`. Write '%u' where the username should be.";
        },

        command: function (message, server, command, channel) {
            var entryMessage = command[1];

            if (!entryMessage) {
                channel.send("The current message when a user joins this server is `" + serverData[server.id].entryMessage + "`.").catch(console.error);
                return;
            }

            if (!entryMessage.contains("%u")) {
                channel.send(message.author.username + ", the entry message should contain '%u' for the username.").catch(console.error);
                return;
            }

            serverData[server.id].entryMessage = entryMessage;
            save("entryMessage", server);
            channel.send("The entry message has been changed.").catch(console.error);
        }
    },

    leavemessage: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <message>`: changes the leave message to `message`. Write '%u' where the username should be.";
        },

        command: function (message, server, command, channel) {
            var leaveMessage = command[1];

            if (!leaveMessage) {
                channel.send("The current message when a user leaves this server is `" + serverData[server.id].leaveMessage + "`.").catch(console.error);
                return;
            }

            if (!leaveMessage.contains("%u")) {
                channel.send(message.author.username + ", the leave message should contain '%u' for the username.").catch(console.error);
                return;
            }

            serverData[server.id].leaveMessage = leaveMessage;
            save("leaveMessage", server);
            channel.send("The leave message has been changed.").catch(console.error);
        }
    },

    logoutmessage: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <message>`: changes the logout message to `message`.";
        },

        command: function (message, server, command, channel) {
            var logoutMessage = command[1];

            if (!logoutMessage) {
                channel.send("The current message when I log out on this server is `" + serverData[server.id].logoutMessage + "`.").catch(console.error);
                return;
            }

            serverData[server.id].logoutMessage = logoutMessage;
            save("logoutMessage", server);
            channel.send("The logout message has been changed.").catch(console.error);
        }
    },

    defaultreason: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <reason>`: changes the default reason for kicks and bans to `reason`.";
        },

        command: function (message, server, command, channel) {
            var defaultReason = command[1];

            if (!defaultReason) {
                channel.send("The current default reason for kicks and bans on this server is `" + serverDatas[server.id].defaultReason + "`.").catch(console.error);
                return;
            }

            serverData[server.id].defaultReason = defaultReason;
            save("defaultReason", server);
            channel.send("The default reason has been changed.").catch(console.error);
        }
    },

    settings: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: displays the current server settings.";
        },

        command: function (message, server, command, channel) {
            var settings = serverData[server.id];

            var botChannels = [];

            for (var i in settings.botChannels) {
                botChannels.push(server.channels.cache.get(settings.botChannels[i]));
            }

            var settingsMessage = "Channels: " + botChannels.join(", ") +
            "\nMain channel: " + server.channels.cache.get(settings.mainChannel) +
            "\nLogging channel: " + server.channels.cache.get(settings.logChannel) +
            "\nVoice channel: " + server.channels.cache.get(settings.voiceChannel) +
            "\nEntry message: '" + settings.entryMessage + "'" +
            "\nLeave message: '" + settings.leaveMessage + "'" +
            "\nLogout message: '" + settings.logoutMessage + "'" +
            "\nDefault reason: '" + settings.defaultReason + "'" +
            "\nLewd access role: " + (settings.lewdAccessRole ? "Yes" : "No") +
            "\nFactions active: " + (Object.keys(settings.factions).length == 4 ? "Yes" : "No") +
            "\nTesting server: " + (settings.isTestingServer ? "Yes" : "No") +
            "\n'Kek' detection: " + (settings.kekDetection ? "Yes" : "No") +
            "\nCooldown seconds: " + settings.cooldownSecs;

            channel.send(settingsMessage).catch(console.error);
        }
    },

    addcommandsymbol: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <character>`: allows `character` to be used as a command symbol.";
        },

        command: function (message, server, command, channel) {
            var symbol = command[1];

            if (!symbol) {
                channel.send(message.author.username + ", please specify a symbol.").catch(console.error);
                return;
            }

            if (symbol.length !== 1) {
                channel.send(message.author.username + ", the symbol must be a single character.").catch(console.error);
                return;
            }

            permData.commandSymbols.push(symbol);
            save("commandSymbols");
            channel.send("The command symbol '" + symbol + "' has been added.").catch(console.error);
        }
    },

    removecommandsymbol: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <character>`: removes `character` from the usable command symbols.";
        },

        command: function (message, server, command, channel) {
            var symbol = command[1], commandSymbols = permData.commandSymbols;

            if (!symbol) {
                channel.send(message.author.username + ", please specify a symbol.").catch(console.error);
                return;
            }

            if (commandSymbols.length === 1) {
                channel.send(message.author.username + ", there must be at least one command symbol.").catch(console.error);
                return;
            }

            commandSymbols.remove(symbol);
            save("commandSymbols");
            channel.send("The command symbol '" + symbol + "' has been removed.").catch(console.error);
        }
    },

    setweatherapi: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <API key>`: saves the key `API key` for use of the `" + symbol + "weather` command.";
        },

        command: function (message, server, command, channel) {
            var key = command[1];

            if (!key) {
                channel.send(message.author.username + ", please specify an API key.").catch(console.error);
                return;
            }

            permData.weatherKey = key;
            save("weatherKey");
            channel.send("API key set successfully. The weather command is now enabled.").catch(console.error);
        }
    },

    removeweatherapi: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: removes the API key that was saved for use of the `" + symbol + "weather` command.";
        },

        command: function (message, server, command, channel) {
            permData.weatherKey = "";
            save("weatherKey");
            channel.send("API key removed successfully. The weather command is now disabled.").catch(console.error);
        }
    },

    setgoogleapi: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <API key>`: saves the key `API key` to enable the automatic replies to YouTube links.";
        },

        command: function (message, server, command, channel) {
            var key = command[1];

            if (!key) {
                channel.send(message.author.username + ", please specify an API key.").catch(console.error);
                return;
            }

            permData.googleKey = key;
            save("googleKey");
            channel.send("API key set successfully. Automatic replies to YouTube links now enabled.").catch(console.error);
        }
    },

    removegoogleapi: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: removes the API key that was saved for automatic replies to YouTube links.";
        },

        command: function (message, server, command, channel) {
            permData.googleKey = "";
            save("googleKey");
            channel.send("API key removed successfully. Automatic replies to YouTube links are now disabled.").catch(console.error);
        }
    },

    maxlength: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <number>`: changes the maximum allowed command argument length to `number`.";
        },

        command: function (message, server, command, channel) {
            var maxLength = command[1];

            if (!maxLength) {
                channel.send("The current maximum allowed command argument length is " + permData.maxLength + ".").catch(console.error);
                return;
            }

            if (isNaN(maxLength)) {
                channel.send(message.author.username + ", that is not a number.").catch(console.error);
                return;
            }

            permData.maxLength = parseInt(maxLength);
            save("maxLength");
            channel.send("The maximum argument length is now " + maxLength + ".").catch(console.error);
        }
    },

    logout: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes me log out.";
        },

        command: function (message, server, command, channel) {
            for (var id in serverData) {
                if (serverData[id].mainChannel) {
                    bot.guilds.get(id).channels.get(serverData[id].mainChannel).send(serverData[id].logoutMessage).catch(console.error);
                }
            }

            bot.destroy();
        }
    }
};