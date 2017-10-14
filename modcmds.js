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
                channel.send(message.author + ", please specify the user to be banned.");
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
    
    removenonuserquote: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <author>^<quote>`: removes non-user quote `quote` from `author`'s quotes.";
        },
        
        command: function (message, server, command, channel) {
            var author = command[1], nonUserQuotes = serverData[server.id].nonUserQuotes;
            
            if (!author) {
                channel.send(message.author + ", please specify an author to remove a quote from.");
                return;
            }
            
            var quote = command[2];
            
            if (!quote) {
                channel.send(message.author + ", please specify a quote to remove.");
                return;
            }
            
            if (!nonUserQuotes[author]) {
                channel.send(message.author + ", that author does not have any saved quotes.");
                return;
            }
            
            nonUserQuotes[author].remove(quote);
            
            if (nonUserQuotes[author].length === 0) {
                delete nonUserQuotes[author];
            }
            
            save("nonUserQuotes", server);
            channel.send("Non-user quote removed.");
        }
    },
    
    addopinion: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <opinion>^<good/bad>`: adds `opinion` (either `good` or `bad`) to the possible results of the opinion command.\nWriting '%t' in the opinion means it will be replaced by a random Touhou shmup.";
        },
        
        command: function (message, server, command, channel) {
            var opinion = command[1], type = command[2], badOpinions = serverData[server.id].badOpinions, goodOpinions = serverData[server.id].goodOpinions;
            
            if (!opinion) {
                channel.send(message.author + ", please specify an opinion to add.");
                return;
            }
            
            if (badOpinions.contains(opinion) || goodOpinions.contains(opinion)) {
                channel.send(message.author + ", that opinion already exists.");
                return;
            }
            
            if (!type) {
                channel.send(message.author + ", please specify whether the opinion is good or bad.");
                return;
            }
            
            type = type.toLowerCase();
            
            if (!["bad", "good"].contains(type)) {
                channel.send(message.author + ", please specify whether the opinion is good or bad.");
                return;
            }
            
            if (type == "bad") {
                badOpinions.push(opinion);
                save("badOpinions", server);
            } else {
                goodOpinions.push(opinion);
                save("goodOpinions", server);
            }
            
            channel.send("Opinion added.");
        }
    },
    
    removeopinion: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <opinion>^<good/bad>`: removes `opinion` (either `good` or `bad`) from the possible results of the opinion command.";
        },
        
        command: function (message, server, command, channel) {
            var opinion = command[1], type = command[2], badOpinions = serverData[server.id].badOpinions, goodOpinions = serverData[server.id].goodOpinions;
            
            if (!opinion) {
                channel.send(message.author + ", please specify an opinion to remove.");
                return;
            }
            
            if (!badOpinions.contains(opinion) || !goodOpinions.contains(opinion)) {
                channel.send(message.author + ", that opinion does not exist.");
                return;
            }
            
            if (!type) {
                channel.send(message.author + ", please specify whether the opinion is good or bad.");
                return;
            }
            
            type = type.toLowerCase();
            
            if (!["bad", "good"].contains(type)) {
                channel.send(message.author + ", please specify whether the opinion is good or bad.");
                return;
            }
            
            if (type == "bad") {
                badOpinions.remove(opinion);
                save("badOpinions", server);
            } else {
                goodOpinions.remove(opinion);
                save("goodOpinions", server);
            }
            
            channel.send("Opinion removed.");
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
            
            permData.servers[server.id].cooldownSecs = seconds;
            save("servers");
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
    
    addlnn: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <game>^<shottype/route>^<player>`: adds `player` to the list of `game` LNNs with `shottype/route`. Windows games (excl. PoFV) only.";
        },
        
        command: function (message, server, command, channel) {
            var game = command[1], LNNs = permData.LNNs;
            
            if (!game) {
                channel.send(message.author + ", please specify a game to add an LNN player to.");
                return;
            }
            
            game = gameName(game.toLowerCase());
            
            if (!LNNs.hasOwnProperty(game)) {
                channel.send(message.author + ", please specify a valid game to add an LNN player to.");
                return;
            }
            
            var shot = command[2], acronym = "LNN", grammar = (game.charAt(0).match(/[E|I|H]/) ? "n " : " ");
            
            if (game == "UFO") {
                acronym = "LNN(N)";
            } else if (game == "IN") {
                acronym = "LNNFS";
            } else if (game == "PCB" || game == "TD" || game == "HSiFS") {
                acronym = "LNNN";
            }
            
            if (!shot) {
                channel.send(message.author + ", please specify the shottype that was used or the route that was followed.");
                return;
            }
            
            shot = (shotName(cap(shot)) ? shotName(cap(shot)) : cap(shot));
            
            if (shot.contains("team")) {
                shot = shot.replace(/team/i, "Team").replace(/ /gi, "");
            }
            
            if (!LNNs[game].hasOwnProperty(shot)) {
                channel.send(message.author + ", please specify a valid shottype or route to add an LNN player to.");
                return;
            }
            
            var player = command[3];
            
            if (!player) {
                channel.send(message.author + ", please specify the player that got the new LNN.");
                return;
            }
            
            if (LNNs[game][shot].contains(player)) {
                channel.send(message.author + ", that player already has that LNN!");
                return;
            }
            
            LNNs[game][shot].push(player);
            save("LNNs");
            channel.send(server.emojis.find("name", "Power") + " `Survival Update` " + player + " got a" + grammar + game + " " + acronym + " with " + shot.replace("Team", " Team") + "!");
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
    
    setweatherapi: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <API key>`: saves the key `API key` for use of the `" + symbol + "weather` command.";
        },
        
        command: function (message, server, command, channel) {
            var key = command[1];
            
            if (!key) {
                channel.send(message.author + ", please specify an API key.");
                return;
            }
            
            permData.weatherKey = key;
            save("weatherKey");
            channel.send("API key set successfully. The weather command is now enabled.");
        }
    },
    
    removeweatherapi: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: removes the API key that was saved for use of the `" + symbol + "weather` command.";
        },
        
        command: function (message, server, command, channel) {
            permData.weatherKey = "";
            save("weatherKey");
            channel.send("API key removed successfully. The weather command is now disabled.");
        }
    },
    
    setgoogleapi: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <API key>`: saves the key `API key` to enable the automatic replies to YouTube links.";
        },
        
        command: function (message, server, command, channel) {
            var key = command[1];
            
            if (!key) {
                channel.send(message.author + ", please specify an API key.");
                return;
            }
            
            permData.googleKey = key;
            save("googleKey");
            channel.send("API key set successfully. Automatic replies to YouTube links now enabled.");
        }
    },
    
    removegoogleapi: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: removes the API key that was saved for automatic replies to YouTube links.";
        },
        
        command: function (message, server, command, channel) {
            permData.googleKey = "";
            save("googleKey");
            channel.send("API key removed successfully. Automatic replies to YouTube links are now disabled.");
        }
    },
    
    addimage: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <image file>^<description>`: adds a command that posts `image file` and has `description` when `" + symbol + "help` is used on it.\nThe file must be in the `images` folder.";
        },
        
        command: function (message, server, command, channel) {
            var image = command[1], name, ext, description = command[2];
            
            if (!image) {
                channel.send(message.author + ", please specify an image file.");
                return;
            }
            
            name = path.parse(image).name;
            ext = path.parse(image).ext;
            
            if (![".gif", ".jpg", ".png"].contains(ext)) {
                channel.send(message.author + ", that file extension is not supported.");
                return;
            }
            
            if (!fs.existsSync("images/" + image)) {
                channel.send(message.author + ", that file does not exist.");
                return;
            }
            
            if (!description) {
                channel.send(message.author + ", please specify a description for the help command.");
                return;
            }
            
            permData.images[name] = {"help": description, "file": image};
            save("images");
            channel.send("The image command " + name + " has been added.");
        }
    },
    
    removeimage: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <image command>`: removes `image command`. Note that this does not delete the actual image file.";
        },
        
        command: function (message, server, command, channel) {
            var image = command[1], images = permData.images;
            
            if (!image) {
                channel.send(message.author + ", please specify an image command.");
                return;
            }
            
            if (!images.hasOwnProperty(image)) {
                channel.send(message.author + ", that is not an image command.");
                return;
            }
            
            delete permData.images[image];
            save("images");
            channel.send("The image command " + name + " has been removed.");
        }
    },
    
    addmusic: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <music>^<description>^[volume]`: adds a command that plays `music` on a voice channel and has `description` when `" + symbol + "help` is used on it.\nThe music must either be a YouTube video URL or a file in the `music` folder.\nIf `volume` is not specified, it will be set to 0.5.";
        },
        
        command: function (message, server, command, channel) {
            var music = command[1], url, name, ext, description = command[2], volume = command[3];
            
            if (!music) {
                channel.send(message.author + ", please specify music.");
                return;
            }
            
            name = path.parse(music).name;
            ext = path.parse(music).ext;
            
            if (![".wav", ".mp3"].contains(ext)) {
                channel.send(message.author + ", that file extension is not supported.");
                return;
            }
            
            if (!fs.existsSync("music/" + music)) {
                channel.send(message.author + ", that file does not exist.");
                return;
            }
            
            if (!description) {
                channel.send(message.author + ", please specify a description for the help command.");
                return;
            }
            
            permData.musicLocal[name] = {"help": description, "file": music, "volume": (volume ? volume : 0.5)};
            save("musicLocal");
            channel.send("The music command " + name + " has been added.");
        }
    },
    
    addmusicyt: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <name>^<YouTube video>^<description>^[volume]`: adds a command called `name` that plays `YouTube video` on a voice channel.\n It will have `description` when `" + symbol + "help` is used on it.\nIf `volume` is not specified, it will be set to 0.5.";
        },
        
        command: function (message, server, command, channel) {
            var name = command[1], video = command[2], url, description = command[3], volume = command[4];
            
            if (!name) {
                channel.send(message.author + ", please specify a command name.");
                return;
            }
            
            if (!video) {
                channel.send(message.author + ", please specify a YouTube video.");
                return;
            }
            
            url = url.parse(video);
            
            if (url.hostname != "youtu.be" && (url.hostname != "www.youtube.com" || url.pathname != "/watch" || url.search.substring(0, 3) != "?v=")) {
                channel.send(message.author + ", that is not a YouTube video.");
                return;
            }
            
            if (!description) {
                channel.send(message.author + ", please specify a description for the help command.");
                return;
            }
            
            permData.musicYouTube[name] = {"help": description, "link": video, "volume": (volume ? volume : 0.5)};
            save("musicYouTube");
            channel.send("The music command " + name + " has been added.");
        }
    },
    
    removemusic: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <music command>`: removes `music command`. Note that this does not delete the actual music file, if there is one.";
        },
        
        command: function (message, server, command, channel) {
            var music = command[1], musicLocal = permData.musicLocal, musicYouTube = permData.musicYouTube;
            
            if (!music) {
                channel.send(message.author + ", please specify a music command.");
                return;
            }
            
            if (musicLocal.hasOwnProperty(image)) {
                delete permData.musicLocal[music];
                channel.send("The music command " + name + " has been removed.");
                save("musicLocal");
            } else if (musicYouTube.hasOwnProperty(image)) {
                delete permData.musicYouTube[music];
                channel.send("The music command " + name + " has been removed.");
                save("musicYouTube");
            } else {
                channel.send(message.author + ", that is not a music command.");
            }
        }
    },
    
    togglekek: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: turns kek detection on or off.";
        },
        
        command: function (message, server, command, channel) {
            permData.servers[server.id].kekDetection = !permData.servers[server.id].kekDetection;
            save("servers");
            channel.send("Kek detection has been turned **" + (servers[server.id].kekDetection ? "on" : "off") + "**.");
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