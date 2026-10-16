package com.fillary.app;

import android.content.ClipData;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.util.Log;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

/**
 * Saves exported artwork to the phone's gallery (Pictures/Fillary on Android 10+)
 * and opens the Android share sheet. The WebView cannot download data: URLs or use
 * the Web Share API, so export needs this small native bridge.
 */
@CapacitorPlugin(name = "FillaryExport")
public class FillaryExportPlugin extends Plugin {

    private static final String TAG = "FillaryExport";

    @PluginMethod
    public void saveImage(PluginCall call) {
        String base64 = call.getString("base64");
        String fileName = sanitize(call.getString("fileName", "Fillary.png"));
        boolean share = Boolean.TRUE.equals(call.getBoolean("share", true));

        if (base64 == null || base64.isEmpty()) {
            call.reject("No image data");
            return;
        }

        byte[] bytes;
        try {
            bytes = Base64.decode(base64, Base64.DEFAULT);
        } catch (IllegalArgumentException e) {
            call.reject("Invalid image data", e);
            return;
        }

        boolean saved = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            saved = saveToGallery(bytes, fileName);
        }

        boolean shareOpened = false;
        if (share || !saved) {
            shareOpened = openShareSheet(bytes, fileName);
        }

        if (!saved && !shareOpened) {
            call.reject("Could not save or share the image");
            return;
        }

        JSObject ret = new JSObject();
        ret.put("savedToGallery", saved);
        ret.put("shareOpened", shareOpened);
        call.resolve(ret);
    }

    private boolean saveToGallery(byte[] bytes, String fileName) {
        ContentResolver resolver = getContext().getContentResolver();
        Uri uri = null;
        try {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Images.Media.DISPLAY_NAME, fileName);
            values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
            values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/Fillary");
            values.put(MediaStore.Images.Media.IS_PENDING, 1);

            uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
            if (uri == null) return false;

            try (OutputStream out = resolver.openOutputStream(uri)) {
                if (out == null) throw new IllegalStateException("No output stream");
                out.write(bytes);
            }

            values.clear();
            values.put(MediaStore.Images.Media.IS_PENDING, 0);
            resolver.update(uri, values, null, null);
            return true;
        } catch (Exception e) {
            Log.w(TAG, "Saving to gallery failed", e);
            if (uri != null) {
                try { resolver.delete(uri, null, null); } catch (Exception ignored) { }
            }
            return false;
        }
    }

    private boolean openShareSheet(byte[] bytes, String fileName) {
        try {
            File dir = new File(getContext().getCacheDir(), "exports");
            if (!dir.exists() && !dir.mkdirs()) return false;

            // Keep the cache small: remove earlier exports
            File[] old = dir.listFiles();
            if (old != null) {
                for (File f : old) {
                    //noinspection ResultOfMethodCallIgnored
                    f.delete();
                }
            }

            File file = new File(dir, fileName);
            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(bytes);
            }

            Uri shareUri = FileProvider.getUriForFile(
                getContext(),
                getContext().getPackageName() + ".fileprovider",
                file
            );

            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("image/png");
            send.putExtra(Intent.EXTRA_STREAM, shareUri);
            send.setClipData(ClipData.newRawUri("", shareUri));
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            Intent chooser = Intent.createChooser(send, "Share artwork");
            chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(chooser);
            return true;
        } catch (Exception e) {
            Log.w(TAG, "Opening share sheet failed", e);
            return false;
        }
    }

    private static String sanitize(String name) {
        String clean = name == null ? "" : name.replaceAll("[^A-Za-z0-9._-]", "_");
        if (clean.isEmpty()) clean = "Fillary.png";
        if (!clean.toLowerCase().endsWith(".png")) clean = clean + ".png";
        return clean;
    }
}
