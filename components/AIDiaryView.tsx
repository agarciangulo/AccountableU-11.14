import { GoogleGenAI, FunctionDeclaration, Type, Chat } from '@google/genai';
import React, { useState, useEffect, useRef } from 'react';
import { getActivities, upsertLog, getMockUserId } from '../services/firestoreService';
import { Activity, ChatMessage } from '../types';
import { SparklesIcon } from './icons';

const logActivityFunctionDeclaration: FunctionDeclaration = {
  name: 'logActivity',
  description: 'Logs an activity with its duration and date.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      activityName: {
        type: Type.STRING,
        description: 'The name of the activity to log. Must be one of the provided activity names.',
      },
      duration: {
        type: Type.NUMBER,
        description: 'The duration spent on the activity. The unit is assumed to be what is defined for the activity (e.g., hours).',
      },
      date: {
        type: Type.STRING,
        description: 'The date the activity was performed, in YYYY-MM-DD format.',
      },
    },
    required: ['activityName', 'duration', 'date'],
  },
};

const AIDiaryView: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const userId = getMockUserId();

  useEffect(() => {
    async function setupChat() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedActivities = await getActivities(userId);
        if (fetchedActivities.length === 0) {
            setError("You don't have any activities yet. Please add some in the 'Activities' tab before using the AI diary.");
            setIsLoading(false);
            return;
        }
        setActivities(fetchedActivities);
        const activityNames = fetchedActivities.map(a => a.name).join(', ');

        const systemInstruction = `You are an intelligent diary assistant. Your goal is to help the user log their activities.
The current date is ${new Date().toISOString().split('T')[0]}.
Here is the list of available activities the user can log time for: ${activityNames}.

When the user describes what they did, identify the activity, the duration, and the date.
- The date can be relative like 'today' or 'yesterday'.
- The duration is a number, typically in hours.
- You must match the user's description to one of the available activities.

If you have all the necessary information (activity name, duration, date), call the 'logActivity' function.
If any information is missing, ask the user a clear question to get the missing details. For example, if the duration is missing, ask 'How long did you spend on that?'.
Once an activity is logged, confirm it with the user in a friendly message.`;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
                tools: [{ functionDeclarations: [logActivityFunctionDeclaration] }],
            },
        });
        setChat(chatInstance);

        setMessages([{
            id: 'init',
            role: 'model',
            text: "Hi! Tell me what you've been working on, and I'll log it for you."
        }]);

      } catch (e) {
        console.error(e);
        setError("Couldn't initialize the AI assistant. Please check your connection and refresh.");
      } finally {
        setIsLoading(false);
      }
    }
    setupChat();
  }, [userId]);
  
  useEffect(() => {
    // Scroll to the bottom of the chat on new message
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !inputValue.trim() || !chat) return;

    setIsLoading(true);
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: inputValue,
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
        // FIX: The `sendMessage` method expects an object with a `message` property.
        let response = await chat.sendMessage({ message: userMessage.text });

        while(response.functionCalls && response.functionCalls.length > 0) {
            const fc = response.functionCalls[0];
            if (fc.name === 'logActivity') {
                const { activityName, date, duration } = fc.args as { activityName: string, date: string, duration: number };

                const activity = activities.find(a => a.name.toLowerCase() === activityName.toLowerCase());

                if (activity) {
                    await upsertLog(userId, activity.id, date, duration);
                    // Send tool response back to the model
                     // FIX: The `sendMessage` method expects an object with a `message` property.
                     response = await chat.sendMessage({ message: [
                        {
                          functionResponse: {
                            name: fc.name,
                            response: { success: true, message: `Successfully logged ${duration} ${activity.unit} for ${activity.name} on ${date}.` },
                          }
                        }
                    ]});
                } else {
                    // Activity not found, inform model
                    // FIX: The `sendMessage` method expects an object with a `message` property.
                    response = await chat.sendMessage({ message: [
                        {
                            functionResponse: {
                                name: fc.name,
                                response: { success: false, message: `Could not find an activity named '${activityName}'. Please ask the user to clarify which of the available activities they meant.` },
                            }
                        }
                    ]});
                }
            }
        }
        
        // Add the final model response to messages
        const modelResponse: ChatMessage = {
            id: `msg-${Date.now()}-model`,
            role: 'model',
            text: response.text,
        };
        setMessages(prev => [...prev, modelResponse]);

    } catch (e) {
      console.error(e);
      const errorResponse: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'model',
        text: "Sorry, I ran into an error. Please try that again.",
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    return (
        <div className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-md lg:max-w-lg px-4 py-2 rounded-2xl break-words ${isModel ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none' : 'bg-sky-600 text-white rounded-br-none'}`}>
                <p className="text-sm">{message.text}</p>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-200px)] bg-white dark:bg-gray-800/50 shadow-lg rounded-lg">
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <SparklesIcon />
            <h2 className="text-xl font-bold ml-3 text-sky-700 dark:text-sky-300">AI Diary Assistant</h2>
        </div>

        {error ? (
             <div className="flex-grow flex items-center justify-center p-4">
                <p className="text-center text-red-500">{error}</p>
            </div>
        ) : (
            <>
                <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
                     {isLoading && messages[messages.length-1]?.role === 'user' && (
                        <div className="flex justify-start">
                             <div className="max-w-md px-4 py-2 rounded-2xl bg-gray-200 dark:bg-gray-700 rounded-bl-none">
                                <div className="flex items-center space-x-2">
                                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                     )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="e.g., Yesterday I worked on BCG networking for 3 hours..."
                        className="flex-grow bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                        disabled={isLoading || !chat}
                        />
                        <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 disabled:bg-sky-400 disabled:cursor-not-allowed" disabled={isLoading || !inputValue.trim() || !chat}>
                            Send
                        </button>
                    </form>
                </div>
            </>
        )}
    </div>
  );
};

export default AIDiaryView;