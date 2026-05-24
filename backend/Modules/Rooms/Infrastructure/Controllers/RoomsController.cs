#nullable enable

using CompanyName.MyMeetings.BuildingBlocks.Infrastructure.Auth0;
using CompanyName.MyMeetings.Modules.Rooms.Application.Hubs;
using CompanyName.MyMeetings.Modules.Rooms.Application.Repositories;
using CompanyName.MyMeetings.Modules.Rooms.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CompanyName.MyMeetings.Modules.Rooms.Infrastructure.Controllers;

[ApiController]
[Authorize]
[Route("api/rooms")]
public class RoomsController : ControllerBase
{
    private readonly IRoomRepository _roomRepository;

    public RoomsController(IRoomRepository roomRepository)
    {
        _roomRepository = roomRepository;
    }

    [HttpPost]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateRoomAsync()
    {
        var userId = User.GetUserId();

        var existing = await _roomRepository.GetActiveRoomByOwnerAsync(userId);
        if (existing is not null)
        {
            return Conflict(new { message = "You already have an active room.", roomId = existing.Id.Value });
        }

        var room = Room.Create(userId);
        await _roomRepository.AddAsync(room);
        return CreatedAtAction(nameof(GetRoomAsync), new { id = room.Id.Value }, new { id = room.Id.Value });
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<RoomSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyRoomsAsync()
    {
        var userId = User.GetUserId();
        var rooms = await _roomRepository.GetRoomsByOwnerAsync(userId);
        var dtos = rooms.Select(r => new RoomSummaryDto(
            r.Id.Value,
            r.OwnerId,
            r.MaxParticipants,
            r.Participants.Count,
            r.IsActive));
        return Ok(dtos);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(RoomDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRoomAsync(Guid id)
    {
        var room = await _roomRepository.GetByIdAsync(new RoomId(id));
        if (room is null)
        {
            return NotFound();
        }

        var dto = new RoomDetailDto(
            room.Id.Value,
            room.OwnerId,
            room.MaxParticipants,
            room.IsActive,
            room.Participants.Select(p => new ParticipantDto(p.UserId, p.IsConnected)));

        return Ok(dto);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CloseRoomAsync(Guid id)
    {
        var room = await _roomRepository.GetByIdAsync(new RoomId(id));
        if (room is null)
        {
            return NotFound();
        }

        if (!room.IsOwnedBy(User.GetUserId()))
        {
            return Forbid();
        }

        room.Close();
        await _roomRepository.UpdateAsync(room);
        return NoContent();
    }
}
