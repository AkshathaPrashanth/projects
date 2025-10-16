// Category-based localStorage management with correct categories
class CategoryDataManager {
  constructor() {
    this.categories = ['food', 'transport', 'entertainment', 'shopping', 'bills', 'other'];
    this.initializeCategories();
  }

  // Initialize empty categories if they don't exist
  initializeCategories() {
    this.categories.forEach(category => {
      if (!localStorage.getItem(category)) {
        localStorage.setItem(category, JSON.stringify([]));
      }
    });
    
    // Save category list for reference
    localStorage.setItem('expense_categories', JSON.stringify(this.categories));
  }

  // Save expense to specific category
  saveExpenseToCategory(expense) {
    const category = this.mapCategoryName(expense.category) || 'other';
    const categoryExpenses = this.getExpensesByCategory(category);
    
    const expenseData = {
      id: expense.id || Date.now(),
      amount: expense.amount,
      description: expense.description,
      date: expense.date || new Date().toLocaleDateString(),
      timestamp: Date.now()
    };
    
    categoryExpenses.push(expenseData);
    localStorage.setItem(category, JSON.stringify(categoryExpenses));
    
    console.log(`Expense saved to ${category}:`, expenseData);
    return expenseData;
  }

  // Get all expenses from a specific category
  getExpensesByCategory(category) {
    try {
      const data = localStorage.getItem(category);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error loading category ${category}:`, error);
      return [];
    }
  }

  // Get all expenses from all categories
  getAllExpenses() {
    const allExpenses = {};
    this.categories.forEach(category => {
      allExpenses[category] = this.getExpensesByCategory(category);
    });
    return allExpenses;
  }

  // Get flattened list of all expenses (for backward compatibility)
  getAllExpensesFlattened() {
    const allExpenses = [];
    this.categories.forEach(category => {
      const categoryExpenses = this.getExpensesByCategory(category);
      categoryExpenses.forEach(expense => {
        allExpenses.push({
          ...expense,
          category: category
        });
      });
    });
    return allExpenses.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Delete expense from category
  deleteExpenseFromCategory(expenseId) {
    let deletedFrom = null;
    
    this.categories.forEach(category => {
      const categoryExpenses = this.getExpensesByCategory(category);
      const filteredExpenses = categoryExpenses.filter(expense => expense.id !== expenseId);
      
      if (filteredExpenses.length !== categoryExpenses.length) {
        localStorage.setItem(category, JSON.stringify(filteredExpenses));
        deletedFrom = category;
      }
    });
    
    return deletedFrom;
  }

  // Get category statistics
  getCategoryStats() {
    const stats = {};
    this.categories.forEach(category => {
      const expenses = this.getExpensesByCategory(category);
      const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      stats[category] = {
        count: expenses.length,
        total: total,
        average: expenses.length > 0 ? total / expenses.length : 0
      };
    });
    return stats;
  }

  // Map category names from app to storage keys
  mapCategoryName(appCategory) {
    const categoryMap = {
      'food': 'food',
      'delivery': 'food',
      'dining': 'food',
      'restaurant': 'food',
      'transport': 'transport',
      'transportation': 'transport',
      'travel': 'transport',
      'uber': 'transport',
      'taxi': 'transport',
      'entertainment': 'entertainment',
      'fun': 'entertainment',
      'movies': 'entertainment',
      'games': 'entertainment',
      'shopping': 'shopping',
      'shop': 'shopping',
      'store': 'shopping',
      'clothes': 'shopping',
      'bills': 'bills',
      'utilities': 'bills',
      'rent': 'bills',
      'insurance': 'bills',
      'other': 'other',
      'miscellaneous': 'other',
      'misc': 'other'
    };
    return categoryMap[appCategory?.toLowerCase()] || 'other';
  }

  // Export all data
  exportAllData() {
    const allData = this.getAllExpenses();
    const exportData = {
      categories: allData,
      metadata: {
        exportDate: new Date().toISOString(),
        totalCategories: this.categories.length,
        version: '2.0.0'
      }
    };
    return exportData;
  }

  // Import data (merge with existing)
  importData(importedData) {
    if (importedData.categories) {
      // New format - category-based
      Object.keys(importedData.categories).forEach(category => {
        if (this.categories.includes(category)) {
          const existingExpenses = this.getExpensesByCategory(category);
          const newExpenses = importedData.categories[category];
          const mergedExpenses = [...existingExpenses, ...newExpenses];
          localStorage.setItem(category, JSON.stringify(mergedExpenses));
        }
      });
    } else if (importedData.expenses) {
      // Old format - flat array
      importedData.expenses.forEach(expense => {
        this.saveExpenseToCategory(expense);
      });
    }
  }

  // Clear all data
  clearAllData() {
    this.categories.forEach(category => {
      localStorage.setItem(category, JSON.stringify([]));
    });
  }

  // Clear specific category
  clearCategory(category) {
    if (this.categories.includes(category)) {
      localStorage.setItem(category, JSON.stringify([]));
      return true;
    }
    return false;
  }
}

// PWA App.js - Main PWA functionality with Category-based Storage
class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.init();
  }

  async init() {
    // Initialize category data manager first
    if (typeof window.categoryDataManager === 'undefined') {
      window.categoryDataManager = new CategoryDataManager();
    }

    // Register service worker
    await this.registerServiceWorker();
    
    // Setup install prompt
    this.setupInstallPrompt();
    
    // Setup offline detection
    this.setupOfflineDetection();
    
    // Setup data persistence
    this.setupDataPersistence();
    
    // Setup notifications
    this.setupNotifications();
    
    // Setup background sync
    this.setupBackgroundSync();
    
    // Check if already installed
    this.checkInstallStatus();
    
    console.log('PWA Manager initialized with category-based storage');
  }

  // Register Service Worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        navigator.serviceWorker.register('./sw.js', { scope: './' })

        
        console.log('ServiceWorker registered successfully:', registration.scope);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                this.showUpdateNotification();
              }
            }
          });
        });
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('Message from service worker:', event.data);
          if (event.data.type === 'EXPENSE_SYNC') {
            this.showNotification('Data synced successfully!');
          }
        });
        
        return registration;
      } catch (error) {
        console.error('ServiceWorker registration failed:', error);
      }
    }
  }

  // Setup install prompt
  setupInstallPrompt() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', (e) => {
      console.log('PWA was installed');
      this.isInstalled = true;
      this.hideInstallButton();
      this.showNotification('Finance Manager installed successfully!');
    });
  }

  // Show install button
  showInstallButton() {
    const installButton = this.createInstallButton();
    document.body.appendChild(installButton);
  }

  // Create install button
  createInstallButton() {
    const button = document.createElement('button');
    button.id = 'install-button';
    button.innerHTML = '<i class="fa-solid fa-download"></i> Install App';
    button.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      z-index: 1001;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
    `;
    
    button.addEventListener('mouseover', () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
    });
    
    button.addEventListener('click', () => this.installApp());
    
    return button;
  }

