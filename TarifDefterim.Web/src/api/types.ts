export const AUTH_TOKEN_KEY = 'auth_token';

export type RecipeStatus = 0 | 1;
export type RecipeScope = 0 | 1;
export type FamilyMemberRole = 0 | 1;
export type FamilyJoinRequestStatus = 0 | 1 | 2;

export const RecipeStatus = {
  Approved: 0,
  PendingApproval: 1,
} as const;

export const RecipeScope = {
  Global: 0,
  Family: 1,
} as const;

export const FamilyMemberRole = {
  HeadOfHousehold: 0,
  Member: 1,
} as const;

export const FamilyJoinRequestStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
} as const;

export interface RecipeIngredient {
  id: string;
  name: string;
  amount: number | null;
  unit: string;
  sortOrder: number;
}

export interface CreateRecipeIngredient {
  name: string;
  amount: number | null;
  unit: string;
  sortOrder: number;
}

export interface Recipe {
  id: string;
  title: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  steps: string;
  coverImageUrl: string | null;
  servings: number;
  categoryId: string;
  categoryName: string;
  scope: RecipeScope;
  familyId: string | null;
  sourceGlobalRecipeId: string | null;
  status: RecipeStatus;
  createdAt: string;
  ingredients: RecipeIngredient[];
  createdByDisplayName: string;
}

export interface CreateRecipe {
  title: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  steps: string;
  coverImageUrl?: string | null;
  servings: number;
  categoryId: string;
  sourceGlobalRecipeId?: string | null;
  ingredients: CreateRecipeIngredient[];
}

export interface UpdateRecipe {
  title: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  steps: string;
  coverImageUrl?: string | null;
  servings: number;
  categoryId: string;
  ingredients: CreateRecipeIngredient[];
}

export interface BulkImportRecipeItem {
  title: string;
  category: string;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  ingredients: {
    name: string;
    quantity: number | null;
    unit: string | null;
  }[];
  steps: string[];
}

export interface BulkImportCategoryNotFound {
  title: string;
  category: string;
}

export interface BulkImportValidationFailure {
  title: string;
  reason: string;
}

export interface BulkImportRecipesResult {
  totalCount: number;
  successCount: number;
  skippedCategoryNotFound: BulkImportCategoryNotFound[];
  skippedDuplicateTitle: string[];
  failedValidation: BulkImportValidationFailure[];
}

export interface Family {
  id: string;
  inviteCode: string;
  createdAt: string;
  memberCount: number;
}

export interface FamilyMember {
  id: string;
  userId: string;
  displayName: string;
  role: FamilyMemberRole;
  joinedAt: string;
}

export interface FamilyJoinRequest {
  id: string;
  familyId: string;
  requesterUserId: string;
  requesterDisplayName: string;
  status: FamilyJoinRequestStatus;
  createdAt: string;
}

export interface ApproveJoinRequestResult {
  requestId: string;
  familyId: string;
  requesterUserId: string;
  requiresRecipeMigration: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  displayName: string;
}

export interface JoinFamilyRequest {
  inviteCode: string;
}

export interface ImageUploadResponse {
  url: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface AdminFamilyMember {
  userId: string;
  displayName: string;
  email: string;
  role: FamilyMemberRole;
}

export interface AdminFamily {
  id: string;
  inviteCode: string;
  createdAt: string;
  members: AdminFamilyMember[];
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  emailConfirmed: boolean;
  lockoutEnd: string | null;
  familyId: string | null;
  familyInviteCode: string | null;
}

export interface ApiError {
  message?: string;
  errors?: string[];
}
