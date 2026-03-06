import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { mockUsers, STORAGE_KEYS } from '@/data/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (code: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (code: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get users from localStorage or use mock data
        const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        const users: User[] = storedUsers ? JSON.parse(storedUsers) : mockUsers;
        
        const user = users.find(u => u.code === code && u.status === 'ACTIVE');
        
        if (user) {
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
          return true;
        }
        
        set({ isLoading: false });
        return false;
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false 
        });
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      },

      setUser: (user: User) => {
        set({ 
          user, 
          isAuthenticated: true 
        });
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      },

      updateUser: (userId: string, updates: Partial<User>) => {
        const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        if (storedUsers) {
          const users: User[] = JSON.parse(storedUsers);
          const updatedUsers = users.map(u => 
            u.id === userId ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u
          );
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
          
          // Update current user if it's the same user
          const currentUser = get().user;
          if (currentUser && currentUser.id === userId) {
            const updatedUser = { ...currentUser, ...updates, updatedAt: new Date().toISOString() };
            set({ user: updatedUser });
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);
