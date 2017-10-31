/* JavaScript Native Object Additions */
String.prototype.contains = function (string) {
    return this.indexOf(string) > -1;
};

String.prototype.replaceAt = function (index, character) {
    return this.substr(0, index) + character + this.substr(index + 1);
};

String.prototype.detect = function (string) {
    var letters = this.replace(/[^a-zA-Z]/g, "");

    return this == string || this.contains(" " + string) || this.substring(0, string.length + 1) == string + " " || letters.substring(letters.length - string.length - 1, letters.length) == " " + string;
};

Object.defineProperty(Array.prototype, "contains", {
    configurable: true,
    enumerable: false,
    value: function (value) {
        return this.indexOf(value) > -1;
    }
});

Object.defineProperty(Array.prototype, "concatStrict", {
    configurable: true,
    enumerable: false,
    value: function (array) {
        for (var i in array) {
            if (!this.contains(array[i])) {
                this.push(array[i]);
            }
        }

        return this;
    }
});

Object.defineProperty(Array.prototype, "remove", {
    configurable: true,
    enumerable: false,
    value: function (value) {
        return this.splice(this.indexOf(value), 1);
    }
});

Object.defineProperty(Array.prototype, "rand", {
    configurable: true,
    enumerable: false,
    value: function () {
        return this[Math.floor(Math.random() * this.length)];
    }
});

Object.defineProperty(Array.prototype, "shuffle", {
    configurable: true,
    enumerable: false,
    value: function () {
        for (var i = this.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = this[i];
            this[i] = this[j];
            this[j] = temp;
        }

        return this;
    }
});

Object.defineProperty(Date.prototype, "UTC", {
    configurable: true,
    enumerable: false,
    value: function () {
        return this.toUTCString().slice(5);
    }
});

Object.defineProperty(Date.prototype, "local", {
    configurable: true,
    enumerable: false,
    value: function () {
        return this.toUTCString().slice(5, -4);
    }
});

Object.defineProperty(Object.prototype, "isEmpty", {
    configurable: true,
    enumerable: false,
    value: function () {
        return Object.keys(this).length === 0 && this.constructor === Object;
    }
});

