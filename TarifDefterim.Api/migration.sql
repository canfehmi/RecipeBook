IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE TABLE [AspNetRoles] (
        [Id] nvarchar(450) NOT NULL,
        [Name] nvarchar(256) NULL,
        [NormalizedName] nvarchar(256) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE TABLE [AspNetUsers] (
        [Id] nvarchar(450) NOT NULL,
        [DisplayName] nvarchar(max) NOT NULL,
        [UserName] nvarchar(256) NULL,
        [NormalizedUserName] nvarchar(256) NULL,
        [Email] nvarchar(256) NULL,
        [NormalizedEmail] nvarchar(256) NULL,
        [EmailConfirmed] bit NOT NULL,
        [PasswordHash] nvarchar(max) NULL,
        [SecurityStamp] nvarchar(max) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        [PhoneNumber] nvarchar(max) NULL,
        [PhoneNumberConfirmed] bit NOT NULL,
        [TwoFactorEnabled] bit NOT NULL,
        [LockoutEnd] datetimeoffset NULL,
        [LockoutEnabled] bit NOT NULL,
        [AccessFailedCount] int NOT NULL,
        CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE TABLE [Families] (
        [Id] uniqueidentifier NOT NULL,
        [InviteCode] nvarchar(8) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Families] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE TABLE [AspNetRoleClaims] (
        [Id] int NOT NULL IDENTITY,
        [RoleId] nvarchar(450) NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE TABLE [AspNetUserClaims] (
        [Id] int NOT NULL IDENTITY,
        [UserId] nvarchar(450) NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE TABLE [AspNetUserLogins] (
        [LoginProvider] nvarchar(450) NOT NULL,
        [ProviderKey] nvarchar(450) NOT NULL,
        [ProviderDisplayName] nvarchar(max) NULL,
        [UserId] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
        CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE TABLE [AspNetUserRoles] (
        [UserId] nvarchar(450) NOT NULL,
        [RoleId] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE TABLE [AspNetUserTokens] (
        [UserId] nvarchar(450) NOT NULL,
        [LoginProvider] nvarchar(450) NOT NULL,
        [Name] nvarchar(450) NOT NULL,
        [Value] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
        CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE TABLE [FamilyJoinRequests] (
        [Id] uniqueidentifier NOT NULL,
        [FamilyId] uniqueidentifier NOT NULL,
        [RequesterUserId] nvarchar(450) NOT NULL,
        [Status] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_FamilyJoinRequests] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FamilyJoinRequests_AspNetUsers_RequesterUserId] FOREIGN KEY ([RequesterUserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_FamilyJoinRequests_Families_FamilyId] FOREIGN KEY ([FamilyId]) REFERENCES [Families] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE TABLE [FamilyMembers] (
        [Id] uniqueidentifier NOT NULL,
        [FamilyId] uniqueidentifier NOT NULL,
        [UserId] nvarchar(450) NOT NULL,
        [Role] int NOT NULL,
        [JoinedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_FamilyMembers] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FamilyMembers_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_FamilyMembers_Families_FamilyId] FOREIGN KEY ([FamilyId]) REFERENCES [Families] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Families_InviteCode] ON [Families] ([InviteCode]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE INDEX [IX_FamilyJoinRequests_FamilyId_RequesterUserId_Status] ON [FamilyJoinRequests] ([FamilyId], [RequesterUserId], [Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE INDEX [IX_FamilyJoinRequests_RequesterUserId] ON [FamilyJoinRequests] ([RequesterUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_FamilyMembers_FamilyId_UserId] ON [FamilyMembers] ([FamilyId], [UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    CREATE INDEX [IX_FamilyMembers_UserId] ON [FamilyMembers] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260725233351_InitialFamilySchema'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260725233351_InitialFamilySchema', N'10.0.10');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260726000420_AddRecipeSchema'
)
BEGIN
    CREATE TABLE [Categories] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260726000420_AddRecipeSchema'
)
BEGIN
    CREATE TABLE [Recipes] (
        [Id] uniqueidentifier NOT NULL,
        [Title] nvarchar(300) NOT NULL,
        [PrepTimeMinutes] int NOT NULL,
        [CookTimeMinutes] int NOT NULL,
        [Steps] nvarchar(max) NOT NULL,
        [CoverImageUrl] nvarchar(2048) NULL,
        [Servings] int NOT NULL,
        [CategoryId] uniqueidentifier NOT NULL,
        [Scope] int NOT NULL,
        [FamilyId] uniqueidentifier NULL,
        [SourceGlobalRecipeId] uniqueidentifier NULL,
        [CreatedByUserId] nvarchar(450) NOT NULL,
        [Status] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Recipes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Recipes_AspNetUsers_CreatedByUserId] FOREIGN KEY ([CreatedByUserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Recipes_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Recipes_Families_FamilyId] FOREIGN KEY ([FamilyId]) REFERENCES [Families] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Recipes_Recipes_SourceGlobalRecipeId] FOREIGN KEY ([SourceGlobalRecipeId]) REFERENCES [Recipes] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260726000420_AddRecipeSchema'
)
BEGIN
    CREATE TABLE [RecipeIngredients] (
        [Id] uniqueidentifier NOT NULL,
        [RecipeId] uniqueidentifier NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [Amount] decimal(18,4) NOT NULL,
        [Unit] nvarchar(50) NOT NULL,
        [SortOrder] int NOT NULL,
        CONSTRAINT [PK_RecipeIngredients] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RecipeIngredients_Recipes_RecipeId] FOREIGN KEY ([RecipeId]) REFERENCES [Recipes] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260726000420_AddRecipeSchema'
)
BEGIN
    CREATE INDEX [IX_RecipeIngredients_RecipeId] ON [RecipeIngredients] ([RecipeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260726000420_AddRecipeSchema'
)
BEGIN
    CREATE INDEX [IX_Recipes_CategoryId] ON [Recipes] ([CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260726000420_AddRecipeSchema'
)
BEGIN
    CREATE INDEX [IX_Recipes_CreatedByUserId] ON [Recipes] ([CreatedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260726000420_AddRecipeSchema'
)
BEGIN
    CREATE INDEX [IX_Recipes_FamilyId] ON [Recipes] ([FamilyId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260726000420_AddRecipeSchema'
)
BEGIN
    CREATE INDEX [IX_Recipes_Scope_CategoryId] ON [Recipes] ([Scope], [CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260726000420_AddRecipeSchema'
)
BEGIN
    CREATE INDEX [IX_Recipes_SourceGlobalRecipeId] ON [Recipes] ([SourceGlobalRecipeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260726000420_AddRecipeSchema'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260726000420_AddRecipeSchema', N'10.0.10');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730140650_AddUserEmailTokens'
)
BEGIN
    ALTER TABLE [AspNetUsers] ADD [EmailVerificationExpireDate] datetimeoffset NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730140650_AddUserEmailTokens'
)
BEGIN
    ALTER TABLE [AspNetUsers] ADD [EmailVerificationTokenHash] nvarchar(64) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730140650_AddUserEmailTokens'
)
BEGIN
    ALTER TABLE [AspNetUsers] ADD [LastPasswordResetEmailSentAt] datetimeoffset NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730140650_AddUserEmailTokens'
)
BEGIN
    ALTER TABLE [AspNetUsers] ADD [LastVerificationEmailSentAt] datetimeoffset NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730140650_AddUserEmailTokens'
)
BEGIN
    ALTER TABLE [AspNetUsers] ADD [PasswordResetExpireDate] datetimeoffset NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730140650_AddUserEmailTokens'
)
BEGIN
    ALTER TABLE [AspNetUsers] ADD [PasswordResetTokenHash] nvarchar(64) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730140650_AddUserEmailTokens'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260730140650_AddUserEmailTokens', N'10.0.10');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233305_AddPageContent'
)
BEGIN
    CREATE TABLE [PageContents] (
        [Id] uniqueidentifier NOT NULL,
        [Slug] nvarchar(100) NOT NULL,
        [Title] nvarchar(300) NOT NULL,
        [ContentHtml] nvarchar(max) NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_PageContents] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233305_AddPageContent'
)
BEGIN
    CREATE UNIQUE INDEX [IX_PageContents_Slug] ON [PageContents] ([Slug]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233305_AddPageContent'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Slug', N'Title', N'ContentHtml', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[PageContents]'))
        SET IDENTITY_INSERT [PageContents] ON;
    EXEC(N'INSERT INTO [PageContents] ([Id], [Slug], [Title], [ContentHtml], [UpdatedAt])
    VALUES (''a1000001-0000-4000-8000-000000000001'', N''hakkimizda'', N''Hakkımızda'', CONCAT(CAST(N''<p>Ata Tarifi, ailelerin nesilden nesile aktardığı tarifleri dijital ortamda güvenle saklamaları için tasarlanmış bir platformdur.</p>'' AS nvarchar(max)), nchar(13), nchar(10), N''<p>Amacımız; dağınık notlar, mesajlar ve ekran görüntüleri yerine ailelere özel, düzenli ve erişilebilir bir tarif defteri sunmaktır.</p>'', nchar(13), nchar(10), N''<h2>Misyonumuz</h2>'', nchar(13), nchar(10), N''<p>Aile kültürünün önemli parçası olan yemek tariflerinin kaybolmasını önlemek ve her neslin kendi mutfak mirasını kolayca paylaşabilmesini sağlamak.</p>'', nchar(13), nchar(10), N''<h2>Vizyonumuz</h2>'', nchar(13), nchar(10), N''<p>Türkiye''''de ve dünyada ailelerin güvenle kullanabileceği, sade ve kullanıcı dostu bir tarif platformu olmak.</p>''), ''2026-08-13T00:00:00.0000000Z'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Slug', N'Title', N'ContentHtml', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[PageContents]'))
        SET IDENTITY_INSERT [PageContents] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233305_AddPageContent'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Slug', N'Title', N'ContentHtml', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[PageContents]'))
        SET IDENTITY_INSERT [PageContents] ON;
    EXEC(N'INSERT INTO [PageContents] ([Id], [Slug], [Title], [ContentHtml], [UpdatedAt])
    VALUES (''a1000001-0000-4000-8000-000000000002'', N''iletisim'', N''İletişim'', CONCAT(CAST(N''<p>Ata Tarifi ile ilgili sorularınız, önerileriniz veya destek talepleriniz için bizimle iletişime geçebilirsiniz.</p>'' AS nvarchar(max)), nchar(13), nchar(10), N''<p><strong>E-posta:</strong> <a href="mailto:destek@atatarifi.com">destek@atatarifi.com</a></p>'', nchar(13), nchar(10), N''<p><strong>Çalışma saatleri:</strong> Hafta içi 09:00 – 18:00</p>'', nchar(13), nchar(10), N''<p>Mesajlarınıza en kısa sürede yanıt vermeye çalışıyoruz. Hesap güvenliği veya gizlilik konularında lütfen kayıtlı e-posta adresinizden yazın.</p>''), ''2026-08-13T00:00:00.0000000Z'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Slug', N'Title', N'ContentHtml', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[PageContents]'))
        SET IDENTITY_INSERT [PageContents] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233305_AddPageContent'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Slug', N'Title', N'ContentHtml', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[PageContents]'))
        SET IDENTITY_INSERT [PageContents] ON;
    EXEC(N'INSERT INTO [PageContents] ([Id], [Slug], [Title], [ContentHtml], [UpdatedAt])
    VALUES (''a1000001-0000-4000-8000-000000000003'', N''gizlilik-politikasi'', N''Gizlilik Politikası'', CONCAT(CAST(N''<p><em>Son güncelleme: 13 Ağustos 2026</em></p>'' AS nvarchar(max)), nchar(13), nchar(10), N''<p>Bu Gizlilik Politikası, Ata Tarifi platformunu kullanırken kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.</p>'', nchar(13), nchar(10), N''<h2>1. Toplanan Veriler</h2>'', nchar(13), nchar(10), N''<p>Hizmetimizi kullanırken ad, e-posta adresi, profil bilgileri, tarif içerikleri ve kullanım verileri gibi bilgiler toplanabilir.</p>'', nchar(13), nchar(10), N''<h2>2. Verilerin Kullanım Amaçları</h2>'', nchar(13), nchar(10), N''<ul>'', nchar(13), nchar(10), N''<li>Hesap oluşturma ve kimlik doğrulama</li>'', nchar(13), nchar(10), N''<li>Platform hizmetlerinin sunulması</li>'', nchar(13), nchar(10), N''<li>Güvenlik ve kötüye kullanımın önlenmesi</li>'', nchar(13), nchar(10), N''<li>Yasal yükümlülüklerin yerine getirilmesi</li>'', nchar(13), nchar(10), N''</ul>'', nchar(13), nchar(10), N''<h2>3. Veri Paylaşımı</h2>'', nchar(13), nchar(10), N''<p>Kişisel verileriniz, yasal zorunluluklar ve hizmet sağlayıcılarımız dışında üçüncü taraflarla paylaşılmaz. Google ile giriş yapmayı tercih ederseniz Google''''ın kendi gizlilik politikası geçerli olabilir.</p>'', nchar(13), nchar(10), N''<h2>4. Haklarınız</h2>'', nchar(13), nchar(10), N''<p>KVKK kapsamında verilerinize erişme, düzeltme, silme ve işlenmesine itiraz etme haklarına sahipsiniz. Talepleriniz için bizimle iletişime geçebilirsiniz.</p>'', nchar(13), nchar(10), N''<h2>5. İletişim</h2>'', nchar(13), nchar(10), N''<p>Gizlilik ile ilgili sorularınız için <a href="mailto:destek@atatarifi.com">destek@atatarifi.com</a> adresine yazabilirsiniz.</p>''), ''2026-08-13T00:00:00.0000000Z'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Slug', N'Title', N'ContentHtml', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[PageContents]'))
        SET IDENTITY_INSERT [PageContents] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233305_AddPageContent'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Slug', N'Title', N'ContentHtml', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[PageContents]'))
        SET IDENTITY_INSERT [PageContents] ON;
    EXEC(N'INSERT INTO [PageContents] ([Id], [Slug], [Title], [ContentHtml], [UpdatedAt])
    VALUES (''a1000001-0000-4000-8000-000000000004'', N''kullanim-sozlesmesi'', N''Kullanım / Üyelik Sözleşmesi'', CONCAT(CAST(N''<p><em>Son güncelleme: 13 Ağustos 2026</em></p>'' AS nvarchar(max)), nchar(13), nchar(10), N''<p>Bu sözleşme, Ata Tarifi platformuna üye olan veya platformu kullanan tüm kullanıcılar için geçerlidir. Platformu kullanarak bu şartları kabul etmiş sayılırsınız.</p>'', nchar(13), nchar(10), N''<h2>1. Hizmet Tanımı</h2>'', nchar(13), nchar(10), N''<p>Ata Tarifi; kullanıcıların tarif oluşturmasına, aile grupları kurmasına ve tarifleri paylaşmasına olanak tanıyan bir web uygulamasıdır.</p>'', nchar(13), nchar(10), N''<h2>2. Üyelik ve Hesap Güvenliği</h2>'', nchar(13), nchar(10), N''<p>Kayıt sırasında doğru bilgi vermekle yükümlüsünüz. Hesap bilgilerinizin gizliliğinden siz sorumlusunuz. Şüpheli bir kullanım fark ederseniz derhal bize bildirin.</p>'', nchar(13), nchar(10), N''<h2>3. Kullanıcı İçerikleri</h2>'', nchar(13), nchar(10), N''<p>Yüklediğiniz tarif ve içeriklerin size ait olduğunu veya paylaşım hakkına sahip olduğunuzu beyan edersiniz. Yasalara aykırı, hakaret içeren veya telif hakkını ihlal eden içerikler yasaktır.</p>'', nchar(13), nchar(10), N''<h2>4. Hizmet Değişiklikleri</h2>'', nchar(13), nchar(10), N''<p>Platform özelliklerini geliştirmek veya yasal gereklilikler nedeniyle hizmette değişiklik yapma hakkımız saklıdır. Önemli değişiklikler kullanıcılara duyurulur.</p>'', nchar(13), nchar(10), N''<h2>5. Sorumluluk Sınırı</h2>'', nchar(13), nchar(10), N''<p>Platform "olduğu gibi" sunulur. Kesintisiz veya hatasız çalışma garantisi verilmez. Kullanıcı içeriklerinden doğan uyuşmazlıklardan platform sorumlu tutulamaz.</p>''), ''2026-08-13T00:00:00.0000000Z'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Slug', N'Title', N'ContentHtml', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[PageContents]'))
        SET IDENTITY_INSERT [PageContents] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233305_AddPageContent'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Slug', N'Title', N'ContentHtml', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[PageContents]'))
        SET IDENTITY_INSERT [PageContents] ON;
    EXEC(N'INSERT INTO [PageContents] ([Id], [Slug], [Title], [ContentHtml], [UpdatedAt])
    VALUES (''a1000001-0000-4000-8000-000000000005'', N''kvkk'', N''KVKK Aydınlatma Metni'', CONCAT(CAST(N''<p><em>Son güncelleme: 13 Ağustos 2026</em></p>'' AS nvarchar(max)), nchar(13), nchar(10), N''<p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, veri sorumlusu sıfatıyla Ata Tarifi tarafından kişisel verilerinizin işlenmesine ilişkin aydınlatma metnidir.</p>'', nchar(13), nchar(10), N''<h2>Veri Sorumlusu</h2>'', nchar(13), nchar(10), N''<p>Ata Tarifi — destek@atatarifi.com</p>'', nchar(13), nchar(10), N''<h2>İşlenen Kişisel Veriler</h2>'', nchar(13), nchar(10), N''<ul>'', nchar(13), nchar(10), N''<li>Kimlik ve iletişim bilgileri (ad, e-posta)</li>'', nchar(13), nchar(10), N''<li>Hesap ve işlem güvenliği verileri</li>'', nchar(13), nchar(10), N''<li>Kullanıcı tarafından oluşturulan tarif içerikleri</li>'', nchar(13), nchar(10), N''<li>Platform kullanım logları</li>'', nchar(13), nchar(10), N''</ul>'', nchar(13), nchar(10), N''<h2>İşleme Amaçları ve Hukuki Sebepler</h2>'', nchar(13), nchar(10), N''<p>Kişisel verileriniz; sözleşmenin kurulması ve ifası, meşru menfaat, açık rıza ve yasal yükümlülükler kapsamında işlenmektedir.</p>'', nchar(13), nchar(10), N''<h2>Aktarım</h2>'', nchar(13), nchar(10), N''<p>Verileriniz, hizmet altyapısı sağlayıcıları ve yasal merciler dışında üçüncü kişilere aktarılmaz. Yurt dışına aktarım söz konusu olduğunda KVKK''''ya uygun önlemler alınır.</p>'', nchar(13), nchar(10), N''<h2>Haklarınız (KVKK md. 11)</h2>'', nchar(13), nchar(10), N''<p>Kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltme, silme, itiraz etme ve zararın giderilmesini talep etme haklarına sahipsiniz. Başvurularınızı destek@atatarifi.com adresine iletebilirsiniz.</p>''), ''2026-08-13T00:00:00.0000000Z'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Slug', N'Title', N'ContentHtml', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[PageContents]'))
        SET IDENTITY_INSERT [PageContents] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233305_AddPageContent'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Slug', N'Title', N'ContentHtml', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[PageContents]'))
        SET IDENTITY_INSERT [PageContents] ON;
    EXEC(N'INSERT INTO [PageContents] ([Id], [Slug], [Title], [ContentHtml], [UpdatedAt])
    VALUES (''a1000001-0000-4000-8000-000000000006'', N''cerez-politikasi'', N''Çerez Politikası'', CONCAT(CAST(N''<p><em>Son güncelleme: 13 Ağustos 2026</em></p>'' AS nvarchar(max)), nchar(13), nchar(10), N''<p>Bu Çerez Politikası, Ata Tarifi web sitesinde kullanılan çerezler ve benzeri teknolojiler hakkında bilgi vermektedir.</p>'', nchar(13), nchar(10), N''<h2>Çerez Nedir?</h2>'', nchar(13), nchar(10), N''<p>Çerezler, web sitesini ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır. Oturum yönetimi, tercihlerin hatırlanması ve güvenlik amacıyla kullanılabilir.</p>'', nchar(13), nchar(10), N''<h2>Kullandığımız Çerez Türleri</h2>'', nchar(13), nchar(10), N''<ul>'', nchar(13), nchar(10), N''<li><strong>Zorunlu çerezler:</strong> Oturum açma ve temel site işlevleri için gereklidir.</li>'', nchar(13), nchar(10), N''<li><strong>İşlevsel çerezler:</strong> Tercihlerinizi hatırlamak için kullanılır.</li>'', nchar(13), nchar(10), N''<li><strong>Analitik çerezler:</strong> Site kullanımını anlamak için anonim istatistik toplayabilir.</li>'', nchar(13), nchar(10), N''</ul>'', nchar(13), nchar(10), N''<h2>Çerezleri Yönetme</h2>'', nchar(13), nchar(10), N''<p>Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Zorunlu çerezlerin devre dışı bırakılması platformun düzgün çalışmasını engelleyebilir.</p>'', nchar(13), nchar(10), N''<h2>Üçüncü Taraf Çerezleri</h2>'', nchar(13), nchar(10), N''<p>Google ile giriş gibi üçüncü taraf hizmetler kendi çerezlerini kullanabilir. Bu hizmetlerin politikaları ilgili sağlayıcıların web sitelerinde yer almaktadır.</p>''), ''2026-08-13T00:00:00.0000000Z'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Slug', N'Title', N'ContentHtml', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[PageContents]'))
        SET IDENTITY_INSERT [PageContents] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260812233305_AddPageContent'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260812233305_AddPageContent', N'10.0.10');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260813025411_MakeRecipeIngredientAmountNullable'
)
BEGIN
    DECLARE @var nvarchar(max);
    SELECT @var = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[RecipeIngredients]') AND [c].[name] = N'Amount');
    IF @var IS NOT NULL EXEC(N'ALTER TABLE [RecipeIngredients] DROP CONSTRAINT ' + @var + ';');
    ALTER TABLE [RecipeIngredients] ALTER COLUMN [Amount] decimal(18,4) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260813025411_MakeRecipeIngredientAmountNullable'
)
BEGIN
    UPDATE RecipeIngredients SET Amount = NULL WHERE Amount = 0
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260813025411_MakeRecipeIngredientAmountNullable'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260813025411_MakeRecipeIngredientAmountNullable', N'10.0.10');
END;

COMMIT;
GO

