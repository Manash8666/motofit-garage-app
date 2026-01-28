# MotoFit 2 Offline-First Architecture

## How It Works

### 1. **API Client** (`utils/api.ts`)
- Axios-based HTTP client
- Auto-adds authentication tokens
- Detects online/offline status
- Falls back to localStorage when offline

### 2. **Sync Manager** (`utils/syncManager.ts`)
- **Sync Down**: Pulls latest data from API → saves to localStorage
- **Sync Up**: Pushes pending changes from localStorage → API
- **Queue**: Stores failed operations for retry
- **Auto-Sync**: Every 5 minutes when online
- **Event Listeners**: Syncs immediately when connection restored

### 3. **Zustand Stores** (Hybrid Pattern)
```typescript
// Example: Job Store with Offline-First
import { jobsApi, apiRequest, isOnline } from '../utils/api';
import { syncManager } from '../utils/sync Manager';

const useJobStore = create((set, get) => ({
  jobs: [],
  loading: false,
  
  // Fetch jobs (API first, localStorage fallback)
  fetchJobs: async () => {
    set({ loading: true });
    
    try {
      const jobs = await apiRequest(
        () => jobsApi.getAll(),
        () => {
          // Fallback: Read from localStorage
          const cached = localStorage.getItem('jobs_data');
          return cached ? JSON.parse(cached) : [];
        }
      );
      
      set({ jobs, loading: false });
      
      // If online, save to localStorage
      if (isOnline()) {
        localStorage.setItem('jobs_data', JSON.stringify(jobs));
      }
    } catch (error) {
      set({ loading: false });
    }
  },
  
  // Create job (offline-first)
  createJob: async (jobData) => {
    const tempId = `temp_${Date.now()}`;
    const newJob = { id: tempId, ...jobData };
    
    // 1. Immediately add to state & localStorage (optimistic update)
    const currentJobs = get().jobs;
    const updatedJobs = [...currentJobs, newJob];
    set({ jobs: updatedJobs });
    localStorage.setItem('jobs_data', JSON.stringify(updatedJobs));
    
    // 2. Try to sync to API if online
    if (isOnline()) {
      try {
        const createdJob = await jobsApi.create(jobData);
        // Replace temp job with real one
        const finalJobs = updatedJobs.map(j => 
          j.id === tempId ? createdJob : j
        );
        set({ jobs: finalJobs });
        localStorage.setItem('jobs_data', JSON.stringify(finalJobs));
      } catch (error) {
        // Add to sync queue for later
        syncManager.addToQueue({
          type: 'create',
          entity: 'jobs',
          data: jobData
        });
      }
    } else {
      // Add to sync queue
      syncManager.addToQueue({
        type: 'create',
        entity: 'jobs',
        data: jobData
      });
    }
  }
}));
```

---

## Data Flow

### When Online:
```
User Action → Zustand Store → API Call → TiDB
                ↓
        Update localStorage
                ↓
        UI Updates (React)
```

### When Offline:
```
User Action → Zustand Store → localStorage
                ↓
        Add to Sync Queue
                ↓
        UI Updates (React)
```

### When Connection Restored:
```
Online Event → Sync Manager → Process Queue → API Calls → TiDB
                                    ↓
             Update localStorage with latest data
                                    ↓
                      Zustand Store refreshes → UI updates
```

---

## Key Benefits

✅ **Always Available**: Works completely offline  
✅ **Optimistic Updates**: Instant UI feedback  
✅ **Automatic Sync**: Background syncing when online  
✅ **Conflict Resolution**: Queue-based retry mechanism  
✅ **No Data Loss**: All changes queued for upload  
✅ **PWA Ready**: Perfect for service workers  

---

## Usage Examples

### Initialize Sync on App Start
```typescript
// In App.tsx or main.tsx
import { syncManager } from './utils/syncManager';

useEffect(() => {
  // Initial sync
  syncManager.fullSync();
  
  // Show sync status
  const status = syncManager.getStatus();
  console.log('Sync Status:', status);
}, []);
```

### Manual Sync Trigger
```typescript
<button onClick={() => syncManager.fullSync()}>
  Sync Now {syncManager.getStatus().pendingChanges > 0 && '(!)'}
</button>
```

### Show Online/Offline Indicator
```typescript
import { isOnline } from './utils/api';

function StatusIndicator() {
  const [online, setOnline] = useState(isOnline());
  
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return (
    <div className={online ? 'text-green-500' : 'text-red-500'}>
      {online ? '🟢 Online' : '📴 Offline'}
    </div>
  );
}
```

---

## Next Steps

1. **Update All Zustand Stores** with hybrid pattern
2. **Add Sync Status UI** component
3. **Test Offline Behavior**:
   - Create job while offline
   - Go back online
   - Verify auto-sync
4. **Implement Conflict Resolution** (if needed)
