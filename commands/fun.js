﻿module.exports = {
    opinion: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [argument]`: makes me give my honest opinion about you. " +
            "If an argument is specified, makes me give my honest opinion about that instead.";
        },

        command: function (message, server, command, channel) {
            var arg = command[1], id = message.author.id, username = message.author.username,
                badOpinions = serverData[server.id].badOpinions, goodOpinions = serverData[server.id].goodOpinions,
                opinion, opinionCount, rng;

            if (badOpinions.length === 0 && goodOpinions.length === 0) {
                channel.send("There are no opinions I can choose from! How disappointing.").catch(console.error);
                return;
            }

            if (arg) {
                username = arg;
            }

            if (badOpinions.length === 0) {
                opinion = username + " " + goodOpinions.rand().replace(/%u/gi, username).replace(/%t/gi, TOUHOU_SHMUPS.rand());
            } else if (goodOpinions.length === 0) {
                opinion = username + " " + badOpinions.rand().replace(/%u/gi, username).replace(/%t/gi, TOUHOU_SHMUPS.rand());
            } else {
                opinionCount = badOpinions.length + goodOpinions.length;
                rng = RNG(opinionCount);

                if (rng >= badOpinions.length || id == bot.user.id) {
                    opinion = username + " " + goodOpinions.rand().replace(/%u/gi, username).replace(/%t/gi, TOUHOU_SHMUPS.rand());
                } else {
                    opinion = username + " " + badOpinions.rand().replace(/%u/gi, username).replace(/%t/gi, TOUHOU_SHMUPS.rand());
                }

                if (opinion.contains("but still cool!") && serverData[server.id].opinionExceptions.contains(id)) {
                    opinion = username + " " + "I love you and only you!";
                }
            }

            channel.send(opinion).catch(console.error);
        }
    },

    addopinion: {
        args: [0, "an opinion to add", "whether the opinion is good or bad"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <opinion> <good/bad>`: adds `opinion` (either `good` or `bad`) to the possible results of the opinion command.\nWriting '%t' in the opinion means it will be replaced by a random Touhou shmup.";
        },

        command: function (message, server, command, channel) {
            var opinion = command[1], type = command[2], badOpinions = serverData[server.id].badOpinions,
                goodOpinions = serverData[server.id].goodOpinions;

            if (badOpinions.contains(opinion) || goodOpinions.contains(opinion)) {
                channel.send(message.author.username + ", that opinion already exists.").catch(console.error);
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

    ship: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [user1] [user2]`: will tell you how well `user1` and `user2` match. " +
            "If `user2` is not specified, selects a random member of this server instead. " +
            "If `user1` is also not specified, matches yourself with a random member instead.";
        },

        command: function (message, server, command, channel) {
            var user1 = command[1], user2 = command[2], date = serverData[server.id].date, ships = serverData[server.id].ships,
                members = toUsers(server.members), lower1, lower2, ship, message, emoji;

            if (!user1) {
                user1 = message.author.username;
            }

            dateCheck(server);

            if (date != serverData[server.id].date) {
                allCommands.mod.reset.command(message, server, ["reset"], channel);
            }

            lower1 = user1.toLowerCase();

            if (!user2) {
                user2 = server.members.cache.random().user.username;
            }

            lower2 = user2.toLowerCase();

            if (!ships.hasOwnProperty(lower1)) {
                ships[lower1] = {};
            }

            if (!ships.hasOwnProperty(lower2)) {
                ships[lower2] = {};
            }

            if (!ships[lower1].hasOwnProperty(lower2)) {
                ships[lower1][lower2] = RNG(101);

                if (!ships[lower2].hasOwnProperty(lower1)) {
                    ships[lower2][lower1] = ships[lower1][lower2];
                }
            }

            ship = ships[lower1][lower2];

            if (members.hasOwnProperty(lower1)) {
                user1 = members[lower1].username;
            }

            if (members.hasOwnProperty(lower2)) {
                user2 = members[lower2].username;
            }

            message = user1 + " x " + user2 + " is a **" + ship + "%** match";

            if (ship == 100) {
                emoji = " :heartpulse: ";
                message += "!! OTP!!";
            } else if (ship >= 67) {
                emoji = " :heart: ";
                message += "!";
            } else if (ship >= 33) {
                emoji = " :hearts: ";
                message += ".";
            } else if (ship === 0) {
                emoji = " :poop: ";
                message += "... absolutely hopeless.";
            } else {
                emoji = " :broken_heart: ";
                message += "... :(";
            }

            save("ships", server);
            channel.send(emoji + message + emoji).catch(console.error);
        }
    },

    randomship: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: makes me ship two randomly selected members of this server.";
        },

        command: function (message, server, command, channel) {
            var user1 = server.members.cache.random().user.username, user2 = server.members.cache.random().user.username,
                shipMessages = serverData[server.id].shipMessages;

            if (shipMessages.length === 0) {
                channel.send(message.author.username + ", there are currently no ship messages to use!").catch(console.error);
                return;
            }

            message = shipMessages.rand().replace("%1", "**" + user1 + "**").replace("%2", "**" + user2 + "**");

            channel.send(message).catch(console.error);
        }
    },

    addshipmessage: {
        args: [0, "a message"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <message>`: adds a message for the `" + symbol + "randomship` command. " +
            "Must include `%1` as a placeholder for the first member and `%2` for the second member.";
        },

        command: function (message, server, command, channel) {
            var message = command[1], shipMessages = serverData[server.id].shipMessages;

            if (!message.contains("%1") || !message.contains("%2")) {
                channel.send(message.author.username + ", please include the member name placeholders `%1` and `%2`.").catch(console.error);
                return;
            }

            shipMessages.push(message);
            save("shipMessages", server);
            channel.send("Ship message added.").catch(console.error);
        }
    },

    "8ball": {
        args: [0, "a question"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <question>`: the wise 8ball will give an answer to `question`.";
        },

        command: function (message, server, command, channel) {
            channel.send(ANSWERS.rand()).catch(console.error);
        }
    },

    choice: {
        args: [0, "options", "at least a second option"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <option 1> <option 2> [option 3] ...`: makes me choose out of " +
            "the specified options for you. At least two options must be specified.";
        },

        command: function (message, server, command, channel) {
            command.splice(0, 1);
            channel.send(CHOICE.rand().replace("%o", command.rand())).catch(console.error);
        }
    },

    roll: {
        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " [filter]`: roll a random Touhou category. `filter` can be nothing, Windows, PC-98, a game or a difficulty.";
        },

        command: function (message, server, command, channel) {
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
            channel.send(message, {"files": ["games/" + game + ".jpg"]}).catch(console.error);
        }
    },

    google: {
        args: [0, "a search query"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <query>`: posts the Google suggestions for `query`.";
        },

        command: function (message, server, command, channel) {
            var originalQuery = command[1], query, suggestions;

            query = encodeURI(originalQuery.replace(/ /g, '+'));
            request(GOOGLE_SUGGESTS_BASE_URL + query, function (error, response, body) {
                if (!response) {
                    channel.send("Failed to search Google for '" + originalQuery + "'.").catch(console.error);
                    return;
                }

                if (!error && response.statusCode == 200) {
                    suggestions = JSON.parse(body)[1].join('\n');

                    if (suggestions === "") {
                        channel.send("No Google suggestions for that query.").catch(console.error);
                    } else {
                        channel.send(":regional_indicator_g: `Google` Suggestions for '" + originalQuery + "': ```" + suggestions + "```").catch(console.error);
                    }
                } else {
                    channel.send("Error " + response.statusCode + " " + camel(response.statusMessage) + ".").catch(console.error);
                }
            });
        }
    },

    waifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you who is your waifu today.";
        },

        command: function (message, server, command, channel) {
            var waifu = updateWaifu(message, server, "user", channel);

            channel.send(message.author.username + ", your waifu today is **" + waifu + "**!").catch(console.error);
        }
    },

    touhouwaifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you who is your Touhou waifu today.";
        },

        command: function (message, server, command, channel) {
            var waifu = updateWaifu(message, server, "touhou", channel);

            channel.send(message.author.username + ", your Touhou waifu today is **" + waifu + "**!").catch(console.error);
        }
    },

    spellwaifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you who is your Touhou Spell Card waifu today.";
        },

        command: function (message, server, command, channel) {
            var waifu = updateWaifu(message, server, "spell", channel);

            channel.send(message.author.username + ", your Spell Card waifu today is **" + waifu + "**!").catch(console.error);
        }
    },

    fanwaifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you who is your fangame waifu today.";
        },

        command: function (message, server, command, channel) {
            var waifu = updateWaifu(message, server, "fan", channel);

            channel.send(message.author.username + ", your fanmeme waifu today is **" + waifu + "**!").catch(console.error);
        }
    },

    lenenwaifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you who is your Len'en waifu today.";
        },

        command: function (message, server, command, channel) {
            var waifu = updateWaifu(message, server, "lenen", channel);

            channel.send(message.author.username + ", your Len'en waifu today is **" + waifu + "**!").catch(console.error);
        }
    },

    allwaifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: tells you who are your waifus today.";
        },

        command: function (message, server, command, channel) {
            var waifu = updateWaifu(message, server, "user", channel),
                touhouWaifu = updateWaifu(message, server, "touhou", channel),
                spellWaifu = updateWaifu(message, server, "spell", channel),
                fanWaifu = updateWaifu(message, server, "fan", channel),
                lenenWaifu = updateWaifu(message, server, "lenen", channel);

            channel.send(message.author.username + ", your waifus today are:\n" +
            "User: **" + waifu + "**\nTouhou: **" + touhouWaifu + "**\nSpell: **" + spellWaifu +
            "**\nFanmeme: **" + fanWaifu + "**\nLen'en: **" + lenenWaifu + "**").catch(console.error);
        }
    },

    ratewaifu: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [waifu]`: gives `waifu` a randomly generated rating.";
        },

        isException: function (server, channel, waifu) {
            if (!waifu) {
                channel.send(">not having a waifu").catch(console.error);
                channel.send("0/10").catch(console.error);
                return true;
            }

            var lower = waifu.toLowerCase();

            if (lower == "kurumi") {
                channel.send(":100: I rate that waifu **10/10**, of course!").catch(console.error);
                return true;
            } else if (lower.contains("hahaa")) {
                emoji = server.emojis.cache.find(emoji => emoji.name == "hahaa");
                channel.send(":ok_hand: I rate that waifu **<:" + emoji.name + ":" + emoji.id + ">/10**.").catch(console.error);
                return true;
            } else if (lower == "the challenge") {
                emoji = server.emojis.cache.find(emoji => emoji.name == "playedit");
                channel.send("<:" + emoji.name + ":" + emoji.id + "> I rate that waifu **Infinity/10**.").catch(console.error);
                return true;
            } else if (lower == "ur waifu") {
                channel.send("ur waifu a shit").catch(console.error);
                return true;
            }

            return false;
        },

        command: function (message, server, command, channel) {
            var waifu = command[1], date = serverData[server.id].date, ratings = serverData[server.id].ratings, emoji;

            dateCheck(server);

            if (date != serverData[server.id].date) {
                allCommands.mod.reset.command(message, server, command, channel);
            }

            if (this.isException(server, channel, waifu)) {
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

    scrubquote: {
        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + "`: selects a random scrubquote out of the saved scrubquotes.";
        },

        command: function (message, server, command, channel) {
            var scrubquotes = permData.scrubquotes, i;

            if (scrubquotes.length === 0) {
                channel.send(message.author.username + ", there are no saved quotes.").catch(console.error);
                return;
            }

            channel.send("```" + scrubquotes.rand() + "```").catch(console.error);
        }
    },

    addscrubquote: {
        args: [0, "a scrubquote to add"],

        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " <quote>`: adds `scrubquote` to the list of scrubquotes.";
        },

        command: function (message, server, command, channel) {
            var scrubquote = command[1].trim(), scrubquotes = permData.scrubquotes;

            if (scrubquotes.contains(scrubquote)) {
                channel.send(message.author.username + ", that line has already been quoted.").catch(console.error);
                return;
            }

            scrubquotes.push(scrubquote);
            save("scrubquotes");
            channel.send("Scrubquote added.").catch(console.error);
        }
    },

    scrubquotecount: {
        dm: true,

        help: function (command, symbol) {
            return "`" + symbol + command + " `: tells you how many scrubquotes are in the list.";
        },

        command: function (message, server, command, channel) {
            var scrubquotes = permData.scrubquotes;

            if (scrubquotes.length === 0) {
                channel.send(message.author.username + ", there are no saved scrubquotes.").catch(console.error);
                return;
            }

            channel.send("There are currently **" + scrubquotes.length + "** scrubquotes in the list.").catch(console.error);
        }
    },

    quote: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [author]`: selects a random quote out of the saved quotes from `author`. " +
            "If `author` is not specified, selects a random one.";
        },

        command: function (message, server, command, channel) {
            var author = command[1], list = [], quotes = serverData[server.id].quotes, i;

            if (quotes.isEmpty()) {
                channel.send(message.author.username + ", there are no saved quotes.").catch(console.error);
                return;
            }

            if (!author) {
                for (author in quotes) {
                    for (i = 0; i < quotes[author].list.length; i++) {
                        list.push(quotes[author].name + ":" + quotes[author].list[i]);
                    }
                }

                quote = list.rand().split(':');
                name = quote[0];
                quote.splice(0, 1);
                quote = quote.join(':');
            } else {
                author = author.toLowerCase();
                list = quotes[author].list;
                name = quotes[author].name;
                quote = list.rand();

                if (!quotes.hasOwnProperty(author)) {
                    channel.send(message.author.username + ", that author does not have any saved quotes.").catch(console.error);
                    return;
                }
            }

            channel.send("```" + quote + "```\n- " + name).catch(console.error);
        }
    },

    quotecount: {
        args: [0, "an author"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <author>`: tells you how many times `author` has been quoted.";
        },

        command: function (message, server, command, channel) {
            var author = command[1], quotes = serverData[server.id].quotes;

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
        args: [0, "an author to add a quote to", "a quote to add"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <author> <quote>`: adds `quote` to `author`'s saved quotes. If `author` is a user, " +
            "your spelling will be automatically corrected if it is wrong.\nAuthor names are case-insensitive; different cases will count as the same names.";
        },

        command: function (message, server, command, channel) {
            var name = command[1], quote = command[2], quotes = serverData[server.id].quotes, members, author;

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
            return "`" + symbol + command + " [user]`: attracts `user`. " +
            "If `user` is not specified, attracts a random member of the server instead.";
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
            return "`" + symbol + command + " [user]`: burns `user`. " +
            "If `user` is not specified, burns a random member of the server instead.";
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
            return "`" + symbol + command + " [user]`: confuses `user`. " +
            "If `user` is not specified, confuses a random member of the server instead.";
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
            return "`" + symbol + command + " [user]`: freezes `user`. " +
            "If `user` is not specified, freezes a random member of the server instead.";
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
            return "`" + symbol + command + " [user]`: nukes `user`. " +
            "If `user` is not specified, nukes a random member of the server instead.";
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
            return "`" + symbol + command + " [user]`: poisons `user`. " +
            "If `user` is not specified, poisons a random member of the server instead.";
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
            return "`" + symbol + command + " [user]`: paralyzes `user`. " +
            "If `user` is not specified, paralyzes a random member of the server instead.";
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
            return "`" + symbol + command + " [user]`: puts `user` to sleep. " +
            "If `user` is specified, puts a random member of the server to sleep instead.";
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
        args: [0, "a YouTube video to be streamed"],

        help: function (command, symbol) {
            return "`" + symbol + command + " <YouTube link>`: makes me stream the audio from the video `YouTube link` to the voice channel.";
        },

        command: function (message, server, command, channel) {
            var link = command[1], originalLink;

            link = link.replace('<', "").replace('>', "");
            originalLink = link;
            link = url.parse(link);

            if (link.hostname != "youtu.be" && (link.hostname != "www.youtube.com" || link.pathname != "/watch" || link.search.substring(0, 3) != "?v=")) {
                channel.send(message.author.username + ", that is not a YouTube video!").catch(console.error);
                return;
            }

            if (!serverData[server.id].voiceChannel) {
                channel.send(message.author.username + ", I don't currently have a voice channel!").catch(console.error);
                return;
            }

            if (!serverData[server.id].interruptionMode) {
                if (!serverData[server.id].queue || serverData[server.id].queue.length === 0) {
                    serverData[server.id].queue = [originalLink];
                    playYouTube(server, originalLink);
                } else {
                    serverData[server.id].queue.push(originalLink);
                }

                save("queue", server);
            } else {
                playYouTube(server, originalLink);
            }
        }
    }
};
