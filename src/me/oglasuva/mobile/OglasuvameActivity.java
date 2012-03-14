package me.oglasuva.mobile;


import android.os.Bundle;

import org.apache.cordova.*;

public class OglasuvameActivity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
    }
}