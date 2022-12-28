package main

import (
	"embed"
	"io/fs"
	"net/http"
	"net/url"
	"os"
	"path"
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
	ws.WriteMessage(websocket.TextMessage, []byte(os.Getenv("CLIPPY_ORIGIN")))

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
	fsh := http.FileServer(http.FS(fsys))

	http.HandleFunc("/socket", handleSocket)
	http.HandleFunc("/post", handlePost)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {

		if r.URL.Path != "/" {
			_, err := fsys.Open(path.Clean(r.URL.Path)[1:])
			if os.IsNotExist(err) {
				r.URL, _ = url.Parse("/")
			}
		}

		fsh.ServeHTTP(w, r)
	})

	addr := os.Getenv("CLIPPY_ADDR")
	if addr == "" {
		addr = ":8090"
	}

	http.ListenAndServe(addr, nil)
}
