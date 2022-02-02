export type PublicPlayerInformation = {
  id: number;
  username: string;
  state: {
    socket_id?: string;
    latest_match_joined_at: Date | null;
    status: {
      name: string;
    };
  };
};

export type PlayerStatus = {
  id: number;
  state: {
    status: {
      name: string;
    };
  };
};