module.exports = {
    define: function () {
        /* Node Utilities */
        global.fs = require("fs");
        
        global.os = require("os");
        
        global.request = require("request");
        
        global.dns = require("dns");
        
        global.path = require("path");
        
        global.timers = require("timers");
        
        global.ytdl = require("ytdl-core");
        
        global.url = require("url");
        
        /* Constants */
        global.WEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5/weather?q=";
        
        global.CURRENCY_BASE_URL = "http://free.currencyconverterapi.com/api/v3/convert?q=";
        
        global.CURRENCIES_BASE_URL = "http://free.currencyconverterapi.com/api/v3/currencies";
        
        global.GOOGLE_BASE_URL = "https://www.googleapis.com/youtube/v3/videos?id=";
        
        global.MAPS_BASE_URL = "https://www.google.com/maps?q=";

        global.GOOGLE_SUGGESTS_BASE_URL = "https://suggestqueries.google.com/complete/search?json&client=firefox&hl=en&q=";

        global.DEFAULT_COOLDOWN = 15;
        
        global.MAX_SCORE = 9999999990;

        global.CATEGORIES = ["Easy", "Normal", "Hard", "Lunatic", "Extra"];

        global.TOUHOU_SHMUPS = ["SoEW", "PoDD", "LLS", "MS", "EoSD", "PCB", "IN", "MoF", "SA", "UFO", "GFW", "TD", "DDC", "LoLK", "HSiFS"];
        
        global.TOUHOU_CHARS = ["Reimu Hakurei", "Marisa Kirisame", "ShinGyoku", "YuugenMagan", "Elis", "Sariel", "Mima", "Kikuri", "Konngara",
        "Genjii", "Rika", "Noroiko", "Meira", "Two Red Dots", "Five Magic Stones", "Matenshi", "Ellen", "Kotohime", "Kana Anaberal",
        "Rikako Asakura", "Chiyuri Kitashirakawa", "Yumemi Okazaki", "Sokrates", "Ruukoto", "Multi", "Mimi-Chan", "Bewitching Lotus Flower",
        "Orange", "Kurumi", "Dark Mirror", "Elly", "Rengeteki", "PC-98 Yuuka", "Mysterious Orb", "Mugetsu", "Gengetsu", "Wheel Demon",
        "Sara", "Spirit Mirror", "Louise", "PC-98 Alice", "Yuki", "Mai", "Ayana", "Yumeko", "Shinki", "Trump King", "Rumia", "Daiyousei",
        "Cirno", "Hong Meiling", "Koakuma", "Patchouli Knowledge", "Sakuya Izayoi", "Remilia Scarlet", "Flandre Scarlet", "Rin Satsuki",
        "Letty Whiterock", "Chen", "Alice Margatroid", "Shanghai Doll", "Hourai Doll", "Lily White", "Lyrica Prismriver", "Lunasa Prismriver",
        "Merlin Prismriver", "Youmu Konpaku", "Yuyuko Saigyouji", "Ran Yakumo", "Yukari Yakumo", "Layla Prismriver", "Youki Konpaku",
        "Suika Ibuki", "Wriggle Nightbug", "Mystia Lorelei", "Keine Kamishirasawa", "Tewi Inaba", "Reisen Udongein Inaba", "Eirin Yagokoro",
        "Kaguya Houraisan", "Fujiwara no Mokou", "Aya Shameimaru", "Medicine Melancholy", "Yuuka Kazami", "Komachi Onozuka",
        "Eiki Shiki, Yamaxanadu", "Shizuha Aki", "Minoriko Aki", "Hina Kagiyama", "Nitori Kawashiro", "Momiji Inubashiri", "Sanae Kochiya",
        "Kanako Yasaka", "Suwako Moriya", "Iku Nagae", "Tenshi Hinanawi", "Kisume", "Yamame Kurodani", "Parsee Mizuhashi", "Yuugi Hoshiguma",
        "Satori Komeiji", "Rin Kaenbyou", "Utsuho Reiuji", "Koishi Komeiji", "Nazrin", "Kogasa Tatara", "Ichirin Kumoi", "Unzan",
        "Minamitsu Murasa", "Shou Toramaru", "Byakuren Hijiri", "Nue Houjuu", "Myouren Hijiri", "Goliath Doll", "Giant Catfish", "Hisoutensoku",
        "Hatate Himekaidou", "Kyouko Kasodani", "Yoshika Miyako", "Seiga Kaku", "Soga no Tojiko", "Mononobe no Futo", "Toyosatomimi no Miko",
        "Mamizou Futatsuiwa", "Hata no Kokoro", "Wakasagihime", "Sekibanki", "Kagerou Imaizumi", "Benben Tsukumo", "Yatsuhashi Tsukumo",
        "Seija Kijin", "Shinmyoumaru Sukuna", "Raiko Horikawa", "Sumireko Usami", "Seiran", "Ringo", "Doremy Sweet", "Sagume Kishin",
        "Clownpiece", "Junko", "Hecatia Lapislazuli", "Rinnosuke Morichika", "Tokiko", "Marisa's unnamed father", "Luna Child", "Star Sapphire",
        "Sunny Milk", "Tsuchinoko", "Sake Bug", "Unnamed bake-danuki", "Rei'sen", "Gateguards of the Lunar Capital", "Watatsuki no Toyohime",
        "Watatsuki no Yorihime", "Chang'e", "Lord Tsukuyomi", "Mizue no Uranoshimako", "Iwakasa", "Konohana-Sakuyahime", "Iwanagahime",
        "Kasen Ibaraki", "Unnamed dragon", "Unnamed dapeng", "Shirou Sendai", "Unnamed kuda-gitsune", "Kume", "Kanda", "Unnamed okuri-inu",
        "Unshou", "Kosuzu Motoori", "Kosuzu's Grampa", "Tupai", "Evil Dragon", "Giant Toad", "Daitengu", "Dragon", "Maribel Hearn",
        "Renko Usami", "Hieda no Akyuu", "Etarnity Larva", "Nemuno Sakata", "Lily White", "Aunn Komano", "Narumi Yatadera", "Satono Nishida",
        "Mai Teireida", "Okina Matara", "the unnamed girl on the Dolls in Pseudo Paradise jacket"];
        
        global.FANMEME_CHARS = ["Marry Shepherd", "Corin Charite", "Phiased Pescar", "Mumumu Mikaboshi", "Janet Arc'Angelo", "Michel Sant'Angelo",
        "Iesua Nazarenus", "Elfin Mint", "Zankurou", "Kodama", "Aragami no Kusuko", "Momo Tobikura", "Saraka Sant'Angelo", "Tenmu Suitokuin",
        "An Yaezaki", "Mitama Magahara", "Riko Toone", "Hatsuna Magatsuji", "Ruri", "Suitenguu no Himemiko", "Nomi no Hanie", "Takenouchi no Tarumi",
        "Nameless R'lyeh Fairy", "Yamatoyo no Momohime", "Yamata no Yato", "Abe no Kiyohime", "Fabritis", "Iphonea", "Tobiko Takatou", "Shelia Lyrac",
        "Ichiyou Mochizuki", "Nezu Akitsu", "Fuma Mishandra", "Sengo Sanada", "Tamako Sant'Angelo", "Ami", "Rakuki Momosame", "Seiryuu Sya",
        "Kage Mimeima", "Rakukun Momosame", "Tensei Muriya", "Rika Kirigakure", "Konoha Susanomori", "Naruko Uzushima", "Miyo Amazu",
        "Tsubame Minazuki", "Kasumi Shindou", "Megumi Yaobi", "Mikoto Yaobi", "Otohime Kanpukugu", "Nix", "Sachiko Kobayashi"];
        
        global.LENEN_CHARS = ["Yabusame Houlen", "Tsubakura Enraku", "Kurohebi", "Aoji Shitodo", "Tsurubami Senri (disguised as Tsubakura Enraku)",
        "Hooaka Shitodo", "Kuroji Shitodo", "Wilhelm von Clausewitz Halcyon HISUIMARU", "Tsurubami Senri", "Jun Amanomiya", "Shou Amanomori",
        "Lumen Celeritas", "Hibaru Kokutenshi", "Sukune Katano", "Adagumo no Yaorochi", "Adagumo no Saragimaru", "Jinbei", "Sese Kitsugai",
        "Tsugumi Umatachi", "Fujiwara no Iyozane", "Taira no Fumikado", "Shion", "Tenkai Zuifeng", "Fumikado's grandfather", "Souko Shirami",
        "Mitsumo", "Terumi", "Medias Moritake", "Kujiru Kesa", "Kunimitsu Ooya", "Kaisen Azuma", "Kaoru Kashiwagi", "Garaiya Ogata",
        "Fujiwara no Shirogane no Sanra", "Para", "Ooama no Ake no Mitori", "Taira no Chouki", "Suzumi Kuzu", "Xeno a", "Haiji Senri",
        "Yago Ametsukana", "Suzumi Kuzu (disguised as Tsurubami Senri)", "Tsubakura's mother"];
        
        global.ANSWERS = ["It is certain.", "Without a doubt.", "It is decidedly so.", "Yes, definitely.", "You may rely on it.",
        "As I see it, yes.", "Most likely.", "Outlook good.", "Yes.", "Signs point to yes.", "Don't count on it.", "My reply is no.",
        "My sources say no.", "Outlook not so good.", "Very doubtful."];
        
        global.CHOICE = ["%o imo.", "%o tbh.", "I choose %o.", "%o!", "I say %o.", "I'd pick %o if I were you.", "%o is the best option.", "Why not %o?"];
        
        global.SERVER_DATA_DEFAULTS = {
            "aliasesList": {}, "quotes": {}, "waifus": {}, "touhouWaifus": {}, "fanmemeWaifus": {}, "lenenWaifus": {}, "waifusExceptions": {},
            "touhouWaifusExceptions": {}, "ratings": {}, "badOpinions": [], "goodOpinions": [], "opinionExceptions": []
        };
        
        global.SERVER_SPECIFICS = {
            "botChannels": [],
            "factions": {},
            "lewdAccessRole": undefined,
            "hsifsAccessRole": undefined,
            "logChannel": undefined,
            "mainChannel": undefined,
            "voiceChannel": undefined,
            "entryMessage": "Greetings, %u!",
            "leaveMessage": "Bye, %u!",
            "logoutMessage": "Logging out.",
            "defaultReason": "Unknown.",
            "isTestingServer": false,
            "kekDetection": false,
            "cooldownSecs": DEFAULT_COOLDOWN,
            "date": ""
        };

        /* Variables */
        global.permData = {
            "servers": {}, "WRs": {}, "LNNs": {}, "currencies": {}, "images": {}, "musicLocal": {}, "musicYouTube": {}, "notifyQueue": [], "commandSymbols": ["!"],
            "token": "", "botMaster": "", "WRsLastUpdated": "", "weatherKey": "", "googleKey": "", "maxLength": 200, "maintenanceMode": false
        };
        
        global.serverData = {};

        global.enabled = false;

        global.cooldown = false;

        global.musicBlocked = false;

        global.currencyUpdate = true;
        
        global.maxArgc = 7;

        /* Functions */
        global.debugPrint = function (variable, value) {
            console.log(timeStamp() + variable + ": '" + value + "'");
        };
        
        global.getArgc = function (commandFunction) {
            var string = commandFunction.toString(), result = 0;
            
            for (i = 1; i < maxArgc; i++) {
                if (string.contains("command[" + i + "]")) {
                    result += 1;
                }
            }
            
            return result;
        };
        
        global.isServerOnly = function (commandFunction) {
            var string = commandFunction.toString();
            
            return (string.contains("server.") || string.contains("playYouTube")) && string.indexOf("server.") != string.indexOf("server.id].cooldownSecs");
        }
        
        global.strip = function (string) {
            return string.replace(/<\/?[^>]*>/g, "");
        };

        global.sep = function (num) {
            if (isNaN(num)) {
                return '-';
            }
            
            num = num.toString();
            
            if (num.contains('.')) {
                var array = num.toString().split('.');
            
                return array[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + array[1];
            }
            
            return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        };

        global.time = function (milliseconds) {
            var result = "", hours = 0, minutes = 0, seconds = 0;

            if (milliseconds >= 3600000) {
                while (milliseconds >= 3600000) {
                    milliseconds -= 3600000;
                    hours += 1;
                }
                
                result += hours + " hour" + (hours != 1 ? 's' : "") + ", ";
            }
            
            if (milliseconds >= 60000) {
                while (milliseconds >= 60000) {
                    milliseconds -= 60000;
                    minutes += 1;
                }
                
                result += minutes + " minute" + (minutes != 1 ? 's' : "") + ", ";
            }
            
            if (milliseconds >= 1000) {
                while (milliseconds >= 1000) {
                    milliseconds -= 1000;
                    seconds += 1;
                }
                
                result += seconds + " second" + (seconds != 1 ? 's' : "") + " and ";
            }
            
            result += milliseconds + " millisecond" + (milliseconds != 1 ? 's' : "");
            
            return result;
        };

        global.yearsMonths = function (days) {
            var result = "", years = 0, months = 0;
            
            if (days >= 365) {
                while (days >= 365) {
                    days -= 365;
                    years += 1;
                }
                
                result += years + " year" + (years != 1 ? 's' : "") + "";
            }
            
            if (days === 0) {
                return result;
            }
            
            if (days >= 30) {
                while (days >= 30) {
                    days -= 30;
                    months += 1;
                }
                
                result += " and " + months + " month" + (months != 1 ? 's' : "");
            }
            
            if (days === 0) {
                return result;
            }
            
            result = result.replace(" and", ',');
            
            result += " and " + days + " day" + (days != 1 ? 's' : "");
            
            return result;
        };

        global.daysInMonth = function (date2_UTC) {
            var monthStart = new Date(date2_UTC.getFullYear(), date2_UTC.getMonth(), 1);
            var monthEnd = new Date(date2_UTC.getFullYear(), date2_UTC.getMonth() + 1, 1);
            var monthLength = (monthEnd - monthStart) / (1000 * 60 * 60 * 24);
            return monthLength;
        };

        global.getAge = function (date_1, date_2) {
            var date2_UTC = new Date(Date.UTC(date_2.getUTCFullYear(), date_2.getUTCMonth(), date_2.getUTCDate()));
            var date1_UTC = new Date(Date.UTC(date_1.getUTCFullYear(), date_1.getUTCMonth(), date_1.getUTCDate()));

            var yAppendix, mAppendix, dAppendix;

            var days = date2_UTC.getDate() - date1_UTC.getDate();
            
            if (days < 0) {
                date2_UTC.setMonth(date2_UTC.getMonth() - 1);
                days += daysInMonth(date2_UTC);
            }
            
            var months = date2_UTC.getMonth() - date1_UTC.getMonth();
            
            if (months < 0) {
                date2_UTC.setFullYear(date2_UTC.getFullYear() - 1);
                months += 12;
            }
            
            var years = date2_UTC.getFullYear() - date1_UTC.getFullYear();

            yAppendix = (years != 1 ? " years" : " year");
            mAppendix = (months != 1 ? " months" : " month");
            dAppendix = (days != 1 ? " days" : " day");
            
            var result = (years !== 0 ? years + yAppendix : "") + (years !== 0 && months !== 0 && days !== 0 ? ", " : "") + (years !== 0 && months !== 0 && days === 0 ? " and " : "") + (months !== 0 ? months + mAppendix : "");
            
            result += ((years !== 0 || months !== 0) && days !== 0 ? " and " : "") + (days !== 0 ? days + dAppendix : "");

            return result;
        };

        global.degreesToDirection = function (degrees) {
            if (degrees >= 348.75 || degrees < 11.25) {
                return "N";
            }
            if (degrees >= 11.25 && degrees < 33.75) {
                return "NNE";
            }
            if (degrees >= 33.75 && degrees < 56.25) {
                return "NE";
            }
            if (degrees >= 56.25 && degrees < 78.75) {
                return "ENE";
            }
            if (degrees >= 78.75 && degrees < 101.25) {
                return "E";
            }
            if (degrees >= 101.25 && degrees < 123.75) {
                return "ESE";
            }
            if (degrees >= 123.75 && degrees < 146.25) {
                return "SE";
            }
            if (degrees >= 146.25 && degrees < 168.75) {
                return "SSE";
            }
            if (degrees >= 168.75 && degrees < 191.25) {
                return "S";
            }
            if (degrees >= 191.25 && degrees < 213.75) {
                return "SSW";
            }
            if (degrees >= 213.75 && degrees < 236.25) {
                return "SW";
            }
            if (degrees >= 236.25 && degrees < 258.75) {
                return "WSW";
            }
            if (degrees >= 258.75 && degrees < 281.25) {
                return "W";
            }
            if (degrees >= 281.25 && degrees < 303.75) {
                return "WNW";
            }
            if (degrees >= 303.75 && degrees < 326.25) {
                return "NW";
            }
            if (degrees >= 326.25 && degrees < 348.75) {
                return "NNW";
            }
        };

        global.similarity = function (a, b) {
            var m = a.length, n = b.length, C = [], i, j;
                
            for (i = 0; i <= m; i++) {
                C.push([0]);
            }
            
            for (j = 0; j < n; j++) {
                C[0].push(0);
            }
            
            for (i = 0; i < m; i++) {
                for (j = 0; j < n; j++) {
                    C[i + 1][j + 1] = a[i] === b[j] ? C[i][j] + 1 : Math.max(C[i + 1][j], C[i][j + 1]);
                }
            }
            
            return (function bt(i, j) {
                if (i * j === 0) {
                    return "";
                }
                
                if (a[i - 1] === b[j - 1]) {
                    return bt(i - 1, j - 1) + a[i - 1];
                }
                
                return (C[i][j - 1] > C[i - 1][j]) ? bt(i, j - 1) : bt(i - 1, j);
            }(m, n)).length;
        };

        global.RNG = function (max) {
            return Math.floor(Math.random() * max);
        };

        global.rangedRNG = function (min, max) {
            return Math.floor(Math.random() * ((max - 1) - min + 1) + min);
        };

        global.save = function (object, server) {
            var data = (server ? serverData[server.id][object] : permData[object]);
            
            fs.writeFileSync("./data/" + (server ? server.id + "/" : "") + object + ".txt", JSON.stringify(data));
        };

        global.cap = function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        };

        global.camel = function (string) {
            var temp;
            
            var strings = string.split(' ');
            
            for (var i in strings) {
                strings[i] = cap(strings[i]);
            }
            
            return strings.join(' ');
        };

        global.removeSpaces = function (string) {
            return string.replace(/ /g, "");
        };

        global.isNumber = function (string) {
            var digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], i;
            
            for (i = 0; i < string.length; i++) {
                if (!digits.contains(string.charAt(i))) {
                    return false;
                }
            }
            
            return true;
        };

        global.channelType = function (message) {
            return message.channel.constructor.toString().slice(9).split("(")[0];
        };

        global.caretReplace = function (expression) {
            if (expression.contains('^')) {
                var tab = [];
                
                var joker = "___joker___";
                
                while (expression.contains('(')) {
                    expression = expression.replace(/(\([^\(\)]*\))/g, function(m, t) {
                        tab.push(t);
                        return (joker + (tab.length - 1));
                    });
                }

                tab.push(expression);
                
                expression = joker + (tab.length - 1);
                
                while (expression.contains(joker)) {
                    expression = expression.replace(new RegExp(joker + "(\\d+)", "g"), function(m, d) {
                        return tab[d].replace(/(\w*)\^(\w*)/g, "Math.pow($1,$2)");
                    });
                }
            }
            
            return expression;
        };

        global.replaceIfNotPrecededBy = function (notPrecededBy, replacement) {
            return function (match) {
                return match.slice(0, notPrecededBy.length) === notPrecededBy ? match : replacement;
            }
        };

        global.isCommand = function (command) {
            for (var commandType in allCommands) {
                if (allCommands[commandType].hasOwnProperty(command.toLowerCase())) {
                    return true;
                }
            }
            
            return false;
        };

        global.dateCheck = function (server) {
            var date = new Date();
            
            permData.servers[server.id].date = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            save("servers");
        };

        global.toUsers = function (members) {
            var users = {};
            
            members = members.array();
            
            for (var i = 0; i < members.length; i++) {
                users[members[i].user.username.toLowerCase()] = members[i].user;
            }
            
            return users;
        };
        
        global.formatType = function (type) {
            return ({
                "Windows_NT": "Windows",
                "Darwin": "Mac",
                "Linux": "Linux"
            }[type]);
        };

        global.regionFlag = function (region) {
            return ({
                "us-west": "us",
                "us-central": "us",
                "us-east": "us",
                "us-south": "us",
                "eu-west": "eu",
                "eu-central": "eu",
                "brazil": "br",
                "sydney": "au",
                "singapore": "sg",
                "amsterdam": "nl",
                "hongkong": "hk",
                "russia": "ru"
            })[region];
        };
        
        global.formatRegion = function (region) {
            return ({
                "us-west": "US West",
                "us-central": "US Central",
                "us-east": "US East",
                "us-south": "US South",
                "eu-west": "EU West",
                "eu-central": "EU Central",
                "brazil": "Brazil",
                "sydney": "Sydney",
                "singapore": "Singapore",
                "amsterdam": "Amsterdam",
                "hongkong": "Hong Kong",
                "russia": "Russia"
            })[region];
        }

        global.gameName = function (game) {
            return ({
                "hrtp": "HRtP",
                "soew": "SoEW",
                "podd": "PoDD",
                "lls": "LLS",
                "ms": "MS",
                "eosd": "EoSD",
                "pcb": "PCB",
                "in": "IN",
                "pofv": "PoFV",
                "mof": "MoF",
                "sa": "SA",
                "ufo": "UFO",
                "gfw": "GFW",
                "td": "TD",
                "ddc": "DDC",
                "lolk": "LoLK",
                "hsifs": "HSiFS"
            })[game];
        };

        global.shotName = function (shot) {
            var shotNames = {
                "Reimua": "ReimuA",
                "Reimub": "ReimuB",
                "Reimuc": "ReimuC",
                "Marisaa": "MarisaA",
                "Marisab": "MarisaB",
                "Marisac": "MarisaC",
                "Sakuyaa": "SakuyaA",
                "Sakuyab": "SakuyaB",
                "Sanaea": "SanaeA",
                "Sanaeb": "SanaeB",
                "Reimuspring": "ReimuSpring",
                "Reimusummer": "ReimuSummer",
                "Reimuautumn": "ReimuAutumn",
                "Reimuwinter": "ReimuWinter",
                "Cirnospring": "CirnoSpring",
                "Cirnosummer": "CirnoSummer",
                "Cirnoautumn": "CirnoAutumn",
                "Cirnowinter": "CirnoWinter",
                "Ayaspring": "AyaSpring",
                "Ayasummer": "AyaSummer",
                "Ayaautumn": "AyaAutumn",
                "Ayawinter": "AyaWinter",
                "Marisaspring": "MarisaSpring",
                "Marisasummer": "MarisaSummer",
                "Marisaautumn": "MarisaAutumn",
                "Marisawinter": "MarisaWinter",
            };
            
            return (shotNames.hasOwnProperty(shot) ? shotNames[shot] : shot);
        };
        
        global.weatherEmoji = function (weather) {
            if (weather == "clear sky") {
                return ":sunny: ";
            } else if (weather.contains("snow") || weather.contains("hail") || weather.contains("sleet")) {
                return ":cloud_snow: ";
            } else if (weather.contains("thunder")) {
                return ":thunder_cloud_rain: ";
            } else if (weather.contains("rain") || weather.contains("shower") || weather.contains("drizzle")) {
                return ":cloud_rain: ";
            } else if (weather == "few clouds") {
                return ":partly_sunny: ";
            } else {
                return ":cloud: ";
            }
        };

        global.numericSort = function (a, b) {
            return b - a;
        };

        global.weatherUrl = function (place) {
            return WEATHER_BASE_URL + place + "&APPID=" + permData.weatherKey;
        };
        
        global.currencyUrl = function (currency1, currency2) {
            return CURRENCY_BASE_URL + currency1 + "_" + currency2 + "&compact=ultra";
        };
        
        global.googleUrl = function (vid) {
            return GOOGLE_BASE_URL + vid + "&key=" + permData.googleKey + "&part=snippet,statistics";
        };
        
        global.mapsUrl = function (city, countryCode) {
            return MAPS_BASE_URL + city.replace(/ /g, '+') + ",+" + countryCode;
        }
        
        global.generateCurrencies = function () {
            request(CURRENCIES_BASE_URL, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var result = JSON.parse(body);
                    
                    permData.currencies = result.results;
                    save("currencies");
                    console.log(timeStamp() + "Updated exchange rates.");
                }
            });
        };

        global.findQueueItem = function (game, category, shot) {
            var queue = permData.notifyQueue;
            
            for (var i in queue) {
                if (queue[i][3] == game && queue[i][4] == category && queue[i][5] == shot) {
                    return queue[i];
                }
            }
            
            return null;
        };

        global.hasModRole = function (roles) {
            for (var i in roles) {
                if (roles[i].hasPermission("BAN_MEMBERS")) {
                    return true;
                }
            }
            
            return false;
        };

        global.spaces = function (number) {
            var spaces = "", index = 0;
            
            while (index < number) {
                spaces += " ";
                index++;
            }
            
            return spaces;
        };
        
        global.playLocal = function (server, music, volume) {
            if (!music) {
                return;
            }
            
            music = "./music/" + music;
            
            const streamOptions = {seek: 0, volume: (volume ? volume : 1)};
            
            var voiceChannel = server.channels.get(permData.servers[server.id].voiceChannel);
            
            try {
                voiceChannel.join().then(connection => {
                    if (fs.existsSync(music)) {
                        const dispatcher = connection.playFile(music, streamOptions);
                        
                        dispatcher.on("end", reason => {
                            console.log(timeStamp() + "Dispatcher ended. Reason: " + reason);
                        });
                        
                        dispatcher.on("error", err => {
                            channel.send(err).catch(console.error);
                        });
                    } else {
                        console.log(timeStamp() + "Music file '" + music + "' not found.");
                    }
                }).catch(console.error);
            } catch (err) {
                channel.send(err);
            }
        };
        
        global.playYouTube = function (server, music, volume) {
            if (!music) {
                return;
            }
            
            const streamOptions = {seek: 0, volume: (volume ? volume : 1)};
            
            var voiceChannel = server.channels.get(permData.servers[server.id].voiceChannel);
            
            try {
                voiceChannel.join().then(connection => {
                    const stream = ytdl(music, {filter: "audioonly"});
                    
                    const dispatcher = connection.playStream(stream, streamOptions);
                    
                    dispatcher.on("end", reason => {
                        console.log(timeStamp() + "Dispatcher ended. Reason: " + reason);
                    });
                    
                    dispatcher.on("error", err => {
                        channel.send(err).catch(console.error);
                    });
                }).catch(console.error);
            } catch (err) {
                channel.send(err);
            }
        };
        
        global.countLNNs = function (game) {
            var players = [], LNNs = permData.LNNs[game], stage, shottype, player;
            
            for (shottype in LNNs) {
                if (LNNs[shottype].length === 0) {
                    continue;
                }
                
                for (player in LNNs[shottype]) {
                    if (!players.contains(LNNs[shottype][player])) {
                        players.push(LNNs[shottype][player]);
                    }
                }
            }
            
            return players.length;
        };
    }
};