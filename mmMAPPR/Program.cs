using Microsoft.Extensions.Caching.Memory;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Proxy endpoint for daily horoscopes (avoids CORS issues)
app.MapGet("/api/horoscope/{sign}", async (string sign, IHttpClientFactory httpFactory,
    Microsoft.Extensions.Caching.Memory.IMemoryCache cache) =>
{
    var cacheKey = $"horoscope:{sign}:{DateTime.UtcNow:yyyy-MM-dd}";
    if (cache.TryGetValue(cacheKey, out object? cachedObj) && cachedObj is string cached)
        return Results.Content(cached, "application/json");

    try
    {
        var http = httpFactory.CreateClient();
        var response = await http.GetAsync($"https://ohmanda.com/api/horoscope/{sign}/");
        if (!response.IsSuccessStatusCode)
            return Results.StatusCode((int)response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        cache.Set(cacheKey, json, TimeSpan.FromHours(12));
        return Results.Content(json, "application/json");
    }
    catch
    {
        return Results.Problem("Failed to fetch horoscope");
    }
});

// Serve .ics calendar file for Apple Calendar (iOS Safari opens this natively)
app.MapGet("/api/calendar.ics", () =>
{
    var families = new Dictionary<string, string>
    {
        ["Purple"] = "Grandparents", ["Yellow"] = "Tom Faherty", ["Red"] = "Terry Faherty",
        ["Green"] = "Tim Faherty", ["Blue"] = "Kathy & Jeff Wiest", ["Orange"] = "Dennis Faherty"
    };

    var members = new[]
    {
        ("Thomas Faherty", "1915-02-03", "Purple"), ("Mom Mom", "1920-02-15", "Purple"),
        ("Tom Faherty", "1952-03-01", "Yellow"), ("Terry Faherty", "1954-04-11", "Red"),
        ("Tim Faherty", "1955-05-18", "Green"), ("Kathy Wiest", "1956-09-03", "Blue"),
        ("Dennis Faherty", "1958-11-21", "Orange"), ("Barb Faherty", "1952-08-13", "Yellow"),
        ("Jeff Wiest", "1954-10-07", "Blue"), ("Diane Faherty", "1958-11-20", "Orange"),
        ("Gayle Faherty", "1955-10-08", "Green"), ("Jan Faherty", "1954-04-11", "Red"),
        ("Sarah King", "1979-10-03", "Yellow"), ("James King", "1978-12-07", "Yellow"),
        ("Brendan King", "2009-11-05", "Yellow"), ("Meghan King", "2010-08-24", "Yellow"),
        ("Declan King", "2014-05-19", "Yellow"), ("Claire Rascoe", "1981-10-21", "Yellow"),
        ("James Rascoe", "1979-11-02", "Yellow"), ("Nora Rascoe", "2021-05-17", "Yellow"),
        ("Ian Rascoe", "2015-06-30", "Yellow"), ("Mike Faherty", "1984-08-12", "Yellow"),
        ("Kara Faherty", "1984-04-10", "Yellow"), ("Nate Faherty", "2014-12-08", "Yellow"),
        ("Eve Faherty", "2017-06-17", "Yellow"), ("Noah Faherty", "2021-12-18", "Yellow"),
        ("Emily Rose", "1986-06-20", "Yellow"), ("Jordan Rose", "1987-05-23", "Yellow"),
        ("Keely Rose", "2021-08-10", "Yellow"), ("Milo Rose", "2023-06-30", "Yellow"),
        ("Maura Nimmo", "1991-06-23", "Yellow"), ("Dean Nimmo", "1992-03-18", "Yellow"),
        ("Rory Nimmo", "2022-04-21", "Yellow"), ("Colin Nimmo", "2023-08-03", "Yellow"),
        ("Tessa", "2025-05-14", "Yellow"), ("Katie Faherty", "1983-02-18", "Green"),
        ("Erin Faherty", "1985-04-30", "Green"), ("Chris Faherty", "1985-05-16", "Green"),
        ("Luke Faherty", "2022-10-11", "Green"), ("Owen Faherty", "2025-06-30", "Green"),
        ("Christie Goldstein", "1986-08-24", "Blue"), ("Jeff Goldstein", "1990-03-17", "Blue"),
        ("Jack Goldstein", "2022-07-31", "Blue"), ("Will Goldstein", "2025-04-02", "Blue"),
        ("Jake Wiest", "1989-01-11", "Blue"), ("Lauren Peczkowski", "1989-01-19", "Blue"),
        ("Paul Faherty", "1999-11-18", "Orange"), ("Maeve Faherty", "2001-08-02", "Orange")
    };

    var sb = new System.Text.StringBuilder();
    sb.Append("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//mmMAPPR//Faherty Birthdays//EN\r\nCALSCALE:GREGORIAN\r\nX-WR-CALNAME:Faherty Birthdays\r\n");

    var now = DateTime.UtcNow;
    var stamp = now.ToString("yyyyMMdd'T'HHmmss'Z'");

    foreach (var (name, bday, color) in members)
    {
        var parts = bday.Split('-');
        var mm = parts[1];
        var dd = parts[2];
        var year = now.Year;
        var uid = name.Replace(" ", "-").ToLowerInvariant();
        var line = families.GetValueOrDefault(color, "");

        sb.Append($"BEGIN:VEVENT\r\nDTSTAMP:{stamp}\r\nDTSTART;VALUE=DATE:{year}{mm}{dd}\r\nDTEND;VALUE=DATE:{year}{mm}{dd}\r\nRRULE:FREQ=YEARLY\r\nSUMMARY:{name}'s Birthday\r\nDESCRIPTION:Born {bday} - {line} family line\r\nUID:mmmappr-{uid}@faherty\r\nEND:VEVENT\r\n");
    }

    sb.Append("END:VCALENDAR\r\n");

    return Results.File(
        System.Text.Encoding.UTF8.GetBytes(sb.ToString()),
        "text/calendar",
        "faherty-birthdays.ics");
});

app.Run();