  // Install app
  async installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      this.deferredPrompt = null;
      this.hideInstallButton();
    }
  }

  // Hide install button
  hideInstallButton() {
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.remove();
    }
  }

  // Check install status
  checkInstallStatus() {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      this.isInstalled = true;
      console.log('App is running in standalone mode');
    }
  }

  // Setup offline detection
  setupOfflineDetection() {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      const statusElement = this.getOrCreateStatusElement();
      
      if (isOnline) {
        statusElement.textContent = 'Online';
        statusElement.className = 'status-online';
        this.syncWhenOnline();
      } else {
        statusElement.textContent = 'Offline';
        statusElement.className = 'status-offline';
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus(); // Initial check
  }

  // Get or create status element
  getOrCreateStatusElement() {
    let statusElement = document.getElementById('connection-status');
    if (!statusElement) {
      statusElement = document.createElement('div');
      statusElement.id = 'connection-status';
      statusElement.style.cssText = `
        position: fixed;
        top: 80px;
        left: 20px;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        z-index: 1001;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(statusElement);
    }
    
    // Add CSS classes
    if (!document.getElementById('status-styles')) {
      const styles = document.createElement('style');
      styles.id = 'status-styles';
      styles.textContent = `
        .status-online {
          background: #48bb78;
          color: white;
        }
        .status-offline {
          background: #e53e3e;
          color: white;
        }
      `;
      document.head.appendChild(styles);
    }
    
    return statusElement;
  }

  // Setup data persistence with category-based storage
  setupDataPersistence() {
    // Request persistent storage
    if ('storage' in navigator && 'persist' in navigator.storage) {
      navigator.storage.persist().then((persistent) => {
        console.log(`Persistent storage granted: ${persistent}`);
      });
    }

    // Initialize category data manager if not already done
    if (typeof window.categoryDataManager === 'undefined') {
      window.categoryDataManager = new CategoryDataManager();
    }

    // Save data to localStorage with versioning
    this.saveDataPeriodically();
  }

  // Save data periodically (modified for category-based storage)
  saveDataPeriodically() {
    setInterval(() => {
      try {
        // Save notes data separately
        const notesData = {
          notes: window.notes || [],
          timestamp: Date.now(),
          version: '2.0.0'
        };
        localStorage.setItem('financeManagerNotes', JSON.stringify(notesData));

        // Save metadata about categories
        const categoryStats = window.categoryDataManager ? 
          window.categoryDataManager.getCategoryStats() : {};
        
        const metaData = {
          categoryStats: categoryStats,
          lastSaved: Date.now(),
          version: '2.0.0'
        };
        localStorage.setItem('financeManagerMeta', JSON.stringify(metaData));

        console.log('Notes and metadata saved to localStorage. Category expenses managed separately.');
        
        // Log current category storage status
        if (window.categoryDataManager) {
          const allExpenses = window.categoryDataManager.getAllExpenses();
          console.log('Current category storage:', Object.keys(allExpenses).map(cat => ({
            category: cat,
            count: allExpenses[cat].length
          })));
        }

      } catch (error) {
        console.error('Error saving data:', error);
        
        // Fallback: try to free up space and retry
        if (error.name === 'QuotaExceededError') {
          this.cleanupOldData();
          this.showNotification('Storage quota exceeded. Cleaned up old data.', 'warning');
        }
      }
    }, 30000); // Save every 30 seconds
  }
/*
  // Load saved data (modified for category-based storage)
  loadSavedData() {
    try {
      // Initialize category data manager if not exists
      if (typeof window.categoryDataManager === 'undefined') {
        window.categoryDataManager = new CategoryDataManager();
      }

      // Load category-based expenses into global expenses array for UI compatibility
      this.loadExpensesFromStorage();

      // Load notes from separate storage
      const savedNotes = localStorage.getItem('financeManagerNotes');
      if (savedNotes) {
        const notesData = JSON.parse(savedNotes);
        window.notes = notesData.notes || [];
        console.log(`Loaded ${window.notes.length} notes from localStorage`);
      } else {
        window.notes = [];
      }

      // Load metadata
      const savedMeta = localStorage.getItem('financeManagerMeta');
      if (savedMeta) {
        const metaData = JSON.parse(savedMeta);
        console.log('Metadata loaded:', metaData);
      }

      // Check for legacy data and migrate if needed
      this.migrateLegacyData();

      console.log('Data loaded from category-based localStorage');
      
      // Return summary of loaded data
      const summary = {
        success: true,
        totalExpenses: window.expenses ? window.expenses.length : 0,
        totalNotes: window.notes.length,
        categories: window.categoryDataManager.getCategoryStats()
      };
      
      console.log('Load summary:', summary);
      return summary;

    } catch (error) {
      console.error('Error loading saved data:', error);
      
      // Initialize empty data on error
      window.expenses = [];
      window.notes = [];
      
      return { 
        success: false, 
        error: error.message,
        totalExpenses: 0,
        totalNotes: 0 
      };
    }
  }
*/

// Enhanced loadSavedData function in PWAManager
loadSavedData() {
  try {
    console.log('Loading saved data from localStorage...');
    
    // Initialize category data manager if not exists
    if (typeof window.categoryDataManager === 'undefined') {
      window.categoryDataManager = new CategoryDataManager();
    }

    // Load category-based expenses
    window.expenses = window.categoryDataManager.getAllExpensesFlattened();
    console.log(`Loaded ${window.expenses.length} expenses from category storage`);

    // Load notes from separate storage
    const savedNotes = localStorage.getItem('financeManagerNotes');
    if (savedNotes) {
      const notesData = JSON.parse(savedNotes);
      window.notes = notesData.notes || [];
      console.log(`Loaded ${window.notes.length} notes from localStorage`);
    } else {
      window.notes = [];
    }

    // Check for legacy data and migrate if needed
    this.migrateLegacyData();

    // Update UI immediately after loading data
    setTimeout(() => {
      updateUI();
    }, 100);

    console.log('Data loaded and UI updated successfully');
    
    return {
      success: true,
      totalExpenses: window.expenses.length,
      totalNotes: window.notes.length,
      categories: window.categoryDataManager.getCategoryStats()
    };

  } catch (error) {
    console.error('Error loading saved data:', error);
    
    // Initialize empty data on error
    window.expenses = [];
    window.notes = [];
    
    return { 
      success: false, 
      error: error.message,
      totalExpenses: 0,
      totalNotes: 0 
    };
  }
}

  // Helper function to load expenses from category storage
  loadExpensesFromStorage() {
    if (window.categoryDataManager) {
      window.expenses = window.categoryDataManager.getAllExpensesFlattened();
      console.log(`Loaded ${window.expenses.length} expenses from category storage`);
    } else {
      window.expenses = [];
    }
  }

  // Migrate legacy data to new category-based system
  migrateLegacyData() {
    try {
      const legacyData = localStorage.getItem('financeManagerData');
      if (legacyData) {
        console.log('Found legacy data, migrating...');
        const data = JSON.parse(legacyData);
        
        // Migrate expenses to category-based storage
        if (data.expenses && Array.isArray(data.expenses)) {
          data.expenses.forEach(expense => {
            window.categoryDataManager.saveExpenseToCategory(expense);
          });
          console.log(`Migrated ${data.expenses.length} expenses to category storage`);
        }

        // Migrate notes if they don't exist in new format
        if (data.notes && !localStorage.getItem('financeManagerNotes')) {
          const notesData = {
            notes: data.notes,
            timestamp: Date.now(),
            version: '2.0.0'
          };
          localStorage.setItem('financeManagerNotes', JSON.stringify(notesData));
          console.log(`Migrated ${data.notes.length} notes to new format`);
        }

        // Remove legacy data after successful migration
        localStorage.removeItem('financeManagerData');
        console.log('Legacy data migration completed and old data removed');
        
        this.showNotification('Data migrated to new format successfully!', 'success');
      }
    } catch (error) {
      console.error('Error migrating legacy data:', error);
    }
  }

  // Cleanup old data to free up storage space
  cleanupOldData() {
    try {
      const cutoffDate = Date.now() - (90 * 24 * 60 * 60 * 1000); // 90 days ago
      
      // Clean up old expenses from each category
      if (window.categoryDataManager) {
        window.categoryDataManager.categories.forEach(category => {
          const expenses = window.categoryDataManager.getExpensesByCategory(category);
          const recentExpenses = expenses.filter(expense => 
            (expense.timestamp || Date.now()) > cutoffDate
          );
          
          if (recentExpenses.length < expenses.length) {
            localStorage.setItem(category, JSON.stringify(recentExpenses));
            console.log(`Cleaned up ${expenses.length - recentExpenses.length} old expenses from ${category}`);
          }
        });
      }

      // Clean up old notes
      const savedNotes = localStorage.getItem('financeManagerNotes');
      if (savedNotes) {
        const notesData = JSON.parse(savedNotes);
        if (notesData.notes) {
          const recentNotes = notesData.notes.filter(note => 
            (note.timestamp || Date.now()) > cutoffDate
          );
          
          if (recentNotes.length < notesData.notes.length) {
            notesData.notes = recentNotes;
            localStorage.setItem('financeManagerNotes', JSON.stringify(notesData));
            console.log(`Cleaned up ${notesData.notes.length - recentNotes.length} old notes`);
          }
        }
      }

      console.log('Data cleanup completed');
    } catch (error) {
      console.error('Error during data cleanup:', error);
    }
  }

  // Setup notifications
  async setupNotifications() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log(`Notification permission: ${permission}`);
      
      if (permission === 'granted') {
        // Setup push notifications if supported
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          await this.setupPushNotifications();
        }
      }
    }
  }

  // Setup push notifications
  async setupPushNotifications() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY_HERE')
      });
      
      console.log('Push notification subscription:', subscription);
      // Send subscription to your server here
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  }

  // Convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Setup background sync
  setupBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        // Register sync event
        return registration.sync.register('expense-sync');
      }).then(() => {
        console.log('Background sync registered');
      }).catch((error) => {
        console.error('Background sync registration failed:', error);
      });
    }
  }

  // Sync when online
  async syncWhenOnline() {
    if (navigator.onLine && 'serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('expense-sync');
      console.log('Sync requested');
    }
  }

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${type === 'error' ? '#e53e3e' : type === 'warning' ? '#f59e0b' : '#48bb78'};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      z-index: 1002;
      font-weight: 600;
      transform: translateX(400px);
      transition: all 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Show update notification
  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: #667eea;
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      z-index: 1002;
      font-weight: 600;
    `;
    
    notification.innerHTML = `
      <div style="margin-bottom: 8px;">New update available!</div>
      <button onclick="this.parentElement.remove(); window.location.reload();" 
              style="background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">
        Update Now
      </button>
      <button onclick="this.parentElement.remove();" 
              style="background: transparent; color: white; border: 1px solid white; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-left: 8px;">
        Later
      </button>
    `;
    
    document.body.appendChild(notification);
  }

  // Export data (updated for category-based storage)
  exportData() {
    const categoryData = window.categoryDataManager.exportAllData();
    const notesData = {
      notes: window.notes || [],
      timestamp: Date.now()
    };
    
    const exportData = {
      ...categoryData,
      notes: notesData.notes,
      exportDate: new Date().toISOString(),
      version: '2.0.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.showNotification('Data exported successfully!');
  }

  // Import data (updated for category-based storage)
  importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Import category-based data
        window.categoryDataManager.importData(data);
        
        // Import notes
        if (data.notes) {
          window.notes = [...(window.notes || []), ...data.notes];
        }
        
        // Refresh UI
        this.loadExpensesFromStorage();
        if (typeof updateExpensesList === 'function') updateExpensesList();
        if (typeof updateNotesList === 'function') updateNotesList();
        if (typeof updateSummary === 'function') updateSummary();
        
        this.showNotification('Data imported successfully!');
      } catch (error) {
        console.error('Import error:', error);
        this.showNotification('Error importing data!', 'error');
      }
    };
    reader.readAsText(file);
  }

  // Backup all category data
  backupCategoryData() {
    try {
      const backup = {
        categories: window.categoryDataManager.getAllExpenses(),
        notes: window.notes || [],
        metadata: {
          backupDate: new Date().toISOString(),
          version: '2.0.0',
          totalExpenses: window.expenses ? window.expenses.length : 0,
          stats: window.categoryDataManager.getCategoryStats()
        }
      };
      
      const backupString = JSON.stringify(backup);
      localStorage.setItem('financeManagerBackup', backupString);
      console.log('Backup created successfully');
      
      return backup;
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }

  // Restore from backup
  restoreFromBackup() {
    try {
      const backupString = localStorage.getItem('financeManagerBackup');
      if (backupString) {
        const backup = JSON.parse(backupString);
        
        // Restore categories
        if (backup.categories) {
          Object.keys(backup.categories).forEach(category => {
            localStorage.setItem(category, JSON.stringify(backup.categories[category]));
          });
        }
        
        // Restore notes
        if (backup.notes) {
          const notesData = {
            notes: backup.notes,
            timestamp: Date.now(),
            version: '2.0.0'
          };
          localStorage.setItem('financeManagerNotes', JSON.stringify(notesData));
        }
        
        // Reload data
        this.loadSavedData();
        
        console.log('Data restored from backup successfully');
        this.showNotification('Data restored from backup!', 'success');
        
        return true;
      } else {
        this.showNotification('No backup found!', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error restoring from backup:', error);
      this.showNotification('Error restoring backup!', 'error');
      return false;
    }
  }
}

// Initialize PWA Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const pwaManager = new PWAManager();
  
  // Load saved data
  pwaManager.loadSavedData();
  
  // Make PWA manager globally available
  window.pwaManager = pwaManager;
  
  // Add export/import buttons to the UI
  setTimeout(() => {
    addPWAButtons(pwaManager);
  }, 1000);
});

