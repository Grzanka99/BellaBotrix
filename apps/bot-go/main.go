package main

import "bellatrix-bot/irc/twitch"

type TTwitchApiChatter struct {
	UserID    string `json:"user_id"`
	UserLogin string `json:"user_login"`
	UserName  string `json:"user_name"`
}

type TwitchApi struct {
	channelToken *string
	globalToken  string
	channelName  string
	userId       *string
	moderators   []TTwitchApiChatter
}

type ChanelConnection struct {
	api         TwitchApi
	irc         twitch.TwitchIrc
	channelName string
	ownerId     uint32
	isSetup     bool
	settings    any
}

func main() {
	println("Hello, there!")
	println("...\nGeneral Kenobi.")
}
