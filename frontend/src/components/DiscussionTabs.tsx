import React from 'react';
import { Tabs, Tab, Box, Typography, Badge } from '@mui/material';
import { Email } from '@mui/icons-material';
import { Discussion } from '../types';

interface DiscussionTabsProps {
  discussions: Discussion[];
  currentDiscussion: number;
  onDiscussionChange: (index: number) => void;
  suggestionCounts: { [key: string]: number };
}

export const DiscussionTabs: React.FC<DiscussionTabsProps> = ({ 
  discussions, 
  currentDiscussion, 
  onDiscussionChange,
  suggestionCounts 
}) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs 
        value={currentDiscussion} 
        onChange={(_, value) => onDiscussionChange(value)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {discussions.map((discussion, index) => (
          <Tab
            key={discussion.id}
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Email fontSize="small" />
                <Typography variant="body2">{discussion.title}</Typography>
                {suggestionCounts[discussion.id] > 0 && (
                  <Badge 
                    badgeContent={suggestionCounts[discussion.id]} 
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            }
          />
        ))}
      </Tabs>
    </Box>
  );
};