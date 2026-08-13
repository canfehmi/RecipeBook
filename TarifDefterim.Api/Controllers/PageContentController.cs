using Microsoft.AspNetCore.Mvc;
using TarifDefterim.Application.Interfaces;

namespace TarifDefterim.Api.Controllers;

[ApiController]
[Route("api/page-content")]
public class PageContentController(IPageContentService pageContentService) : ControllerBase
{
    [HttpGet("{slug}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var page = await pageContentService.GetBySlugAsync(slug, cancellationToken);
        if (page is null)
        {
            return NotFound(new { message = "Sayfa bulunamadı." });
        }

        return Ok(page);
    }
}
