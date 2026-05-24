#nullable enable

using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace CompanyName.MyMeetings.API.Configuration.Swagger;

internal class SignalRDocumentFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        if (context.DocumentName != "signalr")
        {
            return;
        }

        swaggerDoc.Tags =
        [
            new OpenApiTag
            {
                Name = "RoomsHub",
                Description = "Connect to `/hubs/rooms`. Pass JWT as `?access_token=` query parameter."
            },
            new OpenApiTag
            {
                Name = "SignalingHub",
                Description = "Connect to `/hubs/signaling`. Pass JWT as `?access_token=` query parameter. Room CRUD methods are deprecated — use the Rooms REST API."
            }
        ];

        AddHubMethod(
            swaggerDoc,
            "/hubs/rooms/JoinRoom",
            "RoomsHub",
            "JoinRoom",
            "Joins a room by ID.\n\n**Callbacks sent by server:**\n- `JoinedRoom(RoomDetailDto)` → caller\n- `ParticipantsList(ParticipantDto[])` → caller\n- `ParticipantJoined(ParticipantDto)` → all others in room",
            new Dictionary<string, OpenApiSchema>
            {
                ["roomId"] = new() { Type = "string", Format = "uuid" }
            });

        AddHubMethod(
            swaggerDoc,
            "/hubs/rooms/LeaveRoom",
            "RoomsHub",
            "LeaveRoom",
            "Leaves the current room.\n\n**Callbacks sent by server:**\n- `ParticipantLeft(userId: Guid)` → all remaining participants",
            null);

        AddHubMethod(
            swaggerDoc,
            "/hubs/signaling/SendOffer",
            "SignalingHub",
            "SendOffer",
            "Forwards a WebRTC SDP offer to a specific peer in the same room.\n\n**Callbacks sent by server:**\n- `ReceiveOffer(fromConnectionId: string, sdp: string)` → target peer",
            new Dictionary<string, OpenApiSchema>
            {
                ["toConnectionId"] = new() { Type = "string" },
                ["sdp"] = new() { Type = "string" }
            });

        AddHubMethod(
            swaggerDoc,
            "/hubs/signaling/SendAnswer",
            "SignalingHub",
            "SendAnswer",
            "Forwards a WebRTC SDP answer to a specific peer.\n\n**Callbacks sent by server:**\n- `ReceiveAnswer(fromConnectionId: string, sdp: string)` → target peer",
            new Dictionary<string, OpenApiSchema>
            {
                ["toConnectionId"] = new() { Type = "string" },
                ["sdp"] = new() { Type = "string" }
            });

        AddHubMethod(
            swaggerDoc,
            "/hubs/signaling/SendIceCandidate",
            "SignalingHub",
            "SendIceCandidate",
            "Forwards a WebRTC ICE candidate to a specific peer.\n\n**Callbacks sent by server:**\n- `ReceiveIceCandidate(fromConnectionId: string, candidate: string)` → target peer",
            new Dictionary<string, OpenApiSchema>
            {
                ["toConnectionId"] = new() { Type = "string" },
                ["candidate"] = new() { Type = "string" }
            });

        AddHubMethod(
            swaggerDoc,
            "/hubs/signaling/CreateRoom",
            "SignalingHub",
            "CreateRoom ⚠ DEPRECATED",
            "**Deprecated.** Use `POST /api/rooms` instead.\n\nCreates a room and returns its `Guid`.",
            null,
            deprecated: true);

        AddHubMethod(
            swaggerDoc,
            "/hubs/signaling/JoinRoom",
            "SignalingHub",
            "JoinRoom ⚠ DEPRECATED",
            "**Deprecated.** Use `/hubs/rooms` instead.\n\nJoins a room.\n\n**Callbacks:** `JoinedRoom`, `ParticipantsList`, `ParticipantJoined`.",
            new Dictionary<string, OpenApiSchema>
            {
                ["roomId"] = new() { Type = "string", Format = "uuid" }
            },
            deprecated: true);

        AddHubMethod(
            swaggerDoc,
            "/hubs/signaling/LeaveRoom",
            "SignalingHub",
            "LeaveRoom ⚠ DEPRECATED",
            "**Deprecated.** Use `/hubs/rooms` instead.\n\nLeaves the current room. Broadcasts `ParticipantLeft`.",
            null,
            deprecated: true);

        AddHubMethod(
            swaggerDoc,
            "/hubs/signaling/CloseRoom",
            "SignalingHub",
            "CloseRoom ⚠ DEPRECATED",
            "**Deprecated.** Use `DELETE /api/rooms/{id}` instead.\n\nCloses a room. Broadcasts `RoomClosed` to all participants.",
            new Dictionary<string, OpenApiSchema>
            {
                ["roomId"] = new() { Type = "string", Format = "uuid" }
            },
            deprecated: true);
    }

    private static void AddHubMethod(
        OpenApiDocument doc,
        string path,
        string tag,
        string summary,
        string? description,
        Dictionary<string, OpenApiSchema>? bodyProperties,
        bool deprecated = false)
    {
        var securityRequirement = new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                },
                []
            }
        };

        var operation = new OpenApiOperation
        {
            Tags = [new OpenApiTag { Name = tag }],
            Summary = summary,
            Description = description,
            Deprecated = deprecated,
            Security = [securityRequirement],
            Responses = new OpenApiResponses
            {
                ["200"] = new OpenApiResponse { Description = "Hub method invoked. See description for server callbacks." }
            }
        };

        if (bodyProperties is { Count: > 0 })
        {
            operation.RequestBody = new OpenApiRequestBody
            {
                Required = true,
                Content = new Dictionary<string, OpenApiMediaType>
                {
                    ["application/json"] = new()
                    {
                        Schema = new OpenApiSchema
                        {
                            Type = "object",
                            Properties = bodyProperties
                        }
                    }
                }
            };
        }

        doc.Paths.Add(path, new OpenApiPathItem
        {
            Operations = new Dictionary<OperationType, OpenApiOperation>
            {
                [OperationType.Post] = operation
            }
        });
    }
}
