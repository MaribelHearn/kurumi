module.exports = {
    help: {
        help: function (command, symbol) {
            return "`" + symbol + command + " [command]`: explains how to use `command` and what it does. If `command` is not specified, runs `" + symbol + "commands` instead.";
        },

        command: function (message, server, command, channel) {
            var commandName = command[1], symbol = message.content.charAt(0), images = permData.images, musicLocal = permData.musicLocal;

            if (!commandName) {
                allCommands.help.commands.command(message, server, command, channel);
                return;
            }

            for (var commandType in allCommands) {
                if (allCommands[commandType][commandName]) {
                    var help = allCommands[commandType][commandName].help(commandName, symbol);

                    if (commandType == "mod") {
                        help += " Mod-only.";
                    }

                    if (commandType == "master") {
                        help += " Master-only.";
                    }

                    channel.send(help);
                    return;
                }
            }

            if (images.hasOwnProperty(commandName)) {
                channel.send("`" + symbol + commandName + "`: " + images[commandName].help);
                return;
            }

            if (musicLocal.hasOwnProperty(commandName)) {
                channel.send("`" + symbol + commandName + "`: " + musicLocal[commandName].help);
                return;
            }

            channel.send(message.author.username + ", that command doesn't exist.").catch(console.error);
        }
    },

    commands: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: posts the list of commands, the possible command symbols and the number of commands.";
        },

        command: function (message, server, command, channel) {
            var symbol = message.content.charAt(0), commandType;

            var info = allCommands.help.help.help("help", symbol) + "\n" + allCommands.help.commands.help("commands", symbol) + "\n\n";

            var numberOfCommands = Object.keys(allCommands.help).length;

            var numberOfCustoms = Object.keys(permData.images).length + Object.keys(permData.musicLocal).length;

            for (var commandType in allCommands) {
                if (commandType == "help") {
                    continue;
                }

                info += "`" + symbol + commandType + "`: posts the list of " + commandType + " commands.\n";
                numberOfCommands += Object.keys(allCommands[commandType]).length;
            }

            info += "`" + symbol + "music`: posts the list of music commands.\n" +
            "`" + symbol + "image`: posts the list of image commands.\n\n" +
            "Available command symbols: `" + permData.commandSymbols.join("`, `") + "`\n" +
            "There are currently **" + (numberOfCommands + numberOfCustoms) + "** commands total " +
            "(**" + numberOfCommands + "** built-in, **" + numberOfCustoms + "** custom).\n" +
            "Full list: <https://github.com/MaribelHearn/kurumi/wiki/Commands>";
            channel.send(info).catch(console.error);
        }
    },

    fun: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: posts the list of fun commands.";
        },

        command: function (message, server, command, channel) {
            commandList(message, server, command, channel);
        }
    },


    utility: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: posts the list of utility commands.";
        },

        command: function (message, server, command, channel) {
            commandList(message, server, command, channel);
        }
    },


    mod: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: posts the list of mod commands.";
        },

        command: function (message, server, command, channel) {
            commandList(message, server, command, channel);
        }
    },


    master: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: posts the list of master commands.";
        },

        command: function (message, server, command, channel) {
            commandList(message, server, command, channel);
        }
    },

    music: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: posts the list of music commands.";
        },

        command: function (message, server, command, channel) {
            commandList(message, server, command, channel);
        }
    },

    image: {
        help: function (command, symbol) {
            return "`" + symbol + command + "`: posts the list of image commands.";
        },

        command: function (message, server, command, channel) {
            commandList(message, server, command, channel);
        }
    }
};
