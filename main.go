package main

import (
	"embed"
	"io/fs"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/thanhpk/randstr"
)

//go:embed clippy-frontend/build
var assets embed.FS

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var mux = sync.Mutex{}
var sockets = map[string]*websocket.Conn{}

func handleSocket(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	n := 3
	id := randstr.String(n)
	for _, ok := sockets[id]; ok; _, ok = sockets[id] {
		n++
		id = randstr.String(n)
	}

	ws.WriteMessage(websocket.TextMessage, []byte(id))

	mux.Lock()
	sockets[id] = ws
	mux.Unlock()

	defer func() {
		mux.Lock()
		delete(sockets, id)
		mux.Unlock()
	}()

	for err == nil {
		_, _, err = ws.ReadMessage()
	}
}

func handlePost(w http.ResponseWriter, r *http.Request) {
	id := r.FormValue("socket-id")
	message := r.FormValue("message")

	ws, ok := sockets[id]
	if !ok {
		return
	}

	ws.WriteMessage(websocket.TextMessage, []byte(message))
}

func main() {
	fsys, _ := fs.Sub(assets, "clippy-frontend/build")

	http.HandleFunc("/socket", handleSocket)
	http.HandleFunc("/post", handlePost)

	http.Handle("/", http.FileServer(http.FS(fsys)))
	http.ListenAndServe(":8090", nil)
}
