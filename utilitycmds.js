module.exports = {
    botinfo: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: posts some information about me.";
        },
        
        command: function (message, server, command, channel) {
            var embed = new Discord.RichEmbed();
            
            embed.setThumbnail(bot.user.avatarURL);
            embed.addField("Name", bot.user.username, true);
            embed.addField("Master", (permData.botMaster !== "" ? server.members.get(permData.botMaster).user.username : '-'), true);
            embed.addField("Host OS", formatType(os.type()));
            embed.addField("Uptime", time(bot.uptime));
            channel.send({embed}).catch(console.error);
        }
    },
    
    alias: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <command> <alias>`: makes `alias` a personal alias for `command`.";
        },
        
        command: function (message, server, command, channel) {
            var cmd = command[1];
            
            if (!cmd) {
                channel.send(message.author + ", please specify a command to create an alias for.").catch(console.error);
                return;
            }
            
            if (!isCommand(cmd)) {
                channel.send(message.author + ", that command does not exist.").catch(console.error);
                return;
            }
            
            var alias = command[2];
            
            if (!alias) {
                channel.send(message.author + ", please specify an alias.").catch(console.error);
                return;
            }
            
            if (isCommand(alias)) {
                channel.send(message.author + ", you cannot use an alias that is equal to a command name.").catch(console.error);
                return;
            }
            
            var id = message.author.id;
            
            aliasesList = serverData[server.id].aliasesList;
            
            if (!aliasesList[id]) {
                aliasesList[id] = {};
            }
            
            aliasesList[id][alias.toLowerCase()] = cmd.toLowerCase();
            save("aliasesList", server);
            channel.send("Alias created.").catch(console.error);
        }
    },
    
    removealias: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <alias>`: removes `alias` from your aliases.";
        },
        
        command: function (message, server, command, channel) {
            var alias = command[1];
            
            if (!alias) {
                channel.send(message.author + ", please specify an alias.");
                return;
            }
            
            var id = message.author.id;
            
            aliasesList = serverData[server.id].aliasesList;
            
            if (!aliasesList[id]) {
                channel.send(message.author + ", you do not have any aliases.");
                return;
            }
            
            alias = alias.toLowerCase();
            
            if (!aliasesList[id][alias]) {
                channel.send(message.author + ", that alias either is not yours or does not exist at all.");
                return;
            }
            
            delete aliasesList[id][alias];
            save("aliasesList", server);
            channel.send("Alias deleted.").catch(console.error);
        }
    },
    
    aliases: {
        help: function (command, symbol) {
            return "`" + symbol + command + ": sends you a DM with your list of aliases.";
        },
        
        command: function (message, server, command, channel) {
            var aliases = serverData[server.id].aliasesList[message.author.id], symbol = message.content.charAt(0), list = "", alias;
            
            for (alias in aliases) {
                list += symbol + alias + " -> " + symbol + aliases[alias] + "\n";
            }
            
            if (list === "") {
                channel.send(message.author + ", you do not have any aliases.").catch(console.error);
                return;
            }
            
            message.author.createDM().then(DMchannel => {
                DMchannel.send("Your aliases on " + server.name + ":\n```" + list + "```").then(msg => channel.send("Sent an alias DM to " + message.author.username + ".").catch(console.error)).catch(console.error);
            }).catch(console.error);
        }
    },
    
    whois: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <user>`: posts information about `user`.";
        },
        
        command: function (message, server, command, channel) {
            var user = command[1];
            
            if (!user) {
                channel.send(message.author + ", please specify a user.");
                return;
            }
            
            var members = server.members, roleArray = [], maxPosition = -1, i, j, userObject, roles, color, embed;
            
            for (i = 0; i < members.size; i++) {
                if (members.array()[i].user.username.toLowerCase() == user.toLowerCase()) {
                    userObject = members.array()[i];
                    roles = userObject.roles.array();
                    
                    for (j = 0; j < roles.length; j++) {
                        if (roles[j].name != "@everyone") {
                            roleArray.push(roles[j].name);
                            
                            if (roles[j].position > maxPosition) {
                                color = roles[j].color;
                                maxPosition = roles[j].position;
                            }
                        }
                    }
                    
                    embed = new Discord.RichEmbed();
                    embed.setColor(color);
                    embed.setThumbnail(userObject.user.avatarURL);
                    embed.addField("Username", userObject.user.username, true);
                    
                    if (userObject.nickname) {
                        embed.addField("Nickname", userObject.nickname, true);
                    }
                    
                    embed.addField("Roles", (roleArray.length === 0 ? '-' : "`" + roleArray.join("`, `") + "`"));
                    embed.addField("Joined Discord", "`" + new Date(userObject.user.createdAt).UTC() + "`", true);
                    embed.addField("Joined This Server", "`" + new Date(userObject.joinedAt).UTC() + "`", true);
                    embed.addField("Avatar Source", "[Link](" + userObject.user.avatarURL + ")");
                    channel.send({embed}).catch(console.error);
                    return;
                }
            }
            
            channel.send(message.author + ", there is no such user on this server.").catch(console.error);
        }
    },
    
    serverinfo: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: posts information about the server.";
        },
        
        command: function (message, server, command, channel) {
            var flag = ":flag_" + (regionFlag(server.region)) + ": ", createdDate = "`" + server.createdAt.UTC() + "`", embed;
            
            embed = new Discord.RichEmbed();
            embed.setThumbnail(server.iconURL);
            embed.addField("Name", server.name, true);
            embed.addField("Owner", server.owner.user.username, true);
            embed.addField("Region", flag + formatRegion(server.region));
            embed.addField("Created At", createdDate);
            embed.addField("Members", sep(server.memberCount), true);
            embed.addField("Channels", sep(server.channels.size), true);
            embed.addField("Roles", sep(server.roles.size), true);
            embed.addField("Icon Source", "[Link](" + server.iconURL + ")", true);
            channel.send({embed}).catch(console.error);
        }
    },
    
    emojis: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: posts the current server emojis.";
        },
        
        command: function (message, server, command, channel) {
            if (server.emojis.size === 0) {
                channel.send("There are no server emojis!").catch(console.error);
                return;
            }
            
            channel.send("Server emojis: " + server.emojis.array().join(' ') + "\nThere are currently **" + server.emojis.size + "** emojis total.").catch(console.error);
        }
    },
    
    lewd: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: to grant yourself access to the lewd channel.";
        },
        
        command: function (message, server, command, channel) {
            var servers = permData.servers;
            
            if (!servers[server.id].lewdAccessRole) {
                channel.send(message.author + ", this server does not have a lewd access role.");
                return;
            }
            
            var lewdAccess = server.roles.get(servers[server.id].lewdAccessRole), user = server.members.get(message.author.id);
            
            if (user.roles.get(servers[server.id].lewdAccessRole)) {
                channel.send(message.author + ", you already have lewd access!");
                return;
            }
            
            user.addRole(lewdAccess);
            channel.send(message.author + " has been granted lewd access!").catch(console.error);
        }
    },
    
    unlewd: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: to remove yourself from the lewd channel.";
        },
        
        command: function (message, server, command, channel) {
            var servers = permData.servers;
            
            if (!servers[server.id].lewdAccessRole) {
                channel.send(message.author + ", this server does not have a lewd access role.");
                return;
            }
            
            var lewdAccess = server.roles.get(servers[server.id].lewdAccessRole), user = server.members.get(message.author.id);
            
            if (!user.roles.get(servers[server.id].lewdAccessRole)) {
                channel.send(message.author + ", you do not have lewd access!");
                return;
            }
            
            user.removeRole(lewdAccess);
            channel.send(message.author + " has been removed from the lewd channel!").catch(console.error);
        }
    },
    
    fire: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes you join the Fire faction of Kuruminism.";
        },
        
        command: function (message, server, command, channel) {
            var servers = permData.servers;
            
            if (Object.keys(servers[server.id].factions).length < 4) {
                channel.send(message.author + ", this command cannot be used on this server.");
                return;
            }
            
            var factions = servers[server.id].factions;
            
            var fire = server.roles.get(factions.fire), otherFactions = [factions.water, factions.earth, factions.wind];
            
            var user = server.members.get(message.author.id);
            
            if (user.roles.has(factions.fire)) {
                channel.send(message.author + ", you are already in the Fire faction of Kuruminism!");
                return;
            }
            
            if (user.roles.has(factions.water) || user.roles.has(factions.earth) || user.roles.has(factions.wind)) {
                user.removeRoles(otherFactions).then(member => {
                    member.addRole(fire).catch(console.error);
                    channel.send(member + " is now a " + fire + "!");
                    return;
                }).catch(console.error);
            }
            
            user.addRole(fire).catch(console.error);
            channel.send(user + " is now a " + fire + "!").catch(console.error);
        }
    },
    
    water: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes you join the Water faction of Kuruminism.";
        },
        
        command: function (message, server, command, channel) {
            var servers = permData.servers;
            
            if (Object.keys(servers[server.id].factions).length < 4) {
                channel.send(message.author + ", this command cannot be used on this server.");
                return;
            }
            
            var factions = servers[server.id].factions;
            
            var water = server.roles.get(factions.water), otherFactions = [factions.fire, factions.earth, factions.wind];
            
            var user = server.members.get(message.author.id);
            
            if (user.roles.has(factions.water)) {
                channel.send(message.author + ", you are already in the Water faction of Kuruminism!");
                return;
            }
            
            if (user.roles.has(factions.fire) || user.roles.has(factions.earth) || user.roles.has(factions.wind)) {
                user.removeRoles(otherFactions).then(member => {
                    member.addRole(water).catch(console.error);
                    channel.send(member + " is now a " + water + "!");
                    return;
                }).catch(console.error);
            }
            
            user.addRole(water).catch(console.error);
            channel.send(user + " is now a " + water + "!").catch(console.error);
        }
    },
    
    earth: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes you join the Earth faction of Kuruminism.";
        },
        
        command: function (message, server, command, channel) {
            var servers = permData.servers;
            
            if (Object.keys(servers[server.id].factions).length < 4) {
                channel.send(message.author + ", this command cannot be used on this server.");
                return;
            }
            
            var factions = servers[server.id].factions;
            
            var earth = server.roles.get(factions.earth), otherFactions = [factions.fire, factions.water, factions.wind];
            
            var user = server.members.get(message.author.id);
            
            if (user.roles.has(factions.earth)) {
                channel.send(message.author + ", you are already in the Earth faction of Kuruminism!");
                return;
            }
            
            if (user.roles.has(factions.fire) || user.roles.has(factions.water) || user.roles.has(factions.wind)) {
                user.removeRoles(otherFactions).then(member => {
                    member.addRole(earth).catch(console.error);
                    channel.send(member + " is now a " + earth + "!");
                    return;
                }).catch(console.error);
            }
            
            user.addRole(earth).catch(console.error);
            channel.send(user + " is now a " + earth + "!").catch(console.error);
        }
    },
    
    wind: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes you join the Wind faction of Kuruminism.";
        },
        
        command: function (message, server, command, channel) {
            var servers = permData.servers;
            
            if (Object.keys(servers[server.id].factions).length < 4) {
                channel.send(message.author + ", this command cannot be used on this server.");
                return;
            }
            
            var factions = servers[server.id].factions;
            
            var wind = server.roles.get(factions.wind), otherFactions = [factions.fire, factions.water, factions.earth];
            
            var user = server.members.get(message.author.id);
            
            if (user.roles.has(factions.wind)) {
                channel.send(message.author + ", you are already in the Wind faction of Kuruminism!");
                return;
            }
            
            if (user.roles.has(factions.fire) || user.roles.has(factions.water) || user.roles.has(factions.earth)) {
                user.removeRoles(otherFactions).then(member => {
                    member.addRole(wind).catch(console.error);
                    channel.send(member + " is now a " + wind + "!");
                    return;
                }).catch(console.error);
            }
            
            user.addRole(wind).catch(console.error);
            channel.send(user + " is now a " + wind + "!").catch(console.error);
        }
    },
    
    factions: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: shows the member counts for the factions of Kuruminism.";
        },
        
        command: function (message, server, command, channel) {
            var servers = permData.servers;
            
            if (Object.keys(servers[server.id].factions).length < 4) {
                channel.send(message.author + ", this command cannot be used on this server.");
                return;
            }
            
            var factions = servers[server.id].factions;
            
            var fire = server.roles.get(factions.fire), water = server.roles.get(factions.water), earth = server.roles.get(factions.earth), wind = server.roles.get(factions.wind);
            
            var fireMembers = fire.members.size, waterMembers = water.members.size, earthMembers = earth.members.size, windMembers = wind.members.size, factionMembers, biggest;
            
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
            
            channel.send("Member counts for the Kuruminist factions:\n" + fire + ": " + fireMembers + "\n" + water +
            ": " + waterMembers + "\n" + earth + ": " + earthMembers + "\n" + wind + ": " + windMembers).catch(console.error);
        }
    },
    
    rolecount: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <role>`: shows the member count for `role`.";
        },
        
        command: function (message, server, command, channel) {
            var role = command[1];
            
            if (!role) {
                channel.send(message.author + ", please specify a role to check the member count of.").catch(console.error);
                return;
            }
            
            role = role.toLowerCase();
            
            var roles = server.roles.array(), roleNames = {}, i;
            
            for (i in roles) {
                roleNames[roles[i].name.toLowerCase()] = roles[i].name;
            }
            
            if (!roleNames.hasOwnProperty(role)) {
                channel.send(message.author + ", please specify a valid role to check the member count of.").catch(console.error);
                return;
            }
            
            role = server.roles.find("name", roleNames[role]);
            channel.send("Member count for " + (role.mentionable ? role.name : role) + ": " + sep(role.members.size)).catch(console.error);
        }
    },
    
    lnn: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <game> [shottype/route]`: shows the list of LNN players for `game` with `shottype/route`. " +
            "If `shottype/route` is not specified, shows the list of all LNN players for `game`.";
        },
        
        command: function (message, server, command, channel) {
            var game = command[1], acronym = "LNN", LNNs = permData.LNNs;
            
            if (!game) {
                channel.send(message.author + ", please specify a game to check LNNs of.").catch(console.error);
                return;
            }
            
            game = gameName(game.toLowerCase());
            
            if (!LNNs.hasOwnProperty(game)) {
                channel.send(message.author + ", please specify a valid game to check LNNs of.").catch(console.error);
                return;
            }
            
            if (game == "UFO") {
                acronym = "LNN(N)";
            } else if (game == "IN") {
                acronym = "LNNFS";
            } else if (game == "PCB" || game == "TD" || game == "HSiFS") {
                acronym = "LNNN";
            }
            
            var shot = command[2], list = "", total = 0, shottype, count;
             
            if (shot) {
                shot = (shotName(cap(shot)) ? shotName(cap(shot)) : cap(shot));
                
                if (shot.contains("team")) {
                    shot = shot.replace(/team/i, "Team").replace(/ /gi, "");
                }
                
                if (!LNNs[game][shot]) {
                    channel.send(message.author + ", " + shot.replace("Team", " Team") + " is not a valid shottype or route.").catch(console.error);
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
                    list += shottype.replace("Team", " Team").replace("Final", " Final") + ": " + LNNs[game][shottype].sort().join(", ") + "\n";
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
        help: function (command, symbol) {
            return "`" + symbol + command + " <game> [difficulty] [shottype/route]`: shows the world record in `game` `difficulty` `shottype/route`.\n" +
            "If `difficulty` or `shottype/route` are not specified, selects the overall world record of the game or difficulty.";
        },
        
        command: function (message, server, command, channel) {
            var game = command[1];
            
            if (!game) {
                channel.send(message.author + ", please specify a game to check a world record of.").catch(console.error);
                return;
            }
            
            game = gameName(game.toLowerCase());
            
            if (!permData.WRs.hasOwnProperty(game)) {
                channel.send(message.author + ", please specify a valid game to check a world record of.").catch(console.error);
                return;
            }
            
            var difficulty = command[2];
            
            if (!difficulty) {
                game == "SoEW" || game == "MS" ? difficulty = "Extra" : difficulty = "Lunatic";
            } else {
                difficulty = cap(difficulty.toLowerCase());
            }
            
            if (!permData.WRs[game][difficulty]) {
                channel.send(message.author + ", please specify a valid difficulty to check a world record of.").catch(console.error);
                return;
            }
            
            var shot = command[3], difficultyWRs = permData.WRs[game][difficulty];
             
            if (shot) {
                shot = (shotName(cap(shot)) ? shotName(cap(shot)) : cap(shot));
                
                if (shot.contains("team")) {
                    shot = shot.replace(/team/i, "Team").replace(/ /gi, "");
                }
                
                if (!permData.WRs[game][difficulty][shot]) {
                    channel.send(message.author + ", " + shot.replace("Team", " Team") + " is not a valid shottype or route.").catch(console.error);
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
            
            var wrArray = difficultyWRs[shot], wr = sep(wrArray[0]), player = wrArray[1], replay = wrArray[2];
            
            if (wr === "0") {
                channel.send("There is no known world record for that category!").catch(console.error);
                return;
            }
            
            channel.send("The world record for " + game + " " + difficulty + " " + shot.replace("Team", " Team") +
            " is " + wr + " by " + player + "." + (shot == overall ? " (overall WR)" : "")).catch(console.error);
        }
    },
    
    wrlist: {
         help: function (command, symbol) {
            return "`" + symbol + command + " <game> <difficulty> [order]`: shows the list of world records in `game` `difficulty`, sorted by `order`, which is 'shot(type)' or 'score'.\n" +
            "If `order` is not specified, orders the world records by shottype.";
        },
        
        command: function (message, server, command, channel) {
            var game = command[1];
            
            if (!game) {
                channel.send(message.author + ", please specify a game to check the world records of.").catch(console.error);
                return;
            }
            
            game = gameName(game.toLowerCase());
            
            if (!permData.WRs[game]) {
                channel.send(message.author + ", please specify a valid game to check the world records of.").catch(console.error);
                return;
            }
            
            var difficulty = command[2];
            
            if (!difficulty) {
                channel.send(message.author + ", please specify a difficulty to check the world records of.").catch(console.error);
                return
            }
            
            difficulty = cap(difficulty.toLowerCase());
            
            if (!permData.WRs[game][difficulty]) {
                channel.send(message.author + ", please specify a valid difficulty to check the world records of.").catch(console.error);
                return;
            }
            
            if (game == "GFW" && difficulty == "Extra") {
                channel.send(message.author + " >implying GFW Extra has a list of records").catch(console.error);
                return;
            }
            
            var order = command[3];
            
            if (!order) {
                order = "shottype";
            } else {
                order = order.toLowerCase().replace("type", "").replace("shots", "shot").replace("scores", "score");
                
                if (order != "shot" && order != "score") {
                    channel.send(message.author + ", please specify a valid order to sort the world records with.").catch(console.error);
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
                            list += count + ". " + shot + ": " + sep(difficultyWRs[shot][0]) + " by " + difficultyWRs[shot][1] + "\n";
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
                    
                    list += shot + ": " + (shot == overall ? "**" + sep(difficultyWRs[shot][0]) + "**" : sep(difficultyWRs[shot][0])) + " by " + difficultyWRs[shot][1] + "\n";
                }
            }
            
            
            if (list === "") {
                channel.send("There are no known world records for that difficulty!").catch(console.error);
                return;
            }
            
            channel.send("List of " + game + " " + difficulty + " records (ordered by " + order + "):\n```Markdown\n" + list + "```").catch(console.error);
        }
    },
    
    notifywr: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <game> <difficulty> <shottype/route> <new WR> <player> [replay]`: adds `new WR` by `player` in `game` `difficulty` `shottype/route` to a queue, waiting to be accepted by a mod.";
        },
        
        command: function (message, server, command, channel) {
            var game = command[1];
            
            if (!game) {
                channel.send(message.author + ", please specify a game to update a world record of.").catch(console.error);
                return;
            }
            
            game = gameName(game.toLowerCase());
            
            if (!permData.WRs[game]) {
                channel.send(message.author + ", please specify a valid game to update a world record of.").catch(console.error);
                return;
            }
            
            var difficulty = command[2];
            
            if (!difficulty) {
                channel.send(message.author + ", please specify a difficulty to update a world record of.").catch(console.error);
                return;
            }
            
            difficulty = cap(difficulty.toLowerCase());
            
            if (!permData.WRs[game][difficulty]) {
                channel.send(message.author + ", please specify a valid difficulty to update a world record of.").catch(console.error);
                return;
            }
            
            var shot = command[3], difficultyWRs = permData.WRs[game][difficulty];
            
            if (!shot) {
                channel.send(message.author + ", please specify a shottype or route to update the world record of.").catch(console.error);
                return;
            }
             
            if (shot) {
                shot = (shotName(cap(shot)) ? shotName(cap(shot)) : cap(shot));
                
                if (shot.contains("team")) {
                    shot = shot.replace(/team/i, "Team").replace(/ /gi, "");
                }
                
                if (!permData.WRs[game][difficulty][shot]) {
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
            
            var player = command[5];
            
            if (!player) {
                channel.send(message.author + ", please specify the player that got the new world record.").catch(console.error);
                return;
            }
            
            var replay = (command[6] ? command[6] : ""), WRarray;
            
            WRarray = [newWR, player, replay, game, difficulty, shot];
            permData.notifyQueue.push(WRarray);
            save("notifyQueue");
            channel.send("New WR added to the queue, waiting to be accepted by a mod.").catch(console.error);
        }
    },
    
    wrupdated: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you when the world records were last updated.";
        },
        
        command: function (message, server, command, channel) {
            channel.send("The world records were last updated at " + permData.WRsLastUpdated + ".").catch(console.error);
        }
    },
    
    meters: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <feet>' <inches>''`: converts `feet` and `inches` to meters.";
        },
        
        command: function (message, server, command, channel) {
            var feetAndInches = command[1];
            
            var symbol = message.content.charAt(0);
            
            if (!feetAndInches) {
                channel.send(message.author + ", use `" + symbol + "help meters` to learn how to use this command.").catch(console.error);
                return;
            }
            
            var notation = /(\d+)'\s*(\d+)''/; // e.g. 6' 4'' or 6'4''
            
            if (!notation.test(feetAndInches)) {
                channel.send(message.author + ", use `" + symbol + "help meters` to learn how to use this command.").catch(console.error);
                return;
            }
            
            var feetAndInchesToMeters = function (feetAndInches) {
                // Feet and inches must be in the format 6' 4'' or 6'4''
                var tmp = (feetAndInches.indexOf(' ') != -1 ? feetAndInches.split("' ") : feetAndInches.split("'"));
                
                var feet = parseInt(tmp[0]), inches = parseInt(tmp[1].replace("''", ""));
                
                var meters = ((feet + inches / 12) / 3.2808399).toPrecision(3);
                
                return meters;
            };
            
            var meters = feetAndInchesToMeters(feetAndInches);
            
            channel.send(message.author + ", " + feetAndInches + " is equal to " + meters + " meters in the metric system.").catch(console.error);
        }
    },
    
    feet: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <meters>`: converts `meters` to feet and inches.";
        },
        
        command: function (message, server, command, channel) {
            var meters = command[1];
            
            if (!meters) {
                channel.send(message.author + ", please specify a number of meters to convert.").catch(console.error);
                return;
            }
            
            if (isNaN(meters)) {
                channel.send(message.author + ", please specify a number of meters to convert.").catch(console.error);
                return;
            }
            
            metersToFeetAndInches = function (meters) {
                var feet = meters * 3.2808399;
                
                var inches = Math.round((feet - Math.floor(feet)) * 12);
                
                var feetAndInches = Math.floor(feet) + "' " + inches + "''";
                
                return feetAndInches;
            };
            
            var feetAndInches = metersToFeetAndInches(meters);
            
            channel.send(message.author + ", " + meters + " meters is equal to " + feetAndInches + " in the imperial system.").catch(console.error);
        }
    },
    
    km: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <miles>: converts `miles` to kilometers.";
        },
        
        command: function (message, server, command, channel) {
            var miles = command[1];
            
            if (!miles) {
                channel.send(message.author + ", please specify a number of miles to convert.").catch(console.error);
                return;
            }
            
            if (isNaN(miles)) {
                channel.send(message.author + ", please specify a number of miles to convert.").catch(console.error);
                return;
            }
            
            var km = Math.round(miles * 1.609344);
            
            channel.send(message.author + ", " + miles + " miles are equal to " + km + " kilometers.").catch(console.error);
        }
    },
    
    miles: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <kilometers>: converts `kilometers` to miles.";
        },
        
        command: function (message, server, command, channel) {
            var km = command[1];
            
            if (!km) {
                channel.send(message.author + ", please specify a number of kilometers to convert.").catch(console.error);
                return;
            }
            
            if (isNaN(km)) {
                channel.send(message.author + ", please specify a number of kilometers to convert.").catch(console.error);
                return;
            }
            
            var miles = Math.round(km / 1.609344);
            
            channel.send(message.author + ", " + km + " kilometers are equal to " + miles + " miles.").catch(console.error);
        }
    },
    
    localtime: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: gives my local time.";
        },
        
        command: function (message, server, command, channel) {
            var date = new Date();
            
            channel.send("My current local time is " + new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).local() + ".").catch(console.error);
        }
    },
    
    time: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <UTC offset>`: gives the local time at `UTC offset`.";
        },
        
        command: function (message, server, command, channel) {
            var timezone = command[1], date = new Date(), offset, msUTC, msTimezone, localTime;
            
            if (!timezone) {
                channel.send(message.author + ", please specify a UTC offset.").catch(console.error);
                return;
            }
            
            offset = Number(timezone.replace("UTC", "").replace("GMT", "").replace(':', '.'));
            
            if (isNaN(offset)) {
                channel.send(message.author + ", please specify a UTC offset.").catch(console.error);
                return;
            }
            
            if (offset < -12 || offset > 14) {
                channel.send(message.author + ", that time zone does not exist.").catch(console.error);
                return;
            }
            
            msUTC = date.getTime() + (date.getTimezoneOffset() * 60000);
            msTimezone = msUTC + (3600000 * offset);
            localTime = new Date(msTimezone - (date.getTimezoneOffset() * 60000)).local();
            channel.send("The local time in " + timezone + " is " + localTime + ".").catch(console.error);
        }
    },
    
    weather: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <place>`: looks up current weather in `place`. Undefined behaviour can occur if the place does not exist.";
        },
        
        command: function (message, server, command, channel) {
            if (permData.weatherKey === "") {
                channel.send("This command is currently disabled. Use `!setweatherapi <API key>` to enable it.").catch(console.error);
                return;
            }
            
            if (cooldown) {
                channel.send("Please do not flood the channel!").catch(console.error);
                return;
            }
            
            var place = command[1];
            
            if (!place) {
                channel.send(message.author + ", please specify a place to look up.").catch(console.error);
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
                embed = new Discord.RichEmbed();
                embed.addField("Location", ":flag_" + countryCode.toLowerCase() + ": " + "[" + result.name + "](" + mapsUrl(place, countryCode) + ")");
                embed.addField("Weather", weather);
                embed.addField("Temperature", celsius + " °C / " + fahrenheit + " °F", true);
                embed.addField("Humidity", humidity + "%", true);
                embed.addField("Wind Speed", wind + " m/s" + direction, true);
                channel.send({embed}).catch(console.error);
                
                if (channel.type != "dm") {
                    cooldown = true;
                    timers.setInterval(function () { cooldown = false; }, permData.servers[server.id].cooldownSecs * 1000);
                }
            });
        }
    },
    
    c2f: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <degrees Celsius>`: converts `degrees Celsius` to Fahrenheit.";
        },
        
        command: function (message, server, command, channel) {
            var celsius = command[1];
            
            if (!celsius) {
                channel.send(message.author + ", please specify a number of degrees Celsius to convert.").catch(console.error);
                return;
            }
            
            if (isNaN(celsius)) {
                channel.send(message.author + ", please specify a valid number of degrees Celsius to convert.").catch(console.error);
                return;
            }
            
            var fahrenheit = Math.round(celsius * 1.8 + 32);
            
            channel.send(message.author + ", " + celsius + " °C is equal to " + fahrenheit + " °F.").catch(console.error);
        }
    },
    
    c2k: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <degrees Celsius>`: converts `degrees Celsius` to Kelvin.";
        },
        
        command: function (message, server, command, channel) {
            var celsius = command[1];
            
            if (!celsius) {
                channel.send(message.author + ", please specify a number of degrees Celsius to convert.").catch(console.error);
                return;
            }
            
            if (isNaN(celsius)) {
                channel.send(message.author + ", please specify a valid number of degrees Celsius to convert.").catch(console.error);
                return;
            }
            
            var kelvin = Math.round(Number(celsius) + 273.15);
            
            channel.send(message.author + ", " + celsius + " °C is equal to " + kelvin + " °K.").catch(console.error);
        }
    },
    
    f2c: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <degrees Fahrenheit>`: converts `degrees Fahrenheit` to Celsius.";
        },
        
        command: function (message, server, command, channel) {
            var fahrenheit = command[1];
            
            if (!fahrenheit) {
                channel.send(message.author + ", please specify a number of degrees Fahrenheit to convert.").catch(console.error);
                return;
            }
            
            if (isNaN(fahrenheit)) {
                channel.send(message.author + ", please specify a valid number of degrees Fahrenheit to convert.").catch(console.error);
                return;
            }
            
            var celsius = Math.round((fahrenheit - 32) / 1.8);
            
            channel.send(message.author + ", " + fahrenheit + " °F is equal to " + celsius + " °C.").catch(console.error);
        }
    },
    
    f2k: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <degrees Fahrenheit>`: converts `degrees Fahrenheit` to Kelvin.";
        },
        
        command: function (message, server, command, channel) {
            var fahrenheit = command[1];
            
            if (!fahrenheit) {
                channel.send(message.author + ", please specify a number of degrees Fahrenheit to convert.").catch(console.error);
                return;
            }
            
            if (isNaN(fahrenheit)) {
                channel.send(message.author + ", please specify a valid number of degrees Fahrenheit to convert.").catch(console.error);
                return;
            }
            
            var kelvin = Math.round((Number(fahrenheit) + 459.67) / 1.8);
            
            channel.send(message.author + ", " + fahrenheit + " °F is equal to " + kelvin + " °K.").catch(console.error);
        }
    },
    
    k2c: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <degrees Kelvin>`: converts `degrees Kelvin` to Celsius.";
        },
        
        command: function (message, server, command, channel) {
            var kelvin = command[1];
            
            if (!kelvin) {
                channel.send(message.author + ", please specify a number of degrees Kelvin to convert.").catch(console.error);
                return;
            }
            
            if (isNaN(kelvin)) {
                channel.send(message.author + ", please specify a valid number of degrees Kelvin to convert.").catch(console.error);
                return;
            }
            
            var celsius = Math.round(kelvin - 273.15);
            
            channel.send(message.author + ", " + kelvin + " °K is equal to " + celsius + " °C.").catch(console.error);
        }
    },
    
    k2f: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <degrees Kelvin>`: converts `degrees Kelvin` to Fahrenheit.";
        },
        
        command: function (message, server, command, channel) {
            var kelvin = command[1];
            
            if (!kelvin) {
                channel.send(message.author + ", please specify a number of degrees Kelvin to convert.").catch(console.error);
                return;
            }
            
            if (isNaN(kelvin)) {
                channel.send(message.author + ", please specify a valid number of degrees Kelvin to convert.").catch(console.error);
                return;
            }
            
            var fahrenheit = Math.round(kelvin * 1.8 - 459.67);
            
            channel.send(message.author + ", " + kelvin + " °K is equal to " + fahrenheit + " °F.").catch(console.error);
        }
    },
    
    convert: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <amount> <currency 1> <currency 2>`: converts `amount` `currency 1` into `currency 2`.";
        },
        
        command: function (message, server, command, channel) {
            var value = command[1];
            
            if (!value) {
                channel.send(message.author + ", please specify an amount of a currency to convert.").catch(console.error);
                return;
            }
            
            if (isNaN(value)) {
                channel.send(message.author + ", please specify a valid amount of a currency to convert.").catch(console.error);
                return;
            }
            
            var currency1 = command[2];
            
            if (!currency1) {
                channel.send(message.author + ", please specify the currency to be converted into another.").catch(console.error);
                return;
            }
            
            var currency2 = command[3];
            
            if (!currency2) {
                channel.send(message.author + ", please specify the currency for the former to be converted into.").catch(console.error);
                return;
            }
            
            if (currencyUpdate) {
                generateCurrencies();
            }
            
            currencyUpdate = false;
            timers.setInterval(function () { currencyUpdate = true; }, 1800000);
            currency1 = currency1.toUpperCase();
            currency2 = currency2.toUpperCase();
            
            var currencies = permData.currencies;
            
            if (!currencies.hasOwnProperty(currency1)) {
                channel.send(message.author + ", please specify a valid currency to be converted into another.").catch(console.error);
                return;
            }
            
            if (!currencies.hasOwnProperty(currency2)) {
                channel.send(message.author + ", please specify a valid currency for the former to be converted into.").catch(console.error);
                return;
            }
            
            request(currencyUrl(currency1, currency2), function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var result = JSON.parse(body)[currency1 + "_" + currency2];
                    
                    channel.send(message.author + ", " + currencies[currency1].currencySymbol + value +
                    " is equal to " + currencies[currency2].currencySymbol + sep(result * value) + ".").catch(console.error);
                }
            });
        }
    }
};