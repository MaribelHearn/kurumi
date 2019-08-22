module.exports = {
    generate: function () {
        var WRs = permData.WRs, list = "",  game, abbr, full, shottype, difficulty, wr, score, player, date, shot;

        function sep(num) {
            if (isNaN(num)) {
                return '-';
            }

            num = num.toString();

            if (num.indexOf('.') > -1) {
                var array = num.toString().split('.');

                return array[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + array[1];
            }

            return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }

        function gameAbbr(game) {
            return ({
                "HRtP": 1,
                "SoEW": 2,
                "PoDD": 3,
                "LLS": 4,
                "MS": 5,
                "EoSD": 6,
                "PCB": 7,
                "IN": 8,
                "PoFV": 9,
                "MoF": 10,
                "SA": 11,
                "UFO": 12,
                "GFW": 128,
                "TD": 13,
                "DDC": 14,
                "LoLK": 15,
                "HSiFS": 16,
                "WBaWC": 17
            })[game]
        }

        function fullName(game) {
            return ({
                "HRtP": "The Highly Responsive to Prayers",
                "SoEW": "The Story of Eastern Wonderland",
                "PoDD": "Phantasmagoria of Dim.Dream",
                "LLS": "Lotus Land Story",
                "MS": "Mystic Square",
                "EoSD": "The Embodiment of Scarlet Devil",
                "PCB": "Perfect Cherry Blossom",
                "IN": "Imperishable Night (FinalB)",
                "PoFV": "Phantasmagoria of Flower View",
                "MoF": "Mountain of Faith",
                "SA": "Subterranean Animism",
                "UFO": "Undefined Fantastic Object",
                "GFW": "Great Fairy Wars",
                "TD": "Ten Desires",
                "DDC": "Double Dealing Character",
                "LoLK": "Legacy of Lunatic Kingdom",
                "HSiFS": "Hidden Star in Four Seasons",
                "WBaWC": "Wily Beast and Weakest Creature"
            })[game]
        }

        function routeGame(game) {
            return game == "HRtP" || game == "GFW";
        }

        function diffList(game) {
            var result = "";

            for (difficulty in WRs[game]) {
                result += (game != "GFW" || difficulty != "Extra" ? "<th class='sorttable_numeric'>" + difficulty + "</th>" : "");
            }

            return result;
        }

        function shottypeAbbr(shottype) {
            return ({
                "Reimu": "Re",
                "ReimuA": "RA",
                "ReimuB": "RB",
                "ReimuC": "RC",
                "Marisa": "Ma",
                "MarisaA": "MA",
                "MarisaB": "MB",
                "MarisaC": "MC",
                "Sakuya": "Sa",
                "SakuyaA": "SA",
                "SakuyaB": "SB",
                "Sanae": "Sa",
                "SanaeA": "SA",
                "SanaeB": "SB",
                "BorderTeam": "BT",
                "MagicTeam": "MT",
                "ScarletTeam": "ST",
                "GhostTeam": "GT",
                "Yukari": "Yu",
                "Alice": "Al",
                "Remilia": "Rr",
                "Youmu": "Yo",
                "Yuyuko": "Yy",
                "Reisen": "Ud",
                "Cirno": "Ci",
                "Lyrica": "Ly",
                "Mystia": "My",
                "Tewi": "Te",
                "Aya": "Ay",
                "Medicine": "Me",
                "Yuuka": "Yu",
                "Komachi": "Ko",
                "Eiki": "Ei",
                "A1": "A1",
                "A2": "A2",
                "B1": "B1",
                "B2": "B2",
                "C1": "C1",
                "C2": "C2",
                "-": "tr",
                "ReimuSpring": "RS",
                "ReimuSummer": "RU",
                "ReimuAutumn": "RA",
                "ReimuWinter": "RW",
                "CirnoSpring": "CS",
                "CirnoSummer": "CU",
                "CirnoAutumn": "CA",
                "CirnoWinter": "CW",
                "AyaSpring": "AS",
                "AyaSummer": "AU",
                "AyaAutumn": "AA",
                "AyaWinter": "AW",
                "MarisaSpring": "MS",
                "MarisaSummer": "MU",
                "MarisaAutumn": "MA",
                "MarisaWinter": "MW",
                "ReimuWolf": "RW",
                "ReimuOtter": "RO",
                "ReimuEagle": "RE",
                "MarisaWolf": "MW",
                "MarisaOtter": "MO",
                "MarisaEagle": "ME",
                "YoumuWolf": "YW",
                "YoumuOtter": "YO",
                "YoumuEagle": "YE"
            })[shottype]
        }

        function replayPath(game, difficulty, shottype) {
            var path = "replays/th" + gameAbbr(game) + "_ud" + difficulty.substr(0, 2) + shottypeAbbr(shottype) + ".rpy";

            return fs.existsSync(path) ? path : "";
        }

        function bestSeason(difficulty, shottype) {
            var shottypes = WRs.HSiFS[difficulty], max = 0, season, i;

            for (i in shottypes) {
                if (i.indexOf(shottype) == -1) {
                    continue;
                }

                if (shottypes[i][0] > max) {
                    season = i.replace(shottype, "");
                    max = shottypes[i][0];
                }
            }

            return season;
        }

        String.prototype.removeChar = function () {
            return this.replace("Reimu", "").replace("Cirno", "").replace("Aya", "").replace("Marisa", "")
        };

        String.prototype.removeSeason = function () {
            return this.replace("Spring", "").replace("Summer", "").replace("Autumn", "").replace("Winter", "")
        };

        for (game in WRs) {
            abbr = gameAbbr(game);
            full = fullName(game);
            type = (routeGame(game) ? "Route" : "Shottype");

            // generate HSiFSsmall table
            if (game == "HSiFS") {
                list += "<div id='HSiFSsmall'>" +
                "<p><img src='data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=' data-src='games/" + game.toLowerCase() +
                "50x50.jpg'" + (abbr < 6 ? " class='cover98'" : "") + " alt='" + game +
                " cover'> <span class='th" + abbr +"'>Touhou " + (abbr == 128 ? abbr / 10 : abbr) + " - " + full + "</span></p><table class='sortable'>" +
                "<tr><th class='" + type.toLowerCase() + "'>" + type + "</th>" + diffList(game) + "</tr>";

                for (shottype in {"Reimu": 0, "Cirno": 0, "Aya": 0, "Marisa": 0}) {
                    list += "<tr id='HSiFS" + shottype + "'><td class='" + shottype + "'>" + shottype + "</td>";

                    for (difficulty in WRs.HSiFS) {
                        shot = shottype + (difficulty != "Extra" ? bestSeason(difficulty, shottype) : "");
                        wr = WRs.HSiFS[difficulty][shot];
                        score = wr[0];
                        player = wr[1];
                        date = wr[2];

                        if (wr[3]) {
                            replay = wr[3];
                        } else {
                            replay = (abbr < 6 ? "" : replayPath("HSiFS", difficulty, shot));
                        }

                        list += "<td id='HSiFS" + difficulty + shottype + (difficulty == "Extra" ? "Small" : "") + "'>";

                        if (score > 0) {
                            list += '<a class="replay" href="' + replay + '">' + sep(score) + '</a><br>by <em>' + player +
                            '</em>' + (difficulty != 'Extra' ? ' (' + bestSeason(difficulty, shottype) + ')' : '') +
                            '<span class="datestring" style="display:none"><span class="dimgrey"><br>' + date + '</span></span>';
                        } else {
                            list += "-";
                        }

                        list += "</td>";
                    }

                    list += "</tr>";
                }

                list += "</table></div>";
            }

            list += "<div id='" + game + "'>" +
            "<p><img src='data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=' data-src='games/" + game.toLowerCase() +
            "50x50.jpg'" + (abbr < 6 ? " class='cover98'" : "") + " alt='" + game +
            " cover'> <span class='th" + abbr +"'>Touhou " + (abbr == 128 ? abbr / 10 : abbr) + " - " + full + "</span></p><table class='sortable'>" +
            "<tr><th class='" + type.toLowerCase() + "'>" + type + "</th>" + diffList(game) + "</tr>";

            for (shottype in WRs[game]["Easy"]) {
                if (game == "HSiFS") {
                    list += "<tr id='" + game + shottype + "'><td><span class='" + shottype.removeSeason() + "'>" + shottype.removeSeason() +
                    "</span><span class='" + shottype.removeChar() + "'><br>" + shottype.removeChar() + "</span></td>";
                } else {
                    list += "<tr><td" + (game != "GFW" ? " class='" + shottype + "'" : "") + ">" + shottype.replace("Team", " Team") + "</td>";
                }

                for (difficulty in WRs[game]) {
                    if (game == "GFW" && difficulty == "Extra" || game == "HSiFS" && difficulty == "Extra" && shottype.removeChar() != "Spring") {
                        continue;
                    }

                    shottype = (game == "HSiFS" && difficulty == "Extra" ? shottype.removeSeason() : shottype);
                    wr = WRs[game][difficulty][shottype];
                    score = wr[0];
                    player = wr[1];
                    date = wr[2];

                    if (wr[3]) {
                        replay = wr[3];
                    } else {
                        replay = (abbr < 6 ? "" : replayPath(game, difficulty, shottype));
                    }

                    list += "<td id='" + game + difficulty + shottype +
                    "'" + (game == "HSiFS" && difficulty == "Extra" ? " rowspan='4'" : "") + ">";

                    if (score > 0) {
                        list += '<a class="replay" href="' + replay + '">' + sep(score) + '</a><br>by <em>' + player +
                        '</em><span class="datestring" style="display:none"><span class="dimgrey"><br>' + date +
                        '</span></span>';
                    } else {
                        list += "-";
                    }

                    list += "</td>";
                }

                list += "</tr>";
            }

            //list += (game == "GFW" ? "<tr><td>Extra</td><td id='GFWExtra-' colspan='4'></td></tr>" : "") +
            //"</table>" + (game == "MoF" ? "<p>* This record is suspected of cheating. If it is found to have been cheated, the record will be 2,209,324,900 by nanamaru.</p>" : "") + "</div>";
            list += (game == "GFW" ? "<tr><td>Extra</td><td id='GFWExtra-' colspan='4'><a class=\"replay\" href=\"" + replayPath("GFW", "Extra", "-") + "\">" + sep(WRs.GFW.Extra['-'][0]) +
            "</a><br>by <em>" + WRs.GFW.Extra['-'][1] + "</em><span class=\"datestring\" style=\"display:none\"><span class=\"dimgrey\"><br>" + WRs.GFW.Extra['-'][2] + "</span></span></td></tr>" : "") +
            "</table>" + (game == "MoF" ? "<p>* This record is suspected of cheating. If it is found to have been cheated, the record will be 2,209,324,900 by nanamaru.</p>" : "") + "</div>";
        }

        if (fs.existsSync("../maribelhearn.com")) {
            fs.writeFileSync("../maribelhearn.com/wrlist.html", list);
        }
    }
};
