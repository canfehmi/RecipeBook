using Microsoft.Extensions.DependencyInjection;
using TarifDefterim.Application.Interfaces;
using TarifDefterim.Application.Services;

namespace TarifDefterim.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IFamilyService, FamilyService>();
        services.AddScoped<IRecipeService, RecipeService>();
        return services;
    }
}
