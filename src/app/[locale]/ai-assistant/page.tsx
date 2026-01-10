"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AIAssistantPage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI warehouse assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantResponses: { [key: string]: string } = {
        zone: "Zone A currently contains 342 items across 8 categories. The main categories are electronics, tools, and office supplies.",
        scan: "I can help you with scanning items. We have 143 items scanned today with 94% efficiency rate.",
        warehouse:
          "The warehouse is operating at full capacity with 8 active zones. All systems are running smoothly.",
        default:
          "I'm here to help with warehouse management questions. Ask me about zones, scans, items, or warehouse status.",
      };

      const response =
        assistantResponses[
          input.toLowerCase().includes("zone")
            ? "zone"
            : input.toLowerCase().includes("scan")
              ? "scan"
              : input.toLowerCase().includes("warehouse")
                ? "warehouse"
                : "default"
        ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 500);
  };

  const menuItems = [
    { icon: "📊", label: "Dashboard", href: "/dashboard" },
    { icon: "📷", label: "Scanner", href: "/scanner" },
    { icon: "🏢", label: "Warehouse", href: "/warehouse" },
    { icon: "💬", label: "AI Assistant", href: "/ai-assistant" },
    { icon: "👤", label: "Profile", href: "/profile" },
  ];

  return (
    <div className="flex min-h-screen bg-[#1a1d2e]">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-white p-6">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFC107]">
            <svg
              className="h-7 w-7 text-black"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <span className="font-semibold text-black">AI Warehouse</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname?.includes(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#FFF9E6] text-black"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col bg-white p-8">
        {/* Header */}
        <div className="mb-6 border-b pb-6">
          <h1 className="text-3xl font-bold text-black">AI Assistant</h1>
          <p className="text-gray-600">Ask me anything about the warehouse</p>
        </div>

        {/* Chat Container */}
        <div className="mb-6 flex-1 space-y-4 overflow-y-auto pr-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FFC107]">
                  <svg
                    className="h-6 w-6 text-black"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </div>
              )}

              <div
                className={`max-w-xs rounded-lg px-4 py-3 lg:max-w-md ${
                  message.role === "user"
                    ? "rounded-br-none bg-[#FFC107] text-black"
                    : "rounded-bl-none bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {mounted && (
                  <span
                    className={`mt-1 block text-xs ${
                      message.role === "user"
                        ? "text-black/60"
                        : "text-gray-600"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>

              {message.role === "user" && (
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-300">
                  <svg
                    className="h-6 w-6 text-gray-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FFC107]">
                <svg
                  className="h-6 w-6 animate-spin text-black"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex items-center gap-2 rounded-lg rounded-bl-none bg-gray-100 px-4 py-3">
                <span className="text-sm text-gray-600">Typing</span>
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                  <span className="animation-delay-100 h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                  <span className="animation-delay-200 h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-[#FFC107] px-6 py-3 font-medium text-black transition hover:bg-[#FFB300] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Send
          </button>
        </form>
      </main>
    </div>
  );
};

export default AIAssistantPage;
