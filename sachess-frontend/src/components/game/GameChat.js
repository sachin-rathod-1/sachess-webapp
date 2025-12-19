import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  Avatar,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';

const ChatContainer = styled(Paper)(({ theme }) => ({
  height: 'calc(100vh - 200px)',
  maxHeight: 600,
  display: 'flex',
  flexDirection: 'column',
  position: 'sticky',
  top: 80
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: 6
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[300],
    borderRadius: 3
  }
}));

const MessageBubble = styled(Box)(({ theme, isOwn, isSystem }) => ({
  maxWidth: '80%',
  padding: theme.spacing(1, 1.5),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(0.5),
  backgroundColor: isSystem 
    ? theme.palette.grey[200]
    : isOwn 
      ? theme.palette.primary.main 
      : theme.palette.grey[100],
  color: isSystem
    ? theme.palette.text.secondary
    : isOwn 
      ? theme.palette.primary.contrastText 
      : theme.palette.text.primary,
  alignSelf: isSystem ? 'center' : isOwn ? 'flex-end' : 'flex-start',
  fontStyle: isSystem ? 'italic' : 'normal'
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  gap: theme.spacing(1)
}));

const GameChat = ({ gameId }) => {
  const { user } = useAuth();
  const { chatMessages, sendChat } = useGame();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = () => {
    if (message.trim()) {
      sendChat(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ChatContainer elevation={2}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Game Chat</Typography>
      </Box>

      <MessagesContainer>
        <AnimatePresence>
          {chatMessages.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'text.secondary'
            }}>
              <Typography variant="body2">
                No messages yet. Say hello!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {chatMessages.map((msg, index) => {
                const isOwn = msg.senderId === user?.id;
                const isSystem = msg.type === 'SYSTEM' || msg.senderId === 'SYSTEM';

                return (
                  <Box
                    key={msg.id || index}
                    component={motion.div}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isSystem ? 'center' : isOwn ? 'flex-end' : 'flex-start',
                      mb: 1
                    }}
                  >
                    {!isSystem && !isOwn && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ ml: 1, mb: 0.25 }}
                      >
                        {msg.senderUsername}
                      </Typography>
                    )}
                    <MessageBubble isOwn={isOwn} isSystem={isSystem}>
                      <Typography variant="body2">
                        {msg.content}
                      </Typography>
                    </MessageBubble>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ mx: 1, fontSize: '0.65rem' }}
                    >
                      {formatTime(msg.timestamp)}
                    </Typography>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>
          )}
        </AnimatePresence>
      </MessagesContainer>

      <InputContainer>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3
            }
          }}
        />
        <IconButton 
          color="primary" 
          onClick={handleSend}
          disabled={!message.trim()}
        >
          <SendIcon />
        </IconButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default GameChat;
