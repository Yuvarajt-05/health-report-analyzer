// src/utils/chatbot.ts
import { ReportContext } from "../types/health";

export const getChatbotResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("fever")) {
    if (lowerMessage.includes("cough") || lowerMessage.includes("cold")) {
      return "It looks like you have a fever with cough or cold. Drink warm fluids, rest well, and avoid cold food. If it lasts more than 3 days or goes above 102°F, see a doctor.";
    }
    return "You seem to have a fever. Drink plenty of water, rest well, and keep checking your temperature. If it doesn’t go away, visit a doctor.";
  }

  if (lowerMessage.includes("cough")) {
    if (lowerMessage.includes("chest pain") || lowerMessage.includes("breathing")) {
      return "Cough with chest pain or trouble breathing needs quick medical care. Please see a doctor soon. Until then, rest and avoid cold drinks.";
    }
    return "You have a cough. It might be a cold or throat irritation. Drink warm water, do steam inhalation, and rest. If it lasts more than a week, see a doctor.";
  }

  if (lowerMessage.includes("headache") || lowerMessage.includes("head ache")) {
    if (lowerMessage.includes("severe") || lowerMessage.includes("intense")) {
      return "A strong headache should be checked by a doctor. Rest in a dark room, drink water, and get medical help if it continues.";
    }
    return "Headache may be due to stress or less sleep. Rest well, drink water, and avoid screens. See a doctor if it keeps coming back.";
  }

  if (
    lowerMessage.includes("stomach") ||
    lowerMessage.includes("abdomen") ||
    lowerMessage.includes("belly")
  ) {
    if (lowerMessage.includes("pain") || lowerMessage.includes("ache")) {
      return "Stomach pain can happen for many reasons. Avoid heavy or spicy food, drink water, and rest. See a doctor if it’s bad or lasts long.";
    }
  }

  if (lowerMessage.includes("nausea") || lowerMessage.includes("vomit")) {
    return "You may have nausea or vomiting. Drink water slowly, skip solid food for a bit, and rest. Go to a doctor if it doesn’t stop.";
  }

  if (lowerMessage.includes("diarrhea") || lowerMessage.includes("loose motion")) {
    return "You might have diarrhea. Drink water or ORS, eat light food like rice or banana, and rest. If it lasts over 2 days, see a doctor.";
  }

  if (lowerMessage.includes("dizzy") || lowerMessage.includes("dizziness")) {
    return "Feeling dizzy? Sit or lie down, drink water, and rest. If it doesn’t stop or happens often, see a doctor.";
  }

  if (
    lowerMessage.includes("cold") ||
    lowerMessage.includes("runny nose") ||
    lowerMessage.includes("sneez")
  ) {
    return "You seem to have a cold. Rest, drink warm fluids, and eat healthy food. It usually gets better in a week.";
  }

  if (lowerMessage.includes("sore throat") || lowerMessage.includes("throat pain")) {
    return "Your throat might be sore. Gargle with warm salt water, drink warm fluids, and rest. If it lasts more than 3 days, see a doctor.";
  }

  if (
    lowerMessage.includes("fatigue") ||
    lowerMessage.includes("tired") ||
    lowerMessage.includes("weakness")
  ) {
    return "You seem tired. Sleep 7–8 hours, eat healthy food, and drink water. If tiredness doesn’t go away, get a check-up.";
  }

  if (lowerMessage.includes("back pain") || lowerMessage.includes("backache")) {
    return "Back pain can be from sitting or lifting. Stretch gently, use a warm compress, and keep good posture. See a doctor if it’s bad or stays long.";
  }

  if (lowerMessage.includes("chest pain") || lowerMessage.includes("heart")) {
    return "Chest pain can be serious. If it’s strong or you feel short of breath, get emergency help right away.";
  }

  if (lowerMessage.includes("diabetes") || lowerMessage.includes("sugar")) {
    return "For diabetes, check sugar often, eat less sugar, exercise daily, and take your medicines. Avoid soft drinks and sweets.";
  }

  if (
    lowerMessage.includes("blood pressure") ||
    lowerMessage.includes("bp") ||
    lowerMessage.includes("hypertension")
  ) {
    return "To control BP, eat less salt, exercise, avoid stress, and don’t smoke or drink. Check BP often and follow doctor advice.";
  }

  if (
    lowerMessage.includes("anxiety") ||
    lowerMessage.includes("stress") ||
    lowerMessage.includes("worried")
  ) {
    return "Feeling stressed? Try deep breathing, talk to someone, rest well, and avoid too much caffeine. If it’s bad, see a counselor.";
  }

  if (
    lowerMessage.includes("insomnia") ||
    lowerMessage.includes("sleep") ||
    lowerMessage.includes("cant sleep")
  ) {
    return "Can’t sleep? Go to bed at the same time daily, avoid screens before bed, and keep your room calm. If it continues, see a doctor.";
  }

  if (
    lowerMessage.includes("rash") ||
    lowerMessage.includes("itching") ||
    lowerMessage.includes("skin")
  ) {
    return "You have a skin problem. Keep the area clean, avoid scratching, and use calming lotion. If it spreads or gets worse, see a doctor.";
  }

  if (
    lowerMessage.includes("hi") ||
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hey")
  ) {
    return "Hi! I’m your health assistant. Tell me what problem you have, and I’ll give simple advice. Remember, I’m not a doctor.";
  }

  if (lowerMessage.includes("thank")) {
    return "You’re welcome! Take care and stay healthy.";
  }

  return "Please tell me your symptoms clearly (like fever, cough, pain, etc.). I’ll give some general advice. For serious problems, visit a doctor.";
};

/** Returns report-based answer if user asks about report, else null */
export const getReportAnswer = (
  message: string,
  context: ReportContext | null
): string | null => {
  if (!context) return null;

  const lowerMessage = message.toLowerCase();

  const wantsReport =
    lowerMessage.includes("report") ||
    lowerMessage.includes("result") ||
    lowerMessage.includes("status") ||
    lowerMessage.includes("analysis") ||
    lowerMessage.includes("test");

  if (!wantsReport) return null;

  const { fileName, analysis } = context;
  const anyRisk = analysis.parameters.some((p) => p.status === "Risk");

  if (lowerMessage.includes("status") || lowerMessage.includes("summary")) {
    return `Your latest report (${fileName}) shows overall status: ${analysis.overallStatus}. ${
      anyRisk
        ? "Some values are in the Risk range, so you should discuss this with a doctor."
        : "All checked values appear within normal limits."
    }`;
  }

  if (lowerMessage.includes("sugar") || lowerMessage.includes("glucose")) {
    const glucose = analysis.parameters.find((p) =>
      p.name.toLowerCase().includes("glucose")
    );
    if (glucose) {
      return `Your sugar (glucose) value is ${glucose.value} ${glucose.unit} and is marked as ${glucose.status}. ${glucose.suggestion}`;
    }
  }

  if (lowerMessage.includes("bp") || lowerMessage.includes("pressure")) {
    const bp = analysis.parameters.find((p) =>
      p.name.toLowerCase().includes("blood pressure")
    );
    if (bp) {
      return `Your blood pressure is ${bp.unit} and is marked as ${bp.status}. ${bp.suggestion}`;
    }
  }

  return `Your latest report is: ${analysis.overallStatus}. For full card-wise explanation, tap "View detailed report analysis".`;
};
