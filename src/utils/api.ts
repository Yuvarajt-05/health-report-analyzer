
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


export const generateSessionId = () => {
  let sessionId = localStorage.getItem("healthSessionId");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem("healthSessionId", sessionId);
  }
  return sessionId;
};


async function postJson(path: string, body: any) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}


export async function getJson(path: string) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getOrCreateChatSession(sessionId: string) {
  return await postJson("/api/chat_sessions", { session_id: sessionId });
}

// Save a chat message to backend (user or bot)
export async function saveChatMessage(payload: {
  chat_session_id: number;
  session_id: string;
  message?: string;
  response?: string;
  message_type?: string;
}) {
  return await postJson("/api/chat_messages", payload);
}

// Fetch chat history
export async function fetchMessagesForSession(sessionId: string) {
  return await getJson(
    `/api/chat_sessions/${encodeURIComponent(sessionId)}/messages`
  );
}

// ----------------------------
//   MEDICAL REPORT ANALYZER
// ----------------------------

// Save medical report upload + results
export async function saveMedicalReport(payload: {
  session_id: string;
  file_name: string;
  file_type: string;
  extracted_data: any;
  analysis_results: any;
}) {
  return await postJson("/api/medical_reports", payload);
}
