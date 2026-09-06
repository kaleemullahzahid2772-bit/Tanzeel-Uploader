'use client';

import React, { useState } from 'react';
import { MarketingChatMessage } from '@/lib/types/database';
import { MessageSquare, Send, Sparkles, X, Bot, User, HelpCircle } from 'lucide-react';

interface MarketingChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MarketingChatDrawer({ isOpen, onClose }: MarketingChatDrawerProps) {
  const [messages, setMessages] = useState<MarketingChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: 'السلام علیکم! میں آپ کا AI مارکیٹنگ مینیجر ہوں۔ آپ کے حالیہ اینالیٹکس، برانڈ نالج اور پوسٹنگ کی تاریخ میرے پاس موجود ہے۔ آپ کنٹینٹ اسٹریٹجی، نئے آئیڈیاز، یا کسی بھی پلیٹ فارم کے حوالے سے رہنمائی طلب کر سکتے ہیں۔',
      createdAt: new Date().toISOString(),
      suggestedPrompts: [
        'اگلے ہفتے کے لیے 5 اہم موضوعات تجویز کریں',
        'میری پوسٹس کی اینگیجمنٹ بڑھانے کے 3 عملی طریقے کیا ہیں؟',
        'یوٹیوب ویڈیوز کو انسٹاگرام پر کیسے ری پرپز کریں؟',
        'کس دن اور وقت پر پوسٹ کرنا زیادہ مناسب ہے؟',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text || !text.trim() || loading) return;

    const userMsg: MarketingChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/marketing/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: MarketingChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.reply || 'معذرت، جواب تیار کرنے میں دشواری پیش آئی۔',
          createdAt: new Date().toISOString(),
          suggestedPrompts: data.suggestedPrompts || [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'نیٹ ورک کی خرابی کی وجہ سے AI سے رابطہ نہیں ہو سکا۔ برائے مہربانی دوبارہ کوشش کریں۔',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-charcoal-deep/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-sand-ivory dark:bg-[#0F1715] h-full shadow-2xl flex flex-col border-l border-sand-border dark:border-emerald-800/30">
        {/* Header */}
        <div className="p-5 border-b border-sand-border/80 flex items-center justify-between bg-sand-card dark:bg-[#15231F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-deep text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-deep dark:text-white">
                Ask Your Marketing Manager
              </h4>
              <p className="text-[11px] text-charcoal-muted dark:text-gray-400 font-urdu">
                ڈیٹا پر مبنی لائیو اسٹریٹجک مشاورت
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-charcoal-muted hover:text-charcoal-deep rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`p-1.5 rounded-lg shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-emerald-primary text-white'
                    : 'bg-gold-subtle text-gold-deep border border-gold-border'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed font-urdu shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-deep text-white rounded-tr-none'
                    : 'bg-sand-card dark:bg-[#15231F] text-charcoal-deep dark:text-gray-200 border border-sand-border/80 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-sand-border/50 flex flex-wrap gap-1.5">
                    {msg.suggestedPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(p)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-sand-ivory dark:bg-[#111C18] border border-gold-border/60 text-gold-deep hover:bg-gold-subtle/40 transition-colors text-left font-urdu"
                      >
                        + {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-charcoal-muted font-urdu">
              <Sparkles className="w-4 h-4 text-gold-deep animate-spin" />
              <span>مارکیٹنگ مینیجر تجزیہ کر رہا ہے...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-sand-border/80 bg-sand-card dark:bg-[#15231F]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اپنا مارکیٹنگ سوال یہاں لکھیں..."
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-sand-ivory dark:bg-[#111C18] border border-sand-border dark:border-emerald-800/40 text-charcoal-deep dark:text-white focus:outline-none focus:border-emerald-primary font-urdu"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-emerald-deep hover:bg-emerald-primary text-white transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
