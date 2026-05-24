using System.Reflection;
using CompanyName.MyMeetings.API.Configuration.Swagger;
using Microsoft.OpenApi.Models;

namespace CompanyName.MyMeetings.API.Configuration.Extensions;

internal static class SwaggerExtensions
{
    internal static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Yet Another RTC Chat – REST API",
                Version = "v1",
                Description = "Room management HTTP endpoints."
            });

            options.SwaggerDoc("signalr", new OpenApiInfo
            {
                Title = "Yet Another RTC Chat – SignalR Hubs",
                Version = "v1",
                Description =
                    "Real-time hub methods.\n\n" +
                    "Connect via WebSocket using a SignalR client library. " +
                    "Pass the JWT bearer token as `?access_token=<token>` in the WebSocket URL — " +
                    "browser WebSocket handshakes cannot set the Authorization header.\n\n" +
                    "**Hubs:**\n" +
                    "- `/hubs/rooms` — room join/leave (new)\n" +
                    "- `/hubs/signaling` — WebRTC signaling + deprecated room CRUD"
            });

            // REST controller endpoints belong only to the "v1" doc.
            // The "signalr" doc is populated exclusively by SignalRDocumentFilter.
            options.DocInclusionPredicate((docName, _) => docName == "v1");

            options.DocumentFilter<SignalRDocumentFilter>();

            options.CustomSchemaIds(t => t.ToString());

            var xmlFile = Path.Combine(
                AppDomain.CurrentDomain.BaseDirectory,
                $"{Assembly.GetExecutingAssembly().GetName().Name}.xml");

            if (File.Exists(xmlFile))
            {
                options.IncludeXmlComments(xmlFile);
            }

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT bearer token. Example: \"Bearer {token}\"",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        },
                        Scheme = "oauth2",
                        Name = "Bearer",
                        In = ParameterLocation.Header
                    },
                    new List<string>()
                }
            });
        });

        return services;
    }

    internal static IApplicationBuilder UseSwaggerDocumentation(this IApplicationBuilder app)
    {
        app.UseSwagger();

        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "REST API v1");
            options.SwaggerEndpoint("/swagger/signalr/swagger.json", "SignalR Hubs");
            options.RoutePrefix = "swagger";
        });

        return app;
    }
}
