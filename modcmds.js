module.exports = {
    kick: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <user> [reason]`: kicks `user` for `reason`.";
        },

        command: function (message, server, command, channel) {
            var toBeKicked = command[1];

            if (!toBeKicked) {
                channel.send(message.author + ", please specify the user to be kicked.").catch(console.error);
                return;
            }

            var members = toUsers(server.members);

            toBeKicked = toBeKicked.toLowerCase();

            if (members.hasOwnProperty(toBeKicked)) {
                var reason = (command[2] ? command[2] : permData.servers[server.id].defaultReason);

                channel.send("**" + members[toBeKicked].username + "** has been kicked from the server! [Reason: " + reason + "]").catch(console.error);
                server.members.get(members[toBeKicked].id).kick();
                return;
            }

            channel.send(message.author + ", there is no such user on this server.").catch(console.error);
        }
    },

    ban: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <user> [reason] [deletedays]`: bans `user` for `reason` and deletes their messages from the last `deletedays` days (default 0).";
        },

        command: function (message, server, command, channel) {
            var toBeBanned = command[1];

            if (!toBeBanned) {
                channel.send(message.author + ", please specify the user to be banned.").catch(console.error);
                return;
            }

            var members = toUsers(server.members);

            toBeBanned = toBeBanned.toLowerCase();

            if (members.hasOwnProperty(toBeBanned)) {
                var reason = (command[2] ? command[2] : permData.servers[server.id].defaultReason);

                var deleteDays = (command[3] ? command[3] : 0);

                if (isNaN(deleteDays) || deleteDays < 0 || deleteDays > 7) {
                    channel.send(message.author + ", please specify a valid number of delete days (must be 0 to 7).").catch(console.error);
                    return;
                }

                channel.send("**" + members[toBeBanned].username + "** has been banned from the server! [Reason: " + reason + "]").catch(console.error);
                server.members.get(members[toBeBanned].id).ban(Math.round(deleteDays));
                return;
            }

            channel.send(message.author + ", there is no such user on this server.").catch(console.error);
        }
    },

    reset: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: resets the RNG-generated values.";
        },

        command: function (message, server, command, channel) {
            serverData[server.id].waifus = {};
            serverData[server.id].touhouWaifus = {};
            serverData[server.id].spellWaifus = {};
            serverData[server.id].fanmemeWaifus = {};
            serverData[server.id].lenenWaifus = {};
            serverData[server.id].ratings = {};
            save("waifus", server);
            save("touhouWaifus", server);
            save("spellWaifus", server);
            save("fanmemeWaifus", server);
            save("lenenWaifus", server);
            save("ratings", server);
            channel.send("RNG-generated values have been reset.").catch(console.error);
        }
    },

    removequote: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <author> <quote>`: removes `quote` from `author`'s quotes.";
        },

        command: function (message, server, command, channel) {
            var author = command[1], quotes = serverData[server.id].quotes;

            if (!author) {
                channel.send(message.author + ", please specify an author to remove a quote from.").catch(console.error);
                return;
            }

            var quote = command[2];

            if (!quote) {
                channel.send(message.author + ", please specify a quote to remove.").catch(console.error);
                return;
            }

            author = author.toLowerCase();

            if (!quotes[author]) {
                channel.send(message.author + ", that author does not have any saved quotes.").catch(console.error);
                return;
            }

            quotes[author].list.remove(quote);

            if (quotes[author].list.length === 0) {
                delete quotes[author];
            }

            save("quotes", server);
            channel.send("Quote removed.").catch(console.error);
        }
    },

    addopinion: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <opinion> <good/bad>`: adds `opinion` (either `good` or `bad`) to the possible results of the opinion command.\nWriting '%t' in the opinion means it will be replaced by a random Touhou shmup.";
        },

        command: function (message, server, command, channel) {
            var opinion = command[1], type = command[2], badOpinions = serverData[server.id].badOpinions, goodOpinions = serverData[server.id].goodOpinions;

            if (!opinion) {
                channel.send(message.author + ", please specify an opinion to add.").catch(console.error);
                return;
            }

            if (badOpinions.contains(opinion) || goodOpinions.contains(opinion)) {
                channel.send(message.author + ", that opinion already exists.").catch(console.error);
                return;
            }

            if (!type) {
                channel.send(message.author + ", please specify whether the opinion is good or bad.").catch(console.error);
                return;
            }

            type = type.toLowerCase();

            if (!["bad", "good"].contains(type)) {
                channel.send(message.author + ", please specify whether the opinion is good or bad.").catch(console.error);
                return;
            }

            if (type == "bad") {
                badOpinions.push(opinion);
                save("badOpinions", server);
            } else {
                goodOpinions.push(opinion);
                save("goodOpinions", server);
            }

            channel.send("Opinion added.").catch(console.error);
        }
    },

    removeopinion: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <opinion> <good/bad>`: removes `opinion` (either `good` or `bad`) from the possible results of the opinion command.";
        },

        command: function (message, server, command, channel) {
            var opinion = command[1], type = command[2], badOpinions = serverData[server.id].badOpinions, goodOpinions = serverData[server.id].goodOpinions;

            if (!opinion) {
                channel.send(message.author + ", please specify an opinion to remove.").catch(console.error);
                return;
            }

            if (!badOpinions.contains(opinion) || !goodOpinions.contains(opinion)) {
                channel.send(message.author + ", that opinion does not exist.").catch(console.error);
                return;
            }

            if (!type) {
                channel.send(message.author + ", please specify whether the opinion is good or bad.").catch(console.error);
                return;
            }

            type = type.toLowerCase();

            if (!["bad", "good"].contains(type)) {
                channel.send(message.author + ", please specify whether the opinion is good or bad.").catch(console.error);
                return;
            }

            if (type == "bad") {
                badOpinions.remove(opinion);
                save("badOpinions", server);
            } else {
                goodOpinions.remove(opinion);
                save("goodOpinions", server);
            }

            channel.send("Opinion removed.").catch(console.error);
        }
    },

    say: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <message>`: will make me post `message` in the bot spam channel. Requires the main channel to be set.";
        },

        command: function (message, server, command, channel) {
            if (message.author.id == bot.user.id) {
                return;
            }

            var post = command[1], mainChannel = permData.servers[server.id].mainChannel;

            if (mainChannel) {
                server.channels.get(mainChannel).send(post).catch(console.error);
            }
        }
    },

    game: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [game]`: will make me play `game`. If `game` is not specified, removes my game.";
        },

        command: function (message, server, command, channel) {
            var game = command[1];

            if (!game) {
                bot.user.setGame(null);
                channel.send("Game removed.").catch(console.error);
                return;
            }

            bot.user.setGame(game);
            channel.send("Game changed.").catch(console.error);
        }
    },

    avatar: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [URL]`: will give me the avatar linked to by `URL`. If `URL` is not specified, resets my avatar to the default one.";
        },

        command: function (message, server, command, channel) {
            var avatar = command[1];

            if (!avatar) {
                bot.user.setAvatar("images/avatar.png");
                channel.send("Avatar reset to the default avatar.").catch(console.error);
                return;
            }

            bot.user.setAvatar(avatar);
            channel.send("Avatar changed.").catch(console.error);
        }
    },

    cooldownsecs: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [seconds]`: changes the cooldown seconds for big commands to `seconds` (default 15).";
        },

        command: function (message, server, command, channel) {
            var seconds = command[1] ? Number(command[1]) : DEFAULT_COOLDOWN;

            permData.servers[server.id].cooldownSecs = seconds;
            save("servers");
            channel.send("Big command cooldown set to " + seconds + " seconds.").catch(console.error);
        }
    },

    updatewr: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <game> <difficulty> <shottype/route> <new WR> <player> [date] [west]`: updates the world record in `game` `difficulty` `shottype/route` to `new WR` by `player`." +
            "\nAdd 'west' after `player` if the player is western.";
        },

        command: function (message, server, command, channel) {
            var game = command[1], WRs = permData.WRs;

            if (!game) {
                channel.send(message.author + ", please specify a game to update a world record of.").catch(console.error);
                return;
            }

            game = gameName(game.toLowerCase());

            if (!WRs[game]) {
                channel.send(message.author + ", please specify a valid game to update a world record of.").catch(console.error);
                return;
            }

            var difficulty = command[2];

            if (!difficulty) {
                channel.send(message.author + ", please specify a difficulty to update a world record of.").catch(console.error);
                return;
            }

            difficulty = cap(difficulty.toLowerCase());

            if (!WRs[game][difficulty]) {
                channel.send(message.author + ", please specify a valid difficulty to update a world record of.").catch(console.error);
                return;
            }

            var shot = command[3], difficultyWRs = WRs[game][difficulty];

            if (!shot) {
                channel.send(message.author + ", please specify a shottype or route to update the world record of.").catch(console.error);
                return;
            }

            if (shot) {
                shot = (shotName(cap(shot)) ? shotName(cap(shot)) : cap(shot));

                if (shot.contains("team")) {
                    shot = shot.replace(/team/i, "Team").replace(/ /gi, "");
                }

                if (!WRs[game][difficulty][shot]) {
                    channel.send(message.author + ", " + shot + " is not a valid shottype or route.").catch(console.error);
                    return;
                }
            }

            var newWR = command[4];

            if (!newWR || isNaN(newWR.replace(/\./g, "").replace(/\,/g, ""))) {
                channel.send(message.author + ", please specify the new world record.").catch(console.error);
                return;
            }

            if (Number(newWR) > MAX_SCORE || Number(newWR) <= 0) {
                channel.send(message.author + ", please specify a valid new world record.").catch(console.error);
                return;
            }

            newWR = Number(newWR.replace(/\./g, "").replace(/\,/g, ""));

            var newPlayer = command[5];

            if (!newPlayer) {
                channel.send(message.author + ", please specify the player that got the new world record.").catch(console.error);
                return;
            }

            var date = command[6];

            if (!date) {
                channel.send(message.author + ", please specify the date of the new world record.").catch(console.error);
                return;
            }

            var west = command[7], oldWR, oldPlayer;

            oldWR = WRs[game][difficulty][shot][0];
            oldPlayer = WRs[game][difficulty][shot][1];

            if (west) {
                if (west == "west") {
                    permData.bestInTheWest[game][difficulty] = [newWR, newPlayer, shot];
                    save("bestInTheWest");
                } else {
                    WRs[game][difficulty][shot] = [newWR, newPlayer, date, west]; // PC-98 video link
                }
            } else {
                oldWR = WRs[game][difficulty][shot][0];
                oldPlayer = WRs[game][difficulty][shot][1];
                WRs[game][difficulty][shot] = [newWR, newPlayer, date];
            }

            permData.WRsLastUpdated = new Date().UTC();
            save("WRs");
            save("WRsLastUpdated");

            if (command[8] && command[8] == "west") { // PC-98 west after video
                permData.bestInTheWest[game][difficulty] = [newWR, newPlayer, shot];
                save("bestInTheWest");
            }

            if (fs.existsSync("../maribelhearn.com/json/wrlist.json")) {
                fs.copyFileSync("data/WRs.txt", "../maribelhearn.com/json/wrlist.json");
            }

            channel.send(server.emojis.find("name", "Scoarr") + " `Score Update` New WR in " + game + " " + difficulty +
            " " + shot.replace("Team", " Team") + ": " + sep(oldWR) + " by " + oldPlayer + " -> " + sep(newWR) + " by " + newPlayer + "!").catch(console.error);
        }
    },

    addlnn: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <game> <shottype/route> <player>`: adds `player` to the list of `game` LNNs with `shottype/route`. Windows games (excl. PoFV) only.";
        },

        command: function (message, server, command, channel) {
            var game = command[1], LNNs = permData.LNNs;

            if (!game) {
                channel.send(message.author + ", please specify a game to add an LNN player to.").catch(console.error);
                return;
            }

            game = gameName(game.toLowerCase());

            if (!LNNs.hasOwnProperty(game)) {
                channel.send(message.author + ", please specify a valid game to add an LNN player to.").catch(console.error);
                return;
            }

            var shot = command[2], acronym = "LNN", grammar = (game.charAt(0).match(/[E|I|H]/) ? "n " : " ");

            if (game == "UFO") {
                acronym = "LNN";
            } else if (game == "IN") {
                acronym = "LNNFS";
            } else if (game == "PCB" || game == "TD" || game == "HSiFS") {
                acronym = "LNNN";
            } else if (game == "WBaWC") {
                acronym = "LNNNN";
            }

            if (!shot) {
                channel.send(message.author + ", please specify the shottype that was used or the route that was followed.").catch(console.error);
                return;
            }

            shot = (shotName(cap(shot)) ? shotName(cap(shot)) : cap(shot));

            if (shot.contains("team")) {
                shot = shot.replace(/team/i, "Team").replace(/ /gi, "");
            }

            if (shot.contains("final")) {
                shot = shot.replace(/finala/i, "FinalA").replace(/finalb/i, "FinalB");
            }

            console.log(shot);

            if (shot.contains("ufos")) {
                shot = shot.replace(/ufos/i, "UFOs");
            }

            if (!LNNs[game].hasOwnProperty(shot)) {
                channel.send(message.author + ", please specify a valid shottype or route to add an LNN player to.").catch(console.error);
                return;
            }

            var player = command[3];

            if (!player) {
                channel.send(message.author + ", please specify the player that got the new LNN.").catch(console.error);
                return;
            }

            if (LNNs[game][shot].contains(player)) {
                channel.send(message.author + ", that player already has that LNN!").catch(console.error);
                return;
            }

            LNNs[game][shot].push(player);
            save("LNNs");

            if (fs.existsSync("../maribelhearn.com/json/lnnlist.json")) {
                fs.copyFileSync("data/LNNs.txt", "../maribelhearn.com/json/lnnlist.json");
            }

            channel.send(server.emojis.find("name", "Power") + " `Survival Update` " + player +
            " got a" + grammar + game + " " + acronym + (shot.contains("UFOs") ? "" : "N") +
            " with " + shot.replace("Team", " Team").replace("UFOs", "") + "!").catch(console.error);
        }
    },

    joinvoice: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes me join the voice channel.";
        },

        command: function (message, server, command, channel) {
            var servers = permData.servers;

            if (!servers[server.id].voiceChannel) {
                channel.send(message.author + ", please tell me which voice channel to use (using the voicechannel command).").catch(console.error);
                return;
            }

            var voiceChannel = server.channels.get(servers[server.id].voiceChannel);

            if (!voiceChannel.connection === null) {
                channel.send(message.author + ", I am already in the voice channel!").catch(console.error);
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
                channel.send(message.author + ", please tell me which voice channel to use (using the voicechannel command).").catch(console.error);
                return;
            }

            var voiceChannel = server.channels.get(servers[server.id].voiceChannel);

            if (voiceChannel.connection === null) {
                channel.send(message.author + ", I am not in the voice channel!").catch(console.error);
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
                channel.send(message.author + ", please tell me which voice channel to use (using the voicechannel command).").catch(console.error);
                return;
            }

            var voiceChannel = server.channels.get(servers[server.id].voiceChannel);

            if (!musicBlocked && voiceChannel.connection !== null) {
                voiceChannel.leave();
            }

            musicBlocked = !musicBlocked;
            channel.send("Music commands have been " + (!musicBlocked ? "un" : "") + "blocked!").catch(console.error);
        }
    },

    voicechannel: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <voice channel>`: makes `voice channel` my voice channel.";
        },

        command: function (message, server, command, channel) {
            var voiceChannel = command[1];

            if (!voiceChannel) {
                channel.send(message.author + ", please specify a voice channel.").catch(console.error);
                return;
            }

            if (!server.channels.find("name", voiceChannel) || server.channels.find("name", voiceChannel).type != "voice") {
                channel.send(message.author + ", that is not a voice channel!").catch(console.error);
                return;
            }

            permData.servers[server.id].voiceChannel = server.channels.find("name", voiceChannel).id;
            save("servers");
            channel.send(message.author + ", I will now use " + voiceChannel + "!").catch(console.error);
        }
    },

    addimage: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <image file> <description>`: adds a command that posts `image file` and has `description` when `" + symbol + "help` is used on it.\nThe file must be in the `images` folder.";
        },

        command: function (message, server, command, channel) {
            var image = command[1], name, ext, description = command[2];

            if (!image) {
                channel.send(message.author + ", please specify an image file.").catch(console.error);
                return;
            }

            name = path.parse(image).name;
            ext = path.parse(image).ext;

            if (![".gif", ".jpg", ".png"].contains(ext)) {
                channel.send(message.author + ", that file extension is not supported.").catch(console.error);
                return;
            }

            if (!fs.existsSync("images/" + image)) {
                channel.send(message.author + ", that file does not exist.").catch(console.error);
                return;
            }

            if (!description) {
                channel.send(message.author + ", please specify a description for the help command.").catch(console.error);
                return;
            }

            permData.images[name] = {"help": description, "file": image};
            save("images");
            channel.send("The image command " + name + " has been added.").catch(console.error);
        }
    },

    removeimage: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <image command>`: removes `image command`. Note that this does not delete the actual image file.";
        },

        command: function (message, server, command, channel) {
            var image = command[1], images = permData.images;

            if (!image) {
                channel.send(message.author + ", please specify an image command.").catch(console.error);
                return;
            }

            if (!images.hasOwnProperty(image)) {
                channel.send(message.author + ", that is not an image command.").catch(console.error);
                return;
            }

            delete permData.images[image];
            save("images");
            channel.send("The image command " + image + " has been removed.").catch(console.error);
        }
    },

    addmusic: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <music> <description> [volume]`: adds a command that plays `music` on a voice channel and has `description` when `" + symbol + "help` is used on it.\nThe music must either be a file in the `music` folder.\nIf `volume` is not specified, it will be set to 0.5.";
        },

        command: function (message, server, command, channel) {
            var music = command[1], url, name, ext, description = command[2], volume = command[3];

            if (!music) {
                channel.send(message.author + ", please specify music.").catch(console.error);
                return;
            }

            name = path.parse(music).name;
            ext = path.parse(music).ext;

            if (![".wav", ".mp3"].contains(ext)) {
                channel.send(message.author + ", that file extension is not supported.").catch(console.error);
                return;
            }

            if (!fs.existsSync("music/" + music)) {
                channel.send(message.author + ", that file does not exist.").catch(console.error);
                return;
            }

            if (!description) {
                channel.send(message.author + ", please specify a description for the help command.").catch(console.error);
                return;
            }

            permData.musicLocal[name] = {"help": description, "file": music, "volume": (volume ? volume : 0.5)};
            save("musicLocal");
            channel.send("The music command " + name + " has been added.").catch(console.error);
        }
    },

    removemusic: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <music command>`: removes `music command`. Note that this does not delete the actual music file, if there is one.";
        },

        command: function (message, server, command, channel) {
            var music = command[1], musicLocal = permData.musicLocal;

            if (!music) {
                channel.send(message.author + ", please specify a music command.").catch(console.error);
                return;
            }

            if (musicLocal.hasOwnProperty(image)) {
                delete permData.musicLocal[music];
                channel.send("The music command " + name + " has been removed.").catch(console.error);
                save("musicLocal");
            } else {
                channel.send(message.author + ", that is not a music command.").catch(console.error);
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
            channel.send("Kek detection has been turned **" + (permData.servers[server.id].kekDetection ? "on" : "off") + "**.").catch(console.error);
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

            channel.send(unusedRoles.length === 0 ? "There are no unused roles." : "Unused roles: " + unusedRoles).catch(console.error);
        }
    },

    botmaster: {
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
            channel.send(message.author + ", you are now my master!").catch(console.error);
        }
    }
};
