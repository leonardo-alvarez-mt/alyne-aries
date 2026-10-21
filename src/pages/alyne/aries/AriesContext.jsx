import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  ARIES_VERSION_KEY,
  INITIAL_ACCESS,
  INITIAL_AGENTS,
  INITIAL_CHATS,
  INITIAL_COMPANY_PROFILE,
  INITIAL_FRAMEWORKS,
  INITIAL_GLOSSARY,
  INITIAL_SKILLS,
  INITIAL_TEAMS,
  INITIAL_TEMPLATES,
  scriptedReply,
  titleFromPrompt,
} from './ariesData';
import { REGISTRY_AGENTS } from './agents/agentRegistryData';

const AriesContext = createContext(null);

function loadVersion() {
  try {
    const v = localStorage.getItem(ARIES_VERSION_KEY);
    if (v === 'v1' || v === 'v2') return v;
  } catch {
    /* ignore */
  }
  return 'v1';
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function assistantMessage(reply) {
  return {
    id: uid('m'),
    role: 'assistant',
    content: reply.content,
    outputId: reply.outputId || null,
    sources: reply.sources || [],
    related: reply.related || [],
    pending: true,
  };
}

export function AriesProvider({ children }) {
  const [version, setVersionState] = useState(loadVersion);
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [registryAgents, setRegistryAgents] = useState(REGISTRY_AGENTS);
  const [skills, setSkills] = useState(INITIAL_SKILLS);
  const [companyProfile, setCompanyProfile] = useState(INITIAL_COMPANY_PROFILE);
  const [frameworks, setFrameworks] = useState(INITIAL_FRAMEWORKS);
  const [glossary, setGlossary] = useState(INITIAL_GLOSSARY);
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [access, setAccess] = useState(INITIAL_ACCESS);
  const [templates] = useState(INITIAL_TEMPLATES);
  const [activeOutputId, setActiveOutputId] = useState(null);
  const [outputsOpen, setOutputsOpen] = useState(false);

  const setVersion = useCallback((next) => {
    setVersionState(next);
    try {
      localStorage.setItem(ARIES_VERSION_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const getChat = useCallback((id) => chats.find((c) => c.id === id), [chats]);

  const createChat = useCallback((prompt, skillId) => {
    const reply = scriptedReply(prompt, companyProfile, glossary);
    const chatId = uid('ch');
    const chat = {
      id: chatId,
      title: titleFromPrompt(prompt),
      skillId: skillId || reply.skillId || null,
      updatedAt: new Date().toISOString(),
      messages: [
        { id: uid('m'), role: 'user', content: prompt },
        assistantMessage(reply),
      ],
    };
    setChats((prev) => [chat, ...prev]);
    if (reply.outputId) {
      setActiveOutputId(reply.outputId);
      setOutputsOpen(true);
    }
    return chatId;
  }, [companyProfile, glossary]);

  const sendMessage = useCallback((chatId, prompt) => {
    const reply = scriptedReply(prompt, companyProfile, glossary);
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== chatId) return chat;
        return {
          ...chat,
          title: chat.messages.length <= 1 ? titleFromPrompt(prompt) : chat.title,
          skillId: chat.skillId || reply.skillId || null,
          updatedAt: new Date().toISOString(),
          messages: [
            ...chat.messages,
            { id: uid('m'), role: 'user', content: prompt },
            assistantMessage(reply),
          ],
        };
      })
    );
    if (reply.outputId) {
      setActiveOutputId(reply.outputId);
      setOutputsOpen(true);
    }
  }, [companyProfile, glossary]);

  const startAgentSetup = useCallback(() => {
    const chatId = uid('ch');
    setChats((prev) => [
      {
        id: chatId,
        kind: 'agent-setup',
        title: 'New agent',
        skillId: null,
        updatedAt: new Date().toISOString(),
        messages: [],
        setupResult: null,
      },
      ...prev,
    ]);
    return chatId;
  }, []);

  const saveSetupResult = useCallback((chatId, setupResult) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title: setupResult.agentName ? `New agent: ${setupResult.agentName}` : chat.title,
              updatedAt: new Date().toISOString(),
              setupResult,
            }
          : chat
      )
    );
  }, []);

  const addRegistryAgent = useCallback((agent) => {
    setRegistryAgents((prev) => [agent, ...prev.filter((item) => item.id !== agent.id)]);
  }, []);

  const newAgentId = useCallback(() => uid('agent'), []);

  const upsertAgent = useCallback((agent) => {
    setAgents((prev) => {
      const exists = prev.some((a) => a.id === agent.id);
      if (exists) return prev.map((a) => (a.id === agent.id ? agent : a));
      return [{ ...agent, id: agent.id || uid('ag') }, ...prev];
    });
  }, []);

  const toggleSkillHome = useCallback((skillId) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, showOnHome: !s.showOnHome } : s))
    );
  }, []);

  const addGlossaryTerm = useCallback((term, definition) => {
    setGlossary((prev) => [...prev, { id: uid('g'), term, definition }]);
  }, []);

  const toggleFramework = useCallback((id) => {
    setFrameworks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, inScope: !f.inScope } : f))
    );
  }, []);

  const addPolicyFile = useCallback((name) => {
    setFrameworks((prev) => [
      ...prev,
      { id: uid('pol'), name, inScope: true, type: 'policy', uploaded: true },
    ]);
  }, []);

  const setAccessCell = useCallback((teamId, resourceId, level) => {
    const team = teams.find((t) => t.id === teamId);
    if (team?.isOwner) return;
    setAccess((prev) => ({
      ...prev,
      [teamId]: { ...(prev[teamId] || {}), [resourceId]: level },
    }));
  }, [teams]);

  const settleMessage = useCallback((chatId, messageId) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== chatId) return chat;
        return {
          ...chat,
          messages: chat.messages.map((message) =>
            message.id === messageId ? { ...message, pending: false } : message
          ),
        };
      })
    );
  }, []);

  const openOutput = useCallback((outputId) => {
    setActiveOutputId(outputId);
    setOutputsOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      version,
      setVersion,
      chats,
      getChat,
      createChat,
      sendMessage,
      settleMessage,
      startAgentSetup,
      saveSetupResult,
      registryAgents,
      addRegistryAgent,
      newAgentId,
      agents,
      upsertAgent,
      skills,
      toggleSkillHome,
      companyProfile,
      setCompanyProfile,
      frameworks,
      toggleFramework,
      addPolicyFile,
      glossary,
      addGlossaryTerm,
      teams,
      setTeams,
      access,
      setAccessCell,
      templates,
      activeOutputId,
      outputsOpen,
      setOutputsOpen,
      openOutput,
    }),
    [
      version,
      setVersion,
      chats,
      getChat,
      createChat,
      sendMessage,
      settleMessage,
      startAgentSetup,
      saveSetupResult,
      registryAgents,
      addRegistryAgent,
      newAgentId,
      agents,
      upsertAgent,
      skills,
      toggleSkillHome,
      companyProfile,
      frameworks,
      toggleFramework,
      addPolicyFile,
      glossary,
      addGlossaryTerm,
      teams,
      access,
      setAccessCell,
      templates,
      activeOutputId,
      outputsOpen,
      openOutput,
    ]
  );

  return <AriesContext.Provider value={value}>{children}</AriesContext.Provider>;
}

export function useAries() {
  const ctx = useContext(AriesContext);
  if (!ctx) throw new Error('useAries must be used within AriesProvider');
  return ctx;
}
