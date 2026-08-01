using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TarifDefterim.Application.DTOs;
using TarifDefterim.Application.Exceptions;
using TarifDefterim.Application.Interfaces;

namespace TarifDefterim.Api.Controllers;

[ApiController]
[Route("api/families")]
[Authorize]
public class FamiliesController(IFamilyService familyService) : ControllerBase
{
    [HttpGet("me")]
    [ProducesResponseType(typeof(FamilyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMyFamily(CancellationToken cancellationToken)
    {
        var family = await familyService.GetMyFamilyAsync(GetUserId(), cancellationToken);
        return family is null ? NotFound() : Ok(family);
    }

    [HttpGet("members")]
    [ProducesResponseType(typeof(IReadOnlyList<FamilyMemberDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMembers(CancellationToken cancellationToken)
    {
        try
        {
            var members = await familyService.GetFamilyMembersAsync(GetUserId(), cancellationToken);
            return Ok(members);
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("join")]
    [ProducesResponseType(typeof(FamilyJoinRequestDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> JoinFamily(
        [FromBody] JoinFamilyRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var joinRequest = await familyService.RequestToJoinFamilyAsync(
                GetUserId(),
                request.InviteCode,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetJoinRequests),
                new { id = joinRequest.Id },
                joinRequest);
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("join-requests")]
    [ProducesResponseType(typeof(IReadOnlyList<FamilyJoinRequestDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetJoinRequests(CancellationToken cancellationToken)
    {
        try
        {
            var requests = await familyService.GetPendingJoinRequestsAsync(GetUserId(), cancellationToken);
            return Ok(requests);
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("join-requests/{requestId:guid}/approve")]
    [ProducesResponseType(typeof(ApproveJoinRequestResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ApproveJoinRequest(
        Guid requestId,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await familyService.ApproveJoinRequestAsync(
                requestId,
                GetUserId(),
                cancellationToken);

            return Ok(result);
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("join-requests/{requestId:guid}/reject")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RejectJoinRequest(
        Guid requestId,
        CancellationToken cancellationToken)
    {
        try
        {
            await familyService.RejectJoinRequestAsync(requestId, GetUserId(), cancellationToken);
            return NoContent();
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{familyId:guid}/members/{targetUserId}/promote-head")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PromoteToHead(
        Guid familyId,
        string targetUserId,
        CancellationToken cancellationToken)
    {
        try
        {
            await familyService.PromoteToHeadOfHouseholdAsync(
                familyId,
                targetUserId,
                GetUserId(),
                cancellationToken);

            return NoContent();
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{familyId:guid}/members/{targetUserId}/demote-member")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DemoteToMember(
        Guid familyId,
        string targetUserId,
        CancellationToken cancellationToken)
    {
        try
        {
            await familyService.DemoteToMemberAsync(
                familyId,
                targetUserId,
                GetUserId(),
                cancellationToken);

            return NoContent();
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{familyId:guid}/members/{targetUserId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RemoveMember(
        Guid familyId,
        string targetUserId,
        CancellationToken cancellationToken)
    {
        try
        {
            await familyService.RemoveMemberAsync(
                familyId,
                targetUserId,
                GetUserId(),
                cancellationToken);

            return NoContent();
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("leave")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> LeaveFamily(CancellationToken cancellationToken)
    {
        try
        {
            await familyService.LeaveFamilyAsync(GetUserId(), cancellationToken);
            return NoContent();
        }
        catch (FamilyBusinessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private string GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new InvalidOperationException("Kullanıcı kimliği bulunamadı.");
}
