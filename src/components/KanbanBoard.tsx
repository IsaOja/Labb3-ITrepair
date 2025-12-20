import React from 'react';
import { DndContext, rectIntersection } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import type { Ticket, User } from '../types';
import { Box } from '@mui/material';

interface KanbanBoardProps {
  columns: { [status: string]: Ticket[] };
  statuses: string[];
  userMap: Record<string, User>;
  onTicketClick: (ticket: Ticket) => void;
  onEditClick: (ticket: Ticket) => void;
  onDragEnd: (event: any) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns, statuses, userMap, onTicketClick, onEditClick, onDragEnd }) => (
  <DndContext collisionDetection={rectIntersection} onDragEnd={onDragEnd}>
    <SortableContext
      items={Object.values(columns).flat().map(t => t._id)}
      strategy={verticalListSortingStrategy}
    >
      <Box sx={{ display: 'flex', gap: 2, mt: 3, height: '70vh' }}>
        {statuses.map(status => (
          <KanbanColumn
            key={status + '-' + columns[status].map(t => t._id).join(',')}
            status={status}
            tickets={columns[status]}
            onTicketClick={onTicketClick}
            onEditClick={onEditClick}
            userMap={userMap}
          />
        ))}
      </Box>
    </SortableContext>
  </DndContext>
);

export default KanbanBoard;
