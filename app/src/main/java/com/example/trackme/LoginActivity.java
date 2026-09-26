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

public class LoginActivity extends AppCompatActivity {

    private EditText etEmail, etPassword;
    private Button btnLogin;
    private TextView tvRegister, tvForgotPassword;

    private FirebaseAuth mAuth;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_login);

        // Initialize Firebase Authentication
        mAuth = FirebaseAuth.getInstance();

        // Connect XML views
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);

        btnLogin = findViewById(R.id.btnLogin);

        tvRegister = findViewById(R.id.tvRegister);
        tvForgotPassword = findViewById(R.id.tvForgotPassword);

        // Login button
        btnLogin.setOnClickListener(v -> loginUser());

        // Register
        tvRegister.setOnClickListener(v -> {
            Intent intent = new Intent(
                    LoginActivity.this,
                    SignupActivity.class
            );

            startActivity(intent);
        });

        // Forgot password
        tvForgotPassword.setOnClickListener(v -> {
            Toast.makeText(
                    LoginActivity.this,
                    "Password reset will be added soon.",
                    Toast.LENGTH_SHORT
            ).show();
        });
    }

    private void loginUser() {

        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        // Validate email
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

        // Validate password
        if (TextUtils.isEmpty(password)) {
            etPassword.setError("Enter your password");
            etPassword.requestFocus();
            return;
        }

        // Disable button while processing
        btnLogin.setEnabled(false);

        // Firebase Login
        mAuth.signInWithEmailAndPassword(email, password)
                .addOnCompleteListener(this, task -> {

                    btnLogin.setEnabled(true);

                    if (task.isSuccessful()) {

                        Toast.makeText(
                                LoginActivity.this,
                                "Login successful!",
                                Toast.LENGTH_SHORT
                        ).show();

                        Intent intent = new Intent(
                                LoginActivity.this,
                                MainActivity.class
                        );

                        startActivity(intent);
                        finish();

                    } else {

                        String errorMessage = task.getException() != null
                                ? task.getException().getMessage()
                                : "Login failed";

                        Toast.makeText(
                                LoginActivity.this,
                                errorMessage,
                                Toast.LENGTH_LONG
                        ).show();
                    }
                });
    }
}