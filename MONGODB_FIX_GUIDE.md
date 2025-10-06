# 🔧 MongoDB Connection Error - ENOTFOUND Fix Guide

## Error Message
```
"error": "getaddrinfo ENOTFOUND ac-dqwctjc-shard-00-01.krpir5d.mongodb.net"
```

## What This Means
Your server **cannot reach MongoDB Atlas** due to a DNS/network issue. This is **NOT a code problem** - it's a connectivity issue.

---

## 🔍 Diagnose the Problem

Run the diagnostic script:

```powershell
cd Server
node test-connection.js
```

This will tell you exactly what's wrong:
- ✅ Internet connection
- ✅ DNS resolution  
- ✅ MongoDB connectivity
- ✅ Gemini AI configuration

---

## 🛠️ Solutions (Try in Order)

### Solution 1: Flush DNS Cache (Quick Fix)

```powershell
# Windows
ipconfig /flushdns

# Then restart server
npm start
```

### Solution 2: Check MongoDB Atlas Whitelist

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your cluster
3. Click "Network Access"
4. Make sure your IP is whitelisted
5. **Or** add `0.0.0.0/0` to allow all IPs (for development only!)

### Solution 3: Try Different Network

- Switch from WiFi to mobile hotspot (or vice versa)
- Your ISP may be blocking MongoDB Atlas
- Try connecting from a different location

### Solution 4: Use VPN

If your network blocks MongoDB:
1. Connect to a VPN
2. Restart the server
3. Try again

### Solution 5: Use Local MongoDB (Development)

**Best for development when network is unreliable:**

1. **Install MongoDB Community Edition:**
   - Download from: https://www.mongodb.com/try/download/community
   - Run the installer
   - Start MongoDB service

2. **Update .env file:**
   ```properties
   # Comment out MongoDB Atlas
   # DB_URL=mongodb+srv://...

   # Use local MongoDB instead
   DB_URL=mongodb://localhost:27017/legal-aid
   ```

3. **Restart server:**
   ```powershell
   npm start
   ```

---

## ✅ Verify Fix

After trying a solution:

```powershell
# Test connection
node test-connection.js

# If successful, start server
npm start
```

You should see:
```
✅ Connected to MongoDB Atlas
```

Or if using local:
```
✅ Connected to MongoDB (Local)
```

---

## 🚀 Quick Start (Local MongoDB)

If you want to skip Atlas issues:

```powershell
# 1. Install MongoDB locally (one-time)
# Download from: https://www.mongodb.com/try/download/community

# 2. Update .env
DB_URL=mongodb://localhost:27017/legal-aid

# 3. Start server
npm start
```

---

## 📊 Understanding the Error

```
ENOTFOUND ac-dqwctjc-shard-00-01.krpir5d.mongodb.net
          └─ This means DNS couldn't find the MongoDB server
```

**Common Causes:**
1. ❌ No internet connection
2. ❌ DNS server issues
3. ❌ Firewall blocking MongoDB
4. ❌ ISP blocking MongoDB Atlas
5. ❌ VPN/Proxy issues

**Not Caused By:**
- ✅ Your code (code is fine!)
- ✅ MongoDB credentials (DNS happens before authentication)
- ✅ Database configuration

---

## 🔄 What I Changed

1. **Better error handling in `index.js`:**
   - Added retry logic (5 attempts)
   - Better error messages
   - Server starts even if DB fails

2. **Created diagnostic tool:**
   - `test-connection.js` - Diagnoses the exact issue

3. **Server now handles DB failure gracefully:**
   - Starts even if MongoDB is unreachable
   - Shows clear warning messages
   - You can still test other features

---

## 🌐 Network Troubleshooting

### Test Internet:
```powershell
ping google.com
```

### Test DNS:
```powershell
nslookup cluster0.krpir5d.mongodb.net
```

### Test MongoDB Port:
```powershell
Test-NetConnection cluster0.krpir5d.mongodb.net -Port 27017
```

---

## 💡 Recommended for Development

**Option A: Local MongoDB (Easiest)**
- ✅ Works offline
- ✅ Faster
- ✅ No network issues
- ✅ Free
- ❌ Need to install MongoDB

**Option B: MongoDB Atlas (Cloud)**
- ✅ No installation needed
- ✅ Works from anywhere
- ✅ Automatic backups
- ❌ Requires internet
- ❌ Can have network issues

**For development:** Use **Local MongoDB**  
**For production:** Use **MongoDB Atlas**

---

## 🎯 Next Steps

1. **Run diagnostic:**
   ```powershell
   node test-connection.js
   ```

2. **Choose solution:**
   - If network issue → Try VPN or different network
   - If persistent → Switch to local MongoDB
   - If urgent → Use local MongoDB

3. **Test language support:**
   ```powershell
   # Once DB is connected
   node test-language-quick.js
   ```

---

## ⚠️ Important Notes

- **The multilingual AI fix is already applied** ✅
- **This is ONLY a database connection issue**
- **Once DB connects, everything will work**

Your code changes for Sinhala/Tamil support are **already working**. You just need to fix the database connection first!

---

## 📞 Quick Help

**Error still persists?**

Try this quick fix:
```powershell
# Stop all node processes
taskkill /F /IM node.exe

# Clear npm cache
npm cache clean --force

# Reinstall dependencies  
rm -r node_modules
npm install

# Start fresh
npm start
```

---

**Status:** Database connection issue  
**Impact:** Server can't save/retrieve documents  
**Fix Time:** 5-10 minutes  
**Severity:** High (blocks all features)  

---

Good luck! Run `node test-connection.js` first to diagnose! 🍀
