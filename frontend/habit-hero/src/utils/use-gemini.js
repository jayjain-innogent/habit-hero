import axios from "axios";

export async function generateReportApi({ activityData }) {
  console.log(activityData, "test");
  
  const prompt = `Based on the following activity data from the last 7 days, provide a summary of what the user has accomplished, how it's beneficial for them, and suggestions for improvement:

${JSON.stringify(activityData, null, 2)}

Please provide:
1. A summary of achievements
2. Benefits of these activities  
3. Suggestions for improvement

Keep the response concise and motivational.`;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          key: ''
        }
      }
    );
    
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    throw error;
  }
}
