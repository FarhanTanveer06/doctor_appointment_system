const { auth } = require('../middleware/auth');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_BASE_URL = process.env.OPENAI_API_BASE_URL || 'https://openrouter.ai/api/v1';

const buildMessages = (message) => [
  {
    role: 'system',
    content: 'You are a helpful patient assistant for a doctor appointment system. Answer clearly and politely. If the user asks for health advice, provide general wellness guidance. If they describe symptoms, suggest the most appropriate doctor specialty. If they ask about booking appointments, explain how to book using the appointment system. Keep responses concise, empathetic, and realistic.'
  },
  {
    role: 'user',
    content: message,
  },
];

const getOpenAIResponse = async (message) => {
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }

  const response = await fetch(`${OPENAI_API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b:free',
      messages: buildMessages(message),
      reasoning: { enabled: true },
      temperature: 0.7,
      max_tokens: 400,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('OpenRouter API error:', response.status, result);
    throw new Error(`OpenRouter error ${response.status}: ${JSON.stringify(result)}`);
  }

  const assistantMessage = result?.choices?.[0]?.message?.content;
  if (!assistantMessage) {
    console.error('OpenRouter response:', result);
    throw new Error('OpenRouter returned an invalid assistant response');
  }

  return assistantMessage.trim();
};

// Simple fallback response when OpenAI key is unavailable or request fails.
const getFallbackResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  // Check for booking appointment
  if (lowerMessage.includes('book') && (lowerMessage.includes('appointment') || lowerMessage.includes('schedule'))) {
    return {
      type: 'booking_help',
      response: 'I can help you book an appointment. To book an appointment, please visit the appointments section in your dashboard. You can select a doctor, choose a date and time, and confirm your booking. If you need help finding a doctor, tell me your symptoms and I can suggest a specialty.'
    };
  }

  const symptomKeywords = ['symptom', 'pain', 'fever', 'cough', 'headache', 'nausea', 'dizziness', 'fatigue', 'rash', 'sore throat', 'chest pain', 'stomach ache', 'back pain', 'joint pain', 'shortness of breath', 'vomiting', 'diarrhea'];
  const hasSymptom = symptomKeywords.some(keyword => lowerMessage.includes(keyword));

  if (hasSymptom || lowerMessage.includes('sick') || lowerMessage.includes('ill') || lowerMessage.includes('not feeling well')) {
    let specialty = 'General Physician';
    let advice = 'Please consult a doctor for proper diagnosis.';

    if (lowerMessage.includes('heart') || lowerMessage.includes('chest pain') || lowerMessage.includes('palpitations')) {
      specialty = 'Cardiologist';
      advice = 'Chest pain can be serious. Seek immediate medical attention if severe.';
    } else if (lowerMessage.includes('skin') || lowerMessage.includes('rash') || lowerMessage.includes('itching')) {
      specialty = 'Dermatologist';
    } else if (lowerMessage.includes('eye') || lowerMessage.includes('vision') || lowerMessage.includes('blurry')) {
      specialty = 'Ophthalmologist';
    } else if (lowerMessage.includes('tooth') || lowerMessage.includes('dental') || lowerMessage.includes('mouth pain')) {
      specialty = 'Dentist';
    } else if (lowerMessage.includes('mental') || lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('depression')) {
      specialty = 'Psychiatrist';
      advice = 'Mental health is important. Don\'t hesitate to seek professional help.';
    } else if (lowerMessage.includes('pregnant') || lowerMessage.includes('pregnancy') || lowerMessage.includes('gynec')) {
      specialty = 'Gynecologist';
    } else if (lowerMessage.includes('child') || lowerMessage.includes('pediatric') || lowerMessage.includes('baby')) {
      specialty = 'Pediatrician';
    } else if (lowerMessage.includes('bone') || lowerMessage.includes('fracture') || lowerMessage.includes('joint')) {
      specialty = 'Orthopedic Surgeon';
    } else if (lowerMessage.includes('ear') || lowerMessage.includes('hearing') || lowerMessage.includes('nose') || lowerMessage.includes('throat')) {
      specialty = 'ENT Specialist';
    }

    return {
      type: 'doctor_suggestion',
      response: `Based on your symptoms, I recommend consulting a ${specialty}. ${advice} You can book an appointment through our system.`
    };
  }

  if (lowerMessage.includes('health') || lowerMessage.includes('diet') || lowerMessage.includes('exercise') || lowerMessage.includes('wellness') || lowerMessage.includes('healthy')) {
    let response = 'For general health advice: ';

    if (lowerMessage.includes('diet')) {
      response += 'Eat a balanced diet with plenty of fruits, vegetables, whole grains, and lean proteins. Stay hydrated and limit processed foods.';
    } else if (lowerMessage.includes('exercise')) {
      response += 'Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity each week, plus strength training twice a week.';
    } else if (lowerMessage.includes('sleep')) {
      response += 'Most adults need 7-9 hours of quality sleep per night. Maintain a consistent sleep schedule and create a relaxing bedtime routine.';
    } else {
      response += 'Maintain a balanced diet, exercise regularly (at least 150 minutes of moderate activity per week), stay hydrated, get adequate sleep (7-9 hours), and schedule regular check-ups with your doctor.';
    }

    response += ' If you have specific health concerns, please consult a healthcare professional.';

    return {
      type: 'health_advice',
      response: response
    };
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return {
      type: 'greeting',
      response: 'Hello! I\'m your Patient Assistant. I can help you with basic health queries, suggest doctor types based on symptoms, and assist with booking appointments. How can I help you today?'
    };
  }

  return {
    type: 'general',
    response: 'I\'m here to help with health queries, doctor recommendations based on symptoms, and booking appointments. You can ask me about general health advice, describe your symptoms for doctor suggestions, or ask about booking appointments. How can I assist you?'
  };
};

const assistant = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let aiText;
    let responseType = 'openai_assistant';

    try {
      aiText = await getOpenAIResponse(message);
    } catch (openAiError) {
      console.warn('OpenAI request failed, falling back to keyword logic:', openAiError.message);
      const fallback = getFallbackResponse(message);
      aiText = fallback.response;
      responseType = fallback.type;
    }

    res.json({
      success: true,
      response: aiText,
      type: responseType,
    });
  } catch (error) {
    console.error('AI Assistant Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { assistant };