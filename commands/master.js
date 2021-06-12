module.exports = {
    eval: {
        args: [0, "code to evaluate"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <code>`: evaluates `code` and posts the result, " +
            "unless the code already sends a bot message.";
        },

        command: function (message, server, command, channel) {
            var code = command[1];

            channel.send(code, {"code": "JavaScript"}).catch(console.error);

            try {
                if (code.contains("channel.send")) {
                    eval(code);
                } else {
                    var result = eval(code);

                    if (result.toString().length > MESSAGE_CAP) {
                        result = result.toString().substr(0, MESSAGE_CAP - 23) + "...";
                    }

                    channel.send("__Result__\n" + result, {"code": "JavaScript"}).catch(console.error);
                }
            } catch (err) {
                channel.send("An error occurred: " + err).catch(console.error);
            }
        }
    },

    update: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: updates the script modules and reloads the data files. " +
            "requires `git` to be installed and requires the bot to be running from its git repository.";
        },

        command: function (message, server, command, channel) {
            var startTime = new Date(), child = exec("git pull", function (error, stdout, stderr) {
                if (error !== null) {
                    channel.send("Error while updating the scripts: " + error).catch(console.error);

                    if (stderr !== "") {
                        channel.send("Console output: " + stderr).catch(console.error);
                    }

                    return;
                }

                if (stdout.contains("Already up to date.")) {
                    channel.send("Already up to date.").catch(console.error);
                    return;
                }

                var changed = stdout.split("Fast-forward")[1].trim().split(/\d+\ files? changed/)[0].trim().split(/(\+|-)+|\|/),
                    message = "Updated modules: ", scriptModule, isCommands, fileName, isJSON, isMainScript, i;

                for (i = 0; i < changed.length; i++) {
                    if (changed[i] && changed[i].contains("js")) {
                        scriptModule = changed[i].trim().split('/');
                        scriptModule = (scriptModule[1] ? scriptModule[1].trim() : scriptModule[0].trim());

                        try {
                            isCommands = COMMAND_FILES.contains(scriptModule);
                            fileName = scriptModule.replace(".js", "");
                            isJSON = scriptModule.contains(".json");
                            isMainScript = fileName == "kurumibot";

                            if (isCommands) {
                                delete require.cache[COMMAND_DIR + scriptModule];

                                allCommands[fileName] = require(COMMAND_DIR + scriptModule);
                            } else if (isMainScript) {
                                channel.send("The main script has been updated; this only takes effect after a restart.");
                            } else if (isJSON) {
                                JSON.parse(fs.readFileSync(JSON_DIR + scriptModule));
                            } else {
                                delete require.cache[MODULE_DIR + scriptModule];

                                global[fileName] = require(MODULE_DIR + scriptModule);

                                if (scriptModule == "globals.js") {
                                    globals.define();
                                    loadPermData();
                                    loadServerData();
                                }
                            }

                            message += scriptModule + ", ";
                        } catch (err) {
                            channel.send("An error occurred while updating " + scriptModule + ": " + err);
                        }
                    }
                }

                if (message == "Updated modules: ") {
                    channel.send("Could not update any modules.").catch(console.error);
                } else {
                    channel.send(message.slice(0, -2) + ".").catch(console.error);
                    console.log(timeStamp() + "The scripts have been updated.");
                    console.log(timeStamp() + "Time elapsed: " + (new Date() - startTime) + " ms.");
                }
            });
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

            if (dataMessage.length > MESSAGE_CAP) {
                dataMessage = dataMessage.substr(0, MESSAGE_CAP - 4) + "...";
            }

            if (dataMessage === "") {
                channel.send("The server data is currently empty.").catch(console.error);
                return;
            }

            channel.send(dataMessage).catch(console.error);
        }
    },

    genwiki: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: generates the full list of commands for the GitHub Wiki.";
        },

        command: function (message, server, command, channel) {
            var symbol = '!', result = "", commandType, commandName;

            for (commandType in allCommands) {
                result += "\n## " + cap(commandType) + " Commands\n";

                for (commandName in allCommands[commandType]) {
                    result += "* " + allCommands[commandType][commandName].help(commandName, symbol) + "\n";
                }
            }

            fs.writeFileSync("data/wiki.txt", result);
            channel.send("The full list of commands has been generated and written to wiki.txt.");
        }
    },

    secretsay: {
        args: [0, "a server", "something for me to say"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <server> <message>`: will make me send `message` to the main channel of `server`. " +
            "If the server does not have a main channel, uses the first channel in the list of bot channels.";
        },

        command: function (message, server, command, channel) {
            var server = command[1], text = command[2];

            server = bot.guilds.cache.find(guild => guild.name.toLowerCase() == server.toLowerCase());

            if (!server) {
                channel.send(message.author.username + ", that server either does not exist or I am not in it.").catch(console.error);
                return;
            }

            if (text.length > MESSAGE_CAP) {
                channel.send(message.author.username + ", sorry, I cannot send anything longer than " + MESSAGE_CAP + " characters.");
                return;
            }

            if (serverData[server.id].mainChannel) {
                server.channels.cache.get(serverData[server.id].mainChannel).send(text).catch(console.error);
            } else if (serverData[server.id].botChannels.length > 0) {
                server.channels.cache.get(serverData[server.id].botChannels[0]).send(text).catch(console.error);
            } else {
                channel.send(message.author.username + ", that server does not have a main channel or bot channel set.").catch(console.error);
            }
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
            channel.send("Maintenance mode has been **" + (permData.maintenanceMode ? "en" : "dis") + "abled**.").catch(console.error);
        }
    },

    toggleinterrupt: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: toggles interruption mode. This will make voice channel commands interrupt anything ongoing by starting immediately.";
        },

        command: function (message, server, command, channel) {
            serverData[server.id].interruptionMode = !serverData[server.id].interruptionMode;
            save("interruptionMode", server);
            channel.send("Interruption mode mode has been **" + (serverData[server.id].interruptionMode ? "en" : "dis") + "abled** on this server.").catch(console.error);
        }
    },

    addbotchannel: {
        args: [0, "a text channel"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <text channel>`: makes `text channel` a bot channel.";
        },

        command: function (message, server, command, channel) {
            var botChannel = command[1], resolve;

            resolve = server.channels.cache.find(chan => chan.name == botChannel.toLowerCase());

            if (!resolve || resolve.type != "text") {
                channel.send(message.author.username + ", that is not a text channel!").catch(console.error);
                return;
            }

            botChannel = resolve.id;

            if (serverData[server.id].botChannels.length === 0) {
                channel.send("Bot commands have been restricted to <#" + resolve.id + ">!").catch(console.error);
            } else {
                channel.send("<#" + resolve.id + "> is now a bot channel!").catch(console.error);
            }

            serverData[server.id].botChannels.push(botChannel);
            save("botChannels", server);
        }
    },

    removebotchannel: {
        args: [0, "a text channel"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <text channel>`: removes `text channel` from the bot channels.";
        },

        command: function (message, server, command, channel) {
            var botChannel = command[1];

            resolve = server.channels.cache.find(chan => chan.name == botChannel.toLowerCase());

            if (!resolve || resolve.type != "text") {
                channel.send(message.author.username + ", that is not a text channel!").catch(console.error);
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
                channel.send("<#" + resolve.id + "> is no longer a bot channel!").catch(console.error);
            }
        }
    },

    mainchannel: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [text channel]`: makes `text channel` my main channel. " +
            "If `text channel` is not specified, shows the current main channel.";
        },

        command: function (message, server, command, channel) {
            var mainChannel = command[1], resolve;

            if (!mainChannel) {
                channel.send("My main channel is currently <#" + serverData[server.id].mainChannel + ">.").catch(console.error);
                return;
            }

            resolve = server.channels.cache.find(chan => chan.name == mainChannel);

            if (!resolve || resolve.type != "text") {
                channel.send(message.author.username + ", that is not a text channel!").catch(console.error);
                return;
            }

            mainChannel = resolve.id;
            serverData[server.id].mainChannel = mainChannel;
            save("mainChannel", server);
            channel.send("<#" + resolve.id + "> is now my main channel!").catch(console.error);
        }
    },

    lewdaccessrole: {
        args: [0, "a role"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the lewd access role.";
        },

        command: function (message, server, command, channel) {
            var lewdAccessRole = command[1], resolve;

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
        args: [0, "a role"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the Fire faction role.";
        },

        command: function (message, server, command, channel) {
            var factionRole = command[1];

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
        args: [0, "a role"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the Water faction role.";
        },

        command: function (message, server, command, channel) {
            var factionRole = command[1];

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
        args: [0, "a role"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the Earth faction role.";
        },

        command: function (message, server, command, channel) {
            var factionRole = command[1];

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
        args: [0, "a role"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the Wind faction role.";
        },

        command: function (message, server, command, channel) {
            var factionRole = command[1];

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

    defaultreason: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [reason]`: changes the default reason for kicks and bans to `reason`. If `reason` is not specified, shows the current default reason.";
        },

        command: function (message, server, command, channel) {
            var defaultReason = command[1];

            serverData[server.id].defaultReason = defaultReason;
            save("defaultReason", server);
            channel.send("The default reason has been changed.").catch(console.error);
        }
    },

    addcommandsymbol: {
        args: [0, "a symbol"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <symbol>`: allows `symbol` to be used as a command symbol.";
        },

        command: function (message, server, command, channel) {
            var symbol = command[1];

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
        args: [0, "a symbol"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <symbol>`: removes `symbol` from the usable command symbols.";
        },

        command: function (message, server, command, channel) {
            var symbol = command[1], commandSymbols = permData.commandSymbols;

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
        args: [0, "an API key"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <API key>`: saves the key `API key` for use of the `" + symbol + "weather` command.";
        },

        command: function (message, server, command, channel) {
            var key = command[1];

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
        args: [0, "an API key"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <API key>`: saves the key `API key` to enable the automatic replies to YouTube links.";
        },

        command: function (message, server, command, channel) {
            var key = command[1];

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

    setipapi: {
        args: [0, "an API key"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <API key>`: saves the key `API key` to enable IP tracing.";
        },

        command: function (message, server, command, channel) {
            var key = command[1];

            permData.ipKey = key;
            save("ipKey");
            channel.send("API key set successfully. IP tracing is now enabled.").catch(console.error);
        }
    },

    removeipapi: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: removes the API key that was saved for IP tracing.";
        },

        command: function (message, server, command, channel) {
            permData.ipKey = "";
            save("ipKey");
            channel.send("API key removed successfully. IP tracing is now disabled.").catch(console.error);
        }
    },

    maxlength: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [number]`: changes the maximum allowed command argument length to `number`. " +
            "If `number` is not specified, shows the current maximum allowed command argument length.";
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
            bot.destroy();
        }
    }
};
