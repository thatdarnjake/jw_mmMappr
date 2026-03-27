FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY mmMAPPR/mmMAPPR.csproj mmMAPPR/
RUN dotnet restore mmMAPPR/mmMAPPR.csproj
COPY mmMAPPR/ mmMAPPR/
RUN dotnet publish mmMAPPR/mmMAPPR.csproj -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "mmMAPPR.dll"]
