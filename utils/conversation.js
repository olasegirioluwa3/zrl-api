require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
  
const generateResponse = async ( data ) => {
  // Function to generate response using ChatGPT API
  try {
    // const response = await axios.post(
    const chatCompletion = await openai.chat.completions.create({
      messages: [
            {"role": "system", "content": "You are a helpful assistant designed to help Zion Reborn University (ZRU) students with tasks, understand if the student intent to make payment, learn about courses offered or academic programs, any other intent is generic, you can also respond in the language of the user, in this json format. example {'intent': 'payment'|'course'|'program'|'generic', 'content': Your feedback}. You are to reoly in the tone of the user, if user uses fun and sarcastic, do the same and so on"},
            {"role": "assistant", "content": "if intent is payment: ask a followup question the department and program the student is or aspiring for at Zion Reborn University then generate a tuition fee for the user."},
            {"role": "user", "content": data.input }
        ],
      model: 'gpt-3.5-turbo',
    });
    // console.log(chatCompletion.choices[0].message.content);k
    return chatCompletion.choices[0].message.content;
  } catch (error) {
    // console.error("Error generating response:", error);
    return "Sorry, I couldn't generate a response at the moment.";
  }
}

module.exports = { generateResponse };