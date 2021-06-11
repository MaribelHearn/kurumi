module.exports = {
    imageCommand: function (message, server, channel, commandName) {
        var imageCommand = images[commandName];

        if (server && (!serverData[server.id].botChannels.contains(channel.id) || serverData[server.id].botChannels.length === 0)) {
            channel.send(message.author.username + ", you do not have sufficient permission to run image commands outside bot channels.").catch(console.error);
            return;
        }

        if (fs.existsSync("images/" + images[commandName].file)) {
            channel.send("", {"files": ["images/" + images[commandName].file]}).catch(console.error);
            cooldown = true;

            if (server) {
                timers.setInterval(function () { cooldown = false; }, serverData[server.id].cooldownSecs * 1000);
            }
        } else {
            console.log(timeStamp() + "Image file 'images/" + images[commandName].file + "' not found.");
        }
    },

    musicCommand: function (message, server, channel, commandName) {
        var musicCommand = musicLocal[commandName];

        if (!server) {
            channel.send("Music commands can only be used on servers.").catch(console.error);
            return;
        }

        if (serverData[server.id].botChannels.length === 0 || !serverData[server.id].botChannels.contains(channel.id)) {
            channel.send(message.author.username + ", you do not have sufficient permission to run music commands outside bot channels.").catch(console.error);
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

    parse: function (content, commandName, argc) {
        var quote = false, escape = false, current = "", command = [commandName], character, i, j;

        if (argc >= 1) {
            content = content.slice(1).replace(commandName, "").trim();

            if (argc === 1 && content !== "") {
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

    runInDM: function (message, server, command, channel, commandType, commandFunction, id, botMaster) {
        if ((commandType == "mod" || commandType == "master") && id != botMaster) {
            channel.send("You do not have sufficient permission to run this command.").catch(console.error);
            return;
        }

        if (isServerOnly(commandFunction)) {
            channel.send("That command can only be used on servers.").catch(console.error);
            return;
        }

        commandFunction(message, server, command, channel);
    },

    messageHandler: function (message) {
        var id = message.author.id, channel = message.channel, server = message.guild, content = message.content,
            lower = content.toLowerCase(), firstChar = content.charAt(0), images = permData.images, commandType,
            musicLocal = permData.musicLocal, botMaster = permData.botMaster, commandFunction, argc, command;

        content = content.replace(/\n|\r/g, ' ');

        if (permData.commandSymbols.contains(firstChar) && content.length > 1 && id != bot.user.id) {
            try {
                if (permData.maintenanceMode && (!server || !serverData[server.id].isTestingServer)) {
                    channel.send(message.author.username + ", commands are currently disabled due to maintenance. They will return soon!").catch(console.error);
                    return;
                }

                var commandName = content.slice(1).split(' ')[0];

                if (aliasToOriginal(commandName)) {
                    content = content.replace(commandName, aliasToOriginal(commandName));
                    commandName = aliasToOriginal(commandName);
                }

                if (musicLocal.hasOwnProperty(commandName)) {
                    this.musicCommand(message, server, channel, commandName);
                    return;
                }

                if (images.hasOwnProperty(commandName)) {
                    this.imageCommand(message, server, channel, commandName);
                    return;
                }

                commandType = this.typeOf(commandName);

                if (!commandType) {
                    return; // command does not exist
                }

                commandFunction = allCommands[commandType][commandName].command;
                argc = getArgc(commandFunction);
                command = this.parse(content, commandName, argc);

                // Strip Markdown and Argument Length Limit
                for (i in command) {
                    command[i] = stripMarkdown(command[i]);

                    if (command[i] === "") {
                        command.splice(i, 1);
                        i -= 1;
                    }

                    if (command[i].length > permData.maxLength && id != botMaster && (!server || serverData[server.id].botChannels.contains(channel.id))) {
                        channel.send(message.author.username + ", please give me shorter command arguments.").catch(console.error);
                        return;
                    }
                }

                if (!server) {
                    runInDM(message, server, command, channel, commandType, commandFunction, id, botMaster);
                    return;
                }

                if (id == botMaster) { // always allow commands run by the master
                    commandFunction(message, server, command, channel);
                    return;
                }

                if (commandType != "master" && commandType != "mod" && !serverData[server.id].botChannels.contains(channel.id)) {
                    return; // no non-authority commands outside bot channels
                }

                if (commandType == "master" && id != botMaster) {
                    channel.send(message.author.username + ", you do not have sufficient permission to run this command.").catch(console.error);
                    return;
                }

                if (commandType == "mod" && !server.members.resolve(message.author.id).hasPermission("BAN_MEMBERS")) {
                    channel.send(message.author.username + ", you do not have sufficient permission to run this command.").catch(console.error);
                    return;
                }
            } catch (err) {
                channel.send("An error occurred while trying to handle the `" + firstChar + commandName + "` command: " + err).catch(console.error);
            }

            try {
                commandFunction(message, server, command, channel);
            } catch (err) {
                channel.send("An error occurred while trying to run the `" + firstChar + commandName +
                "` command: " + err).catch(console.error);
            }

            return;
        }

        /* Kek Detection */
        if (id != bot.user.id && server && serverData[server.id].kekDetection && serverData[server.id].botChannels.contains(channel.id) && (lower.detect("kek") || lower.detect("topkek") || lower.detect("topfuckingkek"))) {
            channel.send("Please don't kek in here.").catch(console.error);
        }

        /* YouTube Links */
        if (permData.googleKey !== "" && id != bot.user.id) {
            var linkPattern = /http(s?):\/\/www.youtube.com\/watch\?v\=[a-zA-Z0-9_]+/;

            if (linkPattern.test(content)) {
                var vid = linkPattern.exec(content).toString().split('=')[1].slice(0, -2);

                request(googleUrl(vid), function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        if (!JSON.parse(body).items[0]) {
                            channel.send("An error occurred while trying to fetch the YouTube video data.").catch(console.error);
                            return;
                        }

                        var date = JSON.parse(body).items[0].snippet.publishedAt.UTC(), stats = JSON.parse(body).items[0].statistics;

                        channel.send("Published: " + date + ", " + "Views: " + sep(stats.viewCount) + ", Likes: " + sep(stats.likeCount) +
                        ", Dislikes: " + sep(stats.dislikeCount) + ", Comments: " + sep(stats.commentCount)).catch(console.error);
                    }
                });
            }
        }
    }
};
