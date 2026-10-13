'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChatMessage, UserProfile, WorkoutPlan, WorkoutSession } from '@/lib/types';
import { generateUniqueId, getCurrentTimestamp } from '@/lib/idHelper';
import {
  Send,
  Loader2,
  Sparkles,
  ArrowRight,
  Check,
  User,
  AlertTriangle,
  KeyRound,
  RotateCcw,
  WifiOff,
  Clock
} from 'lucide-react';

interface ChatViewProps {
  messages: ChatMessage[];
  onUpdateMessages: (messages: ChatMessage[]) => void;
  profile: UserProfile | null;
  plan: WorkoutPlan | null;
  history: WorkoutSession[];
  onApplyPlanUpdate: (updatedPlan: WorkoutPlan) => void;
  onNavigateToPlan: () => void;
  onStartOnboarding: () => void;
}

const DEFAULT_INTRO_MESSAGE: ChatMessage = {
  id: 'intro_msg',
  sender: 'assistant',
  text: "Hello, I am REP AI.\n\nI can help you build, understand, and fine-tune your workout routine. Ask me for a specific session (like a Monday chest workout), request adjustments for equipment or injuries, or ask questions about exercise execution and rest intervals.",
  timestamp: '2026-01-01T00:00:00.000Z',
};

const SUGGESTED_QUESTIONS = [
  'Give me a Monday chest workout',
  'How do I apply progressive overload to my routine?',
  'What are the optimal rest periods between sets?',
  'How should I warm up before heavy compound lifts?',
  'Can we shorten each session to 45 minutes?',
];

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onUpdateMessages,
  profile,
  plan,
  onApplyPlanUpdate,
  onNavigateToPlan,
  onStartOnboarding,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [appliedRevisionId, setAppliedRevisionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoTriggeredInitialRef = useRef<boolean>(false);

  const activeMessages = useMemo(
    () => (messages.length > 0 ? messages : [DEFAULT_INTRO_MESSAGE]),
    [messages]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, isThinking]);

  // Execute API call to POST /api/chat
  const callChatApi = useCallback(
    async (query: string, currentMessageList: ChatMessage[]) => {
      setIsThinking(true);

      try {
        // Build conversation history for context (exclude errors and limit to last 10)
        const validHistory = currentMessageList
          .filter(m => !m.isError && m.id !== 'intro_msg')
          .slice(-10)
          .map(m => ({
            sender: m.sender,
            text: m.text,
          }));

        // Avoid duplicating the user message if it was already added to history
        const lastHistoryItem = validHistory[validHistory.length - 1];
        if (lastHistoryItem && lastHistoryItem.sender === 'user' && lastHistoryItem.text === query) {
          validHistory.pop();
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: query,
            profile: profile || null,
            workoutPlan: plan || null,
            conversationHistory: validHistory,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || !data || data.error) {
          const errorText = data?.error || `Server returned error (${response.status})`;
          const errorCode = data?.code || 'SERVER_ERROR';

          const errMsg: ChatMessage = {
            id: generateUniqueId('msg_ai_err'),
            sender: 'assistant',
            text: errorText,
            timestamp: getCurrentTimestamp(),
            isError: true,
            errorCode,
          };

          onUpdateMessages([...currentMessageList, errMsg]);
          return;
        }

        const aiMsg: ChatMessage = {
          id: generateUniqueId('msg_ai'),
          sender: 'assistant',
          text: data.message || 'No response content generated.',
          timestamp: getCurrentTimestamp(),
          action: data.action,
        };

        onUpdateMessages([...currentMessageList, aiMsg]);
      } catch (err: unknown) {
        console.error('Network or fetch error:', err);
        const isNetwork = err instanceof TypeError || (err instanceof Error && err.message.includes('fetch'));

        const errMsg: ChatMessage = {
          id: generateUniqueId('msg_ai_err'),
          sender: 'assistant',
          text: isNetwork
            ? 'Network connection failed. Unable to reach the server. Please verify your connection and try again.'
            : 'An unexpected client error occurred while sending your request.',
          timestamp: getCurrentTimestamp(),
          isError: true,
          errorCode: isNetwork ? 'NETWORK_ERROR' : 'CLIENT_ERROR',
        };

        onUpdateMessages([...currentMessageList, errMsg]);
      } finally {
        setIsThinking(false);
      }
    },
    [profile, plan, onUpdateMessages]
  );

  // Check if initial message was queued by "Ask AI about this plan"
  useEffect(() => {
    if (autoTriggeredInitialRef.current) return;
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.sender === 'user' && !isThinking) {
        autoTriggeredInitialRef.current = true;
        const timer = setTimeout(() => {
          void callChatApi(lastMsg.text, messages);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, isThinking, callChatApi]);

  // Adjust textarea height dynamically
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  const handleSendMessage = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || isThinking) return;

    const userMsg: ChatMessage = {
      id: generateUniqueId('msg_user'),
      sender: 'user',
      text: trimmed,
      timestamp: getCurrentTimestamp(),
    };

    const newMessages = [...activeMessages, userMsg];
    onUpdateMessages(newMessages);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await callChatApi(trimmed, newMessages);
  };

  const handleRetryLastMessage = () => {
    // Find the last user message
    for (let i = activeMessages.length - 1; i >= 0; i--) {
      if (activeMessages[i].sender === 'user') {
        const lastUserMsg = activeMessages[i];
        // Strip trailing error messages
        const cleanMessages = activeMessages.filter(m => !m.isError);
        onUpdateMessages(cleanMessages);
        void callChatApi(lastUserMsg.text, cleanMessages);
        break;
      }
    }
  };

  const handleApplyPendingPlan = (revisedPlan: WorkoutPlan, msgId: string) => {
    onApplyPlanUpdate(revisedPlan);
    setAppliedRevisionId(msgId);
  };

  const getErrorIcon = (code?: string) => {
    switch (code) {
      case 'MISSING_API_KEY':
      case 'AUTH_ERROR':
        return <KeyRound className="h-4 w-4 text-[#C76542]" />;
      case 'RATE_LIMIT':
        return <Clock className="h-4 w-4 text-[#C76542]" />;
      case 'NETWORK_ERROR':
        return <WifiOff className="h-4 w-4 text-[#C76542]" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-[#C76542]" />;
    }
  };

  const getErrorBadgeLabel = (code?: string) => {
    switch (code) {
      case 'MISSING_API_KEY':
        return 'Configuration Required';
      case 'AUTH_ERROR':
        return 'Authentication Failed';
      case 'RATE_LIMIT':
        return 'Rate Limit Exceeded';
      case 'NETWORK_ERROR':
        return 'Network Connection Error';
      default:
        return 'AI Request Error';
    }
  };

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto flex flex-col h-[calc(100vh-3.5rem)] px-4 sm:px-6">
      {/* Simulation note header */}
      <div className="py-2 text-center border-b border-[#E8E5DF] text-[11px] text-[#77756E] flex items-center justify-center gap-1.5">
        <Sparkles className="h-3 w-3 text-[#C76542]" />
        <span>REP AI Assistant · Powered by OpenAI</span>
      </div>

      {/* Messages Column */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {activeMessages.map(msg => {
          const isUser = msg.sender === 'user';
          const isRevisionApplied = appliedRevisionId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-sm leading-relaxed ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div
                  className={`h-6 w-6 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-semibold mt-0.5 ${
                    msg.isError
                      ? 'bg-[#C76542]/10 text-[#C76542] border border-[#C76542]/30'
                      : 'bg-[#C76542] text-white'
                  }`}
                >
                  {msg.isError ? '!' : 'R'}
                </div>
              )}

              {msg.isError ? (
                /* Clear UI Error State Card */
                <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 border border-[#E8E5DF] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
                  <div className="flex items-center gap-2">
                    {getErrorIcon(msg.errorCode)}
                    <span className="text-xs font-semibold text-[#282722]">
                      {getErrorBadgeLabel(msg.errorCode)}
                    </span>
                  </div>

                  <p className="text-xs text-[#77756E] leading-relaxed">
                    {msg.text}
                  </p>

                  {msg.errorCode === 'MISSING_API_KEY' && (
                    <div className="p-2.5 rounded-lg bg-[#F8F7F4] border border-[#E8E5DF] space-y-1">
                      <span className="text-[11px] font-semibold text-[#282722] block">
                        Quick Setup:
                      </span>
                      <p className="text-[11px] text-[#77756E] leading-relaxed">
                        Add your key to <code className="bg-[#FFFFFF] px-1 py-0.5 rounded border border-[#E8E5DF] text-[#282722]">.env.local</code>:
                      </p>
                      <pre className="text-[10px] font-mono bg-[#FFFFFF] p-1.5 rounded border border-[#E8E5DF] text-[#282722] overflow-x-auto">
                        OPENAI_API_KEY=sk-...
                      </pre>
                    </div>
                  )}

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRetryLastMessage}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FFFFFF] border border-[#E8E5DF] text-[#282722] hover:bg-[#F0EEE9] transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Retry</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Message Bubble */
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 space-y-2.5 ${
                    isUser
                      ? 'bg-[#282722] text-[#FFFFFF] font-normal shadow-sm'
                      : 'bg-[#FFFFFF] border border-[#E8E5DF] text-[#282722] shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-[13px] leading-relaxed font-normal">
                    {msg.text}
                  </div>

                  {/* Interactive Action Pill if available */}
                  {msg.action && (
                    <div className="pt-2 border-t border-[#E8E5DF]/60 flex items-center gap-2">
                      {msg.action.type === 'replace_exercise' && Boolean(msg.action.payload) && (
                        <button
                          onClick={() => handleApplyPendingPlan(msg.action?.payload as WorkoutPlan, msg.id)}
                          disabled={isRevisionApplied}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isRevisionApplied
                              ? 'bg-[#F0EEE9] text-[#77756E] border border-[#E8E5DF]'
                              : 'bg-[#C76542] hover:bg-[#B55938] text-white shadow-sm'
                          }`}
                        >
                          {isRevisionApplied ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>Applied to Plan</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>{msg.action.label}</span>
                            </>
                          )}
                        </button>
                      )}

                      {msg.action.type === 'view_plan' && (
                        <button
                          onClick={onNavigateToPlan}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FFFFFF] border border-[#E8E5DF] text-[#282722] hover:bg-[#F0EEE9]"
                        >
                          <span>{msg.action.label}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {msg.action.type === 'generate_plan' && (
                        <button
                          onClick={onStartOnboarding}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#C76542] hover:bg-[#B55938] text-white shadow-sm"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>{msg.action.label}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isUser && (
                <div className="h-6 w-6 rounded bg-[#E8E5DF] text-[#282722] flex-shrink-0 flex items-center justify-center text-[10px] font-medium mt-0.5">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* AI Thinking Indicator */}
        {isThinking && (
          <div className="flex gap-3 text-sm animate-fadeIn">
            <div className="h-6 w-6 rounded bg-[#C76542] text-white flex-shrink-0 flex items-center justify-center text-[10px] font-semibold mt-0.5">
              R
            </div>
            <div className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-2xl px-4 py-3 flex items-center gap-2 text-xs text-[#77756E]">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#C76542]" />
              <span>Synthesizing response with your profile context...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts (if chat is relatively short) */}
      {activeMessages.length <= 3 && !isThinking && (
        <div className="py-2 overflow-x-auto scrollbar-none flex items-center gap-1.5">
          {SUGGESTED_QUESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(suggestion)}
              className="flex-shrink-0 px-2.5 py-1 text-[11px] rounded-full border border-[#E8E5DF] bg-[#FFFFFF] hover:bg-[#F0EEE9] text-[#77756E] hover:text-[#282722] transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Composer */}
      <div className="pb-4 pt-2">
        <div className="relative rounded-2xl border border-[#E8E5DF] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.03)] focus-within:border-[#C76542] transition-all p-2.5">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask for a workout, exercise form, rest periods, or plan adjustments..."
            rows={1}
            className="w-full resize-none bg-transparent px-2 py-1 text-sm text-[#282722] placeholder:text-[#77756E]/60 focus:outline-none max-h-44 leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2 px-1 border-t border-[#E8E5DF]/50 mt-1">
            <span className="text-[10px] text-[#77756E] hidden sm:inline">
              Press Enter to send, Shift + Enter for new line
            </span>

            <button
              type="button"
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim() || isThinking}
              className="ml-auto p-1.5 rounded-lg bg-[#C76542] hover:bg-[#B55938] disabled:bg-[#E8E5DF] disabled:text-[#77756E] text-white transition-all shadow-sm"
              aria-label="Send message"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
