import { createContext, useContext, useState, useEffect } from 'react';
import { mockRequests } from '../data/mockRequests';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [requests, setRequests] = useState([]);
  const [toast, setToast] = useState(null);
  const [emergencyDrawerOpen, setEmergencyDrawerOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    bloodGroup: 'all',
    radius: 10,
    availableOnly: false,
    sortBy: 'distance',
    locality: 'Koramangala',
    lat: 12.9352,
    lng: 77.6245,
  });

  useEffect(() => {
    const stored = localStorage.getItem('bb_requests');
    if (stored) {
      try {
        setRequests(JSON.parse(stored));
      } catch {
        setRequests(mockRequests);
      }
    } else {
      setRequests(mockRequests);
    }
  }, []);

  const persistRequests = (reqs) => {
    localStorage.setItem('bb_requests', JSON.stringify(reqs));
    setRequests(reqs);
  };

  const sendRequest = (requestData) => {
    const newReq = {
      ...requestData,
      id: `req-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    persistRequests([newReq, ...requests]);
    showToast('Request sent successfully!', 'success');
    return newReq;
  };

  const updateRequestStatus = (reqId, status) => {
    const updated = requests.map(r => r.id === reqId ? { ...r, status } : r);
    persistRequests(updated);
    showToast(`Request ${status}!`, status === 'accepted' ? 'success' : 'info');
  };

  const cancelRequest = (reqId) => {
    const updated = requests.map(r => r.id === reqId ? { ...r, status: 'cancelled' } : r);
    persistRequests(updated);
    showToast('Request cancelled', 'info');
  };

  const showToast = (message, type = 'info', duration = 3500) => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => setToast(null), duration);
  };

  const dismissToast = () => setToast(null);

  return (
    <AppContext.Provider value={{
      requests, sendRequest, updateRequestStatus, cancelRequest,
      toast, showToast, dismissToast,
      searchFilters, setSearchFilters,
      emergencyDrawerOpen, setEmergencyDrawerOpen,
      openEmergencyDrawer: () => setEmergencyDrawerOpen(true),
      closeEmergencyDrawer: () => setEmergencyDrawerOpen(false),
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
