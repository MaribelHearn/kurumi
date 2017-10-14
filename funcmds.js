module.exports = {
    opinion: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes me give my honest opinion about you.";
        },
        
        command: function (message, server, command, channel) {
            var id = message.author.id, username = message.author.username, badOpinions = serverData[server.id].badOpinions, goodOpinions = serverData[server.id].goodOpinions;
            
            var opinionCount = badOpinions.length + goodOpinions.length, rng = RNG(opinionCount), opinion;
            
            opinion = (rng >= badOpinions.length || id == bot.user.id ? message.author + " " + goodOpinions.rand().replace(/%u/gi, username) : message.author + " " + badOpinions.rand().replace(/%u/gi, username));
            
            if (opinion.contains("but still cool!") && serverData[server.id].opinionExceptions.contains(id)) {
                opinion = message.author + " " + "I love you and only you!";
            }
            
            channel.send(opinion.replace(/%t/gi, TOUHOU_SHMUPS.rand()));
        }
    },
    
    "8ball": {
        help: function (command, symbol) {
            return "`" + symbol + command + " <question>`: the wise 8ball will give an answer to `question`.";
        },
        
        command: function (message, server, command, channel) {
            var question = command[1];
            
            if (!question) {
                channel.send(message.author + ", please specify a question.");
                return;
            }
            
            channel.send(ANSWERS.rand());
        }
    },
    
    choice: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <option 1>^<option 2>^[option 3]^...`: makes me choose out of the specified options for you. At least two options must be specified.";
        },
        
        command: function (message, server, command, channel) {
            if (!command[1]) {
                channel.send(message.author + ", please specify options.");
                return;
            }
            
            if (!command[2]) {
                channel.send(message.author + ", please specify at least a second option.");
                return;
            }
            
            command.splice(0, 1);
            channel.send(CHOICE.rand().replace("%o", command.rand()));
        }
    },
    
    roll: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [filter]`: roll a random Touhou category. `filter` can be Windows, PC-98 or one of the five difficulties.";
        },
        
        command: function (message, server, command, channel) {
            if (cooldown) {
                channel.send("Please do not flood the channel!");
                return;
            }
            
            var WRs = permData.WRs;
            
            var argument = (command[1] ? command[1] : ""), min = 0, max = Object.keys(WRs).length, game, category, shot, message;
            
            if (argument.toLowerCase() == "windows") {
                min = 5;
            }
            
            if (argument.toLowerCase().replace(/-/g, "") == "pc98") {
                max = 5;
            }
            
            argument = cap(argument.toLowerCase());
            
            if (CATEGORIES.contains(argument)) {
                category = argument;
            }
            
            if (category == "Extra") {
                min += 1;
            }
            
            game = Object.keys(WRs)[rangedRNG(min, max)];
            
            while (category == "Extra" && game == 2) {
                game = Object.keys(WRs)[rangedRNG(min, max)];
            }
            
            if (category != argument) {
                category = Object.keys(WRs[game])[rangedRNG(0, Object.keys(WRs[game]).length)];
            }
            
            shot = Object.keys(WRs[game][category])[rangedRNG(1, Object.keys(WRs[game][category]).length)];
            
            if (shot && shot.contains("Team")) {
                shot = shot.replace("Team", " Team");
            }
            
            message = message.author + " You must play... **" + game + " " + category + "**" + (shot.length <= 2 || shot == "Makai" || shot == "Jigoku" ? " " : " with ");
            message += (shot == '-' ? "" : "**" + shot) + (game == "HSiFS" ? ["Spring", "Summer", "Autumn", "Winter"].rand() + "**" : "**") + "!";
            channel.send(message, {"file": "./" + "games/" + game + ".jpg"});
                
            if (!permData.servers[server.id].isTestingServer) {
                cooldown = true;
                timers.setInterval(function () { cooldown = false; }, servers[server.id].cooldownSecs * 1000);
            }
        }
    },
    
    google: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <query>`: posts the Google suggestions for `query`.";
        },
        
        command: function (message, server, command, channel) {
            var originalQuery = command[1];
            
            if (!originalQuery) {
                channel.send(message.author + ", please specify a search query.");
                return;
            }
            
            query = originalQuery.replace(/ /g, '+');
            
            request(GOOGLE_SUGGESTS_BASE_URL + query, function (error, response, body) {
                var statusCode = response.statusCode;
                
                if (!error && statusCode == 200) {
                    var suggestions = JSON.parse(body)[1].join('\n');
                    
                    if (suggestions === "") {
                        channel.send("No Google suggestions for that query.");
                    } else {
                        channel.send(":regional_indicator_g: `Google` Suggestions for '" + originalQuery + "': ```" + suggestions + "```");
                    }
                } else {
                    channel.send("Error " + statusCode + " " + camel(response.statusMessage) + ".");
                }
            });
        }
    },
    
    waifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you who is your waifu today.";
        },
        
        command: function (message, server, command, channel) {
            var date = servers[server.id].date, exceptions = serverData[server.id].waifusExceptions, id = message.author.id, waifu;
            
            dateCheck(server);
            
            if (date != servers[server.id].date) {
                allCommands.mod.reset.command(message, server, command, channel);
            }
            
            var waifus = serverData[server.id].waifus;
            
            if (!waifus[id]) {
                waifu = (exceptions[id] ? exceptions[id] : server.members.random().user.username);
                waifus[id] = waifu;
                save("waifus", server);
            } else {
                waifu = waifus[id];
            }
            
            channel.send(message.author + " Your waifu today is **" + waifu + "**!");
        }
    },
    
    touhouwaifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you who is your Touhou waifu today.";
        },
        
        command: function (message, server, command, channel) {
            var date = servers[server.id].date, exceptions = serverData[server.id].touhouWaifusExceptions, id = message.author.id, touhouWaifu;
            
            dateCheck(server);
            
            if (date != servers[server.id].date) {
                allCommands.mod.reset.command(message, server, command, channel);
            }
            
            var touhouWaifus = serverData[server.id].touhouWaifus;
            
            if (!touhouWaifus[id]) {
                touhouWaifu = (exceptions[id] ? exceptions[id] : TOUHOU_CHARS.rand());
                
                touhouWaifus[id] = touhouWaifu;
                save("touhouWaifus", server);
            } else {
                touhouWaifu = touhouWaifus[id];
            }
            
            channel.send(message.author + " Your Touhou waifu today is **" + touhouWaifu + "**!");
        }
    },
    
    fanwaifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you who is your fanmeme waifu today.";
        },
        
        command: function (message, server, command, channel) {
            var date = servers[server.id].date, id = message.author.id, fanmemeWaifu;
            
            dateCheck(server);
            
            if (date != servers[server.id].date) {
                allCommands.mod.reset.command(message, server, command, channel);
            }
            
            var fanmemeWaifus = serverData[server.id].fanmemeWaifus;
            
            if (!fanmemeWaifus[id]) {
                fanmemeWaifu = FANMEME_CHARS.rand();
                
                fanmemeWaifus[id] = fanmemeWaifu;
                save("fanmemeWaifus", server);
            } else {
                fanmemeWaifu = fanmemeWaifus[id];
            }
            
            channel.send(message.author + " Your fanmeme waifu today is **" + fanmemeWaifu + "**!");
        }
    },
    
    lenenwaifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you who is your Len'en waifu today.";
        },
        
        command: function (message, server, command, channel) {
            var date = servers[server.id].date, id = message.author.id, lenenwaifu;
            
            dateCheck(server);
            
            if (date != servers[server.id].date) {
                allCommands.mod.reset.command(message, server, command, channel);
            }
            
            var lenenWaifus = serverData[server.id].lenenWaifus;
            
            if (!lenenWaifus[id]) {
                lenenwaifu = LENEN_CHARS.rand();
                
                lenenWaifus[id] = lenenwaifu;
                save("lenenWaifus", server);
            } else {
                lenenwaifu = lenenWaifus[id];
            }
            
            channel.send(message.author + " Your Len'en waifu today is **" + lenenwaifu + "**!");
        }
    },
    
    ratewaifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <waifu>`: gives `waifu` a randomly generated rating.";
        },
        
        command: function (message, server, command, channel) {
            var waifu = command[1], date = servers[server.id].date, ratings = serverData[server.id].ratings;
            
            dateCheck(server);
            
            if (date != servers[server.id].date) {
                allCommands.mod.reset.command(message, server, command, channel);
            }
            
            if (!waifu) {
                channel.send(">not having a waifu");
                channel.send("0/10");
                return;
            }
            
            if (waifu.toLowerCase() == "kurumi") {
                channel.send(":100: I rate that waifu **10/10**, of course!");
                return;
            }
            
            if (waifu == "The Challenge") {
                channel.send(server.emojis.find("name", "HaveYouActuallyPlayedIt") + " I rate that waifu **Infinity/10**.");
                return;
            }
            
            if (waifu == "ur waifu") {
                channel.send("ur waifu a shit");
                return;
            }
            
            var rating = RNG(11), emote;
            
            waifu = waifu.toLowerCase();
            
            if (!ratings[waifu]) {
                ratings[waifu] = rating;
                save("ratings", server);
            } else {
                rating = ratings[waifu];
            }
            
            if (rating == 10) {
                emote = "100";
            } else {
                emote = "thumb" + (rating >= 6 ? "up" : "down");
            }
            
            channel.send(":" + emote + ": I rate that waifu **" + rating + "/10**.");
        }
    },
    
    quote: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <user>`: selects a random quote out of the saved quotes from `user`.";
        },
        
        command: function (message, server, command, channel) {
            var user = command[1], quotes = serverData[server.id].quotes, members = idsToUsers(quotes, server), id;
            
            console.log(Object.keys(members));
            
            if (quotes.isEmpty()) {
                channel.send(message.author + ", there are no saved quotes.");
                return;
            }
            
            if (!user) {
                id = Object.keys(quotes).rand();
                
                if (!isNumber(id)) {
                    name = id;
                } else {
                    for (var member in members) {
                        if (members[member].id == id) {
                            name = members[member].name;
                        }
                    }
                }
            } else {
                user = user.toLowerCase();
            
                if (!Object.keys(members).contains(user) && !Object.keys(quotes).contains(user)) {
                    channel.send(message.author + ", either there is no such user, or that user does not have any saved quotes.");
                    return;
                }
                
                if (members[user]) {
                    id = members[user].id;
                    name = members[user].name;
                } else {
                    
                }
            }
            
            if (members[user] && !quotes[id] || !members[user] && !quotes[name]) {
                channel.send(message.author + ", that user does not have any saved quotes.");
                return;
            }
            
            channel.send("```" + quotes[members[user] ? id : name].rand() + "```\n- " + name);
        }
    },
    
    quotecount: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <user>`: tells you how many times `user` has been quoted.";
        },
        
        command: function (message, server, command, channel) {
            var user = command[1], quotes = serverData[server.id].quotes, members = idsToUsers(quotes, server), id;
            
            if (!user) {
                channel.send(message.author + ", please specify a username.");
                return;
            }
            
            user = user.toLowerCase();
            
            if (!Object.keys(members).contains(user)) {
                channel.send(message.author + ", either there is no such user, or that user does not have any saved quotes.");
                return;
            }
            
            id = members[user].id;
            name = members[user].name;
            
            if (Object.keys(quotes).length === 0) {
                channel.send(message.author + ", there are no saved quotes.");
                return;
            }
            
            if (!quotes[id]) {
                channel.send(message.author + ", that user does not have any saved quotes.");
                return;
            }
            
            channel.send(name + " has been quoted **" + quotes[id].length + "** times.");
        }
    },
    
    quotestats: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you the current quote stats.";
        },
        
        command: function (message, server, command, channel) {
            var quotes = serverData[server.id].quotes, members = idsToUsers(quotes, server), names = [], total = 0;
            
            if (Object.keys(quotes).length === 0) {
                channel.send(message.author + ", there are no saved quotes.");
                return;
            }
            
            for (var id in quotes) {
                total += quotes[id].length;
            }
            
            for (var name in members) {
                names.push(members[name].name);
            }
            
            channel.send("There are currently **" + total + "** quotes total, and **" + Object.keys(quotes).length + "** different users have been quoted.\n" +
            "Quoted users: " + names.join(", ") + ".");
        }
    },
    
    addquote: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <user>^<quote>`: adds `quote` to `user`'s saved quotes.";
        },
        
        command: function (message, server, command, channel) {
            var user = command[1], quotes = serverData[server.id].quotes;
            
            if (!user) {
                channel.send(message.author + ", please specify a user to add a quote to.");
                return;
            }
            
            var quote = command[2];
            
            if (!quote) {
                channel.send(message.author + ", please specify a quote to add.");
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
                quotes[id] = [];
            }
            
            if (quotes[id].contains(quote)) {
                channel.send(message.author + ", that line has already been quoted.");
                return;
            }
            
            quotes[id].push(quote);
            save("quotes", server);
            channel.send("Quote added.");
        }
    },
    
    nonuserquote: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: posts a random quote from the list of non-user quotes.";
        },
        
        command: function (message, server, command, channel) {
            var nonUserQuotes = serverData[server.id].nonUserQuotes;
            
            if (nonUserQuotes.isEmpty()) {
                channel.send(message.author + ", there are no saved non-user quotes.");
                return;
            }
            
            var author = Object.keys(nonUserQuotes).rand();
            
            var rng = RNG(nonUserQuotes[author].length);
            
            var quote = nonUserQuotes[author][rng];
            
            channel.send("```" + quote + "```\n- " + author);
        }
    },
    
    addnonuserquote: {
        help: function (command, symbol) {
            return "`" + symbol + command + "<author>^<quote>`: adds `quote` from `author` to the list of non-user quotes";
        },
        
        command: function (message, server, command, channel) {
            var author = command[1], nonUserQuotes = serverData[server.id].nonUserQuotes;
            
            if (!author) {
                channel.send(message.author + ", please specify an author.");
                return;
            }
            
            var quote = command[2];
            
            if (!quote) {
                channel.send(message.author + ", please specify a quote to add.");
                return;
            }
            
            if (!nonUserQuotes[author]) {
                nonUserQuotes[author] = [];
            }
            
            if (nonUserQuotes[author].contains(quote)) {
                channel.send(message.author + ", that line has already been quoted.");
                return;
            }
            
            nonUserQuotes[author].push(quote);
            save("nonUserQuotes", server);
            channel.send("Non-user quote added.");
        }
    },
    
    attract: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [user]`: attracts a random user on the server. If `user` is specified, attracts them instead.";
        },
        
        command: function (message, server, command, channel) {
            var user = command[1], name = (server.members.get(message.author.id).nickname === null ? message.author.username : server.members.get(message.author.id).nickname), members = toUsers(server.members);
            
            if (user) {
                user = user.toLowerCase();
                
                if (members.hasOwnProperty(user)) {
                    channel.send(":heart: **" + members[user].username + "** has been attracted by " + name + "! :heart:");
                    return;
                }
                
                channel.send(":heart: **" + command[1] + "** has been attracted by " + name + "! :heart:");
            } else {
                channel.send(":heart: **" + server.members.random().user.username + "** has been attracted by " + name + "! :heart:");
            }
        }
    },
    
    burn: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [user]`: burns a random user on the server. If `user` is specified, burns them instead.";
        },
        
        command: function (message, server, command, channel) {
            var user = command[1], name = (server.members.get(message.author.id).nickname === null ? message.author.username : server.members.get(message.author.id).nickname), members = toUsers(server.members);
            
            if (user) {
                user = user.toLowerCase();
                
                if (members.hasOwnProperty(user)) {
                    channel.send(":fire: **" + members[user].username + "** has been burned by " + name + "! :fire:");
                    return;
                }
                
                channel.send(":fire: **" + command[1] + "** has been burned by " + name + "! :fire:");
            } else {
                channel.send(":fire: **" + server.members.random().user.username + "** has been burned by " + name + "! :fire:");
            }
        }
    },
    
    confuse: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [user]`: confuses a random user on the server. If `user` is specified, confuses them instead.";
        },
        
        command: function (message, server, command, channel) {
            var user = command[1], name = (server.members.get(message.author.id).nickname === null ? message.author.username : server.members.get(message.author.id).nickname), members = toUsers(server.members);
            
            if (user) {
                user = user.toLowerCase();
                
                if (members.hasOwnProperty(user)) {
                    channel.send(":question: **" + members[user].username + "** has been confused by " + name + "! :question:");
                    return;
                }
                
                channel.send(":question: **" + command[1] + "** has been confused by " + name + "! :question:");
            } else {
                channel.send(":question: **" + server.members.random().user.username + "** has been confused by " + name + "! :question:");
            }
        }
    },
    
    freeze: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [user]`: freezes a random user on the server. If `user` is specified, freezes them instead.";
        },
        
        command: function (message, server, command, channel) {
            var user = command[1], name = (server.members.get(message.author.id).nickname === null ? message.author.username : server.members.get(message.author.id).nickname), members = toUsers(server.members);
            
            if (user) {
                user = user.toLowerCase();
                
                if (members.hasOwnProperty(user)) {
                    channel.send(":snowflake: **" + members[user].username + "** has been frozen by " + name + "! :snowflake:");
                    return;
                }
                
                channel.send(":snowflake: **" + command[1] + "** has been frozen by " + name + "! :snowflake:");
            } else {
                channel.send(":snowflake: **" + server.members.random().user.username + "** has been frozen by " + name + "! :snowflake:");
            }
        }
    },
    
    nuke: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [user]`: nukes a random user on the server. If `user` is specified, nukes them instead.";
        },
        
        command: function (message, server, command, channel) {
            var user = command[1], name = (server.members.get(message.author.id).nickname === null ? message.author.username : server.members.get(message.author.id).nickname), members = toUsers(server.members);
            
            if (user) {
                user = user.toLowerCase();
                
                if (members.hasOwnProperty(user)) {
                    channel.send(":radioactive: **" + members[user].username + "** has been nuked by " + name + "! :radioactive:");
                    return;
                }
                
                channel.send(":radioactive: **" + command[1] + "** has been nuked by " + name + "! :radioactive:");
            } else {
                channel.send(":radioactive: **" + server.members.random().user.username + "** has been nuked by " + name + "! :radioactive:");
            }
        }
    },
    
    poison: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [user]`: poisons a random user on the server. If `user` is specified, poisons them instead.";
        },
        
        command: function (message, server, command, channel) {
            var user = command[1], name = (server.members.get(message.author.id).nickname === null ? message.author.username : server.members.get(message.author.id).nickname), members = toUsers(server.members);
            
            if (user) {
                user = user.toLowerCase();
                
                if (members.hasOwnProperty(user)) {
                    channel.send(":skull: **" + members[user].username + "** has been poisoned by " + name + "! :skull:");
                    return;
                }
                
                channel.send(":skull: **" + command[1] + "** has been poisoned by " + name + "! :skull:");
            } else {
                channel.send(":skull: **" + server.members.random().user.username + "** has been poisoned by " + name + "! :skull:");
            }
        }
    },
    
    paralyze: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [user]`: paralyzes a random user on the server. If `user` is specified, paralyzes them instead.";
        },
        
        command: function (message, server, command, channel) {
            var user = command[1], name = (server.members.get(message.author.id).nickname === null ? message.author.username : server.members.get(message.author.id).nickname), members = toUsers(server.members);
            
            if (user) {
                user = user.toLowerCase();
                
                if (members.hasOwnProperty(user)) {
                    channel.send(":zap: **" + members[user].username + "** has been paralyzed by " + name + "! :zap:");
                    return;
                }
                
                channel.send(":zap: **" + command[1] + "** has been paralyzed by " + name + "! :zap:");
            } else {
                channel.send(":zap: **" + server.members.random().user.username + "** has been paralyzed by " + name + "! :zap:");
            }
        }
    },
    
    sleep: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [user]`: puts to sleep a random user on the server. If `user` is specified, puts them to sleep instead.";
        },
        
        command: function (message, server, command, channel) {
            var user = command[1], name = (server.members.get(message.author.id).nickname === null ? message.author.username : server.members.get(message.author.id).nickname), members = toUsers(server.members);
            
            if (user) {
                user = user.toLowerCase();
                
                if (members.hasOwnProperty(user)) {
                    channel.send(":zzz: **" + members[user].username + "** has been put to sleep by " + name + "! :zzz:");
                    return;
                }
                
                channel.send(":zzz: **" + command[1] + "** has been put to sleep by " + name + "! :zzz:");
            } else {
                channel.send(":zzz: **" + server.members.random().user.username + "** has been put to sleep by " + name + "! :zzz:");
            }
        }
    },
    
    play: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <YouTube link>`: makes me stream the audio from the video `YouTube link` to the voice channel.";
        },
        
        command: function (message, server, command, channel) {
            var link = command[1], url;
        
            if (!link) {
                channel.send(message.author + ", please specify the YouTube video to be streamed.");
                return;
            }
            
            url = url.parse(link);
            
            if (url.hostname != "youtu.be" && (url.hostname != "www.youtube.com" || url.pathname != "/watch" || url.search.substring(0, 3) != "?v=")) {
                channel.send(message.author + ", that is not a YouTube video!");
                return;
            }
            
            playYouTube(server, link, 0.5);
        }
    }
};