using Microsoft.Extensions.Caching.Memory;
using TarifDefterim.Application.Interfaces;
using TarifDefterim.Application.Security;

namespace TarifDefterim.Application.Services;

public class InMemoryAuthExchangeStore(IMemoryCache cache) : IAuthExchangeStore
{
    private static readonly TimeSpan DefaultTtl = TimeSpan.FromSeconds(60);

    public string CreateCode(string userId, TimeSpan? ttl = null)
    {
        var code = SecureTokenGenerator.GenerateBase64UrlToken(32);
        cache.Set(code, userId, ttl ?? DefaultTtl);
        return code;
    }

    public bool TryTake(string code, out string? userId)
    {
        if (cache.TryGetValue(code, out string? storedUserId) && !string.IsNullOrWhiteSpace(storedUserId))
        {
            cache.Remove(code);
            userId = storedUserId;
            return true;
        }

        userId = null;
        return false;
    }
}
