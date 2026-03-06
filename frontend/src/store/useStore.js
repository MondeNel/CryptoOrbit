import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  isLoggedIn: false,

  setUser: (user) => set({ user, isLoggedIn: true }),

  updateUser: (patch) => set(state => ({
    user: { ...state.user, ...patch }
  })),

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isLoggedIn: false });
  },
}));

export default useStore;