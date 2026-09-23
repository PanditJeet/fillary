# Fillary — Complete Google Play Store Publishing Guide

This guide walks you through every step to package, sign, and upload **Fillary** to the **Google Play Store**.

---

## 1. Prerequisites

1. **Google Play Console Account:**
   - Go to [play.google.com/console](https://play.google.com/console)
   - Sign in with your Google account.
   - Pay the one-time \$25 registration fee and complete identity verification.

2. **Source Code Status:**
   - The native Android project is already fully generated in `C:\Fillary\android\` via Capacitor.
   - Google AdMob configuration is pre-wired in `android/app/src/main/AndroidManifest.xml`.
   - The GitHub Actions build workflow is ready in `.github/workflows/build-android.yml`.

---

## 2. Generating the Android App Bundle (`.aab`)

You have two easy methods to generate the `.aab` file:

### Method A: Free Automatic Cloud Build (Recommended — No Android Studio Needed)
1. Push your repository to **GitHub** (public or private).
2. Go to the **Actions** tab on your GitHub repository.
3. The workflow **"Build Android App Bundle (.aab)"** will run automatically.
4. When finished, download the **Fillary-Release-AAB** artifact directly from GitHub!

### Method B: Using Android Studio on your PC
1. Download and install [Android Studio](https://developer.android.com/studio).
2. In your terminal, run:
   ```bash
   npx cap open android
   ```
3. In Android Studio, click **Build > Generate Signed Bundle / APK**.
4. Select **Android App Bundle (.aab)** and click **Next**.
5. Click **Create new...** to create a keystore file (e.g. `fillary-release.jks`):
   - Choose a password and store it safely.
   - Set Key alias: `fillary`
   - Fill in your Name / Organization.
6. Select **Release** build type and click **Create**.
7. Your signed `.aab` file will be generated in:
   `android/app/build/outputs/bundle/release/app-release.aab`

---

## 3. Store Listing Graphics Checklist

Before uploading, prepare these graphic assets:

| Asset | Specifications | Description |
| :--- | :--- | :--- |
| **App Icon** | 512 × 512 px (PNG, 32-bit with alpha, max 1MB) | High-resolution Fillary logo |
| **Feature Graphic** | 1024 × 500 px (JPEG or 24-bit PNG, max 1MB) | Banner showcasing relaxing coloring artwork |
| **Phone Screenshots** | At least 2 screenshots (16:9 or 9:16 aspect ratio, min 1080px) | Screenshots of the Home screen and Coloring Studio |
| **Tablet Screenshots** | (Optional but recommended) 7" & 10" tablet screenshots | Shows that Fillary looks great on tablets |

---

## 4. Google Play Console Step-by-Step Setup

1. **Create App:**
   - In Google Play Console, click **Create app**.
   - App name: `Fillary: Relaxation Coloring`
   - Default language: English
   - App or Game: **App**
   - Free or Paid: **Free**
   - Accept Declarations and click **Create app**.

2. **Complete the "Set up your app" Dashboard:**
   - **Privacy Policy:** Add a URL to your privacy policy (can be a simple page on GitHub Pages, Notion, or a free privacy policy generator).
   - **App access:** Select *"All functionality is available without special access"*.
   - **Ads:** Select *"Yes, my app contains ads"* (since we integrated Google AdMob).
   - **Content rating:** Fill out the short questionnaire (e.g., Casual/Art). Because Fillary has cute animals and peaceful cartoons, it will receive an **Everyone (3+)** rating.
   - **Target audience:** Ages 13+ (or Everyone).
   - **News apps / COVID / Financial:** Select "No".
   - **Data safety:** Fill out the brief declaration (AdMob collects anonymous diagnostic/device IDs for ads).

3. **Store Listing:**
   - **Short description (80 chars):**
     *Mindful digital coloring. Ultra-minimalist relaxation with hand-drawn art.*
   - **Full description:**
     *Fillary is an ultra-minimalist digital coloring sanctuary designed for mindfulness, calm, and pure relaxation. Enjoy 24 hand-curated canvases including cute animal companions, human cartoon adventures, and mystical creatures. Features high-precision zero-bleed flood fill, 6 curated color palettes, infinite undo/redo, and high-resolution exports.*
   - Upload your **App Icon (512x512)**, **Feature Graphic (1024x500)**, and **Screenshots**.

4. **Upload the Bundle & Release:**
   - Go to **Production** (or **Closed Testing**).
   - Click **Create new release**.
   - Upload the `.aab` file generated in Step 2.
   - Enter Release name: `1.0.0 (First Release)`
   - Click **Next > Save > Review release > Start rollout to Production**.

---

## 5. Review & Approval
Google will review your application (typically takes 24 to 72 hours). Once approved, **Fillary** will be live worldwide on the Google Play Store!
