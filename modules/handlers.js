module.exports = {
    imageCommand: function (message, server, channel, commandName) {
        var imageCommand = permData.images[commandName];

        if (server && (!serverData[server.id].botChannels.contains(channel.id) || serverData[server.id].botChannels.length === 0)) {
            return;
        }

        if (fs.existsSync("images/" + imageCommand.file)) {
            channel.send("", {"files": ["images/" + imageCommand.file]}).catch(console.error);
            cooldown = true;

            if (server) {
                timers.setInterval(function () { cooldown = false; }, serverData[server.id].cooldownSecs * 1000);
            }
        } else {
            channel.send("Image command failed to run: file not found.").catch(console.error);
            console.log(timeStamp() + "Image file 'images/" + imageCommand.file + "' not found.");
        }
    },

    musicCommand: function (message, server, channel, commandName) {
        var musicCommand = permData.musicLocal[commandName];

        if (!server) {
            channel.send("Music commands can only be used on servers.").catch(console.error);
            return;
        }

        if (serverData[server.id].botChannels.length === 0 || !serverData[server.id].botChannels.contains(channel.id)) {
            return;
        }

        if (!serverData[server.id].voiceChannel) {
            channel.send(message.author.username + ", music commands are currently unusable, since I have not been assigned a voice channel.").catch(console.error);
            return;
        }

        if (musicBlocked) {
            channel.send(message.author.username + ", music commands are currently blocked.").catch(console.error);
            return;
        }

        if (!fs.existsSync("music/" + musicCommand.file)) {
            channel.send("Music command failed to run: file not found.").catch(console.error);
            console.log(timeStamp() + "Music file 'music/" + musicCommand.file + "' not found.");
            return;
        }

        if (!serverData[server.id].interruptionMode) {
            if (!serverData[server.id].queue || serverData[server.id].queue.length === 0) {
                serverData[server.id].queue = [commandName];
                playLocal(server, musicCommand.file, musicCommand.volume);
            } else {
                serverData[server.id].queue.push(commandName);
            }

            save("queue", server);
        } else {
            playLocal(server, musicCommand.file, musicCommand.volume);
        }
    },

    typeOf: function (commandName) {
        var type = false, commandType;

        for (commandType in allCommands) {
            if (allCommands[commandType][commandName]) {
                type = commandType;
                break;
            }
        }

        return type;
    },

    maxArgc: function (commandFunction) {
        var string = commandFunction.toString(), result = 0, i;

        for (i = 1; i < GLOBAL_MAX_ARGC; i++) {
            if (string.contains("command[" + i + "]")) {
                result += 1;
            }
        }

        return result;
    },

    parse: function (content, commandName, maxArgc) {
        var quote = false, escape = false, current = "", command = [commandName], character, i, j;

        if (maxArgc >= 1) {
            content = content.slice(1).replace(commandName, "").trim();

            if (maxArgc === 1 && content !== "") {
                command.push(content);
            } else {
                for (j = 0; j < content.length; j++) {
                    character = content.charAt(j);

                    if (character == '\\') {
                        escape = true;
                        continue;
                    }

                    if (character == '"' && !escape) {
                        quote = !quote;
                        continue;
                    }

                    escape = false;

                    if (character == ' ' && !quote) {
                        command.push(current);
                        current = "";
                        continue;
                    }

                    current += character;
                }

                command.push(current);
            }
        }

        return command;
    },

    validate: function (message, server, command, channel, commandObject) {
        if (commandObject.args && command.length < commandObject.args.length) {
            channel.send((server ? message.author.username + ", p" : "P") + "lease specify " + commandObject.args[command.length]);
            return false;
        }

        for (var i = 1; i < command.length; i++) {
            command[i] = stripMarkdown(command[i]);

            if (command[i] === "") {
                command.splice(i, 1);
                i -= 1;
            }

            if (command[i].length > permData.maxLength && (!server || serverData[server.id].botChannels.contains(channel.id))) {
                channel.send((server ? message.author.username + ", p" : "P") + "lease specify shorter command arguments.").catch(console.error);
                return false;
            }

            if (commandObject.args && commandObject.args[i] && commandObject.args[i].startsWith("a number") && isNaN(command[i])) {
                channel.send((server ? message.author.username + ", p" : "P") + "lease specify " + commandObject.args[command.length]);
                return false;
            }
        }

        return true;
    },

    permitted: function (message, server, channel, commandType, commandFunction, id, botMaster) {
        var userIsMod = server.members.cache.get(id).hasPermission("BAN_MEMBERS");

        if (!server && isServerOnly(commandFunction)) {
            channel.send("That command can only be used on servers.").catch(console.error);
            return false;
        }

        if (id == botMaster) {
            return true;
        }

        if (!userIsMod && !serverData[server.id].botChannels.contains(channel.id)) {
            return false;
        }

        if (commandType == "master") {
            channel.send(message.author.username + ", you do not have sufficient permission to run this command.").catch(console.error);
            return false;
        }

        if (commandType == "mod" && !userIsMod) {
            channel.send(message.author.username + ", you do not have sufficient permission to run this command.").catch(console.error);
            return false;
        }

        return true;
    },

    commandHandler: function (message, server, channel, content, symbol) {
        var id = message.author.id, botMaster = permData.botMaster, commandName, commandType,
            commandObject, userIsMod, maxArgc, command, valid, permitted;

        try {
            if (permData.maintenanceMode && (!server || !serverData[server.id].isTestingServer)) {
                channel.send(message.author.username + ", commands are currently disabled due to maintenance. They will return soon!").catch(console.error);
                return;
            }

            commandName = content.slice(1).split(' ')[0];

            if (aliasToOriginal(commandName)) {
                content = content.replace(commandName, aliasToOriginal(commandName));
                commandName = aliasToOriginal(commandName);
            }

            if (permData.musicLocal.hasOwnProperty(commandName)) {
                this.musicCommand(message, server, channel, commandName);
                return;
            }

            if (permData.images.hasOwnProperty(commandName)) {
                this.imageCommand(message, server, channel, commandName);
                return;
            }

            commandType = this.typeOf(commandName);

            if (!commandType) { // command does not exist
                return;
            }

            commandObject = allCommands[commandType][commandName];
            maxArgc = this.maxArgc(commandObject.command);
            command = this.parse(content, commandName, maxArgc);
            valid = this.validate(message, server, command, channel, commandObject);
            permitted = (valid ? this.permitted(message, server, channel, commandType, commandObject.command, id, botMaster) : false);

            try {
                if (valid && permitted) {
                    commandObject.command(message, server, command, channel);
                }
            } catch (err) {
                channel.send("An error occurred while trying to run the `" + symbol + commandName +
                "` command: " + err).catch(console.error);
            }
        } catch (err) {
            channel.send("An error occurred while trying to handle the `" + symbol + commandName + "` command: " + err).catch(console.error);
            return;
        }
    },

    detectKek: function (server, channel, lower) {
        var kekDetected = lower.detect("kek") || lower.detect("topkek") || lower.detect("topfuckingkek");

        if (server && serverData[server.id].kekDetection && serverData[server.id].botChannels.contains(channel.id) && kekDetected) {
            channel.send("Please don't kek in here.").catch(console.error);
        }
    },

    youtubeHandler: function (channel, content) {
        var linkPattern = /http(s?):\/\/www.youtube.com\/watch\?v\=[a-zA-Z0-9_]+/, vid, date;

        if (linkPattern.test(content)) {
            vid = linkPattern.exec(content).toString().split('=')[1].slice(0, -2);
            request(googleUrl(vid), function (error, response, body) {
                if (!response) {
                    channel.send("Failed to fetch YouTube video data.").catch(console.error);
                    return;
                }

                if (!error && response.statusCode == 200) {
                    if (!JSON.parse(body).items[0]) {
                        channel.send("An error occurred while trying to fetch the YouTube video data.").catch(console.error);
                        return;
                    }

                    date = JSON.parse(body).items[0].snippet.publishedAt.UTC(), stats = JSON.parse(body).items[0].statistics;
                    channel.send("Published: " + date + ", " + "Views: " + sep(stats.viewCount) + ", Likes: " + sep(stats.likeCount) +
                    ", Dislikes: " + sep(stats.dislikeCount) + ", Comments: " + sep(stats.commentCount)).catch(console.error);
                } else {
                    channel.send("Error " + response.statusCode + " " + camel(response.statusMessage) + ".").catch(console.error);
                }
            });
        }
    },

    messageHandler: function (message) {
        var channel = message.channel, server = message.guild, content = message.content.replace(/\n|\r/g, ' '),
            symbol = content.charAt(0);

        if (permData.commandSymbols.contains(symbol) && content.length > 1) {
            this.commandHandler(message, server, channel, content, symbol);
            return;
        }

        this.detectKek(server, channel, content.toLowerCase());

        if (permData.googleKey !== "") {
            this.youtubeHandler(channel, content);
        }
    }
};
