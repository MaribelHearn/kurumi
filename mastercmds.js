module.exports = {
    eval: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <code>`: evaluates `code` and posts the result, unless the code already sends a bot message.";
        },
        
        command: function (message, server, command, channel) {
            command.splice(0, 1);
            
            var code = command.join(ARGUMENT_DELIMITER);
            
            if (!code) {
                channel.send(message.author + ", please specify code to evaluate.");
                return;
            }
            
            if (removeSpaces(code) != code) {
                channel.send("Evaluating the following code:");
                channel.send(code, {"code": "JavaScript"});
            }
            
            try {
                if (code.contains("channel.")) {
                    eval(code);
                } else {
                    var result = eval(code);
                    
                    channel.send("Evaluation result: " + result);
                }
            } catch (err) {
                channel.send("An error occurred: " + err);
            }
        }
    },
    
    update: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: updates the script modules.";
        },
        
        command: function (message, server, command, channel) {
            for (var i in MODULES) {
                var module = MODULES[i];
                
                try {
                    console.log(timeStamp() + "Evaluating module " + module + ".js...");
                    
                    delete require.cache[process.cwd() + "\\" + module + ".js"];
                    
                    module.contains("cmds") ? allCommands[module.replace("cmds", "")] = require("./" + module + ".js") : global[module] = require("./" + module + ".js");
                } catch (err) {
                    console.log(timeStamp() + "An error occurred while loading the " + module + " module: " + err);
                }
            }
            
            globals.define();
            console.log(timeStamp() + "Modules loaded.");
            
            for (var j in permData) {
                try {
                    if (fs.existsSync("./data/" + j + ".txt")) {
                        // console.log(timeStamp() + "Reading " + j + ".txt...");
                        permData[j] = fs.readFileSync("./data/" + j + ".txt");
                        permData[j] = String(permData[j]).replace(/^\uFEFF/, "");
                        permData[j] = JSON.parse(permData[j]);
                    } else {
                        fs.writeFile("./data/" + j + ".txt", permData[j], function (err) {
                            if (err) {
                                console.log(timeStamp() + err);
                            }
                            
                            console.log(timeStamp() + "Data file " + j + ".txt created.");
                        });
                    }
                } catch (err) {
                    console.log(timeStamp() + "An error occurred while loading the " + j + " data file: " + err);
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
                    filename = "./data/" + id;
                    
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
            channel.send("The script modules have been updated!");
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
            
            channel.send(dataMessage);
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
            channel.send("This server is " + (servers[server.id].isTestingServer ? "now" : "no longer") + " a testing server.");
        }
    },
    
    addbotchannel: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <channel>`: makes `channel` a bot channel.";
        },
        
        command: function (message, server, command, channel) {
            var botChannel = command[1], servers = permData.servers;
            
            if (!botChannel) {
                channel.send(message.author + ", please specify a channel.");
                return;
            }
            
            if (!server.channels.find("name", botChannel) || server.channels.find("name", botChannel).type != "text") {
                channel.send(message.author + ", that is not a channel!");
                return;
            }
            
            botChannel = server.channels.find("name", botChannel).id;
            
            if (servers[server.id].botChannels.length === 0) {
                channel.send("Bot commands have been restricted to " + server.channels.get(botChannel) + "!");
            } else {
                channel.send(server.channels.get(botChannel) + " is now a bot channel!");
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
                channel.send(message.author + ", please specify a channel.");
                return;
            }
            
            if (!server.channels.find("name", botChannel) || server.channels.find("name", botChannel).type != "text") {
                channel.send(message.author + ", that is not a channel!");
                return;
            }
            
            botChannel = server.channels.find("name", botChannel).id;
            
            if (!servers[server.id].botChannels.contains(botChannel)) {
                channel.send(message.author + ", that is not a bot channel!");
                return;
            }
            
            servers[server.id].botChannels.remove(botChannel);
            save("servers");
            
            if (servers[server.id].botChannels.length === 0) {
                channel.send("Bot commands are now allowed everywhere!");
            } else {
                channel.send(server.channels.get(botChannel) + " is no longer a bot channel!");
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
                channel.send(message.author + ", please specify a channel.");
                return;
            }
            
            if (!server.channels.find("name", mainChannel) || server.channels.find("name", mainChannel).type != "text") {
                channel.send(message.author + ", that is not a channel!");
                return;
            }
            
            mainChannel = server.channels.find("name", mainChannel).id;
            servers[server.id].mainChannel = mainChannel;
            save("servers");
            channel.send(server.channels.get(mainChannel) + " is now my main channel!");
        }
    },
    
    lewdaccessrole: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the lewd access role.";
        },
        
        command: function (message, server, command, channel) {
            var lewdAccessRole = command[1], servers = permData.servers;
            
            if (!lewdAccessRole) {
                channel.send(message.author + ", please specify a role.");
                return;
            }
            
            if (!server.roles.find("name", lewdAccessRole)) {
                channel.send(message.author + ", that is not a role!");
                return;
            }
            
            servers[server.id].lewdAccessRole = server.roles.find("name", lewdAccessRole).id;
            save("servers");
            channel.send("The '" + lewdAccessRole + "' role has been set as the lewd access role.");
        }
    },
    
    hsifsaccessrole: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the HSiFS access role.";
        },
        
        command: function (message, server, command, channel) {
            var hsifsAccessRole = command[1], servers = permData.servers;
            
            if (!hsifsAccessRole) {
                channel.send(message.author + ", please specify a role.");
                return;
            }
            
            if (!server.roles.find("name", hsifsAccessRole)) {
                channel.send(message.author + ", that is not a role!");
                return;
            }
            
            servers[server.id].hsifsAccessRole = server.roles.find("name", hsifsAccessRole).id;
            save("servers");
            channel.send("The '" + hsifsAccessRole + "' role has been set as the HSiFS access role.");
        }
    },
    
    firerole: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the Fire faction role.";
        },
        
        command: function (message, server, command, channel) {
            var factionRole = command[1], servers = permData.servers;
            
            if (!factionRole) {
                channel.send(message.author + ", please specify a role.");
                return;
            }
            
            if (!server.roles.find("name", factionRole)) {
                channel.send(message.author + ", that is not a role!");
                return;
            }
            
            servers[server.id].factions.fire = server.roles.find("name", factionRole).id;
            save("servers");
            channel.send("The '" + factionRole + "' role has been set as the Fire faction role.");
        }
    },
    
    waterrole: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the Water faction role.";
        },
        
        command: function (message, server, command, channel) {
            var factionRole = command[1], servers = permData.servers;
            
            if (!factionRole) {
                channel.send(message.author + ", please specify a role.");
                return;
            }
            
            if (!server.roles.find("name", factionRole)) {
                channel.send(message.author + ", that is not a role!");
                return;
            }
            
            servers[server.id].factions.water = server.roles.find("name", factionRole).id;
            save("servers");
            channel.send("The '" + factionRole + "' role has been set as the Water faction role.");
        }
    },
    
    earthrole: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the Earth faction role.";
        },
        
        command: function (message, server, command, channel) {
            var factionRole = command[1], servers = permData.servers;
            
            if (!factionRole) {
                channel.send(message.author + ", please specify a role.");
                return;
            }
            
            if (!server.roles.find("name", factionRole)) {
                channel.send(message.author + ", that is not a role!");
                return;
            }
            
            servers[server.id].factions.earth = server.roles.find("name", factionRole).id;
            save("servers");
            channel.send("The '" + factionRole + "' role has been set as the Earth faction role.");
        }
    },
    
    windrole: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: defines `role` as the Wind faction role.";
        },
        
        command: function (message, server, command, channel) {
            var factionRole = command[1], servers = permData.servers;
            
            if (!factionRole) {
                channel.send(message.author + ", please specify a role.");
                return;
            }
            
            if (!server.roles.find("name", factionRole)) {
                channel.send(message.author + ", that is not a role!");
                return;
            }
            
            servers[server.id].factions.wind = server.roles.find("name", factionRole).id;
            save("servers");
            channel.send("The '" + factionRole + "' role has been set as the Wind faction role.");
        }
    },
    
    entrymessage: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <message>`: changes the entry message to `message`. Write '%u' where the username should be.";
        },
        
        command: function (message, server, command, channel) {
            var entryMessage = command[1];
            
            if (!entryMessage) {
                channel.send(message.author + ", please specify a message.");
                return;
            }
            
            if (!entryMessage.contains("%u")) {
                channel.send(message.author + ", the entry message should contain '%u' for the username.");
                return;
            }
            
            permData.servers[server.id].entryMessage = entryMessage;
            save("servers");
            channel.send("The entry message has been changed.");
        }
    },
    
    leavemessage: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <message>`: changes the leave message to `message`. Write '%u' where the username should be.";
        },
        
        command: function (message, server, command, channel) {
            var leaveMessage = command[1];
            
            if (!leaveMessage) {
                channel.send(message.author + ", please specify a message.");
                return;
            }
            
            if (!leaveMessage.contains("%u")) {
                channel.send(message.author + ", the leave message should contain '%u' for the username.");
                return;
            }
            
            permData.servers[server.id].leaveMessage = leaveMessage;
            save("servers");
            channel.send("The leave message has been changed.");
        }
    },
    
    logoutmessage: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <message>`: changes the leave message to `message`.";
        },
        
        command: function (message, server, command, channel) {
            var logoutMessage = command[1];
            
            if (!logoutMessage) {
                channel.send(message.author + ", please specify a message.");
                return;
            }
            
            permData.servers[server.id].logoutMessage = logoutMessage;
            save("servers");
            channel.send("The logout message has been changed.");
        }
    },
    
    defaultreason: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <reason>`: changes the default reason for kicks and bans to `reason`.";
        },
        
        command: function (message, server, command, channel) {
            var defaultReason = command[1];
            
            if (!defaultReason) {
                channel.send(message.author + ", please specify a reason.");
                return;
            }
            
            permData.servers[server.id].defaultReason = defaultReason;
            save("servers");
            channel.send("The default reason has been changed.");
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
            
            channel.send(settingsMessage);
        }
    },
    
    logout: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes me log out.";
        },
        
        command: function (message, server, command, channel) {
            var servers = permData.servers;
            
            var mainChannel = servers[server.id].mainChannel;
            
            if (mainChannel) {
                server.channels.get(mainChannel).send(servers[server.id].logoutMessage).then(function () {
                    bot.destroy();
                    process.exit();
                });
            }
        }
    }
};