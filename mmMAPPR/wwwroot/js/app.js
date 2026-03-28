// mm/Mappr v1 - Faherty Family Birthday Chronicle
(function () {
    'use strict';

    const today = new Date();
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    // Daily horoscope cache (loaded once on init)
    const horoscopes = {};

    async function loadHoroscopes() {
        const signs = ['aries','taurus','gemini','cancer','leo','virgo',
                       'libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
        const todayStr = today.toISOString().slice(0, 10);

        for (const sign of signs) {
            try {
                const res = await fetch(`/api/horoscope/${sign}`);
                if (res.ok) {
                    const data = await res.json();
                    horoscopes[sign] = data.horoscope || '';
                }
            } catch (e) {
                // Silently fail - horoscopes are optional
            }
        }
    }

    // Lunar New Year dates (month, day) for each year
    // Before this date = previous lunar year's animal
    const LNY_DATES = {
        1913:[2,6],1914:[1,26],1915:[2,14],1916:[2,3],1917:[1,23],1918:[2,11],1919:[2,1],1920:[2,20],
        1921:[2,8],1922:[1,28],1923:[2,16],1924:[2,5],1925:[1,24],1926:[2,13],1927:[2,2],1928:[1,23],
        1929:[2,10],1930:[1,30],1931:[2,17],1932:[2,6],1933:[1,26],1934:[2,14],1935:[2,4],1936:[1,24],
        1937:[2,11],1938:[1,31],1939:[2,19],1940:[2,8],1941:[1,27],1942:[2,15],1943:[2,5],1944:[1,25],
        1945:[2,13],1946:[2,2],1947:[1,22],1948:[2,10],1949:[1,29],1950:[2,17],1951:[2,6],1952:[1,27],
        1953:[2,14],1954:[2,3],1955:[1,24],1956:[2,12],1957:[1,31],1958:[2,18],1959:[2,8],1960:[1,28],
        1961:[2,15],1962:[2,5],1963:[1,25],1964:[2,13],1965:[2,2],1966:[1,21],1967:[2,9],1968:[1,30],
        1969:[2,17],1970:[2,6],1971:[1,27],1972:[2,15],1973:[2,3],1974:[1,23],1975:[2,11],1976:[1,31],
        1977:[2,18],1978:[2,7],1979:[1,28],1980:[2,16],1981:[2,5],1982:[1,25],1983:[2,13],1984:[2,2],
        1985:[2,20],1986:[2,9],1987:[1,29],1988:[2,17],1989:[2,6],1990:[1,27],1991:[2,15],1992:[2,4],
        1993:[1,23],1994:[2,10],1995:[1,31],1996:[2,19],1997:[2,7],1998:[1,28],1999:[2,16],2000:[2,5],
        2001:[1,24],2002:[2,12],2003:[2,1],2004:[1,22],2005:[2,9],2006:[1,29],2007:[2,18],2008:[2,7],
        2009:[1,26],2010:[2,14],2011:[2,3],2012:[1,23],2013:[2,10],2014:[1,31],2015:[2,19],2016:[2,8],
        2017:[1,28],2018:[2,16],2019:[2,5],2020:[1,25],2021:[2,12],2022:[2,1],2023:[1,22],2024:[2,10],
        2025:[1,29],2026:[2,17]
    };

    // Parse all members
    const members = FAMILY_DATA.map(d => {
        const bd = new Date(d.birthday + 'T00:00:00');
        return {
            ...d,
            bd,
            month: bd.getMonth(),
            day: bd.getDate(),
            birthYear: bd.getFullYear(),
            age: calcAge(bd),
            dayOfYear: dayOfYear(bd.getMonth(), bd.getDate()),
            colorKey: d.color.charAt(0).toUpperCase() + d.color.slice(1).toLowerCase(),
            zodiac: getZodiac(bd.getMonth(), bd.getDate()),
            chineseZodiac: getChineseZodiac(bd.getFullYear(), bd.getMonth(), bd.getDate())
        };
    });

    function calcAge(bd) {
        let age = today.getFullYear() - bd.getFullYear();
        const m = today.getMonth() - bd.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
        return age;
    }

    function dayOfYear(month, day) {
        return Math.floor((Date.UTC(2024, month, day) - Date.UTC(2024, 0, 1)) / 86400000);
    }

    function formatDate(bd) {
        return `${MONTHS[bd.getMonth()]} ${bd.getDate()}, ${bd.getFullYear()}`;
    }

    function formatBdayShort(m) {
        return `${MONTHS[m.month]} ${m.day}`;
    }

    function getZodiac(month, day) {
        // month is 0-indexed, zodiac data uses 1-indexed
        const m = month + 1;
        for (const z of ZODIAC_SIGNS) {
            if (z.startM === z.endM) {
                if (m === z.startM && day >= z.startD && day <= z.endD) return z;
            } else if (z.startM > z.endM) {
                // Wraps year (Capricorn: Dec 22 - Jan 19)
                if ((m === z.startM && day >= z.startD) || (m === z.endM && day <= z.endD)) return z;
            } else {
                if ((m === z.startM && day >= z.startD) || (m === z.endM && day <= z.endD)) return z;
            }
        }
        return ZODIAC_SIGNS[0]; // fallback
    }

    function getChineseZodiac(year, month, day) {
        // Check if born before Lunar New Year — if so, use previous year's animal
        let lunarYear = year;
        const lny = LNY_DATES[year];
        if (lny) {
            const m = month + 1; // month is 0-indexed
            if (m < lny[0] || (m === lny[0] && day < lny[1])) {
                lunarYear = year - 1;
            }
        }
        const idx = ((lunarYear - 1924) % 12 + 12) % 12;
        return CHINESE_ZODIAC[idx];
    }

    // ---- Legend ----
    function renderLegend() {
        const el = document.getElementById('legend');
        el.innerHTML = Object.entries(FAMILY_LINES).map(([key, val]) =>
            `<div class="legend-item">
                <span class="legend-dot" style="background:${val.css}"></span>
                ${val.label}
            </div>`
        ).join('');
    }

    // ---- Spotlight: recent & next birthdays ----
    function renderSpotlight() {
        const todayDOY = dayOfYear(today.getMonth(), today.getDate());

        const withDist = members.map(m => {
            let daysUntil = m.dayOfYear - todayDOY;
            if (daysUntil < 0) daysUntil += 366;
            let daysSince = todayDOY - m.dayOfYear;
            if (daysSince < 0) daysSince += 366;
            return { ...m, daysUntil, daysSince };
        });

        // Most recent (smallest daysSince, but > 0 unless today)
        const past = withDist.filter(m => m.daysSince >= 0).sort((a, b) => a.daysSince - b.daysSince);
        const upcoming = withDist.filter(m => m.daysUntil > 0).sort((a, b) => a.daysUntil - b.daysUntil);

        const recent = past[0];
        const next1 = upcoming[0];
        const next2 = upcoming[1];

        const container = document.querySelector('.spotlight-inner');
        const cards = [];

        if (recent) {
            const isToday = recent.daysSince === 0;
            cards.push(makeSpotlightCard(recent, 'recent',
                isToday ? 'Birthday Today!' : `Most Recent Birthday (${recent.daysSince}d ago)`));
        }
        if (next1) cards.push(makeSpotlightCard(next1, 'next', `Next Up (in ${next1.daysUntil}d)`));
        if (next2) cards.push(makeSpotlightCard(next2, 'next', `After That (in ${next2.daysUntil}d)`));

        container.innerHTML = cards.join('');
    }

    function makeSpotlightCard(m, type, label) {
        const line = FAMILY_LINES[m.colorKey] || FAMILY_LINES.Yellow;
        const turningAge = type === 'next' ? m.age + 1 : m.age;
        return `<div class="spotlight-card ${type}">
            <div class="spotlight-label ${type}">${label}</div>
            <div class="spotlight-name">${esc(m.name)}</div>
            <div class="spotlight-date">${formatBdayShort(m)}</div>
            <div class="spotlight-age">${type === 'recent' ? `Turned ${m.age}` : `Turning ${turningAge}`}</div>
            <div class="spotlight-line-dot" style="background:${line.css}"></div>
        </div>`;
    }

    // ---- Analytics ----
    function renderAnalytics() {
        // --- Top 3 months ---
        const monthCounts = {};
        members.forEach(m => { monthCounts[m.month] = (monthCounts[m.month] || 0) + 1; });
        const topMonths = Object.entries(monthCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
        document.getElementById('popularMonth').innerHTML = topMonths
            .map((e, i) => `<span style="font-size:${i === 0 ? '1.4rem' : '1rem'}">${MONTHS[e[0]]}</span>`).join(' &middot; ');
        document.getElementById('popularMonthDetail').textContent =
            topMonths.map(e => `${MONTHS[e[0]]}: ${e[1]}`).join(', ') +
            ` — ${Object.keys(monthCounts).length} of 12 months represented`;

        // --- Top 3 zodiac signs ---
        const zodiacCounts = {};
        members.forEach(m => {
            const z = m.zodiac.name;
            zodiacCounts[z] = zodiacCounts[z] || { sign: m.zodiac, count: 0 };
            zodiacCounts[z].count++;
        });
        const topZodiac = Object.values(zodiacCounts).sort((a, b) => b.count - a.count).slice(0, 3);
        document.getElementById('topZodiac').innerHTML = topZodiac
            .map((z, i) => `<span style="font-size:${i === 0 ? '1.4rem' : '1rem'}">${z.sign.symbol} ${z.sign.name}</span>`).join(' &middot; ');
        document.getElementById('zodiacDetail').textContent =
            topZodiac.map(z => `${z.sign.name}: ${z.count}`).join(', ');

        // --- Top 3 Chinese zodiac animals ---
        const czCounts = {};
        members.forEach(m => {
            const c = m.chineseZodiac.name;
            czCounts[c] = czCounts[c] || { animal: m.chineseZodiac, count: 0 };
            czCounts[c].count++;
        });
        const topCZ = Object.values(czCounts).sort((a, b) => b.count - a.count).slice(0, 3);
        document.getElementById('topChinese').innerHTML = topCZ
            .map((c, i) => `<span style="font-size:${i === 0 ? '1.4rem' : '1rem'}">${c.animal.emoji} ${c.animal.name}</span>`).join(' &middot; ');
        document.getElementById('chineseDetail').textContent =
            topCZ.map(c => `${c.animal.name}: ${c.count}`).join(', ');

        // --- Most popular days of the month ---
        const dayCounts = {};
        members.forEach(m => { dayCounts[m.day] = (dayCounts[m.day] || 0) + 1; });
        const topDays = Object.entries(dayCounts).sort((a, b) => b[1] - a[1]);
        const maxDayCount = topDays[0] ? topDays[0][1] : 0;
        const topDaysTied = topDays.filter(d => parseInt(d[1]) === maxDayCount);
        const top3Days = topDays.slice(0, 3);

        function ordinal(n) {
            const s = ['th','st','nd','rd'];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        }

        document.getElementById('popularDays').innerHTML = top3Days
            .map((d, i) => `<span style="font-size:${i === 0 ? '1.4rem' : '1rem'}">${ordinal(parseInt(d[0]))}</span>`).join(' &middot; ');

        // Build detail: show who shares each top day
        const dayDetailParts = top3Days.map(d => {
            const dayNum = parseInt(d[0]);
            const who = members.filter(m => m.day === dayNum).map(m => m.name.split(' ')[0]);
            return `${ordinal(dayNum)}: ${d[1]} (${who.join(', ')})`;
        });
        document.getElementById('popularDaysDetail').textContent = dayDetailParts.join(' | ');

        // --- Closest birthdays (all same-date + top 3 nearest) ---
        const dateGroups = {};
        members.forEach(m => {
            if (!dateGroups[m.dayOfYear]) dateGroups[m.dayOfYear] = [];
            dateGroups[m.dayOfYear].push(m);
        });
        const uniqueDates = Object.keys(dateGroups).map(Number).sort((a, b) => a - b);

        // All same-date clusters
        const sameDateLines = [];
        uniqueDates.forEach(d => {
            if (dateGroups[d].length > 1) {
                const names = dateGroups[d].map(m => m.name).join(', ');
                sameDateLines.push(`${names} — same day! (${formatBdayShort(dateGroups[d][0])})`);
            }
        });

        // Closest distinct-date pairs (excluding same-date)
        const datePairs = [];
        for (let i = 0; i < uniqueDates.length; i++) {
            for (let j = i + 1; j < uniqueDates.length; j++) {
                let diff = Math.abs(uniqueDates[i] - uniqueDates[j]);
                diff = Math.min(diff, 366 - diff);
                datePairs.push({
                    dist: diff,
                    groupA: dateGroups[uniqueDates[i]],
                    groupB: dateGroups[uniqueDates[j]]
                });
            }
        }
        datePairs.sort((a, b) => a.dist - b.dist);
        const top3Near = datePairs.slice(0, 3).map(p => {
            const namesA = p.groupA.map(m => m.name).join(', ');
            const namesB = p.groupB.map(m => m.name).join(', ');
            return `${namesA} & ${namesB} — ${p.dist}d apart`;
        });

        const allClosest = [...sameDateLines, ...top3Near];
        document.getElementById('closestBdays').innerHTML = allClosest[0] || '';
        document.getElementById('closestDetail').innerHTML = allClosest.slice(1)
            .map(l => `<div style="margin-top:4px">${esc(l)}</div>`).join('');

        // --- Loneliest birthday ---
        let loneliestMember = null;
        let maxMinDist = 0;
        members.forEach(m => {
            let minDist = 366;
            members.forEach(other => {
                if (other === m) return;
                let diff = Math.abs(m.dayOfYear - other.dayOfYear);
                diff = Math.min(diff, 366 - diff);
                if (diff < minDist) minDist = diff;
            });
            if (minDist > maxMinDist) {
                maxMinDist = minDist;
                loneliestMember = m;
            }
        });
        if (loneliestMember) {
            document.getElementById('loneliestBday').textContent = loneliestMember.name;
            document.getElementById('loneliestDetail').textContent =
                `${formatBdayShort(loneliestMember)} — nearest family birthday is ${maxMinDist} days away`;
        }

        // --- Member count ---
        document.getElementById('memberCount').textContent = members.length;
        const genCounts = {};
        members.forEach(m => { genCounts[m.gen] = (genCounts[m.gen] || 0) + 1; });
        document.getElementById('countDetail').textContent =
            `${genCounts[3] || 0} great-grandchildren, ${genCounts[2] || 0} grandchildren & spouses, ${genCounts[1] || 0} children & spouses`;
    }

    // ---- Generation Map (Canvas) ----
    function renderGenMap() {
        const canvas = document.getElementById('genCanvas');
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const W = 900;
        const H = 340;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.scale(dpr, dpr);

        const allYears = members.map(m => m.birthYear);
        const minYear = Math.min(...GENERATIONS.map(g => g.start), ...allYears) - 2;
        const maxYear = Math.max(...GENERATIONS.map(g => g.end), ...allYears) + 2;
        const range = maxYear - minYear;

        const leftPad = 120;  // space for labels
        const rightPad = 40;
        const topPad = 15;
        const barW = W - leftPad - rightPad;
        const rowH = 42;
        const barH = 28;
        const dotR = 6;

        function yearToX(year) {
            return leftPad + ((year - minYear) / range) * barW;
        }

        ctx.clearRect(0, 0, W, H);

        // Store dot positions for hover
        const dotPositions = [];

        GENERATIONS.forEach((gen, gi) => {
            const y = topPad + gi * rowH;
            const barY = y + (rowH - barH) / 2;
            const genMembers = members.filter(m => m.birthYear >= gen.start && m.birthYear <= gen.end);

            // Generation label
            ctx.fillStyle = gen.color;
            ctx.font = '600 11px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(gen.name, leftPad - 14, y + rowH / 2);

            // Year range
            ctx.fillStyle = '#8a8aa0';
            ctx.font = '400 9px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${gen.start}–${gen.end}`, yearToX(maxYear) + 8, y + rowH / 2);

            // Background bar (full width)
            ctx.fillStyle = '#f0ebe3';
            ctx.beginPath();
            ctx.roundRect(leftPad, barY, barW, barH, barH / 2);
            ctx.fill();
            ctx.strokeStyle = '#e0dbd2';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Generation fill bar
            const x1 = yearToX(gen.start);
            const x2 = yearToX(gen.end);
            ctx.fillStyle = gen.color;
            ctx.globalAlpha = 0.12;
            ctx.beginPath();
            ctx.roundRect(x1, barY, x2 - x1, barH, barH / 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            // Count badge
            if (genMembers.length > 0) {
                ctx.fillStyle = gen.color;
                ctx.globalAlpha = 0.15;
                ctx.beginPath();
                ctx.roundRect(leftPad - 12, barY + 2, 22, barH - 4, 4);
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.fillStyle = gen.color;
                ctx.font = 'bold 9px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(genMembers.length, leftPad - 1, y + rowH / 2 + 1);
            }

            // Dots for members
            genMembers.forEach((m, mi) => {
                const line = FAMILY_LINES[m.colorKey] || FAMILY_LINES.Yellow;
                const dx = yearToX(m.birthYear);
                // Jitter vertically to reduce overlap
                const jitter = ((Math.sin(mi * 97.1 + gi * 43.7) * 43758.5453) % 1) * (barH - dotR * 2 - 4);
                const dy = barY + dotR + 2 + jitter;

                ctx.beginPath();
                ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
                ctx.fillStyle = line.css;
                ctx.fill();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();

                dotPositions.push({ x: dx, y: dy, member: m, gen });
            });
        });

        // Hover tooltip (position: fixed so nothing can clip it)
        const tooltip = document.getElementById('genTooltip');

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = W / rect.width;
            const scaleY = H / rect.height;
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;

            let hit = null;
            for (const p of dotPositions) {
                const dx = mx - p.x;
                const dy = my - p.y;
                if (dx * dx + dy * dy < (dotR + 5) * (dotR + 5)) {
                    hit = p;
                    break;
                }
            }

            if (hit) {
                const m = hit.member;
                const line = FAMILY_LINES[m.colorKey] || FAMILY_LINES.Yellow;
                tooltip.style.display = 'block';
                tooltip.style.left = (e.clientX + 14) + 'px';
                tooltip.style.top = (e.clientY - 14) + 'px';
                tooltip.innerHTML = `<strong>${esc(m.name)}</strong><br>${m.birthYear} &middot; Age ${m.age}<br><span style="color:${line.css}">${line.label} line</span><br><span style="color:${hit.gen.color}">${hit.gen.name}</span>`;
            } else {
                tooltip.style.display = 'none';
            }
        });

        canvas.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
    }

    // ---- Calendar Ring (Canvas) ----
    function renderCalendarRing() {
        const canvas = document.getElementById('calendarRing');
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const size = 700;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const zodiacR = 320;
        const outerR = 270;
        const innerR = 175;
        const dotR = 6;
        const monthDays = [31,29,31,30,31,30,31,31,30,31,30,31];
        const totalDays = 366;

        // Pre-compute stable jitter per member (seeded by index)
        const jitters = members.map((_, i) => ((Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1) * 16 - 8);

        // Pre-compute member positions
        const positions = members.map((m, i) => {
            const angle = (m.dayOfYear / totalDays) * Math.PI * 2 - Math.PI / 2;
            const genOffset = m.gen === 0 ? 0.5 : m.gen === 1 ? 0.3 : m.gen === 2 ? 0.6 : 0.85;
            const r = innerR + (outerR - innerR) * genOffset + jitters[i];
            return {
                x: cx + Math.cos(angle) * r,
                y: cy + Math.sin(angle) * r,
                member: m
            };
        });

        // Pre-compute zodiac arc geometries for hit detection
        const zodiacArcs = ZODIAC_SIGNS.map(z => {
            const startDOY = dayOfYear(z.startM - 1, z.startD);
            let endDOY = dayOfYear(z.endM - 1, z.endD);
            if (endDOY < startDOY) endDOY += 366;
            const startAng = (startDOY / totalDays) * Math.PI * 2 - Math.PI / 2;
            const endAng = (endDOY / totalDays) * Math.PI * 2 - Math.PI / 2;
            return { sign: z, startAng, endAng, startDOY, endDOY };
        });

        // Mom Mom's birthday marker
        const momMom = members.find(m => m.name === 'Mom Mom');

        // Lunar New Year 2026: Feb 17
        const lnyDOY = dayOfYear(1, 17); // Feb 17

        // --- Draw function (called on hover changes) ---
        let highlightZodiacIdx = -1;

        function draw() {
            ctx.clearRect(0, 0, size, size);

            // Month arcs
            let dayOff = 0;
            monthDays.forEach((days, i) => {
                const sa = (dayOff / totalDays) * Math.PI * 2 - Math.PI / 2;
                const ea = ((dayOff + days) / totalDays) * Math.PI * 2 - Math.PI / 2;

                ctx.beginPath();
                ctx.arc(cx, cy, outerR, sa, ea);
                ctx.arc(cx, cy, innerR, ea, sa, true);
                ctx.closePath();
                ctx.fillStyle = i % 2 === 0 ? '#f0ebe3' : '#e8e3da';
                ctx.fill();
                ctx.strokeStyle = '#d4cfc4';
                ctx.lineWidth = 0.5;
                ctx.stroke();

                // Month label
                const mid = (sa + ea) / 2;
                const lr = zodiacR + 16;
                ctx.save();
                ctx.translate(cx + Math.cos(mid) * lr, cy + Math.sin(mid) * lr);
                ctx.rotate(mid + Math.PI / 2);
                ctx.fillStyle = '#5a5a72';
                ctx.font = '500 11px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(MONTHS[i].slice(0, 3).toUpperCase(), 0, 0);
                ctx.restore();

                dayOff += days;
            });

            // Zodiac arcs
            zodiacArcs.forEach((za, zi) => {
                const isHl = zi === highlightZodiacIdx;
                ctx.beginPath();
                ctx.arc(cx, cy, zodiacR, za.startAng, za.endAng);
                ctx.arc(cx, cy, outerR + 4, za.endAng, za.startAng, true);
                ctx.closePath();
                ctx.fillStyle = isHl ? '#d4b896' : (zi % 2 === 0 ? '#e8d5b7' : '#d5c4a1');
                ctx.fill();
                ctx.strokeStyle = isHl ? '#a08050' : '#c4b99a';
                ctx.lineWidth = isHl ? 1.5 : 0.5;
                ctx.stroke();

                // Symbol
                const mid = (za.startAng + za.endAng) / 2;
                const symR = (zodiacR + outerR + 4) / 2;
                ctx.fillStyle = isHl ? '#4a3a20' : '#6b5c3e';
                ctx.font = isHl ? 'bold 16px sans-serif' : '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(za.sign.symbol, cx + Math.cos(mid) * symR, cy + Math.sin(mid) * symR);

                // Date labels at start and end of each arc
                // Start date
                const sdR = zodiacR + 4;
                ctx.save();
                ctx.translate(cx + Math.cos(za.startAng) * sdR, cy + Math.sin(za.startAng) * sdR);
                ctx.rotate(za.startAng + Math.PI / 2);
                ctx.fillStyle = '#9a8a70';
                ctx.font = '500 7px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const sLabel = `${za.sign.startM}/${za.sign.startD}`;
                ctx.fillText(sLabel, 0, 0);
                ctx.restore();
            });

            // Lunar New Year marker
            const lnyAng = (lnyDOY / totalDays) * Math.PI * 2 - Math.PI / 2;
            const lnyR1 = outerR + 2;
            const lnyR2 = zodiacR + 2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(lnyAng) * lnyR1, cy + Math.sin(lnyAng) * lnyR1);
            ctx.lineTo(cx + Math.cos(lnyAng) * lnyR2, cy + Math.sin(lnyAng) * lnyR2);
            ctx.strokeStyle = '#dc2626';
            ctx.lineWidth = 2;
            ctx.stroke();
            // LNY label
            const lnyLx = cx + Math.cos(lnyAng) * (zodiacR + 32);
            const lnyLy = cy + Math.sin(lnyAng) * (zodiacR + 32);
            ctx.save();
            ctx.translate(lnyLx, lnyLy);
            ctx.rotate(lnyAng + Math.PI / 2);
            ctx.fillStyle = '#dc2626';
            ctx.font = 'bold 8px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('LNY 2026', 0, 0);
            ctx.restore();

            // Center text
            ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = '#1a1a2e';
            ctx.font = '600 22px Space Grotesk, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Faherty', cx, cy - 12);
            ctx.font = '400 14px Cormorant Garamond, Georgia, serif';
            ctx.fillStyle = '#5a5a72';
            ctx.fillText(`${members.length} Birthdays`, cx, cy + 12);
            ctx.font = 'italic 12px Cormorant Garamond, Georgia, serif';
            ctx.fillStyle = '#8a8aa0';
            ctx.fillText('Around the Year', cx, cy + 30);

            // If zodiac highlighted, show sign name + dates in center
            if (highlightZodiacIdx >= 0) {
                const hz = ZODIAC_SIGNS[highlightZodiacIdx];
                const hMembers = members.filter(m => m.zodiac.name === hz.name);
                ctx.font = '500 13px Inter, sans-serif';
                ctx.fillStyle = '#4a3a20';
                ctx.fillText(`${hz.symbol} ${hz.name}`, cx, cy + 52);
                ctx.font = '400 10px Inter, sans-serif';
                ctx.fillStyle = '#8a8aa0';
                ctx.fillText(`${MONTHS[hz.startM-1]} ${hz.startD} – ${MONTHS[hz.endM-1]} ${hz.endD}`, cx, cy + 66);
                ctx.font = '400 10px Inter, sans-serif';
                ctx.fillStyle = '#5a5a72';
                ctx.fillText(`${hMembers.length} member${hMembers.length !== 1 ? 's' : ''}`, cx, cy + 80);
            }

            // Plot birthday dots
            const hlSign = highlightZodiacIdx >= 0 ? ZODIAC_SIGNS[highlightZodiacIdx].name : null;

            positions.forEach(p => {
                const m = p.member;
                const line = FAMILY_LINES[m.colorKey] || FAMILY_LINES.Yellow;
                const isMomMom = m.name === 'Mom Mom';
                const isHighlighted = hlSign && m.zodiac.name === hlSign;
                const isDimmed = hlSign && !isHighlighted;

                const r = isDimmed ? dotR - 1 : (isHighlighted ? dotR + 3 : dotR);
                const alpha = isDimmed ? 0.2 : 1;

                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                ctx.fillStyle = line.css;
                ctx.fill();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Mom Mom special marker - gold ring + star
                if (isMomMom) {
                    ctx.globalAlpha = 1;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, dotR + 5, 0, Math.PI * 2);
                    ctx.strokeStyle = '#daa520';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    // Small label
                    ctx.fillStyle = '#b8860b';
                    ctx.font = 'bold 8px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText('Mom Mom', p.x, p.y - dotR - 7);
                    ctx.textBaseline = 'alphabetic';
                }

                ctx.globalAlpha = 1;

                // Show name labels when zodiac highlighted
                if (isHighlighted) {
                    ctx.fillStyle = '#1a1a2e';
                    ctx.font = '500 8px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(m.name.split(' ')[0], p.x, p.y - r - 3);
                    ctx.textBaseline = 'alphabetic';
                }
            });
        }

        draw();

        // --- Hover interaction ---
        const tooltip = document.getElementById('ringTooltip');
        const containerEl = canvas.closest('.calendar-ring-container');

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = size / rect.width;
            const scaleY = size / rect.height;
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;

            // Check birthday dot hit
            let dotHit = null;
            for (const p of positions) {
                const dx = mx - p.x;
                const dy = my - p.y;
                if (dx * dx + dy * dy < (dotR + 4) * (dotR + 4)) {
                    dotHit = p;
                    break;
                }
            }

            if (dotHit) {
                const line = FAMILY_LINES[dotHit.member.colorKey] || FAMILY_LINES.Yellow;
                tooltip.style.display = 'block';
                tooltip.style.left = (e.clientX - containerEl.getBoundingClientRect().left + 12) + 'px';
                tooltip.style.top = (e.clientY - containerEl.getBoundingClientRect().top - 10) + 'px';
                tooltip.innerHTML = `<strong>${esc(dotHit.member.name)}</strong><br>${formatBdayShort(dotHit.member)} (age ${dotHit.member.age})<br>${dotHit.member.zodiac.symbol} ${dotHit.member.zodiac.name} &middot; ${dotHit.member.chineseZodiac.emoji} ${dotHit.member.chineseZodiac.name}<br><span style="color:${line.css}">${line.label} line</span>`;
                return;
            }

            tooltip.style.display = 'none';

            // Check zodiac arc hit
            const dx = mx - cx;
            const dy = my - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist >= outerR + 4 && dist <= zodiacR) {
                let angle = Math.atan2(dy, dx);
                // Normalize atan2 [-PI,PI] to arc range [-PI/2, 3PI/2)
                if (angle < -Math.PI / 2) angle += Math.PI * 2;

                let prevIdx = highlightZodiacIdx;
                highlightZodiacIdx = -1;

                for (let i = 0; i < zodiacArcs.length; i++) {
                    const za = zodiacArcs[i];
                    let s = za.startAng;
                    let en = za.endAng;
                    // Handle Capricorn wrapping past top of ring
                    if (en < s) en += Math.PI * 2;
                    let a = angle;
                    if (a < s && s > Math.PI) a += Math.PI * 2;
                    if (a >= s && a <= en) {
                        highlightZodiacIdx = i;
                        break;
                    }
                }

                if (highlightZodiacIdx !== prevIdx) draw();

                if (highlightZodiacIdx >= 0) {
                    const hz = ZODIAC_SIGNS[highlightZodiacIdx];
                    const hMembers = members.filter(m => m.zodiac.name === hz.name);
                    tooltip.style.display = 'block';
                    tooltip.style.left = (e.clientX - containerEl.getBoundingClientRect().left + 12) + 'px';
                    tooltip.style.top = (e.clientY - containerEl.getBoundingClientRect().top - 10) + 'px';
                    const horo = horoscopes[hz.name.toLowerCase()];
                    const horoHtml = horo
                        ? `<br><div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.2);font-style:italic;font-size:0.68rem;max-width:280px;line-height:1.4">Today: ${esc(horo)}</div>`
                        : '';
                    tooltip.style.maxWidth = horo ? '320px' : '200px';
                    tooltip.innerHTML = `<strong>${hz.symbol} ${hz.name}</strong><br>${MONTHS[hz.startM-1]} ${hz.startD} – ${MONTHS[hz.endM-1]} ${hz.endD}<br><br>${hMembers.map(m => esc(m.name)).join('<br>')}${horoHtml}`;
                }
            } else {
                if (highlightZodiacIdx !== -1) {
                    highlightZodiacIdx = -1;
                    draw();
                }
            }
        });

        canvas.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
            if (highlightZodiacIdx !== -1) {
                highlightZodiacIdx = -1;
                draw();
            }
        });
    }

    // ---- Age Distribution Chart (Canvas) ----
    function renderAgeChart() {
        const canvas = document.getElementById('ageChart');
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const W = 900;
        const H = 320;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.scale(dpr, dpr);

        // Build age buckets
        const bucketSize = 5;
        const ages = members.map(m => m.age).filter(a => a >= 0);
        const maxAge = Math.max(...ages);
        const bucketCount = Math.ceil((maxAge + 1) / bucketSize);
        const buckets = [];
        for (let i = 0; i < bucketCount; i++) {
            const lo = i * bucketSize;
            const hi = lo + bucketSize - 1;
            const bucketMembers = members.filter(m => m.age >= lo && m.age <= hi && m.age >= 0);
            buckets.push({ lo, hi, members: bucketMembers, count: bucketMembers.length });
        }

        const maxCount = Math.max(...buckets.map(b => b.count));
        const leftPad = 50;
        const rightPad = 30;
        const topPad = 20;
        const bottomPad = 50;
        const chartW = W - leftPad - rightPad;
        const chartH = H - topPad - bottomPad;
        const barGap = 6;
        const barW = (chartW - barGap * (buckets.length - 1)) / buckets.length;

        ctx.clearRect(0, 0, W, H);

        // Y-axis gridlines
        const yTicks = Math.min(maxCount, 6);
        for (let i = 0; i <= yTicks; i++) {
            const val = Math.round((maxCount / yTicks) * i);
            const y = topPad + chartH - (val / maxCount) * chartH;
            ctx.beginPath();
            ctx.moveTo(leftPad, y);
            ctx.lineTo(leftPad + chartW, y);
            ctx.strokeStyle = '#e8e4dc';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = '#8a8aa0';
            ctx.font = '400 10px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(val, leftPad - 8, y);
        }

        // Draw bars
        buckets.forEach((b, i) => {
            const x = leftPad + i * (barW + barGap);
            const barH = b.count > 0 ? (b.count / maxCount) * chartH : 0;
            const y = topPad + chartH - barH;

            // Gradient fill using family line colors of members in bucket
            if (b.count > 0) {
                // Stack segments by family line
                const lineCounts = {};
                b.members.forEach(m => {
                    const key = m.colorKey;
                    lineCounts[key] = (lineCounts[key] || 0) + 1;
                });
                let segY = topPad + chartH;
                Object.entries(lineCounts).forEach(([key, cnt]) => {
                    const segH = (cnt / maxCount) * chartH;
                    segY -= segH;
                    const line = FAMILY_LINES[key] || FAMILY_LINES.Yellow;
                    ctx.fillStyle = line.css;
                    ctx.globalAlpha = 0.75;
                    ctx.beginPath();
                    ctx.roundRect(x, segY, barW, segH, [i === 0 && segY === y ? 4 : 0, i === 0 && segY === y ? 4 : 0, 0, 0]);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                });

                // Count label above bar
                ctx.fillStyle = '#1a1a2e';
                ctx.font = '600 11px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(b.count, x + barW / 2, y - 4);
            }

            // X-axis label
            ctx.fillStyle = '#5a5a72';
            ctx.font = '500 10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            const label = b.lo === b.hi ? `${b.lo}` : `${b.lo}-${b.hi}`;
            ctx.fillText(label, x + barW / 2, topPad + chartH + 8);
        });

        // Axis labels
        ctx.fillStyle = '#8a8aa0';
        ctx.font = '500 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Age Range', leftPad + chartW / 2, H - 6);

        ctx.save();
        ctx.translate(12, topPad + chartH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Members', 0, 0);
        ctx.restore();
    }

    // ---- Birthday Table ----
    function renderTable() {
        const lineFilter = document.getElementById('filterLine').value;
        const genFilter = document.getElementById('filterGen').value;

        // Sort by day-of-year
        let filtered = [...members].sort((a, b) => a.dayOfYear - b.dayOfYear);

        if (lineFilter !== 'all') {
            filtered = filtered.filter(m => m.colorKey.toLowerCase() === lineFilter.toLowerCase());
        }
        if (genFilter !== 'all') {
            filtered = filtered.filter(m => m.gen === parseInt(genFilter));
        }

        const genLabels = { 0: 'Matriarch', 1: 'Children', 2: 'Grandchildren', 3: 'Great-Grandchildren' };

        const tbody = document.getElementById('bdayBody');
        tbody.innerHTML = filtered.map(m => {
            const line = FAMILY_LINES[m.colorKey] || FAMILY_LINES.Yellow;
            const popGen = getPopGeneration(m.birthYear);
            return `<tr>
                <td class="td-name">${esc(m.name)}</td>
                <td>${formatDate(m.bd)}</td>
                <td>${m.age >= 0 ? m.age : 'TBD'}</td>
                <td>${m.zodiac.symbol} ${esc(m.zodiac.name)}</td>
                <td>${m.chineseZodiac.emoji} ${esc(m.chineseZodiac.name)}</td>
                <td>
                    <div class="td-line">
                        <span class="td-line-dot" style="background:${line.css}"></span>
                        <span class="line-tag" style="background:${line.bg};color:${line.css};border:1px solid ${line.border}">${line.label}</span>
                    </div>
                </td>
                <td>${popGen ? popGen.name : genLabels[m.gen] || ''}</td>
            </tr>`;
        }).join('');
    }

    function getPopGeneration(year) {
        return GENERATIONS.find(g => year >= g.start && year <= g.end) || null;
    }

    // ---- Populate filter dropdowns ----
    function initFilters() {
        const lineSelect = document.getElementById('filterLine');
        Object.entries(FAMILY_LINES).forEach(([key, val]) => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = val.label;
            lineSelect.appendChild(opt);
        });

        lineSelect.addEventListener('change', renderTable);
        document.getElementById('filterGen').addEventListener('change', renderTable);
    }

    // ---- Calendar Export ----
    function generateICS() {
        let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//mmMAPPR//Faherty Birthdays//EN\r\nCALSCALE:GREGORIAN\r\n';

        members.forEach(m => {
            const mm = String(m.month + 1).padStart(2, '0');
            const dd = String(m.day).padStart(2, '0');
            const year = today.getFullYear();
            // Recurring annual event
            ics += 'BEGIN:VEVENT\r\n';
            ics += `DTSTART;VALUE=DATE:${year}${mm}${dd}\r\n`;
            ics += `DTEND;VALUE=DATE:${year}${mm}${dd}\r\n`;
            ics += `RRULE:FREQ=YEARLY\r\n`;
            ics += `SUMMARY:${m.name}'s Birthday\r\n`;
            ics += `DESCRIPTION:Born ${formatDate(m.bd)} - ${FAMILY_LINES[m.colorKey]?.label || ''} family line\r\n`;
            ics += `UID:mmmappr-${m.name.replace(/\s/g, '-').toLowerCase()}@faherty\r\n`;
            ics += 'END:VEVENT\r\n';
        });

        ics += 'END:VCALENDAR\r\n';

        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'faherty-birthdays.ics';
        a.click();
        URL.revokeObjectURL(url);
    }

    function exportToGoogle() {
        // Google Calendar doesn't support bulk import via URL, so we offer a helpful approach
        // Generate the ICS file which can be imported into Google Calendar
        const msg = 'To add these birthdays to Google Calendar:\n\n' +
            '1. Click "Export to Outlook (.ics)" to download the file\n' +
            '2. Go to calendar.google.com\n' +
            '3. Click the gear icon > Settings\n' +
            '4. Click "Import & Export" on the left\n' +
            '5. Select the downloaded .ics file\n' +
            '6. Click "Import"\n\n' +
            'All birthdays will be added as recurring annual events!';
        alert(msg);
    }

    // ---- Utility ----
    function esc(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ---- Tab Navigation ----
    function initTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.dataset.view + 'View').classList.add('active');
            });
        });
    }

    // ---- Init ----
    function init() {
        initTabs();
        loadHoroscopes(); // fire-and-forget, loads in background
        renderLegend();
        renderSpotlight();
        renderAnalytics();
        renderGenMap();
        renderCalendarRing();
        renderAgeChart();
        initFilters();
        renderTable();

        document.getElementById('exportICS').addEventListener('click', generateICS);
        document.getElementById('exportGoogle').addEventListener('click', exportToGoogle);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
