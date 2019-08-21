module.exports = {
    eval: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <code>`: evaluates `code` and posts the result, unless the code already sends a bot message.";
        },

        command: function (message, server, command, channel) {
            var code = command[1];

            if (!code) {
                channel.send(message.author + ", please specify code to evaluate.");
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

        command: function (message, server, command, channel) {
            for (var i in MODULES) {
                var module = MODULES[i];

                try {
                    console.log(timeStamp() + "Evaluating module " + module + ".js...");

                    delete require.cache[process.cwd() + (os.type() == "Windows_NT" ? "\\" : '/') + module + ".js"];

                    module.contains("cmds") ? allCommands[module.replace("cmds", "")] = require("./" + module + ".js") : global[module] = require("./" + module + ".js");
                } catch (err) {
                    channel.send("An error occurred while loading the `" + module + "` module: " + err).catch(console.error);
                    return;
                }
            }

            globals.define();
            console.log(timeStamp() + "Modules loaded.");

            for (var j in permData) {
                try {
                    if (fs.existsSync("data/" + j + ".txt")) {
                        // console.log(timeStamp() + "Reading " + j + ".txt...");
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
                        fs.writeFileSync(filename, SERVER_DATA_DEFAULTS[l]);
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
            var servers = permData.servers;

            servers[server.id].isTestingServer = !servers[server.id].isTestingServer;
            save("servers");
            channel.send("This server is " + (servers[server.id].isTestingServer ? "now" : "no longer") + " a testing server.").catch(console.error);
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
            var botChannel = command[1], servers = permData.servers;

            if (!botChannel) {
                channel.send(message.author + ", please specify a channel.").catch(console.error);
                return;
            }

            if (!server.channels.find("name", botChannel) || server.channels.find("name", botChannel).type != "text") {
                channel.send(message.author + ", that is not a channel!").catch(console.error);
                return;
            }

            botChannel = server.channels.find("name", botChannel).id;

            if (servers[server.id].botChannels.length === 0) {
                channel.send("Bot commands have been restricted to " + server.channels.get(botChannel) + "!").catch(console.error);
            } else {
                channel.send(server.channels.get(botChannel) + " is now a bot channel!").catch(console.error);
            }

            servers[server.id].botChannels.push(botChannel);
            save("servers");
        }
    },

    removebotchannel: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <channel>`: removes `channel` from the bot channels.";
        },

        command: function (message, server, command, channel) {
            var botChannel = command[1], servers = permData.servers;

            if (!botChannel) {
                channel.send(message.author + ", please specify a channel.").catch(console.error);
                return;
            }

            if (!server.channels.find("name", botChannel) || server.channels.find("name", botChannel).type != "text") {
                channel.send(message.author + ", that is not a channel!").catch(console.error);
                return;
            }

            botChannel = server.channels.find("name", botChannel).id;

            if (!servers[server.id].botChannels.contains(botChannel)) {
                channel.send(message.author + ", that is not a bot channel!").catch(console.error);
                return;
            }

            servers[server.id].botChannels.remove(botChannel);
            save("servers");

            if (servers[server.id].botChannels.length === 0) {
                channel.send("Bot commands are now allowed everywhere!").catch(console.error);
            } else {
                channel.send(server.channels.get(botChannel) + " is no longer a bot channel!").catch(console.error);
            }
        }
    },

    logchannel: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [channel]`: makes `channel` the logging channel. If `channel` is not specified, removes the log channel.\nAdding a log channel means users entering or leaving will be posted for.";
        },

        command: function (message, server, command, channel) {
            var logChannel = command[1], servers = permData.servers;

            if (!logChannel) {
                servers[server.id].logChannel = undefined;
                save("servers");
                channel.send("The logging channel has been disabled.");
                return;
            }

            if (!server.channels.find("name", logChannel) || server.channels.find("name", logChannel).type != "text") {
                channel.send(message.author + ", that is not a channel!");
                return;
            }

            logChannel = server.channels.find("name", logChannel).id;
            servers[server.id].logChannel = logChannel;
            save("servers");
            channel.send(server.channels.get(logChannel) + " is now the logging channel!");
        }
    },

    mainchannel: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <channel>`: makes `channel` my main channel.";
        },

        command: function (message, server, command, channel) {
            var mainChannel = command[1], servers = permData.servers;

            if (!mainChannel) {
                channel.send(message.author + ", please specify a channel.").catch(console.error);
                return;
            }

            if (!server.channels.find("name", mainChannel) || server.channels.find("name", mainChannel).type != "text") {
                channel.send(message.author + ", that is not a channel!").catch(console.error);
                return;
            }

            mainChannel = server.channels.find("name", mainChannel).id;
            servers[server.id].mainChannel = mainChannel;
            save("servers");
            channel.send(server.channels.get(mainChannel) + " is now my main channel!").catch(console.error);
        }
    },

    lewdaccessrole: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the lewd access role.";
        },

        command: function (message, server, command, channel) {
            var lewdAccessRole = command[1], servers = permData.servers;

            if (!lewdAccessRole) {
                channel.send(message.author + ", please specify a role.").catch(console.error);
                return;
            }

            if (!server.roles.find("name", lewdAccessRole)) {
                channel.send(message.author + ", that is not a role!").catch(console.error);
                return;
            }

            servers[server.id].lewdAccessRole = server.roles.find("name", lewdAccessRole).id;
            save("servers");
            channel.send("The '" + lewdAccessRole + "' role has been set as the lewd access role.").catch(console.error);
        }
    },

    firerole: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the Fire faction role.";
        },

        command: function (message, server, command, channel) {
            var factionRole = command[1], servers = permData.servers;

            if (!factionRole) {
                channel.send(message.author + ", please specify a role.").catch(console.error);
                return;
            }

            if (!server.roles.find("name", factionRole)) {
                channel.send(message.author + ", that is not a role!").catch(console.error);
                return;
            }

            servers[server.id].factions.fire = server.roles.find("name", factionRole).id;
            save("servers");
            channel.send("The '" + factionRole + "' role has been set as the Fire faction role.").catch(console.error);
        }
    },

    waterrole: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the Water faction role.";
        },

        command: function (message, server, command, channel) {
            var factionRole = command[1], servers = permData.servers;

            if (!factionRole) {
                channel.send(message.author + ", please specify a role.").catch(console.error);
                return;
            }

            if (!server.roles.find("name", factionRole)) {
                channel.send(message.author + ", that is not a role!").catch(console.error);
                return;
            }

            servers[server.id].factions.water = server.roles.find("name", factionRole).id;
            save("servers");
            channel.send("The '" + factionRole + "' role has been set as the Water faction role.").catch(console.error);
        }
    },

    earthrole: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the Earth faction role.";
        },

        command: function (message, server, command, channel) {
            var factionRole = command[1], servers = permData.servers;

            if (!factionRole) {
                channel.send(message.author + ", please specify a role.").catch(console.error);
                return;
            }

            if (!server.roles.find("name", factionRole)) {
                channel.send(message.author + ", that is not a role!").catch(console.error);
                return;
            }

            servers[server.id].factions.earth = server.roles.find("name", factionRole).id;
            save("servers");
            channel.send("The '" + factionRole + "' role has been set as the Earth faction role.").catch(console.error);
        }
    },

    windrole: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the Wind faction role.";
        },

        command: function (message, server, command, channel) {
            var factionRole = command[1], servers = permData.servers;

            if (!factionRole) {
                channel.send(message.author + ", please specify a role.").catch(console.error);
                return;
            }

            if (!server.roles.find("name", factionRole)) {
                channel.send(message.author + ", that is not a role!").catch(console.error);
                return;
            }

            servers[server.id].factions.wind = server.roles.find("name", factionRole).id;
            save("servers");
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
                channel.send("The current message when a user joins this server is `" + permData.servers[server.id].entryMessage + "`.").catch(console.error);
                return;
            }

            if (!entryMessage.contains("%u")) {
                channel.send(message.author + ", the entry message should contain '%u' for the username.").catch(console.error);
                return;
            }

            permData.servers[server.id].entryMessage = entryMessage;
            save("servers");
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
                channel.send("The current message when a user leaves this server is `" + permData.servers[server.id].leaveMessage + "`.").catch(console.error);
                return;
            }

            if (!leaveMessage.contains("%u")) {
                channel.send(message.author + ", the leave message should contain '%u' for the username.").catch(console.error);
                return;
            }

            permData.servers[server.id].leaveMessage = leaveMessage;
            save("servers");
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
                channel.send("The current message when I log out on this server is `" + permData.servers[server.id].logoutMessage + "`.").catch(console.error);
                return;
            }

            permData.servers[server.id].logoutMessage = logoutMessage;
            save("servers");
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
                channel.send("The current default reason for kicks and bans on this server is `" + permData.servers[server.id].defaultReason + "`.").catch(console.error);
                return;
            }

            permData.servers[server.id].defaultReason = defaultReason;
            save("servers");
            channel.send("The default reason has been changed.").catch(console.error);
        }
    },

    settings: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: displays the current server settings.";
        },

        command: function (message, server, command, channel) {
            var settings = permData.servers[server.id];

            var botChannels = [];

            for (var i in settings.botChannels) {
                botChannels.push(server.channels.get(settings.botChannels[i]));
            }

            var settingsMessage = "Channels: " + botChannels.join(", ") +
            "\nMain channel: " + server.channels.get(settings.mainChannel) +
            "\nLogging channel: " + server.channels.get(settings.logChannel) +
            "\nVoice channel: " + server.channels.get(settings.voiceChannel) +
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
                channel.send(message.author + ", please specify a symbol.").catch(console.error);
                return;
            }

            if (symbol.length !== 1) {
                channel.send(message.author + ", the symbol must be a single character.").catch(console.error);
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
                channel.send(message.author + ", please specify a symbol.").catch(console.error);
                return;
            }

            if (commandSymbols.length === 1) {
                channel.send(message.author + ", there must be at least one command symbol.").catch(console.error);
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
                channel.send(message.author + ", please specify an API key.").catch(console.error);
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
                channel.send(message.author + ", please specify an API key.").catch(console.error);
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
                channel.send(message.author + ", that is not a number.").catch(console.error);
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
            var servers = permData.servers;

            for (var id in servers) {
                if (servers[id].mainChannel) {
                    bot.guilds.get(id).channels.get(servers[id].mainChannel).send(servers[id].logoutMessage).catch(console.error);
                }
            }

            bot.destroy();
        }
    }
};
