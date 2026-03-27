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

app.Run();
