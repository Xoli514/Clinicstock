const users = [
  { username: "nurse1", password: "nurse123", role: "Nurse" },
  { username: "doctor1", password: "doc123", role: "Doctor" },
  { username: "admin", password: "admin123", role: "Admin" }
];

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const uname = document.getElementById('username').value.trim();
  const pword = document.getElementById('password').value.trim();
  const errorMsg = document.getElementById('login-error');

  const user = users.find(u => u.username === uname && u.password === pword);
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = "index.html";
  } else {
    errorMsg.textContent = "Invalid username or password.";
  }
});