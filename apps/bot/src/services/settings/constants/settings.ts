import type { TSettings } from "bellatrix";

export const DEFAULT_SETTINGS: TSettings = {
  commands: {
    enabled: {
      value: true,
      description: "Enable or disable commands",
    },
    prefix: {
      value: "!",
      description: "Prefix that will be put before command",
    },
  },
  joinMessage: {
    forAllUsers: {
      enabled: {
        value: false,
        description: "Enable or disable welcoming message for joining users",
      },
      message: {
        value: "Hey there! $username join the chat!",
        description: "Message that is sent to chat when user joins to chatters",
        vars: {
          username: "username",
        },
      },
    },
    forSpecificUsers: {
      enabled: {
        value: true,
        description: "Enable or disable welcoming message for users in list below",
        vars: {
          username: "username",
        },
      },
      users: {
        value: [],
        description: "List of users that should be welcomed with specific message",
      },
      message: {
        value: "Hey there! $username join the chat!",
        description: "Message that is sent to chat when user joins to chatters",
        vars: {
          username: "username",
        },
      },
    },
  },
  points: {
    enabled: {
      value: true,
      description: "Enable or disable points",
    },
    autoIncrement: {
      value: 30,
      description: "Number of seconds until user gets 1 point, set 0 to disable",
    },
    chancesOffset: {
      value: 25,
      description:
        "Minimum chances in percentage in gamble, can be negative, tho it will be much harder to win",
    },
    pointsPerMessage: {
      value: 1,
      description: "How many points user should get after sending message",
    },
  },
  triggerWords: {
    enabled: {
      value: true,
      description:
        'Enable functionality, so bot responds with message to trigger words, similar to commands but more like "chatty"',
    },
  },
  r6dle: {
    enabled: {
      value: true,
      description: "Eneble wordle-like quiz for Rainbow 6 Siege operators in your chat",
    },
    maxPoints: {
      value: 1000,
      description: "Maximum number of points that user can receive for won r6dle game",
    },
    modifier: {
      value: 100,
      description: "How many points are taken away from max points for each try",
    },
  },
  ollamaAI: {
    enabled: {
      value: false,
      description: "Enable or disable AI responses from BellaBotrix",
    },
    model: {
      value: "gemma2",
      description: "Model that AI is usign, for now locked to gemma2 as performance issues",
    },
    language: {
      value: "Polish",
      description: "Language that AI will (try to) reply with",
    },
    entryPrompt: {
      value: "",
      description:
        "Entry prompt that will define a AI before running any response, leave empty to default one for this bot",
    },
    keepHistory: {
      value: 5,
      description: "How many messages should be kept in context. 0 wont keep history",
    },
  },
  automod: {
    emotesLimit: {
      enabled: {
        value: false,
        description: "Enable or disable emotes limit",
      },
      limit: {
        value: 10,
        description: "Limit of emotes that can be sent by user (smap preventing)",
      },
      warningMessage: {
        value:
          "Watchout $username!, you were found of spamming more than $limit emotes. this is $warnnumber warning, If you countinue, sanctions may be applied",
        description: "Warning message that is sent to user if he sends to many emotes",
        vars: {
          username: "username",
          limit: "limit of emotes",
          warnnumber: "Number of warnings sent to this user including current one",
          sanctions: "List of sanctions separated by comma",
        },
      },
      banMessage: {
        value: "Sanction $sanctionName has been applied to you, please stop overuse emotes!",
        description: "Message that is sent to user when sanction is applied",
        vars: {
          sanctionName: "Name and level of sanction that has been applied",
        },
      },
      sanctions: {
        value: {
          ban: "ban for $duration",
          timeout: "timeout for $duration",
        },
        description: "Name and description sent to users regarding sanctions",
        vars: {
          duration: "duration of sanction (eg. 1 day, 300 seconds)",
        },
      },
    },
  },
};
