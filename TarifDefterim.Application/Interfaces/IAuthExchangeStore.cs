namespace TarifDefterim.Application.Interfaces;

public interface IAuthExchangeStore
{
    string CreateCode(string userId, TimeSpan? ttl = null);

    bool TryTake(string code, out string? userId);
}
