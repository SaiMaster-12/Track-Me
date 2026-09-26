package com.example.trackme;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

public class SignupActivity extends AppCompatActivity {

    private EditText etName, etEmail, etPhone, etPassword, etConfirmPassword;
    private Button btnSignup;
    private TextView tvLogin;

    private FirebaseAuth mAuth;
    private DatabaseReference usersReference;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_signup);

        // Initialize Firebase Authentication
        mAuth = FirebaseAuth.getInstance();

        // Initialize Firebase Realtime Database
        usersReference = FirebaseDatabase.getInstance()
                .getReference("users");

        // Connect XML views
        etName = findViewById(R.id.etName);
        etEmail = findViewById(R.id.etEmail);
        etPhone = findViewById(R.id.etPhone);
        etPassword = findViewById(R.id.etPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);

        btnSignup = findViewById(R.id.btnSignup);
        tvLogin = findViewById(R.id.tvLogin);

        // Signup button
        btnSignup.setOnClickListener(v -> registerUser());

        // Login link
        tvLogin.setOnClickListener(v -> {
            Intent intent = new Intent(SignupActivity.this, LoginActivity.class);
            startActivity(intent);
            finish();
        });
    }

    private void registerUser() {

        String name = etName.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String phone = etPhone.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String confirmPassword = etConfirmPassword.getText().toString().trim();

        // Check empty fields
        if (TextUtils.isEmpty(name)) {
            etName.setError("Enter your name");
            etName.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(email)) {
            etEmail.setError("Enter your email");
            etEmail.requestFocus();
            return;
        }

        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            etEmail.setError("Enter a valid email");
            etEmail.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(phone)) {
            etPhone.setError("Enter your phone number");
            etPhone.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(password)) {
            etPassword.setError("Enter a password");
            etPassword.requestFocus();
            return;
        }

        if (password.length() < 6) {
            etPassword.setError("Password must contain at least 6 characters");
            etPassword.requestFocus();
            return;
        }

        if (!password.equals(confirmPassword)) {
            etConfirmPassword.setError("Passwords do not match");
            etConfirmPassword.requestFocus();
            return;
        }

        // Disable button while Firebase processes the request
        btnSignup.setEnabled(false);

        // Create Firebase Authentication account
        mAuth.createUserWithEmailAndPassword(email, password)
                .addOnCompleteListener(this, task -> {

                    if (task.isSuccessful()) {

                        FirebaseUser firebaseUser = mAuth.getCurrentUser();

                        if (firebaseUser != null) {

                            String userId = firebaseUser.getUid();

                            User user = new User(
                                    name,
                                    email,
                                    phone
                            );

                            usersReference.child(userId)
                                    .setValue(user)
                                    .addOnCompleteListener(databaseTask -> {

                                        btnSignup.setEnabled(true);

                                        if (databaseTask.isSuccessful()) {

                                            Toast.makeText(
                                                    SignupActivity.this,
                                                    "Account created successfully!",
                                                    Toast.LENGTH_SHORT
                                            ).show();

                                            Intent intent = new Intent(
                                                    SignupActivity.this,
                                                    LoginActivity.class
                                            );

                                            startActivity(intent);
                                            finish();

                                        } else {

                                            Toast.makeText(
                                                    SignupActivity.this,
                                                    "Account created, but profile could not be saved.",
                                                    Toast.LENGTH_LONG
                                            ).show();
                                        }
                                    });
                        }

                    } else {

                        btnSignup.setEnabled(true);

                        String errorMessage = task.getException() != null
                                ? task.getException().getMessage()
                                : "Registration failed";

                        Toast.makeText(
                                SignupActivity.this,
                                errorMessage,
                                Toast.LENGTH_LONG
                        ).show();
                    }
                });
    }
}