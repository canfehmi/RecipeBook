using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TarifDefterim.Application.Interfaces;

namespace TarifDefterim.Api.Controllers;

[ApiController]
[Route("api/images")]
[Authorize]
public class ImagesController(IImageStorageService imageStorageService) : ControllerBase
{
    [HttpPost("upload")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Upload(IFormFile file, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(new { message = "Dosya gerekli." });
        }

        try
        {
            await using var stream = file.OpenReadStream();
            var url = await imageStorageService.UploadImageAsync(
                stream,
                file.FileName,
                cancellationToken);

            return Ok(new { url });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
