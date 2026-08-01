using System.Security.Cryptography;
using System.Text;

namespace TarifDefterim.Application.Security;

public static class TokenHasher
{
    public static string Hash(string token)
    {
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexStringLower(hashBytes);
    }

    public static bool Verify(string token, string storedHash)
    {
        var computedHash = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        var storedHashBytes = Convert.FromHexString(storedHash);
        return storedHashBytes.Length == computedHash.Length
            && CryptographicOperations.FixedTimeEquals(storedHashBytes, computedHash);
    }
}
