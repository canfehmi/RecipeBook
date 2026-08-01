using System.Security.Cryptography;
using Microsoft.AspNetCore.WebUtilities;
using TarifDefterim.Application.Constants;

namespace TarifDefterim.Application.Security;

public static class SecureTokenGenerator
{
    public static string GenerateBase64UrlToken(int byteLength = EmailTokenConstants.TokenByteLength)
    {
        var bytes = new byte[byteLength];
        RandomNumberGenerator.Fill(bytes);
        return WebEncoders.Base64UrlEncode(bytes);
    }
}
