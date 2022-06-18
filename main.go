package main

import (
	"embed"
	"io/fs"
	"net/http"
)

//go:embed clippy-frontend/build
var assets embed.FS

func main() {
	fsys, _ := fs.Sub(assets, "clippy-frontend/build")

	http.Handle("/", http.FileServer(http.FS(fsys)))
	http.ListenAndServe(":8090", nil)
}
