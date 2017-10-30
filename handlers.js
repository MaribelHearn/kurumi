module.exports = {
    messageHandler: function (message) {
        var id = message.author.id, channel = message.channel, server = message.guild, content = message.content, lower = content.toLowerCase(), servers = permData.servers, images = permData.images;
        
        var channelType = message.channel.type, firstChar = content.charAt(0), botMaster = permData.botMaster, musicLocal = permData.musicLocal, musicYouTube = permData.musicYouTube;
        
        /* Command Handler */
        if (permData.commandSymbols.contains(firstChar) && content.length > 1) {
            try {
                // Maintenance Mode
                if (permData.maintenanceMode && (!server || !permData.servers[server.id].isTestingServer)) {
                    message.channel.send(message.author + ", commands are currently disabled due to maintenance. They will return soon!");
                    return;
                }
                
                // Get command name
                var commandName = content.slice(1).split(' ')[0];
                
                // No aliases or music commands in DMs
                if (server) {
                    // Alias Check
                    aliasesList = serverData[server.id].aliasesList;
                
                    if (aliasesList[id] && aliasesList[id].hasOwnProperty(commandName)) {
                        content = content.replace(commandName, aliasesList[id][commandName]);
                        commandName = aliasesList[id][commandName];
                    }
                    
                    for (var userId in aliasesList) {
                        if (userId != id && aliasesList[userId].hasOwnProperty(commandName) && (!server || servers[server.id].botChannels.contains(channel.id))) {
                            message.channel.send(message.author + ", that is someone's alias for the `" + firstChar + aliasesList[userId][commandName] + "` command!");
                            return;
                        }
                    }
                
                    // Music Command Check
                    if (musicLocal.hasOwnProperty(commandName) || musicYouTube.hasOwnProperty(commandName)) {
                        var musicCommand = (musicLocal.hasOwnProperty(commandName) ? musicLocal[commandName] : musicYouTube[commandName]);
                        
                        if (!servers[server.id].voiceChannel) {
                            channel.send(message.author + ", music commands are currently unusable, since I have not been assigned a voice channel.");
                            return;
                        }
                        
                        if (musicBlocked) {
                            message.channel.send(message.author + ", music commands are currently blocked.");
                            return;
                        }
                    
                        if (musicLocal.hasOwnProperty(commandName)) {
                            playLocal(server, musicCommand.file, musicCommand.volume);
                        } else {
                            playYouTube(server, musicCommand.link, musicCommand.volume);
                        }
                        
                        return;
                    }
                }
                
                // Image Command Check
                if (images.hasOwnProperty(commandName)) {
                    if (fs.existsSync("./images/" + images[commandName].file)) {
                        channel.send("", {"file": "./images/" + images[commandName].file});
                        cooldown = true;
                        
                        if (server) {
                            timers.setInterval(function () { cooldown = false; }, servers[server.id].cooldownSecs * 1000);
                        }
                    } else {
                        console.log(timeStamp() + "Image file './images/" + images[commandName].file + "' not found.");
                    }
                    
                    return;
                }
                
                // Existence Check
                var found = false, commandType;
                
                for (commandType in allCommands) {
                    if (allCommands[commandType][commandName]) {
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    return;
                }
                
                // Command Parser
                var commandFunction = allCommands[commandType][commandName].command, argc = getArgc(commandFunction), quote = false, escape = false, current = "", command = [commandName], character, i, j;
                
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
    
                // Argument Length Limit
                for (i in command) {
                    if (command[i].length > permData.maxLength && id != botMaster && (!server || servers[server.id].botChannels.contains(channel.id))) {
                        message.channel.send(message.author + ", please give me shorter command arguments.");
                        return;
                    }
                }
                
                // DM Handler
                if (channelType == "dm") {
                    if ((commandType == "mod" || commandType == "master") && id != botMaster) {
                        message.channel.send("You do not have sufficient permission to run this command.");
                        return;
                    }
                    
                    if (commandFunction.toString().contains("server.") && commandFunction.toString().indexOf("server.") != commandFunction.toString().indexOf("server.id].cooldownSecs")) {
                        message.channel.send("That command can only be used on servers.");
                        return;
                    }
                    
                    commandFunction(message, server, command, channel);
                    return;
                }
                
                // Always allow commands in testing servers or run by the master
                if (servers[server.id].isTestingServer || id == botMaster) {
                    commandFunction(message, server, command, channel);
                    return;
                }
                
                // No non-authority commands outside bot channels
                if (commandType != "master" && commandType != "mod" && !servers[server.id].botChannels.contains(channel.id) && servers[server.id].botChannels.length !== 0) {
                    return;
                }
                
                // Permissions
                if (commandType == "master" && id != botMaster) {
                    message.channel.send(message.author + ", you do not have sufficient permission to run this command.");
                    return;
                }
                
                var roles = [], rolesArray = server.members.get(id).roles.array(), k;
                
                for (k = 0; k < rolesArray.length; k++) {
                    roles.push(rolesArray[k].name);
                }
                
                if (commandType == "mod" && !hasModRole(rolesArray)) {
                    message.channel.send(message.author + ", you do not have sufficient permission to run this command.");
                    return;
                }
                
                // Run the command
                commandFunction(message, server, command, channel);
            } catch (err) {
                message.channel.send("An error occurred while trying to run the `" + firstChar + commandName + "` command: " + err);
            }
            
            return;
        }
        
        /* Kek Detection */
        if (id != bot.user.id && servers[server.id].kekDetection && servers[server.id].botChannels.contains(channel.id) && (lower.detect("kek") || lower.detect("topkek") || lower.detect("topfuckingkek"))) {
            channel.send("Please don't kek in here.");
        }
        
        /* YouTube Links */
        if (permData.googleKey !== "" && id != bot.user.id) {
            var linkPattern = /http(s?):\/\/www.youtube.com\/watch\?v\=[a-zA-Z0-9_]+/;
            
            if (linkPattern.test(content)) {
                var vid = linkPattern.exec(content).toString().split('=')[1].slice(0, -2);
                
                request(googleUrl(vid), function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        if (!JSON.parse(body).items[0]) {
                            message.channel.send("An error occurred while trying to fetch the YouTube video data.");
                            return;
                        }
                        
                        var date = JSON.parse(body).items[0].snippet.publishedAt.UTC(), stats = JSON.parse(body).items[0].statistics;
                        
                        message.channel.send("Published: " + date + ", " +
                        "Views: " + sep(stats.viewCount) + ", Likes: " + sep(stats.likeCount) + ", Dislikes: " + sep(stats.dislikeCount) + ", Comments: " + sep(stats.commentCount));
                    }
                });
            }
        }
    }
};