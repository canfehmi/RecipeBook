using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TarifDefterim.Application.Interfaces;
using TarifDefterim.Infrastructure.Data;
using TarifDefterim.Infrastructure.Options;
using TarifDefterim.Infrastructure.Services;

namespace TarifDefterim.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        services.Configure<CloudinarySettings>(configuration.GetSection(CloudinarySettings.SectionName));
        services.AddScoped<IImageStorageService, CloudinaryImageStorageService>();

        services.Configure<MailSettings>(configuration.GetSection(MailSettings.SectionName));
        services.AddSingleton<EmailTemplateRenderer>();
        services.AddSingleton<IHtmlContentSanitizer, HtmlSanitizerService>();
        services.AddScoped<IEmailService, EmailService>();

        return services;
    }
}
