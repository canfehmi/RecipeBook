import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AdminRoute } from './components/layout/AdminRoute';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminAddRecipePage } from './features/admin/AdminAddRecipePage';
import { AdminCategoriesPage } from './features/admin/AdminCategoriesPage';
import { AdminDashboardPage } from './features/admin/AdminDashboardPage';
import { AdminFamiliesPage } from './features/admin/AdminFamiliesPage';
import { AdminLayout } from './features/admin/AdminLayout';
import { AdminPageContentsPage } from './features/admin/AdminPageContentsPage';
import { AdminRecipesPage } from './features/admin/AdminRecipesPage';
import { AdminUsersPage } from './features/admin/AdminUsersPage';
import { AccountSettingsPage } from './features/account/AccountSettingsPage';
import { GoogleAuthCallbackPage } from './features/auth/GoogleAuthCallbackPage';
import { LoginPage } from './features/auth/LoginPage';
import { ConfirmEmailPage } from './features/auth/ConfirmEmailPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { FamilyMembersPage } from './features/family/FamilyMembersPage';
import { AboutPage } from './features/legal/AboutPage';
import { ContactPage } from './features/legal/ContactPage';
import { CookiePolicyPage } from './features/legal/CookiePolicyPage';
import { KvkkPage } from './features/legal/KvkkPage';
import { PrivacyPolicyPage } from './features/legal/PrivacyPolicyPage';
import { TermsOfServicePage } from './features/legal/TermsOfServicePage';
import { AddRecipePage } from './features/recipes/AddRecipePage';
import { GlobalRecipesPage } from './features/recipes/GlobalRecipesPage';
import { MyRecipesPage } from './features/recipes/MyRecipesPage';
import { PendingApprovalsPage } from './features/recipes/PendingApprovalsPage';
import { RecipeDetailPage } from './features/recipes/RecipeDetailPage';

function GlobalRecipesRedirect() {
  const location = useLocation();
  return <Navigate to={{ pathname: '/', search: location.search }} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<GlobalRecipesPage />} />
        <Route path="globalrecipes" element={<GlobalRecipesRedirect />} />
        <Route path="recipes/:id" element={<RecipeDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="auth/callback" element={<GoogleAuthCallbackPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="confirm-email" element={<ConfirmEmailPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="hakkimizda" element={<AboutPage />} />
        <Route path="iletisim" element={<ContactPage />} />
        <Route path="gizlilik-politikasi" element={<PrivacyPolicyPage />} />
        <Route path="kullanim-sozlesmesi" element={<TermsOfServicePage />} />
        <Route path="kvkk" element={<KvkkPage />} />
        <Route path="cerez-politikasi" element={<CookiePolicyPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="my-recipes" element={<MyRecipesPage />} />
          <Route path="my-recipes/add" element={<AddRecipePage />} />
          <Route path="my-recipes/:id/edit" element={<AddRecipePage />} />
          <Route path="my-recipes/:id" element={<RecipeDetailPage />} />
          <Route path="pending-approvals" element={<PendingApprovalsPage />} />
          <Route path="family" element={<FamilyMembersPage />} />
          <Route path="account" element={<AccountSettingsPage />} />
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
          <Route path="admin/icerikler" element={<AdminPageContentsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
