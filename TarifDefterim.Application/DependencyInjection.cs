using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TarifDefterim.Application.Interfaces;
using TarifDefterim.Application.Options;
using TarifDefterim.Application.Services;

namespace TarifDefterim.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<FrontendSettings>(configuration.GetSection(FrontendSettings.SectionName));

        services.AddScoped<IFamilyService, FamilyService>();
        services.AddScoped<IRecipeService, RecipeService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IAccountEmailService, AccountEmailService>();
        services.AddScoped<IPageContentService, PageContentService>();
        return services;
    }
}
