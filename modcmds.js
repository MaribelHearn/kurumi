﻿module.exports = {
    kick: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <user>^[reason]`: kicks `user` for `reason`.";
        },
        
        command: function (message, server, command, channel) {
            var toBeKicked = command[1];
            
            if (!toBeKicked) {
                channel.send(message.author + ", please specify the user to be kicked.");
                return;
            }
            
            var members = toUsers(server.members);
            
            toBeKicked = toBeKicked.toLowerCase();
            
            if (members.hasOwnProperty(toBeKicked)) {
                var reason = (command[2] ? command[2] : permData.servers[server.id].defaultReason);
                
                channel.send("**" + members[toBeKicked].username + "** has been kicked from the server! [Reason: " + reason + "]");
                server.members.get(members[toBeKicked].id).kick();
                return;
            }
            
            channel.send(message.author + ", there is no such user on this server.");
        }
    },
    
    ban: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <user>^[reason]^[deletedays]`: bans `user` for `reason` and deletes their messages from the last `deletedays` days (default 0).";
        },
        
        command: function (message, server, command, channel) {
            var toBeBanned = command[1];
            
            if (!toBeBanned) {
                channel.send(message.author + ", please specify the user to be kicked.");
                return;
            }
            
            var members = toUsers(server.members);
            
            toBeBanned = toBeBanned.toLowerCase();
            
            if (members.hasOwnProperty(toBeBanned)) {
                var reason = (command[2] ? command[2] : permData.servers[server.id].defaultReason);
                
                var deleteDays = (command[3] ? command[3] : 0);
                
                if (isNaN(deleteDays) || deleteDays < 0 || deleteDays > 7) {
                    channel.send(message.author + ", please specify a valid number of delete days (must be 0 to 7).");
                    return;
                }
                
                channel.send("**" + members[toBeBanned].username + "** has been banned from the server! [Reason: " + reason + "]");
                server.members.get(members[toBeBanned].id).ban(Math.round(deleteDays));
                return;
            }
            
            channel.send(message.author + ", there is no such user on this server.");
        }
    },
    
    kurumute: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <user>^[reason]`: mutes `user` for `reason`.";
        },
        
        command: function (message, server, command, channel) {
            var toBeMuted = command[1];
            
            if (!toBeMuted) {
                channel.send(message.author + ", please specify the user to be muted.");
                return;
            }
            
            var members = server.members.array(), user, reason;
            
            toBeMuted = toBeMuted.toLowerCase();
            
            for (var i = 0; i < members.length; i++) {
                user = members[i].user;
                
                if (user.username.toLowerCase() === toBeMuted) {
                    serverData[server.id].mutes.push(user.id);
                    reason = (command[2] ? command[2] : permData.servers[server.id].defaultReason);
                    channel.send("**" + user + "** has been muted indefinitely! [Reason: " + reason + "]");
                    save("mutes", server);
                    return;
                }
            }
            
            channel.send(message.author + ", there is no such user on this server.");
        }
    },
    
    unmute: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <user>`: unmutes `user`.";
        },
        
        command: function (message, server, command, channel) {
            var toBeUnmuted = command[1];
            
            if (!toBeUnmuted) {
                channel.send(message.author + ", please specify the user to be unmuted.");
                return;
            }
            
            var members = server.members.array(), user;
            
            toBeUnmuted = toBeUnmuted.toLowerCase();
                
            for (var i = 0; i < members.length; i++) {
                user = members[i].user;
                
                if (user.username.toLowerCase() === toBeUnmuted) {
                    if (serverData[server.id].mutes[user.id]) {
                        serverData[server.id].mutes.remove(user.id);
                        channel.send("**" + user + "** has been unmuted! They can speak again!");
                        save("mutes", server);
                        return;
                    }
                    
                    channel.send(message.author + ", that user is not muted!");
                    return;
                }
            }
            
            channel.send(message.author + ", there is no such user on this server!");
        }
    },
    
    reset: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: resets the RNG-generated values.";
        },
        
        command: function (message, server, command, channel) {
            serverData[server.id].waifus = {};
            serverData[server.id].touhouWaifus = {};
            serverData[server.id].fanmemeWaifus = {};
            serverData[server.id].lenenWaifus = {};
            serverData[server.id].ratings = {};
            save("waifus", server);
            save("touhouWaifus", server);
            save("ratings", server);
            channel.send("RNG-generated values have been reset.");
        }
    },
    
    removequote: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <user>^<quote>`: removes `quote` from `user`'s quotes.";
        },
        
        command: function (message, server, command, channel) {
            var user = command[1], quotes = serverData[server.id].quotes;
            
            if (!user) {
                channel.send(message.author + ", please specify a user to remove a quote from.");
                return;
            }
            
            var quote = command[2];
            
            if (!quote) {
                channel.send(message.author + ", please specify a quote to remove.");
                return;
            }
            
            var members = toUsers(server.members), id;
            
            user = user.toLowerCase();
            
            if (members.hasOwnProperty(user)) {
                id = members[user].id;
            } else {
                channel.send(message.author + ", there is no such user on this server.");
                return;
            }
            
            if (!quotes[id]) {
                channel.send(message.author + ", that user does not have any saved quotes.");
                return;
            }
            
            quotes[id].remove(quote);
            
            if (quotes[id].length === 0) {
                delete quotes[id];
            }
            
            save("quotes", server);
            channel.send("Quote removed.");
        }
    },
    
    say: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <message>`: will make me post `message` in the bot spam channel.";
        },
        
        command: function (message, server, command, channel) {
            command.splice(0, 1);
            
            var post = command.join(ARGUMENT_DELIMITER);
            
            var mainChannel = permData.servers[server.id].mainChannel;
            
            if (mainChannel) {
                server.channels.get(mainChannel).sendMessage(post);
            }
        }
    },
    
    game: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [game]`: will make me play `game`. If `game` is not specified, removes my game.";
        },
        
        command: function (message, server, command, channel) {
            if (!command[1]) {
                bot.user.setGame(null);
                return;
            }
            
            command.splice(0, 1);
            command = command.join(ARGUMENT_DELIMITER);
            bot.user.setGame(command);
        }
    },
    
    avatar: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [URL]`: will give me the avatar linked to by `URL`. If `URL` is not specified, resets my avatar to the default one.";
        },
        
        command: function (message, server, command, channel) {
            if (!command[1]) {
                bot.user.setAvatar("./images/avatar.png");
                return;
            }
            
            command.splice(0, 1);
            command = command.join(ARGUMENT_DELIMITER);
            bot.user.setAvatar(command);
        }
    },
    
    cooldown: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [seconds]`: changes the cooldown seconds for big commands to `seconds` (default 15).";
        },
        
        command: function (message, server, command, channel) {
            var seconds = command[1] ? Number(command[1]) : DEFAULT_COOLDOWN;
            
            serverData[server.id].cooldownSecs = seconds;
            save("cooldownSecs", server);
            channel.send("Big command cooldown set to " + seconds + " seconds.");
        }
    },
    
    updatewr: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <game>^<difficulty>^<shottype/route>^<new WR>^<player>^[replay]`: updates the world record in `game` `difficulty` `shottype/route` to `new WR` by `player`.";
        },
        
        command: function (message, server, command, channel) {
            var game = command[1], WRs = permData.WRs;
            
            if (!game) {
                channel.send(message.author + ", please specify a game to update a world record of.");
                return;
            }
            
            game = gameName(game.toLowerCase());
            
            if (!WRs[game]) {
                channel.send(message.author + ", please specify a valid game to update a world record of.");
                return;
            }
            
            var difficulty = command[2];
            
            if (!difficulty) {
                channel.send(message.author + ", please specify a difficulty to update a world record of.");
                return;
            }
            
            difficulty = cap(difficulty.toLowerCase());
            
            if (!WRs[game][difficulty]) {
                channel.send(message.author + ", please specify a valid difficulty to update a world record of.");
                return;
            }
            
            var shot = command[3], difficultyWRs = WRs[game][difficulty];
            
            if (!shot) {
                channel.send(message.author + ", please specify a shottype or route to update the world record of.");
                return;
            }
             
            if (shot) {
                shot = (shotName(cap(shot)) ? shotName(cap(shot)) : cap(shot));
                
                if (shot.contains("team")) {
                    shot = shot.replace(/team/i, "Team").replace(/ /gi, "");
                }
                
                if (!WRs[game][difficulty][shot]) {
                    channel.send(message.author + ", " + shot + " is not a valid shottype or route.");
                    return;
                }
            }
            
            var newWR = command[4];
            
            if (!newWR || isNaN(newWR.replace(/\./g, "").replace(/\,/g, ""))) {
                channel.send(message.author + ", please specify the new world record.");
                return;
            }
            
            if (Number(newWR) > MAX_SCORE || Number(newWR) <= 0) {
                channel.send(message.author + ", please specify a valid new world record.");
                return;
            }
            
            newWR = Number(newWR.replace(/\./g, "").replace(/\,/g, ""));
            
            var newPlayer = command[5];
            
            if (!newPlayer) {
                channel.send(message.author + ", please specify the player that got the new world record.");
                return;
            }
            
            var replay = command[6], oldWR, oldPlayer;
            
            if (!replay) {
                replay = "";
            }
            
            oldWR = WRs[game][difficulty][shot][0];
            oldPlayer = WRs[game][difficulty][shot][1];
            WRs[game][difficulty][shot] = [newWR, newPlayer, replay];
            permData.WRsLastUpdated = correctDateNotation(toLocalTime(new Date().toISOString()));
            save("WRs");
            save("WRsLastUpdated");
            channel.send(server.emojis.find("name", "Scoarr") + " `Score Update` New WR in " + game + " " + difficulty +
            " " + shot.replace("Team", " Team") + ": " + sep(oldWR) + " by " + oldPlayer + " -> " + sep(newWR) + " by " + newPlayer + "!");
        }
    },
    
    acceptwr: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <game>^<difficulty>^<shottype/route>`: accepts the new world record in `game` `difficulty` `shottype/route` from the notification queue as being valid, updating the world records in the process.";
        },
        
        command: function (message, server, command, channel) {
            var game = command[1], WRs = permData.WRs;
            
            if (!game) {
                channel.send(message.author + ", please specify a game to update a world record of.");
                return;
            }
            
            game = gameName(game.toLowerCase());
            
            if (!WRs[game]) {
                channel.send(message.author + ", please specify a valid game to update a world record of.");
                return;
            }
            
            var difficulty = command[2];
            
            if (!difficulty) {
                channel.send(message.author + ", please specify a difficulty to update a world record of.");
                return;
            }
            
            difficulty = cap(difficulty.toLowerCase());
            
            if (!WRs[game][difficulty]) {
                channel.send(message.author + ", please specify a valid difficulty to update a world record of.");
                return;
            }
            
            var shot = command[3], difficultyWRs = WRs[game][difficulty];
            
            if (!shot) {
                channel.send(message.author + ", please specify a shottype or route to update the world record of.");
                return;
            }
             
            if (shot) {
                shot = (shotName(cap(shot)) ? shotName(cap(shot)) : cap(shot));
                
                if (shot.contains("team")) {
                    shot = shot.replace(/team/i, "Team").replace(/ /gi, "");
                }
                
                if (!WRs[game][difficulty][shot]) {
                    channel.send(message.author + ", please specify a valid shottype or route to update the world record of.");
                    return;
                }
            }
            
            var queueItem, oldWR, oldPlayer, newWR, newPlayer, replay;
            
            queueItem = findQueueItem(game, difficulty, shot);
            
            if (queueItem === null) {
                channel.send(message.author + ", there is no new score in that category!");
                return;
            }
            
            oldWR = WRs[game][difficulty][shot][0];
            oldPlayer = WRs[game][difficulty][shot][1];
            newWR = queueItem[0];
            newPlayer = queueItem[1];
            replay = queueItem[2];
            WRs[game][difficulty][shot] = [newWR, newPlayer, replay];
            permData.WRsLastUpdated = correctDateNotation(toLocalTime(new Date().toISOString()));
            permData.notifyQueue.remove(queueItem);
            save("WRs");
            save("WRsLastUpdated");
            save("notifyQueue");
            channel.send(server.emojis.find("name", "Scoarr") + " `Score Update` New WR in " + game + " " + difficulty +
            " " + shot.replace("Team", " Team") + ": " + sep(oldWR) + " by " + oldPlayer + " -> " + sep(newWR) + " by " + newPlayer + "!");
        }
    },
    
    purgewrs: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: purges the notification queue.";
        },
        
        command: function (message, server, command, channel) {
            permData.notifyQueue = [];
            save("notifyQueue");
            channel.send("The notification queue has been purged!");
        }
    },
    
    queue: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: shows the current notification queue for world record updates.";
        },
        
        command: function (message, server, command, channel) {
            var queue = permData.notifyQueue, message = "", index = 1, game, difficulty, shot, score;
            
            if (queue.length === 0) {
                channel.send("The notification queue is currently empty.");
                return;
            }
            
            for (var item in queue) {
                game = queue[item][3];
                difficulty = queue[item][4];
                shot = queue[item][5];
                score = sep(queue[item][0]);
                message += index + ". " + game + " " + (game.length == 3 ? " " : "") + difficulty + " " + spaces(7 - difficulty.length) + shot +
                " " + spaces(11 - shot.length) + score + " " + spaces(13 - score.length) + "by " + queue[item][1] + "\n";
                index++;
            }
            
            channel.send("```Markdown\n" + message + "\n```");
        }
    },
    
    joinvoice: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes me join the voice channel.";
        },
        
        command: function (message, server, command, channel) {
            var servers = permData.servers;
            
            if (!servers[server.id].voiceChannel) {
                channel.send(message.author + ", please tell me which voice channel to use (using the voicechannel command).");
                return;
            }
            
            var voiceChannel = server.channels.get(servers[server.id].voiceChannel);
            
            if (!voiceChannel.connection === null) {
                channel.send(message.author + ", I am already in the voice channel!");
                return;
            }
            
            voiceChannel.join().then(connection => channel.send(message.author + ", I have connected to the voice channel.")).catch(console.error);
        }
    },
    
    leavevoice: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes me leave the voice channel.";
        },
        
        command: function (message, server, command, channel) {
            var servers = permData.servers;
            
            if (!servers[server.id].voiceChannel) {
                channel.send(message.author + ", please tell me which voice channel to use (using the voicechannel command).");
                return;
            }
            
            var voiceChannel = server.channels.get(servers[server.id].voiceChannel);
            
            if (voiceChannel.connection === null) {
                channel.send(message.author + ", I am not in the voice channel!");
                return;
            }
            
            voiceChannel.leave();
        }
    },
    
    togglemusic: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: blocks or unblocks music commands indefinitely.";
        },
        
        command: function (message, server, command, channel) {
            var servers = permData.servers;
            
            if (!servers[server.id].voiceChannel) {
                channel.send(message.author + ", please tell me which voice channel to use (using the voicechannel command).");
                return;
            }
            
            var voiceChannel = server.channels.get(servers[server.id].voiceChannel);
            
            if (!musicBlocked && voiceChannel.connection !== null) {
                voiceChannel.leave();
            }
            
            musicBlocked = !musicBlocked;
            channel.send("Music commands have been " + (!musicBlocked ? "un" : "") + "blocked!");
        }
    },
    
    voicechannel: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <voicechannel>`: makes `voicechannel` my voice channel.";
        },
        
        command: function (message, server, command, channel) {
            var voiceChannel = command[1];
            
            if (!voiceChannel) {
                channel.send(message.author + ", please specify a voice channel.");
                return;
            }
            
            if (!server.channels.find("name", voiceChannel) || server.channels.find("name", voiceChannel).type != "voice") {
                channel.send(message.author + ", that is not a voice channel!");
                return;
            }
            
            permData.servers[server.id].voiceChannel = server.channels.find("name", voiceChannel).id;
            save("servers");
            channel.send(message.author + ", I will now use " + voiceChannel + "!");
        }
    },
    
    togglekek: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: turns kek detection on or off.";
        },
        
        command: function (message, server, command, channel) {
            serverData[server.id].kekDetection = !serverData[server.id].kekDetection;
            save("kekDetection", server);
            channel.send("Kek detection has been turned **" + (serverData[server.id].kekDetection ? "on" : "off") + "**.");
        }
    },
    
    unusedroles: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: lists all unused roles.";
        },
        
        command: function (message, server, command, channel) {
            var roles = server.roles.array(), unusedRoles = [], role;
            
            for (role in roles) {
                if (roles[role].members.size === 0) {
                    unusedRoles.push(roles[role].name);
                }
            }
            
            channel.send(unusedRoles.length === 0 ? "There are no unused roles." : "Unused roles: " + unusedRoles);
        }
    },
    
    master: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes you the bot master. Testing server only.";
        },
        
        command: function (message, server, command, channel) {
            if (!permData.servers[server.id].isTestingServer) {
                channel.send(message.author + ", this command cannot be used on this server.");
                return;
            }
            
            permData.botMaster = message.author.id;
            save("botMaster");
            channel.send(message.author + ", you are now my master!");
        }
    }
};