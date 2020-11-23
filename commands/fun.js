module.exports = {
    opinion: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes me give my honest opinion about you.";
        },

        command: function (message, server, command, channel) {
            var id = message.author.id, username = message.author.username, badOpinions = serverData[server.id].badOpinions, goodOpinions = serverData[server.id].goodOpinions, opinion, opinionCount, rng;

            if (badOpinions.length === 0 && goodOpinions.length === 0) {
                channel.send("There are no opinions I can choose from! How disappointing.").catch(console.error);
                return;
            }

            if (badOpinions.length === 0) {
                opinion = message.author.username + " " + goodOpinions.rand().replace(/%u/gi, username);
            } else if (goodOpinions.length === 0) {
                opinion = message.author.username + " " + badOpinions.rand().replace(/%u/gi, username);
            } else {
                opinionCount = badOpinions.length + goodOpinions.length;
                rng = RNG(opinionCount);

                if (rng >= badOpinions.length || id == bot.user.id) {
                    opinion = message.author.username + " " + goodOpinions.rand().replace(/%u/gi, username);
                } else {
                    opinion = message.author.username + " " + badOpinions.rand().replace(/%u/gi, username);
                }

                if (opinion.contains("but still cool!") && serverData[server.id].opinionExceptions.contains(id)) {
                    opinion = message.author.username + " " + "I love you and only you!";
                }
            }

            channel.send(opinion.replace(/%t/gi, TOUHOU_SHMUPS.rand())).catch(console.error);
        }
    },

    "8ball": {
        help: function (command, symbol) {
            return "`" + symbol + command + " <question>`: the wise 8ball will give an answer to `question`.";
        },

        command: function (message, server, command, channel) {
            var question = command[1];

            if (!question) {
                channel.send(message.author.username + ", please specify a question.").catch(console.error);
                return;
            }

            channel.send(ANSWERS.rand()).catch(console.error);
        }
    },

    choice: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <option 1> <option 2> [option 3] ...`: makes me choose out of the specified options for you. At least two options must be specified.";
        },

        command: function (message, server, command, channel) {
            if (!command[1]) {
                channel.send(message.author.username + ", please specify options.").catch(console.error);
                return;
            }

            if (!command[2]) {
                channel.send(message.author.username + ", please specify at least a second option.").catch(console.error);
                return;
            }

            command.splice(0, 1);
            channel.send(CHOICE.rand().replace("%o", command.rand())).catch(console.error);
        }
    },

    roll: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [filter]`: roll a random Touhou category. `filter` can be nothing, Windows, PC-98, a game or a difficulty.";
        },

        command: function (message, server, command, channel) {
            if (cooldown) {
                channel.send("Please do not flood the channel!").catch(console.error);
                return;
            }

            var WRs = permData.WRs;

            var argument = (command[1] ? command[1] : ""), lower = argument.toLowerCase(), min = 0, max = Object.keys(WRs).length, capped, game, category, shot, message;

            if (lower == "windows") {
                min = 5;
            } else if (lower.replace(/-/g, "") == "pc98") {
                max = 5;
            }

            game = (gameName(lower) ? gameName(lower) : Object.keys(WRs)[rangedRNG(min, max)]);
            capped = cap(lower);
            category = (CATEGORIES.contains(capped) ? capped : Object.keys(WRs[game])[rangedRNG(0, Object.keys(WRs[game]).length)]);

            while (category == "Extra" && (game == "HRtP" || game == "PoDD")) {
                game = Object.keys(WRs)[rangedRNG(min, max)];
            }

            shot = Object.keys(WRs[game][category])[rangedRNG(0, Object.keys(WRs[game][category]).length)].replace("Team", " Team");
            message = (channel.type != "dm" ? message.author.username + " " : "") + "You must play... **" + game +
            " " + category + "**" + (shot.length <= 2 || shot == "Makai" || shot == "Jigoku" ? " " : " with ");
            message += (shot == '-' ? "" : "**" + shot + "**") + "!";
            channel.send(message, {"file": "games/" + game + ".jpg"}).catch(console.error);

            if (channel.type != "dm") {
                cooldown = true;
                timers.setInterval(function () { cooldown = false; }, serverData[server.id].cooldownSecs * 1000);
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
                channel.send(message.author.username + ", please specify a search query.").catch(console.error);
                return;
            }

            query = originalQuery.replace(/ /g, '+');

            request(GOOGLE_SUGGESTS_BASE_URL + query, function (error, response, body) {
                var statusCode = response.statusCode;

                if (!error && statusCode == 200) {
                    var suggestions = JSON.parse(body)[1].join('\n');

                    if (suggestions === "") {
                        channel.send("No Google suggestions for that query.").catch(console.error);
                    } else {
                        channel.send(":regional_indicator_g: `Google` Suggestions for '" + originalQuery + "': ```" + suggestions + "```").catch(console.error);
                    }
                } else {
                    channel.send("Error " + statusCode + " " + camel(response.statusMessage) + ".").catch(console.error);
                }
            });
        }
    },

    waifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you who is your waifu today.";
        },

        command: function (message, server, command, channel) {
            var date = serverData[server.id].date, exceptions = serverData[server.id].waifusExceptions, id = message.author.id, waifu;

            dateCheck(server);

            if (date != serverData[server.id].date) {
                allCommands.mod.reset.command(message, server, command, channel);
            }

            var waifus = serverData[server.id].waifus;

            if (!waifus[id]) {
                waifu = (exceptions[id] ? exceptions[id] : server.members.cache.random().user.username);
                waifus[id] = waifu;
                save("waifus", server);
            } else {
                waifu = waifus[id];
            }

            channel.send(message.author.username + " Your waifu today is **" + waifu + "**!").catch(console.error);
        }
    },

    touhouwaifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you who is your Touhou waifu today.";
        },

        command: function (message, server, command, channel) {
            var date = serverData[server.id].date, exceptions = serverData[server.id].touhouWaifusExceptions, id = message.author.id, touhouWaifu;

            dateCheck(server);

            if (date != serverData[server.id].date) {
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

            channel.send(message.author.username + " Your Touhou waifu today is **" + touhouWaifu + "**!").catch(console.error);
        }
    },

    spellwaifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you who is your Touhou Spell Card waifu today.";
        },

        command: function (message, server, command, channel) {
            var date = serverData[server.id].date, exceptions = serverData[server.id].touhouWaifusExceptions, id = message.author.id, touhouWaifu;

            dateCheck(server);

            if (date != serverData[server.id].date) {
                allCommands.mod.reset.command(message, server, command, channel);
            }

            var spellWaifus = serverData[server.id].spellWaifus;

            if (!spellWaifus[id]) {
                spellWaifu = (exceptions[id] ? exceptions[id] : TOUHOU_SPELLS.rand());

                spellWaifus[id] = spellWaifu;
                save("spellWaifus", server);
            } else {
                spellWaifu = spellWaifus[id];
            }

            channel.send(message.author.username + " Your Touhou Spell Card waifu today is **" + spellWaifu + "**!").catch(console.error);
        }
    },

    fanwaifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you who is your fangame waifu today.";
        },

        command: function (message, server, command, channel) {
            var date = serverData[server.id].date, id = message.author.id, fanmemeWaifu;

            dateCheck(server);

            if (date != serverData[server.id].date) {
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

            channel.send(message.author.username + " Your fanmeme waifu today is **" + fanmemeWaifu + "**!").catch(console.error);
        }
    },

    lenenwaifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you who is your Len'en waifu today.";
        },

        command: function (message, server, command, channel) {
            var date = serverData[server.id].date, id = message.author.id, lenenwaifu;

            dateCheck(server);

            if (date != serverData[server.id].date) {
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

            channel.send(message.author.username + " Your Len'en waifu today is **" + lenenwaifu + "**!").catch(console.error);
        }
    },

    ratewaifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <waifu>`: gives `waifu` a randomly generated rating.";
        },

        command: function (message, server, command, channel) {
            var waifu = command[1], date = serverData[server.id].date, ratings = serverData[server.id].ratings;

            dateCheck(server);

            if (date != serverData[server.id].date) {
                allCommands.mod.reset.command(message, server, command, channel);
            }

            if (!waifu) {
                channel.send(">not having a waifu").catch(console.error);
                channel.send("0/10").catch(console.error);
                return;
            }

            if (waifu.toLowerCase() == "kurumi") {
                channel.send(":100: I rate that waifu **10/10**, of course!").catch(console.error);
                return;
            }

            if (waifu == "The Challenge") {
                channel.send(server.emojis.find("name", "playedit") + " I rate that waifu **Infinity/10**.").catch(console.error);
                return;
            }

            if (waifu == "ur waifu") {
                channel.send("ur waifu a shit").catch(console.error);
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

            channel.send(":" + emote + ": I rate that waifu **" + rating + "/10**.").catch(console.error);
        }
    },

    quote: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <author>`: selects a random quote out of the saved quotes from `author`. If `author` is not specified, selects a random one.";
        },

        command: function (message, server, command, channel) {
            var author = command[1], quotes = serverData[server.id].quotes;

            if (quotes.isEmpty()) {
                channel.send(message.author.username + ", there are no saved quotes.").catch(console.error);
                return;
            }

            author = (author ? author.toLowerCase() : Object.keys(quotes).rand());

            if (!quotes.hasOwnProperty(author)) {
                channel.send(message.author.username + ", that author does not have any saved quotes.").catch(console.error);
                return;
            }

            channel.send("```" + quotes[author].list.rand() + "```\n- " + quotes[author].name).catch(console.error);
        }
    },

    quotecount: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <author>`: tells you how many times `author` has been quoted.";
        },

        command: function (message, server, command, channel) {
            var author = command[1], quotes = serverData[server.id].quotes;

            if (!author) {
                channel.send(message.author.username + ", please specify an author.").catch(console.error);
                return;
            }

            if (quotes.isEmpty()) {
                channel.send(message.author.username + ", there are no saved quotes.").catch(console.error);
                return;
            }

            author = author.toLowerCase();

            if (!quotes[author]) {
                channel.send(message.author.username + ", that author does not have any saved quotes.").catch(console.error);
                return;
            }

            channel.send(quotes[author].name + " has been quoted **" + quotes[author].list.length + "** times.").catch(console.error);
        }
    },

    quotestats: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you the current quote stats.";
        },

        command: function (message, server, command, channel) {
            var quotes = serverData[server.id].quotes, total = 0, names = [], author;

            if (quotes.isEmpty()) {
                channel.send(message.author.username + ", there are no saved quotes.").catch(console.error);
                return;
            }

            for (author in quotes) {
                total += quotes[author].list.length;
                names.push(quotes[author].name);
            }

            channel.send("There are currently **" + total + "** quotes total, and **" + Object.keys(quotes).length +
            "** different authors have been quoted.\nQuoted authors: " + names.join(", ") + ".").catch(console.error);
        }
    },

    addquote: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <author> <quote>`: adds `quote` to `author`'s saved quotes. If `author` is a user, " +
            "your spelling will be automatically corrected if it is wrong.\nAuthor names are case-insensitive; different cases will count as the same names.";
        },

        command: function (message, server, command, channel) {
            var name = command[1], quotes = serverData[server.id].quotes, members, author;

            if (!name) {
                channel.send(message.author.username + ", please specify an author to add a quote to.").catch(console.error);
                return;
            }

            var quote = command[2];

            if (!quote) {
                channel.send(message.author.username + ", please specify a quote to add.").catch(console.error);
                return;
            }

            members = toUsers(server.members);
            author = name.toLowerCase();

            if (members.hasOwnProperty(author)) {
                name = members[author].username;
            }

            if (!quotes[author]) {
                quotes[author] = {"name": name, "list": []};
            }

            if (quotes[author].list.contains(quote)) {
                channel.send(message.author.username + ", that line has already been quoted.").catch(console.error);
                return;
            }

            quotes[author].list.push(quote);
            save("quotes", server);
            channel.send("Quote added.").catch(console.error);
        }
    },

    attract: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [user]`: attracts a random user on the server. If `user` is specified, attracts them instead.";
        },

        command: function (message, server, command, channel) {
            var user = command[1], name = (server.members.resolve(message.author.id).nickname === null ? message.author.username : server.members.resolve(message.author.id).nickname), members = toUsers(server.members);

            if (user) {
                user = user.toLowerCase();

                if (members.hasOwnProperty(user)) {
                    channel.send(":heart: **" + members[user].username + "** has been attracted by " + name + "! :heart:").catch(console.error);
                    return;
                }

                channel.send(":heart: **" + command[1] + "** has been attracted by " + name + "! :heart:").catch(console.error);
            } else {
                channel.send(":heart: **" + server.members.cache.random().user.username + "** has been attracted by " + name + "! :heart:").catch(console.error);
            }
        }
    },

    burn: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [user]`: burns a random user on the server. If `user` is specified, burns them instead.";
        },

        command: function (message, server, command, channel) {
            var user = command[1], name = (server.members.resolve(message.author.id).nickname === null ? message.author.username : server.members.resolve(message.author.id).nickname), members = toUsers(server.members);

            if (user) {
                user = user.toLowerCase();

                if (members.hasOwnProperty(user)) {
                    channel.send(":fire: **" + members[user].username + "** has been burned by " + name + "! :fire:").catch(console.error);
                    return;
                }

                channel.send(":fire: **" + command[1] + "** has been burned by " + name + "! :fire:").catch(console.error);
            } else {
                channel.send(":fire: **" + server.members.cache.random().user.username + "** has been burned by " + name + "! :fire:").catch(console.error);
            }
        }
    },

    confuse: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [user]`: confuses a random user on the server. If `user` is specified, confuses them instead.";
        },

        command: function (message, server, command, channel) {
            var user = command[1], name = (server.members.resolve(message.author.id).nickname === null ? message.author.username : server.members.resolve(message.author.id).nickname), members = toUsers(server.members);

            if (user) {
                user = user.toLowerCase();

                if (members.hasOwnProperty(user)) {
                    channel.send(":question: **" + members[user].username + "** has been confused by " + name + "! :question:").catch(console.error);
                    return;
                }

                channel.send(":question: **" + command[1] + "** has been confused by " + name + "! :question:").catch(console.error);
            } else {
                channel.send(":question: **" + server.members.cache.random().user.username + "** has been confused by " + name + "! :question:").catch(console.error);
            }
        }
    },

    freeze: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [user]`: freezes a random user on the server. If `user` is specified, freezes them instead.";
        },

        command: function (message, server, command, channel) {
            var user = command[1], name = (server.members.resolve(message.author.id).nickname === null ? message.author.username : server.members.resolve(message.author.id).nickname), members = toUsers(server.members);

            if (user) {
                user = user.toLowerCase();

                if (members.hasOwnProperty(user)) {
                    channel.send(":snowflake: **" + members[user].username + "** has been frozen by " + name + "! :snowflake:").catch(console.error);
                    return;
                }

                channel.send(":snowflake: **" + command[1] + "** has been frozen by " + name + "! :snowflake:").catch(console.error);
            } else {
                channel.send(":snowflake: **" + server.members.cache.random().user.username + "** has been frozen by " + name + "! :snowflake:").catch(console.error);
            }
        }
    },

    nuke: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [user]`: nukes a random user on the server. If `user` is specified, nukes them instead.";
        },

        command: function (message, server, command, channel) {
            var user = command[1], name = (server.members.resolve(message.author.id).nickname === null ? message.author.username : server.members.resolve(message.author.id).nickname), members = toUsers(server.members);

            if (user) {
                user = user.toLowerCase();

                if (members.hasOwnProperty(user)) {
                    channel.send(":radioactive: **" + members[user].username + "** has been nuked by " + name + "! :radioactive:").catch(console.error);
                    return;
                }

                channel.send(":radioactive: **" + command[1] + "** has been nuked by " + name + "! :radioactive:").catch(console.error);
            } else {
                channel.send(":radioactive: **" + server.members.cache.random().user.username + "** has been nuked by " + name + "! :radioactive:").catch(console.error);
            }
        }
    },

    poison: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [user]`: poisons a random user on the server. If `user` is specified, poisons them instead.";
        },

        command: function (message, server, command, channel) {
            var user = command[1], name = (server.members.resolve(message.author.id).nickname === null ? message.author.username : server.members.resolve(message.author.id).nickname), members = toUsers(server.members);

            if (user) {
                user = user.toLowerCase();

                if (members.hasOwnProperty(user)) {
                    channel.send(":skull: **" + members[user].username + "** has been poisoned by " + name + "! :skull:").catch(console.error);
                    return;
                }

                channel.send(":skull: **" + command[1] + "** has been poisoned by " + name + "! :skull:").catch(console.error);
            } else {
                channel.send(":skull: **" + server.members.cache.random().user.username + "** has been poisoned by " + name + "! :skull:").catch(console.error);
            }
        }
    },

    paralyze: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [user]`: paralyzes a random user on the server. If `user` is specified, paralyzes them instead.";
        },

        command: function (message, server, command, channel) {
            var user = command[1], name = (server.members.resolve(message.author.id).nickname === null ? message.author.username : server.members.resolve(message.author.id).nickname), members = toUsers(server.members);

            if (user) {
                user = user.toLowerCase();

                if (members.hasOwnProperty(user)) {
                    channel.send(":zap: **" + members[user].username + "** has been paralyzed by " + name + "! :zap:").catch(console.error);
                    return;
                }

                channel.send(":zap: **" + command[1] + "** has been paralyzed by " + name + "! :zap:").catch(console.error);
            } else {
                channel.send(":zap: **" + server.members.cache.random().user.username + "** has been paralyzed by " + name + "! :zap:").catch(console.error);
            }
        }
    },

    sleep: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [user]`: puts to sleep a random user on the server. If `user` is specified, puts them to sleep instead.";
        },

        command: function (message, server, command, channel) {
            var user = command[1], name = (server.members.resolve(message.author.id).nickname === null ? message.author.username : server.members.resolve(message.author.id).nickname), members = toUsers(server.members);

            if (user) {
                user = user.toLowerCase();

                if (members.hasOwnProperty(user)) {
                    channel.send(":zzz: **" + members[user].username + "** has been put to sleep by " + name + "! :zzz:").catch(console.error);
                    return;
                }

                channel.send(":zzz: **" + command[1] + "** has been put to sleep by " + name + "! :zzz:").catch(console.error);
            } else {
                channel.send(":zzz: **" + server.members.cache.random().user.username + "** has been put to sleep by " + name + "! :zzz:").catch(console.error);
            }
        }
    },

    play: {
        help: function (command, symbol) {
            return "`" + symbol + command + " <YouTube link>`: makes me stream the audio from the video `YouTube link` to the voice channel.";
        },

        command: function (message, server, command, channel) {
            var link = command[1];

            if (!link) {
                channel.send(message.author.username + ", please specify the YouTube video to be streamed.").catch(console.error);
                return;
            }

            link = url.parse(link);

            if (link.hostname != "youtu.be" && (link.hostname != "www.youtube.com" || link.pathname != "/watch" || link.search.substring(0, 3) != "?v=")) {
                channel.send(message.author.username + ", that is not a YouTube video!").catch(console.error);
                return;
            }

            playYouTube(server, command[1], 0.5);
        }
    }
};
