package twitch

import (
	"fmt"
	"strings"

	"github.com/gorilla/websocket"
)

type TwitchIrc struct {
	ws       *websocket.Conn
	nick     string
	password string
	handlers map[string]func(ctx any)
}

func New(url string, nick string, password string) (*TwitchIrc, error) {
	ws, _, err := websocket.DefaultDialer.Dial(url, nil)

	if err != nil {
		return nil, err
	}

	irc := &TwitchIrc{
		nick:     nick,
		password: password,
		ws:       ws,
		handlers: make(map[string]func(ctx any)),
	}

	return irc, nil
}

func (irc *TwitchIrc) Send(msg string) error {
	return irc.ws.WriteMessage(websocket.TextMessage, []byte(msg))
}

func (irc *TwitchIrc) Connect() error {
	err := irc.Send("CAP REQ: twitch.tv/membership twitch.tv/tags twitch.tv/commands")
	if err != nil {
		return err
	}

	err = irc.Send(fmt.Sprintf("PASS %s\r\n", irc.password))
	if err != nil {
		return err
	}

	err = irc.Send(fmt.Sprintf("NICK %s\r\n", irc.nick))
	if err != nil {
		return err
	}

	readLoop := func() {
		for {
			_, message, err := irc.ws.ReadMessage()
			if err != nil {
				continue
			}
			messageText := string(message)

			if strings.HasPrefix(messageText, "PING") {
				pong := fmt.Sprintf("PONG%s", strings.TrimPrefix(messageText, "PING"))
				err := irc.Send(pong)
				if err != nil {
					continue
				}
			}

		}
	}

	go readLoop()

	return nil
}
