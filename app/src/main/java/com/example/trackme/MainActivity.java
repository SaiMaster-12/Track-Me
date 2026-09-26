package com.example.trackme;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

public class MainActivity extends AppCompatActivity {

    private TextView tvWelcome, navHome, navProfile, navSettings;
    private EditText etTrackingId;
    private Button btnTrack;

    private FirebaseAuth mAuth;
    private DatabaseReference usersReference;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Firebase
        mAuth = FirebaseAuth.getInstance();
        usersReference = FirebaseDatabase.getInstance()
                .getReference("users");

        // XML Views
        tvWelcome = findViewById(R.id.tvWelcome);
        etTrackingId = findViewById(R.id.etTrackingId);
        btnTrack = findViewById(R.id.btnTrack);

        navHome = findViewById(R.id.navHome);
        navProfile = findViewById(R.id.navProfile);
        navSettings = findViewById(R.id.navSettings);

        // Load customer's name
        loadUserName();

        // Track button
        btnTrack.setOnClickListener(v -> {

            String trackingId =
                    etTrackingId.getText().toString().trim();

            if (trackingId.isEmpty()) {

                etTrackingId.setError("Enter Tracking ID");
                etTrackingId.requestFocus();

            } else {

                Intent intent = new Intent(
                        MainActivity.this,
                        TrackingActivity.class
                );

                intent.putExtra("TRACKING_ID", trackingId);

                startActivity(intent);

                // Firebase package search will be added next.
            }
        });

        navHome.setOnClickListener(v ->
                Toast.makeText(
                        MainActivity.this,
                        "Home",
                        Toast.LENGTH_SHORT
                ).show()
        );

        navProfile.setOnClickListener(v ->
                Toast.makeText(
                        MainActivity.this,
                        "Profile page coming next!",
                        Toast.LENGTH_SHORT
                ).show()
        );

        navSettings.setOnClickListener(v ->
                Toast.makeText(
                        MainActivity.this,
                        "Settings page coming next!",
                        Toast.LENGTH_SHORT
                ).show()
        );
    }

    private void loadUserName() {

        FirebaseUser currentUser = mAuth.getCurrentUser();

        if (currentUser == null) {
            tvWelcome.setText("Hello 👋");
            return;
        }

        String userId = currentUser.getUid();

        usersReference.child(userId)
                .child("name")
                .addListenerForSingleValueEvent(
                        new ValueEventListener() {

                            @Override
                            public void onDataChange(
                                    DataSnapshot snapshot) {

                                String name =
                                        snapshot.getValue(String.class);

                                if (name != null && !name.isEmpty()) {

                                    tvWelcome.setText(
                                            "Hello, " + name + " 👋"
                                    );

                                } else {

                                    tvWelcome.setText("Hello 👋");
                                }
                            }

                            @Override
                            public void onCancelled(
                                    DatabaseError error) {

                                tvWelcome.setText("Hello 👋");
                            }
                        });
    }
}