import React from 'react';

interface RemoveUserProps {
  userId: string;
  onRemove: (id: string) => void;
}

const RemoveUser: React.FC<RemoveUserProps> = ({ userId, onRemove }) => (
  <button data-testid="remove-user-btn" onClick={() => onRemove(userId)}>
    Remove
  </button>
);

export default RemoveUser;
