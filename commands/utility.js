﻿module.exports = {
    botinfo: {
        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + "`: posts some information about me.";
        },

        command: function (message, server, command, channel) {
            var embed = new Discord.MessageEmbed(), botMasterTag = '-', botMaster;

            if (permData.botMaster !== "") {
                botMaster = bot.users.cache.get(permData.botMaster);
                botMasterTag = botMaster.username + "#" + botMaster.discriminator;
            }

            embed.setThumbnail(bot.user.avatarURL());
            embed.addField("Name", bot.user.username, true);
            embed.addField("Master", botMasterTag, true);
            embed.addField("Host OS", formatType(os.type()));
            embed.addField("Uptime", time(bot.uptime));
            channel.send({embed}).catch(console.error);
        }
    },

    whois: {
        args: [0, "a member of this server"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <member>`: posts information about `member`. " +
            "`member` must be a member of this server.";
        },

        command: function (message, server, command, channel) {
            var user = command[1], members = server.members.cache, roleArray = [],
                maxPosition = -1, userObject, roles, color, embed, i, j;

            for (i = 0; i < members.size; i++) {
                if (members.array()[i].user.username.toLowerCase() == user.toLowerCase()) {
                    userObject = members.array()[i];
                    roles = userObject.roles.cache.array();

                    for (j = 0; j < roles.length; j++) {
                        if (roles[j].name != "@everyone") {
                            roleArray.push(roles[j].name);

                            if (roles[j].position > maxPosition) {
                                color = roles[j].color;
                                maxPosition = roles[j].position;
                            }
                        }
                    }

                    embed = new Discord.MessageEmbed();
                    embed.setColor(color);
                    embed.setThumbnail(userObject.user.avatarURL());
                    embed.addField("Username", userObject.user.username, true);

                    if (userObject.nickname) {
                        embed.addField("Nickname", userObject.nickname, true);
                    }

                    embed.addField("Roles", (roleArray.length === 0 ? '-' : "`" + roleArray.join("`, `") + "`"));
                    embed.addField("Joined Discord", "`" + new Date(userObject.user.createdAt).UTC() + "`", true);
                    embed.addField("Joined This Server", "`" + new Date(userObject.joinedAt).UTC() + "`", true);
                    embed.addField("Avatar Source", "[Link](" + userObject.user.avatarURL() + ")");
                    channel.send({embed}).catch(console.error);
                    return;
                }
            }

            channel.send(message.author.username + ", there is no such user on this server.").catch(console.error);
        }
    },

    serverinfo: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: posts information about the server.";
        },

        command: function (message, server, command, channel) {
            var flag = ":flag_" + (regionFlag(server.region)) + ": ", createdDate = "`" + server.createdAt.UTC() + "`", embed;

            embed = new Discord.MessageEmbed();
            embed.setThumbnail(server.iconURL());
            embed.addField("Name", server.name, true);
            embed.addField("Owner", server.owner.user.username, true);
            embed.addField("Region", flag + formatRegion(server.region));
            embed.addField("Created At", createdDate);
            embed.addField("Members", sep(server.memberCount), true);
            embed.addField("Channels", sep(server.channels.cache.size), true);
            embed.addField("Roles", sep(server.roles.cache.size), true);
            embed.addField("Icon Source", "[Link](" + server.iconURL() + ")", true);
            channel.send({embed}).catch(console.error);
        }
    },

    emojis: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: posts the current server emojis.";
        },

        command: function (message, server, command, channel) {
            if (server.emojis.cache.size === 0) {
                channel.send("There are no server emojis!").catch(console.error);
                return;
            }

            channel.send("Server emojis: " + server.emojis.cache.array().join(' ') +
            "\nThere are currently **" + server.emojis.cache.size + "** emojis total.").catch(console.error);
        }
    },

    aliases: {
        args: [0, "a command to show the aliases for"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <command>`: shows currently active aliases for `command`.";
        },

        command: function (message, server, command, channel) {
            var commandName = command[1], aliases = permData.aliases, alias;

            commandName = commandName.toLowerCase();

            if (!isCommand(commandName)) {
                channel.send(message.author.username + ", please specify a valid command to show the aliases for.").catch(console.error);
                return;
            }

            if (!aliases[commandName]) {
                channel.send("There are no aliases for `" + message.content.charAt(0) + commandName + "`.");
            } else {
                channel.send("Aliases for `" + message.content.charAt(0) + commandName + "`: `" + aliases[commandName].join("`, `") + "`.");
            }
        }
    },

    botchannels: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: shows the channels I am allowed to be used in.";
        },

        command: function (message, server, command, channel) {
            if (!serverData[server.id].botChannels) {
                channel.send("There are no bot channels; I am allowed to be used everywhere in the server.");
                return;
            }

            channel.send("Current bot channels: <#" + serverData[server.id].botChannels.join(">, <#") + ">.");
        }
    },

    lewd: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: to grant yourself access to the lewd channel.";
        },

        command: function (message, server, command, channel) {
            if (!serverData[server.id].lewdAccessRole) {
                channel.send(message.author.username + ", this server does not have a lewd access role.");
                return;
            }

            var lewdAccess = server.roles.resolve(serverData[server.id].lewdAccessRole), user = server.members.resolve(message.author.id);

            if (user.roles.cache.get(serverData[server.id].lewdAccessRole)) {
                channel.send(message.author.username + ", you already have lewd access!");
                return;
            }

            user.roles.add(lewdAccess);
            channel.send(message.author.username + " has been granted lewd access!").catch(console.error);
        }
    },

    unlewd: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: to remove yourself from the lewd channel.";
        },

        command: function (message, server, command, channel) {
            if (!serverData[server.id].lewdAccessRole) {
                channel.send(message.author.username + ", this server does not have a lewd access role.");
                return;
            }

            var lewdAccess = server.roles.resolve(serverData[server.id].lewdAccessRole), user = server.members.resolve(message.author.id);

            if (!user.roles.cache.get(serverData[server.id].lewdAccessRole)) {
                channel.send(message.author.username + ", you do not have lewd access!");
                return;
            }

            user.roles.remove(lewdAccess);
            channel.send(message.author.username + " has been removed from the lewd channel!").catch(console.error);
        }
    },

    fire: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes you join the Fire faction of Kuruminism.";
        },

        command: function (message, server, command, channel) {
            if (Object.keys(serverData[server.id].factions).length < 4) {
                channel.send(message.author.username + ", this command cannot be used on this server.");
                return;
            }

            var factions = serverData[server.id].factions;

            var fire = server.roles.resolve(factions.fire), otherFactions = [factions.water, factions.earth, factions.wind];

            var user = server.members.resolve(message.author.id);

            if (user.roles.cache.has(factions.fire)) {
                channel.send(message.author.username + ", you are already in the Fire faction of Kuruminism!");
                return;
            }

            if (user.roles.cache.has(factions.water) || user.roles.cache.has(factions.earth) || user.roles.cache.has(factions.wind)) {
                user.roles.remove(otherFactions).then(member => {
                    member.roles.add(fire).catch(console.error);
                    channel.send(member + " is now a " + fire + "!");
                    return;
                }).catch(console.error);
            }

            user.roles.add(fire).catch(console.error);
            channel.send(user + " is now a " + fire + "!").catch(console.error);
        }
    },

    water: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes you join the Water faction of Kuruminism.";
        },

        command: function (message, server, command, channel) {
            if (Object.keys(serverData[server.id].factions).length < 4) {
                channel.send(message.author.username + ", this command cannot be used on this server.");
                return;
            }

            var factions = serverData[server.id].factions;

            var water = server.roles.resolve(factions.water), otherFactions = [factions.fire, factions.earth, factions.wind];

            var user = server.members.resolve(message.author.id);

            if (user.roles.cache.has(factions.water)) {
                channel.send(message.author.username + ", you are already in the Water faction of Kuruminism!");
                return;
            }

            if (user.roles.cache.has(factions.fire) || user.roles.cache.has(factions.earth) || user.roles.cache.has(factions.wind)) {
                user.roles.remove(otherFactions).then(member => {
                    member.roles.add(water).catch(console.error);
                    channel.send(member + " is now a " + water + "!");
                    return;
                }).catch(console.error);
            }

            user.roles.add(water).catch(console.error);
            channel.send(user + " is now a " + water + "!").catch(console.error);
        }
    },

    earth: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes you join the Earth faction of Kuruminism.";
        },

        command: function (message, server, command, channel) {
            if (Object.keys(serverData[server.id].factions).length < 4) {
                channel.send(message.author.username + ", this command cannot be used on this server.");
                return;
            }

            var factions = serverData[server.id].factions;

            var earth = server.roles.resolve(factions.earth), otherFactions = [factions.fire, factions.water, factions.wind];

            var user = server.members.resolve(message.author.id);

            if (user.roles.cache.has(factions.earth)) {
                channel.send(message.author.username + ", you are already in the Earth faction of Kuruminism!");
                return;
            }

            if (user.roles.cache.has(factions.fire) || user.roles.cache.has(factions.water) || user.roles.cache.has(factions.wind)) {
                user.roles.remove(otherFactions).then(member => {
                    member.roles.add(earth).catch(console.error);
                    channel.send(member + " is now a " + earth + "!");
                    return;
                }).catch(console.error);
            }

            user.roles.add(earth).catch(console.error);
            channel.send(user + " is now a " + earth + "!").catch(console.error);
        }
    },

    wind: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes you join the Wind faction of Kuruminism.";
        },

        command: function (message, server, command, channel) {
            if (Object.keys(serverData[server.id].factions).length < 4) {
                channel.send(message.author.username + ", this command cannot be used on this server.");
                return;
            }

            var factions = serverData[server.id].factions;

            var wind = server.roles.resolve(factions.wind), otherFactions = [factions.fire, factions.water, factions.earth];

            var user = server.members.resolve(message.author.id);

            if (user.roles.cache.has(factions.wind)) {
                channel.send(message.author.username + ", you are already in the Wind faction of Kuruminism!");
                return;
            }

            if (user.roles.cache.has(factions.fire) || user.roles.cache.has(factions.water) || user.roles.cache.has(factions.earth)) {
                user.roles.remove(otherFactions).then(member => {
                    member.roles.add(wind).catch(console.error);
                    channel.send(member + " is now a " + wind + "!");
                    return;
                }).catch(console.error);
            }

            user.roles.add(wind).catch(console.error);
            channel.send(user + " is now a " + wind + "!").catch(console.error);
        }
    },

    factions: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: shows the member counts for the factions of Kuruminism.";
        },

        command: function (message, server, command, channel) {
            if (Object.keys(serverData[server.id].factions).length < 4) {
                channel.send(message.author.username + ", this command cannot be used on this server.");
                return;
            }

            var factions = serverData[server.id].factions;

            var fire = server.roles.resolve(factions.fire), water = server.roles.resolve(factions.water),
                earth = server.roles.resolve(factions.earth), wind = server.roles.resolve(factions.wind);

            var fireMembers = fire.members.size, waterMembers = water.members.size,
                earthMembers = earth.members.size, windMembers = wind.members.size,
                factionMembers, biggest;

            factionMembers = [fireMembers, waterMembers, earthMembers, windMembers].sort(numericSort);

            if (fireMembers == waterMembers && waterMembers == earthMembers && earthMembers == windMembers) {
                // do nothing
            } else {
                biggest = Math.max(Math.max(Math.max(fireMembers, waterMembers), earthMembers), windMembers);

                if (biggest == fireMembers) {
                    fireMembers = "**" + fireMembers + "**";
                } else if (biggest == waterMembers) {
                    waterMembers = "**" + waterMembers + "**";
                } else if (biggest == earthMembers) {
                    earthMembers = "**" + earthMembers + "**";
                } else if (biggest == windMembers) {
                    windMembers = "**" + windMembers + "**";
                }
            }

            channel.send("Member counts for the Kuruminist factions:\n<@&" + fire + ">: " + fireMembers +
            "\n<@&" + water + ">: " + waterMembers + "\n<@&" + earth + ">: " + earthMembers +
            "\n<@&" + wind + ">: " + windMembers).catch(console.error);
        }
    },

    lnn: {
        args: [0, "a game to check LNNs of"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <game> [shottype/route]`: shows the list of LNN players for `game` with `shottype/route`. " +
            "If `shottype/route` is not specified, shows the list of all LNN players for `game`.";
        },

        command: function (message, server, command, channel) {
            var game = command[1], acronym = "LNN", LNNs = permData.LNNs;

            game = gameName(game.toLowerCase());

            if (!LNNs.hasOwnProperty(game)) {
                channel.send(message.author.username + ", please specify a valid game to check LNNs of.").catch(console.error);
                return;
            }

            if (game == "UFO") {
                acronym = "LNN(N)";
            } else if (game == "IN") {
                acronym = "LNNFS";
            } else if (game == "PCB" || game == "TD" || game == "HSiFS") {
                acronym = "LNNN";
            } else if (game == "WBaWC") {
                acronym = "LNNNN";
            }

            var shot = command[2], list = "", total = 0, shottype, count;

            if (shot) {
                shot = (shotName(cap(shot)) ? shotName(cap(shot)) : cap(shot));

                if (shot.contains("team")) {
                    shot = shot.replace(/team/i, "Team").replace(/ /gi, "");
                }

                if (!LNNs[game][shot]) {
                    channel.send(message.author.username + ", " + shot.replace("Team", " Team") + " is not a valid shottype or route.").catch(console.error);
                    return;
                } else if (LNNs[game][shot].length === 0) {
                    channel.send("There are no " + game + " " + acronym + " runs with " + shot + ".").catch(console.error);
                    return;
                }

                list = LNNs[game][shot].sort().join(", ");
                total += LNNs[game][shot].length;
                channel.send("List of players who have " + game + " " + acronym + " with " + shot.replace("Team", " Team") + ":```" + list + "```\n" +
                "Total number of players who have " + game + " " + acronym + " with " + shot.replace("Team", " Team") + ": " + total + ".").catch(console.error);
                return;
            }

            for (shottype in LNNs[game]) {
                if (LNNs[game][shottype].length !== 0) {
                    list += shottype.replace("Team", " Team").replace("Final", " Final").replace("UFOs", " UFOs") +
                    ": " + LNNs[game][shottype].sort().join(", ") + " (" + (LNNs[game][shottype].length) + ")\n";
                }
            }

            count = countLNNs(game);

            if (count === 0) {
                channel.send("There are no " + game + " " + acronym + " runs.").catch(console.error);
                return;
            }

            channel.send("List of players who have " + game + " " + acronym + ":\n```\n" + list + "```\n" +
            "Total number of players who have " + game + " " + acronym + ": " + count + ".\n").catch(console.error);
        }
    },

    wr: {
        args: [0, "a game to check a world record of"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <game> [difficulty] [shottype/route]`: shows the world record in `game` `difficulty` `shottype/route`.\n" +
            "If `difficulty` or `shottype/route` are not specified, selects the overall world record of the game or difficulty.";
        },

        command: function (message, server, command, channel) {
            var game = command[1];

            game = gameName(game.toLowerCase());

            if (!permData.WRs.hasOwnProperty(game)) {
                channel.send(message.author.username + ", please specify a valid game to check a world record of.").catch(console.error);
                return;
            }

            var difficulty = command[2];

            if (!difficulty) {
                game == "SoEW" || game == "MS" ? difficulty = "Extra" : difficulty = "Lunatic";
            } else {
                difficulty = cap(difficulty.toLowerCase());
            }

            if (!permData.WRs[game][difficulty]) {
                channel.send(message.author.username + ", please specify a valid difficulty to check a world record of.").catch(console.error);
                return;
            }

            var shot = command[3], difficultyWRs = permData.WRs[game][difficulty];

            if (shot) {
                shot = (shotName(cap(shot)) ? shotName(cap(shot)) : cap(shot));

                if (shot.contains("team")) {
                    shot = shot.replace(/team/i, "Team").replace(/ /gi, "");
                }

                if (!permData.WRs[game][difficulty][shot]) {
                    channel.send(message.author.username + ", " + shot.replace("Team", " Team") + " is not a valid shottype or route.").catch(console.error);
                    return;
                }
            }

            var max = -1, overall;

            for (var i in difficultyWRs) {
                if (difficultyWRs[i][0] > max) {
                    max = difficultyWRs[i][0];
                    overall = i;
                }
            }

            if (!shot) {
                shot = overall;
            }

            var wrArray = difficultyWRs[shot], wr = sep(wrArray[0]), player = wrArray[1], date = wrArray[2];

            if (wr === "0") {
                channel.send("There is no known world record for that category!").catch(console.error);
                return;
            }

            channel.send("The world record for " + game + " " + difficulty + " " + shot.replace("Team", " Team") +
            " is " + wr + " by " + player + ", set on " + date + "." + (shot == overall ? " (overall WR)" : "")).catch(console.error);
        }
    },

    wrlist: {
        args: [0, "a game to check the world records of"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <game> <difficulty> [order]`: shows the list of world records in `game` `difficulty`, sorted by `order`, which is 'shot(type)' or 'score'.\n" +
            "If `order` is not specified, orders the world records by shottype.";
        },

        command: function (message, server, command, channel) {
            var game = command[1];

            game = gameName(game.toLowerCase());

            if (!permData.WRs[game]) {
                channel.send(message.author.username + ", please specify a valid game to check the world records of.").catch(console.error);
                return;
            }

            var difficulty = command[2];

            if (!difficulty) {
                channel.send(message.author.username + ", please specify a difficulty to check the world records of.").catch(console.error);
                return
            }

            difficulty = cap(difficulty.toLowerCase());

            if (!permData.WRs[game][difficulty]) {
                channel.send(message.author.username + ", please specify a valid difficulty to check the world records of.").catch(console.error);
                return;
            }

            if (game == "GFW" && difficulty == "Extra") {
                channel.send(">implying GFW Extra has a list of records").catch(console.error);
                return;
            }

            var order = command[3];

            if (!order) {
                order = "shottype";
            } else {
                order = order.toLowerCase().replace("type", "").replace("shots", "shot").replace("scores", "score");

                if (order != "shot" && order != "score") {
                    channel.send(message.author.username + ", please specify a valid order to sort the world records with.").catch(console.error);
                    return;
                }

                order = order.replace("shot", "shottype");
            }

            var difficultyWRs = permData.WRs[game][difficulty], max = 0, list = "", scores = [], count = 1, shot, overall, wr;

            for (shot in difficultyWRs) {
                if (difficultyWRs[shot][0] > max) {
                    max = difficultyWRs[shot][0];
                    overall = shot;
                }
            }

            if (order == "score") {
                for (shot in difficultyWRs) {
                    scores.push(difficultyWRs[shot][0]);
                }

                scores.sort(numericSort);

                while (count <= Object.keys(difficultyWRs).length) {
                    for (shot in difficultyWRs) {
                        if (difficultyWRs[shot][0] == scores[count - 1]) {
                            list += count + ". " + shot + ": " + sep(difficultyWRs[shot][0]) +
                            " by " + difficultyWRs[shot][1] + " on " + difficultyWRs[shot][2] + "\n";
                            break;
                        }
                    }

                    count++;
                }
            } else {
                for (shot in difficultyWRs) {
                    if (difficultyWRs[shot][0] === 0) {
                        continue;
                    }

                    list += shot + ": " + (shot == overall ? "**" + sep(difficultyWRs[shot][0]) + "**" : sep(difficultyWRs[shot][0])) +
                    " by " + difficultyWRs[shot][1] + " on " + difficultyWRs[shot][2] + "\n";
                }
            }


            if (list === "") {
                channel.send("There are no known world records for that difficulty!").catch(console.error);
                return;
            }

            channel.send("List of " + game + " " + difficulty + " records (ordered by " + order + "):\n```Markdown\n" + list + "```").catch(console.error);
        }
    },

    wrupdated: {
        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you when the world records were last updated.";
        },

        command: function (message, server, command, channel) {
            channel.send("The world records were last updated at " + permData.WRsLastUpdated + ".").catch(console.error);
        }
    },

    calc: {
        args: [0, "a calculation"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <input>`: calculates the result of `input`, where `input` is a mathematical " +
            "calculation. Please do not divide by zero, since I don't think I can handle that!";
        },

        parse: function (input) {
            var pattern1 = /\+|-|\*|\/|%/, pattern2 = /\d+/, result = "", original = input, numbers, ops, i;

            if (input.contains('^')) {
                input = input.split(pattern1);

                for (i = 0; i < input.length; i++) {
                    if (input[i].contains('^')) {
                        numbers = input[i].split('^');
                        input[i] = String(Math.pow(numbers[0], numbers[1]));
                    }
                }

                ops = original.split(pattern2).splice(0, 1);
                ops.splice(ops.length - 1);

                while (ops.contains('^')) {
                    ops.remove('^');
                }

                for (i = 0; i < input.length; i++) {
                    result += String(input[i] + (ops[i] ? ops[i] : ""));
                }
            } else {
                result = input;
            }

            return eval(result);
        },

        command: function (message, server, command, channel) {
            var input = command[1].replace(/ /g, ""), pattern = /\+|-|\*|\/|%|\^|\(|\)/g, result;

            if (isNaN(input.replace(pattern, ""))) {
                channel.send(message.author.username + ", please enter valid math.");
                return;
            }

            try {
                result = this.parse(input);
                channel.send("Result: " + sep(result));
            } catch (err) {
                channel.send("Error: " + err);
            }
        }
    },

    meters: {
        args: [0, "use `%shelp meters` to learn how to use this command"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <feet>' <inches>''`: converts `feet` and `inches` to meters.";
        },

        feetAndInchesToMeters: function (feetAndInches) {
            // Feet and inches must be in the format 6' 4'' or 6'4''
            var tmp = (feetAndInches.indexOf(' ') != -1 ? feetAndInches.split("' ") : feetAndInches.split("'"));

            var feet = parseInt(tmp[0]), inches = parseInt(tmp[1].replace("''", ""));

            var meters = ((feet + inches / 12) / 3.2808399).toPrecision(3);

            return meters;
        },

        command: function (message, server, command, channel) {
            var feetAndInches = command[1], symbol = message.content.charAt(0), notation = /(\d+)'\s*(\d+)''/;

            if (!notation.test(feetAndInches)) {
                channel.send(message.author.username + ", use `" + symbol + "help meters` to learn how to use this command.").catch(console.error);
                return;
            }

            meters = this.feetAndInchesToMeters(feetAndInches);
            channel.send(message.author.username + ", " + feetAndInches + " is equal to " + meters + " meters in the metric system.").catch(console.error);
        }
    },

    feet: {
        args: [0, "a number of meters to convert"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <meters>`: converts `meters` to feet and inches.";
        },

        metersToFeetAndInches: function (meters) {
            var feet = meters * 3.2808399;

            var inches = Math.round((feet - Math.floor(feet)) * 12);

            var feetAndInches = Math.floor(feet) + "' " + inches + "''";

            return feetAndInches;
        },

        command: function (message, server, command, channel) {
            var meters = command[1], feetAndInches;

            feetAndInches = this.metersToFeetAndInches(meters);
            channel.send(message.author.username + ", " + meters + " meters is equal to " + feetAndInches + " in the imperial system.").catch(console.error);
        }
    },

    km: {
        args: [0, "a number of miles to convert"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <miles>: converts `miles` to kilometers.";
        },

        command: function (message, server, command, channel) {
            var miles = command[1], km;

            km = Math.round(miles * 1.609344);
            channel.send(message.author.username + ", " + miles + " miles are equal to " + km + " kilometers.").catch(console.error);
        }
    },

    miles: {
        args: [0, "a number of kilometers to convert"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <kilometers>: converts `kilometers` to miles.";
        },

        command: function (message, server, command, channel) {
            var km = command[1];

            miles = Math.round(km / 1.609344);
            channel.send(message.author.username + ", " + km + " kilometers are equal to " + miles + " miles.").catch(console.error);
        }
    },

    litres: {
        args: [0, "a number of US gallons to convert"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <US gallons>`: converts `US gallons` to litres.";
        },

        command: function (message, server, command, channel) {
            var gallons = Number(command[1]), litres;

            litres = gallons * 3.785411784;
            channel.send(message.author.username + ", " + gallons + " US gallons are equal to " + litres + " litres.").catch(console.error);
        }
    },

    gallons: {
        args: [0, "a number of litres to convert"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <litres>`: converts `litres` to US gallons.";
        },

        command: function (message, server, command, channel) {
            var litres = Number(command[1]), gallons;

            gallons = litres * 0.26417205124156;
            channel.send(message.author.username + ", " + litres + " litres are equal to " + gallons + " US gallons.").catch(console.error);
        }
    },

    c2f: {
        args: [0, "a number of degrees Celsius to convert"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <degrees Celsius>`: converts `degrees Celsius` to Fahrenheit.";
        },

        command: function (message, server, command, channel) {
            var celsius = command[1];

            fahrenheit = Math.round(celsius * 1.8 + 32);
            channel.send(message.author.username + ", " + celsius + " °C is equal to " + fahrenheit + " °F.").catch(console.error);
        }
    },

    c2k: {
        args: [0, "a number of degrees Celsius to convert"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <degrees Celsius>`: converts `degrees Celsius` to Kelvin.";
        },

        command: function (message, server, command, channel) {
            var celsius = command[1];

            kelvin = Math.round(Number(celsius) + 273.15);
            channel.send(message.author.username + ", " + celsius + " °C is equal to " + kelvin + " K.").catch(console.error);
        }
    },

    f2c: {
        args: [0, "a number of degrees Fahrenheit to convert"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <degrees Fahrenheit>`: converts `degrees Fahrenheit` to Celsius.";
        },

        command: function (message, server, command, channel) {
            var fahrenheit = command[1];

            celsius = Math.round((fahrenheit - 32) / 1.8);
            channel.send(message.author.username + ", " + fahrenheit + " °F is equal to " + celsius + " °C.").catch(console.error);
        }
    },

    f2k: {
        args: [0, "a number of degrees Fahrenheit to convert"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <degrees Fahrenheit>`: converts `degrees Fahrenheit` to Kelvin.";
        },

        command: function (message, server, command, channel) {
            var fahrenheit = command[1];

            kelvin = Math.round((Number(fahrenheit) + 459.67) / 1.8);
            channel.send(message.author.username + ", " + fahrenheit + " °F is equal to " + kelvin + " K.").catch(console.error);
        }
    },

    k2c: {
        args: [0, "a number of degrees Kelvin to convert"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <degrees Kelvin>`: converts `degrees Kelvin` to Celsius.";
        },

        command: function (message, server, command, channel) {
            var kelvin = command[1];

            celsius = Math.round(kelvin - 273.15);
            channel.send(message.author.username + ", " + kelvin + " K is equal to " + celsius + " °C.").catch(console.error);
        }
    },

    k2f: {
        args: [0, "a number of degrees Kelvin to convert"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <degrees Kelvin>`: converts `degrees Kelvin` to Fahrenheit.";
        },

        command: function (message, server, command, channel) {
            var kelvin = command[1];

            fahrenheit = Math.round(kelvin * 1.8 - 459.67);
            channel.send(message.author.username + ", " + kelvin + " K is equal to " + fahrenheit + " °F.").catch(console.error);
        }
    },

    weather: {
        args: [0, "a place to look up"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <place>`: looks up current weather in `place`. Undefined behaviour can occur if the place does not exist.";
        },

        command: function (message, server, command, channel) {
            var place = command[1];

            if (permData.weatherKey === "") {
                channel.send("This command is currently disabled. Use `!setweatherapi <API key>` to enable it.").catch(console.error);
                return;
            }

            if (cooldown) {
                channel.send("Please do not flood the channel!").catch(console.error);
                return;
            }

            request(weatherUrl(place), function (error, response, body) {
                var result = JSON.parse(body);

                if (result.sys === undefined) {
                    channel.send("An error occurred while trying to retrieve the weather data.").catch(console.error);
                    return;
                }

                var countryCode = result.sys.country, weather = "", i;

                if (!countryCode) {
                    countryCode = "AQ";
                }

                for (i = 0; i < Object.keys(result.weather).length; i++) {
                    weather += result.weather[i].description + (i != Object.keys(result.weather).length - 1 ? ", " : "");
                }

                var celsius = (result.main.temp - 273.15).toFixed(2), humidity = result.main.humidity, wind = result.wind.speed;

                var direction = degreesToDirection(result.wind.deg), fahrenheit, embed;

                direction = (direction ? " (" + direction + ")" : "");
                weather = weatherEmoji(weather) + weather;
                fahrenheit = (celsius * 1.8 + 32).toFixed(2);
                embed = new Discord.MessageEmbed();
                embed.addField("Location", ":flag_" + countryCode.toLowerCase() + ": " + "[" + result.name + "](" + mapsUrl(place, countryCode) + ")");
                embed.addField("Weather", weather);
                embed.addField("Temperature", celsius + " °C / " + fahrenheit + " °F", true);
                embed.addField("Humidity", humidity + "%", true);
                embed.addField("Wind Speed", wind + " m/s" + direction, true);
                channel.send({embed}).catch(console.error);

                if (channel.type != "dm" && serverData[server.id].cooldownSecs > 0) {
                    cooldown = true;
                    timers.setInterval(function () { cooldown = false; }, serverData[server.id].cooldownSecs * 1000);
                }
            });
        }
    },

    time: {
        args: [0, "a UTC offset"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <UTC offset>`: gives the local time at `UTC offset`.";
        },

        command: function (message, server, command, channel) {
            var timezone = command[1], date = new Date(), offset, msUTC, msTimezone, localTime, timezoneText = timezone;

            if (timezone.contains(':')) {
                timezone = timezone.split(':')[0] + '.';

                if (timezone.split(':')[1] == "30") {
                    timezone += "5";
                } else if (timezone.split(':')[1] == "45") {
                    timezone += "75";
                } else {
                    channel.send(message.author.username + ", please specify a valid UTC offset.").catch(console.error);
                    return;
                }
            }

            offset = Number(timezone.replace("UTC", "").replace("GMT", ""));

            if (isNaN(offset)) {
                channel.send(message.author.username + ", please specify a valid UTC offset.").catch(console.error);
                return;
            }

            if (offset < -12 || offset > 14) {
                channel.send(message.author.username + ", that time zone does not exist.").catch(console.error);
                return;
            }

            if (timezone == offset) {
                timezoneText = "UTC" + (offset >= 0 ? "+" : "") + offset;
            }

            msUTC = date.getTime() + (date.getTimezoneOffset() * 60000);
            msTimezone = msUTC + (3600000 * offset);
            localTime = new Date(msTimezone - (date.getTimezoneOffset() * 60000)).local();
            channel.send("The local time in " + timezoneText + " is " + localTime + ".").catch(console.error);
        }
    },

    localtime: {
        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + "`: gives my local time.";
        },

        command: function (message, server, command, channel) {
            var date = new Date();

            channel.send("My current local time is " + new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).local() + ".").catch(console.error);
        }
    },

    country: {
        args: [0, "a country"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <country>`: tells you the flag of `country`. ";
        },

        command: function (message, server, command, channel) {
            var country = command[1], alt;

            country = countryAlt(country);

            if (COUNTRIES.hasOwnProperty(country.toLowerCase())) {
                channel.send("The flag of " + camel(country) + " is " + flag(country)).catch(console.error);
            } else if (isFlagCode(country)) {
                channel.send("The flag of " + countryName(country) + " is :flag_" + country + ":").catch(console.error);
            } else {
                channel.send(message.author.username + ", please specify a valid country.").catch(console.error);
            }
        }
    },

    trace: {
        args: [0, "an IPv4 address"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <IPv4 address>`: traces the location of `IPv4 address`. " +
            "Local network addresses will not work.";
        },

        command: function (message, server, command, channel) {
            var ip = command[1], startTime = new Date();

            if (permData.ipKey === "") {
                channel.send("This command is currently disabled. Use `!setipapi <API key>` to enable it.").catch(console.error);
                return;
            }

            if (cooldown) {
                channel.send("Please do not overuse this command!").catch(console.error);
                return;
            }

            if (!net.isIPv4(ip)) {
                channel.send(message.author.username + ", please specify a valid IPv4 address.").catch(console.error);
                return;
            }

            if (ip.substr(0, 2) == "0." || ip == "127.0.0.1" || range(ip) == "192.168") {
                channel.send("Cannot trace local network addresses").catch(console.error);
                return;
            }

            request(ipTracingUrl(ip), function (error, response, body) {
                if (error) {
                    channel.send("An error occurred while trying to trace the IP address.").catch(console.error);
                    return;
                }

                var statusCode = response.statusCode;

                if (statusCode == 200) {
                    var json = JSON.parse(body);

                    channel.send("Location of " + ip + ": " + flag(json.countryName) +
                    " " + json.cityName + " (time zone: UTC" + json.timeZone + ")");
                } else {
                    channel.send("Error " + statusCode + " " + cap(response.statusMessage));
                }
            });
        }
    },

    queue: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: show the current voice channel music queue.";
        },

        command: function (message, server, command, channel) {
            var queue = serverData[server.id].queue, message = "Current queue:\n```Markdown", i;

            if (!queue || queue.length === 0) {
                channel.send("The queue is currently empty.").catch(console.error);
                return;
            }

            if (serverData[server.id].interruptionMode) {
                channel.send("The server is currently on interruption mode, so the queue is not being used.").catch(console.error);
                return;
            }

            for (i = 0; i < queue.length; i++) {
                message += "\n" + (i + 1) + ". " + queue[i] + (i === 0 ? " <=" : "");
            }

            message += "\n```";
            channel.send(message);
        }
    }
};
