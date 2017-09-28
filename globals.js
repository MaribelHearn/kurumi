module.exports = {
    define: function () {
        /* Node Utilities */
        global.fs = require("fs");
        
        global.request = require("request");
        
        global.dns = require("dns");
        
        global.timers = require("timers");
        
        global.ytdl = require("ytdl-core");
        
        global.url = require("url");
        
        /* Constants */
        global.COMMAND_SYMBOLS = ['!'];

        global.ARGUMENT_DELIMITER = '^';

        global.ARGUMENT_LIMIT = 200;

        global.WEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5/weather?q=";
        
        global.CURRENCY_BASE_URL = "http://free.currencyconverterapi.com/api/v3/convert?q=";
        
        global.CURRENCIES_BASE_URL = "http://free.currencyconverterapi.com/api/v3/currencies";

        global.GOOGLE_SUGGESTS_BASE_URL = "https://suggestqueries.google.com/complete/search?json&client=firefox&hl=en&q=";

        global.DEFAULT_COOLDOWN = 15;
        
        global.MAX_SCORE = 9999999990;

        global.CATEGORIES = ["Easy", "Normal", "Hard", "Lunatic", "Extra"];

        global.TOUHOU_SHMUPS = ["SoEW", "PoDD", "LLS", "MS", "EoSD", "PCB", "IN", "MoF", "SA", "UFO", "GFW", "TD", "DDC", "LoLK", "HSiFS"];
        
        global.TOUHOU_CHARS = ["Reimu Hakurei", "Marisa Kirisame", "ShinGyoku", "YuugenMagan", "Elis", "Sariel", "Mima", "Kikuri", "Konngara", "Genjii", "Rika", "Noroiko", "Meira", "Two Red Dots", "Five Magic Stones", "Matenshi",
        "Ellen", "Kotohime", "Kana Anaberal", "Rikako Asakura", "Chiyuri Kitashirakawa", "Yumemi Okazaki", "Sokrates", "Ruukoto", "Multi", "Mimi-Chan", "Bewitching Lotus Flower", "Orange", "Kurumi", "Dark Mirror", "Elly",
        "Rengeteki", "PC-98 Yuuka", "Mysterious Orb", "Mugetsu", "Gengetsu", "Wheel Demon", "Sara", "Spirit Mirror", "Louise", "PC-98 Alice", "Yuki", "Mai", "Ayana", "Yumeko", "Shinki", "Trump King", "Rumia", "Daiyousei", "Cirno", "Hong Meiling",
        "Koakuma", "Patchouli Knowledge", "Sakuya Izayoi", "Remilia Scarlet", "Flandre Scarlet", "Rin Satsuki", "Letty Whiterock", "Chen", "Alice Margatroid", "Shanghai Doll", "Hourai Doll", "Lily White", "Lyrica Prismriver",
        "Lunasa Prismriver", "Merlin Prismriver", "Youmu Konpaku", "Yuyuko Saigyouji", "Ran Yakumo", "Yukari Yakumo", "Layla Prismriver", "Youki Konpaku", "Suika Ibuki", "Wriggle Nightbug", "Mystia Lorelei", "Keine Kamishirasawa",
        "Tewi Inaba", "Reisen Udongein Inaba", "Eirin Yagokoro", "Kaguya Houraisan", "Fujiwara no Mokou", "Aya Shameimaru", "Medicine Melancholy", "Yuuka Kazami", "Komachi Onozuka", "Eiki Shiki, Yamaxanadu", "Shizuha Aki",
        "Minoriko Aki", "Hina Kagiyama", "Nitori Kawashiro", "Momiji Inubashiri", "Sanae Kochiya", "Kanako Yasaka", "Suwako Moriya", "Iku Nagae", "Tenshi Hinanawi", "Kisume", "Yamame Kurodani", "Parsee Mizuhashi", "Yuugi Hoshiguma",
        "Satori Komeiji", "Rin Kaenbyou", "Utsuho Reiuji", "Koishi Komeiji", "Nazrin", "Kogasa Tatara", "Ichirin Kumoi", "Unzan", "Minamitsu Murasa", "Shou Toramaru", "Byakuren Hijiri", "Nue Houjuu", "Myouren Hijiri", "Goliath Doll",
        "Giant Catfish", "Hisoutensoku", "Hatate Himekaidou", "Kyouko Kasodani", "Yoshika Miyako", "Seiga Kaku", "Soga no Tojiko", "Mononobe no Futo", "Toyosatomimi no Miko", "Mamizou Futatsuiwa", "Hata no Kokoro", "Wakasagihime",
        "Sekibanki", "Kagerou Imaizumi", "Benben Tsukumo", "Yatsuhashi Tsukumo", "Seija Kijin", "Shinmyoumaru Sukuna", "Raiko Horikawa", "Sumireko Usami", "Seiran", "Ringo", "Doremy Sweet", "Sagume Kishin", "Clownpiece", "Junko",
        "Hecatia Lapislazuli", "Rinnosuke Morichika", "Tokiko", "Marisa's unnamed father", "Luna Child", "Star Sapphire", "Sunny Milk", "Tsuchinoko", "Sake Bug", "Unnamed bake-danuki", "Rei'sen", "Gateguards of the Lunar Capital",
        "Watatsuki no Toyohime", "Watatsuki no Yorihime", "Chang'e", "Lord Tsukuyomi", "Mizue no Uranoshimako", "Iwakasa", "Konohana-Sakuyahime", "Iwanagahime", "Kasen Ibaraki", "Unnamed dragon", "Unnamed dapeng",
        "Shirou Sendai", "Unnamed kuda-gitsune", "Kume", "Kanda", "Unnamed okuri-inu", "Unshou", "Kosuzu Motoori", "Kosuzu's Grampa", "Tupai", "Evil Dragon", "Giant Toad", "Daitengu", "Dragon", "Maribel Hearn", "Renko Usami",
        "Hieda no Akyuu", "Etarnity Larva", "Nemuno Sakata", "Lily White", "Aunn Komano", "Narumi Yatadera", "Satono Nishida", "Mai Teireida", "Okina Matara", "the unnamed girl on the Dolls in Pseudo Paradise jacket"];
        
        global.FANMEME_CHARS = ["Marry Shepherd", "Corin Charite", "Phiased Pescar", "Mumumu Mikaboshi", "Janet Arc'Angelo", "Michel Sant'Angelo", "Iesua Nazarenus", "Elfin Mint", "Zankurou", "Kodama", "Aragami no Kusuko",
        "Momo Tobikura", "Saraka Sant'Angelo", "Tenmu Suitokuin", "An Yaezaki", "Mitama Magahara", "Riko Toone", "Hatsuna Magatsuji", "Ruri", "Suitenguu no Himemiko", "Nomi no Hanie", "Takenouchi no Tarumi",
        "Nameless R'lyeh Fairy", "Yamatoyo no Momohime", "Yamata no Yato", "Abe no Kiyohime", "Fabritis", "Iphonea", "Tobiko Takatou", "Shelia Lyrac", "Ichiyou Mochizuki", "Nezu Akitsu", "Fuma Mishandra", "Sengo Sanada",
        "Tamako Sant'Angelo", "Ami", "Rakuki Momosame", "Seiryuu Sya", "Kage Mimeima", "Rakukun Momosame", "Tensei Muriya", "Rika Kirigakure", "Konoha Susanomori", "Naruko Uzushima", "Miyo Amazu", "Tsubame Minazuki",
        "Kasumi Shindou", "Megumi Yaobi", "Mikoto Yaobi", "Otohime Kanpukugu", "Nix", "Sachiko Kobayashi"];
        
        global.LENEN_CHARS = ["Yabusame Houlen", "Tsubakura Enraku", "Kurohebi", "Aoji Shitodo", "Tsurubami Senri (disguised as Tsubakura Enraku)", "Hooaka Shitodo", "Kuroji Shitodo", "Wilhelm von Clausewitz Halcyon HISUIMARU",
        "Tsurubami Senri", "Jun Amanomiya", "Shou Amanomori", "Lumen Celeritas", "Hibaru Kokutenshi", "Sukune Katano", "Adagumo no Yaorochi", "Adagumo no Saragimaru", "Jinbei", "Sese Kitsugai", "Tsugumi Umatachi",
        "Fujiwara no Iyozane", "Taira no Fumikado", "Shion", "Tenkai Zuifeng", "Fumikado's grandfather", "Souko Shirami", "Mitsumo", "Terumi", "Medias Moritake", "Kujiru Kesa", "Kunimitsu Ooya", "Kaisen Azuma",
        "Kaoru Kashiwagi", "Garaiya Ogata", "Fujiwara no Shirogane no Sanra", "Para", "Ooama no Ake no Mitori", "Taira no Chouki", "Suzumi Kuzu", "Xeno a", "Haiji Senri", "Yago Ametsukana",
        "Suzumi Kuzu (disguised as Tsurubami Senri)", "Tsubakura's mother"];

        global.OPINIONS_BAD = ["You aren't really so cool!", "Your PB in " + TOUHOU_SHMUPS.rand() + " is a whole lot lower than mine, which is stronger than the so called 'World Record'!", "You're secretly a Kappatalist!",
        "Not ZIG, but still cool!", "You're a worthless meme!", "Your scores are shit! Shiiiiit!", "Should go straight to the Kurulag!",
        "You're like Beavis! You're never gonna score and someday the grim reaper will show you that it is part of your gravestone that you never scored!",
        "You're a valuable part of the Kuruminist revolution but haven't scored enough to access dank glasses-artillery yet!", "You're a Kappa and I'm the direct opposite! I don't know what to think of you!",
        "KURUMINISTS OF THE WORLD SHOULD UNITE AND STRIKE AGAINST YOU!", "Score more, score more, score a bit faster!", "You're a secondary tbh.", "You should become a proud Kuruminist!",
        "You're the kind of person who would die to even Mysterious Snake Show!", "My opinion of you is that I have none and I don't know if I'll form one! You simply should be a person people have opinions about!",
        "Your plays are hard to understand!", "You're not good but maybe you can be someday!", "I don't think you know the answer to the question whether there's buses in Gensokyo!", "I bet you didn't even get rank 4 in StellaVanity!",
        "You ask me for an opinion, but really I don't know what to say if I can't talk about Deathsmiles with you!", "Your easy plays are infamous for wrong reasons!",
        "Ever played CAVE shmups?! They're quite fun too! I have a whole list of shmups I could recommend you!", "You're never gonna score! It's just not gonna happen!", "Your waifu is very lame!"];

        global.OPINIONS_GOOD = ["You're doing a good job to save the world from Kappatalism!",  "Not ZIG, but still cool!", "You're a superplayer!", "I heard you improved your score so good job!",
        "You're part of the dankest scorers ever, well, maybe someday!", "I think you can become a true wrestler!", "10/10 imo.", "You're truly the kinda meme Kappatalists thought they controlled but I'd seize for fun!"];
        
        global.ANSWERS = ["It is certain.", "Without a doubt.", "It is decidedly so.", "Yes, definitely.", "You may rely on it.","As I see it, yes.", "Most likely.",
        "Outlook good.", "Yes.", "Signs point to yes.", "Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Very doubtful."];
        
        global.CHOICE = ["%o imo.", "%o tbh.", "I choose %o.", "%o!", "I say %o.", "I'd pick %o if I were you.", "%o is the best option.", "Why not %o?"];

        global.SHMUP_QUOTES = {
            "Cirno (EoSD)": ["I'll cryo-freeze you together with some English beef!"],
            "Marisa (EoSD)": ["The saint was crucified."],
            "Marisa (IN)": ["Bitch, get out of the way!", "Move and I'll shoot!"],
            "Mokou (IN)": ["My god, jelly donuts are so scary."],
            "Sanae (SA)": ["You can't let yourself be held back by common sense in Gensokyo, right!?"],
            "Reimu (UFO)": ["Just fall out of the sky, you stupid umbrella youkai."],
            "Donpachi": ["Why don't you try hard?", "VIOLATORS WILL BE PROSECUTEDT TO THE FULL EXTENT OF THE JAM.",
                "WARNING: THIS IS NOT SIMILATION. GET READY TO DESTOROY THE ENEMY. TARGET FOR THE WEAK POINTS OF F**KIN' MACHINE. DO YOUR BEST YOU HAVE EVER DONE."],
            "Dodonpachi": ["Dododododododo... Dodonpachi!", "Select your battle fighter!"],
            "Dodonpachi Daioujou": ["Watch out! Watch out!"],
            "Dodonpachi Daifukkatsu": ["«Are you ready for the storm of tears and sweat?» ❒ With great humility and gratitude, sir. ❒ Yeah, how about no?", "Just a couple more shots DESU"],
            "Operator (Dodonpachi Saidaioujou)": ["Good ruck!", "Hyper System: Ready!"],
            "Inbachi": ["Shinu ga yoi."],
            "Ketsui": ["Approach your target and attack! Your mission starts now! Are you ready?", "WELCOME TO SPECIAL ROUND"],
            "Reco (Futari)": ["PARUMUUUUUUUUUUUUUUUUUUUUU!!"],
            "Big Burn's Robot": ["BOMBAAAAA!!"],
            "Crimzon Clover": ["Shooting Game never die."],
            "Ikaruga": ["I will not die until I achieve something.", "1 CHAIN. 1 CHAIN. 1 CHAIN. 1 CHAIN. 1 CHAIN. 1 CHAIN.", "MAX CHAIN MAX CHAIN MAX CHAIN MAX CHA--1 CHAIN"],
            "TouHUN Project": ["I know the touhou", "XD. do you even know the story behind all these characters. the japanese and chinese legends and folk tales." +
                "Do you even know what danmaku represents what is the meaning of it. its not an obstacle it delivers the users feelings and emotions you should not simply dodge it you should read it like a poem."],
            "Heartfelt Ibuki": ["IMHO, Rainbow Windchime was the hardest spell card in EoSD"],
            "TvTropes": ["What, no Flandre? Forbidden Barrage: 'Counter Clock' (aka 'Clock That Ticks Away The Past') sends waves of bullets your way while making you dodge huge spinning flamethrowers. " +
                "If you focus, you'll be unable to outrun the flamethrowers, and if you don't focus, you'll run right into the bullets. Although there are safe spots that the flamethrowers don't touch," +
                " they're hard to stay in and dodge the bullets at the same time."],
            "Hong Meiling of the Red Guards": ["Maidens of the Telescope"]
        };
        
        global.SERVER_DATA_DEFAULTS = {
            "aliasesList": {}, "quotes": {}, "waifus": {}, "touhouWaifus": {}, "fanmemeWaifus": {}, "lenenWaifus": {}, "waifusExceptions": {},
            "touhouWaifusExceptions": {}, "opinionExceptions": [], "ratings": {}, "cooldownSecs": 15, "kekDetection": false, "date": ""
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
            "isTestingServer": false
        };

        /* Variables */
        global.permData = {
            "servers": {}, "WRs": {}, "LNNs": {}, "currencies": {}, "images": {}, "musicLocal": {}, "musicYouTube": {},
            "notifyQueue": [], "token": "", "botMaster": "", "WRsLastUpdated": "", "weatherKey": "", "youtubeKey": ""
        };
        
        global.serverData = {};

        global.enabled = false;

        global.cooldown = false;

        global.musicBlocked = false;

        global.currencyUpdate = true;

        /* Functions */
        global.strip = function (string) {
            return string.replace(/<\/?[^>]*>/g, "");
        };

        global.sep = function (num) {
            if (isNaN(num)) {
                return '-';
            }
            
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        };

        global.correctDateNotation = function (date) {
            var tmp, time, year, month, day;
            
            tmp = date.split('T')[0].split('-');
            
            time = date.split('T')[1].replace(".000Z", "");
            
            year = tmp[0];
            
            month = tmp[1];
            
            day = tmp[2];
            
            if (day.charAt(0) == '0') {
                day = day.slice(1);
            }
            
            if (month.charAt(0) == '0') {
                month = month.slice(1);
            }
            
            return day + '-' + month + '-' + year + ", " + time + (time.indexOf("CE") != -1 ? 'T': "");
        };

        global.toLocalTime = function (date) {
            var dateString, unixTime;
            
            date = date.split('T');
            
            date[0] = date[0].split('-');
            
            dateString = date[0][1] + '/' + date[0][2] + '/' + date[0][0] + " " + date[1].slice(0, -5);
            
            date = new Date(dateString);
            
            unixTime = date.getTime() + (date.toString().indexOf("zomertijd") != -1 ? 14400000 : 7200000);
            
            return new Date(unixTime).toISOString() + (date.toString().indexOf("zomertijd") != -1 ? " CES" : " CE");
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
            var digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
            
            for (var i in string) {
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
            
            serverData[server.id].date = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            save("date", server);
        };

        global.toUsers = function (members) {
            var users = {};
            
            members = members.array();
            
            for (var i = 0; i < members.length; i++) {
                users[members[i].user.username.toLowerCase()] = members[i].user;
            }
            
            return users;
        };

        global.idsToUsers = function (ids, server) {
            var users = {}, members = server.members;
            
            for (var id in ids) {
                console.log(members.get(id));
                if (members.get(id)) {
                    users[members.get(id).user.username.toLowerCase()] = {};
                    users[members.get(id).user.username.toLowerCase()].id = id;
                    users[members.get(id).user.username.toLowerCase()].name = members.get(id).user.username;
                } else {
                    users[id] = {};
                    users[id].name = cap(id);
                }
            }
        
            return users;
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
                "amsterdam": "nl"
            })[region];
        };

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

        global.numericSort = function (a, b) {
            return b - a;
        };

        global.weatherUrl = function (place) {
            return WEATHER_BASE_URL + place + "&APPID=" + permData.weatherKey;
        };
        
        global.currencyUrl = function (currency1, currency2) {
            return CURRENCY_BASE_URL + currency1 + "_" + currency2 + "&compact=ultra";
        };
        
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
                music = "./music/DankIntroTheme.mp3";
            } else {
                music = "./music/" + music;
            }
            
            const streamOptions = {seek: 0, volume: (volume ? volume : 1)};
            
            var voiceChannel = server.channels.get(permData.servers[server.id].voiceChannel);
            
            try {
                voiceChannel.join().then(connection => {
                    if (fs.existsSync(music)) {
                        const dispatcher = connection.playFile(music, streamOptions);
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
                music = "https://www.youtube.com/watch?v=wx_ZNn-_klk";
            }
            
            const streamOptions = {seek: 0, volume: (volume ? volume : 1)};
            
            var voiceChannel = server.channels.get(permData.servers[server.id].voiceChannel);
            
            voiceChannel.join().then(connection => {
                const stream = ytdl(music, {filter : 'audioonly'});
                
                const dispatcher = connection.playStream(stream, streamOptions);
            }).catch(console.error);
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