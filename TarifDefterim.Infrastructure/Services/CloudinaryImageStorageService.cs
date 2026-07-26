using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using TarifDefterim.Application.Interfaces;
using TarifDefterim.Infrastructure.Options;

namespace TarifDefterim.Infrastructure.Services;

public class CloudinaryImageStorageService(IOptions<CloudinarySettings> options) : IImageStorageService
{
    private const long MaxFileSizeBytes = 5 * 1024 * 1024;
    private const string UploadFolder = "recipes";

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    };

    private readonly Cloudinary _cloudinary = new(new Account(
        options.Value.CloudName,
        options.Value.ApiKey,
        options.Value.ApiSecret));

    public async Task<string> UploadImageAsync(
        Stream fileStream,
        string fileName,
        CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(fileName);
        if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
        {
            throw new ArgumentException("Yalnızca jpg, jpeg, png ve webp dosyaları yüklenebilir.");
        }

        var uploadStream = await PrepareUploadStreamAsync(fileStream, cancellationToken);

        try
        {
            if (uploadStream.Length > MaxFileSizeBytes)
            {
                throw new ArgumentException("Dosya boyutu 5MB'ı aşamaz.");
            }

            uploadStream.Position = 0;

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, uploadStream),
                Folder = UploadFolder
            };

            var result = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

            if (result.Error is not null)
            {
                throw new InvalidOperationException(result.Error.Message);
            }

            return result.SecureUrl.ToString();
        }
        finally
        {
            if (!ReferenceEquals(uploadStream, fileStream))
            {
                await uploadStream.DisposeAsync();
            }
        }
    }

    private static async Task<Stream> PrepareUploadStreamAsync(Stream fileStream, CancellationToken cancellationToken)
    {
        if (fileStream.CanSeek)
        {
            return fileStream;
        }

        var buffer = new MemoryStream();
        await fileStream.CopyToAsync(buffer, cancellationToken);
        return buffer;
    }
}
