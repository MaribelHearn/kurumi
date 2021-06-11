module.exports = {
    eval: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <code>`: evaluates `code` and posts the result, " +
            "unless the code already sends a bot message.";
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
                if (code.contains("channel.send")) {
                    eval(code);
                } else {
                    var result = eval(code);

                    if (result.toString().length > MESSAGE_CAP) {
                        result = result.toString().substr(0, MESSAGE_CAP - 23) + "...";
                    }

                    channel.send("Evaluation result: " + result).catch(console.error);
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
            var child = exec("git pull", function (error, stdout, stderr) {
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
                    message = "Updated modules: ", scriptModule, i;

                for (i = 0; i < changed.length; i++) {
                    if (changed[i].contains("js")) {
                        scriptModule = changed[i].trim().split('/');

                        message += (scriptModule[1] ? scriptModule[1].trim() : scriptModule[0].trim()) + ", ";
                    }
                }

                message.slice(0, -2)
                channel.send(message + ".").catch(console.error);
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
        help: function (command, symbol) {
            return "`" + symbol + command + " <server> <message>`: will make me send `message` to the main channel of `server`. " +
            "If the server does not have a main channel, uses the first channel in the list of bot channels.";
        },

        command: function (message, server, command, channel) {
            var server = command[1], text;

            if (!server) {
                channel.send(message.author.username + ", please specify a server.").catch(console.error);
                return;
            }

            server = bot.guilds.cache.find(guild => guild.name.toLowerCase() == server.toLowerCase());

            if (!server) {
                channel.send(message.author.username + ", that server either does not exist or I am not in it.").catch(console.error);
                return;
            }

            text = command[2];

            if (!text) {
                channel.send(message.author.username + ", please specify something for me to say.").catch(console.error);
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
        help: function (command, symbol) {
            return "`" + symbol + command + " <text channel>`: makes `text channel` a bot channel.";
        },

        command: function (message, server, command, channel) {
            var botChannel = command[1], resolve;

            if (!botChannel) {
                channel.send(message.author.username + ", please specify a text channel.").catch(console.error);
                return;
            }

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
        help: function (command, symbol) {
            return "`" + symbol + command + " <text channel>`: removes `text channel` from the bot channels.";
        },

        command: function (message, server, command, channel) {
            var botChannel = command[1];

            if (!botChannel) {
                channel.send(message.author.username + ", please specify a text channel.").catch(console.error);
                return;
            }

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

    defaultreason: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [reason]`: changes the default reason for kicks and bans to `reason`. If `reason` is not specified, shows the current default reason.";
        },

        command: function (message, server, command, channel) {
            var defaultReason = command[1];

            if (!defaultReason) {
                channel.send("The current default reason for kicks and bans on this server is `" + serverData[server.id].defaultReason + "`.").catch(console.error);
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
            "\nMain channel: <#" + server.channels.cache.get(settings.mainChannel) + ">" +
            "\nVoice channel: <#" + server.channels.cache.get(settings.voiceChannel) + ">" +
            "\nDefault reason: '" + settings.defaultReason + "'" +
            "\nLewd access role: " + (settings.lewdAccessRole ? "**Yes**" : "No") +
            "\nFactions active: " + (Object.keys(settings.factions).length == 4 ? "**Yes**" : "No") +
            "\nTesting server: " + (settings.isTestingServer ? "**Yes**" : "No") +
            "\n'Kek' detection: " + (settings.kekDetection ? "**Yes**" : "No") +
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
            bot.destroy();
        }
    }
};
