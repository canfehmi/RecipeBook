using TarifDefterim.Domain.Entities;

namespace TarifDefterim.Application.Interfaces;

public sealed class GoogleAuthResult
{
    public ApplicationUser? User { get; init; }
    public string? ErrorMessage { get; init; }

    public bool Succeeded => User is not null;

    public static GoogleAuthResult Success(ApplicationUser user) => new() { User = user };

    public static GoogleAuthResult Failed(string message) => new() { ErrorMessage = message };
}

public interface IGoogleAuthService
{
    Task<GoogleAuthResult> AuthenticateAsync(string idToken, CancellationToken cancellationToken = default);
}
