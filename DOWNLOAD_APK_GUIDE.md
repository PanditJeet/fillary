# How to Get Your Fillary .APK File

Your repository is now configured with an automated cloud build pipeline via **GitHub Actions**. This compiles the native Android project in the cloud and delivers an installable `.apk` directly to you without needing heavy Android SDK downloads on your PC.

---

## 🚀 3 Quick Steps to Download Your .APK

### Step 1: Push Your Code to GitHub
1. Go to [github.com/new](https://github.com/new) and create a repository (e.g., `fillary`).
2. In your terminal / command prompt, run:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/fillary.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Cloud Build Runs Automatically (~2 Minutes)
1. Go to your repository on GitHub.
2. Click on the **Actions** tab at the top.
3. You will see **Build Android App Bundle (.aab)** running.
4. Wait approximately 2 minutes for the green checkmark (✅).

### Step 3: Download & Install on Your Phone
1. Click on the completed workflow run.
2. Scroll down to the **Artifacts** section at the bottom:
   - **`Fillary-Installable-APK`**: Contains `app-debug.apk` — download this file to install directly onto your Android phone or tablet!
   - **`Fillary-Release-AAB`**: Contains `app-release.aab` — this is for uploading to the Google Play Console store.
3. Transfer `app-debug.apk` to your phone (via WhatsApp, Google Drive, Telegram, or direct download in Chrome on your phone).
4. Tap the file on your phone and tap **Install**!

---

## 💻 Alternative: One-Click Local Build
If you install [Android Studio](https://developer.android.com/studio) on your PC:
1. Double-click `build-apk.bat` in the project root, or
2. Run `npx cap open android` and click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
