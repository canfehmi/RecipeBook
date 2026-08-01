import { Navigate, Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import { AdminRoute } from './components/layout/AdminRoute';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminAddRecipePage } from './features/admin/AdminAddRecipePage';
import { AdminCategoriesPage } from './features/admin/AdminCategoriesPage';
import { AdminDashboardPage } from './features/admin/AdminDashboardPage';
import { AdminFamiliesPage } from './features/admin/AdminFamiliesPage';
import { AdminLayout } from './features/admin/AdminLayout';
import { AdminRecipesPage } from './features/admin/AdminRecipesPage';
import { AdminUsersPage } from './features/admin/AdminUsersPage';
import { LoginPage } from './features/auth/LoginPage';
import { ConfirmEmailPage } from './features/auth/ConfirmEmailPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { FamilyMembersPage } from './features/family/FamilyMembersPage';
import { AddRecipePage } from './features/recipes/AddRecipePage';
import { GlobalRecipesPage } from './features/recipes/GlobalRecipesPage';
import { MyRecipesPage } from './features/recipes/MyRecipesPage';
import { PendingApprovalsPage } from './features/recipes/PendingApprovalsPage';
import { RecipeDetailPage } from './features/recipes/RecipeDetailPage';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<AppLayout />}>
        <Route index element={<GlobalRecipesPage />} />
        <Route path="recipes/:id" element={<RecipeDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="confirm-email" element={<ConfirmEmailPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="my-recipes" element={<MyRecipesPage />} />
          <Route path="my-recipes/add" element={<AddRecipePage />} />
          <Route path="my-recipes/:id/edit" element={<AddRecipePage />} />
          <Route path="my-recipes/:id" element={<RecipeDetailPage />} />
          <Route path="pending-approvals" element={<PendingApprovalsPage />} />
          <Route path="family" element={<FamilyMembersPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/recipes" element={<AdminRecipesPage />} />
          <Route path="admin/recipes/add" element={<AdminAddRecipePage />} />
          <Route path="admin/recipes/:id/edit" element={<AdminAddRecipePage />} />
          <Route path="admin/categories" element={<AdminCategoriesPage />} />
          <Route path="admin/families" element={<AdminFamiliesPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
        </Route>
      </Route>
    </>,
  ),
);
