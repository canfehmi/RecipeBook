using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TarifDefterim.Application.Interfaces;
using TarifDefterim.Domain.Entities;

namespace TarifDefterim.Infrastructure.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser>(options), IApplicationDbContext
{
    public DbSet<Family> Families => Set<Family>();
    public DbSet<FamilyMember> FamilyMembers => Set<FamilyMember>();
    public DbSet<FamilyJoinRequest> FamilyJoinRequests => Set<FamilyJoinRequest>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Recipe> Recipes => Set<Recipe>();
    public DbSet<RecipeIngredient> RecipeIngredients => Set<RecipeIngredient>();
    public DbSet<PageContent> PageContents => Set<PageContent>();

    IQueryable<ApplicationUser> IApplicationDbContext.Users => Users;
    IQueryable<Family> IApplicationDbContext.Families => Families;
    IQueryable<FamilyMember> IApplicationDbContext.FamilyMembers => FamilyMembers;
    IQueryable<FamilyJoinRequest> IApplicationDbContext.FamilyJoinRequests => FamilyJoinRequests;
    IQueryable<Category> IApplicationDbContext.Categories => Categories;
    IQueryable<Recipe> IApplicationDbContext.Recipes => Recipes;
    IQueryable<RecipeIngredient> IApplicationDbContext.RecipeIngredients => RecipeIngredients;
    IQueryable<PageContent> IApplicationDbContext.PageContents => PageContents;

    void IApplicationDbContext.Add<TEntity>(TEntity entity) => Set<TEntity>().Add(entity);
    void IApplicationDbContext.Remove<TEntity>(TEntity entity) => Set<TEntity>().Remove(entity);

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(u => u.EmailVerificationTokenHash)
                .HasMaxLength(64);

            entity.Property(u => u.PasswordResetTokenHash)
                .HasMaxLength(64);
        });

        builder.Entity<Family>(entity =>
        {
            entity.HasKey(f => f.Id);

            entity.Property(f => f.InviteCode)
                .IsRequired()
                .HasMaxLength(8);

            entity.HasIndex(f => f.InviteCode)
                .IsUnique();

            entity.Property(f => f.CreatedAt)
                .IsRequired();
        });

        builder.Entity<FamilyMember>(entity =>
        {
            entity.HasKey(m => m.Id);

            entity.HasIndex(m => new { m.FamilyId, m.UserId })
                .IsUnique();

            entity.HasOne(m => m.Family)
                .WithMany(f => f.Members)
                .HasForeignKey(m => m.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(m => m.User)
                .WithMany(u => u.FamilyMemberships)
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<FamilyJoinRequest>(entity =>
        {
            entity.HasKey(r => r.Id);

            entity.HasIndex(r => new { r.FamilyId, r.RequesterUserId, r.Status });

            entity.HasOne(r => r.Family)
                .WithMany(f => f.JoinRequests)
                .HasForeignKey(r => r.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.Requester)
                .WithMany(u => u.JoinRequests)
                .HasForeignKey(r => r.RequesterUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Category>(entity =>
        {
            entity.HasKey(c => c.Id);

            entity.Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(200);
        });

        builder.Entity<Recipe>(entity =>
        {
            entity.HasKey(r => r.Id);

            entity.Property(r => r.Title)
                .IsRequired()
                .HasMaxLength(300);

            entity.Property(r => r.Steps)
                .IsRequired();

            entity.Property(r => r.CoverImageUrl)
                .HasMaxLength(2048);

            entity.Property(r => r.CreatedByUserId)
                .IsRequired();

            entity.Property(r => r.CreatedAt)
                .IsRequired();

            entity.HasIndex(r => new { r.Scope, r.CategoryId });

            entity.HasOne(r => r.Category)
                .WithMany(c => c.Recipes)
                .HasForeignKey(r => r.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Family)
                .WithMany(f => f.Recipes)
                .HasForeignKey(r => r.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.SourceGlobalRecipe)
                .WithMany(r => r.DerivedRecipes)
                .HasForeignKey(r => r.SourceGlobalRecipeId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.CreatedByUser)
                .WithMany(u => u.CreatedRecipes)
                .HasForeignKey(r => r.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<RecipeIngredient>(entity =>
        {
            entity.HasKey(i => i.Id);

            entity.Property(i => i.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(i => i.Unit)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(i => i.Amount)
                .HasPrecision(18, 4);

            entity.HasOne(i => i.Recipe)
                .WithMany(r => r.Ingredients)
                .HasForeignKey(i => i.RecipeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<PageContent>(entity =>
        {
            entity.HasKey(p => p.Id);

            entity.Property(p => p.Slug)
                .IsRequired()
                .HasMaxLength(100);

            entity.HasIndex(p => p.Slug)
                .IsUnique();

            entity.Property(p => p.Title)
                .IsRequired()
                .HasMaxLength(300);

            entity.Property(p => p.ContentHtml)
                .IsRequired();

            entity.Property(p => p.UpdatedAt)
                .IsRequired();
        });
    }
}