// Add PWA-specific buttons to UI
function addPWAButtons(pwaManager) {
  const settingsButton = document.createElement('button');
  settingsButton.innerHTML = '<i class="fa-solid fa-cog"></i>';
  settingsButton.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 20px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    padding: 12px;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    z-index: 999;
    font-size: 16px;
    width: 50px;
    height: 50px;
  `;
  
  settingsButton.addEventListener('click', () => {
    showPWAMenu(pwaManager);
  });
  
  document.body.appendChild(settingsButton);
}

// Show PWA menu (enhanced for category management)
function showPWAMenu(pwaManager) {
  const menu = document.createElement('div');
  menu.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 80px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 220px;
    overflow: hidden;
  `;
  
  menu.innerHTML = `
    <div style="padding: 16px; border-bottom: 1px solid #e2e8f0;">
      <strong>PWA Settings</strong>
    </div>
    <button onclick="window.pwaManager.exportData(); this.parentElement.remove();" 
            style="width: 100%; padding: 12px 16px; border: none; background: none; text-align: left; cursor: pointer; border-bottom: 1px solid #e2e8f0;">
      <i class="fa-solid fa-download"></i> Export Data
    </button>
    <button onclick="document.getElementById('import-input').click(); this.parentElement.remove();" 
            style="width: 100%; padding: 12px 16px; border: none; background: none; text-align: left; cursor: pointer; border-bottom: 1px solid #e2e8f0;">
      <i class="fa-solid fa-upload"></i> Import Data
    </button>
    <button onclick="showCategoryStats(); this.parentElement.remove();" 
            style="width: 100%; padding: 12px 16px; border: none; background: none; text-align: left; cursor: pointer; border-bottom: 1px solid #e2e8f0;">
      <i class="fa-solid fa-chart-bar"></i> Category Stats
    </button>
    <button onclick="window.pwaManager.backupCategoryData(); window.pwaManager.showNotification('Backup created!'); this.parentElement.remove();" 
            style="width: 100%; padding: 12px 16px; border: none; background: none; text-align: left; cursor: pointer; border-bottom: 1px solid #e2e8f0;">
      <i class="fa-solid fa-save"></i> Create Backup
    </button>
    <button onclick="window.pwaManager.restoreFromBackup(); this.parentElement.remove();" 
            style="width: 100%; padding: 12px 16px; border: none; background: none; text-align: left; cursor: pointer; border-bottom: 1px solid #e2e8f0;">
      <i class="fa-solid fa-undo"></i> Restore Backup
    </button>
    <button onclick="caches.delete('finance-manager-v1.0.0').then(() => window.location.reload());" 
            style="width: 100%; padding: 12px 16px; border: none; background: none; text-align: left; cursor: pointer; color: #e53e3e;">
      <i class="fa-solid fa-refresh"></i> Clear Cache
    </button>
  `;
  
  document.body.appendChild(menu);
  
  // Close menu when clicking outside
  setTimeout(() => {
    const closeMenu = (e) => {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    document.addEventListener('click', closeMenu);
  }, 100);
  
  // Add hidden import input
  if (!document.getElementById('import-input')) {
    const importInput = document.createElement('input');
    importInput.id = 'import-input';
    importInput.type = 'file';
    importInput.accept = '.json';
    importInput.style.display = 'none';
    importInput.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        pwaManager.importData(e.target.files[0]);
      }
    });
    document.body.appendChild(importInput);
  }
}

// Show category statistics
function showCategoryStats() {
  if (window.categoryDataManager) {
    const stats = window.categoryDataManager.getCategoryStats();
    const allExpenses = window.categoryDataManager.getAllExpenses();
    
    let statsText = 'CATEGORY STATISTICS:\n\n';
    Object.keys(stats).forEach(category => {
      const stat = stats[category];
      statsText += `${category.toUpperCase()}:\n`;
      statsText += `  • Count: ${stat.count} expenses\n`;
      statsText += `  • Total: ₹${stat.total.toFixed(2)}\n`;
      statsText += `  • Average: ₹${stat.average.toFixed(2)}\n\n`;
    });
    
    alert(statsText);
    console.log('Category Statistics:', stats);
    console.log('All Expenses by Category:', allExpenses);
  }
}

// Helper function to load expenses from storage (for main app compatibility)
function loadExpensesFromStorage() {
  if (window.categoryDataManager) {
    window.expenses = window.categoryDataManager.getAllExpensesFlattened();
    console.log(`Loaded ${window.expenses.length} expenses from category storage`);
  } else {
    window.expenses = [];
  }
}
