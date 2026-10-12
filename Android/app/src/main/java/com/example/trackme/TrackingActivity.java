package com.example.trackme;

import android.os.Bundle;
import android.util.Log;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import android.animation.ValueAnimator;
import android.view.animation.LinearInterpolator;

public class TrackingActivity extends AppCompatActivity
        implements OnMapReadyCallback {

    private TextView tvTrackingId;
    private TextView tvStatus;
    private TextView tvRoute;
    private TextView tvDeliveryDate;
    private TextView tvLocation;

    private DatabaseReference packageReference;

    private GoogleMap googleMap;
    private Marker courierMarker;

    private double latitude = 0;
    private double longitude = 0;

    private String currentTrackingId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_tracking);

        FirebaseDatabase.getInstance()
                .getReference(".info/connected")
                .addValueEventListener(new ValueEventListener() {

                    @Override
                    public void onDataChange(DataSnapshot snapshot) {
                        Boolean connected =
                                snapshot.getValue(Boolean.class);

                        android.util.Log.d(
                                "TRACK_ME_CONNECTION",
                                "Firebase connected: " + connected
                        );
                    }

                    @Override
                    public void onCancelled(DatabaseError error) {
                        android.util.Log.e(
                                "TRACK_ME_CONNECTION",
                                "Connection check failed: "
                                        + error.getMessage()
                        );
                    }
                });

        tvTrackingId = findViewById(R.id.tvTrackingId);
        tvStatus = findViewById(R.id.tvStatus);
        tvRoute = findViewById(R.id.tvRoute);
        tvDeliveryDate = findViewById(R.id.tvDeliveryDate);
        tvLocation = findViewById(R.id.tvLocation);

        currentTrackingId =
                getIntent().getStringExtra("TRACKING_ID");

        if (currentTrackingId == null ||
                currentTrackingId.isEmpty()) {

            Toast.makeText(
                    this,
                    "Tracking ID not found",
                    Toast.LENGTH_SHORT
            ).show();

            finish();
            return;
        }

        packageReference =
                FirebaseDatabase.getInstance()
                        .getReference("packages")
                        .child(currentTrackingId);

        SupportMapFragment mapFragment =
                (SupportMapFragment)
                        getSupportFragmentManager()
                                .findFragmentById(R.id.map);

        if (mapFragment != null) {
            mapFragment.getMapAsync(this);
        }

        loadPackage();
    }

    @Override
    public void onMapReady(GoogleMap map) {

        googleMap = map;

        showCourierLocation();
    }

    private void loadPackage() {

        packageReference.addValueEventListener(
                new ValueEventListener() {

                    @Override
                    public void onDataChange(DataSnapshot snapshot) {

                        Log.d(
                                "TRACK_ME_FIREBASE",
                                "Firebase update received: "
                                        + snapshot.getValue()
                        );

                        if (!snapshot.exists()) {

                            Toast.makeText(
                                    TrackingActivity.this,
                                    "Package not found",
                                    Toast.LENGTH_LONG
                            ).show();

                            return;
                        }

                        String trackingId =
                                snapshot.child("trackingId")
                                        .getValue(String.class);

                        String status =
                                snapshot.child("status")
                                        .getValue(String.class);

                        String origin =
                                snapshot.child("origin")
                                        .getValue(String.class);

                        String destination =
                                snapshot.child("destination")
                                        .getValue(String.class);

                        String deliveryDate =
                                snapshot.child("estimatedDelivery")
                                        .getValue(String.class);

                        String lastUpdated =
                                snapshot.child("liveLocation")
                                        .child("lastUpdated")
                                        .getValue(String.class);

                        if (trackingId != null) {

                            tvTrackingId.setText(
                                    "📦 " + trackingId
                            );
                        }

                        if (status != null) {

                            tvStatus.setText(status);
                        }

                        if (origin != null &&
                                destination != null) {

                            tvRoute.setText(
                                    origin + " → " + destination
                            );
                        }

                        if (deliveryDate != null) {

                            tvDeliveryDate.setText(
                                    deliveryDate
                            );
                        }

                        if (lastUpdated != null) {

                            tvLocation.setText(
                                    "Last updated: "
                                            + lastUpdated
                            );
                        }

                        Object latitudeObject =
                                snapshot.child("liveLocation")
                                        .child("latitude")
                                        .getValue();

                        Object longitudeObject =
                                snapshot.child("liveLocation")
                                        .child("longitude")
                                        .getValue();

                        if (latitudeObject instanceof Number &&
                                longitudeObject instanceof Number) {

                            latitude =
                                    ((Number) latitudeObject)
                                            .doubleValue();

                            longitude =
                                    ((Number) longitudeObject)
                                            .doubleValue();

                            Log.d(
                                    "TRACK_ME_LOCATION",
                                    "Latitude: " + latitude +
                                            " | Longitude: " + longitude
                            );

                            showCourierLocation();

                        } else {

                            Log.d(
                                    "TRACK_ME_LOCATION",
                                    "Invalid location types: latitude="
                                            + latitudeObject
                                            + ", longitude="
                                            + longitudeObject
                            );

                            Toast.makeText(
                                    TrackingActivity.this,
                                    "Invalid location data",
                                    Toast.LENGTH_SHORT
                            ).show();
                        }
                    }

                    @Override
                    public void onCancelled(
                            DatabaseError error) {

                        Toast.makeText(
                                TrackingActivity.this,
                                "Firebase error: "
                                        + error.getMessage(),
                                Toast.LENGTH_LONG
                        ).show();
                    }
                }
        );
    }

    private void showCourierLocation() {

        if (latitude == 0 &&
                longitude == 0) {

            return;
        }

        if (googleMap == null) {

            return;
        }

        LatLng courierLocation =
                new LatLng(latitude, longitude);

        if (courierMarker == null) {

            courierMarker =
                    googleMap.addMarker(
                            new MarkerOptions()
                                    .position(courierLocation)
                                    .title("Courier Location")
                                    .snippet(currentTrackingId)
                    );

        } else {

            LatLng oldPosition = courierMarker.getPosition();

            ValueAnimator animator =
                    ValueAnimator.ofFloat(0f, 1f);

            animator.setDuration(3000);
            animator.setInterpolator(
                    new LinearInterpolator()
            );

            animator.addUpdateListener(animation -> {

                float fraction =
                        animation.getAnimatedFraction();

                double newLatitude =
                        oldPosition.latitude
                                + (courierLocation.latitude
                                - oldPosition.latitude)
                                * fraction;

                double newLongitude =
                        oldPosition.longitude
                                + (courierLocation.longitude
                                - oldPosition.longitude)
                                * fraction;

                LatLng newPosition =
                        new LatLng(
                                newLatitude,
                                newLongitude
                        );

                courierMarker.setPosition(newPosition);
            });

            animator.start();
        }

        googleMap.animateCamera(
                CameraUpdateFactory
                        .newLatLngZoom(
                                courierLocation,
                                15f
                        )
        );
    }
}