/* eslint-disable prettier/prettier */
/* eslint-disable comma-dangle */
/* eslint-disable prettier/prettier */
import { apiKey } from '../constants';
import axios from 'axios';

const client = axios.create({
    headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
    }
});

const chatgptUrl = 'https://api.openai.com/v1/chat/completions';

export const apiCall = async (prompt, messages) => {
    try {
        const res = await client.post(chatgptUrl, {
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content:` Does this message pertain to anything related to healthcare, medicine, drugs, or similar topics? ${prompt}. Simply answer with a yes or no.`
            }]
        });

        let isHealthRelated = res.data?.choices[0]?.message?.content;
        isHealthRelated = isHealthRelated.trim().toLowerCase();

        if (isHealthRelated.includes('yes')) {
            const relatedWords = ['tablet', 'pill', 'infection', 'disease', 'pain', 'ache'];
            const lowerPrompt = prompt.toLowerCase();

            let category = '';

            if (relatedWords.some(word => lowerPrompt.includes(word))) {
                if (lowerPrompt.includes('tablet') || lowerPrompt.includes('pill')) {
                    category = 'tablet';
                } else if (lowerPrompt.includes('infection') || lowerPrompt.includes('disease')) {
                    category = 'disease';
                } else if (lowerPrompt.includes('pain') || lowerPrompt.includes('ache')) {
                    category = 'pain';
                }
            } else {
                category = 'general';
            }

            const response = await getChatResponseForCategory(category, prompt, messages);
            return response;
        } else {
            console.log('Non health-related content');
            return { success: false, msg: 'There is no data for the question you have asked.' };
        }

    } catch (err) {
        console.log('error: ', err);
        return { success: false, msg: err.message };
    }
};

const getChatResponseForCategory = async (category, prompt, messages) => {
    try {
        let responsePrompt = '';

        const relatedWords = ['tablet', 'pill', 'infection', 'disease', 'pain', 'ache'];
        const lowerPrompt = prompt.toLowerCase();

        let determinedCategory = '';

        if (relatedWords.some(word => lowerPrompt.includes(word))) {
            if (lowerPrompt.includes('tablet') || lowerPrompt.includes('pill')) {
                determinedCategory = 'tablet';
            } else if (lowerPrompt.includes('infection') || lowerPrompt.includes('disease')) {
                determinedCategory = 'disease';
            } else if (lowerPrompt.includes('pain') || lowerPrompt.includes('ache')) {
                determinedCategory = 'pain';
            }
        } else {
            determinedCategory = 'general';
        }

        switch (determinedCategory) {
            case 'tablet':
                responsePrompt = 'How to use tablet? Side effects of the tablet and prevention from side effects.';
                break;
            case 'disease':
                responsePrompt = 'Related tablets to use for the disease.';
                break;
            case 'pain':
                responsePrompt = 'What are the tablets to use for pain?';
                break;
            case 'general':
                responsePrompt = 'Precautions to be taken for a general problem.';
                break;
            default:
                responsePrompt = 'Could not understand the specific category.';
        }

        const messageToApiCall = [
            ...messages,
            { role: 'user', content: prompt }, // User's original query
            { role: 'user', content: responsePrompt } // Response prompt based on category
        ];

        const res = await chatgptApiCall(responsePrompt, messageToApiCall);
        return res;

    } catch (err) {
        console.log('error: ', err);
        return { success: false, msg: err.message };
    }
};

const chatgptApiCall = async (prompt, messages) => {
    try {
        const res = await client.post(chatgptUrl, {
            model: 'gpt-3.5-turbo',
            messages: messages.concat([{ role: 'user', content: prompt }]),
            temperature: 0.7,
        });

        const answer = res.data?.choices[0]?.message?.content;
        messages.push({ role: 'assistant', content: answer.trim() });

        return { success: true, data: messages };

    } catch (err) {
        console.log('error: ', err);
        return { success: false, msg: err.message };
    }
};

