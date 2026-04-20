export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  ProfileSetup: undefined;
  Profile: undefined;
  Lobby: { meetingId?: string };
  MeetingRoom: {
    meetingId: string;
    userName: string;
    userId: string;
    micOn: boolean;
    camOn: boolean;
    isBreakout?: boolean;
    mainMeetingId?: string;
  };
};
