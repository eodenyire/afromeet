import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isOwn: boolean;
}

export function useMeetingChat(meetingId: string, userName: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const userNameRef = useRef(userName);
  userNameRef.current = userName;

  useEffect(() => {
    if (!meetingId) return;

    const channel = supabase.channel(`chat:${meetingId}`, {
      config: { broadcast: { self: false, ack: false } },
    });
    channelRef.current = channel;

    channel.on("broadcast", { event: "chat" }, ({ payload }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: payload.id as string,
          sender: payload.sender as string,
          text: payload.text as string,
          time: payload.time as string,
          isOwn: false,
        },
      ]);
    });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [meetingId]);

  const sendMessage = useCallback((text: string) => {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: userNameRef.current,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
    };
    setMessages((prev) => [...prev, msg]);
    channelRef.current?.send({
      type: "broadcast",
      event: "chat",
      payload: { id: msg.id, sender: msg.sender, text: msg.text, time: msg.time },
    });
  }, []);

  return { messages, sendMessage };
}
