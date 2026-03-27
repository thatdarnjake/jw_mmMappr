// mmMAPPR v1 - Faherty Family Birthday Chronicle
(function () {
    'use strict';

    const today = new Date();
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

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
            chineseZodiac: getChineseZodiac(bd.getFullYear())
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

    function getChineseZodiac(year) {
        // 1924 is a Rat year (index 0)
        const idx = ((year - 1924) % 12 + 12) % 12;
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

        // --- Top 3 closest birthdays (cluster-deduped) ---
        // Group members by dayOfYear so same-date people form one cluster
        const dateGroups = {};
        members.forEach(m => {
            if (!dateGroups[m.dayOfYear]) dateGroups[m.dayOfYear] = [];
            dateGroups[m.dayOfYear].push(m);
        });
        const uniqueDates = Object.keys(dateGroups).map(Number).sort((a, b) => a - b);

        // Find closest distinct-date pairs
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
        // Also include same-date clusters (dist = 0) where 2+ people share a date
        uniqueDates.forEach(d => {
            if (dateGroups[d].length > 1) {
                datePairs.push({
                    dist: 0,
                    groupA: dateGroups[d],
                    groupB: null // same-date cluster
                });
            }
        });

        datePairs.sort((a, b) => a.dist - b.dist);
        const top3Closest = datePairs.slice(0, 3);

        const closestLines = top3Closest.map(p => {
            if (p.dist === 0 && !p.groupB) {
                // Same-date cluster
                const names = p.groupA.map(m => m.name).join(', ');
                return `${names} — same day! (${formatBdayShort(p.groupA[0])})`;
            } else if (p.dist === 0) {
                const allNames = [...p.groupA, ...p.groupB].map(m => m.name).join(', ');
                return `${allNames} — same day!`;
            } else {
                const namesA = p.groupA.map(m => m.name).join(', ');
                const namesB = p.groupB.map(m => m.name).join(', ');
                return `${namesA} & ${namesB} — ${p.dist}d apart`;
            }
        });

        document.getElementById('closestBdays').innerHTML = closestLines[0] || '';
        document.getElementById('closestDetail').innerHTML = closestLines.slice(1)
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

    // ---- Generation Map ----
    function renderGenMap() {
        const container = document.getElementById('genMap');
        const allYears = members.map(m => m.birthYear);
        const minYear = Math.min(...GENERATIONS.map(g => g.start), ...allYears) - 2;
        const maxYear = Math.max(...GENERATIONS.map(g => g.end), ...allYears) + 2;
        const range = maxYear - minYear;

        container.innerHTML = GENERATIONS.map(gen => {
            const genMembers = members.filter(m => m.birthYear >= gen.start && m.birthYear <= gen.end);
            const leftPct = ((gen.start - minYear) / range) * 100;
            const widthPct = ((gen.end - gen.start) / range) * 100;

            const dots = genMembers.map(m => {
                const line = FAMILY_LINES[m.colorKey] || FAMILY_LINES.Yellow;
                const posPct = ((m.birthYear - minYear) / range) * 100;
                return `<div class="gen-person" style="left:${posPct}%;background:${line.css}" title="${m.name} (${m.birthYear})">
                    <div class="gen-person-tooltip">${esc(m.name)}, ${m.birthYear}<br>Age ${m.age}</div>
                </div>`;
            }).join('');

            return `<div class="gen-row">
                <div class="gen-label" style="color:${gen.color}">${gen.name}</div>
                <div class="gen-years">${gen.start}–${gen.end}</div>
                <div class="gen-bar-container">
                    <div class="gen-bar-fill" style="left:${leftPct}%;width:${widthPct}%;background:${gen.color}"></div>
                    ${dots}
                </div>
                <div style="font-size:0.7rem;color:var(--text-muted);width:30px;text-align:center">${genMembers.length}</div>
            </div>`;
        }).join('');
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
        const zodiacR = 320;   // outermost ring for zodiac
        const outerR = 270;
        const innerR = 175;
        const dotR = 6;

        // Background
        ctx.clearRect(0, 0, size, size);

        // Month arcs
        const monthDays = [31,29,31,30,31,30,31,31,30,31,30,31];
        const totalDays = 366;
        let dayOffset = 0;

        monthDays.forEach((days, i) => {
            const startAngle = (dayOffset / totalDays) * Math.PI * 2 - Math.PI / 2;
            const endAngle = ((dayOffset + days) / totalDays) * Math.PI * 2 - Math.PI / 2;

            ctx.beginPath();
            ctx.arc(cx, cy, outerR, startAngle, endAngle);
            ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = i % 2 === 0 ? '#f0ebe3' : '#e8e3da';
            ctx.fill();
            ctx.strokeStyle = '#d4cfc4';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Month label (between month arc and zodiac arc)
            const midAngle = (startAngle + endAngle) / 2;
            const labelR = zodiacR + 16;
            const lx = cx + Math.cos(midAngle) * labelR;
            const ly = cy + Math.sin(midAngle) * labelR;
            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate(midAngle + Math.PI / 2);
            ctx.fillStyle = '#5a5a72';
            ctx.font = '500 11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(MONTHS[i].slice(0, 3).toUpperCase(), 0, 0);
            ctx.restore();

            dayOffset += days;
        });

        // Zodiac sign arcs (outer ring)
        const zodiacColors = ['#e8d5b7','#d5c4a1','#e8d5b7','#d5c4a1','#e8d5b7','#d5c4a1',
                              '#e8d5b7','#d5c4a1','#e8d5b7','#d5c4a1','#e8d5b7','#d5c4a1'];
        ZODIAC_SIGNS.forEach((z, zi) => {
            const startDOY = dayOfYear(z.startM - 1, z.startD);
            let endDOY = dayOfYear(z.endM - 1, z.endD);
            if (endDOY < startDOY) endDOY += 366; // wraps (Capricorn)

            const startAng = (startDOY / totalDays) * Math.PI * 2 - Math.PI / 2;
            const endAng = ((endDOY % 366) === startDOY ? startDOY + 30 : endDOY) / totalDays * Math.PI * 2 - Math.PI / 2;

            // Draw arc
            ctx.beginPath();
            ctx.arc(cx, cy, zodiacR, startAng, endAng);
            ctx.arc(cx, cy, outerR + 4, endAng, startAng, true);
            ctx.closePath();
            ctx.fillStyle = zodiacColors[zi];
            ctx.fill();
            ctx.strokeStyle = '#c4b99a';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Zodiac symbol label
            const midAng = (startAng + endAng) / 2;
            const symR = (zodiacR + outerR + 4) / 2;
            const sx = cx + Math.cos(midAng) * symR;
            const sy = cy + Math.sin(midAng) * symR;
            ctx.fillStyle = '#6b5c3e';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(z.symbol, sx, sy);
        });

        // Center text
        ctx.fillStyle = '#1a1a2e';
        ctx.font = '600 22px Cinzel, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('Faherty', cx, cy - 12);
        ctx.font = '400 14px Cormorant Garamond, Georgia, serif';
        ctx.fillStyle = '#5a5a72';
        ctx.fillText(`${members.length} Birthdays`, cx, cy + 12);
        ctx.font = 'italic 12px Cormorant Garamond, Georgia, serif';
        ctx.fillStyle = '#8a8aa0';
        ctx.fillText('Around the Year', cx, cy + 30);

        // Plot birthdays
        const positions = [];
        members.forEach(m => {
            const angle = (m.dayOfYear / totalDays) * Math.PI * 2 - Math.PI / 2;
            const line = FAMILY_LINES[m.colorKey] || FAMILY_LINES.Yellow;

            // Spread dots between innerR and outerR based on generation
            const genOffset = m.gen === 0 ? 0.5 : m.gen === 1 ? 0.3 : m.gen === 2 ? 0.6 : 0.85;
            const r = innerR + (outerR - innerR) * genOffset;

            // Jitter to reduce overlap
            const jitter = (Math.random() - 0.5) * 16;
            const px = cx + Math.cos(angle) * (r + jitter);
            const py = cy + Math.sin(angle) * (r + jitter);

            ctx.beginPath();
            ctx.arc(px, py, dotR, 0, Math.PI * 2);
            ctx.fillStyle = line.css;
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();

            positions.push({ x: px, y: py, member: m });
        });

        // Tooltip on hover
        const tooltip = document.getElementById('ringTooltip');
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = size / rect.width;
            const scaleY = size / rect.height;
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;

            let hit = null;
            for (const p of positions) {
                const dx = mx - p.x;
                const dy = my - p.y;
                if (dx * dx + dy * dy < (dotR + 4) * (dotR + 4)) {
                    hit = p;
                    break;
                }
            }

            if (hit) {
                const line = FAMILY_LINES[hit.member.colorKey] || FAMILY_LINES.Yellow;
                tooltip.style.display = 'block';
                tooltip.style.left = (e.clientX - canvas.closest('.calendar-ring-container').getBoundingClientRect().left + 12) + 'px';
                tooltip.style.top = (e.clientY - canvas.closest('.calendar-ring-container').getBoundingClientRect().top - 10) + 'px';
                tooltip.innerHTML = `<strong>${esc(hit.member.name)}</strong><br>${formatBdayShort(hit.member)} (age ${hit.member.age})<br>${hit.member.zodiac.symbol} ${hit.member.zodiac.name} &middot; ${hit.member.chineseZodiac.emoji} ${hit.member.chineseZodiac.name}<br><span style="color:${line.css}">${line.label} line</span>`;
            } else {
                tooltip.style.display = 'none';
            }
        });

        canvas.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
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

    // ---- Init ----
    function init() {
        renderLegend();
        renderSpotlight();
        renderAnalytics();
        renderGenMap();
        renderCalendarRing();
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
