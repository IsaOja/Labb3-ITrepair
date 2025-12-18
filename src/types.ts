
export type User = {
    _id: string;
    username: string;
    email: string;
    isStaff: boolean;
    token: string;
};

export type Ticket = {
    _id: string;
    title: string;
    description: string;
    status: string;
    user: string;
    type: string;
    priority: string;
    image?: string;
    assignedTo?: string | null;
};
