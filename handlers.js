module.exports = {
    messageHandler: function (message) {
        var id = message.author.id, channel = message.channel, server = message.guild, content = message.content, lower = content.toLowerCase(), servers = permData.servers, images = permData.images;
        
        var channelType = message.channel.constructor.toString().split(' ')[1], firstChar = content.charAt(0), botMaster = permData.botMaster, musicLocal = permData.musicLocal, musicYouTube = permData.musicYouTube;
        
        /* Command Handler */
        if (COMMAND_SYMBOLS.contains(firstChar) && content.length > 1) {
            var command = content.substring(1, content.length).replace(' ', ARGUMENT_DELIMITER).split(ARGUMENT_DELIMITER);
            
            for (var i in command) {
                if (command[i].length > ARGUMENT_LIMIT && id != botMaster && servers[server.id].botChannels.contains(channel.id)) {
                    message.channel.send(message.author + ", please give me shorter command arguments.");
                    return;
                }
            }
            
            var commandName = command[0].toLowerCase();
            
            if (message.author.id == bot.user.id && commandName == "say") {
                return;
            }
            
            // Alias Check
            aliasesList = serverData[server.id].aliasesList;
            
            if (aliasesList[id] && aliasesList[id].hasOwnProperty(commandName)) {
                commandName = aliasesList[id][commandName];
            }
            
            for (var userId in aliasesList) {
                if (userId != id && aliasesList[userId].hasOwnProperty(commandName) && servers[server.id].botChannels.contains(channel.id)) {
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
            
            // Image Command Check
            if (images.hasOwnProperty(commandName)) {
                if (fs.existsSync("./images/" + images[commandName].file)) {
                    channel.send("", {"file": "./images/" + images[commandName].file});
                
                    if (!permData.servers[server.id].isTestingServer) {
                        cooldown = true;
                        timers.setInterval(function () { cooldown = false; }, serverData[server.id].cooldownSecs * 1000);
                    }
                } else {
                    console.log(timeStamp() + "Image file './images/" + images[commandName].file + "' not found.");
                }
                
                return;
            }
            
            // Command Check
            for (var commandType in allCommands) {
                if (allCommands[commandType][commandName]) {
                    try {
                        if (servers[server.id].isTestingServer || id == botMaster) {
                            allCommands[commandType][commandName].command(message, server, command, channel);
                            return;
                        }
                        
                        if (commandType != "mod" && !servers[server.id].botChannels.contains(channel.id) && servers[server.id].botChannels.length !== 0) {
                            return;
                        }
                        
                        if (commandType == "master" && id != botMaster) {
                            message.channel.send(message.author + ", you do not have sufficient permission to run this command.");
                            return;
                        }
                        
                        var roles = [], rolesArray = server.members.get(id).roles.array();
                        
                        for (var j in rolesArray) {
                            roles.push(rolesArray[j].name);
                        }
                        
                        if (commandType == "secret") {
                            return;
                        }
                        
                        if (commandType == "mod" && !hasModRole(rolesArray)) {
                            message.channel.send(message.author + ", you do not have sufficient permission to run this command.");
                            return;
                        }
                        
                        allCommands[commandType][commandName].command(message, server, command, channel);
                    } catch (err) {
                        message.channel.send("An error occurred while trying to run the `" + firstChar + commandName + "` command: " + err);
                    }
                    
                    return;
                }
            }
        }
        
        /* Kek Detection */
        if (id != bot.user.id && serverData[server.id].kekDetection && servers[server.id].botChannels.contains(channel.id) && (lower.detect("kek") || lower.detect("topkek") || lower.detect("topfuckingkek"))) {
            channel.send("Please don't kek in here.");
        }
        
        /* YouTube Links */
        if (id != bot.user.id && servers[server.id].isTestingServer) {
            var linkPattern = /http(s?):\/\/www.youtube.com\/watch\?v\=[a-zA-Z0-9]+/;
            
            if (linkPattern.test(content)) {
                var vid = linkPattern.exec(content).toString().split('=')[1].slice(0, -2);
                
                request("https://www.googleapis.com/youtube/v3/videos?id=" + vid + "&key=" + permData.youtubeKey + "&part=snippet,statistics", function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        if (!JSON.parse(body).items[0]) {
                            message.channel.send("An error occurred while trying to fetch the YouTube video data.");
                            return;
                        }
                        
                        var date = JSON.parse(body).items[0].snippet.publishedAt, stats = JSON.parse(body).items[0].statistics;
                        
                        message.channel.send("Published: " + correctDateNotation(toLocalTime(date)) + ", " +
                        "Views: " + sep(stats.viewCount) + ", Likes: " + sep(stats.likeCount) + ", Dislikes: " + sep(stats.dislikeCount) + ", Comments: " + sep(stats.commentCount));
                    }
                });
            }
        }
    }
};