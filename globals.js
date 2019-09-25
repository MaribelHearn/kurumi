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

        global.TOUHOU_SHMUPS = ["SoEW", "PoDD", "LLS", "MS", "EoSD", "PCB", "IN", "MoF", "SA", "UFO", "GFW", "TD", "DDC", "LoLK", "HSiFS", "WBaWC"];

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
        "Renko Usami", "Hieda no Akyuu", "Etarnity Larva", "Nemuno Sakata", "Aunn Komano", "Narumi Yatadera", "Satono Nishida",
        "Mai Teireida", "Okina Matara", "the unnamed girl on the Dolls in Pseudo Paradise jacket", "Joon Yorigami", "Shion Yorigami",
        "Eika Ebisu", "Urumi Ushizaki", "Kutaka Niwatari", "Yachi Kitcho", "Mayumi Joutougu", "Keiki Haniyasushin", "Saki Kurokoma"];

        global.TOUHOU_SPELLS = ["Moon Sign \"Moonlight Ray\"", "Night Sign \"Night Bird\"", "Darkness Sign \"Demarcation\"", "Ice Sign \"Icicle Fall\"",
        "Hail Sign \"Hailstorm\"", "Freeze Sign \"Perfect Freeze\"", "Snow Sign \"Diamond Blizzard\"", "Flower Sign \"Gorgeous Sweet Flower\"",
        "Flower Sign \"Selaginella 9\"", "Rainbow Sign \"Wind Chime of Colorful Rainbow\"", "Illusion Sign \"Flower Imaginary Dream Vine\"",
        "Colorful Sign \"Colorful Rain\"", "Colorful Sign \"Colorful Light Chaotic Dance\"", "Colorful Sign \"Extreme Color Typhoon\"",
        "Fire Sign \"Agni Shine\"", "Water Sign \"Princess Undine\"", "Wood Sign \"Sylphae Horn\"", "Earth Sign \"Rage Trilithon\"",
        "Metal Sign \"Metal Fatigue\"", "Fire Sign \"Agni Shine High Level\"", "Wood Sign \"Sylphae Horn High Level\"",
        "Earth Sign \"Rage Trilithon High Level\"", "Fire Sign \"Agni Radiance\"", "Water Sign \"Bury In Lake\"", "Wood Sign \"Green Storm\"",
        "Earth Sign \"Trilithon Shake\"", "Metal Sign \"Silver Dragon\"", "Fire & Earth Sign \"Lava Cromlech\"", "Wood & Fire Sign \"Forest Blaze\"",
        "Water & Wood Sign \"Water Elf\"", "Metal & Water Sign \"Mercury Poison\"", "Earth & Metal Sign \"Emerald Megalith\"",
        "Strange Art \"Misdirection\"", "Strange Art \"Illusional Misdirection\"", "Illusion Existence \"Clock Corpse\"",
        "Illusion Image \"Lunar Clock\"", "Maid Secret Skill \"Marionette\"", "Illusion Ghost \"Jack the Ludo Bile\"", "Illusion World \"The World\"",
        "Maid Secret Skill \"Killing Doll\"", "Conjuring \"Eternal Meek\"", "Heaven's Punishment \"Star of David\"",
        "Nether Sign \"Scarlet Netherworld\"", "Curse \"Curse of Vlad ?epe?\"", "Scarlet Sign \"Scarlet Shoot\"", "\"Red Magic\"",
        "Divine Punishment \"Young Demon Lord\"", "Hell Sign \"Mountain of a Thousand Needles\"", "God Art \"Vampire Illusion\"",
        "Scarlet Sign \"Scarlet Meister\"", "\"Scarlet Gensokyo\"", "Moon Sign \"Silent Selene\"", "Sun Sign \"Royal Flare\"",
        "Fire Water Wood Metal Earth Sign \"Philosopher's Stone\"", "Taboo \"Cranberry Trap\"", "Taboo \"Lavateinn\"", "Taboo \"Four of a Kind\"",
        "Taboo \"Kagome, Kagome\"", "Taboo \"Maze of Love\"", "Forbidden Barrage \"Starbow Break\"", "Forbidden Barrage \"Catadioptric\"",
        "Forbidden Barrage \"Clock that Ticks Away the Past\"", "Secret Barrage \"And Then Will There Be None?\"", "Q.E.D. \"Ripples of 495 Years\"",
        "Frost Sign \"Frost Columns\"", "Frost Sign \"Frost Columns -Lunatic-\"", "Cold Sign \"Lingering Cold -Easy-\"", "Cold Sign \"Lingering Cold\"",
        "Cold Sign \"Lingering Cold -Hard-\"", "Cold Sign \"Lingering Cold -Lunatic-\"", "Winter Sign \"Flower Wither Away -Easy-\"",
        "Winter Sign \"Flower Wither Away\"", "White Sign \"Undulation Ray\"", "Mystic Sign \"Table-Turning\"", "Hermit Sign \"Phoenix Egg -Easy-\"",
        "Hermit Sign \"Phoenix Egg\"", "Hermit Sign \"Phoenix Spread Wings\"", "Hermit Sign \"Phoenix Spread Wings -Lunatic-\"",
        "Shikigami Sign \"Pentagram Flight -Easy-\"", "Shikigami Sign \"Pentagram Flight\"", "Yin Yang \"Douman-Seiman\"",
        "Yin Yang \"Large Pentagram Crest\"", "Heaven Sign \"Immortal Sage's Rumbling -Easy-\"", "Heaven Sign \"Immortal Sage's Rumbling\"",
        "Flight Sign \"Flight of Idaten\"", "Child Sign \"Dharmapala's Rampage\"", "Hermit Sign \"Incarnate Immortal Sage -Easy-\"",
        "Hermit Sign \"Incarnate Immortal Sage\"", "Oni Sign \"Konjin of the Demon's Gate\"", "Direction Sign \"Kimontonkou\"",
        "Puppeteer Sign \"Maiden's Bunraku\"", "Puppeteer Sign \"Maiden's Bunraku -Lunatic-\"", "Blue Sign \"Benevolent French Dolls -Easy-\"",
        "Blue Sign \"Benevolent French Dolls\"", "Blue Sign \"Benevolent French Dolls -Hard-\"", "Blue Sign \"Benevolent Orleans Dolls\"",
        "Scarlet Sign \"Red-Haired Dutch Dolls -Easy-\"", "Scarlet Sign \"Red-Haired Dutch Dolls\"", "White Sign \"Chalk-White Russian Dolls\"",
        "White Sign \"Chalk-White Russian Dolls -Lunatic-\"", "Darkness Sign \"Foggy London Dolls -Easy-\"", "Darkness Sign \"Foggy London Dolls\"",
        "Cycle Sign \"Reincarnating Tibetan Dolls\"", "Elegant Sign \"Spring Kyoto Dolls\"", "Curse \"Eerily Luminous Shanghai Dolls -Easy-\"",
        "Curse \"Eerily Luminous Shanghai Dolls\"", "Curse \"Eerily Luminous Shanghai Dolls -Hard-\"", "Curse \"Hanged Hourai Dolls\"",
        "Noisy Sign \"Phantom Dinning -Easy-\"", "Noisy Sign \"Phantom Dinning\"", "Noisy Sign \"Live Poltergeist\"",
        "Noisy Sign \"Live Poltergeist -Lunatic-\"", "String Performance \"Guarneri del Gesu -Easy-\"", "String Performance \"Guarneri del Gesu\"",
        "Divine Strings \"Stradivarius\"", "Fake Strings \"Pseudo Stradivarius\"", "Trumpet Spirit \"Hino Phantasm -Easy-\"",
        "Trumpet Spirit \"Hino Phantasm\"", "Nether Trumpet \"Ghost Clifford\"", "Trumpet Spirit \"Ghost Clifford -Lunatic-\"",
        "Nether Keys \"Fazioli Nether Performance -Easy-\"", "Nether Keys \"Fazioli Nether Performance\"",
        "Key Spirit \"Bosendorfer Divine Performance\"", "Key Spirit \"Bosendorfer Divine Performance -Lunatic-\"",
        "Funeral Concert \"Prism Concerto -Easy-\"", "Funeral Concert \"Prism Concerto\"", "Noisy Funeral \"Stygian Riverside\"",
        "Noisy Funeral \"Stygian Riverside -Lunatic-\"", "Great Funeral Concert \"Ghostly Wheel Concerto Grosso -Easy-\"",
        "Great Funeral Concert \"Ghostly Wheel Concerto Grosso\"", "Great Funeral Concert \"Ghostly Wheel Concerto Grosso: Revised\"",
        "Great Funeral Concert \"Ghostly Wheel Concerto Grosso: Wonderous\"", "Ghost Sword \"Fasting of the Young Preta -Easy-\"",
        "Ghost Sword \"Fasting of the Young Preta\"", "Preta Sword \"Scroll of the Preta Realm\"",
        "Hungry King Sword \"Ten Kings' Retribution on the Preta\"", "Hell Realm Sword \"200 Yojana in a Flash -Easy-\"",
        "Hell Realm Sword \"200 Yojana in a Flash\"", "Hell Flame Sword \"Flashing Slash Formation of Karma Wind\"",
        "Hell God Sword \"Divine Flashing Slash of Karma Wind\"", "Animal Realm Sword \"Karmic Punishment of the Idle and Unfocused -Easy-\"",
        "Animal Realm Sword \"Karmic Punishment of the Idle and Unfocused\"", "Asura Sword \"Obsession with the Present World\"",
        "Asura Sword \"Obsession with the Present World -Lunatic-\"", "Human Realm Sword \"Fantasy of Enlightenment -Easy-\"",
        "Human Realm Sword \"Fantasy of Enlightenment\"", "Human Era Sword \"Approaching Disillusion\"",
        "Human God Sword \"Acceptance of Eternal Truth\"", "Deva Realm Sword \"Five Signs of the Dying Deva -Easy-\"",
        "Deva Realm Sword \"Five Signs of the Dying Deva\"", "Heavenly Sword \"Displeasure of the Seven Hakus\"",
        "Heaven God Sword \"Three Kons, Seven Hakus\"", "Six Realms Sword \"A Single Thought and the Infinite Kalpas -Easy-\"",
        "Six Realms Sword \"A Single Thought and the Infinite Kalpas\"", "Six Realms Sword \"A Single Thought and the Infinite Kalpas -Hard-\"",
        "Six Realms Sword \"A Single Thought and the Infinite Kalpas -Lunatic-\"", "Losing Hometown \"Village of Self-Loss -Wandering Soul-\"",
        "Losing Hometown \"Village of Self-Loss -Past Sin-\"", "Losing Hometown \"Village of Self-Loss -Trackless Path-\"",
        "Losing Hometown \"Village of Self-Loss -Suicide-\"", "Deadly Dance \"Law of Mortality -Bewilderment-\"",
        "Deadly Dance \"Law of Mortality -Dead Butterfly-\"", "Deadly Dance \"Law of Mortality -Poisonous Moth-\"",
        "Deadly Dance \"Law of Mortality -Demon World-\"", "Flowery Soul \"Ghost Butterfly\"", "Flowery Soul \"Swallowtail Butterfly\"",
        "Flowery Soul \"Deep-Rooted Butterfly\"", "Flowery Soul \"Butterfly Delusion\"", "Subtle Melody \"Repository of Hirokawa -False Soul-\"",
        "Subtle Melody \"Repository of Hirokawa -Ghost-\"", "Subtle Melody \"Repository of Hirokawa -Phantom Spirit-\"",
        "Subtle Melody \"Repository of Hirokawa -Divine Spirit-\"", "Cherry Blossom Sign \"Perfect Ink-Black Cherry Blossom -Seal-\"",
        "Cherry Blossom Sign \"Perfect Ink-Black Cherry Blossom -Self-Loss-\"", "Cherry Blossom Sign \"Perfect Ink-Black Cherry Blossom -Spring Sleep-\"",
        "Cherry Blossom Sign \"Perfect Ink-Black Cherry Blossom -Bloom-\"", "\"Resurrection Butterfly -10%% Reflowering-\"",
        "\"Resurrection Butterfly -30%% Reflowering-\"", "\"Resurrection Butterfly -50%% Reflowering-\"", "\"Resurrection Butterfly -80%% Reflowering-\"",
        "Oni Sign \"Blue Oni Red Oni\"", "Oni God \"Flying Bishamonten\"", "Shikigami \"Hermit Fox Thoughts\"",
        "Shikigami \"Banquet of Twelve General Gods\"", "Shikigami's Radiance \"Fox-Tanuki Youkai Laser\"",
        "Shikigami's Radiance \"Charming Siege from All Sides\"", "Shikigami's Radiance \"Princess Tenko -Illusion-\"",
        "Shikigami's Shot \"Ultimate Buddhist\"", "Shikigami's Shot \"Unilateral Contact\"", "Shikigami \"Chen\"", "\"Kokkuri-san's Contract\"",
        "Illusion God \"Descent of Izuna Gongen\"", "Shikigami \"Protection of Zenki and Goki\"", "Shikigami \"Dakini's Heavenly Possession\"",
        "Barrier \"Spell/Curse of Dreams & Reality\"", "Barrier \"Balance of Motion and Stillness\"", "Barrier \"Mesh of Light and Darkness\"",
        "Evil Spirits \"Xanadu of Straight and Curve\"", "Evil Spirits \"Yukari Yakumo's Spiriting Away\"",
        "Evil Spirits \"Bewitching Butterfly Living in the Zen Temple\"", "Sinister Spirits \"Double Black Death Butterfly\"", "Shikigami \"Ran Yakumo\"",
        "\"Boundary of Humans & Youkai\"", "Barrier \"Boundary of Life and Death\"", "Yukari's Arcanum \"Danmaku Barrier\"",
        "Firefly Sign \"Meteor on Earth\"", "Firefly Sign \"Comet on Earth\"", "Lamp Sign \"Firefly Phenomenon\"", "Lamp Sign \"Firefly Phenomenon\"",
        "Lamp Sign \"Firefly Phenomenon\"", "Lamp Sign \"Firefly Phenomenon\"", "Wriggle Sign \"Little Bug\"", "Wriggle Sign \"Little Bug Storm\"",
        "Wriggle Sign \"Night Bug Storm\"", "Wriggle Sign \"Nightbug Tornado\"", "Hidden Bug \"Endless Night Seclusion\"",
        "Hidden Bug \"Endless Night Seclusion\"", "Hidden Bug \"Endless Night Seclusion\"", "Vocal Sign \"Hooting in the Night\"",
        "Vocal Sign \"Hooting in the Night\"", "Vocal Sign \"Howl of the Horned Owl\"", "Vocal Sign \"Howl of the Horned Owl\"",
        "Moth Sign \"Hawk Moth's Wingbeats\"", "Moth Sign \"Hawk Moth's Wingbeats\"", "Toxin Sign \"Poisonous Moth's Scales\"",
        "Deadly Toxin \"Poisonous Moth's Dance in the Dark\"", "Hawk Sign \"Ill-Starred Dive\"", "Hawk Sign \"Ill-Starred Dive\"",
        "Hawk Sign \"Ill-Starred Dive\"", "Hawk Sign \"Ill-Starred Dive\"", "Night-Blindness \"Song of the Night Sparrow\"",
        "Night-Blindness \"Song of the Night Sparrow\"", "Night-Blindness \"Song of the Night Sparrow\"", "Night-Blindness \"Song of the Night Sparrow\"",
        "Night Sparrow \"Midnight Chorus Master\"", "Night Sparrow \"Midnight Chorus Master\"", "Night Sparrow \"Midnight Chorus Master\"",
        "Spiritual Birth \"First Pyramid\"", "Spiritual Birth \"First Pyramid\"", "Spiritual Birth \"First Pyramid\"", "Spiritual Birth \"First Pyramid\"",
        "Origin Sign \"Ephemerality 137\"", "Origin Sign \"Ephemerality 137\"", "Origin Sign \"Ephemerality 137\"", "Ambition Sign \"Buretsu Crisis\"",
        "Ambition Sign \"Masakado Crisis\"", "Ambition Sign \"Yoshimitsu Crisis\"", "Ambition Sign \"General Headquarters Crisis\"",
        "Land Sign \"Three Sacred Treasures - Sword\"", "Land Sign \"Three Sacred Treasures - Orb\"", "Land Sign \"Three Sacred Treasures - Mirror\"",
        "Land Scheme \"Three Sacred Treasures - Country\"", "Ending Sign \"Phantasmal Emperor\"", "Ending Sign \"Phantasmal Emperor\"",
        "Pseudo-History \"The Legend of Gensokyo\"", "Pseudo-History \"The Legend of Gensokyo\"", "Future \"Gods' Realm\"", "Future \"Gods' Realm\"",
        "Future \"Gods' Realm\"", "Dream Sign \"Duplex Barrier\"", "Dream Sign \"Duplex Barrier\"", "Dream Land \"Super Duplex Barrier\"",
        "Dream Land \"Super Duplex Barrier\"", "Spirit Sign \"Fantasy Seal -Spread-\"", "Spirit Sign \"Fantasy Seal -Spread-\"",
        "Scattered Spirit \"Fantasy Seal -Worn-\"", "Scattered Spirit \"Fantasy Seal -Worn-\"", "Dream Sign \"Evil-Sealing Circle\"",
        "Dream Sign \"Evil-Sealing Circle\"", "Divine Arts \"Omnidirectional Demon-Binding Circle\"",
        "Divine Arts \"Omnidirectional Dragon-Slaying Circle\"", "Spirit Sign \"Fantasy Seal -Concentrate-\"", "Spirit Sign \"Fantasy Seal -Concentrate-\"",
        "Migrating Spirit \"Fantasy Seal -Marred-\"", "Migrating Spirit \"Fantasy Seal -Marred-\"", "Boundary \"Duplex Danmaku Barrier\"",
        "Boundary \"Duplex Danmaku Barrier\"", "Great Barrier \"Hakurei Danmaku Barrier\"", "Great Barrier \"Hakurei Danmaku Barrier\"",
        "Divine Spirit \"Fantasy Seal -Blink-\"", "Divine Spirit \"Fantasy Seal -Blink-\"", "Divine Spirit \"Fantasy Seal -Blink-\"",
        "Magic Sign \"Milky Way\"", "Magic Sign \"Milky Way\"", "Magic Space \"Asteroid Belt\"", "Magic Space \"Asteroid Belt\"",
        "Magic Sign \"Stardust Reverie\"", "Magic Sign \"Stardust Reverie\"", "Black Magic \"Event Horizon\"", "Black Magic \"Event Horizon\"",
        "Love Sign \"Non-Directional Laser\"", "Love Sign \"Non-Directional Laser\"", "Love Storm \"Starlight Typhoon\"",
        "Love Storm \"Starlight Typhoon\"", "Love Sign \"Master Spark\"", "Love Sign \"Master Spark\"", "Loving Heart \"Double Spark\"",
        "Loving Heart \"Double Spark\"", "Light Sign \"Earthlight Ray\"", "Light Sign \"Earthlight Ray\"", "Light Blast \"Shoot the Moon\"",
        "Light Blast \"Shoot the Moon\"", "Magicannon \"Final Spark\"", "Magicannon \"Final Spark\"", "Magicannon \"Final Master Spark\"",
        "Wave Sign \"Red-Eyed Hypnosis (Mind Shaker)\"", "Wave Sign \"Red-Eyed Hypnosis (Mind Shaker)\"",
        "Illusion Wave \"Red-Eyed Hypnosis (Mind Blowing)\"", "Illusion Wave \"Red-Eyed Hypnosis (Mind Blowing)\"",
        "Lunatic Sign \"Hallucinogenic Tuning (Visionary Tuning)\"", "Lunatic Sign \"Hallucinogenic Tuning (Visionary Tuning)\"",
        "Lunatic Gaze \"Lunatic Stare Tuning (Illusion Seeker)\"", "Lunatic Gaze \"Lunatic Stare Tuning (Illusion Seeker)\"",
        "Loafing Sign \"Life & Spirit Stopping (Idling Wave)\"", "Loafing Sign \"Life & Spirit Stopping (Idling Wave)\"",
        "Indolence \"Life & Spirit Stopping (Mind Stopper)\"", "Indolence \"Life & Spirit Stopping (Mind Stopper)\"",
        "Spread Sign \"Moon of Truth (Invisible Full Moon)\"", "Spread Sign \"Moon of Truth (Invisible Full Moon)\"",
        "Spread Sign \"Moon of Truth (Invisible Full Moon)\"", "Spread Sign \"Moon of Truth (Invisible Full Moon)\"",
        "Lunar Eyes \"Lunar Rabbit's Remote Mesmerism (Tele-Mesmerism)\"", "Lunar Eyes \"Lunar Rabbit's Remote Mesmerism (Tele-Mesmerism)\"",
        "Lunar Eyes \"Lunar Rabbit's Remote Mesmerism (Tele-Mesmerism)\"", "Spacesphere \"Earth in a Pot\"", "Spacesphere \"Earth in a Pot\"",
        "Spacesphere \"Earth in a Pot\"", "Spacesphere \"Earth in a Pot\"", "Awakened God \"Memories of the Age of the Gods\"",
        "Awakened God \"Memories of the Age of the Gods\"", "God Sign \"Celestial Genealogy\"", "God Sign \"Celestial Genealogy\"",
        "Revival \"Seimei Y?gi -Life Game-\"", "Revival \"Seimei Y?gi -Life Game-\"", "Resurrection \"Rising Game\"", "Resurrection \"Rising Game\"",
        "Leading God \"Omoikane's Device\"", "Leading God \"Omoikane's Device\"", "Mind of God \"Omoikane's Brain\"", "Mind of God \"Omoikane's Brain\"",
        "Curse of the Heavens \"Apollo 13\"", "Curse of the Heavens \"Apollo 13\"", "Curse of the Heavens \"Apollo 13\"",
        "Curse of the Heavens \"Apollo 13\"", "Esoterica \"Astronomical Entombing\"", "Esoterica \"Astronomical Entombing\"",
        "Esoterica \"Astronomical Entombing\"", "Esoterica \"Astronomical Entombing\"", "Forbidden Arcanum \"Hourai Elixir\"",
        "Forbidden Arcanum \"Hourai Elixir\"", "Forbidden Arcanum \"Hourai Elixir\"", "Forbidden Arcanum \"Hourai Elixir\"",
        "Medicine Sign \"Large Galaxy in a Pot\"", "Medicine Sign \"Large Galaxy in a Pot\"", "Medicine Sign \"Large Galaxy in a Pot\"",
        "Medicine Sign \"Large Galaxy in a Pot\"", "Impossible Request \"Jewel from the Dragon's Neck -Five-Colored Shots-\"",
        "Impossible Request \"Jewel from the Dragon's Neck -Five-Colored Shots-\"", "Divine Treasure \"Brilliant Dragon Barrette\"",
        "Divine Treasure \"Brilliant Dragon Barrette\"", "Impossible Request \"Buddha's Stone Bowl -Indomitable Will-\"",
        "Impossible Request \"Buddha's Stone Bowl -Indomitable Will-\"", "Divine Treasure \"Buddhist Diamond\"", "Divine Treasure \"Buddhist Diamond\"",
        "Impossible Request \"Robe of Fire Rat -Patient Mind-\"", "Impossible Request \"Robe of Fire Rat -Patient Mind-\"",
        "Divine Treasure \"Salamander Shield\"", "Divine Treasure \"Salamander Shield\"", "Impossible Request \"Swallow's Cowrie Shell -Everlasting Life-\"",
        "Impossible Request \"Swallow's Cowrie Shell -Everlasting Life-\"", "Divine Treasure \"Life Spring Infinity\"",
        "Divine Treasure \"Life Spring Infinity\"", "Impossible Request \"Bullet Branch of Hourai -Rainbow Danmaku-\"",
        "Impossible Request \"Bullet Branch of Hourai -Rainbow Danmaku-\"", "Divine Treasure \"Jeweled Branch of Hourai -Dreamlike Paradise-\"",
        "Divine Treasure \"Jeweled Branch of Hourai -Dreamlike Paradise-\"", "\"End of Imperishable Night -New Moon-\"",
        "\"End of Imperishable Night -Crescent Moon-\"", "\"End of Imperishable Night -1st Quarter's Moon-\"", "\"End of Imperishable Night -Matsuyoi-\"",
        "\"End of Imperishable Night -11 o'Clock-\"", "\"End of Imperishable Night -Half to Midnight-\"", "\"End of Imperishable Night -Midnight-\"",
        "\"End of Imperishable Night -Half After Midnight-\"", "\"End of Imperishable Night -1 o'Clock-\"", "\"End of Imperishable Night -Half After 1-\"",
        "\"End of Imperishable Night -Dead of Night-\"", "\"End of Imperishable Night -Half After 2-\"", "\"End of Imperishable Night -3 o'Clock-\"",
        "\"End of Imperishable Night -Half After 3-\"", "\"End of Imperishable Night -4 o'Clock-\"", "\"End of Imperishable Night -Half After 4-\"",
        "\"End of Imperishable Night -Morning Mist-\"", "\"End of Imperishable Night -Dawn-\"", "\"End of Imperishable Night -Morning Star-\"",
        "\"End of Imperishable Night -Rising World-\"", "Past \"Ancient History -Old History-\"", "Reincarnation \"Returning-Bridge Ichijo\"",
        "Future \"New History Of Phantasm -Next History-\"", "Limiting Edict \"Curse of Tsuki-no-Iwakasa\"", "Immortal \"Fire Bird -Flying Phoenix-\"",
        "Fujiwara \"Flaw of Forgiving Shrine\"", "Deathless \"Xu Fu's Dimension\"", "Forgiveness \"Honest Man's Death\"", "Hollow Giant \"Woo\"",
        "Everlasting \"Phoenix's Tail\"", "Hourai \"South Wind, Clear Sky -Fujiyama Volcano-\"", "\"Possessed by Phoenix\"", "\"Hourai Doll\"",
        "\"Imperishable Shooting\"", "\"Unseasonal Butterfly Storm\"", "\"Blind Nightbird\"", "\"Emperor of the Land of the Rising Sun\"",
        "\"Stare of the Hazy Phantom Moon (Lunatic Red Eyes)\"", "\"Heaven Spider's Butterfly-Capturing Web\"", "\"Tree-Ocean of Hourai\"",
        "\"Phoenix Rebirth\"", "\"Ancient Duper\"", "\"Total Purification\"", "\"Fantasy Nature\"", "\"Blazing Star\"", "\"Deflation World\"",
        "\"Matsuyoi-Reflecting Satellite Slash\"", "\"The Phantom of the Grand Guignol\"", "\"Scarlet Destiny\"", "\"Saigyouji Flawless Nirvana\"",
        "\"Profound Danmaku Barrier -Phantasm, Foam and Shadow-\"", "Leaf Sign \"Falling Leaves of Madness\"", "Fall Sign \"Fall Sky\"",
        "Fall Sign \"The Fall Sky and a Maiden's Heart\"", "Plenty Sign \"Owotoshi Harvester\"", "Bumper Crop \"Promise of the Wheat God\"",
        "Bad Luck Sign \"Bad Fortune\"", "Bad Luck Sign \"Biorhythm of the Misfortune God\"", "Flawed Sign \"Broken Amulet\"",
        "Scar \"Broken Charm of Protection\"", "Evil Spirit \"Misfortune's Wheel\"", "Fate \"Old Lady Ohgane's Fire\"", "Wound Sign \"Pain Flow\"",
        "Wound Sign \"Exiled Doll\"", "Optics \"Optical Camouflage\"", "Optics \"Hydro Camouflage\"", "Flood \"Ooze Flooding\"",
        "Flood \"Diluvial Mere\"", "Drown \"Trauma in the Glimmering Depths\"", "Water Sign \"Kappa's Pororoca\"", "Water Sign \"Kappa's Flash Flood\"",
        "Water Sign \"Kappa's Great Illusionary Waterfall\"", "Kappa \"Monster Cucumber\"", "Kappa \"Exteeeending Aaaaarm\"",
        "Kappa \"Spin the Cephalic Plate\"", "Crossroad Sign \"Crossroads of Heaven\"", "Crossroad Sign \"Saruta Cross\"",
        "Wind God \"Wind God Hidden Among Tree Leaves\"", "Wind God \"Tengu's Fall Wind\"", "Wind God \"Storm Day\"", "\"Illusionary Dominance\"",
        "\"Illusionary Dominance\"", "\"Peerless Wind God\"", "Blockade Sign \"Mountain God Procession\"", "Blockade Sign \"Advent of the Divine Grandson\"",
        "Blockade Sign \"Terukuni Throughout the World\"", "Esoterica \"Gray Thaumaturgy\"", "Esoterica \"Forgotten Ritual\"",
        "Esoterica \"Secretly Inherited Art of Danmaku\"", "Miracle \"Daytime Guest Stars\"", "Miracle \"Night with Bright Guest Stars\"",
        "Miracle \"Night with Overly Bright Guest Stars\"", "Sea Opening \"The Day the Sea Split\"", "Sea Opening \"Moses's Miracle\"",
        "Sea Opening \"Moses's Miracle\"", "Preparation \"Star Ritual to Call the Godly Winds\"", "Preparation \"Summon Takeminakata\"",
        "Miracle \"God's Wind\"", "Great Miracle \"Yasaka's Divine Wind\"", "Divine Festival \"Expanded Onbashira\"",
        "Weird Festival \"Medoteko Boisterous Dance\"", "Weird Festival \"Medoteko Boisterous Dance\"", "Rice Porridge in Tube \"God's Rice Porridge\"",
        "Forgotten Grain \"Unremembered Crop\"", "Divine Grain \"Divining Crop\"", "Sacrifice Sign \"Misayama Hunting Shrine Ritual\"",
        "Mystery \"Kuzui Clear Water\"", "Mystery \"Yamato Torus\"", "Heaven's Stream \"Miracle of Otensui\"", "Heaven's Dragon \"Source of Rains\"",
        "\"Mountain of Faith\"", "\"Virtue of Wind God\"", "God Sign \"Beautiful Spring like Suiga\"", "God Sign \"Ancient Fate Linked by Cedars\"",
        "God Sign \"Omiwatari that God Walked\"", "Party Start \"Two Bows, Two Claps, and One Bow\"", "Native God \"Lord Long-Arm and Lord Long-Leg\"",
        "Divine Tool \"Moriya's Iron Ring\"", "Spring Sign \"Jade of the Horrid River\"", "Frog Hunt \"The Snake Eats the Croaking Frog\"",
        "Native God \"Seven Stones and Seven Trees\"", "Native God \"Kero-chan Braves the Wind and Rain\"", "Native God \"Red Frogs of Houei Four\"",
        "\"Suwa War ~ Native Myth vs. Central Myth\"", "Scourge Sign \"Mishaguji-sama\"", "Horror \"Tsurube-Otoshi Apparition\"",
        "Trap Sign \"Capture Web\"", "Spider \"Cave Spider's Nest\"", "Miasma Sign \"Filled Miasma\"", "Miasma \"Unexplained Fever\"",
        "Jealousy Sign \"Green-Eyed Monster\"", "Envy \"Green-Eyed Invisible Monster\"", "Grandpa Hanasaka \"Jealousy of the Kind & Lovely\"",
        "Grandpa Hanasaka \"Shiro's Ashes\"", "Tongue-Cut Sparrow \"Hate for the Humble & Rich\"", "Tongue-Cut Sparrow \"Large Box & Small Box\"",
        "Malice Sign \"Shrine Visit in the Dead of Night\"", "Malice Sign \"Day 7 of the Shrine Visits in the Dead of Night\"",
        "Oni Sign \"Anomalies, Strength, Disorder, & Spirits\"", "Mysterious Ring \"Hell's Wheel of Pain\"",
        "Shackles Sign \"Shackles a Criminal Can't Take Off\"", "Feat of Strength \"Storm on Mt. Ooe\"",
        "Feat of Strength \"Wind Blowing Down from Mt. Ooe\"", "Big Four Arcanum \"Knock Out In Three Steps\"",
        "Big Four Arcanum \"Knock Out In Three Steps\"", "Recollection \"Terrible Souvenir\"", "Recollection \"Terrifying Hypnotism\"",
        "Recollection \"Double Black Death Butterfly\"", "Recollection \"Flying Insect's Nest\"", "Recollection \"Border of Wave & Particle\"",
        "Recollection \"Throwing Mt. Togakushi\"", "Recollection \"Pandemonium\"", "Recollection \"Deep Mist Labyrinth\"",
        "Recollection \"Wind God Hidden Among Tree Leaves\"", "Recollection \"Tengu's Macroburst\"", "Recollection \"Torii Whorl-Wind\"",
        "Recollection \"Spring Kyoto Dolls\"", "Recollection \"Straw Doll Kamikaze\"", "Recollection \"Return Inanimateness\"",
        "Recollection \"Mercury Poison\"", "Recollection \"Princess Undine\"", "Recollection \"Philosopher's Stone\"", "Recollection \"Extending Arm\"",
        "Recollection \"Kappa's Pororoca\"", "Recollection \"Trauma in the Glimmering Depths\"", "Cat Sign \"Cat's Walk\"",
        "Cat Sign \"Vengeful Cat Spirit's Erratic Step\"", "Cursed Sprite \"Zombie Fairy\"", "Cursed Sprite \"Vengeful Spirit: Possessed Fairy\"",
        "Malicious Spirit \"Spleen Eater\"", "Corpse Spirit \"Vengeful Cannibal Spirit\"", "Atonement \"Needle Mountain of a Former Hell\"",
        "Atonement \"The Needles of Yore & the Vengeful Spirits in Pain\"", "\"Rekindling of Dead Ashes\"", "\"Small Demon's Revival\"",
        "Youkai \"Blazing Wheel\"", "Atomic Fire \"Nuclear Fusion\"", "Atomic Fire \"Nuclear Excursion\"",
        "Atomic Fire \"Uncontainable Nuclear Reaction\"", "Explosion Sign \"Petit Flare\"", "Explosion Sign \"Mega Flare\"",
        "Explosion Sign \"Giga Flare\"", "Explosion Sign \"Peta Flare\"", "Blazing Star \"Fixed Star\"", "Blazing Star \"Planetary Revolution\"",
        "Blazing Star \"Ten Evil Stars\"", "\"Hell & Heaven Meltdown\"", "\"Hell's Tokamak\"", "\"Hell's Artificial Sun\"", "\"Subterranean Sun\"",
        "Esoterica \"Nine Syllable Stabs\"", "Miracle \"Miracle Fruit\"", "Divine Virtue \"Bumper Crop Rice Shower\"",
        "Symbol \"All Ancestors Standing Beside Your Bed\"", "Symbol \"Danmaku Paranoia\"", "Instinct \"Release of the Id\"", "Suppression \"Superego\"",
        "Response \"Youkai Polygraph\"", "Subconscious \"Rorschach in Danmaku\"", "Rekindled \"The Embers of Love\"", "Depths \"Genetics of the Subconscious\"",
        "\"Philosophy of a Hated Person\"", "\"Subterranean Rose\"", "Rod Sign \"Busy Rod\"", "Search Sign \"Rare Metal Detector\"",
        "Search Sign \"Gold Detector\"", "Vision Sign \"Nazrin Pendulum\"", "Vision Sign \"High Sensitivity Nazrin Pendulum\"",
        "Defense Sign \"Pendulum Guard\"", "Large Ring \"Umbrella Halo\"", "Large Ring \"Hello Forgotten World\"", "Umbrella Sign \"Parasol Star Symphony\"",
        "Umbrella Sign \"Parasol Star Memories\"", "Rain Sign \"A Rainy Night's Ghost Story\"", "Umbrella \"Super Water-Repelling Bone-Dry Monster\"",
        "Monster Sign \"A Forgotten Umbrella's Night Train\"", "Monster Train \"Spare Umbrella Express Night Carnival\"",
        "Iron Fist \"An Unarguable Youkai Punch\"", "Divine Fist \"Hell Thrust from Above the Clouds\"", "Divine Fist \"Hell Thrust from the Heavenly Seas\"",
        "Fist Sign \"Heavenly Net Sandbag\"", "Barrage \"Cloud World Kraken Strike\"", "Barrage \"King Kraken Strike\"", "Hand Strike \"Fist Smash\"",
        "Annihilation \"Consecutive Hooks Throughout Heaven & Earth\"", "Thunderous Yell \"A Scolding from a Traditional Old Man\"",
        "Rage \"Calamity Scolding Scorch\"", "Rage \"First & Last of Its Kind Scolding Scorch\"", "Capsize \"Dragging Anchor\"", "Capsize \"Foundering Anchor\"",
        "Capsize \"Sinking Anchor\"", "Drowning Sign \"Deep Vortex\"", "Drowning Sign \"Sinkable Vortex\"", "Harbor Sign \"Phantom Ship Harbor\"",
        "Harbor Sign \"Ghost Ship's Port\"", "Harbor Sign \"Eternally Anchored Ghost Ship\"", "Ghost \"Sinker Ghost\"", "Ghost \"Dipper Creeping Close\"",
        "Ghost \"Dipper Creeping Close\"", "Jeweled Pagoda \"Greatest Treasure\"", "Jeweled Pagoda \"Greatest Treasure\"", "Jeweled Pagoda \"Greatest Treasure\"",
        "Jeweled Pagoda \"Radiant Treasure\"", "Jeweled Pagoda \"Radiant Treasure Gun\"", "Jeweled Pagoda \"Radiant Treasure Gun\"",
        "Light Sign \"Absolute Justice\"", "Light Sign \"Aura of Justice\"", "Buddhist Art \"Most Valuable Vajra\"", "Buddha's Light \"Vajra of Perfect Buddhism\"",
        "Buddha's Light \"Vajra of Perfect Buddhism\"", "Light Sign \"Demon of Purification\"", "Light Sign \"Demon of Purification\"",
        "\"Complete Clarification\"", "Magic \"Omen of Purple Clouds\"", "Good Omen \"Cloudy Way in Purple\"", "Good Omen \"Nirvana's Cloudy Way in Purple\"",
        "Magic \"Mystic Fragrance of a Makai Butterfly\"", "Magic \"Magic Butterfly\"", "Light Magic \"Star Maelstrom\"", "Light Magic \"Magic Milky Way\"",
        "Light Magic \"Magic Milky Way\"", "Great Magic \"Devil's Recitation\"", "Great Magic \"Devil's Recitation\"", "Great Magic \"Devil's Recitation\"",
        "\"Nikou Hijiri's Air Scroll\"", "Superhuman \"Byakuren Hijiri\"", "Flying Bowl \"Flying Fantastica\"", "Flying Bowl \"Legendary Flying Saucer\"",
        "Flying Bowl \"Legendary Flying Saucer\"", "Umbrella Sign \"Lightly Falling Large Raindrops\"", "Surprising Rain \"Guerrilla Typhoon\"",
        "Halo \"Karakasa Surprising Flash\"", "Ominous Clouds \"Heian Dark Clouds\"", "Unidentified \"Red UFO Invasion of Rage\"",
        "Nue Sign \"Mysterious Snake Show\"", "Unidentified \"Blue UFO Invasion of Grief\"", "Nue Sign \"Danmaku Chimera\"",
        "Unidentified \"Green UFO Invasion of Justice\"", "Nue Sign \"Undefined Darkness\"", "Unidentified \"Rainbow UFO Invasion of Terror\"",
        "\"Nightmare of Heiankyou\"", "Grudge Bow \"The Bow of Genzanmi Yorimasa\"", "\"Amagimi Hijiri's Air Scroll\"", "Symbol \"Dance of the Dead Butterflies\"",
        "Symbol \"Dance of the Dead Butterflies - Cherry Blossoms -\"", "Ghostly Butterfly \"Ghost Spot\"", "Ghostly Butterfly \"Ghost Spot - Cherry Blossoms -\"",
        "Nether Sign \"Endless Evening Cherry Blossoms\"", "Cherry Blossom Sign \"Saigyou Cherry Blossom Blizzard\"", "Echo Sign \"Mountain Echo\"",
        "Echo Sign \"Mountain Echo Scramble\"", "Echo Sign \"Power Resonance\"", "Mountain Echo \"Long-Range Echo\"", "Mountain Echo \"Amplify Echo\"",
        "Great Voice \"Charged Cry\"", "Great Voice \"Charged Yahoo!\"", "Rainbow Sign \"Umbrella Cyclone\"", "Recovery \"Heal By Desire\"",
        "Poison Nail \"Poison Raze\"", "Poison Nail \"Poison Murder\"", "Desire Sign \"Saved Up Desire Spirit Invitation\"", "Desire Spirit \"Score Desire Eater\"",
        "Evil Sign \"Yǎng Xiǎoguǐ\"", "Evil Sign \"Gūhún Yěguǐ\"", "Demonify \"Zǒuhuǒ Rùmó\"", "Possession \"Corpse Tóngjī\"", "Spirit Link \"Tōnglíng Yoshika\"",
        "Path Sign \"Tao Fetal Movement\"", "Thunder Arrow \"Gagouji's Cyclone\"", "Thunder Arrow \"Gagouji's Cyclone\"", "Thunder Arrow \"Gagouji's Tornado\"",
        "Heaven Sign \"Rainy Iwafune\"", "Heaven Sign \"Iwafune Ascending to Heaven\"", "Throwing Dishes \"Mononobe's Eighty Sake Cups\"",
        "Blaze Sign \"Blazing Winds of Haibutsu\"", "Blaze Sign \"Sakuraiji in Flames\"", "Saint Girl \"Oomonoimi's Dinner\"", "Honor \"Colors of Twelve Levels\"",
        "Honor \"Ranks of Twelve Levels\"", "Hermit Sign \"Taoist of the Land of the Rising Sun\"", "Hermit Sign \"Emperor of the Land of the Rising Sun\"",
        "Summon \"Royal Clan's Chaotic Dance\"", "Secret Treasure \"Armillary Sphere of Ikaruga-dera\"",
        "Secret Treasure \"Prince Shotoku's Out-of-Place Artifact\"", "Light Sign \"Halo of the Guse Kannon\"", "Light Sign \"Guse Flash\"",
        "Discernment \"Laser of Seventeen Articles\"", "Divine Light \"Honor the Avoidance of Defiance\"", "\"Falling Stars on Divine Spirit Mausoleum\"",
        "\"Newborn Divine Spirit\"", "Unknown \"Will-o'-wisps in Unknown Orbit\"", "Unknown \"Skyfish with Unknown Shape\"",
        "Unknown \"Youkai Orb of Unknown Mechanics\"", "First Duel \"Primate Danmaku Transformation\"", "Second Duel \"Carnivorous Danmaku Transformation\"",
        "Third Duel \"Avian Danmaku Transformation\"", "Fourth Duel \"Amphibian Danmaku Transformation\"", "Fifth Duel \"Scrolls of Frolicking Animals\"",
        "Sixth Duel \"Tanuki's Monstrous School\"", "Seventh Duel \"Wild Deserted Island\"", "Transformation \"Pseudo-Exorcism of the Stupid Shrine Maiden\"",
        "\"Mamizou Danmaku in Ten Transformations\"", "Raccoon Sign \"Full Moon Pompokolin\"", "Cherry Blossom Sign \"Cherry Blossom Blizzard Hell\"",
        "Mountain Echo \"Yamabiko's Specialty Echo Demonstration\"", "Poison Nail \"Undead Murderer\"", "Path Sign \"TAO Fetal Movement ~Dao~\"",
        "Vengeful Spirit \"Iruka's Thunder\"", "Saint Girl \"Sun Goddess's Sacrifice\"", "\"Divine Spirits' Universe\"", "\"Wild Carpet\"",
        "Ice Sign \"Ultimate Blizzard\"", "Water Sign \"Tail Fin Slap\"", "Scale Sign \"Scale Wave\"", "Scale Sign \"Raging Waves of the Reversed Scale\"",
        "Scale Sign \"Great Raging Waves of the Reversed Scale\"", "Flight Sign \"Flying Head\"", "Neck Sign \"Close-Eye Shot\"", "Neck Sign \"Rokurokubi Flight\"",
        "Flying Head \"Multiplicative Head\"", "Flying Head \"Seventh Head\"", "Flying Head \"Ninth Head\"", "Flying Head \"Dullahan Night\"",
        "Fang Sign \"Moonlit Canine Teeth\"", "Transformation \"Triangle Fang\"", "Transformation \"Star Fang\"", "Roar \"Strange Roar\"",
        "Roar \"Full Moon Howling\"", "Wolf Sign \"Star Ring Pounce\"", "Sirius \"High-Speed Pounce\"", "Heikyoku \"Sounds of Jetavana's Bell\"",
        "Vengeful Spirit \"Hoichi the Earless\"", "Vengeful Spirit \"Great Vengeful Spirit of Taira\"", "Music Sign \"Wicked Musical Score\"",
        "Music Sign \"Malicious Musical Score\"", "Music Sign \"Double Score\"", "Koto Sign \"Sounds of Anicca's Koto\"", "Echo Sign \"Heian's Reverberation\"",
        "Echo Sign \"Echo Chamber\"", "Koto Music \"Social Upheaval Koto Music Complement\"", "Koto Music \"Social Upheaval Requiem\"",
        "Deceit Sign \"Reverse Needle Attack\"", "Reverse Sign \"Danmaku Through the Looking-Glass\"", "Reverse Sign \"Evil in the Mirror\"",
        "Reverse Sign \"This Side Down\"", "Reverse Sign \"Overturning All Under Heaven\"", "Reverse Bow \"Dream Bow of Heaven & Earth\"",
        "Reverse Bow \"Decree of the Dream Bow of Heaven & Earth\"", "Turnabout \"Reverse Hierarchy\"", "Turnabout \"Change Air Brave\"",
        "Small Bullet \"Inchling's Path\"", "Small Bullet \"Inchling's Thorny Path\"", "Mallet \"Grow Bigger!\"", "Mallet \"Grow Even Bigger!\"",
        "Bewitched Sword \"Shining Needle Sword\"", "Mallet \"You Grow Bigger!\"", "\"Attack on Dwarf\"", "\"Wall of Issun\"", "\"Hop-o'-My-Thumb Seven\"",
        "\"The Seven Issun-Boshi\"", "String Music \"Storm Ensemble\"", "String Music \"Joururi World\"", "First Drum \"Raging Temple Taiko\"",
        "Second Drum \"Vengeful Spirit Aya-no-Tsuzumi\"", "Third Drum \"Three Strikes at Midnight\"", "Fourth Drum \"Land Percuss\"", "Fifth Drum \"Den-Den Daiko\"",
        "Sixth Drum \"Alternate Sticking\"", "Seventh Drum \"High Speed Taiko Rocket\"", "Eighth Drum \"Thunder God's Anger\"", "\"Blue Lady Show\"",
        "\"Pristine Beat\"", "Evil Bullet \"Speed Strike\"", "Bullet Sign \"Eagle Shooting\"", "Bullet Sign \"The Eagle Shot Its Target\"",
        "Gun Sign \"Lunatic Gun\"", "Gun Sign \"Lunatic Gun\"", "Rabbit Sign \"Strawberry Dango\"", "Rabbit Sign \"Berry Berry Dango\"",
        "Rabbit Sign \"Dango Influence\"", "Moon-Viewing \"September Full Moon\"", "Moon-Viewing Sake \"Lunatic September\"", "Dream Sign \"Scarlet Nightmare\"",
        "Dream Sign \"Scarlet Oppressive Nightmare\"", "Dream Sign \"Indigo Dream of Anxiety\"", "Dream Sign \"Indigo Three-Layered Dream of Anxiety\"",
        "Dream Sign \"Eternally Anxious Dream\"", "Dream Sign \"Ochre Confusion\"", "Dream Sign \"Ochre Labyrinthine Confusion\"", "Dream Sign \"Dream Catcher\"",
        "Dream Sign \"Azure Dream Catcher\"", "Dream Sign \"Losing Oneself in a Dream\"", "Moon Sign \"Ultramarine Lunatic Dream\"",
        "Orb Sign \"Disorderly Flock's Curse\"", "Orb Sign \"Disorderly Flock's Reverse Curse\"", "Orb Sign \"Impure Body Detection Mines\"",
        "Orb Sign \"Impure Body Detection Mines V2\"", "Orb Sign \"Shotgun Coronation of the Gods\"", "Orb Sign \"Shining Coronation of the Gods\"",
        "\"One-Winged White Heron\"", "Hell Sign \"Hell Eclipse\"", "Hell Sign \"Eclipse of Hell\"", "Hell Sign \"Flash and Stripe\"",
        "Hell Sign \"Star and Stripe\"", "Hellfire \"Graze Inferno\"", "Hellfire \"Infernal Essence of Grazing\"", "Inferno \"Striped Abyss\"", "\"Fake Apollo\"",
        "\"Apollo Hoax Theory\"", "\"Pure Light of the Palm\"", "\"Lilies of Murderous Intent\"", "\"Primordial Divine Spirit World\"",
        "\"Modern Divine Spirit World\"", "\"Trembling, Shivering Star\"", "\"Pristine Lunacy\"", "\"Overflowing Impurity\"", "\"Cleansing of Earthen Impurity\"",
        "Pure Sign \"Purely Bullet Hell\"", "Pure Sign \"A Pristine Danmaku Hell\"", "Butterfly \"Butterfly Supplantation\"", "Super-Express \"Dream Express\"",
        "Crawling Dream \"Creeping Bullet\"", "Otherworld \"Ōmagatoki\"", "Earth \"Impurity Within One's Body\"", "Moon \"Apollo Reflection Mirror\"",
        "\"Simple Danmaku for Cornering a Trapped Rat\"", "Otherworld \"Hell's Non-Ideal Danmaku\"", "Earth \"Rain Falling in Hell\"", "Moon \"Lunatic Impact\"",
        "\"Pristine Danmaku for Killing a Person\"", "\"Trinitarian Rhapsody\"", "\"First and Last Nameless Danmaku\"",
        "Orb Sign \"Disorderly Flock's Duplex Curse\"", "Butterfly Sign \"Minute Scales\"", "Butterfly Sign \"Swallowtail's Scales\"",
        "Butterfly Sign \"Fluttering Summer\"", "Butterfly Sign \"Midsummer Wingbeats\"", "Rain Sign \"Captive Autumn Rain\"", "Rain Sign \"Cursed Torrential Rain\"",
        "Blade Sign \"Yamanba's Kitchen Knife Sharpening\"", "Blade Sign \"Yamanba's Oni Kitchen Knife Sharpening\"", "Exhaust Sign \"Mountain Murder\"",
        "Exhaust Sign \"Bloody Mountain Murder\"", "Spring Sign \"Surprise Spring\"", "Dog Sign \"Stray Dog's Walk\"", "Hound Sign \"Mountain Hound's Walk\"",
        "Spinning Top \"Koma-Inu Spin\"", "Spinning Top \"Curl Up and Die\"", "Koma Sign \"Solitary A-Um Breathing\"", "Magic Sign \"Instant Bodhi\"",
        "Magic Sign \"Bullet Golem\"", "Jizo \"Criminal Salvation\"", "Bamboo Sign \"Bamboo Spear Dance\"", "Bamboo Sign \"Bamboo Crazy Dance\"",
        "Myōga Ginger \"Forget Your Name\"", "Broadleaf Sign \"Tanabata Star Festival\"", "Dance Sign \"Behind Festival\"", "Myōga Blessing \"Behind You\"",
        "Mad Dance \"Tengu-odoshi\"", "\"Anarchy Bullet Hell\"", "Secret Ceremony \"Reverse Invoker\"", "Secret Ceremony \"Sword of Seven Stars\"",
        "Drum Dance \"Powerful Cheers\"", "Mad Dance \"Crazy Back Dance\"", "Bullet Dance \"Twin Typhoons\"", "Hidden Summer \"Scorch By Hot Summer\"",
        "Hidden Fall \"Die of Famine\"", "Hidden Winter \"Black Snowman\"", "Hidden Spring \"April Wizard\"", "\"Hidden Breezy Cherry Blossom\"",
        "\"Hidden Perfect Summer Ice\"", "\"Hidden Crazy Fall Wind\"", "\"Hidden Extreme Winter\"", "Secret Ceremony \"Kyōgen of the Back Door\"",
        "Secret Ceremony \"Matara Dukkha\"", "Secret Ceremony \"Performers Lacking Social Ties\"", "Secret Ceremony \"Dupion Barrage\"",
        "Magic Sign \"Impromptu Bodhi\"", "Jizo \"Hellfire Salvation\"", "\"The Back Face's Dark Sarugaku\"", "Back Sign \"Halo of the Secret God\"",
        "Back Sign \"Halo of the Absolute Secret God\"", "Hidden Winter \"Snowman of Abnormal Snowfall\"",
        "Hidden Summer \"Scorched Earth of Abnormal Ferocious Heat\"", "Hidden Fall \"Starving Preta of Abnormal Blight\"",
        "Hidden Spring \"Sorcerer of Abnormal Falling Flowers\"", "Magic Sign \"Gigantic Pet Bullet Lifeform\"", "Mad Dance \"Frenzied Tengu-Frightening\"",
        "Secret Ceremony \"Shot in the Back\"", "Secret Ceremony \"Flames of the Impure\"", "Stone Sign \"Stone Woods\"", "Stone Sign \"Stone Conifers\"",
        "Stone Sign \"Children's Limbo\"", "Stone Sign \"Adult Children's Limbo\"", "Stone Sign \"Stone Baby\"", "Stone Sign \"Heavy Stone Baby\"",
        "Drowning Sign \"Drowning in the Sanzu\"", "Oni Sign \"Purgatordeal of Oniwatari\"", "Oni Sign \"High-Level Purgatordeal of Oniwatari\"",
        "Oni Sign \"Demon Siege\"", "Oni Sign \"Hungry Demon Siege\"", "Oni Sign \"Hell-Level Purgatordeal of Oniwatari\"", "Water Sign \"Ordeal of Water Distribution\"",
        "Water Sign \"High-Level Purgatordeal of Water Distribution\"", "Water Sign \"Ultimate Purgatordeal of Water Distribution\"", "Light Sign \"Ordeal of Surveying\"",
        "Light Sign \"High-Level Purgatordeal of Surveying\"", "Light Sign \"Ultimate Purgatordeal of Surveying\"", "Oni Sign \"Hell-Level Purgatordeal of Oniwatari\"",
        "Tortoise Sign \"Tortoiseshell Hell\"", "Haniwa \"Archer Haniwa\"", "Haniwa \"Heat-Treated Archer Haniwa\"", "Haniwa \"Fencer Haniwa\"",
        "Haniwa \"Heat-Treated Fencer Haniwa\"", "Haniwa \"Cavalry Haniwa\"", "Haniwa \"Heat-Treated Cavalry Haniwa\"", "Haniwa \"Hollow Inexhaustible Troops\"",
        "Haniwa \"Undefeated Inexhaustible Troops\"", "Square Shape \"Square-Shaped Sculpting Art\"", "Square Shape \"Square Creature\"",
        "Circular Shape \"Perfect Circle Sculpting Art\"", "Circular Shape \"Circle Creature\"", "Linear Shape \"Line-Shaped Sculpting Art\"",
        "Linear Shape \"Linear Creature\"", "Haniwa \"Horse-and-Rider Idol Sculpting Art\"","Haniwa \"Idol Creature\"", "\"Oni-Shaped Sculpting Art\"",
        "\"Geometric Creature\"", "\"Idola Diabolus\"", "Bloody Battle \"Watershed of Blood\"", "Bloody Battle \"Hell Realm Sight-Line\"",
        "Bloody Battle \"All-Spirit Oniwatari\"", "Agile Skill \"Thrilling Shot\"", "Agile Skill \"Lightning Neigh\"", "Agile Skill \"Dense Crowd\"",
        "Agile Skill \"Beast Epidemicity\"", "Agile Skill \"Triangle Chase\"", "Agile Skill \"Black Pegasus Meteor Shot\"", "Agile Skill \"Muscle Explosion\"",
        "\"Follow Me Unafraid\"", "\"Oni-Shaped Hoi Polloi\"", "\"Deeds of Devilish Beasts\"", "Oni Sign \"Beasts Attacking from the Rear\"",
        "Oni Sign \"Mangy Beasts Attacking from the Rear\"", "Oni Sign \"Devilish Beasts Attacking from the Rear\"", "Dragon Sign \"Dragon Crest Bullets\""];

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
            "aliasesList": {}, "quotes": {}, "waifus": {}, "touhouWaifus": {}, "spellWaifus": {}, "fanmemeWaifus": {}, "lenenWaifus": {}, "waifusExceptions": {},
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
            "servers": {}, "WRs": {}, "bestInTheWest": {}, "LNNs": {}, "currencies": {}, "images": {}, "musicLocal": {}, "notifyQueue": [],
            "commandSymbols": ["!"], "token": "", "botMaster": "", "WRsLastUpdated": "", "weatherKey": "", "googleKey": "", "maxLength": 200, "maintenanceMode": false
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

            return string.contains("server.") && (string.indexOf("server.") == -1 || string.indexOf("server.") != string.indexOf("server.id].cooldownSecs"));
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
            var result = "", days = 0, hours = 0, minutes = 0, seconds = 0;

            if (milliseconds >= 86400000) {
                while (milliseconds >= 86400000) {
                    milliseconds -= 86400000;
                    days += 1;
                }

                result += days + " day" + (days != 1 ? 's' : "") + ", ";
            }

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

            fs.writeFileSync("data/" + (server ? server.id + "/" : "") + object + ".txt", JSON.stringify(data));
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
                "hsifs": "HSiFS",
                "wbawc": "WBaWC"
            })[game];
        };

        global.shotName = function (shot) {
            var shotNames = {
                "Reimua": "ReimuA",
                "Reimuaufos": "ReimuAUFOs",
                "Reimub": "ReimuB",
                "Reimubufos": "ReimuBUFOs",
                "Reimuc": "ReimuC",
                "Marisaa": "MarisaA",
                "Marisaaufos": "MarisaAUFOs",
                "Marisab": "MarisaB",
                "Marisabufos": "MarisaBUFOs",
                "Marisac": "MarisaC",
                "Sakuyaa": "SakuyaA",
                "Sakuyab": "SakuyaB",
                "Sanaea": "SanaeA",
                "Sanaeaufos": "SanaeAUFOs",
                "Sanaeb": "SanaeB",
                "Sanaebufos": "SanaeBUFOs",
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
                "Reimuwolf": "ReimuWolf",
                "Reimuotter": "ReimuOtter",
                "Reimueagle": "ReimuEagle",
                "Marisawolf": "MarisaWolf",
                "Marisaotter": "MarisaOtter",
                "Marisaeagle": "MarisaEagle",
                "Youmuwolf": "YoumuWolf",
                "Youmuotter": "YoumuOtter",
                "Youmueagle": "YoumuEagle"
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

            music = "music/" + music;

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
                channel.send(err).catch(console.error);
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
