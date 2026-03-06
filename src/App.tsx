import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { AdminApproval } from '@/pages/AdminApproval';
import { ToolCode } from '@/pages/ToolCode';
import { ToolCodeList } from '@/pages/ToolCodeList';

import { RegisterToolCodeQR } from '@/pages/RegisterToolCodeQR';
import { CreateToolListMaster } from '@/pages/CreateToolListMaster';
import { ReviseToolListMaster } from '@/pages/ReviseToolListMaster';
import { ToolDrawing } from '@/pages/ToolDrawing';
import { ViewToolDrawings } from '@/pages/ViewToolDrawings';
import { ToolPresetting } from '@/pages/ToolPresetting';
import { ViewToolPresettings } from '@/pages/ViewToolPresettings';
import { QRGeneratorPage } from '@/pages/QRGeneratorPage';
import { KanbanViewer } from '@/pages/KanbanViewer';
import { ToolTransaction } from '@/pages/ToolTransaction';
import { MasterData } from '@/pages/MasterData';
import { DatabaseViewer } from '@/pages/DatabaseViewer';
import { UserProfile } from '@/pages/UserProfile';
import { useAuthStore } from '@/stores/authStore';
import { useToolStore } from '@/stores/toolStore';
import { initializeMockData } from '@/data/mockData';

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { isAuthenticated } = useAuthStore();
  const { loadData } = useToolStore();

  useEffect(() => {
    // Initialize mock data in localStorage
    initializeMockData();
    // Load tool data
    loadData();
  }, [loadData]);

  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Tool Code Routes */}
        <Route 
          path="/tool-code" 
          element={
            <ProtectedRoute>
              <ToolCode />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tool-code/list" 
          element={
            <ProtectedRoute>
              <ToolCodeList />
            </ProtectedRoute>
          } 
        />
        
        {/* Tool List Routes */}
        <Route 
          path="/tool-list" 
          element={
            <ProtectedRoute>
              <RegisterToolCodeQR />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tool-list/create" 
          element={
            <ProtectedRoute>
              <CreateToolListMaster />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tool-list/revise" 
          element={
            <ProtectedRoute>
              <ReviseToolListMaster />
            </ProtectedRoute>
          } 
        />
        
        {/* Tool Drawing Routes */}
        <Route 
          path="/tool-drawing" 
          element={
            <ProtectedRoute>
              <ToolDrawing />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tool-drawing/view" 
          element={
            <ProtectedRoute>
              <ViewToolDrawings />
            </ProtectedRoute>
          } 
        />
        
        {/* Tool Pre-setting Routes */}
        <Route 
          path="/tool-presetting" 
          element={
            <ProtectedRoute>
              <ToolPresetting />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tool-presetting/view" 
          element={
            <ProtectedRoute>
              <ViewToolPresettings />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/qr-generator" 
          element={
            <ProtectedRoute>
              <QRGeneratorPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/kanban-viewer" 
          element={
            <ProtectedRoute>
              <KanbanViewer />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tool-transaction" 
          element={
            <ProtectedRoute>
              <ToolTransaction />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />

        {/* Admin Only Routes */}
        <Route 
          path="/admin/approval" 
          element={
            <ProtectedRoute adminOnly>
              <AdminApproval />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/master-data" 
          element={
            <ProtectedRoute adminOnly>
              <MasterData />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/database" 
          element={
            <ProtectedRoute adminOnly>
              <DatabaseViewer />
            </ProtectedRoute>
          } 
        />

        {/* Default Routes */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: 'Inter, Sarabun, system-ui, sans-serif',
          },
        }}
      />
    </HashRouter>
  );
}

export default App;
