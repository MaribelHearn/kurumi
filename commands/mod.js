module.exports = {
    kick: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <user> [reason]`: kicks `user` for `reason`.";
        },

        command: function (message, server, command, channel) {
            var toBeKicked = command[1];

            if (!toBeKicked) {
                channel.send(message.author.username + ", please specify the user to be kicked.").catch(console.error);
                return;
            }

            var members = toUsers(server.members);

            toBeKicked = toBeKicked.toLowerCase();

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
        help: function (command, symbol) {
            return "`" + symbol + command + " <user> [reason] [deletedays]`: bans `user` for `reason` and deletes their messages from the last `deletedays` days (default 0).";
        },

        command: function (message, server, command, channel) {
            var toBeBanned = command[1];

            if (!toBeBanned) {
                channel.send(message.author.username + ", please specify the user to be banned.").catch(console.error);
                return;
            }

            var members = toUsers(server.members);

            toBeBanned = toBeBanned.toLowerCase();

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

    reset: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: resets the RNG-generated values.";
        },

        command: function (message, server, command, channel) {
            serverData[server.id].waifus = {"user":{},"touhou":{},"spell":{},"fan":{},"lenen":{}};
            serverData[server.id].ratings = {};
            save("waifus", server);
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
                channel.send(message.author.username + ", please specify an author to remove a quote from.").catch(console.error);
                return;
            }

            var quote = command[2];

            if (!quote) {
                channel.send(message.author.username + ", please specify a quote to remove.").catch(console.error);
                return;
            }

            author = author.toLowerCase();

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
        help: function (command, symbol) {
            return "`" + symbol + command + " <quote>`: removes `scrubquote` from the list of scrubquotes.";
        },

        command: function (message, server, command, channel) {
            var scrubquote = command[1], scrubquotes = permData.scrubquotes;

            if (!scrubquote) {
                channel.send(message.author.username + ", please specify a scrubquote to remove.").catch(console.error);
                return;
            }

            if (!scrubquotes.contains(scrubquote)) {
                channel.send(message.author.username + ", that scrubquote is not in the list.").catch(console.error);
                return;
            }

            scrubquotes.remove(scrubquote);

            save("scrubquotes");
            channel.send("Scrubquote removed.").catch(console.error);
        }
    },

    addopinion: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <opinion> <good/bad>`: adds `opinion` (either `good` or `bad`) to the possible results of the opinion command.\nWriting '%t' in the opinion means it will be replaced by a random Touhou shmup.";
        },

        command: function (message, server, command, channel) {
            var opinion = command[1], type = command[2], badOpinions = serverData[server.id].badOpinions, goodOpinions = serverData[server.id].goodOpinions;

            if (!opinion) {
                channel.send(message.author.username + ", please specify an opinion to add.").catch(console.error);
                return;
            }

            if (badOpinions.contains(opinion) || goodOpinions.contains(opinion)) {
                channel.send(message.author.username + ", that opinion already exists.").catch(console.error);
                return;
            }

            if (!type) {
                channel.send(message.author.username + ", please specify whether the opinion is good or bad.").catch(console.error);
                return;
            }

            type = type.toLowerCase();

            if (!["bad", "good"].contains(type)) {
                channel.send(message.author.username + ", please specify whether the opinion is good or bad.").catch(console.error);
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
                channel.send(message.author.username + ", please specify an opinion to remove.").catch(console.error);
                return;
            }

            if (!badOpinions.contains(opinion) || !goodOpinions.contains(opinion)) {
                channel.send(message.author.username + ", that opinion does not exist.").catch(console.error);
                return;
            }

            if (!type) {
                channel.send(message.author.username + ", please specify whether the opinion is good or bad.").catch(console.error);
                return;
            }

            type = type.toLowerCase();

            if (!["bad", "good"].contains(type)) {
                channel.send(message.author.username + ", please specify whether the opinion is good or bad.").catch(console.error);
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

            var post = command[1], mainChannel = serverData[server.id].mainChannel;

            if (post.length > MESSAGE_CAP) {
                channel.send("Sorry, I cannot send anything longer than " + MESSAGE_CAP + " characters.");
                return;
            }

            if (mainChannel) {
                server.channels.cache.get(mainChannel).send(post).catch(console.error);
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
                bot.user.setActivity(null);
                channel.send("Game removed.").catch(console.error);
                return;
            }

            bot.user.setActivity(game);
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

    status: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [status]`: will set my status to `status`. If `status` is not specified, removes my status.";
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
        help: function (command, symbol) {
            return "`" + symbol + command + " <game> <difficulty> <shottype/route> <new WR> <player> <date> <replay>`: updates the world record in `game` `difficulty` `shottype/route` to `new WR` by `player`.";
        },

        command: function (message, server, command, channel) {
            var game = command[1], WRs = permData.WRs;

            if (!game) {
                channel.send(message.author.username + ", please specify a game to update a world record of.").catch(console.error);
                return;
            }

            game = gameName(game.toLowerCase());

            if (!WRs[game]) {
                channel.send(message.author.username + ", please specify a valid game to update a world record of.").catch(console.error);
                return;
            }

            var difficulty = command[2];

            if (!difficulty) {
                channel.send(message.author.username + ", please specify a difficulty to update a world record of.").catch(console.error);
                return;
            }

            difficulty = cap(difficulty.toLowerCase());

            if (!WRs[game][difficulty]) {
                channel.send(message.author.username + ", please specify a valid difficulty to update a world record of.").catch(console.error);
                return;
            }

            var shot = command[3], difficultyWRs = WRs[game][difficulty];

            if (!shot) {
                channel.send(message.author.username + ", please specify a shottype or route to update the world record of.").catch(console.error);
                return;
            }

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

            var newWR = command[4];

            if (!newWR || isNaN(newWR.replace(/\./g, "").replace(/\,/g, ""))) {
                channel.send(message.author.username + ", please specify the new world record.").catch(console.error);
                return;
            }

            if (Number(newWR) > MAX_SCORE || Number(newWR) <= 0) {
                channel.send(message.author.username + ", please specify a valid new world record.").catch(console.error);
                return;
            }

            newWR = Number(newWR.replace(/\./g, "").replace(/\,/g, ""));

            var newPlayer = command[5];

            if (!newPlayer) {
                channel.send(message.author.username + ", please specify the player that got the new world record.").catch(console.error);
                return;
            }

            var date = command[6];

            if (!date) {
                channel.send(message.author.username + ", please specify the date of the new world record.").catch(console.error);
                return;
            }

            var replay = command[7], oldWR, oldPlayer, extension, fileName, child;

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
        help: function (command, symbol) {
            return "`" + symbol + command + " <game> <difficulty> <new WestR> <player> <shottype>`: updates the Western record in `game` `difficulty` `shottype/route` to `new WestR` by `player`.";
        },

        command: function (message, server, command, channel) {
            var game = command[1], WestRs = permData.bestInTheWest;

            if (!game) {
                channel.send(message.author.username + ", please specify a game to update a Western record of.").catch(console.error);
                return;
            }

            game = gameName(game.toLowerCase());

            if (!WestRs[game]) {
                channel.send(message.author.username + ", please specify a valid game to update a Western record of.").catch(console.error);
                return;
            }

            var difficulty = command[2];

            if (!difficulty) {
                channel.send(message.author.username + ", please specify a difficulty to update a Western record of.").catch(console.error);
                return;
            }

            difficulty = cap(difficulty.toLowerCase());

            if (!WestRs[game][difficulty]) {
                channel.send(message.author.username + ", please specify a valid difficulty to update a Western record of.").catch(console.error);
                return;
            }

            var newWR = command[3];

            if (!newWR || isNaN(newWR.replace(/\./g, "").replace(/\,/g, ""))) {
                channel.send(message.author.username + ", please specify the new Western record.").catch(console.error);
                return;
            }

            if (Number(newWR) > MAX_SCORE || Number(newWR) <= 0) {
                channel.send(message.author.username + ", please specify a valid new Western record.").catch(console.error);
                return;
            }

            newWR = Number(newWR.replace(/\./g, "").replace(/\,/g, ""));

            var newPlayer = command[4];

            if (!newPlayer) {
                channel.send(message.author.username + ", please specify the player that got the new Western record.").catch(console.error);
                return;
            }

            var shottype = command[5];

            if (!shottype) {
                channel.send(message.author.username + ", please specify a shottype or route.").catch(console.error);
                return;
            }

            var oldWR, oldPlayer;

            oldWestR = WestRs[game][difficulty][0];
            oldPlayer = WestRs[game][difficulty][1];
            oldShot = WestRs[game][difficulty][2];
            WestRs[game][difficulty] = [newWR, newPlayer, shottype];
            permData.bestInTheWest[game][difficulty] = [newWR, newPlayer, shottype];
            save("bestInTheWest");

            if (fs.existsSync("/var/www/maribelhearn.com/assets/json/bestinthewest.json")) {
                fs.copyFileSync("data/bestInTheWest.txt", "/var/www/maribelhearn.com/assets/json/bestinthewest.json");
            }

            channel.send("`Score Update` New Western record in " + game + " " + difficulty +
            ": " + sep(oldWestR) + " by " + oldPlayer + " with " + oldShot.replace("Team", " Team") + " -> " + sep(newWR) +
            " by " + newPlayer + " with " + shottype.replace("Team", " Team") + "!").catch(console.error);
        }
    },

    addlnn: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <game> <shottype/route> <player> [replay]`: adds `player` to the list of `game` LNNs with `shottype/route`. Windows games (excl. PoFV) only.";
        },

        command: function (message, server, command, channel) {
            var game = command[1], LNNs = permData.LNNs, date = new Date(), dateString;

            if (!game) {
                channel.send(message.author.username + ", please specify a game to add an LNN player to.").catch(console.error);
                return;
            }

            game = gameName(game.toLowerCase());

            if (!LNNs.hasOwnProperty(game)) {
                channel.send(message.author.username + ", please specify a valid game to add an LNN player to.").catch(console.error);
                return;
            }

            var shot = command[2], acronym = "LNN", grammar = (game.charAt(0).match(/[E|I|H]/) ? "n " : " "), type;

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
                channel.send(message.author.username + ", please specify the shottype that was used or the route that was followed.").catch(console.error);
                return;
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

            var player = command[3];

            if (!player) {
                channel.send(message.author.username + ", please specify the player that got the new LNN.").catch(console.error);
                return;
            }

            if (LNNs[game][shot].contains(player)) {
                channel.send(message.author.username + ", that player already has that LNN!").catch(console.error);
                return;
            }

            var replay = command[4], extension, folder, fileName, child;

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
        help: function (command, symbol) {
            return "`" + symbol + command + " <game> <shottype/route> <player> <replay>`: sets that LNN's replay or video to <replay>.";
        },

        command: function (message, server, command, channel) {
            var game = command[1], LNNs = permData.LNNs, date = new Date(), dateString;

            if (!game) {
                channel.send(message.author.username + ", please specify a game.").catch(console.error);
                return;
            }

            game = gameName(game.toLowerCase());

            if (!LNNs.hasOwnProperty(game)) {
                channel.send(message.author.username + ", please specify a valid game.").catch(console.error);
                return;
            }

            var shot = command[2], acronym = "LNN", grammar = (game.charAt(0).match(/[E|I|H]/) ? "n " : " "), type;

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
                channel.send(message.author.username + ", please specify the shottype that was used or the route that was followed.").catch(console.error);
                return;
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

            var player = command[3];

            if (!player) {
                channel.send(message.author.username + ", please specify the player that got the LNN.").catch(console.error);
                return;
            }

            if (!LNNs[game][shot].contains(player)) {
                channel.send(message.author.username + ", that player does not have that LNN!").catch(console.error);
                return;
            }

            var replay = command[4], extension, folder, fileName, child;

            if (!replay) {
                channel.send(message.author.username + ", please specify the new replay or video.").catch(console.error);
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
        help: function (command, symbol) {
            return "`" + symbol + command + " <game> <shottype/route> <player>`: removes `player` from the list of `game` LNNs with `shottype/route`.";
        },

        command: function (message, server, command, channel) {
            var game = command[1], LNNs = permData.LNNs, date = new Date(), dateString;

            if (!game) {
                channel.send(message.author.username + ", please specify a game to remove an LNN player from.").catch(console.error);
                return;
            }

            game = gameName(game.toLowerCase());

            if (!LNNs.hasOwnProperty(game)) {
                channel.send(message.author.username + ", please specify a valid game to remove an LNN player from.").catch(console.error);
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
                channel.send(message.author.username + ", please specify the shottype that was used or the route that was followed.").catch(console.error);
                return;
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

            var player = command[3];

            if (!player) {
                channel.send(message.author.username + ", please specify the player to remove.").catch(console.error);
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

                if (serverData[server.id].queue && serverData[server.id].queue.length > 0) {
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
            if (!serverData[server.id].voiceChannel) {
                channel.send(message.author.username + ", please tell me which voice channel to use (using the voicechannel command).").catch(console.error);
                return;
            }

            var voiceChannel = server.channels.cache.get(serverData[server.id].voiceChannel);

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
            var voiceChannel = command[1], resolve;

            if (!voiceChannel) {
                channel.send(message.author.username + ", please specify a voice channel.").catch(console.error);
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
        help: function (command, symbol) {
            return "`" + symbol + command + " <image file> <description>`: adds a command that posts `image file` and has `description` when `" + symbol + "help` is used on it.\nThe file must be in the `images` folder.";
        },

        command: function (message, server, command, channel) {
            var image = command[1], name, ext, description = command[2];

            if (!image) {
                channel.send(message.author.username + ", please specify an image file.").catch(console.error);
                return;
            }

            name = path.parse(image).name;
            ext = path.parse(image).ext;

            if (![".gif", ".jpg", ".png"].contains(ext)) {
                channel.send(message.author.username + ", that file extension is not supported.").catch(console.error);
                return;
            }

            if (!fs.existsSync("images/" + image)) {
                channel.send(message.author.username + ", that file does not exist.").catch(console.error);
                return;
            }

            if (!description) {
                channel.send(message.author.username + ", please specify a description for the help command.").catch(console.error);
                return;
            }

            permData.images[name] = {"help": description, "file": image};
            save("images");
            channel.send("The image command `" + name + "` has been added.").catch(console.error);
        }
    },

    removeimage: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <image command>`: removes `image command`. Note that this does not delete the actual image file.";
        },

        command: function (message, server, command, channel) {
            var image = command[1], images = permData.images;

            if (!image) {
                channel.send(message.author.username + ", please specify an image command.").catch(console.error);
                return;
            }

            image = image.toLowerCase();

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
        help: function (command, symbol) {
            return "`" + symbol + command + " <music> <description> [volume]`: adds a command that plays `music` on a voice channel and has `description` when `" + symbol + "help` is used on it.\nThe music must be a file in the `music` folder.\nIf `volume` is not specified, it will be set to 0.5.";
        },

        command: function (message, server, command, channel) {
            var music = command[1], url, name, ext, description = command[2], volume = command[3];

            if (!music) {
                channel.send(message.author.username + ", please specify music.").catch(console.error);
                return;
            }

            name = path.parse(music).name;
            ext = path.parse(music).ext;

            if (![".wav", ".mp3"].contains(ext)) {
                channel.send(message.author.username + ", that file extension is not supported.").catch(console.error);
                return;
            }

            if (!fs.existsSync("music/" + music)) {
                channel.send(message.author.username + ", that file does not exist.").catch(console.error);
                return;
            }

            if (!description) {
                channel.send(message.author.username + ", please specify a description for the help command.").catch(console.error);
                return;
            }

            permData.musicLocal[name.toLowerCase()] = {"help": description, "file": music, "volume": (volume ? volume : 0.5)};
            save("musicLocal");
            channel.send("The music command `" + name + "` has been added.").catch(console.error);
        }
    },

    removemusic: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <music command>`: removes `music command`. Note that this does not delete the actual music file, if there is one.";
        },

        command: function (message, server, command, channel) {
            var music = command[1], musicLocal = permData.musicLocal;

            if (!music) {
                channel.send(message.author.username + ", please specify a music command.").catch(console.error);
                return;
            }

            music = music.toLowerCase();

            if (musicLocal.hasOwnProperty(music)) {
                delete permData.musicLocal[music];
                channel.send("The music command `" + music + "` has been removed.").catch(console.error);
                save("musicLocal");
            } else {
                channel.send(message.author.username + ", that is not a music command.").catch(console.error);
            }
        }
    },

    addalias: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <command> <alias>`: adds `alias` as an alias for `command`.";
        },

        command: function (message, server, command, channel) {
            var aliases = permData.aliases, commandName = command[1], alias;

            if (!commandName) {
                channel.send(message.author.username + ", please specify a command to make an alias for.").catch(console.error);
                return;
            }

            commandName = commandName.toLowerCase();

            if (!isCommand(commandName)) {
                channel.send(message.author.username + ", please specify a valid command to make an alias for.").catch(console.error);
                return;
            }

            alias = command[2];

            if (!alias) {
                channel.send(message.author.username + ", please specify an alias for that command.").catch(console.error);
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
        help: function (command, symbol) {
            return "`" + symbol + command + " <command> <alias>`: removes `alias` from the list of aliases for `command`.";
        },

        command: function (message, server, command, channel) {
            var aliases = permData.aliases, commandName = command[1], alias;

            if (!commandName) {
                channel.send(message.author.username + ", please specify a command to remove an alias from.").catch(console.error);
                return;
            }

            commandName = commandName.toLowerCase();

            if (!isCommand(commandName)) {
                channel.send(message.author.username + ", please specify a valid command to remove an alias from.").catch(console.error);
                return;
            }

            alias = command[2];

            if (!alias) {
                channel.send(message.author.username + ", please specify the alias to be removed from that command.").catch(console.error);
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
