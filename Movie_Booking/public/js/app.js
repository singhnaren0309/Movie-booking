// Client-side Application Logic for Movie Booking

const Auth = {
    getToken() {
        return localStorage.getItem("mba_token");
    },
    getUser() {
        try {
            return JSON.parse(localStorage.getItem("mba_user"));
        } catch (e) {
            return null;
        }
    },
    setAuth(token, user) {
        localStorage.setItem("mba_token", token);
        localStorage.setItem("mba_user", JSON.stringify(user));
        this.updateNav();
    },
    logout() {
        localStorage.removeItem("mba_token");
        localStorage.removeItem("mba_user");
        showToast("Logged out successfully", "success");
        setTimeout(() => {
            window.location.href = "/";
        }, 800);
    },
    updateNav() {
        const authNav = document.getElementById("auth-nav");
        if (!authNav) return;
        const user = this.getUser();
        const token = this.getToken();

        if (token && user) {
            authNav.innerHTML = `
                <li><a href="/my-bookings">My Bookings</a></li>
                <li style="display:flex; align-items:center; gap:0.75rem;">
                    <span style="font-size:0.9rem; font-weight:600; color:#f59e0b;">Hi, ${user.name || 'User'}</span>
                    <button onclick="Auth.logout()" class="btn btn-secondary btn-sm">Logout</button>
                </li>
            `;
        } else {
            authNav.innerHTML = `
                <li><a href="/signin">Sign In</a></li>
                <li><a href="/signup" class="btn btn-primary btn-sm">Get Started</a></li>
            `;
        }
    }
};

function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

document.addEventListener("DOMContentLoaded", () => {
    Auth.updateNav();

    // Signin form handler
    const signinForm = document.getElementById("signin-form");
    if (signinForm) {
        signinForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const submitBtn = signinForm.querySelector("button[type='submit']");
            submitBtn.disabled = true;
            submitBtn.textContent = "Signing in...";

            try {
                const res = await fetch("/mba/api/v1/auth/signin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (res.ok && data.data && data.data.token) {
                    Auth.setAuth(data.data.token, {
                        name: data.data.name,
                        email: data.data.email,
                        userRole: data.data.userRole
                    });
                    showToast("Sign in successful! Redirecting...", "success");
                    const redirectUrl = new URLSearchParams(window.location.search).get("redirect") || "/";
                    setTimeout(() => window.location.href = redirectUrl, 800);
                } else {
                    showToast(data.err || data.message || "Invalid credentials", "error");
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Sign In";
                }
            } catch (err) {
                showToast("Network error, please try again", "error");
                submitBtn.disabled = false;
                submitBtn.textContent = "Sign In";
            }
        });
    }

    // Signup form handler
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const userRole = document.getElementById("userRole") ? document.getElementById("userRole").value : "CUSTOMER";
            const submitBtn = signupForm.querySelector("button[type='submit']");
            submitBtn.disabled = true;
            submitBtn.textContent = "Creating account...";

            try {
                const res = await fetch("/mba/api/v1/auth/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password, userRole })
                });
                const data = await res.json();
                if (res.status === 201) {
                    showToast("Account created successfully! Please sign in.", "success");
                    setTimeout(() => window.location.href = "/signin", 1200);
                } else {
                    showToast(data.err || data.message || "Registration failed", "error");
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Sign Up";
                }
            } catch (err) {
                showToast("Network error, please try again", "error");
                submitBtn.disabled = false;
                submitBtn.textContent = "Sign Up";
            }
        });
    }
});
