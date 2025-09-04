import { db } from '../database/firebase.js'
import { doc, getDoc, setDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

export class DatabaseManager {
  constructor() {
    this.cache = new Map()
  }

  // Sanitize user ID to ensure it's valid for Firestore
  sanitizeUserId(userId) {
    // Remove @ symbols and other special characters
    let sanitized = userId.replace(/[@.]/g, '_');
    
    // Ensure it doesn't start with invalid characters
    if (sanitized.startsWith('.') || sanitized.startsWith('..')) {
      sanitized = 'user_' + sanitized;
    }
    
    // Add prefix if it's just numbers to avoid potential issues
    if (/^\d+$/.test(sanitized)) {
      sanitized = 'user_' + sanitized;
    }
    
    // Limit length to be safe (Firestore allows up to 1500 bytes)
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 100);
    }
    
    console.log(`[DB] Sanitized ID: ${userId} -> ${sanitized}`);
    return sanitized;
  }

  async getUser(userId) {
    try {
      const sanitizedId = this.sanitizeUserId(userId);
      console.log(`[DB] Getting user: ${sanitizedId}`);
      
      const userRef = doc(db, 'users', sanitizedId)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log(`[DB] User found: ${sanitizedId}`);
        return userData;
      }
      
      console.log(`[DB] User not found: ${sanitizedId}`);
      return null
    } catch (error) {
      console.error(`[DB] Error obteniendo usuario ${userId}:`, error)
      console.error(`[DB] Error details:`, {
        code: error.code,
        message: error.message
      });
      return null
    }
  }

  async createUser(userId, userData) {
    try {
      const sanitizedId = this.sanitizeUserId(userId);
      console.log(`[DB] Creating user: ${sanitizedId}`);
      
      const userRef = doc(db, 'users', sanitizedId)
      const defaultData = {
        name: userData.name || 'Usuario',
        age: userData.age || 18,
        coins: 1000,
        bank: 0,
        level: 1,
        exp: 0,
        lastWork: 0,
        lastDaily: 0,
        lastWeekly: 0,
        lastMonthly: 0,
        registeredAt: Date.now(),
        items: {},
        // Store original user ID for reference
        originalUserId: userId,
        ...userData
      }
      
      console.log(`[DB] User data to create:`, defaultData);
      await setDoc(userRef, defaultData)
      console.log(`[DB] User created successfully: ${sanitizedId}`);
      return defaultData
    } catch (error) {
      console.error(`[DB] Error creando usuario ${userId}:`, error)
      console.error(`[DB] Error details:`, {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      return null
    }
  }

  async updateUser(userId, updates) {
    try {
      const sanitizedId = this.sanitizeUserId(userId);
      console.log(`[DB] Updating user: ${sanitizedId}`, updates);
      
      const userRef = doc(db, 'users', sanitizedId)
      await updateDoc(userRef, updates)
      console.log(`[DB] User updated successfully: ${sanitizedId}`);
      return true
    } catch (error) {
      console.error(`[DB] Error actualizando usuario ${userId}:`, error)
      console.error(`[DB] Error details:`, {
        code: error.code,
        message: error.message
      });
      return false
    }
  }

  async addCoins(userId, amount) {
    try {
      const user = await this.getUser(userId)
      if (!user) {
        console.log(`[DB] Cannot add coins: user not found ${userId}`);
        return false;
      }
      
      const newBalance = user.coins + amount
      const success = await this.updateUser(userId, { coins: newBalance })
      
      if (success) {
        console.log(`[DB] Added ${amount} coins to ${userId}. New balance: ${newBalance}`);
        return newBalance;
      }
      return false;
    } catch (error) {
      console.error('Error añadiendo coins:', error)
      return false
    }
  }

  async removeCoins(userId, amount) {
    try {
      const user = await this.getUser(userId)
      if (!user || user.coins < amount) return false
      
      const newBalance = user.coins - amount
      await this.updateUser(userId, { coins: newBalance })
      return newBalance
    } catch (error) {
      console.error('Error removiendo coins:', error)
      return false
    }
  }

  async transferCoins(fromUserId, toUserId, amount) {
    try {
      const fromUser = await this.getUser(fromUserId)
      const toUser = await this.getUser(toUserId)
      
      if (!fromUser || !toUser || fromUser.coins < amount) {
        return false
      }
      
      await this.updateUser(fromUserId, { coins: fromUser.coins - amount })
      await this.updateUser(toUserId, { coins: toUser.coins + amount })
      
      return true
    } catch (error) {
      console.error('Error transfiriendo coins:', error)
      return false
    }
  }

  async getLeaderboard(limitCount = 10) {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, orderBy('coins', 'desc'), limit(limitCount))
      const querySnapshot = await getDocs(q)
      
      const leaderboard = []
      querySnapshot.forEach((doc) => {
        leaderboard.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      return leaderboard
    } catch (error) {
      console.error('Error obteniendo leaderboard:', error)
      return []
    }
  }

  async canUseCommand(userId, command, cooldownHours = 24) {
    try {
      const user = await this.getUser(userId)
      if (!user) return false
      
      const lastUsed = user[`last${command}`] || 0
      const cooldownMs = cooldownHours * 60 * 60 * 1000
      const now = Date.now()
      
      return (now - lastUsed) >= cooldownMs
    } catch (error) {
      console.error('Error verificando cooldown:', error)
      return false
    }
  }

  async updateLastUsed(userId, command) {
    try {
      const updateData = {}
      updateData[`last${command}`] = Date.now()
      await this.updateUser(userId, updateData)
      return true
    } catch (error) {
      console.error('Error actualizando último uso:', error)
      return false
    }
  }

  async addItem(userId, itemName, quantity = 1) {
    try {
      const user = await this.getUser(userId)
      if (!user) return false
      
      const items = user.items || {}
      items[itemName] = (items[itemName] || 0) + quantity
      
      await this.updateUser(userId, { items })
      return true
    } catch (error) {
      console.error('Error añadiendo item:', error)
      return false
    }
  }

  async removeItem(userId, itemName, quantity = 1) {
    try {
      const user = await this.getUser(userId)
      if (!user) return false
      
      const items = user.items || {}
      if (!items[itemName] || items[itemName] < quantity) {
        return false
      }
      
      items[itemName] -= quantity
      if (items[itemName] <= 0) {
        delete items[itemName]
      }
      
      await this.updateUser(userId, { items })
      return true
    } catch (error) {
      console.error('Error removiendo item:', error)
      return false
    }
  }

  async getGroupSettings(groupId) {
    try {
      const sanitizedId = this.sanitizeUserId(groupId);
      const groupRef = doc(db, 'groups', sanitizedId)
      const groupDoc = await getDoc(groupRef)
      
      if (groupDoc.exists()) {
        return groupDoc.data()
      }
      
      const defaultSettings = {
        antilink: false,
        welcome: false,
        welcomeMessage: null,
        byeMessage: null
      }
      
      await setDoc(groupRef, defaultSettings)
      return defaultSettings
    } catch (error) {
      console.error('Error obteniendo configuración de grupo:', error)
      return null
    }
  }

  async updateGroupSettings(groupId, settings) {
    try {
      const sanitizedId = this.sanitizeUserId(groupId);
      const groupRef = doc(db, 'groups', sanitizedId)
      await updateDoc(groupRef, settings)
      return true
    } catch (error) {
      console.error('Error actualizando configuración de grupo:', error)
      return false
    }
  }
}

export const dbManager = new DatabaseManager()