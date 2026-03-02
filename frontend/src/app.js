/**
 * SmartMoney AI – frontend JavaScript
 * Calls the FastAPI backend proxied via Azure Static Web App API proxy.
 */

const API_BASE = "/api";

// ── Chat ──────────────────────────────────────────────────────────────────────
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

/** In-memory conversation history (sent to the backend on each request). */
const history = [
  {
    role: "system",
    content:
      "You are SmartMoney AI, a helpful financial assistant. " +
      "Provide concise, practical advice on budgeting, saving, and investing. " +
      "Always remind users that you are not a licensed financial advisor.",
  },
];

function appendMessage(role, content) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = content;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  history.push({ role: "user", content: text });
  chatInput.value = "";
  sendBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, max_tokens: 512, temperature: 0.7 }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || "Unknown error");
    }

    const data = await res.json();
    const reply = data.message.content;
    history.push({ role: "assistant", content: reply });
    appendMessage("assistant", reply);
  } catch (err) {
    appendMessage("system", `Error: ${err.message}`);
  } finally {
    sendBtn.disabled = false;
    chatInput.focus();
  }
});

// ── File Upload ───────────────────────────────────────────────────────────────
const uploadForm = document.getElementById("upload-form");
const fileInput = document.getElementById("file-input");
const fileNameDisplay = document.getElementById("file-name-display");
const uploadBtn = document.getElementById("upload-btn");
const uploadResult = document.getElementById("upload-result");

fileInput.addEventListener("change", () => {
  fileNameDisplay.textContent = fileInput.files[0]?.name || "Choose a file…";
  uploadResult.hidden = true;
});

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) return;

  uploadBtn.disabled = true;
  uploadResult.hidden = true;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/storage/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || "Upload failed");
    }

    const data = await res.json();
    uploadResult.className = "upload-result success";
    uploadResult.textContent = `✔ Uploaded "${data.file_name}" (${(data.size / 1024).toFixed(1)} KB)`;
    uploadResult.hidden = false;
    fileInput.value = "";
    fileNameDisplay.textContent = "Choose a file…";
  } catch (err) {
    uploadResult.className = "upload-result error";
    uploadResult.textContent = `✖ ${err.message}`;
    uploadResult.hidden = false;
  } finally {
    uploadBtn.disabled = false;
  }
});
