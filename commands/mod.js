module.exports = {
    kick: {
        args: [0, "a member to kick"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <member> [reason]`: kicks `member` from this server for `reason`. " +
            "If `reason` is not specified, uses the default reason.";
        },

        command: function (message, server, command, channel) {
            var toBeKicked = command[1].toLowerCase(), members = toUsers(server.members);

            if (members.hasOwnProperty(toBeKicked)) {
                var reason = (command[2] ? command[2] : serverData[server.id].defaultReason);

                channel.send("**" + members[toBeKicked].username + "** has been kicked from the server! [Reason: " + reason + "]").catch(console.error);
                server.members.cache.get(members[toBeKicked].id).kick();
                return;
            }

            channel.send(message.author.username + ", there is no such user on this server.").catch(console.error);
        }
    },

    ban: {
        args: [0, "a member to ban"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <user> [reason] [deletedays]`: bans `user` for `reason` and deletes their messages from the last `deletedays` days (default 0).";
        },

        command: function (message, server, command, channel) {
            var toBeBanned = command[1].toLowerCase(), members = toUsers(server.members);

            if (members.hasOwnProperty(toBeBanned)) {
                var reason = (command[2] ? command[2] : serverData[server.id].defaultReason);

                var deleteDays = (command[3] ? command[3] : 0);

                if (isNaN(deleteDays) || deleteDays < 0 || deleteDays > 7) {
                    channel.send(message.author.username + ", please specify a valid number of delete days (must be 0 to 7).").catch(console.error);
                    return;
                }

                channel.send("**" + members[toBeBanned].username + "** has been banned from the server! [Reason: " + reason + "]").catch(console.error);
                server.members.cache.get(members[toBeBanned].id).ban(Math.round(deleteDays));
                return;
            }

            channel.send(message.author.username + ", there is no such user on this server.").catch(console.error);
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

    reset: {
        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + "`: resets the RNG-generated values.";
        },

        command: function (message, server, command, channel) {
            if (!server) {
                for (var id in serverData) {
                    serverData[id].waifus = {"user":{},"touhou":{},"spell":{},"fan":{},"lenen":{}};
                    serverData[id].ratings = {};
                    serverData[id].ships = {};
                    save("waifus", bot.guilds.cache.get(id));
                    save("ratings", bot.guilds.cache.get(id));
                    save("ships", bot.guilds.cache.get(id));
                }

                channel.send("RNG-generated values have been reset for all servers.").catch(console.error);
                return;
            }

            serverData[server.id].waifus = {"user":{},"touhou":{},"spell":{},"fan":{},"lenen":{}};
            serverData[server.id].ratings = {};
            serverData[server.id].ships = {};
            save("waifus", server);
            save("ratings", server);
            save("ships", server);
            channel.send("RNG-generated values have been reset.").catch(console.error);
        }
    },

    removequote: {
        args: [0, "an author to remove a quote from", "a quote to remove"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <author> <quote>`: removes `quote` from `author`'s quotes.";
        },

        command: function (message, server, command, channel) {
            var author = command[1].toLowerCase(), quote = command[2], quotes = serverData[server.id].quotes;

            if (!quotes[author]) {
                channel.send(message.author.username + ", that author does not have any saved quotes.").catch(console.error);
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

    removescrubquote: {
        args: [0, "a scrubquote to remove"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <quote>`: removes `scrubquote` from the list of scrubquotes.";
        },

        command: function (message, server, command, channel) {
            var scrubquote = command[1], scrubquotes = permData.scrubquotes;

            if (!scrubquotes.contains(scrubquote)) {
                channel.send(message.author.username + ", that scrubquote is not in the list.").catch(console.error);
                return;
            }

            scrubquotes.remove(scrubquote);

            save("scrubquotes");
            channel.send("Scrubquote removed.").catch(console.error);
        }
    },

    removeopinion: {
        args: [0, "an opinion to remove"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <opinion>`: removes `opinion` " +
            "from the possible results of the opinion command.";
        },

        command: function (message, server, command, channel) {
            var opinion = command[1], badOpinions = serverData[server.id].badOpinions,
                goodOpinions = serverData[server.id].goodOpinions;

            if (!badOpinions.contains(opinion) && !goodOpinions.contains(opinion)) {
                channel.send(message.author.username + ", that opinion does not exist.").catch(console.error);
                return;
            }

            badOpinions.remove(opinion);
            goodOpinions.remove(opinion);
            save("badOpinions", server);
            save("goodOpinions", server);
            channel.send("Opinion removed.").catch(console.error);
        }
    },

    removeshipmessage: {
        args: [0, "a message to remove"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <message>`: removes `message` " +
            "from the list of messages for the `" + symbol + "randomship` command.";
        },

        command: function (message, server, command, channel) {
            var message = command[1], shipMessages = serverData[server.id].shipMessages;

            if (!shipMessages.contains(message)) {
                channel.send(message.author.username + ", that message does not exist.").catch(console.error);
                return;
            }

            shipMessages.remove(message);
            save("shipMessages", server);
            channel.send("Ship message removed.").catch(console.error);
        }
    },

    say: {
        args: [0, "a message for me to send"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <message>`: will make me send `message` to the current channel.";
        },

        command: function (message, server, command, channel) {
            var message = command[1];

            if (message.length > MESSAGE_CAP) {
                channel.send(message.author.username + ", sorry, I cannot send anything longer than " + MESSAGE_CAP + " characters.");
                return;
            }

            channel.send(message).catch(console.error);
        }
    },

    game: {
        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " [game]`: will make me play `game`. If `game` is not specified, removes my game.";
        },

        command: function (message, server, command, channel) {
            var game = command[1];

            if (!game) {
                bot.user.setActivity(null);
                channel.send("Game removed.").catch(console.error);
                return;
            }

            bot.user.setActivity(game);
            channel.send("Game changed.").catch(console.error);
        }
    },

    avatar: {
        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " [URL]`: will give me the avatar linked to by `URL`. " +
            "If `URL` is not specified, resets my avatar to the default one.";
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

    status: {
        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " [status]`: will set my status to `status`. " +
            "If `status` is not specified, removes my status.";
        },

        command: function (message, server, command, channel) {
            var status = command[1];

            if (!status) {
                bot.user.setStatus(null);
                channel.send("Status removed.").catch(console.error);
                return;
            }

            bot.user.setStatus(status);
            channel.send("Status changed.").catch(console.error);
        }
    },

    cooldownsecs: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [seconds]`: changes the cooldown seconds for big commands to `seconds` (default 15).";
        },

        command: function (message, server, command, channel) {
            var seconds = command[1] ? Number(command[1]) : DEFAULT_COOLDOWN;

            serverData[server.id].cooldownSecs = seconds;
            save("cooldownSecs", server);
            channel.send("Big command cooldown set to " + seconds + " seconds.").catch(console.error);
        }
    },

    updatewr: {
        args: [0, "a game", "a difficulty", "a shottype or route", "a score", "a player", "a date"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <game> <difficulty> <shottype/route> <new WR> <player> <date> [replay]`: " +
            "updates the world record in `game` `difficulty` `shottype/route` to `new WR` by `player`.";
        },

        command: function (message, server, command, channel) {
            var game = gameName(command[1].toLowerCase()), difficulty = cap(command[2].toLowerCase()), shot = command[3],
                newWR = command[4], newPlayer = command[5], date = command[6], replay = command[7], WRs = permData.WRs,
                difficultyWRs, oldWR, oldPlayer, extension, fileName, child;

            if (!WRs[game]) {
                channel.send(message.author.username + ", please specify a valid game to update a world record of.").catch(console.error);
                return;
            }

            if (!WRs[game][difficulty]) {
                channel.send(message.author.username + ", please specify a valid difficulty to update a world record of.").catch(console.error);
                return;
            }

            difficultyWRs = WRs[game][difficulty];

            if (shot) {
                shot = (shotName(cap(shot)) ? shotName(cap(shot)) : cap(shot));

                if (shot.contains("team")) {
                    shot = shot.replace(/team/i, "Team").replace(/ /gi, "");
                }

                if (!WRs[game][difficulty][shot]) {
                    channel.send(message.author.username + ", " + shot + " is not a valid shottype or route.").catch(console.error);
                    return;
                }
            }

            if (isNaN(newWR.replace(/\./g, "").replace(/\,/g, ""))) {
                channel.send(message.author.username + ", please specify the new world record.").catch(console.error);
                return;
            }

            if (Number(newWR) > MAX_SCORE || Number(newWR) <= 0) {
                channel.send(message.author.username + ", please specify a valid new world record.").catch(console.error);
                return;
            }

            newWR = Number(newWR.replace(/\./g, "").replace(/\,/g, ""));
            oldWR = WRs[game][difficulty][shot][0];
            oldPlayer = WRs[game][difficulty][shot][1];

            if (replay) {
                extension = replay.substr(-4);
                if (extension != ".rpy" || ["HRtP", "SoEW", "PoDD", "LLS", "MS"].contains(game)) {
                    WRs[game][difficulty][shot] = [newWR, newPlayer, date, replay]; // video link
                } else {
                    WRs[game][difficulty][shot] = [newWR, newPlayer, date];
                    fileName = replayName(game, difficulty, shot);
                    child = exec("wget " + replay + " -O /var/www/maribelhearn.com/replays/" + fileName, function (error, stdout, stderr) {
                        if (error !== null) {
                            channel.send("Error while downloading replay: " + error);
                        }
                    });
                }
            } else {
                WRs[game][difficulty][shot] = [newWR, newPlayer, date];
            }

            permData.WRsLastUpdated = new Date().UTC();
            save("WRsLastUpdated");
            save("WRs");

            if (fs.existsSync("/var/www/maribelhearn.com/assets/json/wrlist.json")) {
                fs.copyFileSync("data/WRs.txt", "/var/www/maribelhearn.com/assets/json/wrlist.json");
            }

            channel.send("`Score Update` New WR in " + game + " " + difficulty +
            " " + shot.replace("Team", " Team") + ": " + sep(oldWR) + " by " + oldPlayer + " -> " + sep(newWR) + " by " + newPlayer + "!").catch(console.error);
        }
    },

    updatewest: {
        args: [0, "a game", "a difficulty", "a score", "a player", "a shottype or route"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <game> <difficulty> <new WestR> <player> <shottype>`: updates the Western record in `game` `difficulty` `shottype/route` to `new WestR` by `player`.";
        },

        command: function (message, server, command, channel) {
            var game = gameName(command[1].toLowerCase()), difficulty = cap(command[2].toLowerCase()), newWestR = command[3],
                newPlayer = command[4], shottype = command[5], WestRs = permData.bestInTheWest, oldWestR, oldPlayer, oldShot;

            if (!WestRs[game]) {
                channel.send(message.author.username + ", please specify a valid game to update a Western record of.").catch(console.error);
                return;
            }

            if (!WestRs[game][difficulty]) {
                channel.send(message.author.username + ", please specify a valid difficulty to update a Western record of.").catch(console.error);
                return;
            }

            if (isNaN(newWestR.replace(/\./g, "").replace(/\,/g, ""))) {
                channel.send(message.author.username + ", please specify the new Western record.").catch(console.error);
                return;
            }

            if (Number(newWestR) > MAX_SCORE || Number(newWestR) <= 0) {
                channel.send(message.author.username + ", please specify a valid new Western record.").catch(console.error);
                return;
            }

            newWestR = Number(newWestR.replace(/\./g, "").replace(/\,/g, ""));
            oldWestR = WestRs[game][difficulty][0];
            oldPlayer = WestRs[game][difficulty][1];
            oldShot = WestRs[game][difficulty][2];
            WestRs[game][difficulty] = [newWestR, newPlayer, shottype];
            permData.bestInTheWest[game][difficulty] = [newWestR, newPlayer, shottype];
            save("bestInTheWest");

            if (fs.existsSync("/var/www/maribelhearn.com/assets/json/bestinthewest.json")) {
                fs.copyFileSync("data/bestInTheWest.txt", "/var/www/maribelhearn.com/assets/json/bestinthewest.json");
            }

            channel.send("`Score Update` New Western record in " + game + " " + difficulty +
            ": " + sep(oldWestR) + " by " + oldPlayer + " with " + oldShot.replace("Team", " Team") + " -> " + sep(newWestR) +
            " by " + newPlayer + " with " + shottype.replace("Team", " Team") + "!").catch(console.error);
        }
    },

    addlnn: {
        args: [0, "a game", "a shottype or route", "a player"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <game> <shottype/route> <player> [replay]`: " +
            "adds `player` to the list of `game` LNNs with `shottype/route`. Windows games (excl. PoFV) only.";
        },

        command: function (message, server, command, channel) {
            var game = gameName(command[1].toLowerCase()), shot = command[2], player = command[3], replay = command[4],
                date = new Date(), LNNs = permData.LNNs, acronym = "LNN", grammar = (game.charAt(0).match(/[E|I|H]/) ? "n " : " "),
                dateString, type, extension, folder, fileName, child;

            if (!LNNs.hasOwnProperty(game)) {
                channel.send(message.author.username + ", please specify a valid game to add an LNN player to.").catch(console.error);
                return;
            }

            if (game == "UFO") {
                acronym = "LNN";
            } else if (game == "IN") {
                acronym = "LNNFS";
            } else if (game == "PCB" || game == "TD" || game == "HSiFS") {
                acronym = "LNNN";
            } else if (game == "WBaWC") {
                acronym = "LNNNN";
            }

            shot = (shotName(cap(shot)) ? shotName(cap(shot)) : cap(shot));
            type = shot.replace(/[^(FinalA|FinalB|UFOs)]/gi, "");

            if (shot.contains("team")) {
                shot = shot.replace(/team/i, "Team").replace(/ /gi, "");
            }

            if (shot.contains("final")) {
                shot = shot.replace(/finala/i, "FinalA").replace(/finalb/i, "FinalB");
            }

            if (shot.contains("ufos")) {
                shot = shot.replace(/ufos/i, "UFOs");
            }

            if (!LNNs[game].hasOwnProperty(shot)) {
                channel.send(message.author.username + ", please specify a valid shottype or route to add an LNN player to.").catch(console.error);
                return;
            }

            if (LNNs[game][shot].contains(player)) {
                channel.send(message.author.username + ", that player already has that LNN!").catch(console.error);
                return;
            }

            if (replay) {
                extension = replay.substr(-4);
                if (extension != ".rpy" || ["HRtP", "SoEW", "PoDD", "LLS", "MS"].contains(game)) {
                    LNNs[game][shot].push(player); // video link TBD
                } else {
                    folder = removeSpaces(player);
                    fileName = replayNameLNN(player, game, shot, type);
                    LNNs[game][shot].push(player);
                    if (!fs.existsSync("/var/www/maribelhearn.com/replays/lnn/" + folder)) {
                        fs.mkdirSync("/var/www/maribelhearn.com/replays/lnn/" + folder);
                    }
                    child = exec("wget " + replay + " -O /var/www/maribelhearn.com/replays/lnn/" + folder + "/" + fileName, function (error, stdout, stderr) {
                        if (error !== null) {
                            channel.send("Error while downloading replay: " + error);
                        }
                    });
                }
            } else {
                LNNs[game][shot].push(player);
            }

            dateString = ('0' + date.getDate()).slice(-2) +
            '/' + ('0' + (date.getMonth() + 1)).slice(-2) +
            '/' + date.getFullYear();
            LNNs.LM = dateString;
            save("LNNs");

            if (fs.existsSync("/var/www/maribelhearn.com/assets/json/lnnlist.json")) {
                fs.copyFileSync("data/LNNs.txt", "/var/www/maribelhearn.com/assets/json/lnnlist.json");
            }

            channel.send("`Survival Update` " + player +
            " got a" + grammar + game + " " + acronym + (shot.contains("UFOs") ? "N" : "") +
            " with " + shot.replace("Team", " Team").replace("UFOs", "") + "!").catch(console.error);
        }
    },

    lnnreplay: {
        args: [0, "a game", "a shottype or route", "a player", "a replay or video"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <game> <shottype/route> <player> <replay>`: " +
            "sets that LNN's replay or video to <replay>.";
        },

        command: function (message, server, command, channel) {
            var game = gameName(command[1].toLowerCase()), shot = command[2], player = command[3], replay = command[4],
                date = new Date(), LNNs = permData.LNNs, acronym = "LNN", grammar = (game.charAt(0).match(/[E|I|H]/) ? "n " : " "),
                dateString, type, extension, folder, fileName, child;

            if (!LNNs.hasOwnProperty(game)) {
                channel.send(message.author.username + ", please specify a valid game.").catch(console.error);
                return;
            }

            if (game == "UFO") {
                acronym = "LNN";
            } else if (game == "IN") {
                acronym = "LNNFS";
            } else if (game == "PCB" || game == "TD" || game == "HSiFS") {
                acronym = "LNNN";
            } else if (game == "WBaWC") {
                acronym = "LNNNN";
            }

            shot = (shotName(cap(shot)) ? shotName(cap(shot)) : cap(shot));

            if (shot.contains("team")) {
                shot = shot.replace(/team/i, "Team").replace(/ /gi, "");
            }

            if (shot.contains("final")) {
                shot = shot.replace(/finala/i, "FinalA").replace(/finalb/i, "FinalB");
            }

            if (shot.contains("ufos")) {
                shot = shot.replace(/ufos/i, "UFOs");
            }

            type = shot.replace(shot, "");

            if (!LNNs[game].hasOwnProperty(shot)) {
                channel.send(message.author.username + ", please specify a valid shottype or route.").catch(console.error);
                return;
            }

            if (!LNNs[game][shot].contains(player)) {
                channel.send(message.author.username + ", that player does not have that LNN!").catch(console.error);
                return;
            }

            extension = replay.substr(-4);

            if (extension != ".rpy") { // video link TBD
                channel.send(message.author.username + ", please specify only replays for now.").catch(console.error);
                return;
            }

            folder = removeSpaces(player);
            fileName = replayNameLNN(player, game, shot, type);

            if (!fs.existsSync("/var/www/maribelhearn.com/replays/lnn/" + folder)) {
                fs.mkdirSync("/var/www/maribelhearn.com/replays/lnn/" + folder);
            }
            child = exec("wget " + replay + " -O /var/www/maribelhearn.com/replays/lnn/" + folder + "/" + fileName, function (error, stdout, stderr) {
                if (error !== null) {
                    channel.send("Error while downloading replay: " + error);
                }
            });

            channel.send("The replay for that LNN has been saved!").catch(console.error);
        }
    },

    removelnn: {
        args: [0, "a game", "a shottype or route", "a player"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <game> <shottype/route> <player>`: removes `player` from the list of `game` LNNs with `shottype/route`.";
        },

        command: function (message, server, command, channel) {
            var game = gameName(command[1].toLowerCase()), shot = command[2], player = command[3], LNNs = permData.LNNs,
                date = new Date(),acronym = "LNN", grammar = (game.charAt(0).match(/[E|I|H]/) ? "n " : " "), dateString;

            if (!LNNs.hasOwnProperty(game)) {
                channel.send(message.author.username + ", please specify a valid game to remove an LNN player from.").catch(console.error);
                return;
            }

            if (game == "UFO") {
                acronym = "LNN";
            } else if (game == "IN") {
                acronym = "LNNFS";
            } else if (game == "PCB" || game == "TD" || game == "HSiFS") {
                acronym = "LNNN";
            } else if (game == "WBaWC") {
                acronym = "LNNNN";
            }

            shot = (shotName(cap(shot)) ? shotName(cap(shot)) : cap(shot));

            if (shot.contains("team")) {
                shot = shot.replace(/team/i, "Team").replace(/ /gi, "");
            }

            if (shot.contains("final")) {
                shot = shot.replace(/finala/i, "FinalA").replace(/finalb/i, "FinalB");
            }

            if (shot.contains("ufos")) {
                shot = shot.replace(/ufos/i, "UFOs");
            }

            if (!LNNs[game].hasOwnProperty(shot)) {
                channel.send(message.author.username + ", please specify a valid shottype or route to remove an LNN player from.").catch(console.error);
                return;
            }

            LNNs[game][shot].remove(player);
            dateString = ('0' + date.getDate()).slice(-2) +
            '/' + ('0' + (date.getMonth() + 1)).slice(-2) +
            '/' + date.getFullYear();
            save("LNNs");

            if (fs.existsSync("/var/www/maribelhearn.com/assets/json/lnnlist.json")) {
                fs.copyFileSync("data/LNNs.txt", "/var/www/maribelhearn.com/assets/json/lnnlist.json");
            }

            channel.send("Removed " + player + " 's " + game + " " + acronym + (shot.contains("UFOs") ? "N" : "") +
            " with " + shot.replace("Team", " Team").replace("UFOs", "") + ".").catch(console.error);
        }
    },

    joinvoice: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes me join the voice channel.";
        },

        command: function (message, server, command, channel) {
            if (!serverData[server.id].voiceChannel) {
                channel.send(message.author.username + ", please tell me which voice channel to use (using the voicechannel command).").catch(console.error);
                return;
            }

            var voiceChannel = server.channels.cache.get(serverData[server.id].voiceChannel), item;

            if (!voiceChannel.connection === null) {
                channel.send(message.author.username + ", I am already in the voice channel!").catch(console.error);
                return;
            }

            voiceChannel.join().then(connection => {
                channel.send(message.author.username + ", I have connected to the voice channel.");

                if (serverData[server.id].queue && serverData[server.id].queue.length > 0 && !serverData[server.id].interruptionMode) {
                    channel.send("I will automatically resume the music queue.");
                    item = serverData[server.id].queue[0];

                    if (item.contains("http")) {
                        playYouTube(server, item);
                    } else {
                        playLocal(server, permData.musicLocal[item].file, permData.musicLocal[item].volume);
                    }
                }
            }).catch(console.error);
        }
    },

    leavevoice: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes me leave the voice channel.";
        },

        command: function (message, server, command, channel) {
            if (!serverData[server.id].voiceChannel) {
                channel.send(message.author.username + ", please tell me which voice channel to use (using the voicechannel command).").catch(console.error);
                return;
            }

            var voiceChannel = server.channels.cache.get(serverData[server.id].voiceChannel);

            if (voiceChannel.connection === null) {
                channel.send(message.author.username + ", I am not in the voice channel!").catch(console.error);
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
            var voiceChannel;

            if (bot.voice.connections.array().length > 0) {
                voiceChannel = bot.voice.connections.array()[0].channel;
                voiceChannel = voiceChannel.guild.channels.cache.get(voiceChannel.id);
            }

            if (!musicBlocked && voiceChannel.connection !== null) {
                voiceChannel.leave();
            }

            musicBlocked = !musicBlocked;
            channel.send("Music commands have been " + (!musicBlocked ? "un" : "") + "blocked!").catch(console.error);
        }
    },

    voicechannel: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [voice channel]`: makes `voice channel` my voice channel. " +
            "If `voice channel` is not specified, shows the current voice channel.";
        },

        command: function (message, server, command, channel) {
            var voiceChannel = command[1], resolve;

            if (!voiceChannel) {
                channel.send("My voice channel is currently <#" + serverData[server.id].mainChannel + ">.").catch(console.error);
                return;
            }

            resolve = server.channels.cache.find(chan => chan.name == voiceChannel);

            if (!resolve || resolve.type != "voice") {
                channel.send(message.author.username + ", that is not a voice channel!").catch(console.error);
                return;
            }

            serverData[server.id].voiceChannel = resolve.id;
            save("voiceChannel", server);
            channel.send(message.author.username + ", I will now use " + resolve.name + "!").catch(console.error);
        }
    },

    skip: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: skip the music from the queue that is currently being streamed to the voice channel.";
        },

        command: function (message, server, command, channel) {
            var queue = serverData[server.id].queue, message = "Current queue:\n```Markdown", voiceChannel, i;

            if (!queue || queue.length === 0) {
                channel.send("The queue is currently empty.");
                return;
            }

            if (serverData[server.id].interruptionMode) {
                channel.send("The server is currently on interruption mode, so the queue is not being used.");
                return;
            }

            serverData[server.id].queue.splice(0, 1);
            channel.send("Skipping the current music.");

            if (queue.length > 0) {
                item = serverData[server.id].queue[0];

                if (item.contains("http")) {
                    playYouTube(server, item);
                } else {
                    playLocal(server, permData.musicLocal[item].file, permData.musicLocal[item].volume);
                }
            } else {
                voiceChannel = server.channels.cache.get(serverData[server.id].voiceChannel);

                if (!voiceChannel.connection === null) {
                    voiceChannel.connection.disconnect();
                }
            }
        }
    },

    addimage: {
        args: [0, "an image file", "a description for the help command"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <image file> <description>`: adds a command that posts `image file` and has `description` when `" + symbol + "help` is used on it.\nThe file must be in the `images` folder.";
        },

        command: function (message, server, command, channel) {
            var image = command[1], description = command[2], name = path.parse(image).name, ext = path.parse(image).ext;

            if (![".gif", ".jpg", ".png"].contains(ext)) {
                channel.send(message.author.username + ", that file extension is not supported.").catch(console.error);
                return;
            }

            if (!fs.existsSync("images/" + image)) {
                channel.send(message.author.username + ", that file does not exist.").catch(console.error);
                return;
            }

            permData.images[name] = {"help": description, "file": image};
            save("images");
            channel.send("The image command `" + name + "` has been added.").catch(console.error);
        }
    },

    removeimage: {
        args: [0, "an image command"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <image command>`: removes `image command`. " +
            "Note that this does not delete the actual image file.";
        },

        command: function (message, server, command, channel) {
            var image = command[1].toLowerCase(), images = permData.images;

            if (!images.hasOwnProperty(image)) {
                channel.send(message.author.username + ", that is not an image command.").catch(console.error);
                return;
            }

            delete permData.images[image];
            save("images");
            channel.send("The image command `" + image + "` has been removed.").catch(console.error);
        }
    },

    addmusic: {
        args: [0, "music", "a description for the help command"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <name> <URL> <description> [volume]`: " +
            "adds a command called `name` that plays the music at `URL` on a voice channel and has `description` when `" + symbol +
            "help` is used on it.\nThe music must be a file in the `music` folder.\n" +
            "If `volume` is not specified, it will be set to 0.5.";
        },

        command: function (message, server, command, channel) {
            var name = command[1].toLowerCase(), url = command[2], description = command[3], volume = command[4],
                symbol = message.content.charAt(0), startTime = new Date(), test, ext, child;

            try {
                test = new URL(url);
                ext = url.substr(url.lastIndexOf('/'), url.length);

                if (!ext.contains('.')) {
                    throw new Error;
                }

                ext = ext.split('.')[1];
            } catch (err) {
                channel.send(message.author.username + ", please specify a valid URL.").catch(console.error);
                return;
            }

            if (!["wav", "mp3"].contains(ext)) {
                channel.send(message.author.username + ", that file extension is not supported.").catch(console.error);
                return;
            }

            child = exec("wget " + url + " -O music/" + cap(name) + "." + ext, function (error, stdout, stderr) {
                if (error !== null) {
                    channel.send("Error while downloading music file: " + error).catch(console.error);
                    return;
                }

                console.log(timeStamp() + "Downloaded file " + cap(name) + "." + ext + " from " + url + ".");
                console.log(timeStamp() + "Time elapsed: " + (new Date() - startTime) + " ms.");
                permData.musicLocal[name] = {"help": description, "file": name, "volume": (volume ? volume : 0.5)};
                save("musicLocal");
                channel.send("The music command `" + symbol + name + "` has been added.").catch(console.error);
            });
        }
    },

    removemusic: {
        args: [0, "a music command"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <music command>`: removes `music command`. " +
            "Note that this does not delete the actual music file, if there is one.";
        },

        command: function (message, server, command, channel) {
            var name = command[1].toLowerCase(), musicLocal = permData.musicLocal, symbol = message.content.charAt(0);

            if (musicLocal.hasOwnProperty(name)) {
                delete permData.musicLocal[name];
                channel.send("The music command `" + symbol + name + "` has been removed.").catch(console.error);
                save("musicLocal");
            } else {
                channel.send(message.author.username + ", that is not a music command.").catch(console.error);
            }
        }
    },

    musicname: {
        args: [0, "a music command", "a new name for that music command"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <music command> <name>`: changes the name of `music command` to `name`.";
        },

        command: function (message, server, command, channel) {
            var oldName = command[1].toLowerCase(), newName = command[2].toLowerCase(), musicLocal = permData.musicLocal,
                symbol = message.content.charAt(0);

            if (musicLocal.hasOwnProperty(oldName)) {
                permData.musicLocal[newName] = permData.musicLocal[oldName];
                delete permData.musicLocal[oldName];
                channel.send("The name of the music command `" + symbol + oldName +
                "` has been changed to `" + symbol + newName + "`.").catch(console.error);
                save("musicLocal");
            } else {
                channel.send(message.author.username + ", that is not a music command.").catch(console.error);
            }
        }
    },

    volume: {
        args: [0, "a music command", "a number denoting the volume"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <music command> <volume>`: changes the volume of `music command` to `volume`.";
        },

        command: function (message, server, command, channel) {
            var music = command[1].toLowerCase(), volume = Number(command[2]), musicLocal = permData.musicLocal,
                symbol = message.content.charAt(0);

            if (volume > 1.5) {
                channel.send(message.author.username + ", that is too loud!").catch(console.error);
                return;
            }

            if (musicLocal.hasOwnProperty(music)) {
                permData.musicLocal[newName].volume = volume;
                channel.send("The volume of the music command `" + symbol + music +
                "` has been changed to " + volume + ".").catch(console.error);
                save("musicLocal");
            } else {
                channel.send(message.author.username + ", that is not a music command.").catch(console.error);
            }
        }
    },

    addalias: {
        args: [0, "a command to make an alias for", "an alias for that command"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <command> <alias>`: adds `alias` as an alias for `command`.";
        },

        command: function (message, server, command, channel) {
            var commandName = command[1], alias = command[2], aliases = permData.aliases, alias;

            commandName = commandName.toLowerCase();

            if (!isCommand(commandName)) {
                channel.send(message.author.username + ", please specify a valid command to make an alias for.").catch(console.error);
                return;
            }

            alias = alias.toLowerCase();

            if (!aliases[commandName]) {
                permData.aliases[commandName] = [];
            }

            permData.aliases[commandName].push(alias);
            save("aliases");
            channel.send("Alias added.").catch(console.error);
        }
    },

    removealias: {
        args: [0, "a command to remove an alias from", "an alias to be removed from that command"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <command> <alias>`: removes `alias` from the list of aliases for `command`.";
        },

        command: function (message, server, command, channel) {
            var commandName = command[1], alias = command[2], aliases = permData.aliases, alias;

            commandName = commandName.toLowerCase();

            if (!isCommand(commandName)) {
                channel.send(message.author.username + ", please specify a valid command to remove an alias from.").catch(console.error);
                return;
            }


            alias = alias.toLowerCase();

            if (!aliases[commandName] || !aliases[commandName].contains(alias)) {
                channel.send(message.author.username + ", that is not an alias for that command.").catch(console.error);
                return;
            }

            permData.aliases[commandName].remove(alias);

            if (aliases[commandName].length === 0) {
                delete permData.aliases[commandName];
            }

            save("aliases");
            channel.send("Alias removed.").catch(console.error);
        }
    },

    togglekek: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: turns kek detection on or off.";
        },

        command: function (message, server, command, channel) {
            serverData[server.id].kekDetection = !serverData[server.id].kekDetection;
            save("kekDetection", server);
            channel.send("Kek detection has been turned **" + (serverData[server.id].kekDetection ? "on" : "off") + "**.").catch(console.error);
        }
    },

    botmaster: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes you the bot master. Testing server only.";
        },

        command: function (message, server, command, channel) {
            if (!serverData[server.id].isTestingServer) {
                channel.send(message.author.username + ", this command cannot be used on this server.");
                return;
            }

            permData.botMaster = message.author.id;
            save("botMaster");
            channel.send(message.author.username + ", you are now my master!").catch(console.error);
        }
    }
};
