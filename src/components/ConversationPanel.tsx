import Tips from './Tips';
import TippyButton from './base/TippyButton';
import { Element } from 'react-scroll';
import React, { useState } from 'react';
import { marked } from '../helpers/markdown';
import { Chat } from '../db/chat';
import { useTranslation } from 'react-i18next';
import { useSessionStore } from '../store/module';
import {IconCheck, IconCopy, IconTrash, IconVolume} from "@tabler/icons-react";

interface ConversationPanelProps {
  conversations: Chat[];
  deleteContent: (index: any) => void;
  copyContentToClipboard: (content: string) => void;
  generateSpeech: (content: string) => void;
}

function ConversationPanel({
  conversations,
  deleteContent,
  copyContentToClipboard,
  generateSpeech,
}: ConversationPanelProps) {
  const { i18n } = useTranslation();
  const [isHidden, setIsHidden] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleMouseUp = () => {
    setIsHidden(window.getSelection()?.toString().length !== 0);
  };
  const handleMouseDown = () => {
    setIsHidden(true);
  };

  const { currentSessionId } = useSessionStore();

  function handleDeleteClick(id: number | undefined) {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);

      setTimeout(() => {
        // Automatically reset isConfirmingDelete state after 10 seconds
        setIsConfirmingDelete(false);
      }, 6000);
    } else {
      deleteContent(id);
      setIsConfirmingDelete(false);
    }
  };

  function ChatIcon({ role }: { role: 'user' | 'assistant' | 'system' }) {
    if (role === 'user') {
      return (
        <div className="flex-shrink-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-8 w-8 rounded-full" />
      );
    } else {
      return (
        <div className="flex-shrink-0 bg-gradient-to-r from-amber-500 via-lime-500 to-emerald-500 h-8 w-8 rounded-full" />
      );
    }
  }

  function isConversationEmpty() {
    return (
      conversations.length === 0 ||
      conversations.filter(conversation => conversation.sessionId === currentSessionId).length === 0
    );
  }

  return (
    <Element name="messages" className="flex-grow border border-slate-300 rounded-lg p-4 mb-4">
      {isConversationEmpty() && <Tips />}
      {conversations
        .filter(conversation => conversation.sessionId === currentSessionId)
        .map((conversation, index) => (
          <div
            key={conversation.id}
            className="group relative rounded-lg hover:bg-slate-200 p-2 flex flex-row space-x-3 transition-colors duration-100"
          >
            <ChatIcon role={conversation.role} />
            <div
              className="py-1 text-gray-800 markdown-content"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
            >
              {marked(conversation.content ?? '')}
            </div>
            <div
              className={`absolute right-2 top-2 group-hover:opacity-100 opacity-0 transition-colors duration-100 flex-row space-x-0.5 ${
                isHidden ? 'hidden' : 'flex'
              }`}
            >
              <TippyButton
                onClick={() => {
                  generateSpeech(conversation.content);
                }}
                tooltip={i18n.t('common.replay') as string}
                icon={<IconVolume className="w-4 h-4 text-slate-500" />}
                style="bg-slate-100 active:bg-slate-300 rounded-sm"
              />
              <TippyButton
                onClick={() => {
                  handleDeleteClick(conversation.id);
                }}
                tooltip={isConfirmingDelete ? i18n.t('common.confirm') as string : i18n.t('common.delete') as string}
                icon={isConfirmingDelete ? <IconCheck className="w-4 h-4 text-slate-500" /> : <IconTrash className="w-4 h-4 text-slate-500" />}
                style="bg-slate-100 active:bg-slate-300 rounded-sm"
              />
              <TippyButton
                onClick={() => {
                  copyContentToClipboard(conversation.content);
                }}
                tooltip={i18n.t('common.copy') as string}
                icon={<IconCopy className="w-4 h-4 text-slate-500" />}
                style="bg-slate-100 active:bg-slate-300 rounded-sm"
              />
            </div>
          </div>
        ))}
    </Element>
  );
}

export default ConversationPanel;
